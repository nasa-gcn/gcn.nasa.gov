/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { queues, tables } from '@architect/functions'
import type { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { paginateQuery, paginateScan } from '@aws-sdk/lib-dynamodb'
import { search as getSearchClient } from '@nasa-gcn/architect-functions-search'
import type { IndicesRecord } from '@opensearch-project/opensearch/api/_types/cat.indices.js'
import type {
  Bulk_RequestBody,
  Index_RequestBody,
} from '@opensearch-project/opensearch/api/index.js'
import min from 'lodash/min'

import type { Synonym } from '~/routes/synonyms/synonyms.lib'

export type OpenSearchIndex = IndicesRecord & {
  reindexTriggerTime?: number
  reindexStatus?: 'RUNNING' | 'COMPLETE'
}

export async function putIndex(index: string, item: unknown) {
  const client = await getSearchClient()
  await client.index({
    index,
    id: getItemIdString(index, item),
    body: item as Index_RequestBody,
  })
}

function getItemIdString(index: string, item: unknown) {
  if (typeof item !== 'object' || item === null) return undefined

  const keyMap: Record<string, string> = {
    circulars: 'circularId',
    users: 'sub',
    'synonym-groups': 'synonymId',
  }

  const key = keyMap[index]
  if (!(key in item)) return undefined
  return (item as Record<string, unknown>)[key]?.toString()
}

async function bulkPutItemsIntoIndex(index: string, items: unknown[]) {
  const client = await getSearchClient()
  const bulkFormattedItems = items.flatMap((item) => [
    {
      index: {
        _index: index,
        _id: getItemIdString(index, item),
      },
    },
    item,
  ])
  // const batches = chunk(bulkFormattedItems, batchSize)
  await client.bulk({ body: bulkFormattedItems as Bulk_RequestBody })
  // for (const batch of batches) {
  // }
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
  const db = await tables()

  const reindexLogs = (await db.reindex_logs.scan({})).Items
  const results = []
  for (const item of response.body) {
    const logItem = reindexLogs.find((log) => log.indexName === item.index)
    results.push({
      ...item,
      reindexStatus: logItem?.status,
      reindexTriggerTime: logItem?.triggerTime,
    })
  }
  return results
}

export async function runReindex(indexName: string) {
  const db = await tables()
  const client = db._doc as unknown as DynamoDBDocument

  if (indexName == 'synonym-groups') {
    // Synonym groups does not have a persistant data entry, it must be constructed
    const TableName = db.name('synonyms')
    // Get all unique synonym ids:
    const pages = paginateScan(
      { client },
      {
        TableName,
        ProjectionExpression: 'synonymId',
      }
    )

    const synonymIds = []
    for await (const page of pages) {
      synonymIds.push(...(page.Items?.map((x) => x.synonymId) as string[]))
    }

    // Then for each synonym Id, get all that match and update the index
    for (const synonymId of synonymIds) {
      const items = []
      const queryPages = paginateQuery(
        { client },
        {
          IndexName: 'synonymsByUuid',
          KeyConditionExpression: 'synonymId = :synonymId',
          ExpressionAttributeValues: {
            ':synonymId': synonymId,
          },
          TableName,
        }
      )
      const synonyms: Synonym[] = []
      for await (const page of queryPages) {
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
      // Continue to refactor
      await bulkPutItemsIntoIndex(indexName, items)
    }
  } else {
    const TableName = db.name(indexName)
    const pages = paginateScan({ client }, { TableName })
    for await (const page of pages) {
      if (page.Items) await bulkPutItemsIntoIndex(indexName, page.Items)
    }
  }

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
