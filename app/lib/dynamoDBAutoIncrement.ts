import { TransactionCanceledException } from '@aws-sdk/client-dynamodb'
import type { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'

/**
 * Update an auto-incrementing partition key in DynamoDB.
 *
 * Adapted from https://bitesizedserverless.com/bite/reliable-auto-increments-in-dynamodb/.
 *
 * @example
 * ```
 * import { DynamoDB } from '@aws-sdk/client-dynamodb'
 * import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
 *
 * const client = new DynamoDB({})
 * const doc = DynamoDBDocument.from(client)
 *
 * const autoIncrement = dynamoDBAutoIncrement({
 *   doc,
 *   counterTableName: 'autoincrementHelper',
 *   counterTableKey: { autoincrementHelperForTable: 'widgets' },
 *   counterTableAttributeName: 'widgetIDCounter',
 *   tableName: 'widgets',
 *   tableAttributeName: 'widgetID',
 *   initialValue: 0,
 * })
 *
 * const lastWidgetID = await autoIncrement({
 *   widgetName: 'runcible spoon',
 *   costDollars: 99.99,
 * })
 * ```
 *
 * @param doc a DynamoDB document client instance
 * @param counterTableName the name of the table in which to store the last value of the counter
 * @param counterTableKey the partition key in the table in which to store the last value of the counter
 * @param counterTableAttributeName the name of the attribute in the table in which to store the last value of the counter
 * @param tableName the name of the table in which to store items
 * @param tableAttributeName the name of the attribute used as the auto-incrementing partition key in the table in which to store items
 * @param initialValue the initial value of the counter
 * @returns an asynchronous function that, when called with an item for the table, puts the item into the table and returns the new value of the counter
 */
export function dynamoDBAutoIncrement({
  doc,
  counterTableName,
  counterTableKey,
  counterTableAttributeName,
  tableName,
  tableAttributeName,
  initialValue,
}: {
  doc: DynamoDBDocument
  counterTableName: string
  counterTableKey: any
  counterTableAttributeName: string
  tableName: string
  tableAttributeName: string
  initialValue: number
}) {
  return async (item: any) => {
    while (true) {
      const counter =
        (
          await doc.get({
            AttributesToGet: [counterTableAttributeName],
            Key: counterTableKey,
            TableName: counterTableName,
          })
        ).Item?.[counterTableAttributeName] ?? undefined

      if (typeof counter !== 'number' && typeof counter !== 'undefined')
        throw new Error('counter must be number or undefined')

      const nextCounter = counter === undefined ? initialValue : counter + 1

      const command = {
        TransactItems: [
          {
            Update: {
              ConditionExpression:
                counter === undefined
                  ? `${counterTableAttributeName} = :counter`
                  : `attribute_not_exists(${counterTableAttributeName})`,
              ExpressionAttributeValues: {
                ':counter': counter ?? null,
                ':nextCounter': nextCounter,
              },

              Key: counterTableKey,
              TableName: counterTableName,
              UpdateExpression: `SET ${counterTableAttributeName} = :nextCounter`,
            },
          },
          {
            Put: {
              ConditionExpression: `attribute_not_exists(${tableAttributeName})`,
              Item: { [tableAttributeName]: nextCounter, ...item },
              TableName: tableName,
            },
          },
        ],
      }

      try {
        await doc.transactWrite(command)
      } catch (e) {
        if (e instanceof TransactionCanceledException) {
          continue
        } else {
          throw e
        }
      }

      return nextCounter
    }
  }
}
