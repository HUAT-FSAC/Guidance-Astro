/**
 * 安全配置
 * 定义 Content Security Policy 和安全头部
 */

export interface SecurityHeader {
    name: string
    value: string
}

/**
 * 生成 CSP nonce（用于内联脚本）
 * 在 Workers 环境中每次请求生成新的 nonce
 * 静态构建时使用固定 nonce（通过构建时注入）
 */
export function generateNonce(): string {
    const array = new Uint8Array(16)
    crypto.getRandomValues(array)
    // base64url without padding (22 chars for 16 bytes), OWASP ≥128-bit
    const bin = Array.from(array, (b) => String.fromCharCode(b)).join('')
    if (typeof btoa === 'function') {
        return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    }
    // Node fallback (Vitest jsdom may lack btoa in some envs)
    return Buffer.from(bin, 'binary').toString('base64url')
}

/**
 * 获取基础 CSP 指令
 * 支持传入 nonce 来允许特定的内联脚本
 * 静态部署时要求必须提供 nonce（通过构建时注入）
 */
export function getCSPDirectives(nonce?: string) {
    const scriptSrc = ["'self'", 'https://cloud.umami.is']

    // 必须有 nonce 才允许内联脚本
    if (nonce) {
        scriptSrc.push(`'nonce-${nonce}'`)
    } else {
        // 静态部署无 nonce 时拒绝内联脚本
        // 开发环境通过 dev toolbar 注入 nonce
    }

    return {
        'default-src': ["'self'"],
        'script-src': scriptSrc,
        // 字体已自托管至 /fonts/（@fontsource），移除 Google Fonts 外链，消除大陆网络 RTT 与 CSP 白名单
        'style-src': ["'self'", "'unsafe-inline'"],
        'font-src': ["'self'", 'data:'],
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
        // 不升级不安全请求（允许 HTTP 开发环境，生产建议启用）
        // 'upgrade-insecure-requests': [],
    }
}

/**
 * 生成 CSP 字符串
 */
export function generateCSP(nonce?: string): string {
    const directives = getCSPDirectives(nonce)
    const parts: string[] = []

    for (const [directive, values] of Object.entries(directives)) {
        if (values.length > 0) {
            parts.push(`${directive} ${values.join(' ')}`)
        }
    }

    return parts.join('; ')
}

export const securityHeaders: SecurityHeader[] = [
    {
        name: 'Content-Security-Policy',
        value: generateCSP(), // 默认 CSP，生产环境建议传入 nonce
    },
    {
        name: 'X-Content-Type-Options',
        value: 'nosniff',
    },
    {
        name: 'X-Frame-Options',
        value: 'SAMEORIGIN',
    },
    {
        name: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
    },
    {
        name: 'Permissions-Policy',
        value: ['accelerometer=()', 'gyroscope=()', 'magnetometer=()', 'payment=()', 'usb=()'].join(
            ', '
        ),
    },
    {
        name: 'Cross-Origin-Opener-Policy',
        value: 'same-origin',
    },
    {
        name: 'Cross-Origin-Resource-Policy',
        value: 'same-origin',
    },
    {
        name: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains; preload',
    },
]

const CACHE_CONTROL_DEFAULT = 'public, max-age=3600, must-revalidate' // 1小时
const CACHE_CONTROL_IMMUTABLE = 'public, max-age=31536000, immutable' // 1年，仅用于带哈希的 /_astro /pagefind
const CACHE_CONTROL_SERVICE_WORKER = 'no-cache, no-store, must-revalidate'
const CACHE_CONTROL_STATIC = 'public, max-age=604800, must-revalidate' // 7天
// 图片：长期缓存但未哈希命名时用 must-revalidate 避免永久 stale（_headers 对 /assets 也同步此策略）
// 原错误：所有 /assets 图片返回 max-age=0, must-revalidate，导致每次重校验，LCP 重复下载
// 注意：此值与 public/_headers 中 /assets/* 需保持一致（Shotgun Surgery 但因 Cloudflare 静态资源不经 Worker，需双处配置）
const CACHE_CONTROL_IMAGES = 'public, max-age=31536000, must-revalidate' // 1年 must-revalidate（未哈希，immutable 风险）
const CACHE_CONTROL_FONTS = 'public, max-age=31536000, immutable' // 1年，带哈希的字体文件

function withHeaders(response: Response, apply: (headers: Headers) => void): Response {
    const headers = new Headers(response.headers)
    apply(headers)

    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
    })
}

export function isCSPValid(csp: string): boolean {
    if (csp.includes('script-src *') || csp.includes('script-src-elem *')) {
        return false
    }

    if (csp.includes('style-src *') || csp.includes('style-src-elem *')) {
        return false
    }

    // unsafe-eval 允许 eval() 攻击，不应出现在 CSP 中
    if (csp.includes("'unsafe-eval'")) {
        return false
    }

    // unsafe-inline 仅在 style-src 允许（Starlight 需要），script-src 不应出现
    const directives = csp.split(';').map((d) => d.trim())
    for (const dir of directives) {
        if (dir.startsWith('script-src') && dir.includes("'unsafe-inline'")) {
            return false
        }
    }

    return true
}

export function applySecurityHeaders(response: Response): Response {
    return withHeaders(response, (headers) => {
        for (const header of securityHeaders) {
            if (!headers.has(header.name)) {
                headers.set(header.name, header.value)
            }
        }
    })
}

export function getCacheControlHeader(pathname: string | undefined): string {
    if (!pathname) {
        return CACHE_CONTROL_DEFAULT
    }

    if (pathname === '/sw.js') {
        return CACHE_CONTROL_SERVICE_WORKER
    }

    if (pathname.startsWith('/_astro/') || pathname.startsWith('/pagefind/')) {
        return CACHE_CONTROL_IMMUTABLE
    }

    // 图片资源
    if (pathname.match(/\.(png|jpg|jpeg|gif|webp|avif|svg)$/i)) {
        return CACHE_CONTROL_IMAGES
    }

    // 字体资源
    if (pathname.match(/\.(woff|woff2|ttf|otf|eot)$/i)) {
        return CACHE_CONTROL_FONTS
    }

    // 其他静态资源
    if (pathname.match(/\.(css|js|json)$/i)) {
        return CACHE_CONTROL_STATIC
    }

    return CACHE_CONTROL_DEFAULT
}

/**
 * 应用标准安全头部
 * @param response - HTTP 响应
 * @param pathname - 请求路径
 * @param nonce - 可选的 CSP nonce
 */
export function applyStandardHeaders(
    response: Response,
    pathname: string,
    nonce?: string
): Response {
    return withHeaders(response, (headers) => {
        // 应用安全头部
        for (const header of securityHeaders) {
            if (header.name === 'Content-Security-Policy' && nonce) {
                // 使用带 nonce 的 CSP
                headers.set(header.name, generateCSP(nonce))
            } else if (!headers.has(header.name)) {
                headers.set(header.name, header.value)
            }
        }

        if (!headers.has('Cache-Control')) {
            headers.set('Cache-Control', getCacheControlHeader(pathname))
        }
    })
}
