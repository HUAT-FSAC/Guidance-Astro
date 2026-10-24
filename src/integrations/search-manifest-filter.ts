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
    /** 归一化后的 Starlight id（根 index 为空串；英文条目带 `en/` 前缀） */
    id: string
    draft: boolean
    /** 与 Page.astro 谓词同义：frontmatter 未显式 false 即视为可收录 */
    pagefind: boolean
    /** 仅作信息披露列，不参与过滤 */
    sidebarHidden: boolean
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

/** 归一化 id → 页面 URL（目录式尾斜杠，段级编码交给请求方）；根 index 空串映射为 `/` */
export function routeUrl(id: string): string {
    return id ? `/${id}/` : '/'
}

/** URL 段级编码（保留 `/`，中文段转百分号编码），供实际 HTTP 请求使用 */
export function encodedRouteUrl(url: string): string {
    return url
        .split('/')
        .map((segment) => (segment ? encodeURIComponent(segment) : ''))
        .join('/')
}

export function routeLocale(id: string): SearchLocale {
    return id === 'en' || id.startsWith('en/') ? 'en' : 'zh'
}

/** Starlight 的根 index 归一化：`index` 与空串是同一个路由；英文首页 `en/index`
 * 同样折叠为空串（其 URL 由 locale 决定为 `/en/`，collection id 里没有独立路由）
 * ——注意 docsLoader 对 `en/index.mdx` 生成的 collection id 是 `en`（剥离 index 段），
 * 而非 `en/index`。 */
const normalizeId = (id: string): string => (id === 'index' || id === 'en' ? '' : id)

/** locale + 归一化 id → 页面 URL（英文空串 = `/en/`） */
const routeUrlFor = (locale: SearchLocale, id: string): string =>
    id ? `/${id}/` : locale === 'en' ? '/en/' : '/'

/** 按生产语义把原始 docs 条目清单分类为「收录候选」与「排除项」。 */
export function classifyRoutes(routes: readonly SearchManifestRoute[]): ClassifiedSearchRoutes {
    // locale 必须取自原始 id（en/index 折叠为空串后不能再由 id 前缀判定）
    const normalized = routes.map((route) => ({
        ...route,
        locale: routeLocale(route.id),
        id: normalizeId(route.id),
    }))
    const zhIds = new Set(
        normalized.filter((route) => route.locale === 'zh').map((route) => route.id)
    )
    // 英文对应对以「非 draft 英文条目」为准：draft 的 en 文件不生成路由，
    // 其 slug 仍由默认语言 fallback 补位
    const enIds = new Set(
        normalized.filter((route) => route.locale === 'en' && !route.draft).map((route) => route.id)
    )
    const candidates: SearchCandidate[] = []
    const excluded: SearchExcluded[] = []
    const seen = new Set<string>()

    for (const route of normalized) {
        const locale = route.locale
        const url = routeUrlFor(locale, route.id)
        const exclude = (reason: SearchExclusionReason) =>
            excluded.push({ id: route.id, locale, url, reason })

        if (route.draft) {
            exclude('draft')
            continue
        }
        if (!route.pagefind) {
            exclude('pagefind-false')
            continue
        }
        if (route.id === '404' || route.id.endsWith('/404')) {
            exclude('not-found-page')
            continue
        }
        if (locale === 'en' && !zhIds.has(route.id === '' ? '' : route.id.slice('en/'.length))) {
            exclude('locale-fallback')
            continue
        }

        const key = `${locale}:${url}`
        if (seen.has(key)) continue
        seen.add(key)
        candidates.push({ id: route.id, locale, url })
    }

    // fallback 派生：Starlight 会为每个非 draft 默认语言条目生成 /en/<id>/ fallback 路由
    // （外壳 lang=en、正文 zh-CN）。collection 清单本身不含这些行，但这些 URL 生产中真实
    // 存在，按 D-022 显式登记为排除项，保证清单可完整解释「为什么 /en/labs/ 不入索引」。
    for (const id of zhIds) {
        if (enIds.has(id ? `en/${id}` : '')) continue
        const source = normalized.find((route) => route.locale === 'zh' && route.id === id)
        if (!source || source.draft) continue
        excluded.push({
            id: id ? `en/${id}` : 'en',
            locale: 'en',
            url: id ? `/en/${id}/` : '/en/',
            reason: 'locale-fallback',
        })
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
