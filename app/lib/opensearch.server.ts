/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { search as getSearchClient } from '@nasa-gcn/architect-functions-search'

import { getUserForOpenSearch } from './cognito.server'

export async function putUserIndex(sub: string) {
  const client = await getSearchClient()
  const user = await getUserForOpenSearch(sub)
  await client.index({
    index: 'users',
    id: sub,
    body: user,
  })
}

export async function searchUsersIndex(name: string, group?: string) {
  const client = await getSearchClient()

  const queryObject = {
    query: {
      bool: {
        must: [
          {
            query_string: {
              query: `*${name}*`,
            },
          },
        ],
        filter: group
          ? [
              {
                term: {
                  groups: group,
                },
              },
            ]
          : undefined,
      },
    },
  }

  const searchResult = await client.search({
    index: 'users',
    body: queryObject,
  })

  const items = searchResult.body.hits.map(
    (item: {
      _source: {
        sub: string
        username: string
        affiliation: string
        email: string
        groups: string[]
      }
    }) => item._source
  )
  return items
}
