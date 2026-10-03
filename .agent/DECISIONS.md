# DECISIONS — 长期决策留痕（Planning Agent 唯一写入点）

> **规则：** 任何具有长期影响的用户决定必须落盘于此，格式：**唯一编号 + 日期 + 问题 + 决定 + 理由 + 影响范围**。
> 后续所有规划（PLAN / Issue 拆解 / 验收）_*必须先读本文件并把 D-* 视为硬约束_*。
> 除非出现**新事实**导致旧决定不再成立，**绝不允许重复询问**已解决的问题。
> 重新确认时必须在「重新评估触发」列写明**具体是什么新事实**变了。

---

## 索引

| 编号  | 日期       | 主题                                                                         | 状态                                           | 来源                                 |
| ----- | ---------- | ---------------------------------------------------------------------------- | ---------------------------------------------- | ------------------------------------ |
| D-001 | 2026-09-19 | 部署走本机 wrangler OAuth，CI 不含 deploy job                                | 生效（#101 阻塞中）                            | 人类 + `AGENTS.md`                   |
| D-002 | 2026-09-30 | 免 review 自主推进（长期生效）                                               | 生效                                           | 人类原话「不需要 review，直接推进」  |
| D-003 | 2026-09-22 | `wrangler` 保持**精确 pin**，须与 adapter peer 同步                          | 生效                                           | T-037 + `dependabot.yml`             |
| D-004 | 2026-09-22 | Starlight `>=0.42` 暂缓（satteri WASI 破坏 workerd）                         | 生效                                           | T-026 实测 + T-037                   |
| D-005 | 2026-09-22 | dependabot PR **批量处置**（批次 commit + 关闭 PR），不逐个合                | 生效                                           | T-037（`ee71488` + 8 PR 关闭）       |
| D-006 | 2026-10-02 | Execution Agent **不自行关单**，留结果评论待 Planner 验收                    | 生效                                           | HANDOFF §三.1 / §五.7                |
| D-007 | 2026-09-30 | `overrides` 下限必须核对上游声明区间（禁裸 `>=X`）                           | 生效                                           | 第 29 轮教训 + `pnpm-workspace.yaml` |
| D-008 | 2026-10-01 | 记录文件（`.agent/**`、`WORKFLOW §7.4`）恢复直推 main                        | 生效                                           | 第 22 轮解冻                         |
| D-009 | 2026-10-03 | 授权 dependabot **批次处置**；**逐个合并自动 PR 仍禁止**                     | 生效（人类已裁决）                             | 人类裁决 + D-005 先例                |
| D-010 | 2026-10-03 | **锁定 `@cloudflare/vite-plugin` 解析**，`wrangler` pin 跟随其 peer          | 生效（**Planner 自主裁定**，非用户决定）       | 第 36 轮 `npm view` 实测 + #164      |
| D-011 | 2026-10-03 | 依赖审计门禁 = **带到期日的显式豁免**（不降级、不绕过、不删步骤）            | 生效（**用户授权**）                           | 第 37 轮 #173 + PR #174              |
| D-012 | 2026-10-03 | 发版节奏三档（patch 即时 / minor 随 Milestone / major 停等人类）             | 生效（**Planner 自主裁定**）                   | 第 41 轮 M2 开局 + #179 成文         |
| D-013 | 2026-10-03 | 契约 §1.3 标签体系 = **最小补齐 3 个标签 + 保留既有映射**                    | 生效（**Planner 自主裁定**）                   | 第 48 轮（Executor 多轮上报缺口）    |
| D-014 | 2026-10-03 | 分组生效后依赖摄入手法是否改回「直接合并 minor-and-patch 分组 PR」           | 生效（**用户 2026-10-03 选 A**）               | 第 48 轮 D-009 重评，用户裁决 = A    |
| D-015 | 2026-10-03 | dependabot **majors 组一律暂缓**（actions v7 / typescript 6→7 等）不自动摄入 | 生效（**Planner 自主裁定**，延续 D-003/D-004） | 第 50 轮 #194 处置 + #186/#195 实测  |

---

## D-001 部署走本机 wrangler OAuth

- **日期：** 2026-09-19
- **问题：** Cloudflare Worker SSR 的发布动作由谁执行？
- **决定：** CI **不含** `deploy` job。线上部署由 Agent 在本机执行 `pnpm deploy:worker`（= `pnpm build && wrangler deploy --config dist/server/wrangler.json`），用 wrangler OAuth 身份。验收 = `curl -sI https://huat-fsac.eu.org/` 的 CSP 头**内含每请求新生成的 nonce**。
- **⚠️ 验收判据修正（2026-10-03，#171）：** 本条原文写的是「响应含 `content-security-policy: nonce-`」，**该字面串在当前线上永不出现** —— 实际头是完整策略 `content-security-policy: default-src 'self'; script-src 'self' … 'nonce-XXX'; …`，nonce 在 `script-src` 内。exec 第 37 轮据此误判过一次 `MISSING`。正确判据：`grep -qiE "content-security-policy:.*nonce-"`；**更强的判据是同一请求下头与 body 的 nonce 一致**（能拓出 CSP 与脚本属性不同步的真故障）。`AGENTS.md` 与 `docs/DEPLOYMENT.md` 的同源文案仍待一条 `docs:` PR 统一（#171）。
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

## D-009 dependabot 自动 PR 处置授权（✅ 人类已裁决 2026-10-03）

- **日期：** 2026-10-03（裁决日）。前身是 STATE 多轮遗留的「自动 PR 不碰」事实禁令。
- **问题：** Agent 是否有权处置 dependabot 创建的自动 PR？原「不得合并」的事实禁令导致 9 个 PR 静置 5 天无人认领。
- **决定：**
    1. ✅ **授权**按 **D-005** 既有先例执行**批次处置** —— 本地一次 `pnpm install` 统一解析、`pnpm audit` + 完整门禁验证、产出**一个**批次 commit，然后**逐个关闭** PR 并留言关联到该 commit。
    2. ❌ **仍禁止逐个合并** dependabot 自动 PR。本条授权的是「批次处置」这一动作，**不是**「合并自动 PR」的权限。任何情况下不得用 `--admin` 单独 merge 某个 dependabot PR。
    3. 前置约束：批次处置**必须**在 wrangler peer 修复（#164）落地 `main` 之后执行，否则 lockfile 刷新会在 peer 不满足的状态下解析。
- **理由（人类裁决依据 + Planner 已核实事实）：**
    - 9 个 PR 全部只改 `package.json` + `pnpm-lock.yaml` **同两个文件**（`gh pr diff --name-only` 逐个核实），是严格串行 rebase 链，逐个合需 9 次串行 rebase 且任一失败即污染 lock。
    - `#109` 当前 Build 硬失败（vite-plugin peer），`#107` 单独或同合都修不好（`4.138.0 < 4.143.0`）—— **逐个合并会先合入一个无用提交**。
    - 批次处置能让 peer 冲突在**一次**解析中暴露，正是 #109 被发现的途径。
    - 不作为的后果：`open-pull-requests-limit: 10` 已占 9 位，dependabot 将**无法再上报新依赖/安全更新**。
    - T-037（2026-09-22）已用同一手法（`ee71488` 批次 commit + 8 PR 关闭留言）成功处置过同类堆积，先例有效。
- **影响范围：** 依赖升级流程。执行载体为 Issue **#165**（blocked by **#164**）。本次授权**不解除** D-001（部署）、D-003（wrangler pin）、D-007（override 区间纪律）任何一条。
- **长期影响（新事实）：** 依赖摄入的**时限**由 dependabot 的 `schedule`（每周一 09:00 Asia/Shanghai）决定。若某次扫描前 `open-pull-requests-limit` 已被占满，该次扫描作废。**因此「依赖 PR 静置超过一周」应视为需要处置的信号，而非可以忽略的常态。**
- **重新评估触发：**
    - 出现高危 CVE 且 dependabot 因限流无法上报 → 立即重新评估，可临时提高 `open-pull-requests-limit`。
    - 用户要求改为「每周自动合并 dependabot PR」→ 属 CI 流程改造，须另立调查单，不得据本条自行实施。
    - dependabot 改为分组 PR（`groups:` 配置）或单 PR 互不冲突文件 → D-005「批次处置」的必要性下降，可重评是否改回逐个处理。

## D-010 `@cloudflare/vite-plugin` 锁定 + `wrangler` pin 跟随 peer（**Planner 自主裁定，非用户决定**）

- **日期：** 2026-10-03（第 36 轮）
- **问题：** `@astrojs/cloudflare` 对 `@cloudflare/vite-plugin` 始终声明**浮动** `^1.53.0`，而 vite-plugin 对 `wrangler` 有**构建期硬 peer 断言**，且该下限**逐发布日棘轮**。是否继续用「发现 peer 不够 → 抬 wrangler pin」的做法？
- **实测事实（`npm view`，2026-10-03）：**

    | vite-plugin | 发布（UTC）      | `wrangler` peer |
    | ----------- | ---------------- | --------------- |
    | `1.62.0`    | 2026-09-28 14:25 | `^4.143.0`      |
    | `1.62.1`    | 2026-09-29 15:40 | `^4.143.1`      |
    | `1.62.2`    | 2026-09-29 21:22 | `^4.144.0`      |
    | `1.62.3`    | 2026-09-30 14:34 | `^4.145.0`      |
    | `1.62.4`    | 2026-10-01 17:02 | `^4.146.0`      |
    | `1.62.5`    | 2026-10-02 11:36 | `^4.147.0`      |

    另：`@astrojs/cloudflare` 的 `14.3.2` / `14.3.3` / `latest` 声明的 vite-plugin 范围**完全相同（`^1.53.0`）**；`pnpm-workspace.yaml` 的 `minimumReleaseAge: 0` → 解析必然取最新。

- **决定：** 不再追 pin，而是把两个版本纳入**成对不变量**：
    1. `pnpm-workspace.yaml` 的 `overrides` 用**有界条目**锁定 `@cloudflare/vite-plugin` 的解析结果（写法与 D-007 同源：选择器 + 有界目标范围，禁裸 `>=X`）。
    2. `package.json` 的 `wrangler` **保持精确 pin（无 caret）**，值 ≥ 锁定版 vite-plugin 的 peer 下限。
    3. 两者**必须在同一个 commit 移动**，不得拆开提交、不得只改一头。
    4. **不**自动追新：锁定值由人工抬，默认随 adapter / astro 升级批次（#165）一并重评。
- **由谁定：** **Planning Agent 自主裁定**（本条**不是**用户决定）。判断依据：回退成本 = 删一条 override + revert 一个 pin 行；不涉产品取舍、不改公共 API / schema / CI 结构；不做的后果是「任何刷新 lockfile 的动作都可能把 `main` 构建成红」（#165 就踩在此路上）。按「不把小问题甩给用户」的原则，未上升为 Decision Gate。
- **影响范围：** `pnpm-workspace.yaml`、`package.json`、`pnpm-lock.yaml`；任何 adapter / astro 升级；#165 批次处置（因此 #165 的前置目标值随之从 `4.143.0` 变为「锁定 + `4.147.0`」）。
- **旧决定为何仍成立：** D-003（wrangler 精确 pin）**未被推翻** —— 本条只把同样的纪律应用到被依赖方，并补上了「谁先动」这件事确实定不了的缺口。
- **重新评估触发（任一成立即重评）：**
    - `@astrojs/cloudflare` 改为**精确依赖** vite-plugin，或 vite-plugin 改为**宽 peer**（浮动消失则本条无必要）。
    - 锁定的 vite-plugin 版本出现安全公告 → 必须抬版，此时按本条第 3 点成对移动。
    - 出现必须用新 vite-plugin 的功能（如 workerd 新能力），此时抬锁定值并同 commit 改 wrangler pin。

## D-011 依赖审计门禁 = 带到期日的显式豁免（**用户授权**，不是 Agent 自决）

- **日期：** 2026-10-03（第 37 轮）
- **问题：** `Audit Dependencies` 是 `build` 的前置 job，所以 `pnpm audit --audit-level=moderate` 上任何一条公告都会冻结全链。本轮遇到两条 high（`http-cache-semantics <=4.2.0` GHSA-ch52-4w7c-c8xp、`braces <=3.0.3` GHSA-vfj7-8cjw-p6xm）**声称有补丁但上游根本没发**（`dist-tags.latest` 仍 4.2.0 / 3.0.3，GitHub Dependabot 告警 #187 的 `patched_versions` 为 `null`）→ override 无法解析，**无代码解法**，而 `main@95f4443` 已被拖红。该怎么办？
- **候选方案：** ① 等上游发版（期间全链冻结）；② **带到期日的显式豁免清单**；③ 接受 main 长期红；④ 把 audit 改 `continue-on-error` 或删步骤。
- **用户决定：** ✅ **采纳 ②**（用户原话「那就修复这些缺失项」，对应 Planner/Execution 提的推荐方案 ②）。④ 被明确排除（那是关门禁，不是治理）。
- **落地形式（可审计是关键）：** `scripts/quality/audit-gate.mjs` + `.config/audit-allowlist.json`，CI 改跑 `pnpm quality:audit`。规则：审计**级别不变**（仍 moderate）；仅当 **GHSA + 包名同时命中条目且未过期**才放行；**未知公告仍失败**；**条目到期仍失败**（强制回来核对上游是否已发补丁）；audit 输出非 JSON 时抛错而非静默返 0。已用 5 组反例/正例证明不是空转。
- **为什么不能由 Agent 自决：** 这改的是 **Definition of Done / CI 门禁强度**（与 `eslint --max-warnings`、`tsc 覆盖 tests/**` 同类），一旦放宽就影响所有后续交付的安全底线；历史上此类均判定归人类。
- **影响范围：** `.github/workflows/ci-cd.yml`、`package.json`、`scripts/quality/`、`.config/audit-allowlist.json`、`docs/WORKFLOW.md §6`；所有 PR 与 main push 的门禁结论。
- **到期与恢复条件（写进清单文件，不靠记忆）：** 现有两条豁免 **2026-10-17 到期**。到期时核对 `npm view http-cache-semantics dist-tags.latest`（期望 ≠ 4.2.0）与 `npm view braces dist-tags.latest`（期望 ≠ 3.0.3）：已发补丁 → **删条目并正常升级**；仍未发 → 必须显式续期决定（到期即红是有意的提醒机制，不得静默延长）。

## D-012 发版节奏（**Planner 自主裁定**，成文由 M2-B / #179 承担）

- **日期：** 2026-10-03（第 41 轮，M2 开局）
- **问题：** release-please 会自动开 Release PR，但**没人规定何时合并**，导致 v1.1.0 的 PR #96 从 2026-09-22 开到 2026-10-03（12 天）无人推进。M1 靠人工推动解决一次，机制仍缺。
- **决定：** 三档默认，Agent 可自主执行：
    1. **patch**（只有 `fix:`/`perf:`/`fix(deps):` 等）：rp 开出的 Release PR 在 **CI 全绿后即可由 Agent 直接合并**（配合 D-002 免 review），无需等 Milestone 收尾；
    2. **minor**（有 `feat:`）：**随 Milestone 收尾合并**，避免同一里程碑内反复抬小版本；
    3. **major / BREAKING CHANGE**：**一律停下等人类**，不得自动合并、不得改版本号。
- **发版后强制动作：** 四方核验（tag / `gh release list` / `package.json` version / CHANGELOG 段落）+ **`git merge-base --is-ancestor <里程碑提交> <tag>`** 证明包含关系；**禁止**用「CHANGELOG 能否 grep 到某 commit」当判据（`chore(deps)`/`docs:` 不是 rp 可见类型，该判据在设计上不可满足 —— #167 实测教训）。
- **为何不算用户决策：** 完全可逆（不合即可，版本线不受损；最坏情况回到"积压"现状），不涉产品结构，且 D-002 已给出"CI 绿即可自主推进"的授权边界。唯一新约束是 major 必须停 —— 那是**收紧**而非放宽。
- **影响范围：** 每次 rp Release PR 的处理；`WORKFLOW` 新增「发版节奏」节；`DEPLOYMENT.md` / `PROJECT_MANAGEMENT_MODEL.md` 的发布小节（只引用）。
- **重新评估触发：** ① 出现需要"发布即公告外部用户"的节奏需求（则改为固定日历发版）；② rp 改为自动合并（需另立调查，属 CI 改造）；③ 一次 patch 即时发版造成噪音或版本膨胀 ⇒ 收紧为每周最多一次。

## D-013 契约 §1.3 标签体系 = 最小补齐 3 个标签 + 保留既有映射（**Planner 自主裁定**）

- **日期：** 2026-10-03（第 48 轮）
- **问题：** 契约 §1.3 要求状态标签 `ready / in-progress / in-review / blocked / needs-info` 与优先级 `P0..P4`；本仓仅有 `status:backlog|in-progress|review|done` + `priority:p0..p3`，多轮 Executor 上报「blocked / needs-info / P4 无任何对应标签，只能用 comment 表达」。
- **决定：** **只为「完全无对应」的语义新建标签** —— 新增 `blocked`(#e11d48)、`needs-info`(#fef2c0)、`priority:p4`(#ededed)；**不**新建 `ready`/`in-review`（它们已有映射：`ready` = `status:backlog` + 正文首行「队列状态：ready」，`in-review` = `status:review`）。#101 补标 `blocked`；majors 跟踪单 #194 用 `needs-info`。
- **为何不自创新词：** 与既有 `status:`/`priority:` 词汇并存会制造**第二套口径**（正是 #181/#182 消灭的漂移类）。补齐无 analog 的三个即可让契约的阻塞/待决策语义可被标签追踪，收益最大、漂移最小。
- **由谁定：** Planning Agent 自主裁定（标签归 Planner 管理，见 §1.4）；回滚成本 = 一次 `gh label delete`。
- **影响范围：** `.agent/ENV.md §5` 的映射表据此更新（`ready`/`in-review` 沿用旧映射，`blocked`/`needs-info`/`p4` 改为直接用新标签）。
- **重新评估触发：** 若未来引入 GitHub Projects 看板或以标签驱动自动化，需重评词汇统一度。

## D-014 分组生效后依赖摄入手法：维持「批次处置」（**✅ 已确认 — 用户 2026-10-03 选 A**）

- **日期：** 2026-10-03（第 48 轮提出并同轮由用户裁决）
- **用户决定：** **选 A —— 维持批次处置**（不改为直接合并 auto PR）。D-009「❌ 禁止逐个/直接合并 dependabot 自动 PR」的约束**继续生效**；`minor-and-patch` 分组 PR 仍按 D-005/D-009 批次手法摄入，`majors` 组仍默认暂缓（#194）。
- **触发的事实：** D-005「批次处置」的前提是「多个 auto PR 抢同 `package.json`+`pnpm-lock.yaml` 两个文件 → 串行 rebase」。#178 分组生效后（第 42 轮实证「10 项更新 = 3 个 PR」），minor/patch 已收敛为**单一** PR（#187）。D-009 的重新评估触发条件（「dependabot 改为分组 PR → 批次处置必要性下降，可重评是否改回逐个处理」）现已成立。
- **选项与影响：**
    - **A（默认，推荐）：维持批次处置** —— 本地统一解析 + 全门禁 → 一个批次 commit → 关闭分组 PR 留言关联。优点：不越权推翻 D-009 的「禁止直接合并 auto PR」（那是人类 2026-10-03 裁决）；peer/audit 风险在一次解析中暴露。缺点：比直接合并多一步。
    - **B：改为直接合并 minor-and-patch 分组 PR**（CI 绿即合）—— 更省、符合 GitHub 常规；但**需先解除 D-009 对人类设定的 auto PR 合并禁令**（分组 PR 仍是 auto PR）。
    - **C：混合** —— minor-and-patch 直接合并、majors 维持暂缓 + 人工复核。
- **默认方案：A（已由用户正式选定）。** `majors` 组（#186/#188）在任何选项下都保持 §1.8 红线相邻、暂缓（见 #194）。
- **交付影响：** Issue **#193** 本就按「批次处置（A）」写成并置 ready，**无需修改**；本轮仅将 D-014 由 pending 转正式。
- **重新评估触发：** 若未来分组 PR 需与其它交付争抢同文件产生冲突，或用户改采自动化摄入策略，则重评本决策。

## D-015 dependabot majors 组一律暂缓（**Planner 自主裁定**，延续 D-003 / D-004）

- **日期：** 2026-10-03（第 50 轮）
- **问题：** #178 分组后 dependabot 把 majors 合成独立组，当前开放：#186（github_actions majors：actions/checkout 4.3.1→7.0.1、setup-node→7.0.0、create-pull-request→8.1.1，只改 `openwiki-update.yml`）；#195（npm majors，取代已 superseded 的 #188：typescript 6.0.3→7.0.2、vitest/coverage-v8、@cloudflare/workers-types 5.20261002.1→5.20260930.2）。是否摄入？
- **裁定：** ❌ **全部暂缓，不摄入**。
- **依据（本轮实测）：** ① 项目对 majors 的既定纪律就是「不自动追、人工复核」（D-003 wrangler / D-004 starlight 先例）；② §1.8 红线相邻（TS6→7 重大依赖引入、actions v7 CI 变更）；③ 具体失败/冲突证据：#195 的 TS7 与等效 PR #188 的 Lint&Format **已 FAILURE**，且将 workers-types 降到 5.20260930.2 与 D-010（wrangler 4.147.0 peer 锁 5.20261002.1）冲突。
- **处置形式：** 两个 majors PR 均**保持开放**（作 standing reminder，占额度 ≤2/10，不阻塞 minor-and-patch）；各 PR 落「暂缓 + 重评触发」结论评论；#194 关闭（目的=产出各 PR 处置结论，已达成）。
- **由谁定：** Planning Agent 自主裁定。「暂缓」= 维持现状、零动作、完全可逆；真正越红线的是「采纳」，那需用户决定。未上升为 Decision Gate。若用户希望采纳某项 majors，可随时覆盖本决策。
- **重新评估触发（任一成立即重开）：** ① 某功能确需 TS7 / workerd 新能力；② 旧版 action 出安全公告；③ TS7 生态稳定且经一次专项兼容验证；④ 用户主动要求跟进。

## 未决（第 51 轮巡检：无新增 pending）

本轮（第 51 轮稳态巡检）**无新 pending 决策项**；D-014（用户定 A）、D-015（Planner 自主裁定暂缓）均维持生效。需用户拍板的开放事项无变化：

- **#101**（`blocked`）：外部阻塞——需人类在 Actions Secrets 配 `CLOUDFLARE_API_TOKEN`（第 51 轮 `gh api` 复核仍仅 `CODECOV_TOKEN`/`PROJECT_TOKEN`），非产品取舍、非 Agent 可自解。
- **#197**（`needs-info`）：是否配 PAT/App 令牌自动化 release-please 的 PR 级 CI——属 §1.8 红线相邻（CI 改造）+ 需人类 Secret，**默认 C（不改）**，等发版频率信号成熟再评。
- **#200**（`needs-info`，第 51 轮 `auto-discovered`）：i18n 覆盖（en/zh 键数不对称 382/381 + 42 个含硬编码中文组件）——“哪些串应本地化 / en 站是否要求全覆盖”属内容取舍。**默认：不阻塞，先置 needs-info**，待分桶调研产出后由 Planner 据内容策略裁定或就“en 全覆盖与否”向用户提一次批量问题。
