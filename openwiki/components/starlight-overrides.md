---
type: concept
title: Starlight Overrides
description: Custom Starlight component overrides including Header, PageFrame, MarkdownContent, and PageTitle.
tags: [components, starlight, overrides]
timestamp: 2026-04-15
---

# Starlight Overrides

The site overrides several default Starlight components with custom implementations.

## Configuration

In `.config/astro.config.mjs`:

```javascript
starlight({
    components: {
        PageFrame: './src/components/overrides/PageFrame.astro',
        MarkdownContent: './src/components/overrides/MarkdownContent.astro',
        PageTitle: './src/components/overrides/PageTitle.astro',
    },
})
```

The custom Header is configured separately in the `head` array.

## Override Components

All overrides are in `src/components/overrides/`:

| Override        | File                                | Purpose                  |
| --------------- | ----------------------------------- | ------------------------ |
| Header          | `Header.astro` (6819 bytes)         | Custom navigation header |
| PageFrame       | `PageFrame.astro` (976 bytes)       | Page layout wrapper      |
| MarkdownContent | `MarkdownContent.astro` (828 bytes) | MDX content styling      |
| PageTitle       | `PageTitle.astro` (441 bytes)       | Page title rendering     |

## Header Component

`src/components/overrides/Header.astro` (6819 bytes) replaces the default Starlight header with a custom design.

### Features

- Logo and site title
- Navigation links (Home, About, Cars, Docs, Join)
- GitHub link
- Search button (Starlight Search component)
- Noise texture background effect
- Scanline animation effect

### Structure

```html
<div class="custom-header">
    <div class="header-noise" aria-hidden="true"></div>
    <div class="header-scanline" aria-hidden="true"></div>
    <div class="header-inner">
        <a href="/" class="header-left">
            <img src="/assets/logo.jpg" alt="HUAT FSAC" class="header-logo" />
            <span class="header-title">东风 HUAT 无人驾驶车队</span>
        </a>
        <nav class="header-nav">
            <a href="/">首页</a>
            <a href="/team/">关于我们</a>
            <a href="/cars/">关于赛车</a>
            <a href="/docs-center/">学习模块</a>
            <a href="/join/">加入我们</a>
            <a href="https://github.com/HUAT-FSAC" target="_blank" class="nav-github">
                <!-- GitHub icon -->
            </a>
            <search class="header-search" />
        </nav>
    </div>
</div>
```

### Navigation Links

| Link             | URL                            |
| ---------------- | ------------------------------ |
| 首页 (Home)      | `/`                            |
| 关于我们 (About) | `/team/`                       |
| 关于赛车 (Cars)  | `/cars/`                       |
| 学习模块 (Docs)  | `/docs-center/`                |
| 加入我们 (Join)  | `/join/`                       |
| GitHub           | `https://github.com/HUAT-FSAC` |

### Search Integration

Uses Starlight's built-in Search component:

```astro
import Search from 'virtual:starlight/components/Search';
```

### Visual Effects

- **Noise texture**: Subtle grain effect using SVG
- **Scanline**: Horizontal line animation across the header
- **Dark theme**: Black background with white text

## PageFrame Override

`src/components/overrides/PageFrame.astro` (976 bytes) wraps the page layout.

Used for custom page transitions or layout adjustments.

## MarkdownContent Override

`src/components/overrides/MarkdownContent.astro` (828 bytes) customizes MDX content rendering.

Applied to all documentation pages for consistent styling.

## PageTitle Override

`src/components/overrides/PageTitle.astro` (441 bytes) customizes page title rendering.

## Additional Components

### ErrorBoundary

`src/components/ErrorBoundary.astro` (9582 bytes) provides error recovery UI.

#### Features

- Catches component errors
- Displays fallback message
- Shows error details (optional)
- Recovery button
- Error reporting to Umami

#### Error Classification

```typescript
function classifyError(error: ErrorInfo): ErrorSeverity {
    if (error.type === ErrorType.NETWORK_ERROR || error.type === ErrorType.IMAGE_ERROR) {
        return 'recoverable'
    }
    if (error.message?.includes('ChunkLoadError')) {
        return 'recoverable'
    }
    return 'fatal'
}
```

### Giscus Comments

`src/components/Giscus.astro` (2408 bytes) integrates GitHub Discussions comments.

#### Configuration

```javascript
const giscusConfig = {
    repo: 'HUAT-FSAC/Guidance-Astro',
    repoId: 'YOUR_REPO_ID',
    category: 'Announcements',
    categoryId: 'YOUR_CATEGORY_ID',
    mapping: 'pathname',
    strict: '0',
    reactionsEnabled: '1',
    emitMetadata: '0',
    inputPosition: 'top',
    lang: 'zh-CN',
}
```

**Note**: The repoId and categoryId are placeholders and need to be configured for production use.

### DocPage Component

`src/components/DocPage.astro` (782 bytes) provides a wrapper for documentation pages.

### PageLoader

`src/components/home/PageLoader.astro` (7596 bytes) provides a loading animation for the home page.

### GitHubFlow

`src/components/contributing/GitHubFlow.astro` (12575 bytes) provides a visual guide for GitHub workflow in the contributing documentation.

## Icons

Custom SVG icons in `src/components/icons/`:

| Icon         | File                             |
| ------------ | -------------------------------- |
| ArrowRight   | `ArrowRight.astro` (503 bytes)   |
| ChevronLeft  | `ChevronLeft.astro` (479 bytes)  |
| ChevronRight | `ChevronRight.astro` (478 bytes) |
| Sun          | `Sun.astro` (578 bytes)          |

## Related Pages

- [Documentation Components](./docs-components.md)
- [Home Page Structure](./home-page.md)
- [Astro Configuration](../configuration/astro-config.md)
