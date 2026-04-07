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
 */
export function generateNonce(): string {
    const array = new Uint8Array(16)
    crypto.getRandomValues(array)
    return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * 获取基础 CSP 指令
 * 支持传入 nonce 来允许特定的内联脚本
 */
export function getCSPDirectives(nonce?: string) {
    const scriptSrc = ["'self'", 'https://cloud.umami.is']

    // 如果有 nonce，使用 nonce 策略；否则在生产环境仍然允许必要的内联脚本
    if (nonce) {
        scriptSrc.push(`'nonce-${nonce}'`)
    } else {
        // 开发环境或静态生成时允许内联脚本
        // 注意：生产环境应该使用 nonce 或严格的 hash
        scriptSrc.push("'unsafe-inline'")
    }

    return {
        'default-src': ["'self'"],
        'script-src': scriptSrc,
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
        // 不升级不安全请求（允许 HTTP 开发环境）
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
        name: 'X-XSS-Protection',
        value: '1; mode=block',
    },
    {
        name: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
    },
    {
        name: 'Permissions-Policy',
        value: [
            'accelerometer=()',
            'camera=()',
            'geolocation=()',
            'gyroscope=()',
            'magnetometer=()',
            'microphone=()',
            'payment=()',
            'usb=()',
        ].join(', '),
    },
    {
        name: 'Cross-Origin-Opener-Policy',
        value: 'same-origin',
    },
    {
        name: 'Cross-Origin-Resource-Policy',
        value: 'same-origin',
    },
]

// 向后兼容的 CSP 指令导出
export const cspDirectives = {
    default: ["'self'"],
    script: ["'self'", "'unsafe-inline'", 'https://cloud.umami.is'],
    style: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    font: ["'self'", 'data:', 'https://fonts.gstatic.com'],
    img: ["'self'", 'data:', 'https:'],
    media: ["'self'", 'data:', 'https:'],
    frame: ["'self'", 'https://www.youtube.com', 'https://player.vimeo.com'],
    connect: ["'self'", 'https://cloud.umami.is', 'https://*.umami.is'],
    worker: ["'self'", 'blob:'],
    manifest: ["'self'"],
}

const CACHE_CONTROL_DEFAULT = 'public, max-age=0, must-revalidate'
const CACHE_CONTROL_IMMUTABLE = 'public, max-age=31536000, immutable'
const CACHE_CONTROL_SERVICE_WORKER = 'no-cache, no-store, must-revalidate'
const CACHE_CONTROL_PRIVATE = 'private, no-store'

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

export function getCacheControlHeader(pathname: string): string {
    if (pathname === '/sw.js') {
        return CACHE_CONTROL_SERVICE_WORKER
    }

    if (
        pathname.startsWith('/admin/') ||
        pathname.startsWith('/api/') ||
        pathname === '/login/' ||
        pathname === '/register/' ||
        pathname === '/profile/'
    ) {
        return CACHE_CONTROL_PRIVATE
    }

    if (pathname.startsWith('/_astro/') || pathname.startsWith('/pagefind/')) {
        return CACHE_CONTROL_IMMUTABLE
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
