# English Deep Archive Batch 3 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Translate the 2025 electrical and mechanical deep archive pages for the English site.

**Architecture:** Keep the Chinese content tree unchanged and add English files under `src/content/docs/en/...` at the same routes. Verify representative electrical and mechanical deep routes with Playwright and run a full build.

**Tech Stack:** Astro, Starlight, MDX, Playwright, pnpm

---

### Task 1: Add failing e2e coverage for representative deep routes

**Files:**

- Modify: `tests/e2e/navigation.spec.ts`
- Modify: `tests/e2e/smoke.spec.ts`

**Step 1: Add assertions for**

- `/en/archive/2025/electrical/软件/`
- `/en/archive/2025/mechanical/制动/`

**Step 2: Run the focused suite**

Run: `pnpm test:e2e -- tests/e2e/navigation.spec.ts tests/e2e/smoke.spec.ts`
Expected: FAIL because those pages still render Chinese fallback content.

---

### Task 2: Translate electrical deep pages

**Files:**

- Create: `src/content/docs/en/archive/2025/electrical/电池箱.mdx`
- Create: `src/content/docs/en/archive/2025/electrical/软件.mdx`
- Create: `src/content/docs/en/archive/2025/electrical/线束.mdx`
- Create: `src/content/docs/en/archive/2025/electrical/硬件.mdx`

**Step 1: Preserve engineering tables and code snippets**

**Step 2: Keep parent links pointing to** `/en/archive/2025/electrical/`

---

### Task 3: Translate mechanical deep pages

**Files:**

- Create: `src/content/docs/en/archive/2025/mechanical/车架车身.mdx`
- Create: `src/content/docs/en/archive/2025/mechanical/传动.mdx`
- Create: `src/content/docs/en/archive/2025/mechanical/制动.mdx`
- Create: `src/content/docs/en/archive/2025/mechanical/转向悬架.mdx`

**Step 1: Preserve units, dimensions, and brand names**

**Step 2: Keep parent links pointing to** `/en/archive/2025/mechanical/`

---

### Task 4: Verify build and browser behavior

**Files:**

- No code changes expected

**Step 1: Run** `pnpm build`
Expected: PASS

**Step 2: Run** `pnpm test:e2e -- tests/e2e/navigation.spec.ts tests/e2e/smoke.spec.ts`
Expected: PASS

**Step 3: Summarize remaining untranslated pages**

Call out the remaining 2025 management pages and older archive leaf pages.
