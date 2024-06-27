import { expect, test as setup } from '@playwright/test'

const authFile = '__playwright__/.auth/user.json'

const testUsername = 'TEST_USERNAME'
const testPassword = 'TEST_PASSWORD'

setup('authenticate', async ({ page }) => {
  await page.goto('/login')
  await page.getByPlaceholder('Enter any login').fill(testUsername)
  await page.getByPlaceholder('and password').fill(testPassword)
  await page.getByRole('button', { name: 'Sign-in' }).click()
  await page.waitForURL('/')
  await expect(
    page.getByRole('button', { name: 'user@example.com' })
  ).toBeVisible()
  await page.context().storageState({ path: authFile })
})
