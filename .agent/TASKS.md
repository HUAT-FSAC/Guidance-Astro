# TASKS — Issue 本地镜像（Planner 每轮整体重写；权威来源 = GitHub Issue）

> 最后同步：2026-10-19T15:4xZ（UTC，`date -u`；本地日期 2026-10-19）｜同步人：**第 93 轮 Planner 整体重写**（禁增量打补丁）｜核实基线 `main@74a3f9e`（第 92 轮 `.agent` 收尾提交；与 origin 同步 `0/0`）；最近代码 SHA `1a3b688`（bot PR #252 数据快照）。**本轮新鲜取证**：HEAD 完整 SHA `1a3b68897831e256dbddf99b9ea0b07282ca6305` 的 `CI/CD Pipeline` / `Secret Scan` / `Release Please` 三连 **success**；`branch=main` 最近 40 条 run **无 `failure`/`cancelled`**；`wrangler deployments list` 按 `created_on` 降序取最新确认 Version **`33724813-82eb-4baa-9d1c-2d0d1d6d4d03`**@`2026-10-19T05:27:05Z`（100%）；线上 `/` HTTP/2 **200** + **单请求** CSP 头/体 nonce 一致（`Kvv2tXynVPe1yw4IX4MLhg`）
> 权威来源 = GitHub Issue（`gh` 可用，本轮实测 token 有效）。网络对 `api.github.com` 有间歇性 TLS/EOF 抖动，所有 gh 调用均需重试包裹（本轮 `wsyhuat` fetch 与全部 `gh api` 均一次通过）。
> `ready` 标签在本仓不存在（沿用 D-013 映射）⇒ 队列状态以 **Issue 正文首行「队列状态：`ready`」+ `status:backlog`** 为准。

## 今日队列（给 Executor 的建议顺序）

| #    | 任务                                                               | 优先级 | 状态                                                                                | 顺序理由                                                                                                                                                                                                                                                                                                                     |
| ---- | ------------------------------------------------------------------ | ------ | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #249 | 复核 duration-budget 每周定时首轮（`schedule` 事件）真实结果并留痕 | P3     | **ready**（排障完成：真实 run `39227547586` 已于 09:06Z 调度并 exit 0；待领单取证） | **今日唯一可开工单**。第 91 轮 Executor 到点 03:23Z 无 schedule run 时如实留痕转 blocked 并分析系统延迟；第 93 轮新鲜探测证实真实 run `39227547586`（`event=schedule`）已于 09:06Z 跑出（exit 0），外部阻塞消除；Planner 已移去 `blocked` 标签置回 `ready`，待 Executor 提取日志原文、核验单数并留执行报告转 `status:review` |

> **顺序说明**：第 93 轮为**验收顺手项 + 外部排障 + 队列维持轮**。第 92 轮顺手项 #252 已由本轮独立验收通过关闭；今日可开工 = **1**（#249）；按 PLAN 文件头纪律，**不为凑 2–5 区间制造任务**。
> **今日常态顺手项（不建单）**：#252 已处置出列，当前无开放 bot PR；下一个预期明日（10-20）`04:3xZ` 再生。
> **#251 今日勿领（前置未满足）**：M3 收口发版单，须等 **#249 由 Planner 验收关闭 + M3 `open_issues=0`**（实测现 `open=1`）。下轮由 Planner 显式关闭 M3 后解除前置并改写首行为 `ready`。
> **勿合 PR #239**：rp `release 1.3.0`（minor，实测 `files=2`、`mergeable=MERGEABLE`）。按 **D-020** 合并触发条件 = **M3 `open_issues` 归零 + Planner 显式关闭**，**不是** `due_on=2026-11-14`、也不是 CI 全绿；在 #251 转 `ready` 前一律不动。

## 上轮验收（第 93 轮 Planner 独立核对，未采信报告文字）

- **验收第 92 轮顺手项 #252（bot metrics PR）——通过，报告无失实**（五项证据独立取证）：
    1. `git show --stat 1a3b688` 确认 `files=1`（`src/data/metrics/project-progress.json` 38+/38-）；
    2. 递归提取 JSON 52 个标量与对象键路径，与变更前前后 0 差异（结构恒等，纯值漂移）；
    3. 完整 SHA `1a3b68897831e256dbddf99b9ea0b07282ca6305` 的 3 个 workflow 全部 success（CI/CD Pipeline run 39204563583、Secret Scan run 39204563672、Release Please run 39204563628，0 失败）；
    4. `wrangler deployments list` 按 `created_on` 降序取最新确认 Version `33724813-82eb-4baa-9d1c-2d0d1d6d4d03`（2026-10-19T05:27:05Z）；
    5. 线上单请求（`curl -D h -o b`）CSP 头/体 nonce 逐字一致（`Kvv2tXynVPe1yw4IX4MLhg`）；中英进度看板页 200 且渲染新快照 `2026/10/19 04:39:00`。
- **复核第 91 轮 #249 执行报告——真实合规，外部排障完成**：
    1. 第 91 轮 Executor 到点 03:23Z 严格按照测试要求，查无 schedule run 时如实留执行报告于评论 `6258993095` 并转 `blocked`，未以本地 dry-run 假充 schedule 日志，排查早间 4~6h 系统延迟分析准确；
    2. 第 93 轮新鲜探测：`event=schedule` 的 duration-budget 定时 run **`39227547586`** 已于 `2026-10-19T09:06:16Z` 调度并 exit 0 成功完成（耗时 41s，延迟 5h43m 吻合预期）；
    3. Planner 已在 Issue 内追加排障评论 `6271230749`，移除 `blocked` 标签，恢复为 `ready` 放入今日队列。
- **第 90 轮登记的 13 条环境信号沿用有效**（其中第 13 条部署版本过期已由第 92 轮更新修复）。

## 全部开放 Issue

| #    | 标题                                                                 | 标签                                                          | 状态                                                                                  | Milestone                                          |
| ---- | -------------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------- |
| #249 | 复核 duration-budget 每周定时首轮（schedule 事件）真实结果并留痕     | P3/status:backlog/area:devops/area:quality/type:task/risk:low | **ready**（排障完成：真实 run `39227547586` 已 exit 0；待领单取证转 status:review）   | M3                                                 |
| #251 | 按 D-012 在 M3 收口点合并 Release PR #239 发布 v1.3.0 并完成四方核验 | P3/status:backlog/area:devops/type:task/risk:medium           | **backlog（前置未满足，勿领）**：需 #249 验收关闭 + M3 `open_issues=0`（现 `open=1`） | 无（刻意的收口单，不占 M3 `open` 计数）            |
| #197 | 评估解锁 release-please Release PR 的 PR 级自助 CI                   | P3/devops/dependencies/risk:medium/needs-info                 | needs-info（默认 C = 维持手工触发，用户 10-12 确认；信号触发型非饥饿）                | **无**（第 90 轮按 D-020 第 3 条迁出，议题未放弃） |
| #101 | [Task] 恢复 CI 自动部署，消除单机 wrangler OAuth 单点                | P1/devops/task/risk:medium/blocked                            | blocked（第 93 轮再次复核 Secrets 仍仅 `CODECOV_TOKEN`/`PROJECT_TOKEN`）              | 不在 M3                                            |

> **M3 计数实测**（第 93 轮）：`open=1`（仅 #249）/ `closed=13` / `state=open` / `due_on=2026-11-14`。

## 开放 PR（非任务，供处置参考）

| #    | 标题                                                          | 性质                 | 处置口径                                                                                                |
| ---- | ------------------------------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------- |
| #239 | `chore(main): release 1.3.0`                                  | release-please       | **保持 open 不合并**：触发条件 = M3 `open_issues` 归零（D-020），非日历、非 CI 绿；由 #251 在收口点执行 |
| #209 | `chore(deps): bump the majors group across 1 directory with…` | dependabot (npm)     | 暂缓（D-015）；今日 `01:05Z` 被 force-update                                                            |
| #186 | `chore(deps): bump the majors group across 1 directory with…` | dependabot (actions) | 暂缓（D-015）；今日 `01:12Z` 被 force-update                                                            |

> 开放 PR 共 **3** 张（#239 + majors 2）。#252 已于第 92 轮 squash 合入出列。当前无开放 bot PR。

## 环境信号（需 Executor 注意）

1. **`gh api actions/secrets` 不带 repo 路径返回 404**（第 84 轮实测）——须用 `gh api repos/<owner>/<repo>/actions/secrets`；404 ≠「无 secrets」也 ≠「无权限」，勿据此误判 #101 状态。
2. **CI 计数口径**：`gh run list` 默认只回 20 条且不按 commit 过滤；REST `head_sha=` **只认完整 SHA**（短 SHA 返回空列表）。「某 commit 全绿」断言必须 `gh api "…/actions/runs?head_sha=<full-sha>"` 或 `--commit`。
3. **`gh issue list --search "[x] in:title"` 非字面匹配**（方括号被当查询语法忽略）：`[duration-budget]` 前缀单的计数须用 `gh api '…/issues?state=all&per_page=100'` + `startswith()`。
4. **`check-duration-budget.mjs --dry-run` 的 `-s` 计数与 P95 数值随采样窗口漂移**（历史：6→2→1→0）：判据用「当轮计数 = 0 + 同窗口 A/B」，勿与历史绝对值比对。
5. **`wsyhuat` fetch 间歇失败**：必须重试后才下「无新工作」结论；本轮 `wsyhuat/main` 仍 `f98be0d`（2026-10-02，与第 82–89 轮 SHA 逐轮相同 ⇒ 树内容恒等、已吸收），`git diff --stat main wsyhuat/main` 的 **91 files 系 main 自身领先量**，勿误读为 inbound 新工作。
6. **audit 门禁现为零豁免 100% 严格**（#244 后）：任何新 moderate+ 公告会直接让 `Audit Dependencies` 变红——这是**目标状态**，处置路线见 D-019/D-011/D-018，回滚 `git revert 75ae26c`。
7. **部署版本核验**：`wrangler deployments list --name huat-fsac --json` **返回未按时间排序**，须自行按 `created_on` 降序取最新（本轮实测最新 = `33724813`）；OAuth 已登录 `zcw85590@gmail.com`，缺 `k2.read/write` scope 的告警是无害的（ENV §3）。
8. **#249 到点判据**：`event=schedule` 的 duration-budget run 在 `2026-10-19T03:23Z` 之后存在系统性 4~6h 排队延迟（第 91 轮已分析证实）；本轮已实测 run `39227547586` exit 0 完成。
9. **CSP nonce 比对必须单请求取样 + 剥 `nonce-` 前缀**：`curl -D h.txt -o b.html` 一次请求；头里 `script-src` 的 `'nonce-XXX'` 与体里 `nonce="XXX"` 比对须去掉 `nonce-` 前缀（字面串 `content-security-policy: nonce-` 永不出现，见 AGENTS.md / D-001）。分两次 curl 必然不一致。
10. **看板页真实路径**：渲染「数据更新时间」的是**项目进度看板** `…/docs-center/运营与协作/项目进度看板/`（zh，URL 需百分号编码）与 `…/en/docs-center/operations-and-collaboration/project-progress-board/`（en，第 85 轮实测 en 段保留中文）；`/showcase-dashboard/` 是「展示实验室」，**不含** metrics 快照，勿用它验收看板数据。
11. **⚠️ Actions 取数的 `workflow_id=` 不会过滤**（第 90 轮实测）：`gh api "…/actions/runs?workflow_id=duration-budget"` 返回的是**全仓** run（`total_count=1286`，混入 Collaboration Notifications 等），极易误判成「已有 schedule run」。正确做法：先 `gh api …/actions/workflows` 拿数字 id（duration-budget = **`385699809`**，Collect Project Metrics = `238631749`），再 `…/actions/workflows/<id>/runs[?event=schedule]`。
12. **⚠️ API 字段存在性判据**（第 90 轮，源自被纠正的失实记录）：**jq 对不存在的键渲染 `null`** ⇒ `--jq '.due_date'` 得到 `null` **不能**证明字段无值。REST milestone 的真实键是 **`due_on`**（GraphQL 为 `dueOn`）。断言任何字段为空之前，先 `--jq 'keys'` 或读原始 JSON 确认真实键名；跨源比对（REST vs GraphQL）才算证据。
13. **部署版本已更新**（第 92 轮已将 `ENV.md §3` 第 65 行更新为 Version `33724813-82eb-4baa-9d1c-2d0d1d6d4d03`，三方记录一致）。
