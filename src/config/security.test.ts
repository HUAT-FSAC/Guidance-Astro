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

    it('returns a short-cache policy for HTML pages and a no-store policy for the service worker', () => {
        expect(getCacheControlHeader('/docs-center/')).toBe('public, max-age=3600, must-revalidate')
        expect(getCacheControlHeader('/sw.js')).toBe('no-cache, no-store, must-revalidate')
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

    it('includes Strict-Transport-Security with correct HSTS value', () => {
        const hsts = securityHeaders.find((h) => h.name === 'Strict-Transport-Security')
        expect(hsts).toBeDefined()
        expect(hsts?.value).toBe('max-age=31536000; includeSubDomains; preload')
        const response = applySecurityHeaders(new Response('ok'))
        expect(response.headers.get('Strict-Transport-Security')).toBe(
            'max-age=31536000; includeSubDomains; preload'
        )
    })

    it('CSP contains object-src none and frame-ancestors self', () => {
        const csp = generateCSP()
        expect(csp).toContain("object-src 'none'")
        expect(csp).toContain("frame-ancestors 'self'")
        const dirs = getCSPDirectives()
        expect(dirs['object-src']).toEqual(["'none'"])
        expect(dirs['frame-ancestors']).toEqual(["'self'"])
    })

    it('CSP script-src has no unsafe-inline and style-src allows it', () => {
        const csp = generateCSP('test-nonce-abc')
        // script-src must contain nonce and not unsafe-inline
        const scriptSrc = csp.split(';').find((d) => d.trim().startsWith('script-src'))
        expect(scriptSrc).toContain("'nonce-test-nonce-abc'")
        expect(scriptSrc).not.toContain("'unsafe-inline'")
        // style-src retains unsafe-inline for Starlight
        expect(csp).toContain("style-src 'self' 'unsafe-inline'")
        // overall valid per isCSPValid
        expect(isCSPValid(csp)).toBe(true)
    })

    it('generates base64url nonce of 22 chars and unique per call', () => {
        const n1 = generateNonce()
        const n2 = generateNonce()
        expect(n1).toMatch(/^[A-Za-z0-9_-]{22}$/)
        expect(n2).toMatch(/^[A-Za-z0-9_-]{22}$/)
        expect(n1).not.toBe(n2)
        // no padding
        expect(n1).not.toContain('=')
    })

    it('isCSPValid allows style-src unsafe-inline but rejects script-src unsafe-inline', () => {
        expect(isCSPValid("default-src 'self'; style-src 'self' 'unsafe-inline'")).toBe(true)
        expect(isCSPValid("default-src 'self'; script-src 'self' 'unsafe-inline'")).toBe(false)
        expect(isCSPValid("default-src 'self'; script-src 'self' 'unsafe-eval'")).toBe(false)
        expect(isCSPValid("default-src 'self'; script-src *")).toBe(false)
    })

    it('applyStandardHeaders injects nonce into CSP when provided', () => {
        const nonce = 'unit-nonce-123'
        const res = applyStandardHeaders(new Response('ok'), '/', nonce)
        const csp = res.headers.get('Content-Security-Policy')!
        expect(csp).toContain(`'nonce-${nonce}'`)
        // style-src retains unsafe-inline, script-src must not
        expect(csp).toContain("style-src 'self' 'unsafe-inline'")
        const scriptSrc = csp.split(';').find((d) => d.trim().startsWith('script-src'))!
        expect(scriptSrc).not.toContain("'unsafe-inline'")
        expect(scriptSrc).toContain(`'nonce-${nonce}'`)
    })
})
