# HUAT FSAC Full-Site Bilingual Design

**Date:** 2026-03-21

## Goal

Add a complete Chinese and English experience for the HUAT FSAC site, including the homepage, navigation, Starlight documentation pages, content pages, language switching, and SEO metadata.

## Current State

- The project already contains translation utilities in `src/utils/i18n.ts`.
- Translation JSON files exist in `src/content/i18n/zh.json` and `src/content/i18n/en.json`.
- The homepage and several UI labels are still hard-coded in Chinese in `src/data/home.ts` and `src/content/docs/index.mdx`.
- The existing `LanguageSwitcher.astro` explicitly disables English.
- Starlight is not yet configured as a real multilingual documentation site.
- The sidebar is Chinese-only in `.config/sidebar.mjs`.

## Requirements

1. Chinese remains the default locale at root paths such as `/`, `/join/`, `/team/`.
2. English content is available under `/en/` for the same paths, such as `/en/`, `/en/join/`, `/en/team/`.
3. Homepage, top-level pages, and documentation pages must all support locale-aware rendering.
4. Language switching should preserve the current page path whenever a translated route exists.
5. English pages without translated content should render a clear English placeholder rather than silently mixing Chinese content.
6. SEO should expose locale metadata and alternate language links.

## Recommended Approach

Use explicit locale-based content trees and route prefixes:

- Keep Chinese as the default locale without a prefix.
- Serve English pages with the `/en/` prefix.
- Convert page-level content that is currently data-driven into locale-aware content factories.
- Enable Starlight i18n and provide locale-specific sidebar definitions.
- Add English mirror content files for key pages first, and use a controlled fallback page for untranslated docs.

This is the most maintainable path because it aligns with Starlight’s content model and avoids mixed-language rendering inside a single document.

## Content Model

### Homepage and marketing sections

- Replace static exports in `src/data/home.ts` with locale-aware helpers.
- All homepage sections should receive strings and structured data for the active locale.

### Top-level docs pages

- Split the current docs content into locale-aware document trees.
- Preserve relative route parity between Chinese and English pages.

### Untranslated English pages

- Add a reusable English placeholder pattern for docs that have no translation yet.
- Keep the route stable so links, sidebar generation, and future content additions do not require another routing change.

## Routing

- Chinese default:
    - `/`
    - `/join/`
    - `/team/`
- English:
    - `/en/`
    - `/en/join/`
    - `/en/team/`

The language switcher should transform the current path between these route spaces consistently.

## Sidebar Strategy

- Replace the single sidebar config with locale-specific sidebar factories or two locale-specific definitions.
- Chinese labels remain unchanged.
- English labels should use translated section names and translated manual links.

## SEO and Metadata

- Set page language metadata for each locale.
- Add alternate locale links where paired routes exist.
- Localize title and description metadata for the homepage and key pages.
- Keep canonical URLs locale-correct.

## Testing Strategy

- Extend unit tests for `src/utils/i18n.ts` to cover route conversion and locale detection.
- Add tests for locale-aware homepage data helpers.
- Add end-to-end assertions that:
    - Chinese root renders Chinese content.
    - English root renders English content.
    - Language switching changes the route.
    - English untranslated docs show the intended placeholder.

## Risks

- Full document translation is a large content migration, so the initial implementation should prioritize architecture plus key entry pages.
- Some current MDX pages contain hard-coded internal links that will need locale-aware replacements.
- Sidebar autogeneration depends on content tree layout, so file organization must be kept consistent between locales.

## Implementation Phases

1. Enable locale-aware routing and Starlight config.
2. Refactor shared homepage and UI content to locale-aware data.
3. Replace the disabled language switcher with a real route switcher.
4. Add locale-specific sidebars and metadata.
5. Create English mirror pages for core entry pages.
6. Add placeholder support for untranslated docs.
7. Verify with unit tests, e2e tests, and a production build.
