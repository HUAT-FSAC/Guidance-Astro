import { expect, test } from '@playwright/test'

test('首页可访问', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/FSAC AST Docs|HUAT FSAC/)
    await expect(page.locator('a.site-title')).toBeVisible()
})

test('文档页可访问', async ({ page }) => {
    await page.goto('/docs-center/')
    await expect(page.locator('h1')).toContainText('文档中心')
})

test('搜索入口存在', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('button[aria-label="Search"]').first()).toBeVisible()
})
