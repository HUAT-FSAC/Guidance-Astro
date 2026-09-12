/**
 * 路由级 bundle 预算检查（T-026）
 *
 * 站点为 SSR（Cloudflare Worker），HTML 在运行时生成，无法从 dist 静态归因路由体积。
 * 本脚本对关键路由实际请求渲染后的 HTML，解析其中引用的 _astro/assets JS/CSS，
 * 按路由汇总首屏 JS/CSS 载荷并对照预算（防回归棘轮，超阈值即失败）。
 *
 * 用法:
 *   pnpm quality:routes                    # 自动拉起 wrangler dev（默认端口 8799），测完自动回收
 *   ROUTE_BUDGET_BASE_URL=http://127.0.0.1:8787 pnpm quality:routes   # 复用已运行的服务
 *
 * 预算覆盖: BUNDLE_BUDGET_ROUTE_JS_KB / BUNDLE_BUDGET_ROUTE_CSS_KB
 * 路由清单: scripts/quality/route-budget.routes.json
 */
import { spawn } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'

const clientDir = path.join('dist', 'client')
const serverEntry = path.join('dist', 'server', 'entry.mjs')
const wranglerConfig = path.join('dist', 'server', 'wrangler.json')
const port = Number(process.env.ROUTE_BUDGET_PORT ?? 8799)
const baseUrl = process.env.ROUTE_BUDGET_BASE_URL ?? `http://127.0.0.1:${port}`

const budgets = {
    // 防回归棘轮（2026-09-13 基线）：当前最大 JS 52.24 KB（/showcase-dashboard/）、CSS 235.19 KB（en 文档页）
    maxRouteJsKB: Number(process.env.BUNDLE_BUDGET_ROUTE_JS_KB ?? 80),
    maxRouteCssKB: Number(process.env.BUNDLE_BUDGET_ROUTE_CSS_KB ?? 260),
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function toKB(bytes) {
    return Number((bytes / 1024).toFixed(2))
}

async function serverReachable() {
    try {
        const response = await fetch(baseUrl, { signal: AbortSignal.timeout(3000) })
        return response.status < 500
    } catch {
        return false
    }
}

async function waitForServer(timeoutMs = 90_000) {
    const deadline = Date.now() + timeoutMs
    while (Date.now() < deadline) {
        if (await serverReachable()) return true
        await sleep(1000)
    }
    return false
}

function startPreviewServer() {
    const child = spawn(
        'pnpm',
        [
            'exec',
            'wrangler',
            'dev',
            serverEntry,
            '--config',
            wranglerConfig,
            '--port',
            String(port),
        ],
        { stdio: 'ignore', detached: true }
    )
    return {
        async stop() {
            try {
                process.kill(-child.pid, 'SIGTERM')
            } catch {
                try {
                    child.kill('SIGTERM')
                } catch {
                    /* already gone */
                }
            }
        },
    }
}

function extractAssetRefs(html) {
    const refs = new Set()
    for (const match of html.matchAll(
        /(?:src|href)="(\/(?:_astro|assets)\/[^"?#]+\.(?:m?js|css))"/g
    )) {
        refs.add(match[1])
    }
    return [...refs]
}

async function measureRoute(route) {
    const response = await fetch(baseUrl + route, { signal: AbortSignal.timeout(30_000) })
    if (!response.ok) {
        return { route, error: `HTTP ${response.status}` }
    }
    const html = await response.text()
    const refs = extractAssetRefs(html)
    let js = 0
    let css = 0
    const missing = []
    for (const ref of refs) {
        const filePath = path.join(clientDir, decodeURIComponent(ref.replace(/^\//, '')))
        try {
            const stat = await fs.stat(filePath)
            if (ref.endsWith('.css')) css += stat.size
            else js += stat.size
        } catch {
            missing.push(ref)
        }
    }
    if (missing.length > 0) {
        return { route, error: `assets missing in dist/client: ${missing.slice(0, 3).join(', ')}` }
    }
    return { route, jsKB: toKB(js), cssKB: toKB(css), assetCount: refs.length }
}

async function run() {
    try {
        await fs.stat(path.join(clientDir, '_astro'))
        await fs.stat(serverEntry)
    } catch {
        console.error('[route-budget] Missing build output. Run `pnpm build` first.')
        process.exit(1)
    }

    const { routes } = JSON.parse(
        await fs.readFile(new URL('./route-budget.routes.json', import.meta.url), 'utf8')
    )

    let server = null
    if (!(await serverReachable())) {
        server = startPreviewServer()
        if (!(await waitForServer())) {
            await server.stop()
            console.error(`[route-budget] Preview server did not start at ${baseUrl}`)
            process.exit(1)
        }
    }

    try {
        const results = []
        const failures = []
        for (const route of routes) {
            const result = await measureRoute(route)
            results.push(result)
            if (result.error) {
                failures.push(`Route ${route} failed: ${result.error}`)
            } else {
                if (result.jsKB > budgets.maxRouteJsKB) {
                    failures.push(
                        `Route ${route} JS exceeds budget: ${result.jsKB} KB > ${budgets.maxRouteJsKB} KB`
                    )
                }
                if (result.cssKB > budgets.maxRouteCssKB) {
                    failures.push(
                        `Route ${route} CSS exceeds budget: ${result.cssKB} KB > ${budgets.maxRouteCssKB} KB`
                    )
                }
            }
        }

        console.log(
            `[route-budget] Budget: JS ≤ ${budgets.maxRouteJsKB} KB, CSS ≤ ${budgets.maxRouteCssKB} KB`
        )
        console.log('[route-budget] Per-route first-load payload')
        for (const item of results
            .slice()
            .sort((left, right) => (right.jsKB ?? 0) - (left.jsKB ?? 0))) {
            if (item.error) {
                console.log(`- ${item.route}: ERROR ${item.error}`)
            } else {
                console.log(
                    `- ${item.route}: JS=${item.jsKB} KB, CSS=${item.cssKB} KB, assets=${item.assetCount}`
                )
            }
        }

        if (failures.length > 0) {
            console.error('[route-budget] Route budget check failed:')
            failures.forEach((item) => console.error(`- ${item}`))
            process.exit(1)
        }
        console.log('[route-budget] Route budget check passed.')
    } finally {
        if (server) await server.stop()
    }
}

run()
