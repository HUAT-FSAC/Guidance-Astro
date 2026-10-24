# PLAN — 项目路线图（Planning Agent 唯一写入点）

> 当前路线与队列快照；任务/验收以 GitHub Issues 为准，长期约束以 `DECISIONS.md` 为准。历史见 Git、Issue 评论与不可变日报。

最后核实：2026-10-25，Planning 第110轮（CST 2026-10-25 / UTC 2026-10-24T16:37Z）。同步基线 `main@1024167c150b628b165ba47a96ddafeddecd85ee`；`git fetch --all --prune`、`git pull --rebase` 成功，开工工作区干净。`wsyhuat/main` 仍 `f98be0d`/`d89b87e`；`f98be0d` 七个改动路径内容级 diff 为空（已由既有移植/squash `6a80906` 吸收），无新入站工作，不 merge fork。

## 当前方向

1. 推进 #262 验收暴露的两个原范围整改子任务：窄屏可见检索（#279，P1）与真实 Starlight 路由/英文不同名正文收录（#281，P2），完成后在父单 #262 汇总原九项 AC 重验证据并转 review。
2. M4 保持开放（实际进度 5/8）、PR274 的 `1.4.0` minor 继续持合；完成全部原 AC 并由 Planner 验收关闭后再收口 M4，不为发版缩减范围。
3. 保持 Worker SSR、每请求 nonce、私有 HTML 缓存、现有 CI/预算/权限边界；Q4 不启动新功能（D-017）。

## 本轮验收与跨日现场核实（2026-10-25，第110轮）

输入：`.agent/DIARY/2026-10-24.md`、`.agent/DIARY/2026-10-23.md`、`.agent/DIARY/2026-10-22.md` 及 `STATE.md`/`HANDOFF.md`。

- **无新待验收（`in-review = 0`）**：自昨日第109轮规划落盘（`1024167`，2026-10-24T23:33+08:00 / 15:33Z）以来，Execution Agent 尚未启动新会话，仓库无新代码提交、无新 `status:review` 任务、亦无 `2026-10-25.md` 日报（符合先 Planning 后 Execution 的每日串行节奏）。
- **昨日（2026-10-24）产出状态保持不变**：
    - 第106轮三项（#272 / #263 / #268）已于第107轮独立验收关闭。
    - 第108轮产出已于第109轮完成独立验收：#270 通过关闭（[6386000882](https://github.com/HUAT-FSAC/Guidance-Astro/issues/270#issuecomment-6386000882)）；PR276 通过上线（[6386022987](https://github.com/HUAT-FSAC/Guidance-Astro/pull/276#issuecomment-6386022987)）；PR274 `1.4.0` minor 持合判断正确（[6386023211](https://github.com/HUAT-FSAC/Guidance-Astro/pull/274#issuecomment-6386023211)）；**#262 不通过且报告部分勾选失实**（[6386001757](https://github.com/HUAT-FSAC/Guidance-Astro/issues/262#issuecomment-6386001757)），已退回 `status:in-progress` 并拆出 #279 与 #281 两个独立实现切片。
- **第109轮遗留远端 CI 证据闭环**：上轮落盘收据注明 `1024167` 远端 CI 未等待；本轮核实完整 SHA `1024167c150b628b165ba47a96ddafeddecd85ee` 的 `CI/CD Pipeline`（run `40107528344`）、`Release Please`（run `40107528322`）、`Secret Scan`（run `40107528321`）全部 `completed/success`（含 Build / Preview Build / Quality E2E 1-2 / LHCI / Budget / Quality Gate / Lint / Type Check / Tests / Audit 全绿）。
- **未触发疑似中断**：#262 由第109轮于 `2026-10-24T15:26Z` 退回 `in-progress`，距本轮仅约 1.2 小时（远未达 24 小时无日报更新阈值），保持原状态等待本轮后的 Execution 会话执行 #279 → #281。

## 今日目标（2026-10-25）

- **#279**：触屏/窄屏用户能从可见入口打开、输入、查看正文结果并跳转；快捷键、SPA 导航重开、焦点返回与滚动锁释放不退化，更新窄屏 E2E 为真实可见交互断言。
- **#281**：构建清单消费实际 Starlight `routes` 元数据（`id`/`locale`/`entryMeta`/`isFallback`），真实英文不同名 slug（如 `control-fundamentals`、`simulation-platforms`）不再被误排为 fallback；生产正文查询证明覆盖恢复。
- **#262 收口重验**：#279 与 #281 分别提交 PR、留 §1.7 报告并转 `status:review` 后，在父单 #262 追加对原报告 AC3/AC4 的更正及原九项 AC 完整重验报告，再将 #262 转 `status:review`（Executor 绝不自行 close）。

## 当前 Milestone：M4 开发入口与能力声明一致性（进度：5 / 8）

GitHub Milestone #3，`state=open`。实际八成员由 REST 成员列表与 GraphQL 双源核对一致：

- **已完成（5）**：#266、#264、#263、#268、#270（均 `CLOSED` / `status:done`）。
- **未完成（3）**：#262（`in-progress` 验收父单）、#279（`ready` UI 整改）、#281（`ready` 索引路由整改）。
- **计数限制**：本轮 REST `milestones` 汇总仍返回 `open_issues=2, closed_issues=5`，较真实成员少计 1 个 open；继续以双源逐单成员列表（3 open / 5 closed）为准，不因汇总失真漏算父单或提前宣布收口。

### 目标与验收

- #262 原九项 AC 全部保留。#279 负责唯一 UI 整改实现；#281 负责唯一索引输入整改实现；#262 作为整体验收父单，不重复开第三套实现。
- 实际生产浏览器验证中文 `301 → /labs/`、英文 `odometry → /en/join/` 及真实英文 archive 页独特正文词；可见输入、excerpt/高亮、点击跳转、负例、SPA 重开与窄屏可见入口均须有真实证据。
- 真 fallback / 重定向壳 / 草稿 / `pagefind:false` / 404 按实际元数据排除；真实不同名英文正文不能因缺同名中文文件而排除。保持索引失败非零退出、旧 bundle 不可误用、临时清单与 SSR 快照不发布、原预算与每请求 nonce 不退化。

### 完成信号（Success signal）

八成员全部由 Planner 独立验收关闭，实际 open 归零，再显式置 M4 `state=closed`（D-020），之后才允许合并 PR274（`release 1.4.0` minor）。**当前 5 / 8，未收敛。**

### 明确非目标（Non-goals）

- 不隐藏/删除搜索，不改 SSR/prerender/认证/权限/SESSION/ASSETS/nonce/CSP/缓存；不加 provider/依赖/服务/凭据。
- 不改 CI 编排或预算阈值，不扩大翻译/历史内容整治，不自动摄入 majors（PR186/209）。
- 不实施可选 Projects 配置修复（#280）；不以禁用 job 掩盖 `Bad credentials`。

### 执行队列（给 Executor 的建议顺序，保持 2 个 ready）

| 顺序 | 任务                                                                                                               | 优先级 | 依赖与边界                                                                                            |
| ---- | ------------------------------------------------------------------------------------------------------------------ | ------ | ----------------------------------------------------------------------------------------------------- |
| 1    | [#279 恢复窄屏搜索的可见入口与完整查询交互](https://github.com/HUAT-FSAC/Guidance-Astro/issues/279)                | P1     | ready；无硬依赖。现有 Search 单实例脱离隐藏 nav、适配可见触屏入口，不复制 UI/ID/监听；更新窄屏 E2E。  |
| 2    | [#281 修正搜索清单为真实Starlight路由并收录不同名英文正文](https://github.com/HUAT-FSAC/Guidance-Astro/issues/281) | P2     | ready；#266 已 done，与 #279 无硬依赖。消费真实 Starlight routes 元数据，移除手写同名中文 slug 推导。 |

- 两任务均通过 4.2 七条 ready 门禁，独立分支 / PR / 报告；允许在两 PR 均合入 main 后合并执行一次 `pnpm deploy:worker`，但两单与父单 #262 的生产验收证据均不得省略。
- **#262 为 `in-progress` 验收父单**，不计为第三个独立实现任务；两子单完成后在 #262 追加更正与原九项 AC 重验报告并转 `status:review`。
- **常态顺手项**：若今日定时任务生成新的 bot metrics PR（`chore(metrics): update project progress snapshot`），按既有常态规则（schema 契约核查 + CI 全绿后合入 + 随部署验证双语看板）顺手处置，不占 ready 队列名额。

## 已知阻塞与依赖

| 项目      | 实际状态                      | 处理                                                                                                                |
| --------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| #262      | in-progress / P2 / M4         | 验收父单保留原九项 AC；整改实现由 #279 / #281 唯一承担，两子单交付后追加更正与重验报告再转 review。                 |
| #101      | blocked / P1 / 无milestone    | 本轮复核 Actions Secrets 仍仅 `CODECOV_TOKEN` / `PROJECT_TOKEN`；维持单机 OAuth 默认 B，生产 `027692c7` 在位。      |
| #197      | needs-info / P3 / 无milestone | 用户已确认默认 C（手工触发 Release PR CI）；PR274（`00414fa`）checks 仍为 0，待 M4 收口后用既有手工触发方式处理。   |
| #280      | blocked / P3 / 无milestone    | 可选 Projects 的 `PROJECT_TOKEN` 凭据阻塞；与 #197 非同一凭据域，Projects 非任务 SSOT，未获授权不改 workflow/凭据。 |
| PR274     | minor 持合                    | `chore(main): release 1.4.0`（minor）；按 WORKFLOW §11.1 / D-020 等 M4 实际 8/8 收口并显式关闭后再合并。            |
| PR186/209 | majors 暂缓                   | D-015 standing reminders（actions v7/v8 与 TS7/vitest5）；不摄入、不关闭、不计今日容量。                            |

## 治理与 Executor 信号回应

- 开放 Issue 6：ready=2（#279、#281）、in-progress=1（#262）、blocked=2（#101、#280）、needs-info=1（#197）、in-review=0。P0=0，P1=2（#279 与常驻外部阻塞 #101），队列容量与优先级完全合规。
- 2026-10-24 日报中 Executor 的全部信号（#262/#270 待验收、PR274 minor 持合、auto-discovered #279/#280 分诊）已于第109轮逐条回应并落盘，本轮复核无新增未回应信号。
- Executor 的 `STATE.md` / `HANDOFF.md` 顶部仍停留在第108轮收尾口径（写有“搜索已恢复 / 无 in-progress / 验收后 6/6 可收口”），待今日 Execution 会话启动后由 Executor 自行整体刷新；Planner 仅在文件末尾追加接力补记，不覆盖 Executor 现场。

## 下一阶段

#279、#281 与父单 #262 经 Planner 独立验收通过关闭后，按 D-020 显式关闭 M4，再按 WORKFLOW §11.1 / §11.2 / §11.3 触发 PR274 CI、合并发布 `v1.4.0` 并完成四方一致性与祖先判定。当前不建 M5、不启动新功能（D-017）。

## 已放弃的方向

- 以 `dialog.open=true` 替代窄屏用户可见可操作的搜索验收，或以固定页面计数常量宣称搜索完成。
- 由 `getCollection` + 中文同名文件推断英文 fallback、复制路由算法或把不同语言 slug 字面差异当成 fallback。
- 未获授权隐藏搜索、改全站预渲染、扩大翻译/权限/CI、自动摄入 majors。

## Decision Gate

`pending = 0`；D-001..D-022 全部生效。本轮无需要用户拍板的新问题，不重复询问已确认默认项（#101 默认 B、#197 默认 C、D-015 majors 暂缓、D-017 Q4 稳态）。

## 给 Executor 的指令

按顺序执行 #279 → #281（独立分支/PR/§1.7报告），部署后在 #262 追加原报告更正与原九项 AC 完整重验报告并将三单均置 `status:review`（严禁自行 close）。M4 未经 Planner 显式关闭前不得合并 PR274；开工后用真实状态刷新 `STATE.md`/`HANDOFF.md`/`TASKS.md`，并在 `.agent/DIARY/2026-10-25.md` 记录今日执行情况。

## 本轮验证边界（第110轮只读核验）

- **远端 CI 与告警**：完整 SHA `1024167c150b628b165ba47a96ddafeddecd85ee` 三工作流（Pipeline `40107528344` / Release Please `40107528322` / Secret Scan `40107528321`）及 11 项构建/测试/质量子检查全部 `completed/success`；Dependabot open alerts = `0`、Secret scanning open alerts = `0`。
- **本地只读门禁与探针**：`pnpm quality:audit` → exit 0（`✅ audit clean`，0 豁免）；`node scripts/quality/supply-chain-watch.mjs` → exit 0（提示 `@cloudflare/vite-plugin` 上游 `1.65.0` / peer `wrangler ^4.152.0`，按 D-010 维持锁定）。
- **部署与线上核验**：`wrangler deployments list` 首跑因 shell 代理环境变量拦截 OAuth 刷新报连接错误（exit 1），按 `AGENTS.md` strip 本地 proxy（`env -u HTTP_PROXY -u HTTPS_PROXY -u ALL_PROXY -u http_proxy -u https_proxy -u all_proxy`）后 exit 0，确认当前 100% 生产版本仍为 `027692c7-dbb3-4abc-81d8-e5b86c9f33f6`（`2026-10-24T13:31:39.989Z`）。`gh api actions/secrets` 首跑遇瞬时 `EOF`，重跑返回 `CODECOV_TOKEN` / `PROJECT_TOKEN`。
- **生产 HTTP / CSP nonce**：两次独立单请求取样 `https://huat-fsac.eu.org/` 均 HTTP 200，`cache-control: private, no-cache, must-revalidate`，各 27 个 `<script nonce>` 与同请求 CSP 头完全一致（`I1SggrbOB8ogfVFXUH_pdw`、`GoMabhgcrtwvm-wWA6lvzg`）且跨请求不同；`/_search-manifest.json` → `404`、`/pagefind/pagefind.js` → `200`、`/en/archive/2025/planning-control/control-fundamentals/` → `200`。
- **未重跑项**：自 `1024167` 起零代码变更，未重复运行本地全量 `build` / `test:run` / `test:e2e` / `LHCI`，无代码或测试修改，无新部署。
