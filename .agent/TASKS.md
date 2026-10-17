# TASKS — Issue 本地镜像（Planner 每轮整体重写；权威来源 = GitHub Issue）

> 最后同步：2026-10-17T12:4xZ（UTC，`date -u`；本地日期 2026-10-17）｜同步人：第 84 轮 Planner 整体重写｜核实基线 `main@fc57b55`（写入时 HEAD，与 origin 同步 0/0；主干 CI 按完整 head SHA：`88f42e9…`/`75ae26c…` 的 `CI/CD Pipeline` 均 success、0 失败）
> 权威来源 = GitHub Issue（`gh` 可用，本轮实测 token 有效、scopes 含 `repo`/`workflow`）。网络对 `api.github.com` 有间歇性 TLS/EOF 抖动，所有 gh 调用均需重试包裹。
> `ready` 标签在本仓不存在（沿用 D-013 映射）⇒ 队列状态以 **Issue 正文首行「队列状态：`ready`」+ `status:backlog`** 为准。

## 今日队列（给 Executor 的建议顺序）

| #    | 任务                                                               | 优先级 | 状态                           | 顺序理由                                                                                                                   |
| ---- | ------------------------------------------------------------------ | ------ | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| #249 | 复核 duration-budget 每周定时首轮（`schedule` 事件）真实结果并留痕 | P3     | ready（**开工条件未到**）      | **唯一在队任务**。⚠️ **`2026-10-19T03:23Z` 之前不要领取**——提前跑取不到 `event=schedule` 的 run。到点后按单内 4 条标准取证 |
| —    | （顺手项）bot metrics PR **#248** 处置                             | —      | 不建单（PLAN §2.2 常态触发器） | 今日 04:24Z 再生；`files=1` 数据-only 且 schema 逐键一致才合入，验合入后 main CI（完整 SHA 取数）+ 视数据变更重部署        |

> 顺序说明：第 84 轮为**验收 + 治理轮**（#242/#244 已验收关闭、队列重建）。今日真实可执行项只有顺手项 #248；**#249 到点（10-19）后再领**。不为凑 2–5 区间制造任务（PLAN 文件头纪律）。
> **勿合 PR #239**（rp `release 1.3.0` 属 minor，D-012 第 2 档随 Milestone 收尾合并，M3 due 2026-11-14）。

## 全部开放 Issue

| #    | 标题                                                             | 标签                                                          | 状态                                                                           | Milestone |
| ---- | ---------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------ | --------- |
| #249 | 复核 duration-budget 每周定时首轮（schedule 事件）真实结果并留痕 | P3/status:backlog/area:devops/area:quality/type:task/risk:low | ready（第 84 轮新建；**开工条件 = 2026-10-19T03:23Z 之后**）                   | M3        |
| #197 | 评估解锁 release-please Release PR 的 PR 级自助 CI               | P3/devops/dependencies/risk:medium/needs-info                 | needs-info（默认 C = 维持手工触发，用户 10-12 确认；信号触发型非饥饿）         | M3        |
| #101 | [Task] 恢复 CI 自动部署，消除单机 wrangler OAuth 单点            | P1/devops/task/risk:medium/blocked                            | blocked（**第 84 轮第十度**复核 Secrets 仍仅 `CODECOV_TOKEN`/`PROJECT_TOKEN`） | 不在 M3   |

## 本轮关闭（第 84 轮验收）

- **#242 真实触发 duration-budget 三条路径复核并修正样本表 null 渲染** —— 验收**通过**并关闭（`status:done`，验收评论 `6233882747`）。7 条标准逐条亲跑取证：三条 dispatch run（`38994214652` 默认未超标无单 / `38994266641` 降阈值真实开出 #246 带 `flaky` / `38994309084` 只追加评论 `6228404122`）、`--dry-run` `-s` 计数 = **0**、`?? 360`/`?? 90` 实存（17–18 行）、#246 = `closed/not_planned`、本地门禁亲跑全 0（431/40）、main `88f42e9…` CI **0 失败**、PR #245 = 17 pass/8 skip。**歧义处理 3（关闭 artifact #246）授权有效并追认**，据此**澄清 D-006**（例外限"Planner 单内书面授权 + 非任务类自动化报告单"）。报告无失实。
- **#244 移除未使用的 `@fullhuman/postcss-purgecss`，彻底消除 braces 公告并删除 audit 豁免条目** —— 验收**通过**并关闭（`status:done`，验收评论 `6233888841`）。8 条标准逐条亲跑：`pnpm why braces` **空** · `grep -rn fullhuman` **exit 1** · `entries: []` 无 braces/GHSA 字样 · `quality:audit` **零豁免 exit 0** · `audit-gate` **13/13** · `audit-level` 仍 `moderate`、`ci-cd.yml` 步骤未增删 · 本地门禁全 0（CSS 250.73KB/JS 219.38KB 与开工前同值）· main `75ae26c…` CI **0 失败**。**歧义处理 1（测试断言放宽）可接受并追认**。记录更正 1 处：PR #247 checks 实为 17 pass + 8 skipping（报告写 16+9，0 fail 不变）。**M3 计数 → 13 closed / 2 open（#249/#197）。**
- **D-018/D-019 记账完成**：#244 落地 ⇒ `2026-10-31` 硬墙与 A/B/C 提问路径**消解**，DECISIONS.md 已双向更新（D-018「提问路径已消解」/ D-019「条件已满足生效」）。

## 开放 PR（非任务，供处置参考）

| #    | 标题                                               | 性质                         | 处置口径                                                                                                                       |
| ---- | -------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| #248 | `chore(metrics): update project progress snapshot` | bot 按日再生（10-17 04:24Z） | **Executor 顺手处置**（PLAN §2.2）：实测 `files=1` 且 schema 与 main 逐键一致才合入 → 验 main CI（完整 SHA）→ 视数据变更重部署 |
| #239 | `chore(main): release 1.3.0`                       | release-please               | **保持 open 不合并**：D-012 第 2 档「minor 随 Milestone 收尾合并」（M3 due 2026-11-14）                                        |
| #209 | `chore(deps): bump the majors group`               | dependabot (npm)             | 暂缓（D-015）                                                                                                                  |
| #186 | `chore(deps): bump the majors group`               | dependabot (actions)         | 暂缓（D-015）                                                                                                                  |

## 环境信号（需 Executor 注意）

1. **`gh api actions/secrets` 不带 repo 路径返回 404**（第 84 轮实测）——须用 `gh api repos/<owner>/<repo>/actions/secrets`；404 ≠「无 secrets」也 ≠「无权限」，勿据此误判 #101 状态。
2. **CI 计数口径**：`gh run list` 默认只回 20 条且不按 commit 过滤；REST `head_sha=` **只认完整 SHA**（短 SHA 返回空列表）。「某 commit 全绿」断言必须 `gh api "…/actions/runs?head_sha=<full-sha>"` 或 `--commit`。
3. **`gh issue list --search "[x] in:title"` 非字面匹配**（方括号被当查询语法忽略）：`[duration-budget]` 前缀单的计数须用 `gh api '…/issues?state=all&per_page=100'` + `startswith()`。
4. **`check-duration-budget.mjs --dry-run` 的 `-s` 计数与 P95 数值随采样窗口漂移**（历史：6→2→1→0）：判据用「当轮计数 = 0 + 同窗口 A/B」，勿与历史绝对值比对。
5. **`wsyhuat` fetch 间歇失败**：必须重试后才下「无新工作」结论；第 84 轮复核 `f98be0d` 触及路径内容级 `git diff --stat` = 空（已吸收）。
6. **audit 门禁现为零豁免 100% 严格**（#244 后）：任何新 moderate+ 公告会直接让 `Audit Dependencies` 变红——这是**目标状态**，处置路线见 D-019/D-011/D-018，回滚 `git revert 75ae26c`。
