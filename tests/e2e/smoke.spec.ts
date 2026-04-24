import { expect, test } from '@playwright/test'

test('首页可访问', async ({ page }) => {
    const response = await page.goto('/')
    expect(response?.status()).toBe(200)
    await expect(page).toHaveTitle(/HUAT FSAC/)
    await expect(page.locator('.hero-heading')).toContainText('HUAT FSAC')
    await expect(page.locator('.hero-sub')).toContainText('方程式赛车队')
    await expect(page.locator('.hero-cta')).toContainText('开始探索')
    await expect(page.locator('main')).not.toContainText('页面未找到')
})

test('英文首页可访问', async ({ page }) => {
    const response = await page.goto('/en/')
    expect(response?.status()).toBe(200)
    await expect(page.locator('.hero-heading')).toContainText('HUAT FSAC')
    await expect(page.locator('.hero-sub')).toContainText('Formula Student')
    await expect(page.locator('.hero-cta')).toContainText('Start Exploring')
    await expect(page.locator('main')).not.toContainText('Page not found')
})

test('文档页可访问', async ({ page }) => {
    await page.goto('/docs-center/')
    await expect(page.locator('h1#_top')).toContainText('文档中心')
})

test('英文文档中心可访问', async ({ page }) => {
    await page.goto('/en/docs-center/')
    await expect(page.locator('h1#_top')).toContainText('Docs Center')
})

test('英文 onboarding 页面可访问', async ({ page }) => {
    await page.goto('/en/docs-center/onboarding/')
    await expect(page.locator('h1#_top')).toContainText('Onboarding')
})

test('英文新闻页可访问', async ({ page }) => {
    await page.goto('/en/news/new-car-development/')
    await expect(page.locator('h1#_top')).toContainText(
        'Development Begins for the Next-Generation Race Car'
    )
})

test('英文 C++ 调试指南可访问', async ({ page }) => {
    await page.goto('/en/archive/general/vsc-c-c-dev-and-debug/')
    await expect(page.locator('h1#_top')).toContainText(
        'C/C++ Development and Debugging with VS Code'
    )
})

test('搜索入口存在', async ({ page }) => {
    await page.goto('/docs-center/')
    await expect(
        page.locator('button[aria-label*="Search"], button[aria-label*="搜索"]').first()
    ).toBeVisible()
})
