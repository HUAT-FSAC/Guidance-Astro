# Bilingual Site Handoff Plan Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Hand off the current bilingual-site and English-slug-migration work in a way that lets the next engineer continue without reconstructing context from chat history.

**Architecture:** The site now uses a bilingual Starlight setup with Chinese at the root and English under `/en/`. Most English content has been added, and English-only slug migration is partly complete through content moves, redirect pages in `src/content/docs/en`, and dedicated legacy redirects under `src/pages/en` where the content collection could not safely host the old routes.

**Tech Stack:** Astro, Starlight, MD/MDX, Playwright, PowerShell

---

### Task 1: Understand the current completion state

**Files:**

- Check: `astro.config.mjs`
- Check: `tests/e2e/navigation.spec.ts`
- Check: `tests/e2e/smoke.spec.ts`
- Check: `src/content/docs/en/`
- Check: `src/pages/en/`
- Check: `docs/plans/2026-03-21-site-bilingual-design.md`
- Check: `docs/plans/2026-03-22-old-archive-english-slug-migration.md`

**Step 1: Review what is already finished**

The following work is already in place:

- Starlight bilingual configuration is enabled.
- Homepage, docs-center, archive entry pages, and deep archive pages all have English content.
- English `docs-center` pages already use English slugs.
- 2025 English archive groups already migrated to English slugs: sensing, planning-control, electrical, mechanical, localization-mapping, simulation, and management.
- Remaining old-archive English Chinese-path pages have now been migrated to English slugs.

**Step 2: Know where legacy compatibility now lives**

There are two redirect mechanisms in the repo:

- content-based redirect pages under `src/content/docs/en/...` for many 2025 English legacy routes
- page-level redirect routes under `src/pages/en/...` for some old-archive legacy routes where the content collection produced duplicate-id conflicts

### Task 2: Preserve current verification baseline

**Files:**

- Check: `tests/e2e/navigation.spec.ts`
- Check: `tests/e2e/smoke.spec.ts`

**Step 1: Treat these results as the current baseline**

Latest fresh verification completed successfully with:

- `pnpm build`
- `pnpm test:e2e -- tests/e2e/navigation.spec.ts tests/e2e/smoke.spec.ts`

Expected result at handoff time:

- build passes
- Playwright passes with `41 passed`

**Step 2: Be aware of the remaining non-blocking warning**

`pnpm build` still emits a non-blocking duplicate-id warning for:

- `en/archive/planning-control/resource-roundup`

This comes from the current coexistence of a content entry and a higher-priority page route. Behavior is correct, but this should be cleaned up if the next engineer wants a warning-free build.

### Task 3: Clean up the remaining route-warning debt

**Files:**

- Modify: `src/content/docs/en/archive/planning-control/resource-roundup.md`
- Modify or remove: `src/pages/en/archive/planning-control/资料汇总.astro`
- Modify: `astro.config.mjs`

**Step 1: Pick one redirect strategy per legacy route**

For every old English route, keep exactly one of these:

- a content-collection redirect page
- a `src/pages` redirect route
- a config redirect that is actually honored in dev and build

Do not keep overlapping strategies for the same route if they produce duplicate ids or route-priority warnings.

**Step 2: Resolve the remaining `planning-control/resource-roundup` warning**

Recommended approach:

- keep the real content at `src/content/docs/en/archive/planning-control/resource-roundup.md`
- keep the legacy old path redirect at `src/pages/en/archive/planning-control/资料汇总.astro`
- make sure there is no competing legacy content entry for the old path in `src/content/docs/en/archive/planning-control/`

### Task 4: Decide how to package the current work for commit or PR

**Files:**

- Check: `git status --short`

**Step 1: Separate bilingual work from unrelated local changes**

At the time of handoff, the worktree is still dirty and includes both:

- bilingual / English-content / slug-migration changes
- unrelated existing modifications in other files

Before committing, the next engineer should identify which changed files belong to the bilingual handoff and avoid reverting unrelated user work.

**Step 2: Use the changed-file groups below as a starting boundary**

Likely bilingual-related areas:

- `astro.config.mjs`
- `.config/sidebar.mjs`
- `src/data/home.ts`
- `src/components/home/sections/*`
- `src/components/home/ui/MobileNavigation.astro`
- `src/content/docs/en/**`
- `src/pages/en/**`
- `tests/e2e/navigation.spec.ts`
- `tests/e2e/smoke.spec.ts`
- `tests/unit/i18n.test.ts`
- `tests/unit/home-i18n.test.ts`
- `docs/plans/*.md` created during this migration effort

### Task 5: Optional next work after handoff

**Files:**

- Modify as needed after warning cleanup

**Step 1: If the goal is stability**

Do this next:

- remove the remaining build warning
- review whether all legacy redirect routes still need to exist
- normalize the redirect strategy so future maintenance is predictable

**Step 2: If the goal is polish**

Do this next:

- expand unit coverage around locale path helpers and redirect helpers
- review sidebar labels and English naming consistency
- decide whether old English compatibility URLs should remain long-term or eventually be retired

**Step 3: If the goal is shipping**

Do this next:

- stage only the bilingual-related files
- rerun `pnpm build`
- rerun `pnpm test:e2e -- tests/e2e/navigation.spec.ts tests/e2e/smoke.spec.ts`
- then prepare the commit or PR description from this handoff doc
