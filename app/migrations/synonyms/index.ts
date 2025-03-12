import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb'
import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm'
import {
  BatchWriteCommand,
  DynamoDBDocumentClient,
  paginateScan,
} from '@aws-sdk/lib-dynamodb'
import { slug } from 'github-slugger'
import { orderBy, uniqBy } from 'lodash'

import type { Circular } from '~/routes/circulars/circulars.lib'

export interface WriteData {
  eventId: string
  initialDate: number
}

async function getTableNameFromSSM(dynamoTableName: string) {
  const ssmClient = new SSMClient({ region: 'us-east-1' })
  const command = new GetParameterCommand({ Name: dynamoTableName })
  const response = await ssmClient.send(command)
  return response.Parameter?.Value
}

export async function backfillSynonyms() {
  const startTime = new Date()
  console.log('Starting SYNONYM backfill...', startTime)

  const dynamoCircularsTableName = '/RemixGcnProduction/tables/circulars'
  const circularTableName = await getTableNameFromSSM(dynamoCircularsTableName)
  const dynamoSynonymsTableName = '/RemixGcnProduction/tables/synonyms'
  const TableName = await getTableNameFromSSM(dynamoSynonymsTableName)
  const client = new DynamoDBClient({ region: 'us-east-1' })
  const docClient = DynamoDBDocumentClient.from(client)
  const pages = paginateScan(
    { client: docClient },
    { TableName: circularTableName, Limit: 25 }
  )

  for await (const page of pages) {
    const writes = [] as WriteData[]
    const circulars = page.Items as Circular[]

    for (const circular of circulars) {
      if (circular.eventId) {
        const command = new QueryCommand({
          TableName: circularTableName,
          IndexName: 'circularsByEventId',
          KeyConditionExpression: 'eventId = :eventId',
          ExpressionAttributeValues: {
            ':eventId': { S: circular.eventId },
          },
        })

        const response = await client.send(command)
        const items = (response.Items || []).map((item) => ({
          circularId: item.circularId?.S,
          eventId: item.eventId?.S,
          createdOn: item.createdOn?.N,
        }))

        const initialDate = orderBy(items, ['circularId'], ['asc'])[0].createdOn

        if (!initialDate) {
          throw Error
        }
        writes.push({
          eventId: circular.eventId,
          initialDate: parseInt(initialDate),
        })
      }
    }
    if (writes.length > 0 && TableName) {
      const dedupedWrites = uniqBy(writes, 'eventId')

      console.log(`Writing ${dedupedWrites.length} records`)

      const command = new BatchWriteCommand({
        RequestItems: {
          [TableName]: dedupedWrites.map(({ eventId, initialDate }) => ({
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

backfillSynonyms()
