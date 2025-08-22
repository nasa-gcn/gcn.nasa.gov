import type { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { ListTablesCommand } from '@aws-sdk/client-dynamodb'
import { sleep } from '@nasa-gcn/architect-plugin-utils'

/**
 * Wait for a connection to the DynamoDB client.
 */
export async function waitForConnection(client: DynamoDBClient) {
  while (true) {
    try {
      const { TableNames } = await client.send(new ListTablesCommand({}))
      if (TableNames) return
    } catch (e) {
      /* empty */
      console.error('Error connecting to DynamoDB:', e)
    }
    await sleep(1000)
  }
}
