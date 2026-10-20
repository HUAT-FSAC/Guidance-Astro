# TASKS — Issue 本地镜像（Planner 每轮整体重写；权威来源 = GitHub Issue）

> 最后同步：2026-10-19T17:2xZ（UTC；本地日期 **2026-10-20**）｜同步人：**第 95 轮 Planner 整体重写**（禁增量打补丁）｜核实基线 `main@eb2c003`（第 94 轮 `.agent` 收尾提交，与 origin 同步 `0/0`）；最近代码 SHA `1a3b688`（bot PR #252 数据快照）。**本轮新鲜取证**：HEAD 完整 SHA `eb2c003af013f83611a56806760619ef3e0c3d35` 的 `CI/CD Pipeline` / `Secret Scan` / `Release Please` 三连 **success**；线上 `/` **200** + **单请求** CSP 头/体 nonce 逐字一致（`ICpqHbvf5DxVWdMf-kK8zA`）；`actions/secrets` 仍仅 `CODECOV_TOKEN` / `PROJECT_TOKEN`。
> 权威来源 = GitHub Issue（`gh` 可用，token 有效）。网络对 `api.github.com` 有间歇 TLS/EOF 抖动，gh 调用带重试。
> `ready` 标签在本仓不存在（沿用 D-013 映射）⇒ 队列状态以 **Issue 正文首行「队列状态：`ready`」+ `status:backlog`** 为准。

## 今日队列（本地 2026-10-20，给 Executor 的建议顺序）

| #    | 任务                                                                 | 优先级 | 状态                                             | 顺序理由                                                                                                                                                  |
| ---- | -------------------------------------------------------------------- | ------ | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #251 | 按 D-012 在 M3 收口点合并 Release PR #239 发布 v1.3.0 并完成四方核验 | P3     | **in-review**（已合并 #239，完成四方核验与部署） | **执行完成待验收**。M3 已于 2026-10-19T17:24:43Z 显式关闭，已合并 #239 发布 v1.3.0，完成四方核验与祖先判定，已部署 Version 35127731，已转 `status:review` |

> **顺序说明**：第 95 轮为**验收 + 收口轮**。#249 已独立验收通过关闭；M3 `open_issues` 1→0，Milestone #2 已显式关闭；#251 转 `ready`。今日可开工 = **1**，按文件头纪律**不为凑 2–5 区间制造任务**。
> **今日常态顺手项（不建单）**：当前无开放 bot metrics PR；下一张预期 **2026-10-20T04:3xZ（UTC）** 再生，届时按长期指令处置（schema 逐键一致 → 合入 → 完整 SHA CI → 视数据变更部署）。
> **勿合 majors #186/#209**：D-015 暂缓。
> **#101 保持 blocked**：第 95 轮复核 Actions Secrets 仍仅 `CODECOV_TOKEN`/`PROJECT_TOKEN`。

## 上轮验收（第 95 轮 Planner 独立核对，未采信报告文字）

- **验收 #249（duration-budget 每周定时首轮复核）——通过，报告无失实，已关闭**（四条标准逐条亲跑取证）：
    1. `gh api repos/HUAT-FSAC/Guidance-Astro/actions/runs/39227547586` → `event=schedule` · `status=completed` · `conclusion=success` · `run_started_at=2026-10-19T09:06:16Z` · `workflow_id=385699809`（晚于开工条件 03:23Z 约 5h43m，符合已知 4~6h 排队延迟）。
    2. run 的 job `117977412637`（`Check CI duration budget`，success）日志实取四行原文：`阈值: Quality 阶段墙钟 P95 360s / 分片 step 90s`、`Quality 阶段墙钟 P95 = 220s（阈值 360s，样本 20）→ 未超标`、`E2E 分片 step 最长 = 24s（run 38912548528，阈值 90s）→ 未超标`、`结论: 未超标`，与报告逐字一致。
    3. REST 全量 `startswith("[duration-budget]")` 过滤 → `count=1`，仅已关 #246（`state=closed`，`comments=2` 未增）；无 open 追踪单，未超标结论下未产生新单。
    4. 组合分支 #2（已存在 open 单 + 未超标）执行报告明确写「未覆盖」及原因，与实测一致，属如实记录。
- **D-020 收口判据首次执行完成**：#249 关闭后 M3 `open_issues=0`（`closed=14`），Planner 于 **2026-10-19T17:24:43Z** 显式置 Milestone #2 `state=closed`；#251 正文首行已改写为 `ready`。
- **M4 决策**：暂不创建。当前无需要承接的 ready/backlog 工作；#197（needs-info/默认 C）与 #101（blocked/待人类）为常驻项，按 D-020 第 3 条不进入 Milestone 的 `open` 计数。待发版后出现真实工作束再开。

## 全部开放 Issue

| #    | 标题                                                                 | 标签                                               | 状态                                                                     | Milestone                               |
| ---- | -------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------ | --------------------------------------- |
| #251 | 按 D-012 在 M3 收口点合并 Release PR #239 发布 v1.3.0 并完成四方核验 | P3/status:review/area:devops/type:task/risk:medium | **in-review**（已交付，待 Planner 验收）                                 | 无（刻意的收口单，不占 M3 `open` 计数） |
| #197 | 评估解锁 release-please Release PR 的 PR 级自助 CI                   | P3/devops/dependencies/risk:medium/needs-info      | needs-info（默认 C = 维持手工触发，用户 10-12 确认；信号触发型非饥饿）   | **无**（第 90 轮按 D-020 第 3 条迁出）  |
| #101 | [Task] 恢复 CI 自动部署，消除单机 wrangler OAuth 单点                | P1/devops/task/risk:medium/blocked                 | blocked（第 95 轮再次复核 Secrets 仍仅 `CODECOV_TOKEN`/`PROJECT_TOKEN`） | 不在任何 Milestone                      |

> **Milestone #2（M3 稳态运营）已关闭**：`open_issues=0` / `closed_issues=14` / `state=closed` / `closed_at=2026-10-19T17:24:43Z`（`due_on=2026-11-14` 未构成触发，D-020）。
> **当前无开放 Milestone**；M4 暂不创建，理由见上轮验收第 3 条。

## 开放 PR（非任务，供处置参考）

| #    | 标题                                                          | 性质                 | 处置口径                                                            |
| ---- | ------------------------------------------------------------- | -------------------- | ------------------------------------------------------------------- |
| #239 | `chore(main): release 1.3.0`                                  | release-please       | **已于第 96 轮由 #251 合并**（commit `db31f6f`，生成 tag `v1.3.0`） |
| #209 | `chore(deps): bump the majors group across 1 directory with…` | dependabot (npm)     | 暂缓（D-015）                                                       |
| #186 | `chore(deps): bump the majors group across 1 directory with…` | dependabot (actions) | 暂缓（D-015）                                                       |

> 开放 PR 共 **2** 张（majors 2；#239 已合并）。当前无开放 bot PR（#253 已合入）。

## 环境信号（需 Executor 注意）

1. **`gh api actions/secrets` 不带 repo 路径返回 404**（第 84 轮实测）——须用 `gh api repos/<owner>/<repo>/actions/secrets`；404 ≠「无 secrets」也 ≠「无权限」。
2. **CI 计数口径**：`gh run list` 默认只回 20 条且不按 commit 过滤；REST `head_sha=` **只认完整 SHA**（短 SHA 返回空列表）。「某 commit 全绿」断言必须 `gh api "…/actions/runs?head_sha=<full-sha>"`。
3. **`gh issue list --search "[x] in:title"` 非字面匹配**：`[duration-budget]` 前缀单计数须用 REST 全量 + `startswith()`。
4. **`check-duration-budget.mjs --dry-run` 的 `-s` 计数与 P95 数值随采样窗口漂移**：判据用「当轮计数 = 0 + 同窗口 A/B」，勿与历史绝对值比对。
5. **`wsyhuat` fetch 间歇失败**：必须重试后再下「无新工作」结论；本轮 `wsyhuat/main` 仍 `f98be0d`（2026-10-02，已吸收），`git diff --stat main wsyhuat/main` 的 91 files 系 main 自身领先量。
6. **audit 门禁零豁免 100% 严格**（#244 后）：任何新 moderate+ 公告会直接让 `Audit Dependencies` 变红——目标状态，处置路线见 D-019/D-011/D-018。
7. **部署版本核验**：`wrangler deployments list --name huat-fsac --json` **返回未按时间排序**，须自行按 `created_on` 降序取最新；当前最新 = `33724813`（第 92 轮 #252 部署）。OAuth 已登录。
8. **#249 已关闭**：定时机制已由真实 `event=schedule` run `39227547586` 验证；后续每周一定时由 Actions 自跑，无需再人工复核首轮。
9. **CSP nonce 比对必须单请求取样 + 剥 `nonce-` 前缀**：`curl -D h.txt -o b.html` 一次请求；头里 `script-src` 的 `'nonce-XXX'` 与体里 `nonce="XXX"` 比对须去掉 `nonce-` 前缀。
10. **看板页真实路径**：zh `…/docs-center/运营与协作/项目进度看板/`（URL 百分号编码）与 en `…/en/docs-center/operations-and-collaboration/project-progress-board/`；`/showcase-dashboard/` 不含 metrics 快照。
11. **⚠️ Actions 取数的 `workflow_id=` 不会过滤**：须先 `gh api …/actions/workflows` 拿数字 id（duration-budget = `385699809`，Collect Project Metrics = `238631749`），再查 `…/actions/workflows/<id>/runs`。
12. **⚠️ API 字段存在性判据**：jq 对不存在的键渲染 `null` ⇒ `--jq '.due_date'` 得到 `null` 不能证明字段无值。REST milestone 真实键是 **`due_on`**；断言前先 `--jq 'keys'` 或读原始 JSON。
13. **#251 合并纪律**：#239 若 `BEHIND`，只允许触发 release-please 工作流重跑对齐基点，**禁止**手工 rebase；不改版本号、不手写 CHANGELOG 段落。完成后转 `status:review`，不自行关单（D-006）。
14. **部署判定**：#239 diff 仅 `CHANGELOG.md` + `package.json`，version 无构建期消费点 ⇒ 按 #192 判例**预期不部署**；只有实测构建产物差异才走 `pnpm deploy:worker` + 单请求 CSP 头/体 nonce 复验。
