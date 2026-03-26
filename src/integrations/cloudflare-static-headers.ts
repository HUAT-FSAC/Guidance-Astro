import type { AstroIntegration } from 'astro'
import { writeFile } from 'node:fs/promises'

import { getCacheControlHeader, securityHeaders } from '../config/security'

function renderHeaderBlock(pathname: string, headerLines: string[]) {
    return [pathname, ...headerLines.map((line) => `  ${line}`), ''].join('\n')
}

export function renderCloudflareStaticHeaders() {
    const defaultHeaders = [
        ...securityHeaders.map(({ name, value }) => `${name}: ${value}`),
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
