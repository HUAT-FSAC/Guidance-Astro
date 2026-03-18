# Showcase Lab Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在首页新增一个纯前端“智能驾驶交互实验室”模块，用静态数据、SVG 可视化和本地存储展示无人驾驶赛车的核心概念与交互逻辑。

**Architecture:** 通过 `src/data` 提供静态场景数据，`src/utils` 提供可测试的状态推导与持久化封装，`src/components/home/sections` 新增展示组件并接入首页。交互由原生 DOM 脚本驱动，避免引入额外框架运行时。

**Tech Stack:** Astro, TypeScript, Vitest, Playwright, localStorage, SVG

---

### Task 1: 搭建数据与状态推导基础

**Files:**
- Create: `src/data/showcase-lab.ts`
- Create: `src/utils/showcase-lab.ts`
- Test: `tests/unit/showcase-lab.test.ts`

**Step 1: Write the failing test**

在 `tests/unit/showcase-lab.test.ts` 中先覆盖：

1. 默认场景解析
2. 非法场景回退
3. 关注子系统状态切换
4. 图表折线点计算输出稳定字符串

**Step 2: Run test to verify it fails**

Run: `pnpm test:run -- tests/unit/showcase-lab.test.ts`
Expected: FAIL，因为 `showcase-lab` 工具尚不存在。

**Step 3: Write minimal implementation**

1. 在 `src/data/showcase-lab.ts` 中定义场景、指标、链路状态、图表点和子系统详情。
2. 在 `src/utils/showcase-lab.ts` 中实现：
   - 默认场景选择
   - 场景查找
   - 子系统选择回退
   - SVG 折线点字符串生成
   - 本地存储状态标准化

**Step 4: Run test to verify it passes**

Run: `pnpm test:run -- tests/unit/showcase-lab.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/unit/showcase-lab.test.ts src/data/showcase-lab.ts src/utils/showcase-lab.ts
git commit -m "feat: add showcase lab state model"
```

### Task 2: 实现首页展示组件

**Files:**
- Create: `src/components/home/sections/ShowcaseLab.astro`
- Modify: `src/content/docs/index.mdx`

**Step 1: Write the failing test**

先补充一个端到端测试骨架，断言首页存在实验室模块标题和默认场景内容。

**Step 2: Run test to verify it fails**

Run: `pnpm test:e2e -- tests/e2e/showcase-lab.spec.ts`
Expected: FAIL，因为组件未接入首页。

**Step 3: Write minimal implementation**

1. 新增 `ShowcaseLab.astro`，实现：
   - 场景切换按钮
   - 赛道概览和趋势图
   - 遥测指标卡
   - 系统链路状态
   - 关注子系统选择与详情区
2. 在 `src/content/docs/index.mdx` 中接入新组件，放在倒计时与成就区之间。

**Step 4: Run test to verify it passes**

Run: `pnpm test:e2e -- tests/e2e/showcase-lab.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/home/sections/ShowcaseLab.astro src/content/docs/index.mdx tests/e2e/showcase-lab.spec.ts
git commit -m "feat: add homepage showcase lab"
```

### Task 3: 完成本地持久化与交互完善

**Files:**
- Modify: `src/components/home/sections/ShowcaseLab.astro`
- Modify: `tests/e2e/showcase-lab.spec.ts`

**Step 1: Write the failing test**

在 E2E 中新增：

1. 切换场景后刷新页面仍保留选择
2. 切换关注子系统后详情区内容变化

**Step 2: Run test to verify it fails**

Run: `pnpm test:e2e -- tests/e2e/showcase-lab.spec.ts`
Expected: FAIL，因为持久化与详情联动尚未完成。

**Step 3: Write minimal implementation**

1. 使用 `localStorage` 保存场景和子系统。
2. 初始化时恢复状态。
3. 补充 aria、键盘焦点、reduced motion 兼容。

**Step 4: Run test to verify it passes**

Run: `pnpm test:e2e -- tests/e2e/showcase-lab.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/home/sections/ShowcaseLab.astro tests/e2e/showcase-lab.spec.ts
git commit -m "feat: persist showcase lab preferences"
```

### Task 4: 全量验证与收尾

**Files:**
- Review: `src/components/home/sections/ShowcaseLab.astro`
- Review: `src/utils/showcase-lab.ts`
- Review: `tests/unit/showcase-lab.test.ts`
- Review: `tests/e2e/showcase-lab.spec.ts`

**Step 1: Run focused unit and e2e verification**

Run: `pnpm test:run -- tests/unit/showcase-lab.test.ts`
Expected: PASS

Run: `pnpm test:e2e -- tests/e2e/showcase-lab.spec.ts`
Expected: PASS

**Step 2: Run full regression verification**

Run: `pnpm test:run`
Expected: PASS

Run: `pnpm build`
Expected: PASS

**Step 3: Review requirements line by line**

确认以下全部满足：

1. 纯前端实现
2. 展示核心产品概念
3. 有数据可视化
4. 有本地存储
5. 有动画和交互反馈
6. 可离线使用

**Step 4: Commit**

```bash
git add .
git commit -m "feat: deliver first-pass frontend showcase lab"
```
