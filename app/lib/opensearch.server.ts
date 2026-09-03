/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { queues, tables } from '@architect/functions'
import type { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { paginateScan } from '@aws-sdk/lib-dynamodb'
import { search as getSearchClient } from '@nasa-gcn/architect-functions-search'
import type {
  RequestBody,
  RequestNDBody,
} from '@opensearch-project/opensearch/lib/Transport.js'
import chunk from 'lodash/chunk'
import min from 'lodash/min'

import type { User } from '~/routes/_auth/user.server'
import type { Circular } from '~/routes/circulars/circulars.lib'
import type { Synonym, SynonymGroup } from '~/routes/synonyms/synonyms.lib'

export type OpenSearchIndex = {
  health: 'green' | 'yellow' | 'red'
  status: string
  index: string
  uuid: string
  pri: number
  rep: number
  'docs.count': number
  'docs.deleted': number
  'store.size': string
  'pri.store.size': string
  reindexTriggerTime?: number
  reindexStatus?: 'RUNNING' | 'COMPLETE'
}

export async function runReindex(indexName: string) {
  const items = await buildIndexData(indexName)
  await bulkPutItemsIntoIndex(indexName, items)
  const db = await tables()
  await db.reindex_logs.update({
    Key: { indexName },
    UpdateExpression: 'set #status = :status',
    ExpressionAttributeNames: {
      '#status': 'status',
    },
    ExpressionAttributeValues: {
      ':status': 'COMPLETE',
    },
  })
}

export async function putIndex(index: string, item: unknown) {
  const client = await getSearchClient()
  await client.index({
    index,
    id: getItemIdString(index, item),
    body: item as RequestBody,
  })
}

function getItemIdString(index: string, item: unknown) {
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
  return id
}

async function bulkPutItemsIntoIndex(index: string, items: unknown[]) {
  const client = await getSearchClient()
  const batch_size = 20
  const bulkFormattedItems = items.flatMap((item) => [
    {
      index: {
        _index: index,
        _id: getItemIdString(index, item),
      },
    },
    item,
  ])
  const batches = chunk(bulkFormattedItems, batch_size)
  for (const batch of batches) {
    await client.bulk({ body: batch as RequestNDBody })
  }
  await client.indices.refresh({ index })
}

export async function triggerReindexQueue(indexName: string) {
  const db = await tables()
  const logRow = await db.reindex_logs.get({ indexName })
  if (logRow?.reindexStatus == 'RUNNING') return
  await db.reindex_logs.put({
    indexName,
    triggerTime: Date.now(),
    status: 'RUNNING',
  })
  await queues.publish({
    name: 'reindex-opensearch',
    payload: { indexName },
  })
}

export async function listIndexes() {
  const client = await getSearchClient()
  const response = await client.cat.indices({ format: 'json' })
  const result = response.body as OpenSearchIndex[]
  const db = await tables()
  for (const item of result) {
    const reindex_log = await db.reindex_logs.get({ indexName: item.index })
    if (reindex_log) {
      item.reindexStatus = reindex_log.status
      item.reindexTriggerTime = reindex_log.triggerTime
    }
  }
  return result
}

/**
 * Returns a list of items corresponding to the specified index name
 */
async function buildIndexData(indexName: string): Promise<unknown[]> {
  const db = await tables()
  const client = db._doc as unknown as DynamoDBDocument

  const items = []
  if (indexName == 'synonym-groups') {
    // Synonym groups does not have a persistant data entry, it must be constructed
    const TableName = db.name('synonyms')
    const pages = paginateScan({ client }, { TableName })
    const synonyms: Synonym[] = []
    for await (const page of pages) {
      synonyms.push(...(page.Items as Synonym[]))
    }
    items.push(
      ...Object.entries(
        Object.groupBy(synonyms, ({ synonymId }) => synonymId)
      ).flatMap(([synonymId, values]) => [
        {
          synonymId,
          eventIds: values?.map(({ eventId }) => eventId),
          slugs: values?.map(({ slug }) => slug),
          initialDate: min(values?.map(({ initialDate }) => initialDate)),
        },
      ])
    )
  } else {
    const TableName = db.name(indexName)
    const pages = paginateScan({ client }, { TableName })
    for await (const page of pages) {
      items.push(...(page.Items as unknown[]))
    }
  }
  return items
}
