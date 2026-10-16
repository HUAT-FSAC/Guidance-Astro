# TASKS — Issue 本地镜像（Planner 每轮整体重写；权威来源 = GitHub Issue）

> 最后同步：2026-10-16T16:22Z（UTC，`date -u`；本地日期 2026-10-17）｜同步人：第 82 轮 Planner 整体重写｜核实基线 `main@f42acd3`（写入时 HEAD，与 origin 同步 0/0）
> 权威来源 = GitHub Issue（`gh` 可用，本轮实测 token 有效、scopes 含 `repo`/`workflow`）。网络对 `api.github.com` 有间歇性 TLS/EOF 抖动，所有 gh 调用均需重试包裹。
> `ready` 标签在本仓不存在（沿用 D-013 映射）⇒ 队列状态以 **Issue 正文首行「队列状态：`ready`」+ `status:backlog`** 为准。

## 今日队列（给 Executor 的建议顺序）

| #    | 任务                                                                                  | 优先级 | 状态  | 顺序理由                                                                           |
| ---- | ------------------------------------------------------------------------------------- | ------ | ----- | ---------------------------------------------------------------------------------- |
| #242 | 真实触发 duration-budget 三条路径复核并修正样本表 null 渲染                           | P3     | ready | **死线 2026-10-19T03:23Z**：每周定时首轮之前必须完成（今日不做的窗口只剩 1 天）    |
| #244 | 移除未使用的 `@fullhuman/postcss-purgecss`，彻底消除 braces 公告并删除 audit 豁免条目 | P2     | ready | 本轮新建；一行依赖删除即可让 D-018 的 2026-10-31 硬墙与 A/B/C 用户提问**永久消失** |

> 顺序：先 #242（有日历死线）再 #244（无死线但收益大、成本极低）。
> **顺手项（不建单）**：① bot metrics PR **#241** 按 §2.2 常态处置；② **`ENV.md §5` 标签表修正**（该表称 `blocked`/`needs-info`/`priority:p4` 不存在，实测三者均存在——ENV 属 Executor 所有权，Planner 已连续两轮指出未代改）；③ **本地分支卫生**：`agent/issue-182-*` / `201-*` / `203-*` 等历史分支残留。
> **勿合 PR #239**（rp `release 1.3.0` 属 minor，D-012 第 2 档随 Milestone 收尾合并，M3 due 2026-11-14）。

## 全部开放 Issue

| #    | 标题                                                                                                | 标签                                          | 状态                                                               |
| ---- | --------------------------------------------------------------------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------ |
| #244 | 移除未使用的 devDependency `@fullhuman/postcss-purgecss`，彻底消除 braces 公告并删除 audit 豁免条目 | P2/quality/devops/task/risk:low               | ready（第 82 轮新建）                                              |
| #242 | 真实触发 duration-budget 三条路径复核并修正 null 渲染                                               | P3/quality/devops/task                        | ready（第 81 轮新建，本轮复核门禁仍合格）                          |
| #197 | 评估解锁 release-please Release PR 的 PR 级自助 CI                                                  | P3/devops/dependencies/risk:medium/needs-info | needs-info（默认 C = 维持手工触发，用户 10-12 确认）               |
| #101 | 恢复 CI 自动部署，消除单机 wrangler OAuth 单点                                                      | P1/devops/task/risk:medium/blocked            | blocked（第九度复核 Secrets 仍仅 `CODECOV_TOKEN`/`PROJECT_TOKEN`） |

## 已关闭（本轮相关）

- **#199 braces audit 豁免续期** —— 第 82 轮验收**通过**并关闭（`status:done`）。六条验收标准全部**独立亲跑复现**（不采信报告）：`git show --stat 478777d` 单文件 3+/3-；diff 仅 `expires`/`reason`/`issue` 三字段；`npm view braces dist-tags.latest` = `3.0.3`（本轮第十二次亲测）＋ `time.modified` = `2024-09-18T05:27:12Z`；`pnpm quality:audit` exit 0 且 `expires 2026-10-31 (15d)`、无 3 天内提醒；`test:run tests/unit/audit-gate.test.ts` 13/13；`audit-gate.mjs:149` 仍 `moderate`、`ci-cd.yml:85` 未增删步骤；PR #243 MERGED（`files=1`）；main `478777d` CI/CD Pipeline success、0 失败。
    - **记录更正 3 处（不改验收结论，均在验收评论留痕）**：①「13 success / 7 skipped」是 `gh run list` 默认 limit 20 **未按 head SHA 过滤**的结果，按 `head_sha=478777d` 精确统计为 **3 success + 4 skipped + 0 失败（共 7 条 run）**；②「PR #243 checks 16 项全 pass」实测 **17 pass + 8 skipping**；③ 第 81 轮写入的「`audit` 是 `build` 的前置 job」**与实测不符**（`build.needs=[test, typecheck]`，audit 为并行 job，历史上从未前置；「过期会让 run 变红」这一结论不变）。

## 开放 PR（非任务，供处置参考）

| #    | 标题                                               | 性质                         | 处置口径                                                                                                                                                   |
| ---- | -------------------------------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #241 | `chore(metrics): update project progress snapshot` | bot 按日再生（10-16 04:30Z） | **Executor 顺手处置**（PLAN §2.2）：本轮实测 `files=1`（`src/data/metrics/project-progress.json` +43/-43）＝数据-only，合入后验 main CI + 视数据变更重部署 |
| #239 | `chore(main): release 1.3.0`                       | release-please               | **保持 open 不合并**：D-012 规定 minor 随 Milestone 收尾合并（M3 due 2026-11-14）                                                                          |
| #209 | `chore(deps): bump the majors group`               | dependabot (npm)             | 暂缓（D-015）                                                                                                                                              |
| #186 | `chore(deps): bump the majors group`               | dependabot (actions)         | 暂缓（D-015）                                                                                                                                              |

## 环境信号（需 Executor 注意）

1. **`gh run list` 默认只回 20 条且不按 commit 过滤** —— 本轮实证：`gh run list --json conclusion` 的 13 success / 7 skipped 恰好是默认分页的 20 条，其 `headSha` 横跨 4 个不同提交。**声称"某 commit 的 CI 全绿"时必须用 `--commit`/`head_sha=` 或 `gh api actions/runs?head_sha=<sha>` 精确取数**，否则数字口径失实（第 81 轮执行报告已踩此坑）。
2. **`ENV.md §5` 标签表仍过期**（连续两轮指出）：实测仓库存在 `blocked`/`needs-info`/`priority:p4`，另新增确认 `risk:low`/`risk:high`/`risk:blocker`/`type:tech-debt` 亦在。请下一棒修正该表，避免后续轮次跳过 `--add-label` 动作。
3. **`check-duration-budget.mjs --dry-run` 的 `-s` 计数是时间相关的**：#242 正文写的开工基线 `grep -c -- '| -s |'` = **6**（第 81 轮），本轮 Planner 实测为 **2**（旧 run 已滚出样本窗口）。**#242 执行时必须以当轮实测值为开工基线**，验收判据「= 0」不变。
4. **`wsyhuat` fetch 间歇失败**：必须重试后才下「无新工作」结论；`f98be0d` 触及的 7 路径内容级比对空 diff = 已吸收（本轮复验）。
