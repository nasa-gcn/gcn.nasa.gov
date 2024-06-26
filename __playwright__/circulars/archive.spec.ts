import { expect, test } from '@playwright/test'

test.describe('Circulars archive page', () => {
  test('responds to changes in the number of results per page', async ({
    page,
  }) => {
    await page.goto('/circulars')
    for (const expectedResultsPerPage of [10, 20]) {
      await page
        .getByTitle('Number of results per page')
        .selectOption({ label: `${expectedResultsPerPage} / page` })
      await page.waitForFunction(
        (n) =>
          document.getElementsByTagName('ol')[0].getElementsByTagName('li')
            .length === n,
        expectedResultsPerPage
      )
    }
  })

  test('search is functional via mouse click', async ({ page }) => {
    await page.goto('/circulars')
    await page.locator('#query').fill('GRB')
    await page.getByRole('button', { name: 'Search' }).click()
  })

  test('search is functional via keyboard input', async ({ page }) => {
    await page.goto('/circulars')
    await page.locator('#query').fill('GRB')
    await page.getByTestId('textInput').press('Enter')
  })

  test('search finds query string in body of circular', async ({ page }) => {
    await page.goto('/circulars?query=ATLAS23srq')
    await expect(
      page.locator('a[href="/circulars/34730?query=ATLAS23srq"]')
    ).toBeVisible()
  })
})
