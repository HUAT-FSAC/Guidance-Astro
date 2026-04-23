import { describe, expect, it } from 'vitest'

import {
    applySecurityHeaders,
    applyStandardHeaders,
    getCacheControlHeader,
    securityHeaders,
} from './security'

describe('security headers', () => {
    it('applies the default security headers to a response', () => {
        const response = applySecurityHeaders(new Response('ok'))

        for (const header of securityHeaders) {
            expect(response.headers.get(header.name)).toBe(header.value)
        }
    })

    it('preserves headers that were explicitly set by the response creator', () => {
        const response = applySecurityHeaders(
            new Response('ok', {
                headers: {
                    'Content-Security-Policy': "default-src 'none'",
                },
            })
        )

        expect(response.headers.get('Content-Security-Policy')).toBe("default-src 'none'")
        expect(response.headers.get('X-Frame-Options')).toBe('SAMEORIGIN')
    })

    it('returns a no-cache policy for HTML pages and the service worker', () => {
        expect(getCacheControlHeader('/docs-center/')).toBe('public, max-age=3600, must-revalidate')
        expect(getCacheControlHeader('/sw.js')).toBe('no-cache, no-store, must-revalidate')
    })

    it('returns a private no-store policy for auth and admin routes', () => {
        expect(getCacheControlHeader('/login/')).toBe('private, no-store')
        expect(getCacheControlHeader('/profile/')).toBe('private, no-store')
        expect(getCacheControlHeader('/admin/users/')).toBe('private, no-store')
        expect(getCacheControlHeader('/api/auth/me/')).toBe('private, no-store')
    })

    it('returns an immutable cache policy for fingerprinted build assets', () => {
        expect(getCacheControlHeader('/_astro/app.12345.js')).toBe(
            'public, max-age=31536000, immutable'
        )
        expect(getCacheControlHeader('/pagefind/pagefind.js')).toBe(
            'public, max-age=31536000, immutable'
        )
    })

    it('applies cache control alongside security headers without overwriting explicit values', () => {
        const defaultResponse = applyStandardHeaders(new Response('ok'), '/archive/2025/sensing/')
        expect(defaultResponse.headers.get('Cache-Control')).toBe(
            'public, max-age=3600, must-revalidate'
        )
        expect(defaultResponse.headers.get('X-Frame-Options')).toBe('SAMEORIGIN')

        const customResponse = applyStandardHeaders(
            new Response('ok', {
                headers: {
                    'Cache-Control': 'private, max-age=60',
                },
            }),
            '/sw.js'
        )
        expect(customResponse.headers.get('Cache-Control')).toBe('private, max-age=60')
    })
})
