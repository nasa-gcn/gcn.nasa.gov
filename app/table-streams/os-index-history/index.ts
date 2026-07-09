/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { tables } from '@architect/functions'
import type { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { paginateScan } from '@aws-sdk/lib-dynamodb'
import { search as getSearchClient } from '@nasa-gcn/architect-functions-search'
import type { RequestBody } from '@opensearch-project/opensearch/lib/Transport.js'
import type { DynamoDBRecord } from 'aws-lambda'
import pThrottle from 'p-throttle'

import { unmarshallTrigger } from '../utils'
import { createTriggerHandler } from '~/lib/lambdaTrigger.server'
import type { User } from '~/routes/_auth/user.server'
import type { Circular } from '~/routes/circulars/circulars.lib'
import type { SynonymGroup } from '~/routes/synonyms/synonyms.lib'

export const handler = createTriggerHandler(
  async ({ eventName, dynamodb }: DynamoDBRecord) => {
    if (eventName === 'INSERT' || eventName === 'MODIFY') {
      const { indexName } = unmarshallTrigger(dynamodb?.NewImage)
      const db = await tables()
      const client = db._doc as unknown as DynamoDBDocument
      const TableName = db.name(indexName)

      const pages = paginateScan({ client }, { TableName })
      const items = []
      for await (const page of pages) {
        items.push(...(page.Items as unknown[]))
      }
      await Promise.all(items.map((item) => throttledPutIndex(indexName, item)))
    }
  }
)

async function putIndex(index: string, item: unknown) {
  const client = await getSearchClient()
  let id
  switch (index) {
    case 'circulars':
      id = (item as Circular).circularId.toString()
      break
    case 'users':
      id = (item as User).sub.toString()
      break
    case 'synonym-groups':
      id = (item as SynonymGroup).synonymId.toString()
    default:
      break
  }
  await client.index({
    index,
    id,
    body: item as RequestBody,
  })
}

const throttledPutIndex = pThrottle({
  interval: 1000,
  limit: 10,
  strict: true,
})(putIndex)
