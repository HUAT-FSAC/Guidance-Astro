# English Deep Archive Batch 1 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Translate the first deep technical batch of archive pages for the English site, covering general tooling, 2025 sensing, and 2025 planning/control.

**Architecture:** Keep Chinese pages untouched and create parallel English content files under `src/content/docs/en/...` using the same route structure. Verify representative deep routes with Playwright and run a full site build to catch MDX issues.

**Tech Stack:** Astro, Starlight, MDX, Markdown, Playwright, pnpm

---

### Task 1: Add failing browser coverage for representative deep English pages

**Files:**

- Modify: `tests/e2e/navigation.spec.ts`
- Modify: `tests/e2e/smoke.spec.ts`

**Step 1: Add assertions for deep English pages**

Cover at least:

- `/en/archive/general/ros-installing/`
- `/en/archive/2025/sensing/激光雷达/`
- `/en/archive/2025/planning-control/控制/`

**Step 2: Run the focused e2e suite**

Run: `pnpm test:e2e -- tests/e2e/navigation.spec.ts tests/e2e/smoke.spec.ts`
Expected: FAIL because those pages still show Chinese content via locale fallback.

---

### Task 2: Translate `archive/general` deep pages

**Files:**

- Create: `src/content/docs/en/archive/general/docker-ros-installing.mdx`
- Create: `src/content/docs/en/archive/general/interesting-share.mdx`
- Create: `src/content/docs/en/archive/general/led-screen-using.mdx`
- Create: `src/content/docs/en/archive/general/python-guidance.mdx`
- Create: `src/content/docs/en/archive/general/ros-installing.mdx`
- Create: `src/content/docs/en/archive/general/ros-vsc-setup.mdx`
- Create: `src/content/docs/en/archive/general/setting-up-proxy-on-linux.mdx`
- Create: `src/content/docs/en/archive/general/vsc-c-c++-dev-and-debug.mdx`
- Create: `src/content/docs/en/archive/general/ROS 入门/ros-toturial-creating-ws-and-package.md`

**Step 1: Preserve code blocks and screenshots**

Translate the narrative around commands, but keep commands and image imports stable.

**Step 2: Keep tool and version names exact**

Do not localize product names such as ROS, clangd, VS Code, Docker, or Winlibs.

---

### Task 3: Translate `archive/2025/sensing` and `archive/2025/planning-control` deep pages

**Files:**

- Create: `src/content/docs/en/archive/2025/sensing/激光雷达.mdx`
- Create: `src/content/docs/en/archive/2025/sensing/摄像头.mdx`
- Create: `src/content/docs/en/archive/2025/planning-control/控制.mdx`
- Create: `src/content/docs/en/archive/2025/planning-control/高速循迹.mdx`
- Create: `src/content/docs/en/archive/2025/planning-control/直线.mdx`

**Step 1: Preserve algorithm names and technical terms**

Use English-native explanations but keep terms like Pure Pursuit, Stanley, MPC, Delaunay triangulation, Hough transform, and Bezier curve exact.

**Step 2: Keep links stable**

Use English parent-module links such as `/en/archive/2025/sensing/` and `/en/archive/2025/planning-control/`.

---

### Task 4: Build and verify

**Files:**

- No code changes expected

**Step 1: Run the build**

Run: `pnpm build`
Expected: PASS

**Step 2: Run focused Playwright tests**

Run: `pnpm test:e2e -- tests/e2e/navigation.spec.ts tests/e2e/smoke.spec.ts`
Expected: PASS

**Step 3: Summarize remaining untranslated archive groups**

Call out that localization-mapping, simulation, electrical, mechanical, and management deep pages remain for later batches.
