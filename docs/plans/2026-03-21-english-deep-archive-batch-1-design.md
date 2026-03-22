# English Deep Archive Batch 1 Design

**Date:** 2026-03-21

## Goal

Translate the first large batch of deep archive pages so the English site is useful beyond landing pages and news posts.

## Scope

This batch covers three groups with high user value:

- `archive/general/*`
- `archive/2025/sensing/*`
- `archive/2025/planning-control/*`

These are the highest-impact untranslated technical pages still reachable from the English archive entry pages.

## Approaches Considered

### 1. Translate every remaining archive page in a single batch

Pros:

- Fastest route to complete coverage.

Cons:

- Too much surface area for one review cycle.
- High risk of inconsistent terminology.
- Harder to verify when something breaks.

### 2. Translate by domain in coherent batches

Pros:

- Keeps terminology consistent within a subsystem.
- Lets browser verification focus on representative routes.
- Makes progress visible without destabilizing the whole content tree.

Cons:

- Some untranslated pages remain between batches.

### 3. Translate only the shortest pages first

Pros:

- Maximizes page-count coverage quickly.

Cons:

- Leaves the most important technical content untranslated.
- Produces a fragmented user experience.

## Recommendation

Choose approach 2. Translate one coherent set of subsystems at a time, starting with general tooling, sensing, and planning/control.

## Content Rules

- Chinese source files remain unchanged.
- Add English counterparts under `src/content/docs/en/...` with the same route structure.
- Rewrite for natural English while preserving instructional meaning and team-specific context.
- Preserve code blocks, screenshots, and external references.
- Keep internal links on English pages pointing to English routes when those pages exist.
- For pages whose English counterpart is not in this batch, keep the existing route so the fallback page still works.

## Testing Strategy

- Add focused Playwright coverage for representative deep English pages in each translated group.
- Run `pnpm build` after content creation to catch MDX/frontmatter issues.
- Run the focused Playwright suite after translation.

## Risks

- Some original docs are informal and include team-specific advice; the English rewrite should preserve intent without sounding machine-translated.
- A few older paths contain mixed Chinese directory names; this batch keeps those routes stable rather than redesigning them.
