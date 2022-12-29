import { TransactionCanceledException } from '@aws-sdk/client-dynamodb'
import type {
  DynamoDBDocument,
  PutCommandInput,
  UpdateCommandInput,
} from '@aws-sdk/lib-dynamodb'

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
 * @param dangerously if true, then do not perform any locking (suitable only for testing)
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
  dangerously,
}: {
  doc: DynamoDBDocument
  counterTableName: string
  counterTableKey: any
  counterTableAttributeName: string
  tableName: string
  tableAttributeName: string
  initialValue: number
  dangerously?: boolean
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

      let nextCounter: number
      let Update: UpdateCommandInput & { UpdateExpression: string }

      if (counter === undefined) {
        nextCounter = initialValue
        Update = {
          ConditionExpression: 'attribute_not_exists(#counter)',
          ExpressionAttributeNames: {
            '#counter': counterTableAttributeName,
          },
          ExpressionAttributeValues: {
            ':nextCounter': nextCounter,
          },
          Key: counterTableKey,
          TableName: counterTableName,
          UpdateExpression: 'SET #counter = :nextCounter',
        }
      } else {
        nextCounter = counter + 1
        Update = {
          ConditionExpression: '#counter = :counter',
          ExpressionAttributeNames: {
            '#counter': counterTableAttributeName,
          },
          ExpressionAttributeValues: {
            ':counter': counter,
            ':nextCounter': nextCounter,
          },
          Key: counterTableKey,
          TableName: counterTableName,
          UpdateExpression: 'SET #counter = :nextCounter',
        }
      }

      const Put: PutCommandInput = {
        ConditionExpression: 'attribute_not_exists(#counter)',
        ExpressionAttributeNames: { '#counter': tableAttributeName },
        Item: { [tableAttributeName]: nextCounter, ...item },
        TableName: tableName,
      }

      if (dangerously) {
        await Promise.all([doc.update(Update), doc.put(Put)])
      } else {
        try {
          await doc.transactWrite({ TransactItems: [{ Update }, { Put }] })
        } catch (e) {
          if (e instanceof TransactionCanceledException) {
            continue
          } else {
            throw e
          }
        }
      }

      return nextCounter
    }
  }
}
