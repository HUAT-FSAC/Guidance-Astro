/**
 * 内容页内部链接完整性回归测试（issue #117）
 *
 * 解析 `src/content/docs/**` 下全部 Markdown/MDX 的站内链接（markdown 链接 +
 * MDX `href`/`src` 属性），与「合法路由集合」比对：
 *
 * 1. 内容页路由 —— `src/integrations/sitemap-paths.ts` 的逐段 slug 推导；
 * 2. `src/pages` 静态页路由（含 302 跳转桩 —— 跳转不 404）；
 * 3. `astro.config.mjs` redirects 的源路径（301 不 404），数据抽在 `src/config/redirects.ts`；
 * 4. `public/` 静态文件。
 *
 * 跳过：外部链接、纯锚点、`@assets/` 别名图片引用（MDX 中由 Astro 构建期处理，
 * 已线上实测渲染为 `/_image/?href=…`）。相对链接按文件空间解析后再 slug 映射，
 * 与 Astro 内容加载器的行为一致（见 sitemap-paths.ts 顶部说明）。
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { posix } from 'node:path'

import { describe, expect, it } from 'vitest'

import { siteRedirects } from '../../src/config/redirects'
import {
    docFilePathToSitePath,
    listFiles,
    pageFilePathToSitePath,
} from '../../src/integrations/sitemap-paths'

const contentDir = fileURLToPath(new URL('../../src/content/docs/', import.meta.url))
const pagesDir = fileURLToPath(new URL('../../src/pages/', import.meta.url))
const publicDir = fileURLToPath(new URL('../../public/', import.meta.url))

const contentFiles = listFiles(contentDir).filter((file) => /\.mdx?$/i.test(file))
const contentPaths = new Set(
    contentFiles.map((file) => docFilePathToSitePath(file)).filter((p): p is string => p !== null)
)
const staticPaths = new Set(
    listFiles(pagesDir)
        .map((file) => pageFilePathToSitePath(file))
        .filter((p): p is string => p !== null)
)
const redirectSources = new Set(Object.keys(siteRedirects))
const publicPaths = new Set(listFiles(publicDir).map((file) => `/${file}`))

const legalExact = new Set([...contentPaths, ...staticPaths, ...redirectSources, '/'])

const withTrail = (path: string): string => (path.endsWith('/') ? path : `${path}/`)
const withoutTrail = (path: string): string => (path !== '/' ? path.replace(/\/+$/, '') : path)

/** 尾斜杠四种形态 × 原文/编码/解码，任一命中即合法 */
function isLegalRoute(target: string): boolean {
    const slashForms = [
        target,
        withTrail(target),
        withoutTrail(target),
        withTrail(withoutTrail(target)),
    ]
    const encodings = slashForms.flatMap((form) => [form, encodeURI(form), decodeURI(form)])
    for (const form of encodings) {
        if (legalExact.has(form)) return true
        if (publicPaths.has(withoutTrail(form))) return true
    }
    return false
}

const EXTERNAL_LINK = /^(https?:|mailto:|tel:|\/\/)/i

/** 去掉围栏代码块与行内代码，避免把代码样例当链接 */
function stripCode(source: string): string {
    let inFence = false
    const lines = source.split('\n').map((line) => {
        if (/^\s*(```|~~~)/.test(line)) {
            inFence = !inFence
            return ''
        }
        return inFence ? '' : line
    })
    return lines.join('\n').replace(/`[^`\n]*`/g, '')
}

function extractLinks(source: string): Array<{ url: string; line: number }> {
    const stripped = stripCode(source)
    const hits: Array<{ url: string; line: number }> = []
    const patterns = [
        /\[[^\]]*\]\(\s*(<[^>]*>|[^)\s]+)[^)]*\)/g,
        /^\s*\[[^\]]+\]:\s*(\S+)/gm,
        /(?:href|src|link|image|poster)=["']([^"']+)["']/g,
    ]
    for (const pattern of patterns) {
        for (const match of stripped.matchAll(pattern)) {
            const line = stripped.slice(0, match.index).split('\n').length
            hits.push({ url: match[1].replace(/^<|>$/g, ''), line })
        }
    }
    return hits
}

interface BrokenLink {
    file: string
    line: number
    url: string
    target: string
}

function findBrokenLinks(): BrokenLink[] {
    const broken: BrokenLink[] = []
    for (const file of contentFiles) {
        const source = readFileSync(`${contentDir}${file}`, 'utf8')
        const fileDir = posix.dirname(file)
        for (const { url, line } of extractLinks(source)) {
            if (!url || url.startsWith('#') || url.startsWith('@')) continue
            if (EXTERNAL_LINK.test(url)) continue
            const target = url.split('#')[0].split('?')[0]
            if (!target) continue

            if (target.startsWith('/')) {
                if (!isLegalRoute(target)) broken.push({ file, line, url, target })
                continue
            }

            // 相对链接：按文件空间解析，能映射到真实内容文件即合法（与 Astro 逐段 slug 一致）
            const resolved = posix.normalize(posix.join(fileDir, target))
            const asSitePath = docFilePathToSitePath(resolved)
            if (asSitePath !== null && contentPaths.has(asSitePath)) continue
            if (isLegalRoute(resolved)) continue
            broken.push({ file, line, url, target: resolved })
        }
    }
    return broken
}

describe('internal-links: 内容页内部链接完整性', () => {
    it('合法路由集合规模合理（内容页 + 静态页 + redirects）', () => {
        expect(contentPaths.size).toBeGreaterThanOrEqual(160)
        expect(staticPaths.size).toBeGreaterThanOrEqual(9)
        expect(redirectSources.size).toBeGreaterThanOrEqual(35)
    })

    it('全部站内链接均指向真实存在的路由（0 失效）', () => {
        const broken = findBrokenLinks()
        const detail = broken
            .map((b) => `${b.file}:${b.line} 链接「${b.url}」→ 解析为 ${b.target}`)
            .join('\n')
        expect(detail === '' ? [] : detail).toEqual([])
    })

    it('#117 修复的目标路由均在合法集合中', () => {
        const fixedTargets = [
            '/docs-center/入门/',
            '/docs-center/流程与模板/',
            '/docs-center/资源中心/',
            '/docs-center/运营与协作/',
            '/docs-center/体验与反馈/',
            '/archive/2025/',
            '/archive/2025/sensing/激光雷达/',
            '/archive/2025/sensing/摄像头/',
            '/archive/2025/planning-control/高速循迹/',
            '/archive/2025/planning-control/控制/',
            '/archive/2025/planning-control/直线/',
            '/archive/planning-control/资料汇总/',
            '/archive/general/ros-vsc-setup/',
            '/archive/general/vsc-c-c-dev-and-debug/',
            '/en/archive/general/vsc-c-c-dev-and-debug/',
        ]
        const missing = fixedTargets.filter((target) => !contentPaths.has(target))
        expect(missing).toEqual([])
    })
})
