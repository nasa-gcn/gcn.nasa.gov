import { tables } from '@architect/functions'
import type { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { paginateScan } from '@aws-sdk/lib-dynamodb'

import {
  type Circular,
  parseEventFromSubject,
} from '~/routes/circulars/circulars.lib'

function* chunks<T>(arr: T[], n: number): Generator<T[], void> {
  for (let i = 0; i < arr.length; i += n) {
    yield arr.slice(i, i + n)
  }
}

export async function backfill() {
  // write limit can be adjusted as needed below
  const writeLimit = 1000
  const db = await tables()
  const client = db._doc as unknown as DynamoDBDocument
  const TableName = db.name('circulars')
  const pages = paginateScan(
    { client },
    {
      TableName,
    }
  )
  let totalWriteCount = 0
  let limitHit = false

  console.log(`Starting backfill of ${writeLimit} records...`)

  for await (const page of pages) {
    if (limitHit) break
    const chunked = [...chunks(page.Items || [], 25)]

    for (const chunk of chunked) {
      if (limitHit) break
      let writes = [] as Circular[]

      for (const record of chunk) {
        if (limitHit) break
        const circular = record as unknown as Circular
        const parsedEventId = parseEventFromSubject(circular.subject)

        if (!circular.eventId && parsedEventId) {
          circular.eventId = parsedEventId
          writes.push(circular)
        }

        // check so we adjust the writes if the write count per
        // chunk will go over the writeLimit for the run
        if (writes.length + totalWriteCount > writeLimit) {
          const overage = writes.length + totalWriteCount - writeLimit
          const writesToLimitTo = writes.length - overage
          writes = writes.slice(0, writesToLimitTo)
          limitHit = true
        }

        if (writes.length > 0) {
          await client.batchWrite({
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
        }
      }

      totalWriteCount = writes.length + totalWriteCount
    }
  }

  console.log(
    `_______Backfill complete. Updated ${totalWriteCount} records.______`
  )
}
