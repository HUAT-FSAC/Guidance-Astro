# English Deep Archive Batch 3 Design

**Date:** 2026-03-22

## Goal

Translate the 2025 electrical and mechanical deep archive pages so the English site covers the major vehicle-engineering branches as well as the autonomous stack.

## Scope

This batch covers:

- `archive/2025/electrical/{电池箱, 软件, 线束, 硬件}`
- `archive/2025/mechanical/{车架车身, 传动, 制动, 转向悬架}`

## Approach

Keep route structure unchanged and add English counterparts under `src/content/docs/en/...`. Preserve tables, formulas, and engineering terminology while rewriting the prose for natural English.

## Testing Strategy

- Add focused Playwright checks for one electrical page and one mechanical page.
- Run `pnpm build` after content creation.
- Run the focused Playwright suite after translation.

## Risks

- Vehicle-engineering docs contain concise technical shorthand; the English version should stay compact rather than over-explaining.
- Mixed Chinese path names remain intentional in this batch to avoid route churn.
