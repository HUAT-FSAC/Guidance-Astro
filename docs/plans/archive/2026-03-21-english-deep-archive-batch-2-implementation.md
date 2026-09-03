# English Deep Archive Batch 2 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Translate the 2025 localization/mapping and simulation deep archive pages for the English site.

**Architecture:** Keep Chinese pages unchanged and create English counterparts under `src/content/docs/en/...` using the same route structure. Validate representative routes through focused Playwright checks and a full site build.

**Tech Stack:** Astro, Starlight, MDX, Playwright, pnpm

---

### Task 1: Add failing e2e coverage for representative deep pages

**Files:**

- Modify: `tests/e2e/navigation.spec.ts`
- Modify: `tests/e2e/smoke.spec.ts`

**Step 1: Add assertions for**

- `/en/archive/2025/localization-mapping/ins5711daa/`
- `/en/archive/2025/simulation/仿真/`

**Step 2: Run the focused suite**

Run: `pnpm test:e2e -- tests/e2e/navigation.spec.ts tests/e2e/smoke.spec.ts`
Expected: FAIL because the English routes still render Chinese content through fallback.

---

### Task 2: Translate 2025 localization/mapping deep pages

**Files:**

- Create: `src/content/docs/en/archive/2025/localization-mapping/学习路线.mdx`
- Create: `src/content/docs/en/archive/2025/localization-mapping/记录.mdx`
- Create: `src/content/docs/en/archive/2025/localization-mapping/ins5711daa.mdx`

**Step 1: Preserve formulas, tables, and hardware details**

Translate the prose around them, but keep the operational details exact.

**Step 2: Keep links pointing to English landing pages where available**

---

### Task 3: Translate 2025 simulation deep page

**Files:**

- Create: `src/content/docs/en/archive/2025/simulation/仿真.mdx`

**Step 1: Preserve tab structure, screenshots, and review-summary tables**

**Step 2: Keep the tone practical and retrospective**

---

### Task 4: Verify build and browser behavior

**Files:**

- No code changes expected

**Step 1: Run** `pnpm build`
Expected: PASS

**Step 2: Run** `pnpm test:e2e -- tests/e2e/navigation.spec.ts tests/e2e/smoke.spec.ts`
Expected: PASS

**Step 3: Summarize remaining untranslated groups**

Call out the remaining 2025 electrical, mechanical, management, and any old archive leaf pages still left for later batches.
