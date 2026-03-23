import { describe, expect, it } from 'vitest'

import { renderCloudflareStaticHeaders } from './cloudflare-static-headers'

describe('renderCloudflareStaticHeaders', () => {
    it('renders a Cloudflare Pages header block for all static routes', () => {
        const output = renderCloudflareStaticHeaders()

        expect(output.startsWith('/*\n')).toBe(true)
        expect(output).toContain('  Content-Security-Policy: ')
        expect(output).toContain('  X-Frame-Options: SAMEORIGIN')
        expect(output).toContain('  Permissions-Policy: ')
    })
})
