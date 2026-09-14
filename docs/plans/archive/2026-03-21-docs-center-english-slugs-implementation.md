# Docs Center English Slug Translation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Translate the `docs-center` section into English-native content and English-native slugs under `/en/docs-center/` while preserving the Chinese routes and redirecting old English Chinese-slug URLs.

**Architecture:** Keep Chinese docs-center content under the existing Chinese paths. Create a parallel English tree under `src/content/docs/en/docs-center/` using English slugs, then update English navigation surfaces and add redirects from legacy English Chinese-slug URLs to the new English routes.

**Tech Stack:** Astro, Starlight, MDX, Playwright

---

### Task 1: Lock the new English route expectations

**Files:**

- Modify: `tests/e2e/smoke.spec.ts`
- Modify: `tests/e2e/navigation.spec.ts`

**Step 1: Write the failing test**

- Assert `/en/docs-center/onboarding/` renders an `Onboarding` page.
- Assert `/en/docs-center/流程与模板/` redirects to `/en/docs-center/processes-and-templates/`.

**Step 2: Run test to verify it fails**

Run: `pnpm test:e2e -- tests/e2e/navigation.spec.ts tests/e2e/smoke.spec.ts`
Expected: FAIL on onboarding 404 and missing redirect.

**Step 3: Write minimal implementation**

- Add translated English docs-center pages with English slugs.
- Add redirect rules.

**Step 4: Run test to verify it passes**

Run: `pnpm test:e2e -- tests/e2e/navigation.spec.ts tests/e2e/smoke.spec.ts`
Expected: PASS

### Task 2: Create translated English docs-center pages

**Files:**

- Create: `src/content/docs/en/docs-center/onboarding/index.mdx`
- Create: `src/content/docs/en/docs-center/processes-and-templates/index.mdx`
- Create: `src/content/docs/en/docs-center/resource-hub/index.mdx`
- Create: `src/content/docs/en/docs-center/feedback-and-experience/index.mdx`
- Create: `src/content/docs/en/docs-center/operations-and-collaboration/index.mdx`
- Create: `src/content/docs/en/docs-center/operations-and-collaboration/project-progress-board.mdx`
- Modify: `src/content/docs/en/docs-center/index.mdx`

**Step 1: Write the failing test**

- Use the e2e route expectations from Task 1.

**Step 2: Run test to verify it fails**

Run: `pnpm test:e2e -- tests/e2e/navigation.spec.ts tests/e2e/smoke.spec.ts`
Expected: FAIL before content files exist.

**Step 3: Write minimal implementation**

- Translate the 7 docs-center pages using English-native terminology and English slugs.
- Update the English landing page cards to the new English routes.

**Step 4: Run test to verify it passes**

Run: `pnpm test:e2e -- tests/e2e/navigation.spec.ts tests/e2e/smoke.spec.ts`
Expected: PASS

### Task 3: Update English navigation and redirect compatibility

**Files:**

- Modify: `.config/sidebar.mjs`
- Modify: `astro.config.mjs`

**Step 1: Write the failing test**

- Reuse the e2e navigation expectations for the English sidebar and redirect.

**Step 2: Run test to verify it fails**

Run: `pnpm test:e2e -- tests/e2e/navigation.spec.ts tests/e2e/smoke.spec.ts`
Expected: FAIL if the sidebar still points to Chinese slugs or redirect is missing.

**Step 3: Write minimal implementation**

- Point English sidebar labels to English docs-center slugs.
- Add redirects from old English Chinese-slug routes to the new English routes.

**Step 4: Run test to verify it passes**

Run: `pnpm test:e2e -- tests/e2e/navigation.spec.ts tests/e2e/smoke.spec.ts`
Expected: PASS

### Task 4: Verify build output

**Files:**

- Modify: any touched files from previous tasks if needed

**Step 1: Run browser verification**

Run: `pnpm test:e2e -- tests/e2e/navigation.spec.ts tests/e2e/smoke.spec.ts`
Expected: PASS

**Step 2: Run production verification**

Run: `pnpm build`
Expected: PASS

**Step 3: Commit**

```bash
git add astro.config.mjs .config/sidebar.mjs src/content/docs/en/docs-center docs/plans tests/e2e
git commit -m "feat: translate docs center english slugs"
```
