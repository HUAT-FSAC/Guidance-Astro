---
type: concept
title: Content Collections
description: Content collection configuration using Starlight's docsLoader and i18nLoader, schema validation, and MDX content structure.
tags: [content, collections, mdx]
timestamp: 2026-04-15
---

# Content Collections

Content is organized into collections using Astro's content collection system with Starlight's built-in loaders and schemas.

## Configuration

`src/content.config.ts` (368 bytes):

```typescript
import { docsLoader, i18nLoader } from '@astrojs/starlight/loaders'
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema'
import { defineCollection } from 'astro:content'

export const collections = {
    docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
    i18n: defineCollection({ loader: i18nLoader(), schema: i18nSchema() }),
}
```

### Collections

| Collection | Loader         | Schema         | Purpose                   |
| ---------- | -------------- | -------------- | ------------------------- |
| `docs`     | `docsLoader()` | `docsSchema()` | MDX documentation content |
| `i18n`     | `i18nLoader()` | `i18nSchema()` | Translation files         |

## Docs Collection

### Loader

`docsLoader()` reads MDX files from `src/content/docs/` and processes them into structured content.

### Schema

`docsSchema()` validates MDX frontmatter fields:

```yaml
---
title: Page Title
description: Page description
slug: custom-slug
editUrl: https://github.com/...
head:
    - tag: meta
      attrs:
          name: keywords
          content: keyword1, keyword2
tableOfContents: true
template: doc # or 'splash'
---
```

### Content Structure

```
src/content/docs/
├── index.mdx                    # Home page
├── join.mdx                     # Join us page
├── team.mdx                     # Team page
├── cars.mdx                     # Cars page
├── about-fs.mdx                 # About Formula Student
├── open-source-projects.md      # Open source projects
├── 404.mdx                      # Not found page
├── archive/                     # Historical documentation
│   ├── 2024/
│   │   └── 2024-learning-roadmap.mdx
│   └── 2025/
│       ├── sensing/             # Perception docs
│       ├── localization-mapping/ # Localization docs
│       ├── planning-control/    # Planning & control docs
│       ├── simulation/          # Simulation docs
│       ├── electrical/          # Electrical docs
│       ├── mechanical/          # Mechanical docs
│       └── management/          # Management docs
├── docs-center/                 # Documentation center
│   └── contributing.md          # Contributing guide
├── news/                        # News articles
└── en/                          # English content
    ├── index.mdx
    ├── join.mdx
    ├── team.mdx
    ├── cars.mdx
    ├── about-fs.mdx
    └── archive/
```

### Bilingual Content

English content lives under `src/content/docs/en/` with the same structure as Chinese content.

Starlight automatically routes:

- `/join/` → Chinese content
- `/en/join/` → English content

## i18n Collection

### Loader

`i18nLoader()` reads JSON translation files from `src/content/i18n/`.

### Schema

`i18nSchema()` validates translation file structure.

### Files

- `src/content/i18n/zh.json` - Chinese translations
- `src/content/i18n/en.json` - English translations

## MDX Features

### Starlight Components

MDX files can use Starlight's built-in components:

- **Aside**: `<Note>`, `<Tip>`, `<Caution>`, `<Danger>`
- **Code Blocks**: Syntax-highlighted code with titles
- **Tabs**: Tabbed content sections
- **Link Cards**: Styled link cards
- **Card Grid**: Card layouts

### Custom Components

Custom Astro components can be imported in MDX:

```mdx
import { Image } from 'astro:assets'
import myImage from '../../assets/docs/2025/sensing/lidar-setup.png'

<Image src={myImage} alt="LiDAR installation diagram" />
```

### MDX Authoring Rules

#### Special Character Escaping

Content containing `<` (less-than sign) must be escaped:

```mdx
# Wrong

| <1A |

# Correct

| \<1A |

# or

| `<1A` |
```

#### Aside Types

Only these aside types are supported:

- ✅ `note`, `tip`, `caution`, `danger`
- ❌ `warning` (not supported)

## Static Assets

### Image Storage

Documentation images are stored in `src/assets/docs/`:

```
src/assets/docs/
├── 2025/
│   ├── 感知/          # Sensing
│   ├── 定位建图/      # Localization
│   ├── 规控/          # Planning & Control
│   ├── 仿真测试/      # Simulation
│   ├── 电气/          # Electrical
│   ├── 机械/          # Mechanical
│   └── 项管/          # Management
└── videos/            # Video assets
```

### Image Optimization

Images are optimized using the `scripts/optimize-images.mjs` script:

```bash
node scripts/optimize-images.mjs
```

This script:

- Resizes images to max 1920px width
- Generates WebP and AVIF versions
- Compresses original formats

## Related Pages

- [Astro Configuration](../configuration/astro-config.md)
- [Internationalization Configuration](../configuration/i18n.md)
- [Static Assets Management](../operations/scripts.md)
