import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm'
// import type { QueryCommandInput } from '@aws-sdk/lib-dynamodb'
import {
  // BatchWriteCommand,
  DynamoDBDocumentClient, // QueryCommand,
  paginateScan,
} from '@aws-sdk/lib-dynamodb'

// import { slug } from 'github-slugger'
// import { minBy } from 'lodash'
import {
  type Circular,
  parseEventFromSubject,
} from '~/routes/circulars/circulars.lib'

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

export async function backfillLIGO() {
  const startTime = new Date()
  console.log('Starting LIGO backfill...', startTime)
  // const eventsRun = new Set()
  // const synonymsCreated = new Set()
  const dynamoCircularsTableName = '/RemixGcnProduction/tables/circulars'
  const circularTableName = await getTableNameFromSSM(dynamoCircularsTableName)
  // const dynamoSynonymsTableName = '/RemixGcnProduction/tables/synonyms'
  // const TableName = await getTableNameFromSSM(dynamoSynonymsTableName)
  const client = new DynamoDBClient({ region: 'us-east-1' })
  const docClient = DynamoDBDocumentClient.from(client)
  let counter = 0
  const pages = paginateScan(
    { client: docClient },
    {
      TableName: circularTableName,
      Limit: 25,
      FilterExpression: 'contains(searchTokens, :val)',
      ExpressionAttributeValues: {
        ':val': 'LIGO',
      },
    }
  )

  for await (const page of pages) {
    // const writes = [] as WriteData[]
    const circulars = page.Items as Circular[]

    for (const circular of circulars) {
      const parsedEventId = parseEventFromSubject(circular.subject)
      if (!circular.eventId) {
        console.log('no event id')
      }
      if (!parsedEventId) {
        console.log('no parsedEventId')
      }
      if (!circular.eventId && !parsedEventId) {
        return
      }
      if (parsedEventId != circular.eventId) {
        counter++
        console.log('_________')
        console.log(parsedEventId, circular.eventId)
      }
      // if (circular.eventId && !eventsRun.has(circular.eventId)) {
      //   const params: QueryCommandInput = {
      //     TableName: circularTableName,
      //     IndexName: 'circularsByEventId',
      //     KeyConditionExpression: 'eventId = :eventId',
      //     ExpressionAttributeValues: {
      //       ':eventId': circular.eventId,
      //     },
      //   }
      //   const command = new QueryCommand(params)
      //   const response = await docClient.send(command)
      //   const items = response.Items?.map(
      //     ({ circularId, eventId, createdOn }) => ({
      //       circularId,
      //       eventId,
      //       createdOn,
      //     })
      //   )

      //   const initialDateObj = minBy(items, 'createdOn')
      //   if (!initialDateObj?.createdOn) {
      //     throw Error
      //   }
      //   const initialDate = initialDateObj.createdOn

      //   if (!initialDate) {
      //     throw Error
      //   }
      //   writes.push({
      //     eventId: circular.eventId,
      //     initialDate: parseInt(initialDate),
      //   })
      //   eventsRun.add(circular.eventId)
      // }
    }
    // if (writes.length > 0 && TableName) {
    //   console.log(`Writing ${writes.length} records`)

    //   const command = new BatchWriteCommand({
    //     RequestItems: {
    //       [TableName]: writes.map(({ eventId, initialDate }) => ({
    //         PutRequest: {
    //           Item: {
    //             synonymId: crypto.randomUUID(),
    //             eventId,
    //             slug: slug(eventId),
    //             initialDate,
    //           },
    //         },
    //       })),
    //     },
    //   })

    //   await client.send(command)
    // }
  }
  console.log(`TO CHANGE: ${counter}`)
  const endTime = new Date()
  console.log('... End LIGO backfill... ', endTime)
}

backfillLIGO()
