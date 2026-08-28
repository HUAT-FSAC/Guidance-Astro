/**
 * 构建后安全头生成脚本
 * 扫描构建产物中的所有 HTML 页面，收集内联脚本内容的 SHA-256 hash，
 * 生成一条覆盖全站的 Content-Security-Policy。
 *
 * 静态部署下每请求 nonce 不可行（预渲染页面构建期固定），
 * hash 是静态站点的标准强 CSP 方案：构建时收集，不可能遗漏。
 *
 * Chrome 的 CSP 解析存在一个隐蔽行为：hash 的 base64 串中
 * 第一个 `/` 必须出现在第一个 `+` 之前（或完全不含 `+`/`/`），
 * 否则该 hash 被判 invalid 并忽略（实测 100/100 样本无例外）。
 * 对不符合条件的脚本，本脚本在脚本内容前插入注释（/*c<n>*\/）改变
 * 内容从而改变 hash，迭代直到符合条件——纯注释不改变执行语义。
 *
 * CF Pages _headers 每行上限 2000 字符，本站 hash 列表约 3200 字符，
 * 因此 CSP 通过 <meta> 注入每页 <head>（无长度限制），
 * _headers 只负责其余安全头与缓存规则。
 */
import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const DIST = 'dist/client'
const OUT_FILE = join(DIST, '_headers')

const HEADERS_LINE_LIMIT = 2000
const MAX_HASH_RETRIES = 40

const CACHE_HEADERS = `/_astro/*
  Cache-Control: public, max-age=31536000, immutable
/pagefind/*
  Cache-Control: public, max-age=31536000, immutable
`

function collectHtmlFiles(dir) {
    const out = []
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry)
        const stat = statSync(full)
        if (stat.isDirectory()) out.push(...collectHtmlFiles(full))
        else if (entry.endsWith('.html')) out.push(full)
    }
    return out
}

/**
 * Chrome 接受 hash 的规则（实测验证）：
 * base64 中第一个 `/` 必须早于第一个 `+`，或 base64 不含 `+`。
 */
function isHashAccepted(base64) {
    const slash = base64.indexOf('/')
    if (slash < 0) return false
    const plus = base64.indexOf('+')
    return plus < 0 || slash < plus
}

const SCRIPT_RE = /<script([^>]*?)>([\s\S]*?)<\/script>/gi

function isExecutableScript(attrs) {
    const type = (attrs.match(/type\s*=\s*["']([^"']*)["']/) || [])[1]
    return !type || /^(text\/)?(javascript|module)$/i.test(type.trim())
}

/**
 * 遍历所有 HTML，对每个内联脚本：若 hash 不被 Chrome 接受，
 * 且该脚本可执行（非 JSON 数据脚本），则在脚本内容前插入注释
 * （/*c<n>*\/）迭代重算直到被接受——纯注释不改变执行语义。
 * JSON 数据脚本（type=application/json 等）不执行、无法插入注释
 * （会破坏 JSON），仅收集 hash；其 hash 若不被接受则报错退出。
 * 返回全部 hash 集合（去重）。
 */
function normalizeScripts() {
    const hashes = new Set()
    let patched = 0
    for (const file of collectHtmlFiles(DIST)) {
        const html = readFileSync(file, 'utf8')
        let match
        let modified = null
        SCRIPT_RE.lastIndex = 0
        while ((match = SCRIPT_RE.exec(html)) !== null) {
            const [full, attrs, body] = match
            if (/src\s*=/.test(attrs) || !body.trim()) continue

            const executable = isExecutableScript(attrs)
            let finalBody = body
            let base64 = createHash('sha256').update(finalBody).digest('base64')
            if (!isHashAccepted(base64) && executable) {
                let n = 0
                let nextBody = `/*c${n}*/${body}`
                let nextB64 = createHash('sha256').update(nextBody).digest('base64')
                while (!isHashAccepted(nextB64) && n < MAX_HASH_RETRIES) {
                    n++
                    nextBody = `/*c${n}*/${body}`
                    nextB64 = createHash('sha256').update(nextBody).digest('base64')
                }
                if (n >= MAX_HASH_RETRIES) {
                    console.error(`[headers] FAILED to find accepted hash for script in ${file}`)
                    process.exit(1)
                }
                finalBody = nextBody
                base64 = nextB64
                patched++
            }
            if (!isHashAccepted(base64)) {
                console.error(`[headers] non-executable script hash rejected by Chrome in ${file}`)
                process.exit(1)
            }
            hashes.add(`sha256-${base64}`)
            if (finalBody !== body) {
                modified ??= html
                modified = modified.replace(full, full.replace(body, finalBody))
            }
        }
        if (modified) writeFileSync(file, modified, 'utf8')
    }
    console.log(`[headers] patched ${patched} inline scripts for Chrome hash acceptance`)
    return [...hashes]
}

function buildCsp(hashes) {
    const directives = {
        'default-src': ["'self'"],
        'script-src': ["'self'", 'https://cloud.umami.is', ...hashes],
        'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        'font-src': ["'self'", 'data:', 'https://fonts.gstatic.com'],
        'img-src': ["'self'", 'data:', 'https:', 'blob:'],
        'media-src': ["'self'", 'data:', 'https:'],
        'frame-src': ["'self'", 'https://www.youtube.com', 'https://player.vimeo.com'],
        'connect-src': ["'self'", 'https://cloud.umami.is', 'https://*.umami.is'],
        'worker-src': ["'self'", 'blob:'],
        'manifest-src': ["'self'"],
        'base-uri': ["'self'"],
        'form-action': ["'self'"],
        'object-src': ["'none'"],
        'frame-ancestors': ["'self'"],
    }
    return Object.entries(directives)
        .filter(([, values]) => values.length > 0)
        .map(([name, values]) => `${name} ${values.join(' ')}`)
        .join('; ')
}

function main() {
    if (!existsSync(DIST)) {
        console.error(`[headers] dist/client not found, run build first`)
        process.exit(1)
    }

    const hashes = normalizeScripts()
    const csp = buildCsp(hashes)

    if (csp.length <= HEADERS_LINE_LIMIT - 30) {
        writeFileSync(OUT_FILE, buildHeadersFile(csp), 'utf8')
        console.log(`[headers] CSP (${csp.length} chars) fits in _headers, writing header`)
    } else {
        injectCspMeta(csp)
        writeFileSync(OUT_FILE, buildHeadersFile(null), 'utf8')
        console.log(
            `[headers] CSP (${csp.length} chars) exceeds ${HEADERS_LINE_LIMIT} line limit, ` +
                `injected <meta> into ${collectHtmlFiles(DIST).length} pages`
        )
    }
}

function buildHeadersFile(csp) {
    const cspLine = csp ? `  Content-Security-Policy: ${csp}\n` : ''
    return `${CACHE_HEADERS}/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: SAMEORIGIN
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: accelerometer=(), gyroscope=(), magnetometer=(), payment=(), usb=()
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Resource-Policy: same-origin
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
 ${cspLine}`
}

function injectCspMeta(csp) {
    const meta = `<meta http-equiv="Content-Security-Policy" content="${csp}">`
    for (const file of collectHtmlFiles(DIST)) {
        const html = readFileSync(file, 'utf8')
        if (!/<head[^>]*>/i.test(html) || /http-equiv="content-security-policy"/i.test(html))
            continue
        writeFileSync(
            file,
            html.replace(/<head[^>]*>/i, (m) => m + meta),
            'utf8'
        )
    }
}

main()
