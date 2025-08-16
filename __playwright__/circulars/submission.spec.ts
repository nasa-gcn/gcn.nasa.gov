import { DynamoDBClient, ListTablesCommand } from '@aws-sdk/client-dynamodb'
import { sleep } from '@nasa-gcn/architect-plugin-utils'
import { expect, test } from '@playwright/test'

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

test.beforeAll(async () => {
  test.setTimeout(60000)

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

test.beforeEach(async ({ page }) => {
  await page.goto('/circulars')
  await page.waitForSelector('#query')
})

test.describe('Circulars submission page', () => {
  test('posts a submission successfully ', async ({ page }) => {
    test.slow()
    const timeStamp = Date.now()
    await page.goto('/circulars/new')
    await page.locator('#subject').clear()
    await page
      .locator('#subject')
      .fill(`GRB123456a Submission Playwright Test Subject ${timeStamp}`)
    await page
      .getByTestId('textarea')
      .fill('GRB Submission Playwright Test Body')
    await page.getByRole('button', { name: 'Send' }).click({ timeout: 10000 })
    await page.waitForURL('/circulars?index')
    await expect(
      page.getByRole('link', {
        name: `GRB123456a Submission Playwright Test Subject ${timeStamp}`,
      })
    ).toBeVisible()
  })
})
