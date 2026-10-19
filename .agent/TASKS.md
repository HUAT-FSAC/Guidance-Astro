# TASKS — Issue 本地镜像（Planner 每轮整体重写；权威来源 = GitHub Issue）

> 最后同步：2026-10-19T02:5xZ（UTC，`date -u`；本地日期 2026-10-19）｜同步人：**第 90 轮 Planner 整体重写**（禁增量打补丁）｜核实基线 `main@a5beb23`（第 89 轮 `.agent` 收尾提交，docs-only；与 origin 同步 `0/0`）；最近代码 SHA `f72c35b`（bot PR #250 数据快照）。**本轮新鲜取证**：HEAD 完整 SHA `a5beb2310a36924b24ba52e7d337a947860627b3` 的 `CI/CD Pipeline` / `Secret Scan` / `Release Please` 三连 **success**；`branch=main` 最近 40 条 run **无 `failure`/`cancelled`**；`wrangler deployments list` 最新 = **`e3e0e0b2-270f-4fca-ace8-2d947fb3f9c2`**@`2026-10-18T11:25:45Z`（100%）；线上 `/` HTTP/2 **200** + **单请求** CSP 头/体 nonce 一致（`NEH-0mdVXcsxIn66nhT5SQ`）
> 权威来源 = GitHub Issue（`gh` 可用，本轮实测 token 有效）。网络对 `api.github.com` 有间歇性 TLS/EOF 抖动，所有 gh 调用均需重试包裹（本轮 `wsyhuat` fetch 与全部 `gh api` 均一次通过）。
> `ready` 标签在本仓不存在（沿用 D-013 映射）⇒ 队列状态以 **Issue 正文首行「队列状态：`ready`」+ `status:backlog`** 为准。

## 今日队列（给 Executor 的建议顺序）

| #    | 任务                                                               | 优先级 | 状态                                                                                          | 顺序理由                                                                                                                                                                                                                                                       |
| ---- | ------------------------------------------------------------------ | ------ | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #249 | 复核 duration-budget 每周定时首轮（`schedule` 事件）真实结果并留痕 | P3     | **blocked**（03:23Z 到点实测 schedule run=0，本仓定时存在 4~6h 系统延迟，已留报告转 blocked） | **第 91 轮已执行取证**。03:23Z 到点后实测 workflow `385699809` 全部 run = 3 条且均为 dispatch、schedule run = 0；排查证实早间定时存在 4~6h 排队延迟（预计 07:30Z–08:30Z 触发）；dry-run 本地 exit 0（P95 220s 未超标）；按单内测试要求留执行报告并转 `blocked` |

> **顺序说明**：第 90 轮为**验收复核 + 队列治理 + 决策成文轮**。验收队列**空**（`status:review` / `in-progress` 双零实测），第 88 轮顺手项 #250 已由第 89 轮独立验收关闭 ⇒ 本轮无欠账。今日可开工 = **1**（#249）；按 PLAN 文件头纪律，**不为凑 2–5 区间制造任务**。
> **今日常态顺手项（不建单）**：bot metrics PR 预期 **`04:3xZ`** 再生 —— `Collect Project Metrics`（id `238631749`）cron 写 `15 0 * * *`，但近 5 日**实际触发 `04:24`–`04:52Z`**（GitHub schedule 有系统性延迟，勿按 00:15Z 等待）；处置法见 PLAN §2.2 触发器。
> **#251 今日勿领（前置未满足）**：新建的 M3 收口发版单，须等 **#249 由 Planner 验收关闭 + M3 `open_issues=0`**（实测现 `open=1`）。届时 Planner 解除前置并改写首行为 `ready`。
> **勿合 PR #239**：rp `release 1.3.0`（minor，实测 `files=2`、`mergeable=MERGEABLE`）。按 **D-020** 合并触发条件 = **M3 `open_issues` 归零 + Planner 显式关闭**，**不是** `due_on=2026-11-14`、也不是 CI 全绿；在 #251 转 `ready` 前一律不动。
> **若 Executor 启动早于 03:23Z** ⇒ 零交付稳态巡检轮是**正常结果**（巡检 = 开放 PR / inbound `wsyhuat` 带重试 / LOCK），不造任务。

## 上轮验收（第 90 轮 Planner 独立核对，未采信报告文字）

- **验收队列空 ⇒ 本轮无欠账**：`gh issue list` 标签扫描 `status:review` = **0**、`status:in-progress` = **0**；自 `2026-10-18T13:00Z` 起 **#249 / #197 / #101 / #239 / #186 / #209 的 comments 零命中**；`DIARY/` 最新仍为 `2026-10-18.md` ⇒ 第 89 轮之后无新执行会话，第 88 轮 #250 已在第 89 轮关闭（`status:done` 侧无遗留）。
- **复核第 89 轮结论仍然成立（全部新鲜重取，非复读）**：① HEAD `a5beb23` 完整 SHA push 三连 success；② `branch=main` 最近 40 run 无 failure/cancelled；③ 部署最新仍 `e3e0e0b2`@`10-18T11:25:45Z`（`a5beb23` 系 docs-only，按 D-001 **无需**重部署，与第 89 轮记录一致）；④ 线上 `/` 200 + 单请求 CSP 头/体 nonce 逐字一致 + `cache-control: private, no-cache, must-revalidate` + HSTS 在位。
- ⚠️ **纠正第 89 轮自身一处记录失实（本轮唯一不符项，已在 D-020「附带纠正」留痕）**：其写作「GitHub milestone #2 API 实测 `due_date=null` ⇒ PLAN『due 2026-11-14』系规划锚点而非 API 实值」。**不成立** —— REST 该对象**没有 `due_date` 这个键**，真实键名是 **`due_on`**；`--jq '.due_date'` 读不存在的键会被渲染成 `null`，遂成假证据。实测：`gh api repos/…/milestones/2 --jq '.due_on'` = **`2026-11-14T00:00:00Z`**，与 GraphQL `milestone.dueOn` 一致；M2（#1）同键 `due_on=2026-10-24` 亦佐证。**结论修正**：PLAN 的日历值是 API 实值；但**它不构成 D-012 的收尾触发**（M2 实际 2026-10-03 关闭、远早于其 due_on ⇒ 见 D-020 第 1 条）。
- **第 89 轮登记的 10 条环境信号全部沿用有效**，本轮另新增 3 条（见下节 11–13）。

## 全部开放 Issue

| #    | 标题                                                                 | 标签                                                                  | 状态                                                                                  | Milestone                                          |
| ---- | -------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------- |
| #249 | 复核 duration-budget 每周定时首轮（schedule 事件）真实结果并留痕     | P3/status:backlog/area:devops/area:quality/type:task/risk:low/blocked | **blocked**（已留执行报告于评论 `6258993095`；待 Actions 定时跑出后复核）             | M3                                                 |
| #251 | 按 D-012 在 M3 收口点合并 Release PR #239 发布 v1.3.0 并完成四方核验 | P3/status:backlog/area:devops/type:task/risk:medium                   | **backlog（前置未满足，勿领）**：需 #249 验收关闭 + M3 `open_issues=0`（现 `open=1`） | 无（刻意的收口单，不占 M3 `open` 计数）            |
| #197 | 评估解锁 release-please Release PR 的 PR 级自助 CI                   | P3/devops/dependencies/risk:medium/needs-info                         | needs-info（默认 C = 维持手工触发，用户 10-12 确认；信号触发型非饥饿）                | **无**（第 90 轮按 D-020 第 3 条迁出，议题未放弃） |
| #101 | [Task] 恢复 CI 自动部署，消除单机 wrangler OAuth 单点                | P1/devops/task/risk:medium/blocked                                    | blocked（第 90 轮再次复核 Secrets 仍仅 `CODECOV_TOKEN`/`PROJECT_TOKEN`）              | 不在 M3                                            |

> **M3 计数实测**（第 90 轮）：`open=1`（仅 #249）/ `closed=13` / `state=open` / `due_on=2026-11-14`。**#197 迁出 M3 是本轮 GitHub 侧唯一状态变更**（`gh api -X PATCH issues/197 {"milestone":null}`），目的 = 让「Milestone 收尾」判据（D-020）可达；#197 的标签、优先级、`needs-info` 状态**均未改动**。

## 开放 PR（非任务，供处置参考）

| #    | 标题                                                          | 性质                 | 处置口径                                                                                                |
| ---- | ------------------------------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------- |
| #239 | `chore(main): release 1.3.0`                                  | release-please       | **保持 open 不合并**：触发条件 = M3 `open_issues` 归零（D-020），非日历、非 CI 绿；由 #251 在收口点执行 |
| #209 | `chore(deps): bump the majors group across 1 directory with…` | dependabot (npm)     | 暂缓（D-015）；今日 `01:05Z` 被 force-update                                                            |
| #186 | `chore(deps): bump the majors group across 1 directory with…` | dependabot (actions) | 暂缓（D-015）；今日 `01:12Z` 被 force-update                                                            |

> 开放 PR 共 **3** 张（#239 + majors 2）。**第 90 轮实测：今日周一 dependabot 周扫描已跑完且未开出 minor-and-patch PR**（两条 `dynamic` update run `01:02:42Z` / `01:09:09Z` success；`--author app/dependabot --state all` 无新单）⇒ **D-014 批次处置今日不触发**（修正第 89 轮「明日可能开 minor-and-patch 分组 PR」的预期）。

## 环境信号（需 Executor 注意）

1. **`gh api actions/secrets` 不带 repo 路径返回 404**（第 84 轮实测）——须用 `gh api repos/<owner>/<repo>/actions/secrets`；404 ≠「无 secrets」也 ≠「无权限」，勿据此误判 #101 状态。
2. **CI 计数口径**：`gh run list` 默认只回 20 条且不按 commit 过滤；REST `head_sha=` **只认完整 SHA**（短 SHA 返回空列表）。「某 commit 全绿」断言必须 `gh api "…/actions/runs?head_sha=<full-sha>"` 或 `--commit`。
3. **`gh issue list --search "[x] in:title"` 非字面匹配**（方括号被当查询语法忽略）：`[duration-budget]` 前缀单的计数须用 `gh api '…/issues?state=all&per_page=100'` + `startswith()`。
4. **`check-duration-budget.mjs --dry-run` 的 `-s` 计数与 P95 数值随采样窗口漂移**（历史：6→2→1→0）：判据用「当轮计数 = 0 + 同窗口 A/B」，勿与历史绝对值比对。
5. **`wsyhuat` fetch 间歇失败**：必须重试后才下「无新工作」结论；本轮 `wsyhuat/main` 仍 `f98be0d`（2026-10-02，与第 82–89 轮 SHA 逐轮相同 ⇒ 树内容恒等、已吸收），`git diff --stat main wsyhuat/main` 的 **91 files 系 main 自身领先量**，勿误读为 inbound 新工作。
6. **audit 门禁现为零豁免 100% 严格**（#244 后）：任何新 moderate+ 公告会直接让 `Audit Dependencies` 变红——这是**目标状态**，处置路线见 D-019/D-011/D-018，回滚 `git revert 75ae26c`。
7. **部署版本核验**：`wrangler deployments list --name huat-fsac --json` **返回未按时间排序**，须自行按 `created_on` 降序取最新（本轮实测最新 = `e3e0e0b2`）；OAuth 已登录 `zcw85590@gmail.com`，缺 `k2.read/write` scope 的告警是无害的（ENV §3）。
8. **#249 到点判据**：`event=schedule` 的 duration-budget run 在 `2026-10-19T03:23Z` 之前不存在属预期（第 90 轮实测 schedule run = 0），**不要据此提前转 blocked**；到点后仍无 ⇒ 才转 `blocked` 报告。
9. **CSP nonce 比对必须单请求取样 + 剥 `nonce-` 前缀**：`curl -D h.txt -o b.html` 一次请求；头里 `script-src` 的 `'nonce-XXX'` 与体里 `nonce="XXX"` 比对须去掉 `nonce-` 前缀（字面串 `content-security-policy: nonce-` 永不出现，见 AGENTS.md / D-001）。分两次 curl 必然不一致。
10. **看板页真实路径**：渲染「数据更新时间」的是**项目进度看板** `…/docs-center/运营与协作/项目进度看板/`（zh，URL 需百分号编码）与 `…/en/docs-center/operations-and-collaboration/project-progress-board/`（en，第 85 轮实测 en 段保留中文）；`/showcase-dashboard/` 是「展示实验室」，**不含** metrics 快照，勿用它验收看板数据。
11. **⚠️ Actions 取数的 `workflow_id=` 不会过滤**（第 90 轮实测）：`gh api "…/actions/runs?workflow_id=duration-budget"` 返回的是**全仓** run（`total_count=1286`，混入 Collaboration Notifications 等），极易误判成「已有 schedule run」。正确做法：先 `gh api …/actions/workflows` 拿数字 id（duration-budget = **`385699809`**，Collect Project Metrics = `238631749`），再 `…/actions/workflows/<id>/runs[?event=schedule]`。
12. **⚠️ API 字段存在性判据**（第 90 轮，源自被纠正的失实记录）：**jq 对不存在的键渲染 `null`** ⇒ `--jq '.due_date'` 得到 `null` **不能**证明字段无值。REST milestone 的真实键是 **`due_on`**（GraphQL 为 `dueOn`）。断言任何字段为空之前，先 `--jq 'keys'` 或读原始 JSON 确认真实键名；跨源比对（REST vs GraphQL）才算证据。
13. **`ENV.md §3` 第 65 行已过期（Executor 所有权，Planner 只指出不代改）**：其「最近一次部署 Version `27d6bb1b`（2026-10-17）」应为 **`e3e0e0b2`**@`2026-10-18T11:25:45Z`。顺手更新该行，并可把本表第 11、12 条并入 ENV §4。
