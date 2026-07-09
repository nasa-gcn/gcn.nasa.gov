/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { tables } from '@architect/functions'
import { search as getSearchClient } from '@nasa-gcn/architect-functions-search'
import { errors } from '@opensearch-project/opensearch'

import { getUserForOpenSearch } from './cognito.server'

export async function checkIndexStatus() {
  const db = await tables()
  return (await db.os_index_history.scan({})).Items
}

export async function updateIndexTable(indexName: string) {
  const db = await tables()
  await db.os_index_history.put({
    indexName,
    triggerTime: Date.now(),
  })
}

export async function removeIndex(index: string, id: string) {
  const client = await getSearchClient()
  try {
    await client.delete({ index, id })
  } catch (e) {
    if (!(e instanceof errors.ResponseError && e.body.result === 'not_found')) {
      throw e
    }
  }
}

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
  console.log('Trying to search for: ', name)
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
  console.log(queryObject)
  const searchResult = await client.search({
    index: 'users',
    body: queryObject,
  })

  console.log('search results: ', searchResult)
  console.log('hits: ', searchResult.body.hits)

  const {
    body: {
      hits: {
        total: { value: totalItems },
        hits,
      },
    },
  } = searchResult
  console.log('hits: ', hits)
  console.log('total items: ', totalItems)
}
