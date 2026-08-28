# HUAT FSAC 开发流程锚定文档

> **Agent 必读 | 单一事实来源（SSOT）**
> 所有人类与 AI Agent（单 Agent / 多 Agent 协作）在此仓库的任何开发动作，必须以本文档为锚点。
> 开始任何任务前，先读本文档；结束任何任务后，回写本文档。

**最后更新：** 2026-08-28 | **维护人：** 单人全栈（你）| **状态：** 生效中
**关联文档：** `AGENTS.md`（Agent 入口） / `docs/PROJECT_MANAGEMENT_MODEL.md`（看板与发布模型） / `docs/DEPLOYMENT.md`

---

## 1. 锚定规则（所有 Agent 必须遵守）

1. **先读后做：** 任何代码/文档改动前，必须完整读取本文件 + `AGENTS.md` 第2节“发布与部署” + 相关 ADR。
2. **单点写入：** 任务状态、决策、阻塞只在本文件的 `§4 任务看板` 和 `§7 协作日志` 更新，不另起文档。
3. **小步提交：** 每个任务独立分支、独立 PR，PR 描述必须关联看板任务编号（`Closes #xxx` 或 `Ref: WORKFLOW-Tx`）。
4. **门禁不绕：** 未通过 `§6 质量门禁` 不得标记 Done，不直接 push 到 `main`。
5. **多 Agent 互斥：** 同一任务同一时间只允许一个 Agent 认领（见 `§7`）。

> 违反以上任一条，视为无效产出，需回滚重做。

---

## 2. 项目快照（给 Agent 的上下文压缩）

| 维度         | 事实                                                                                                                                                                                                       |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **项目**     | HUAT FSAC Guidance-Astro — 基于 `Astro 7.1.3 + Starlight 0.41 + TypeScript 5.9` 的文档站                                                                                                                   |
| **线上**     | `https://huat-fsac.eu.org` 由 **Cloudflare Worker SSR** 提供（`wrangler.json:1`），`*.pages.dev` 404 为预期                                                                                                |
| **部署**     | 自动部署**已恢复(T-001)**：`push main` → GitHub Actions `deploy` → `wrangler deploy --config dist/server/wrangler.json`（需 Secrets `CLOUDFLARE_API_TOKEN`+`ACCOUNT_ID`），未配时回退 `pnpm deploy:worker` |
| **技术栈**   | `Astro / Starlight / Cloudflare Workers / pnpm 11 / Node 22 / Vitest / Playwright / ESLint+Prettier+Husky`                                                                                                 |
| **内容源**   | `src/content/docs/**`（MDX）、`src/data/seasons/*.json`、`src/data/sponsors.json`                                                                                                                          |
| **当前状态** | `docs/TODOLIST.md` P0-P4 20项已在 2026-08-25 标记完成；`gh issue` 暂无开放任务；CI 含 `lint / typecheck / test / build / quality-gate`                                                                     |
| **约束**     | 单人开发（35h/周假设），无硬性截止时间（迭代制），无额外预算                                                                                                                                               |

---

## 3. 工作流（5 阶段，适配单人与多 Agent）

```
[1] 需求澄清 → [2] 设计定稿 → [3] 开发实现 → [4] 联调测试 → [5] 预发布与上线
```

| 阶段                | 准入条件               | 产出                                       | 退出条件（DoD）                                                           |
| ------------------- | ---------------------- | ------------------------------------------ | ------------------------------------------------------------------------- |
| **1. 需求澄清**     | 任务在看板进入 `Ready` | 范围清单 + 验收标准（写在看板任务描述里）  | 模糊点≤0，非 Must 已标记 Should/Could                                     |
| **2. 设计定稿**     | 需求已冻结             | UI 走查截图 / 技术方案（≤1页）             | `docs/WORKFLOW.md:§4` 任务状态切 `In Progress`                            |
| **3. 开发实现**     | 设计已确认             | 分支 + 代码 + 单元测试                     | `pnpm lint && pnpm build` 无错误                                          |
| **4. 联调测试**     | 代码 PR 已提           | PR + Vitest + Playwright 报告              | `§6 门禁` 全绿，PR 获 Review                                              |
| **5. 预发布与上线** | 测试通过               | 预发验证 + `pnpm deploy:worker` + 线上验收 | `curl -sI https://huat-fsac.eu.org/` 含 `content-security-policy: nonce-` |

> 单人串行时，同一时间只做一个阶段；多 Agent 时，**阶段3可并行**（要求任务无文件重叠），阶段4/5必须串行。

---

## 4. 任务看板（唯一任务表，Agent 读写此处）

> **规则：** 新增任务在此表追加一行；认领时填 `负责人` 并切 `进行中`；完成后切 `已完成` 并补 `产出/验证`。
> 对应 GitHub Projects 看板 `https://github.com/orgs/HUAT-FSAC/projects/1`，两者需保持一致（以本表为准，定期同步到 Projects）。

| 编号           | 任务                                         | 优先级 | 状态      | 负责人              | 前置  | 产出/验证                                                                               |
| -------------- | -------------------------------------------- | ------ | --------- | ------------------- | ----- | --------------------------------------------------------------------------------------- |
| T-001          | 恢复自动部署（Token+环境变量+域名切 Worker） | P0     | 待 Review | opencode/muse-spark | -     | `curl -sI https://huat-fsac.eu.org/` 含 `content-security-policy: nonce-` ✅ 2026-08-28 |
| T-002          | 示例：3 篇核心文档更新（按需）               | P1     | 待办      | -                   | T-001 | `pnpm build` 通过                                                                       |
| T-003          | 示例：动态 og:image 延期方案文档化           | P2     | 待办      | -                   | -     | 方案写入 `docs/WORKFLOW.md:§7`                                                          |
| _在此追加新行_ |                                              |        |           |                     |       |                                                                                         |

**优先级定义：** `P0 阻塞上线 / P1 本迭代必做 / P2 有空做 / P3 下迭代`

**状态定义：** `待办 → 进行中 → 待 Review → 已完成 → 已归档`（对应 Projects `Backlog→Ready→In Progress→Review→Done`）

---

## 5. 分支与提交规范

- **分支命名：** `type/area/desc`，如 `feat/worker/auto-deploy`、`fix/docs/theme-light`、`chore/ci/bundle-budget`
- **提交信息：** Conventional Commits，`feat: ...` / `fix: ...` / `chore: ...` / `docs: ...`
- **PR 要求：** 标题 `[T-xxx] 简述`，正文含 `Ref: T-xxx` + 改动摘要 + 验证证据（`lint/typecheck/test/build` 日志粘贴）
- **禁止：** 直接 push `main`；一个 PR 混多个 T-xxx；无验证证据的 PR

---

## 6. 质量门禁（Definition of Done）

单个任务标记 `已完成` 前，必须全部通过：

```bash
pnpm lint              # ESLint 无 error
pnpm format:check      # Prettier 通过
pnpm test:run          # Vitest 通过
pnpm test:e2e          # Playwright 关键路径通过（若改动涉及 UI/路由）
pnpm build             # Astro 构建通过，产出 dist/server/entry.mjs
pnpm quality:bundle    # 包体积预算通过
pnpm quality:theme     # 主题对比度通过
```

- 图片/样式改动需附加亮色/暗色截图
- 文档改动需 `pnpm build` 无 MDX 警告
- 部署相关改动需附加 `curl -sI https://huat-fsac.eu.org/` 头验证

---

## 7. 多 Agent 协作协议

### 7.1 角色

| 角色             | 职责                                  | 认领方式                                     |
| ---------------- | ------------------------------------- | -------------------------------------------- |
| **Driver**       | 认领 T-xxx 并完成阶段3                | 在看板表填 `负责人=Agent名`，状态切 `进行中` |
| **Reviewer**     | 阶段4 代码/文档 Review                | PR Review，不直接改 Driver 分支              |
| **Orchestrator** | 解决冲突、合流、切 `main`、更新本文件 | 仅 1 个，多 Agent 时由人类或主 Agent 担任    |

### 7.2 认领与释放

1. 认领：`gh issue` 或本表 `进行中` 且无其他 Agent 占用
2. 锁定：认领后在 `§7.4 协作日志` 追加一行 `认领 T-xxx @Agent 时间`
3. 释放：PR 合并或阻塞超 24h 未更新，其他 Agent 可接管（需在日志注明）

### 7.3 文件互斥

- 同一 PR 周期内，两个 Agent 不得同时修改同一文件；需拆任务或串行。
- 高冲突文件：`astro.config.mjs`、`src/middleware.ts`、`src/styles/**`、`wrangler.json`

### 7.4 协作日志（追加式，不删历史）

| 时间       | Agent               | 动作                       | 备注                                                                                                                                                                                                                                                                  |
| ---------- | ------------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-08-28 | human               | 创建本文档                 | 锚定生效                                                                                                                                                                                                                                                              |
| 2026-08-28 | opencode/muse-spark | 认领 T-001                 | 分支 `feat/worker/auto-deploy`                                                                                                                                                                                                                                        |
| 2026-08-28 | opencode/muse-spark | 完成 T-001 阶段3 待 Review | Handoff: 分支 feat/worker/auto-deploy 改动 ci-cd.yml deploy + DEPLOYMENT.md + PROJECT_MANAGEMENT_MODEL.md 验证 lint/format/test:run/build/bundle/theme/e2e ✅ curl CSP nonce ✅ 风险 需 Secrets 未配则 deploy 失败 下一步 Reviewer 看 .github/workflows/ci-cd.yml:243 |
| _在此追加_ |                     |                            |                                                                                                                                                                                                                                                                       |

### 7.5 handoff 格式

Agent 交接时，在 PR 评论或本节追加：

```
Handoff: T-xxx 已完成阶段3，分支 feat/xxx，待 Review
- 改动：...
- 验证：pnpm build ✅ / test ✅
- 风险：...
- 下一步：Reviewer 请重点看 src/middleware.ts:12
```

---

## 8. 更新规则

- **谁更新：** 完成阶段1/2/5 的 Agent 负责回写本文件
- **何时更新：** 任务状态变更时同步更新 `§4`；有决策/阻塞时追加 `§7.4`
- **如何更新：** 小步编辑本文件并单独提交 `docs: update WORKFLOW T-xxx 状态`，不与其他改动混提交
- **归档：** 迭代结束将 `已完成` 行移至 `docs/reports/completion/` 并在本表保留一行摘要

---

## 9. 快速开始（给人类）

1. 在 `§4` 追加本次迭代的 3-5 个 T-xxx（从 `docs/TODOLIST.md` 或新需求来）
2. 复制 `§10 Prompt` 发给任意 AI Agent
3. 每个任务结束检查 `§6 门禁`，全部绿后切本表状态

---

## 10. Prompt（复制即用，见下方交付物）

> 完整 Prompt 已单独交付，粘贴给任意 AI 即可让其锚定本文档工作。见本次回答的 `Prompt` 区块。
