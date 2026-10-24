# PLAN — 项目路线图（Planning Agent 唯一写入点）

> 路线与今日队列的当前快照；任务/验收以 GitHub Issues 为准，长期约束以 `DECISIONS.md` 为准。历史见 Git、Issue 评论与不可变日报。

最后核实：2026-10-24，Planning 第107轮。同步基线 `main@65ae62fea6b88ce4a5d824d595e0c209b7b11bc9`；`fetch --all --prune` 无新增远端工作（wsyhuat/main 仍为已吸收的 f98be0d/d89b87e）。**当前工作区状态特殊**：本地分支 `agent/issue-262-search-index`（@65ae62f，未推送）上有 #262 的未提交 WIP（astro.config.mjs、package.json 及 scripts/search/、src/integrations/search-*），是第106轮 Executor 会话中断现场，本轮原样保留；.agent 记录提交在 main，恢复 #262 时先同步 main。

## 当前方向

1. 收敛 M4 最后两项：#262 恢复搜索（已有 D-022 方案 + 中断现场 WIP）与 #270 中文例图修正，不启动新功能（D-017）。
2. 常态顺带处理 release-please patch 发版（PR #274）与 bot metrics（PR #276），按 §11.1 patch 档与既有 schema 核查惯例。
3. 保持 Worker SSR/每请求 nonce 与既有安全模型；搜索修复不删入口、不换架构、不扩大翻译。

## 本轮验收（2026-10-24，第107轮）

输入：10-23 日报全部追加 + 10-24 第106轮 Issue 执行报告（**10-24 日报缺失**，第106轮会话中断于 #262，本轮以 Issue 报告 + git log + CI/生产实测反推，下一棒 Executor 必须新建 `.agent/DIARY/2026-10-24.md` 补全天记录）。

| 项目 | 结论              | 核验与去向                                                                                                                                                                                                                          |
| ---- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #272 | 通过，done/closed | [验收6383838267](https://github.com/HUAT-FSAC/Guidance-Astro/issues/272#issuecomment-6383838267)；PR273→`161ab70` 纯锁文件+1行override；main Pipeline success 审计门禁恢复；D-021 规则，单点热修不建 milestone。                    |
| #263 | 通过，done/closed | [验收6383840571](https://github.com/HUAT-FSAC/Guidance-Astro/issues/263#issuecomment-6383840571)；c2933cd 恰三文件、7字段精确删除；**采纳两处执行层扩展**（A/A 证实的 assets 顺序归一化、audit 红与 PR 无关的证明），原始产物留存。 |
| #268 | 通过，done/closed | [验收6383842437](https://github.com/HUAT-FSAC/Guidance-Astro/issues/268#issuecomment-6383842437)；65ae62f 单一 MDX；本轮独立 curl 生产页 200/标题正确/refresh=0/正文在位/nonce 头体一致；Version 596a1212 已部署。                  |

无未处理 in-review；无连续两次验收失败任务。第106轮第4项 #262 领取后会话中断，报告缺失，**不判失实也不代其报告**——现场（未提交 WIP）保留，恢复后按单内 AC 继续并在日报补记全天。

## 今日目标（2026-10-24）

- #262 从中断现场恢复推进：完成实现、全门禁、生产双语正文查询/快捷键/SPA/排除/清理/预算/nonce 全 AC，转 review。
- #270 中文例图 WebP 修正合入。
- PR #274（release 1.3.2 patch）按 §11.1 合入 + §11.2 四方核验；PR #276（metrics）schema 核查后合入；两者可合并一次 deploy:worker。
- Executor 补写 2026-10-24 日报（新建文件，追加式，含上午第106轮三项交付与本轮记录）。

## 当前 Milestone：M4 开发入口与能力声明一致性（进度：4 / 6）

GitHub Milestone #3，state=open。成员 done=#266/#264/#263/#268，open=#262/#270。#101/#197 不计入范围（D-020）。

**API计数限制**：REST 汇总 milestones/3 `open_issues=1/closed_issues=0` 仍与成员实际不符（关闭 #272/#263/#268 后实际 open=2/closed=4）；继续按逐单状态计算，收口时再次交叉核对。

### 目标与验收

- #262 按 D-022 与 Issue 完整 AC 交付：routes→本地 SSR HTML→addHTMLFile；生产双语正文查询（`301 → /labs/`、`odometry → /en/join/`）excerpt/高亮/点击、负例、快捷键、SPA 重开、fallback/重定向壳/404/3xx 排除、索引失败非零退出+清理、只发布索引资源不泄漏内部清单、现有预算与私有缓存/nonce。
- #270 只修中文 README 例图为现有 WebP，不改人类正文/资产，根 README 无需部署。

### 完成信号（Success signal）

#262/#270 均由 Planner 验收关闭，生产有真实双语查询/结果 URL 证据；按 D-020 核实 open 归零后显式关闭 Milestone。**当前 4/6，未收敛。**

### 明确非目标（Non-goals）

- 不隐藏/删除搜索，不改全站 SSR/prerender、nonce/CSP/缓存或 SESSION/ASSETS，不引入 provider/新依赖/服务/凭据，不改 CI 编排或预算阈值。
- 不实现认证/权限/数据库/推送，不扩展全站翻译，不自动摄入 majors（D-015）。
- 不为产物相等改 ASTRO_KEY 或框架；#262 恢复不复用旧 bundle、不为省事把探针当生产验收。

### 执行队列（建议顺序）

| 顺序 | 任务                                        | 优先级 | 状态与交付边界                                                                                                                                |
| ---- | ------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | **#262 恢复现有站内搜索**（从中断现场继续） | P2     | in-progress；工作区未提交 WIP 原样保留，恢复时先读现场再续做；完成须全门禁+生产 AC，转 review，不关闭。                                       |
| 2    | **#270 修正中文 README 例图为 WebP**        | P3     | ready（D-013：status:backlog 标签=ready）；仅扩展名，核对双语示例与本地链接。                                                                 |
| 3    | PR #274 release 1.3.2（patch 档）           | —      | 常态顺带项：需先触发 checks（GITHUB_TOKEN 链式抑制，按 #197 既有手法 update-branch）；CI 绿后 admin squash 合入（D-002），做 §11.2 四方核验。 |
| 4    | PR #276 bot metrics                         | —      | 常态顺带项：通用数组键路径/schema 契约核查 + checks 绿后合入；与 #274 合并后一次 deploy:worker + 线上 nonce/看板验收。                        |

#272 已闭环不进队列。#262/#270 串行（上轮判定共改 README 周边）；PR274/276 为 bot 产物不占执行容量，但合入与部署证据照常留痕。

## 已知阻塞与依赖

| 项目      | 真实状态                     | 处理                                                                                                  |
| --------- | ---------------------------- | ----------------------------------------------------------------------------------------------------- |
| #262 现场 | in-progress，会话中断约9小时 | 未提交 WIP 是 Executor 现场，Planner 不触碰不重置；下一棒恢复或自主判断放弃重做，完成后按 §1.7 报告。 |
| #101      | blocked / P1，无milestone    | Secrets 仍仅 CODECOV_TOKEN/PROJECT_TOKEN；用户已确认单机 OAuth 默认 B，不恢复 deploy job、不重复问。  |
| #197      | needs-info / P3，无milestone | 已确认默认 C 手工触发，等频率信号；不自动上 PAT/App，不按普通饥饿项关闭。                             |
| PR186/209 | majors暂缓                   | D-015 standing reminders，不摄入、不关闭、不计今日容量。                                              |

## 治理与交接

- 开放 Issue 4：ready 1（#270）、in-progress 1（#262）、blocked 1（#101）、needs-info 1（#197）；本轮关闭 #272/#263/#268，无重复/方向冲突/未定级 auto-discovered，无 P0，P1 仅 #101。
- **第106轮收尾记录缺失**（10-24 日报未建、STATE/HANDOFF 未刷新）：属执行会话中断而非漏报单项——三项已交付工作均有完整 Issue 报告，仅 #262 领取评论后无更新。下一棒先建 10-24 日报补全天记录（不改任何历史文件），再刷新自有 STATE/HANDOFF。
- **工作区交接**：HEAD 将停在 main（含本轮 .agent 提交）；未提交 WIP 与本地分支 `agent/issue-262-search-index`（@65ae62f）保留。恢复 #262 时 `git pull --rebase` 同步 main 后续做或按需重建分支，不 force push。
- 开放 PR 4：#274（release patch）、#276（metrics）、#209/#186（暂缓）。PR271/#273/#275 已合入关闭。
- inbound：wsyhuat/main 无新提交（仍 f98be0d/d89b87e，已吸收，内容级七路径结论不变）；不 merge fork。

## 下一阶段

M4 收口后按 D-020 判定关闭 Milestone，回到依赖/发版稳态；v1.3.2 发版由 PR #274 承接，#262 落地后随下一次 patch 再发。不自动启动新功能。

## 已放弃或暂缓的方向

- 只开 pagefind:true 冒充 SSR 全文索引、无授权移除搜索、改全站预渲染：与目标及安全模型冲突。
- Starlight≥0.42、TS/actions 等 majors 自动摄入：D-003/D-004/D-015。
- 为非确定 manifest 差异固定 ASTRO_KEY 或广泛抹除文件、凭总大小/旧摘要声称字节相同：证据不足（#263 已按 A/A 基线法验收关闭，该口径仅限该单）。
- 全站翻译/历史文档整治、预防性门禁扩围、未经授权远程分支清理：无本轮需求。

## Decision Gate

pending=0；D-001..D-022 生效。#263 的 A/A 基线归一化口径属该单验收裁定（见验收评论 6383840571），未升格为长期决策；#101/#197 及 majors 沿既有默认，不重复问。本轮无新的用户问题。

## 给 Executor 的指令

先从工作区未提交 WIP 恢复 #262（先读现场与 Issue AC，不盲目重写）；新建 `.agent/DIARY/2026-10-24.md` 追加全天记录（含上午三项交付与本轮验收引用）；#270 随后；PR274/276 按常态处理并合并一次部署验收。逐单 §1.7 全字段报告转 review，不关闭任务；禁止 force push。

## 本轮验证边界

- 只读验证：三个新提交 `git show`、`.tmp/issue263-*` 原始产物清点、`gh` 读 CI/checks/milestone/PR、生产 curl（首页 nonce 头体一致 `HZ3EqKOjCaIzlaiQYGYL8w` 与 `m3_OQaaQQFvAzroyOCGBaw` 两次采样、season-notes 内容/标题/refresh=0）、inbound 巡检。未运行 build/test/audit 全套——接受 main@65ae62f Pipeline success 作为门禁证据（最窄验证）。
- 未写代码/测试/验证脚本，未触碰 #262 的未提交 WIP 与任何 `in-progress` 状态；生产无新部署（Version 596a1212 沿用执行轮部署）。
- 已知偏差如实保留：REST milestone 汇总计数失真未修（非本轮范围）；第106轮日报缺失未代写（Executor 职责）。
