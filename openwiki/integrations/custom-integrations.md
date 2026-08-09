---
type: concept
title: Custom Astro Integrations
description: Custom Astro integrations including filter-known-build-warnings, critical-css, cloudflare-static-headers, and cloudflare-redirects.
tags: [integrations, astro, build]
timestamp: 2026-04-15
---

# Custom Astro Integrations

The site uses four custom Astro integrations for build-time processing.

## Integration Overview

| Integration                 | File                                              | Hook                                    | Purpose                        |
| --------------------------- | ------------------------------------------------- | --------------------------------------- | ------------------------------ |
| filter-known-build-warnings | `src/integrations/filter-known-build-warnings.ts` | `astro:config:setup`                    | Filter benign console warnings |
| critical-css                | `src/integrations/critical-css.ts`                | `astro:build:done`                      | Inline critical CSS            |
| cloudflare-static-headers   | `src/integrations/cloudflare-static-headers.ts`   | `astro:build:done`                      | Generate `_headers` file       |
| cloudflare-redirects        | `src/integrations/cloudflare-redirects.ts`        | `astro:config:done`, `astro:build:done` | Generate `_redirects` file     |

## filter-known-build-warnings

`src/integrations/filter-known-build-warnings.ts` (5506 bytes)

### Purpose

Filters benign console warnings during build to reduce noise.

### Filtered Messages

```typescript
const shouldFilterMessage = (message: string): boolean => {
    return (
        message === 'Entry docs → 404 was not found.' ||
        message.includes('as it conflicts with higher priority route') ||
        message.includes('file not created, response body was empty') ||
        message.includes('Module "node:') ||
        message.includes('Module "child_process') ||
        message.includes('Module "stream') ||
        message.includes('Module "string_decoder') ||
        message.includes('Module "os') ||
        message.includes('Module "url') ||
        message.includes('is dynamically imported by') ||
        message.includes('dynamic import will not move module into another chunk')
    )
}
```

### Implementation

Wraps `console.warn`, `process.stdout.write`, and `process.stderr.write`:

```typescript
function wrapStreamWrite(original: typeof process.stdout.write): typeof process.stdout.write {
    return function (this: typeof process.stdout, buffer: string | Uint8Array, ...): boolean {
        const raw = typeof buffer === 'string' ? buffer : buffer.toString()
        const filtered = filterMultiline(raw)
        if (filtered === '') {
            // Skip writing, trigger callback
            return true
        }
        if (filtered === raw) {
            return original.call(this, buffer, ...)
        }
        return original.call(this, filtered, ...)
    }
}
```

### Tests

`src/integrations/filter-known-build-warnings.test.ts` (1378 bytes) verifies filtering logic.

## critical-css

`src/integrations/critical-css.ts` (1360 bytes)

### Purpose

Inlines critical CSS into every generated HTML file for improved First Contentful Paint.

### Implementation

```typescript
export default function criticalCssIntegration() {
    return {
        name: 'critical-css',
        hooks: {
            'astro:build:done': async ({ dir }: { dir: URL }) => {
                const criticalCssPath = path.resolve('src/styles/critical.css')
                const criticalCss = fs.readFileSync(criticalCssPath, 'utf8')
                const dirPath = fileURLToPath(dir)
                const htmlFiles = fs
                    .readdirSync(dirPath, { recursive: true })
                    .filter(
                        (file): file is string => typeof file === 'string' && file.endsWith('.html')
                    )
                for (const htmlFile of htmlFiles) {
                    const htmlPath = path.join(dirPath, htmlFile)
                    const htmlContent = fs.readFileSync(htmlPath, 'utf8')
                    const modifiedHtml = htmlContent.replace(
                        '<head>',
                        `<head>\n<style>${criticalCss}</style>`
                    )
                    fs.writeFileSync(htmlPath, modifiedHtml)
                }
            },
        },
    }
}
```

### Critical CSS

`src/styles/critical.css` (6780 bytes) contains above-the-fold styles.

## cloudflare-static-headers

`src/integrations/cloudflare-static-headers.ts` (3757 bytes)

### Purpose

Generates `dist/_headers` file with security headers and cache policies for Cloudflare Pages.

### Implementation

```typescript
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
```

### Header Generation

```typescript
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
        // ... more blocks
    ]
    return [renderHeaderBlock('/*', defaultHeaders), ...cacheOverrideBlocks].join('\n')
}
```

### Tests

`src/integrations/cloudflare-static-headers.test.ts` (1968 bytes) verifies header generation.

## cloudflare-redirects

`src/integrations/cloudflare-redirects.ts` (2024 bytes)

### Purpose

Generates `dist/_redirects` file for Cloudflare Pages edge redirects.

### Implementation

```typescript
export default function cloudflareRedirects(): AstroIntegration {
    let redirectsConfig: Record<string, RedirectConfig> = {}
    return {
        name: 'cloudflare-redirects',
        hooks: {
            'astro:config:done': ({ config }) => {
                redirectsConfig = config.redirects || {}
            },
            'astro:build:done': async ({ dir }) => {
                const content = renderCloudflareRedirects(redirectsConfig)
                await writeFile(new URL('./_redirects', dir), content, 'utf8')
            },
        },
    }
}
```

### Redirect Rendering

```typescript
export function renderCloudflareRedirects(redirects: Record<string, RedirectConfig>): string {
    const rules: string[] = []
    rules.push('# Cloudflare Pages Redirects')
    rules.push('# Auto-generated from astro.config.mjs')
    rules.push('')
    for (const [from, config] of Object.entries(redirects)) {
        if (typeof config === 'string') {
            rules.push(renderRedirectRule(from, config))
        } else if (config && typeof config === 'object' && 'destination' in config) {
            const status = config.status || 301
            rules.push(renderRedirectRule(from, config.destination, status))
        }
    }
    return rules.join('\n')
}
```

### Redirect Rule Format

```typescript
function renderRedirectRule(from: string, to: string, status = 301): string {
    const fromPath = from.endsWith('/') ? from : `${from}/`
    const toPath = to.endsWith('/') ? to : `${to}/`
    return `${fromPath} ${toPath} ${status}`
}
```

### Important Note

The integration does NOT add a `/* /404.html 404` catch-all rule because Cloudflare Pages automatically uses `dist/404.html` for missing paths. Adding a catch-all would override static file serving.

### Tests

`src/integrations/cloudflare-redirects.test.ts` (1062 bytes) verifies redirect generation.

## Related Pages

- [Build and Deployment](../architecture/build-deployment.md)
- [Security Configuration](../configuration/security.md)
- [Astro Configuration](../configuration/astro-config.md)
