# PLAN — 项目路线图（Planning Agent 唯一写入点）

> **本文件回答：** 项目现在处于哪个阶段 / 当前 Milestone 要做什么、为什么 / 什么算完成 / 现在有哪些任务、哪些完成、哪些阻塞 / 下一阶段是什么 / 哪些方向已明确放弃。
> **纪律：** 只写**已核实的事实**与**真实方向**。「未来可能做」不得写成「当前正在做」；旧计划写过的目标不因被写过就仍是事实。**不为填队列制造任务。**
> **配套文件：** 长期约束读 `.agent/DECISIONS.md`（D-001..D-018，权威定义）；机器现状读 `.agent/STATE.md`；接力上下文读 `.agent/HANDOFF.md`。
> ⏱ 所有 `.agent` 时间字段一律 `date -u` 的 **UTC**（exec 第 37 轮纠正，勿混用本地时区）。

**最后核实：** 2026-10-16T11:50Z（`date -u`）｜**核实基线：** `main@c2e2f71`（与 origin 同步，`origin/main` 无新提交；主干 CI：run `38759566750` @ `747f059` **completed success**）｜**核实人：** Planning Agent 第 81 轮（输入 = `.agent/DIARY/2026-10-15.md` 日报 + STATE + HANDOFF + Issue 真实状态；`gh` token 实测有效，网络对 `api.github.com` 有间歇 TLS/EOF 抖动，全部调用带重试）

> **第 81 轮判定：** ① **验收 #228 / #229 双通过并关闭**——未采信报告文字，逐条独立取证：#228 用 `gh pr checks 236` 实测 `Quality Gate` = SUCCESS 且 `Report flaky candidate` = SKIPPED、`gh api issues/237` 实证该单由 `github-actions[bot]` 真实开出并带 `flaky`、直读 `stale.yml` 确认 `exempt-issue-labels` 含 `flaky`；#229 由 Planner **亲跑** `--dry-run`（exit 0 · P95 299s<360s 未超标）**与** env 降阈值复跑（`GATE=100/E2E=10` → 两指标均「超标」），双向证据独立复现，另亲解析 YAML（cron `23 3 * * 1` + `workflow_dispatch` + `issues: write`）。**两单报告均无失实**。附带澄清一处易误判点：`29b33ad`（#228 合并提交）上的 main run `38751057762` 实测 **cancelled**，执行报告对此**未写结论**；STATE/HANDOFF 已如实披露"被并发取消属正常"，且 `29b33ad` 是 `38c1d5e` 的祖先、后者 run `38751168233` = success，主干绿成立，故判为**报告 incomplete 而非失实**，已在验收评论中要求下一棒直接写明终态。② **#229 遗留风险不空挂 → 新建 #242（ready・P3）**：Executor 自陈「开单路径未在真实 CI 触发过」，验收又发现 `check-duration-budget.mjs:178` 把 null 渲染成 `-s`（实测基线 `grep -c '| -s |'` = **6**）；两项合并为一次真实复核（含 `workflow_dispatch` 阈值输入、超标开单、去重追加），须赶在 2026-10-19T03:23Z 定时首轮之前完成。③ **#199 由 `blocked` 转 `ready` 并提前一天放行**：实测失效时刻是 `2026-10-17T23:59:59Z`（`audit-gate.mjs:63` 取 `expires T23:59:59Z`，本地 10-18 07:59:59），而 audit 是 `build` 前置 job；今天做完可让门禁全程保持绿色、不产生无谓红日。核对义务已履行（`npm view braces dist-tags.latest` = **`3.0.3`** 第十次实测，`time.modified` = `2024-09-18`；`pnpm quality:audit` 亲跑 **exit 0** 并输出 `expires 2026-10-17 (1d)` + 3 天内到期提醒）。续期属 D-011 已授权框架内的机制性决策（DECISIONS 明文"无需再问用户"）⇒ **本轮不提问**。④ **新增 D-018**：本次为 Agent **最后一次自主续期**，10-31 仍无补丁则停手转 `needs-info` 交用户裁决——防止「每 14 天自主续一次」把 D-011 有意的红门提醒磨成事实上的永久豁免。⑤ **队列治理**：#197 维持 `needs-info`（默认 C，用户 10-12 已确认）——它是**信号触发型**backlog（等发版频率上升），非 4.1 长期饥饿项，故不关闭；#101 维持 `blocked`（第八度 `gh api actions/secrets` 复核仍仅 `CODECOV_TOKEN`/`PROJECT_TOKEN`）；#186/#209 majors 按 D-015 暂缓不变；无 `auto-discovered`。⑥ **登记 PR #239（`chore(main): release 1.3.0`）为 D-012 挂起项**：`feat:` 累积使 rp 抬到 **minor**，按 D-012 第 2 档「minor 随 Milestone 收尾合并」⇒ **保持 open 不合**（M3 due 2026-11-14），已写入 §2.3 防下一棒误合。⑦ **新 bot metrics PR #241**（今 04:30Z 再生）按 §2.2 常态触发器由 Executor 顺手处置，不建单。⑧ **inbound 复核**：`wsyhuat` 首拉 TLS 失败、重试即通；`wsyhuat/main` 仍停在 `f98be0d`（2026-10-02），路径级内容比对证明 `f98be0d` 触及的 7 个文件在 main 内容**完全一致**（已吸收），`d89b87e` 的差异全部是 main 自身 10-02 之后的进展（如 `tests/unit/share.test.ts` main 侧 `d03129f` @10-13 更新）⇒ **无新工作**，与前几轮一致。⑨ **M3 milestone API 实测 `open=2 / closed=11`**（与 10-12 记录一致，无漂移；#228/#229/#227/#230 均未挂 milestone，关闭它们不改计数）。⑩ pending 清零（D-001..D-018 全部生效）；**执行队列 = #199 → #242（2 项）**。⑪ 发现两处 `.agent` 记录与实际不符：STATE「LOCK 本轮收尾删除」但文件仍在（未 git 跟踪，心跳 10-15T05:05Z 过期 ~2 天）——按契约 1.2 先提示用户，**经用户授权后本轮已删除**；ENV §5 称 `blocked`/`needs-info`/`priority:p4` 标签不存在，实测三者**均已在仓库存在**（ENV 属 Executor 所有权，只指出不代改）。

> **第 79 轮判定：** ① **验收 #227 / #230 双通过并关闭**——执行报告齐全，独立取证：`a66bf4b`（单文件 package.json +1 行 smoke 脚本，main 第 56 行存在）/ `f524fad`（CONTRIBUTING §9 五条齐全，4 实例文件在 main 均存在），PR #233/#234 均为 MERGED，main ci-cd @ `a7a830b` 三连 success。② **#228 未到验收点**：仍 in-progress（认领 10-14T11:55Z，未满 24h），PR #236 已开、CI 全绿（18 pass + labeler），无执行报告——不干预现场，留待 Executor 收尾。③ **auto-discovered #237 分诊关闭**：run `38560131664` 头 = `32ea624`（#228 验证机制的临时破坏提交，已 revert），系验证 artifact 非真实抖动；机制本身工作符合预期。④ **#231 pending 第 3 天 → 默认转正**：无用户答复，按 §6.3 默认方案（LHCI 保留 PR 快车道）转正式并关闭。⑤ backlog 零变更：#199（blocked，10-17 到期剩 **2 天**，本轮 `npm view braces` latest 仍 `3.0.3` **九度实测**无补丁）；#197（needs-info/默认 C）；#101（blocked，Actions Secrets 七度 `gh api` 复核仍仅 `CODECOV_TOKEN`/`PROJECT_TOKEN`）；#186/#209 majors 按 D-015 暂缓；M3 milestone API 实测仍 **11 closed / 2 open**。⑥ inbound `wsyhuat/main` 仍为已知两提交（`f98be0d`/`d89b87e`，无新工作）。⑦ pending 清零；**执行队列 = #228 收尾 + #229（唯一 ready）**；无 LOCK。

> **第 78 轮判定：** ① **验收队列空**——`status:review` / `status:in-progress` 双零命中，#227–#230 零评论，Executor 自第 77 轮规划后未运行，无事可验（本仓无 `DIARY/` 目录，昨日输入以 `STATE.md`/`HANDOFF.md` + `git log` + Issue 状态反推）。② **ready 队列复核仍合格**：#227–#230 定级有效（正文首行 `ready` + `status:backlog` + P3，范围/验收标准未变），维持执行队列 = 4，顺序沿用 #227→#230→#228→#229。③ **新 bot metrics PR #232**（今日 04:52Z 再生，单文件 `project-progress.json` 44+/44-，checks 未触发符合 #197 根因）：不单独建单，按 §2.2 触发器由 Executor 顺手处置。④ **backlog 零变更**：#199（blocked，10-17 到期剩 **3 天**，本轮 `npm view braces` latest 仍 `3.0.3` **八度实测**无补丁）；#197（needs-info/默认 C）；#101（blocked，Actions Secrets 六度 `gh api` 复核仍仅 `CODECOV_TOKEN`/`PROJECT_TOKEN`）；#231 pending 第 2 天（默认维持现状，未达 3 天转正）；#186/#209 majors 按 D-015 暂缓；M3 milestone API 实测仍 **11 closed / 2 open**。⑤ inbound `wsyhuat/main` 仍为已知两提交（`f98be0d`/`d89b87e`，无新工作）。⑥ pending 清零（#231 除外）；无 LOCK。

> **第 77 轮判定：** ① **验收队列空**——`status:review` 零命中，无事可验（第 75 轮 #226 系无单常态处置，不适用验收流，轨迹在 PR 评论 + HANDOFF）。② **#225 定级拆分**：阶段三伞单拆为 4 ready（#227 smoke 命令 / #228 flaky 治理 / #229 时长告警 / #230 编写规范，均为 P3，逐个过 4.2 门禁）+ 1 backlog（#231 LHCI 移出 PR，CI 信号取舍需用户定夺，默认维持现状），#225 互链后关闭。③ **backlog 零变更**：#199（blocked，10-17 到期剩 **4 天**）；#197（needs-info/默认 C）；#101（blocked，Secrets 六度复核仍仅 `CODECOV_TOKEN`/`PROJECT_TOKEN`）；#186/#209 majors 按 D-015 暂缓；M3 milestone API 实测仍 **11 closed / 2 open**。④ `flaky` 标签已建（供 #228）；`gh issue create --milestone 2` 报 not found（milestone 经 API #2 实存，CLI 取值口径待查——新单暂不挂 milestone）。⑤ pending 清零；**执行队列 = 4（#227–#230）**；无 LOCK。

> **第 70 轮判定：** ① **验收队列空**——`status:review` 零命中，无事可验。② **Executor 三轮追认**：第 70 轮（#216 合入 `0a29da5` 后中断，遗留过期锁）由第 71 轮接管收尾（确认 #216 CI success run `38150588726` + 处置 #217 合入 `455b109` + run `38240769621` success + 重部署 Version `dacfe595` + CSP/看板页复验）；第 72/73 轮为零交付巡检轮（主干双绿、队列零变更）。③ **backlog 零变更**：#199（blocked，10-17 到期剩 **5 天**，本轮 `npm view braces` latest 仍 `3.0.3` **第七次实测**无补丁）；#197（needs-info/默认 C，无新信号）；#101（blocked，Actions Secrets 五度 `gh api` 复核仍仅 `CODECOV_TOKEN`/`PROJECT_TOKEN`）；#186/#209 majors 按 D-015 暂缓；M3 milestone API 实测仍 **11 closed / 2 open**（一致）。④ **bot metrics PR 链已收敛**：#215/#216/#217 均已处置合入，当前无开放 bot PR；下一个预期明日再生，维持 §2.2 常态处置指令。⑤ 本轮线上只读抽查：`/` 200 + CSP 每请求新 nonce（`nonce-5D0-jIoM…`，与上轮不同值）。⑥ pending 清零；**执行队列 = 0（诚实空置）**；无 LOCK。⑦ **补记 §7.4 缺失的第 68/69 轮两行**（本轮凭 commit/PR/CI 证据补录，标注来源）。⑧ 回应 Executor"降低巡检频率"建议：巡检由用户指令驱动、不自行停跑；记录噪音接受为审计成本，轻量轮次合并为单行记录即可。

> **第 69 轮判定：** ① **验收队列空**——`status:review` 零命中，无事可验。② **Executor 第 68 轮已正常收尾**：PR #215（bot metrics）已 admin-squash 合入 `c7fcecc`，CI 全绿，线上重部署至 Version `8f01f83c`，CSP/看板页复验 PASS；LOCK 已删，STATE/HANDOFF 已更新。③ **backlog 零变更**：#199（blocked，10-17 到期剩 **6 天**，本轮 `npm view braces` latest 仍 `3.0.3` **第五次实测**无补丁）；#197（needs-info/默认 C，无新信号）；#101（blocked，Secrets 状态未变）；#186/#209 majors 按 D-015 暂缓；M3 milestone API 实测仍 **11 closed / 2 open**（一致）。④ **新出现 PR #216**（`chore/update-metrics`，bot 再生，`app/github-actions`）：按 §2.2 触发器 = Executor 顺手处置，PLAN 中指向从 #215 更新为 #216。⑤ 核实基线推进至 `41e5d82`（CI 三连绿 run `38115331355`）。⑥ pending 清零；**执行队列 = 0（诚实空置）**；无 LOCK。

> **第 67 轮判定：** ① **验收队列空**——`status:review` 零命中、`#212` CLOSED 已确认，无事可验（第 66 轮关闭有效，无需复动）。② **backlog 零变更**：#199（blocked，10-17 剩 6 天，本轮 `npm view braces` latest 仍 `3.0.3` 四度实测无补丁，到期按 D-011 显式续期）；#197（needs-info/默认 C，无新信号）；#101（blocked，Actions Secrets 四度 `gh api` 复核仍仅 `CODECOV_TOKEN`/`PROJECT_TOKEN`）；#186/#209 majors 按 D-015 暂缓；M3 milestone API 实测仍 **11 closed / 2 open**（与 PLAN 一致，无漂移）。③ **#215**（bot metrics PR，10-10 05:51Z 生成）仍为单文件数据-only（`project-progress.json` 41+/41-），维持 §2.2 常态处置指令，不单独建单。④ inbound `wsyhuat/main` 仍为已知两提交（`f98be0d` 已吸收、`d89b87e` 系 fork 同步），无新工作；无重复/无 auto-discovered/无长期饥饿。⑤ pending 清零；**执行队列 = 0（诚实空置）**；LOCK 仍在但已过期两轮，Planner 不代删（Executor 所有权，下一棒建锁自然覆盖）。

> **第 66 轮判定：** ① **#212 验收通过并关闭**——6 条标准全部独立取证（本机实跑 `pnpm build` exit 0 / `test:run` 451 passed·42 files / `test:e2e` 102 passed 含两条看板页测试；隔离目录实跑采集器 exit 0 且超集 13 键齐全；数据文件 generatedAt=2026-10-10T04:00:17Z；PR #97 MERGED=`8828f5f` 且合入后 ci-cd `38022819760` success；v1.2.2 四方一致）。② **#212 程序违规记录并修复轨迹**：Executor 第 65 轮自行关单（04:12:48Z，违 D-006）、Issue 内无执行报告（违 §1.6）、标签停留 in-progress、STATE「证据在 Issue 内」表述失实；Planner 已 reopen→标签修正 status:review→贴验收评论→由 Planner 关闭，审计轨迹恢复。③ M3 进度按 milestone API 实测刷新为 **11 closed / 2 open**（open=#199/#197；#101 不在 M3）。④ **新常态项登记：#215**（bot 按日再生的 metrics PR，数据-only，05:51Z 生成）——不单独建单（目标按日漂移），按 PLAN 指令由 Executor 顺手处置。⑤ backlog：#199 braces latest 仍 3.0.3（第 66 轮前瞻，剩 7 天，到期按 D-011 显式续期）；#197 补录空提交触发法第三次实证评论，维持 needs-info/默认 C；#101 第 66 轮 `gh api` 复核 Secrets 仍仅 `CODECOV_TOKEN`/`PROJECT_TOKEN` ⇒ blocked 有效；#186/#209 majors 按 D-015 暂缓；inbound 内容级终判无新工作（f98be0d 已由 f3989dc 吸收、d89b87e 系 fork 同步 main）；无重复/无长期饥饿。⑥ Executor 第 65 轮 `.agent/` 更新（STATE/HANDOFF/ENV）未提交、LOCK 未删——本轮代提交并记录。⑦ pending 清零；**执行队列 = 0（诚实空置，不为填 2–5 区间制造任务）**。

> **第 64 轮判定：** ① 无 LOCK、无 in-progress ⇒ Executor 未运行，无现场可干预。② **#210 验收通过并关闭**（5 条标准全部独立取证：`git show b2baab2` 单文件 17+/13-、PR #211 MERGED 全 check pass、main ci-cd @ `b2baab2` success、本轮亲跑 grep 三条过期引用 0 命中且 D-004 标注逐字未动）⇒ ready 与 in-review 双清零；M3 进度按 GitHub milestone API 实测修正为 **10 closed / 3 open**（原记 8/3 系 closed 计数漂移；3 open = #212/#199/#197，#101 不在 M3）。③ **新发现建 #212（ready・P2・M3）**：metrics 采集器（`35e1abc`/#149 起新 schema）与看板组件（仍消费旧 schema）不一致，bot PR #97 按现状合入即 `Object.values(undefined)` 构建失败且 GITHUB_TOKEN 建 PR 不触发 CI（同 #197 根因）；已在 PR #97 留保护性暂缓评论。④ backlog：#199 braces latest 仍 3.0.3（10-17 剩 8 天，到期按 D-011 显式续期、不提前建单）；#197 默认 C 无新信号；#101 复核 Secrets 仍仅 `CODECOV_TOKEN`/`PROJECT_TOKEN` ⇒ blocked 有效；#209/#186 majors 按 D-015 暂缓；inbound 无新工作；无重复/无长期饥饿。⑤ **§7.4 结构漂移定夺 = 移回表格**：第 58–63 轮 8 条记录原被追加在文件末尾 §11.3 之后（紧跟段落无空行、渲染不成表格），本轮整批移入 §7.4 表格末尾（纯格式搬迁、去空白 diff 取证内容逐字未动），节标题补防复发约定。⑥ pending 清零；执行队列 = **1（#212）**。

> **第 62 轮判定：** ① 无 LOCK、#210 自创建零评论 ⇒ Executor 未运行，无现场可干预。② **无 in-review**（验收队列空）。③ backlog 治理：#210 过 4.2 六门禁仍合格（纯 docs、无依赖、验收标准可判定、不碰红线）→ 保持 `ready`；#199 距 10-17 **剩 8 天**，本轮前瞻 `npm view braces` latest 仍 `3.0.3`（无补丁）⇒ 到期仍须按 D-011 显式续期（不提前建单，触发口径不变）；#197（默认 C）/#101（待人类 Secret）状态无变化；无重复、无 auto-discovered、无长期饥饿项。④ **pending 决策：无**（D-001..D-017 全部生效）。⑤ main 绿（ci-cd run `37789400984` @ `c12cef1` success）；线上 `/` 200 + CSP 每请求新 nonce（只读抽查）；inbound `wsyhuat/main` 无新工作（`f98be0d`/`d89b87e` 均已吸收）。⑥ 执行队列 = **1（#210）**——维持真实状态，不为填 2–5 区间制造任务（文件头纪律栏）。⑦ 顺手修正本文件头部「D-001..D-016」索引漂移 → D-001..D-017。

## 一、当前方向

功能期早已结束（M1 稳态治理、M2 稳态防复发均已收官）。当前处于 **M3 稳态运营**：让依赖摄入、发版、供应链回看周期性运转，并处理机制暴露出的真实事项。TEST_PERF 阶段三四项（#227 smoke 命令 / #228 flaky 治理 / #229 时长预算 / #230 编写规范）**已于第 79、81 轮全部验收关闭**，#231 默认转正关闭——该阶段收官。当前开放工作转为两件：日历硬约束 **braces audit 豁免续期**（#199，实际失效 `2026-10-17T23:59:59Z`，本已提前放行）+ **#242 把 #229 的"开单路径未真实验证"遗留风险转成实测**。方向层由 **D-017** 裁定维持稳态（用户 2026-10-08 选 A），**D-018** 新立自主续期上限。

## 二、当前 Milestone：M3 稳态运营（Steady-state Operations）｜GitHub Milestone #2，due 2026-11-14｜进度：11 closed / 2 open（GitHub milestone API 实测 2026-10-16T11:47Z，open=#199/#197；#101 不在 M3；#227/#228/#229/#230/#231/#242 均未挂 milestone，故本轮关闭 #228/#229 **不改变** milestone 计数）

### 2.1 目标与完成判定（滚动，非硬门）

1. v1.2.x 发布且四方一致 —— ✅ **v1.2.1 已达成**（Release=tag=`package.json`=CHANGELOG，祖先判定通过，PR #208 squash）。
2. minor-and-patch 分组按既定手法（D-014 批次处置）摄入、开放 dependabot PR 不逼近 `open-pull-requests-limit` —— ✅（#187/#196 批次先例；第 81 轮开放 PR 共 4 张 = majors 组 2（#186/#209）+ rp Release PR 1（#239）+ bot metrics 1（#241），远低于限额）。
3. majors 组有明确处置结论 —— ✅ D-015 暂缓（#186/#209 为 standing reminder）。
4. 2026-10-17 audit 豁免到期前完成核对与显式决策 —— ⏳ **第 81 轮已完成核对**（`npm view braces dist-tags.latest` = `3.0.3` 第十次实测；`pnpm quality:audit` 亲跑 exit 0 并自报 `expires 2026-10-17 (1d)`），#199 已转 ready，续期动作交本轮 Executor；新到期日按 D-018 封顶为 `2026-10-31`，此后仍无补丁则须停手等用户裁决。
5. main CI 全绿、线上 `/` 200 + CSP nonce —— ✅ 第 81 轮**独立复验**：main run `38759566750` @ `747f059` completed success；线上单请求头/体 nonce 一致 PASS（`AX3XE4XycJIh…`），中英 metrics 看板页均 200（部署 Version `0e32bc5c`，第 80 轮 `pnpm deploy:worker`）。本轮 HEAD 仅含 `.agent/` 记录变更，无需重部署。

### 2.2 执行队列（当前 = 2 ready）

1. **#199** braces audit 豁免显式续期至 `2026-10-31`（P2，**先做**——单文件配置改动，先消除日历风险；`reason` 必须写当轮实测日期与返回值，禁止沿用旧文案）
2. **#242** 真实触发 duration-budget 三条路径 + 修 null 渲染（P3，含代码 PR；须赶在 2026-10-19T03:23Z 每周定时首轮之前完成）

> TEST_PERF 阶段三已全部收官（#227/#230 第 79 轮、#228/#229 第 81 轮验收关闭）。两单均无依赖关系，按上表顺序执行。
> **D-018 约束**：#199 只做**这一次**自主续期；若执行时上游**已**发补丁，则走"删条目 + 升级"路径并跳过续期（该分支已在验收标准中写明）。

持续触发器（满足其一即建/转 ready 或按指令顺手处置）：

- **#199 续期后（`2026-10-31` 到期）**：先 `npm view braces dist-tags.latest` 核对；仍 `3.0.3` ⇒ **不得第三次自主续期**，转 `needs-info` 并带方案交用户（D-018）。届时 audit 门禁主动变红属预期机制，不是事故。
- 每周一 dependabot 扫描（minor-and-patch 分组按 D-014 批次处置；majors 按 D-015 暂缓）。
- **rp Release PR（当前 #239 = `1.3.0` minor）**：按 **D-012 第 2 档**「minor 随 Milestone 收尾合并」⇒ **保持 open 不提前合**（M3 due 2026-11-14）；只有 patch 档才允许 CI 全绿后直接合。
- **bot metrics PR 按日再生**（#215→`c7fcecc`、#216→`0a29da5`、#217→`455b109`、#226→`c9dad3e`、#232→`4ee6a46`、**#238→`38c1d5e`** 均已处置合入；**#241 今日 04:30Z 再生待处置**，数据-only，单文件值漂移）：不单独建单（目标按日漂移），由 Executor 每轮顺手处置——确认 diff 仅为 `project-progress.json` 值漂移、schema 与 main 逐键一致后合入，验证走合入后 main ci-cd（PR 本身不触发 CI，同 #197 根因）；若 diff 越出数据文件则停下报告 Planner。
- 用户 / 协作方（inbound 巡检 `wsyhuat`）发起的新需求（D-017 已裁定维持稳态；日后再启方向属用户新指令）。**inbound 巡检须带重试**：本轮首拉即遇 `GnuTLS recv error (-110)`，重试一次即成功——不得把 fetch 失败当成"无新工作"。

### 2.3 已知阻塞与依赖

| 项                                      | 状态                        | 需要谁         | 说明                                                                                                                                                                                                                                                                     |
| --------------------------------------- | --------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **#101** CI 自动部署                    | `blocked`（P1）             | **人类**       | 第 60/64/66/67/70 轮五度 + 第 78 轮六度 + 第 79 轮七度 + **本轮八度** `gh api actions/secrets` 复核：Actions Secrets 仍仅 `CODECOV_TOKEN`/`PROJECT_TOKEN`。配好前不得把 deploy job 加回 CI（D-001）；本地 OAuth 部署可用，不阻塞交付                                     |
| **PR #239** rp Release `1.3.0`          | **挂起（D-012 第 2 档）**   | —（无需人类）  | 第 81 轮新登记：`feat:` 累积使 rp 抬到 **minor**（`1.2.2 → 1.3.0`），`mergeStateStatus=BLOCKED`。按 D-012「minor 随 Milestone 收尾合并」**保持 open 不提前合**（M3 due 2026-11-14）；只有 patch 档才允许 CI 全绿后直接合。**下一棒勿误合**                               |
| **#199** braces 豁免                    | `ready`（P2，第 81 轮转）   | **Executor**   | 核对义务本轮已履行：`dist-tags.latest` 仍 `3.0.3`（第十次实测，`time.modified` = `2024-09-18`）+ `pnpm quality:audit` 亲跑 exit 0 并自报 `expires 2026-10-17 (1d)`。实际失效 `2026-10-17T23:59:59Z` ⇒ 提前一天放行以避开红 CI 日。**D-018 封顶：本次为最后一次自主续期** |
| **#197** rp Release PR 自助 CI          | `needs-info`（P3）          | 默认 C（不改） | 第 60 轮已补录第 58 轮实测（同基 `update-branch` 失效 + 空提交触发法）；第 66 轮再登记第三次实证（#214）；等发版频率信号或人类意愿。**属信号触发型 backlog，非 4.1 长期饥饿项**（用户 2026-10-12 已确认维持 C），故保持 open 不关闭                                      |
| bot metrics 快照（bot 按日再生）        | 常态处置（**#241 待处置**） | **Executor**   | #215→`c7fcecc`、#216→`0a29da5`、#217→`455b109`、#226→`c9dad3e`、#232→`4ee6a46`、#238→`38c1d5e` 均已处置合入；**#241（今 04:30Z 再生）待处置**。开放 PR 现共 4 张：#241 + #239 + majors 2                                                                                 |
| **D-017** Q4 方向（是否启动新功能）     | **已裁定 A**（2026-10-08）  | —              | 维持稳态；Q4 评审仅机械刷新（#210）；详见 `DECISIONS.md` D-017                                                                                                                                                                                                           |
| #186/#209 majors PR                     | 暂缓（D-015）               | —              | standing reminder，占额度 2/10，不阻塞 minor-and-patch                                                                                                                                                                                                                   |
| `size:xs` / `update-linked-issues` 权限 | 仓库设置                    | 人类（可选）   | 补 `issues: write` 扩大 `pull_request_target` 权限面 / 无失败实证，Agent 不擅动（维持既有结论）                                                                                                                                                                          |

### 2.4 卫生备注（非任务，不建 Issue）

- **分支卫生已完成**（第 65 轮按授权执行）：`agent/issue-212-metrics-schema` 与 origin 三条历史已合并分支（`feat/worker/auto-deploy` / `fix/disable-openwiki` / `refactor/frontend/site-review-followups`）均已删除；第 66 轮复核 origin 无新增已合并残留。
- **Executor 第 65 轮收尾遗漏两项**（第 66 轮发现并代办/记录，不追罚）：① `.agent/` 三个文件（STATE/HANDOFF/ENV）更新未提交——已由第 66 轮一并 `chore(agent):` 代提交；② LOCK 未删除（心跳 04:25Z，已过期）——LOCK 属 Executor 所有权，Planner 不代删，下一棒 Executor 建锁时自然覆盖（第 67 轮复核仍在，仍过期）。
- **#212 程序违规留痕**（D-006 / §1.6）：Executor 自行关单、Issue 内无执行报告、标签未转 review、STATE 证据位置表述失实；Planner 已 reopen→修正标签→验收→关闭，审计轨迹恢复。下一棒 Executor 需注意：完工必须留执行报告评论、转 `status:review`、**不自行关单**。
- `.agent/ENV.md` 头部时间戳第 65 轮已刷新（10-10T04:20Z），无 cosmetic 欠项。
- **`.agent/LOCK` 已删除（第 81 轮内两次动作，按时间保留）**：本轮开工时发现残留 `{"owner":"executor-codebuddy-glm-20261015","acquired_at":"2026-10-15T05:05Z","issue":228,"heartbeat_at":"2026-10-15T05:05Z"}`（心跳过期约 2 天，且 #228 已验收关闭）。该文件**未被 git 跟踪**，故 STATE.md 第 80 轮「LOCK：本轮收尾删除」一句与实际不符——`rm` 未生效或后续又出现，属**无代码影响的记录笔误，不追罚**；下一棒请以 `ls .agent/LOCK` 为准，不要以 STATE 自述为准。契约 1.2 规定本流程**不设锁**、Planner 不代删，故本轮先提示用户；**用户回复「建议删除就删除吧」授权后，已由 Planner 删除**（删除前二次核对：内容逐字未变、无持有该锁的执行现场）。当前 `.agent/` 已无 LOCK，下一轮无需再处理。
- **`.agent/ENV.md §5` 标签表已过期（第 81 轮实测）**：该节称 `blocked` / `needs-info` 标签"不存在"、`priority:p4` 缺失，但 `gh api labels` 实测三者**均已在仓库存在**（#101 正带 `blocked`、#197 正带 `needs-info`）。ENV 属 Executor 所有权，Planner 不代改，请下一棒修正——**该过期表述会误导后续轮次跳过 `--add-label blocked` 一类操作**。
- **`ready` 无专用标签（沿用既有映射）**：`status:backlog` + Issue 正文首行「队列状态：`ready`」，本轮 #199 / #242 均按此设置，勿加不存在的 `ready` 标签。

## 三、下一阶段

M3 是开放式稳态循环，无「做完即停」的终线：只要项目继续存在，依赖摄入 / 发版 / 供应链回看就持续运转。若未来出现人类发起的新功能需求，再据实开新 Milestone；否则不预设「M4」。

## 四、已明确放弃的方向（不再重新讨论）

| 方向                                                       | 放弃理由                                               | 依据                     |
| ---------------------------------------------------------- | ------------------------------------------------------ | ------------------------ |
| 跟进 Starlight ≥0.42                                       | satteri WASI 破坏 workerd 构建链，等上游               | D-004 / T-026 实测       |
| `wrangler` semver-major                                    | 精确 pin，major 需人工复核                             | D-003 / `dependabot.yml` |
| `format:check` 扩到 yml/yaml/astro/mdx                     | hook 未覆盖；`*.astro` 无 prettier parser（已实证）    | 第 24 轮                 |
| `tsc --noEmit` 纳入 `tests/**`                             | 预防性缺口，当前无实证缺陷，纳入可能连带暴露存量类型错 | 保守原则，已判定         |
| 逐个合并 dependabot PR                                     | 同 2 文件串行 rebase，且易先合入无用提交               | D-005 + D-009 裁决       |
| 直接 `merge wsyhuat/main`                                  | fork 落后 main，只取单个 commit，不取分支              | `git diff` 实测          |
| 追 `@cloudflare/vite-plugin` 最新版                        | peer 逐发布日棘轮；改为锁定 + 人工抬版                 | D-010                    |
| 把「发现协作方修复」当作用户决策                           | 事实发现与工程判断，Planner 自决并建单是默认           | Planner 职责边界         |
| 补 `size:xs` / `update-linked-issues` 所需 `issues: write` | 扩大 `pull_request_target` 权限面 / 无失败实证         | 官方警告 / 保守原则      |
| 自动采纳 majors（actions v7 / TS7 等）                     | D-015 暂缓；采纳属红线相邻，需用户决定                 | D-015                    |

## 五、Decision Gate

当前**无开放 pending**（D-001..D-018 全部生效；#231 已于第 79 轮满 3 天按 §6.3 默认转正关闭；第 81 轮 **未向用户提出任何新问题**——braces 续期属 D-011 已授权框架内的机制性决策）。**唯一排期中的用户决策**：**2026-10-31** 若 braces 仍无补丁，按 **D-018** 停手并把「长期接受该 devDependency 风险 vs. 从 purgecss/postcss 链移除 braces」交用户裁决（届时按 §6.2 格式带方案与默认项提出）。权威定义见 `.agent/DECISIONS.md`。历史 Gate 记录（如 D-009 批次处置授权、D-010 vite-plugin 锁定）以 DECISIONS.md 为准，本文件不再复制第二套说法。

## 给 Executor 的指令

执行队列 = **#199 → #242**（两项均 ready、无相互依赖）：先做 #199 的单文件续期以消除日历风险（新 `expires` 固定 `2026-10-31`，`reason` 必须写当轮实测日期与 `dist-tags.latest` 返回值，**不得沿用旧文案**，且不得替用户预先决定第二次续期）；再做 #242 用真实 `workflow_dispatch` 补齐 duration-budget 的开单与去重证据。收尾仍守四件套（Issue 执行报告、转 `status:review`、**不自行关单**、`.agent/` 变更单独 `chore(agent):`），另按 §2.2 顺手处置 bot PR **#241**、**勿合 PR #239**（D-012 minor 档）。
