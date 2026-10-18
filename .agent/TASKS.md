# TASKS — Issue 本地镜像（Planner 每轮整体重写；权威来源 = GitHub Issue）

> 最后同步：2026-10-18T13:53Z（UTC，`date -u`；本地日期 2026-10-18）｜同步人：第 89 轮 Planner 整体重写｜核实基线 `main@e36bcd2`（第 88 轮 `.agent` 收尾提交，docs-only）；最近代码 SHA `f72c35b`（bot PR #250 数据快照 squash 合入），其 CI 按完整 `head_sha=f72c35b61b61be62404f06260f976e1a8a85ce8c` 取数：`CI/CD Pipeline`（run 39123112168，全 job success）/ `Secret Scan`（run 39123112208）/ `Release Please`（run 39123112383）均 **success、0 失败**
> 权威来源 = GitHub Issue（`gh` 可用，本轮实测 token 有效）。网络对 `api.github.com` 有间歇性 TLS/EOF 抖动，所有 gh 调用均需重试包裹。
> `ready` 标签在本仓不存在（沿用 D-013 映射）⇒ 队列状态以 **Issue 正文首行「队列状态：`ready`」+ `status:backlog`** 为准。

## 今日队列（给 Executor 的建议顺序）

| #    | 任务                                                               | 优先级 | 状态                      | 顺序理由                                                                                                                                                                                                                                                                          |
| ---- | ------------------------------------------------------------------ | ------ | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #249 | 复核 duration-budget 每周定时首轮（`schedule` 事件）真实结果并留痕 | P3     | ready（**开工条件未到**） | **唯一在队 Issue**。⚠️ **`2026-10-19T03:23Z` 之前不要领取**——本轮（10-18T13:53Z）实测 `event=schedule` 的 duration-budget run 仍为 0（run 列表仅历史 3 条 `workflow_dispatch`）；提前跑取不到目标证据。到点后按单内 4 条标准取证；若到点仍无 schedule run ⇒ 转 `blocked` 立即报告 |

> 顺序说明：第 89 轮为**验收 + 治理 + 巡检轮**。`ready` 队列今日**可开工 Issue = 0**（#249 开工条件 `2026-10-19T03:23Z` 之后，约 13 小时未到；#197 为信号触发型 `needs-info`；#101 为人类阻塞）。按 PLAN 文件头纪律，**不为凑 2–5 区间制造任务**。
> **今日无顺手项**：bot metrics PR #250 已由第 88 轮合入 `f72c35b`，当前无开放 bot PR；下一张 metrics PR 预期 `2026-10-19T04:3xZ` 再生。若 Executor 今日再跑 ⇒ **零交付稳态巡检轮属正常结果**；巡检项 = 开放 PR（#239 勿合）、inbound `wsyhuat`（带重试）、LOCK。
> **明日（10-19 周一）预期工作面**：① #249 到点可领；② 每周一 dependabot 扫描可能开出 minor-and-patch 分组 PR（按 D-014 批次处置）；③ 新 bot metrics PR 再生（§2.2 常态处置）。
> **勿合 PR #239**（rp `release 1.3.0` 属 minor，D-012 第 2 档随 Milestone 收尾合并）。

## 上轮验收（第 89 轮 Planner 独立核对，未采信报告文字）

- **顺手项 #250（bot metrics PR，无任务单可关，结论落 PR 评论 + TASKS + 本镜像）——通过，报告无失实**，逐条亲跑复现：
    - `gh pr view 250` = `state=MERGED`、`mergeOid=f72c35b61b61be62404f06260f976e1a8a85ce8c`、`files=1`、`mergedAt=2026-10-18T11:24:30Z` ✅
    - 本地递归键比对 `f72c35b^` vs `f72c35b` 的 `project-progress.json`：**94 条键路径前后完全一致、增删 0** ⇒ 纯值漂移，未夹带 schema 变更 ✅
    - 完整 SHA CI：`CI/CD Pipeline`（run 39123112168）逐 job `Lint and Format`/`Audit Dependencies`/`Type Check`/`Tests`/`Build`/`Quality LHCI`/`Quality Budget`/`Quality E2E(1/2,2/2)`/`Preview Build`/`Quality Gate` **全 success**（`Report flaky candidate` 条件 job skipped）；`Secret Scan`/`Release Please` success；0 失败 ✅（`Audit Dependencies` success 亦再证零豁免门禁仍绿）
    - `wrangler deployments list --name huat-fsac --json`（按 `created_on` 降序）：最新 = `2026-10-18T11:25:45.129409Z` / Version **`e3e0e0b2-270f-4fca-ace8-2d947fb3f9c2`** ✅；其下 `82ae7f68`（第85轮/#248）、`27d6bb1b`（第83轮/#241）链一致
    - 线上**单请求**（`curl -D/-o`）CSP 头/体 nonce 剥 `nonce-` 前缀后逐字一致（本轮 `9GpyPn4hDBDo56dZz62yzw`）、`/` HTTP/2 200 ✅
    - **真实进度看板**（非 `/showcase-dashboard/`，那是展示实验室）：zh `/docs-center/运营与协作/项目进度看板/` 200 渲染 `数据更新时间: 2026/10/18 04:31:55`、en `/en/docs-center/operations-and-collaboration/project-progress-board/` 200 渲染 `Updated: 10/18/2026, 4:31:55 AM`（与 #250 `generatedAt=04:31:55.262Z` 吻合）✅
    - PR 处置评论 `6249360048`（作者 `zhangjszs`，2026-10-18T11:27:11Z）内容相符 ✅
- **验收队列**：`status:review` = 0、无 `in-progress`（`gh issue list` 标签扫描双零命中）。第 88 轮为无单稳态轮，无执行报告欠账。

## 全部开放 Issue

| #    | 标题                                                             | 标签                                                          | 状态                                                                       | Milestone |
| ---- | ---------------------------------------------------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------------- | --------- |
| #249 | 复核 duration-budget 每周定时首轮（schedule 事件）真实结果并留痕 | P3/status:backlog/area:devops/area:quality/type:task/risk:low | ready（第 84 轮新建；**开工条件 = `2026-10-19T03:23Z` 之后**，今日不可领） | M3        |
| #197 | 评估解锁 release-please Release PR 的 PR 级自助 CI               | P3/devops/dependencies/risk:medium/needs-info                 | needs-info（默认 C = 维持手工触发，用户 10-12 确认；信号触发型非饥饿）     | M3        |
| #101 | [Task] 恢复 CI 自动部署，消除单机 wrangler OAuth 单点            | P1/devops/task/risk:medium/blocked                            | blocked（第 89 轮再次复核 Secrets 仍仅 `CODECOV_TOKEN`/`PROJECT_TOKEN`）   | 不在 M3   |

## 开放 PR（非任务，供处置参考）

| #    | 标题                                                          | 性质                 | 处置口径                                                                                       |
| ---- | ------------------------------------------------------------- | -------------------- | ---------------------------------------------------------------------------------------------- |
| #250 | `chore(metrics): update project progress snapshot`            | bot metrics          | **已合入 `f72c35b` 并部署 Version `e3e0e0b2`**（PR 留处置评论 `6249360048`，第 89 轮验收通过） |
| #239 | `chore(main): release 1.3.0`                                  | release-please       | **保持 open 不合并**：D-012 第 2 档「minor 随 Milestone 收尾合并」                             |
| #209 | `chore(deps): bump the majors group across 1 directory with…` | dependabot (npm)     | 暂缓（D-015）                                                                                  |
| #186 | `chore(deps): bump the majors group across 1 directory with…` | dependabot (actions) | 暂缓（D-015）                                                                                  |

> 开放 PR 现共 **3** 张（#250 已合入出列）= #239（勿合）+ majors #209/#186（暂缓）。

## 环境信号（需 Executor 注意）

1. **`gh api actions/secrets` 不带 repo 路径返回 404**（第 84 轮实测）——须用 `gh api repos/<owner>/<repo>/actions/secrets`；404 ≠「无 secrets」也 ≠「无权限」，勿据此误判 #101 状态。
2. **CI 计数口径**：`gh run list` 默认只回 20 条且不按 commit 过滤；REST `head_sha=` **只认完整 SHA**（短 SHA 返回空列表）。「某 commit 全绿」断言必须 `gh api "…/actions/runs?head_sha=<full-sha>"` 或 `--commit`。
3. **`gh issue list --search "[x] in:title"` 非字面匹配**（方括号被当查询语法忽略）：`[duration-budget]` 前缀单的计数须用 `gh api '…/issues?state=all&per_page=100'` + `startswith()`。
4. **`check-duration-budget.mjs --dry-run` 的 `-s` 计数与 P95 数值随采样窗口漂移**（历史：6→2→1→0）：判据用「当轮计数 = 0 + 同窗口 A/B」，勿与历史绝对值比对。
5. **`wsyhuat` fetch 间歇失败**：必须重试后才下「无新工作」结论；本轮 `wsyhuat/main` 仍 `f98be0d`，与第 82–88 轮 SHA 逐轮相同 ⇒ 树内容恒等，前轮已做 7 路径内容级空 diff = 已吸收，无需重做。
6. **audit 门禁现为零豁免 100% 严格**（#244 后）：任何新 moderate+ 公告会直接让 `Audit Dependencies` 变红——这是**目标状态**，处置路线见 D-019/D-011/D-018，回滚 `git revert 75ae26c`。本轮 #250 合入后该 job 仍 success。
7. **部署版本核验（第 86 轮手法，本轮再用）**：`wrangler deployments list --name huat-fsac --json` 直接取 `created_on` + `version_id`（OAuth 已登录，`whoami` = `zcw85590@gmail.com`；缺 `k2.read/write` scope 是无害告警，deployments list 不受影响）。
8. **#249 到点判据**：`event=schedule` 的 duration-budget run 在 `2026-10-19T03:23Z` 之前不存在属预期（本轮实测 schedule run = 0），**不要据此提前转 blocked**。到点后仍无 ⇒ 才转 `blocked` 报告（定时可能被禁用，属重要发现）。
9. **CSP nonce 比对必须单请求取样 + 剥 `nonce-` 前缀**：`curl -D h.txt -o b.html` 一次请求；头里 `script-src` 的 `'nonce-XXX'` 与体里 `nonce="XXX"` 比对时须去掉 `nonce-` 前缀（字面串 `content-security-policy: nonce-` 永不出现，见 AGENTS.md）。分两次 curl 必然不一致（每请求新 nonce）。
10. **看板页真实路径**（本轮再次踩实）：渲染「数据更新时间」的是**项目进度看板** `…/docs-center/运营与协作/项目进度看板/`（zh，URL 需百分号编码）与 `…/en/docs-center/operations-and-collaboration/project-progress-board/`（en），二者**服务端渲染快照值**可在原始 HTML grep 到；`/showcase-dashboard/` 是「展示实验室」另一页，**不含** metrics 快照，勿用它验收看板数据。
