import { describe, expect, it } from 'vitest'

import { renderCloudflareStaticHeaders } from './cloudflare-static-headers'

describe('renderCloudflareStaticHeaders', () => {
    it('renders a Cloudflare Pages header block for all static routes', () => {
        const output = renderCloudflareStaticHeaders()

        expect(output.startsWith('/*\n')).toBe(true)
        expect(output).toContain('  Content-Security-Policy: ')
        expect(output).toContain('  X-Frame-Options: SAMEORIGIN')
        expect(output).toContain('  Permissions-Policy: ')
        expect(output).toContain('  Cache-Control: public, max-age=3600, must-revalidate')
    })

    it('adds explicit cache rules for fingerprinted assets and the service worker', () => {
        const output = renderCloudflareStaticHeaders()

        expect(output).toContain('/_astro/*')
        expect(output).toContain('/pagefind/*')
        expect(output).toContain('/sw.js')
        expect(output).toContain('  ! Cache-Control')
        expect(output).toContain('  Cache-Control: public, max-age=31536000, immutable')
        expect(output).toContain('  Cache-Control: no-cache, no-store, must-revalidate')
    })
})
