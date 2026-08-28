import { describe, expect, it } from 'vitest'

import {
    applySecurityHeaders,
    applyStandardHeaders,
    generateCSP,
    generateNonce,
    getCacheControlHeader,
    getCSPDirectives,
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

        it('includes Permissions-Policy with accelerometer and gyroscope disabled', () => {
            const header = securityHeaders.find((h) => h.name === 'Permissions-Policy')
            expect(header?.value).toContain('accelerometer=()')
            expect(header?.value).toContain('gyroscope=()')
        })

        it('includes Strict-Transport-Security with max-age 31536000', () => {
            const hsts = securityHeaders.find((h) => h.name === 'Strict-Transport-Security')
            expect(hsts).toBeDefined()
            expect(hsts?.value).toBe('max-age=31536000; includeSubDomains; preload')
        })

        it('contains exactly 8 security headers (CSP + 7 hardening)', () => {
            expect(securityHeaders).toHaveLength(8)
            const names = securityHeaders.map((h) => h.name)
            expect(names).toEqual(
                expect.arrayContaining([
                    'Content-Security-Policy',
                    'X-Content-Type-Options',
                    'X-Frame-Options',
                    'Referrer-Policy',
                    'Permissions-Policy',
                    'Cross-Origin-Opener-Policy',
                    'Cross-Origin-Resource-Policy',
                    'Strict-Transport-Security',
                ])
            )
        })
    })

    describe('generateCSP', () => {
        it('generates a CSP string with required directives', () => {
            const csp = generateCSP()
            expect(csp).toContain("default-src 'self'")
            expect(csp).toContain('script-src')
            expect(csp).toContain('style-src')
        })

        it('includes nonce when provided and is base64url friendly', () => {
            const csp = generateCSP('test-nonce-123')
            expect(csp).toContain("'nonce-test-nonce-123'")
            // script-src must not contain unsafe-inline
            const scriptSrc = csp.split(';').find((d) => d.trim().startsWith('script-src'))!
            expect(scriptSrc).not.toContain("'unsafe-inline'")
        })

        it('contains object-src none and frame-ancestors self', () => {
            const csp = generateCSP()
            expect(csp).toContain("object-src 'none'")
            expect(csp).toContain("frame-ancestors 'self'")
        })

        it('style-src retains unsafe-inline for Starlight but script-src never does', () => {
            const without = generateCSP()
            const withNonce = generateCSP('abc123')
            expect(without).toContain("style-src 'self' 'unsafe-inline'")
            expect(withNonce).toContain("style-src 'self' 'unsafe-inline'")
            for (const csp of [without, withNonce]) {
                const scriptSrc = csp.split(';').find((d) => d.trim().startsWith('script-src'))!
                expect(scriptSrc).not.toContain("'unsafe-inline'")
            }
        })

        it('generated CSP is considered valid by isCSPValid', () => {
            expect(isCSPValid(generateCSP())).toBe(true)
            expect(isCSPValid(generateCSP('any-nonce'))).toBe(true)
        })
    })

    describe('getCSPDirectives', () => {
        it('returns object-src none and frame-ancestors self', () => {
            const dirs = getCSPDirectives()
            expect(dirs['object-src']).toEqual(["'none'"])
            expect(dirs['frame-ancestors']).toEqual(["'self'"])
        })

        it('script-src contains nonce when provided', () => {
            const dirs = getCSPDirectives('my-nonce')
            expect(dirs['script-src']).toContain("'nonce-my-nonce'")
        })

        it('script-src does not contain unsafe-inline', () => {
            const dirs = getCSPDirectives('x')
            expect(dirs['script-src']).not.toContain("'unsafe-inline'")
            const dirsNoNonce = getCSPDirectives()
            expect(dirsNoNonce['script-src']).not.toContain("'unsafe-inline'")
        })
    })

    describe('generateNonce', () => {
        it('produces base64url 22-char string without padding', () => {
            const nonce = generateNonce()
            expect(nonce).toMatch(/^[A-Za-z0-9_-]{22}$/)
            expect(nonce).not.toContain('=')
            expect(nonce).not.toContain('+')
            expect(nonce).not.toContain('/')
        })

        it('generates unique values per call', () => {
            const a = generateNonce()
            const b = generateNonce()
            expect(a).not.toBe(b)
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

        it('allows style-src unsafe-inline (Starlight) but rejects script-src unsafe-inline', () => {
            expect(isCSPValid("default-src 'self'; style-src 'self' 'unsafe-inline'")).toBe(true)
            expect(isCSPValid("default-src 'self'; script-src 'self' 'unsafe-inline'")).toBe(false)
        })

        it('rejects script-src-elem wildcard and style-src wildcard', () => {
            expect(isCSPValid("default-src 'self'; script-src-elem *")).toBe(false)
            expect(isCSPValid("default-src 'self'; style-src *")).toBe(false)
        })
    })

    describe('applySecurityHeaders / applyStandardHeaders', () => {
        it('applySecurityHeaders sets HSTS', () => {
            const res = applySecurityHeaders(new Response('ok'))
            expect(res.headers.get('Strict-Transport-Security')).toBe(
                'max-age=31536000; includeSubDomains; preload'
            )
        })

        it('applyStandardHeaders injects nonce into CSP and preserves no unsafe-inline in script-src', () => {
            const nonce = 'e2e-nonce-xyz'
            const res = applyStandardHeaders(new Response('ok'), '/', nonce)
            const csp = res.headers.get('Content-Security-Policy')!
            expect(csp).toContain(`'nonce-${nonce}'`)
            const scriptSrc = csp.split(';').find((d) => d.trim().startsWith('script-src'))!
            expect(scriptSrc).not.toContain("'unsafe-inline'")
            expect(isCSPValid(csp)).toBe(true)
        })

        it('applyStandardHeaders respects existing CSP header when no nonce', () => {
            const res = applyStandardHeaders(
                new Response('ok', {
                    headers: { 'Content-Security-Policy': "default-src 'none'" },
                }),
                '/'
            )
            expect(res.headers.get('Content-Security-Policy')).toBe("default-src 'none'")
        })

        it('applyStandardHeaders overwrites CSP with nonce when provided (middleware nonce takes precedence)', () => {
            const res = applyStandardHeaders(
                new Response('ok', {
                    headers: { 'Content-Security-Policy': "default-src 'none'" },
                }),
                '/',
                'should-apply'
            )
            expect(res.headers.get('Content-Security-Policy')).toContain("'nonce-should-apply'")
            expect(res.headers.get('Content-Security-Policy')).not.toBe("default-src 'none'")
        })
    })
})
