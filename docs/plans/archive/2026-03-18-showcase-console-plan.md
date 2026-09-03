# Showcase Console Enhancement Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为首页 Showcase Lab 增加统一的展示控制台，包含对比模式、演示脚本模式和离线缓存模拟面板。

**Architecture:** 在现有 Showcase Lab 之上继续扩展静态数据、工具层快照逻辑和客户端状态机。`Compare Mode`、`Demo Script` 和 `Offline Cache Simulator` 共用主场景、子系统和回放帧这套核心状态，所有行为依旧完全由前端本地数据与浏览器状态驱动。

**Tech Stack:** Astro, TypeScript, Vitest, Playwright, DOM APIs, SVG, localStorage

---

### Task 1: 为对比、脚本和缓存模拟写失败单测

**Files:**

- Modify: `tests/unit/showcase-lab.test.ts`
- Modify: `src/utils/showcase-lab.ts`
- Modify: `src/data/showcase-lab.ts`

**Step 1: Write the failing test**

补充单测覆盖：

1. 对比快照会返回主场景、对比场景、关键指标 delta 和差异摘要。
2. 脚本步骤快照能给出目标场景、子系统、帧索引和高亮焦点。
3. 脚本推进到下一步时会跳转到正确的展示位置。
4. 缓存模拟状态在 `warm / drift / reset` 下能返回正确的摘要指标和资源状态。

**Step 2: Run test to verify it fails**

Run: `pnpm test:run -- tests/unit/showcase-lab.test.ts`
Expected: FAIL，因为比较、脚本和缓存模拟工具尚不存在。

**Step 3: Write minimal implementation**

在数据层和工具层补充最小实现：

1. 定义脚本、缓存模拟相关类型和静态数据。
2. 实现对比快照计算函数。
3. 实现脚本快照与脚本推进函数。
4. 实现缓存模拟状态转换函数。

**Step 4: Run test to verify it passes**

Run: `pnpm test:run -- tests/unit/showcase-lab.test.ts`
Expected: PASS

### Task 2: 为控制台交互写失败 E2E

**Files:**

- Modify: `tests/e2e/showcase-lab.spec.ts`
- Modify: `src/components/home/sections/ShowcaseLab.astro`

**Step 1: Write the failing test**

补充 E2E 覆盖：

1. 开启 Compare Mode 后会出现差异摘要，并随主场景切换同步更新。
2. 选择 Demo Script 后，点击下一步会切换到脚本定义的场景和子系统。
3. 开启脚本自动讲解后，手动拖动回放进度会暂停脚本播放。
4. 点击 `Warm Cache / Simulate Drift / Reset Cache` 后，缓存面板状态和摘要指标更新。

**Step 2: Run test to verify it fails**

Run: `pnpm test:e2e -- tests/e2e/showcase-lab.spec.ts --workers=1`
Expected: FAIL，因为 `Presentation Console` 尚未存在。

**Step 3: Keep the new assertions and prepare implementation targets**

确认测试只依赖用户可见行为：

1. 控制台标题、开关和按钮文案
2. 差异摘要文本
3. 脚本步骤标题与高亮状态
4. 缓存模拟面板状态文案

**Step 4: Re-run the E2E test to keep the RED state confirmed**

Run: `pnpm test:e2e -- tests/e2e/showcase-lab.spec.ts --workers=1`
Expected: FAIL，并且失败点集中在新增控制台元素缺失。

### Task 3: 实现静态数据与工具层

**Files:**

- Modify: `src/data/showcase-lab.ts`
- Modify: `src/utils/showcase-lab.ts`
- Modify: `tests/unit/showcase-lab.test.ts`

**Step 1: Extend static data**

新增并校验：

1. `ShowcaseScript`
2. `ShowcaseScriptStep`
3. `ShowcaseCacheResource`
4. `ShowcaseCacheSimulationConfig`

为 3 条预设讲解脚本补齐步骤数据。

**Step 2: Implement comparison utilities**

实现最小工具函数：

1. `resolveCompareScenarioId`
2. `getShowcaseComparisonSnapshot`
3. 差异摘要构造函数

要求对比场景与主场景不能相同，且帧索引会自动 clamp。

**Step 3: Implement script utilities**

实现：

1. `resolveShowcaseScript`
2. `getShowcaseScriptSnapshot`
3. `advanceShowcaseScript`

脚本快照必须能直接驱动主展示状态跳转。

**Step 4: Implement cache simulation utilities**

实现：

1. `getDefaultCacheSimulationState`
2. `warmShowcaseCache`
3. `driftShowcaseCache`
4. `resetShowcaseCache`
5. 派生摘要工具

**Step 5: Run focused unit tests**

Run: `pnpm test:run -- tests/unit/showcase-lab.test.ts`
Expected: PASS

### Task 4: 实现 Presentation Console 视图和客户端状态机

**Files:**

- Modify: `src/components/home/sections/ShowcaseLab.astro`
- Modify: `src/utils/showcase-lab-client.ts`
- Modify: `tests/e2e/showcase-lab.spec.ts`

**Step 1: Add initial console markup**

在 `ShowcaseLab.astro` 新增：

1. `Presentation Console` 容器
2. `Compare Mode` 卡片
3. `Demo Script` 卡片
4. `Offline Cache Simulator` 卡片

加入必要的 `id`、`data-*` 属性，供客户端脚本和 E2E 使用。

**Step 2: Extend client runtime state**

在 `showcase-lab-client.ts` 中新增：

1. `isCompareEnabled`
2. `compareScenarioId`
3. `scriptId`
4. `scriptStepIndex`
5. `isScriptPlaying`
6. `cacheSimulationState`

并把这些状态与现有 `selection / frameIndex / isPlaying` 联合管理。

**Step 3: Render compare panel**

实现 Compare Mode 的渲染与事件：

1. 开关启停
2. 对比场景选择
3. 指标差异摘要
4. 当前帧标题差异
5. `Delta Highlights`

**Step 4: Render script panel**

实现 Demo Script 的渲染与事件：

1. 脚本选择
2. `Prev Step / Next Step / Auto Narrate`
3. 当前步骤标题与说明
4. 高亮焦点类名切换
5. 手动交互时暂停脚本播放

**Step 5: Render cache simulator panel**

实现 Offline Cache Simulator 的渲染与事件：

1. `Warm Cache`
2. `Simulate Drift`
3. `Reset Cache`
4. 摘要指标和资源列表状态更新
5. 与 Compare Mode / Demo Script 的联动提示

**Step 6: Run the target E2E suite**

Run: `pnpm test:e2e -- tests/e2e/showcase-lab.spec.ts --workers=1`
Expected: PASS

### Task 5: 全量回归与验收

**Files:**

- Review: `src/components/home/sections/ShowcaseLab.astro`
- Review: `src/utils/showcase-lab-client.ts`
- Review: `src/utils/showcase-lab.ts`
- Review: `src/data/showcase-lab.ts`
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

1. 仍然完全纯前端
2. Compare Mode 可切换并正确输出差异摘要
3. Demo Script 可驱动场景、子系统和回放帧跳转
4. 手动交互会暂停脚本自动讲解
5. Offline Cache Simulator 只做状态模拟，不提供真实离线能力
6. 本地持久化没有破坏现有展示体验
