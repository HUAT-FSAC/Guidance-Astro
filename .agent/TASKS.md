# TASKS — Issue 本地镜像（Planner 每轮整体重写；权威来源 = GitHub Issue）

> 最后同步：2026-10-20T23:40Z（UTC；本地日期 **2026-10-21**）｜同步人：**第 99 轮 Planner 整体重写**（禁增量打补丁）｜核实基线 `main@085fb22`（第 98 轮 `.agent` 收尾提交，与 origin 同步 `0/0`）；最近代码 SHA `db31f6f`（rp Release PR #239 发版 `1.3.0`）与 `8d0d75a`（bot PR #253 metrics 快照）。**本轮新鲜取证**：`pnpm quality:audit` **exit 1**（6 条未覆盖 = 3 GHSA × 2 个 vite 版本）⇒ **main 下次 push 必红**；`pnpm why vite` = `8.1.5` + `8.3.0`；HEAD `085fb22` 完整 SHA 三连 success（17:01Z，公告发布前）；线上 `/` 200 + 单请求 CSP nonce 一致（`qNYK1dXdQVD9zY5yIQyNhQ`）；最新 version_id `35127731-f8db-4910-832a-dac8eb5ee098`（deployment `2c488529…`，100%）；dependabot 开放告警 **1**（#188 / GHSA-698v-4r3x-3vcv）；secret-scanning 开放告警 0。
> 权威来源 = GitHub Issue（`gh` 可用，token 有效）。网络对 `api.github.com` 有间歇 TLS/EOF 抖动，gh 调用带重试。
> `ready` 标签在本仓不存在（沿用 D-013 映射）⇒ 队列状态以 **Issue 正文首行「队列状态：`ready`」+ `status:backlog`** 为准。

## 今日队列（本地 2026-10-21，给 Executor 的建议顺序）

| #   | 任务                                                                                     | 优先级 | 状态  | 顺序理由                                                                                                   |
| --- | ---------------------------------------------------------------------------------------- | ------ | ----- | ---------------------------------------------------------------------------------------------------------- |
| 1   | **#254** 升级 vite 至 ≥8.3.3 消除 3 条公告（1 high），恢复 `quality:audit` 与 main CI 绿 | P0     | ready | 唯一阻塞项：audit 门禁已实测 exit 1，任何 push（含 `.agent` 提交）都会把 main 染红；必须先修再谈其他交付。 |

> **顺序说明**：第 99 轮为**同日加跑**——第 98 轮 17:00Z 收尾后，npm 于 18:30:24Z / 19:48:25Z / 19:51:52Z 连发 3 条 `launch-editor`/`vite` 公告（1 high + 2 medium），使 audit job（无路径过滤、每次 push 都跑）必红。今日可开工 Issue = **1**，不制造任务。
> **今日常态顺手项（不建单）**：当前无开放 bot metrics PR（#253 已处置合入）；下一张预期 **2026-10-21T04:3xZ（UTC）** 再生，届时按长期指令处置（schema 逐键一致 → 合入 → 完整 SHA CI → 视数据变更部署）。若与 #254 同日出现，**先修 #254**。
> **勿合 majors #186/#209**：D-015 暂缓。
> **#101 保持 blocked**：第 99 轮复核 Actions Secrets 仍仅 `CODECOV_TOKEN`/`PROJECT_TOKEN`。
> **#254 合入前不要合并无关改动到 main**：audit 红会把无关提交一起染红。

## 验收记录（第 99 轮复核；第 97 轮明细保留）

- **第 99 轮：无新执行轮次可验收**——`status:review` / `in-progress` 双零；#251 复核仍 `CLOSED/COMPLETED` + `status:done`（closedAt `2026-10-20T13:39:52Z`）；M3 / M2 均 `closed`；`v1.3.0` 仍 Latest（`draft=false` / `prerelease=false`）。
- **第 99 轮稳态取证**：HEAD `085fb22` 的 `CI/CD Pipeline` / `Secret Scan` / `Release Please` 于 17:01Z 均 success（**公告发布前**，不能代表当前依赖状态）；最新 deployment `2c488529-411d-4d5f-91d3-5c81d259b692` → version_id `35127731-f8db-4910-832a-dac8eb5ee098`（100%，2026-10-20T11:15:12Z）；线上单请求头/体 nonce 一致、`/` 200、`cache-control` 合规；inbound `wsyhuat/main` 按 `f98be0d` 的 7 个改动路径做内容级 diff = 空；无 `.agent/LOCK`。
- **第 99 轮新发现（P0）**：`pnpm quality:audit` exit 1（`GHSA-587h-7wmj-h5pm` high / `GHSA-698v-4r3x-3vcv` medium / `GHSA-r825-w8mm-5pxw` medium，各命中 `vite@8.1.5` 与 `vite@8.3.0`）；Dependabot 安全更新 run `39486965261` 以 `security_update_not_possible` 失败（latest-resolvable `8.1.5` / lowest-non-vulnerable `8.1.6`），未开 PR ⇒ 人工抬版，#254 承接。
- **第 98 轮更正**：第 98 轮「dependabot 开放告警 0」在其 17:00Z 取证时点为真，现已被 18:30Z 后的新公告作废（更正留痕，不回写旧行）。

### 第 97 轮 #251 验收明细（保留，已关闭）

1. `milestones/2` = `open=0 state=closed`；`gh pr view 239` = MERGED + `db31f6f`；`v1.3.0` Latest + tag 在位；`package.json` 1.3.0 + `CHANGELOG.md` 命中；祖先判定对 `8d0d75a` / `af74ecd` 均成立。
2. `db31f6f` 完整 SHA CI 三连 success；部署 Version `35127731` 实测生效，单请求 CSP nonce 一致，中英看板页 200 渲染 `2026/10/20 04:49:14`。
3. #251 已打 `status:done` 并关闭；M4 暂不创建（无待排期工作束）。

## 全部开放 Issue

| #    | 标题                                                                          | 标签                                                                | 状态                                                                   | Milestone          |
| ---- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------ |
| #254 | 升级 vite 至 ≥8.3.3 消除 3 条公告（1 high），恢复 quality:audit 与 main CI 绿 | priority:p0/security/dependencies/area:devops/type:task/risk:medium | **ready**（正文首行 `队列状态：ready`；无依赖）                        | 无                 |
| #197 | 评估解锁 release-please Release PR 的 PR 级自助 CI                            | P3/devops/dependencies/risk:medium/needs-info                       | needs-info（默认 C = 维持手工触发，用户 10-12 确认；信号触发型非饥饿） | **无**             |
| #101 | [Task] 恢复 CI 自动部署，消除单机 wrangler OAuth 单点                         | P1/devops/task/risk:medium/blocked                                  | blocked（第 99 轮复核 Secrets 仍仅 `CODECOV_TOKEN`/`PROJECT_TOKEN`）   | 不在任何 Milestone |

> **Milestone #2（M3）与 Milestone #1（M2）均已关闭**。
> **当前无开放 Milestone**；M4 暂不创建（单点热修不构成工作束）。

## 开放 PR（非任务，供处置参考）

| #    | 标题                                                          | 性质                | 处置口径      |
| ---- | ------------------------------------------------------------- | ------------------- | ------------- |
| #209 | `chore(deps): bump the majors group across 1 directory with…` | dependabot (npm)    | 暂缓（D-015） |
| #186 | `chore(deps): bump the majors group across 1 directory with…` | dependabot (github) | 暂缓（D-015） |

> 开放 PR 共 **2** 张（majors 2）。当前无开放 bot PR。

## 环境信号（需 Executor 注意）

1. **`gh api actions/secrets` 不带 repo 路径返回 404**——须用 `gh api repos/<owner>/<repo>/actions/secrets`；404 ≠「无 secrets」也 ≠「无权限」。
2. **CI 计数口径**：`gh run list` 默认只回 20 条且不按 commit 过滤；REST `head_sha=` **只认完整 SHA**（短 SHA 返回空列表）。「某 commit 全绿」断言必须 `gh api "…/actions/runs?head_sha=<full-sha>"`。
3. **`wsyhuat` fetch 间歇失败**：必须重试后再下「无新工作」结论；本轮 `wsyhuat/main` 仍 `f98be0d`（2026-10-02），其 7 个改动路径内容级 diff = 空（已吸收）。
4. **audit 门禁零豁免 100% 严格**（#244 后）：任何新 moderate+ 公告会直接让 `Audit Dependencies` 变红——目标状态，处置路线按 **D-021**（有补丁即升级、不豁免；跨 major 才需用户）。
5. **部署版本核验**：`wrangler deployments list --name huat-fsac --json` **返回未按时间排序**，须自行按 `created_on` 降序取最新；顶部 `id` 是 **deployment ID**，线上版本看 `versions[0].version_id`。当前最新 deployment `2c488529-411d-4d5f-91d3-5c81d259b692` → version_id `35127731-f8db-4910-832a-dac8eb5ee098`（100%，2026-10-20T11:15:12Z）。OAuth 已登录可用。
6. **CSP nonce 比对必须单请求取样 + 剥 `nonce-` 前缀**：`curl -D h.txt -o b.html` 一次请求；头里 `script-src` 的 `'nonce-XXX'` 与体里 `nonce="XXX"` 比对须去掉 `nonce-` 前缀。
7. **看板页真实路径**：zh `…/docs-center/运营与协作/项目进度看板/`（URL 百分号编码）与 en `…/en/docs-center/运营与协作/项目进度看板/`；`/showcase-dashboard/` 不含 metrics 快照。
8. **版本四方核验与祖先判定**：已由 #251 闭环证实；后续发版严格遵守 WORKFLOW §11。
9. **公告时间窗（第 99 轮新增）**：安全公告可能在两轮之间发布，上一轮的「告警 0 / CI 全绿」会瞬间过期；**每轮规划用 `pnpm quality:audit` 只读复核当前依赖树**。Dependabot 安全更新 job 也可能以 `security_update_not_possible` 失败且不开 PR（run `39486965261` 实证），不能等 bot。
10. **流程欠账**：`STATE.md` / `HANDOFF.md` 仍为第 96 轮口径（称「待 Planner 验收 #251」），**下一轮 Executor 开工先刷新**；第 97 轮漏记的 `docs/WORKFLOW.md §7.4` 已由第 98 轮补记。
11. **分支卫生**：本地 36 条 / origin 45 条（含 main），绝大多数为 2026-09-30～10-14 的历史分支；`origin/agent/issue-228-flaky` 对应已关闭 #228。无活跃开发分支；远程清理需人类确认，不排期、不建单。
