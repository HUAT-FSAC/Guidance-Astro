import { expect, test } from '@playwright/test'

test.describe('无障碍与性能', () => {
    test('页面有正确的 lang 属性', async ({ page }) => {
        await page.goto('/')
        const lang = await page.locator('html').getAttribute('lang')
        expect(lang).toBeTruthy()
    })

    test('图片有 alt 属性', async ({ page }) => {
        await page.goto('/')
        const images = page.locator('img')
        const count = await images.count()
        for (let i = 0; i < Math.min(count, 10); i++) {
            const alt = await images.nth(i).getAttribute('alt')
            // alt 可以为空字符串（装饰性图片）但不应为 null
            expect(alt).not.toBeNull()
        }
    })

    test('主要 landmark 区域存在', async ({ page }) => {
        await page.goto('/')
        // 页面应有 main 区域
        const main = page.locator('main')
        await expect(main).toBeVisible()
    })

    test('键盘可聚焦到主要交互元素', async ({ page }) => {
        await page.goto('/')
        // Tab 到第一个可聚焦元素
        await page.keyboard.press('Tab')
        const focused = page.locator(':focus')
        await expect(focused).toBeVisible()
    })

    test('暗色/亮色主题切换不破坏布局', async ({ page }) => {
        await page.goto('/')
        // 获取初始视口尺寸下的 body 宽度
        const initialWidth = await page.evaluate(() => document.body.scrollWidth)

        // 尝试切换主题
        const themeToggle = page.locator('[data-theme-toggle], button[aria-label*="theme" i]').first()
        if (await themeToggle.isVisible()) {
            await themeToggle.click()
            await page.waitForTimeout(300)
            const newWidth = await page.evaluate(() => document.body.scrollWidth)
            // 主题切换不应导致水平溢出
            expect(newWidth).toBeLessThanOrEqual(initialWidth + 20)
        }
    })
})
