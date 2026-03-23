import { describe, expect, it } from 'vitest'

import { applySecurityHeaders, securityHeaders } from './security'

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
})
