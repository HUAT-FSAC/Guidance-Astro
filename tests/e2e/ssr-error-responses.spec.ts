import { type APIResponse, expect, test } from '@playwright/test'

const missingPath = '/en/__missing-ssr-error-contract/'

function scriptNonce(response: APIResponse): string {
    const directive = response
        .headers()
        ['content-security-policy']?.split(';')
        .find((value) => value.trim().startsWith('script-src '))
    expect(directive).toBeDefined()
    expect(directive).not.toContain("'unsafe-inline'")
    const matches = [...(directive ?? '').matchAll(/'nonce-([A-Za-z0-9_-]+)'/g)]
    expect(matches).toHaveLength(1)
    return matches[0][1]
}

test('Worker uses each response nonce in the final 200 and 404 HTML', async ({ page }) => {
    const nonces = new Set<string>()
    for (const [path, status, cache] of [
        ['/', 200, 'private, no-cache, must-revalidate'],
        [missingPath, 404, 'private, no-store'],
        [missingPath, 404, 'private, no-store'],
        ['/404/', 404, 'private, no-store'],
    ] as const) {
        const response = await page.request.get(path, { maxRedirects: 0 })
        expect(response.status()).toBe(status)
        expect(response.headers()['content-type']).toMatch(/^text\/html\b/)
        expect(response.headers()['cache-control']).toBe(cache)
        const nonce = scriptNonce(response)
        expect(nonces.has(nonce)).toBe(false)
        nonces.add(nonce)

        const scripts = await page.evaluate(
            (body) => {
                const document = new DOMParser().parseFromString(body, 'text/html')
                return [...document.scripts].map((script) => script.getAttribute('nonce'))
            },
            await response.text()
        )
        expect(scripts.length).toBeGreaterThan(0)
        expect([...new Set(scripts)]).toEqual([nonce])
    }
})

test('Worker preserves redirects and asset content', async ({ request }) => {
    const redirect = await request.get('/docs/', { maxRedirects: 0 })
    expect(redirect.status()).toBe(301)
    expect(redirect.headers()['location']).toBe('/')
    expect(redirect.headers()['content-type']).toBeUndefined()

    const asset = await request.get('/manifest.json')
    expect(asset.status()).toBe(200)
    expect(asset.headers()['content-type']).toMatch(/^application\/json\b/)
    expect(asset.headers()['cache-control']).toBe('public, max-age=0, must-revalidate')
    expect(await asset.json()).toHaveProperty('name')
})

test('Worker serves an explicit, non-cacheable 500 fallback', async ({ request }) => {
    const response = await request.get('/500/', { maxRedirects: 0 })
    expect(response.status()).toBe(500)
    expect(response.headers()['content-type']).toMatch(/^text\/html\b/)
    expect(response.headers()['cache-control']).toBe('private, no-store')
    scriptNonce(response)
    expect(await response.text()).toContain('服务器内部错误')
})

test.describe('404 page in a controlled browser', () => {
    test.use({ serviceWorkers: 'allow' })

    test('runs the page theme script and stays out of the offline cache', async ({ page }) => {
        await page.goto('/')
        await page.evaluate(async () => {
            await navigator.serviceWorker.register('/sw.js')
            await navigator.serviceWorker.ready
        })
        await expect
            .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
            .toBe(true)

        const response = await page.goto(missingPath)
        expect(response?.status()).toBe(404)
        expect(await page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true)
        await expect
            .poll(() => page.evaluate(() => typeof Reflect.get(window, 'StarlightThemeProvider')))
            .toBe('object')
        expect(await page.evaluate(async () => Boolean(await caches.match(location.href)))).toBe(
            false
        )
    })
})
