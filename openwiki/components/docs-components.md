---
type: concept
title: Documentation Components
description: Custom documentation components including DocFloatingActions, ReadingProgress, ShareButton, Breadcrumbs, and image/video components.
tags: [components, documentation, ui]
timestamp: 2026-04-15
---

# Documentation Components

Documentation pages use custom components for enhanced user experience.

## Component Inventory

All documentation components are in `src/components/docs/`:

| Component               | File                                          | Purpose                                |
| ----------------------- | --------------------------------------------- | -------------------------------------- |
| DocFloatingActions      | `DocFloatingActions.astro` (18883 bytes)      | Floating action buttons (theme, share) |
| ReadingProgress         | `ReadingProgress.astro` (5865 bytes)          | Reading progress bar                   |
| ShareButton             | `ShareButton.astro` (10247 bytes)             | Share functionality                    |
| Breadcrumbs             | `Breadcrumbs.astro` (7969 bytes)              | Breadcrumb navigation                  |
| EditPageLink            | `EditPageLink.astro` (5582 bytes)             | Edit on GitHub link                    |
| CarsShowcase            | `CarsShowcase.astro` (15130 bytes)            | Car showcase display                   |
| ImageCompare            | `ImageCompare.astro` (10720 bytes)            | Image comparison slider                |
| ImageLightbox           | `ImageLightbox.astro` (9629 bytes)            | Image lightbox viewer                  |
| MemberCard              | `MemberCard.astro` (5262 bytes)               | Team member card                       |
| ProjectMetricsDashboard | `ProjectMetricsDashboard.astro` (11646 bytes) | Metrics dashboard                      |
| BilibiliVideo           | `BilibiliVideo.astro` (986 bytes)             | Bilibili video embed                   |
| Video                   | `Video.astro` (861 bytes)                     | Video component                        |

## DocFloatingActions

`src/components/docs/DocFloatingActions.astro` (18883 bytes) manages the floating action buttons in the bottom-right corner of documentation pages.

### Features

- **Theme Toggle**: Quick theme switching with color picker
- **Share Button**: Share page via multiple platforms

### Theme Toggle

Uses `THEME_COLORS` from `src/utils/theme-controller.ts`:

```typescript
export const THEME_COLORS: ThemeColor[] = [
    { key: 'classicOrange', color: '#f39c12', accent: '#e67e22' },
    { key: 'gamingBlue', color: '#3498db', accent: '#2980b9' },
    { key: 'racingRed', color: '#e74c3c', accent: '#c0392b' },
    { key: 'techPurple', color: '#9b59b6', accent: '#8e44ad' },
    { key: 'speedGreen', color: '#2ecc71', accent: '#27ae60' },
]
```

### Share Button

Integrates with `src/utils/share.ts` for:

- Native Web Share API (mobile)
- Copy to clipboard
- QR code generation
- Social media sharing

## ReadingProgress

`src/components/docs/ReadingProgress.astro` (5865 bytes) shows reading progress.

### Features

- **Progress Bar**: Top progress bar showing scroll position
- **Reading Time**: Estimated reading time based on content
- **Percentage**: Current scroll percentage

### Reading Time Calculation

````typescript
function calculateReadingTime(text: string, wpm: number): number {
    const cleanText = text
        .replace(/<[^>]*>/g, '')
        .replace(/```[\s\S]*?```/g, '')
        .replace(/`[^`]*`/g, '')

    const chineseChars = (cleanText.match(/[\u4e00-\u9fa5]/g) || []).length
    const englishWords = cleanText
        .replace(/[\u4e00-\u9fa5]/g, '')
        .split(/\s+/)
        .filter((word) => word.length > 0).length

    const totalWordEquivalent = chineseChars + englishWords
    const minutes = Math.ceil(totalWordEquivalent / wpm)

    return Math.max(1, minutes)
}
````

Default: 300 words per minute for Chinese text.

## ShareButton

`src/components/docs/ShareButton.astro` (10247 bytes) provides sharing functionality.

### Supported Platforms

- Twitter
- Weibo
- WeChat (QR code)
- LinkedIn
- Facebook
- Telegram
- Email

### QR Code Generation

Uses `qrcode` package to generate QR codes for WeChat sharing.

## Breadcrumbs

`src/components/docs/Breadcrumbs.astro` (7969 bytes) provides navigation breadcrumbs.

- Auto-generates from sidebar structure
- Supports bilingual labels
- Links to parent pages

## Image Components

### ImageCompare

`src/components/docs/ImageCompare.astro` (10720 bytes) provides an image comparison slider for before/after comparisons.

### ImageLightbox

`src/components/docs/ImageLightbox.astro` (9629 bytes) provides a lightbox for viewing images in full size.

## Video Components

### BilibiliVideo

`src/components/docs/BilibiliVideo.astro` (986 bytes) embeds Bilibili videos.

### Video

`src/components/docs/Video.astro` (861 bytes) provides a generic video component.

## Project Metrics Dashboard

`src/components/docs/ProjectMetricsDashboard.astro` (11646 bytes) displays project progress metrics.

Data source: `src/data/metrics/project-progress.json` (auto-generated by `collect-github-metrics.mjs`).

## Related Pages

- [Home Page Structure](./home-page.md)
- [Starlight Overrides](./starlight-overrides.md)
- [Interactive Features](../features/interactive.md)
