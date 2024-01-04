/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { tables } from '@architect/functions'
import { search as getSearch } from '@nasa-gcn/architect-functions-search'
import crypto from 'crypto'

import type { Synonym } from '../_gcn.synonyms/synonyms.lib'

export async function getBySynonymId({
  synonymId,
}: {
  synonymId: string
}): Promise<Synonym[]> {
  const db = await tables()
  const params = {
    TableName: 'synonyms',
    IndexName: 'synonymsById',
    KeyConditionExpression: 'synonymId = :synonymId',
    ExpressionAttributeValues: {
      ':synonymId': synonymId,
    },
  }
  const result = await db.synonyms.query(params)

  if (result.Items) {
    const synonyms: Synonym[] = result.Items as Synonym[]
    return synonyms
  } else {
    return [] as Synonym[]
  }
}

export async function getSynonyms({
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
  const client = await getSearch()
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
          operator: 'and',
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
      fields: { eventId: string; synonymId: string }
    }) =>
      results[body.synonymId]
        ? results[body.synonymId].push(body.eventId)
        : (results[body.synonymId] = [body.eventId])
  )

  return {
    synonyms: results,
    totalItems,
    totalPages,
    page,
  }
}

export async function putSynonyms({
  synonymId,
  synonyms,
  deleteSynonyms,
}: {
  synonymId: string
  synonyms?: string[]
  deleteSynonyms?: string[]
}) {
  const db = await tables()
  synonyms = synonyms?.filter((n) => n)
  deleteSynonyms = deleteSynonyms?.filter((n) => n)
  if (!synonyms || !deleteSynonyms) {
    return await db.synonyms.get({ synonymId })
  }
  const subtractions = deleteSynonyms.filter((x) => !synonyms?.includes(x))
  const additions = synonyms.filter((x) => !deleteSynonyms?.includes(x))

  if (!subtractions && !additions) return await db.synonyms.get({ synonymId })
  if (subtractions) {
    await Promise.all(
      subtractions.map((eventId) => {
        return db.synonyms.delete({ eventId, synonymId })
      })
    )
  }
  if (additions) {
    await Promise.all(
      additions.map((eventId) => {
        return db.synonyms.put({ synonymId, eventId })
      })
    )
  }
}

export async function createSynonyms({ synonyms }: { synonyms: string[] }) {
  const synonymId = crypto.randomUUID()
  const db = await tables()
  await Promise.all(
    synonyms.map((eventId) => {
      if (!eventId) return null
      return db.synonyms.put({ synonymId, eventId })
    })
  )
  return synonymId
}

export async function deleteSynonyms({ synonymId }: { synonymId: string }) {
  if (!synonymId) return
  const db = await tables()
  const results = await db.synonyms.query({
    IndexName: 'synonymsById',
    KeyConditionExpression: 'synonymId = :synonymId',
    ExpressionAttributeValues: {
      ':synonymId': synonymId,
    },
  })
  for (const item of results.Items) {
    await db.synonyms.delete({
      eventId: item.eventId,
      synonymId: item.synonymId,
    })
  }
}

export async function getUniqueSynonymsArrays({
  limit = 10,
  page,
  eventId,
}: {
  limit?: number
  page: number
  eventId?: string
}): Promise<{
  synonyms: string[][]
  totalItems: number
  totalPages: number
  page: number
}> {
  const client = await getSearch()
  const search = await client.search({
    index: 'synonyms',
    from: page && limit && page * limit,
    size: limit,
    body: {
      query: {
        bool: {
          must: eventId
            ? {
                match: {
                  id: `*${eventId}*`,
                },
              }
            : { match_all: {} },
        },
      },
    },
  })
  const {
    body: {
      hits: {
        total: { value: totalItems },
        hits,
      },
    },
  } = search

  const totalPages: number = Math.ceil(totalItems / limit)
  const items = hits.map(
    ({ _id: id }: { _id: string; fields: { id: string } }) =>
      id.split(',').map((s) => s.trim())
  )
  return {
    synonyms: items,
    totalItems,
    totalPages,
    page,
  }
}
