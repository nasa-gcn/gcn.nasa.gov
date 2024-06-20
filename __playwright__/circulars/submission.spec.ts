import { expect, test } from '@playwright/test'

test.describe('Circulars submission page', () => {
  test('posts a submission successfully ', async ({ page }) => {
    test.slow()
    await page.goto('/circulars/new')
    await page.locator('#subject').clear()
    await page
      .locator('#subject')
      .fill('GRB Submission Playwright Test Subject')
    await page
      .getByTestId('textarea')
      .fill('GRB Submission Playwright Test Body')
    await page.getByRole('button', { name: 'Send' }).click({ timeout: 10000 })
    await page.waitForURL('/circulars?index')
    await expect(
      page.getByRole('link', { name: 'GRB Submission Playwright' })
    ).toBeVisible()
  })
})
