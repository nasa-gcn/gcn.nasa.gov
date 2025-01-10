import { tables } from '@architect/functions'
import type { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { paginateScan } from '@aws-sdk/lib-dynamodb'
import { slug } from 'github-slugger'

import type { Synonym } from '~/routes/synonyms/synonyms.lib'

function* chunks<T>(arr: T[], n: number): Generator<T[], void> {
  for (let i = 0; i < arr.length; i += n) {
    yield arr.slice(i, i + n)
  }
}

export async function backfillSynonyms() {
  console.log('Starting SYNONYM SLUG backfill...')
  const db = await tables()
  const client = db._doc as unknown as DynamoDBDocument
  const TableName = db.name('synonyms')
  const pages = paginateScan(
    { client },
    {
      TableName,
    }
  )

  for await (const page of pages) {
    const chunked = [...chunks(page.Items || [], 25)]
    const synonymsToUpdate = [] as Synonym[]
    for (const chunk of chunked) {
      for (const record of chunk) {
        const synonym = record as unknown as Synonym
        if (!synonym.slug) {
          synonymsToUpdate.push(synonym)
        }
      }
      if (synonymsToUpdate.length > 0) {
        await client.batchWrite({
          RequestItems: {
            [TableName]: synonymsToUpdate.map((synonym) => ({
              PutRequest: {
                Item: {
                  synonymId: synonym.synonymId,
                  eventId: synonym.eventId,
                  slug: slug(synonym.eventId),
                },
              },
            })),
          },
        })
        console.log(`updated ${synonymsToUpdate.length} records`)
      }
    }
  }
  console.log('... End SYNONYM SLUG backfill')
}
