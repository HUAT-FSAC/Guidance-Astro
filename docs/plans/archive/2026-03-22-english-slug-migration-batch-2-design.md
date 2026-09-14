# English Slug Migration Batch 2 Design

**Date:** 2026-03-22

## Goal

Replace the remaining Chinese path names in the English 2025 electrical and mechanical sections with English slugs, while preserving compatibility for existing English URLs that still use Chinese names.

## Scope

This batch covers:

- `en/archive/2025/electrical/电池箱` -> `en/archive/2025/electrical/battery-pack`
- `en/archive/2025/electrical/软件` -> `en/archive/2025/electrical/software-development`
- `en/archive/2025/electrical/线束` -> `en/archive/2025/electrical/wiring-harness`
- `en/archive/2025/electrical/硬件` -> `en/archive/2025/electrical/hardware-design`
- `en/archive/2025/mechanical/车架车身` -> `en/archive/2025/mechanical/frame-and-body`
- `en/archive/2025/mechanical/传动` -> `en/archive/2025/mechanical/drivetrain`
- `en/archive/2025/mechanical/制动` -> `en/archive/2025/mechanical/braking-system`
- `en/archive/2025/mechanical/转向悬架` -> `en/archive/2025/mechanical/steering-and-suspension`

## Approach

Rename only the English content files, update English-side internal links, and keep the old Chinese English URLs as hidden redirect pages. Chinese routes remain unchanged.

## Testing Strategy

- Update focused navigation tests to use the new electrical and mechanical slugs.
- Add redirect assertions for representative old Chinese English URLs.
- Run `pnpm build` and the focused Playwright suite.

## Risks

- Sidebar autogeneration follows file paths, so moved files must be reflected in links immediately.
- Existing external references to the old English Chinese URLs should continue to work through hidden redirect pages.
