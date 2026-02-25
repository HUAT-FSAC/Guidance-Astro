/**
 * 安全配置
 * 定义 Content Security Policy 和安全头部
 */

export const securityHeaders = [
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
