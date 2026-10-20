# TASKS — Issue 本地镜像（Planner 每轮整体重写；权威来源 = GitHub Issue）

> 最后同步：2026-10-20T11:45Z（UTC；本地日期 **2026-10-20**）｜同步人：**第 97 轮 Planner 整体重写**（禁增量打补丁）｜核实基线 `main@b67b388`（第 96 轮 `.agent` 收尾提交，与 origin 同步 `0/0`）；最近代码 SHA `db31f6f`（rp Release PR #239 发版 `1.3.0`）与 `8d0d75a`（bot PR #253 metrics 快照）。**本轮新鲜取证**：HEAD 完整 SHA `db31f6fcd4593f6a56ba6c17c96ba7ee4129d85b` 的 `CI/CD Pipeline` / `Secret Scan` / `Release Please` 三连 **success**；线上 `/` **200** + **单请求** CSP 头/体 nonce 逐字比对一致（`6FHoAPl_aG7Dn01nC4kLUQ`）；`actions/secrets` 仍仅 `CODECOV_TOKEN` / `PROJECT_TOKEN`。
> 权威来源 = GitHub Issue（`gh` 可用，token 有效）。网络对 `api.github.com` 有间歇 TLS/EOF 抖动，gh 调用带重试。
> `ready` 标签在本仓不存在（沿用 D-013 映射）⇒ 队列状态以 **Issue 正文首行「队列状态：`ready`」+ `status:backlog`** 为准。

## 今日队列（本地 2026-10-20，给 Executor 的建议顺序）

| #   | 任务 | 优先级 | 状态 | 顺序理由 |
| --- | ---- | ------ | ---- | -------- |

> **顺序说明**：第 97 轮为**发版验收与收官轮**。#251 已独立验收通过关闭，M3 稳态运营与 `v1.3.0` 发版工作已全面收尾。今日可开工 Issue = **0（诚实空置）**，按文件头纪律**不为凑 2–5 区间制造任务**。
> **今日常态顺手项（不建单）**：当前无开放 bot metrics PR（#253 已处置合入）；下一张预期 **2026-10-21T04:3xZ（UTC）** 再生，届时按长期指令处置（schema 逐键一致 → 合入 → 完整 SHA CI → 视数据变更部署）。
> **勿合 majors #186/#209**：D-015 暂缓。
> **#101 保持 blocked**：第 97 轮复核 Actions Secrets 仍仅 `CODECOV_TOKEN`/`PROJECT_TOKEN`。

## 上轮验收（第 97 轮 Planner 独立核对，未采信报告文字）

- **验收 #251（按 D-012 在 M3 收口点合并 Release PR #239 发布 v1.3.0 并完成四方核验）——通过，报告无失实，已关闭**（八条标准逐条亲跑取证）：
    1. `gh api repos/HUAT-FSAC/Guidance-Astro/milestones/2` → `open=0 state=closed`（Milestone #2 已于 2026-10-19T17:24:43Z 显式关闭）。
    2. `gh pr view 239 --json state,mergedAt,mergeCommit` → `state=MERGED` · `mergeCommit.oid=db31f6fcd4593f6a56ba6c17c96ba7ee4129d85b` · `mergedAt=2026-10-20T11:13:18Z`。
    3. `gh release list` 首位 `v1.3.0 Latest v1.3.0 2026-10-20T11:13:31Z`；`releases/latest` 确认 `tag_name=v1.3.0` · `draft=false` · `prerelease=false`。
    4. `git fetch --tags && git tag --list v1.3.0` → 确切命中 `v1.3.0`。
    5. `package.json:4` 出现 `"version": "1.3.0"`；`CHANGELOG.md:8` 确切命中 `## [1.3.0]`。
    6. `git merge-base --is-ancestor 8d0d75a2468a9e39ecd3a4ef9c8d801c47c4a78e v1.3.0` 与对 `af74ecd` 均 exit 0，成立。
    7. `git show --stat db31f6f` 实测 `CHANGELOG.md` 与 `package.json` 2 文件（14+/1-）；部署 Version `35127731-f8db-4910-832a-dac8eb5ee098` 实测生效，单请求 CSP nonce 逐字一致 PASS，中英看板页 200 正常渲染。
    8. Issue 留执行报告于评论 `6289672510`，全字段齐全无失实，标签转为 `status:review`，未自行关单。
- **顺手项 #253 核验——通过**：files=1（29+/29-），44 条键路径递归比对 0 差异，合入 `8d0d75a` 后完整 SHA CI 三连 success（Pipeline run 39412743000 / Secret Scan 39412743010 / Release Please 39412742996），已部署上线。
- **M4 决策**：暂不创建。当前无需要排期的 ready/backlog 工作；#197（needs-info/默认 C）与 #101（blocked/待人类）为常驻项，按 D-020 第 3 条不进入 Milestone 的 `open` 计数。待未来出现真实工作束再开。

## 全部开放 Issue

| #    | 标题                                                  | 标签                                          | 状态                                                                     | Milestone               |
| ---- | ----------------------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------ | ----------------------- |
| #197 | 评估解锁 release-please Release PR 的 PR 级自助 CI    | P3/devops/dependencies/risk:medium/needs-info | needs-info（默认 C = 维持手工触发，用户 10-12 确认；信号触发型非饥饿）   | **无**（按 D-020 迁出） |
| #101 | [Task] 恢复 CI 自动部署，消除单机 wrangler OAuth 单点 | P1/devops/task/risk:medium/blocked            | blocked（第 97 轮再次复核 Secrets 仍仅 `CODECOV_TOKEN`/`PROJECT_TOKEN`） | 不在任何 Milestone      |

> **Milestone #2（M3 稳态运营）与 Milestone #1（M2）均已关闭**。
> **当前无开放 Milestone**；M4 暂不创建。

## 开放 PR（非任务，供处置参考）

| #    | 标题                                                          | 性质                | 处置口径      |
| ---- | ------------------------------------------------------------- | ------------------- | ------------- |
| #209 | `chore(deps): bump the majors group across 1 directory with…` | dependabot (npm)    | 暂缓（D-015） |
| #186 | `chore(deps): bump the majors group across 1 directory with…` | dependabot (github) | 暂缓（D-015） |

> 开放 PR 共 **2** 张（majors 2；#239 与 #253 均已合并）。当前无开放 bot PR。

## 环境信号（需 Executor 注意）

1. **`gh api actions/secrets` 不带 repo 路径返回 404**——须用 `gh api repos/<owner>/<repo>/actions/secrets`；404 ≠「无 secrets」也 ≠「无权限」。
2. **CI 计数口径**：`gh run list` 默认只回 20 条且不按 commit 过滤；REST `head_sha=` **只认完整 SHA**（短 SHA 返回空列表）。「某 commit 全绿」断言必须 `gh api "…/actions/runs?head_sha=<full-sha>"`。
3. **`wsyhuat` fetch 间歇失败**：必须重试后再下「无新工作」结论；本轮 `wsyhuat/main` 仍 `f98be0d`（2026-10-02，已吸收）。
4. **audit 门禁零豁免 100% 严格**（#244 后）：任何新 moderate+ 公告会直接让 `Audit Dependencies` 变红——目标状态，处置路线见 D-019/D-011/D-018。
5. **部署版本核验**：`wrangler deployments list --name huat-fsac --json` **返回未按时间排序**，须自行按 `created_on` 降序取最新；当前最新 = `35127731-f8db-4910-832a-dac8eb5ee098`（第 96 轮 #253 + #251 发版部署）。OAuth 已登录可用。
6. **CSP nonce 比对必须单请求取样 + 剥 `nonce-` 前缀**：`curl -D h.txt -o b.html` 一次请求；头里 `script-src` 的 `'nonce-XXX'` 与体里 `nonce="XXX"` 比对须去掉 `nonce-` 前缀。
7. **看板页真实路径**：zh `…/docs-center/运营与协作/项目进度看板/`（URL 百分号编码）与 en `…/en/docs-center/运营与协作/项目进度看板/`；`/showcase-dashboard/` 不含 metrics 快照。
8. **版本四方核验与祖先判定**：已由 #251 闭环证实；后续发版严格遵守 WORKFLOW §11。
