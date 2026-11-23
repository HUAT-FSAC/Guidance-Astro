# PLAN — 项目路线图

> 2026-11-23 · Planning。任务、依赖和验收以 GitHub Issues 为准，长期决策见 `.agent/DECISIONS.md`。

## 当前方向

1. 审计已恢复。先补上 Astro 模板类型的验证入口，并修复整页 SSR 错误响应的 nonce 与缓存契约。
2. 修复现有新闻入口与发布状态，再收敛 sitemap 和 Pagefind 的路由、缓存一致性。三张已交付 PR 优先补齐当前主干上的审计和审查证据。
3. M4 已关闭。PR #274 仍等待其自身的完整检查与单独授权，M5 排期不触发任何发版操作。

## 2026-11-22 执行验收

日报见 [执行记录分支](https://github.com/HUAT-FSAC/Guidance-Astro/blob/13d173c/.agent/DIARY/2026-11-22.md)。共享工作树及主干当时未收录该日报。晚间 #305、#312、#313 的交付未见于日报，使用 Issue 执行报告、相关提交、原始验证日志与 PR CI 补核。

| Issue                                                                                  | 结论                       | 核心证据与剩余项                                                                                                                                                                                                                           |
| -------------------------------------------------------------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [#297](https://github.com/HUAT-FSAC/Guidance-Astro/issues/297#issuecomment-7091143764) | 通过，关闭                 | PR #314 于 11 月 23 日 00:35（北京时间）合入为 `1a4d677`，tree 与 PR head `1504753` 一致。[主干 CI](https://github.com/HUAT-FSAC/Guidance-Astro/actions/runs/45044729130) 全绿，审计零豁免。Node `22.23.4` 为当前基线。旧 PR #300 已关闭。 |
| [#292](https://github.com/HUAT-FSAC/Guidance-Astro/issues/292#issuecomment-7091142388) | 只读定位通过，关闭         | 七项脚本已映射；使用报告的分场景计数 0 / 6 / 7。确认 #303 属整页 SSR，SPA 阅读进度交 #318。                                                                                                                                                |
| [#296](https://github.com/HUAT-FSAC/Guidance-Astro/issues/296#issuecomment-7091143110) | 只读报告通过，关闭         | 历史窗口两种口径 P95 均为 632 秒。本轮同一 dry-run 退出 0，新窗口 20/20，Quality P95 473 秒、阈值 360 秒；E2E 最长 31 秒、阈值 90 秒。继续观察 #299。                                                                                      |
| [#305](https://github.com/HUAT-FSAC/Guidance-Astro/issues/305#issuecomment-7091144536) | 部分通过，回到 in-progress | PR #315 同文档重试、双语、焦点和 SPA 单实例有证据；现有提交审计失败，补当前主干上的完整 CI 与独立审查。                                                                                                                                    |
| [#312](https://github.com/HUAT-FSAC/Guidance-Astro/issues/312#issuecomment-7091145209) | 部分通过，回到 in-progress | PR #316 首页、正文、实验室与互链负例已核，组合日志包含真实双语新闻；补当前主干上的完整 CI 与独立审查。                                                                                                                                     |
| [#313](https://github.com/HUAT-FSAC/Guidance-Astro/issues/313#issuecomment-7091145886) | 部分通过，回到 in-progress | PR #317 文档级采样、CLS 计分和本地上报开关已核。BFCache 覆盖为事件模拟；补当前主干上的完整 CI 与独立审查。                                                                                                                                 |

## 今日目标（2026-11-23）

- 从干净的主干基线领取两项 ready。现有 PR 用原分支恢复，按各自验收评论补齐证据并重新交验。
- #302 依建议顺序等待 #306 验收。#307 依赖 #302 的发布契约；#304 等 #305、#303 的接缝稳定再开工。

## 当前 Milestone · M5 站点正确性与验证基线（1 / 7）

[GitHub Milestone](https://github.com/HUAT-FSAC/Guidance-Astro/milestone/4) 成员为 #297、#302–#307。已关闭 #297，开放 #302、#303、#304、#305、#306、#307。M4（GitHub #3）维持已关闭 9/9，1.4.0 由 #295 单独跟踪。

- **目标。** 主干审计健康，CI 覆盖 Astro 模板；正确返回整页错误响应；新闻正文、可索引路由和搜索缓存遵循各 Issue 的验收条件。
- **完成信号。** 七个成员逐单验收关闭，按 D-020 核实开放成员归零，再由 Planner 显式关闭里程碑。
- **范围。** 聚焦现有功能修复，沿用现有 Worker SSR、CSP 安全策略与产品方向。发版、部署、凭据、遥测启用和框架大版本升级另有治理入口。

### 执行队列（2 个 ready）

1. [#306 修正 Astro locals 类型并将 astro check 纳入 CI](https://github.com/HUAT-FSAC/Guidance-Astro/issues/306)（P2）。#297 已验收。沿用 Node `22.23.4`，在现有 Type Check job 内保留 `tsc` 并加模板检查，同步双语 README 的徽章和技术栈表。用临时模板错误验证检查能拦截，移除探针后交付全绿 CI。
2. [#303 统一 SSR 404 与错误回退的 CSP nonce 和 HTML 缓存契约](https://github.com/HUAT-FSAC/Guidance-Astro/issues/303)（P2）。#292 已验收。验证生产形态本地 SSR 的 200、404、受控异常、3xx 与非 HTML，保持每请求 nonce 及现有安全强度，确保带 nonce 的错误 HTML 不进入共享缓存或离线持久缓存。

两项均有明确范围、已满足的前置与可判定标准，可在当前架构和权限下开工。按顺序领取，使用独立分支。

## 已知阻塞与后续

- #295（PR #274）当前 head `6de661a` 无检查。#297 已解除主干审计阻塞；仍需 PR 完整检查与单独发版授权。
- #101 维持单机 OAuth 默认方案；#280 跟踪可选 Projects 凭据；#197 沿用已确认的手工触发方案。#301 优先排期价值仍高，本轮留待后续，真实远程测试发布须独立授权。
- #299 跟踪持续超标。优先复用现有采样；多个新窗口仍超标且安装日志证实 APT 长尾时，再评估具体改进方案。
- #318 已登记为 backlog，修复站点自身的 SPA 阅读进度，沿用现有 CSP 与导航方式。
- #308–#311 属后续批次。#309 的数据矛盾先核对车辆与统计口径；#310 等路由契约稳定；#311 以层叠行为为准。
- 今日 pending 决策为 0。仍遵循 D-001、D-004、D-015、D-017、D-021、D-022。

## 同步与接力

隔离副本的 `git fetch --all --prune`、`git pull --rebase origin main` 均通过，规划基线为 `origin/main@1a4d677`。共享工作树起始 `main@26de9c7`，原地 fetch 因 `.git/FETCH_HEAD` 只读失败，pull 因既有改动被拒。GitHub Issues 可读写，连接器读取成功、发表评论被拒，写入使用已登录的 GitHub CLI。

入站巡检 `f98be0d` 已吸收于 `6a80906`，七个相关路径的内容差异为空。`d89b87e` 为 fork 旧合流残留，保持现状。规划文档及验收 Issue 承担本轮交接，Executor 自有记录由下一棒更新。本轮的代码门禁判定采用原始执行日志与对应 SHA 的远端结果；Planner 另行复跑时长 dry-run。

Executor 先确认原 PR 恢复条件，再按 #306 → #303 领取新任务。请在下一份追加式日报补记 11 月 22 日晚间三张 PR 与原报告入口。
