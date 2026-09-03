# English Deep Archive Batch 4 Design

**Date:** 2026-03-22

## Goal

Translate the remaining 2025 management pages so the English site includes the full operations, media, and sponsorship section instead of falling back to untranslated placeholders.

## Scope

This batch covers:

- `archive/2025/management/营销`
- `archive/2025/management/运营`
- `archive/2025/management/新媒体`

## Approach

Add English counterparts under `src/content/docs/en/archive/2025/management/` while keeping the existing Chinese path names unchanged. Preserve tables and workflow structure, but rewrite the guidance in natural English for an external reader.

## Testing Strategy

- Replace the old fallback assertion for a management page with a real English-content assertion.
- Run `pnpm build`.
- Run the focused Playwright suite.

## Risks

- These pages mix internal process language with outreach terminology, so wording should stay practical and avoid marketing fluff.
- The English management landing page already exists, so child pages must match its terminology closely.
