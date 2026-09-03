# English Deep Archive Batch 2 Design

**Date:** 2026-03-21

## Goal

Translate the next high-value deep archive batch for the English site, focusing on 2025 localization/mapping and simulation.

## Scope

This batch covers:

- `archive/2025/localization-mapping/学习路线`
- `archive/2025/localization-mapping/记录`
- `archive/2025/localization-mapping/ins5711daa`
- `archive/2025/simulation/仿真`

## Approach

Keep the same route structure and add English content under `src/content/docs/en/...` only. Do not change Chinese content, slugs, or sidebar structure.

## Content Rules

- Keep equipment names, protocol names, and formulas exact.
- Preserve screenshots, videos, code snippets, and tables.
- Rewrite for natural English while keeping team-specific meaning.
- Point parent links back to the existing English landing pages.

## Testing Strategy

- Add focused Playwright checks for representative English deep routes in localization/mapping and simulation.
- Run `pnpm build` to catch MDX/frontmatter issues.
- Run the focused Playwright suite after translation.

## Risks

- `ins5711daa` is long and hardware-specific, so wording should stay precise and operational.
- Some source notes are informal season handoff notes rather than polished docs; the English version should keep that practical tone.
