import { expect, test } from '@playwright/test'

test.beforeAll(async ({ page }) => {
  await page.goto('/circulars')
  await page.waitForSelector('#query')
})

test.describe('Circulars archive page', () => {
  test('responds to changes in the number of results per page', async ({
    page,
  }) => {
    test.slow()
    await page.goto('/circulars')
    for (const expectedResultsPerPage of [10, 20]) {
      const locator = page.getByTestId('Select')
      await expect(locator).toBeVisible()
      await locator.click()
      await locator.selectOption(`${expectedResultsPerPage} / page`)
      await page.waitForFunction(
        (n) =>
          document.getElementsByTagName('ol')[0].getElementsByTagName('li')
            .length === n,
        expectedResultsPerPage
      )
    }
  })

  test('search is functional via mouse click', async ({ page }) => {
    test.slow()
    await page.goto('/circulars')
    await page.locator('#query').fill('GRB')
    await page.getByRole('button', { name: 'Search' }).click()
  })

  test('search is functional via keyboard input', async ({ page }) => {
    test.slow()
    await page.goto('/circulars')
    await page.locator('#query').fill('GRB')
    await page.getByTestId('textInput').press('Enter')
  })

  test('search finds query string in body of circular', async ({ page }) => {
    test.slow()
    await page.goto('/circulars?query=ATLAS23srq')
    await expect(
      page.locator('a[href="/circulars/34730?query=ATLAS23srq"]')
    ).toBeVisible()
  })

  test('search finds all results related to a specific object', async ({
    page,
  }) => {
    test.slow()
    await page.goto('/circulars?query=230812B')
    await page.waitForLoadState()
    await expect(page.locator('ol', { has: page.locator('li') })).toBeVisible()
    expect(await page.locator('ol > li').count()).toBe(64)
  })

  test('search finds no results for query with typo', async ({ page }) => {
    // this highlights this search behavior does not capture cases where there is a minor typo
    test.slow()
    await page.goto('/circulars?query=230812C')
    await page.waitForLoadState()
    await expect(
      page.locator('ol', { has: page.locator('li') })
    ).not.toBeVisible()
  })

  test('search finds results that contain exact string but not similar strings', async ({
    page,
  }) => {
    // This highlights the search returns limited results because it is looking for exact matches to the string
    // This should return many more results and include strings like 230812B
    test.slow()
    await page.goto('/circulars?query=230812')
    const orderedListLocator = page.locator('ol')
    const listItemLocator = orderedListLocator.locator('li')

    await expect(listItemLocator).toHaveCount(1)
  })
})
