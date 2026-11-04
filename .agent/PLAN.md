# PLAN — 项目路线图（Planning Agent 唯一写入点）

> 路线与队列快照；任务/验收以 GitHub Issues 为权威，长期约束以 `DECISIONS.md` 为准。历史见 Git、Issue 评论与不可变日报。

最后核实：2026-11-04，Planning 第116轮。开工 `main@d3d04f92aa5405cbf1512318edbf88edd0beb560`，`git fetch --all --prune` + `git pull --rebase` 成功（Already up to date），工作区干净。gh 可用（账号 `zhangjszs`，scopes `repo` / `workflow` / `read:org` / `gist`），**Issue 为权威**，`TASKS.md` 本轮从真实 Issue 状态整体重写。inbound 逐 remote 巡检已完成。`WORKFLOW §7.4` GraphQL 首次因本地代理超时，strip proxy 后全部写操作成功。`.agent/LOCK` 不存在。

## 当前方向

1. **M4 已完成并显式关闭（9/9、open=0）**：按 §11 发版 `1.4.0` minor（#295），解除 PR274 持合。发版不改代码，只做四方一致性、祖先判定、部署必要性判断与 nonce 复核。
2. **收敛两个新 auto-discovered**：#292（SPA 导航后内联脚本被当前文档 CSP 拦截）先只读定位，修法涉安全红线不进 ready；#294（时长超标重复告警）已与 #286 合并关闭，#296 承接跨 attempt 采样口径澄清。
3. **补齐跨天链条**：Execution 第115轮（2026-10-27 晚间）在 Issue 上留了完整 1.7 报告，但漏写日报 / STATE / HANDOFF / §7.4；按追加式补记，不改历史行、不伪造当日写入。

## 昨日现场（验收输入）

- 最后日报 `.agent/DIARY/2026-10-27.md`（Execution 第114轮）。2026-10-28 → 11-03 无日报、无 Planning 轮次；第115轮执行会话（10-27 晚间）亦无日报。按 §2 第 2 步以 git log / Issue comment / STATE / HANDOFF 反推。
- `.git/logs/HEAD:788-793` 与 `git log` 显示 PR291 `54cdf01`（#289 快捷键切换）与 PR290 `d3d04f9`（metrics）合入 main。**更正上一轮在权限阻断下基于陈旧 `TASKS.md` 的推断**：#289 有 1.7 全字段执行报告（Execution 第115轮，2026-10-27T11:48:26Z），#279 / #262 同日 11:48 各有第115轮补充报告，#292 / #294 为同期新登记项。「昨日日报缺失」属实，但**「报告缺失 / 交接断链无报告」不成立** —— 缺的只是日报、STATE/HANDOFF 顶部快照与 §7.4 行，本轮不延续旧推断。
- 验收输入 = 五份 review 报告 + 第115轮补充报告 + `git show` diff + 完整 SHA CI + 生产真实表面证据。

## 昨日验收（第114 / 115轮产出 → 第116轮独立核验）

- **#286 通过关闭**（[验收 6634079897](https://github.com/HUAT-FSAC/Guidance-Astro/issues/286#issuecomment-6634079897)）：只读调查交付认可。四 run 原始日志证实浏览器缓存命中、APT 25.9MB 下载 556/643/585/587s（40.3–46.7kB/s），同 SHA 重跑下载 2s / 安装 13s；774s 属混合 attempt 恢复墙钟，未冒充 runner 排队。默认 20 样本 `--dry-run` exit 0 但 P95=729s>360、E2E 最长 30s<90 如实保留，底层镜像负载 / 出口网络未知。无 CI / 缓存 / 依赖 / 阈值改动。
- **#287 通过关闭**（[6634076909](https://github.com/HUAT-FSAC/Guidance-Astro/issues/287#issuecomment-6634076909)）：本轮 `git show 26f333a` / `54cdf01` 只读核实 `initPagefindUI` 在 await 后同步重检 `isConnected`、目标身份与已有 `.pagefind-ui`，检查与构造相邻，无锁 / 隐藏 / 删除重复 DOM；旧构建 3 条回归真实失败、修复后 50 E2E 通过。快捷键关闭差距不属本切片，转 #289。
- **#279 通过关闭**（[6634078031](https://github.com/HUAT-FSAC/Guidance-Astro/issues/279#issuecomment-6634078031)）：AC3 由 #289 补齐 —— 修复前真实失败（第二次 Ctrl+K 后 dialog 仍带 open）、修复后 52 E2E、生产三视口原生 Chromium 开关 / 焦点 / 滚动锁；原 AC1/AC2/AC4–AC7 既有结论保留。连续两次部分通过后的最后缺口由单一窄任务消除，不再第三次宽泛重试（§3.6）。
- **#262 通过关闭**（[6634079195](https://github.com/HUAT-FSAC/Guidance-Astro/issues/262#issuecomment-6634079195)）：原九项 AC3 由不通过转通过（生产三样本查询 301 / odometry / VCU 命中跳转、SPA 后正常、无重复失效监听、焦点 / 锁正确、pageErrors 空）；其余八项沿用第114轮报告 6422830912 与第113轮 6417363659 已认可证据，AC5 未破坏产物重跑如实保留。九项无剩余差距。
- **#289 通过关闭并补 P1**（[6634081684](https://github.com/HUAT-FSAC/Guidance-Astro/issues/289#issuecomment-6634081684)）：1.7 全字段报告齐全；本轮 `git show 54cdf01` 为 5 文件 +76/-10，移除 document 层 Ctrl/Cmd+K 拦截与 `stopPropagation`、`site-search-element.ts` 改大小写不敏感、+58 行 E2E、README 同步，与报告一致；PR291 head `8ccb7fb` Pipeline `40495541570` success、PR291 MERGED（mergeCommit `54cdf01`）、生产 Version `ae4d4967`。流程提醒：本单原为 `auto-discovered` 未分诊而由 Executor 依据已批准的 #279 AC3 自行准入，因属实现层缺口、低风险可回滚且报告明确记录理由并请 Planner 复核，本轮认可实施并补定级 P1、不追加 M4 成员；**后续 auto-discovered 须先经 Planner 分诊再进 ready**。
- **#294 按重复合并关闭**（[6634083905](https://github.com/HUAT-FSAC/Guidance-Astro/issues/294#issuecomment-6634083905)）：与 #286 同一 APT 传输长尾，20 样本 P95=632s>360 属持续现象，不按「抖动」轻率消除，也不新建重复实施单。
- **收敛判定与 M4 显式关闭**：REST milestone #3 成员 9（closed 9 / open 0），汇总与成员一致；按 D-020 由 Planner 显式 `PATCH state=closed`（返回 open=0 / closed=9）。#292 与 #287/#289 改动无关、不在原九项 AC，不并入 M4 完成信号；PR274 持合解除。局部结论已定且无新的 M4 内不一致，可诚实说 M4 已收敛。
- 无「报告失实」；唯一流程缺口是第115轮未写日报 / 未刷新 STATE / HANDOFF / §7.4，已列今日开工前置补记。

## 今日目标（2026-11-04）

- **#295**：按 §11 完成 `1.4.0` minor 发版、四方一致性、祖先判定与部署必要性判断，生产 CSP nonce 单请求头体一致。
- **#292**：只读产出被拦截内联脚本清单、影响面与 ≥2 修法方向，零代码变更，不碰 CSP 红线。
- **#296**：只读澄清跨 attempt 采样口径并引用 #294 的 632s 样本，如实报告 P95 仍超标。
- **开工前置**：以追加式更正补记第115轮日报与 STATE / HANDOFF / §7.4，不改历史行。

## 当前 Milestone：M4 开发入口与能力声明一致性（进度：9 / 9，已关闭）

- **done（9）**：#266、#264、#263、#268、#270、#281、#287、#279、#262。**open（0）**。REST 汇总与成员逐单一致，不凭汇总推断，也不凭记忆写进度。
- #289 不追加 M4 成员（不扩大已冻结的九成员范围）；#292 / #294 / #295 / #296 均不计 M4。
- 2026-11-04 由 Planner 显式关闭 Milestone #3（D-020）。

### 完成信号（Success signal）

九成员实际 open 归零 + Planner 显式关闭 —— **已达成**，PR274（`1.4.0` minor）持合解除，发版由 #295 承接。

### 明确非目标（Non-goals）

- 不因 M4 关闭启动 M5 / Q4 新功能（D-017），不摄入 majors PR186 / PR209（D-015）。
- 不改变 SSR / 认证 / 权限 / SESSION / ASSETS / CSP / 缓存，不新增 provider / 服务 / 凭据 / 依赖。
- 不为发版缩减原九项 AC，不以绿色 build 或 `.first()` 样本替代完整可用性。
- #292 修法方向涉及 CSP / 内联脚本安全策略（§1.10 红线相邻）：本轮只批准只读定位，任何放宽 `unsafe-inline` 或新增放行需另轮由 Planner 决策、必要时按 6.2 问用户。

### 执行队列（3 个 ready，建议顺序）

1. **[#295 执行 M4 收口后的 release 1.4.0 minor 发版与四方一致性核验](https://github.com/HUAT-FSAC/Guidance-Astro/issues/295)**（P1，low，无 milestone）：无硬依赖（M4 已关闭、PR274 持合已解除）。按 §11.1 / §11.2 合入 PR274 → 完整 SHA CI 全绿 → 四方一致性 → 祖先判定 → 部署必要性判断 → nonce 复核；不自行 close。
2. **[#292 客户端导航后新页面内联脚本被当前文档 CSP 拦截](https://github.com/HUAT-FSAC/Guidance-Astro/issues/292)**（P2，low，无 milestone）：无硬依赖。只读定位脚本清单 / 影响面 / ≥2 修法方向与影响分析，零代码变更，不实施任何 CSP 改动；转 in-review。
3. **[#296 明确 Quality 时长采集器的跨 attempt 采样口径并出只读对照报告](https://github.com/HUAT-FSAC/Guidance-Astro/issues/296)**（P3，low，无 milestone）：无硬依赖（#286 / #294 已关闭）。只跑现有 `--dry-run`，不改脚本 / 阈值 / 样本数 / CI，如实引用 #294 的 632s 样本。

**开工前置（不占 ready 名额，Executor 自有文件）**：补记第115轮交接链 —— 在 `.agent/DIARY/2026-10-27.md` 末尾追加明确标注「补记于 2026-11-04，非当日写入」的新行；刷新 STATE / HANDOFF 顶部执行快照；在 `WORKFLOW §7.4` 表格末尾追加第115轮 execution 行（Planner 第116轮行已由本轮追加）。不编辑 / 重排任何历史行，不伪造当日验证，不替 Planner 改 PLAN / DECISIONS。

- 三单均过七条 ready 门禁：目标与范围清楚、无硬依赖、无未决产品取舍、AC 逐条可判定、不触 §1.10 红线；一个不了解历史的工程师凭仓库内信息即可开工，不需要凭空发明决策。P1 仅 1 个，与今日执行容量匹配。
- **常态顺手项 PR293**：仅 `src/data/metrics/project-progress.json` +46/-46，`generatedAt` `2026-11-04T06:19:04.273Z`，键路径与类型不变；按既有 update-branch → checks 绿 → 合入流程，不占 ready 名额。

## 已知阻塞与依赖

- **#101** blocked，Secrets 仍仅 `CODECOV_TOKEN` / `PROJECT_TOKEN`；默认 B 单机 OAuth 部署，未经授权不恢复 CI deploy。
- **#197** needs-info，用户已确认默认 C 手工触发 Release PR CI；常驻观察，不重复提问。注意 #295 发版须沿用该默认，不擅自改 PR 级 CI。
- **#280** blocked，可选 Projects 的独立 `PROJECT_TOKEN` 凭据域；Projects 非任务 SSOT，不扩权、不禁 job。
- **PR186 / PR209**：D-015 majors standing reminders，保持暂缓。
- **本机 `pnpm build` 的 `[search-index]` 阶段**：两次 exit 1、热服务下非首页路由 404，属 wrangler dev 的 ASSETS / 路由绑定限制（详见「本轮验证边界」）。不影响生产与远端 CI；不实施脚本 / 配置修改（Planner 不写代码），不 reopen #262。发版以远端完整 SHA CI 为准。

## 治理与 Executor 信号回应

- 逐单过 4.1：重复（#294 与 #286 互链后关闭被合并者；#287 / #279 / #262 父子不重复实现，剩余差距由 #289 单一任务承载）；ready 质量回落（三单 AC 逐条可判定、依赖已满足）；方向冲突（无）；auto-discovered 定级（#292 补 P2 / low / 范围 / AC / 测试要求；#289 补 P1）；无优先级（#295 P1、#292 P2、#296 P3）；长期饥饿（#197 用户已确认常驻观察、#280 外部凭据阻塞、#101 外部阻塞，均非「排队未动」，按既有裁定保留，不按 P3 饥饿自动关闭）；blocked（#101 / #280 为外部阻塞，本轮无法排除）；needs-info（#197 已有默认 C，无需提问）；疑似中断（无 `in-progress` 超 24h 项 —— 第115轮四单已转 review 并由本轮验收）；一致性（按 1.6 从真实 Issue 整体重写 `TASKS.md`）。
- 日报「给 Planner 的信号」逐条回应：①「优先独立验收四份 review、分诊 #289、明确唯一快捷键所有者后再给 ready」→ 已验收五单、#289 已分诊并补 P1、源码确认 `<site-search>` 为唯一所有者；②「#286 另评估跨 attempt 采样口径窄单、保留默认 20 样本监测」→ 已建 #296；③「反复 APT>120s / P95 持续>360 再安排受控安装环境调查」→ 触发条件记入 #296 AC，但不入 ready（红线相邻）；④「M4 显式收口前不合 PR274」→ 条件已达成，本轮显式关闭 M4 并建 #295 发版；⑤「消费队列不等于全验收」→ 遵守，五单逐条验收且 #292 不宣称完成。
- 第115轮补充报告的三条建议（独立验收 AC3、决定 M4 收口、为 CSP auto-discovered 定级排期）已逐条落实：五单验收关闭、M4 显式关闭、#292 分诊入今日队列。
- 上一轮「8/8 即收口」与第113轮「6/9 保持 OPEN」均为当时真实状态，不回退已完成成果、不改写旧日报；本轮 9/9 是逐单验收后的新事实。
- 不改日报 / ENV 的既有行；按仓库强制规则仅向 STATE / HANDOFF **追加**接力补记，不覆盖 Executor 现场；§7.4 表格末尾追加一行。

## 下一阶段

M4 已收敛并发版后按 §11 继续 patch 档节奏。#292 定位结果决定是否另立修法单（可能需用户决策）；#296 结论决定是否安排受控安装环境 / 包源调查（红线相邻，仅触发条件持续成立时另轮评估）。`/` 快捷键单一所有者不一致（#289 剩余风险）记为 P4 待办，不入今日队列 —— 与 #292 同改 `src/utils/enhanced-search.ts`，见 §7.3 文件互斥。

## 已放弃的方向

- 以一个 `site-search` 外壳、唯一 ID 或 `.first()` 查询成功推断内部 UI 唯一。
- 因局部通过就采纳日报建议提前关闭 M4 / 发布 minor；第三次宽泛重试搜索而不拆小边界。
- 直接把时长异常当 E2E 测试回退，或凭耗时位置推断安装根因后擅自修改 CI。
- 把「代码已合入 main」等同于「已验收」；用编辑历史日报的方式掩盖缺失的会话记录；把 #292 的 CSP 修法直接放进 ready「先让 Executor 试试看」。

## Decision Gate

`pending=0`，D-001..D-022 继续生效；无新长期产品取舍，不新增仅属任务细节的决策编号，不重复询问已确认默认。M4 显式关闭与发版按 D-020 / §11 执行、发版时机不请示（§1.7）；#289 补定级、#292 / #296 分诊均属低风险工程裁定，不授权突破红线。

## 本轮验证边界

- 本轮实跑（只读 / 验证类）：`git fetch --all --prune`、`git pull --rebase`、`git log`、`git show 26f333a` / `54cdf01`、`git diff --stat` 入站比对、`gh issue list/view/api`、`gh pr view/diff`、`gh run view 40495541570`、`curl` 单请求生产头体比对。
- 生产实测：HTTP 200，CSP 含 `'nonce-evZykEnu6MaSff5vingMlQ'`，同请求响应头 nonce 与 HTML 27 个 `script` nonce 一致，`cache-control: private, no-cache, must-revalidate`，`/_search-manifest.json` 404。
- inbound：`HEAD..wsyhuat/main` 报 `f98be0d` / `d89b87e`（squash 吸收后的已知误报，吸收 commit `6a80906`）；对 f98be0d 声称的七个路径做内容级 `git diff --stat main wsyhuat/main` 为**空**，确认已吸收。全仓 38 文件差异来自 d89b87e 旧批次 fork **落后**主干（如 `src/utils/toast.ts` 在 fork 侧仍存在），属「对落后」而非分叉，不反向引入、不 merge fork。`wsyhuat/chore/update-metrics` 为 bot 分支 forced update，非待移植工作。
- **`pnpm build` 实跑两次均 exit 1（如实记录，不隐藏）**：`pnpm format:check` exit 0；两次 build 的 Astro 主构建均 `Server built / Complete`，但 `[search-index]` 后处理失败 —— 本地 wrangler dev 对 `/archive/2025/`、`/about-fs/`、`/archive/2025/electrical/`、`/archive/2024/2024-learning-roadmap/` 返回 404，脚本按设计 `exited nonzero; stale pagefind bundle removed and manifest deleted`。首跑有 `Proxy environment variables detected` warning，strip proxy 后 warning 消失但 404 依旧；`ps` 无残留 wrangler / workerd。手动热启 wrangler dev 并等待就绪后复测：仅 `/` 返回 200，连 `/labs/`、`/en/join/` 也 404。`dist/client` 仅 `offline.html`（SSR 架构）、sitemap 含上述 URL、生产线上页面正常、PR291 CI（含 Build）`40495541570` success ⇒ 判定为**本机 wrangler dev 的 ASSETS / 路由绑定限制**，不是代码回归，不据此 reopen #262、不改任何脚本 / 配置。已在 #295 留开工提示（6634313277）：发版以远端完整 SHA 的 CI 为准，本机再失败按 AGENTS.md 记录并重试一次、仍失败显式告知用户，不静默跳过部署。
- **未执行**：全量单测 / E2E / LHCI、部署、`wrangler deployments list`；采用已核实远端门禁（`40495541570` success）与本轮真实生产表面证据，不冒称本轮重跑全量门禁。`.tmp/issue286/` / `.tmp/issue287/` / `.tmp/issue289/` 原始日志已不在磁盘，依赖其内容的结论标注「据既有记录」。
- 无代码 / 测试 / 验证脚本、无合并或部署动作；本轮只改 `.agent/` 文档、`WORKFLOW §7.4` 与 GitHub Issue 状态。

## 给 Executor 的指令

开工先补记第115轮交接链（追加式，不改历史行），再按 #295 → #292 → #296 顺序执行；三单均不得自行 close，转 `in-review` 由 Planner 验收。发版沿用 #197 默认 C，不改 PR 级 CI；PR293 按常态顺手流程合入。本地 build 的 `[search-index]` 阶段已知在本机失败（见「本轮验证边界」），发版以远端完整 SHA 的 CI 为准，不要擅自改 `scripts/search/build-index.ts`、阈值或 CI；M4 已显式关闭，不必再等持合解除。
