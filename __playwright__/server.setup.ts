import { DynamoDBClient, ListTablesCommand } from '@aws-sdk/client-dynamodb'
import { sleep } from '@nasa-gcn/architect-plugin-utils'
import { test as setup } from 'playwright/test'
import waitPort from 'wait-port'

async function waitForConnection(client: DynamoDBClient) {
  while (true) {
    try {
      const { TableNames } = await client.send(new ListTablesCommand({}))
      if (TableNames) return
    } catch {
      /* empty */
    }
    await sleep(1000)
  }
}

setup('wait for DynamoDB to be up', async () => {
  setup.setTimeout(60000)
  await waitForConnection(
    new DynamoDBClient({
      region: 'us-east-1',
      endpoint: 'http://localhost:8000',
      credentials: {
        accessKeyId: 'localDb',
        secretAccessKey: 'randomAnyString',
      },
    })
  )
})

setup('wait for OpenSearch to be up', async () => {
  setup.setTimeout(60000)
  await waitPort({ port: 9200, protocol: 'http', output: 'silent' })
})

setup('wait for web server to be up', async () => {
  setup.setTimeout(60000)
  await waitPort({ port: 3333, protocol: 'http', output: 'silent' })
})
