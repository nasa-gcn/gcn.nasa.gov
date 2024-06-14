import { expect, test as setup } from '@playwright/test'
import dotenv from 'dotenv'

// Read from default ".env" file.
dotenv.config()

const authFile = '__playwright__/.auth/user.json'

const testUsername = process.env.TEST_USERNAME
const testPassword = process.env.TEST_PASSWORD

setup('authenticate', async ({ page }) => {
  // Perform authentication steps. Replace these actions with your own.
  if (!testUsername || !testPassword)
    throw new Error('Please define test account info')
  await page.goto('/login')
  await page.getByRole('textbox', { name: 'name@host.com' }).fill(testUsername)
  await page.getByRole('textbox', { name: 'Password' }).fill(testPassword)
  await page.getByRole('button', { name: 'submit' }).click()
  await page.waitForURL('/')
  await expect(page.getByRole('button', { name: testUsername })).toBeVisible()
  await page.context().storageState({ path: authFile })
})
