# TASKS — GitHub Issue 本地镜像

> 同步日期 2026-11-23。以 GitHub Issues 为权威。本文件根据验收及治理后的完整清单整体生成。
> D-013：`ready` 使用 `status:backlog` 和正文首行「队列状态：ready」。`in-review` 对应 `status:review`。

## 今日队列（2026-11-23）

1. [#306](https://github.com/HUAT-FSAC/Guidance-Astro/issues/306)（P2）补 Astro locals 和现有 CI Type Check。前置 #297 已关闭，Node 固定为 `22.23.4`。同步中英 README，使用临时模板错误证明检查会失败并在交付前移除探针。
2. [#303](https://github.com/HUAT-FSAC/Guidance-Astro/issues/303)（P2）修复整页 SSR 404 与错误回退的 nonce 和缓存。前置 #292 已关闭，使用生产形态本地 SSR 验证响应头体、缓存、状态及回归路径。

已有执行现场按原分支恢复：#305 / PR #315、#312 / PR #316、#313 / PR #317。三单均已部分验收，续补评论中的完整门禁与审查证据。

## 全部开放 Issue（19 项）

ready 2，in-progress 3，in-review 0，blocked 4，needs-info 1，backlog 9。

| Issue                                                          | 标题                                                                                                      | 状态        | 优先级 | Milestone | 下一步或阻塞                                                         |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ----------- | ------ | --------- | -------------------------------------------------------------------- |
| [#101](https://github.com/HUAT-FSAC/Guidance-Astro/issues/101) | [Task] 恢复 CI 自动部署，消除单机 wrangler OAuth 单点                                                     | blocked     | P2     | —         | 单机 OAuth 默认 B，自动部署待外部凭据及独立授权。                    |
| [#197](https://github.com/HUAT-FSAC/Guidance-Astro/issues/197) | 评估解锁 release-please Release PR 的 PR 级自助 CI（当前靠手工 update-branch 绕过 GITHUB_TOKEN 链式抑制） | needs-info  | P3     | —         | 用户已确认默认 C，沿用既有手工触发方式，常驻观察。                   |
| [#280](https://github.com/HUAT-FSAC/Guidance-Astro/issues/280) | 跟踪可选 Projects 自动登记的 PROJECT_TOKEN 凭据阻塞                                                       | blocked     | P3     | —         | 可选 Projects 的独立 PROJECT_TOKEN 失效记录，等待凭据所有者处理。    |
| [#295](https://github.com/HUAT-FSAC/Guidance-Astro/issues/295) | 执行 M4 收口后的 release 1.4.0 minor 发版与四方一致性核验                                                 | blocked     | P2     | —         | 主干审计已恢复；PR #274 当前 head 无检查，待完整门禁与单独发版授权。 |
| [#299](https://github.com/HUAT-FSAC/Guidance-Astro/issues/299) | [duration-budget] 跟踪 main 流水线 Quality 阶段时长超标                                                   | backlog     | P3     | —         | 活动告警入口。最近 20 样本 P95 473s > 360s，继续积累新窗口。         |
| [#301](https://github.com/HUAT-FSAC/Guidance-Astro/issues/301) | [ARCH-002/P1] 隔离本地预览、测试 Worker 与生产发布                                                        | backlog     | P1     | —         | 预览误指向生产路径，后续排期；外部部署与资源变更需独立授权。         |
| [#302](https://github.com/HUAT-FSAC/Guidance-Astro/issues/302) | [ARCH-003/P1] 统一新闻发布模型，修复中英文首页与新闻入口                                                  | backlog     | P1     | M5        | 优先修复新闻入口与草稿可访问问题，待 #306 验收后按既有顺序准入。     |
| [#303](https://github.com/HUAT-FSAC/Guidance-Astro/issues/303) | [ARCH-004/P2] 统一 SSR 404 与错误回退的 CSP nonce 和 HTML 缓存契约                                        | ready       | P2     | M5        | 今日第 2。#292 定位已验收，限定整页 SSR 错误响应与缓存。             |
| [#304](https://github.com/HUAT-FSAC/Guidance-Astro/issues/304) | [ARCH-005/P2] 确保 Service Worker 的 Pagefind 与可替换媒体随版本更新                                      | backlog     | P2     | M5        | 待 #305 和 #303 稳定后处理，覆盖同浏览器 A/B 缓存更新和离线降级。    |
| [#305](https://github.com/HUAT-FSAC/Guidance-Astro/issues/305) | [ARCH-006/P2] Pagefind 首次失败后支持同文档重试与恢复                                                     | in-progress | P2     | M5        | 沿用 PR #315。当前主干补审计、完整 CI 与独立审查。                   |
| [#306](https://github.com/HUAT-FSAC/Guidance-Astro/issues/306) | [ARCH-008/P2] 修正 Astro locals 类型并将 astro check 纳入 CI                                              | ready       | P2     | M5        | 今日第 1。#297 已验收，沿用 Node 22.23.4，补模板检查和双语声明。     |
| [#307](https://github.com/HUAT-FSAC/Guidance-Astro/issues/307) | [ARCH-007/P2] 以真实可索引路由生成 sitemap 并修正双语互链                                                 | blocked     | P2     | M5        | 硬依赖 #302 发布契约；保留兼容跳转和真实搜索行为。                   |
| [#308](https://github.com/HUAT-FSAC/Guidance-Astro/issues/308) | [ARCH-009/P2] 测量并优化移动首页 LCP 关键路径                                                             | backlog     | P2     | —         | 待 #301，复测移动首页 LCP 基线后定位关键路径。                       |
| [#309](https://github.com/HUAT-FSAC/Guidance-Astro/issues/309) | [ARCH-010/P2] 以稳定赛季和车型 ID 共享技术参数与赛绩                                                      | backlog     | P2     | —         | 先核实 2024 赛季车辆与字段统计口径，再安排数据整合。                 |
| [#310](https://github.com/HUAT-FSAC/Guidance-Astro/issues/310) | [ARCH-011A/P2] 将 Starlight 私有路由与 Pagefind 解析依赖收拢                                              | backlog     | P2     | —         | 依赖基线已就绪，按建议等 #307 路由契约稳定并串行搜索改动。           |
| [#311](https://github.com/HUAT-FSAC/Guidance-Astro/issues/311) | [ARCH-011B/P2] 验证 CSS 去重不改变层叠并收敛产物后处理                                                    | backlog     | P2     | —         | 后续验证 CSS 产物层叠顺序、主题与视觉表现。                          |
| [#312](https://github.com/HUAT-FSAC/Guidance-Astro/issues/312) | [ARCH-012/P3] 修正逐页 canonical/OG URL 与双语实验室元数据                                                | in-progress | P3     | —         | 沿用 PR #316。当前主干补审计、完整 CI、双语新闻和独立审查。          |
| [#313](https://github.com/HUAT-FSAC/Guidance-Astro/issues/313) | [ARCH-013/P3] 修正 Web Vitals 观察、清理与上报生命周期                                                    | in-progress | P3     | —         | 沿用 PR #317。当前主干补审计、完整 CI 与独立审查，维持生产上报开关。 |
| [#318](https://github.com/HUAT-FSAC/Guidance-Astro/issues/318) | 恢复客户端导航后的文档阅读进度                                                                            | backlog     | P2     | —         | 从 #292 拆出现场已证实的阅读进度回归，保持 CSP 与导航策略。          |

## 本轮验收

- [#292](https://github.com/HUAT-FSAC/Guidance-Astro/issues/292#issuecomment-7091142388)。只读定位通过，整页响应交 #303，阅读进度交 #318。
- [#296](https://github.com/HUAT-FSAC/Guidance-Astro/issues/296#issuecomment-7091143110)。双口径报告通过，持续告警交 #299。
- [#297](https://github.com/HUAT-FSAC/Guidance-Astro/issues/297#issuecomment-7091143764)。通过，依赖审计零豁免，PR #314 已合入。
- [#305](https://github.com/HUAT-FSAC/Guidance-Astro/issues/305#issuecomment-7091144536)。部分通过，退回 PR #315 补门禁和审查。
- [#312](https://github.com/HUAT-FSAC/Guidance-Astro/issues/312#issuecomment-7091145209)。部分通过，退回 PR #316 补门禁和审查。
- [#313](https://github.com/HUAT-FSAC/Guidance-Astro/issues/313#issuecomment-7091145886)。部分通过，退回 PR #317 补门禁和审查。

## 里程碑和关联 PR

- M4（GitHub #3）已关闭，9/9。M5（GitHub #4）1/7，开放 6 个成员。进度来自逐个列举现有成员。
- PR #274 暂缓；PR #300 已关闭，其 Astro 补丁由 #314 承接；PR #314 已合入。恢复已有实现时，以 PR 当前完整 head 的检查为准。

### 开放 PR（7 张）

- [#186](https://github.com/HUAT-FSAC/Guidance-Astro/pull/186) chore(deps): bump the majors group across 1 directory with 3 updates
- [#274](https://github.com/HUAT-FSAC/Guidance-Astro/pull/274) chore(main): release 1.4.0
- [#293](https://github.com/HUAT-FSAC/Guidance-Astro/pull/293) chore(metrics): update project progress snapshot
- [#298](https://github.com/HUAT-FSAC/Guidance-Astro/pull/298) chore(deps): bump the majors group across 1 directory with 4 updates
- [#315](https://github.com/HUAT-FSAC/Guidance-Astro/pull/315) fix(search): recover from Pagefind UI load failures (#305)
- [#316](https://github.com/HUAT-FSAC/Guidance-Astro/pull/316) fix(seo): align page and lab metadata with canonical URLs (#312)
- [#317](https://github.com/HUAT-FSAC/Guidance-Astro/pull/317) fix(vitals): finalize one sample per document and score CLS windows (#313)
