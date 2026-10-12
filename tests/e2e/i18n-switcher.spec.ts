import { expect, test } from '@playwright/test'

test.describe('国际化切换功能', () => {
    test('语言切换器组件交互（单页多断言）', async ({ page }) => {
        await page.goto('/')
        await page.waitForLoadState('networkidle')

        const languageSwitcher = page.locator('.language-switcher')
        await expect(languageSwitcher).toBeVisible()

        const languageToggle = page.locator('.language-toggle')
        const languageMenu = page.locator('.language-menu')
        await expect(languageToggle).toBeVisible()

        // 开关菜单
        await expect(languageMenu).not.toHaveAttribute('data-open', 'true')
        await languageToggle.click()
        await expect(languageMenu).toHaveAttribute('data-open', 'true')

        // 两个选项
        const languageOptions = page.locator('.language-option')
        await expect(languageOptions).toHaveCount(2)
        const zhOption = page.locator('.language-option[data-locale="zh"]')
        const enOption = page.locator('.language-option[data-locale="en"]')
        await expect(zhOption).toBeVisible()
        await expect(enOption).toBeVisible()
        await expect(zhOption).toContainText('中文')
        await expect(enOption).toContainText('English')

        // 外部点击关闭
        await page.click('body', { position: { x: 10, y: 10 } })
        await expect(languageMenu).not.toHaveAttribute('data-open', 'true')

        // ESC 关闭
        await languageToggle.click()
        await expect(languageMenu).toHaveAttribute('data-open', 'true')
        await page.keyboard.press('Escape')
        await expect(languageMenu).not.toHaveAttribute('data-open', 'true')
    })

    test('从中文首页切换到英文首页', async ({ page }) => {
        await page.goto('/')
        await page.waitForLoadState('networkidle')

        const languageToggle = page.locator('.language-toggle')
        await languageToggle.click()

        const enOption = page.locator('.language-option[data-locale="en"]')
        await enOption.click()

        await page.waitForURL(/\/en\//)
        expect(page.url()).toContain('/en/')
    })

    test('从英文首页切换回中文首页', async ({ page }) => {
        await page.goto('/en/')
        await page.waitForLoadState('networkidle')

        const languageToggle = page.locator('.language-toggle')
        await languageToggle.click()

        const zhOption = page.locator('.language-option[data-locale="zh"]')
        await zhOption.click()

        await page.waitForURL((url) => !url.pathname.startsWith('/en/'))
        expect(page.url()).not.toContain('/en/')
    })

    test('在文档页面切换语言保持在文档页面', async ({ page }) => {
        await page.goto('/docs-center/')
        await page.waitForLoadState('networkidle')

        const languageToggle = page.locator('.language-switcher .language-toggle')
        await languageToggle.click()

        const enOption = page.locator('.language-option[data-locale="en"]')
        await enOption.click()

        await page.waitForURL(/\/en\/docs-center\//)
        expect(page.url()).toContain('/en/docs-center/')
    })

    test('语言切换后主题模式保持不变', async ({ page }) => {
        // 主题初始化跨语言导航的持久化是真正的集成行为（单测覆盖不到 reload 链路）
        await page.goto('/')
        await page.waitForLoadState('networkidle')

        const initialTheme = await page.evaluate(() =>
            document.documentElement.getAttribute('data-theme')
        )

        const languageToggle = page.locator('.language-toggle')
        await languageToggle.click()

        const enOption = page.locator('.language-option[data-locale="en"]')
        await enOption.click()

        await page.waitForURL(/\/en\//)

        const themeAfterSwitch = await page.evaluate(() =>
            document.documentElement.getAttribute('data-theme')
        )
        expect(themeAfterSwitch).toBe(initialTheme)
    })
})
