# PLAN — 项目路线图（Planning Agent 唯一写入点）

> **本文件回答：** 项目现在处于哪个阶段 / 当前 Milestone 要做什么、为什么 / 什么算完成 / 现在有哪些任务、哪些完成、哪些阻塞 / 下一阶段是什么 / 哪些方向已明确放弃。
> **纪律：** 只写**已核实的事实**与**真实方向**。「未来可能做」不得写成「当前正在做」；旧计划写过的目标不因被写过就仍是事实。**不为填队列制造任务。**
> **配套文件：** 长期约束读 `.agent/DECISIONS.md`（D-001..D-017，权威定义）；机器现状读 `.agent/STATE.md`；接力上下文读 `.agent/HANDOFF.md`。
> ⏱ 所有 `.agent` 时间字段一律 `date -u` 的 **UTC**（exec 第 37 轮纠正，勿混用本地时区）。

**最后核实：** 2026-10-09T15:45Z（`date -u`）｜**核实基线：** `main@6e32d7a`（与 origin 同步）｜**核实人：** Planning Agent 第 64 轮（无新鲜 LOCK，Executor 第 63 轮后未运行）

> **第 64 轮判定：** ① 无 LOCK、无 in-progress ⇒ Executor 未运行，无现场可干预。② **#210 验收通过并关闭**（5 条标准全部独立取证：`git show b2baab2` 单文件 17+/13-、PR #211 MERGED 全 check pass、main ci-cd @ `b2baab2` success、本轮亲跑 grep 三条过期引用 0 命中且 D-004 标注逐字未动）⇒ ready 与 in-review 双清零；M3 进度按 GitHub milestone API 实测修正为 **10 closed / 3 open**（原记 8/3 系 closed 计数漂移；3 open = #212/#199/#197，#101 不在 M3）。③ **新发现建 #212（ready・P2・M3）**：metrics 采集器（`35e1abc`/#149 起新 schema）与看板组件（仍消费旧 schema）不一致，bot PR #97 按现状合入即 `Object.values(undefined)` 构建失败且 GITHUB_TOKEN 建 PR 不触发 CI（同 #197 根因）；已在 PR #97 留保护性暂缓评论。④ backlog：#199 braces latest 仍 3.0.3（10-17 剩 8 天，到期按 D-011 显式续期、不提前建单）；#197 默认 C 无新信号；#101 复核 Secrets 仍仅 `CODECOV_TOKEN`/`PROJECT_TOKEN` ⇒ blocked 有效；#209/#186 majors 按 D-015 暂缓；inbound 无新工作；无重复/无长期饥饿。⑤ **§7.4 结构漂移定夺 = 移回表格**：第 58–63 轮 8 条记录原被追加在文件末尾 §11.3 之后（紧跟段落无空行、渲染不成表格），本轮整批移入 §7.4 表格末尾（纯格式搬迁、去空白 diff 取证内容逐字未动），节标题补防复发约定。⑥ pending 清零；执行队列 = **1（#212）**。

> **第 62 轮判定：** ① 无 LOCK、#210 自创建零评论 ⇒ Executor 未运行，无现场可干预。② **无 in-review**（验收队列空）。③ backlog 治理：#210 过 4.2 六门禁仍合格（纯 docs、无依赖、验收标准可判定、不碰红线）→ 保持 `ready`；#199 距 10-17 **剩 8 天**，本轮前瞻 `npm view braces` latest 仍 `3.0.3`（无补丁）⇒ 到期仍须按 D-011 显式续期（不提前建单，触发口径不变）；#197（默认 C）/#101（待人类 Secret）状态无变化；无重复、无 auto-discovered、无长期饥饿项。④ **pending 决策：无**（D-001..D-017 全部生效）。⑤ main 绿（ci-cd run `37789400984` @ `c12cef1` success）；线上 `/` 200 + CSP 每请求新 nonce（只读抽查）；inbound `wsyhuat/main` 无新工作（`f98be0d`/`d89b87e` 均已吸收）。⑥ 执行队列 = **1（#210）**——维持真实状态，不为填 2–5 区间制造任务（文件头纪律栏）。⑦ 顺手修正本文件头部「D-001..D-016」索引漂移 → D-001..D-017。

## 一、当前方向

功能期早已结束（M1 稳态治理、M2 稳态防复发均已收官）。当前处于 **M3 稳态运营**：让依赖摄入、发版、供应链回看周期性运转，并处理机制暴露出的真实事项。当前开放：**#212**（metrics 采集器/看板 schema 不一致修复，第 64 轮新发现）与日历型事件 **2026-10-17 braces 豁免到期**（#199，剩 8 天）；方向层已由 **D-017** 裁定维持稳态（用户 2026-10-08 选 A）。

## 二、当前 Milestone：M3 稳态运营（Steady-state Operations）｜GitHub Milestone #2，due 2026-11-15｜进度：10 closed / 3 open（GitHub milestone API 实测 2026-10-09，#212 计入后）

### 2.1 目标与完成判定（滚动，非硬门）

1. v1.2.x 发布且四方一致 —— ✅ **v1.2.1 已达成**（Release=tag=`package.json`=CHANGELOG，祖先判定通过，PR #208 squash）。
2. minor-and-patch 分组按既定手法（D-014 批次处置）摄入、开放 dependabot PR 不逼近 `open-pull-requests-limit` —— ✅（#187/#196 批次先例；当前开放 PR 仅 majors 组 2 个 + automation 1 个）。
3. majors 组有明确处置结论 —— ✅ D-015 暂缓（#186/#209 为 standing reminder）。
4. 2026-10-17 audit 豁免到期前完成核对与显式决策 —— ⏳ 剩 8 天（本轮前瞻：braces 仍无补丁，latest 3.0.3）。
5. main CI 全绿、线上 `/` 200 + CSP nonce —— ✅ 本轮复验（run `37949256727` @ `6e32d7a` 全 success；第 63 轮线上 nonce 头/体一致）。

### 2.2 执行队列（当前 = 1）

1. **#212**（P2，`ready`）修复 metrics 采集器与看板组件 schema 不一致：采集器（`35e1abc`/#149 起）产出新 schema，`ProjectMetricsDashboard.astro` 仍消费旧 schema，bot PR #97 按现状合入即构建失败；推荐方案=采集器输出超集，验证走本地全门禁 + 合入后 main CI（#212 正文含 6 条可判定验收标准）。

持续触发器（满足其一即建/转 ready）：

- **#199 到期（10-17）**：braces 仍无补丁 → 按 D-011 显式续期（更新 `.config/audit-allowlist.json` 的 `expires` + `reason`，属配置改动，转 ready 执行单）；届时 audit 门禁主动变红属预期机制，不是事故。
- 每周一 dependabot 扫描（minor-and-patch 分组按 D-014 批次处置；majors 按 D-015 暂缓）。
- 用户 / 协作方（inbound 巡检 `wsyhuat`）发起的新需求（D-017 已裁定维持稳态；日后再启方向属用户新指令）。

### 2.3 已知阻塞与依赖

| 项                                      | 状态                       | 需要谁         | 说明                                                                                                                                                    |
| --------------------------------------- | -------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **#101** CI 自动部署                    | `blocked`（P1）            | **人类**       | 第 64 轮 `gh api` 复核：Actions Secrets 仍仅 `CODECOV_TOKEN`/`PROJECT_TOKEN`。配好前不得把 deploy job 加回 CI（D-001）；本地 OAuth 部署可用，不阻塞交付 |
| **#199** braces 豁免到期                | `blocked`（P2）            | 10-17 触发     | `braces` latest 仍 `3.0.3` 无补丁（第 63/64 轮两度实测）→ 到期按 D-011 显式续期，不得静默延长                                                           |
| **#197** rp Release PR 自助 CI          | `needs-info`（P3）         | 默认 C（不改） | 第 60 轮已补录第 58 轮实测（同基 `update-branch` 失效 + 空提交触发法）；等发版频率信号或人类意愿                                                        |
| **PR #97** metrics 快照（bot）          | 暂缓合入                   | **#212**       | 新 schema 与看板组件不兼容，合入即构建失败；已留保护性评论，等 #212 落地后 rebase 或由 bot 重生                                                         |
| **D-017** Q4 方向（是否启动新功能）     | **已裁定 A**（2026-10-08） | —              | 维持稳态；Q4 评审仅机械刷新（#210）；详见 `DECISIONS.md` D-017                                                                                          |
| #186/#209 majors PR                     | 暂缓（D-015）              | —              | standing reminder，占额度 2/10，不阻塞 minor-and-patch                                                                                                  |
| `size:xs` / `update-linked-issues` 权限 | 仓库设置                   | 人类（可选）   | 补 `issues: write` 扩大 `pull_request_target` 权限面 / 无失败实证，Agent 不擅动（维持既有结论）                                                         |

### 2.4 卫生备注（非任务，不建 Issue）

- origin 上三条历史已合并分支待下一棒 Executor 顺手删除：`feat/worker/auto-deploy`、`fix/disable-openwiki`、`refactor/frontend/site-review-followups`（第 64 轮 `git branch -r --merged origin/main` 实测；`agent/issue-201/203/204` 已于第 62 轮清理）。
- `.agent/ENV.md` 头部时间戳第 63 轮已刷新（10-09T14:55Z），原 cosmetic 欠项关闭。
- PR #97 已由 Planner 标注暂缓（等 #212），Executor 执行 #212 时按其验收标准处置，勿单独合入。

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

当前**无开放 pending**（D-017 已由用户 2026-10-08 同轮裁定 A=维持稳态）；权威定义见 `.agent/DECISIONS.md`（D-001..D-017 全部生效）。历史 Gate 记录（如 D-009 批次处置授权、D-010 vite-plugin 锁定）以 DECISIONS.md 为准，本文件不再复制第二套说法。

## 给 Executor 的指令

先领 **#212**（metrics schema 修复：采集器输出超集 + 数据文件刷新 + PR #97 处置，验证走本地全门禁 + 合入后 main CI）；其后稳态巡检，10-17 前后优先配合 #199 到期决策（audit 主动变红属预期机制，按 D-011 显式续期），可顺手删除 origin 上三条已合并分支（`feat/worker/auto-deploy` / `fix/disable-openwiki` / `refactor/frontend/site-review-followups`）。
