/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { tables } from '@architect/functions'
import { type DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { search as getSearchClient } from '@nasa-gcn/architect-functions-search'
import crypto from 'crypto'
import { slug } from 'github-slugger'
import min from 'lodash/min.js'
import orderBy from 'lodash/orderBy.js'

import type { Circular } from '../circulars/circulars.lib'
import type { Synonym, SynonymGroup } from './synonyms.lib'

export async function getSynonymsByUuid(synonymId: string) {
  const db = await tables()
  const { Items } = await db.synonyms.query({
    IndexName: 'synonymsByUuid',
    KeyConditionExpression: 'synonymId = :synonymId',
    ExpressionAttributeValues: {
      ':synonymId': synonymId,
    },
  })

  return Items as Synonym[]
}

export async function getSynonymsBySlug(slug: string) {
  const db = await tables()
  const { Items } = await db.synonyms.query({
    IndexName: 'synonymsBySlug',
    KeyConditionExpression: 'slug = :slug',
    ExpressionAttributeValues: {
      ':slug': slug,
    },
  })
  const synonym = Items[0]
  return getSynonymsByUuid(synonym.synonymId)
}

export async function searchSynonymsByEventId({
  limit = 10,
  page,
  query,
}: {
  limit?: number
  page: number
  query?: string
}): Promise<{
  items: SynonymGroup[]
  totalItems: number
  totalPages: number
  queryFallback: boolean
}> {
  const client = await getSearchClient()
  const body: any = {
    query: {
      bool: {},
    },
  }
  if (query) {
    body.query.bool.filter = [
      {
        wildcard: {
          'eventIds.keyword': {
            value: `*${query}*`,
            case_insensitive: true,
          },
        },
      },
    ]
  } else {
    body.query.bool.should = [
      {
        match_all: {},
      },
    ]
    body.query.bool.minimum_should_match = 1
    // While initialDate is always present, because of caching and sharding, OpenSearch doesn't promise
    // exact ordering. Adding the missing and unmapped_types fields helps give it direction and makes the
    // sort more explicit so it behaves more precisely.
    body.sort = [
      {
        initialDate: {
          order: 'desc',
          missing: '_last',
          unmapped_type: 'long',
        },
      },
    ]
  }

  const {
    body: {
      hits: {
        total: { value: totalItems },
        hits,
      },
    },
  } = await client.search({
    index: 'synonym-groups',
    from: page * limit,
    size: limit,
    body,
  })

  const totalPages: number = Math.ceil(totalItems / limit)
  const results = hits.map(
    ({
      _source: body,
    }: {
      _source: SynonymGroup
      fields: {
        eventIds: string[]
        synonymId: string
        slugs: string[]
        initialDate: number
      }
    }) => body
  )

  return {
    items: results,
    totalItems,
    totalPages,
    queryFallback: false,
  }
}

/*
 * If an eventId already has a synonym and is passed in, it will unlink the
 * eventId from the old synonym and the only remaining link will be to the
 * new synonym.
 *
 * BatchWriteItem has a limit of 25 items, so the user may not add more than
 * 25 synonyms at a time.
 */
export async function moderatorCreateSynonyms(synonymousEventIds: string[]) {
  if (!synonymousEventIds.length) {
    throw new Response('EventIds are required.', { status: 400 })
  }
  const uuid = crypto.randomUUID()
  const db = await tables()
  const client = db._doc as unknown as DynamoDBDocument
  const TableName = db.name('synonyms')
  const writePromises = synonymousEventIds.map(async (eventId) => ({
    PutRequest: {
      Item: {
        synonymId: uuid,
        eventId,
        slug: slug(eventId),
        initialDate: await getOldestDate(eventId),
      },
    },
  }))
  const writes = await Promise.all(writePromises)

  await client.batchWrite({
    RequestItems: {
      [TableName]: writes,
    },
  })
  return uuid
}

/**
 * Manages Synonyms upon Circular version update
 *
 * If there is a newEventId:
 *   - It attempts to create a new synonym for it. If one is not created that is because
 *     one already exists for that eventId.
 *   - If a new synonym was not created, it updates the initialDate on the existing synonym.
 *
 * If there is an oldEventId:
 *   - It deletes the old eventId synonym if it's empty.
 *   - If it's not empty, it updates the initialDate on the remaining synonym.
 *
 * @param newCreatedOn - the Circular createdOn timestamp for the new circular version
 * @param oldCreatedOn - the Circular createdOn timestamp for the old circular
 * @param newEventId - the updated eventId
 * @param oldEventId - the original eventId
 */
export async function manageSynonymOnVersionUpdates(
  newCreatedOn: number,
  oldCreatedOn: number,
  newEventId?: string,
  oldEventId?: string
) {
  if (newEventId === oldEventId && newCreatedOn === oldCreatedOn) return

  if (newCreatedOn != oldCreatedOn && newEventId === oldEventId) {
    if (oldEventId) await updateInitialDate(oldEventId)
    if (newEventId) await updateInitialDate(newEventId)

    return
  }

  if (newEventId) {
    const newSynonymCreated = await tryInitSynonym(newEventId, newCreatedOn)
    if (!newSynonymCreated) updateInitialDate(newEventId)
  }

  if (oldEventId) {
    await updateInitialDate(oldEventId)
  }
}

export async function updateInitialDate(eventId: string) {
  const oldestDate = await getOldestDate(eventId)

  const db = await tables()
  await db.synonyms.update({
    Key: { eventId },
    UpdateExpression: 'set #initialDate = :initialDate',
    ExpressionAttributeNames: {
      '#initialDate': 'initialDate',
    },
    ExpressionAttributeValues: {
      ':initialDate': oldestDate,
    },
  })
}

export async function tryInitSynonym(eventId: string, createdOn: number) {
  const db = await tables()

  try {
    const synonym = await db.synonyms.update({
      Key: { eventId },
      UpdateExpression:
        'set #synonymId = :synonymId, #slug = :slug, #initialDate = :initialDate',
      ExpressionAttributeNames: {
        '#synonymId': 'synonymId',
        '#slug': 'slug',
        '#initialDate': 'initialDate',
      },
      ExpressionAttributeValues: {
        ':synonymId': crypto.randomUUID(),
        ':slug': slug(eventId),
        ':initialDate': createdOn,
      },
      ConditionExpression: 'attribute_not_exists(eventId)',
    })

    return synonym
  } catch (error) {
    if ((error as Error).name !== 'ConditionalCheckFailedException') throw error
  }
}

/*
 * If an eventId already has a synonym and is passed in, it will unlink the
 * eventId from the old synonym and the only remaining link will be to the
 * new synonym.
 *
 * BatchWriteItem has a limit of 25 items, so the user may not add and/or remove
 *  more than 25 synonyms at a time.
 */
export async function putSynonyms({
  synonymId,
  additions,
  subtractions,
}: {
  synonymId: string
  additions?: string[]
  subtractions?: string[]
}) {
  if (!subtractions?.length && !additions?.length) return

  const db = await tables()
  const client = db._doc as unknown as DynamoDBDocument
  const TableName = db.name('synonyms')
  const writes = []
  if (subtractions?.length) {
    const subtractionPromises = subtractions.map(async (eventId) => ({
      PutRequest: {
        Item: {
          synonymId: crypto.randomUUID(),
          eventId,
          slug: slug(eventId),
          initialDate: await getOldestDate(eventId),
        },
      },
    }))
    const subtractionWrites = (await Promise.all(subtractionPromises)).flat()
    writes.push(...subtractionWrites)
  }
  if (additions?.length) {
    const additionPromises = additions.map(async (eventId) => ({
      PutRequest: {
        Item: {
          synonymId,
          eventId,
          slug: slug(eventId),
          initialDate: await getOldestDate(eventId),
        },
      },
    }))
    const additionWrites = (await Promise.all(additionPromises)).flat()
    writes.push(...additionWrites)
  }
  const params = {
    RequestItems: {
      [TableName]: writes,
    },
  }
  await client.batchWrite(params)
}

export async function getOldestDate(eventId: string) {
  const circulars = await getSynonymMembers(eventId)
  const oldest = min(circulars.map(({ createdOn }) => createdOn))
  return oldest ? oldest : -1
}

/*
 * BatchWriteItem has a limit of 25 items, so the user may not delete
 *  more than 25 synonyms at a time.
 */
export async function deleteSynonyms(synonymId: string) {
  const db = await tables()
  const client = db._doc as unknown as DynamoDBDocument
  const TableName = db.name('synonyms')
  const results = await db.synonyms.query({
    IndexName: 'synonymsByUuid',
    KeyConditionExpression: 'synonymId = :synonymId',
    ProjectionExpression: 'eventId',
    ExpressionAttributeValues: {
      ':synonymId': synonymId,
    },
  })

  const writePromises = results.Items.map(async ({ eventId }) => ({
    PutRequest: {
      Item: {
        synonymId: crypto.randomUUID(),
        eventId,
        slug: slug(eventId),
        initialDate: await getOldestDate(eventId),
      },
    },
  }))
  const writes = await Promise.all(writePromises)
  const params = {
    RequestItems: {
      [TableName]: writes,
    },
  }
  await client.batchWrite(params)
}

export async function autoCompleteEventIds({
  query,
}: {
  query: string
}): Promise<{
  options: string[]
}> {
  const client = await getSearchClient()
  const {
    body: {
      hits: { hits },
    },
  } = await client.search({
    index: 'circulars',
    body: {
      query: {
        bool: {
          filter: [
            {
              wildcard: {
                'eventId.keyword': {
                  value: `*${query}*`,
                  case_insensitive: true,
                },
              },
            },
          ],
        },
      },
      fields: ['eventId'],
      _source: false,
      from: 0,
      size: 10,
      track_total_hits: true,
    },
  })
  const options = hits.map(
    ({
      fields: {
        eventId: [eventId],
      },
    }: {
      _id: string
      fields: { eventId: string }
    }) => eventId
  )

  return { options }
}

export async function getSynonymMembers(eventId: string) {
  const db = await tables()
  const { Items } = await db.circulars.query({
    IndexName: 'circularsByEventId',
    KeyConditionExpression: 'eventId = :eventId',
    ExpressionAttributeValues: {
      ':eventId': eventId,
    },
  })
  return Items as Circular[]
}

export async function getAllSynonymMembers(eventIds: string[]) {
  const promises = eventIds.map(getSynonymMembers)
  const results = orderBy(
    (await Promise.all(promises)).flat(),
    ['circularId'],
    ['asc']
  )
  return results
}
