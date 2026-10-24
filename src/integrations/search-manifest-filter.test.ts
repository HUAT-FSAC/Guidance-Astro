import { describe, expect, it } from 'vitest'

import { classifyRoutes, encodedRouteUrl, htmlRedirectShell } from './search-manifest-filter'

const route = (overrides: Partial<Parameters<typeof classifyRoutes>[0][number]> = {}) => ({
    id: 'labs',
    draft: false,
    pagefind: true,
    sidebarHidden: false,
    ...overrides,
})

describe('classifyRoutes', () => {
    it('keeps a plain zh document as a zh candidate with directory URL and derives its fallback exclusion', () => {
        const { candidates, excluded } = classifyRoutes([route()])
        expect(candidates).toEqual([{ id: 'labs', locale: 'zh', url: '/labs/' }])
        expect(excluded).toEqual([
            { id: 'en/labs', locale: 'en', url: '/en/labs/', reason: 'locale-fallback' },
        ])
    })

    it('treats en/ prefixed ids as real en documents', () => {
        const { candidates } = classifyRoutes([route({ id: 'join' }), route({ id: 'en/join' })])
        expect(candidates.map((candidate) => candidate.locale)).toEqual(['zh', 'en'])
        expect(candidates.map((candidate) => candidate.url)).toEqual(['/join/', '/en/join/'])
    })

    it('excludes draft documents', () => {
        const { candidates, excluded } = classifyRoutes([route({ draft: true })])
        expect(candidates).toEqual([])
        expect(excluded).toEqual([{ id: 'labs', locale: 'zh', url: '/labs/', reason: 'draft' }])
    })

    it('excludes explicit pagefind:false documents', () => {
        const { excluded } = classifyRoutes([route({ pagefind: false })])
        expect(excluded[0]?.reason).toBe('pagefind-false')
    })

    it('excludes 404 routes in both locales even when frontmatter is pagefind-true', () => {
        const { excluded } = classifyRoutes([
            route({ id: '404', pagefind: true }),
            route({ id: 'en/404', pagefind: true }),
        ])
        expect(excluded.map((entry) => entry.reason)).toEqual(['not-found-page', 'not-found-page'])
    })

    it('excludes en fallbacks: zh documents without an en counterpart render fallback shells', () => {
        const { candidates, excluded } = classifyRoutes([
            route({ id: 'labs' }),
            route({ id: 'join' }),
            route({ id: 'en/join' }),
        ])
        expect(candidates.map((candidate) => candidate.url)).toEqual([
            '/labs/',
            '/join/',
            '/en/join/',
        ])
        expect(excluded).toEqual([
            {
                id: 'en/labs',
                locale: 'en',
                url: '/en/labs/',
                reason: 'locale-fallback',
            },
        ])
    })

    it('does not exclude sidebar.hidden documents (D-022: sidebar.hidden is not an exclusion rule)', () => {
        const { candidates, excluded } = classifyRoutes([route({ sidebarHidden: true })])
        expect(candidates).toHaveLength(1)
        expect(excluded).toEqual([
            { id: 'en/labs', locale: 'en', url: '/en/labs/', reason: 'locale-fallback' },
        ])
    })

    it('excludes an empty root index id consistently with a real index entry', () => {
        const { candidates } = classifyRoutes([route({ id: 'index' }), route({ id: '' })])
        expect(candidates).toEqual([{ id: '', locale: 'zh', url: '/' }])
    })

    it('maps the en home entry to the /en/ route, not /en/index/', () => {
        const { candidates, excluded } = classifyRoutes([
            route({ id: 'index' }),
            // docsLoader 对 en/index.mdx 生成的 collection id 是 `en`
            route({ id: 'en' }),
        ])
        expect(candidates).toEqual([
            { id: '', locale: 'zh', url: '/' },
            { id: '', locale: 'en', url: '/en/' },
        ])
        expect(excluded).toEqual([])
    })

    it('does not derive a fallback row for draft zh documents (drafts never become routes)', () => {
        const { candidates, excluded } = classifyRoutes([
            route({ id: 'secret-draft', draft: true }),
        ])
        expect(candidates).toEqual([])
        expect(excluded).toEqual([
            { id: 'secret-draft', locale: 'zh', url: '/secret-draft/', reason: 'draft' },
        ])
    })
})

describe('encodedRouteUrl', () => {
    it('encodes non-ASCII segments while preserving slashes', () => {
        expect(encodedRouteUrl('/archive/2025/electrical/电池箱/')).toBe(
            '/archive/2025/electrical/%E7%94%B5%E6%B1%A0%E7%AE%B1/'
        )
        expect(encodedRouteUrl('/labs/')).toBe('/labs/')
    })
})

describe('htmlRedirectShell', () => {
    it('flags a meta refresh shell', () => {
        expect(
            htmlRedirectShell(
                '<html><head><meta http-equiv="refresh" content="0;url=/en/x/"></head></html>'
            )
        ).toBe(true)
        expect(
            htmlRedirectShell(
                "<html><head><META HTTP-EQUIV='refresh' content='0;url=/x/'></head></html>"
            )
        ).toBe(true)
    })

    it('flags a window.location.replace navigation script', () => {
        expect(htmlRedirectShell('<script>window.location.replace("/en/x/")</script>')).toBe(true)
    })

    it('does not flag escaped redirect code examples shown as page content', () => {
        expect(
            htmlRedirectShell(
                '<pre>&lt;meta http-equiv="refresh" content="0;url=/x/"&gt; and &lt;script&gt;window.location.replace("/x/")&lt;/script&gt;</pre>'
            )
        ).toBe(false)
    })

    it('does not flag ordinary documents', () => {
        expect(
            htmlRedirectShell(
                '<html lang="zh-CN"><main data-pagefind-body><h1>实验室</h1></main></html>'
            )
        ).toBe(false)
    })
})
