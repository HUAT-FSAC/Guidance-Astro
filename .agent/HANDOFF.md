# 交接说明（HANDOFF）

**本棒 Agent：** `planner-20261002T171300Z`（第 35 轮，**Planning Agent 角色**）
**时间：** 2026-10-02T17:13Z 起（UTC；上一棒无遗留锁）
**仓库 / 分支：** `HUAT-FSAC/Guidance-Astro` ｜ 主干 `main@78fec09`
**状态：** 路线图与长期决策已建立（`PLAN.md` / `DECISIONS.md`），M1 稳态治理 4 个 `ready` 任务入队；D-009 已获人类裁决；无代码改动

> 🔴 **本棒起角色为 Planning Agent，不再是 Execution Agent。**
> **下一棒请先按 `docs/WORKFLOW.md:§1/§3` 执行：**
> `git fetch --all --prune` → `git pull --rebase` → 读 `.agent/PLAN.md`（路线图）+ `.agent/DECISIONS.md`（**D-\* 长期约束，先读**）+ `.agent/STATE.md` + `.agent/ENV.md` + 本文件 → 检查 `.agent/LOCK` → 从 §二 的 ready 队列认领**一个**任务。

---

## 一、本棒做了什么（第 35 轮：Planning Agent 首次接棒）

1. **角色转换**：此前 34 棒均为 Execution Agent，**从未存在 `PLAN.md` 与 `DECISIONS.md`** —— 路线与长期决策只散落在 `WORKFLOW §4`/`§7.4` 与 `STATE` 叙述中，不可被机器读取。本棒补齐。
2. **例行同步**：`git fetch --all --prune` → 树干净 → `main@78fec09` 与 origin 一致（0/0）→ 无 `LOCK`。
3. **真实状态核实**：CI 全绿（run 37009784096）／线上 `/` 200 + CSP nonce／`pnpm audit` 0 漏洞／看板 T-001..T-038 全完成。
4. **发现三处实证红灯**（详见 `STATE.md` 第 35 轮）：依赖摄入近停摆（9 PR 占满限流额度）、wrangler peer 硬失败（且发现比表面更深，见 §三）、发版停滞 11 天、记录文件损坏。
5. **产出**：新建 `PLAN.md` / `DECISIONS.md`；新建 **#164 / #165 / #166 / #167** 并逐条加 Planner 状态标注；修 `STATE.md` 损坏行与重复 `#101` 条目；`WORKFLOW §7.4` 追加本轮行（102 → 103）。
6. **D-009 人类裁决已下达**（见 §四）：授权 dependabot 批次处置，**逐个合并自动 PR 仍禁止**。

## 二、当前 ready 队列（M1 稳态治理，4 项）

**严格串行链**（依赖决定，非排版）：

```
#164 wrangler→4.143.0  ──▶  #165 dependabot 批次处置  ──▶  #167 发布 v1.1.0
                     （#166 无依赖，可与任一并行）
```

| 顺位 | Issue | 优先级 | 依赖 | 一句话                                             |
| ---- | ----- | ------ | ---- | -------------------------------------------------- |
| ①    | #164  | P1     | 无   | wrangler 精确 pin 4.136.2 → 4.143.0（**M1 起点**） |
| ②    | #165  | P1     | #164 | dependabot 9 PR（#106–#114）批次处置，解除限流占位 |
| ③    | #167  | P2     | #165 | 合并 release-please PR #96，发布 v1.1.0            |
| ∥    | #166  | P3     | 无   | `.agent` 记录文件全量体检 + 计数断言留证           |

**认领前必查（防踩已知坑）：**

- #165 开工前确认 **#164 已 close**，否则会把 main 拖进 lockfile 悬崖。
- #167 开工前确认 **#165 已 close**（先发依赖后发版）。
- ~~#165 开工前确认 D-009 授权~~ ✅ **已授权 2026-10-03**；剩余前置只有 **#164**。

**D-006 纪律：** Executor 完成后**留结果评论、不要自行关单**；由 Planner 逐条对照验收标准核对后关单。

## 三、下一棒要注意的关键事实（本轮新发现）

1. **⚠️ adapter 用的是浮动范围**：14.3.2 与 14.3.3 声明的 `@cloudflare/vite-plugin` **都是 `^1.53.0`**。所以 peer 冲突不只影响 PR #109 —— **任何刷新 lockfile 的操作**（`pnpm update`、dependabot 批次）都可能在 package.json 没改的情况下让 main 构建失败。当前仅靠 `pnpm-lock.yaml` 既有 pin 保护。
2. **PR #107 不能解决问题**：它只把 wrangler 提到 `4.138.0 < 4.143.0`，单独或与 #109 同合都不满足 peer。
3. **9 个 dependabot PR 只改同 2 个文件**（`package.json` + `pnpm-lock.yaml`），是严格串行 rebase 链，不是 9 个独立任务。
4. **`STATE.md:7` 历史上损坏**（三段重复 + 粗体未闭合），本棒已修；剩余体检见 #166。

## 四、Decision Gate 结果与剩余阻塞

- ✅ **D-009 已裁决（2026-10-03）**：授权按 D-005 先例执行 dependabot 批次处置（批次 commit + 关闭 PR + 留言关联）。**逐个合并 dependabot 自动 PR 仍禁止**，不得用 `--admin` 单独 merge 任何 dependabot PR。

- **#101**：配 `CLOUDFLARE_API_TOKEN`（Actions Secrets）。**配好前不要把 deploy job 加回 CI**（会重演 main 长红）；实现已备好（`8475f88`）。
- 人类侧：`PROJECT_TOKEN` 轮换 + `projects/1` 是否存在；`size:xs` 手工建 label；`update-linked-issues` 去留（均属凭据/仓库设置，Agent 不可自决）。

## 五、注意事项 / 坑（执行相关精简版，全量见 git 历史）

1. **依赖任务串行**：#164 → #165 → #167 顺序不可跳（见 §二）。
2. **部署前必 `git pull`**（第 30 轮事故：GitHub 端已合并但本地树过期，两次上线旧树）。且必须确认目标文件在位。
3. **`pnpm` 不在裸 PATH**：同命令内 export 或用 `mise exec -- pnpm`；跨 shell 调用 PATH 不继承，**commit 前须同命令内 export**，否则 husky 拦 commit。
4. **本地门禁清单必须含 `pnpm audit`**（CI 第 2 job；公告随时发布，#160 教训）。
5. **override 下限必须核对上游声明区间**（D-007，裸 `>=X` 会放走 major）。
6. **gh label 名错整体失败**（`priority:p2` 不是 `P2`），建单后回查；comment 反引号用 `--body-file`。
7. **sitemap 比对先 unquote**（percent-encoding 假阳性）；计数只取 sitemap-0（169 是混入 sitemap-index 自身）。
8. **记录类文件（`.agent/\*\*`、`WORKFLOW §7.4`）可直推 main**（D-008）；代码/文档仍走分支 + PR。
9. **锁协议**：超 30min 可接管；正常结束删锁；锁不提交。
10. **关单纪律**：Executor 不关单（D-006）；Planner 验收后关。
11. **§7.4 追加是历史行不可删**（本棒 102 → 103 行）。

## 六、关键命令速查

```bash
git fetch --all --prune && git pull --rebase
cat .agent/PLAN.md .agent/DECISIONS.md .agent/STATE.md .agent/HANDOFF.md
mise exec -- pnpm audit --audit-level=moderate
gh issue list --state open --json number,title,labels --jq '.[] | "#\(.number) \(.title)"'
gh pr list --state open --author "app/dependabot" --json number --jq 'length'   # 限流占用计数
export PATH="$HOME/.local/share/mise/installs/pnpm/11:$HOME/.local/share/mise/installs/node/22/bin:$PATH"
curl -s -o /dev/null -w "%{http_code}\n" https://huat-fsac.eu.org/
```

## 七、与看板 / 前一棒的一致性

- `docs/WORKFLOW.md:§4` T-001..T-038 全部已完成 → 阶段判定为**功能期结束，进入漂移治理期**（`PLAN.md` §一，附 7 项实测判据）。
- 长期决策 D-001..D-009 落 `.agent/DECISIONS.md`；D-001..D-008 为**从 git 历史与既有轮次复原**，**D-009 于 2026-10-03 获人类裁决**（授权批次处置；逐个合并自动 PR 仍禁止）。
- 本轮 `§7.4` 追加第 35 轮行。
- **本棒起新增文件**：`PLAN.md`（路线图，唯一写入点）、`DECISIONS.md`（长期决策，唯一写入点）。
