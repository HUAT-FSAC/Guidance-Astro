# English Slug Migration Batch 1 Design

**Date:** 2026-03-22

## Goal

Replace the remaining Chinese path names in the English 2025 sensing and planning-control sections with clean English slugs, while preserving backward compatibility through redirects.

## Scope

This batch covers:

- `en/archive/2025/sensing/激光雷达` -> `en/archive/2025/sensing/lidar`
- `en/archive/2025/sensing/摄像头` -> `en/archive/2025/sensing/camera`
- `en/archive/2025/planning-control/控制` -> `en/archive/2025/planning-control/control-fundamentals`
- `en/archive/2025/planning-control/高速循迹` -> `en/archive/2025/planning-control/high-speed-tracking`
- `en/archive/2025/planning-control/直线` -> `en/archive/2025/planning-control/straight-line-acceleration`

## Approach

Rename only the English content files, update English-side internal links, and add redirects from the old Chinese English URLs to the new English slugs. Chinese pages and Chinese route structure remain unchanged.

## Testing Strategy

- Update focused navigation tests to use the new English slugs.
- Add redirect assertions from old Chinese English paths to the new English-slug routes.
- Run `pnpm build` and the focused Playwright suite.

## Risks

- Sidebar autogeneration depends on file paths, so every moved file must have matching redirects and updated internal links.
- Old English URLs with Chinese names may still exist externally, so compatibility redirects are required.
