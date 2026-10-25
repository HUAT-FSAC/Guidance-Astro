import { describe, expect, it } from 'vitest'

import {
    classifyRoutes,
    encodedRouteUrl,
    htmlRedirectShell,
    type SearchManifestRoute,
} from './search-manifest-filter'

const route = (overrides: Partial<SearchManifestRoute> = {}): SearchManifestRoute => ({
    id: 'labs',
    draft: false,
    pagefind: true,
    sidebarHidden: false,
    ...overrides,
})

describe('classifyRoutes（#281 真实 Starlight 路由收录）', () => {
    it('正确收录中文文档为 zh 候选并映射目录 URL', () => {
        const { candidates, excluded } = classifyRoutes([route()])
        expect(candidates).toEqual([{ id: 'labs', locale: 'zh', url: '/labs/' }])
        expect(excluded).toEqual([])
    })

    it('正确收录不同名与同名真实英文文档，不要求存在同名中文 slug', () => {
        const { candidates, excluded } = classifyRoutes([
            route({ id: 'labs' }),
            route({ id: 'en/join' }),
            route({ id: 'en/archive/2025/planning-control/control-fundamentals' }),
            route({ id: 'en/archive/2025/simulation/simulation-platforms' }),
        ])
        expect(candidates.map((c) => c.url)).toEqual([
            '/labs/',
            '/en/join/',
            '/en/archive/2025/planning-control/control-fundamentals/',
            '/en/archive/2025/simulation/simulation-platforms/',
        ])
        expect(candidates.filter((c) => c.locale === 'en')).toHaveLength(3)
        expect(excluded).toEqual([])
    })

    it('基于 Starlight 真实 isFallback 标记排除多语言 fallback 壳', () => {
        const { candidates, excluded } = classifyRoutes([
            route({ id: 'labs' }),
            route({ id: 'en/labs', isFallback: true }),
            route({ id: 'en/archive/2025/planning-control/控制', isFallback: true }),
            route({ id: 'en/archive/2025/planning-control/control-fundamentals' }),
        ])
        expect(candidates.map((c) => c.url)).toEqual([
            '/labs/',
            '/en/archive/2025/planning-control/control-fundamentals/',
        ])
        expect(excluded).toEqual([
            { id: 'en/labs', locale: 'en', url: '/en/labs/', reason: 'locale-fallback' },
            {
                id: 'en/archive/2025/planning-control/控制',
                locale: 'en',
                url: '/en/archive/2025/planning-control/控制/',
                reason: 'locale-fallback',
            },
        ])
    })

    it('排除 draft 文档', () => {
        const { candidates, excluded } = classifyRoutes([route({ draft: true })])
        expect(candidates).toEqual([])
        expect(excluded).toEqual([{ id: 'labs', locale: 'zh', url: '/labs/', reason: 'draft' }])
    })

    it('排除显式 pagefind:false 文档', () => {
        const { excluded } = classifyRoutes([route({ pagefind: false })])
        expect(excluded[0]?.reason).toBe('pagefind-false')
    })

    it('排除中英文 404 路由', () => {
        const { excluded } = classifyRoutes([
            route({ id: '404', pagefind: true }),
            route({ id: 'en/404', pagefind: true }),
        ])
        expect(excluded.map((entry) => entry.reason)).toEqual(['not-found-page', 'not-found-page'])
    })

    it('不排除 sidebar.hidden 文档（D-022：sidebar.hidden 不是排除条件）', () => {
        const { candidates, excluded } = classifyRoutes([route({ sidebarHidden: true })])
        expect(candidates).toHaveLength(1)
        expect(candidates[0]?.url).toBe('/labs/')
        expect(excluded).toEqual([])
    })

    it('将根 index 与空串统一归一化映射为 / 且去重', () => {
        const { candidates } = classifyRoutes([route({ id: 'index' }), route({ id: '' })])
        expect(candidates).toEqual([{ id: 'index', locale: 'zh', url: '/' }])
    })

    it('将 en 首页与 en/index 映射为 /en/ 且去重', () => {
        const { candidates, excluded } = classifyRoutes([
            route({ id: 'index' }),
            route({ id: 'en' }),
            route({ id: 'en/index' }),
        ])
        expect(candidates).toEqual([
            { id: 'index', locale: 'zh', url: '/' },
            { id: 'en', locale: 'en', url: '/en/' },
        ])
        expect(excluded).toEqual([])
    })
})

describe('encodedRouteUrl', () => {
    it('对非 ASCII 路径段做百分号编码并保留斜杠结构', () => {
        expect(encodedRouteUrl('/archive/2025/electrical/电池箱/')).toBe(
            '/archive/2025/electrical/%E7%94%B5%E6%B1%A0%E7%AE%B1/'
        )
        expect(encodedRouteUrl('/labs/')).toBe('/labs/')
        expect(encodedRouteUrl('/en/join/')).toBe('/en/join/')
    })
})

describe('htmlRedirectShell', () => {
    it('识别 meta refresh 导航壳', () => {
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

    it('识别 window.location.replace 导航脚本', () => {
        expect(htmlRedirectShell('<script>window.location.replace("/en/x/")</script>')).toBe(true)
    })

    it('正文转义代码示例不被误判为重定向壳', () => {
        expect(
            htmlRedirectShell(
                '<pre>&lt;meta http-equiv="refresh" content="0;url=/x/"&gt; and &lt;script&gt;window.location.replace("/x/")&lt;/script&gt;</pre>'
            )
        ).toBe(false)
    })

    it('普通正文文档不被误判', () => {
        expect(
            htmlRedirectShell(
                '<html lang="zh-CN"><main data-pagefind-body><h1>实验室</h1></main></html>'
            )
        ).toBe(false)
    })
})
