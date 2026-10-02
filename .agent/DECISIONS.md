# DECISIONS — 长期决策留痕（Planning Agent 唯一写入点）

> **规则：** 任何具有长期影响的用户决定必须落盘于此，格式：**唯一编号 + 日期 + 问题 + 决定 + 理由 + 影响范围**。
> 后续所有规划（PLAN / Issue 拆解 / 验收）_*必须先读本文件并把 D-* 视为硬约束_*。
> 除非出现**新事实**导致旧决定不再成立，**绝不允许重复询问**已解决的问题。
> 重新确认时必须在「重新评估触发」列写明**具体是什么新事实**变了。

---

## 索引

| 编号  | 日期       | 主题                                                          | 状态                           | 来源                                 |
| ----- | ---------- | ------------------------------------------------------------- | ------------------------------ | ------------------------------------ |
| D-001 | 2026-09-19 | 部署走本机 wrangler OAuth，CI 不含 deploy job                 | 生效（#101 阻塞中）            | 人类 + `AGENTS.md`                   |
| D-002 | 2026-09-30 | 免 review 自主推进（长期生效）                                | 生效                           | 人类原话「不需要 review，直接推进」  |
| D-003 | 2026-09-22 | `wrangler` 保持**精确 pin**，须与 adapter peer 同步           | 生效                           | T-037 + `dependabot.yml`             |
| D-004 | 2026-09-22 | Starlight `>=0.42` 暂缓（satteri WASI 破坏 workerd）          | 生效                           | T-026 实测 + T-037                   |
| D-005 | 2026-09-22 | dependabot PR **批量处置**（批次 commit + 关闭 PR），不逐个合 | 生效                           | T-037（`ee71488` + 8 PR 关闭）       |
| D-006 | 2026-10-02 | Execution Agent **不自行关单**，留结果评论待 Planner 验收     | 生效                           | HANDOFF §三.1 / §五.7                |
| D-007 | 2026-09-30 | `overrides` 下限必须核对上游声明区间（禁裸 `>=X`）            | 生效                           | 第 29 轮教训 + `pnpm-workspace.yaml` |
| D-008 | 2026-10-01 | 记录文件（`.agent/**`、`WORKFLOW §7.4`）恢复直推 main         | 生效                           | 第 22 轮解冻                         |
| D-009 | 2026-10-03 | Execution Agent **不得合并 dependabot 自动 PR**               | ⚠️ 与 D-005 冲突，本轮提请裁决 | STATE 多轮「自动 PR 不碰」           |

---

## D-001 部署走本机 wrangler OAuth

- **日期：** 2026-09-19
- **问题：** Cloudflare Worker SSR 的发布动作由谁执行？
- **决定：** CI **不含** `deploy` job。线上部署由 Agent 在本机执行 `pnpm deploy:worker`（= `pnpm build && wrangler deploy --config dist/server/wrangler.json`），用 wrangler OAuth 身份。验收 = `curl -sI https://huat-fsac.eu.org/` 响应含 `content-security-policy: nonce-`。
- **理由：** `CLOUDFLARE_API_TOKEN` Secret 一直未配置，保留 deploy job 只让 `main` 每次 push 长红。
- **影响范围：** `AGENTS.md`、`docs/DEPLOYMENT.md`、`docs/PROJECT_MANAGEMENT_MODEL.md`、`WORKFLOW §2`。**单点风险已知并接受**：换机或重装系统需重跑 `wrangler login`（strip 本地 proxy），OAuth 态仅存于当前用户 profile。
- **重新评估触发：** 用户在 Actions Secrets 配好 `CLOUDFLARE_API_TOKEN` → 按 `8475f88` 把 deploy job 加回 `ci-cd.yml`（实现已在 git 历史）。

## D-002 免 review 自主推进

- **日期：** 2026-09-30
- **问题：** Agent 产出的 PR 是否必须等待人类 review 才能合并？
- **决定：** 不需要。Agent 可在 **CI 全绿**的前提下自行合并并部署。**长期生效**。
- **理由：** 人类原话「不需要 review，直接推进」——单人开发，串行等待 review 成为纯延迟。
- **影响范围：** 所有 relay PR 的合并与上线流程。注意本决定**只解除 review 等待，不解除 D-009 的自动 PR 禁令**，二者是不同维度。
- **重新评估触发：** 用户要求恢复人工 review 关卡。

## D-003 `wrangler` 保持精确 pin

- **日期：** 2026-09-22
- **问题：** `wrangler` 用 caret 还是精确 pin？由谁负责与 adapter 版本对齐？
- **决定：** `package.json` 中 `wrangler` **不带 caret**（精确 pin），版本必须与 `@cloudflare/vite-plugin` 的 peer 要求**同步**移动。`dependabot.yml` 忽略 `wrangler` 的 `semver-major` 更新。
- **理由：** wrangler 是部署链工具，版本漂移会直接影响线上发布可复现性；而它的版本不是自由变量——由 adapter 的 peer 约束反推。
- **影响范围：** `package.json`、`pnpm-workspace.yaml`、`.github/dependabot.yml`、任何 Cloudflare adapter 升级。
- **⚠️ 本轮实测到的张力（2026-10-03）：** 「同步」是靠人工记忆维持的，没有机制保证。PR #107 只把 wrangler 提到 `4.138.0`，而 PR #109 引入的 `@cloudflare/vite-plugin@1.62.0` 要求 `wrangler@^4.143.0` — 二者不一致，单独或合并都构建失败。见 Issue（wrangler peer 修复）。

## D-004 Starlight `>=0.42` 暂缓

- **日期：** 2026-09-22
- **问题：** 是否跟进 Starlight 0.42+？
- **决定：** 否。`dependabot.yml` 忽略 `@astrojs/starlight >=0.42.0`，等上游修复。
- **理由：** 0.42 引入 `satteri` WASI 依赖，rolldown/workerd 构建链无法解析（T-026 实测 + PR#89 CI 复现）。
- **影响范围：** `dependabot.yml`、Starlight 升级路径。
- **重新评估触发：** 上游 Starlight 移除/修复 satteri WASI 依赖。

## D-005 dependabot PR 批量处置

- **日期：** 2026-09-22
- **问题：** 堆积的 dependabot PR 该逐个合并，还是统一处理？
- **决定：** **批量处置**——本地做一次批次依赖 commit（`pnpm install` 统一解析 + 跑完整门禁），然后**逐个关闭 PR 并留言关联到批次 commit**。不逐个合并。
- **理由：** T-037 实测有效的既有做法。根本原因：所有 dependabot PR 都只改 `package.json` + `pnpm-lock.yaml` **同两个文件**，逐个合并 = 每次都要 rebase 下一个，串行 N 次且中途任一失败即污染 lock。
- **影响范围：** 依赖升级流程。**已验证的收益**：批次内可一次性发现 peer 冲突（本轮 #109 就是这么暴露的），而逐个合并会先合入 #107 制造一次无用提交。
- **重新评估触发：** 若未来 dependabot 改为分组 PR（`groups:` 配置）或单 PR 互不冲突文件，则逐个合并重新成为更优解。

## D-006 Execution Agent 不自行关单

- **日期：** 2026-10-02（第 32 轮）
- **问题：** Executor 完成后能否直接 `Closes #N` 关单？
- **决定：** 不能。Executor 留**执行结果评论**（提交/PR/验证证据），由 **Planner 逐项对照验收标准**验收后关单。
- **理由：** 防止「comment 写完成就关单」——验收标准必须被真实核对，而不是被自我声明替代。
- **影响范围：** 所有 relay PR 的关闭动作归 Planner；`fix: #N` 形式的自动关单需在合并后由 Planner 复核确认。

## D-007 `overrides` 下限必须核对上游声明区间

- **日期：** 2026-09-30（第 29 轮教训）
- **问题：** 修 audit 漏洞时 `overrides` 怎么写？
- **决定：** 裸写 `>=X` **禁止**——必须核对上游包自身声明的 semver 区间并收紧上界（如 `>=5.9.3 <6.0.0`）。
- **理由：** 第 29 轮实锤：裸 `>=5.9.3` 实际解析到 `6.0.2`，越界 `astro` 声明的 `^5.8.1`，属 semv 不兼容风险。
- **影响范围：** `pnpm-workspace.yaml` 全部 `overrides` 条目。

## D-008 记录文件恢复直推 main

- **日期：** 2026-10-01（第 22 轮解冻）
- **问题：** `.agent/**` 与 `WORKFLOW §7.4` 是否必须走 PR？
- **决定：** 不必。恢复直推 `main` 惯例。**代码与文档修复仍走独立分支 + PR**。
- **理由：** 这些是每轮自动追加的协作日志，走 PR 只会制造 11 个 PR 争抢同 3 个文件的冲突（第 17 轮已实测）。
- **影响范围：** 仅记录类文件。

## D-009 dependabot 自动 PR 合并禁令（⚠️ 待裁决）

- **日期：** 2026-10-03（首次记录于 STATE 多轮「自动 PR 不碰」）
- **问题：** Agent 是否有权合并 dependabot 创建的自动 PR？
- **决定：** **现行禁令：不得合并。** 但该禁令与 D-005（批量处置 = 关闭 PR 而非合并）在实操上**同向**（都不合并），冲突点在于**谁来触发**。
- **理由（禁令的来源）：** 防止 Agent 无差别吞入未经评估的依赖变更。
- **⚠️ 实际后果（2026-10-03 实测）：** 9 个 dependabot PR 静置 5 天未动，`open-pull-requests-limit: 10` 已被占用 9 位，**dependabot 已被限流，无法再上报新的依赖/安全更新**。这不是「保持干净」，而是**静默停止安全更新摄入**。
- **本次提请裁决内容：** 是否授权按 D-005 既有先例执行一次批量处置（批次 commit + 关闭 9 PR + 留言关联）。
- **重新评估触发：** 出现高危 CVE 且 dependabot 因限流无法上报时，必须重新评估。
