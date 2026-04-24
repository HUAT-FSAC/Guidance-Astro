import type { AstroIntegration } from 'astro'
import { writeFile } from 'node:fs/promises'

import { getCacheControlHeader, securityHeaders } from '../config/security'

function renderHeaderBlock(pathname: string, headerLines: string[]) {
    return [pathname, ...headerLines.map((line) => `  ${line}`), ''].join('\n')
}

export function renderCloudflareStaticHeaders() {
    const defaultHeaders = [
        ...securityHeaders.map(({ name, value }) => `${name}: ${value}`),
        'Strict-Transport-Security: max-age=31536000; includeSubDomains; preload',
        `Cache-Control: ${getCacheControlHeader('/')}`,
    ]
    const cacheOverrideBlocks = [
        renderHeaderBlock('/_astro/*', [
            '! Cache-Control',
            `Cache-Control: ${getCacheControlHeader('/_astro/app.js')}`,
        ]),
        renderHeaderBlock('/pagefind/*', [
            '! Cache-Control',
            `Cache-Control: ${getCacheControlHeader('/pagefind/pagefind.js')}`,
        ]),
        renderHeaderBlock('/sw.js', [
            '! Cache-Control',
            `Cache-Control: ${getCacheControlHeader('/sw.js')}`,
        ]),
        renderHeaderBlock('/*.css', [
            '! Cache-Control',
            'Cache-Control: public, max-age=31536000, immutable',
        ]),
        renderHeaderBlock('/*.js', [
            '! Cache-Control',
            'Cache-Control: public, max-age=31536000, immutable',
        ]),
        renderHeaderBlock('/*.png', [
            '! Cache-Control',
            'Cache-Control: public, max-age=31536000, immutable',
        ]),
        renderHeaderBlock('/*.jpg', [
            '! Cache-Control',
            'Cache-Control: public, max-age=31536000, immutable',
        ]),
        renderHeaderBlock('/*.jpeg', [
            '! Cache-Control',
            'Cache-Control: public, max-age=31536000, immutable',
        ]),
        renderHeaderBlock('/*.gif', [
            '! Cache-Control',
            'Cache-Control: public, max-age=31536000, immutable',
        ]),
        renderHeaderBlock('/*.webp', [
            '! Cache-Control',
            'Cache-Control: public, max-age=31536000, immutable',
        ]),
        renderHeaderBlock('/*.avif', [
            '! Cache-Control',
            'Cache-Control: public, max-age=31536000, immutable',
        ]),
        renderHeaderBlock('/*.svg', [
            '! Cache-Control',
            'Cache-Control: public, max-age=31536000, immutable',
        ]),
        renderHeaderBlock('/*.ico', [
            '! Cache-Control',
            'Cache-Control: public, max-age=31536000, immutable',
        ]),
        renderHeaderBlock('/*.html', [
            '! Cache-Control',
            'Cache-Control: public, max-age=86400, must-revalidate',
        ]),
        renderHeaderBlock('/*.woff2', [
            '! Cache-Control',
            'Cache-Control: public, max-age=31536000, immutable',
            'Access-Control-Allow-Origin: *',
        ]),
        renderHeaderBlock('/*.woff', [
            '! Cache-Control',
            'Cache-Control: public, max-age=31536000, immutable',
            'Access-Control-Allow-Origin: *',
        ]),
        renderHeaderBlock('/*.ttf', [
            '! Cache-Control',
            'Cache-Control: public, max-age=31536000, immutable',
            'Access-Control-Allow-Origin: *',
        ]),
    ]

    return [renderHeaderBlock('/*', defaultHeaders), ...cacheOverrideBlocks].join('\n')
}

export default function cloudflareStaticHeaders(): AstroIntegration {
    return {
        name: 'cloudflare-static-headers',
        hooks: {
            'astro:build:done': async ({ dir }) => {
                await writeFile(new URL('./_headers', dir), renderCloudflareStaticHeaders(), 'utf8')
            },
        },
    }
}
