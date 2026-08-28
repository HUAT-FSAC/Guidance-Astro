import { expect, test } from '@playwright/test'

test.describe('移动端头部回归', () => {
    test('390px 视口下桌面导航隐藏、移动端导航唯一可见且无重叠', async ({ page }) => {
        await page.setViewportSize({ width: 390, height: 844 })
        await page.goto('/')
        await page.waitForLoadState('networkidle')

        const headerNav = page.locator('.header-nav')
        const mobileBar = page.locator('.mobile-nav-bar')
        const logo = page.locator('.header-logo')
        const title = page.locator('.header-title')

        // 桌面导航在移动端必须隐藏（修复双导航并存 Bug）
        await expect(headerNav).toBeHidden()
        await expect(mobileBar).toBeVisible()

        // logo 与标题不应重叠：检查标题左边缘在 logo 右边缘之后
        const logoBox = await logo.boundingBox()
        const titleBox = await title.boundingBox()
        expect(logoBox).not.toBeNull()
        expect(titleBox).not.toBeNull()
        if (logoBox && titleBox) {
            expect(titleBox.x).toBeGreaterThan(logoBox.x + logoBox.width - 5)
            // 标题不应被裁切到视口外
            expect(titleBox.x + titleBox.width).toBeLessThanOrEqual(390)
        }
    })

    test('375px 视口下头部无裁切', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 })
        await page.goto('/')
        await page.waitForLoadState('networkidle')

        const header = page.locator('.custom-header')
        const mobileBar = page.locator('.mobile-nav-bar')
        await expect(header).toBeVisible()
        await expect(mobileBar).toBeVisible()

        // 视口 375px 时不应出现横向滚动
        const hasHorizontalScroll = await page.evaluate(
            () => document.documentElement.scrollWidth > document.documentElement.clientWidth
        )
        expect(hasHorizontalScroll).toBe(false)
    })

    test('桌面端 1440px 视口下桌面导航可见、移动端导航隐藏', async ({ page }) => {
        await page.setViewportSize({ width: 1440, height: 900 })
        await page.goto('/')
        await page.waitForLoadState('networkidle')

        await expect(page.locator('.header-nav')).toBeVisible()
        await expect(page.locator('.mobile-nav-bar')).toBeHidden()
    })
})
