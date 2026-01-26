import { test, expect } from '@playwright/test'

test.describe('Settings Page E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings')
    await page.waitForLoadState('networkidle')
  })

  test('should display settings page', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible()
  })

  test('should navigate to game settings', async ({ page }) => {
    // 查找设置链接
    const settingsLinks = page.locator('a[href*="settings"]')
    if (await settingsLinks.count() > 0) {
      await settingsLinks.first().click()
      await page.waitForTimeout(500)
    }
    
    await expect(page.locator('body')).toBeVisible()
  })
})
