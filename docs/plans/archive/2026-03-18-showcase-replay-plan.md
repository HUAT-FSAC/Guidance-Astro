# Showcase Replay Enhancement Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为首页 Showcase Lab 增加时间轴回放、自动讲解和跨场景自动推进能力。

**Architecture:** 在现有场景静态数据上新增 `replay` 帧数据，通过 `src/utils/showcase-lab.ts` 把场景基线与帧覆盖合成为统一快照，再由 `ShowcaseLab.astro` 渲染控制区和自动播放状态。所有行为继续保持纯前端、本地数据驱动。

**Tech Stack:** Astro, TypeScript, Vitest, Playwright, DOM APIs, SVG, localStorage

---

### Task 1: 为回放数据和状态逻辑写失败测试

**Files:**

- Modify: `tests/unit/showcase-lab.test.ts`
- Modify: `src/utils/showcase-lab.ts`
- Modify: `src/data/showcase-lab.ts`

**Step 1: Write the failing test**

补充单测覆盖：

- 帧索引越界时回退到合法范围
- 回放快照能覆盖指标、阶段状态和车辆位置
- 播放到场景末尾后会推进到下一个场景

**Step 2: Run test to verify it fails**

Run: `pnpm test:run -- tests/unit/showcase-lab.test.ts`
Expected: FAIL，因为回放相关工具尚不存在。

**Step 3: Write minimal implementation**

- 扩展 `showcase-lab` 数据模型，引入回放帧
- 实现 `resolveReplayFrameIndex`
- 实现 `getShowcaseReplaySnapshot`
- 实现 `advanceShowcaseReplay`

**Step 4: Run test to verify it passes**

Run: `pnpm test:run -- tests/unit/showcase-lab.test.ts`
Expected: PASS

### Task 2: 为回放交互写失败 E2E

**Files:**

- Modify: `tests/e2e/showcase-lab.spec.ts`
- Modify: `src/components/home/sections/ShowcaseLab.astro`

**Step 1: Write the failing test**

补充 E2E 覆盖：

- 点击下一帧后回放标题和速度指标变化
- 点击播放后自动进入下一个场景
- 手动拖动进度条后自动播放暂停

**Step 2: Run test to verify it fails**

Run: `pnpm test:e2e -- tests/e2e/showcase-lab.spec.ts --workers=1`
Expected: FAIL，因为控制区尚未存在。

**Step 3: Write minimal implementation**

- 在 `ShowcaseLab.astro` 新增 `Mission Replay` 控制区
- 新增播放/暂停、前后帧、进度条事件处理
- 渲染回放标题、说明、帧计数和趋势高亮点
- 用定时器驱动自动推进并在末尾切换场景

**Step 4: Run test to verify it passes**

Run: `pnpm test:e2e -- tests/e2e/showcase-lab.spec.ts --workers=1`
Expected: PASS

### Task 3: 全量回归和收尾

**Files:**

- Review: `src/components/home/sections/ShowcaseLab.astro`
- Review: `src/data/showcase-lab.ts`
- Review: `src/utils/showcase-lab.ts`
- Review: `tests/unit/showcase-lab.test.ts`
- Review: `tests/e2e/showcase-lab.spec.ts`

**Step 1: Run focused verification**

Run: `pnpm test:run -- tests/unit/showcase-lab.test.ts`
Expected: PASS

Run: `pnpm test:e2e -- tests/e2e/showcase-lab.spec.ts --workers=1`
Expected: PASS

**Step 2: Run full regression verification**

Run: `pnpm lint`
Expected: PASS

Run: `pnpm build`
Expected: PASS

Run: `pnpm test:run`
Expected: PASS

**Step 3: Check requirements**

确认：

- 仍然纯前端
- 支持时间轴回放
- 支持自动讲解/自动推进
- 用户手动交互可暂停自动播放
- 不破坏现有场景切换和本地持久化
