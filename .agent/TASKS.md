# TASKS — Issue 本地镜像

> 同步：2026-10-24，Planning 第107轮，依据真实 GitHub Issues **整体重写**；`gh` 可读写，无降级。
> 开工基线：`main@65ae62fea6b88ce4a5d824d595e0c209b7b11bc9`。D-013：正文首行 ready + `status:backlog`；review 映射 `status:review`；blocked/needs-info 不并挂 backlog。

## 今日队列（2026-10-24，2 项任务 + 2 项常态顺带，建议顺序）

| 顺序 | Issue / 任务                                                                                        | 优先级 | 状态      | 依赖与交付边界                                                                                                                                                              |
| ---- | --------------------------------------------------------------------------------------------------- | ------ | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | [#262 恢复现有站内搜索](https://github.com/HUAT-FSAC/Guidance-Astro/issues/262)                     | P2     | in-review | 第108轮完成：PR277 squash 合入 main `8767c8f`，部署 Version `5ab53eaa`；生产双语查询/nonce/清单不可达 12/12 通过；报告 6384695511。                                         |
| 2    | [#270 修正中文 README 例图为现有 WebP 资产](https://github.com/HUAT-FSAC/Guidance-Astro/issues/270) | P3     | in-review | 第108轮完成：PR278 squash 合入 main `569d178`，仅 README.md 一行 .png→.webp；报告 6384762718。                                                                              |
| 3    | PR [#274](https://github.com/HUAT-FSAC/Guidance-Astro/pull/274) release 1.3.2                       | 常态   | 待处理    | patch 档（§11.1，仅 CHANGELOG.md+package.json）；先触发 checks（GITHUB_TOKEN 链式抑制，#197 既有 update-branch 手法），CI 绿后 admin squash 合入（D-002），§11.2 四方核验。 |
| 4    | PR [#276](https://github.com/HUAT-FSAC/Guidance-Astro/pull/276) bot metrics                         | 常态   | 待处理    | 通用数组键路径/schema 契约核查 + checks 绿后合入；与 #274 合并后一次 `deploy:worker` + 线上 nonce/看板验收。                                                                |

## 全部开放 Issue（4 项）

| Issue | 优先级 / 风险 | 状态及实际标签                                                      | Milestone / 下一步                                                               |
| ----- | ------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| #262  | P2 / medium   | in-review；status:review、type:bug、area:frontend、auto-discovered  | M4 #3；PR277→`8767c8f` 已合入并部署 5ab53eaa，生产验收 12/12，待 Planner 验收。  |
| #270  | P3 / low      | in-review；status:review、documentation、area:docs、auto-discovered | M4 #3；PR278→`569d178` 已合入，待 Planner 验收。                                 |
| #101  | P1 / medium   | blocked；type:task、area:devops                                     | 无 milestone；Secret 仍缺，维持用户已确认单机 OAuth 默认 B；不恢复 CI deploy。   |
| #197  | P3 / medium   | needs-info；type:task、area:devops、dependencies                    | 无 milestone；用户已确认默认 C，维持手工 CI 触发，等频率信号，不重复问 PAT/App。 |

统计：ready=0，in-progress=0，in-review=2，blocked=1，needs-info=1；无未分诊 auto-discovered。开放 P0=0，P1=1（仅外部阻塞 #101）。

## 本轮验收（第107轮，2026-10-24）

输入：10-23 日报追加 + 10-24 第106轮 Issue 报告。**10-24 日报缺失**（会话中断于 #262），以 Issue 报告 + git + CI/生产实测反推；下一棒 Executor 新建 `.agent/DIARY/2026-10-24.md` 补全天记录，不改任何历史文件。

| 项目 | 结论                               | 独立证据 / 验收记录                                                                                                                                                                                                                                                              |
| ---- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #272 | **通过，done/closed**              | [6383838267](https://github.com/HUAT-FSAC/Guidance-Astro/issues/272#issuecomment-6383838267)；PR273→`161ab70` 纯 pnpm-lock.yaml+1行 workspace override；main@65ae62f Pipeline success 审计零公告；D-021 处置，单点热修不建 milestone。                                           |
| #263 | **通过，done/closed**              | [6383840571](https://github.com/HUAT-FSAC/Guidance-Astro/issues/263#issuecomment-6383840571)；c2933cd 恰三文件、env.d.ts 精确删 7 字段保留 Umami；**采纳** A/A 证实的 assets 顺序归一化扩展与 audit 红无关性证明；A/A/A/B 原始产物留存 .tmp；PR271 merge 后 squash，未重写历史。 |
| #268 | **通过，done/closed**              | [6383842437](https://github.com/HUAT-FSAC/Guidance-Astro/issues/268#issuecomment-6383842437)；65ae62f 单一 MDX；本轮独立 curl 生产 200/标题正确/meta refresh=0/正文在位/nonce 头体一致；Version 596a1212。                                                                       |
| #262 | **不验收（in-progress 现场保留）** | 领取评论后约 9 小时无更新、日报未写；未提交 WIP 原样保留，不判失实、不代报告、不重置状态。                                                                                                                                                                                       |

## Milestone 核实

- **M4 #3：4/6，尚未收敛**。成员 done=#266/#264/#263/#268（CLOSED），open=#262/#270。
- REST 汇总 `milestones/3.open_issues=1 / closed_issues=0` **仍与成员实际不符**（关闭三单后实际 open=2/closed=4）。进度按实际成员计算，不缩范围、不假报归零；收口须再次核对，未满足 D-020 不关闭 milestone。
- M3 #2 与 M2 #1 保持既有 closed；#101/#197 不计入 M4。

## 关键范围与证据纪律

- **#262**：恢复现场时先读未提交 WIP 与 Issue 完整 AC，不盲目重写；生产 draft/pagefind:false/fallback/404、HTTP3xx 与真实 HTML 重定向壳排除（sidebar.hidden 不是排除条件）；历史 142 不是硬编码目标；中文 fallback 不污染英文索引。失败使 build 非零、不复用旧 bundle，关闭子进程并清除清单/HTML 样本；只发布索引资源，不发布内部清单或 SSR 快照；检查 sitemap 及部署资产不泄漏内部清单。
- 搜索生产 AC 含 `301 → /labs/`、`odometry → /en/join/` 的正文 excerpt/高亮/点击、负例、快捷键、SPA 重开、现有预算与私有缓存/nonce；按钮可见或资源存在不足以验收。
- **#270**：仅中文示例扩展名；实际资产及链接检查，不新增措辞测试。
- PR274/276：bot 产物照常核查（schema/keys、checks），合入证据留 Issue/PR 评论；合并后一次部署，线上 nonce/看板验收。
- 每单留 §1.7 全字段报告并转 review，Executor 不关闭任务。代码/普通文档与 `.agent` 记录分属提交；禁止 force push 或重写已推送历史。

## 开放 PR（4 张）

| PR   | 当前状态与处置                                                                                                                       |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------ |
| #274 | release 1.3.2 patch（CHANGELOG.md+package.json）；无 checks（GITHUB_TOKEN 链式抑制），按 #197 手法触发后合入；§11.1 patch 档即合并。 |
| #276 | bot metrics（chore/update-metrics）；schema 核查 + checks 后合入。                                                                   |
| #209 | npm majors，D-015 暂缓，不摄入。                                                                                                     |
| #186 | GitHub Actions majors，D-015 暂缓，不摄入。                                                                                          |

PR #271/#273/#275/#269/#267 均已合入关闭。

## 环境与当前线上

- 最新部署 Version `596a1212-7c90-4f73-ac8f-119d39ddcae9`（执行轮 2026-10-24 部署，含 c2933cd/65ae62f/161ab70）；**搜索仍未修复（#262 未落地）**。
- 本轮首页 200、CSP nonce 头体一致（采样 `HZ3EqKOjCaIzlaiQYGYL8w`）；英文 season-notes 200、标题正确、refresh=0、正文在位。只读复核，无新部署。
- main@65ae62f CI/CD Pipeline、Release Please 均 success；Dependabot/secret-scanning 沿用上轮零开放告警口径（本轮未重查，不假称新跑）。
- inbound：`wsyhuat/main` 仍 f98be0d/d89b87e（已吸收），无新提交，不 merge fork；fork 侧分支 chore/update-metrics 有强制更新，非 main，不构成待移植工作。
- **工作区现场**：HEAD 在 main（含本轮 .agent 提交）；未提交 WIP（astro.config.mjs/package.json/scripts/search//src/integrations/search-*）与本地分支 `agent/issue-262-search-index`@65ae62f 保留，恢复 #262 前先 `git pull --rebase` 同步 main。本轮 .agent 记录见单独 chore(agent) 提交。
