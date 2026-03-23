import { expect, test } from '@playwright/test'

test.describe('国际化切换功能', () => {
    test.describe('语言切换器基本功能', () => {
        test('语言切换器在首页可见', async ({ page }) => {
            await page.goto('/')
            await page.waitForLoadState('networkidle')

            const languageSwitcher = page.locator('.language-switcher')
            await expect(languageSwitcher).toBeVisible()

            const languageToggle = page.locator('.language-toggle')
            await expect(languageToggle).toBeVisible()
        })

        test('语言切换器点击后显示语言菜单', async ({ page }) => {
            await page.goto('/')
            await page.waitForLoadState('networkidle')

            const languageToggle = page.locator('.language-toggle')
            const languageMenu = page.locator('.language-menu')

            await expect(languageMenu).not.toHaveClass(/open/)

            await languageToggle.click()
            await expect(languageMenu).toHaveClass(/open/)

            await languageToggle.click()
            await expect(languageMenu).not.toHaveClass(/open/)
        })

        test('语言菜单显示中文和英文两个选项', async ({ page }) => {
            await page.goto('/')
            await page.waitForLoadState('networkidle')

            const languageToggle = page.locator('.language-toggle')
            await languageToggle.click()

            const languageOptions = page.locator('.language-option')
            await expect(languageOptions).toHaveCount(2)

            const zhOption = page.locator('.language-option[data-locale="zh"]')
            const enOption = page.locator('.language-option[data-locale="en"]')

            await expect(zhOption).toBeVisible()
            await expect(enOption).toBeVisible()
            await expect(zhOption).toContainText('中文')
            await expect(enOption).toContainText('English')
        })

        test('点击菜单外部可以关闭语言菜单', async ({ page }) => {
            await page.goto('/')
            await page.waitForLoadState('networkidle')

            const languageToggle = page.locator('.language-toggle')
            const languageMenu = page.locator('.language-menu')

            await languageToggle.click()
            await expect(languageMenu).toHaveClass(/open/)

            await page.click('body', { position: { x: 10, y: 10 } })
            await expect(languageMenu).not.toHaveClass(/open/)
        })

        test('按 ESC 键可以关闭语言菜单', async ({ page }) => {
            await page.goto('/')
            await page.waitForLoadState('networkidle')

            const languageToggle = page.locator('.language-toggle')
            const languageMenu = page.locator('.language-menu')

            await languageToggle.click()
            await expect(languageMenu).toHaveClass(/open/)

            await page.keyboard.press('Escape')
            await expect(languageMenu).not.toHaveClass(/open/)
        })
    })

    test.describe('语言切换导航', () => {
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

        test('从英文文档页面切换回中文文档页面', async ({ page }) => {
            await page.goto('/en/docs-center/')
            await page.waitForLoadState('networkidle')

            const languageToggle = page.locator('.language-switcher .language-toggle')
            await languageToggle.click()

            const zhOption = page.locator('.language-option[data-locale="zh"]')
            await zhOption.click()

            await page.waitForURL((url) => url.pathname === '/docs-center/')
            expect(page.url()).not.toContain('/en/')
            expect(page.url()).toContain('/docs-center/')
        })
    })

    test.describe('语言偏好持久化', () => {
        test('切换语言后保存到 localStorage', async ({ page }) => {
            await page.goto('/')
            await page.waitForLoadState('networkidle')

            await page.evaluate(() => localStorage.removeItem('preferred-locale'))

            const languageToggle = page.locator('.language-toggle')
            await languageToggle.click()

            const enOption = page.locator('.language-option[data-locale="en"]')
            await enOption.click()

            await page.waitForURL(/\/en\//)

            const preferredLocale = await page.evaluate(() =>
                localStorage.getItem('preferred-locale')
            )
            expect(preferredLocale).toBe('en')
        })

        test('切换回中文后更新 localStorage', async ({ page }) => {
            await page.goto('/en/')
            await page.waitForLoadState('networkidle')

            await page.evaluate(() => localStorage.setItem('preferred-locale', 'en'))

            const languageToggle = page.locator('.language-toggle')
            await languageToggle.click()

            const zhOption = page.locator('.language-option[data-locale="zh"]')
            await zhOption.click()

            await page.waitForURL((url) => !url.pathname.startsWith('/en/'))

            const preferredLocale = await page.evaluate(() =>
                localStorage.getItem('preferred-locale')
            )
            expect(preferredLocale).toBe('zh')
        })
    })

    test.describe('语言切换与其他组件共存', () => {
        test('语言切换后主题切换按钮仍然可见', async ({ page }) => {
            await page.goto('/')
            await page.waitForLoadState('networkidle')

            const themeSwitcherBefore = page.locator('.theme-switcher')
            await expect(themeSwitcherBefore).toBeVisible()

            const languageToggle = page.locator('.language-toggle')
            await languageToggle.click()

            const enOption = page.locator('.language-option[data-locale="en"]')
            await enOption.click()

            await page.waitForURL(/\/en\//)

            const themeSwitcherAfter = page.locator('.theme-switcher')
            await expect(themeSwitcherAfter).toBeVisible()
        })

        test('语言切换后主题色保持不变', async ({ page }) => {
            await page.goto('/')
            await page.waitForLoadState('networkidle')

            const initialColor = await page.evaluate(() => localStorage.getItem('huat-theme-color'))

            const languageToggle = page.locator('.language-toggle')
            await languageToggle.click()

            const enOption = page.locator('.language-option[data-locale="en"]')
            await enOption.click()

            await page.waitForURL(/\/en\//)

            const colorAfterSwitch = await page.evaluate(() =>
                localStorage.getItem('huat-theme-color')
            )
            expect(colorAfterSwitch).toBe(initialColor)
        })

        test('语言切换后主题模式保持不变', async ({ page }) => {
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
})
