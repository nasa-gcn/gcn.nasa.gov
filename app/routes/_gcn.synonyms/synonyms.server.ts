/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { search as getSearch } from '@nasa-gcn/architect-functions-search'

import type { Synonym } from './synonyms.lib'

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
