import { tables } from '@architect/functions'
import type { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { BatchWriteCommand, paginateScan } from '@aws-sdk/lib-dynamodb'

import type { Circular } from '~/routes/circulars/circulars.lib'
import { parseEventFromSubject } from '~/routes/circulars/circulars.lib'

export async function backfillEventIds() {
  const startTime = new Date()
  console.log('Starting EVENT ID backfill...', startTime)
  const db = await tables()
  const client = db._doc as unknown as DynamoDBDocument
  const TableName = db.name('circulars')
  const pages = paginateScan({ client }, { TableName }, { pageSize: 25 })

  for await (const page of pages) {
    const writes = []
    const circulars = page.Items as Circular[]
    for (const circular of circulars) {
      const parsedEventId = parseEventFromSubject(circular.subject)

      if (!circular.eventId && parsedEventId) {
        circular.eventId = parsedEventId
        writes.push(circular)
      }
    }
    if (writes.length > 0) {
      const command = new BatchWriteCommand({
        RequestItems: {
          [TableName]: writes.map((circ) => ({
            PutRequest: {
              Item: {
                ...circ,
              },
            },
          })),
        },
      })
      await client.send(command)
    }
  }
  const endTime = new Date()
  console.log('... End EVENT ID backfill... ', endTime)
}

backfillEventIds()
