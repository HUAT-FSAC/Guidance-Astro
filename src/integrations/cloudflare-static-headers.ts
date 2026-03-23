import type { AstroIntegration } from 'astro'
import { writeFile } from 'node:fs/promises'

import { securityHeaders } from '../config/security'

export function renderCloudflareStaticHeaders() {
    return ['/*', ...securityHeaders.map(({ name, value }) => `  ${name}: ${value}`), ''].join('\n')
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
