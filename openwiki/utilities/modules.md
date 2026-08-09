---
type: concept
title: Utility Modules
description: Utility modules including storage, error handling, analytics, performance monitoring, image optimization, and component initialization.
tags: [utilities, modules]
timestamp: 2026-04-15
---

# Utility Modules

Utility modules provide shared functionality across the site.

## Module Overview

| Module                       | File                                                     | Purpose                  |
| ---------------------------- | -------------------------------------------------------- | ------------------------ |
| storage                      | `src/utils/storage.ts` (2304 bytes)                      | Safe localStorage access |
| error-handler                | `src/utils/error-handler.ts` (8139 bytes)                | Global error handling    |
| analytics                    | `src/utils/analytics.ts` (7368 bytes)                    | Analytics event tracking |
| performance                  | `src/utils/performance.ts` (8571 bytes)                  | Web Vitals monitoring    |
| image-optimization           | `src/utils/image-optimization.ts` (5422 bytes)           | Image optimization       |
| component-init               | `src/utils/component-init.ts` (4902 bytes)               | Component lifecycle      |
| logger                       | `src/utils/logger.ts` (1612 bytes)                       | Logging utility          |
| i18n                         | `src/utils/i18n.ts` (3191 bytes)                         | Internationalization     |
| theme-controller             | `src/utils/theme-controller.ts` (11854 bytes)            | Theme management         |
| accessibility                | `src/utils/accessibility.ts` (7807 bytes)                | Accessibility features   |
| toast                        | `src/utils/toast.ts` (14428 bytes)                       | Toast notifications      |
| share                        | `src/utils/share.ts` (7497 bytes)                        | Share functionality      |
| share-controller             | `src/utils/share-controller.ts` (5849 bytes)             | Share UI controller      |
| showcase-lab                 | `src/utils/showcase-lab.ts` (18971 bytes)                | Showcase lab state       |
| showcase-lab-client          | `src/utils/showcase-lab-client.ts` (35001 bytes)         | Showcase lab UI          |
| enhanced-search              | `src/utils/enhanced-search.ts` (10244 bytes)             | Search enhancement       |
| search-suggestions           | `src/utils/search-suggestions.ts` (10042 bytes)          | Search suggestions       |
| search-history               | `src/utils/search-history.ts` (3371 bytes)               | Search history           |
| search-highlight             | `src/utils/search-highlight.ts` (2364 bytes)             | Search highlighting      |
| lazy-components              | `src/utils/lazy-components.ts` (2578 bytes)              | Lazy component loading   |
| lazy-image                   | `src/utils/lazy-image.ts` (4097 bytes)                   | Lazy image loading       |
| keyboard-shortcuts           | `src/utils/keyboard-shortcuts.ts` (4263 bytes)           | Keyboard shortcuts       |
| keyboard-nav-controller      | `src/utils/keyboard-nav-controller.ts` (3521 bytes)      | Keyboard navigation      |
| language-switcher-controller | `src/utils/language-switcher-controller.ts` (5243 bytes) | Language switching       |
| mobile-nav-controller        | `src/utils/mobile-nav-controller.ts` (2304 bytes)        | Mobile navigation        |
| parallax-scroll              | `src/utils/parallax-scroll.ts` (1862 bytes)              | Parallax scrolling       |
| particle-background          | `src/utils/particle-background.ts` (11031 bytes)         | Particle animation       |
| reading-progress             | `src/utils/reading-progress.ts` (6213 bytes)             | Reading progress         |
| scroll-reveal                | `src/utils/scroll-reveal.ts` (1086 bytes)                | Scroll reveal animation  |
| stats-counter                | `src/utils/stats-counter.ts` (4453 bytes)                | Animated counters        |
| countdown                    | `src/utils/countdown.ts` (3824 bytes)                    | Countdown timer          |
| showcase-carousel            | `src/utils/showcase-carousel.ts` (6459 bytes)            | Carousel logic           |
| global-init                  | `src/utils/global-init.ts` (1707 bytes)                  | Global initialization    |

## Storage Utility

`src/utils/storage.ts` (2304 bytes) provides safe localStorage access:

```typescript
export function safeGetItem(key: string, defaultValue: string | null = null): string | null
export function safeSetItem(key: string, value: string): boolean
export function safeRemoveItem(key: string): boolean
export function safeGetJSON<T>(key: string, defaultValue: T): T
export function safeSetJSON<T>(key: string, value: T): boolean
```

Handles privacy mode, storage quota errors gracefully.

## Error Handler

`src/utils/error-handler.ts` (8139 bytes) provides global error handling:

```typescript
export enum ErrorType {
    COMPONENT_ERROR = 'COMPONENT_ERROR',
    IMAGE_ERROR = 'IMAGE_ERROR',
    SCRIPT_ERROR = 'SCRIPT_ERROR',
    NETWORK_ERROR = 'NETWORK_ERROR',
    STORAGE_ERROR = 'STORAGE_ERROR',
    VALIDATION_ERROR = 'VALIDATION_ERROR',
}

export function registerErrorHandler(type: ErrorType, handler: ErrorHandler): () => void
export function triggerError(error: ErrorInfo): void
export function setupGlobalErrorHandlers(): void
```

## Analytics

`src/utils/analytics.ts` (7368 bytes) provides event tracking:

```typescript
export enum AnalyticsEvent {
    PAGE_SCROLL_25 = 'page_scroll_25',
    PAGE_SCROLL_50 = 'page_scroll_50',
    PAGE_SCROLL_75 = 'page_scroll_75',
    PAGE_SCROLL_100 = 'page_scroll_100',
    DOC_READ_START = 'doc_read_start',
    DOC_READ_COMPLETE = 'doc_read_complete',
    NAV_CLICK = 'nav_click',
    EXTERNAL_LINK = 'external_link',
    SEARCH_OPEN = 'search_open',
    SEARCH_QUERY = 'search_query',
    THEME_CHANGE = 'theme_change',
    JOIN_CLICK = 'join_click',
    ERROR_OCCURRED = 'error_occurred',
}

export function trackEvent(
    eventName: AnalyticsEvent | string,
    eventData?: Record<string, unknown>
): void
```

## Performance Monitoring

`src/utils/performance.ts` (8571 bytes) monitors Web Vitals:

```typescript
export interface PerformanceMetric {
    name: 'FCP' | 'LCP' | 'CLS' | 'FID' | 'TTFB' | 'INP'
    value: number
    rating: 'good' | 'needs-improvement' | 'poor'
    navigationType?: string
}

export function initPerformanceMonitor(): void
```

### Thresholds

```typescript
const THRESHOLDS = {
    FCP: { good: 1800, poor: 3000 },
    LCP: { good: 2500, poor: 4000 },
    CLS: { good: 0.1, poor: 0.25 },
    FID: { good: 100, poor: 300 },
    TTFB: { good: 800, poor: 1800 },
    INP: { good: 200, poor: 500 },
}
```

## Image Optimization

`src/utils/image-optimization.ts` (5422 bytes) provides client-side image optimization:

```typescript
export function optimizeExternalImage(url: string, width: number, quality: number): string
export function generateSrcset(url: string, widths: number[]): string
```

## Component Initialization

`src/utils/component-init.ts` (4902 bytes) manages component lifecycle:

```typescript
export function initComponent(
    selector: string,
    initFn: (element: HTMLElement) => CleanupFunction | void
): boolean
export function initElement(
    element: HTMLElement,
    initFn: (element: HTMLElement) => CleanupFunction | void
): boolean
export function cleanupComponent(selector: string): void
export function setupComponentLifecycle(
    selector: string,
    initFn: (element: HTMLElement) => CleanupFunction | void
): void
```

Uses WeakMap to prevent memory leaks.

## Logger

`src/utils/logger.ts` (1612 bytes) provides logging:

```typescript
export function createLogger(namespace: string): {
    info: (message: string, data?: unknown) => void
    warn: (message: string, data?: unknown) => void
    error: (message: string, data?: unknown) => void
}
```

## Accessibility

`src/utils/accessibility.ts` (7807 bytes) provides accessibility features:

```typescript
export interface A11yPreferences {
    highContrast: boolean
    largeText: boolean
    reducedMotion: boolean
    screenReaderOptimized: boolean
    keyboardNavigationOnly: boolean
}

export function announce(message: string, priority?: 'polite' | 'assertive'): void
export function trapFocus(element: HTMLElement): () => void
export function setA11yPreferences(prefs: Partial<A11yPreferences>): void
```

## Related Pages

- [Interactive Features](../features/interactive.md)
- [Showcase Lab Architecture](../architecture/showcase-lab.md)
- [Security Configuration](../configuration/security.md)
