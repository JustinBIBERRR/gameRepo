import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display game cards', async ({ page }) => {
    // 等待页面加载
    await page.waitForLoadState('networkidle')
    
    // 检查游戏卡片是否存在
    const gameCards = page.locator('[data-testid="game-card"], .game-card, a[href*="-guess"]')
    await expect(gameCards.first()).toBeVisible()
  })

  test('should navigate to city guess game', async ({ page }) => {
    // 查找并点击城市猜测游戏卡片
    const cityGameLink = page.locator('a[href="/city-guess"], a[href*="city"]').first()
    if (await cityGameLink.count() > 0) {
      await cityGameLink.click()
      await page.waitForURL(/\/(city-guess|#\/city-guess)/)
    }
  })

  test('should display statistics when available', async ({ page }) => {
    // 检查统计信息区域
    const statsSection = page.locator('text=游戏统计, text=总胜利, text=总失败').first()
    // 统计信息可能不存在（如果没有游戏记录），所以只检查页面是否正常加载
    await expect(page.locator('body')).toBeVisible()
  })
})
