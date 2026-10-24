# TASKS — Issue 本地镜像

> 同步：2026-10-23，Planning 第105轮，依据真实 GitHub Issues **整体重写**；`gh` 可读写，无降级。
> 开工基线：`main@de5facfbf8451c3cef825426010d95e389a6204f`。D-013：正文首行 ready + `status:backlog`；review 映射 `status:review`；blocked/needs-info 不再并挂 backlog 状态。

## 今日队列（2026-10-23，4 项，建议顺序）

| 顺序 | Issue / 任务                                                                                                  | 优先级 | 状态  | 依赖与交付边界                                                                                                                              |
| ---- | ------------------------------------------------------------------------------------------------------------- | ------ | ----- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | [#263 恢复 PR271，完成死配置清理的受控产物验证与合入](https://github.com/HUAT-FSAC/Guidance-Astro/issues/263) | P3     | ready | 无外部依赖；保留已有三文件实现，先 A/A、A/B 保存原始产物，仅允许确证的 manifest.key 自然波动；满足后合入并转 review，不能凭旧哈希放行。     |
| 2    | [#268 恢复英文 season-notes 的真实正文并消除自重定向](https://github.com/HUAT-FSAC/Guidance-Astro/issues/268) | P2     | ready | 无依赖；既有英文 URL 不变，依据中文记录忠实补正文，不扩展全站翻译；实际浏览器导航、部署与 nonce 验证。                                      |
| 3    | [#262 恢复现有站内搜索](https://github.com/HUAT-FSAC/Guidance-Astro/issues/262)                               | P2     | ready | 唯一硬前置 #266 已 done；实际 routes → 本地 SSR HTML → addHTMLFile；生产双语正文查询、快捷键/SPA、索引清理与 SSR nonce 全部验收，不删入口。 |
| 4    | [#270 修正中文 README 例图为现有 WebP 资产](https://github.com/HUAT-FSAC/Guidance-Astro/issues/270)           | P3     | ready | 无依赖；只将中文示例扩展名改为现有 WebP，不重写人类正文、不改图片，根 README 无需部署。                                                     |

四项均具备目标、范围/非目标、已满足依赖、无产品未决、可判定 AC、红线边界、陌生工程师可开工信息。排序不是新增依赖：先 #263 保持产物对照不混入后续业务变更，#268 先恢复正文便于 #262 随构建收录，#262/#270 共享 README 故串行。

## 全部开放 Issue（6 项）

| Issue | 优先级 / 风险 | 状态及实际标签                                                      | Milestone / 下一步                                                               |
| ----- | ------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| #263  | P3 / low      | ready；status:backlog、type:tech-debt、area:devops、auto-discovered | M4 #3；部分通过，PR271 保留，恢复验证前置已写入正文与评论 6367819802。           |
| #268  | P2 / low      | ready；status:backlog、type:bug、area:docs-content、auto-discovered | M4 #3；分诊评论 6367867924，英文 index 两处既有入口指向该 URL。                  |
| #262  | P2 / medium   | ready；status:backlog、type:bug、area:frontend、auto-discovered     | M4 #3；准入评论 6367865815，#266 已关闭，原四条修复 AC 保留并具体化。            |
| #270  | P3 / low      | ready；status:backlog、documentation、area:docs、auto-discovered    | M4 #3；分诊评论 6367869389，与英文已存在 WebP 示例对齐。                         |
| #101  | P1 / medium   | blocked；type:task、area:devops                                     | 无 milestone；Secret 仍缺，维持用户已确认单机 OAuth 默认 B；不恢复 CI deploy。   |
| #197  | P3 / medium   | needs-info；type:task、area:devops、dependencies                    | 无 milestone；用户已确认默认 C，维持手工 CI 触发，等频率信号，不重复问 PAT/App。 |

统计：ready=4，in-progress=0，in-review=0，blocked=1，needs-info=1；无未分诊 auto-discovered。开放 P0=0，P1=1（仅外部阻塞 #101）；无优先级膨胀、无执行中断现场可重置。

## 本轮验收与日报信号回应

输入：10-22、10-23 日报及全部追加。10-22 的 #260/#258 已由上轮验收，不重复记功；本轮接受最新第104轮交付，不把同日成果伪称为昨日成果。

| 项目  | 结论                                  | 独立证据 / 验收记录                                                                                                                                                                                                                                                                                      |
| ----- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #266  | **通过，done/closed**                 | [6367792880](https://github.com/HUAT-FSAC/Guidance-Astro/issues/266#issuecomment-6367792880)；独立读路由/渲染/Pagefind 契约，本轮真实 SSR `/labs/`、`/en/join/` 正文经 addHTMLFile 返回 errors=[]、URL/nonce 一致，内存索引关闭、未写 bundle。采用 142候选/24壳更正，不假称搜索恢复。                    |
| #264  | **通过，done/closed**                 | [6367793442](https://github.com/HUAT-FSAC/Guidance-Astro/issues/264#issuecomment-6367793442)；`8ea6872` 仅英文 README；14章/4子节/16命令/42本地链接及 WebP/双向语言链接实跑通过，Prettier exit0；完整 SHA 三工作流 success，Pipeline attempt2，旧取消史保留。                                            |
| #263  | **部分通过，不关闭；blocked → ready** | [6367819802](https://github.com/HUAT-FSAC/Guidance-Astro/issues/263#issuecomment-6367819802)；三文件 diff、PR checks 与 gitleaks 8.22.1 实扫 678commits/14.56MB/no leaks found 独立读取；旧两份清单各607项、manifest 哈希不同属实。旧字节已丢失，不能证明唯一随机 key 差异；新增受控验证后再合入。       |
| PR267 | **顺手项复核通过**                    | [6367796421](https://github.com/HUAT-FSAC/Guidance-Astro/pull/267#issuecomment-6367796421)；`88d7c28` 仅 metrics JSON，通用数组键路径64/64一致（含根 `$`）；新 dueDate:null 符合采集器既有 nullable 契约。完整 SHA 三工作流 success，最新部署 Version6c003201，本轮首页 nonce 与双语看板新快照复核通过。 |

日报信号逐条处置：#266 go 已核准、fallback 去重与重定向壳规则已明文写入 #262；#263 受控比较前置已补且优先恢复；#268/#270 已分诊定级/补 AC/纳入 M4；镜像旧成员数、PR数及部署信息已整体刷新。无新增用户问题。

## Milestone 核实

- **M4 #3：2/6，尚未收敛**。GraphQL `totalCount=6` 与 REST 按 milestone 成员列表一致：#266/#264 CLOSED，#262/#263/#268/#270 OPEN。较原4项新增两条真实缺陷，不是启动新功能。
- REST 汇总 `milestones/3.open_issues=1 / closed_issues=0` **仍与两源成员状态不一致**。进度按实际成员计算，不缩范围、不假报归零；收口须再次核对，未满足 D-020 不关闭 milestone。
- M3 #2 与 M2 #1 保持既有 closed；#101/#197 不计入 M4。

## 关键范围与证据纪律

- **#263**：原允许文件仍仅 `.dev.vars.example`、`src/env.d.ts` 七字段、推送现状指南；Umami 可选及其余声明/SESSION/ASSETS/nonce/CI/依赖均不动。先同步 main，再 A/A、A/B 保存覆盖前原始产物，仅精确归一唯一 manifest.key；其他差异必须 blocked，不改 ASTRO_KEY 消除差异。旧 hash JSON 不是旧原始模块。
- **#262**：生产 draft/pagefind:false/fallback/404、HTTP3xx 与真实 HTML 重定向壳排除；sidebar.hidden 不是排除条件。历史142不是硬编码目标；中文 fallback 不污染英文索引。失败使 build 非零、不复用旧 bundle，关闭子进程并清除清单/HTML样本；只发布索引资源，不发布内部清单或 SSR 快照。
- 搜索生产 AC 含 `301 → /labs/`、`odometry → /en/join/` 的正文 excerpt/高亮/点击、负例、快捷键、SPA重开、现有预算与私有缓存/nonce；按钮可见或资源存在不足以验收。
- **#268**：仅既有英文 season-notes 文档；按中文记录补事实对应正文，不改 URL、不增加全站翻译，也不重定向中文冒充英文修复。
- **#270**：仅中文示例扩展名；实际资产及链接检查，不新增措辞测试。
- 每单留 §1.7 全字段报告并转 review，Executor 不关闭任务。代码/普通文档与 `.agent` 记录分属提交；禁止 force push 或重写已推送历史。

## 开放 PR（3 张）

| PR   | 当前状态与处置                                                                                                               |
| ---- | ---------------------------------------------------------------------------------------------------------------------------- |
| #271 | OPEN，`agent/issue-263-unused-env@5b3fad6e6cb56058808495adbc6040bac3cad019`，三文件实现待恢复比较/合入；PR绿不代表主干交付。 |
| #209 | npm majors，D-015 暂缓，不摄入。                                                                                             |
| #186 | GitHub Actions majors，D-015 暂缓，不摄入。                                                                                  |

无开放 Release 或 bot metrics PR。后续再生 metrics 按 PLAN 常态指令核查，不预造任务。

## 环境与当前线上

- 最新 deployment `c7ebba8d-1737-4419-8d13-c2e2f1143817` → Version `6c003201-cdd5-40d7-b06c-585acab18867`（100%，2026-10-23T14:13:54Z）；**不含 PR271，搜索未修复**。
- 本轮首页200、27个script nonce均与同请求CSP一致（`N0cQxOw1zuay4l7y9Ns3eg`），缓存 private/no-cache/must-revalidate；中英真实看板200、04:47:39快照/M4在位。只读复核，不假称新部署或新截图。
- 开工 `de5facf` 的 Pipeline39968852841 / Secret Scan39968852899 / Release Please39968852819 均success；Dependabot开放告警0。未把历史CI当作当前新跑全套门禁。
- inbound：`wsyhuat/main` 仍 f98be0d/d89b87e，七改动路径内容级diff空；f98be0d已吸收为6a80906，后者d89b87e为其祖先，无待移植工作，不merge fork。
- 本轮未写代码/测试/验证脚本，内联只读验证不落文件，SSR服务已停止。ENV/DIARY不改；按仓库必需接力协议仅向STATE/HANDOFF附Planner补记，不覆盖Executor快照。
