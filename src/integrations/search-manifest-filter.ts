/**
 * 搜索路由清单的纯分类逻辑（#262 / D-022）。
 *
 * 该模块被两处共享：
 * - `src/integrations/search-manifest-endpoint.ts`（构建期端点，产出已分类清单）
 * - `tests`（排除边界的最小行为回归：draft / pagefind:false / 404 / fallback / 重定向壳）
 *
 * 规则来源（与已安装 Starlight / Page.astro 的生产语义逐条对齐）：
 * - draft:true 在生产路由中已被 Starlight 过滤，这里按端点显式标记二次排除；
 * - `pagefind:false` 与 404 的谓词复制 `Page.astro` 的 `pagefindEnabled`
 *   （`id !== '404' && !id.endsWith('/404') && entry.data.pagefind !== false`）；
 * - locale fallback = 默认语言文档缺少对应英文条目时 Starlight 生成的 `/en/<中文id>/`
 *   路由（`@astrojs/starlight/utils/routing`），外壳 lang=en 而正文 lang=zh-CN，
 *   按 D-022 去重排除，中文默认正文只收录一次；
 * - `sidebar.hidden` 不是排除条件（#266 更正 6365887000）；
 * - HTML 重定向壳指真实 `<meta http-equiv="refresh">` 标签或 `location.replace`
 *   导航脚本；正文里展示的重定向代码示例在 HTML 中是转义文本，原始标签正则不会误伤。
 */

export interface SearchManifestRoute {
    /** 归一化后的 Starlight 路由 id（根 index 为空串；英文条目带 `en/` 前缀；Starlight 自动生成 fallback） */
    id: string
    /** 是否为 Starlight 为缺少翻译的多语言条目生成的 fallback 路由 */
    isFallback?: boolean
    locale?: string
    draft?: boolean
    pagefind?: boolean
    sidebarHidden?: boolean
    entry?: {
        data?: {
            draft?: boolean
            pagefind?: boolean
            sidebar?: {
                hidden?: boolean
            }
        }
    }
}

export type SearchLocale = 'zh' | 'en'

export type SearchExclusionReason =
    'draft' | 'pagefind-false' | 'not-found-page' | 'locale-fallback'

export interface SearchCandidate {
    id: string
    locale: SearchLocale
    /** 页面 URL（未编码，段级中文原样保留） */
    url: string
}

export interface SearchExcluded extends SearchCandidate {
    reason: SearchExclusionReason
}

export interface ClassifiedSearchRoutes {
    candidates: SearchCandidate[]
    excluded: SearchExcluded[]
}

/** 归一化 id → 页面 URL（目录式尾斜杠，段级编码交给请求方）；根 index 空串映射为 `/`，英文空串/en 映射为 `/en/` */
export function routeUrl(id: string): string {
    if (!id || id === 'index') return '/'
    if (id === 'en' || id === 'en/index') return '/en/'
    const trimmed = id.replace(/^\/+|\/+$/g, '')
    return `/${trimmed}/`
}

/** URL 段级编码（保留 `/`，中文段转百分号编码），供实际 HTTP 请求使用 */
export function encodedRouteUrl(url: string): string {
    return url
        .split('/')
        .map((segment) => (segment ? encodeURIComponent(segment) : ''))
        .join('/')
}

export function routeLocale(route: { id: string; locale?: string } | string): SearchLocale {
    if (typeof route === 'string') {
        return route === 'en' || route.startsWith('en/') ? 'en' : 'zh'
    }
    return route.locale === 'en' || route.id === 'en' || route.id.startsWith('en/') ? 'en' : 'zh'
}

/** 按 Starlight 生产语义把实际路由清单分类为「收录候选」与「排除项」。 */
export function classifyRoutes(routes: readonly SearchManifestRoute[]): ClassifiedSearchRoutes {
    const candidates: SearchCandidate[] = []
    const excluded: SearchExcluded[] = []
    const seen = new Set<string>()

    for (const route of routes) {
        const locale = routeLocale(route)
        const url = routeUrl(route.id)
        const draft = route.entry?.data?.draft === true || route.draft === true
        const pagefind = route.entry?.data?.pagefind !== false && route.pagefind !== false
        const is404 = route.id === '404' || route.id.endsWith('/404')
        const isFallback = route.isFallback === true

        const exclude = (reason: SearchExclusionReason) =>
            excluded.push({ id: route.id, locale, url, reason })

        if (draft) {
            exclude('draft')
            continue
        }
        if (!pagefind) {
            exclude('pagefind-false')
            continue
        }
        if (is404) {
            exclude('not-found-page')
            continue
        }
        if (isFallback) {
            exclude('locale-fallback')
            continue
        }

        const key = `${locale}:${url}`
        if (seen.has(key)) continue
        seen.add(key)
        candidates.push({ id: route.id, locale, url })
    }

    return { candidates, excluded }
}

const META_REFRESH_RE = /<meta[^>]*http-equiv=["']?refresh["']?/i
const SCRIPT_NAVIGATE_RE = /<script[^>]*>[^<]*\b(?:window\.)?location\.replace\s*\(/i

/**
 * 是否为「HTML 导航重定向壳」：页面用 meta refresh 或脚本把浏览器导航去别处，
 * 自身没有可收录的正文。只匹配原始标签——正文代码示例中的同类文本是转义实体，
 * 不会被误判（#262：识别实际结构，不把正文展示的重定向代码示例误排）。
 */
export function htmlRedirectShell(html: string): boolean {
    return META_REFRESH_RE.test(html) || SCRIPT_NAVIGATE_RE.test(html)
}
