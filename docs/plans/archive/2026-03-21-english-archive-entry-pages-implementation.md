# English Archive Entry Pages Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add real English content for the remaining high-visibility archive, news, and guide entry pages exposed by the English site.

**Architecture:** Keep the existing Chinese content tree unchanged and add locale-specific English pages under `src/content/docs/en/...`. Validate behavior with focused e2e coverage on representative English routes.

**Tech Stack:** Astro, Starlight, MDX, Playwright, pnpm

---

### Task 1: Add failing e2e coverage for representative English entry pages

**Files:**

- Modify: `tests/e2e/navigation.spec.ts`
- Modify: `tests/e2e/smoke.spec.ts`

**Step 1: Write the failing tests**

Add assertions for:

- `/en/archive/2025/`
- `/en/archive/general/`
- `/en/news/new-car-development/`

**Step 2: Run tests to verify failure**

Run: `pnpm test:e2e -- tests/e2e/navigation.spec.ts tests/e2e/smoke.spec.ts`
Expected: representative English routes still render the fallback message or missing English-specific text.

**Step 3: Keep the tests focused**

Check page titles or unique headings that only the translated pages will contain.

---

### Task 2: Add English guide and news pages

**Files:**

- Create: `src/content/docs/en/open-source-projects.md`
- Create: `src/content/docs/en/archive/2024/2024-learning-roadmap.mdx`
- Create: `src/content/docs/en/news/2024-season-finale.mdx`
- Create: `src/content/docs/en/news/new-car-development.mdx`
- Create: `src/content/docs/en/news/path-planning.mdx`

**Step 1: Translate structure, not just sentences**

Keep section order and purpose aligned with the Chinese originals.

**Step 2: Keep route-local links consistent**

Use `/en/...` links where an English page exists.

**Step 3: Preserve embedded assets and external links**

Reuse existing images, video, and external references.

---

### Task 3: Add English archive landing pages

**Files:**

- Create: `src/content/docs/en/archive/2025/index.mdx`
- Create: `src/content/docs/en/archive/2025/sensing/index.mdx`
- Create: `src/content/docs/en/archive/2025/localization-mapping/index.mdx`
- Create: `src/content/docs/en/archive/2025/planning-control/index.mdx`
- Create: `src/content/docs/en/archive/2025/simulation/index.mdx`
- Create: `src/content/docs/en/archive/2025/electrical/index.mdx`
- Create: `src/content/docs/en/archive/2025/mechanical/index.mdx`
- Create: `src/content/docs/en/archive/2025/management/index.mdx`
- Create: `src/content/docs/en/archive/2025/inspection/index.mdx`
- Create: `src/content/docs/en/archive/general/index.mdx`
- Create: `src/content/docs/en/archive/localization-mapping/index.mdx`
- Create: `src/content/docs/en/archive/planning-control/index.mdx`
- Create: `src/content/docs/en/archive/sensing/index.mdx`
- Create: `src/content/docs/en/archive/simulation/index.mdx`

**Step 1: Match current sidebar-visible structure**

Translate the pages that are exposed as archive entry points first.

**Step 2: Keep internal links stable**

If an English counterpart does not exist yet, link to the current route and allow the existing fallback page to handle it.

**Step 3: Keep copy concise and natural**

Use English-native phrasing but preserve team-specific terminology and learning intent.

---

### Task 4: Verify build and browser behavior

**Files:**

- No code changes expected

**Step 1: Run the build**

Run: `pnpm build`
Expected: PASS

**Step 2: Run focused e2e**

Run: `pnpm test:e2e -- tests/e2e/navigation.spec.ts tests/e2e/smoke.spec.ts`
Expected: PASS

**Step 3: Summarize remaining gaps**

Call out that deep leaf pages outside this round may still use the English fallback page.
