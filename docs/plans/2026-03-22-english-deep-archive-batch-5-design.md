# English Deep Archive Batch 5 Design

**Date:** 2026-03-22

## Goal

Translate the remaining legacy archive leaf pages under sensing, planning-control, and simulation so the English archive no longer depends on locale fallbacks for these sections.

## Scope

This batch covers:

- `archive/sensing/资料汇总`
- `archive/sensing/ml-ai-guidance`
- `archive/sensing/数据集相关/dataset-generating`
- `archive/sensing/数据集相关/dataset-labeling`
- `archive/sensing/数据集相关/dataset-standard`
- `archive/planning-control/资料汇总`
- `archive/simulation/fssim-introduction`

## Approach

Add direct English counterparts under `src/content/docs/en/archive/...` while keeping the existing route structure. Preserve links, images, and procedural steps, but rewrite short notes into natural English phrasing that matches the rest of the English archive.

## Testing Strategy

- Replace the last untranslated-fallback assertion with a real English legacy-archive assertion.
- Add one additional check for a translated legacy resource page.
- Run `pnpm build` and the focused Playwright suite.

## Risks

- Several pages are intentionally short link collections, so the English versions should stay concise instead of expanding them unnecessarily.
- Dataset-labeling content includes many image assets and command snippets; translation should not disturb asset imports or command formatting.
