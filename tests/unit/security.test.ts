import { describe, expect, it } from 'vitest'

import {
    generateCSP,
    getCacheControlHeader,
    isCSPValid,
    securityHeaders,
} from '../../src/config/security'

describe('security config', () => {
    describe('getCacheControlHeader', () => {
        it('returns immutable cache for _astro assets', () => {
            expect(getCacheControlHeader('/_astro/main.abc123.js')).toBe(
                'public, max-age=31536000, immutable'
            )
        })

        it('returns immutable cache for pagefind assets', () => {
            expect(getCacheControlHeader('/pagefind/pagefind-entry.json')).toBe(
                'public, max-age=31536000, immutable'
            )
        })

        it('returns medium cache for HTML pages', () => {
            expect(getCacheControlHeader('/docs-center/')).toBe(
                'public, max-age=3600, must-revalidate'
            )
        })

        it('returns no-store for service worker', () => {
            expect(getCacheControlHeader('/sw.js')).toBe('no-cache, no-store, must-revalidate')
        })

        it('returns static cache for JS and CSS files', () => {
            expect(getCacheControlHeader('/assets/main.js')).toBe(
                'public, max-age=604800, must-revalidate'
            )
        })

        it('returns static cache for JSON files', () => {
            expect(getCacheControlHeader('/manifest.json')).toBe(
                'public, max-age=604800, must-revalidate'
            )
        })

        it('returns image cache for image files', () => {
            expect(getCacheControlHeader('/logo.png')).toBe(
                'public, max-age=2592000, must-revalidate'
            )
        })

        it('returns font cache for font files', () => {
            expect(getCacheControlHeader('/font.woff2')).toBe('public, max-age=31536000, immutable')
        })

        it('returns default cache for root path', () => {
            expect(getCacheControlHeader('/')).toBe('public, max-age=3600, must-revalidate')
        })

        it('returns default cache for undefined path', () => {
            expect(getCacheControlHeader(undefined)).toBe('public, max-age=3600, must-revalidate')
        })
    })

    describe('securityHeaders', () => {
        it('includes X-Content-Type-Options', () => {
            const header = securityHeaders.find((h) => h.name === 'X-Content-Type-Options')
            expect(header?.value).toBe('nosniff')
        })

        it('includes X-Frame-Options', () => {
            const header = securityHeaders.find((h) => h.name === 'X-Frame-Options')
            expect(header?.value).toBe('SAMEORIGIN')
        })

        it('includes Referrer-Policy', () => {
            const header = securityHeaders.find((h) => h.name === 'Referrer-Policy')
            expect(header?.value).toBe('strict-origin-when-cross-origin')
        })

        it('includes Permissions-Policy with camera and microphone', () => {
            const header = securityHeaders.find((h) => h.name === 'Permissions-Policy')
            expect(header?.value).toContain('camera=()')
            expect(header?.value).toContain('microphone=()')
        })
    })

    describe('generateCSP', () => {
        it('generates a CSP string with required directives', () => {
            const csp = generateCSP()
            expect(csp).toContain("default-src 'self'")
            expect(csp).toContain('script-src')
            expect(csp).toContain('style-src')
        })

        it('includes nonce when provided', () => {
            const csp = generateCSP('test-nonce-123')
            expect(csp).toContain("'nonce-test-nonce-123'")
        })
    })

    describe('isCSPValid', () => {
        it('rejects wildcard script-src', () => {
            expect(isCSPValid("default-src 'self'; script-src *")).toBe(false)
        })

        it('rejects unsafe-eval', () => {
            expect(isCSPValid("default-src 'self'; script-src 'self' 'unsafe-eval'")).toBe(false)
        })

        it('accepts valid CSP', () => {
            expect(isCSPValid("default-src 'self'; script-src 'self'")).toBe(true)
        })
    })
})
