import {
  ConditionalCheckFailedException,
  DynamoDB,
} from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import type { dynamoDBAutoIncrementProps } from '../../app/lib/dynamoDBAutoIncrement'
import { dynamoDBAutoIncrement } from '../../app/lib/dynamoDBAutoIncrement'

let doc: DynamoDBDocument
let autoincrement: ReturnType<typeof dynamoDBAutoIncrement>
let autoincrementDangerously: ReturnType<typeof dynamoDBAutoIncrement>

beforeAll(async () => {
  doc = DynamoDBDocument.from(
    new DynamoDB({
      credentials: { accessKeyId: '-', secretAccessKey: '-' },
      endpoint: 'http://localhost:8000',
      region: '-',
    })
  )
  const options: dynamoDBAutoIncrementProps = {
    doc,
    counterTableName: 'autoincrement',
    counterTableKey: { tableName: 'widgets' },
    counterTableAttributeName: 'counter',
    tableName: 'widgets',
    tableAttributeName: 'widgetID',
    initialValue: 1,
  }
  autoincrement = dynamoDBAutoIncrement(options)
  autoincrementDangerously = dynamoDBAutoIncrement({
    ...options,
    dangerously: true,
  })
})

afterEach(async () => {
  // Delete all items of all tables
  await Promise.all(
    [
      { TableName: 'autoincrement', KeyAttributeName: 'tableName' },
      { TableName: 'widgets', KeyAttributeName: 'widgetID' },
    ].map(
      async ({ TableName, KeyAttributeName }) =>
        await Promise.all(
          ((await doc.scan({ TableName })).Items ?? []).map(
            async ({ [KeyAttributeName]: KeyValue }) =>
              await doc.delete({
                TableName,
                Key: { [KeyAttributeName]: KeyValue },
              })
          )
        )
    )
  )
})

describe('dynamoDBAutoIncrement', () => {
  test.each([undefined, 1, 2, 3])(
    'creates a new item with the correct ID when the old ID was %o',
    async (lastID) => {
      let nextID: number
      if (lastID === undefined) {
        nextID = 1
      } else {
        await doc.put({
          TableName: 'autoincrement',
          Item: { tableName: 'widgets', counter: lastID },
        })
        nextID = lastID + 1
      }

      const result = await autoincrement({ widgetName: 'runcible spoon' })
      expect(result).toEqual(nextID)

      const [widgetItems, autoincrementItems] = await Promise.all(
        ['widgets', 'autoincrement'].map(
          async (TableName) => (await doc.scan({ TableName })).Items
        )
      )

      expect(widgetItems).toEqual([
        { widgetID: nextID, widgetName: 'runcible spoon' },
      ])
      expect(autoincrementItems).toEqual([
        {
          tableName: 'widgets',
          counter: nextID,
        },
      ])
    }
  )

  test('correctly handles a large number of parallel puts', async () => {
    const ids = Array.from(Array(20).keys()).map((i) => i + 1)
    const result = await Promise.all(ids.map(() => autoincrement({})))
    expect(result.sort()).toEqual(ids.sort())
  })
})

describe('dynamoDBAutoIncrement dangerously', () => {
  test('correctly handles a large number of serial puts', async () => {
    const ids = Array.from(Array(20).keys()).map((i) => i + 1)
    const result: number[] = []
    for (const item of ids) {
      result.push(await autoincrementDangerously({ widgetName: item }))
    }
    expect(result.sort()).toEqual(ids.sort())
  })

  test('fails on a large number of parallel puts', async () => {
    const ids = Array.from(Array(20).keys()).map((i) => i + 1)
    await expect(
      async () => await Promise.all(ids.map(() => autoincrementDangerously({})))
    ).rejects.toThrow(ConditionalCheckFailedException)
  })
})
