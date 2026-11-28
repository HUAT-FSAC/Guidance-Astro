# TASKS — GitHub Issue 本地镜像

> 同步日期 2026-11-28。以 GitHub Issues 为权威，本文件根据治理后的完整 Issue 清单整体刷新。
> D-013：ready 使用 `status:backlog` 和正文首行「队列状态：ready」。in-review 使用 `status:review`。

## 今日队列（2026-11-28）

1. [#323](https://github.com/HUAT-FSAC/Guidance-Astro/issues/323)（P1）修正部署指南中的分支预览指引。无前置，仅改 `docs/DEPLOYMENT.md`，使用现有 Worker 本机入口验证 200 和 CSP。
2. [#318](https://github.com/HUAT-FSAC/Guidance-Astro/issues/318)（P2）恢复客户端导航后的文档阅读进度。#292 已验收。在既有组件入口验直访、SPA 换页和离场清理，保持现有 CSP 和导航。

开工前先判断 #321 原分支能否恢复，再按上述顺序串行领取。五张已有待审 PR 继续沿各自独立审查请求，具体差距见验收评论。

## 全部开放 Issue（21 项）

ready 2，in-progress 1，in-review 0，blocked 9，needs-info 1，backlog 8。

| Issue                                                          | 标题                                                                                                      | 状态        | 优先级 | Milestone | 下一步或阻塞                                                    |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ----------- | ------ | --------- | --------------------------------------------------------------- |
| [#101](https://github.com/HUAT-FSAC/Guidance-Astro/issues/101) | [Task] 恢复 CI 自动部署，消除单机 wrangler OAuth 单点                                                     | blocked     | P2     | —         | 默认 B，现行本机 OAuth。自动部署待外部凭据和独立授权。          |
| [#197](https://github.com/HUAT-FSAC/Guidance-Astro/issues/197) | 评估解锁 release-please Release PR 的 PR 级自助 CI（当前靠手工 update-branch 绕过 GITHUB_TOKEN 链式抑制） | needs-info  | P3     | —         | 默认 C，沿用手工触发。作为 #295 的常驻参照，已清理 stale。      |
| [#280](https://github.com/HUAT-FSAC/Guidance-Astro/issues/280) | 跟踪可选 Projects 自动登记的 PROJECT_TOKEN 凭据阻塞                                                       | blocked     | P3     | —         | 可选 Projects 的独立凭据由所有者处理，已清理 stale。            |
| [#295](https://github.com/HUAT-FSAC/Guidance-Astro/issues/295) | 执行 M4 收口后的 release 1.4.0 minor 发版与四方一致性核验                                                 | blocked     | P2     | —         | PR #274 head `82ef69d` 无检查，仍待完整门禁与单独授权。         |
| [#299](https://github.com/HUAT-FSAC/Guidance-Astro/issues/299) | [duration-budget] 跟踪 main 流水线 Quality 阶段时长超标                                                   | backlog     | P3     | —         | 继续既有 20 样本观测，最近 P95 为 473 秒，对照阈值 360 秒。     |
| [#301](https://github.com/HUAT-FSAC/Guidance-Astro/issues/301) | [ARCH-002/P1] 隔离本地预览、测试 Worker 与生产发布                                                        | backlog     | P1     | —         | 指南切片已交 #323。本单保留测试 Worker 隔离和生产目标拒绝。     |
| [#302](https://github.com/HUAT-FSAC/Guidance-Astro/issues/302) | [ARCH-003/P1] 统一新闻发布模型，修复中英文首页与新闻入口                                                  | backlog     | P1     | M5        | 等 #306 验收，再安排新闻发布契约。与 #307 串行。                |
| [#303](https://github.com/HUAT-FSAC/Guidance-Astro/issues/303) | [ARCH-004/P2] 统一 SSR 404 与错误回退的 CSP nonce 和 HTML 缓存契约                                        | blocked     | P2     | M5        | PR #320 当前提交 CI 通过，等待独立审查。                        |
| [#304](https://github.com/HUAT-FSAC/Guidance-Astro/issues/304) | [ARCH-005/P2] 确保 Service Worker 的 Pagefind 与可替换媒体随版本更新                                      | backlog     | P2     | M5        | 等 #303、#305 的错误响应与搜索加载接缝稳定。                    |
| [#305](https://github.com/HUAT-FSAC/Guidance-Astro/issues/305) | [ARCH-006/P2] Pagefind 首次失败后支持同文档重试与恢复                                                     | blocked     | P2     | M5        | PR #315 的审计和全套 CI 已补齐，剩余独立审查。                  |
| [#306](https://github.com/HUAT-FSAC/Guidance-Astro/issues/306) | [ARCH-008/P2] 修正 Astro locals 类型并将 astro check 纳入 CI                                              | blocked     | P2     | M5        | PR #319 的模板门禁和双语 Node 口径已核，剩余独立审查。          |
| [#307](https://github.com/HUAT-FSAC/Guidance-Astro/issues/307) | [ARCH-007/P2] 以真实可索引路由生成 sitemap 并修正双语互链                                                 | blocked     | P2     | M5        | 前置 #302 新闻发布契约。继续保留兼容跳转和真实搜索。            |
| [#308](https://github.com/HUAT-FSAC/Guidance-Astro/issues/308) | [ARCH-009/P2] 测量并优化移动首页 LCP 关键路径                                                             | backlog     | P2     | —         | 本地预览路径明晰后复测移动首页 LCP，再定位关键路径。            |
| [#309](https://github.com/HUAT-FSAC/Guidance-Astro/issues/309) | [ARCH-010/P2] 以稳定赛季和车型 ID 共享技术参数与赛绩                                                      | backlog     | P2     | —         | 先核实 2024 车辆归属、来源和统计口径，再合并重叠事实。          |
| [#310](https://github.com/HUAT-FSAC/Guidance-Astro/issues/310) | [ARCH-011A/P2] 将 Starlight 私有路由与 Pagefind 解析依赖收拢                                              | backlog     | P2     | —         | 待 #307 路由契约稳定，与搜索改动串行。                          |
| [#311](https://github.com/HUAT-FSAC/Guidance-Astro/issues/311) | [ARCH-011B/P2] 验证 CSS 去重不改变层叠并收敛产物后处理                                                    | backlog     | P2     | —         | 保留现有主题、视觉与层叠行为，按原 Issue 验收。                 |
| [#312](https://github.com/HUAT-FSAC/Guidance-Astro/issues/312) | [ARCH-012/P3] 修正逐页 canonical/OG URL 与双语实验室元数据                                                | blocked     | P3     | —         | PR #316 的双语新闻与 CI 已补齐，剩余独立审查。                  |
| [#313](https://github.com/HUAT-FSAC/Guidance-Astro/issues/313) | [ARCH-013/P3] 修正 Web Vitals 观察、清理与上报生命周期                                                    | blocked     | P3     | —         | PR #317 的 CI 已补齐，剩余独立审查。BFCache 证据为事件模拟。    |
| [#318](https://github.com/HUAT-FSAC/Guidance-Astro/issues/318) | 恢复客户端导航后的文档阅读进度                                                                            | ready       | P2     | —         | 今日第 2。#292 已验收，沿用组件入口和现有 CSP。                 |
| [#321](https://github.com/HUAT-FSAC/Guidance-Astro/issues/321) | [Security/P1] 移除 Lighthouse CI 非必要凭据依赖                                                           | in-progress | P1     | —         | 疑似中断。恢复原 draft #322，修格式并复验，Owner 登记凭据处置。 |
| [#323](https://github.com/HUAT-FSAC/Guidance-Astro/issues/323) | 修正部署指南中的分支预览指引                                                                              | ready       | P1     | M5        | 今日第 1。只修部署指南，用本机 SSR 验证。                       |

## 本轮验收

- [#321](https://github.com/HUAT-FSAC/Guidance-Astro/issues/321#issuecomment-7238965000) 部分通过。凭据引用删除及静态检查已核。继续修格式、等待独立审查及 Owner 配置验收，当前保持 in-progress。
- [#303](https://github.com/HUAT-FSAC/Guidance-Astro/issues/303#issuecomment-7238982421)、[#305](https://github.com/HUAT-FSAC/Guidance-Astro/issues/305#issuecomment-7238986734)、[#306](https://github.com/HUAT-FSAC/Guidance-Astro/issues/306#issuecomment-7238984763)、[#312](https://github.com/HUAT-FSAC/Guidance-Astro/issues/312#issuecomment-7238988509)、[#313](https://github.com/HUAT-FSAC/Guidance-Astro/issues/313#issuecomment-7238983534) 部分通过。当前完整提交的 CI 已核，等待独立审查期间标为 blocked。
- 11 月 27 日日报缺失，依据 #321 执行评论、Git、远端 CI 和最近的执行快照反推。11 月 23 日日报及各项审查证据见 PLAN。

## 里程碑和关联 PR

- M4（GitHub #3）已关闭，9/9。M5（GitHub #4）1/8，仍开放。实际成员为 #297、#302、#303、#304、#305、#306、#307、#323。已关闭 #297。
- PR #274 当前 head 无检查。五张待审 PR 的审查请求已在原 PR 中。#319 与 #322 均触及同一工作流，按 Issue 已留的顺序要求协调。

### 开放 PR（10 张）

- [#186](https://github.com/HUAT-FSAC/Guidance-Astro/pull/186) chore(deps): bump the majors group across 1 directory with 3 updates
- [#274](https://github.com/HUAT-FSAC/Guidance-Astro/pull/274) chore(main): release 1.4.0
- [#293](https://github.com/HUAT-FSAC/Guidance-Astro/pull/293) chore(metrics): update project progress snapshot
- [#298](https://github.com/HUAT-FSAC/Guidance-Astro/pull/298) chore(deps): bump the majors group across 1 directory with 4 updates
- [#315](https://github.com/HUAT-FSAC/Guidance-Astro/pull/315) fix(search): recover from Pagefind UI load failures (#305)
- [#316](https://github.com/HUAT-FSAC/Guidance-Astro/pull/316) fix(seo): align page and lab metadata with canonical URLs (#312)
- [#317](https://github.com/HUAT-FSAC/Guidance-Astro/pull/317) fix(vitals): finalize one sample per document and score CLS windows (#313)
- [#319](https://github.com/HUAT-FSAC/Guidance-Astro/pull/319) fix(types): check Astro templates in CI (#306)
- [#320](https://github.com/HUAT-FSAC/Guidance-Astro/pull/320) fix(ssr): preserve the error response contract (#303)
- [#322](https://github.com/HUAT-FSAC/Guidance-Astro/pull/322) fix(ci): remove unused Lighthouse App credentials (#321)（Draft）
