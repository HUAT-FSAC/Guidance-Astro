# TASKS — Issue 本地镜像（Planner 每轮整体重写；权威来源 = GitHub Issue）

> 最后同步：2026-10-22T11:33Z（UTC）｜同步人：**第 102 轮 Planner 整体重写**（禁增量打补丁）｜核实基线 `main@993607a`（第 101 轮 Planning 收尾提交，与 origin 同步 `0/0`）。
> **本轮新鲜取证**：`pnpm quality:audit` **exit 1**（2 条未覆盖公告：moderate `@vitest/mocker` `GHSA-qxg6-89mg-rqv8` 与 `GHSA-xp26-3454-mjgp`；`vulnerable <4.1.12`，`vitest@4.1.12` / `@vitest/coverage-v8@4.1.12` / `@vitest/mocker@4.1.12` 已在 npm 发布）；`pnpm why @vitest/mocker` = 单一 `4.1.11`；`pnpm why vitest` = 单一 `4.1.11`；allowlist 仍 `entries: []`（按 D-021 维持零豁免，有补丁即升级）；已建单 **#260（P0 · ready）**；Release PR **#257** 保持开放（由 **#258** 承接，前置依赖更新为 #260 合并）；bot metrics PR **#259** 如期于 04:43Z 生成（diff 仅 `project-progress.json` 42+/42- 纯值漂移）；`actions/secrets` 仍仅 `CODECOV_TOKEN` / `PROJECT_TOKEN`。
> 权威来源 = GitHub Issue（`gh` 可用，token 有效）。网络对 `api.github.com` 有间歇 TLS/EOF 抖动，gh 调用带重试。
> `ready` 标签在本仓不存在（沿用 D-013 映射）⇒ 队列状态以 **Issue 正文首行「队列状态：`ready`」+ `status:backlog`** 为准。

## 今日队列（2026-10-22，给 Executor 的建议顺序）

| #   | 任务                                                                                    | 优先级 | 状态  | 顺序理由                                                                                                          |
| --- | --------------------------------------------------------------------------------------- | ------ | ----- | ----------------------------------------------------------------------------------------------------------------- |
| 1   | **#260** 升级 vitest / @vitest/mocker 至 ≥4.1.12 消除 2 条公告，恢复 quality:audit 门禁 | P0     | ready | 2 条中危公告导致 audit 门禁 exit 1，属项目阻塞（D-021）；上游 4.1.12 已发布，今日首要任务，必须最优先合入恢复全绿 |
| 2   | **#258** 合并 Release PR #257 发布 v1.3.1 并完成四方核验与部署判定                      | P2     | ready | patch 档（§11.1），**必须在 #260 合入主干恢复 audit 全绿后执行**；rp 届时将追加 #260 的 fix，发版收尾             |

> **顺序说明**：必须严格按 1 → 2 顺序执行。#260 是前置阻塞，未修复前合并 #257 会导致 main push 潜伏红且发布未修漏洞的版本；#260 合入后 rp 自动更新 PR #257，再执行 #258。
> **今日常态顺手项（不建单）**：bot metrics PR **#259**（2026-10-22T04:43Z 生成，42+/42- 纯值漂移），排在 #260 / #258 之后处置（schema 逐键一致 → squash 合入 → 完整 SHA CI → 视数据变更部署）。
> **勿合 majors #186/#209**（D-015 暂缓）。
> **#101 保持 blocked**：复核 Actions Secrets 仍仅 `CODECOV_TOKEN` / `PROJECT_TOKEN`。

## 验收记录（第 102 轮）

### 昨日/历史 in-review 任务 —— **无**（0 待验收）

- #254（vite 8.3.5 安全抬版）已于第 101 轮规划独立验收通过并关闭（`status:done`，报告失实 0 处）；
- 第 101 轮规划收尾后，Executor 尚未开工，无新提交的 execution 报告需验收。

### 历史验收（保留摘要）

- 第 101 轮：#254 验收通过关闭，vite 单一 8.3.5、audit 零豁免全绿、双 SHA CI 三连绿、Version `ac0be9c8` 上线且单请求 nonce 一致；顺手项 #255 复核通过。
- 第 97 轮：#251 通过关闭，`v1.3.0` 四方核验 + 部署 Version `35127731` 全绿；M3 闭环。
- 第 93 / 98 / 100 轮：bot metrics PR #252 / #253 / （#255 由第 101 轮复核）常态处置均通过。

## 全部开放 Issue

| #    | 标题                                                                           | 标签                                                                               | 状态                                                                                           | Milestone |
| ---- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | --------- |
| #260 | 升级 vitest / @vitest/mocker 至 ≥4.1.12 消除 2 条公告，恢复 quality:audit 门禁 | priority:p0/status:backlog/type:task/area:devops/risk:medium/security/dependencies | **ready**（P0 插队；上游 4.1.12 已发布，零豁免恢复 audit 绿灯）                                | 无        |
| #258 | 合并 Release PR #257 发布 v1.3.1 并完成四方核验与部署判定                      | priority:p2/status:backlog/type:task/area:devops/risk:low                          | **ready**（patch 档；依赖 #260 合入主干恢复 audit 全绿后合并 + 四方核验）                      | 无        |
| #197 | 评估解锁 release-please Release PR 的 PR 级自助 CI                             | priority:p3/needs-info/area:devops/dependencies/risk:medium                        | needs-info（默认 C = 维持手工触发，用户 2026-10-12 确认；#257 再次实证影响；信号触发型，保留） | **无**    |
| #101 | [Task] 恢复 CI 自动部署，消除单机 wrangler OAuth 单点                          | priority:p1/status:backlog/area:devops/type:task/risk:medium/blocked               | blocked（复核 Secrets 仍仅 `CODECOV_TOKEN`/`PROJECT_TOKEN`）                                   | 无        |

> 当前开放 Issue 共 **4** 条（ready 2 + needs-info 1 + blocked 1）。**Milestone #2（M3）与 Milestone #1（M2）均已关闭**；当前无开放 Milestone；M4 暂不创建。

## 全部开放 PR（非任务，供处置参考）

| #    | 标题                                                          | 性质                | 处置口径                                                          |
| ---- | ------------------------------------------------------------- | ------------------- | ----------------------------------------------------------------- |
| #259 | `chore(metrics): update project progress snapshot`            | bot schedule        | **常态顺手项**：在 #260 / #258 之后处置，确认纯值漂移后合入并部署 |
| #257 | `chore(main): release 1.3.1`                                  | release-please      | **由 #258 处置**：在 #260 合并后触发 CI，squash 合并 + 四方核验   |
| #209 | `chore(deps): bump the majors group across 1 directory with…` | dependabot (npm)    | 暂缓（D-015）                                                     |
| #186 | `chore(deps): bump the majors group across 1 directory with…` | dependabot (github) | 暂缓（D-015）                                                     |

> 开放 PR 共 **4** 张（bot 2 + majors 2）。

## 环境信号（需 Executor 注意）

1. **`gh api actions/secrets` 不带 repo 路径返回 404**——须用 `gh api repos/<owner>/<repo>/actions/secrets`；404 ≠「无 secrets」也 ≠「无权限」。
2. **CI 计数口径**：`gh run list` 默认只回 20 条且不按 commit 过滤；REST `head_sha=` **只认完整 SHA**（短 SHA 返回空列表）。「某 commit 全绿」断言必须 `gh api "…/actions/runs?head_sha=<full-sha>"`。
3. **`wsyhuat` fetch 间歇失败**：必须重试后再下「无新工作」结论；第 102 轮巡检 `wsyhuat/main` 仍 `f98be0d` 内容级 diff 0（已吸收）。
4. **audit 门禁零豁免 100% 严格**（#244 后）：任何新 moderate+ 公告会直接让 `Audit Dependencies` 变红——目标状态，处置路线按 **D-021**（有补丁即升级、不豁免；跨 major 才需用户）。第 102 轮实测 exit 1（命中 2 条 vitest 公告，由 #260 修复）。
5. **部署版本核验**：`wrangler deployments list --name huat-fsac --json` 返回未按时间排序，须自行按 `created_on` 降序取最新；顶部 `id` 是 **deployment ID**，线上版本看 `versions[0].version_id`。当前最新 deployment `2fb4f335-a2bc-4638-9413-859bba938d6d` → version_id `ac0be9c8-64ef-4aa1-974f-cff4b010d2bc`（100%，2026-10-21T12:07:33Z）。OAuth 已登录可用（`wrangler` 需通过 `pnpm exec wrangler` 调用）。
6. **CSP nonce 比对必须单请求取样 + 剥 `nonce-` 前缀**：`curl -D h.txt -o b.html` 一次请求；头里 `script-src` 的 `'nonce-XXX'` 与体里 `nonce="XXX"` 比对须去掉 `nonce-` 前缀。
7. **看板页真实路径**：zh `…/docs-center/运营与协作/项目进度看板/`（URL 百分号编码）与 en `…/en/docs-center/运营与协作/项目进度看板/`；`/showcase-dashboard/` 不含 metrics 快照。
8. **版本四方核验与祖先判定**：已由 #251 闭环证实；后续发版严格遵守 `WORKFLOW §11`。
9. **公告时间窗与 Dependabot 失效**：安全公告可能在两轮之间发布，上一轮的「告警 0 / CI 全绿」会瞬间过期；Dependabot 安全更新无法自动解决跨包 override 抬版（run `39486965261` 与 `39518744867` 实证），必须人工/Agent 抬版。
10. **Release PR checks 为空是已知现象**：release-please 以 `GITHUB_TOKEN` 推分支不触发 PR 级 workflow（#197）。#257 当前 `no checks reported`；按 #258 要求用既有手工手法触发后再合并，**不得手工改 version / CHANGELOG / rebase**。
11. **分支卫生**：本地 36 条 / origin 45 条（含 main），绝大多数为 2026-09-30～10-14 的历史分支；无活跃开发分支；远程清理需人类确认，不排期、不建单。
12. **流程状态**：`STATE.md` / `HANDOFF.md` 已由第 101 轮 Executor 刷新；`docs/WORKFLOW.md §7.4` 记录至第 101 轮执行与第 101 轮规划。
13. **vitest 4.1.12 升级注意**：`package.json` 当前声明 `"vitest": "^4.1.10"` 与 `"@vitest/coverage-v8": "^4.1.11"`，`pnpm-workspace.yaml` overrides 含 `"vitest@>=4.0.0 <4.1.11": ">=4.1.11 <5.0.0"`；升级至 `4.1.12` 完全在 4.x semver 范围内，避免升级到 5.x major（D-015）。
