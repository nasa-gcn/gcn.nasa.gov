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

  test('search finds all results related to a specific object', async ({
    page,
  }) => {
    await page.goto('/circulars?query=230812B')
    await page.waitForFunction(
      (n) =>
        document.getElementsByTagName('ol')[0].getElementsByTagName('li')
          .length >= n,
      64
    )
  })

  test('search finds no results for query with typo', async ({ page }) => {
    // this highlights this search behaviour does not capture cases where there is a minor typo
    await page.goto('/circulars?query=230812C')
    await page.waitForFunction(
      (n) =>
        document.getElementsByTagName('ol')[0].getElementsByTagName('li')
          .length === n,
      0
    )
  })

  test('search finds results that contain exact string but not similar strings', async ({
    page,
  }) => {
    // this highlights the search returns limited results because it is looking for exact matches to the string
    // this should return many more results and include strings like 230812B
    await page.goto('/circulars?query=230812')
    await page.waitForFunction(
      (n) =>
        document.getElementsByTagName('ol')[0].getElementsByTagName('li')
          .length === n,
      1
    )
  })
})
