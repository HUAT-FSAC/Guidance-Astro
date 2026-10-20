# PLAN — 项目路线图（Planning Agent 唯一写入点）

> **本文件回答：** 项目现在处于哪个阶段 / 当前 Milestone 要做什么、为什么 / 什么算完成 / 现在有哪些任务、哪些完成、哪些阻塞 / 下一阶段是什么 / 哪些方向已明确放弃。
> **纪律：** 只写**已核实的事实**与**真实方向**。「未来可能做」不得写成「当前正在做」；旧计划写过的目标不因被写过就仍是事实。**不为填队列制造任务。**
> **配套文件：** 长期约束读 `.agent/DECISIONS.md`（D-001..D-020，权威定义）；机器现状读 `.agent/STATE.md`；接力上下文读 `.agent/HANDOFF.md`。
> ⏱ 所有 `.agent` 时间字段一律 `date -u` 的 **UTC**（exec 第 37 轮纠正，勿混用本地时区）。

**最后核实：** 2026-10-20T17:00Z（`date -u`；本地日期 2026-10-21）｜**核实基线：** `main@39231f3`（第 97 轮 `.agent` 收尾提交；与 origin 同步 0/0）｜最近代码 SHA `db31f6f`（rp Release PR #239 发版 `1.3.0`）与 `8d0d75a`（bot PR #253 metrics 快照）｜**核实人：** Planning Agent 第 98 轮（输入 = 仓库现场 + Issue/PR/CI/部署/线上真实状态；`gh` token 实测有效）

> **第 98 轮判定：** ① **无新执行轮次可验收**——第 97 轮（2026-10-20T13:39Z）关闭 #251 后至今无 Execution 产出、无新 `status:review`；复核 #251 仍为 `CLOSED/COMPLETED` + `status:done`，M3 保持 `closed`，`v1.3.0` 仍为 Latest。② **稳态全绿**：HEAD `39231f3f1a1abb7b2cbe225c0696800dbe67862a` 完整 SHA 的 `CI/CD Pipeline` / `Secret Scan` / `Release Please` 三连 success；近 30 run 唯一 failure 为暂缓的 dependabot majors PR 分支（#209，`Lint and Format`），main 无红；OpenWiki 定时更新 success；dependabot / secret-scanning 开放告警均为 0。③ **线上在位**：`/` HTTP 200，单请求 CSP 头/体 nonce 逐字一致（`bs1Gq0lSmO-u_b_fck8paQ`）；zh 看板页 200 渲染快照 `2026/10/20 04:49:14`；最新 deployment `2c488529…` 的 `version_id` 仍为 `35127731-f8db-4910-832a-dac8eb5ee098`（100%）。④ **inbound 无新工作**：`wsyhuat/main` 仍 `f98be0d`，按其改动路径对 main 做内容级 diff 为 0（WORKFLOW §1.6 终判）；`d89b87e` 为更早的已吸收合并提交。⑤ **常驻项不变**：#101 复核 Actions Secrets 仍仅 `CODECOV_TOKEN` / `PROJECT_TOKEN` ⇒ 保持 blocked；#197 维持 needs-info 默认 C；开放 PR 仅 majors #186/#209（D-015 暂缓），无开放 bot PR。⑥ **今日执行队列 = 0（诚实空置）**：无新工作束，M4 继续不创建；下一预期事件为 bot metrics PR 于 **2026-10-21T04:3xZ（UTC）** 前后再生，按常态指令处置。⑦ **流程欠账修复**：第 97 轮漏记 `docs/WORKFLOW.md §7.4`，本轮补记；`STATE.md` / `HANDOFF.md` 仍停留在第 96 轮口径（称「待 Planner 验收 #251」），已列为下一轮 Executor 开工必做项。

> **第 97 轮判定：** ① **独立验收 #251 通过并关闭（报告失实 0 处）**——未采信报告文字，八项标准逐条亲跑复核：`milestones/2` 实测 `open=0 state=closed`；`gh pr view 239` 确认 `state=MERGED`、`mergeCommit=db31f6fcd4593f6a56ba6c17c96ba7ee4129d85b`；`gh release list` 首位 `v1.3.0 Latest`、`releases/latest` 确认 `prerelease=false/draft=false`；`git tag -l v1.3.0` 确切命中；`package.json:4` `"version": "1.3.0"`；`CHANGELOG.md:8` 命中 `## [1.3.0]`；`git merge-base --is-ancestor 8d0d75a v1.3.0` 与对 `af74ecd` 均 exit 0；`git show --stat db31f6f` 确认 files=2（14+/1-）；完整 SHA `db31f6f…` CI 三连 success（Pipeline 39413404149 / Secret Scan 39413404323 / Release Please 39413404110）；部署 Version `35127731-f8db-4910-832a-dac8eb5ee098` 实测生效；线上单请求 CSP 头/体 nonce 逐字比对均为 `6FHoAPl_aG7Dn01nC4kLUQ`（matches=true）；中英看板页 200 正常渲染 `2026/10/20 04:49:14`。② **独立核验顺手项 #253**：files=1（29+/29-），44 路径 0 差异，squash 合入 `8d0d75a`，完整 SHA CI 三连 success，已随 Version `35127731` 部署上线。③ **D-020 与 M3 全面闭环**：收口、发版与部署全套完成；#251 已打 `status:done` 标签并显式关闭。④ **M4 暂不创建**：当前无待排期需求，避免空 Milestone 占位；#197（needs-info，默认 C）与 #101（blocked，待人类 Secret）维持常驻；开放 PR 仅剩 majors 2 张（暂缓）。⑤ **今日执行队列 = 0（诚实空置）**：按纪律不为填 2–5 区间制造任务。

> **第 95 轮判定：** ① **独立验收 #249 通过并关闭（报告失实 0 处）**——未采信报告文字，四项标准逐条亲跑：`actions/runs/39227547586` 实测 `event=schedule` / `completed` / `success` / `2026-10-19T09:06:16Z` / `workflow_id=385699809`；job `117977412637` 日志实取「阈值 360s/90s、Quality P95=220s 未超标、E2E 24s 未超标、结论: 未超标」四行原文逐字一致；REST 全量 `startswith("[duration-budget]")` 过滤 `count=1`（仅已关 #246，comments=2 未增）；组合分支 #2 执行报告如实写「未覆盖」及原因。② **D-020 收口判据首次实际执行完成**：#249 关闭后 M3 `open_issues` **1→0**（closed=14），Planner 于 **2026-10-19T17:24:43Z** 将 Milestone #2 显式置 `state=closed`；**#251 正文首行已改写为 `ready`**（前置书面证据 = `open=0 state=closed`），今日执行队列 = **1（#251）**。③ **M4 暂不创建**：当前无需要承接的 ready/backlog 工作；#197（needs-info/默认 C）与 #101（blocked/待人类 Secret）按 D-020 第 3 条不进入 Milestone 的 `open` 计数；待发版后出现真实工作束再按内容开新 Milestone。

> **第 93 轮判定：** ① **独立验收第 92 轮顺手项 #252（bot metrics PR）——通过，报告无失实**（逐项亲跑复核）：`git show --stat 1a3b688` 确认 `files=1`（`src/data/metrics/project-progress.json` 38+/38-）；递归对比 52 个 JSON 键路径完全一致（0 结构差异，纯值漂移）；完整 SHA `1a3b68897831e256dbddf99b9ea0b07282ca6305` 的 3 个 workflow 全 success（CI/CD Pipeline run 39204563583、Secret Scan run 39204563672、Release Please run 39204563628）；`wrangler deployments list` 按 `created_on` 降序取最新确认 Version `33724813-82eb-4baa-9d1c-2d0d1d6d4d03`（2026-10-19T05:27:05Z）；线上单请求（`curl -D -o`）CSP 头/体 nonce 逐字一致（`Kvv2tXynVPe1yw4IX4MLhg`）；中英看板页 200 且数据渲染 `2026/10/19 04:39:00`。② **#249 排障完成，恢复 `ready` 放入今日队列**：第 91 轮 Executor 到点 03:23Z 无 schedule run 时如实报告转 `blocked`，并分析早间 4~6h 系统排队延迟，报告失实 = 0。

## 一、当前方向

M3 稳态运营与 `v1.3.0` 发版工作已于 **2026-10-20 全面闭环**：

- Milestone #2（M3 稳态运营）已于 2026-10-19T17:24:43Z 关闭；
- Release PR #239 已于 2026-10-20T11:13:18Z 合并，生成 GitHub Release `v1.3.0` 与 tag `v1.3.0`；
- 线上站点（`huat-fsac.eu.org`）已部署 Version `35127731-f8db-4910-832a-dac8eb5ee098`，四方版本与最新看板快照（`2026/10/20 04:49:14`）全部在位；
- 核心收口发版单 **#251 独立验收通过并关闭**。

当前项目处于**稳态开放期**（第 98 轮复核无新增工作）：

- **今日执行队列 = 0（诚实空置）**：当前无挂起缺陷、无破坏性变更、无待开工任务；
- **M4 暂不创建**：常驻单（#197 / #101）按 D-020 第 3 条不占 Milestone 计数；待未来出现需要系统排期的真实工作束（新功能需求 / 架构治理任务）再根据具体内容创建 M4；
- 方向层仍由 **D-017** 维持稳态（用户 2026-10-08 选 A）；braces/audit 豁免链条已永久收敛（D-019 / #244）；
- **下一预期事件**：bot metrics PR 于 **2026-10-21T04:3xZ（UTC）** 前后再生；Executor 按常态指令处置，不单独建单。

## 二、当前 Milestone：无（M3 已收口；M4 暂不创建）

- **Milestone #2（M3 稳态运营）** 已关闭：`open_issues=0` / `closed_issues=14` / `state=closed` / `closed_at=2026-10-19T17:24:43Z`。
- **Milestone #1（M2 稳态防复发）** 已关闭：`open_issues=0` / `closed_issues=5` / `state=closed`。
- **当前无开放 Milestone**。

### 2.1 收口与发版结果（已全部达成）

1. #249 验收通过关闭：duration-budget 每周定时首轮 schedule 真实运行验证成功。
2. M3 `open_issues` 归零，Milestone #2 显式关闭。
3. #251 验收通过关闭：合并 Release PR #239，完成 `v1.3.0` 发版四方核验与祖先判定，完成生产 Worker 部署与同请求 CSP nonce 验收。
4. 常态顺手项 #253 合入 `8d0d75a`，数据看板同步上线。

### 2.2 执行队列（第 98 轮：今日可开工 Issue = 0，诚实空置）

（无 ready 任务。维持真实状态，不为凑 2–5 区间制造任务。）

> **今日常态顺手项**：当前无开放 bot PR（#253 已处置合入）；下一张预期 **2026-10-21T04:3xZ（UTC）** 再生，届时由 Executor 按长期指令处置（schema 逐键一致 → 合入 → 完整 SHA CI → 视数据变更部署），不单独建单。
> **勿合 majors #186/#209**（D-015 暂缓）。**#101 保持 blocked**（第 98 轮复核 Secrets 仍仅 `CODECOV_TOKEN`/`PROJECT_TOKEN`）。
> **下一轮开工先做**：刷新 `STATE.md` / `HANDOFF.md` 至第 97/98 轮后的现实（#251 已关闭、M3 收官、队列空），并在 `docs/WORKFLOW.md §7.4` 追加本轮执行日志。

### 2.3 已知阻塞与依赖

| 项                                      | 状态                              | 需要谁         | 说明                                                                                                                                                                                    |
| --------------------------------------- | --------------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **#101** CI 自动部署                    | `blocked`（P1）                   | **人类**       | 第 98 轮复核 Actions Secrets 仍仅 `CODECOV_TOKEN`/`PROJECT_TOKEN`；本地 OAuth 部署可用，不阻塞交付。⚠️ `gh api actions/secrets` 不带 repo 路径返回 404，勿误判。                        |
| **#197** rp Release PR 自助 CI          | `needs-info`（P3，无 milestone）  | 默认 C（不改） | 信号触发型常驻项；用户 2026-10-12 已确认维持手工触发；等发版频率信号或人类意愿。按 D-020 第 3 条不入任何 Milestone。                                                                    |
| bot metrics 快照（bot 按日再生）        | 常态处置（**当前无开放 bot PR**） | **Executor**   | #215/#216/#217/#226/#232/#238/#241/#248/#250/#252/#253 均已处置合入；下一张预期 `2026-10-21T04:3xZ` 再生。不建单，确认 diff 仅 `project-progress.json` 值漂移且 schema 逐键一致后合入。 |
| **D-017** Q4 方向（是否启动新功能）     | **已裁定 A**（2026-10-08）        | —              | 维持稳态；无新功能启动。                                                                                                                                                                |
| #186/#209 majors PR                     | 暂缓（D-015）                     | —              | standing reminder，占额度 2/10，不阻塞 minor-and-patch。                                                                                                                                |
| `size:xs` / `update-linked-issues` 权限 | 仓库设置                          | 人类（可选）   | 补 `issues: write` 扩大 `pull_request_target` 权限面 / 无失败实证，Agent 不擅动（维持既有结论）。                                                                                       |

### 2.4 卫生备注（非任务，不建 Issue）

- **M4 决策留痕**：暂不创建。M4 内容不预设，避免空 Milestone 或常驻单再次占住收口计数（D-020 第 3 条）。
- **分支卫生（第 98 轮实测）**：本地 36 条、origin 45 条（含 main），绝大多数为 2026-09-30～10-14 的历史分支；`origin/agent/issue-228-flaky` 对应已关闭 #228，属陈旧残留。没有活跃开发分支；清理涉及远程删除，按 Git 纪律需人类确认，本轮不排期、不建单。
- **`.agent/LOCK`：不存在**（契约 §1.2 约定不设锁）。
- **CI 计数口径纪律**：「某 commit 全绿」必须用完整 SHA 的 `actions/runs?head_sha=` 取数；`gh run list` 默认只回 20 条。
- **部署版本记录口径**：`wrangler deployments list` 的 `id` 是 deployment ID，不是 version ID；最新 deployment `2c488529-411d-4d5f-91d3-5c81d259b692` 的 `versions[0].version_id` = `35127731-f8db-4910-832a-dac8eb5ee098`（100%），线上即为该版本。OAuth 可用。
- **流程欠账（第 98 轮）**：第 97 轮漏记 `docs/WORKFLOW.md §7.4`，本轮已补；`STATE.md` / `HANDOFF.md` 仍为第 96 轮口径，待下一轮 Executor 刷新。

## 三、下一阶段

`v1.3.0` 发版完成后，项目处于开放式稳态循环：依赖摄入（D-014/D-015）、发版节奏（D-012）、定时质量机制（duration-budget）继续运转。**M4 暂不创建**——只有当出现需要排期的新工作束（新功能需求 / 多项工程治理任务）时，才按其真实内容开下一个 Milestone；常驻观察项（#197 / #101）不进入任何 Milestone 的 `open` 计数（D-020 第 3 条）。

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

（当前 pending = 0；D-001..D-020 全部生效。）

## 六、给 Executor 的指令

**今日队列诚实空置（可开工 Issue = 0）**。下一轮开工先刷新 `STATE.md` / `HANDOFF.md`（#251 已关闭、M3 收官、队列空），并在 `docs/WORKFLOW.md §7.4` 追加执行轮日志。若 2026-10-21T04:3xZ（UTC）后再生 bot metrics PR，按常态指令处置（schema 逐键一致 → 合入 → 完整 SHA CI → 视数据变更部署）；勿合 majors #186/#209；#101 维持 blocked。
