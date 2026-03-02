import { expect, test } from '@playwright/test'

/**
 * 认证流程 E2E 烟雾测试
 *
 * 注意：登录、注册、管理后台页面均为 SSR（prerender = false），
 * 需要 Cloudflare Workers 运行时（D1/KV）才能完整渲染。
 * 使用 `pnpm preview` 无法提供这些页面，需要通过以下方式运行：
 *
 *   PLAYWRIGHT_BASE_URL=http://127.0.0.1:8788 pnpm test:e2e tests/e2e/auth.spec.ts
 *
 * 前提：先执行 `pnpm build && pnpm dev:worker` 启动 wrangler pages dev。
 */

test.describe('认证页面 — 登录', () => {
    test('登录页正确渲染', async ({ page }) => {
        const response = await page.goto('/login/')
        // SSR 页面在 wrangler 下应返回 200
        expect(response?.status()).toBeLessThan(500)

        await expect(page).toHaveTitle(/登录/)
        await expect(page.locator('h1')).toContainText('登录')
    })

    test('登录表单包含必要字段', async ({ page }) => {
        await page.goto('/login/')

        const form = page.locator('#login-form')
        await expect(form).toBeVisible()

        // 账号输入框
        const account = page.locator('#account')
        await expect(account).toBeVisible()
        await expect(account).toHaveAttribute('type', 'text')
        await expect(account).toHaveAttribute('required', '')

        // 密码输入框
        const password = page.locator('#password')
        await expect(password).toBeVisible()
        await expect(password).toHaveAttribute('type', 'password')
        await expect(password).toHaveAttribute('required', '')

        // 提交按钮
        const submit = form.locator('button[type="submit"]')
        await expect(submit).toBeVisible()
        await expect(submit).toContainText('登录')
    })

    test('OAuth 按钮指向正确地址', async ({ page }) => {
        await page.goto('/login/')

        const githubBtn = page.locator('a.auth-btn-github')
        await expect(githubBtn).toBeVisible()
        await expect(githubBtn).toHaveAttribute('href', '/api/auth/github/')

        const qqBtn = page.locator('a.auth-btn-qq')
        await expect(qqBtn).toBeVisible()
        await expect(qqBtn).toHaveAttribute('href', '/api/auth/qq/')
    })

    test('登录页包含注册链接', async ({ page }) => {
        await page.goto('/login/')

        const registerLink = page.locator('.auth-link a[href="/register/"]')
        await expect(registerLink).toBeVisible()
    })
})

test.describe('认证页面 — 注册', () => {
    test('注册页正确渲染', async ({ page }) => {
        const response = await page.goto('/register/')
        expect(response?.status()).toBeLessThan(500)

        await expect(page).toHaveTitle(/注册/)
        await expect(page.locator('h1')).toContainText('注册')
    })

    test('注册表单包含必要字段', async ({ page }) => {
        await page.goto('/register/')

        const form = page.locator('#register-form')
        await expect(form).toBeVisible()

        // 用户名
        const username = page.locator('#username')
        await expect(username).toBeVisible()
        await expect(username).toHaveAttribute('type', 'text')
        await expect(username).toHaveAttribute('required', '')

        // 邮箱
        const email = page.locator('#email')
        await expect(email).toBeVisible()
        await expect(email).toHaveAttribute('type', 'email')
        await expect(email).toHaveAttribute('required', '')

        // 密码
        const password = page.locator('#password')
        await expect(password).toBeVisible()
        await expect(password).toHaveAttribute('type', 'password')

        // 确认密码
        const confirmPassword = page.locator('#confirmPassword')
        await expect(confirmPassword).toBeVisible()
        await expect(confirmPassword).toHaveAttribute('type', 'password')

        // 提交按钮
        const submit = form.locator('button[type="submit"]')
        await expect(submit).toBeVisible()
        await expect(submit).toContainText('注册')
    })

    test('注册页包含登录链接', async ({ page }) => {
        await page.goto('/register/')

        const loginLink = page.locator('.auth-link a[href="/login/"]')
        await expect(loginLink).toBeVisible()
    })
})

test.describe('认证保护 — 管理后台', () => {
    test('未登录访问 /admin/ 重定向到登录页', async ({ page }) => {
        await page.goto('/admin/')
        // 中间件应将未认证用户重定向到 /login/?redirect=/admin/
        await page.waitForURL(/\/login\//)
        expect(page.url()).toContain('/login/')
    })
})
