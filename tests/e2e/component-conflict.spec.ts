import { expect, test } from '@playwright/test'

/**
 * 组件冲突测试套件
 * 验证修复后的组件间协作是否正常（按页面合并，单页多断言）
 */

test.describe('首页组件协作', () => {
    test('主题切换、进度条、层级与浮动位置一次验证', async ({ page }) => {
        await page.goto('/')
        await page.waitForLoadState('networkidle')

        // 主题按钮唯一，ScrollProgress 唯一且无 ReadingProgress
        expect(await page.locator('.theme-switcher, .theme-toggle-container').count()).toBe(1)
        expect(await page.locator('.scroll-progress').count()).toBe(1)
        expect(await page.locator('.reading-progress-bar').count()).toBe(0)

        // 点击切换主题并持久化
        const readTheme = () =>
            page.evaluate(() => document.documentElement.getAttribute('data-theme') || 'dark')
        const initialTheme = await readTheme()
        await page.click('.theme-toggle')
        await expect.poll(readTheme).not.toBe(initialTheme)
        const newTheme = await readTheme()
        expect(await page.evaluate(() => localStorage.getItem('huat-color-scheme'))).toBe(newTheme)

        // 键盘 Enter 切回
        await page.locator('.theme-toggle').focus()
        await page.keyboard.press('Enter')
        await expect.poll(readTheme).not.toBe(newTheme)

        // 长按打开主题色面板并保存颜色
        const toggle = page.locator('.theme-toggle')
        const box = await toggle.boundingBox()
        expect(box).not.toBeNull()
        await page.mouse.move(
            (box?.x ?? 0) + (box?.width ?? 0) / 2,
            (box?.y ?? 0) + (box?.height ?? 0) / 2
        )
        await page.mouse.down()
        await page.waitForTimeout(450)
        await expect(page.locator('.theme-dropdown[data-open="true"]')).toBeVisible()
        await page.mouse.up()
        await page.click('.color-option[data-color="#2ecc71"]')
        await expect(page.locator('.theme-dropdown[data-open="true"]')).toHaveCount(0)
        expect(await page.evaluate(() => localStorage.getItem('huat-theme-color'))).toBe('#2ecc71')

        // z-index 层级
        const zIndices = await page.evaluate(() => {
            const themeSwitcher = document.querySelector('.theme-switcher') as HTMLElement
            const particleCanvas = document.querySelector('.particle-canvas') as HTMLElement
            const mobileNav = document.querySelector('.mobile-nav-bar') as HTMLElement

            return {
                themeSwitcher: themeSwitcher ? getComputedStyle(themeSwitcher).zIndex : null,
                particleCanvas: particleCanvas ? getComputedStyle(particleCanvas).zIndex : null,
                mobileNav: mobileNav ? getComputedStyle(mobileNav).zIndex : null,
            }
        })
        expect(zIndices.themeSwitcher).toBe('1000')
        expect(zIndices.particleCanvas).toBe('1')
        expect(zIndices.mobileNav).toBe('100')

        // 浮动按钮不重叠
        await page.evaluate(() => window.scrollTo(0, 500))
        await page.waitForTimeout(100)
        const positions = await page.evaluate(() => {
            const themeSwitcher = document.querySelector('.theme-switcher') as HTMLElement
            const backToTop = document.querySelector('.back-to-top') as HTMLElement

            return {
                themeSwitcher: themeSwitcher
                    ? {
                          bottom: parseInt(getComputedStyle(themeSwitcher).bottom),
                          right: parseInt(getComputedStyle(themeSwitcher).right),
                      }
                    : null,
                backToTop: backToTop
                    ? {
                          bottom: parseInt(getComputedStyle(backToTop).bottom),
                          right: parseInt(getComputedStyle(backToTop).right),
                      }
                    : null,
            }
        })
        if (positions.themeSwitcher && positions.backToTop) {
            const verticalDistance = Math.abs(
                positions.themeSwitcher.bottom - positions.backToTop.bottom
            )
            expect(verticalDistance).toBeGreaterThanOrEqual(60) // 至少 60px 间距
        }
    })
})

test.describe('文档页组件协作', () => {
    test('浮动组、进度条、灯箱层级与位置一次验证', async ({ page }) => {
        await page.goto('/docs-center/')
        await page.waitForLoadState('networkidle')

        // DocFloatingActions 唯一且无独立 ThemeSwitcher；ReadingProgress 唯一且无 ScrollProgress
        expect(await page.locator('.doc-fab-group').count()).toBe(1)
        expect(await page.locator('.theme-switcher').count()).toBe(0)
        expect(await page.locator('.reading-progress-bar').count()).toBe(1)
        expect(await page.locator('.scroll-progress').count()).toBe(0)

        // 滚动时进度条更新
        const readWidth = () =>
            page.evaluate(() => {
                const fill = document.querySelector('.reading-progress-fill') as HTMLElement
                return fill?.style.width || '0%'
            })
        const initialWidth = await readWidth()
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
        await page.waitForTimeout(100)
        const scrolledWidth = await readWidth()
        expect(parseFloat(scrolledWidth)).toBeGreaterThan(parseFloat(initialWidth))

        // 灯箱层级最高
        const lightboxZIndex = await page.evaluate(() => {
            const lightbox = document.querySelector('.lightbox') as HTMLElement
            return lightbox ? getComputedStyle(lightbox).zIndex : null
        })
        expect(lightboxZIndex).toBe('10000')

        // 浮动按钮组位置
        const fabPosition = await page.evaluate(() => {
            const fabGroup = document.querySelector('.doc-fab-group') as HTMLElement
            return fabGroup
                ? {
                      bottom: parseInt(getComputedStyle(fabGroup).bottom),
                      right: parseInt(getComputedStyle(fabGroup).right),
                  }
                : null
        })
        expect(fabPosition).not.toBeNull()
        expect(fabPosition?.bottom).toBe(32) // 2rem = 32px
        expect(fabPosition?.right).toBe(32) // 2rem = 32px
    })
})
