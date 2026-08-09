---
type: concept
title: PWA and Offline Support
description: Progressive Web App features including service worker caching strategies, manifest configuration, and offline fallback.
tags: [pwa, offline, service-worker]
timestamp: 2026-04-15
---

# PWA and Offline Support

The site implements Progressive Web App features for offline access and installability.

## Service Worker

`public/sw.js` (8096 bytes) provides offline support with multiple caching strategies.

### Cache Configuration

```javascript
const CACHE_NAME = 'huat-fsac-v4'
const OFFLINE_URL = '/offline.html'

const PRECACHE_ASSETS = [
    '/',
    '/favicon.png',
    '/favicon.svg',
    '/manifest.json',
    '/og-image.png',
    '/offline.html',
]
```

### Caching Strategies

```javascript
const CACHE_STRATEGIES = {
    NETWORK_FIRST: ['text/html', 'application/xhtml+xml'],
    CACHE_FIRST: ['text/css', 'application/javascript', 'image/', 'font/'],
    STALE_WHILE_REVALIDATE: ['application/json', 'application/xml'],
}
```

#### Strategy Selection

```javascript
function getCacheStrategy(request, response) {
    if (request.mode === 'navigate') {
        return 'NETWORK_FIRST'
    }
    if (!response) {
        return 'NETWORK_FIRST'
    }
    const contentType = getContentType(response)
    if (CACHE_STRATEGIES.NETWORK_FIRST.some((type) => contentType.includes(type))) {
        return 'NETWORK_FIRST'
    }
    if (CACHE_STRATEGIES.CACHE_FIRST.some((type) => contentType.includes(type))) {
        return 'CACHE_FIRST'
    }
    if (CACHE_STRATEGIES.STALE_WHILE_REVALIDATE.some((type) => contentType.includes(type))) {
        return 'STALE_WHILE_REVALIDATE'
    }
    return 'NETWORK_FIRST'
}
```

### Cacheable Extensions

```javascript
const CACHEABLE_EXTENSIONS = [
    '.html',
    '.css',
    '.js',
    '.json',
    '.png',
    '.jpg',
    '.jpeg',
    '.svg',
    '.webp',
    '.avif',
    '.woff',
    '.woff2',
    '.ico',
]
```

### Response Validation

```javascript
function shouldCacheResponse(request, response) {
    if (!response || !response.ok) return false
    const pathname = new URL(request.url).pathname
    if (pathname === '/sw.js') return false
    const cacheControl = response.headers.get('Cache-Control') || ''
    return !cacheControl.includes('no-store')
}
```

### URL Validation

```javascript
function isCacheable(url) {
    const urlObj = new URL(url)
    if (urlObj.origin !== location.origin) return false
    const pathname = urlObj.pathname
    return (
        CACHEABLE_EXTENSIONS.some((ext) => pathname.endsWith(ext)) ||
        pathname === '/' ||
        pathname.endsWith('/')
    )
}
```

## Service Worker Registration

Inline script in `.config/astro.config.mjs`:

```javascript
{
    tag: 'script',
    content: `if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('/sw.js')
                .then(function(registration) {
                    console.log('[SW] Registration successful:', registration.scope);
                })
                .catch(function(error) {
                    console.log('[SW] Registration failed:', error);
                });
        });
    }`,
}
```

## PWA Manifest

`public/manifest.json`:

```json
{
    "name": "HUAT FSAC - 方程式赛车队",
    "short_name": "HUAT FSAC",
    "description": "湖北汽车工业学院方程式赛车队官方文档站...",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#000000",
    "theme_color": "#3b82f6",
    "orientation": "portrait-primary",
    "scope": "/",
    "lang": "zh-CN",
    "icons": [
        {
            "src": "/favicon.png",
            "sizes": "192x192",
            "type": "image/png",
            "purpose": "any maskable"
        },
        {
            "src": "/favicon.png",
            "sizes": "512x512",
            "type": "image/png",
            "purpose": "any maskable"
        }
    ],
    "categories": ["education", "documentation"],
    "shortcuts": [
        {
            "name": "文档中心",
            "short_name": "文档",
            "description": "查看技术文档",
            "url": "/archive/2024/2024-learning-roadmap/",
            "icons": [{ "src": "/favicon.png", "sizes": "96x96" }]
        },
        {
            "name": "加入我们",
            "short_name": "加入",
            "description": "了解如何加入车队",
            "url": "/join/",
            "icons": [{ "src": "/favicon.png", "sizes": "96x96" }]
        }
    ]
}
```

### Manifest Properties

| Property           | Value              | Purpose                  |
| ------------------ | ------------------ | ------------------------ |
| `display`          | `standalone`       | App-like experience      |
| `background_color` | `#000000`          | Splash screen background |
| `theme_color`      | `#3b82f6`          | Browser UI color         |
| `orientation`      | `portrait-primary` | Preferred orientation    |
| `scope`            | `/`                | PWA scope                |

### App Shortcuts

Two shortcuts defined:

1. **文档中心** (Docs Center) → `/archive/2024/2024-learning-roadmap/`
2. **加入我们** (Join Us) → `/join/`

## Offline Fallback

`public/offline.html` (8096 bytes) is displayed when offline:

- Styled offline page with retry button
- Lists cached pages for navigation
- Dark theme matching site design

## Related Pages

- [Security Configuration](../configuration/security.md)
- [Build and Deployment](../architecture/build-deployment.md)
- [Astro Configuration](../configuration/astro-config.md)
