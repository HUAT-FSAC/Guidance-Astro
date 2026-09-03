# English Archive Entry Pages Design

**Date:** 2026-03-21

## Goal

Replace the remaining high-visibility English fallback pages with real English content so the `/en/` site feels navigable beyond `docs-center`.

## Scope

This round covers the entry pages that are directly exposed through the English sidebar or major entry links:

- `archive/2025/index`
- `archive/2025/{sensing, localization-mapping, planning-control, simulation, electrical, mechanical, management, inspection}/index`
- `archive/{general, localization-mapping, planning-control, sensing, simulation}/index`
- `archive/2024/2024-learning-roadmap`
- `open-source-projects`
- `news/{2024-season-finale, new-car-development, path-planning}`

Deep technical leaf pages remain out of scope for this pass and may still use the locale fallback page.

## Approaches Considered

### 1. Translate everything in one pass

Pros:

- Removes nearly all fallback pages immediately.

Cons:

- Large scope, higher review risk, and uneven terminology quality across deep technical pages.

### 2. Translate only visible entry pages

Pros:

- Best effort-to-impact ratio.
- Makes the English site browseable end-to-end from the sidebar and home entry points.
- Keeps this round focused and testable.

Cons:

- Deep leaf pages still need later work.

### 3. Keep fallback pages and only improve the fallback message

Pros:

- Lowest effort.

Cons:

- Does not materially improve the English content footprint.

## Recommendation

Choose approach 2. It preserves the bilingual architecture already in place and upgrades the English experience where users are most likely to notice gaps first.

## Content Strategy

- Preserve existing Chinese paths and content unchanged.
- Add locale-specific English pages under `src/content/docs/en/...`.
- Keep route structure stable; do not introduce a second archive URL scheme in this pass.
- Rewrite copy for natural English while preserving the original structure and intent.
- Update links inside English pages to stay inside English routes when an English page exists.
- Leave links to untranslated deep leaf pages pointing to their current routes; those pages will continue to show the existing translation-in-progress fallback.

## Testing Strategy

- Extend Playwright coverage for representative English archive and news routes.
- Run `pnpm build` to verify Starlight content generation.
- Run the navigation/smoke e2e suite to verify the new English entry pages render correctly.

## Risks

- English pages may still contain links to untranslated deep pages; that is acceptable in this round as long as top-level navigation remains coherent.
- Some older docs use legacy Chinese redirect paths; avoid changing those in this pass.
