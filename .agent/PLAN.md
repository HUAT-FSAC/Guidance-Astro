# PLAN — 项目路线图（Planning Agent 唯一写入点）

> **本文件回答：** 项目现在处于哪个阶段 / 当前 Milestone 要做什么、为什么 / 什么算完成 / 现在有哪些任务、哪些完成、哪些阻塞 / 下一阶段是什么 / 哪些方向已明确放弃。
> **纪律：** 只写**已核实的事实**与**真实方向**。「未来可能做」不得写成「当前正在做」；旧计划写过的目标不因被写过就仍是事实。**不为填队列制造任务。**
> **配套文件：** 长期约束读 `.agent/DECISIONS.md`（D-001..D-016，权威定义）；机器现状读 `.agent/STATE.md`；接力上下文读 `.agent/HANDOFF.md`。
> ⏱ 所有 `.agent` 时间字段一律 `date -u` 的 **UTC**（exec 第 37 轮纠正，勿混用本地时区）。

**最后核实：** 2026-10-08T11:32Z（`date -u`）｜**核实基线：** `main@5677bf1`（第 59 轮执行收尾提交；工作树干净、与 origin 同步）｜**核实人：** Planning Agent 第 60 轮（无新鲜 LOCK，Executor 未运行；本轮验收关闭 #206 并回应 HANDOFF 全部信号）

> **第 60 轮判定：** ① **#206 验收通过并关闭**——7 条标准 + v1.2.1 收尾全部独立复核（未沿用报告自述）：直读豁免清单仅剩 braces；ci-cd run `37610591059` 七 job 全 success 无 skipped；lockfile `http-cache-semantics@4.2.0`=0 / `4.3.0` 在位；`5faaf8b`/`0054bd6`/`f159158` 祖先判定通过；单请求 CSP nonce 头/体相等（`RB_AJpopmeA4Hc9bi0Snbw`）；en/zh aria 线上抽查通过；ENV §2 基线已回填（451/42 · 100 · 168 · audit 0）；三单清偿评论齐备；v1.2.1 四方一致 + 祖先判定 + PR #208 squash 合入。② in-review 1 → **0**；ready = **0（诚实空队列）**：M3 是事件驱动稳态循环，无实证缺口不造任务。③ HANDOFF 四条信号全部回应：#206 已验收；#197 已补录第 58 轮实测输入（同基 Release PR `update-branch` 失效 + 空提交触发法实证，维持默认 C）；#199 前瞻复核 `npm view braces` latest 仍 `3.0.3` 无补丁（10-17 到期按 D-011 显式续期）；#101 复核 Actions Secrets 仍仅 `CODECOV_TOKEN`/`PROJECT_TOKEN`，阻塞有效。④ M3 进度 **8 closed / 3 open**（open = #199/#197/#101）。

## 一、当前方向

功能期早已结束（M1 稳态治理、M2 稳态防复发均已收官）。当前处于 **M3 稳态运营**：让依赖摄入、发版、供应链回看周期性运转，并处理机制暴露出的真实事项。**当下没有开放的交付工作**——#205/#206 收官后 M3 回到事件驱动巡检；唯一日历型事件是 **2026-10-17 braces 豁免到期**（#199）。

## 二、当前 Milestone：M3 稳态运营（Steady-state Operations）｜GitHub Milestone #2，due 2026-11-15｜进度：8 closed / 3 open

### 2.1 目标与完成判定（滚动，非硬门）

1. v1.2.x 发布且四方一致 —— ✅ **v1.2.1 已达成**（Release=tag=`package.json`=CHANGELOG，祖先判定通过，PR #208 squash）。
2. minor-and-patch 分组按既定手法（D-014 批次处置）摄入、开放 dependabot PR 不逼近 `open-pull-requests-limit` —— ✅（#187/#196 批次先例；当前开放 PR 仅 majors 组 2 个 + automation 1 个）。
3. majors 组有明确处置结论 —— ✅ D-015 暂缓（#186/#209 为 standing reminder）。
4. 2026-10-17 audit 豁免到期前完成核对与显式决策 —— ⏳ 剩 9 天（本轮前瞻：braces 仍无补丁）。
5. main CI 全绿、线上 `/` 200 + CSP nonce —— ✅ 本轮复验（run `37610591059` 全 success；nonce 头/体一致）。

### 2.2 执行队列（当前 = 0，诚实空队列）

无 ready 单，原因：#205/#206 收官后无任何有实证的开放缺口。触发器（满足其一即建/转 ready）：

- **#199 到期（10-17）**：braces 仍无补丁 → 按 D-011 显式续期（更新 `.config/audit-allowlist.json` 的 `expires` + `reason`，属配置改动，转 ready 执行单）；届时 audit 门禁主动变红属预期机制，不是事故。
- 每周一 dependabot 扫描（minor-and-patch 分组按 D-014 批次处置；majors 按 D-015 暂缓）。
- 用户 / 协作方（inbound 巡检 `wsyhuat`）发起的新需求。

### 2.3 已知阻塞与依赖

| 项                                      | 状态               | 需要谁         | 说明                                                                                                                                                    |
| --------------------------------------- | ------------------ | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **#101** CI 自动部署                    | `blocked`（P1）    | **人类**       | 第 60 轮 `gh api` 复核：Actions Secrets 仍仅 `CODECOV_TOKEN`/`PROJECT_TOKEN`。配好前不得把 deploy job 加回 CI（D-001）；本地 OAuth 部署可用，不阻塞交付 |
| **#199** braces 豁免到期                | `blocked`（P2）    | 10-17 触发     | `braces` latest 仍 `3.0.3` 无补丁 → 到期按 D-011 显式续期，不得静默延长                                                                                 |
| **#197** rp Release PR 自助 CI          | `needs-info`（P3） | 默认 C（不改） | 第 60 轮已补录第 58 轮实测（同基 `update-branch` 失效 + 空提交触发法）；等发版频率信号或人类意愿                                                        |
| #186/#209 majors PR                     | 暂缓（D-015）      | —              | standing reminder，占额度 2/10，不阻塞 minor-and-patch                                                                                                  |
| `size:xs` / `update-linked-issues` 权限 | 仓库设置           | 人类（可选）   | 补 `issues: write` 扩大 `pull_request_target` 权限面 / 无失败实证，Agent 不擅动（维持既有结论）                                                         |

### 2.4 卫生备注（非任务，不建 Issue）

- origin 上 `agent/issue-201/203/204` 三分支已并入 main，待下一棒 Executor 顺手删除。
- `.agent/ENV.md` 头部「最近更新」时间戳停在 10-03、未随 §2 基线（10-07）刷新——Executor 文件 cosmetic 欠项，已在 #206 验收评论记录，请下轮顺手更新。

## 三、下一阶段

M3 是开放式稳态循环，无「做完即停」的终线：只要项目继续存在，依赖摄入 / 发版 / 供应链回看就持续运转。若未来出现人类发起的新功能需求，再据实开新 Milestone；否则不预设「M4」。

## 四、已明确放弃的方向（不再重新讨论）

| 方向                                                       | 放弃理由                                               | 依据                     |
| ---------------------------------------------------------- | ------------------------------------------------------ | ------------------------ |
| 跟进 Starlight ≥0.42                                       | satteri WASI 破坏 workerd 构建链，等上游               | D-004 / T-026 实测       |
| `wrangler` semver-major                                    | 精确 pin，major 需人工复核                             | D-003 / `dependabot.yml` |
| `format:check` 扩到 yml/yaml/astro/mdx                     | hook 未覆盖；`*.astro` 无 prettier parser（已实证）    | 第 24 轮                 |
| `tsc --noEmit` 纳入 `tests/**`                             | 预防性缺口，当前无实证缺陷，纳入可能连带暴露存量类型错 | 保守原则，已判定         |
| 逐个合并 dependabot PR                                     | 同 2 文件串行 rebase，且易先合入无用提交               | D-005 + D-009 裁决       |
| 直接 `merge wsyhuat/main`                                  | fork 落后 main，只取单个 commit，不取分支              | `git diff` 实测          |
| 追 `@cloudflare/vite-plugin` 最新版                        | peer 逐发布日棘轮；改为锁定 + 人工抬版                 | D-010                    |
| 把「发现协作方修复」当作用户决策                           | 事实发现与工程判断，Planner 自决并建单是默认           | Planner 职责边界         |
| 补 `size:xs` / `update-linked-issues` 所需 `issues: write` | 扩大 `pull_request_target` 权限面 / 无失败实证         | 官方警告 / 保守原则      |
| 自动采纳 majors（actions v7 / TS7 等）                     | D-015 暂缓；采纳属红线相邻，需用户决定                 | D-015                    |

## 五、Decision Gate

当前**无开放 pending 决策**；权威定义见 `.agent/DECISIONS.md`（D-001..D-016 全部生效）。历史 Gate 记录（如 D-009 批次处置授权、D-010 vite-plugin 锁定）以 DECISIONS.md 为准，本文件不再复制第二套说法。

## 给 Executor 的指令

稳态巡检即可；10-17 前后优先配合 #199 到期决策（audit 主动变红属预期机制），可顺手清理 origin 上已合并的 `agent/issue-201/203/204` 分支并刷新 ENV 头部时间戳。
