# DECISIONS — 长期决策留痕（Planning Agent 唯一写入点）

> **规则：** 任何具有长期影响的用户决定必须落盘于此，格式：**唯一编号 + 日期 + 问题 + 决定 + 理由 + 影响范围**。
> 后续所有规划（PLAN / Issue 拆解 / 验收）_*必须先读本文件并把 D-* 视为硬约束_*。
> 除非出现**新事实**导致旧决定不再成立，**绝不允许重复询问**已解决的问题。
> 重新确认时必须在「重新评估触发」列写明**具体是什么新事实**变了。

---

## 索引

| 编号  | 日期       | 主题                                                                                                                                                         | 状态                                                     | 来源                                                      |
| ----- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------- | --------------------------------------------------------- |
| D-001 | 2026-09-19 | 部署走本机 wrangler OAuth，CI 不含 deploy job                                                                                                                | 生效（#101 阻塞中）                                      | 人类 + `AGENTS.md`                                        |
| D-002 | 2026-09-30 | 免 review 自主推进（长期生效）                                                                                                                               | 生效                                                     | 人类原话「不需要 review，直接推进」                       |
| D-003 | 2026-09-22 | `wrangler` 保持**精确 pin**，须与 adapter peer 同步                                                                                                          | 生效                                                     | T-037 + `dependabot.yml`                                  |
| D-004 | 2026-09-22 | Starlight `>=0.42` 暂缓（satteri WASI 破坏 workerd）                                                                                                         | 生效                                                     | T-026 实测 + T-037                                        |
| D-005 | 2026-09-22 | dependabot PR **批量处置**（批次 commit + 关闭 PR），不逐个合                                                                                                | 生效                                                     | T-037（`ee71488` + 8 PR 关闭）                            |
| D-006 | 2026-10-02 | Execution Agent **不自行关单**，留结果评论待 Planner 验收；例外须 Planner **逐单书面授权**（第 84 轮澄清）                                                   | 生效                                                     | HANDOFF §三.1 / §五.7 + 第 84 轮 #246 实例                |
| D-007 | 2026-09-30 | `overrides` 下限必须核对上游声明区间（禁裸 `>=X`）                                                                                                           | 生效                                                     | 第 29 轮教训 + `pnpm-workspace.yaml`                      |
| D-008 | 2026-10-01 | 记录文件（`.agent/**`、`WORKFLOW §7.4`）恢复直推 main                                                                                                        | 生效                                                     | 第 22 轮解冻                                              |
| D-009 | 2026-10-03 | 授权 dependabot **批次处置**；**逐个合并自动 PR 仍禁止**                                                                                                     | 生效（人类已裁决）                                       | 人类裁决 + D-005 先例                                     |
| D-010 | 2026-10-03 | **锁定 `@cloudflare/vite-plugin` 解析**，`wrangler` pin 跟随其 peer                                                                                          | 生效（**Planner 自主裁定**，非用户决定）                 | 第 36 轮 `npm view` 实测 + #164                           |
| D-011 | 2026-10-03 | 依赖审计门禁 = **带到期日的显式豁免**（不降级、不绕过、不删步骤）                                                                                            | 生效（**用户授权**）                                     | 第 37 轮 #173 + PR #174                                   |
| D-012 | 2026-10-03 | 发版节奏三档（patch 即时 / minor 随 Milestone / major 停等人类）                                                                                             | 生效（**Planner 自主裁定**）                             | 第 41 轮 M2 开局 + #179 成文                              |
| D-013 | 2026-10-03 | 契约 §1.3 标签体系 = **最小补齐 3 个标签 + 保留既有映射**                                                                                                    | 生效（**Planner 自主裁定**）                             | 第 48 轮（Executor 多轮上报缺口）                         |
| D-014 | 2026-10-03 | 分组生效后依赖摄入手法是否改回「直接合并 minor-and-patch 分组 PR」                                                                                           | 生效（**用户 2026-10-03 选 A**）                         | 第 48 轮 D-009 重评，用户裁决 = A                         |
| D-015 | 2026-10-03 | dependabot **majors 组一律暂缓**（actions v7 / typescript 6→7 等）不自动摄入                                                                                 | 生效（**Planner 自主裁定**，延续 D-003/D-004）           | 第 50 轮 #194 处置 + #186/#195 实测                       |
| D-016 | 2026-10-06 | 英文站 i18n 本地化**投入范围**（Bucket C/D/E 哪些应做）                                                                                                      | 生效（**用户 2026-10-06 选 A**）                         | 第 52 轮 #200 分桶报告 + 第 54 轮处置                     |
| D-017 | 2026-10-08 | Q4 下一阶段方向：是否启动新功能开发（ROADMAP §3 候选评估）                                                                                                   | 生效（**用户 2026-10-08 选 A**）                         | 第 61 轮季度评审 + 用户指令「继续下一个阶段」（同轮裁定） |
| D-018 | 2026-10-16 | audit 豁免**自主续期上限 = 一次**；第二次到期须停手交用户裁决                                                                                                | **提问路径已消解（第 84 轮 #244 落地）**；其余条款仍生效 | 第 81 轮 #199 放行时立                                    |
| D-019 | 2026-10-16 | braces 长期解**优先移除零引用的 `@fullhuman/postcss-purgecss`**，而非到期向用户提 A/B/C（有条件取代 D-018 的提问路径）                                       | **条件已满足生效（第 84 轮验收 #244 通过）**             | 第 82 轮 `pnpm why braces` 链路实测 + #244                |
| D-020 | 2026-10-19 | 「Milestone 收尾」= **`open_issues` 归零 + Planner 显式关闭**（与 `due_on` 无关）；收尾点上 minor Release PR 由 Agent 自主合并（把 **#192 已执行口径成文**） | 生效（**Planner 自主裁定**，非用户决定）                 | 第 90 轮 #192/#185 先例取证 + #251 建单 + M3 `open=1`     |
| D-021 | 2026-10-21 | 安全公告插队规则：**有补丁即升级、不豁免**；审计门禁红 = 项目阻塞（P0）；semver 兼容内不触发 D-015                                                           | 生效（**Planner 自主裁定**）                             | 第 99 轮 vite 3 条公告 → #254                             |
| D-022 | 2026-10-23 | 保留 SSR/nonce 的搜索索引采用真实路由与 SSR HTML，显式排除 fallback 和重定向壳                                                                               | 生效（**Planner 工程裁定**，#266 独立验收后准入 #262）   | 第105轮 #266 更正报告 + 实跑正文输入                      |

---

## D-001 部署走本机 wrangler OAuth

- **日期：** 2026-09-19
- **问题：** Cloudflare Worker SSR 的发布动作由谁执行？
- **决定：** CI **不含** `deploy` job。线上部署由 Agent 在本机执行 `pnpm deploy:worker`（= `pnpm build && wrangler deploy --config dist/server/wrangler.json`），用 wrangler OAuth 身份。验收 = `curl -sI https://huat-fsac.eu.org/` 的 CSP 头**内含每请求新生成的 nonce**。
- **⚠️ 验收判据修正（2026-10-03，#171）：** 本条原文写的是「响应含 `content-security-policy: nonce-`」，**该字面串在当前线上永不出现** —— 实际头是完整策略 `content-security-policy: default-src 'self'; script-src 'self' … 'nonce-XXX'; …`，nonce 在 `script-src` 内。exec 第 37 轮据此误判过一次 `MISSING`。正确判据：`grep -qiE "content-security-policy:.*nonce-"`；**更强的判据是同一请求下头与 body 的 nonce 一致**（能拓出 CSP 与脚本属性不同步的真故障）。`AGENTS.md` 与 `docs/DEPLOYMENT.md` 的同源文案仍待一条 `docs:` PR 统一（#171）。
- **理由：** `CLOUDFLARE_API_TOKEN` Secret 一直未配置，保留 deploy job 只让 `main` 每次 push 长红。
- **影响范围：** `AGENTS.md`、`docs/DEPLOYMENT.md`、`docs/PROJECT_MANAGEMENT_MODEL.md`、`WORKFLOW §2`。**单点风险已知并接受**：换机或重装系统需重跑 `wrangler login`（strip 本地 proxy），OAuth 态仅存于当前用户 profile。
- **✅ 「同源文案待一条 `docs:` PR 统一」已满足（第 90 轮实测记账，17 轮欠项就此关闭，无需 PR）：** 正确判据已在位 —— `AGENTS.md:22`（"注意字面串 `content-security-policy: nonce-` 永远不会出现…见 #171"）、`docs/DEPLOYMENT.md:69` + `:114`（"不要拿它当部署失败的依据"）、`docs/WORKFLOW.md:77`（§5 预发布行）、`docs/PROJECT_MANAGEMENT_MODEL.md:199`。仓库内剩余的 `content-security-policy: nonce-` 字面命中**全部位于追加式冻结历史**（`WORKFLOW.md:125` T-036 行、`:247`/`:259` §7.4 旧记录、`docs/HANDOFF-2026-09-19.md:38`），按 `WORKFLOW §4`/§7.4「不删历史」纪律**不改写**。
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
- **澄清（第 84 轮，随 #242 验收确立）：** 本条的"从不 close"允许一类**逐单书面授权**的例外 —— 当 Planner 把"关闭 X"写进任务单的**实现范围与验收标准**时，Executor 可在该单内执行关闭，但**仅限「非任务类自动化报告单」**（bot 按规则开出、无验收链的产物，如 `duration-budget`/`secret-scan` 类告警单）。判定依据有三：① 授权必须是单内书面的、可追溯的，不是口头或惯例如此；② 该单不含待验收的验收标准链；③ 保持 open 会造成实际危害（#246 实例：去重逻辑按 open + 标题前缀判定，留着已知假单会永久掩盖未来真实超标）。**任务单本身仍绝对禁止 Executor 关闭**；未获书面授权的任何 close 都是违规（参见 #212 教训）。首次适用并追认：第 84 轮 #246（`not_planned`）。

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

## D-016 英文站 i18n 本地化投入范围（**✅ 已确认 — 用户 2026-10-06 选 A**）

- **日期：** 2026-10-06（第 54 轮提出，同轮由用户裁定）
- **用户决定：** **选 A——只修「缺陷类」**：本地化 Bucket C（a11y aria-label）+ Bucket D（英文站可见文案，优先 Breadcrumbs）；**Bucket E 暂缓**。
- **背景：** #200 分桶调研证实英文站存在真实的用户可见 / 可访问性缺陷（Bucket D：`Breadcrumbs` 等 ~95 串在 90 篇 en docs 页显示中文；Bucket C：~15 条 `aria-label` 硬编码中文 = WCAG 缺陷；Bucket E：`Giscus`（未激活）/ `TeamNews` chrome ~5 串）。「是否投入、覆盖到哪一档」属内容/产品取舍（契约 §6.1）。
- **选项与影响（历史留痕）：** A 只修缺陷类（推荐/默认，已选定）；B = A + Bucket E 全量；C = 全部暂缓。用户选 A。
- **交付影响：** 据 A 拆分 **#203（ready・P2：Breadcrumbs 全站英文面包屑）** + **#204（ready・P3：Bucket C aria-label + Bucket D 剩余可见文案）**；**Bucket E 不建单**（用户未选 B）。#202（决策承载单）目的达成→关闭。
- **重新评估触发：** 若后续用户改采 B（补 Bucket E）或英文站定位发生变化，则重评本地化范围。

## D-017 Q4 下一阶段方向：是否启动新功能开发（**✅ 已确认 — 用户 2026-10-08 选 A**）

- **日期：** 2026-10-08（第 61 轮提出，同轮由用户裁定）
- **用户决定：** **选 A——不启动新功能**：维持 M3 稳态巡检至 10-17 到期决策，Q4 评审仅做机械刷新（#210）；新功能方向延后（日后再启按 B/C 重开，需用户新指令）。
- **问题：** M3 除 #199（10-17 到期决策）外无开放工作；`docs/ROADMAP.md` §5 自约「每季度评审一次」，Q4 窗口已开。Q4 是否借评审启动新功能方向（=开新 Milestone）？
- **调查结论（第 61 轮实测）：** ROADMAP §3 全部候选均**不可由 Agent 直接启动**：内容侧三项（2026 赛季 / 实验室介绍 / Showcase demo）等车队素材回填（外部依赖）；动态 og:image 触发条件未满足（ADR-002）；Starlight / Astro majors 属 D-004 / D-015 暂缓（§1.8 红线相邻）；i18n 残留已由 D-016 收敛（Bucket E 用户未选→不建单）。可立即执行的只有 ROADMAP 状态漂移机械修正 → 已建 **#210（ready・P3）**，与方向决策解耦。
- **选项与影响：**
    - **A（已选定）：不启动新功能** —— 维持 M3 稳态巡检至 10-17 到期决策，Q4 评审仅做机械刷新（#210）。零风险；若用户本意是新功能，仅延迟一次问答。
    - **B：启动「多语言贡献流程」**（ROADMAP §3.2：en `draft: true` 路径 + 翻译记忆库）—— 需先立 needs-info 调研单做产品定义，工程量中等，可随时转正式。
    - **C：整理内容素材催办清单** —— 把 §3.1 三项的「待回填」占位整理成给车队的人类待办清单（纯整理、不碰代码，可与 A 并行；产出仍依赖车队）。
- **推荐：** A；若用户想要「看得见的进展」，C 可与 A 并行。
- **默认方案：** A（用户不回复时照常稳态巡检；连续 3 轮无答复且无异常 → 按 §6.3 默认转正）。
- **重新评估触发：** 用户给出任一方向；车队素材到位；og:image 触发条件命中；10-17 到期决策完成后的 M3 收官评估。

## D-018 audit 豁免自主续期上限 = 一次（**Planner 自主裁定**，收紧 D-011 的默认延续）

- **日期：** 2026-10-16（第 81 轮，随 #199 由 blocked 转 ready 时立）
- **问题：** D-011（用户授权）规定「到期时若上游仍无补丁 → 必须显式续期决定，不得静默延长」。该机制本意是用**门禁变红**强制人回来核对；但"显式续期"并未规定**可以续几次**。braces 上游 `time.modified` = `2024-09-18`（近两年无动作），第十次实测仍 `3.0.3`。若每 14 天由 Agent 自主续一次，一年就是 26 次**形式合规、实质空转**的"显式决定"，红门提醒会被磨成事实上的永久豁免。要不要给自主续期设上限？
- **决定：** **Agent 自主续期上限 = 1 次**（即本轮 `2026-10-17 → 2026-10-31`）。第二个到期日（2026-10-31）若上游仍无补丁，**停止自主续期**，Issue 转 `needs-info` 并带完整方案交用户裁决。
- **理由：** ① 这是对 D-011 的**收紧**而非放宽，方向与 D-012「major 一律停等人类」同源，属 Planner 权限内的保守化裁定；② 用户当初授权的是"带到期日的**临时**放行"，"临时"的边界由人而非 Agent 判定才成立；③ 现在设上限，是把下一次询问安排在**有实际决策价值**的时刻（已连续 10 次实测无补丁，继续等待的边际价值趋零，需要的是取舍而非又一次核对）。
- **候选出路（2026-10-31 交用户时按 §6.2 格式带方案提出，含默认项）：** A 长期接受该 devDependency 风险并改为**长周期豁免**（如 6 个月，减少核对噪音）；B 从链路中移除 braces（`@fullhuman/postcss-purgecss → purgecss → fast-glob → micromatch`，属 devDependency，不进 Worker bundle，可评估换 purgecss 版本或弃用 purgecss）；C 继续 14 天短周期人工核对（即现状延续，成本最高）。
- **影响范围：** `.config/audit-allowlist.json` 全部条目（当前仅 braces 一条）；`scripts/quality/audit-gate.mjs` 未改动、门禁级别仍 `moderate`；未来任何 audit 豁免续期动作；#199 与其后续单。
- **重新评估触发：** 上游发布 `braces > 3.0.3` → 走「删条目 + 升级」并撤销本约束的实际影响；或用户提前给出取舍 → 按用户决定覆盖。
- **第 82 轮更新（见 D-019）：** 本决策中「`2026-10-31` 到期必须向用户提问」这一路径已被 **D-019 有条件取代** —— 若 **#244**（移除零引用的 `@fullhuman/postcss-purgecss`）成功，则该提问**不再需要**；其余条款（禁止第二次自主续期、到期门禁变红属预期机制）**继续有效**。
- **第 84 轮更新（条件兑现）：** **#244 已验收通过并关闭**（main `75ae26c`，亲跑 `pnpm why braces` 空链路、`entries: []`、`pnpm quality:audit` 零豁免 exit 0）⇒ D-019 的取代条件**正式满足**，**`2026-10-31` 硬墙与 A/B/C 用户提问路径就此消解，无需再向用户提取舍题**。本决策其余条款继续有效：若未来重新引入同类豁免，自主续期上限仍为一次、到期门禁变红仍属预期机制。

## D-019 braces 长期解优先走「移除未使用依赖」而非「到期提问」（**Planner 自主裁定**，有条件取代 D-018 的预设路径）

- **日期：** 2026-10-16（第 82 轮）
- **问题：** D-018 预设：`2026-10-31` 到期时若上游仍无补丁 ⇒ 停手，带 A/B/C 三案交用户裁决。但第 82 轮复核 `pnpm why braces` 时发现该预设的**技术前提不成立**：漏洞链路 `braces@3.0.3 ← micromatch@4.0.8 ← fast-glob@3.3.3 ← purgecss@8.0.0 ← @fullhuman/postcss-purgecss@8.0.0` 的**全部来源**是一个**全仓零引用**的直接 devDependency（`grep -rn "postcss-purgecss"` 仅命中 `package.json:84` 与豁免条目自述；仓库无 `postcss.config.*`；`astro.config.mjs` **无 `postcss` 键**，只 `import purgecss from 'vite-plugin-purgecss'` —— 后者自带 `purgecss@4.1.3`，其 deps = `commander`/`glob@^7`/`postcss`/`postcss-selector-parser`，**不含 braces**）。即 A 案（长周期豁免）与 C 案（每 14 天人工核对）都是**在为一个并不存在的依赖用途支付长期成本** —— 还要按 D-018 把这道取舍题交给用户吗？
- **决定：** **不必**。改走「**移除未使用依赖 + 删除豁免条目**」路线（新建 **#244**，`ready`・P2・M3）。删一条 devDependency 属**低风险且完全可回滚**（加回即恢复原状），且方向是**收紧**门禁（豁免清零、审计回 100% 严格），不属 §6.1 需请示的类别，故由 Planner 自决。**D-018 的其余条款继续有效**（禁止第二次自主续期；到期门禁变红属预期机制），仅"到期必须向用户提问"这一条被本决策**有条件取代**。
- **条件与回退（关键）：** 取代**仅在 #244 成功时成立**。若 `pnpm why braces` 在删除后**仍返回链路**（存在第二引路者），或删除导致构建/CSS 产物变化 ⇒ #244 转 `blocked` 并上报，**A/B/C 提问路径在原期限前复活**，届时按 §6.2 格式带方案与默认项向用户提出。
- **验证判据（已固化进 #244 验收标准）：** `pnpm why braces` 空链路；`.config/audit-allowlist.json` 的 `entries` 为空数组；`pnpm quality:audit` 在**零豁免**下 exit 0 且无「temporarily allowed」段落；`audit-gate` 单测 13/13 保持；门禁级别仍 `moderate`、CI 步骤未增删；CSS 体积与 bundle 预算无回归。
- **影响范围：** `package.json` / `pnpm-lock.yaml`（删一条 devDependency）、`.config/audit-allowlist.json`（删条目）、#244 的验收标准；D-018 的提问路径（有条件挂起）。**不触碰** `vite-plugin-purgecss` 与 `astro.config.mjs` 的 purgecss 配置。
- **重新评估触发：** ① #244 失败 ⇒ 立即回退到 D-018 的提问路径；② 上游发布 `braces > 3.0.3` ⇒ 走"删条目 + 升级"；③ 用户明确表示要保留该依赖。
- **第 84 轮更新（条件已满足）：** **#244 验收通过并关闭**（main `75ae26c`）。验证判据五项全部由 Planner 亲跑复现：`pnpm why braces` **空** · `entries: []` 且无 braces/GHSA 字样 · `pnpm quality:audit` **零豁免 exit 0**（`✅ audit clean`，无 `temporarily allowed`）· `audit-gate` 单测 **13/13** · `audit-level` 仍 `moderate`、`ci-cd.yml` 步骤未增删 · `quality:bundle` CSS 250.73 KB / JS 219.38 KB 与改动前**逐项相同**。⇒ **本决策的"取代"条款正式生效**，D-018 提问路径关闭；门禁自此 100% 严格（空豁免清单 = 目标状态），新的 moderate+ 公告会直接让 `Audit Dependencies` 变红，属预期机制而非事故。附带裁定（同轮验收追认）：`audit-gate` 测试中 `expect(entries.length).toBeGreaterThan(0)` → `expect(Array.isArray(entries))` 属**验收标准自身冲突的最小解**，逐条校验循环保留、断言强度对非空条目不减，口径接受（详见 #244 验收评论）。

## D-020 「Milestone 收尾」的可判定定义 = `open_issues` 归零 + Planner 显式关闭（**Planner 自主裁定**，把 #192 已执行的口径成文）

- **日期：** 2026-10-19（第 90 轮）
- **问题：** D-012 第 2 档规定 minor「随 Milestone 收尾合并」，但**「收尾」从未有可判定定义**：PLAN §三 又称 M3 是"无『做完即停』终线"的开放循环，而 milestone `due_on=2026-11-14` 是否算收尾无人说明。第 89 轮因此把 PR #239 处理成「待里程碑真实收口或用户指令」——结果是 **v1.3.0 自 2026-10-15T14:24Z 起无限期挂起**（`v1.2.2..HEAD` 已 51 个提交、含 2 个 `feat:`，均未进 tag）。这是否必须交用户裁决发版时机？
- **决定：** **不需要问用户** —— 同一问题早已被 **#192 的实践回答**，本轮只是把它成文（DECISIONS 头部规则：禁止重复询问已解决的问题）：
    1. **收尾 := 该 Milestone 的 `open_issues` 归零，并由 Planner 显式置 `state=closed`**。`due_on` 只是展示值，**不构成触发**。实证：M2（milestone #1）`due_on=2026-10-24`，实际在 **2026-10-03** 就关闭并发出 `v1.2.0`（`git log -1 v1.2.0` = 2026-10-03T19:40+08:00）——日历既非充分也非必要条件。
    2. 收尾点上的 minor Release PR 合并**由 Agent 自主执行、不请示**：#192 正文原话「`minor` 随 Milestone 收尾合并——现在正是该时机；**Agent 自主执行、不请示**（锚定规则第 7 条 / D-002 免 review）」，本决策沿用同一授权（D-002 + D-012），**不改** D-012 第 3 档 major 一律停等人类。
    3. 为使第 1 条在 M3 **可达**：**常驻观察单不得占据 Milestone 的 `open` 计数**——#197 按用户已确认的默认 C 无限期保持 `needs-info`（等发版频率信号），留在 M3 会让 `open_issues` 永不归零。故本轮把 **#197 迁出 M3**（`milestone=null`，Issue 本体与 PLAN §2.3 继续承担跟踪职责），M3 由 `open=2` 降为 **`open=1`（仅 #249）**。
    4. 据此新建 **#251**（P3・`backlog`・**前置未满足勿领**：需 #249 由 Planner 验收关闭 + M3 `open=0`；本轮只登记，触发后改写首行为 `ready`）：合并 #239 → 四方核验 → 祖先判定 → 按 #192 判例预期不部署。
- **理由：** ① 关闭 milestone / 迁单 / 按既有节奏合 rp PR 全属 §6.1「可自行决定」列且**完全可逆**（不合即回到现状，版本线不受损），且发版动作早由 **D-002 + D-012** 授权，非新的外部承诺；② 真正的缺口是**判据没成文**，不是**用户没决定**——把一个工程定义问题伪装成用户决策项，只会得到虚假的进展感并让积压继续；③ #192 的口径在本仓已连续两轮（v1.2.0 / v1.2.1）无争议执行，属既有实践而非新政策。
- **附带纠正（测量纪律，第 89 轮记录失实一处）：** REST milestone 的真实键是 **`due_on`**；第 89 轮 `gh api …/milestones/2 --jq '.due_date'` 读的是**不存在的键**，jq 对缺失输入渲染成 `null`，据此写下「milestone API 实测 `due_date=null`——PLAN『due 2026-11-14』系规划锚点而非 API 实值」。**该结论错误**：REST（`due_on`）与 GraphQL（`dueOn`）双源一致为 `2026-11-14T00:00:00Z`。新纪律：**断言任何 API 字段为空/不存在之前，必须先列出响应真实键名**（`--jq 'keys'` 或原始 JSON）；jq 渲染出的 `null` 不能作为"字段无值"的证据。M2 的 `due_on=2026-10-24` 同时佐证该键在本仓数据里确有值。
- **影响范围：** PLAN 文件头判定、§2.2 触发器、§2.3 阻塞表（#239 行由"无限期挂起"改为"有明确触发路径"）、§三 下一阶段（M4 是否创建改由收口点决定）；#197 的 milestone 归属；#251 全部验收标准；未来任何 Milestone 收尾与 minor 发版判定；`§4.2 门禁`对"依赖满足"的判定口径。
- **重新评估触发：** ① 用户明确表示"稳态期不要发 minor"或"要按固定日历发版"⇒ 覆盖本决策第 2 条并回到 D-012 重新评估触发 ①；② 若 M3 收口后仍有新排期项 ⇒ Planner 决定是否开 M4（本决策不预设 M4 内容）；③ 若再出现常驻单使某 Milestone 的 `open` 永不归零 ⇒ 按第 3 条同样迁出，不得为此放宽 D-012。

## D-021 安全公告插队规则：有补丁即升级、不豁免（**Planner 自主裁定**）

- **日期：** 2026-10-21（第 99 轮，同日加跑）
- **问题：** 2026-10-20T18:30–19:52Z（UTC）两轮之间连发 3 条 `launch-editor`/`vite` 公告（1 high + 2 medium），`pnpm quality:audit` 在**无任何代码变更**的情况下由绿转红（6 条未覆盖 = 3 GHSA × 2 个 vite 版本）。是否应等用户、是否可按「Windows-only / devDependency / 不触达运行时」加豁免、是否可拖到下一轮？
- **决定：**
    1. 视为**项目阻塞（P0）**：`audit` job 无路径过滤，任何 push（含每轮 `.agent` 提交）都会红；Planner 当日建单，Executor 下一轮**优先修复**，不得先做其他交付。
    2. **凡上游已有补丁版本，一律升级依赖，不新增 audit 豁免**；公告的平台作用域（Windows-only）、依赖类型（devDependency / 构建期）与可达性（`launch-editor` 仅在 dev server）**均不构成豁免理由**。这与 #205（升级 4 条公告依赖恢复绿）与 #244（豁免清零）的既有实践一致。
    3. 升级范围限定在上游已声明的 semver 兼容区间内（本次 vite 8.x patch）；此类抬版**不触发 D-015 的 majors 暂缓**，也不需要用户裁决。跨 major 才回到 D-015 / 契约 §1.10。
    4. 若上游确无补丁 ⇒ 回到 D-011（带到期日的显式豁免）与 D-018（续期上限），本条不适用。
- **理由：** 零豁免是 #244 后刻意选择的目标状态；公告可在两轮之间随时出现，上一轮「告警 0 / CI 全绿」不能代表当前状态；本次 Dependabot 安全更新还以 `security_update_not_possible` 失败（未开 PR），证明自动化不可依赖。
- **影响范围：** `audit` 门禁日常维护、依赖升级优先级（高于 bot metrics PR / 文档类工作）、PLAN 队列排序；不改动 D-011/D-018 的豁免机制（仅在「有补丁」分支不适用）。
- **重新评估触发：** ① 上游无补丁（改走 D-011/D-018）；② 公告被撤回或修订为不影响本仓解析版本；③ 用户要求安全升级也逐次请示（覆盖第 3 条）。

## D-022 搜索索引保留 SSR/nonce，采用真实路由与 SSR HTML（**Planner 工程裁定**）

- **日期：** 2026-10-23（第105轮）
- **问题：** 全站 SSR 下内置 Pagefind 仅扫描静态 HTML；#266 已证明真实 MDX SSR 正文可输入 addHTMLFile，但 fallback 外壳语言与正文不一致，200 MDX 重定向壳也有正文 marker。如何恢复既有搜索而不改变安全架构？
- **决定：** 采用已安装 Starlight 实际 routes → 构建完成后的本地 Wrangler SSR HTML → 已安装 Pagefind `addHTMLFile` → 当次 client/pagefind；保持 output:server、prerender:false、每请求 nonce 与内置 pagefind:false，避免两个索引 writer。构建脚本复用现有 build/deploy 调用链，不改 CI 编排、不加服务/依赖/凭据。
- **收录约束：** 排除生产 draft:true、pagefind:false、404、isFallback、HTTP3xx 与真实 HTML 导航重定向壳；中文默认正文保留一次，不进入英文 fallback 索引。sidebar.hidden 不是排除条件，正文展示的代码示例也不应被误判为实际重定向。URL 与 locale 来自真实路由，不自行翻译 slug。
- **完整性交付：** API errors、非预期响应或覆盖缺失使 build 非零，不复用旧 bundle；清除临时清单/HTML采样与子进程，不发布内部清单或运行时 handler。生产验收必须含双语正文命中/正确URL、负例、快捷键/SPA、预算与 nonce；按钮存在、资源200或调查go均不等于修复完成。
- **证据与边界：** #266 报告6365784475及更正6365887000，Planner验收6367792880；本轮实际SSR中文labs/英文join正文交addHTMLFile，errors=[]、URL/nonce一致。185路由/18fallback、166响应含24壳→142候选是历史观察，不硬编码数量，不冒称142条查询或生产恢复。
- **为何自主决定：** 只修既有搜索缺陷、复用已安装工具和内容，不引入产品/框架/认证/权限/成本取舍；D-017不启动新功能、D-001本地部署均不变。#268仅修既有英文内容入口，忠实依据中文记录，不由此启动全站翻译。
- **影响范围：** #262的构建期integration/脚本与必要搜索消费者、真实行为回归、双语README能力事实；具体任务AC归Issue，不在本文件复制实现步骤。
- **重新评估触发：** 已安装路由/API契约变化导致不可实施，或必须突破SSR/nonce、预算、CI、服务/成本边界时，停止扩围并带具体证据交Planner；涉及红线再向用户提问，不授权隐藏/删除搜索。

### 第109轮验收澄清（2026-10-24，原决定不变）

- “实际 routes”指已安装 Starlight 导出的真实路由及 `locale` / `entryMeta` / `isFallback`，不等于 `getCollection` 后按中文同名 slug 手写配对。英文真实正文即使没有同名中文文件，也不是 fallback。本轮只读分类器实跑误排 `control-fundamentals`，而生产该页200且有真实英文正文；整改归 #281。
- 快捷键使 `dialog.open=true` 不等于用户能看见、输入与查询；窄屏原AC不得降为内部状态断言。整改归 #279；#262 保留原九项完整验收责任，父子不重复实现，不因索引样本可用就关闭。
- 这是已确认收录/可用性契约的执行纠偏，不是新产品取舍、不扩大翻译或权限范围，故不新增用户问题，不允许先发 minor 再补原AC。

## 本轮决策核查（第111轮，2026-10-25）

**pending=0；D-001..D-022 全部生效。本轮无需要用户回答的新问题，不重复询问已确认默认项。**

- **跨日核实与验收**：自昨日第109轮（`1024167`）及今日第110轮跨日核实（`36f7331`）以来，Execution Agent 尚未启动新会话，当前 `in-review=0`。第109轮对 #270（done/closed）、PR276（已上线）、PR274（`1.4.0` minor 持合）及 #262（不通过退回 `in-progress`，拆出 #279/#281）的结论全部保持有效；#262 退回距今约 22.4 小时，未达 24 小时无日报更新阈值，不构成疑似中断。
- **今日队列保持 2 个 ready**：`#279`（P1，恢复窄屏搜索可见入口与完整查询交互）→ `#281`（P2，修正搜索清单为真实 Starlight 路由并收录不同名英文正文），父单 `#262`（P2，`in-progress`）保留原九项 AC 整体验收责任。M4 真实成员进度仍为 `5 / 8`（REST 与 GraphQL 成员列表一致为 5 closed / 3 open；REST milestone 汇总仍为 `open=2, closed=5`，不据此缩范围或提前关 M4）。
- **常态顺手项 PR #282**：今日定时任务如期生成 `chore(metrics): update project progress snapshot`（head `5216fc82`，`src/data/metrics/project-progress.json` +51/-51）。只读核验 63 键路径 schema 完全一致（数组容器长度与根结构相等），判定为常态顺手项，待 Executor 按既有规则（update-branch 触发 checks 绿后合入 + 部署时随验双语看板）顺手处置，不占 ready 队列名额。
- **既有默认与阻塞复核**：`actions/secrets` 确认仍仅 `CODECOV_TOKEN` / `PROJECT_TOKEN`，`#101` 维持 `blocked` 与单机 OAuth 默认 B；`#197` 维持 `needs-info` 与默认 C（手工触发 Release PR CI）；`#280` 维持 `blocked`（可选 Projects 的 `PROJECT_TOKEN` 独立凭据域，Projects 非任务 SSOT，不扩权、不改 workflow）；`PR #186/#209` majors 按 D-015 暂缓；Q4 按 D-017 不启动新功能。
- **证据闭环**：`36f7331ecc5d0fd6c27bd314b4d5cd75b150ecd0` 远端 CI 三工作流（Pipeline `40113127406` / Release Please `40113127453` / Secret Scan `40113127408`）与 OpenWiki Update（`40195570871`）全 `completed/success`；`pnpm quality:audit` exit 0（0 豁免）、`supply-chain-watch` exit 0、Dependabot/Secret scanning 告警均 0；`wrangler deployments list` 确认生产仍为 `027692c7-dbb3-4abc-81d8-e5b86c9f33f6`（100%），首页两次独立单请求各 27 个 `<script nonce>` 与同请求 CSP 一致（`wXsjcF_8aJVDESD0JIVXjA` / `cBWJDCMNo5ABR3eYIdp1qA`）且跨请求不同；`/_search-manifest.json` → 404、`/pagefind/pagefind.js` → 200。无代码/测试修改，无新部署。

## 本轮决策核查（第110轮，2026-10-25）

**pending=0；D-001..D-022 全部生效。本轮无需要用户回答的新问题，不重复询问已确认默认项。**

- **跨日现场与验收**：自昨日第109轮（`1024167`，2026-10-24T15:33Z）完成第108轮产出验收后，Execution Agent 尚未开启新会话，当前 `in-review=0`。第109轮对 #270（done/closed）、PR276（已上线）、PR274（`1.4.0` minor 持合）及 #262（不通过退回 `in-progress`，拆出 #279/#281）的结论全部保持有效；#262 退回仅约 1.2 小时，不构成 24 小时疑似中断。
- **今日队列保持 2 个 ready**：`#279`（P1，恢复窄屏搜索可见入口与完整查询交互）→ `#281`（P2，修正搜索清单为真实 Starlight 路由并收录不同名英文正文），父单 `#262`（P2，`in-progress`）保留原九项 AC 整体验收责任。M4 真实成员进度仍为 `5 / 8`（REST 与 GraphQL 成员列表一致为 5 closed / 3 open；REST milestone 汇总仍为 `open=2, closed=5`，不据此缩范围或提前关 M4）。
- **既有默认与阻塞复核**：本轮重查 `actions/secrets`（首跑瞬时 `EOF`，重跑确认仍仅 `CODECOV_TOKEN` / `PROJECT_TOKEN`），`#101` 维持 `blocked` 与单机 OAuth 默认 B；`#197` 维持 `needs-info` 与默认 C（手工触发 Release PR CI）；`#280` 维持 `blocked`（可选 Projects 的 `PROJECT_TOKEN` 独立凭据域，Projects 非任务 SSOT，不扩权、不改 workflow）；`PR #186/#209` majors 按 D-015 暂缓；Q4 按 D-017 不启动新功能。
- **证据闭环**：补验第109轮未等待的 `1024167c150b628b165ba47a96ddafeddecd85ee` 远端 CI，Pipeline `40107528344` / Release Please `40107528322` / Secret Scan `40107528321` 全部 `completed/success`；本轮 `pnpm quality:audit` exit 0（0 豁免）、`supply-chain-watch` exit 0、Dependabot/Secret scanning 告警均 0；strip 本地 proxy 后 `wrangler deployments list` 确认生产仍为 `027692c7`（100%），首页两次单请求各 27 个 `<script nonce>` 与同请求 CSP 一致且跨请求不同（`I1SggrbOB8ogfVFXUH_pdw` / `GoMabhgcrtwvm-wWA6lvzg`）。无代码/测试修改，无新部署。

## 本轮决策核查（第109轮，2026-10-24）

**pending=0；D-001..D-022继续生效。无需要用户立即拍板的事项；下方第105/107轮及“未决”日期小节均为历史核查，不覆盖本轮事实。**

- **验收**：#270通过并关闭（6386000882）；#262不通过且报告部分勾选失实（6386001757），review→in-progress，原AC3窄屏及真实routes/英文收录未完成。认可桌面双语查询与nonce/当前部署证据，不将全部报告判为虚构；要求追加更正，不改旧日报。
- **今日ready=2**：#279（P1，窄屏可见检索）→#281（P2，真实路由/英文收录），无硬依赖，父单262保留全部原AC。M4真实5/8且OPEN，不是日报建议的6/6收口；REST/GraphQL成员一致，REST汇总2/5仍漏一个open，不据此缩范围。
- **发版**：PR274实际已重算1.4.0 minor，第108轮按§11.1持合正确；原第107轮1.3.2 patch指令过时。按D-020等全部验收与显式关闭M4后再合，不新增发版取舍。
- **可选Projects**：#280为P3/blocked、无milestone。源码使用PROJECT_TOKEN，而#197的release链使用RELEASE_PLEASE_TOKEN或GITHUB_TOKEN；不合并不同凭据域。10-22日报已有同路径失败，“首次执行”原调查结论不成立；本机gh缺scope不能证明Actions令牌权限。沿WORKFLOW§4既有Projects非任务SSOT事实暂缓，不补凭据、不改权限、不以禁用job掩盖错误，不制造重复调查来凑队列。
- **既有默认**：#101仍缺CLOUDFLARE_API_TOKEN，单机OAuth默认B；#197默认C手工触发；PR186/209 majors暂缓；D-017不启动新功能。无需重复提问，不将常驻单计入M4。
- **证据边界**：本轮原生Chromium生产双语查询/点击、中文高亮/负例、看板与两请求nonce、真实英文误排对照已实跑；PR/完整SHA CI与部署只读核验。现有15条分类器单测全绿不能证明未覆盖的英文不同名slug边界正确。browser helper包装Worker、探针初始化时序与badge解析器失败均保留，不把它们冒称产品通过；无生产代码/测试/验证脚本或部署。
- **接力所有权**：PLAN/TASKS整体刷新；按仓库强制回写规则仅追加STATE/HANDOFF接力补记与WORKFLOW§7.4，不覆盖Executor现场，ENV/DIARY只读；下一棒自行刷新旧“搜索恢复/无进行中/待6项收口”口径。

## 本轮决策核查（第105轮，2026-10-23）

**pending=0；D-001..D-022生效。本轮无需要用户回答的新问题，不重复询问既有默认。**

- **验收先行**：#266/#264已独立验收关闭；#263仅部分通过，未合入PR271，不能凭PR绿、总大小或旧哈希说已完成。原停止报告属实，验收差距明确留Issue，不替Executor实现。
- **#263工程阻碍已排清**：恢复ready，先同基main受控A/A、A/B保存原始产物，仅精确归一确证的唯一manifest.key；其余差异必须保留原始证据并blocked。不得改ASTRO_KEY/SESSION或广泛忽略manifest，不补造旧字节。这是单内验证前置澄清，不放宽零真实业务变化，不需产品决策。
- **#262准入**：#266更正后的go已核准，按D-022及Issue完整AC恢复现有搜索，保持SSR/nonce，不以调查或索引文件存在替代生产查询。fallback去重是明确工程策略，不再留给Executor凭空决定。
- **两条发现已分诊**：#268恢复既有英文season-notes正文与稳定URL（P2）；#270只修中文例图为现有WebP（P3）。均具范围/非目标/无依赖/可测AC，纳入M4，未扩展新功能。
- **M4事实计数2/6**：GraphQL与REST成员列表一致，两done/四open；REST汇总仍open=1/closed=0不一致，显式保留差异、不据此关闭Milestone。#101/#197不占M4。
- **既有默认不变**：#101本轮Secrets仍仅CODECOV_TOKEN/PROJECT_TOKEN，blocked，单机OAuth默认B；移除并列backlog状态但不改部署策略。#197维持已确认默认C手工触发，needs-info观察项不自动转ready；majors暂缓，Q4不启动新功能。
- **证据边界**：PR267部署Version6c003201与本轮首页/双语看板只读核验一致，不含PR271，搜索仍未修复。首次metrics严格类型探针发现dueDate:null后，核对采集器既有nullable契约；键路径64/64一致，不伪称首次全绿。未重跑整套生产门禁、未重新部署。
- **权限与交接**：PLAN/TASKS为本轮快照；按仓库强制接力要求仅追加STATE/HANDOFF补记，不覆盖Executor旧现场，ENV/DIARY不改。全部任务沟通走Issue评论；不写代码、测试或验证脚本，不自行合入PR271。

## 本轮决策核查（第107轮，2026-10-24）

**pending=0；D-001..D-022 生效。本轮无需要用户回答的新问题，不重复询问既有默认。**

- **第106轮三项交付验收关闭**：#272（审计门禁修复，D-021 处置，验收 6383838267）、#263（PR271 受控验证后合入 c2933cd，验收 6383840571）、#268（英文 season-notes 恢复并上线，验收 6383842437）。M4 实际 4/6，REST 汇总计数仍失真，不据此收口。
- **#263 两处执行层扩展均予采纳（单内验收裁定，不升格长期决策）**：① 归一化口径从"仅 manifest.key"扩为"A/A 证实的两类自然波动"（key + assets 数组顺序）——字面口径在本工具链对 A/A 自身即不成立，以 A/A 为基线证明"无自然波动之外的新差异"正是第105轮前置的本意，且原始产物/哈希/比较器全部留存；② D-002"CI 全绿"字母不满足系 #272 当日新公告所致、与本 PR 零锁文件 diff 且本地复现，PR273 修复后最终 checks 绿。两处均如实上报，不判报告失实。
- **#262 中断现场处置**：第106轮 10:48 领取后会话中断约 9 小时，工作区未提交 WIP（分支 agent/issue-262-search-index@65ae62f）原样保留——是 Executor 现场，Planner 不触碰、不重置、不代报告；下一棒先建 2026-10-24 日报补全天记录（追加式），再恢复实施。24 小时无日报更新才触发"疑似中断"标记，当前未到。
- **常态顺带项授权**：PR #274（release 1.3.2，patch 档）按 §11.1 CI 绿后合入 + §11.2 四方核验；PR #276（bot metrics）schema 契约核查后合入；两者合并后一次 deploy:worker + 线上 nonce 验收。
- **既有默认不变**：#101 blocked（Secrets 仍仅 CODECOV_TOKEN/PROJECT_TOKEN，单机 OAuth 默认 B）；#197 needs-info（默认 C 手工触发）；majors PR186/209 暂缓（D-015）；Q4 不启动新功能（D-017）。
- **证据边界**：本轮只读验证（git show、CI/checks/milestone 读取、生产 curl 首页 nonce 头体一致与 season-notes 内容/refresh=0、inbound 巡检无新工作），未跑全套门禁——接受 main@65ae62f Pipeline success 为门禁证据。未写代码/测试/验证脚本，无新部署（生产沿用 Version 596a1212，搜索未修复）。

## 未决（第 102 轮刷新，2026-10-22T11:33Z）

**第 102 轮：pending 仍为零（D-001..D-021 全部生效），本轮未向用户提出任何问题。**

- **新事实与 P0 插队**：npm/OSV 于 2026-10-22 发布 2 条 `@vitest/mocker` / `vitest` 中危安全公告（`GHSA-qxg6-89mg-rqv8`、`GHSA-xp26-3454-mjgp`），`pnpm quality:audit` 实测 **exit 1**。按 **D-021** 新建 **#260（P0 · ready）** 并排在今日队列首位。上游已发布 `vitest@4.1.12` / `@vitest/coverage-v8@4.1.12` / `@vitest/mocker@4.1.12`，属 semver 兼容的 4.x patch 升级，不触发 D-015，保持零豁免策略，在 §6.1 自主授权范围内，不需用户裁决。
- **#258（P2 · ready）前置依赖更新**：Release PR #257（`v1.3.1`，patch）收尾任务保持 ready，但明确前置依赖为 #260 合入主干恢复 audit 全绿后再行合并（避免带漏洞发版及 main push 潜伏红；合并 #260 后 release-please 将自动追加其 fix 至 PR #257）。
- **顺手项在位**：bot metrics PR **#259** 于 2026-10-22T04:43Z 如期生成（diff 仅 `project-progress.json` 42+/42- 纯值漂移），待 Executor 在 #260 / #258 之后按常态指令处置，不提前合入。
- **验收队列**：昨日/历史 in-review 任务为零（#254 已于第 101 轮规划验收关闭并打 `status:done`；此后 Executor 尚未开工）。
- **人类侧事项不变**：**#101** 复核 Actions Secrets 仍仅 `CODECOV_TOKEN` / `PROJECT_TOKEN` ⇒ `blocked` 有效，本地 OAuth 部署可用；**#197** 维持 needs-info 默认 C（用户 2026-10-12 已确认）。
- **M4 仍不创建**：单点依赖安全热修不构成需要系统排期的新工作束（D-020 第 3 条）。

## 未决（第 101 轮刷新，2026-10-21T15:06Z）

**第 101 轮：pending 仍为零（D-001..D-021 全部生效），本轮未向用户提出任何问题。**

- **#254 验收通过并关闭**：11 项标准逐条亲跑，报告失实 0 处；`pnpm quality:audit` exit 0（零豁免）、vite 单一 `8.3.5`、双 SHA CI 三连 success、dependabot 告警 0、Version `ac0be9c8` 上线且单请求 nonce 一致；已打 `status:done` 并关闭（`closedAt=2026-10-21T15:06:28Z`）。
- **#258 建单（P2 · ready）**：Release PR #257（`v1.3.1`，patch）收尾。属 `WORKFLOW §11.1` 第 1 档 + D-012 授权范围，**无需用户裁决**；同日不重复发同一档的约束已满足（v1.3.0 于 2026-10-20 UTC 发布）。
- **#257 PR checks 为空**：再次实证 #197 所述 GITHUB_TOKEN 链式抑制；处置限定在既有手工触发手法内（空提交 / 重跑 release-please / update-branch），不得手工改版本号或 rebase。
- **#197 保留跟踪（不关闭）**：用户 2026-10-12 已确认默认 C（维持手工触发）；本轮 #257 再次实证其成本。未按「连续两个 Milestone 未动」关闭的理由：该单已获用户答复且具备明确信号触发条件（发版频率/PR checks 空），属常驻观察项而非饥饿任务；如后续手动触发成本显著上升，再提交用户重评。
- **#101 复核**：Actions Secrets 仍仅 `CODECOV_TOKEN` / `PROJECT_TOKEN` ⇒ `blocked` 有效，本地 OAuth 部署不阻塞交付。
- **M4 仍不创建**：稳态期无待排期工作束（D-020 第 3 条）。
- **顺手项**：当前无开放 bot metrics PR；下一张预计 2026-10-22T04:4xZ 前后生成，按常态指令处置、不建单。

## 未决（第 100 轮刷新，2026-10-21T11:45Z）

**第 100 轮：pending 仍为零（D-001..D-021 全部生效），本轮未向用户提出任何问题。**

- **P0 任务维持**：#254（升级 vite 至 ≥8.3.3，零豁免恢复 audit 绿）处于 `ready`，为今日唯一执行任务；HEAD `afde255` CI run 39515308926 failure（Audit 唯一失败）实证 main 处于红灯，待 Executor 修复。
- **顺手项在位**：bot metrics PR **#255** 于 2026-10-21T04:44Z 如期生成（`project-progress.json` 43+/43-），待 Executor 在 #254 合入后再行处置（勿提前合入染红）。
- **验收队列空**：#251 保持 `CLOSED/COMPLETED` + `status:done`；M3 `closed`；`v1.3.0` 仍 Latest。
- **M4 仍不创建**：单点热修不构成需要排期的工作束。
- **人类侧事项不变**：**#101** 复核 `actions/secrets` 仍仅 `CODECOV_TOKEN` / `PROJECT_TOKEN` ⇒ `blocked` 有效；**#197** 维持 needs-info 默认 C。

## 未决（第 99 轮刷新，2026-10-20T23:40Z）

**第 99 轮：pending 仍为零（D-001..D-021 全部生效），本轮未向用户提出任何问题。**

- **新事实**：3 条 vite 公告（18:30–19:52Z）在无代码变更下使 audit 门禁变红。按 **D-021** 建 **#254**（P0）并放入今日队列——属 8.x patch 抬版（低风险、可回滚、非 major），在 §6.1「可自行决定」范围内，不需用户裁决。
- **验收队列空**：#251 保持 `CLOSED/COMPLETED` + `status:done`；M3 `closed`；`v1.3.0` 仍 Latest。
- **M4 仍不创建**：单点热修不构成需要排期的工作束。
- **人类侧事项不变**：**#101** 第 99 轮复核 `actions/secrets` 仍仅 `CODECOV_TOKEN` / `PROJECT_TOKEN` ⇒ `blocked` 有效；**#197** 维持 needs-info 默认 C。
- **下一事件**：bot metrics PR 预期 `2026-10-21T04:3xZ` 再生；若与 #254 同日出现，先修 #254。

## 未决（第 98 轮刷新，2026-10-20T17:00Z）

**第 98 轮：pending 仍为零（D-001..D-020 全部生效），本轮未向用户提出任何问题。** 依据 §6.1「查得到的不问」：本轮仅做稳态复核、队列空置与流程补记，无新的产品/架构取舍。

- **无新执行轮次**：第 97 轮关闭 #251 后无待验收产出；#251 保持 `CLOSED/COMPLETED` + `status:done`，M3 保持 `closed`，`v1.3.0` 仍为 Latest（`draft=false` / `prerelease=false`）。
- **稳态全绿**：HEAD `39231f3…` 完整 SHA CI 三连 success；线上 `/` 200 + 单请求 CSP nonce 一致；看板快照 `2026/10/20 04:49:14`；dependabot / secret-scanning 开放告警均 0；唯一 CI failure 属暂缓 majors PR 分支（D-015）。
- **今日执行队列 = 0**：无新工作束，M4 继续不创建；下一预期事件为 `2026-10-21T04:3xZ`（UTC）bot metrics PR 再生。
- **人类侧事项不变**：**#101** 第 98 轮复核 `actions/secrets` 仍仅 `CODECOV_TOKEN` / `PROJECT_TOKEN` ⇒ `blocked` 有效；**#197** 维持 needs-info 默认 C。
- **流程补记**：第 97 轮漏记 `docs/WORKFLOW.md §7.4`，本轮补记；`STATE.md` / `HANDOFF.md` 待下一轮 Executor 刷新。

## 未决（第 97 轮刷新，2026-10-20）

**第 97 轮：pending 仍为零（D-001..D-020 全部生效），本轮未向用户提出任何问题。** 依据 §6.1「查得到的不问」：发版与收口全流程均在既有决策（D-002 / D-012 / D-020）授权内。

- **#251 独立验收通过并关闭，M3 稳态运营全面闭环**：PR #239（`1.3.0`）已合并，GitHub Release `v1.3.0` 与 tag `v1.3.0` 成功生成；生产 Worker 部署至 Version `35127731-f8db-4910-832a-dac8eb5ee098`，同请求 CSP nonce 与看板双向核验全绿；#251 标记 `status:done` 关闭。
- **顺手项 #253 处置完成**：metrics 数据快照已合入主干 `8d0d75a` 并已部署上线。
- **M4 暂不创建**：当前无待排期需求，避免空 Milestone 占位；常驻单（#197 / #101）按 D-020 第 3 条不计入 Milestone 的 `open` 计数。
- **人类侧事项不变**：**#101**（blocked，需人类配置 `CLOUDFLARE_API_TOKEN`，实测仍缺）；**#197**（needs-info，用户已于 2026-10-12 确认维持默认 C 手工触发）。
- **开放 PR**：仅剩 majors 2 张（#186/#209，按 D-015 暂缓）。

## 未决（第 95 轮刷新，2026-10-19）

**第 95 轮：pending 仍为零（D-001..D-020 全部生效），本轮未向用户提出任何问题。** 依据 §6.1「查得到的不问」：本轮动作全在既有决策授权内。

- **D-020 收口判据首次实际执行成功**：#249 独立验收通过并关闭（schedule run `39227547586` 四条标准全部亲跑取证）⇒ M3 `open_issues` 1→0 ⇒ Planner 于 **2026-10-19T17:24:43Z** 显式置 Milestone #2 `state=closed` ⇒ **#251 正文首行改写为 `ready`**。发版动作（合并 PR #239 + 四方核验）由 Executor 按 #251 执行，Agent 自主、不请示（D-002 / D-012 第 2 档 / D-020）。
- **M4 暂不创建（Planner 裁定）**：当前无需要承接的 ready/backlog 工作；#197（`needs-info`，默认 C）与 #101（`blocked`，待人类 Secret）为常驻/人类侧项，按 D-020 第 3 条不进入 Milestone 的 `open` 计数。待 `v1.3.0` 发版后出现真实工作束，再按其内容开新 Milestone。
- **人类侧事项不变**：**#101** 第 95 轮再次复核 `gh api repos/…/actions/secrets` 仍仅 `CODECOV_TOKEN` / `PROJECT_TOKEN` ⇒ `blocked` 有效；**#197** 维持默认 C（维持手工触发），等发版频率信号。
- **PR #239**：不再是挂起项。合并条件（M3 `open=0` + Planner 显式关闭）已满足；由 #251 承接，**勿绕过 #251 直接合并**。

## 未决（历史：第 93 轮刷新，2026-10-19）

**第 93 轮：pending 仍为零（D-001..D-020 全部生效），且本轮未向用户提出任何问题。** 依据 §6.1「查得到的不问」：稳态推进中无新的产品/架构红线取舍。

- **#249（duration-budget 定时首轮复核）已成功排障**：GitHub Actions 定时 run `39227547586`（`event=schedule`）已于 `2026-10-19T09:06:16Z` 调度并 exit 0 成功完成，外部阻塞已消除；Planner 已移去 `blocked` 标签并置回 `ready`，放入今日执行队列。
- **M3 收口与 `v1.3.0` 发版路径明晰（D-020）**：#249 完成并经 Planner 验收关闭后，M3 `open_issues` 将归零；届时由 Planner 显式关闭 M3 并解除 #251 前置（转 `ready`），自主合并 Release PR #239，全程无需打扰用户。

（历史回顾：）
**第 90 轮：pending 仍为零（D-001..D-020 全部生效）。** 以 D-020 将「Milestone 收尾」判据化，解挂 PR #239，新建 #251 承接发版动作。
（历史：）无 pending 决策（D-001..**D-019** 全部生效）。**第 87 轮未向用户提出任何新问题**：第 86 轮后无待验收项；新捕获 bot metrics PR #250 属常态处置；**braces 提问路径已彻底关闭**（#244 验收通过 ⇒ D-019 条件兑现 ⇒ D-018 的 `2026-10-31` 硬墙作废，本文件原列的 ⏰ 事项**不再存在**）。2026-10-12 用户对四个待决策项明确回复"全部默认"：#101 维持单机部署（B）、#197 维持手工触发（C）、majors 继续暂缓、Q4 维持稳态（A）——均为现状确认，无事项变化。仍开放的**人类侧事项**（非产品取舍，Agent 不可自解）：

- **#101**（`blocked`）：需人类在 Actions Secrets 配 `CLOUDFLARE_API_TOKEN`（第 60、64、66、67、70、78 轮六度 + 第 79 轮七度 + 第 82 轮八度 + 第 83/84 轮沿用 + 第 86 轮复核 + 第 87/89 轮再次 + **第 90 轮**`gh api repos/…/actions/secrets` 复核均仅 `CODECOV_TOKEN` / `PROJECT_TOKEN`；⚠️ 口径坑：`gh api actions/secrets` 不带 repo 路径会 **404**，须用 `gh api repos/<owner>/<repo>/actions/secrets`）。
- **#197**（`needs-info`，P3）：是否配 PAT/App 令牌自动化 release-please 的 PR 级 CI——属 §1.8 红线相邻（CI 改造）+ 需人类 Secret，**默认 C（不改）**，等发版频率信号成熟再评。空提交触发法已三次实证有效，手工手法目前够用，维持默认 C。
- ~~⏰ **braces 豁免到期**~~ → **已消解（第 84 轮）**：`.config/audit-allowlist.json` `entries: []`，门禁零豁免全绿，无到期日、无待问取舍。
- 📌 **PR #239（rp `release 1.3.0`，minor）**：按 **D-012 第 2 档**「minor 随 Milestone 收尾合并」**保持 open**，M3 due `2026-11-14`。非用户决策项，但需在下几轮持续防止误合。**→ 第 90 轮更新（D-020）：不再是无限期挂起。** 「收尾」已定义为 **Milestone `open_issues` 归零 + Planner 显式关闭**（`due_on` 不构成触发）；本轮已把常驻单 #197 迁出 M3 使判据可达（M3 `open=1`，仅 #249），并新建 **#251** 承接合并与四方核验（前置 = #249 验收关闭 ⇒ `open=0`，触发后 Planner 才改写为 `ready`）。**在 #251 转 ready 之前仍勿合 #239。**
- **#197 第 90 轮处置补记**：已按 **D-020 第 3 条**从 M3 迁出（`milestone=null`，实测 M3 `open` 由 2→1）。**状态不变**（仍 `needs-info` / 默认 C / P3），跟踪由本文件 + PLAN §2.3 + Issue 本体承担；迁出仅为让「Milestone 收尾」判据（D-020 第 1 条）在 M3 可达，不是放弃该议题。
