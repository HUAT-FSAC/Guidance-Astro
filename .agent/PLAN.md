# PLAN — 项目路线图（Planning Agent 唯一写入点）

> **本文件回答：** 项目现在处于哪个阶段 / 当前 Milestone 要做什么、为什么 / 什么算完成 / 现在有哪些任务、哪些完成、哪些阻塞 / 下一阶段是什么 / 哪些方向已明确放弃。
> **纪律：** 只写**已核实的事实**与**真实方向**。「未来可能做」不得写成「当前正在做」；旧计划写过的目标不因被写过就仍是事实。**不为填队列制造任务。**
> **配套文件：** 长期约束读 `.agent/DECISIONS.md`（D-001..D-017，权威定义）；机器现状读 `.agent/STATE.md`；接力上下文读 `.agent/HANDOFF.md`。
> ⏱ 所有 `.agent` 时间字段一律 `date -u` 的 **UTC**（exec 第 37 轮纠正，勿混用本地时区）。

**最后核实：** 2026-10-10T08:32Z（`date -u`）｜**核实基线：** `main@19169c5`（与 origin 同步，CI 三连绿：`ca93a6a`/`8828f5f`/`19169c5` 三个 ci-cd run 均 success）｜**核实人：** Planning Agent 第 66 轮（LOCK 过期未删——Executor 第 65 轮收尾遗漏，心跳 04:25Z 早于 TTL，视为中断现场；无 in-progress）

> **第 66 轮判定：** ① **#212 验收通过并关闭**——6 条标准全部独立取证（本机实跑 `pnpm build` exit 0 / `test:run` 451 passed·42 files / `test:e2e` 102 passed 含两条看板页测试；隔离目录实跑采集器 exit 0 且超集 13 键齐全；数据文件 generatedAt=2026-10-10T04:00:17Z；PR #97 MERGED=`8828f5f` 且合入后 ci-cd `38022819760` success；v1.2.2 四方一致）。② **#212 程序违规记录并修复轨迹**：Executor 第 65 轮自行关单（04:12:48Z，违 D-006）、Issue 内无执行报告（违 §1.6）、标签停留 in-progress、STATE「证据在 Issue 内」表述失实；Planner 已 reopen→标签修正 status:review→贴验收评论→由 Planner 关闭，审计轨迹恢复。③ M3 进度按 milestone API 实测刷新为 **11 closed / 2 open**（open=#199/#197；#101 不在 M3）。④ **新常态项登记：#215**（bot 按日再生的 metrics PR，数据-only，05:51Z 生成）——不单独建单（目标按日漂移），按 PLAN 指令由 Executor 顺手处置。⑤ backlog：#199 braces latest 仍 3.0.3（第 66 轮前瞻，剩 7 天，到期按 D-011 显式续期）；#197 补录空提交触发法第三次实证评论，维持 needs-info/默认 C；#101 第 66 轮 `gh api` 复核 Secrets 仍仅 `CODECOV_TOKEN`/`PROJECT_TOKEN` ⇒ blocked 有效；#186/#209 majors 按 D-015 暂缓；inbound 内容级终判无新工作（f98be0d 已由 f3989dc 吸收、d89b87e 系 fork 同步 main）；无重复/无长期饥饿。⑥ Executor 第 65 轮 `.agent/` 更新（STATE/HANDOFF/ENV）未提交、LOCK 未删——本轮代提交并记录。⑦ pending 清零；**执行队列 = 0（诚实空置，不为填 2–5 区间制造任务）**。

> **第 64 轮判定：** ① 无 LOCK、无 in-progress ⇒ Executor 未运行，无现场可干预。② **#210 验收通过并关闭**（5 条标准全部独立取证：`git show b2baab2` 单文件 17+/13-、PR #211 MERGED 全 check pass、main ci-cd @ `b2baab2` success、本轮亲跑 grep 三条过期引用 0 命中且 D-004 标注逐字未动）⇒ ready 与 in-review 双清零；M3 进度按 GitHub milestone API 实测修正为 **10 closed / 3 open**（原记 8/3 系 closed 计数漂移；3 open = #212/#199/#197，#101 不在 M3）。③ **新发现建 #212（ready・P2・M3）**：metrics 采集器（`35e1abc`/#149 起新 schema）与看板组件（仍消费旧 schema）不一致，bot PR #97 按现状合入即 `Object.values(undefined)` 构建失败且 GITHUB_TOKEN 建 PR 不触发 CI（同 #197 根因）；已在 PR #97 留保护性暂缓评论。④ backlog：#199 braces latest 仍 3.0.3（10-17 剩 8 天，到期按 D-011 显式续期、不提前建单）；#197 默认 C 无新信号；#101 复核 Secrets 仍仅 `CODECOV_TOKEN`/`PROJECT_TOKEN` ⇒ blocked 有效；#209/#186 majors 按 D-015 暂缓；inbound 无新工作；无重复/无长期饥饿。⑤ **§7.4 结构漂移定夺 = 移回表格**：第 58–63 轮 8 条记录原被追加在文件末尾 §11.3 之后（紧跟段落无空行、渲染不成表格），本轮整批移入 §7.4 表格末尾（纯格式搬迁、去空白 diff 取证内容逐字未动），节标题补防复发约定。⑥ pending 清零；执行队列 = **1（#212）**。

> **第 62 轮判定：** ① 无 LOCK、#210 自创建零评论 ⇒ Executor 未运行，无现场可干预。② **无 in-review**（验收队列空）。③ backlog 治理：#210 过 4.2 六门禁仍合格（纯 docs、无依赖、验收标准可判定、不碰红线）→ 保持 `ready`；#199 距 10-17 **剩 8 天**，本轮前瞻 `npm view braces` latest 仍 `3.0.3`（无补丁）⇒ 到期仍须按 D-011 显式续期（不提前建单，触发口径不变）；#197（默认 C）/#101（待人类 Secret）状态无变化；无重复、无 auto-discovered、无长期饥饿项。④ **pending 决策：无**（D-001..D-017 全部生效）。⑤ main 绿（ci-cd run `37789400984` @ `c12cef1` success）；线上 `/` 200 + CSP 每请求新 nonce（只读抽查）；inbound `wsyhuat/main` 无新工作（`f98be0d`/`d89b87e` 均已吸收）。⑥ 执行队列 = **1（#210）**——维持真实状态，不为填 2–5 区间制造任务（文件头纪律栏）。⑦ 顺手修正本文件头部「D-001..D-016」索引漂移 → D-001..D-017。

## 一、当前方向

功能期早已结束（M1 稳态治理、M2 稳态防复发均已收官）。当前处于 **M3 稳态运营**：让依赖摄入、发版、供应链回看周期性运转，并处理机制暴露出的真实事项。当前开放：日历型事件 **2026-10-17 braces 豁免到期**（#199，剩 7 天）与 bot 按日再生的 metrics PR（当前 **#215**，数据-only，Executor 顺手处置项）；#212（metrics schema 修复）已于第 66 轮验收关闭。方向层已由 **D-017** 裁定维持稳态（用户 2026-10-08 选 A）。

## 二、当前 Milestone：M3 稳态运营（Steady-state Operations）｜GitHub Milestone #2，due 2026-11-14｜进度：11 closed / 2 open（GitHub milestone API 实测 2026-10-10，#212 计入关闭后）

### 2.1 目标与完成判定（滚动，非硬门）

1. v1.2.x 发布且四方一致 —— ✅ **v1.2.1 已达成**（Release=tag=`package.json`=CHANGELOG，祖先判定通过，PR #208 squash）。
2. minor-and-patch 分组按既定手法（D-014 批次处置）摄入、开放 dependabot PR 不逼近 `open-pull-requests-limit` —— ✅（#187/#196 批次先例；当前开放 PR 仅 majors 组 2 个 + automation 1 个）。
3. majors 组有明确处置结论 —— ✅ D-015 暂缓（#186/#209 为 standing reminder）。
4. 2026-10-17 audit 豁免到期前完成核对与显式决策 —— ⏳ 剩 7 天（本轮前瞻：braces 仍无补丁，latest 3.0.3）。
5. main CI 全绿、线上 `/` 200 + CSP nonce —— ✅ 本轮复验（main 三连绿：`ca93a6a` run `38022387436` / `8828f5f` run `38022819760` / `19169c5` run `38023267840` 均 success；线上部署 Version `5fdc53fc` 由第 65 轮双请求 nonce 一致验过，本轮未重复部署）。

### 2.2 执行队列（当前 = 0）

**ready 队列空置**（#212 已于第 66 轮验收关闭）。这是真实状态而非疏漏：M3 剩余工作均为日历触发型（10-17 到期决策 / 每周一 dependabot 扫描 / bot 按日 metrics PR），无一满足「现在即可执行」的 ready 门禁。按文件头纪律，不为填 2–5 区间制造任务。

持续触发器（满足其一即建/转 ready 或按指令顺手处置）：

- **#199 到期（10-17）**：braces 仍无补丁 → 按 D-011 显式续期（更新 `.config/audit-allowlist.json` 的 `expires` + `reason`，属配置改动，转 ready 执行单）；届时 audit 门禁主动变红属预期机制，不是事故。
- 每周一 dependabot 扫描（minor-and-patch 分组按 D-014 批次处置；majors 按 D-015 暂缓）。
- **bot metrics PR 按日再生**（当前 **#215**，05:51Z 生成，数据-only）：不单独建单（目标按日漂移），由 Executor 每轮顺手处置——确认 diff 仅为 `project-progress.json` 值漂移、schema 与 main 一致后合入，验证走合入后 main ci-cd（PR 本身不触发 CI，同 #197 根因）；若 diff 越出数据文件则停下报告 Planner。
- 用户 / 协作方（inbound 巡检 `wsyhuat`）发起的新需求（D-017 已裁定维持稳态；日后再启方向属用户新指令）。

### 2.3 已知阻塞与依赖

| 项                                      | 状态                       | 需要谁         | 说明                                                                                                                                                              |
| --------------------------------------- | -------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **#101** CI 自动部署                    | `blocked`（P1）            | **人类**       | 第 60/64/66 轮三度 `gh api` 复核：Actions Secrets 仍仅 `CODECOV_TOKEN`/`PROJECT_TOKEN`。配好前不得把 deploy job 加回 CI（D-001）；本地 OAuth 部署可用，不阻塞交付 |
| **#199** braces 豁免到期                | `blocked`（P2）            | 10-17 触发     | `braces` latest 仍 `3.0.3` 无补丁（第 63/64/66 轮三度实测）→ 到期按 D-011 显式续期，不得静默延长                                                                  |
| **#197** rp Release PR 自助 CI          | `needs-info`（P3）         | 默认 C（不改） | 第 60 轮已补录第 58 轮实测（同基 `update-branch` 失效 + 空提交触发法）；第 66 轮再登记第三次实证（#214）；等发版频率信号或人类意愿                                |
| **PR #215** metrics 快照（bot）         | 开放待处置                 | **Executor**   | #97 合入后 bot 按日再生（05:51Z，数据-only，schema 已兼容）；按 §2.2 触发器指令顺手处置，勿单独建单                                                               |
| **D-017** Q4 方向（是否启动新功能）     | **已裁定 A**（2026-10-08） | —              | 维持稳态；Q4 评审仅机械刷新（#210）；详见 `DECISIONS.md` D-017                                                                                                    |
| #186/#209 majors PR                     | 暂缓（D-015）              | —              | standing reminder，占额度 2/10，不阻塞 minor-and-patch                                                                                                            |
| `size:xs` / `update-linked-issues` 权限 | 仓库设置                   | 人类（可选）   | 补 `issues: write` 扩大 `pull_request_target` 权限面 / 无失败实证，Agent 不擅动（维持既有结论）                                                                   |

### 2.4 卫生备注（非任务，不建 Issue）

- **分支卫生已完成**（第 65 轮按授权执行）：`agent/issue-212-metrics-schema` 与 origin 三条历史已合并分支（`feat/worker/auto-deploy` / `fix/disable-openwiki` / `refactor/frontend/site-review-followups`）均已删除；第 66 轮复核 origin 无新增已合并残留。
- **Executor 第 65 轮收尾遗漏两项**（第 66 轮发现并代办/记录，不追罚）：① `.agent/` 三个文件（STATE/HANDOFF/ENV）更新未提交——已由第 66 轮一并 `chore(agent):` 代提交；② LOCK 未删除（心跳 04:25Z，已过期）——LOCK 属 Executor 所有权，Planner 不代删，下一棒 Executor 建锁时自然覆盖。
- **#212 程序违规留痕**（D-006 / §1.6）：Executor 自行关单、Issue 内无执行报告、标签未转 review、STATE 证据位置表述失实；Planner 已 reopen→修正标签→验收→关闭，审计轨迹恢复。下一棒 Executor 需注意：完工必须留执行报告评论、转 `status:review`、**不自行关单**。
- `.agent/ENV.md` 头部时间戳第 65 轮已刷新（10-10T04:20Z），无 cosmetic 欠项。

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

ready 队列空 ⇒ 预期零交付巡检轮：① 顺手处置 bot metrics PR（当前 #215，数据-only，schema 已兼容，合入后验 main ci-cd，diff 越出数据文件则停下报告）；② 10-17 前后优先配合 #199 到期决策（audit 主动变红属预期机制，按 D-011 显式续期）；③ 收尾务必遵守流程四件套：Issue 内留执行报告（§1.6 模板）、转 `status:review`、**不自行关单**（D-006）、提交 `.agent/` 变更并删 LOCK。
