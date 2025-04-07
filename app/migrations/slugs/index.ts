import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm'
import {
  BatchWriteCommand,
  DynamoDBDocumentClient,
  paginateScan,
} from '@aws-sdk/lib-dynamodb'
import { slug } from 'github-slugger'

import type { Synonym } from '~/routes/synonyms/synonyms.lib'

export interface WriteData {
  eventId: string
  synonymId: string
}

async function getTableNameFromSSM(dynamoTableName: string) {
  const ssmClient = new SSMClient({ region: 'us-east-1' })
  const command = new GetParameterCommand({ Name: dynamoTableName })
  const response = await ssmClient.send(command)
  return response.Parameter?.Value
}

export async function backfillSlugs() {
  const startTime = new Date()
  console.log('Starting SYNONYM SLUG backfill...', startTime)
  const dynamoSynonymsTableName = '/RemixGcnProduction/tables/synonyms'
  const TableName = await getTableNameFromSSM(dynamoSynonymsTableName)
  const client = new DynamoDBClient({ region: 'us-east-1' })
  const docClient = DynamoDBDocumentClient.from(client)
  const pages = paginateScan({ client: docClient }, { TableName, Limit: 25 })

  for await (const page of pages) {
    const writes = [] as WriteData[]
    const synonyms = page.Items as Synonym[]

    for (const synonym of synonyms) {
      if (!synonym.slug) {
        writes.push({
          eventId: synonym.eventId,
          synonymId: synonym.synonymId,
        })
      }
    }
    if (writes.length > 0 && TableName) {
      console.log(`Writing ${writes.length} records`)

      const command = new BatchWriteCommand({
        RequestItems: {
          [TableName]: writes.map(({ eventId, synonymId }) => ({
            PutRequest: {
              Item: {
                synonymId,
                eventId,
                slug: slug(eventId),
              },
            },
          })),
        },
      })

      await client.send(command)
    }
  }
  const endTime = new Date()
  console.log('... End SYNONYM SLUG backfill... ', endTime)
}

backfillSlugs()
