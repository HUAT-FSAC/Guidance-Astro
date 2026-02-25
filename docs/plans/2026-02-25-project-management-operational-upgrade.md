# Project Management & Engineering Governance Upgrade Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 在不改变文档站核心业务的前提下，补齐任务管理、版本协作、质量门禁、进度可视化与文档治理能力，形成可持续运作的工程与项目管理闭环。  
**Architecture:** 以 GitHub（Projects/Issues/PR/Actions/Discussions）作为流程中枢，Astro 页面承载项目进度可视化，脚本化采集仓库数据生成静态看板数据。先修复 P0 工程门禁，再落地协作与治理模块。  
**Tech Stack:** Astro 5, Starlight, TypeScript, pnpm, GitHub Actions, GitHub Projects v2, GitHub GraphQL API, Vitest, Playwright, Lighthouse CI.

---

## 1. 优先级总览（执行顺序）

1. `P0` 工程基线恢复（I-01 ~ I-06）
2. `P1` 项目管理与协作中枢（I-07 ~ I-10）
3. `P1` 项目进度可视化（I-11 ~ I-12）
4. `P1` 质量自动化扩展（I-13）
5. `P2` 可扩展性与文档治理（I-14 ~ I-18）

## 2. 里程碑计划

- `M1（第1-2周）`：CI 通过、Lint/TypeCheck/Format/Test 门禁全部恢复。
- `M2（第3-4周）`：Projects 流程+模板+协作通知上线，团队可按统一节奏运行。
- `M3（第5-6周）`：可视化看板与自动化质量报告上线。
- `M4（第7-8周）`：生命周期治理、资源预算、文档治理闭环完成。

## 3. 技术选型结论（针对你的六类需求）

- 任务跟踪系统：`GitHub Projects v2`（与现仓库零切换成本）。
- 版本控制流程：`GitHub Flow + protected main + CODEOWNERS + required checks`。
- 团队协作工具：`GitHub Discussions + 飞书/企业微信 Webhook`。
- 进度可视化模块：`Astro 静态页面 + GitHub GraphQL 数据采集脚本`。
- 代码质量自动化：`ESLint + tsc + Vitest + Playwright + Lighthouse CI` 分层门禁。
- 文档管理系统：`frontmatter 治理 + 文档陈旧性扫描 + ADR 归档 + 编辑链接修复`。

---

## 4. Issue Backlog（可直接录入 GitHub Projects）

| ID | Priority | Title | 预计工期 | 依赖 |
| --- | --- | --- | --- | --- |
| I-01 | P0 | 修复 ESLint 配置发现失败 | 0.5 天 | 无 |
| I-02 | P0 | 修复 Prettier 配置与格式检查 | 0.5 天 | I-01 |
| I-03 | P0 | 修复 TypeScript 严格类型错误 | 0.5 天 | 无 |
| I-04 | P0 | 建立 Vitest 测试基线与脚本 | 1 天 | I-03 |
| I-05 | P0 | 重构 CI/CD 流程与门禁顺序 | 1 天 | I-01~I-04 |
| I-06 | P0 | 落地 pre-commit 质量钩子 | 0.5 天 | I-01~I-02 |
| I-07 | P1 | GitHub Projects 任务模型与自动化 | 1 天 | I-05 |
| I-08 | P1 | Issue/PR 模板体系升级 | 1 天 | I-07 |
| I-09 | P1 | 版本控制流程固化（CODEOWNERS/分支策略） | 1 天 | I-05 |
| I-10 | P1 | 协作工具通知集成（飞书/企微） | 1 天 | I-07 |
| I-11 | P1 | 项目进度数据采集脚本 | 1.5 天 | I-07 |
| I-12 | P1 | 项目进度可视化页面模块 | 1.5 天 | I-11 |
| I-13 | P1 | 质量自动化扩展（Playwright/LHCI/Budget） | 1.5 天 | I-05 |
| I-14 | P2 | 交互组件生命周期统一治理 | 2 天 | I-05 |
| I-15 | P2 | 资源体积预算与大媒体治理 | 1.5 天 | I-13 |
| I-16 | P2 | 文档元数据规范（owner/status/reviewDate） | 1 天 | I-08 |
| I-17 | P2 | 文档陈旧性扫描与 CI 规则 | 1 天 | I-16 |
| I-18 | P2 | 编辑链接与文档索引修复 | 0.5 天 | I-16 |

---

## 5. Issue 卡片明细

### Issue I-01: 修复 ESLint 配置发现失败

**Priority:** P0  
**Owner Role:** 前端基础设施  
**Files:**
- Create: `eslint.config.mjs`
- Modify: `package.json`
- Verify: `.config/eslint.config.mjs`

**Technical Plan:**
1. 在仓库根目录新增 `eslint.config.mjs`，内容仅做 re-export 到 `.config/eslint.config.mjs`。
2. 清理 `package.json` 中旧式 `eslintConfig` 字段，统一使用 Flat Config。
3. 运行 `pnpm lint`，确认配置可被 ESLint 9 正确加载。

**Acceptance Criteria:**
- `pnpm lint` 可执行且不再报 “couldn't find eslint.config”。
- CI 中 lint job 不再因配置发现失败退出。

**Expected Benefit:**
- 代码质量门禁恢复，避免无检查代码进入主干。

---

### Issue I-02: 修复 Prettier 配置与格式检查

**Priority:** P0  
**Owner Role:** 前端基础设施  
**Files:**
- Modify: `.config/.prettierrc`
- Modify: `package.json`
- Optional Create: `.prettierignore`

**Technical Plan:**
1. 移除不被当前 Prettier 版本识别的配置项（如 `astroAllowShorthand`）。
2. 将 `package.json` 中 Prettier 配置方式调整为兼容形式（避免 `format:check` 读取异常）。
3. 对 `.github/ISSUE_TEMPLATE/*.md` 进行可解析性验证，必要时通过 `.prettierignore` 排除不适配文件。

**Acceptance Criteria:**
- `pnpm format:check` 返回 0。
- 不再出现 “Invalid configuration … Unexpected token ':'”。

**Expected Benefit:**
- 统一格式基线可稳定运行，减少无意义 diff。

---

### Issue I-03: 修复 TypeScript 严格类型错误

**Priority:** P0  
**Owner Role:** TypeScript 维护人  
**Files:**
- Modify: `src/utils/error-handler.ts`

**Technical Plan:**
1. 修复 `wrapSync` 返回类型与泛型 `T` 不兼容问题（当前报错点在函数返回处）。
2. 校验 `wrapAsync/wrapSync` 的类型边界一致性，避免过宽断言。
3. 运行 `pnpm exec tsc --noEmit` 验证。

**Acceptance Criteria:**
- `pnpm exec tsc --noEmit` 返回 0。
- 不引入新的 `any` 逃逸。

**Expected Benefit:**
- 类型系统恢复可信度，降低运行时故障概率。

---

### Issue I-04: 建立 Vitest 测试基线与脚本

**Priority:** P0  
**Owner Role:** 测试基础设施  
**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `tests/unit/error-handler.test.ts`
- Create: `tests/unit/image-optimization.test.ts`

**Technical Plan:**
1. 新增 `test`, `test:run`, `test:coverage` 脚本。
2. 配置 Vitest 基础运行环境（node/jsdom 按模块需求拆分）。
3. 先为纯函数工具模块补最小单元测试，确保可持续扩展。

**Acceptance Criteria:**
- `pnpm test:run` 可执行并稳定通过。
- 覆盖率报告可生成。

**Expected Benefit:**
- 从“无可执行测试”升级为“可回归验证”。

---

### Issue I-05: 重构 CI/CD 流程与门禁顺序

**Priority:** P0  
**Owner Role:** DevOps  
**Files:**
- Modify: `.github/workflows/ci-cd.yml`

**Technical Plan:**
1. 删除 CI 内动态 `pnpm add -D` 行为，改为依赖锁定版本执行。
2. 将流水线拆为：`lint -> typecheck -> test -> build -> deploy`，并设置 required checks。
3. 对 `preview` 步骤改为确定性启动/健康检查，移除 `continue-on-error`。

**Acceptance Criteria:**
- CI 可在主分支与 PR 稳定运行。
- 不再出现“脚本不存在（test:run）”类错误。

**Expected Benefit:**
- 主干稳定性显著提升，发布回归风险下降。

---

### Issue I-06: 落地 pre-commit 质量钩子

**Priority:** P0  
**Owner Role:** DevEx  
**Files:**
- Create: `.husky/pre-commit`
- Verify: `.config/lint-staged.config.mjs`

**Technical Plan:**
1. 初始化 `pre-commit` 钩子，执行 `lint-staged`。
2. 限定仅检查 staged 文件，避免过慢影响提交体验。
3. 补充贡献文档中的本地提交流程说明。

**Acceptance Criteria:**
- 本地提交时自动执行格式化和 lint 修复。
- 钩子执行失败可明确提示并阻断提交。

**Expected Benefit:**
- 质量问题前置到开发机，降低 CI 噪音。

---

### Issue I-07: GitHub Projects 任务模型与自动化

**Priority:** P1  
**Owner Role:** 项目经理 + 仓库管理员  
**Files:**
- Create: `docs-meta/PROJECT_MANAGEMENT_MODEL.md`
- Create: `.github/workflows/project-automation.yml`

**Technical Plan:**
1. 定义 Projects 字段：`Priority/Status/Owner/ETA/Risk/Area/Sprint`。
2. 约定标签字典（`priority:*`, `area:*`, `type:*`, `risk:*`）。
3. 建立自动化：新 Issue 自动入盘、PR 合并自动更新状态。

**Acceptance Criteria:**
- 新 Issue 自动进入看板并带默认状态。
- 状态流转（Backlog -> In Progress -> Review -> Done）可追踪。

**Expected Benefit:**
- 任务透明度提升，跨角色协作成本降低。

---

### Issue I-08: Issue/PR 模板体系升级

**Priority:** P1  
**Owner Role:** 项目经理 + Tech Lead  
**Files:**
- Modify/Create: `.github/ISSUE_TEMPLATE/*`
- Modify: `.github/pull_request_template.md`

**Technical Plan:**
1. 新增三类模板：`任务卡`、`技术债`、`复盘/改进`。
2. PR 模板增加“验证证据”强制项（lint/typecheck/test/build 截图或日志摘要）。
3. 模板字段与 Projects 字段一致（便于自动映射）。

**Acceptance Criteria:**
- 模板可直接支撑项目周会与里程碑管理。
- 新 PR 均包含可追溯验证证据。

**Expected Benefit:**
- 沟通结构标准化，减少信息缺失导致的返工。

---

### Issue I-09: 版本控制流程固化（CODEOWNERS/分支策略）

**Priority:** P1  
**Owner Role:** 仓库管理员  
**Files:**
- Create: `.github/CODEOWNERS`
- Create: `docs-meta/VERSION_CONTROL_POLICY.md`

**Technical Plan:**
1. 按目录指定 owner（`src/components`, `src/content`, `docs-meta`, `.github`）。
2. 文档化分支策略：`main` 保护、PR 必经检查、最少评审人规则。
3. 配套发布策略：`CHANGELOG` 与版本标签规范。

**Acceptance Criteria:**
- 关键路径改动必须触发指定评审人。
- 主干不允许绕过检查直接推送。

**Expected Benefit:**
- 代码审阅质量提升，关键模块风险可控。

---

### Issue I-10: 协作工具通知集成（飞书/企微）

**Priority:** P1  
**Owner Role:** DevOps + 项目经理  
**Files:**
- Create: `.github/workflows/notify-collaboration.yml`
- Create: `docs-meta/COLLAB_NOTIFICATION_SETUP.md`

**Technical Plan:**
1. 对接飞书/企业微信机器人 Webhook。
2. 通知事件：PR 创建、CI 失败、PR merge、里程碑延期。
3. 通知消息结构化（仓库、分支、责任人、阻塞环节）。

**Acceptance Criteria:**
- 关键事件在 1 分钟内推送到协作群。
- 失败构建通知包含可定位链接。

**Expected Benefit:**
- 响应速度提升，阻塞问题更快闭环。

---

### Issue I-11: 项目进度数据采集脚本

**Priority:** P1  
**Owner Role:** 平台工程  
**Files:**
- Create: `scripts/metrics/collect-github-metrics.mjs`
- Create: `src/data/metrics/project-progress.json`
- Create: `.github/workflows/collect-metrics.yml`

**Technical Plan:**
1. 通过 GitHub GraphQL API 采集 issue/pr 周期数据（Lead Time、WIP、关闭率）。
2. 定时生成静态 JSON，供前端页面直接读取。
3. 增加失败重试与 token 缺失保护逻辑。

**Acceptance Criteria:**
- 每日自动更新指标 JSON。
- 指标字段完整且可用于图表渲染。

**Expected Benefit:**
- 进度管理从主观汇报转为数据驱动。

---

### Issue I-12: 项目进度可视化页面模块

**Priority:** P1  
**Owner Role:** 前端 + PM  
**Files:**
- Create: `src/components/docs/ProjectMetricsDashboard.astro`
- Create: `src/content/docs/docs-center/运营与协作/项目进度看板.mdx`
- Modify: `.config/sidebar.mjs`

**Technical Plan:**
1. 新增看板组件展示：燃尽、周期、缺陷关闭率、CI 成功率。
2. 页面放入“运营与协作”栏目，并加入侧边栏入口。
3. 保持纯静态渲染，避免额外运行时服务依赖。

**Acceptance Criteria:**
- 看板页面可在构建产物中直接访问。
- 周会可直接引用该页面作为状态面板。

**Expected Benefit:**
- 项目状态可视化，管理成本下降。

---

### Issue I-13: 质量自动化扩展（Playwright/LHCI/Budget）

**Priority:** P1  
**Owner Role:** QA + DevOps  
**Files:**
- Modify: `.github/workflows/ci-cd.yml`
- Modify: `.config/lighthouserc.json`
- Create: `playwright.config.ts`
- Create: `tests/e2e/smoke.spec.ts`
- Create: `scripts/quality/check-bundle-budget.mjs`

**Technical Plan:**
1. 增加关键路径 smoke 测试（首页、文档页、搜索入口）。
2. 引入 bundle 体积预算检查。
3. Lighthouse 校验并与 PR 结果关联。

**Acceptance Criteria:**
- PR 上可看到功能、性能、体积三类质量信号。
- 超预算或关键路径失败时阻断合并。

**Expected Benefit:**
- 质量门禁从“代码风格”扩展到“用户体验和稳定性”。

---

### Issue I-14: 交互组件生命周期统一治理

**Priority:** P2  
**Owner Role:** 前端架构  
**Files:**
- Create: `src/utils/lifecycle.ts`
- Modify: `src/components/home/ui/ThemeSwitcher.astro`
- Modify: `src/components/home/ui/BackToTop.astro`
- Modify: `src/components/home/ui/KeyboardNav.astro`
- Modify: `src/components/docs/ImageCompare.astro`
- Modify: `src/components/docs/ReadingProgress.astro`

**Technical Plan:**
1. 抽象统一 `registerOnPageLoad` 与 `registerCleanup` 工具。
2. 所有重复绑定监听器的组件改为统一注册和销毁。
3. 在 `astro:page-load` 场景下验证无重复监听器累积。

**Acceptance Criteria:**
- 同一路由多次跳转后监听器数量不增长。
- 无功能回归（主题切换、返回顶部、图片对比等正常）。

**Expected Benefit:**
- 降低内存泄漏与行为抖动风险，提升可扩展性。

---

### Issue I-15: 资源体积预算与大媒体治理

**Priority:** P2  
**Owner Role:** 前端性能 + 内容管理员  
**Files:**
- Create: `scripts/assets/check-asset-budget.mjs`
- Modify: `README.md`
- Modify: `docs-meta/CONTRIBUTING.md`

**Technical Plan:**
1. 建立资源预算阈值（单文件、目录总量、媒体格式白名单）。
2. 对超大 `webm/gif` 给出治理策略（压缩、转码、外链对象存储）。
3. 将预算检查接入 CI 预警。

**Acceptance Criteria:**
- 新增大文件能在 PR 阶段被检测到。
- 资源目录总量增长趋势可控。

**Expected Benefit:**
- 降低构建与分发压力，改善加载体验。

---

### Issue I-16: 文档元数据规范（owner/status/reviewDate）

**Priority:** P2  
**Owner Role:** 文档负责人  
**Files:**
- Modify: `src/content/config.ts`
- Modify: `src/content/docs/**/*.mdx`
- Modify: `src/content/docs/**/*.md`
- Create: `docs-meta/DOC_METADATA_POLICY.md`

**Technical Plan:**
1. 在文档 schema 中新增元字段：`owner`, `status`, `lastReviewed`, `tags`。
2. 先为 docs-center 和高频页面补齐元数据。
3. 约定状态枚举与责任人格式，便于后续自动扫描。

**Acceptance Criteria:**
- 新文档不含元数据时在检查中告警。
- 关键文档具备明确 owner 和审阅时间。

**Expected Benefit:**
- 文档可维护性与责任归属清晰化。

---

### Issue I-17: 文档陈旧性扫描与 CI 规则

**Priority:** P2  
**Owner Role:** 文档治理  
**Files:**
- Create: `scripts/docs/check-stale-docs.mjs`
- Create: `.github/workflows/docs-governance.yml`

**Technical Plan:**
1. 扫描 `lastReviewed`，超过阈值（如 90 天）标记为 stale。
2. 输出报告到 PR 评论或 artifact。
3. 对关键目录（流程、协作、资源中心）启用失败门禁。

**Acceptance Criteria:**
- 每周可自动产出陈旧文档报告。
- 关键文档陈旧时能触发显式告警。

**Expected Benefit:**
- 文档长期保持可用，避免“过期流程”误导团队。

---

### Issue I-18: 编辑链接与文档索引修复

**Priority:** P2  
**Owner Role:** 文档体验  
**Files:**
- Modify: `src/components/docs/EditPageLink.astro`
- Modify: `src/content/docs/docs-center/运营与协作/index.mdx`
- Modify: `src/content/docs/docs-center/流程与模板/index.mdx`

**Technical Plan:**
1. `EditPageLink` 支持 `.md/.mdx` 自动探测，避免错误跳转。
2. 为“运营与协作/流程与模板”补充双向索引链接（模板、看板、治理页）。
3. 校验主要入口页均可一跳到反馈与编辑入口。

**Acceptance Criteria:**
- 编辑链接 404 率接近 0。
- 关键流程页导航闭环完整。

**Expected Benefit:**
- 降低协作摩擦，提高文档纠错效率。

---

## 6. Projects 字段建议（落库模板）

- `Priority`: P0 / P1 / P2  
- `Status`: Backlog / Ready / In Progress / Review / Blocked / Done  
- `Area`: Architecture / Quality / CI / Docs / Collaboration / Visualization  
- `Owner`: 人员或小组  
- `ETA`: 日期  
- `Risk`: Low / Medium / High  
- `Metric`: 关联 KPI（如 CI pass rate、Lead Time）

## 7. 验收 KPI（项目级）

- CI 主干通过率：`>= 95%`
- PR 平均 Lead Time：`下降 20%`
- 回归缺陷率：`下降 30%`
- 文档陈旧项（>90 天）数量：`下降 50%`
- 周会状态同步耗时：`下降 40%`

## 8. 执行注意事项

- 所有 P0 Issue 必须先完成再推进 P1/P2。
- 每个 Issue 合并前必须附上“验证证据”（命令输出摘要或截图）。
- 禁止在 CI 中动态安装项目依赖（统一锁文件）。
- 大文件与媒体改动需经过预算检查。

---

Plan complete and saved to `docs/plans/2026-02-25-project-management-operational-upgrade.md`.  
Two execution options:

1. Subagent-Driven (this session) - 我按 Issue 顺序在当前会话逐项落地并验证。  
2. Parallel Session (separate) - 新会话按 `executing-plans` 批量推进并分阶段回报。
