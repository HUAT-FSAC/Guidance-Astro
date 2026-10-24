# TASKS — Issue 本地镜像

> 同步：2026-10-24，Planning 第109轮；GitHub Issues 可读写，依据真实状态**整体重写**，无降级。基线 `main@ac6b6d04836cd4da234ab40122b0a0a21125e691`。
> D-013映射：ready=`status:backlog`+正文首行ready；in-progress=`status:in-progress`；in-review=`status:review`；done=`status:done`；blocked/needs-info不并挂backlog。

## 今日队列（2026-10-24，2个ready，建议顺序）

| 顺序 | Issue                                                                                                              | 优先级 / 状态 | 依赖与交付边界                                                                                                                   |
| ---- | ------------------------------------------------------------------------------------------------------------------ | ------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 1    | [#279 恢复窄屏搜索的可见入口与完整查询交互](https://github.com/HUAT-FSAC/Guidance-Astro/issues/279)                | P1 / ready    | 无硬依赖；#262原AC3整改。单实例Search离开隐藏nav，触屏可见入口/可见输入/正文结果/点击/关闭/焦点/SPA重开；不再只断言dialog.open。 |
| 2    | [#281 修正搜索清单为真实Starlight路由并收录不同名英文正文](https://github.com/HUAT-FSAC/Guidance-Astro/issues/281) | P2 / ready    | #266已done；与279无硬依赖。使用实际routes/entryMeta/isFallback，移除中文同名slug判断；真实英文archive正文经生产查询命中。        |

两任务各自完整范围/非目标/依赖/AC/测试要求见Issue正文，均通过七条ready门禁，无产品pending/红线变更。分别分支/PR/报告，可最后合并一次部署但不得省生产AC。

**验收父单#262不算第三个ready**：本轮review→in-progress；保持OPEN，原九项AC不缩。279/281是唯一两份实现；完成后在262追加更正和全部原AC重验报告，再转review，等Planner验收。不是关原件、把未完成标准挪到未来。

## 全部开放Issue（6项）

| Issue | 优先级 / 风险 | 状态与标签                                                                | Milestone / 下一步                                                                                           |
| ----- | ------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| #279  | P1 / low      | ready；status:backlog、type:bug、area:frontend、auto-discovered           | M4 #3；首位可执行UI整改，父单262。                                                                           |
| #281  | P2 / medium   | ready；status:backlog、type:bug、area:frontend                            | M4 #3；第二位可执行索引整改，父单262。                                                                       |
| #262  | P2 / medium   | in-progress；status:in-progress、type:bug、area:frontend、auto-discovered | M4 #3；首次验收不通过，原AC3/4和报告一致性未满足；完成子任务后完整重验。                                     |
| #101  | P1 / medium   | blocked；type:task、area:devops                                           | 无milestone；CLOUDFLARE_API_TOKEN仍缺，单机OAuth默认B；不恢复CI deploy。                                     |
| #197  | P3 / medium   | needs-info；type:task、area:devops、dependencies                          | 无milestone；用户已确认默认C手工触发，观察发版频率；不重复问PAT/App。                                        |
| #280  | P3 / medium   | blocked；type:task、area:devops、auto-discovered                          | 无milestone；可选Projects的PROJECT_TOKEN失效/权限外部依赖；与197不同凭据，未获授权不增权/换令牌/改workflow。 |

统计：ready=2，in-progress=1，in-review=0，blocked=2，needs-info=1；P0=0，P1=2（279与外部阻塞101）。无未定级auto-discovered。未关闭或重置开工时的in-progress现场；262开工时为review，本轮验收后退回。

## 本轮验收（第109轮，2026-10-24）

输入为10-22/23/24日报全部追加，重点108轮；24日报已由Executor补建（106轮补录有来源），不再称缺失。23日和106轮成果已由105/107轮验收，不重复关闭。

| 项目  | 结论                                          | 证据 / 记录                                                                                                                                                                                                                                                     |
| ----- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #270  | **通过，done/closed**                         | [6386000882](https://github.com/HUAT-FSAC/Guidance-Astro/issues/270#issuecomment-6386000882)；569d178仅README.md一行.png→.webp；本轮双语各19个本地链接、例图/互链/Prettier通过；PR278全checks成功。该SHA主干Pipeline曾cancelled，最终HEAD success，保留原记录。 |
| #262  | **不通过；报告部分勾选失实，退回in-progress** | [6386001757](https://github.com/HUAT-FSAC/Guidance-Astro/issues/262#issuecomment-6386001757)逐条九AC：窄屏已知不可见却勾完成；按中文同名slug误排真实英文正文且未消费实际routes。桌面样本/nonce通过不等于完整通过；279/281承接整改。                             |
| PR276 | **通过，已上线**                              | [6386022987](https://github.com/HUAT-FSAC/Guidance-Astro/pull/276#issuecomment-6386022987)；b04bfec仅metrics JSON，递归schema65路径零差异，生产双语04:34:53快照与部署027692c7。                                                                                 |
| PR274 | **继续持合，执行判断正确**                    | [6386023211](https://github.com/HUAT-FSAC/Guidance-Astro/pull/274#issuecomment-6386023211)；实际1.4.0 minor，不是旧队列1.3.2 patch；M4仍有原AC缺口，不能合入。                                                                                                  |

报告问题具体限定在262的AC勾选/结论，不指控隐瞒已披露的窄屏风险。旧报告/日报不可改写，下一棒追加更正。首次不通过，不存在连续两次未处理验收失败。

## Milestone核实

- **M4 #3：实际5/8，state=open**。REST成员与GraphQL双源一致：done=#266/#264/#263/#268/#270，open=#262/#279/#281。
- REST汇总在原六成员时已恢复2/4；新增整改子单后又为open=2/closed=5，实际应3/5。继续按真实成员状态计数，不能因此漏父单或缩范围；描述已更正，未关闭Milestone。
- 279/281为父单拆分的唯一实现，262为原九AC整体验收责任，不重复实现；八单全经Planner验收、实际open归零后再显式关闭（D-020）。
- #101/#197/#280与majors不计入M4；M2/M3沿既有closed状态。

## 关键范围与证据纪律

- **279**：可见触屏入口与可操作弹窗，不复制组件/ID/全局快捷键监听；窄屏中英查询、SPA、焦点/关闭、亮暗截图与桌面回归。复用已知失败输出，不重新确认窄屏旧错误。
- **281**：从已安装Starlight实际routes取元数据；真实英文不同名slug不是fallback。只排真正fallback/草稿/pagefind:false/404/3xx/HTML导航壳，不误排sidebar.hidden或转义代码示例；数量记录当次值，不硬编码112/142。
- 两单不改SSR/nonce/CSP/HTML私有缓存、SESSION/ASSETS、CI/预算阈值/依赖，不新增服务/凭据或翻译整治。子进程/内部清单/HTML快照清理与失败旧bundle不可误用保持原AC。
- 262需追加原九AC的完整重验报告；代码与.agent记录分提交，Executor不关闭任务，禁止force push。
- **280**：源码确认使用PROJECT_TOKEN，不是197的RELEASE_PLEASE_TOKEN||GITHUB_TOKEN；Secret名称存在≠有效，本机gh无read:project≠Actions PAT必缺scope。10-22已有同路径失败，原“首次执行”只是假定样本。只读诊断已结束，Projects非任务SSOT，不为凑队列安排重复调查，不通过禁用job掩盖错误。

## 开放PR（3张）

| PR   | 当前处置                                                                                                                   |
| ---- | -------------------------------------------------------------------------------------------------------------------------- |
| #274 | release1.4.0 minor、checks空；M4实际收口前持合。收口后依既有手工触发方式跑checks，CI绿后合入并完成§11.2/11.3，不手改版本。 |
| #209 | npm majors，D-015暂缓，不摄入。                                                                                            |
| #186 | Actions majors，D-015暂缓，不摄入。                                                                                        |

PR276已合入；本轮无开放metrics PR。新生metrics仍按schema/CI/部署常态处理，不计今日ready任务数。

## 环境与当前线上

- 开工main@ac6b6d0 Pipeline40099302127、SecretScan40099302118、ReleasePlease40099302078均success；277全部检查成功。569d178的主干Pipeline40098011285为cancelled，非success。
- 最新部署100% Version `027692c7-dbb3-4abc-81d8-e5b86c9f33f6`（2026-10-24T13:31:39Z），含8767c8f与b04bfec。桌面搜索样本可用，但**不能称全部搜索已恢复**：窄屏不可见与英文漏收仍待整改。本轮无新部署。
- 本轮原生Chromium生产301→/labs/、odometry→/en/join/点击通过；中文excerpt高亮301、负例雥龘=0；截图确认桌面真实结果；双语看板200/04:34:53。
- 首页两次请求各27个script nonce与各自CSP一致，值分别1Qnx5_-F57sfpk9idvmUbw / jb_s9mXGmNo3Cu9qn2eCCg；两次不同，HTML缓存private,no-cache,must-revalidate；内部清单404。
- 本轮现有分类器15条单测通过，却把control-fundamentals实页误排；绿色测试不替代规格。未新增永久测试/代码/验证脚本。browser helper已知Worker包装问题已反馈，原生Chromium验证不受影响；保留探针初次时序/嵌套badge解析失败，不伪称首次全绿。
- inbound：wsyhuat/main仍f98be0d/d89b87e，七路径内容diff空（已吸收至6a80906），不merge fork。不设锁，本轮未读写锁。
- 下一棒刷新Executor自有STATE/HANDOFF（旧“无进行中/搜索恢复/6项可收口”已过期）；按仓库强制规则本轮仅追加接力补记，ENV/DIARY未改。
- 收尾`pnpm format:check` / `quality:audit` / `build`均exit0；实际SSR+Pagefind生成112页（zh76/en36），132文件/963.5KiB，输出仍将真实英文正文误列fallback，未把绿色build当搜索全通过。既有markdown/Vite警告保留（本会话artifact://26），未新部署、未重跑全量单测/E2E/LHCI。
