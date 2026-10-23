# PLAN — 项目路线图（Planning Agent 唯一写入点）

> 路线与今日队列的当前快照；任务/验收以 GitHub Issues 为准，长期约束以 `DECISIONS.md` 为准。历史轮次见 Git、Issue 评论与不可变日报，不在路线图重复堆积。

最后核实：2026-10-23（UTC），Planning 第 103 轮。同步基线：`main@b9a782ad5900a406f6e2f5c437e2e1f7b8a256ed`；`fetch --all --prune` + `pull --rebase` 成功，开工树干净、与 origin 同步。

## 当前方向

1. **v1.3.1 安全热修与发版已验收收口**：#260、#258 均独立核对后关闭；不再把已完成任务留在执行队列。
2. **收敛已有能力与开发入口的事实差距**：昨日新增 #262 搜索失效、#263 无效配置、#264 英文 README 漂移，组成 M4；只修缺陷，不启动新功能（D-017）。
3. **搜索保留原修复目标，先补工程前置**：SSR 没有可供内置 Pagefind 扫描的静态文档 HTML；#266 交付真实正文输入方案及运行证据，再由 Planner 放行 #262。不能只改 `pagefind:true`，不能未授权隐藏入口。

## 昨日验收与阻塞处置

输入：`DIARY/2026-10-22.md`（含追加会话及故障补记），并读 10-21、10-20 日报；昨日日报完整，无需反推。

| 项目                          | 结论                  | 独立证据                                                                                                                                                                                                                  |
| ----------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #260：Vitest 安全抬版         | **通过，done/closed** | `aa6517e` 仅依赖三文件；本轮 why mocker/vitest 均单一 4.1.12、audit 零豁免 exit 0、frozen-lockfile exit 0；实跑 431 passed / 40 files；该完整 SHA Pipeline/Secret Scan/Release Please 均 success。验收评论 `6355158457`。 |
| #258：v1.3.1 发版             | **通过，done/closed** | #257 MERGED → `8dc6ec2`，PR checks success；tag/Latest Release/package/CHANGELOG:8 四方一致；`1aa788f`、`1d453bf`、`aa6517e` 均为 tag 祖先；完整 SHA 三工作流 success。验收评论 `6355159815`。                            |
| 顺手项 PR #259                | **复核通过**          | `ec86cb4` 仅 metrics JSON 42+/42-；按数组索引展开的 84/84 叶路径一致、结构差异 0；完整 SHA 三工作流 success；已随 Version `a8ab6b74` 上线。                                                                               |
| #265：Release Please 外部故障 | **恢复，done/closed** | 既有 dispatch 通道重跑 `39883950976`，在 `b9a782a` 上 completed/success，watch exit 0；不改 workflow/凭据。旧 failure 仍保留，恢复评论 `6355168096`。                                                                     |

证据瑕疵已在 #260 验收注明：报告未附逐文件哈希清单，**总大小相同不能证明产物字节一致**；不采信该主张。后续实际部署已覆盖修复并通过生产 nonce 验证，因此当前交付无待补部署；不伪造旧哈希或要求重建旧版本。

本轮生产只读复核：最新 deployment `ff987bdf-9153-4eeb-83ee-24426ac1810c` → Version `a8ab6b74-a0d7-477b-a499-68056cc87e7e`（100%，2026-10-22T12:34:22Z）；首页 200，单请求 CSP 头/体 nonce 均为 `JyPqs2Nc8n9zwlLVAAkCow`。中英真实看板路径均 200，渲染 `2026/10/22 04:42:52` / `10/22/2026, 4:42:52 AM`。Dependabot 开放告警 0。

## 今日目标（2026-10-23）

- 给搜索修复交付可实施的工程结论或精确 no-go，不把调查完成写成搜索恢复。
- 让英文项目入口与中文现行事实一致，不再宣传不可用的搜索、自动部署或未经审计的合规等级。
- 清理七个无消费者配置字段及矛盾推送指引，不改变真实框架 session、认证或部署。

## 当前 Milestone：M4 开发入口与能力声明一致性（进度：0 / 4）

GitHub Milestone **#3**，state=open；初始 open=4 / closed=0：#262、#263、#264、#266。进度仅按 Planner 验收关闭计数，不按“已提交报告”计数。

计数证据与限制：GraphQL `issues.totalCount=4` 与 REST 按 milestone 查询的成员列表均确认四单 OPEN；但 REST `milestones/3.open_issues` 仍为 **1**（closed=0），两者不一致。上述 **0/4 按逐单真实成员状态计算**，不把汇总字段当作范围或完成证据；收口前须重新核对成员与汇总，禁止据错误计数缩范围或假报归零。

### 目标与验收

- #266：查证 SSR-safe 索引正文来源、路由/语言/排除规则，提交有运行证据的唯一推荐或精确 no-go。
- #262：方案经 Planner 核准后实施，保留原全部生产 AC；真实中英文检索返回正确文档，入口/快捷键/SPA 与索引一致，SSR nonce 不退化。
- #264：英文 README 的结构、命令、路径、主题与部署事实与中文一致，链接/格式检查通过。
- #263：模板与声明移除七个死字段，保留可选 Umami，推送指南不再指导缺失功能；build/typecheck/真实 secret scan 证据齐全。

### 完成信号（Success signal）

四单经 Planner 验收关闭，搜索有真实生产查询证据，README 与配置指引无本工作束中的失真声明；Milestone `open_issues=0` 后显式关闭（D-020）。**#266 完成不等于 #262 完成，当前 M4 未收敛。**

### 明确非目标（Non-goals）

- 不移除搜索、不改全站 SSR/prerender 或 nonce/缓存安全模型，不引入托管搜索、凭据、依赖大版本或 CI 编排变化。
- 不实施 OAuth/权限/数据库/推送，不改框架 `SESSION`/`ASSETS` bindings。
- 不扩展站点翻译、不修全部历史文档、不改生成的 `openwiki/`；#101/#197/majors 不计入本 Milestone。

### 执行队列（3 个 ready，建议顺序）

| 顺序 | Issue                                                    | 优先级 | 交付边界与依赖                                                                                      |
| ---- | -------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------- |
| 1    | **#266 确定 SSR-safe 搜索索引输入方案并交付可实施结论**  | P2     | **仅调查，无依赖**；报告真实正文输入与运行证据、收录规则、推荐或 no-go；不改生产代码/配置、不部署。 |
| 2    | **#264 同步英文 README 的结构与现行部署、能力事实**      | P2     | 无依赖，不等 #262/#263；默认只改英文，中文仅必要链接/格式；不宣传搜索已恢复。                       |
| 3    | **#263 清理未消费的 OAuth/VAPID 配置字段并纠正推送指南** | P3     | 无依赖；只改模板、七个声明字段与推送指南；不改 README 或其他类型/binding。                          |

三单均已补齐七项 ready 门禁；D-013 映射为 **Issue 正文首行 ready + status:backlog**。#262 **不是 ready**，不得跳过前置直接实施；#266 转 review 后等下一轮 Planner 审核，不由 Executor 自放行。

## 已知阻塞与依赖

| 项目                    | 状态                          | 处理                                                                                                                                                           |
| ----------------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #262 搜索恢复           | backlog，未过 ready           | 工程前置 #266；原修复 AC 完整保留，不是产品 pending，也不是已修复。若查证必须突破非目标，再携具体取舍转 needs-info。                                           |
| #101 恢复 CI 自动部署   | blocked / P1，无 milestone    | Secrets REST 仍仅 `CODECOV_TOKEN`、`PROJECT_TOKEN`；用户 10-12 已选单机 OAuth，不重复问。正文旧 CSP 字面判据/Windows-only 说明已纠正，主要 CI 改动不入 ready。 |
| #197 Release PR 自助 CI | needs-info / P3，无 milestone | 用户已确认默认 C，维持手工触发；与 #265 外部 GraphQL 故障不同。等待频率信号，不自动增加 PAT/App。                                                              |
| majors PR #186/#209     | 暂缓                          | D-015 standing reminders，不摄入、不关闭、不计入今日队列。                                                                                                     |

## 治理与交接约束

- 开放任务逐项查重：无重复；三条 auto-discovered 已定级、补范围/AC 并纳入 M4；P0=0，P1 仅外部阻塞 #101，无优先级膨胀。
- in-progress=0、in-review=0，无超过 24h 的执行中断现场可重置；#197 有既有答复与信号，不按普通饥饿项关闭。
- inbound：`wsyhuat/main` 仍 `f98be0d` / 更早 `d89b87e`；七个改动路径对 main 内容级 diff 空，后者为前者祖先，无新工作。旧移植已记录，不直接 merge fork。
- 本轮 TASKS 旧镜像缺 #262–#265、旧队列仍含已交付项：以 Issue 为准整体重写。旧 STATE/HANDOFF 现场不改写；按仓库必需回写规则仅附 Planner 接力补记，下一轮 Executor 自行刷新当前快照。ENV/DIARY 不改。
- 调查不新增永久测试/文档；#263/#264 沿用既有验证。完成留 §1.7 全字段报告转 review，关单归 Planner；`.agent` 与代码分开提交。
- 若生成 bot metrics PR，先处理上述队列；只在确认纯值变化/schema 不变、checks 通过后常态处置并按站点变更部署。不预先声称当前有 bot PR。

## 下一阶段

先验收三项今日交付，按 #266 证据使 #262 成为明确可实施修复；若 no-go，保持缺陷未完成并治理真实前置。M4 收口后回到依赖摄入与发版的稳态循环，不自动启动新功能。

M3（milestone #2）保持 closed：14/14；M2（#1）保持 closed：5/5。`v1.3.1` 已发布，不重新发同版本。

## 已放弃或暂缓的方向

- Starlight ≥0.42、wrangler/TS/actions 等 majors 自动摄入：D-003/D-004/D-015。
- 逐个合并 Dependabot 自动 PR：D-005/D-009/D-014；直接 merge 协作 fork：WORKFLOW §1.6。
- 为搜索改全站预渲染、只开开关冒充修复、无授权隐藏入口：与既有安全模型/完整验收冲突。
- 预防性扩展 lint/format/typecheck 门禁、远程历史分支清理：无本轮实证需求或需删除授权，不排期。

## Decision Gate

pending=0；D-001..D-021 生效。当前工程前置、死配置清理和文档同步均可自行处理；不把查得到的问题交给用户。

## 给 Executor 的指令

按 **#266 → #264 → #263** 执行，各单只消费自身允许文件；#266 仅调查，勿接着自行实施 #262。完成后逐单报告并转 review，刷新 STATE/HANDOFF、追加当日日报与 WORKFLOW §7.4；不关闭任务，不触碰 majors、CI deploy 或既有安全模型。

## 本轮验证证据

- `pnpm quality:audit`、`pnpm why @vitest/mocker`、`pnpm why vitest`、`pnpm install --frozen-lockfile` 均 exit 0；安全版本单一 4.1.12、豁免清单为空。
- `pnpm test:run` exit 0：Vitest 4.1.12，431 passed / 40 files；jsdom 输出 navigation not implemented 提示，不影响测试通过。
- 规划文档 Prettier check 通过；Issue 权威断言通过：开放六单、ready 恰为 #266/#264/#263、三个验收/恢复单 CLOSED+done，PLAN/TASKS 顺序一致。
- `pnpm build` exit 0，输出 `Complete!`、`output:server` 与框架 `SESSION` binding；**不是零警告构建**：有 Astro markdown 管线弃用提示及 Vite `use astro:head-inject` 的 MODULE_LEVEL_DIRECTIVE 警告，完整输出保留于本轮工具记录 `artifact://33`。本轮不改源代码、不压掉警告，也不把它们写成搜索修复证据。
- 本轮只提交规划/接力文档与 Issue 治理；无站点实现或资产变动，不部署。未重跑 E2E、LHCI、全量 lint/typecheck/bundle/routes/theme；昨日交付的对应完整 SHA CI 已核对，不冒充本轮全套门禁输出。
