import { expect, test } from '@playwright/test'

/**
 * 组件冲突测试套件
 * 验证修复后的组件间协作是否正常
 */

test.describe('主题切换组件', () => {
    test('首页只显示一个主题切换按钮', async ({ page }) => {
        await page.goto('/')
        // 等待页面加载完成
        await page.waitForLoadState('networkidle')

        // 获取所有主题切换相关元素
        const themeButtons = await page.locator('.theme-switcher, .theme-toggle-container').count()
        expect(themeButtons).toBe(1)
    })

    test('文档页只显示 DocFloatingActions 中的主题切换', async ({ page }) => {
        await page.goto('/docs-center/')
        await page.waitForLoadState('networkidle')

        // 验证 DocFloatingActions 存在
        const fabGroup = await page.locator('.doc-fab-group').count()
        expect(fabGroup).toBe(1)

        // 验证没有独立的 ThemeSwitcher
        const themeSwitcher = await page.locator('.theme-switcher').count()
        expect(themeSwitcher).toBe(0)
    })

    test('主题切换按钮可点击且功能正常', async ({ page }) => {
        await page.goto('/')
        await page.waitForLoadState('networkidle')

        // 获取初始主题
        const initialTheme = await page.evaluate(() => {
            return document.documentElement.getAttribute('data-theme')
        })

        // 点击主题切换按钮
        await page.click('.theme-toggle')

        // 等待下拉菜单出现
        await page.waitForSelector('.theme-dropdown.active', { state: 'visible' })

        // 点击亮色模式
        await page.click('[data-mode="light"]')

        // 验证主题已切换
        const newTheme = await page.evaluate(() => {
            return document.documentElement.getAttribute('data-theme')
        })
        expect(newTheme).toBe('light')

        // 验证 localStorage 已更新
        const savedTheme = await page.evaluate(() => {
            return localStorage.getItem('huat-color-scheme')
        })
        expect(savedTheme).toBe('light')
    })
})

test.describe('进度条组件', () => {
    test('首页只显示 ScrollProgress', async ({ page }) => {
        await page.goto('/')
        await page.waitForLoadState('networkidle')

        // 验证 ScrollProgress 存在
        const scrollProgress = await page.locator('.scroll-progress').count()
        expect(scrollProgress).toBe(1)

        // 验证没有 ReadingProgress
        const readingProgress = await page.locator('.reading-progress-bar').count()
        expect(readingProgress).toBe(0)
    })

    test('文档页只显示 ReadingProgress', async ({ page }) => {
        await page.goto('/docs-center/')
        await page.waitForLoadState('networkidle')

        // 验证 ReadingProgress 存在
        const readingProgress = await page.locator('.reading-progress-bar').count()
        expect(readingProgress).toBe(1)

        // 验证没有 ScrollProgress
        const scrollProgress = await page.locator('.scroll-progress').count()
        expect(scrollProgress).toBe(0)
    })

    test('滚动时进度条会更新', async ({ page }) => {
        await page.goto('/docs-center/')
        await page.waitForLoadState('networkidle')

        // 获取初始进度
        const initialWidth = await page.evaluate(() => {
            const fill = document.querySelector('.reading-progress-fill') as HTMLElement
            return fill?.style.width || '0%'
        })

        // 滚动到页面底部
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

        // 等待滚动完成
        await page.waitForTimeout(100)

        // 获取滚动后的进度
        const scrolledWidth = await page.evaluate(() => {
            const fill = document.querySelector('.reading-progress-fill') as HTMLElement
            return fill?.style.width || '0%'
        })

        // 验证进度增加了
        expect(parseFloat(scrolledWidth)).toBeGreaterThan(parseFloat(initialWidth))
    })
})

test.describe('z-index 层级管理', () => {
    test('浮动按钮层级高于内容但低于模态框', async ({ page }) => {
        await page.goto('/')
        await page.waitForLoadState('networkidle')

        // 获取各元素的 z-index
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

        // 验证 z-index 使用了 CSS 变量
        expect(zIndices.themeSwitcher).toBe('1000')
        expect(zIndices.particleCanvas).toBe('1')
        expect(zIndices.mobileNav).toBe('100')
    })

    test('灯箱组件层级最高', async ({ page }) => {
        await page.goto('/docs-center/')
        await page.waitForLoadState('networkidle')

        // 获取灯箱 z-index
        const lightboxZIndex = await page.evaluate(() => {
            const lightbox = document.querySelector('.lightbox') as HTMLElement
            return lightbox ? getComputedStyle(lightbox).zIndex : null
        })

        // 验证灯箱层级为 10000
        expect(lightboxZIndex).toBe('10000')
    })
})

test.describe('浮动按钮位置', () => {
    test('首页浮动按钮不重叠', async ({ page }) => {
        await page.goto('/')
        await page.waitForLoadState('networkidle')

        // 滚动页面使返回顶部按钮可见
        await page.evaluate(() => window.scrollTo(0, 500))
        await page.waitForTimeout(100)

        // 获取各按钮位置
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

        // 验证位置不重叠（垂直方向有间距）
        if (positions.themeSwitcher && positions.backToTop) {
            const verticalDistance = Math.abs(
                positions.themeSwitcher.bottom - positions.backToTop.bottom
            )
            expect(verticalDistance).toBeGreaterThanOrEqual(60) // 至少 60px 间距
        }
    })

    test('文档页浮动按钮位置正确', async ({ page }) => {
        await page.goto('/docs-center/')
        await page.waitForLoadState('networkidle')

        // 获取浮动按钮组位置
        const fabPosition = await page.evaluate(() => {
            const fabGroup = document.querySelector('.doc-fab-group') as HTMLElement
            return fabGroup
                ? {
                      bottom: parseInt(getComputedStyle(fabGroup).bottom),
                      right: parseInt(getComputedStyle(fabGroup).right),
                  }
                : null
        })

        // 验证位置正确
        expect(fabPosition).not.toBeNull()
        expect(fabPosition?.bottom).toBe(32) // 2rem = 32px
        expect(fabPosition?.right).toBe(32) // 2rem = 32px
    })
})
