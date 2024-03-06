/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { tables } from '@architect/functions'
import type { DynamoDBDocument } from '@aws-sdk/lib-dynamodb/dist-types/DynamoDBDocument'
import { search as getSearchClient } from '@nasa-gcn/architect-functions-search'
import crypto from 'crypto'

import type { Synonym } from './synonyms.lib'

export async function getSynonymsByUuid(uuid: string) {
  const db = await tables()

  const { Items } = await db.synonym.query({
    IndexName: 'synonymsByUuid',
    KeyConditionExpression: 'uuid = :uuid',
    ExpressionAttributeValues: {
      ':uuid': uuid,
    },
  })
  if (!Items.length)
    throw new Response(null, {
      status: 404,
    })

  return Items as Synonym[]
}

export async function searchSynonymsByEventId({
  limit = 10,
  page,
  eventId,
}: {
  limit?: number
  page: number
  eventId?: string
}): Promise<{
  synonyms: Record<string, string[]>
  totalItems: number
  totalPages: number
  page: number
}> {
  const client = await getSearchClient()
  const query: any = {
    bool: {
      should: [
        {
          match_all: {},
        },
      ],
      minimum_should_match: 1,
    },
  }

  if (eventId) {
    query.bool.should.push({
      match: {
        eventId: {
          query: eventId,
          fuzziness: 'AUTO',
        },
      },
    })
  }

  const {
    body: {
      hits: {
        total: { value: totalItems },
        hits,
      },
    },
  } = await client.search({
    index: 'synonyms',
    from: page && limit && (page - 1) * limit,
    size: limit,
    body: {
      query,
    },
  })

  const totalPages: number = Math.ceil(totalItems / limit)
  const results: Record<string, string[]> = {}

  hits.forEach(
    ({
      _source: body,
    }: {
      _source: Synonym
      fields: { eventId: string; uuid: string }
    }) =>
      results[body.uuid]
        ? results[body.uuid].push(body.eventId)
        : (results[body.uuid] = [body.eventId])
  )

  return {
    synonyms: results,
    totalItems,
    totalPages,
    page,
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
export async function createSynonyms(...synonymousEventIds: string[]) {
  const uuid = crypto.randomUUID()

  if (synonymousEventIds.length > 0) {
    const db = await tables()
    const client = db._doc as unknown as DynamoDBDocument
    const TableName = db.name('synonyms')

    await client.batchWrite({
      RequestItems: {
        [TableName]: synonymousEventIds.map((eventId) => ({
          PutRequest: {
            Item: { uuid, eventId },
          },
        })),
      },
    })
  }

  return uuid
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
  uuid,
  additions,
  subtractions,
}: {
  uuid: string
  additions?: string[]
  subtractions?: string[]
}) {
  if (!subtractions?.length && !additions?.length) return
  const db = await tables()
  const client = db._doc as unknown as DynamoDBDocument
  const TableName = db.name('synonyms')
  const writes = []
  if (subtractions) {
    const subtraction_writes = subtractions.map((eventId) => ({
      DeleteRequest: {
        Key: { uuid, eventId },
      },
    }))
    writes.push(subtraction_writes)
  }
  if (additions) {
    const addition_writes = additions.map((eventId) => ({
      PutRequest: {
        Item: { uuid, eventId },
      },
    }))
    writes.push(addition_writes)
  }
  const params = {
    RequestItems: {
      [TableName]: writes,
    },
  }
  await client.batchWrite(params)
}

/*
 * BatchWriteItem has a limit of 25 items, so the user may not delete
 *  more than 25 synonyms at a time.
 */
export async function deleteSynonyms(uuid: string) {
  const db = await tables()
  const client = db._doc as unknown as DynamoDBDocument
  const TableName = db.name('synonyms')
  const results = await db.synonyms.query({
    IndexName: 'synonymsByUuid',
    KeyConditionExpression: 'uuid = :uuid',
    ProjectionExpression: 'eventId',
    ExpressionAttributeValues: {
      ':uuid': uuid,
    },
  })
  const writes = results.Items.map(({ eventId }) => ({
    DeleteRequest: {
      Key: { uuid, eventId },
    },
  }))
  const params = {
    RequestItems: {
      [TableName]: writes,
    },
  }
  await client.batchWrite(params)
}
