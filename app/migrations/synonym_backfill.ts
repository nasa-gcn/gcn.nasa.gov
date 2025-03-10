import { tables } from '@architect/functions'
import type { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { BatchWriteCommand, paginateScan } from '@aws-sdk/lib-dynamodb'
import { slug } from 'github-slugger'
import { orderBy } from 'lodash'

import type { Circular } from '~/routes/circulars/circulars.lib'
import { getSynonymMembers } from '~/routes/synonyms/synonyms.server'

export interface WriteData {
  eventId: string
  initialDate: number
}

export async function backfillSynonyms() {
  const startTime = new Date()
  console.log('Starting SYNONYM backfill...', startTime)
  const db = await tables()
  const client = db._doc as unknown as DynamoDBDocument
  const TableName = db.name('synonyms')
  const circularsTableName = db.name('circulars')
  const pages = paginateScan(
    { client },
    { TableName: circularsTableName },
    { pageSize: 25 }
  )

  for await (const page of pages) {
    const writes = [] as WriteData[]
    const circulars = page.Items as Circular[]

    for (const circular of circulars) {
      if (circular.eventId) {
        const members = await getSynonymMembers(circular.eventId)
        const initialDate = orderBy(members, ['circularId'], ['asc'])[0]
          .createdOn
        console.log(initialDate)
        writes.push({ eventId: circular.eventId, initialDate })
      }
      if (writes.length > 0) {
        const command = new BatchWriteCommand({
          RequestItems: {
            [TableName]: writes.map(({ eventId, initialDate }) => ({
              PutRequest: {
                Item: {
                  synonymId: crypto.randomUUID(),
                  eventId,
                  slug: slug(eventId),
                  initialDate,
                },
              },
            })),
          },
        })
        await client.send(command)
      }
    }
    const endTime = new Date()
    console.log('... End SYNONYM backfill... ', endTime)
  }
}

backfillSynonyms()
