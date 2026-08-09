---
type: concept
title: Navigation Components
description: Navigation components including AnchorNavigation, SidebarState, and mobile navigation controller.
tags: [components, navigation, ui]
timestamp: 2026-04-15
---

# Navigation Components

Navigation components provide site-wide navigation functionality.

## Component Inventory

| Component        | File                                                            | Purpose                      |
| ---------------- | --------------------------------------------------------------- | ---------------------------- |
| AnchorNavigation | `src/components/navigation/AnchorNavigation.astro` (9075 bytes) | Table of contents navigation |
| SidebarState     | `src/components/navigation/SidebarState.astro` (4503 bytes)     | Sidebar state management     |

## AnchorNavigation

`src/components/navigation/AnchorNavigation.astro` (9075 bytes) provides in-page navigation using headings.

### Features

- Auto-generates anchor links from headings
- Highlights current section on scroll
- Smooth scrolling to sections
- Responsive design

### Configuration

Starlight's table of contents configuration:

```javascript
tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 4 }
```

Generates anchors for h2, h3, and h4 headings.

## SidebarState

`src/components/navigation/SidebarState.astro` (4503 bytes) manages sidebar state.

### Features

- Remembers collapsed/expanded state
- Persists state in localStorage
- Animates transitions

## Mobile Navigation

### MobileNavigation Component

`src/components/home/ui/MobileNavigation.astro` (10577 bytes) provides mobile-specific navigation.

### MobileNavController

`src/utils/mobile-nav-controller.ts` (2304 bytes) handles mobile navigation logic:

- Touch gesture support
- Swipe to open/close
- Animation timing
- State management

## Keyboard Navigation

### KeyboardNav Component

`src/components/home/ui/KeyboardNav.astro` (5406 bytes) provides keyboard shortcuts.

### KeyboardNavController

`src/utils/keyboard-nav-controller.ts` (3521 bytes) implements keyboard navigation.

### KeyboardShortcuts

`src/utils/keyboard-shortcuts.ts` (4263 bytes) defines keyboard shortcuts:

| Shortcut       | Action            |
| -------------- | ----------------- |
| `Ctrl/Cmd + K` | Open search       |
| `Escape`       | Close modals      |
| `Arrow keys`   | Navigate sections |

## Language Switching

### LanguageSwitcher Component

`src/components/home/ui/LanguageSwitcher.astro` (5521 bytes) provides language switching UI.

### LanguageSwitcherController

`src/utils/language-switcher-controller.ts` (5243 bytes) handles:

- Locale detection
- URL path generation
- Dropdown menu interaction

## Related Pages

- [Home Page Components](./home-page.md)
- [Documentation Components](./docs-components.md)
- [Internationalization Configuration](../configuration/i18n.md)
