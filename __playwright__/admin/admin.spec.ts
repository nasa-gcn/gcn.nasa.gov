import { expect, test } from '@playwright/test'

test.describe('Example Admin Test Suite', () => {
  test('has title', async ({ page }) => {
    await page.goto('/')

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle('GCN - General Coordinates Network')
  })
})
