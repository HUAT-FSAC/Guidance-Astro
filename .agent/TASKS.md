# TASKS — GitHub Issue 本地镜像（只读）

> 同步：2026-11-04，Planning 第116轮；**GitHub Issues 可读写，为唯一权威**，本文件按本轮真实 Issue 状态**整体重写**（非增量打补丁），无降级。开工基线 `main@d3d04f92aa5405cbf1512318edbf88edd0beb560`，fetch / pull --rebase 成功，工作区干净。
> D-013 映射：`ready` = `status:backlog` + 正文首行「队列状态：ready」；`in-progress` = `status:in-progress`；`in-review` = `status:review`；`done` = `status:done`；`blocked` / `needs-info` 不并挂 backlog。`open` / `closed` 是 Issue 自身开闭状态，不在状态标签集合内。

## 今日队列（2026-11-04 规划；3 个 ready）

1. **[#295 执行 M4 收口后的 release 1.4.0 minor 发版与四方一致性核验](https://github.com/HUAT-FSAC/Guidance-Astro/issues/295)** — P1 / blocked（外部安全门禁拦截，评论 6688407297）/ low / 无 milestone。
    - 无硬依赖（M4 已显式关闭、PR274 持合已解除）。按 §11.1 / §11.2 合入 PR274 → 完整 SHA CI 全绿 → tag / Release Latest / package.json / CHANGELOG.md 四方一致 → 全 M4 合入提交祖先判定 → 部署必要性判断 → 同一请求 CSP 头体 nonce 一致与双语看板验收。
    - 明确不包含：版本号以外的代码 / 依赖 / CI / 缓存 / 凭据改动；不用 `Closes` / `Fix` 关键字（D-006）；不摄入 majors、不启动 M5；沿用 #197 默认 C 手工触发 Release PR CI。
    - 验收标准逐条可判定，见 Issue 正文；不自行 close，转 `in-review`。
2. **[#292 客户端导航后新页面内联脚本被当前文档 CSP 拦截](https://github.com/HUAT-FSAC/Guidance-Astro/issues/292)** — P2 / in-review（只读定位完成，评论 6688629454）/ low / 无 milestone / `auto-discovered`（来源保留）。
    - 无硬依赖。只读定位：按 sha256 反查被拦截内联脚本清单、确认 SPA 导航后哪些初始化逻辑确实没跑、给出 ≥2 修法方向及各自影响与推荐 / 默认方案，但**不实施**。
    - 明确不包含：不修改代码 / 配置 / CSP 头 / 脚本注入 / ClientRouter / 依赖；不放宽 `unsafe-inline`、不新增 nonce / hash 放行（§1.10 红线相邻，另轮决策）；不扩围修搜索或导航；零代码变更（`git diff` 为空）。
    - 原 Issue 正文已补分诊段与逐条 AC（本轮 `gh issue edit` 整体改写正文，首行「队列状态：ready」）；不自行 close。
3. **[#296 明确 Quality 时长采集器的跨 attempt 采样口径并出只读对照报告](https://github.com/HUAT-FSAC/Guidance-Astro/issues/296)** — P3 / in-review（只读对照完成，评论 6688733164）/ low / 无 milestone。
    - 无硬依赖（#286 / #294 已关闭）。只跑现有 `node scripts/quality/check-duration-budget.mjs --dry-run`，定义「端到端恢复墙钟」与「单 attempt 关键路径」双口径、给出 P95 对照并引用 #294 的 632s 样本，如实报告仍超标。
    - 明确不包含：不改脚本 / `.github/workflows/**` / 缓存 / 阈值 360 / 90 / 样本数 / 依赖 / 凭据；不实施受控安装环境或包源改造；不把恢复墙钟写成单 attempt 排队；零代码变更。
    - 验收标准逐条可判定，见 Issue 正文；不自行 close。

**开工前置（不占 ready 名额，Executor 自有文件）**：补记 Execution 第115轮交接链 —— 在 `.agent/DIARY/2026-10-27.md` 末尾追加明确标注「补记于 2026-11-04，非当日写入」的新行；刷新 STATE / HANDOFF 顶部执行快照；在 `WORKFLOW §7.4` 表格末尾追加第115轮 execution 行（Planner 第116轮行已由本轮追加）。不编辑 / 重排历史行、不伪造当日验证、不替 Planner 改 PLAN / DECISIONS。

三单均通过七条 ready 门禁（目标明确、范围清楚、依赖满足、无未决产品取舍、AC 逐条可判定、不触红线、无需凭空发明决策）；P1 仅 1 个，与今日执行容量匹配。

## 全部开放 Issue（6 项）

- **#295**：P1 / ready / low；M4 收口发版，本轮新建。
- **#292**：P2 / ready / low / `auto-discovered`；SPA/CSP 内联脚本只读定位，本轮分诊。
- **#296**：P3 / ready / low / `area:quality`；跨 attempt 采样口径只读报告，本轮新建。
- **#101**：P1 / blocked / medium；无 milestone。Secrets 仍仅 `CODECOV_TOKEN` / `PROJECT_TOKEN`；默认 B 单机 OAuth 部署，未经授权不恢复 CI deploy。
- **#197**：P3 / needs-info / medium；无 milestone。用户已确认默认 C，维持手工触发 Release PR CI，常驻观察、不重复提问。
- **#280**：P3 / blocked / medium；无 milestone。可选 Projects 的独立 `PROJECT_TOKEN` 凭据域，未授权不改权限 / 凭据 / workflow；Projects 非任务 SSOT。

统计：ready=3、in-progress=0、in-review=0、blocked=2、needs-info=1；P0=0，P1=2（其中 #101 为外部常驻阻塞，不占执行容量），P2=1，P3=3。

## 本轮关闭（7 项）

- **#287** — 通过关闭，验收 6634076909。异步初始化重入 / 过时容器切片 AC 满足；快捷键差距转 #289。
- **#279** — 通过关闭，验收 6634078031。AC3 由 #289 补齐，原 AC1/AC2/AC4–AC7 既有结论保留。
- **#262** — 通过关闭，验收 6634079195。原九项 AC3 由不通过转通过，其余八项沿用已认可证据，AC5 未破坏产物重跑如实保留；九项无剩余差距。
- **#286** — 通过关闭，验收 6634079897。只读调查交付认可；P95=729s>360 与底层根因未知如实保留，无 CI / 阈值改动。
- **#289** — 通过关闭并补 `priority:p1`，验收 6634081684。1.7 报告齐全、diff 与报告一致、PR291 CI / 生产证据充分；认可 Executor 自行准入但记录流程提醒（后续 auto-discovered 须先分诊），不追加 M4 成员。
- **#294** — 按重复合并关闭，分诊 6634083905。与 #286 同一 APT 传输长尾，P95=632s>360 属持续现象，不按抖动轻率消除。
- **Milestone #3（M4）** — 2026-11-04 由 Planner 显式关闭（D-020），REST 返回 `open=0 / closed=9`。PR274 持合解除。

以上六单均已加 `status:done`、移除 `status:review`（#294 保留原 `flaky` 等标签），Issue `state=closed`；验收结论写在各自 Issue comment。旧日报与既有报告未改写。

## 昨日验收（第114 / 115轮 → 第116轮）

- 输入：`.agent/DIARY/2026-10-27.md`（第114轮）、#289 执行报告（Execution 第115轮，2026-10-27T11:48:26Z）、#279 / #262 同日第115轮补充报告、五份 review 报告、`git show` diff、完整 SHA CI、生产真实表面证据。**2026-10-28 → 11-03 无日报、无 Planning 轮次**，按 §2 第 2 步以 git log / Issue comment / STATE / HANDOFF 反推；上一轮「报告缺失」的推断已由真实 Issue 状态更正。
- 无「报告失实」：五份报告均主动写明部分完成 / 调查完成并保留 #289 差距；第115轮补充报告逐条回填 AC3 且明确「Executor 不自行 close」，与代码事实一致。
- 独立核验：`git show 26f333a` / `54cdf01`（5 文件 +76/-10，与报告一致）；PR291 head `8ccb7fb` Pipeline `40495541570` success、PR291 MERGED（mergeCommit `54cdf01`）；生产单请求 CSP 头 `nonce-evZykEnu6MaSff5vingMlQ` 与 HTML 27 个 script nonce 一致、`private, no-cache, must-revalidate`、清单 404。
- 收敛判定：局部结论已定，M4 内无新的不一致；#292 与 #287 / #289 改动无关、不在原九项 AC，不并入完成信号。可诚实说 M4 已收敛，故显式关闭。

## Milestone 与发版

- **M4 #3：9 / 9，CLOSED**（2026-11-04 Planner 显式关闭）。成员逐单：done=#266/#264/#263/#268/#270/#281/#287/#279/#262，open=0；REST 汇总与成员一致。D-020 完成信号达成。
- **M2 / M3**：既有 closed；#101 / #197 / #280 / #292 / #294 / #295 / #296 不计 M4。
- **PR274 `release 1.4.0` minor：持合解除**，由 #295 按 §11 承接（发版时机不请示，§1.7）。合入后须做四方一致性、祖先判定与部署必要性判断。

## 开放 PR（4 张）

- **PR293**：常态 metrics 顺手项，仅 `src/data/metrics/project-progress.json` +46/-46，`generatedAt` `2026-11-04T06:19:04.273Z`，键路径与类型不变。按 update-branch → checks 绿 → 合入流程，不占今日 ready 名额。
- **PR274**：`1.4.0` minor 持合已解除，由 #295 合入。
- **PR186 / PR209**：majors 按 D-015 暂缓，保留 open standing reminders，不自动摄入、不计今日容量。

## 本轮证据与验证边界

- 实跑（只读 / 验证类）：`git fetch --all --prune`、`git pull --rebase`（Already up to date）、`git status --short`（空）、`git log`、`git show`、`git diff --stat`、`gh issue list/view/api/edit/create/comment`、`gh pr view/diff`、`gh run view 40495541570`、`curl` 单请求生产头体比对、`pnpm exec prettier --check` 基线。
- inbound：`HEAD..wsyhuat/main` 报 `f98be0d` / `d89b87e`（squash 吸收后的已知误报，吸收 commit `6a80906`）；f98be0d 声称的七个路径内容级 `git diff --stat main wsyhuat/main` 为**空**，确认已吸收。全仓 38 文件差异来自 d89b87e 旧批次 fork 落后主干（如 `src/utils/toast.ts` 在 fork 侧仍存在），属「对落后」而非分叉，不反向引入、不 merge fork。
- **`pnpm format:check` exit 0；`pnpm build` 两次均 exit 1（如实保留）**：Astro 主构建 `Complete`，但 `[search-index]` 阶段本地 wrangler dev 对 `/archive/2025/`、`/about-fs/`、`/archive/2025/electrical/`、`/archive/2024/2024-learning-roadmap/` 返回 404，脚本按设计删除旧 pagefind bundle 与清单；strip proxy 后 404 依旧，无残留 wrangler / workerd 进程；手动热启后仅 `/` 200、连 `/labs/` / `/en/join/` 也 404。`dist/client` 仅 offline.html（SSR）、sitemap 含上述 URL、生产正常、PR291 CI（含 Build）success ⇒ 本机 wrangler dev 的 ASSETS / 路由绑定限制，非代码回归，不 reopen #262、不改脚本 / 配置。已在 #295 留开工提示（6634313277）：发版以远端完整 SHA CI 为准，本机再失败按 AGENTS.md 重试一次、仍失败显式告知用户，不静默跳过部署。
- 未执行：全量单测 / E2E / LHCI、部署、`wrangler deployments list`；采用已核实远端门禁与本轮真实生产表面证据，不冒称本轮重跑全量门禁。`.tmp/issue286/` / `issue287/` / `issue289/` 原始日志已不在磁盘，依赖其内容的结论标注「据既有记录」。
- GraphQL 首次 `gh label list` 因本地代理 `127.0.0.1:7890` 超时，strip proxy 后所有 `gh` 写操作成功；不把首次失败写成成功。
- 本轮不写代码、测试或验证脚本，不替 Executor 合并 PR / 部署；DIARY / ENV 只读，STATE / HANDOFF 仅按仓库强制规则追加接力补记。
