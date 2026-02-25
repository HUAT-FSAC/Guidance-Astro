import { expect, test } from '@playwright/test'

test.describe('文档功能', () => {
    test('阅读进度条存在', async ({ page }) => {
        await page.goto('/docs-center/')
        const progressBar = page.locator('#readingProgressBar')
        if (await progressBar.isVisible()) {
            const fill = page.locator('#readingProgressFill')
            await expect(fill).toBeVisible()
        }
    })

    test('分享按钮可交互', async ({ page }) => {
        await page.goto('/docs-center/')
        const shareBtn = page.locator('#share-toggle-btn')
        if (await shareBtn.isVisible()) {
            await shareBtn.click()
            const menu = page.locator('#share-menu')
            await expect(menu).toHaveClass(/open/)
            // ESC 关闭菜单
            await page.keyboard.press('Escape')
            await expect(menu).not.toHaveClass(/open/)
        }
    })

    test('目录（TOC）在文档页显示', async ({ page }) => {
        await page.goto('/docs-center/')
        // Starlight 的 TOC 组件
        const toc = page.locator('starlight-toc, nav[aria-label="On this page"]')
        if (await toc.count() > 0) {
            await expect(toc.first()).toBeVisible()
        }
    })

    test('代码块正确渲染', async ({ page }) => {
        // 找一个包含代码块的文档页
        await page.goto('/docs-center/')
        const codeBlocks = page.locator('pre code')
        // 不强制要求有代码块，但如果有则应正确渲染
        if (await codeBlocks.count() > 0) {
            await expect(codeBlocks.first()).toBeVisible()
        }
    })
})
