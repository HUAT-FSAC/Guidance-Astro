---
type: concept
title: Testing Strategy
description: Testing strategy including Vitest unit tests, Playwright E2E tests, and component conflict invariants.
tags: [testing, vitest, playwright]
timestamp: 2026-04-15
---

# Testing Strategy

The site uses Vitest for unit tests and Playwright for E2E tests.

## Test Configuration

### Vitest

`.config/vitest.config.ts` (337 bytes):

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        // Vitest configuration
    },
})
```

### Playwright

`.config/playwright.config.ts` (968 bytes):

```typescript
import { defineConfig } from '@playwright/test'

export default defineConfig({
    testDir: './tests/e2e',
    // Playwright configuration
})
```

## Unit Tests

Located in `tests/unit/`:

| Test File                    | Size        | What It Tests                  |
| ---------------------------- | ----------- | ------------------------------ |
| `analytics.test.ts`          | 3070 bytes  | Analytics event tracking       |
| `error-handler.test.ts`      | 2462 bytes  | Error handling system          |
| `home-i18n.test.ts`          | 1053 bytes  | Home page i18n                 |
| `i18n.test.ts`               | 3865 bytes  | Internationalization utilities |
| `image-optimization.test.ts` | 1731 bytes  | Image optimization             |
| `lazy-components.test.ts`    | 1659 bytes  | Lazy component loading         |
| `search-highlight.test.ts`   | 2542 bytes  | Search highlighting            |
| `search-suggestions.test.ts` | 2039 bytes  | Search suggestions             |
| `security.test.ts`           | 4160 bytes  | Security configuration         |
| `share.test.ts`              | 3930 bytes  | Share functionality            |
| `showcase-lab.test.ts`       | 10799 bytes | Showcase lab logic             |
| `storage.test.ts`            | 3914 bytes  | Storage utilities              |

### Running Unit Tests

```bash
pnpm test           # Watch mode
pnpm test:run       # Single run
pnpm test:coverage  # With coverage
```

## E2E Tests

Located in `tests/e2e/`:

| Test File                    | Size        | What It Tests                 |
| ---------------------------- | ----------- | ----------------------------- |
| `accessibility.spec.ts`      | 1974 bytes  | Accessibility features        |
| `component-conflict.spec.ts` | 9370 bytes  | Component conflict invariants |
| `docs-features.spec.ts`      | 1681 bytes  | Documentation features        |
| `i18n-switcher.spec.ts`      | 9163 bytes  | Language switching            |
| `navigation.spec.ts`         | 9768 bytes  | Navigation behavior           |
| `showcase-lab.spec.ts`       | 14942 bytes | Showcase lab features         |
| `smoke.spec.ts`              | 2211 bytes  | Basic smoke tests             |

### Running E2E Tests

```bash
pnpm test:e2e
```

## Component Conflict Invariants

`tests/e2e/component-conflict.spec.ts` (9370 bytes) proves critical cross-cutting invariants.

### Theme Switcher Exclusivity

```typescript
test('主题切换组件', async ({ page }) => {
    // On home page: .theme-switcher count is 1
    await page.goto('/')
    const homeThemeSwitchers = await page.locator('.theme-switcher').count()
    expect(homeThemeSwitchers).toBe(1)

    // On docs pages: .theme-switcher count is 0
    await page.goto('/join/')
    const docsThemeSwitchers = await page.locator('.theme-switcher').count()
    expect(docsThemeSwitchers).toBe(0)
})
```

### Progress Bar Mutual Exclusivity

```typescript
test('进度条组件', async ({ page }) => {
    // On home page: .scroll-progress visible, .reading-progress-bar hidden
    await page.goto('/')
    await expect(page.locator('.scroll-progress')).toBeVisible()
    await expect(page.locator('.reading-progress-bar')).toBeHidden()

    // On docs pages: .scroll-progress hidden, .reading-progress-bar visible
    await page.goto('/join/')
    await expect(page.locator('.scroll-progress')).toBeHidden()
    await expect(page.locator('.reading-progress-bar')).toBeVisible()
})
```

### Theme State Persistence

```typescript
test('主题状态持久化', async ({ page }) => {
    await page.goto('/')
    // Change theme
    await page.click('.theme-toggle')
    // Reload page
    await page.reload()
    // Theme should persist
    const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'))
    expect(theme).toBe('light')
})
```

## Showcase Lab E2E Tests

`tests/e2e/showcase-lab.spec.ts` (14942 bytes) tests:

### Presentation Console

- Compare Mode toggle and delta display
- Demo Script step navigation
- Cache Simulator warm/drift/reset

### Replay Controls

- Play/Pause functionality
- Frame navigation (previous/next/jump)
- Auto-advance behavior

### Scenario Selection

- Scenario chip switching
- Data updates on selection
- LocalStorage persistence

## Accessibility Tests

`tests/e2e/accessibility.spec.ts` (1974 bytes) tests:

- Keyboard navigation
- Screen reader compatibility
- Focus management
- ARIA attributes

## Navigation Tests

`tests/e2e/navigation.spec.ts` (9768 bytes) tests:

- Sidebar navigation
- Breadcrumb navigation
- Mobile navigation
- Language switching

## i18n Switcher Tests

`tests/e2e/i18n-switcher.spec.ts` (9163 bytes) tests:

- Language switching UI
- URL path updates
- Content language changes
- Locale persistence

## Smoke Tests

`tests/e2e/smoke.spec.ts` (2211 bytes) tests:

- Home page loads
- Documentation pages load
- 404 page works
- Search functionality works

## Test Coverage

```bash
pnpm test:coverage
```

Uses `@vitest/coverage-v8` for coverage reporting.

## Related Pages

- [Development Tooling](../configuration/tooling.md)
- [Interactive Features](../features/interactive.md)
- [Showcase Lab Features](../features/showcase-lab.md)
