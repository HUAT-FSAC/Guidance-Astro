# PLAN — 项目路线图

> 2026-11-28 · Planning。任务、依赖和验收以 GitHub Issues 为准，长期决策见 .agent/DECISIONS.md。

## 当前方向

1. 先处理 #321 已交付分支的格式门禁，再修正文档中把生产发布当作预览的指引。保留本机 Worker 作为分支验证入口。
2. 继续修复现有站点行为。先安排有独立入口的阅读进度回归，新闻发布契约继续排在 #306 后。五张既有 PR 的实现及 CI 已核对，剩余独立审查。
3. M4 已关闭。#295 仍无 PR #274 当前 head 的检查，沿用该 Issue 的发版与生产授权边界。

## 2026-11-27 执行验收与积压复核

昨日日报缺失，已用 #321 的执行评论、远端 Git 历史、PR CI 与最近的 Executor 日报/STATE 反推。11 月 25–27 日无日报。最近的 [11 月 23 日日报](https://github.com/HUAT-FSAC/Guidance-Astro/blob/b3ea627/.agent/DIARY/2026-11-23.md) 在执行记录分支。其五项交付及晚间历史补记已读。本轮六单均部分通过，已逐单回写，关闭 0 单。

| Issue                                                                                  | 验收依据                                                                                                                                                                                            | 剩余条件                                                                                                                                                                                                                                                           |
| -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [#321](https://github.com/HUAT-FSAC/Guidance-Astro/issues/321#issuecomment-7238965000) | `40c75da` / `31df8ae` 的两文件 diff 及本地 Node 语法和静态检查通过。PR、push 两条 LHCI 路径的凭据注入均移除。                                                                                       | [CI 45962698009](https://github.com/HUAT-FSAC/Guidance-Astro/actions/runs/45962698009) 的格式检查退出 1，本地 Prettier 复现同一文件。#322 仍为 Draft。用原分支修格式、复验完整 CI、协调 #319 审查并取得 Owner 的仓库级凭据处置记录。原状态 in-progress，疑似中断。 |
| [#303](https://github.com/HUAT-FSAC/Guidance-Astro/issues/303#issuecomment-7238982421) | `a79214b` 的 200/404 nonce、真实异常 500 原始日志、私有缓存、SW、3xx 和非 HTML 证据已核。[CI 45114589566](https://github.com/HUAT-FSAC/Guidance-Astro/actions/runs/45114589566) 通过。              | PR #320 等独立审查。                                                                                                                                                                                                                                               |
| [#305](https://github.com/HUAT-FSAC/Guidance-Astro/issues/305#issuecomment-7238986734) | 双语 JS/CSS 失败后同文档重试、结果导航、去重和焦点回归已核。上轮审计缺口已补齐，当前 SHA `5a0b33f` 的 [CI 45111944361](https://github.com/HUAT-FSAC/Guidance-Astro/actions/runs/45111944361) 全绿。 | 仅回收 PR #315 的独立审查及具体反馈。                                                                                                                                                                                                                              |
| [#306](https://github.com/HUAT-FSAC/Guidance-Astro/issues/306#issuecomment-7238984763) | `4819997` 的 tsc、模板门禁和双语 Node 声明已核，原始负例为 TS2345，最终 Astro 检查 135 文件 0 错误。[CI 45113725521](https://github.com/HUAT-FSAC/Guidance-Astro/actions/runs/45113725521) 通过。   | PR #319 等独立审查，与 #322 的工作流改动依序复核。                                                                                                                                                                                                                 |
| [#312](https://github.com/HUAT-FSAC/Guidance-Astro/issues/312#issuecomment-7238988509) | `d63f384` 新增双语新闻回归，逐页 canonical、OG 地址、实验室互链和负例已核。[CI 45112547900](https://github.com/HUAT-FSAC/Guidance-Astro/actions/runs/45112547900) 通过。                            | 仅回收 PR #316 的独立审查及具体反馈。                                                                                                                                                                                                                              |
| [#313](https://github.com/HUAT-FSAC/Guidance-Astro/issues/313#issuecomment-7238983534) | `7cc272f` 的文档级生命周期、CLS 和本地上报开关已核。BFCache 为事件模拟。[CI 45112814536](https://github.com/HUAT-FSAC/Guidance-Astro/actions/runs/45112814536) 通过。                               | 仅回收 PR #317 的独立审查及具体反馈。                                                                                                                                                                                                                              |

五张 PR 均已请求独立 Reviewer，当前仍为 REVIEW_REQUIRED，Issue 因外部审查等待转为 blocked。#305、#312 和 #313 的第二次部分验收仅保留审查差距，沿用已有 PR 和证据。11 月 23 日执行方建议的 #302 排期暂等 #306 验收。#295 仍走独立发版授权。请 Executor 在下次日报追加 11 月 27 日 #321 的执行记录和原报告入口。

## 今日目标（2026-11-28）

- 优先判定 #321 原分支能否恢复，补格式及审查交接。随后领取两项 ready。
- 修正文档中的生产误发路径，并补齐客户端导航后的文档阅读进度回归。

## 当前 Milestone · M5 站点正确性与验证基线（1 / 8）

[GitHub Milestone #4](https://github.com/HUAT-FSAC/Guidance-Astro/milestone/4) 的实际成员为 #297、#302–#307、#323。#297 已关闭，7 单开放。M4（GitHub #3）仍为 9/9、已关闭。

- **目标。** 主干审计健康，CI 覆盖 Astro 模板，SSR 错误响应、新闻发布、路由、搜索与分支预览符合各 Issue 的验收条件。
- **完成信号。** 八个成员逐单验收关闭。按 D-020 核实开放成员归零后，由 Planner 显式关闭里程碑。
- **范围。** 现有功能修复、本地验证和预览文档。生产发版、真实部署、外部资源、凭据操作和核心技术选型各有独立治理入口。

### 执行队列（2 个 ready）

1. [#323 修正部署指南中的分支预览指引](https://github.com/HUAT-FSAC/Guidance-Astro/issues/323)（P1）。只改部署指南，将生产 Worker 配置从分支和 Pages 预览路径移除。使用现有 `pnpm preview:ssr` 在 loopback 验证 HTTP 200 与 CSP。无硬前置。
2. [#318 恢复客户端导航后的文档阅读进度](https://github.com/HUAT-FSAC/Guidance-Astro/issues/318)（P2）。#292 已验收。沿现有阅读进度组件入口，在本地生产形态 Chromium 验证直访、SPA 换页及退出后的监听清理。共用生命周期文件若有重叠，按 Issue 约定串行。

## 已知阻塞与后续

- #302 等 #306 验收后按既有顺序准入，#307 等 #302 的发布契约。#304 等 #303、#305 的接缝稳定。
- #301 留作测试发布目标隔离与拒绝生产目标的实现。当前文档切片交 #323，真实远程测试发布需独立授权。#308 建议在本地预览路径清晰后复测。#309 先核实车辆数据和统计口径。#310 等 #307 路由契约，#311 按 CSS 层叠行为验证。
- #295 的 PR #274 当前 head `82ef69d` 没有检查。#101 保持单机 OAuth 默认，#197 保持手工触发默认，#280 保留可选 Projects 的外部凭据跟踪。已清理 #197、#280 的例行 stale 标签。
- #299 保留现有时长观测，最近已记录的 20 个样本 P95 为 473 秒，对照阈值 360 秒。
- 今日无新增产品决策待用户确认。#321 的仓库级凭据处置由 Owner 按原验收标准登记。

## 同步与接力

共享工作树起始为 `main@26de9c7`，fetch 因 .git 只读失败，pull 因已有改动被拒。隔离副本的 `git fetch --all --prune` 与 `git pull --rebase origin main` 均成功，基线 `d1fe241` 的 [push CI](https://github.com/HUAT-FSAC/Guidance-Astro/actions/runs/45109721238) 成功。入站 `f98be0d` 已吸收于 `6a80906`，七路径内容差异为空，`d89b87e` 为 fork 历史合流残留，见 [#323 入站记录](https://github.com/HUAT-FSAC/Guidance-Astro/issues/323#issuecomment-7238997534)。

规划接力由本文件及 Issue 评论记录。请 Executor 先恢复 #321，再按 #323 → #318 领取，同时回收五张已有 PR 的独立审查。
