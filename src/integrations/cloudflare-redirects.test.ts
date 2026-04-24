import { describe, expect, it } from 'vitest'
import { renderCloudflareRedirects } from './cloudflare-redirects'

describe('cloudflare-redirects', () => {
    it('renders redirect rules from string config', () => {
        const result = renderCloudflareRedirects({
            '/old-path/': '/new-path/',
        })

        expect(result).toContain('/old-path/ /new-path/ 301')
    })

    it('renders redirect rules from object config', () => {
        const result = renderCloudflareRedirects({
            '/old-path/': { destination: '/new-path/', status: 302 },
        })

        expect(result).toContain('/old-path/ /new-path/ 302')
    })

    it('does NOT include the problematic 404 catch-all rule', () => {
        const result = renderCloudflareRedirects({})

        expect(result).not.toContain('/* /404.html 404')
    })

    it('adds trailing slashes to paths', () => {
        const result = renderCloudflareRedirects({
            '/old-path': '/new-path',
        })

        expect(result).toContain('/old-path/ /new-path/ 301')
    })
})
