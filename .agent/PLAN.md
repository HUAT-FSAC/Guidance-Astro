# PLAN — 项目路线图（Planning Agent 唯一写入点）

> 当前路线与队列快照；任务/验收以 GitHub Issues 为准，长期约束以 `DECISIONS.md` 为准。历史见 Git、Issue 评论与不可变日报。

最后核实：2026-10-24，Planning 第109轮。同步基线 `main@ac6b6d04836cd4da234ab40122b0a0a21125e691`；`git fetch --all --prune`、`git pull --rebase` 成功，开工工作区干净。wsyhuat/main 仍 f98be0d/d89b87e；f98be0d 七个改动路径内容级 diff 空，已由既有移植/squash `6a80906` 吸收，无新入站工作，不 merge fork。

## 当前方向

1. 修复 #262 验收暴露的两个原范围缺口：窄屏可见检索（#279）与真实路由/英文正文收录（#281），不把局部恢复写成全完成。
2. M4 保持开放、PR274 的 `1.4.0` minor 继续持合；完成全部原 AC 后再收口，不为发版缩范围。
3. 保持 Worker SSR、每请求 nonce、私有 HTML 缓存、现有 CI/预算/权限；Q4 不启动新功能（D-017）。

## 本轮验收（2026-10-24，第109轮）

输入：10-22、10-23、10-24 日报及所有追加，重点第108轮报告。10-24 日报已由 Executor 补建，上午第106轮是有来源的补录；不再沿用“日报缺失”。10-23及第106轮成果已由第105/107轮验收，不重复关闭。

| 项目  | 结论                                           | 独立证据与去向                                                                                                                                                                                                                                                                              |
| ----- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #270  | 通过，done/closed                              | [验收6386000882](https://github.com/HUAT-FSAC/Guidance-Astro/issues/270#issuecomment-6386000882)；`569d178` 仅 README.md 一行扩展名；本轮双语本地链接各19个、例图/互链/Prettier通过，PR278检查通过。该SHA的Pipeline为cancelled，最终HEAD Pipeline success补足当前主干证据，不抹掉取消记录。 |
| #262  | **不通过；报告部分勾选失实，退回 in-progress** | [逐条验收6386001757](https://github.com/HUAT-FSAC/Guidance-Astro/issues/262#issuecomment-6386001757)：原AC3要求窄屏可查询，现用例只断言dialog.open且报告明知视觉不可见；原收录契约要求实际Starlight routes，现按中文同名slug误排真实英文正文。认可桌面双语查询/nonce与已交付部分，不关闭。  |
| PR276 | 通过，顺手项已上线                             | [验收6386022987](https://github.com/HUAT-FSAC/Guidance-Astro/pull/276#issuecomment-6386022987)；`b04bfec` 仅metrics JSON，递归通用schema65路径零差异；生产双语看板04:34:53新快照在位，部署027692c7。                                                                                        |
| PR274 | 持合判断正确，非交付完成                       | [规划6386023211](https://github.com/HUAT-FSAC/Guidance-Astro/pull/274#issuecomment-6386023211)；实际已重算1.4.0，含feat(search)，不是旧计划的1.3.2 patch；M4未收敛，不得合并。                                                                                                              |

#262 为首次验收不通过，已按两个独立缺口拆小；不需要第三次盲试。旧报告/日报不改写，要求 Executor 追加更正。无剩余 in-review；没有重置任何开工时的 in-progress 现场。

## 今日目标（2026-10-24）

- #279：触屏用户能从窄屏可见入口打开、输入、查看正文结果并跳转；快捷键/SPA重开/焦点/关闭行为不退化。
- #281：实际 Starlight routes 决定URL/locale/isFallback，真实英文不同名slug不再被误排；生产正文查询证明覆盖恢复。
- 两子任务分别报告转review；#262追加更正与原九项AC完整重验报告后再转review，不自行close。报告不得只引用两个子任务就全部勾选。

## 当前 Milestone：M4 开发入口与能力声明一致性（进度：5 / 8）

GitHub Milestone #3，state=open。实际八成员由 REST 成员列表与 GraphQL 双源核对：done=#266/#264/#263/#268/#270；open=#262/#279/#281。

**计数限制**：开工原六成员汇总已恢复为2 open/4 closed；本轮新增两整改子任务并关闭#270后，REST汇总又为2 open/5 closed，与成员实际3 open/5 closed不符。采用双源逐单成员状态，不能把汇总2当成漏掉父单的理由；里程碑描述已更正，不假报收口。

### 目标与验收

- #262 原九项AC全部保留。#279负责唯一UI整改实现；#281负责唯一索引输入整改实现；#262作为整体验收父单，不重复开第三套实现。
- 实际生产浏览器验证中文 `301 → /labs/`、英文 `odometry → /en/join/` 及真实英文archive页独特正文词；可见输入、excerpt/高亮、点击、负例、SPA与窄屏入口均须有证据。
- 真fallback/重定向壳/草稿等按实际元数据排除；真实不同名英文正文不能因缺同名中文而排除。保持索引失败非零/旧bundle不可误用、临时清单与SSR快照不发布、原预算与nonce不退化。

### 完成信号（Success signal）

八成员全部由 Planner 验收关闭，实际open归零，再显式关闭M4（D-020），之后才允许合并PR274 minor。**当前5/8，未收敛；不得因索引资源200、桌面两个查询成功或CI绿就宣称全搜索恢复。**

### 明确非目标（Non-goals）

- 不隐藏/删除搜索、不改SSR/prerender/认证/权限/SESSION/ASSETS/nonce/CSP/缓存；不加provider/依赖/服务/凭据。
- 不改CI编排或预算阈值，不扩大翻译/历史内容整治，不自动摄入majors。
- 不实施可选Projects配置修复；不以禁用job掩盖Bad credentials，不将本机gh scopes当成Actions PAT的权限证明。

### 执行队列（2个ready，建议顺序）

| 顺序 | 任务                                                                                                               | 优先级 | 依赖与边界                                                                                        |
| ---- | ------------------------------------------------------------------------------------------------------------------ | ------ | ------------------------------------------------------------------------------------------------- |
| 1    | [#279 恢复窄屏搜索的可见入口与完整查询交互](https://github.com/HUAT-FSAC/Guidance-Astro/issues/279)                | P1     | ready；无硬依赖。现有Search单实例脱离隐藏nav、适配可见入口，不复制UI/ID/监听；更新弱化的窄屏E2E。 |
| 2    | [#281 修正搜索清单为真实Starlight路由并收录不同名英文正文](https://github.com/HUAT-FSAC/Guidance-Astro/issues/281) | P2     | ready；#266已done，与#279无硬依赖。删除错误手写fallback推导，使用真实元数据；不补翻译。           |

两任务通过七条ready门禁：目标/非目标/依赖/判定标准明确，无产品pending或红线变更，已有已安装路由API与现有UI可复用。独立分支/PR/报告，部署可在合入后合并一次，但每项生产AC不能省略。

#262为in-progress验收父单，不伪装成第三个ready。两子任务交付后，本轮执行会话可在父单追加更正及完整重验报告，再转review，等次轮Planner验收。

## 已知阻塞与依赖

| 项目      | 实际状态                      | 处理                                                                                                                                    |
| --------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| #262      | in-progress / P2 / M4         | 本轮从review退回；无未提交WIP。父单保留全部AC，整改由#279/#281唯一承担；不能提前关闭。                                                  |
| #101      | blocked / P1 / 无milestone    | Secrets仍仅CODECOV_TOKEN/PROJECT_TOKEN；单机OAuth默认B，生产027692c7；不恢复CI deploy、不重复问。                                       |
| #197      | needs-info / P3 / 无milestone | 用户已确认默认C；PR274检查空，沿用手工触发，等频率信号，不上PAT/App。                                                                   |
| #280      | blocked / P3 / 无milestone    | PROJECT_TOKEN名称存在但有效性/权限未知；与release令牌不同。只读排查已完成，Projects非任务SSOT，不制造重复调查任务或要求用户立即配凭据。 |
| PR274     | minor持合                     | 等M4实际全部验收与显式关闭；未进入今日ready队列。                                                                                       |
| PR186/209 | majors暂缓                    | D-015 standing reminders；不摄入、不关闭、不计今日容量。                                                                                |

## 治理与Executor信号回应

- 开放Issue6：ready2（279/281）、in-progress1（262）、blocked2（101/280）、needs-info1（197）；review0。P0=0、P1=2（279与外部阻塞101），未堆满队列P1。
- 无重复任务：279/281为262明确拆分的实现子任务，父单仅完整验收责任；不重复开实现。无方向冲突、未定级auto-discovered或普通饥饿任务；101/197和majors为已有明确保留条件的常驻项。
- 回应“验收后6/6可收口”：不成立，原AC仍有缺口，不能关闭M4；实际5/8与释放条件已写回Issue/PR。
- 回应279：P1 ready，纳入M4原搜索缺口整改。回应280：P3 blocked，独立凭据域，不合并197；10-22日报已有同路径失败，“首次执行”原结论不成立。
- 回应日报/现场：10-24日报已补建；STATE/HANDOFF的“搜索已恢复/无进行中/待6/6收口”须下一棒更正。Planner只按仓库强制规则追加接力补记，不重写Executor现场，ENV/DIARY只读。
- 开放PR3：274持合、186/209暂缓；276已合入。无新的bot metrics PR，未来仍按schema核查/CI/部署常态处理。

## 下一阶段

两个整改子任务与262原AC经Planner验收后，按D-020收口M4，再按§11.1/11.2/11.3处理PR274。当前不建M5、不启动新功能。

## 已放弃或暂缓的方向

- 通过降低AC（dialog.open替代可见检索）或收录计数固定常量来宣称搜索完成。
- 由中文同名文件推断英文fallback、复制路由算法或把不同语言slug字面集合差当缺陷。
- 未授权隐藏搜索、改全站预渲染、扩大翻译/权限/CI、majors自动摄入。

## Decision Gate

pending=0；D-001..D-022继续生效，D-022的真实routes要求不放宽。#280沿既有“Projects不是任务SSOT”事实暂缓，不提出新权限取舍；无需要用户立即拍板的事项。

## 给 Executor 的指令

先做#279，再做#281，各自按Issue全AC交付；在#262追加更正与原九项完整重验报告，再转review，不自行close。M4未收口前不合PR274；刷新自有STATE/HANDOFF/TASKS状态，日报只追加，不改历史。

## 本轮验证边界

- 已运行只读实际场景：原生Playwright生产双语查询/点击、中文excerpt高亮/负例0、截图；真实英文页200/正文与现有分类器误排对照；双语看板快照；两次首页各27 script nonce一致且跨请求不同、HTML私有缓存、清单404；wrangler只读deployment、完整SHA CI、PR检查、milestone双源、七路径inbound。
- Prettier双语README与现有15条分类器单测exit0；单测全绿却漏真实英文不同名slug边界，不能代替规格通过。本轮未新增代码/测试/验证脚本或生产部署。
- 保留失败证据：browser helper受既有Worker包装问题影响已报工具问题，改原生Chromium；负例首次快捷键时序失败改等待enabled按钮后通过；README嵌套badge解析器两次失败后修正。上述探针失败不是新增产品缺陷，也不冒称首次全绿。
- 收尾验证：`pnpm format:check`、`pnpm quality:audit`、`pnpm build` 均exit0；build实际完成SSR与Pagefind生成（zh76/en36、112页、132文件/963.5KiB），同时明确列出真实英文页被误排为fallback，绿色build不代表规格通过。保留既有markdown弃用/Vite directive警告完整输出（本会话artifact://26），不称零警告；未重跑全量单测/E2E/LHCI，未部署文档记录。
