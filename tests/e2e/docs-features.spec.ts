import { expect, test } from '@playwright/test'

test.describe('文档功能', () => {
    test('文档中心进度条、分享与代码块一次验证', async ({ page }) => {
        await page.goto('/docs-center/')

        const progressBar = page.locator('#readingProgressBar')
        if (await progressBar.isVisible()) {
            const fill = page.locator('#readingProgressFill')
            await page.mouse.wheel(0, 300)
            await expect(fill).toBeVisible()
        }

        const shareBtn = page.locator('#share-toggle-btn')
        if (await shareBtn.isVisible()) {
            await shareBtn.click()
            const menu = page.locator('#share-menu')
            await expect(menu).toHaveClass(/open/)
            // ESC 关闭菜单
            await page.keyboard.press('Escape')
            await expect(menu).not.toHaveClass(/open/)
        }

        const codeBlocks = page.locator('pre code')
        // 不强制要求有代码块，但如果有则应正确渲染
        if ((await codeBlocks.count()) > 0) {
            await expect(codeBlocks.first()).toBeVisible()
        }
    })

    test('目录（TOC）在文档页显示', async ({ page }) => {
        // 流程与模板页标题充足（23 个 h2/h3），Starlight TOC 会渲染
        await page.goto('/docs-center/流程与模板/')
        // Starlight 的 TOC 组件
        const toc = page.locator('starlight-toc, nav[aria-label="On this page"]')
        await expect(toc.first()).toBeVisible()
    })
})
