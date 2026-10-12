import { expect, test } from '@playwright/test'

test.describe('无障碍与性能', () => {
    test('首页无障碍基线一次验证', async ({ page }) => {
        await page.goto('/')

        const lang = await page.locator('html').getAttribute('lang')
        expect(lang).toBeTruthy()

        const images = page.locator('img')
        const count = await images.count()
        for (let i = 0; i < Math.min(count, 10); i++) {
            const alt = await images.nth(i).getAttribute('alt')
            // alt 可以为空字符串（装饰性图片）但不应为 null
            expect(alt).not.toBeNull()
        }

        // 页面应有 main 区域
        await expect(page.locator('main')).toBeVisible()

        // Tab 到第一个可聚焦元素
        await page.keyboard.press('Tab')
        await expect(page.locator(':focus')).toBeVisible()

        // 主题切换不应导致水平溢出
        const initialWidth = await page.evaluate(() => document.body.scrollWidth)
        const themeToggle = page
            .locator('[data-theme-toggle], button[aria-label*="theme" i]')
            .first()
        if (await themeToggle.isVisible()) {
            await themeToggle.click()
            await page.waitForTimeout(300)
            const newWidth = await page.evaluate(() => document.body.scrollWidth)
            expect(newWidth).toBeLessThanOrEqual(initialWidth + 20)
        }
    })
})
