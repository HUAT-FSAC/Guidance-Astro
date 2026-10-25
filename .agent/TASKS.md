# TASKS — Issue 本地镜像

> 同步：2026-10-25，Planning 第111轮（CST 2026-10-25 21:55 / UTC 2026-10-25T13:55Z）；GitHub Issues 可读写，依据真实状态**整体重写**，无降级。基线 `main@36f7331ecc5d0fd6c27bd314b4d5cd75b150ecd0`。
> D-013 映射：`ready` = `status:backlog` + 正文首行 `队列状态：ready`；`in-progress` = `status:in-progress`；`in-review` = `status:review`；`done` = `status:done`；`blocked` / `needs-info` 直接使用对应标签且不并挂 `status:backlog`。

## 今日队列（2026-10-25，2 个 ready，建议顺序）

| 顺序 | Issue                                                                                                              | 优先级 / 状态  | 依赖与交付边界                                                                                                                                     |
| ---- | ------------------------------------------------------------------------------------------------------------------ | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | [#279 恢复窄屏搜索的可见入口与完整查询交互](https://github.com/HUAT-FSAC/Guidance-Astro/issues/279)                | P1 / in-review | 无硬依赖；#262 原 AC3 整改。单实例 Search 离开隐藏 nav，触屏可见入口/可见输入/正文结果/点击/关闭/焦点/SPA 重开；更新窄屏 E2E。PR #283 已合入。     |
| 2    | [#281 修正搜索清单为真实Starlight路由并收录不同名英文正文](https://github.com/HUAT-FSAC/Guidance-Astro/issues/281) | P2 / in-review | #266 已 done；与 #279 无硬依赖。消费实际 Starlight routes/entryMeta/isFallback，移除中文同名 slug 推导；生产查询验证英文正文命中。PR #284 已合入。 |

- 两任务完整范围、明确不包含、依赖、验收标准与测试要求见各自 Issue 正文，均通过 4.2 七条 ready 门禁，无产品 pending 或 §1.10 红线变更。
- 两单分别建分支、提 PR、留 §1.7 执行报告并转 `status:review`；允许在两 PR 均合入后合并执行一次 `pnpm deploy:worker`，但各自生产验收标准不可省略。
- **验收父单 #262（`in-progress`）不计为第三个独立实现任务**：#279 与 #281 完成后，Executor 在 #262 追加对原报告 AC3/AC4 的更正及原九项 AC 完整重验报告，再将 #262 转 `status:review` 等待 Planner 验收（严禁自行 close）。

## 全部开放 Issue（6 项）

| Issue | 优先级 / 风险 | 状态与标签                                                                 | Milestone / 下一步                                                                                      |
| ----- | ------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| #279  | P1 / low      | in-review；`status:review`、`type:bug`、`area:frontend`、`auto-discovered` | M4 #3；今日队列第 1 位（窄屏可见检索 UI 整改，已由 PR #283 交付并上线）。                               |
| #281  | P2 / medium   | in-review；`status:review`、`type:bug`、`area:frontend`                    | M4 #3；今日队列第 2 位（真实 Starlight 路由与英文正文收录整改，已由 PR #284 交付并上线）。              |
| #262  | P2 / medium   | in-review；`status:review`、`type:bug`、`area:frontend`、`auto-discovered` | M4 #3；整改子单 #279/#281 完成，已在父单追加更正说明与原九项 AC 全量重验报告转 review。                 |
| #101  | P1 / medium   | blocked；`blocked`、`type:task`、`area:devops`                             | 无 milestone；`CLOUDFLARE_API_TOKEN` 仍未配置，维持单机 OAuth 默认 B，不恢复 CI deploy。                |
| #197  | P3 / medium   | needs-info；`needs-info`、`type:task`、`area:devops`、`dependencies`       | 无 milestone；用户已确认默认 C（手工触发 Release PR CI），持续观察发版频率，不重复提问。                |
| #280  | P3 / medium   | blocked；`blocked`、`type:task`、`area:devops`、`auto-discovered`          | 无 milestone；可选 Projects 的 `PROJECT_TOKEN` 凭据阻塞，与 #197 独立；未获授权不改凭据/权限/workflow。 |

统计：`ready = 0`，`in-progress = 0`，`in-review = 3`，`blocked = 2`，`needs-info = 1`；`P0 = 0`，`P1 = 1`（外部阻塞 #101）。无未定级 `auto-discovered`，无进行中 `in-progress` 现场。

## 本轮验收与核实（第111轮，2026-10-25）

自昨日第109轮（`1024167`，2026-10-24T15:33Z）完成第108轮产出验收后，尚无新的 Execution 会话运行，当前 `in-review = 0`。昨日第109轮验收结论持续有效：

| 项目  | 结论                                           | 证据 / 记录                                                                                                                                             |
| ----- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #270  | **通过，done/closed**                          | [6386000882](https://github.com/HUAT-FSAC/Guidance-Astro/issues/270#issuecomment-6386000882)；`569d178` 仅改 `README.md` 一行 `.png`→`.webp`。          |
| #262  | **不通过；报告部分勾选失实，退回 in-progress** | [6386001757](https://github.com/HUAT-FSAC/Guidance-Astro/issues/262#issuecomment-6386001757)；AC3 窄屏不可见与 AC4 真实路由/英文收录由 #279/#281 承接。 |
| PR276 | **通过，已上线**                               | [6386022987](https://github.com/HUAT-FSAC/Guidance-Astro/pull/276#issuecomment-6386022987)；`b04bfec` 纯数据更新，已随 Version `027692c7` 部署。        |
| PR274 | **继续持合（1.4.0 minor）**                    | [6386023211](https://github.com/HUAT-FSAC/Guidance-Astro/pull/274#issuecomment-6386023211)；按 WORKFLOW §11.1 / D-020 待 M4 实际 8/8 收口后合并。       |

## Milestone 核实

- **M4 #3（M4 开发入口与能力声明一致性）：实际 5 / 8，`state=open`**。
    - REST 成员列表与 GraphQL 双源核对一致：done = `#266, #264, #263, #268, #270`（5 项）；open = `#262, #279, #281`（3 项）。
    - REST `milestones` 汇总字段本轮仍为 `open=2, closed=5`（漏计 1 个 open），以真实成员状态为准，不缩范围、不提前关 M4。
- **M2 #1 / M3 #2**：均 `closed`（`open=0`）。`#101`、`#197`、`#280` 与 majors PR 不计入 M4。

## 开放 PR（4 张）

| PR   | 当前处置                                                                                                                                                                                             |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #282 | `chore(metrics): update project progress snapshot`（head `5216fc82`，`mergeState=BLOCKED`，checks=0）；schema 63 路径完全一致，按既有常态顺手处置（update-branch 触发 checks 绿后合入 + 部署验证）。 |
| #274 | `chore(main): release 1.4.0`（minor，head `00414fa`，`mergeState=BEHIND`，checks=0）；M4 实际收口并显式关闭前持合。                                                                                  |
| #209 | npm majors（TS 7.0.2 / vitest 5.0.5），按 D-015 暂缓，保持 open 作 standing reminder，不摄入。                                                                                                       |
| #186 | github_actions majors（checkout v7 / setup-node v7 / create-pull-request v8），按 D-015 暂缓，保持 open 作 standing reminder，不摄入。                                                               |

## 环境与线上基线（2026-10-25 实测）

- **主干 CI**：`main@36f7331ecc5d0fd6c27bd314b4d5cd75b150ecd0` 的 `CI/CD Pipeline`（`40113127406`）、`Release Please`（`40113127453`）、`Secret Scan`（`40113127408`）全部 `completed/success`；定时任务 `OpenWiki Update`（`40195570871`）亦 `success`。
- **安全与审计**：`pnpm quality:audit` exit 0（0 豁免）；Dependabot 开放告警 `0`、Secret scanning 开放告警 `0`。
- **生产部署**：`env -u HTTP_PROXY -u HTTPS_PROXY -u ALL_PROXY -u http_proxy -u https_proxy -u all_proxy ./node_modules/.bin/wrangler deployments list --config dist/server/wrangler.json` 确认当前 100% 流量仍为 Version `027692c7-dbb3-4abc-81d8-e5b86c9f33f6`（`2026-10-24T13:31:39.989Z`）。
- **线上探针**：`https://huat-fsac.eu.org/` 两次独立单请求均 HTTP 200、`cache-control: private, no-cache, must-revalidate`，各 27 个 `<script nonce>` 与同请求 CSP 头一致（`wXsjcF_8aJVDESD0JIVXjA` / `cBWJDCMNo5ABR3eYIdp1qA`）且两次不同；`/_search-manifest.json` → `404`、`/pagefind/pagefind.js` → `200`、`/en/archive/2025/planning-control/control-fundamentals/` → `200`。
- **接力要求**：Executor 今日开工后须用最新现场整体重写 `STATE.md` / `HANDOFF.md`（清理第108轮残留的“无 in-progress / 搜索已恢复 / 6/6 收口”过时描述），并新建 `.agent/DIARY/2026-10-25.md`。
