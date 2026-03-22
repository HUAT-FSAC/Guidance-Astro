# Old Archive English Slug Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate the remaining legacy English archive pages that still use Chinese directory or file names to clean English slugs while preserving backward-compatible redirect routes.

**Architecture:** Only the English locale tree changes. Real content moves to English file and directory names, legacy Chinese-path English routes remain as hidden redirect pages, and Astro redirects plus Playwright coverage are updated so both old and new URLs behave correctly.

**Tech Stack:** Astro, Starlight, Markdown/MDX, Playwright, PowerShell

---

### Task 1: Define the final old-archive slug map

**Files:**

- Create: `docs/plans/2026-03-22-old-archive-english-slug-migration.md`
- Check: `src/content/docs/en/archive/sensing/资料汇总.md`
- Check: `src/content/docs/en/archive/planning-control/资料汇总.md`
- Check: `src/content/docs/en/archive/general/ROS 入门/ros-toturial-creating-ws-and-package.md`
- Check: `src/content/docs/en/archive/sensing/数据集相关/dataset-generating.md`
- Check: `src/content/docs/en/archive/sensing/数据集相关/dataset-labeling.mdx`
- Check: `src/content/docs/en/archive/sensing/数据集相关/dataset-standard.md`

**Step 1: Confirm the remaining Chinese-path English targets**

Run: `rg --files src/content/docs/en/archive | rg "[\p{Han}]"`
Expected: only legacy roundups, ROS basics, dataset pages, and previously-created redirect pages remain.

**Step 2: Use this slug map**

- `sensing/资料汇总` -> `sensing/resource-roundup`
- `planning-control/资料汇总` -> `planning-control/resource-roundup`
- `general/ROS 入门/ros-toturial-creating-ws-and-package` -> `general/ros-basics/create-workspace-and-package`
- `sensing/数据集相关/dataset-generating` -> `sensing/datasets/dataset-generation`
- `sensing/数据集相关/dataset-labeling` -> `sensing/datasets/dataset-labeling-basics`
- `sensing/数据集相关/dataset-standard` -> `sensing/datasets/dataset-labeling-and-generation-standard`

### Task 2: Migrate the legacy roundup pages

**Files:**

- Move: `src/content/docs/en/archive/sensing/资料汇总.md` -> `src/content/docs/en/archive/sensing/resource-roundup.md`
- Move: `src/content/docs/en/archive/planning-control/资料汇总.md` -> `src/content/docs/en/archive/planning-control/resource-roundup.md`
- Create: `src/content/docs/en/archive/sensing/资料汇总.md`
- Create: `src/content/docs/en/archive/planning-control/资料汇总.md`

**Step 1: Move the real content files to English slugs**

Run: `Move-Item` for both resource roundup files.
Expected: the English content lives at the new slugs.

**Step 2: Recreate the old Chinese routes as hidden redirect pages**

Use the same `sidebar.hidden: true` + meta refresh + `window.location.replace(...)` pattern used in earlier batches.

### Task 3: Migrate ROS basics and dataset pages to English directories

**Files:**

- Create: `src/content/docs/en/archive/general/ros-basics/`
- Move: `src/content/docs/en/archive/general/ROS 入门/ros-toturial-creating-ws-and-package.md` -> `src/content/docs/en/archive/general/ros-basics/create-workspace-and-package.md`
- Create: `src/content/docs/en/archive/general/ROS 入门/ros-toturial-creating-ws-and-package.md`
- Create: `src/content/docs/en/archive/sensing/datasets/`
- Move: `src/content/docs/en/archive/sensing/数据集相关/dataset-generating.md` -> `src/content/docs/en/archive/sensing/datasets/dataset-generation.md`
- Move: `src/content/docs/en/archive/sensing/数据集相关/dataset-labeling.mdx` -> `src/content/docs/en/archive/sensing/datasets/dataset-labeling-basics.mdx`
- Move: `src/content/docs/en/archive/sensing/数据集相关/dataset-standard.md` -> `src/content/docs/en/archive/sensing/datasets/dataset-labeling-and-generation-standard.md`
- Create: `src/content/docs/en/archive/sensing/数据集相关/dataset-generating.md`
- Create: `src/content/docs/en/archive/sensing/数据集相关/dataset-labeling.mdx`
- Create: `src/content/docs/en/archive/sensing/数据集相关/dataset-standard.md`

**Step 1: Create the target English directories and move the real content**

Run: `New-Item -ItemType Directory -Force` for `ros-basics` and `datasets`, then move the files.
Expected: all real content sits under English directory names.

**Step 2: Create redirect pages for the old Chinese-path English routes**

The old `ROS 入门/...` and `数据集相关/...` routes should continue to resolve to the new English URLs.

### Task 4: Update links, redirects, tests, and verify

**Files:**

- Modify: `astro.config.mjs`
- Modify: `tests/e2e/navigation.spec.ts`
- Optionally modify: `src/content/docs/en/archive/sensing/index.mdx`
- Optionally modify: `src/content/docs/en/archive/planning-control/index.mdx`
- Optionally modify: `src/content/docs/en/archive/general/index.mdx`

**Step 1: Add Astro redirects for each old English route**

Add redirects for the six moved pages so direct old-path requests redirect even before the content fallback would match.

**Step 2: Update any English in-page links if needed**

If any index or card currently points to the old Chinese or mixed directory path, switch it to the new English URL.

**Step 3: Extend Playwright coverage**

Add tests for:

- old legacy routes redirecting to new English slugs
- direct access to the new `resource-roundup`, `create-workspace-and-package`, and dataset pages

**Step 4: Verify end to end**

Run: `pnpm build`
Expected: build succeeds and the new English routes are emitted.

Run: `pnpm test:e2e -- tests/e2e/navigation.spec.ts tests/e2e/smoke.spec.ts`
Expected: all tests pass, including the new redirect and direct-route assertions.
