# TASKS — Issue 本地镜像（Planner 每轮整体重写；权威来源 = GitHub Issue）

> 最后同步：2026-10-21T15:06Z（UTC）｜同步人：**第 101 轮 Planner 整体重写**（禁增量打补丁）｜核实基线 `main@1d453bf`（第 101 轮 Execution 收尾提交，与 origin 同步 `0/0`）。
> **本轮新鲜取证**：`pnpm why vite` = 单一 `8.3.5`；`pnpm quality:audit` **exit 0**（allowlist `entries: []`）；完整 SHA `1aa788f…` / `1d453bf…` 的 `CI/CD Pipeline` / `Secret Scan` / `Release Please` 三连 **success**；dependabot 开放告警 **0**；最新 deployment `2fb4f335…` → version_id `ac0be9c8`（100%，12:07Z）；线上单请求 CSP 头/体 nonce 一致（`JxRgQXlmvuQ6aUWmmBli3Q`）+ `/` 200；**#254 已验收关闭并打 `status:done`**；Release PR **#257** 已开（diff 仅 `CHANGELOG.md` + `package.json`，checks 未触发）；`actions/secrets` 仍仅 `CODECOV_TOKEN` / `PROJECT_TOKEN`。
> 权威来源 = GitHub Issue（`gh` 可用，token 有效）。网络对 `api.github.com` 有间歇 TLS/EOF 抖动，gh 调用带重试。
> `ready` 标签在本仓不存在（沿用 D-013 映射）⇒ 队列状态以 **Issue 正文首行「队列状态：`ready`」+ `status:backlog`** 为准。

## 今日队列（2026-10-21，给 Executor 的建议顺序）

| #   | 任务                                                               | 优先级 | 状态  | 顺序理由                                                                                      |
| --- | ------------------------------------------------------------------ | ------ | ----- | --------------------------------------------------------------------------------------------- |
| 1   | **#258** 合并 Release PR #257 发布 v1.3.1 并完成四方核验与部署判定 | P2     | ready | patch 档（§11.1），CI 绿即可合并；安全修复本体已上线，本单只做版本收尾，为当前唯一 ready 任务 |

> **顺序说明**：本轮为稳态收尾，今日可开工 Issue = **1**（#258），不为填 2–5 区间制造任务。
> **今日常态顺手项（不建单）**：当前**无**开放 bot metrics PR；下一张预计 `2026-10-22T04:4xZ` 前后生成。若 Executor 开工时出现，按常态指令在 #258 之后处置（schema 逐键一致 → squash 合入 → 完整 SHA CI → 视数据变更部署）。
> **勿合 majors #186/#209**（D-015 暂缓）。
> **#101 保持 blocked**：第 101 轮复核 Actions Secrets 仍仅 `CODECOV_TOKEN` / `PROJECT_TOKEN`。

## 验收记录（第 101 轮）

### #254 —— **通过并关闭（报告失实 0 处）**，`status:done`，closedAt 2026-10-21T15:06:28Z

逐项亲跑 / 取证（未采信报告文字）：

1. `pnpm why vite` → `Found 1 version of vite`；`pnpm-lock.yaml` 仅 `vite@8.3.5`；8.1.5 / 8.3.0 已消失。
2. `pnpm quality:audit` → exit 0 · `✅ audit clean — no advisories at/above the threshold`；allowlist 仍 `entries: []`，本单未改该文件（最近改动为 #247）。
3. `git show --name-status 1aa788f` → 仅 `pnpm-lock.yaml` + `pnpm-workspace.yaml`；override `"vite@>=8.0.0 <8.3.3": ">=8.3.3 <9.0.0"` 符合 D-007 / D-021。
4. 完整 SHA `1aa788fbde9f1146af57581c83eb78ed108b550c` 与 `1d453bfad812f82e9e0836a47a1fc5663843c720` 的 `CI/CD Pipeline` / `Secret Scan` / `Release Please` 均 success、0 失败；dependabot open alerts = 0。
5. `wrangler deployments list`（按 `created_on` 降序）最新 = `2fb4f335-a2bc-4638-9413-859bba938d6d` → version_id `ac0be9c8-64ef-4aa1-974f-cff4b010d2bc`（100%）；线上单请求 nonce 一致（`JxRgQXlmvuQ6aUWmmBli3Q`），`/` 200。
6. 执行报告 §1.7 全字段齐备，转 `status:review` 且未自行关单（D-006 合规）。

### 顺手项 #255（bot metrics PR）—— **复核通过**

`git show --stat 1d453bf` = 仅 `project-progress.json` 43+/43-；HEAD^ 与 HEAD 的 JSON 叶键路径集合 44/44 完全一致（0 结构差异）；完整 SHA CI 三连 success；已随 Version `ac0be9c8` 上线。

### 历史验收（保留摘要）

- 第 97 轮：#251 通过关闭，`v1.3.0` 四方核验 + 部署 Version `35127731` 全绿；M3 闭环。
- 第 93 / 98 / 100 轮：bot metrics PR #252 / #253 / （#255 由第 101 轮复核）常态处置均通过。

## 全部开放 Issue

| #    | 标题                                                      | 标签                                                                 | 状态                                                                                           | Milestone |
| ---- | --------------------------------------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | --------- |
| #258 | 合并 Release PR #257 发布 v1.3.1 并完成四方核验与部署判定 | priority:p2/status:backlog/type:task/area:devops/risk:low            | **ready**（patch 档；PR #257 diff 仅 2 文件，checks 未触发，需手工触发 CI 后合并）             | 无        |
| #197 | 评估解锁 release-please Release PR 的 PR 级自助 CI        | priority:p3/needs-info/area:devops/dependencies/risk:medium          | needs-info（默认 C = 维持手工触发，用户 2026-10-12 确认；#257 再次实证影响；信号触发型，保留） | **无**    |
| #101 | [Task] 恢复 CI 自动部署，消除单机 wrangler OAuth 单点     | priority:p1/status:backlog/area:devops/type:task/risk:medium/blocked | blocked（第 101 轮复核 Secrets 仍仅 `CODECOV_TOKEN`/`PROJECT_TOKEN`）                          | 无        |

> **#254 已关闭**（`status:done`）。**Milestone #2（M3）与 Milestone #1（M2）均已关闭**；当前无开放 Milestone；M4 暂不创建（无待排期工作束）。

## 全部开放 PR（非任务，供处置参考）

| #    | 标题                                                          | 性质                | 处置口径                                                          |
| ---- | ------------------------------------------------------------- | ------------------- | ----------------------------------------------------------------- |
| #257 | `chore(main): release 1.3.1`                                  | release-please      | **由 #258 处置**：patch 档，触发 CI 后合并 + 四方核验；预期不部署 |
| #209 | `chore(deps): bump the majors group across 1 directory with…` | dependabot (npm)    | 暂缓（D-015）                                                     |
| #186 | `chore(deps): bump the majors group across 1 directory with…` | dependabot (github) | 暂缓（D-015）                                                     |

> 开放 PR 共 **3** 张（bot 1 + majors 2）。

## 环境信号（需 Executor 注意）

1. **`gh api actions/secrets` 不带 repo 路径返回 404**——须用 `gh api repos/<owner>/<repo>/actions/secrets`；404 ≠「无 secrets」也 ≠「无权限」。
2. **CI 计数口径**：`gh run list` 默认只回 20 条且不按 commit 过滤；REST `head_sha=` **只认完整 SHA**（短 SHA 返回空列表）。「某 commit 全绿」断言必须 `gh api "…/actions/runs?head_sha=<full-sha>"`。
3. **`wsyhuat` fetch 间歇失败**：必须重试后再下「无新工作」结论；第 101 轮巡检 `wsyhuat/main` 内容级 diff 0（已吸收）。
4. **audit 门禁零豁免 100% 严格**（#244 后）：任何新 moderate+ 公告会直接让 `Audit Dependencies` 变红——目标状态，处置路线按 **D-021**（有补丁即升级、不豁免；跨 major 才需用户）。第 101 轮实测 exit 0。
5. **部署版本核验**：`wrangler deployments list --name huat-fsac --json` 返回未按时间排序，须自行按 `created_on` 降序取最新；顶部 `id` 是 **deployment ID**，线上版本看 `versions[0].version_id`。当前最新 deployment `2fb4f335-a2bc-4638-9413-859bba938d6d` → version_id `ac0be9c8-64ef-4aa1-974f-cff4b010d2bc`（100%，2026-10-21T12:07:33Z）。OAuth 已登录可用（`wrangler` 需通过 `pnpm exec wrangler` 调用）。
6. **CSP nonce 比对必须单请求取样 + 剥 `nonce-` 前缀**：`curl -D h.txt -o b.html` 一次请求；头里 `script-src` 的 `'nonce-XXX'` 与体里 `nonce="XXX"` 比对须去掉 `nonce-` 前缀。
7. **看板页真实路径**：zh `…/docs-center/运营与协作/项目进度看板/`（URL 百分号编码）与 en `…/en/docs-center/运营与协作/项目进度看板/`；`/showcase-dashboard/` 不含 metrics 快照。
8. **版本四方核验与祖先判定**：已由 #251 闭环证实；后续发版严格遵守 `WORKFLOW §11`。
9. **公告时间窗与 Dependabot 失效**：安全公告可能在两轮之间发布，上一轮的「告警 0 / CI 全绿」会瞬间过期；Dependabot 安全更新无法自动解决跨包 override 抬版（run `39486965261` 与 `39518744867` 实证），必须人工/Agent 抬版。
10. **Release PR checks 为空是已知现象**：release-please 以 `GITHUB_TOKEN` 推分支不触发 PR 级 workflow（#197）。#257 当前 `no checks reported`；按 #258 要求用既有手工手法触发后再合并，**不得手工改 version / CHANGELOG / rebase**。
11. **分支卫生**：本地 36 条 / origin 45 条（含 main），绝大多数为 2026-09-30～10-14 的历史分支；第 101 轮执行后 `agent/issue-254-vite-upgrade` 与 `chore/update-metrics` 已在远端删除。无活跃开发分支；远程清理需人类确认，不排期、不建单。
12. **流程状态**：`STATE.md` / `HANDOFF.md` 已由第 101 轮 Executor 刷新；`docs/WORKFLOW.md §7.4` 已记录至第 101 轮执行与第 101 轮规划。
