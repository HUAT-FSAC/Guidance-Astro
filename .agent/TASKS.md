# TASKS — Issue 本地镜像（Planner 每轮整体重写；权威来源 = GitHub Issue）

> 最后同步：2026-10-16T14:12Z（UTC，`date -u`）｜同步人：第 81 轮 Planner 段整体重写 + 执行段按契约 1.6 定向同步 #199 行｜HEAD `478777d`
> 权威来源 = GitHub Issue（`gh` 可用，本轮实测 token 有效、scopes 含 `repo`/`workflow`）。网络对 `api.github.com` 有间歇性 TLS/EOF 抖动，所有 gh 调用均需重试包裹。
> `ready` 标签在本仓不存在（ENV §5）⇒ 队列状态以 **Issue 正文首行「队列状态：`ready`」+ `status:backlog`** 为准。

## 今日队列（给 Executor 的建议顺序）

| #    | 任务                                                       | 优先级 | 状态  | 顺序理由                                             |
| ---- | ---------------------------------------------------------- | ------ | ----- | ---------------------------------------------------- |
| #242 | 真实触发 duration-budget 三条路径复核 + 修样本表 null 渲染 | P3     | ready | **死线 2026-10-19T03:23Z**：每周定时首轮之前必须完成 |

> **#199 已于同轮交付并转 `status:review`**（PR #243 squash 合入 `478777d`，main CI 实测 13 success / 7 skipped / 0 失败；执行报告已留 Issue，**未自行关单**，遵守 D-006）。今日队列因此只剩 #242 一项。
> ⚠️ #199 由 Planning Agent 经用户授权**临时切换执行角色**完成，写验收标准与执行发生在同一上下文 ⇒ 下一轮验收须**独立取证、勿只读报告**（可复现判据都在 Issue 评论里）。
> 另需顺手处置 bot metrics PR **#241**；**勿合 PR #239**（rp `release 1.3.0` 属 minor，D-012 第 2 档随 Milestone 收尾合并，M3 due 2026-11-14）。

## 全部开放 Issue

| #    | 标题                                                  | 标签                                          | 状态                                                   |
| ---- | ----------------------------------------------------- | --------------------------------------------- | ------------------------------------------------------ |
| #242 | 真实触发 duration-budget 三条路径复核并修正 null 渲染 | P3/quality/devops/task                        | ready（第 81 轮新建）                                  |
| #199 | 核对 braces audit 豁免并按 D-011 做显式决策           | P2/quality/devops/task/risk:medium            | **in-review**（`478777d` 在主干，待 Planner 独立验收） |
| #197 | 评估解锁 release-please Release PR 的 PR 级自助 CI    | P3/devops/dependencies/risk:medium/needs-info | needs-info（默认 C = 维持手工触发，用户 10-12 确认）   |
| #101 | 恢复 CI 自动部署，消除单机 wrangler OAuth 单点        | P1/devops/task/risk:medium/blocked            | blocked（待人类配 `CLOUDFLARE_API_TOKEN`）             |

## 已关闭（本轮相关）

- **#228 Flaky 治理** —— 第 81 轮验收**通过**并关闭。三条标准全部独立取证：`gh pr checks 236` 实测 Quality Gate SUCCESS + Report flaky candidate SKIPPED；#237 由 `github-actions[bot]` 真实开出且带 `flaky` 标签；`stale.yml` 的 `exempt-issue-labels` 含 `flaky`。代码在主干 `29b33ad`。
- **#229 时长预算告警** —— 第 81 轮验收**通过**并关闭。Planner 亲跑 dry-run（exit 0 · P95 299s<360s 未超标）+ 亲跑 env 降阈值（两指标均超标，双向证据独立复现）+ 亲解析 YAML（cron `23 3 * * 1` + `workflow_dispatch` + `issues: write`）。代码在主干 `747f059`，main run `38759566750` success。遗留风险已转 #242，不再空挂在风险清单里。

## 开放 PR（非任务，供处置参考）

| #    | 标题                                               | 性质                      | 处置口径                                                                                                      |
| ---- | -------------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------- |
| #241 | `chore(metrics): update project progress snapshot` | bot 按日再生（今 04:30Z） | **Executor 顺手处置**（PLAN §2.2 常态触发器）：单文件 + schema 逐键比对 + 合入后验 main CI + 视数据变更重部署 |
| #239 | `chore(main): release 1.3.0`                       | release-please            | **保持 open 不合并**：D-012 规定 minor 随 Milestone 收尾合并（M3 due 2026-11-14）                             |
| #209 | `chore(deps): bump the majors group`               | dependabot (npm)          | 暂缓（D-015）                                                                                                 |
| #186 | `chore(deps): bump the majors group`               | dependabot (actions)      | 暂缓（D-015）                                                                                                 |

## 环境信号（需 Executor 注意）

1. **ENV §5 标签表已过期**：该节称 `blocked` / `needs-info` 标签「不存在」、`priority:p4` 缺失，但本轮 `gh api labels` 实测三者**均已在仓库存在**（#199/#101 正带 `blocked`、#197 正带 `needs-info`）。ENV 属 Executor 所有权，Planner 不代改，请下一棒修正该表。
2. **`wsyhuat` fetch 间歇失败**：本轮首拉报 `GnuTLS recv error (-110)`，重试第 1 次即成功。inbound 巡检必须**重试后**才能下「无新工作」结论，不得把 fetch 失败当成无新工作。
3. **`.agent/LOCK` 已于第 81 轮删除**（用户授权「建议删除就删除吧」）：删除前内容为 `{"owner":"executor-codebuddy-glm-20261015","acquired_at":"2026-10-15T05:05Z","issue":228,"heartbeat_at":"2026-10-15T05:05Z"}`（心跳过期约 2 天，#228 已关闭），未被 git 跟踪 ⇒ 删除不产生任何 diff。故 STATE.md 第 80 轮「LOCK：本轮收尾删除」与实际不符——属无代码影响的记录笔误，不追罚，但下一棒请以 `ls .agent/LOCK` 为准、不要以 STATE 自述为准。**当前已无 LOCK，下一轮无需再处理**；按契约 1.2 本流程不设锁，今后若再现残留同样按此口径处置。
