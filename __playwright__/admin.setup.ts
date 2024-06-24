import { expect, test as setup } from '@playwright/test'

const authFile = '__playwright__/.auth/adminUser.json'

const testAdminUsername = 'admin'
const testAdminPassword = 'TEST_PASSWORD'

setup('authenticate', async ({ page }) => {
  await page.goto('/login')
  await page.getByPlaceholder('Enter any login').fill(testAdminUsername)
  await page.getByPlaceholder('and password').fill(testAdminPassword)
  await page.getByRole('button', { name: 'Sign-in' }).click()
  await page.waitForURL('/')
  await expect(
    page.getByRole('button', { name: 'admin@example.com' })
  ).toBeVisible()
  await page.context().storageState({ path: authFile })
})
