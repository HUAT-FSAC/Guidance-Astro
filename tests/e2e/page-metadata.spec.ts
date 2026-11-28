import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const SITE = 'https://huat-fsac.eu.org'
const BRAND_IMAGE = `${SITE}/og-image.jpg`

async function readMetadata(page: Page, path: string) {
    const response = await page.request.get(path, { maxRedirects: 0 })
    expect(response.status()).toBe(200)
    return page.evaluate(
        (html) => {
            const parsed = new DOMParser().parseFromString(html, 'text/html')
            const metadata = (selector: string, attribute: string) =>
                [...parsed.head.querySelectorAll(selector)].map((tag) =>
                    tag.getAttribute(attribute)
                )

            return {
                canonical: metadata('link[rel="canonical"]', 'href'),
                ogUrl: metadata('meta[property="og:url"]', 'content'),
                description: metadata('meta[name="description"]', 'content'),
                ogDescription: metadata('meta[property="og:description"]', 'content'),
                ogImage: metadata('meta[property="og:image"]', 'content'),
                alternates: [
                    ...parsed.head.querySelectorAll('link[rel="alternate"][hreflang]'),
                ].map((link) => [link.getAttribute('hreflang'), link.getAttribute('href')]),
                language: parsed.documentElement.lang,
            }
        },
        await response.text()
    )
}

for (const [zh, en] of [
    ['/', '/en/'],
    ['/join/', '/en/join/'],
    ['/news/new-car-development/', '/en/news/new-car-development/'],
    ['/showcase-dashboard/', '/en/showcase-dashboard/'],
]) {
    test(`SSR canonical, social URL and language alternates match for ${zh}`, async ({ page }) => {
        const [chinese, english] = await Promise.all([
            readMetadata(page, `${zh}?source=test`),
            readMetadata(page, en),
        ])
        for (const [metadata, path, language] of [
            [chinese, zh, 'zh-CN'],
            [english, en, 'en'],
        ] as const) {
            const canonical = new URL(path, SITE).href
            expect(metadata.canonical).toEqual([canonical])
            expect(metadata.ogUrl).toEqual([canonical])
            expect(metadata.ogImage).toEqual([BRAND_IMAGE])
            expect(metadata.language).toBe(language)
            expect(metadata.description).toEqual([expect.stringMatching(/\S/)])
            expect(metadata.ogDescription).toEqual(metadata.description)
            expect(metadata.alternates).toHaveLength(3)
            expect(Object.fromEntries(metadata.alternates)).toEqual({
                'zh-CN': `${SITE}${zh}`,
                en: `${SITE}${en}`,
                'x-default': `${SITE}${zh}`,
            })
        }
        expect(chinese.description[0]).not.toBe(english.description[0])

        if (zh === '/showcase-dashboard/') {
            const image = await page.request.get(new URL(BRAND_IMAGE).pathname, { maxRedirects: 0 })
            expect(image.status()).toBe(200)
            expect(image.headers()['content-type']).toMatch(/^image\/jpeg/)
        }
    })
}

test('untranslated articles, locale fallbacks and redirect shells have no misleading alternates', async ({
    page,
}) => {
    for (const path of [
        '/news/2026-season-preview/',
        '/en/news/2026-season-preview/',
        '/archive/2025/electrical/电池箱/',
        '/en/archive/2025/electrical/电池箱/',
        '/en/archive/2025/electrical/battery-pack/',
    ]) {
        const metadata = await readMetadata(page, path)
        const canonical = new URL(path, SITE).href
        expect(metadata.canonical).toEqual([canonical])
        expect(metadata.ogUrl).toEqual([canonical])
        expect(metadata.alternates).toEqual([])
    }
})
