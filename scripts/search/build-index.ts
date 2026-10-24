/**
 * 构建期搜索索引编排（#262 / D-022）。
 *
 * 在 `astro build` 退出、Cloudflare 最终产物就绪后运行：
 * 1. 读取构建期注入并已分类的 `dist/client/_search-manifest.json`；
 * 2. 启动本地 Wrangler（无部署凭据、无远程 bindings）提供真实 Worker SSR；
 * 3. 逐条请求候选页的真实 HTML（redirect:manual；HTTP 3xx 与 HTML 导航重定向壳排除；
 *    非预期状态 / 跨源 / 非 HTML / 缺 data-pagefind-body 一律失败）；
 * 4. 交给 Pagefind `addHTMLFile`（逐页校验 errors 与返回 URL）；
 * 5. 完整新 bundle 先写临时目录，校验语言覆盖后原子替换 `dist/client/pagefind`；
 * 6. 校验 sitemap 不含内部清单，finally 关闭 Pagefind / Wrangler 并删除临时产物与清单。
 *
 * 任何失败都以非零退出且不产出可误用的旧索引。运行要求 Node ≥22.18（原生 TS 类型剥离）。
 */
import { type ChildProcess, spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdtemp, readdir, readFile, rename, rm, stat } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import {
    encodedRouteUrl,
    htmlRedirectShell,
} from '../../src/integrations/search-manifest-filter.ts'

const ROOT = process.cwd()
const CLIENT_DIR = path.join(ROOT, 'dist', 'client')
const MANIFEST_PATH = path.join(CLIENT_DIR, '_search-manifest.json')
const PAGEFIND_DIR = path.join(CLIENT_DIR, 'pagefind')
const SERVER_PORT = 8788
const BASE_URL = `http://127.0.0.1:${SERVER_PORT}`
const SERVER_START_TIMEOUT_MS = 90_000
const OVERALL_DEADLINE_MS = 300_000
const FETCH_CONCURRENCY = 4
const EXCLUDED_SAMPLE_LIMIT = 12

interface Candidate {
    id: string
    locale: 'zh' | 'en'
    url: string
}

interface FetchExcluded extends Candidate {
    reason: 'http-redirect' | 'html-shell'
}

interface ManifestExcluded extends Candidate {
    reason: 'draft' | 'pagefind-false' | 'not-found-page' | 'locale-fallback'
}

interface PagefindNewFileResponse {
    errors: string[]
    file?: { uniqueWords: number; url: string; meta: Record<string, string> }
}

interface PagefindIndex {
    addHTMLFile: (file: { url: string; content: string }) => Promise<PagefindNewFileResponse>
    writeFiles: (options: {
        outputPath: string
    }) => Promise<{ errors: string[]; outputPath: string }>
}

let wrangler: ChildProcess | null = null
let wranglerLog = ''
let tmpOutputDir: string | null = null
let pagefindModule: { close?: () => Promise<unknown> } | null = null

/** 从 starlight 解析位置向上定位兄弟依赖目录（pnpm 虚拟 store 与提升布局都适用；
 * 跳过名为 node_modules 的祖先段本身，等价 Node 的模块解析路径算法）。 */
function findSiblingPackageDir(startDir: string, name: string): string {
    let current = path.resolve(startDir)
    while (true) {
        const candidate =
            path.basename(current) === 'node_modules'
                ? path.join(current, name)
                : path.join(current, 'node_modules', name)
        if (existsSync(candidate)) return candidate
        const parent = path.dirname(current)
        if (parent === current) throw new Error(`cannot locate ${name} starting from ${startDir}`)
        current = parent
    }
}

/** Pagefind 是 @astrojs/starlight 的既有依赖（不新增依赖，也不硬编码 .pnpm 哈希路径）：
 * 通过 starlight 的解析位置定位其兄弟安装目录，再按 pagefind 自己的 exports 入口加载。 */
async function loadPagefindModule(): Promise<{
    createIndex: () => Promise<{ errors: string[]; index?: PagefindIndex }>
    close?: () => Promise<unknown>
}> {
    const require = createRequire(import.meta.url)
    const starlightDir = path.dirname(require.resolve('@astrojs/starlight'))
    const pagefindDir = findSiblingPackageDir(starlightDir, 'pagefind')
    const pkg = JSON.parse(await readFile(path.join(pagefindDir, 'package.json'), 'utf8'))
    const entry = pkg.exports?.['.']?.import ?? pkg.main
    if (!entry) throw new Error('cannot resolve pagefind entry from its package exports')
    return import(pathToFileURL(path.join(pagefindDir, entry)).href)
}

async function waitForServer(): Promise<void> {
    const startedAt = Date.now()
    while (Date.now() - startedAt < SERVER_START_TIMEOUT_MS) {
        if (wrangler?.exitCode !== null && wrangler?.exitCode !== undefined) {
            throw new Error(
                `local wrangler exited early (code ${wrangler.exitCode}):\n${wranglerLog.slice(-2000)}`
            )
        }
        try {
            const res = await fetch(BASE_URL + '/', {
                redirect: 'manual',
                signal: AbortSignal.timeout(2_000),
            })
            if (res.status > 0) return
        } catch {
            // 服务未就绪，继续轮询
        }
        await new Promise((resolve) => setTimeout(resolve, 500))
    }
    throw new Error(
        `local wrangler not ready within ${SERVER_START_TIMEOUT_MS}ms:\n${wranglerLog.slice(-2000)}`
    )
}

async function stopWrangler(): Promise<void> {
    const child = wrangler
    wrangler = null
    if (!child || child.exitCode !== null) return
    await new Promise<void>((resolve) => {
        const killTimer = setTimeout(() => {
            try {
                child.kill('SIGKILL')
            } catch {
                /* 已退出 */
            }
        }, 5_000)
        child.once('exit', () => {
            clearTimeout(killTimer)
            resolve()
        })
        child.kill('SIGTERM')
    })
}

async function cleanup(): Promise<void> {
    await stopWrangler()
    try {
        await pagefindModule?.close?.()
    } catch {
        /* 服务已停止 */
    }
    pagefindModule = null
    if (tmpOutputDir) await rm(tmpOutputDir, { recursive: true, force: true })
    tmpOutputDir = null
    await rm(MANIFEST_PATH, { force: true })
}

async function fetchAllPages(
    candidates: readonly Candidate[]
): Promise<{ pages: Map<string, string>; excluded: FetchExcluded[] }> {
    const pages = new Map<string, string>()
    const excluded: FetchExcluded[] = []
    const failures: string[] = []
    let cursor = 0

    async function worker(): Promise<void> {
        while (cursor < candidates.length && failures.length === 0) {
            const candidate = candidates[cursor++]
            try {
                const res = await fetch(BASE_URL + encodedRouteUrl(candidate.url), {
                    redirect: 'manual',
                    signal: AbortSignal.timeout(30_000),
                })
                if (res.status >= 300 && res.status < 400) {
                    excluded.push({ ...candidate, reason: 'http-redirect' })
                    continue
                }
                if (res.status !== 200) {
                    failures.push(`${candidate.url}: unexpected status ${res.status}`)
                    continue
                }
                const contentType = res.headers.get('content-type') ?? ''
                if (!contentType.includes('text/html')) {
                    failures.push(`${candidate.url}: non-html content-type "${contentType}"`)
                    continue
                }
                if (!res.url.startsWith(BASE_URL)) {
                    failures.push(`${candidate.url}: cross-origin response url ${res.url}`)
                    continue
                }
                const html = await res.text()
                if (htmlRedirectShell(html)) {
                    excluded.push({ ...candidate, reason: 'html-shell' })
                    continue
                }
                if (!html.includes('data-pagefind-body')) {
                    failures.push(`${candidate.url}: 200 html without data-pagefind-body marker`)
                    continue
                }
                pages.set(candidate.url, html)
            } catch (error) {
                failures.push(
                    `${candidate.url}: ${error instanceof Error ? error.message : String(error)}`
                )
            }
        }
    }

    await Promise.all(Array.from({ length: FETCH_CONCURRENCY }, worker))
    if (failures.length > 0) throw new Error(`page fetch failures:\n${failures.join('\n')}`)
    return { pages, excluded }
}

function printExcluded(reason: string, urls: string[]): void {
    if (urls.length === 0) return
    const sample = urls.slice(0, EXCLUDED_SAMPLE_LIMIT).join(' ')
    const more =
        urls.length > EXCLUDED_SAMPLE_LIMIT ? ` …(+${urls.length - EXCLUDED_SAMPLE_LIMIT})` : ''
    console.log(`[search-index] excluded ${reason}: ${urls.length} — ${sample}${more}`)
}

async function main(): Promise<void> {
    if (!existsSync(MANIFEST_PATH)) {
        throw new Error(
            'missing _search-manifest.json — this script runs after `astro build`, not standalone'
        )
    }
    const manifest = JSON.parse(await readFile(MANIFEST_PATH, 'utf8')) as {
        candidates?: Candidate[]
        excluded?: ManifestExcluded[]
    }
    const candidates = manifest.candidates
    if (!Array.isArray(candidates) || candidates.length === 0)
        throw new Error('manifest has no candidates')
    for (const locale of ['zh', 'en'] as const) {
        if (!candidates.some((candidate) => candidate.locale === locale)) {
            throw new Error(`locale coverage broken: no ${locale} documents in the manifest`)
        }
    }

    const wranglerBin = path.join(ROOT, 'node_modules', '.bin', 'wrangler')
    if (!existsSync(wranglerBin))
        throw new Error('wrangler binary not found — run `pnpm install` first')
    wrangler = spawn(
        wranglerBin,
        [
            'dev',
            path.join('dist', 'server', 'entry.mjs'),
            '--config',
            path.join('dist', 'server', 'wrangler.json'),
            '--port',
            String(SERVER_PORT),
            '--ip',
            '127.0.0.1',
        ],
        {
            cwd: ROOT,
            stdio: ['ignore', 'pipe', 'pipe'],
            env: { ...process.env, WRANGLER_SEND_METRICS: 'false' },
        }
    )
    wrangler.stdout?.on('data', (chunk) => {
        wranglerLog += chunk
    })
    wrangler.stderr?.on('data', (chunk) => {
        wranglerLog += chunk
    })
    await waitForServer()

    const { pages, excluded: fetchExcluded } = await fetchAllPages(candidates)

    const pagefind = await loadPagefindModule()
    pagefindModule = pagefind
    const created = await pagefind.createIndex()
    if (created.errors?.length > 0)
        throw new Error(`createIndex errors: ${created.errors.join('; ')}`)
    if (!created.index) throw new Error('createIndex returned no index')
    const index = created.index

    const addedPerLocale = { zh: 0, en: 0 }
    for (const candidate of candidates) {
        const html = pages.get(candidate.url)
        if (html === undefined) continue // fetch 阶段被排除
        const added = await index.addHTMLFile({ url: candidate.url, content: html })
        if (added.errors?.length > 0) {
            throw new Error(`addHTMLFile ${candidate.url}: ${added.errors.join('; ')}`)
        }
        if (added.file?.url !== undefined && added.file.url !== candidate.url) {
            throw new Error(`addHTMLFile URL mismatch: ${added.file.url} != ${candidate.url}`)
        }
        addedPerLocale[candidate.locale]++
    }

    tmpOutputDir = await mkdtemp(path.join(CLIENT_DIR, '.pagefind-tmp-'))
    const written = await index.writeFiles({ outputPath: tmpOutputDir })
    if (written.errors?.length > 0)
        throw new Error(`writeFiles errors: ${written.errors.join('; ')}`)

    const bundleEntry = JSON.parse(
        await readFile(path.join(tmpOutputDir, 'pagefind-entry.json'), 'utf8')
    )
    const languages = Object.keys(bundleEntry.languages ?? {})
    if (languages.length < 2)
        throw new Error(`bundle language coverage broken: [${languages.join(', ')}]`)
    for (const locale of ['zh', 'en'] as const) {
        if (addedPerLocale[locale] === 0)
            throw new Error(`locale coverage broken: no ${locale} page was indexed`)
    }

    await rm(PAGEFIND_DIR, { recursive: true, force: true })
    await rename(tmpOutputDir, PAGEFIND_DIR)
    tmpOutputDir = null

    if (await sitemapContains('_search-manifest')) {
        throw new Error('sitemap contains the internal search manifest URL')
    }

    const bundle = await directoryStats(PAGEFIND_DIR)
    console.log('[search-index] done')
    console.log(
        `[search-index] indexed: zh=${addedPerLocale.zh} en=${addedPerLocale.en} (total ${addedPerLocale.zh + addedPerLocale.en})`
    )
    const manifestByReason = new Map<string, string[]>()
    for (const entry of manifest.excluded ?? []) {
        const list = manifestByReason.get(entry.reason) ?? []
        list.push(entry.url)
        manifestByReason.set(entry.reason, list)
    }
    for (const [reason, urls] of manifestByReason) printExcluded(reason, urls)
    const fetchByReason = new Map<string, string[]>()
    for (const entry of fetchExcluded) {
        const list = fetchByReason.get(entry.reason) ?? []
        list.push(entry.url)
        fetchByReason.set(entry.reason, list)
    }
    for (const [reason, urls] of fetchByReason) printExcluded(reason, urls)
    console.log(
        `[search-index] bundle: ${bundle.files} files, ${(bundle.bytes / 1024).toFixed(1)} KiB, languages=[${languages.join(', ')}]`
    )
}

async function directoryStats(dir: string): Promise<{ files: number; bytes: number }> {
    let files = 0
    let bytes = 0
    async function walk(current: string): Promise<void> {
        for (const entry of await readdir(current, { withFileTypes: true })) {
            const full = path.join(current, entry.name)
            if (entry.isDirectory()) await walk(full)
            else {
                files++
                bytes += (await stat(full)).size
            }
        }
    }
    await walk(dir)
    return { files, bytes }
}

async function sitemapContains(needle: string): Promise<boolean> {
    const entries = await readdir(CLIENT_DIR)
    for (const name of entries.filter(
        (file) => file.startsWith('sitemap-') && file.endsWith('.xml')
    )) {
        const xml = await readFile(path.join(CLIENT_DIR, name), 'utf8')
        if (xml.includes(needle)) return true
    }
    return false
}

const deadline = setTimeout(() => {
    console.error(`[search-index] overall deadline of ${OVERALL_DEADLINE_MS}ms exceeded`)
    process.exit(1)
}, OVERALL_DEADLINE_MS)
deadline.unref?.()

try {
    await main()
} catch (error) {
    console.error('[search-index] FAILED:', error instanceof Error ? error.message : error)
    if (wranglerLog)
        console.error(`[search-index] local server log tail:\n${wranglerLog.slice(-2000)}`)
    process.exitCode = 1
} finally {
    clearTimeout(deadline)
    await cleanup()
    if (process.exitCode) {
        // 失败时不保留旧 bundle：残留的旧索引可能被后续 deploy 误用为「搜索可用」
        const removed = await rm(PAGEFIND_DIR, { recursive: true, force: true }).then(
            () => true,
            () => false
        )
        console.error(
            removed
                ? '[search-index] exited nonzero; stale pagefind bundle removed and manifest deleted'
                : '[search-index] exited nonzero; manifest deleted (no stale bundle present)'
        )
    }
}
