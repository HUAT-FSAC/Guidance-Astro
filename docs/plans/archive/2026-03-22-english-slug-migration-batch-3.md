# English Slug Migration Batch 3 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate the remaining 2025 English archive pages with Chinese path names to stable English slugs while preserving backward-compatible English redirect routes.

**Architecture:** Keep Chinese-source content untouched and only change the English locale tree. For each migrated page, move the real English content to an English slug, leave a hidden redirect page at the old Chinese English path, update section index pages and Astro redirects, then extend end-to-end coverage for both the new slug and the legacy path.

**Tech Stack:** Astro, Starlight, MDX, Playwright, PowerShell

---

### Task 1: Plan the slug map for remaining 2025 English Chinese-path pages

**Files:**

- Modify: `docs/plans/2026-03-22-english-slug-migration-batch-3.md`
- Check: `src/content/docs/en/archive/2025/localization-mapping/index.mdx`
- Check: `src/content/docs/en/archive/2025/simulation/index.mdx`
- Check: `src/content/docs/en/archive/2025/management/index.mdx`

**Step 1: Confirm the remaining Chinese-path English pages**

Run: `rg --files src/content/docs/en/archive/2025 | rg "[\p{Han}]"`
Expected: the remaining real-content targets are the localization-mapping, simulation, and management leaves.

**Step 2: Define the English slug map**

Use these mappings:

- `学习路线` -> `learning-path`
- `记录` -> `season-notes`
- `仿真` -> `simulation-platforms`
- `新媒体` -> `media-operations`
- `营销` -> `business-development`
- `运营` -> `team-operations`

**Step 3: Save the batch plan**

Write this document and keep the slug map explicit so implementation and verification use the same target names.

### Task 2: Migrate localization and simulation pages

**Files:**

- Modify: `src/content/docs/en/archive/2025/localization-mapping/index.mdx`
- Modify: `src/content/docs/en/archive/2025/simulation/index.mdx`
- Move: `src/content/docs/en/archive/2025/localization-mapping/学习路线.mdx` -> `src/content/docs/en/archive/2025/localization-mapping/learning-path.mdx`
- Move: `src/content/docs/en/archive/2025/localization-mapping/记录.mdx` -> `src/content/docs/en/archive/2025/localization-mapping/season-notes.mdx`
- Move: `src/content/docs/en/archive/2025/simulation/仿真.mdx` -> `src/content/docs/en/archive/2025/simulation/simulation-platforms.mdx`
- Create: `src/content/docs/en/archive/2025/localization-mapping/学习路线.mdx`
- Create: `src/content/docs/en/archive/2025/localization-mapping/记录.mdx`
- Create: `src/content/docs/en/archive/2025/simulation/仿真.mdx`

**Step 1: Move the real English content files to their English slugs**

Run: `Move-Item` for the three files.
Expected: the new slug files contain the real English content.

**Step 2: Update the index pages**

Change all `/en/archive/2025/localization-mapping/学习路线/`, `/记录/`, and `/en/archive/2025/simulation/仿真/` links to the new slugs.

**Step 3: Add hidden redirect pages at the old Chinese English paths**

Create MDX redirect pages with `sidebar.hidden: true`, meta refresh, and `window.location.replace(...)`.

### Task 3: Migrate management pages

**Files:**

- Modify: `src/content/docs/en/archive/2025/management/index.mdx`
- Move: `src/content/docs/en/archive/2025/management/新媒体.mdx` -> `src/content/docs/en/archive/2025/management/media-operations.mdx`
- Move: `src/content/docs/en/archive/2025/management/营销.mdx` -> `src/content/docs/en/archive/2025/management/business-development.mdx`
- Move: `src/content/docs/en/archive/2025/management/运营.mdx` -> `src/content/docs/en/archive/2025/management/team-operations.mdx`
- Create: `src/content/docs/en/archive/2025/management/新媒体.mdx`
- Create: `src/content/docs/en/archive/2025/management/营销.mdx`
- Create: `src/content/docs/en/archive/2025/management/运营.mdx`

**Step 1: Move the three management content files to English slugs**

Run: `Move-Item` for each path.
Expected: the real pages live at English URLs.

**Step 2: Update index links**

Point the management landing page to `/media-operations/`, `/business-development/`, and `/team-operations/`.

**Step 3: Create compatibility redirect pages**

Use the same hidden redirect-page pattern as earlier slug migration batches.

### Task 4: Wire redirects, expand tests, and verify

**Files:**

- Modify: `astro.config.mjs`
- Modify: `tests/e2e/navigation.spec.ts`

**Step 1: Add explicit Astro redirects**

Insert redirects for:

- `/en/archive/2025/localization-mapping/学习路线/` -> `/en/archive/2025/localization-mapping/learning-path/`
- `/en/archive/2025/localization-mapping/记录/` -> `/en/archive/2025/localization-mapping/season-notes/`
- `/en/archive/2025/simulation/仿真/` -> `/en/archive/2025/simulation/simulation-platforms/`
- `/en/archive/2025/management/新媒体/` -> `/en/archive/2025/management/media-operations/`
- `/en/archive/2025/management/营销/` -> `/en/archive/2025/management/business-development/`
- `/en/archive/2025/management/运营/` -> `/en/archive/2025/management/team-operations/`

**Step 2: Extend Playwright coverage**

Add assertions for:

- old Chinese English URLs redirecting to the new slugs
- direct access to `learning-path`, `simulation-platforms`, and `business-development` or `team-operations`

**Step 3: Verify build and end-to-end behavior**

Run: `pnpm build`
Expected: build succeeds with the new routes present.

Run: `pnpm test:e2e -- tests/e2e/navigation.spec.ts tests/e2e/smoke.spec.ts`
Expected: all tests pass, including redirect and direct-page coverage for the new slug set.
