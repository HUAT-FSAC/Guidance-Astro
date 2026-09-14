# HUAT FSAC Site Bilingual Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a full Chinese and English site structure for HUAT FSAC, with `/` for Chinese, `/en/` for English, locale-aware homepage data, multilingual Starlight configuration, and explicit handling for untranslated English docs.

**Architecture:** The implementation keeps Chinese as the default locale and introduces English-prefixed routes. Shared utilities determine locale from the URL, shared content factories return localized homepage data, and Starlight receives locale-specific sidebar configuration. English docs are added as mirrored content where available; missing translations render controlled placeholders instead of mixed-language pages.

**Tech Stack:** Astro 5, Starlight, TypeScript, MDX, Vitest, Playwright

---

### Task 1: Prepare route and config tests

**Files:**

- Modify: `tests/unit/i18n.test.ts`
- Create: `tests/unit/home-i18n.test.ts`

**Step 1: Write the failing tests**

- Add tests covering:
    - `localePath('/', 'en')` -> `/en/`
    - alternate locale generation for root and nested routes
    - localized homepage content factory returns different Chinese and English labels

**Step 2: Run test to verify it fails**

Run: `pnpm test:run -- tests/unit/i18n.test.ts tests/unit/home-i18n.test.ts`

Expected: FAIL because localized homepage factory does not exist yet and route behavior is incomplete.

**Step 3: Write minimal implementation**

- Add locale-aware homepage data helpers in `src/data/home.ts`.
- Adjust `src/utils/i18n.ts` path helpers as needed for root-path handling.

**Step 4: Run test to verify it passes**

Run: `pnpm test:run -- tests/unit/i18n.test.ts tests/unit/home-i18n.test.ts`

Expected: PASS

### Task 2: Localize homepage and shared UI

**Files:**

- Modify: `src/data/home.ts`
- Modify: `src/content/docs/index.mdx`
- Modify: `src/components/home/ui/LanguageSwitcher.astro`
- Modify: homepage section components that require direct labels

**Step 1: Write the failing tests**

- Add assertions for English homepage copy and language switcher route output.

**Step 2: Run test to verify it fails**

Run: `pnpm test:run -- tests/unit/i18n.test.ts tests/unit/home-i18n.test.ts`

Expected: FAIL because homepage and switcher still use Chinese-only content.

**Step 3: Write minimal implementation**

- Replace hard-coded homepage labels with locale-derived values.
- Enable both locales in the language switcher.
- Preserve current path when switching locales.

**Step 4: Run test to verify it passes**

Run: `pnpm test:run -- tests/unit/i18n.test.ts tests/unit/home-i18n.test.ts`

Expected: PASS

### Task 3: Enable multilingual Starlight configuration

**Files:**

- Modify: `astro.config.mjs`
- Modify: `.config/sidebar.mjs`
- Modify: `src/content/config.ts` only if schema wiring needs adjustment

**Step 1: Write the failing test**

- Add or adapt tests that expect English locale-aware navigation metadata or route generation where practical.

**Step 2: Run verification for current behavior**

Run: `pnpm build`

Expected: Existing config either lacks English locale support or cannot build the intended `/en/` structure.

**Step 3: Write minimal implementation**

- Add Starlight locale configuration.
- Split sidebar labels by locale.
- Localize global metadata where supported by config.

**Step 4: Run verification**

Run: `pnpm build`

Expected: PASS with generated English-prefixed routes.

### Task 4: Add English mirror content for core pages

**Files:**

- Create: English versions of core documents matching:
    - homepage entry
    - `about-fs`
    - `join`
    - `team`
    - `cars`
    - key docs-center landing pages

**Step 1: Write the failing test**

- Add e2e coverage for `/en/`, `/en/join/`, and one English docs page.

**Step 2: Run test to verify it fails**

Run: `pnpm test:e2e -- tests/e2e/navigation.spec.ts tests/e2e/smoke.spec.ts`

Expected: FAIL because English pages are missing or untranslated.

**Step 3: Write minimal implementation**

- Add English MDX files with matching route structure and translated frontmatter/body content.

**Step 4: Run test to verify it passes**

Run: `pnpm test:e2e -- tests/e2e/navigation.spec.ts tests/e2e/smoke.spec.ts`

Expected: PASS

### Task 5: Add untranslated-doc placeholder handling

**Files:**

- Create or modify locale-aware docs pages/components needed for placeholders
- Modify internal docs links that need locale-aware targets

**Step 1: Write the failing test**

- Add e2e assertion for an English route without a finished translation showing placeholder messaging.

**Step 2: Run test to verify it fails**

Run: `pnpm test:e2e -- tests/e2e/navigation.spec.ts`

Expected: FAIL because missing English docs 404 or show Chinese content.

**Step 3: Write minimal implementation**

- Add English placeholder pages for untranslated routes or a reusable placeholder generation strategy.

**Step 4: Run test to verify it passes**

Run: `pnpm test:e2e -- tests/e2e/navigation.spec.ts`

Expected: PASS

### Task 6: Verify the full feature set

**Files:**

- Modify: any touched files from previous tasks as needed

**Step 1: Run unit verification**

Run: `pnpm test:run -- tests/unit/i18n.test.ts tests/unit/home-i18n.test.ts`

Expected: PASS

**Step 2: Run end-to-end verification**

Run: `pnpm test:e2e -- tests/e2e/navigation.spec.ts tests/e2e/smoke.spec.ts`

Expected: PASS

**Step 3: Run production verification**

Run: `pnpm build`

Expected: PASS

**Step 4: Commit**

```bash
git add astro.config.mjs .config/sidebar.mjs src/data/home.ts src/utils/i18n.ts src/components/home/ui/LanguageSwitcher.astro src/content docs/plans tests
git commit -m "feat: add bilingual site architecture"
```
