---
type: concept
title: Astro Configuration
description: Astro and Starlight configuration including site settings, integrations, redirects, Vite build options, and component overrides.
tags: [configuration, astro, starlight]
timestamp: 2026-04-15
---

# Astro Configuration

The main configuration file is `.config/astro.config.mjs` (15640 bytes).

## Site Configuration

```javascript
export default defineConfig({
    site: 'https://huat-fsac.eu.org',
    trailingSlash: 'always',
    // ... rest of config
})
```

- **Site URL**: `https://huat-fsac.eu.org`
- **Trailing Slash**: Always append trailing slash
- **Redirects**: 47+ legacy URL redirects for content reorganization

## Legacy URL Redirects

The site maintains backward compatibility with old URLs through redirects:

```javascript
redirects: {
    '/2024-learning-roadmap/': '/archive/2024/2024-learning-roadmap/',
    '/2025/感知/': '/archive/2025/sensing/',
    '/2025/定位建图/': '/archive/2025/localization-mapping/',
    '/2025/规控/': '/archive/2025/planning-control/',
    '/感知/': '/archive/sensing/',
    '/定位建图/': '/archive/localization-mapping/',
    '/文档中心/': '/docs-center/',
    // ... 40+ more redirects
}
```

These redirects are processed by both:

1. Astro's built-in redirect handling
2. Generated `dist/_redirects` file for Cloudflare Pages edge handling

## Vite Build Configuration

```javascript
vite: {
    ssr: {
        external: ['crypto'],
    },
    build: {
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true,
                passes: 2,
                pure_funcs: ['console.log', 'console.warn', 'console.error'],
            },
            mangle: true,
            output: { comments: false },
        },
        rollupOptions: {
            output: {
                manualChunks: {
                    starlight: ['@astrojs/starlight'],
                },
                chunkFileNames: 'chunks/[name]-[hash].js',
                entryFileNames: 'entry/[name]-[hash].js',
                assetFileNames: 'assets/[name]-[hash].[ext]',
            },
        },
        cacheDir: '.vite-cache',
    },
}
```

### Build Optimizations

| Option         | Value                | Purpose                         |
| -------------- | -------------------- | ------------------------------- |
| `minify`       | `terser`             | JavaScript minification         |
| `drop_console` | `true`               | Remove console.\* in production |
| `passes`       | `2`                  | Multiple optimization passes    |
| `mangle`       | `true`               | Variable name mangling          |
| `manualChunks` | `@astrojs/starlight` | Separate Starlight chunk        |
| `cacheDir`     | `.vite-cache`        | Persistent build cache          |

## Starlight Configuration

```javascript
starlight({
    title: { zh: 'HUAT FSAC', en: 'HUAT FSAC' },
    description: 'HUAT FSAC documentation site...',
    favicon: '/favicon.png',
    defaultLocale: 'root',
    locales: {
        root: { label: '中文', lang: 'zh' },
        en: { label: 'English', lang: 'en' },
    },
    customCss: [
        './src/styles/docs-global.css',
        './src/styles/code-blocks.css',
        './src/styles/search-suggestions.css',
        './src/styles/search-highlight.css',
    ],
    tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 4 },
    sidebar, // from .config/sidebar.mjs
    lastUpdated: true,
    pagination: false,
    pagefind: true,
    components: {
        PageFrame: './src/components/overrides/PageFrame.astro',
        MarkdownContent: './src/components/overrides/MarkdownContent.astro',
        PageTitle: './src/components/overrides/PageTitle.astro',
    },
})
```

### Component Overrides

Starlight allows overriding built-in components:

| Override          | File                                             | Purpose              |
| ----------------- | ------------------------------------------------ | -------------------- |
| `PageFrame`       | `src/components/overrides/PageFrame.astro`       | Page layout wrapper  |
| `MarkdownContent` | `src/components/overrides/MarkdownContent.astro` | MDX content styling  |
| `PageTitle`       | `src/components/overrides/PageTitle.astro`       | Page title rendering |

The custom `Header` component is configured separately in the `head` array and overrides the default Starlight header.

## Custom CSS

Four CSS files are loaded by Starlight:

1. **docs-global.css** (23695 bytes) - Main documentation styles
2. **code-blocks.css** (11431 bytes) - Code block styling
3. **search-suggestions.css** (2984 bytes) - Search dropdown styles
4. **search-highlight.css** (3912 bytes) - Search result highlighting

## Head Configuration

The `head` array in the Starlight config adds multiple meta tags and scripts:

### Meta Tags

- Viewport with `viewport-fit=cover`
- Referrer policy: `strict-origin-when-cross-origin`
- Description and keywords for SEO
- Open Graph tags (og:title, og:description, og:type, og:url, og:image)
- Twitter Card tags (summary_large_image)

### Preload and Preconnect

```javascript
{ tag: 'link', attrs: { rel: 'dns-prefetch', href: 'https://images.unsplash.com' } },
{ tag: 'link', attrs: { rel: 'dns-prefetch', href: 'https://cloud.umami.is' } },
{ tag: 'link', attrs: { rel: 'preconnect', href: 'https://images.unsplash.com' } },
{ tag: 'link', attrs: { rel: 'preconnect', href: 'https://cloud.umami.is' } },
{ tag: 'link', attrs: { rel: 'preload', href: '/favicon.png', as: 'image', type: 'image/png' } },
{ tag: 'link', attrs: { rel: 'preload', href: '/og-image.png', as: 'image', type: 'image/png' } },
{ tag: 'link', attrs: { rel: 'preload', href: '/sw.js', as: 'script' } },
```

### Fonts

Google Fonts loaded with `media="print"` and `onload="this.media='all'"` for performance:

- **JetBrains Mono** (400, 500, 600) - Code blocks
- **Space Grotesk** (500, 700, 900) - Headings

### Analytics Script

```javascript
{
    tag: 'script',
    attrs: {
        src: 'https://cloud.umami.is/script.js',
        'data-website-id': process.env.UMAMI_WEBSITE_ID || '',
        defer: true,
    },
}
```

### PWA Scripts

Inline scripts for:

- Theme initialization (reads from localStorage)
- Service Worker registration

## Search Configuration

```javascript
pagefind: true,
```

Pagefind generates a static search index during build, enabling client-side full-text search without a server.

## Related Pages

- [Sidebar Configuration](./sidebar.md)
- [Security Configuration](./security.md)
- [Environment Configuration](./environment.md)
- [Starlight Overrides](../components/starlight-overrides.md)
