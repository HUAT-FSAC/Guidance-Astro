/**
 * 安全配置
 * 定义 Content Security Policy 和安全头部
 */

export interface SecurityHeader {
    name: string
    value: string
}

export const securityHeaders: SecurityHeader[] = [
    {
        name: 'Content-Security-Policy',
        value: [
            "default-src 'self'",
            // TODO: 迁移到 nonce-based CSP 以移除 'unsafe-inline'（需要 Astro middleware 支持）
            "script-src 'self' 'unsafe-inline' https://cloud.umami.is https://www.google-analytics.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' data: https://fonts.gstatic.com",
            "img-src 'self' data: https:",
            "media-src 'self' data: https:",
            "frame-src 'self' https://www.youtube.com https://player.vimeo.com",
            "connect-src 'self' https://cloud.umami.is https://*.umami.is",
            "worker-src 'self' blob:",
            "manifest-src 'self'",
        ].join('; '),
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

export const cspDirectives = {
    default: ["'self'"],
    script: [
        "'self'",
        // TODO: 迁移到 nonce-based CSP 以移除 'unsafe-inline'
        "'unsafe-inline'",
        'https://cloud.umami.is',
        'https://www.google-analytics.com',
    ],
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

export function generateCSP(directives = cspDirectives) {
    const parts: string[] = []

    for (const [directive, values] of Object.entries(directives)) {
        if (values.length > 0) {
            parts.push(`${directive} ${values.join(' ')}`)
        }
    }

    return parts.join('; ')
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

export function applyStandardHeaders(response: Response, pathname: string): Response {
    return withHeaders(response, (headers) => {
        for (const header of securityHeaders) {
            if (!headers.has(header.name)) {
                headers.set(header.name, header.value)
            }
        }

        if (!headers.has('Cache-Control')) {
            headers.set('Cache-Control', getCacheControlHeader(pathname))
        }
    })
}
