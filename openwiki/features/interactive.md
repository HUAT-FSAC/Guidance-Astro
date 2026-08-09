---
type: concept
title: Interactive Features
description: Interactive features including search, theme switching, sharing, toast notifications, and particle animations.
tags: [features, interactive, ui]
timestamp: 2026-04-15
---

# Interactive Features

The site includes numerous interactive features for enhanced user experience.

## Search System

### Pagefind Integration

Static search index generated during build:

```javascript
starlight({
    pagefind: true,
})
```

### Enhanced Search

`src/utils/enhanced-search.ts` (10244 bytes) provides:

- Keyboard shortcut (Ctrl/Cmd + K)
- Search history tracking
- Result highlighting
- Search suggestions

### Search Suggestions

`src/utils/search-suggestions.ts` (10042 bytes) provides:

```typescript
interface SearchSuggestion {
    id: string
    type: 'history' | 'popular' | 'suggestion'
    query: string
    timestamp?: number
    score?: number
}
```

#### Popular Searches

```typescript
const POPULAR_SEARCHES = [
    'ROS 入门',
    '感知',
    '定位建图',
    '规划控制',
    '仿真测试',
    '电气',
    '机械',
    '项目进度',
    'Formula Student',
    '加入我们',
    '团队介绍',
    '赛车',
    '数据集',
    'Docker',
    'VSCode 配置',
]
```

### Search History

`src/utils/search-history.ts` (3371 bytes) manages search history:

```typescript
interface SearchHistoryItem {
    id: string
    query: string
    timestamp: number
}
```

- Max 20 items
- Stored in localStorage
- Deduplication by query

### Search Highlighting

`src/utils/search-highlight.ts` (2364 bytes) highlights search results:

```typescript
export function highlightSearchResults(
    content: string,
    query: string,
    className: string = 'search-highlight'
): string
```

Highlights matching text in headings, paragraphs, list items, and links.

## Theme System

### Theme Controller

`src/utils/theme-controller.ts` (11854 bytes) manages theme switching:

```typescript
type ThemeScheme = 'light' | 'dark'

interface ThemeColor {
    key: string
    color: string
    accent: string
}

export const THEME_COLORS: ThemeColor[] = [
    { key: 'classicOrange', color: '#f39c12', accent: '#e67e22' },
    { key: 'gamingBlue', color: '#3498db', accent: '#2980b9' },
    { key: 'racingRed', color: '#e74c3c', accent: '#c0392b' },
    { key: 'techPurple', color: '#9b59b6', accent: '#8e44ad' },
    { key: 'speedGreen', color: '#2ecc71', accent: '#27ae60' },
]
```

### Theme Switcher Component

`src/components/home/ui/ThemeSwitcher.astro` (22338 bytes) provides:

- Toggle button for light/dark mode
- Dropdown for color selection
- Long-press to open color picker
- Right-click for color selection

### Theme Persistence

Theme state stored in localStorage:

```typescript
export const THEME_STORAGE_KEYS = {
    scheme: 'huat-color-scheme',
    color: 'huat-theme-color',
    accent: 'huat-theme-accent',
    starlightScheme: 'starlight-theme',
}
```

### Theme Initialization

Inline script in `<head>` reads theme from localStorage:

```javascript
var scheme = localStorage.getItem('huat-color-scheme')
var starlightScheme = localStorage.getItem('starlight-theme')
if (scheme === 'light' || scheme === 'dark') {
    document.documentElement.setAttribute('data-theme', scheme)
} else if (starlightScheme === 'light' || starlightScheme === 'dark') {
    document.documentElement.setAttribute('data-theme', starlightScheme)
} else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
    document.documentElement.setAttribute('data-theme', 'light')
}
```

## Share System

### Share Utility

`src/utils/share.ts` (7497 bytes) provides sharing functionality:

```typescript
export type SharePlatform =
    | 'twitter'
    | 'weibo'
    | 'wechat'
    | 'linkedin'
    | 'facebook'
    | 'telegram'
    | 'email'

export interface ShareData {
    url: string
    title: string
    description?: string
    image?: string
}
```

### Share Controller

`src/utils/share-controller.ts` (5849 bytes) manages share UI:

```typescript
export function initShareMenu(container: HTMLElement, options: ShareMenuOptions = {}): () => void
```

### Features

- Native Web Share API (mobile)
- Copy to clipboard
- QR code generation (for WeChat)
- Social media sharing

## Toast Notifications

`src/utils/toast.ts` (14428 bytes) provides global notifications:

```typescript
export type ToastType = 'success' | 'warning' | 'error' | 'info'

export interface ToastOptions {
    type?: ToastType
    duration?: number
    position?:
        | 'top-right'
        | 'top-left'
        | 'bottom-right'
        | 'bottom-left'
        | 'top-center'
        | 'bottom-center'
    closable?: boolean
    animation?: 'fade' | 'slide' | 'bounce'
    locale?: Locale
}
```

### Features

- Multiple positions
- Auto-dismiss
- Animation effects
- History tracking (max 50 items)

## Animation System

### Particle Background

`src/utils/particle-background.ts` (11031 bytes) implements particle animation.

`src/components/home/ui/ParticleBackground.astro` (803 bytes) renders the particle effect.

### Scroll Reveal

`src/utils/scroll-reveal.ts` (1086 bytes) implements scroll-triggered animations.

`src/components/home/ui/ScrollReveal.astro` (416 bytes) wraps content for reveal effect.

### Parallax Scroll

`src/utils/parallax-scroll.ts` (1862 bytes) implements parallax scrolling.

`src/components/home/ui/ParallaxScroll.astro` (402 bytes) wraps content for parallax effect.

### Stats Counter

`src/utils/stats-counter.ts` (4453 bytes) implements animated counters using IntersectionObserver.

### Countdown Timer

`src/utils/countdown.ts` (3824 bytes) implements race countdown timer.

Reads `data-start-date` attribute and counts down to the event.

## Floating Controls

### Scroll Progress

`src/components/home/ui/ScrollProgress.astro` (2035 bytes) shows scroll progress on home page.

### Back to Top

`src/components/home/ui/BackToTop.astro` (3460 bytes) provides scroll-to-top button.

## Related Pages

<!-- openwiki: broken internal link [./components/docs-components.md] file "./components/docs-components.md" does not exist. Fix the href or restore the target, then delete this comment. -->

- [Documentation Components](./components/docs-components.md)
    <!-- openwiki: broken internal link [./components/home-page.md] file "./components/home-page.md" does not exist. Fix the href or restore the target, then delete this comment. -->
- [Home Page Components](./components/home-page.md)
    <!-- openwiki: broken internal link [../utilities/interactive.md] file "../utilities/interactive.md" does not exist. Fix the href or restore the target, then delete this comment. -->
- [Utilities](../utilities/interactive.md)
