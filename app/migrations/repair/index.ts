import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm'
import type { QueryCommandInput } from '@aws-sdk/lib-dynamodb'
import {
  BatchWriteCommand,
  DynamoDBDocumentClient,
  QueryCommand,
  paginateScan,
} from '@aws-sdk/lib-dynamodb'
import { slug } from 'github-slugger'
import { chunk, minBy, uniq } from 'lodash'

import {
  type Circular,
  parseEventFromSubject,
} from '~/routes/circulars/circulars.lib'

export interface SynonymWriteData {
  eventId: string
  initialDate: number
}

async function getTableNameFromSSM(dynamoTableName: string) {
  const ssmClient = new SSMClient({ region: 'us-east-1' })
  const command = new GetParameterCommand({ Name: dynamoTableName })
  const response = await ssmClient.send(command)
  return response.Parameter?.Value
}

export async function dataRepair() {
  const startTime = new Date()
  console.log(`Starting missing eventId backfill...`, startTime)

  // Keeps track of all the synonyms we will create this run
  const synonymsToCreate = new Set()
  // synonymWrites are top level so they are only created once per run
  const synonymWrites = [] as SynonymWriteData[]

  const dynamoCircularsTableName = '/RemixGcnProduction/tables/circulars'
  const circularTableName = await getTableNameFromSSM(dynamoCircularsTableName)
  const dynamoSynonymsTableName = '/RemixGcnProduction/tables/synonyms'
  const TableName = await getTableNameFromSSM(dynamoSynonymsTableName)
  const client = new DynamoDBClient({ region: 'us-east-1' })
  const docClient = DynamoDBDocumentClient.from(client)

  // Get only circulars that have a missing eventId
  const pages = paginateScan(
    { client: docClient },
    {
      TableName: circularTableName,
      Limit: 25,
      IndexName: 'circularsByEventId',
      FilterExpression: 'attribute_not_exists(eventId)',
    }
  )

  for await (const page of pages) {
    const circularWrites = [] as Circular[]
    const circulars = page.Items as Circular[]

    for (const circular of circulars) {
      const parsedEventId = parseEventFromSubject(circular.subject)

      // only do more if there is a parsed event name and we have to add the eventId
      if (parsedEventId) {
        circular.eventId = parsedEventId
        // add the updated circular to the write array
        circularWrites.push(circular)

        // only add a synonym to create to the set once to prevent duplicates
        if (!synonymsToCreate.has(parsedEventId))
          synonymsToCreate.add(parsedEventId)
      }
    }

    // Batch write circular updates only. Combining all 3 writes may go over 25 item limit
    if (circularWrites.length > 0 && circularTableName) {
      // ensure that the writes are unique, they should be due to the check before adding them to
      // the write array, but just to be absolutely confident uniq the writes
      const uniqueCircularWrites = uniq(circularWrites)
      console.log(`Writing ${uniqueCircularWrites.length} circular records`)

      const command = new BatchWriteCommand({
        RequestItems: {
          [circularTableName]: uniqueCircularWrites.map((circ) => ({
            PutRequest: { Item: { ...circ } },
          })),
        },
      })

      await client.send(command)
    }
  }

  // This is only done once per run so that if there are multiple updates
  // to the same event, it only pulls the circulars for the event once.
  // The synonymsToCreate variable is a set, so it will be unique
  for (const synonymEventId in synonymsToCreate) {
    const params: QueryCommandInput = {
      TableName: circularTableName,
      IndexName: 'circularsByEventId',
      KeyConditionExpression: 'eventId = :eventId',
      ExpressionAttributeValues: { ':eventId': synonymEventId },
    }
    const command = new QueryCommand(params)
    // get all circulars that belong to this event to recalculate the initial date
    const response = await docClient.send(command)
    const items = response.Items?.map(({ circularId, eventId, createdOn }) => ({
      circularId,
      eventId,
      createdOn,
    }))

    const initialDateObj = minBy(items, 'createdOn')

    // here for typescript, this isn't ever blank
    if (!initialDateObj?.createdOn) {
      throw Error
    }

    const initialDate = initialDateObj.createdOn

    // here for typescript, this isn't ever blank
    if (!initialDate) {
      throw Error
    }

    synonymWrites.push({
      eventId: synonymEventId,
      initialDate: parseInt(initialDate),
    })
  }

  console.log(`Total synonyms to create: ${synonymWrites.length}`)

  // So we don't go over the 25 item write limit for the batch write,
  // we are chunking the writes into arrays of 25
  for (const synonymChunk of chunk(synonymWrites, 25)) {
    if (synonymChunk.length > 0 && TableName) {
      // ensure that the writes are unique, they should be due to the fact we are adding them from a set,
      // but just to be absolutely confident uniq the writes
      const uniqueSynonymWrites = uniq(synonymChunk)
      console.log(`Writing ${uniqueSynonymWrites.length} synonym records`)

      const command = new BatchWriteCommand({
        RequestItems: {
          [TableName]: uniqueSynonymWrites.map(({ eventId, initialDate }) => ({
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
  console.log(`... End missing eventId backfill... `, endTime)
}

dataRepair()
