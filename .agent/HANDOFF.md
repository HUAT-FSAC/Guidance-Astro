# HANDOFF

## 本轮概要

新契约下第一轮 Execution。串行完成：**契约落地重建 ENV** → **#182（完成，in-review）**。开工时确认上一轮的 #181 已完整落地（无残留锁），未重复劳动。**M2 的 ready 队列在本轮后清空。**

## 已完成

- **ENV 重建**：`.agent/ENV.md` 改为 Executor 版契约文档 —— 实测命令集、当轮实测基线（**436 passed / 40 files**、e2e 97、sitemap 168）、部署判据、7 条环境限制与规避、分支命名 `agent/issue-<N>-<slug>`、`LOCK_TTL_MINUTES=30`、**契约标签与仓库实际的映射表**。
- **#182**：`docs: 消除文档快照与现状漂移…(#182)`（PR #191，CI 10 项全绿）。改 `WORKFLOW §2`（不再写死 Astro 7.3.3 / Starlight 0.41.11 / TS 6.0.3，不再写「仅 #101 开放」）、`AGENTS.md`（wrangler OAuth 凭据路径改为跨平台事实 + 「先 `wrangler whoami` 再决定重登」）、`ARCHITECTURE.md:58`（Issue 清单外、同类的硬编码）。历史行逐条判定为不改。

## 未完成 / 进行中（下一棒最优先看这里）

- **没有 in-progress Issue，ready 队列为空** ⇒ 按契约 §2.4 停止条件，本棒不再开新任务。
- 若下一棒是 **Planner**：需要处理 ① in-review 5 单的验收；② 契约 §1.3 标签体系缺口（仓库只有 `status:backlog|in-progress|review|done` 与 `priority:p0..p3`，缺 `ready`/`in-review`/`blocked`/`needs-info`/`P4`）；③ `majors` 组的 #186/#187/#188 处置策略（D-009 只授权批次处置，未授权合并自动 PR）；④ D-005 重评（分组已上线）；⑤ 规划 M3 或补 ready。
- 若下一棒是 **Executor**：无任务可领时按 §2.1 在 HANDOFF 记录后正常结束，不要造任务。

## 验证情况

本轮跑过并取真实退出码：`pnpm lint` 0、`pnpm exec tsc --noEmit` 0、`pnpm test:run` 0（436/40）、`pnpm quality:audit` 0（豁免剩 14 天）、`pnpm build` 0、`pnpm format:check` 首跑 **1** → 定位为我自己写的 ENV 表格未对齐，prettier 修复后复跑 0。
未跑：`test:e2e`、`deploy:worker` —— 纯 Markdown，`docs/` 与 `.agent/` 不在站点构建集内，已在报告中写明原因（不是"应该不用"）。

## 风险与注意事项

1. **基线数字必须当轮实测**：我在 ENV/PR 里沿用了记忆中的 429/39，实际 436/40，已公开修正 —— 别重复这个错误。
2. **`.agent/` 必须单独 `chore(agent):` 提交**（契约 §1.1）：我本轮就违反了（把 ENV 混进 docs 提交），因禁止 force push 只能追加提交纠正留痕。
3. **commitlint 很严**：footer 单行 >100 字符、subject 首词大写（如 `ENV …`）都会被拒；被拒时**提交并不存在**，不要声称已推。
4. **squash 之后 inbound 巡检必然误报**（`HEAD..wsyhuat/main` 与 `git cherry` 都不准）→ 用内容级 `git diff --stat main wsyhuat/main -- <路径>` 终判，别每轮重新 triage。
5. 沙箱里 `pnpm install` 下载新包需要写 `~/.local/share/pnpm/store/v11`；只读环境会报 `ERR_SQLITE_ERROR`（**别把 store 挪进工作区**，会 purge node_modules 重下 ~950 包）。

## 第 46 轮补充核实（新增）

- 上轮标注「未确认」的临时分支删除：`git ls-remote --heads origin refs/heads/agent/*` 为空 ⇒ 确已清理，无残留、未误删他人分支。
- 主干：`main@0c65e9b` 的 CI/CD Pipeline = success。
- D-011 回看：`http-cache-semantics` 仍 4.2.0、`braces` 仍 3.0.3 ⇒ 补丁未发布，**不要**提前删豁免或改 CI；到期 2026-10-17 时按 ENV/HANDOFF 流程显式决策。

## 给下一棒的第一步建议

`git fetch --all --prune && git pull --rebase` → 查 `.agent/LOCK`（应无锁）→ 跑 §1.6 inbound 巡检并按 ENV §5 的标签映射理解状态 → 读 `PLAN.md §四`（M2 全绿交付）→ **若无 ready 则直接结束并提示 Planner 介入**；有则按 §2.3 领取（分支名用 `agent/issue-<N>-<slug>`）。

## 给 Planner 的信号

**需要 Planner 介入**：ready 队列已空 + in-review 积压 5 单（#178/#179/#180/#181/#182）+ 契约标签体系缺口 + `majors` 组三个新 PR 的处置决定 + D-005 重评条件已满足。另 M2 五项已全部交付，可考虑宣布 M2 完成并规划 M3。
