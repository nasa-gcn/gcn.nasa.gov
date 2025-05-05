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

export async function dataRepair(letter: string) {
  const logInstrument = letter === 'L' ? 'LIGO' : 'EP'
  const startTime = new Date()
  console.log(`Starting ${logInstrument} backfill...`, startTime)

  // Keeps track of all the synonyms we've deleted this run
  const synonymsDeleted = new Set()
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

  // LVK records are the only eventIds that start with L
  // EP records are the only eventIds that start with E
  // neither has any records in the archive that begin with a lowercase letter
  const pages = paginateScan(
    { client: docClient },
    {
      TableName: circularTableName,
      Limit: 25,
      IndexName: 'circularsByEventId',
      FilterExpression: 'begins_with(eventId, :val)',
      ExpressionAttributeValues: { ':val': letter },
    }
  )

  for await (const page of pages) {
    const circularWrites = [] as Circular[]
    const synonymDeletes = []

    const circulars = page.Items as Circular[]

    for (const circular of circulars) {
      const ogEventId = circular.eventId
      const parsedEventId = parseEventFromSubject(circular.subject)

      // only do more if we have to change the eventId
      if (parsedEventId != ogEventId) {
        circular.eventId = parsedEventId
        // If the parsed eventId and the OG eventId do not match,
        // add the updated circular to the write array
        circularWrites.push(circular)

        // If the OG eventId has not been deleted, add it to the delete array.
        // Record the delete in the synonymsDeleted so it isn't duplicated.
        // Primary keys are immutable and can not be updated, so they must be
        // deleted and re-created.
        if (!synonymsDeleted.has(ogEventId)) {
          synonymDeletes.push(ogEventId)
          synonymsDeleted.add(ogEventId)
        }

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

    // Batch write synonym deletes only, Combining all 3 writes may go over 25 item limit
    if (synonymDeletes.length > 0 && TableName) {
      // ensure that the writes are unique, they should be due to the check before adding them to
      // the write array, but just to be absolutely confident uniq the writes
      const uniqueSynonymDeletes = uniq(synonymDeletes)
      console.log(`Deleting ${uniqueSynonymDeletes.length} synonym records`)

      const command = new BatchWriteCommand({
        RequestItems: {
          [TableName]: uniqueSynonymDeletes.map((eventId) => ({
            DeleteRequest: { Key: { eventId } },
          })),
        },
      })

      await client.send(command)
    }
  }

  // If we haven't already created a synonym this run
  // gather data necessary to create new synonym, and
  // add it to the synonyms to be written.
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
  console.log(`... End ${logInstrument} backfill... `, endTime)
}

// Unfortunately a table scan can't be done with two begins_with conditions,
// so we must run the table scan twice

// ALL LIGO records have eventIds that begin with a capital L.
// This is the run to repair LVK events
dataRepair('L')

// ALL EP records have eventIds that begin with a capital E
// This is the run to repair EP events
dataRepair('E')
