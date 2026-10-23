# TASKS — Issue 本地镜像

> 同步：2026-10-23（UTC），Planner 第 103 轮整体重写。权威来源 = **GitHub Issue**；`gh` 可读写，无降级。
> 同步基线 `main@b9a782ad5900a406f6e2f5c437e2e1f7b8a256ed`。ready 沿 D-013：**正文首行 ready + status:backlog**；`status:review` = in-review。

## 今日队列（2026-10-23，3 项，建议顺序）

| 顺序 | Issue / 任务                                                                                                   | 优先级 | 状态  | 依赖与完成边界                                                                                                       |
| ---- | -------------------------------------------------------------------------------------------------------------- | ------ | ----- | -------------------------------------------------------------------------------------------------------------------- |
| 1    | [#266 确定 SSR-safe 搜索索引输入方案并交付可实施结论](https://github.com/HUAT-FSAC/Guidance-Astro/issues/266)  | P2     | ready | 无依赖；仅调查，报告真实正文来源/路由收录/最小运行证据/唯一推荐或精确 no-go，不改生产代码、不部署，不等于修复 #262。 |
| 2    | [#264 同步英文 README 的结构与现行部署、能力事实](https://github.com/HUAT-FSAC/Guidance-Astro/issues/264)      | P2     | ready | 无依赖，不等搜索/配置任务；以中文为基线，默认只改英文；中文仅必要链接/纯格式，不重写人类正文。                       |
| 3    | [#263 清理未消费的 OAuth/VAPID 配置字段并纠正推送指南](https://github.com/HUAT-FSAC/Guidance-Astro/issues/263) | P3     | ready | 无依赖；方案 A 已定，只改模板、七个声明字段与推送指南，不改 README/真实 binding/其他类型。                           |

三项均已完成目标、范围/非目标、依赖、无产品未决、可测 AC、红线、陌生工程师可开工七项门禁。**#262 不在今日队列**；#266 报告先交 Planner，Executor 不得自行放行后续实施。

## 全部开放 Issue（6 项）

| Issue | 标题                                            | 优先级 / 风险 | 状态及实际标签                                                                  | Milestone / 下一步                                                      |
| ----- | ----------------------------------------------- | ------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| #266  | 确定 SSR-safe 搜索索引输入方案并交付可实施结论  | P2 / low      | ready；status:backlog、type:task、area:frontend                                 | M4 #3；今日第 1 项                                                      |
| #264  | 同步英文 README 的结构与现行部署、能力事实      | P2 / low      | ready；status:backlog、documentation、area:docs、auto-discovered                | M4 #3；今日第 2 项                                                      |
| #263  | 清理未消费的 OAuth/VAPID 配置字段并纠正推送指南 | P3 / low      | ready；status:backlog、type:tech-debt、area:devops、auto-discovered             | M4 #3；今日第 3 项                                                      |
| #262  | 站内搜索：Pagefind 索引未生成                   | P2 / medium   | **backlog，非 ready**；status:backlog、type:bug、area:frontend、auto-discovered | M4 #3；依赖 #266 结论由 Planner 核准，原生产修复 AC 完整保留            |
| #197  | 评估 Release PR 的 PR 级自助 CI                 | P3 / medium   | needs-info；area:devops、type:task、dependencies                                | 无；用户 10-12 已确认 C，不改 workflow，等待发版频率信号                |
| #101  | 恢复 CI 自动部署，消除单机 OAuth 单点           | P1 / medium   | blocked；status:backlog、area:devops、type:task                                 | 无；Secret 仍缺，用户已确认单机部署；正文旧 CSP/Windows-only 说明已纠正 |

计数：ready=3，未准入 backlog=1，blocked=1，needs-info=1；in-progress=0，in-review=0；开放 P0=0，P1=1（外部阻塞 #101）。不把 backlog 标签本身当可领取。

### Milestone 核实

- **M4 #3 开发入口与能力声明一致性：0/4**。GraphQL `issues.totalCount=4` 与 REST 成员列表均为 #262/#263/#264/#266，全部 OPEN。
- **API 汇总不一致已显式记录**：`milestones/3` 的 `open_issues=1 / closed_issues=0`，与上述两源成员列表不一致；不据此把范围缩成 1 项，不虚报归零。当前进度由逐单实际成员状态计算；收口时重新核对，禁止仅凭该汇总字段关 Milestone。
- M3 #2：closed，open=0 / closed=14；M2 #1：closed，open=0 / closed=5。#101/#197 不计入 M4（D-020）。

## 任务范围交接

### #266：工程前置，不替代修复

- 事实：`output:server` + Starlight `prerender:false`；内置 Pagefind 只扫描构建 HTML。只开 `pagefind:true` 不足以收录 SSR 文档。
- 调查：已安装 API `addHTMLFile` / `addCustomRecord`、真实 MDX 正文输入接缝、中英 URL/fallback/draft/stub/pagefind 排除规则、构建/部署挂接与失败出口。
- 运行证据：既有命令或不提交的隔离探针；真实正文无法取得时给精确 no-go，不以文件存在、URL 列表或静态阅读假报可用。
- 不改生产代码/配置/永久测试、不加依赖、不部署、不隐藏搜索、不改变 SSR 或 nonce。原 #262 仍须后续实施和生产检索验收。

### #264：README 事实同步

- 范围：中文 14 个主章节及快速开始 4 个子节对应；SSR、本地 OAuth、5 主题、版本、内容路径、可选 Umami、全部现行命令与链接。
- 不再声称自动 deploy、搜索可用、zero-JS、WCAG AA、Classic Orange 或 OAuth 必需 API Token；不把旧 package/Makefile 宣传当事实。
- 检查：两份 README 的 `prettier --check`、本地链接目标、命令/事实逐项核对及文档 build；不新增措辞测试，不实现搜索。

### #263：只清死字段，不改认证或框架 session

- 七个字段：`SESSION_SECRET`、`GITHUB_CLIENT_ID`、`GITHUB_CLIENT_SECRET`、`QQ_APP_ID`、`QQ_APP_KEY`、`VAPID_PUBLIC_KEY`、`VAPID_PRIVATE_KEY`。
- 允许文件：`.dev.vars.example`、`src/env.d.ts` 上述字段、`docs/guides/PUSH_NOTIFICATION_SETUP.md`；保留可选 `UMAMI_WEBSITE_ID`。
- 不动 DB/SESSION_KV 占位、App.Locals、框架实际 `SESSION`/`ASSETS` binding、middleware、Umami 逻辑、CI 或扫描策略；不把 Wrangler 部署 OAuth 与业务 OAuth 混为一谈。
- 检查：无必需变量的真实 build、tsc、实际 secret scan 结果；工具缺失 skip 不算 PASS，Markdown/.example 被 allowlist 豁免仍需人工审查；不改 README，不新增测试。

## 本轮验收与昨日信号回应

| 项目         | 结论与证据                                                                                                                                                                                                                                                                                             |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| #260         | **通过并关闭，status:done**；验收评论 [6355158457](https://github.com/HUAT-FSAC/Guidance-Astro/issues/260#issuecomment-6355158457)。本轮 why 仅 4.1.12、audit 零豁免/frozen-lockfile exit 0、Vitest 实跑 431/431；`aa6517e` 三工作流 success。未附逐文件哈希的主张不采信，后续实际部署已覆盖修复闭环。 |
| #258         | **通过并关闭，status:done**；验收评论 [6355159815](https://github.com/HUAT-FSAC/Guidance-Astro/issues/258#issuecomment-6355159815)。#257 MERGED → `8dc6ec2`，v1.3.1 四方一致与三祖先成立，PR checks/合并 SHA CI success；元数据变更无单独部署需要。                                                    |
| PR #259      | **顺手项复核通过**；`ec86cb4` 仅 JSON 值变化，84 个展开叶路径一致，三工作流 success；Version `a8ab6b74` 上线，看板双语 200/10-22 快照。                                                                                                                                                                |
| #265         | **外部故障已恢复并关闭**；`workflow_dispatch` run `39883950976` 在 `b9a782a` 上 success，watch exit 0，评论 [6355168096](https://github.com/HUAT-FSAC/Guidance-Astro/issues/265#issuecomment-6355168096)。降 P2、补 done，不修改 CI/凭据；旧失败记录保留。                                             |
| 新 #262–#264 | 已逐项分诊、补标准并纳入 M4；#263 选 A、#264 ready；#262 先拆 #266 工程调查，不直接 ready 或擅自删功能。                                                                                                                                                                                               |
| 旧镜像漂移   | 昨日 TASKS 尚缺新单，旧队列/验收记录互相矛盾；本轮以 Issue 为准整体重写。旧 STATE/HANDOFF 仅按仓库规则附 Planner 接力补记，运行快照由下一轮 Executor 刷新；ENV/DIARY 不改。                                                                                                                            |

## 开放 PR（2 张）

| PR                         | 处置               |
| -------------------------- | ------------------ |
| #209 npm majors            | D-015 暂缓，不摄入 |
| #186 GitHub Actions majors | D-015 暂缓，不摄入 |

当前无开放 Release PR 或 bot metrics PR；后续新生成者按 PLAN 常态指令处置，不预造任务。

## 环境与证据纪律

- 当前站点代码已上线 Version `a8ab6b74-a0d7-477b-a499-68056cc87e7e`（100%）。本轮首页与中英看板 200；单请求 CSP 头/体 nonce 同为 `JyPqs2Nc8n9zwlLVAAkCow`。
- `b9a782a` 的 Pipeline `39808003841` / Secret Scan `39808003855` success，原 Release Please `39808003398` failure；恢复 dispatch `39883950976` success。不能把旧失败抹为“该 SHA 从未失败”。
- 完整 SHA 的 `actions/runs?head_sha=` 取证；短 SHA/默认 20 条 run 列表不足以断言全绿。
- nonce 必须单请求取头/体比较；`content-security-policy: nonce-` 不是有效字面判据。
- inbound 七路径内容级 diff 空；`f98be0d`/`d89b87e` 为已记录历史，无新工作；不直接 merge fork。
- #101 的外部 Secret 和 #197 的已答复默认 C 不重复问；pending=0，majors 暂缓，M4 不含常驻观察项。
- 完成逐单提交 §1.7 报告转 review，不自行关单；调查不提交生产代码。执行中发现真实红线再停止扩围，不凭本计划修改 CI/认证/SSR。
