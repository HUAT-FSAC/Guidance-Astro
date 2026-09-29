/**
 * 构建期 sitemap 路径推导（issue #116）
 *
 * 背景：本站 `output: 'server'`（Cloudflare Worker 全 SSR），Starlight 的内容页走动态
 * `[...slug]` 路由。`@astrojs/sitemap` 在 `astro:build:done` 只枚举「有静态 pathname 的
 * 路由」（见其 `addRouteUrl` 对 `r.pathname` 的判断），动态路由拿不到 pathname，于是
 * sitemap 里只剩 `src/pages/` 下的静态页：6 个跳转桩 + 2 个 showcase 页，166 个内容页
 * 全部缺席。
 *
 * 本模块在构建期扫描文件系统，推导出两组路径：
 *
 * 1. 内容页对应的站点路径 —— 交给 sitemap 的 `customPages` 补全；
 * 2. 不应被收录的页面路径（跳转桩 / `noindex` 页） —— 交给 sitemap 的 `filter` 剔除。
 *
 * 路径约定与 Starlight 一致：内容条目 id 即 `src/content/docs` 下的相对路径（去扩展名），
 * 名为 `index` 的文件折叠为其所在目录；站点为 `trailingSlash: 'always'`，故路径一律以
 * `/` 结尾。
 */

import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'

import { slug as githubSlug } from 'github-slugger'

const MARKDOWN_EXTENSION = /\.mdx?$/i
const ASTRO_PAGE_EXTENSION = /\.astro$/i

/** 名为 `index` 的文件代表其所在目录 */
const INDEX_BASENAME = 'index'

/** 形如 `404` 的状态码页由 Astro/Starlight 用于渲染错误页，不产生应被收录的路由 */
const STATUS_CODE_BASENAME = /^\d{3}$/

/** 以 `_` 开头是 Astro 约定的内部文件/目录，不产生路由 */
const PRIVATE_PREFIX = '_'

/** 跳转桩：页面主体直接返回重定向（如 `return Astro.redirect('/x/', 302)`） */
const REDIRECT_STUB_PATTERN = /Astro\.redirect\s*\(/

/** 页面声明了 noindex（如旧入口 `/docs/`），不应出现在 sitemap 中 */
const NOINDEX_PATTERN = /<meta[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex/i

/** 统一为 `/` 分隔并去掉首尾斜杠；兼容 Windows 反斜杠，便于跨平台比较 */
function toPosixPath(filePath: string): string {
    return filePath.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '')
}

/** 由路径片段拼出 `trailingSlash: 'always'` 的站点路径 */
function toSitePath(segments: string[]): string {
    return segments.length === 0 ? '/' : `/${segments.join('/')}/`
}

/** 路径中是否存在 Astro 约定不产生路由的内部片段（`_` 开头） */
function hasPrivateSegment(segments: string[]): boolean {
    return segments.some((segment) => segment.startsWith(PRIVATE_PREFIX))
}

/** 末段是否为状态码页（`404` 等），这类页面由 Starlight 渲染错误页，不收录 */
function isStatusCodePage(segments: string[]): boolean {
    const last = segments[segments.length - 1]
    return last !== undefined && STATUS_CODE_BASENAME.test(last)
}

/** 去掉扩展名并切分为路径片段；扩展名不匹配时返回 `null` */
function toFileSegments(filePath: string, extension: RegExp): string[] | null {
    const normalized = toPosixPath(filePath)
    if (!extension.test(normalized)) return null
    return normalized.replace(extension, '').split('/')
}

/** 折叠结尾的 `index` 片段 */
function collapseIndex(segments: string[]): string[] {
    return segments[segments.length - 1] === INDEX_BASENAME ? segments.slice(0, -1) : segments
}

/** 递归列出目录下所有文件（相对 `rootDir`，`/` 分隔，已排序） */
export function listFiles(rootDir: string): string[] {
    const files: string[] = []

    const walk = (dir: string): void => {
        for (const entry of readdirSync(dir, { withFileTypes: true })) {
            if (entry.name.startsWith('.')) continue
            const absolute = join(dir, entry.name)
            if (entry.isDirectory()) walk(absolute)
            else if (entry.isFile()) files.push(toPosixPath(relative(rootDir, absolute)))
        }
    }

    walk(rootDir)
    return files.sort()
}

/**
 * `src/content/docs` 下的 Markdown 相对路径 → 站点路径。
 * 非 Markdown、内部文件或状态码页时返回 `null`。
 *
 * ⚠️ 内容页的 URL 与 `src/pages` 下的静态页不同：Astro 的内容加载器会对**每一段路径**
 * 做 slug（`github-slugger`），再折叠结尾的 `index`。即
 * `astro/dist/content/utils.js → getContentEntryIdAndSlug`：
 *
 * ```js
 * withoutFileExt.split(path.sep).map(githubSlug).join('/').replace(/\/index$/, '')
 * ```
 *
 * 因此 `ROS 入门/` → `ros-入门/`、`vsc-c-c++-dev-and-debug` → `vsc-c-c-dev-and-debug`
 * （`+` 被丢弃、大写转小写、空格转 `-`）；中文段名不受影响（`电池箱` → `电池箱`）。
 * 若不同步这一步，sitemap 会写出 404 的 URL。
 *
 * @example docFilePathToSitePath('index.mdx')                    // '/'
 * @example docFilePathToSitePath('news/index.md')                // '/news/'
 * @example docFilePathToSitePath('en/cars.mdx')                  // '/en/cars/'
 * @example docFilePathToSitePath('archive/general/ROS 入门/a.md')// '/archive/general/ros-入门/a/'
 * @example docFilePathToSitePath('404.mdx')                      // null
 */
export function docFilePathToSitePath(filePath: string): string | null {
    const segments = toFileSegments(filePath, MARKDOWN_EXTENSION)
    if (segments === null) return null

    const slugified = segments.map((segment) => githubSlug(segment))
    if (hasPrivateSegment(slugified) || isStatusCodePage(slugified)) return null

    return toSitePath(collapseIndex(slugified))
}

/**
 * `src/pages` 下的 `.astro` 相对路径 → 站点路径。
 * 非 `.astro`（如端点 `foo.ts`）返回 `null` —— 这类路径需要单独的扩展名约定，暂不推导。
 *
 * 注意：这里的路径**不做 slug**（Astro 的文件路由按原样映射），所以
 * `src/pages/en/archive/general/ROS 入门/x.astro` 的地址确实带空格。
 *
 * @example pageFilePathToSitePath('index.astro')                  // '/'
 * @example pageFilePathToSitePath('en/showcase.astro')            // '/en/showcase/'
 */
export function pageFilePathToSitePath(filePath: string): string | null {
    const segments = toFileSegments(filePath, ASTRO_PAGE_EXTENSION)
    if (segments === null || hasPrivateSegment(segments)) return null

    return toSitePath(collapseIndex(segments))
}

/** 页面源码是否为跳转桩 */
export function isRedirectStub(source: string): boolean {
    return REDIRECT_STUB_PATTERN.test(source)
}

/** 页面源码是否声明了 noindex */
export function isNoIndexPage(source: string): boolean {
    return NOINDEX_PATTERN.test(source)
}

/** 收集 `src/content/docs` 下应进入 sitemap 的站点路径（去重、排序） */
export function collectContentPagePaths(contentDir: string): string[] {
    const paths = listFiles(contentDir)
        .map((file) => docFilePathToSitePath(file))
        .filter((path): path is string => path !== null)
    return Array.from(new Set(paths)).sort()
}

/** 收集 `src/pages` 下不应进入 sitemap 的站点路径（跳转桩 / noindex 页，去重、排序） */
export function collectNonIndexablePagePaths(pagesDir: string): string[] {
    const paths = listFiles(pagesDir)
        .filter((file) => ASTRO_PAGE_EXTENSION.test(file))
        .filter((file) => {
            const source = readFileSync(join(pagesDir, file), 'utf8')
            return isRedirectStub(source) || isNoIndexPage(source)
        })
        .map((file) => pageFilePathToSitePath(file))
        .filter((path): path is string => path !== null)
    return Array.from(new Set(paths)).sort()
}
