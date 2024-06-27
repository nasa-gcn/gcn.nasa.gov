import { test } from '@playwright/test'

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
})
