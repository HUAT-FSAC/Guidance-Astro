---
type: concept
title: Security Configuration
description: Content Security Policy, security headers, per-request nonce generation via middleware, and cache control policies.
tags: [security, csp, headers, middleware]
timestamp: 2026-04-15
---

# Security Configuration

Security is implemented through multiple layers: Content Security Policy (CSP), security headers, per-request nonce generation, and cache control policies.

## Configuration File

`src/config/security.ts` (7048 bytes) defines all security-related configuration.

## Content Security Policy (CSP)

### CSP Generation

The CSP is generated dynamically with optional nonce support:

```typescript
export function getCSPDirectives(nonce?: string) {
    const scriptSrc = ["'self'", 'https://cloud.umami.is']
    if (nonce) {
        scriptSrc.push(`'nonce-${nonce}'`)
    }
    return {
        'default-src': ["'self'"],
        'script-src': scriptSrc,
        'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        'font-src': ["'self'", 'data:', 'https://fonts.gstatic.com'],
        'img-src': ["'self'", 'data:', 'https:', 'blob:'],
        'media-src': ["'self'", 'data:', 'https:'],
        'frame-src': ["'self'", 'https://www.youtube.com', 'https://player.vimeo.com'],
        'connect-src': ["'self'", 'https://cloud.umami.is', 'https://*.umami.is'],
        'worker-src': ["'self'", 'blob:'],
        'manifest-src': ["'self'"],
        'base-uri': ["'self'"],
        'form-action': ["'self'"],
    }
}
```

### CSP Validation

The `isCSPValid()` function checks for unsafe configurations:

```typescript
export function isCSPValid(csp: string): boolean {
    if (csp.includes('script-src *') || csp.includes('script-src-elem *')) return false
    if (csp.includes('style-src *') || csp.includes('style-src-elem *')) return false
    if (csp.includes("'unsafe-eval'")) return false
    if (csp.includes("'unsafe-inline'")) return false
    return true
}
```

Tests in `src/config/security.test.ts` verify that the CSP rejects unsafe configurations.

## Per-Request Nonce Generation

### Middleware (`src/middleware.ts`)

Every request generates a unique CSP nonce:

```typescript
import { defineMiddleware } from 'astro:middleware'
import { applyStandardHeaders, generateNonce } from './config/security'

export const onRequest = defineMiddleware(async (context, next) => {
    const { pathname } = context.url
    const nonce = generateNonce()
    ;(context.locals as Record<string, unknown>).cspNonce = nonce
    const secureResponse = (response: Response) => applyStandardHeaders(response, pathname, nonce)
    return secureResponse(await next())
})
```

### Nonce Generation

```typescript
export function generateNonce(): string {
    const array = new Uint8Array(16)
    crypto.getRandomValues(array)
    return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('')
}
```

This creates a cryptographically random 128-bit nonce for each request.

## Security Headers

The `securityHeaders` array defines response headers applied to all requests:

```typescript
export const securityHeaders: SecurityHeader[] = [
    { name: 'Content-Security-Policy', value: generateCSP() },
    { name: 'X-Content-Type-Options', value: 'nosniff' },
    { name: 'X-Frame-Options', value: 'SAMEORIGIN' },
    { name: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    {
        name: 'Permissions-Policy',
        value: 'accelerometer=(), gyroscope=(), magnetometer=(), payment=(), usb=()',
    },
    { name: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
    { name: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
]
```

### Header Descriptions

| Header                         | Value                             | Purpose                       |
| ------------------------------ | --------------------------------- | ----------------------------- |
| `Content-Security-Policy`      | Generated CSP                     | Controls allowed resources    |
| `X-Content-Type-Options`       | `nosniff`                         | Prevents MIME type sniffing   |
| `X-Frame-Options`              | `SAMEORIGIN`                      | Prevents clickjacking         |
| `Referrer-Policy`              | `strict-origin-when-cross-origin` | Controls referrer information |
| `Permissions-Policy`           | Disabled features                 | Restricts browser features    |
| `Cross-Origin-Opener-Policy`   | `same-origin`                     | Isolates browsing context     |
| `Cross-Origin-Resource-Policy` | `same-origin`                     | Prevents cross-origin reads   |

## Cache Control

The `getCacheControlHeader()` function returns appropriate cache headers based on path:

```typescript
function getCacheControlHeader(pathname: string | undefined): string {
    if (!pathname) return 'public, max-age=3600, must-revalidate'
    if (pathname === '/sw.js') return 'no-cache, no-store, must-revalidate'
    if (pathname.startsWith('/admin/')) return 'private, no-store'
    // ... path-specific rules
}
```

### Cache Policies by Path Pattern

Applied via the `cloudflare-static-headers` integration in `dist/_headers`:

| Path Pattern                    | Cache Control                            |
| ------------------------------- | ---------------------------------------- |
| `/*` (default)                  | `public, max-age=3600, must-revalidate`  |
| `/_astro/*`                     | Immutable (1 year)                       |
| `/pagefind/*`                   | Immutable (1 year)                       |
| `/sw.js`                        | `no-cache, no-store, must-revalidate`    |
| `/*.css`                        | Immutable (1 year)                       |
| `/*.js`                         | Immutable (1 year)                       |
| `/*.png`, `/*.jpg`, etc.        | Immutable (1 year)                       |
| `/*.html`                       | `public, max-age=86400, must-revalidate` |
| `/*.woff2`, `/*.woff`, `/*.ttf` | Immutable (1 year), CORS enabled         |

## Cloudflare Pages Headers

The `cloudflare-static-headers` integration generates `dist/_headers`:

```
/*
  Content-Security-Policy: ...
  X-Content-Type-Options: nosniff
  X-Frame-Options: SAMEORIGIN
  Referrer-Policy: strict-origin-when-cross-origin
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  Cache-Control: public, max-age=3600, must-revalidate

/_astro/*
  ! Cache-Control
  Cache-Control: public, max-age=31536000, immutable

/*.css
  ! Cache-Control
  Cache-Control: public, max-age=31536000, immutable
```

## HSTS (HTTP Strict Transport Security)

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

Forces HTTPS for 1 year, including subdomains, with preload eligibility.

## Related Pages

- [Astro Configuration](./astro-config.md)
- [PWA and Offline Support](../features/pwa.md)
- [Build and Deployment](../architecture/build-deployment.md)
