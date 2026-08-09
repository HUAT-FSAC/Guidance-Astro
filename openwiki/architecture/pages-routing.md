---
type: concept
title: Pages and Routing
description: Page structure including home page, documentation pages, showcase dashboard, and legacy redirects.
tags: [pages, routing]
timestamp: 2026-04-15
---

# Pages and Routing

## Page Structure

### Astro Pages

| Page                    | File                                                | Purpose               |
| ----------------------- | --------------------------------------------------- | --------------------- |
| Home                    | `src/content/docs/index.mdx`                        | Home page content     |
| Join                    | `src/content/docs/join.mdx`                         | Join us page          |
| Team                    | `src/content/docs/team.mdx`                         | Team page             |
| Cars                    | `src/content/docs/cars.mdx`                         | Cars page             |
| About FS                | `src/content/docs/about-fs.mdx`                     | About Formula Student |
| 404                     | `src/content/docs/404.mdx`                          | Not found page        |
| Docs Redirect           | `src/pages/docs.astro` (2570 bytes)                 | Legacy docs redirect  |
| Showcase Dashboard      | `src/pages/showcase-dashboard.astro` (44933 bytes)  | Interactive showcase  |
| Showcase Dashboard (EN) | `src/pages/en/showcase-dashboard.astro` (111 bytes) | English showcase      |

### Documentation Pages

Documentation pages are MDX files in `src/content/docs/`:

```
src/content/docs/
├── index.mdx                    # Home page
├── join.mdx                     # Join us
├── team.mdx                     # Team
├── cars.mdx                     # Cars
├── about-fs.mdx                 # About Formula Student
├── 404.mdx                      # Not found
├── archive/                     # Historical docs
│   ├── 2024/
│   └── 2025/
├── docs-center/                 # Documentation center
├── news/                        # News articles
└── en/                          # English content
```

## Routing

### URL Structure

| Language          | URL Pattern | Example     |
| ----------------- | ----------- | ----------- |
| Chinese (default) | `/path/`    | `/join/`    |
| English           | `/en/path/` | `/en/join/` |

### Automatic Routing

Starlight automatically routes MDX files:

- `src/content/docs/join.mdx` → `/join/`
- `src/content/docs/en/join.mdx` → `/en/join/`

### Auto-Generated Sidebar

The `autogenerate` feature creates routes from content directories:

```javascript
{
    autogenerate: {
        directory: 'archive/2025/sensing'
    }
}
```

This scans `src/content/docs/archive/2025/sensing/` and creates routes for each MDX file.

## Special Pages

### Docs Redirect

`src/pages/docs.astro` (2570 bytes) is a legacy redirect page:

```html
<meta name="robots" content="noindex,follow" /> <meta http-equiv="refresh" content="1;url=/" />
```

- `noindex,follow` - Tells search engines not to index
- Auto-redirects to home page after 1 second
- Provides links to home and docs center

### Showcase Dashboard

`src/pages/showcase-dashboard.astro` (44933 bytes) is a standalone page:

- Not part of Starlight docs
- Full-screen interactive dashboard
- Bilingual (Chinese/English)
- Client-side rendered

### English Showcase Dashboard

`src/pages/en/showcase-dashboard.astro` (111 bytes) is a minimal wrapper:

```astro
---
// English locale wrapper
---
<ShowcaseDashboard locale="en" />
```

## Legacy URL Redirects

47+ redirects maintain backward compatibility:

```javascript
redirects: {
    '/2024-learning-roadmap/': '/archive/2024/2024-learning-roadmap/',
    '/2025/感知/': '/archive/2025/sensing/',
    '/2025/定位建图/': '/archive/2025/localization-mapping/',
    '/感知/': '/archive/sensing/',
    '/定位建图/': '/archive/localization-mapping/',
    '/文档中心/': '/docs-center/',
    // ... 40+ more
}
```

### Redirect Types

| Type       | Example                                                 | Purpose                |
| ---------- | ------------------------------------------------------- | ---------------------- |
| Year-based | `/2025/感知/` → `/archive/2025/sensing/`                | Content reorganization |
| Shortcut   | `/感知/` → `/archive/sensing/`                          | URL simplification     |
| Section    | `/文档中心/` → `/docs-center/`                          | Naming convention      |
| English    | `/en/docs-center/入门/` → `/en/docs-center/onboarding/` | English content        |

## 404 Page

`src/content/docs/404.mdx` (235 bytes) handles not-found pages.

Cloudflare Pages automatically serves `dist/404.html` for missing paths.

## Related Pages

- [Astro Configuration](../configuration/astro-config.md)
- [Sidebar Configuration](../configuration/sidebar.md)
- [Content Collections](../content/collections.md)
- [Custom Astro Integrations](../integrations/custom-integrations.md)
