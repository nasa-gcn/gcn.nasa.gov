import { DynamoDBClient, paginateScan } from '@aws-sdk/client-dynamodb'
import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm'
import { BatchWriteCommand } from '@aws-sdk/lib-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import chunk from 'lodash/chunk.js'

// THIS CODE IS CUT AND PASTED FROM THE APP CODE IN /routes/circulars/circulars.lib.ts
// running as a node script it would not import the module from the file
const subjectMatchers = [
  [/GRB[.\s_-]*(\d{6}[a-z|.]?\d*)/i, ([, id]) => `GRB ${id.toUpperCase()}`], // THIS ONE IS INTENTIONALLY DIFFERENT THAN APP CODE!
  [/SGR[.\s_-]*(J*\d{4}\.?\d*\+\d{4})/i, ([, id]) => `SGR ${id.toUpperCase()}`],
  [
    /SGR[.\s_-]*Swift[.\s_-]*(J*\d{4}\.?\d*\+\d{4})/i,
    ([, id]) => `SGR Swift ${id.toUpperCase()}`,
  ],
  [/IceCube[.\s_-]*(\d{6}[a-z])/i, ([, id]) => `IceCube-${id.toUpperCase()}`],
  [/ZTF[.\s_-]*(\d{2}[a-z]*)/i, ([, id]) => `ZTF${id.toLowerCase()}`],
  [/HAWC[.\s_-]*(\d{6}A)/i, ([, id]) => `HAWC-${id.toUpperCase()}`],
  [
    /((?:LIGO|Virgo|KAGRA)(?:[/-](?:LIGO|Virgo|KAGRA))*)[-_ \s]?(S|G|GW)(\d{5,}[a-z]*)/i,
    ([, instrument, flag, id]) => {
      return `${instrument} ${flag.toUpperCase()}${id.toLowerCase()}`
    },
  ],
  [/ANTARES[.\s_-]*(\d{6}[a-z])/i, ([, id]) => `ANTARES ${id}`.toUpperCase()],
  [
    /Baksan\sNeutrino\sObservatory\sAlert[.\s_-]*(\d{6}.\d{2})/i,
    ([, id]) => `Baksan Neutrino Observatory Alert ${id}`,
  ],
  [/EP[.\s_-]*(\d{6}[a-z])/i, ([, id]) => `EP${id}`],
  [/FRB[.\s_-]*(\d{8}[a-z])/i, ([, id]) => `FRB ${id}`.toUpperCase()],
  [/sb[.\s_-]*(\d{8})/i, ([, id]) => `sb${id}`],
]

export function parseEventFromSubject(value) {
  for (const [regexp, normalize] of subjectMatchers) {
    const startsWithMatch = RegExp(`^${regexp.source}`).exec(value)
    if (startsWithMatch) return normalize(startsWithMatch)
  }
  for (const [regexp, normalize] of subjectMatchers) {
    const match = regexp.exec(value)
    if (match) return normalize(match)
  }
}
// END CUT AND PASTE OF APP CODE FROM /routes/circulars/circulars.lib.ts

async function getTableNameFromSSM(dynamoTableName) {
  const ssmClient = new SSMClient({ region: 'us-east-1' })
  const command = new GetParameterCommand({ Name: dynamoTableName })
  const response = await ssmClient.send(command)
  return response.Parameter.Value
}

export async function backfillEventIds() {
  const startTime = new Date()
  console.log('Starting EVENT ID backfill...', startTime)
  const writeLimit = 10
  const dynamoTableName = '/RemixGcnProduction/tables/circulars'
  const TableName = await getTableNameFromSSM(dynamoTableName)
  const client = new DynamoDBClient({ region: 'us-east-1' })
  // get the circulars without eventIds
  const pages = paginateScan(
    { client },
    { TableName, FilterExpression: 'attribute_not_exists(eventId)' }
  )
  let totalWriteCount = 0
  let limitHit = false

  // keeping the pages loop so we can bail quickly once we hit our limit
  for await (const page of pages) {
    if (limitHit) break // no need to carry on if we've hit the limit for the day
    // break the page into chunks of 25 since that is the limit for batchwrite
    const chunked = chunk(page.Items || [], 25)

    // loop over in chunks of 25 to keep the batch write happy
    for (const chunk of chunked) {
      if (limitHit) break // no need to carry on if we've hit the limit for the day
      let writes = []

      // take each record in the chunk and process it
      for (const record of chunk) {
        if (limitHit) break // again, just to be safe, don't do anything if we've hit the limit

        const circular = unmarshall(record)
        const parsedEventId = parseEventFromSubject(circular.subject)

        // if the record doesn't have an eventId (which it shouldn't), add one and add it to the write queue
        if (!circular.eventId && parsedEventId) {
          circular.eventId = parsedEventId
          writes.push(circular)
        }
      }

      // check to see if we are over the daily limit with this chunk.
      if (writes.length + totalWriteCount > writeLimit) {
        // we find how far over the limit it puts us
        const overage = writes.length + totalWriteCount - writeLimit
        // we figure out how many we need to remove to keep it under the limit
        const writesToLimitTo = writes.length - overage
        // we slice off the ones that would put us over it
        writes = writes.slice(0, writesToLimitTo)
        // we set the limit hit to true so no further processing will happen after
        // the proper number of writes
        limitHit = true
      }
      // if there are writes, it batch writes them. it can only handle 25 at a time, that's why we do chunks
      if (writes.length > 0) {
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
        totalWriteCount = writes.length + totalWriteCount
      }
    }
  }
  const endTime = new Date()
  console.log('... End EVENT ID backfill... ', endTime)
  console.log('Total Event Ids Updated: ', totalWriteCount)
}

backfillEventIds()
