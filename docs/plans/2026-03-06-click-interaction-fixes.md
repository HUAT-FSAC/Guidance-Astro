# Click Interaction Fixes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Restore reliable click interaction for homepage floating controls by fixing the theme switcher activation model, eliminating floating button overlap risk, and hardening hidden overlays against pointer interception.

**Architecture:** Keep the existing homepage component structure, but move the theme switcher back onto a standard `click` activation path so keyboard, mouse, and synthesized browser clicks share one reliable flow. Preserve long-press color selection as a separate pointer-timer path, and align the floating button stack with explicit spacing and hidden-state `pointer-events` guards.

**Tech Stack:** Astro, inline component scripts, Playwright E2E tests, CSS fixed-position overlays

---

### Task 1: Lock expected interaction behavior in E2E

**Files:**

- Modify: `tests/e2e/component-conflict.spec.ts`

**Step 1: Write the failing tests**

- Replace the outdated homepage theme-switcher test that expects a click-open mode menu.
- Add coverage for:
    - standard click toggles the current color scheme and persists `huat-color-scheme`
    - keyboard activation on the theme button toggles the current color scheme
    - long press opens the color dropdown and selecting a color persists theme color storage

**Step 2: Run test to verify it fails**

Run: `pnpm test:e2e -- tests/e2e/component-conflict.spec.ts`

Expected: homepage theme-switcher keyboard activation fails before implementation, and floating-button spacing still fails.

### Task 2: Fix homepage theme switcher activation model

**Files:**

- Modify: `src/components/home/ui/ThemeSwitcher.astro`

**Step 1: Write minimal implementation**

- Keep single-click theme toggling on the button `click` event.
- Move long-press detection onto pointer-timer logic (`pointerdown`, `pointerup`, `pointercancel`, `pointerleave`), using the timer only to open the color dropdown.
- Suppress the synthetic click generated after a completed long press so the menu does not instantly close or toggle the theme.
- Sync `aria-expanded` and `aria-hidden` with dropdown state.
- Ensure hidden dropdown state uses `pointer-events: none`.

**Step 2: Run test to verify it passes**

Run: `pnpm test:e2e -- tests/e2e/component-conflict.spec.ts`

Expected: theme-switcher interaction tests pass; floating-button spacing may still fail until Task 3 is complete.

### Task 3: Fix homepage floating button spacing and hidden overlay interception

**Files:**

- Modify: `src/components/home/ui/BackToTop.astro`
- Modify: `src/components/home/PageLoader.astro`
- Modify: `src/components/home/ui/MobileNavigation.astro`

**Step 1: Write minimal implementation**

- Reposition the homepage back-to-top button so its bottom offset is derived from the homepage theme-switcher stack, preserving at least 60px spacing across breakpoints.
- Align the right offset with the homepage theme switcher to avoid diagonal overlap.
- Add hidden-state `pointer-events: none` protection for:
    - back-to-top button when hidden
    - page loader after it enters the loaded state
    - mobile navigation overlay and drawer while inactive

**Step 2: Run test to verify it passes**

Run: `pnpm test:e2e -- tests/e2e/component-conflict.spec.ts`

Expected: all component-conflict tests pass.

### Task 4: Final verification

**Files:**

- No code changes expected

**Step 1: Run focused verification**

Run: `pnpm test:e2e -- tests/e2e/component-conflict.spec.ts`

Expected: all tests pass in Chromium.

**Step 2: Run broader smoke verification if time permits**

Run: `pnpm test:e2e -- tests/e2e/navigation.spec.ts tests/e2e/smoke.spec.ts`

Expected: no homepage or docs navigation regressions.
