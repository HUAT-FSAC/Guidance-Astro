import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

/**
 * 真实生产搜索 E2E（#262）：
 * 走 wrangler dev SSR（pnpm preview:ssr webServer）+ 构建产出的 dist/client/pagefind 索引，
 * 通过真实 Header Search UI（PagefindUI）执行双语正文词查询。
 * 这组用例必须能抓到「按钮可见但索引坏了」的旧缺陷——索引缺失时 PagefindUI
 * 拿不到 /pagefind/ 资源，查询返回空，下方所有结果断言都会失败。
 */

// 负例用稀有 CJK 字符：实测拉丁/数字串会被 Pagefind 按字符级拆分兜底匹配
// （'zqxjvwkbgpz' 命中正文的单字母 z），纯字母串做不了稳定负例
const NEGATIVE_QUERY = '雥龘'

function trackPagefindFailures(page: Page): string[] {
    const failures: string[] = []
    page.on('response', (response) => {
        if (response.url().includes('/pagefind/') && response.status() >= 400) {
            failures.push(`${response.status()} ${response.url()}`)
        }
    })
    page.on('requestfailed', (request) => {
        if (request.url().includes('/pagefind/')) failures.push(`requestfailed ${request.url()}`)
    })
    return failures
}

function trackSearchConsoleErrors(page: Page): string[] {
    const errors: string[] = []
    page.on('console', (message) => {
        if (
            message.type() === 'error' &&
            /pagefind|content security|CSP|wasm|worker/i.test(message.text())
        ) {
            errors.push(message.text())
        }
    })
    return errors
}

/** 打开搜索弹窗：桌面优先点真实按钮（覆盖鼠标入口），按钮不可见时用 Ctrl+K */
async function openSearchModal(page: Page): Promise<void> {
    const button = page.locator('site-search button[data-open-modal]').first()
    if (await button.isVisible().catch(() => false)) {
        await button.click()
    } else {
        await page.keyboard.press('Control+K')
    }
    await expect(page.locator('site-search .pagefind-ui__search-input').first()).toBeVisible({
        timeout: 30_000,
    })
}

async function searchFor(page: Page, query: string): Promise<void> {
    await page.locator('site-search .pagefind-ui__search-input').first().fill(query)
}

test.describe('站内搜索（#262 索引恢复）', () => {
    test('生产 Pagefind 入口资源可达，UI 初始化无相关网络/控制台错误', async ({ page }) => {
        const failures = trackPagefindFailures(page)
        const consoleErrors = trackSearchConsoleErrors(page)
        await page.goto('/')
        // PagefindUI 初始化后会在弹窗容器内渲染 .pagefind-ui 结构，等价于 pagefind.js 已加载执行
        await expect(page.locator('site-search .pagefind-ui').first()).toBeAttached({
            timeout: 30_000,
        })
        // 入口脚本与索引元数据作为真实生产资源直接可达
        expect((await page.request.get('/pagefind/pagefind.js')).status()).toBe(200)
        expect((await page.request.get('/pagefind/pagefind-entry.json')).status()).toBe(200)
        await page.waitForTimeout(1_000)
        expect(failures).toEqual([])
        expect(consoleErrors).toEqual([])
    })

    test('Ctrl+K 打开搜索，中文正文词 301 命中 /labs/ 并点击跳转', async ({ page }) => {
        const failures = trackPagefindFailures(page)
        await page.setViewportSize({ width: 1600, height: 900 })
        await page.goto('/')
        await page.keyboard.press('Control+K')
        await expect(page.locator('site-search .pagefind-ui__search-input').first()).toBeVisible({
            timeout: 30_000,
        })
        await searchFor(page, '301')
        const firstResult = page.locator('site-search .pagefind-ui__result-link').first()
        await expect(firstResult).toHaveAttribute('href', /\/labs\/$/, { timeout: 20_000 })
        // 正文 excerpt 高亮（正文词命中，而非仅标题）
        await expect(
            page.locator('site-search .pagefind-ui__result-excerpt mark').first()
        ).toContainText('301')
        await firstResult.click()
        await expect(page).toHaveURL(/\/labs\/$/)
        expect(failures).toEqual([])
    })

    test('英文正文词 odometry 命中 /en/join/，语言不混入中文 fallback', async ({ page }) => {
        const failures = trackPagefindFailures(page)
        await page.setViewportSize({ width: 1600, height: 900 })
        await page.goto('/en/')
        await page.keyboard.press('Control+K')
        await expect(page.locator('site-search .pagefind-ui__search-input').first()).toBeVisible({
            timeout: 30_000,
        })
        await searchFor(page, 'odometry')
        const resultLinks = page.locator('site-search .pagefind-ui__result-link')
        await expect(resultLinks.first()).toBeVisible({ timeout: 20_000 })
        // 相关度排序不保证目标页第一；断言结果集中包含 /en/join/ 且带正文高亮
        const hrefs = await resultLinks.evaluateAll((links) =>
            links.map((link) => link.getAttribute('href'))
        )
        expect(hrefs).toContain('/en/join/')
        const joinExcerpt = page
            .locator('site-search .pagefind-ui__result', {
                has: page.locator('a[href="/en/join/"]'),
            })
            .locator('.pagefind-ui__result-excerpt mark')
            .first()
        await expect(joinExcerpt).toContainText('odometry')
        // 中文页（/labs/）不应出现在英文查询结果里
        expect(hrefs).not.toContain('/labs/')
        await page.locator('site-search .pagefind-ui__result-link[href="/en/join/"]').click()
        await expect(page).toHaveURL(/\/en\/join\/$/)
        expect(failures).toEqual([])
    })
    test('真实英文文档（不同名 slug）正文词命中并跳转，真正 fallback 不入英文索引（#281）', async ({
        page,
    }) => {
        const failures = trackPagefindFailures(page)
        await page.setViewportSize({ width: 1600, height: 900 })
        await page.goto('/en/')
        await openSearchModal(page)

        // 真实英文文档 control-fundamentals 独特正文词 "VCU"
        await searchFor(page, 'VCU')
        const resultLinks = page.locator('site-search .pagefind-ui__result-link')
        await expect(resultLinks.first()).toBeVisible({ timeout: 20_000 })
        const hrefs = await resultLinks.evaluateAll((links) =>
            links.map((link) => link.getAttribute('href'))
        )
        expect(hrefs).toContain('/en/archive/2025/planning-control/control-fundamentals/')

        // 正文词 excerpt 高亮
        const controlExcerpt = page
            .locator('site-search .pagefind-ui__result', {
                has: page.locator(
                    'a[href="/en/archive/2025/planning-control/control-fundamentals/"]'
                ),
            })
            .locator('.pagefind-ui__result-excerpt mark')
            .first()
        await expect(controlExcerpt).toContainText('VCU')

        // 英文搜索结果绝不混入中文 fallback 路径
        expect(hrefs.some((h) => h?.includes('/控制/'))).toBe(false)
        expect(hrefs.some((h) => h?.includes('/记录/'))).toBe(false)

        // 点击跳转到目标英文文档
        await page
            .locator(
                'site-search .pagefind-ui__result-link[href="/en/archive/2025/planning-control/control-fundamentals/"]'
            )
            .click()
        await expect(page).toHaveURL(
            /\/en\/archive\/2025\/planning-control\/control-fundamentals\/$/
        )
        expect(failures).toEqual([])
    })

    test('负例查询不返回任何结果', async ({ page }) => {
        await page.setViewportSize({ width: 1600, height: 900 })
        await page.goto('/')
        await openSearchModal(page)
        await searchFor(page, NEGATIVE_QUERY)
        await expect(page.locator('site-search .pagefind-ui__message').first()).toBeVisible({
            timeout: 20_000,
        })
        await expect(page.locator('site-search .pagefind-ui__result')).toHaveCount(0)
    })

    test('SPA 导航后再次打开搜索仍能查询（监听不失效）', async ({ page }) => {
        await page.setViewportSize({ width: 1600, height: 900 })
        await page.goto('/')
        // ClientRouter 的客户端导航：切换页面后 site-search 元素与监听需要保持可用
        await page.locator('a[href="/docs-center/"]').first().click()
        await expect(page).toHaveURL(/\/docs-center\/$/)
        await page.keyboard.press('Control+K')
        await expect(page.locator('site-search .pagefind-ui__search-input').first()).toBeVisible({
            timeout: 30_000,
        })
        await searchFor(page, '301')
        await expect(page.locator('site-search .pagefind-ui__result-link').first()).toHaveAttribute(
            'href',
            /\/labs\/$/,
            { timeout: 20_000 }
        )
    })

    test('窄屏（375px）下可见搜索按钮点击打开、中文正文词 301 检索并跳转（#279）', async ({
        page,
    }) => {
        const failures = trackPagefindFailures(page)
        await page.setViewportSize({ width: 375, height: 667 })
        await page.goto('/')

        const searchBtn = page.locator('site-search button[data-open-modal]').first()
        await expect(searchBtn).toBeVisible()
        await expect(searchBtn).toHaveAttribute('aria-label', '搜索')

        await searchBtn.click()
        const searchInput = page.locator('site-search .pagefind-ui__search-input').first()
        await expect(searchInput).toBeVisible({ timeout: 30_000 })
        await expect(searchInput).toBeFocused()

        await searchFor(page, '301')
        const firstResult = page.locator('site-search .pagefind-ui__result-link').first()
        await expect(firstResult).toHaveAttribute('href', /\/labs\/$/, { timeout: 20_000 })
        await expect(
            page.locator('site-search .pagefind-ui__result-excerpt mark').first()
        ).toContainText('301')

        await firstResult.click()
        await expect(page).toHaveURL(/\/labs\/$/)
        expect(failures).toEqual([])
    })

    test('窄屏（375px）下英文首页可见搜索按钮、英文词 odometry 检索并跳转（#279）', async ({
        page,
    }) => {
        const failures = trackPagefindFailures(page)
        await page.setViewportSize({ width: 375, height: 667 })
        await page.goto('/en/')

        const searchBtn = page.locator('site-search button[data-open-modal]').first()
        await expect(searchBtn).toBeVisible()
        await expect(searchBtn).toHaveAttribute('aria-label', 'Search')

        await searchBtn.click()
        const searchInput = page.locator('site-search .pagefind-ui__search-input').first()
        await expect(searchInput).toBeVisible({ timeout: 30_000 })
        await expect(searchInput).toBeFocused()

        await searchFor(page, 'odometry')
        const resultLinks = page.locator('site-search .pagefind-ui__result-link')
        await expect(resultLinks.first()).toBeVisible({ timeout: 20_000 })

        const hrefs = await resultLinks.evaluateAll((links) =>
            links.map((link) => link.getAttribute('href'))
        )
        expect(hrefs).toContain('/en/join/')
        expect(hrefs).not.toContain('/labs/')

        const joinResult = page.locator('site-search .pagefind-ui__result-link[href="/en/join/"]')
        await expect(joinResult).toBeVisible()
        await joinResult.click()
        await expect(page).toHaveURL(/\/en\/join\/$/)
        expect(failures).toEqual([])
    })

    test('窄屏弹窗控制：Esc 与取消按钮关闭释放滚动锁并返回焦点，Ctrl+K 开关正常（#279）', async ({
        page,
    }) => {
        await page.setViewportSize({ width: 375, height: 667 })
        await page.goto('/')

        const searchBtn = page.locator('site-search button[data-open-modal]').first()
        const dialog = page.locator('site-search dialog').first()

        // 按钮点击打开 + 滚动锁生效
        await searchBtn.click()
        await expect(dialog).toHaveAttribute('open', '')
        await expect(page.locator('body')).toHaveAttribute('data-search-modal-open', '')

        // 取消按钮关闭 + 滚动锁释放 + 焦点返回触发器
        await page.locator('site-search button[data-close-modal]').first().click()
        await expect(dialog).not.toHaveAttribute('open', '')
        await expect(page.locator('body')).not.toHaveAttribute('data-search-modal-open')
        await expect(searchBtn).toBeFocused()

        // Ctrl+K 开启
        await page.keyboard.press('Control+K')
        await expect(dialog).toHaveAttribute('open', '')

        // Esc 关闭 + 焦点返回触发器
        await page.keyboard.press('Escape')
        await expect(dialog).not.toHaveAttribute('open', '')
        await expect(searchBtn).toBeFocused()
        await expect(page.locator('body')).not.toHaveAttribute('data-search-modal-open')
    })

    test('窄屏 SPA 导航后通过可见入口重开并完成查询（#279）', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 })
        await page.goto('/')

        // 客户端 SPA 导航（通过首页 Hero 可见 CTA 链接跳入文档页）
        await page.locator('a.hero-cta').first().click()
        await expect(page).toHaveURL(/\/2024-learning-roadmap\/$/)

        // 导航后窄屏搜索入口依然可见且可交互
        const searchBtn = page.locator('site-search button[data-open-modal]').first()
        await expect(searchBtn).toBeVisible()
        await searchBtn.click()

        const searchInput = page.locator('site-search .pagefind-ui__search-input').first()
        await expect(searchInput).toBeVisible({ timeout: 30_000 })
        await searchFor(page, '301')
        await expect(page.locator('site-search .pagefind-ui__result-link').first()).toHaveAttribute(
            'href',
            /\/labs\/$/,
            { timeout: 20_000 }
        )
    })

    test('跨断点（800px 内外侧与 1600px 桌面）搜索入口单实例且无重复 ID（#279）', async ({
        page,
    }) => {
        for (const width of [375, 799, 800, 801, 1600]) {
            await page.setViewportSize({ width, height: 750 })
            await page.goto('/')
            await expect(page.locator('site-search')).toHaveCount(1)
            const openBtn = page.locator('site-search button[data-open-modal]')
            await expect(openBtn).toHaveCount(1)
            await expect(openBtn).toBeVisible()
            await expect(page.locator('#starlight__search')).toHaveCount(1)
        }
    })
})
