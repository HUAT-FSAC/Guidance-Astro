import { expect, test } from '@playwright/test'

/**
 * #168 回归守卫：首页的 scroll reveal 必须是「默认可见 + JS 增强」。
 *
 * 此前的实现把 `.reveal-upon-scroll` 的 CSS 默认态写成 `opacity: 0`，仅靠 JS 打上
 * `data-visible="true"` 才显现 —— 无 JS / 脚本异常 / 观察器不触发时，首页大片内容会
 * 永久停留在不可见状态（实测线上服务端 HTML 里 25 个该类元素都没有 data-visible）。
 *
 * 注意：Playwright 的 toBeVisible() 认为 opacity:0 的元素「可见」（只查尺寸与
 * visibility/display），因此本用例必须断言 computed opacity 本身。
 */
test.describe('scroll reveal 渐进增强（禁用 JS）', () => {
    test('无 JS 时首页 reveal 区块与贡献者/分组卡片仍可见', async ({ browser }) => {
        const context = await browser.newContext({ javaScriptEnabled: false })
        const page = await context.newPage()

        await page.goto('/')

        // 通用区块：服务端 HTML 默认态就应可读，不依赖脚本
        await expect(page.locator('.reveal-upon-scroll').first()).toHaveCSS('opacity', '1')

        // 贡献者卡片与核心模块分组卡片（issue 中「显示不全」的两处）
        for (const selector of ['.contributor-card', '.group-card']) {
            const card = page.locator(selector).first()
            await expect(card).toHaveCSS('opacity', '1')
            // 内容真的在页面上，而不是只剩一个盒子
            await expect(card).toContainText(/\S/)
        }

        await context.close()
    })

    test('启用 JS 时离屏区块仍走渐显（不回归动效意图）', async ({ page }) => {
        await page.goto('/')

        // 页首以下的 reveal 元素：脚本接管后应带 data-visible 属性（渐进增强的证据）
        const revealed = page.locator('.reveal-upon-scroll[data-visible]')
        await expect(revealed.first()).toBeAttached()
    })
})
