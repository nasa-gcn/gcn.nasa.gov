import { tables } from '@architect/functions'
import { BatchGetItemCommand } from '@aws-sdk/client-dynamodb'
import type { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { paginateScan } from '@aws-sdk/lib-dynamodb'
import { slug } from 'github-slugger'

import { type Circular } from '~/routes/circulars/circulars.lib'

function* chunks<T>(arr: T[], n: number): Generator<T[], void> {
  for (let i = 0; i < arr.length; i += n) {
    yield arr.slice(i, i + n)
  }
}

export async function backfillSynonyms() {
  console.log('Starting SYNONYM backfill...')
  const db = await tables()
  const client = db._doc as unknown as DynamoDBDocument
  const TableName = db.name('synonyms')
  const circularTableName = db.name('circulars')
  const pages = paginateScan(
    { client },
    {
      TableName: circularTableName,
    }
  )

  for await (const page of pages) {
    const chunked = [...chunks(page.Items || [], 25)]
    for (const chunk of chunked) {
      const eventsToCheck: string[] = []
      const existingEventIds: string[] = []
      for (const record of chunk) {
        const circular = record as unknown as Circular
        if (circular.eventId) {
          if (!eventsToCheck.includes(circular.eventId))
            eventsToCheck.push(circular.eventId)
        }
      }
      try {
        const command = new BatchGetItemCommand({
          RequestItems: {
            [TableName]: {
              Keys: [
                ...eventsToCheck.map((eventId) => {
                  return { eventId: { S: eventId } }
                }),
              ],
            },
          },
        })
        const response = await client.send(command)
        if (response.Responses) {
          response.Responses[TableName].forEach(function (element) {
            if (element.eventId?.S) existingEventIds.push(element.eventId.S)
          })
        }
      } catch (error) {
        if ((error as Error).name !== 'ResourceNotFoundException') throw error
        console.error('Error in BatchGetItemCommand:', error)
      }
      const eventsToCreate = eventsToCheck.filter((item) =>
        existingEventIds.includes(item)
      )
      if (eventsToCreate.length > 0) {
        await client.batchWrite({
          RequestItems: {
            [TableName]: eventsToCreate.map((eventId) => ({
              PutRequest: {
                Item: {
                  synonymId: crypto.randomUUID(),
                  eventId,
                  slug: slug(eventId),
                },
              },
            })),
          },
        })
        console.log(`created ${eventsToCreate.length} records`)
      }
    }
  }
  console.log('... End SYNONYM backfill')
}
