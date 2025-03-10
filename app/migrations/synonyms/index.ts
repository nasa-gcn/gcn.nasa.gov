import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb'
import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm'
import { BatchWriteCommand, paginateScan } from '@aws-sdk/lib-dynamodb'
import { slug } from 'github-slugger'
import { orderBy } from 'lodash'

import type { Circular } from '~/routes/circulars/circulars.lib'

export interface WriteData {
  eventId: string
  initialDate: string
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
  const pages = paginateScan(
    { client },
    { TableName: circularTableName },
    { pageSize: 25 }
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
        console.log(initialDate)
        writes.push({ eventId: circular.eventId, initialDate })
      }
      if (writes.length > 0 && TableName) {
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
