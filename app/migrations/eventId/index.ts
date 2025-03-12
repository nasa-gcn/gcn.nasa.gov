import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm'
import {
  BatchWriteCommand,
  DynamoDBDocumentClient,
  paginateScan,
} from '@aws-sdk/lib-dynamodb'

import type { Circular } from '~/routes/circulars/circulars.lib'
import { parseEventFromSubject } from '~/routes/circulars/circulars.lib'

async function getTableNameFromSSM(dynamoTableName: string) {
  const ssmClient = new SSMClient({ region: 'us-east-1' })
  const command = new GetParameterCommand({ Name: dynamoTableName })
  const response = await ssmClient.send(command)
  return response.Parameter?.Value
}

export async function backfillEventIds() {
  const startTime = new Date()
  console.log('Starting EVENT ID backfill...', startTime)
  const dynamoTableName = '/RemixGcnProduction/tables/circulars'
  const TableName = await getTableNameFromSSM(dynamoTableName)
  const client = new DynamoDBClient({ region: 'us-east-1' })
  const docClient = DynamoDBDocumentClient.from(client)
  const pages = paginateScan({ client: docClient }, { TableName, Limit: 25 })

  for await (const page of pages) {
    const writes = []
    const circulars = page.Items as Circular[]
    for (const circular of circulars) {
      const parsedEventId = parseEventFromSubject(circular.subject)

      if (parsedEventId) {
        circular.eventId = parsedEventId
        writes.push(circular)
      }
    }

    if (writes.length > 0 && TableName) {
      console.log(`Writing ${writes.length} records`)
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
