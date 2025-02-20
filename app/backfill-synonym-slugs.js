import { DynamoDBClient, paginateScan } from '@aws-sdk/client-dynamodb'
import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm'
import { BatchWriteCommand } from '@aws-sdk/lib-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { slug } from 'github-slugger'
import chunk from 'lodash/chunk.js'

async function getTableNameFromSSM(dynamoTableName) {
  const ssmClient = new SSMClient({ region: 'us-east-1' })
  const command = new GetParameterCommand({ Name: dynamoTableName })
  const response = await ssmClient.send(command)
  return response.Parameter.Value
}

export async function backfillSlugsOnSynonyms() {
  const startTime = new Date()
  console.log('Starting SYNONYM SLUG backfill... ', startTime)
  const dynamoTableName = '/RemixGcnProduction/tables/synonyms'
  const TableName = await getTableNameFromSSM(dynamoTableName)
  const client = new DynamoDBClient({ region: 'us-east-1' })

  // get synonyms without slugs
  const pages = paginateScan(
    { client },
    { TableName, FilterExpression: 'attribute_not_exists(slug)' }
  )

  // results are async paginated, go through each page
  for await (const page of pages) {
    const chunked = chunk(page.Items || [], 25)
    const synonymsToUpdate = []
    // batch write needs 25 or less items, loop through pages in chunks of 25
    for (const chunk of chunked) {
      // each chunk has 25 records, loop through and process records
      for (const record of chunk) {
        const synonym = unmarshall(record)
        // if there's not a slug, which there shouldn't be, add one and put it in the update queue
        if (!synonym.slug) {
          synonymsToUpdate.push(synonym)
        }
      }
      // if there are any to update, update them. 25 item limit.
      if (synonymsToUpdate.length > 0) {
        const command = new BatchWriteCommand({
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
        await client.send(command)
        console.log(`updated ${synonymsToUpdate.length} records`)
      }
    }
  }
  const endTime = new Date()
  console.log('... End SYNONYM SLUG backfill... ', endTime)
}

backfillSlugsOnSynonyms()
