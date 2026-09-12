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

    it('renders redirect rules from object config with default 301 status', () => {
        const result = renderCloudflareRedirects({
            '/default-status/': { destination: '/new-dest/' } as unknown as {
                status: 301
                destination: string
            },
        })

        expect(result).toContain('/default-status/ /new-dest/ 301')
    })

    it('creates AstroIntegration and executes hooks', async () => {
        const cloudflareRedirects = (await import('./cloudflare-redirects')).default
        const integration = cloudflareRedirects()

        expect(integration.name).toBe('cloudflare-redirects')
        expect(integration.hooks['astro:config:done']).toBeDefined()
        expect(integration.hooks['astro:build:done']).toBeDefined()

        // Test config hook with redirects
        const configDone = integration.hooks['astro:config:done'] as (arg: {
            config: unknown
        }) => void
        configDone({
            config: {
                redirects: {
                    '/old': '/new',
                },
            },
        })

        // Test config hook without redirects
        const integrationEmpty = cloudflareRedirects()
        const configDoneEmpty = integrationEmpty.hooks['astro:config:done'] as (arg: {
            config: unknown
        }) => void
        configDoneEmpty({
            config: {},
        })
    })
})
