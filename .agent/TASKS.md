# TASKS — Issue 本地镜像（Planner 每轮整体重写；权威来源 = GitHub Issue）

> 最后同步：2026-10-18T11:15Z（UTC，`date -u`；本地日期 2026-10-18）｜同步人：第 87 轮 Planner 整体重写｜核实基线 `main@cab7334`（写入时 HEAD，与 origin 同步 0/0；该 SHA 的 CI 按完整 head SHA 取数：`CI/CD Pipeline` / `Secret Scan` / `Release Please` 均 **success、0 失败**）
> 权威来源 = GitHub Issue（`gh` 可用，本轮实测 token 有效）。网络对 `api.github.com` 有间歇性 TLS/EOF 抖动，所有 gh 调用均需重试包裹。
> `ready` 标签在本仓不存在（沿用 D-013 映射）⇒ 队列状态以 **Issue 正文首行「队列状态：`ready`」+ `status:backlog`** 为准。

## 今日队列（给 Executor 的建议顺序）

| #    | 任务                                                               | 优先级 | 状态                      | 顺序理由                                                                                                                                                                                                                           |
| ---- | ------------------------------------------------------------------ | ------ | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #249 | 复核 duration-budget 每周定时首轮（`schedule` 事件）真实结果并留痕 | P3     | ready（**开工条件未到**） | **唯一在队 Issue**。⚠️ **`2026-10-19T03:23Z` 之前不要领取**——本轮实测 run 列表仍只有 3 条 `workflow_dispatch`（`38994214652`/`38994266641`/`38994309084`），尚无 `event=schedule`；提前跑取不到目标证据。到点后按单内 4 条标准取证 |
| —    | （顺手项）bot metrics PR #250 处置                                 | —      | **待处置**                | 今日 04:32Z 再生。按 PLAN §2.2 处置：确认 `files=1` 数据-only 且 schema 与 main 逐键一致才 squash 合入 → 验合入后 main CI（完整 SHA）→ 部署 worker 并复验                                                                          |
| —    | （条件触发）每周 dependabot 扫描批次                               | —      | **10-19 起可能触发**      | 周一扫描若开出 minor-and-patch PR，按 D-014 批次处置；今日无实体现身，不预建单                                                                                                                                                     |
| —    | （巡检）inbound / LOCK / 开放 PR                                   | —      | **常备**                  | `wsyhuat/main` 仍 `f98be0d`/`d89b87e`（内容级已吸收）；无 LOCK；开放 PR = #250（待合）+ #239（勿合）+ #209/#186（D-015 暂缓）                                                                                                      |

> 顺序说明：第 87 轮为**治理 + 巡检轮**。`ready` 队列今日**可开工 Issue = 0**（#249 条件未到；#197 为信号触发型 `needs-info`；#101 为人类阻塞）。按 PLAN 文件头纪律，**不为凑 2–5 区间制造任务**；Executor 今日执行顺手项 PR #250 处置与例行巡检，若无其它新事，**零交付稳态收尾是正常结果**。
> **勿合 PR #239**（rp `release 1.3.0` 属 minor，D-012 第 2 档随 Milestone 收尾合并，M3 due 2026-11-14）。

## 上轮验收（第 87 轮 Planner 独立核对）

- **验收队列**：`status:review` = 0（#242/#244 已于第 84 轮关闭），无 `in-progress`。自第 86 轮后 Executor 未运行（因 #249 条件未到），无待验收单或执行报告欠账。
- **顺手项更替**：第 85 轮顺手项 #248 验收已于第 86 轮完成；本轮新捕获 bot metrics PR #250（今日 04:32Z 生成），登记入今日队列待 Executor 顺手处置。

## 全部开放 Issue

| #    | 标题                                                             | 标签                                                          | 状态                                                                     | Milestone |
| ---- | ---------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------ | --------- |
| #249 | 复核 duration-budget 每周定时首轮（schedule 事件）真实结果并留痕 | P3/status:backlog/area:devops/area:quality/type:task/risk:low | ready（第 84 轮新建；**开工条件 = `2026-10-19T03:23Z` 之后**）           | M3        |
| #197 | 评估解锁 release-please Release PR 的 PR 级自助 CI               | P3/devops/dependencies/risk:medium/needs-info                 | needs-info（默认 C = 维持手工触发，用户 10-12 确认；信号触发型非饥饿）   | M3        |
| #101 | [Task] 恢复 CI 自动部署，消除单机 wrangler OAuth 单点            | P1/devops/task/risk:medium/blocked                            | blocked（第 87 轮再次复核 Secrets 仍仅 `CODECOV_TOKEN`/`PROJECT_TOKEN`） | 不在 M3   |

## 开放 PR（非任务，供处置参考）

| #    | 标题                                                          | 性质                 | 处置口径                                                                                |
| ---- | ------------------------------------------------------------- | -------------------- | --------------------------------------------------------------------------------------- |
| #250 | `chore(metrics): update project progress snapshot`            | bot metrics          | **今日 04:32Z 再生，待 Executor 顺手处置**（files=1 数据-only，schema 逐键一致）        |
| #239 | `chore(main): release 1.3.0`                                  | release-please       | **保持 open 不合并**：D-012 第 2 档「minor 随 Milestone 收尾合并」（M3 due 2026-11-14） |
| #209 | `chore(deps): bump the majors group across 1 directory with…` | dependabot (npm)     | 暂缓（D-015）                                                                           |
| #186 | `chore(deps): bump the majors group across 1 directory with…` | dependabot (actions) | 暂缓（D-015）                                                                           |

## 环境信号（需 Executor 注意）

1. **`gh api actions/secrets` 不带 repo 路径返回 404**（第 84 轮实测）——须用 `gh api repos/<owner>/<repo>/actions/secrets`；404 ≠「无 secrets」也 ≠「无权限」，勿据此误判 #101 状态。
2. **CI 计数口径**：`gh run list` 默认只回 20 条且不按 commit 过滤；REST `head_sha=` **只认完整 SHA**（短 SHA 返回空列表）。「某 commit 全绿」断言必须 `gh api "…/actions/runs?head_sha=<full-sha>"` 或 `--commit`。
3. **`gh issue list --search "[x] in:title"` 非字面匹配**（方括号被当查询语法忽略）：`[duration-budget]` 前缀单的计数须用 `gh api '…/issues?state=all&per_page=100'` + `startswith()`。
4. **`check-duration-budget.mjs --dry-run` 的 `-s` 计数与 P95 数值随采样窗口漂移**（历史：6→2→1→0）：判据用「当轮计数 = 0 + 同窗口 A/B」，勿与历史绝对值比对。
5. **`wsyhuat` fetch 间歇失败**：必须重试后才下「无新工作」结论；第 86/87 轮复核 `f98be0d` 触及 7 路径内容级 `git diff --stat` = 空（已吸收）。
6. **audit 门禁现为零豁免 100% 严格**（#244 后）：任何新 moderate+ 公告会直接让 `Audit Dependencies` 变红——这是**目标状态**，处置路线见 D-019/D-011/D-018，回滚 `git revert 75ae26c`。
7. **部署版本核验新手法（第 86 轮实测）**：`wrangler deployments list --name huat-fsac --json` 可直接取 `created_on` + `version_id`（OAuth 已登录；比只看线上页面更硬），再配合同请求 CSP nonce 头/体比对与看板快照时间。
8. **#249 到点判据**：当前 `gh run list --workflow=duration-budget.yml` 仅 3 条 `workflow_dispatch`；`event=schedule` 的 run 在 `2026-10-19T03:23Z` 之前不存在属预期，**不要据此提前转 blocked**。
