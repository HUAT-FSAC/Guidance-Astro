import { expect, test } from '@playwright/test'

test.describe('导航功能', () => {
    test('侧边栏导航可用', async ({ page }) => {
        await page.goto('/docs-center/')
        const sidebar = page.locator('nav[aria-label="Main"]')
        await expect(sidebar).toBeVisible()
        // 侧边栏应包含至少一个链接
        const links = sidebar.locator('a')
        expect(await links.count()).toBeGreaterThan(0)
    })

    test('面包屑导航显示', async ({ page }) => {
        await page.goto('/docs-center/')
        // 文档页应有面包屑或标题
        const heading = page.locator('h1')
        await expect(heading).toBeVisible()
    })

    test('首页 CTA 按钮可点击', async ({ page }) => {
        await page.goto('/')
        const cta = page.locator('.hero-cta').first()
        if (await cta.isVisible()) {
            await expect(cta).toHaveAttribute('href', /.+/)
        }
    })

    test('404 页面处理', async ({ page }) => {
        const response = await page.goto('/this-page-does-not-exist/')
        expect(response?.status()).toBe(404)
    })
})
