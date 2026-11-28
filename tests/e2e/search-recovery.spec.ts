import { expect, test } from '@playwright/test'

const cases = [
    {
        extension: 'js',
        locale: '/',
        error: '搜索暂时无法加载。',
        retryLabel: '重试',
        query: '301',
        destination: '/labs/',
    },
    {
        extension: 'css',
        locale: '/en/',
        error: 'Search is temporarily unavailable.',
        retryLabel: 'Retry',
        query: 'odometry',
        destination: '/en/join/',
    },
] as const

for (const scenario of cases) {
    test(`recovers from the first Pagefind UI ${scenario.extension} failure without a reload`, async ({
        page,
    }) => {
        const failedAsset = `/pagefind/pagefind-ui.${scenario.extension}`
        const attempts: string[] = []
        const successes: string[] = []
        await page.route(/\/pagefind\/pagefind-ui\.(?:js|css)$/, async (route) => {
            const path = new URL(route.request().url()).pathname
            const firstAttempt = !attempts.includes(path)
            attempts.push(path)
            if (path === failedAsset && firstAttempt) await route.abort('internetdisconnected')
            else await route.continue()
        })
        page.on('response', (response) => {
            const path = new URL(response.url()).pathname
            if (response.ok() && /\/pagefind\/pagefind-ui\.(?:js|css)$/.test(path)) {
                successes.push(path)
            }
        })

        await page.goto(scenario.locale)
        await page.evaluate(() => Reflect.set(window, 'searchRecoveryDocument', document))
        await page.keyboard.press('Control+K')

        const search = page.locator('site-search')
        const retry = search.getByRole('button', { name: scenario.retryLabel })
        const input = search.locator('.pagefind-ui__search-input')
        const uiStyle = page.locator('style[data-site-search-ui-css]')
        await expect(search.getByRole('alert')).toHaveText(scenario.error, { timeout: 7000 })
        await expect(retry).toBeFocused()
        expect(attempts.filter((path) => path === failedAsset)).toHaveLength(1)

        await retry.press('Enter')
        await expect(input).toHaveCount(1)
        await expect(input).toBeFocused()
        await expect(search.getByRole('alert')).toBeHidden()
        await expect(uiStyle).toHaveCount(1)
        expect(
            await uiStyle.evaluate((style: HTMLStyleElement) => style.sheet?.cssRules[0]?.cssText)
        ).toMatch(/^@layer starlight\.core/)
        await input.fill(scenario.query)
        await search.locator(`a.pagefind-ui__result-link[href="${scenario.destination}"]`).click()
        await expect.poll(() => new URL(page.url()).pathname).toBe(scenario.destination)
        expect(
            await page.evaluate(() => Reflect.get(window, 'searchRecoveryDocument') === document)
        ).toBe(true)

        await page.keyboard.press('Control+K')
        await expect(input).toBeFocused()
        await expect(input).toHaveCount(1)
        await expect(uiStyle).toHaveCount(1)
        await page.keyboard.press('Control+K')
        await expect(search.locator('dialog')).toBeHidden()

        const assets = ['/pagefind/pagefind-ui.css', '/pagefind/pagefind-ui.js']
        expect(successes.toSorted()).toEqual(assets)
        expect(attempts.toSorted()).toEqual([...assets, failedAsset].sort())
    })
}
