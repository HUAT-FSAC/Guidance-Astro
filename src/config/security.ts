import { withHeaders, type MiddlewareResponseHandler } from 'astro:middleware';

const securityHeaders = [
    { name: 'X-Frame-Options', value: 'DENY' },
    { name: 'X-Content-Type-Options', value: 'nosniff' },
    { name: 'X-XSS-Protection', value: '1; mode=block' },
    { name: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { name: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' },
    { name: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
    { name: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
] as const;

function generateCSP(nonce?: string): string {
    const directives: string[] = [
        "default-src 'self'",
        "script-src 'strict-dynamic'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self'",
        "connect-src 'self' https:",
        "media-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
    ];

    if (nonce) {
        directives.push(`script-src 'nonce-${nonce}'`);
    }

    return directives.join('; ');
}

function getCacheControlHeader(pathname: string): string {
    if (pathname.startsWith('/api/')) {
        return 'no-cache, no-store, must-revalidate';
    }
    if (pathname.match(/\.(js|css|png|jpg|jpeg|svg|ico)$/)) {
        return 'public, max-age=31536000, immutable';
    }
    return 'public, max-age=600';
}

export function applyStandardHeaders(
    response: Response,
    pathname: string,
    nonce?: string
): Response {
    return withHeaders(response, (headers) => {
        headers.set('Content-Security-Policy', generateCSP(nonce));

        for (const header of securityHeaders) {
            if (!headers.has(header.name)) {
                headers.set(header.name, header.value);
            }
        }

        if (!headers.has('Cache-Control')) {
            headers.set('Cache-Control', getCacheControlHeader(pathname));
        }
    });
}

export function createSecurityMiddleware(): MiddlewareResponseHandler {
    return async ({ request, next }) => {
        const nonce = crypto.randomUUID();
        const response = await next();
        const pathname = new URL(request.url).pathname;
        return applyStandardHeaders(response, pathname, nonce);
    };
}