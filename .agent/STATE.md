# Agent 接力状态（STATE）

> 本文件由“时间流接力开发”的每一棒追加/更新，与 `docs/WORKFLOW.md:§4/§7.4` 保持一致。
> 只记录进度/下一步/阻塞，不复制看板全表。**详细交接与命令速查见 `.agent/HANDOFF.md`。**

**最后更新：** 2026-10-03T09:15Z｜**当前 agent-id：** `exec-20261003T0900Z`（**第 44 轮，Execution：#181 双 SSOT 消除**）｜**状态：** #181 已合并转 `status:review`；**M2 唯一剩余可开工项 = #182**
**主干：** `origin/main` = 含 #181 的新提交｜**载体分工已成文**：`WORKFLOW §1.2`（Issues=任务接口 / PLAN=路线 / DECISIONS=决策 / §4=历史冻结看板 / §7.4+STATE+HANDOFF=追加记录）+ 冲突优先级；`AGENTS.md` 的"回写 §4"已改为"回写 §7.4 + .agent + Issue"
**待验收：** #178（实证已齐）/ #179 / #180 / #181｜**等人类：** #101、majors 组处置（#186-#188）｜**线上：** 未变（纯文档，未部署）｜**锁：** 本轮结束删除

> ✅ **上一轮的全局阻塞已解除（第 37 轮续）**：当时 `Audit Dependencies` 对任何 PR 都红且无代码解法（上游未发补丁）。用户授权后由 **PR #174 修好**（`pnpm quality:audit` + 带到期日的豁免清单，见 **D-011** / #173），main 与 #172 均转绿。**当时本棒没做的仍是正确的**：没 `--admin` 绕过一个真实失败的门禁（§1.4），而是先把取证与选项交给人工。

> 🔍 **时间口径纠正（延续记录）：** 上一棒（Planning）在 STATE/PLAN/HANDOFF 写的 `2026-10-03T09:40Z` / `09:55Z` **不是 UTC**（当时实际为 `00:1xZ`，本地 +08:00）。本棒起统一用 `date -u`。

> 上一棒为纯文档/规划改动（无需部署）；**本棒含依赖与部署链改动，已实部署并复验**，线上现为 `fef2a5e` 产物（wrangler 4.147.0 + vite-plugin 1.62.5）。

> ⚠️ `STATE.md:7` 历史损坏已于第 35 轮修复；本轮（第 36 轮）对 `.agent/**` **四文件全量体检通过**（#166 已据此关闭，证据贴在该单）。

> **第 36 轮（Planning 第 2 轮）一句话：** 无执行活动可验收；实测到 **两个推翻/补漏的新事实** —— ① `@cloudflare/vite-plugin` 一周连发 6 版把 `wrangler` peer 棘轮到 `^4.147.0`（**#164 原目标 `4.143.0` 已失效**）；② 协作方 `wsyhuat` fork 的 `f98be0d` 修了**线上真实首页缺陷**但 `.agent`/Issue **零记录**，静置约 12h。已改写 #164、新建 **#168（P1）/#169（P2）**、给 #167 加依赖边、落盘 **D-010**。

> 第 22 轮合并马拉松完成：按用户指令 review+merge 全部 14 PR —— #122→#124→#127→#129→#131→#133→#135→#137 逐个同步 main（records 取分支侧、§7.4 取并集）+ 链顶 #149 一次性带入 #138/#140/#142/#144/#146/#148（被替代 PR #139/#141/#143/#145/#147 已关闭）。`--admin` 合并系人类明确授权 + 每分支 CI 核心 5 项全绿后执行（分支保护的 review 对象 + 永不满足的 `quality-gate` 上下文只能由 admin 绕过，质量本身未绕）。验收：§7.4 共 89 行（基线 71 + 18）、`grep -rn '^<<<<<<<'` 无输出、main run 36863298437 全绿。

## 当前活跃任务

- **#168（本棒第二单元：代码完成，PR #172 未合并）** — 分支 `fix/home/reveal-progressive-enhancement`，commit `f3989dc`（**cherry-pick 自协作方 `f98be0d`，author 保留 `wsy-huat`**）+ `9f0f287`（回归守卫）。三缺陷全修 + 本地全绿（**416 tests / 97 e2e**，均为基线+新增；并已实测「同一用例对修复前 main 基线会失败」）。**阻于 #173 的 audit 红，未绕过。** 详细结果与未验项（线上头像 200 / 部署 / 亮暗截图）在其 Issue 评论。
- **#164（本棒第一单元已完成 → `status:review`，未关单）**：锁定 `@cloudflare/vite-plugin`（有界 override `1.62.5`）+ `wrangler` pin `4.136.2 → 4.147.0`。代码 commit `3218dc9` → squash 落 `main` = **`fef2a5e`**（PR **#170**，六项全绿含 QualityGate 4m42s）→ **已部署**（Version `e0fc4b95`）。验收证据逐条贴在 Issue 评论。**故意未关单**：合并按钮用了不触发 closing keyword 的 squash 标题（仓库惯例 `fix: #N` 会被 GitHub 自动关单，那会绕过 D-006）。
- **#150/#152**（均已关）：#151/#153 经人类 review（chat 明确"没问题，继续"）后 `--admin --squash` 合并（分支保护 review 对象 + 永不满足的 `quality-gate` 上下文，只能 admin；两 PR CI 事先全绿含 QualityGate）；body `Closes` 自动关（`docs:`/`fix:` 均生效，已核对 #150/#152 closed）。
- **#154/#156/#158/#160**（均已关，第 30 轮合并，细见下）：① #161 → 部署；② #159 → 部署；③ #155；④ #157。body `Closes` 自动关已核对；线上 Version `73738007`。
- **#120**（P3，本轮结清）：用户指令"按推荐来" → 执行单内推荐方案 A（删）：删前复核全仓 `utils/toast` 零引用依旧 + 线上 200/200 健康 → `git rm src/utils/toast.ts`（443 行）→ 本地 §6 全绿（lint/format/tsc/test 412/build）→ **PR #163**（CI 全绿；删除无行为变化，**无需部署**）→ `--admin --squash` 合并，body `Closes` 自动关 #120（已核对）。
- 无其他活跃任务（#101 等人类）。

## ⚠️ 重要警告（给下一棒）

**main 直推冻结已解除**（第 22 轮）：`main@35e1abc` CI 全绿（含 Audit，run 36863298437）。记录文件（`.agent/**`、`docs/WORKFLOW.md:§7.4`）恢复惯例直推；代码/文档修复仍走独立分支+PR（WORKFLOW §5）。

> 历史备注（冻结期 2026-09-30~2026-10-01）：`pnpm audit` 公告晚于主干最后绿 run，`#122` 合并前禁直推 main；`gh run list --branch main --limit 100` 的 60 个 failure 全是 2026-09-29T15:00Z 前历史（时间窗假象，坑 20 变体）。

## 开放 issue 现状

> 📌 本节原有的重复 `#101` 条目已于第 35 轮去重；本轮（第 36 轮）对 §「开放 issue 现状」再次全量比对 `gh issue list --state open`，**五个开放单 = 实际五个，无遗漏无重复**。

- **#101**（P1 / `status:backlog`）：**唯一长期阻塞项** —— 需人类在 Actions Secrets 配 `CLOUDFLARE_API_TOKEN`。**本轮复核（`gh api repos/HUAT-FSAC/Guidance-Astro/actions/secrets`）：仍仅 `CODECOV_TOKEN` / `PROJECT_TOKEN`**。⚠️ 注：`PROJECT_TOKEN` **存在**，问题在它的值/权限（`add-to-project` 曾报 Bad credentials），不是缺失。**配好前不得加回 deploy job**（会重演 `main` 长红）。实现已备好（`8475f88`）。
- **M1 队列（6 项，均为 Planner 创建；第 36 轮调整后）：**
    - **#164** P1 `ready` — **正文与标题已被本轮重写**：目标从「wrangler → 4.143.0」改为「**锁定 vite-plugin（有界 override）+ wrangler pin → 4.147.0** 的成对动作」（D-010）。**M1 链条起点**，无前置。
    - **#168** P1 `ready` — **本轮新建**：首页 25 个 `.reveal-upon-scroll` 默认 `opacity:0`（线上实测服务端 HTML **0** 个 `data-visible`）+ `CoreModules.astro:60` 的 `stagger`/`reveal` 层叠冲突 + 3 个头像走 `avatars.githubusercontent.com`。移植协作方 `f98be0d`（**只取该 commit，不 merge fork 分支**），含 e2e（禁用 JS）与单测补齐。**无前置，可与 #164 并行**（零文件重叠）。
    - **#169** P2 `ready` — **本轮新建**：`WORKFLOW §1/§3` 补 inbound remote 巡检规则（#168 静置 12h 的根因是检测缺失）。**无前置。**
    - **#165** P1 `ready` — dependabot 9 PR（#106–#114）批次处置，**blocked by #164**；本轮已补留言：目标前置从「pin 4.143.0」变为「override 已落地」，且 **PR #107（wrangler→4.138.0）明确作废**。
    - **#167** P2 `ready` — 发布 v1.1.0（合并 rp PR #96），依赖从「#165」扩为「**#165 + #168**」（本轮已改正文「## 依赖」段 + 加留言）。
    - ~~**#166** P3~~ — **本轮 Planner 自办并关闭**（体检对象是 Planner 自有记录文件，不占执行队列；断言证据已贴）。
- **已关单维持不变：** #120（第 32 轮删 toast.ts）、#121/#123/#125/#126/#128/#130/#132/#134/#136/#138/#140/#142/#144/#146/#148/#150/#152/#154/#156/#158/#160（第 22/30 轮）、#162（第 31 轮诊断关）。
- **开放 PR：11 个，** 本轮实测：9 个 dependabot（`#106–#114`，**10-02 已被 dependabot 重新 rebase 过一轮**，占用限流额度 9/10）+ `#97` metrics + `#96` release-please。**按 D-009 逐个合仍禁止**，处置载体是 #165。

## 已观察、未建单（待时机）

- **GitHub Project 看板 URL**：`docs/PROJECT_MANAGEMENT_MODEL.md:10` 的 `projects/1` 匿名 404——gh token 缺 `read:project` scope 无法验证（私有看板可能 404），**不可判定不建单**；另 `add-to-project` 在 run 36742311392 报 `PROJECT_TOKEN` Bad credentials，需人类轮换/确认。若后续能验证确实不存在，改指向 `docs/WORKFLOW.md:§4`。
- ~~**`format:check` 覆盖缺口的剩余部分**~~（已结清，第 24 轮 #152）：md/`.config`/`.github`/根 md/public/src-md 7 组 glob 已补 + `.prettierignore` 冻结快照；剩余 `yml/yaml/astro/mdx` 为**有意不做**（hook 未覆盖/`*.astro` 无 parser 实证），不再建单。

- **i18n 中英对称性已结清**（第 20 轮验证，无缺陷）：en 侧用翻译后 slug，路径集合差（zh 缺 24 / en 缺 36）**不可直接判缺**；5 个 en 中文文件名文件是**有意重定向 stub**（线上旧路由 200 → 新 slug 200），其余为单语内容，**语言切换器对缺失语言正确省略**（无死链）。复查时**先分类再判缺陷**，别拿路径差直接建单。
- **门禁自审计已覆盖两侧**（第 15-16 轮 + 第 24 轮 #152 收尾）：`format:check`（#140→#152）与 `eslint`（#142）均已对齐到 hook 声明范围（7 组 glob + `.prettierignore`）。**剩余均为有意不做**：`yml/yaml/astro/mdx`（hook 未覆盖/`*.astro` 无 parser 实证）、历史快照冻结；`pnpm lint` 未设 `--max-warnings`（阻断策略属人类决策）；`tsc --noEmit` 不覆盖 `tests/**`（预防性，见下条）。

- **测试文件未纳入 tsc**：`tsconfig.json` include 仅 `src/**`，`tsc --noEmit` 不覆盖 `tests/**`（vitest 用 esbuild 不查类型）——预防性缺口、当前无实证缺陷，且纳入可能暴露存量类型错需连带修复，**暂不建单**（保守原则）。

## 本棒已完成

### 第 15 轮（#140，主动发现）

例行同步（main `46f53f4` / 9 PR 全 OPEN / 无可认领）→ **CI 门禁自审计**（首次审「门禁本身覆盖什么」）→ 实锤 `format:check` glob（`package.json:50-51`）同时窄了目录集与扩展名集：hook（`.config/lint-staged.config.mjs`）管全仓 `**/*.mjs|md`，CI 门禁只管 `{src,tests}/**` 的 5 种扩展名 + 根级 3 种 → 全仓 369 文件 `prettier --check` 得 **26 个不合规且全部落在盲区** → **盲区放行实证**（往 `scripts/quality/check-theme-contrast.mjs` 注入格式问题，`format:check` exit **0** 放行）→ 建单 **#140** → 修 `41c3289`：glob 扩 `{src,tests,scripts}` + 归一 `collect-github-metrics.mjs` → **PR #141**（叠在 #139 之上）。验证：format:check 1→0、盲区反向 0→1（拦截）、token 级 558/558 零差异、§6 全绿。md/yml 扩展名与 `.github/` 目录集按「yml 语义敏感宜单独 PR」收敛为后续项。

### 第 16 轮（#142，主动发现）

例行同步（无可认领）→ 承 #140 门禁自审计审 **eslint 侧**：`pnpm lint` = `eslint src`，而 `.config/eslint.config.mjs` 规则块声明全仓 `**/*.ts|tsx` + `**/*.astro`、hook 亦全仓 → **`tests/` 40 个 ts 文件不在 CI lint 覆盖内**，`eslint tests` 实测 **18 warnings**（15 no-unused-vars + 3 sort-imports）→ 先排除误报：根级 4 个 `*.config.ts` 是 `ignores` **有意排除**（注释「配置文件使用独立配置」）、根级 `vitest.config.ts`/`playwright.config.ts` 是 `.config/` 的薄 re-export shim **非重复** → 建单 **#142** → 修 `88733cb`（10 文件 24+/27−）：`lint`/`lint:fix` 扩 `eslint src tests` + 归一 18 warning（`_` 前缀符合配置既有约定 / 未用 import 成员删除）→ **PR #143**。验证：lint 0 problems、注入未用变量现被报出、**412 tests / 38 files 全过**、§6 全绿。**过程自查出并修正隐患**：误将 `branch-boost3.test.ts:99` 的 `enc`（函数体内有引用）加了 `_` 前缀，412 tests 仍全绿（断言不依赖该分支）= 静默测试弱化，已改回。

### 第 17 轮（验证轮：11 个 PR 的合并安全预演）

无可认领 issue → 转为**交付风险审计**：`git merge-tree` 显示 11 个 PR 各自对 main **零冲突**（rc=0），但逐个实际合并暴露真实风险——**除 #122 外每个 PR 都在 3 个记录文件冲突**（11 个分支全改 `STATE`/`HANDOFF`/`WORKFLOW §7.4`），而**内容文件零冲突**（唯一同文件的 #135/#137 `ARCHITECTURE.md` 不同行，实测自动合并成功）。跑通完整合并序列（冲突按既定规则解决）后得出**可核验的合并手册**并写入 `HANDOFF §二·〇`：合并顺序（#122 优先解锁 Audit → 其余 → 链式 #139→#141→#143）、确定性解法（STATE/HANDOFF 取进来方、§7.4 两边全保留）、**验收标准 `grep -c mimo-flash docs/WORKFLOW.md` == 13**（去重后并集；直接相加会得 16，因 #141 携 2 行、#143 携 3 行）、squash 需手动关 12 个 issue。

### 第 18 轮（#144，主动发现）

例行同步（11 PR 未合并、无可认领）→ **数值口径审计**（承 #125/#130 主题）：route 预算 80/260KB 与代码一致 ✅、bundle 预算未在现行文档声明（无漂移）、覆盖率实测 **94.02/85.3/94.69/95.1** vs 阈值 80（最紧 branches +5.3，无脆弱性）→ 顺带核实 STATE 挂起的 og-image 预算项：\`public/og-image.png\` 系 **ADR-002:57 有意保留**（历史遗存）**不删**，该预算条目有效 → 复查 og:image 决策留痕链时**实锤 2 处残留**：① \`WORKFLOW §7.6\` **验证行仍校验 \`og-image.png\` 为 PNG**，与同段决策行（#136 已改为 jpg）**自相矛盾** —— #136 只改决策行漏了验证行，**部分修复制造了新矛盾**；② \`ADR-002:42\` 的 \`WORKFLOW.md:7\` 指向文档头部而非决策留痕（实为 §7.6）→ 建单 **#144** → 修 \`84baa42\`（2 文件 3 行）→ **PR #145**。决策行采用与 #137 **逐字一致**的文本（\`diff\` 验 IDENTICAL）故两 PR **任意顺序合并无冲突**。3/3 内容断言 + §6 全绿。

### 第 19 轮（#146，主动发现）

例行同步（12 PR 未合并、无可认领）→ **配置一致性审计**（新维度：CI/label 自动化配置本身）：把 \`.github/labeler.yml\` 的 9 个 label 键与仓库 39 个真实 label 逐一比对 → \`size:xs\` **不存在**；再查历史 PR 标签发现 \`breaking-change\` 出现在**所有** PR（含只改 README 的 #124）→ 读官方 README 定位根因：**无顶层 \`any\`/\`all\` 键的规则默认按 \`any\`(OR) 处理**，\`base-branch: main\` 单独成立即命中；第二处根因：\`size:xs\` 需要 \`issues: write\` 才能创建，而 workflow 只有 \`contents: read\`+\`pull-requests: write\` → 建单 **#146** → 修 \`850979d\`（仅 \`breaking-change\` 包进 \`all:\`）→ **PR #147**。验证：写**本地 labeler 判定复现器**（官方语义 + \`yaml\` + \`minimatch\`），**修复前输出与线上标签 3/3 吻合**（证明复现忠实），修复后 **6/6 断言 PASS**（含 2 个正例确保不漏打真·破坏性变更）+ §6 全绿。\`size:xs\` 属**仓库设置/权限决策**（扩 \`issues: write\` 会给 \`pull_request_target\` 扩权，官方警告），**未擅动**，方案与命令写进 issue。

### 第 20 轮（验证轮：i18n 中英对称性审计，无缺陷）

例行同步（13 PR 未合并、无可认领）→ **i18n 对称性审计**（新维度，用户面）：按文件路径直接比对无意义（en 侧用**翻译后 slug**，如 zh `入门` ↔ en `onboarding`），故改用三步实证 —— ①路径集合差得 zh 缺 en 24 项 / en 缺 zh 36 项；②逐一分类：**5 个 en 中文文件名文件（`docs-center/入门.mdx` 等）是有意的重定向 stub**（`meta http-equiv=refresh` + `location.replace` 指向新英文 slug，线上实测旧路由 200、新 slug 200 ✅），其余为**单语内容**（en 独有 28 个 `archive/2025/*` 英文页、zh 独有 8 个中文页）；③查语言切换器是否因此产生死链 → 线上实测 en 独有页**未生成 zh 链接**（Starlight 正确省略缺失语言），zh 对应路径 404 但**无任何入口指向它** ✅。结论：**无缺陷**，i18n 维度结清。

### 第 21 轮（#148，主动发现）

例行同步（main 仍 `46f53f4`、13 PR 全 OPEN 且 MERGEABLE、无可认领、main 顶端 run 36651249360 7/7 绿但本地 `pnpm audit` 仍 5 漏洞 exit 1 → **冻结令继续有效**）→ **工作流自动化配置审计**（承 #146 维度，从 labeler 扩到 project-automation）：读 `.github/workflows/project-automation.yml` 全文件 → 实锤两处失效合并建单 **#148**：A=`check-milestone-deadline` **永不运行**（`on:` 无 schedule 触发，旧 `if: github.event.schedule == '0 9 * * *'` 只在 schedule 事件下有值 → 近 10 run 全 skipped，run 36742311392 实证；且预警写死 `issue_number: 1` 而 #1 实为**已合并 PR**）；B=`update-issue-status` **空转**（脚本 27–38 行读标签算 status 后只 `console.log`、零 `github.rest` 写调用，issue 事件每次白跑一次 checkout 却显示 success）→ 查重（无重复单；与 #101/PROJECT_TOKEN 无关：那是 secret 侧）→ 修 `b247567`（2 处改 `if: false` 显式禁用 + NOTE(#148) 注释，**不补 schedule、不加权限，零行为变更**）→ **PR #149**。验证：`yaml.safe_load` 解析 OK（4 jobs 保留）、旧可执行条件 0 残留（仅注释内提及）、§6 全绿（lint 0 / tsc 0 / format 全过 / test **412/412** / build Complete）。**有意未动**：`update-linked-issues` 缺 `issues: write`（默认只读下合并时 403，但无失败实证，保守不动）；`add-to-project` 在 run 36742311392 报 `Bad credentials`（`PROJECT_TOKEN`，属 secret/看板侧，需人类轮换/确认 projects/1，已有 STATE 观察项）。

### 第 22 轮（合并马拉松：用户指令 review+merge 全部 14 PR，main 解锁）

用户明确授权后执行（协议默认禁自动 merge，人类指令优先）：①查分支保护（1 review + `quality-gate` 上下文 + enforce_admins=false → `--admin` 是唯一路径；`--admin` 绕的是 review 对象与永不满足的上下文，质量本身用 CI 卡）；②逐 PR review（内容文件除 #135/#137 同改 ARCHITECTURE 不同行外全 disjoint）；③先合 #122（Audit 解冻，#121 自动关）；④独立 PR 按序同步 main（records 取分支侧、`§7.4` 行并集脚本合）→ 每分支 CI 核心 5 项（Audit/Lint/Type/Tests/Build）绿 → `--squash --admin` 合并（#124→#127→#129→#131→#133→#135→#137，issue #123/#125/#126/#128/#130/#132/#134/#136 全自动关）；⑤链顶 #149 一次带入 #138/#140/#142/#144/#146/#148（squash 默认消息含全部分支 subject，`fix: #N` 的自动关，`docs: #144` 手动补关；被替代 PR #139/#141/#143/#145/#147 标 superseded 关）。**过程纠错两处（如实记录）**：A. `git show --stat` 看 merge commit 会误报缺文件（实为 combined diff，只看该命令会误判，必须用三点 diff + 内容 grep 核对）；B. 本棒第 21 轮记录 commit 把 §7.4 第 20 轮行**替换**而非追加（edit 新串漏了旧行），本轮从 `2d08c90` 原样补回并全表核对 89=71+18。验收：main@35e1abc run 36863298437 **全绿**（含 QualityGate e2e/LHCI 与 Preview），正本 webm 在位、副本已删，`grep '^<<<<<<<'` 无输出。

### 第 23 轮（#150：README 部署行 ACCOUNT_ID 漂移，2 行）

例行同步（main@023e02e 与 origin 一致、开放 issue 仅 #101/#120、开放 PR 全为自动 PR 不碰）→ 取§已观察第 1 条（第 9 轮因 PR #124 拆行冲突推迟）→ 复核漂移仍在（`README.md:70`/`README.en.md:71` 仍写 TOKEN/ACCOUNT_ID，与 Makefile:123 + DEPLOYMENT:36 + AGENTS.md 矛盾；全仓其余 ACCOUNT_ID 引用均为正当）→ 查重无重复 → 建单 **#150** → 修 2 行（对齐 Makefile 文案 + prettier 表格重对齐，语义仅 2 行：`git stash` 对照证改前 prettier 干净）→ **PR #151**（CI 核心 5 项绿；docs-only 无需部署；**留待人类 review+merge**——新工作无合并授权，回归默认协议）。**教训**：edit 新串必须包含旧串全部保留内容，提交记录类文件后逐行核对行数（89=71+18 类断言）。

### 第 24 轮（#152：`format:check` 剩余缺口，50 文件盲区/实脏 2 个）

例行同步（#151 仍 OPEN 留人类、其余无可认领）→ 取§已观察第 3 条 → 精确重测（hook 覆盖 287 − CI 覆盖 = 154 盲区；剔除生成物/快照后有意义缺口 **50 文件**；全量 `prettier --check` 287 文件仅 20 脏，其中活文件仅 **2 个**）→ 关键排除实证：`*.astro` 无 prettier parser（含空格文件名炸 shell 展开，`*.yml`/`*.mdx` hook 本就不覆盖，均不扩）→ 查重无重复 → 建单 **#152** → 修 4 文件（`format`/`format:check` 同步扩 7 组 glob + 新增 `.prettierignore` + 归一 COMPONENTS.md/contributing.md）→ **PR #153**（新门禁精确命中 2 预测文件 + 反向注入 `docs/README.md` exit 1 拦截 + §6 全绿 lint/tsc/test 412/build；非运行时改动无需部署；**留待人类合并**）。归一等价性：contributing.md 纯空白（1950 字符一致）；COMPONENTS.md 为 prettier canonical 风格归一（嵌套列表 2sp→4sp + fence 代码按仓库 semi:false/tabWidth:4，与 #140 的 token 证明同源，属文档示例无运行时）。

### 第 25 轮（#151/#153 合并落 main + LHCI 抖动实锤）

人类 review 通过（"没问题，继续"）→ #151/#153 事先 CI 全绿（含 QualityGate）→ `--admin --squash` 合并（分支保护 review 对象 + 永不满足 `quality-gate` 上下文，只能 admin）→ #150/#152 靠 body `Closes` 自动关（已核对；`docs:`/`fix:` 均生效）→ main@9e41da7 首跑 QualityGate 在 `/` perf 0.59 失败 → 同 SHA `--failed` 重跑转绿（run 36879855991 全 success）；并案 `d95cc55`（纯记录 commit）同 job 0.77 失败 —— 纯记录改动不可能影响 perf，实锤抖动非回归。

### 第 26 轮（#154：LHCI numberOfRuns 1→3，1 行）

取§已观察抖动项 → 查重无重复 → 建单 **#154**（证据：0.59/0.77 + 同 SHA 重跑转绿；T-022 冷机 0.83 余量薄；#134 恢复 error 档后首次显形）→ 修 1 行（`numberOfRuns: 1→3`，assert 取中位数；0.8 error 档不动；下调阈值/改 warn 明确不做）→ **PR #155**（CI 全绿：核心 5 项 + QualityGate `12 total runs` 中位数断言过 + Preview；本地 JSON 解析 + format 全过 + lint/tsc/test；非运行时改动无需部署；**留待人类合并**）。**教训**：shell 跨调用 PATH 不继承，commit 前须同命令内 export（husky `command not found` 拦 commit 一次）。

### 第 27 轮（#156：自动化 workflow 注释口径漂移 part 2，纯注释）

例行同步（#155 仍 OPEN 留人类，#101/#120 仍阻塞）→ 承 #148 三元组法复审剩余 6 个 workflow（notify/collect/openwiki/secret-scan/welcome 行为无问题，证据：#97 定时产出中、openwiki 定时刷新中、notify 三条件与触发器 pairwise 匹配、secret-scan 上报门双保险）→ 实锤 2 处纯注释漂移 → 查重无重复 → 建单 **#156** → 修 2 文件（release-please 头部改终局口径 10+/27− + token 行 4→2 行；stale 头部 allowlist→denylist）→ **PR #157**（CI 全绿：核心 5 项 + 3-run QualityGate + Preview；`yaml.safe_load` jobs 集合不变；diff 逐行全 `#`；非运行时改动无需部署；**留待人类合并**）。**教训两则**：① edit 长分隔线按字节难命中，改按行号替换 + 断言全注释行；② 首建 PR 空回（疑瞬时 API 抖动），`gh pr list --head` 核对后重建得 #157。**有意不碰**：ROADMAP:39（09-13 摘要切片）、HANDOFF-2026-09-19（冻结）。

### 第 28 轮（#158：侧边栏「内容贡献指南」404——文件错位在内容集合外，新棒 glm-5.3-flash 接管过期锁）

例行同步（#155/#157 仍 OPEN 零评审零新评论、#101/#120 仍阻塞、main CI 全绿）→ **接管过期锁**（muse-spark 锁 2026-10-01T16:15Z 距今 8h，>30min 视为崩溃）→ 转主动发现新维度：数据文件审计（seasons schema 三年一致、图片引用 5/5 在位）+ **侧边栏显式 link ↔ 集合树一致性**（12 link 中 1 个未解析）→ 实锤：`.config/sidebar.mjs:22` 指向 `/docs-center/contributing/`，但文件在 `src/content/docs-center/`（集合外，`docsLoader()` 只加载 `src/content/docs/`）→ 永不构建，自 `ac60adb`（2026-04-23）起 404；线上 curl 实证 HTTP/2 404 → 查重无重复（#117 内容内链/#123 README 死链均不同范围）→ 建单 **#158**（P2）→ 修：`git mv` 进集合（sitemap 167→168）+ 移除 `sidebar: true`（同级显式配置页无该字段）+ 同页 4 处过期引用（`:20`/`:72` 仓库链接 `huat-fsac-docs` 404 实测改 `Guidance-Astro`、`:26-27` clone 占位符、「自动部署」条件式）→ **PR #159**（本地全绿 lint/format/tsc/test 412/build/bundle/theme/routes/e2e 95；内容页进产物，**合并后需部署**；留待人类合并）。**教训**：① gh issue create 的 `--label` 用错名（`P2` ≠ `priority:p2`）会**整体失败不建单**，静默无 issue，必须回查；② 侧边栏/导航显式链接是链接审计盲区（sitemap 只含已构建页），修法=解析 link 到集合文件。

### 第 29 轮（#160：devalue 新公告 6 漏洞，#121 同款复发）

PR #159 CI 首跑 **Audit Dependencies 红** → 提取日志实锤 devalue 6 漏洞（3 high，Patched >=5.9.3，实装 5.9.2 经 `astro ^5.8.1` prod 链；公告晚于 main 最后绿 run 41d654f）→ 查重无重复 → 建单 **#160**（P1）→ 修 1 行：`pnpm-workspace.yaml` overrides 增 `"devalue@<5.9.3": ">=5.9.3 <6.0.0"`——**关键细节**：裸写 `>=5.9.3` 实测解析到 6.0.2，越界 astro 声明 `^5.8.1`（semver 不兼容风险），收紧 `<6.0.0` 后落 5.9.4；audit exit 0 + lint/format/tsc/test 412/build/e2e 95 全绿；`grep devalue dist/server` 有命中 → **需部署** → **PR #161**（CI 六项全绿）→ #159 **rebase 叠基** 到 #161 之上（链式堆叠 #141↔#139 先例）+ PR 留评合并顺序，叠后 #159 CI 亦全绿。**教训三则**：① 本地门禁清单必须含 `pnpm audit`（CI 第 2 job，公告随时发布——第 28 轮漏跑致 PR 先红一次）；② audit override 下限**必须核对上游声明区间**，裸 `>=X` 会放走 major（6.0.2 越界 `^5.8.1`）；③ 公告期开放 PR 会集体转红——新 PR 叠基旧 PR 分支可即时转绿并固化合并顺序。

### 第 30 轮（合并马拉松 part 2：用户授权免 review，4 PR 落 main + 上线）

用户明确"不需要 review，直接推进"（免 review 自主推进长期生效）→ 四 PR 事先 CI 全绿 → 按序 `--admin --squash`：① **#161**（`795d89d`，main Audit 自愈）→ 部署 `0b79c574` + CSP ✅；② **#159**（`bd30e3f`，栈上已含 #161，合后剩余 diff 仅 contributing）→ 部署；③ **#155**（`4e8c362`）；④ **#157**（`0437947`，#155/#157 无需部署）。body `Closes` 四 issue 自动关（已核对 #154/#156/#158/#160 closed）。**事故**：GitHub 端合并后本地树过期，两次部署上线了旧树（`/docs-center/contributing/` 线上 404，sitemap 无命中——复测发现）→ `git pull` + `pnpm install`（#161 换 lock）重建 → Version `73738007`：contributing **200** + sitemap 命中 + CSP ✅。**坑 25**：凡 GitHub 端合并落 main，部署前必 `git pull` 并确认目标文件在位（本地 `git log` 多旧即不可直接 deploy）。main run 37000100746 **全绿**（含 Audit/3-run QualityGate/Preview）。

### 第 31 轮（验证轮：#162 release-please 失败告警调查，无缺陷）

例行同步（main@3dbbf82 一致、无可认领：#101/#120 仍阻塞）→ 新告警 **#162**（notify-failure 自动开单：rp 在 `bd30e3f` push run 36999853682 失败）→ 读日志：`release-please-action@v5` 在 Fetching merge commits 收到 GitHub GraphQL 内部错误（`Something went wrong ... 73C0:8309B...`），非权限/配置问题 → 相邻 run 全绿（前 `795d89d`、后 `4e8c362`/`0437947`/`3dbbf82` 连续 success）+ #96 在失败后被后续 run 正常更新（11:16:51Z）→ 结论：瞬时故障、自愈、零残留（rp 无状态增量）→ 评论诊断后关闭 #162（无代码改动）。

### 第 32 轮（#120：按推荐方案 A 删除 toast.ts 死代码）

用户指令"按推荐来" → #120 单内推荐方案 A（删：零引用 2 个月 + 独立实现已满足需求 + 曾耗维护轮转）→ 复核零引用依旧（`git grep utils/toast` 空）+ 线上健康 → 建分支删 1 文件 → 本地 §6 全绿（lint 0/format/tsc 0/test 412/build Complete）→ **PR #163**（CI 全绿；无行为变化免部署）→ `--admin --squash` 合并 `d6768b8`，#120 自动关（已核对）→ main run 37006389469 全绿。#101：secret 复核仍缺，维持阻塞（无需人类之外动作）。

### 第 33 轮（验证轮：显式导航面延伸复审，无缺陷）

例行同步（main 一致、无可认领：仅 #101 阻塞、relay PR 零）→ 承 #158/第 28 轮建议，复审其余显式导航面：Header 仅外部 GitHub 链接、无自定义 Footer（Starlight 默认）、sidebar.mjs 无 /en/ 项（单语 zh 侧栏，en 行为第 20 轮已结清）、内容内链已有 internal-links 回归测试覆盖 → 核心动作：sidebar 12 个 `link:` 在 fresh main 构建产物中逐一比对 sitemap（**percent-encoding 必须 unquote 后再比**，首轮 6 条系编码假阳性）→ **12/12 在位**（含 #159 修好的 contributing）；autogenerate 目录构建全绿；sitemap-0 恰 **168 页**与 #159 的 167→168 吻合（169 系 sitemap-index 自身 loc 混入，计数时剔除）。结论：零缺陷，不建单。

### 第 34 轮（验证轮：无可选任务，主干/线上/供应链三查全绿）

新 Execution Agent 规则首轮：无 PLAN.md；唯一开放 issue #101 仍阻塞（secret 复查仍仅 CODECOV/PROJECT）→ 无 ready 任务可选 → 执行健康验证：main CI 全绿（run 37009784096 success）+ 线上 `/` 200 + `pnpm audit --audit-level=moderate` 0 漏洞 → 无需建单（auto-discovered 额度未用），无代码改动。

### 第 35 轮（Planning Agent 首次接棒：建立 PLAN/DECISIONS，M1 稳态治理开队）

**角色转换：** 本棒是**首个 Planning Agent**（此前 34 棒均为 Execution Agent）。此前**无 `PLAN.md`、无 `DECISIONS.md`** —— 路线图与长期决策只散落在 `WORKFLOW §4`/`§7.4` 与 `STATE` 叙述中，无法被机器读取。本棒补齐这两份文件并完成 backlog 治理。

**例行同步**：`git fetch --all --prune` → 树干净 → `main@78fec09` 与 origin 一致（0/0）→ 无 `LOCK`。

**真实状态核实（全部实测，非历史叙述）：**

| 维度       | 结果                                                                                                      |
| ---------- | --------------------------------------------------------------------------------------------------------- |
| `main` CI  | run `37009784096` 全绿                                                                                    |
| 线上       | `/` **200**，`content-security-policy: nonce-` ✅、`cache-control: private, no-cache, must-revalidate` ✅ |
| 供应链     | `pnpm audit` 0 漏洞                                                                                       |
| 开放 issue | 仅 **#101**（阻塞人类 Secret）                                                                            |
| 开放 PR    | 11 个，**9 个 dependabot（2026-09-28 起静置 5 天）+ #97 metrics + #96 release**                           |
| 看板       | `WORKFLOW §4` T-001..T-038 **全部已完成**                                                                 |

**三处实证红灯（本轮核心发现）：**

1. **依赖摄入近停摆（P1）** —— 9 个 dependabot PR 静置 5 天，`dependabot.yml` 的 `open-pull-requests-limit: 10` 已占 **9 位**。dependabot 每周一扫描，占满后将**无法再上报任何新依赖/安全更新**。这不是「backlog 不整洁」，是**安全更新摄入已近停摆**。
2. **wrangler peer 硬失败（P1，且比表面更严重）** —— PR #109（`@astrojs/cloudflare` 14.3.3）解析到 `@cloudflare/vite-plugin@1.62.0`，其 peer 硬断言要求 `wrangler@^4.143.0`，实装 `4.136.2` → Build exit 1（run `37000347238`）。**关键发现：adapter 声明的是浮动 `^1.53.0`（14.3.2 与 14.3.3 完全相同）**，故**任何刷新 lockfile 的操作都会在 package.json 未改的情况下让 main 构建失败** —— 当前仅靠 `pnpm-lock.yaml` 的既有 pin 保护。D-003 的「人工同步」不变量是脆弱的。另：PR #107 只把 wrangler 提到 `4.138.0 < 4.143.0`，**单独或与 #109 同合都不能解决**。
3. **发版停滞（P2）** —— release-please PR #96（v1.1.0）开放 11 天、`MERGEABLE/BEHIND`；`gh release list` 最新仍 `v1.0.2`。约两周变更未进任何 tag。
4. **记录损坏（P3）** —— `STATE.md:7` 三段重复 + 粗体未闭合 + 括号残缺；「开放 issue 现状」中 `#101` 重复两次。**本棒已修**（属 Planner 记录维护本职），剩余体检见 #166。

**本棒产出：** 新建 `.agent/PLAN.md`（阶段判定 + M1 路线图 + 明确放弃方向）、`.agent/DECISIONS.md`（D-001..D-009，含从 git 历史与既有轮次**复原**的 8 条长期决策）；新建 issue **#164/#165/#166/#167** 并逐条加 Planner 状态标注（`ready`/认领顺序/依赖/验收重点）；修复 `STATE.md` 损坏行与重复条目。

**未做（有意）：** 不逐个合并 dependabot PR（D-005 先例为批次处置）；不升级 `wrangler` major、不跟进 Starlight ≥0.42（D-003/D-004）；不重开已被既有轮次证明无缺陷的维度（第 20 轮 i18n、第 33 轮导航面 12/12）；不夹带任何功能工作（功能期已结束，见 PLAN §一）。

### 第 36 轮（Planning Agent 第 2 轮：修正 #164 失效前提 + 吸收协作方修复 + 补检测缺口）

**例行同步：** `git fetch --all --prune` → 工作区干净 → `main@f9bed16` 与 `origin/main` **0/0** → 无 `LOCK` → 本轮**无需 pull**（已一致）。

**执行验收（结论：无可验收项）：** 第 35 轮入队的 #164/#165/#166/#167 **全部仍 `status:backlog`、无 assignee、无执行评论**，`f9bed16` 之后**零新 commit**。队列不是被做坏了，是**没人接棒**（约 9h）。“无 ready 任务”不是本轮结论。

**真实状态核实（均为实测）：** `main` CI/CD Pipeline success（run `37042211284`）；线上 `/` **200**；`pnpm audit --audit-level=moderate` **0 漏洞**；开放 issue 恰 5 个（#101/#164/#165/#166/#167）；开放 PR 11 个（dependabot 9 + #97 + #96）；`gh release list` 仍 `v1.0.2`；`package.json` 仍 `1.0.2`、`wrangler` 仍 `4.136.2`。

**两个新事实（本轮核心，均推翻/补漏上一轮结论）：**

1. **peer 逐日棘轮 —— #164 的目标值 `4.143.0` 已失效。** `npm view` 实测：`@cloudflare/vite-plugin` 从 1.62.0（9-28）到 **1.62.5（10-02 11:36Z，当前 latest）** 一周连发 6 版，`wrangler` peer 从 `^4.143.0` 一路抬到 **`^4.147.0`**；并复核 `@astrojs/cloudflare` 的 `14.3.2`/`14.3.3`/`latest` 声明的 vite-plugin 范围**完全相同（浮动 `^1.53.0`）**。`pnpm-lock.yaml` 现钉 vite-plugin `1.54.8`（peer `^4.131.1`）——所以上一轮判定「任何刷新 lockfile 的操作都会踩悬崖」**仍成立且更严**。若按原目标执行，#165 批次解析会**再贴一次构建失败**。
   → 处理：**重写 #164**（锁定 vite-plugin + pin `4.147.0` 成对动作 + 「反向证据」验收），落盘 **D-010**（Planner 自主裁定，回退成本 = 删一条 override），并在 #165 补留言标出前置变化与 PR #107 作废。
2. **接力闭环看不见协作方的工作。** 第二 remote `wsyhuat/main` 的 `f98be0d`（作者 `wsy-huat`，2026-10-02T07:55Z）修了三个**线上实测存在**的首页缺陷：
    - `curl` 线上 `/`：**25** 个 `.reveal-upon-scroll`、服务端 HTML **0** 个 `data-visible`，而 `docs-global.css:871` 默认 `opacity:0` → 无 JS/脚本异常时首页大片内容永久隐藏；
    - `CoreModules.astro:60` 同时挂 `reveal-upon-scroll` + `stagger-item`（后者带 `animation ... forwards`）→ 两套动效层叠互相抵消（与 `b15e62a`「消除层叠战争」同类，属漏网）；
    - `Contributors.astro:33/40/47` 头像走 `avatars.githubusercontent.com`、兜底走 `api.dicebear.com`（两者均境外；而同一页其它图片早已本地化）。
      第 35 轮已跑过 `fetch --all`（当时该 commit 已在本地对象库），但 `.agent`/Issue **零记录** → **检测机制缺失，不是运气问题**。
      → 处理：建 **#168（P1 `ready`，无前置，与 #164 零文件重叠可并行）**；建 **#169（P2，把 inbound 巡检提升为 `WORKFLOW §1` 强制规则）**；给 **#167 正文加 `#168` 依赖边**（v1.1.0 不应带着已知缺陷）。

**关键边界判定（Planner 自决，未上升为用户决策）：** ① 移植协作方修复属工程判断，不需产品决策 → 直接建 `ready` 单；② 但**禁止 `merge wsyhuat/main`**（实测 fork 落后两周，仍含已删的 `toast.ts`、旧路径 `contributing.md`、旧 workflow）→ 写入 PLAN §六；③ D-010 可逆且不涉取舍 → 自主裁定并明写「不同意时回退成本」。

**#166 为何改由 Planner 自办：** 体检对象是 `PLAN.md`/`DECISIONS.md`/`STATE.md`/`HANDOFF.md` —— 前两者是 Planner 唯一写入点，后两者本轮均由其刷新；让 Executor 去校 Planner 的文件属错配。已跑全量断言并关单（证据见 #166 关闭评论）。

**本棒产出：** Issue — 重写 #164（标题+正文）、新建 #168/#169、改 #167 依赖段、给 #164/#165/#167/#168/#169 各留一条 Planner 标注、关闭 #166；文档 — `PLAN.md`（阶段表 +3 行、M1 队列 4→6、新增 §2.4 修正表、§三 新增一类、§四 +2 候选、§五记 D-010、§六 +3 放弃方向）、`DECISIONS.md`（+D-010）、`STATE.md`（本节）、`HANDOFF.md`（全量重写）；`WORKFLOW §7.4` 追加第 36 轮行。**零代码改动**（未碰 `src/**`、未碰依赖清单）。

### 第 37 轮（Execution Agent：#164 实现 + 上线 + 交回验收）

**同步/锁：** `fetch --all --prune` → 工作树干净 → `main@c70636c` 与 `origin/main` 0/0 → 无 LOCK → 以 `set -C` 原子建锁 `exec-20261003T002503Z`。

**开工前环境/前提复核：** node 22.23.2 + pnpm 11.22.0 就维；**`wrangler whoami` 已登录**（账号 `Iridite` = `bfdcbff6cfe16d2b9bd657593ba88f5f`，与 `wrangler.json` 的 `account_id` 一致）→ 部署验收可执行；`npm view` 复核 #164 前提**仍成立**（vite-plugin latest `1.62.5` / peer `^4.147.0` / wrangler latest `4.147.0` / adapter `14.3.3` 仍声明 `^1.53.0`）→ 按目标值开工，无需停下重定目标。

**实现（仅 3 个文件）：** `pnpm-workspace.yaml` 新增 `"@cloudflare/vite-plugin@^1.53.0": "1.62.5"` + `package.json` wrangler `4.136.2 → 4.147.0` + lock 重解析。**未碰 `src/**`、未碰测试、未碰 `dependabot.yml`。**

**过程中遇到并自修的三个问题（均为真实错误，非顺利一次过）：**

1. **`wrangler@4.147.0` 带出新的 unmet peer**：它要求 `@cloudflare/workers-types ^5.20261001.1`（原实装 `5.20260922.1`）。属 pin 跳 11 个 minor 的必然连带 → 按**既有声明范围**重新解析（lock 落 `5.20261002.1`），`pnpm peers check` 转为无告警。
2. **我误读了 `pnpm update` 的副作用**：它连带把 `package.json` 的声明范围改成了 `^5.20261002.1`，我一度当成「只动 lock」。看 `git show --stat` 发现 package.json 有 4 行变更才捕获 → **已回改 + amend**，最终净 diff = package.json **1 行** + workspace 5 行 + lock；回改后 tsc/build/test 全部**重跑取新证**（未沿用旧结果）。
3. **反向探针两次踩坑**：① 第一次用了 `--ignore-workspace`，该 flag **会跳过 `pnpm-workspace.yaml` 的 overrides**，测的其实是「无 override」（失误但意外留下对照数据）；② 在仓库内删 lock 跑 `pnpm install --lockfile-only` 得到「Already up to date」（pnpm 从 node_modules 复原，**不是真重新解析**）。→ 改用只含 3 个配置文件的隔离目录（无 node_modules/lock）才得到真证据。

**反向证据结论：** 无 override → vite-plugin 浮到 `1.62.4`（同时 adapter 浮 14.3.3、astro 浮 7.3.5）；有 override → **恰为 `1.62.5`**。浮轮是真的，且确实被堵住。

**门禁（逐项真实退出码 + 内容核对，日志存 `.tmp/gates/`）：** lint / format:check / tsc / audit 均 0；**test:run 412 passed (38 files)**；**test:e2e 95 passed**；build `[build] Complete!` 产出 entry.mjs 5665B；quality:bundle/theme/routes 三条均打印 passed；sitemap **168** 页。❗ 退出码 0 不等于成功，因此额外核了用例数与产物存在性；链式命令中 pnpm 的 deps-status 竞态会造成假失败（两次），均单命令复跑证实为 exit 0。

**交付：** PR **#170**（CI 六项全绿，含 Quality Gate 4m42s + Preview Build）→ `--squash --admin` 合入 = **`fef2a5e`** → `git pull` + `pnpm install --frozen-lockfile`（exit 0）+ 确认目标文件在位 → `pnpm deploy:worker` → Version **`e0fc4b95`**。

**线上验收：** `/` `HTTP/2 200` + HSTS + `cache-control: private, no-cache, must-revalidate`；抽查 `/`、`/docs-center/contributing/`、`/en/`、`/team/` 全 200；线上 sitemap 168；**CSP 头与 body 的 nonce 同一请求完全一致**（`Pllzey9SojRCh9kjt7_s3g`）、两次请求 nonce 不同、首页 27 个 inline script 均带 nonce。

**新发现（已建 `auto-discovered` Issue #171，未定优先级）：** `AGENTS.md` / `DEPLOYMENT.md` / D-001 写的验收串 `content-security-policy: nonce-` **在当前线上永不匹配**（实为完整策略内嵌 `'nonce-…'`）。本棒据该字面判据得到过 `MISSING` 误判 —— 差点误报部署失败。建议改用 `content-security-policy:.*nonce-`，更强的判据是**头/体 nonce 一致**。

**未做（有意）：** 不改 #164 的产品优先级/Milestone；**不关单**（D-006，因此合并时刻意避免 squash 标题命中 closing keyword）；不动 `src/**`；不顺手做 #168/#169 的代码（各自独立执行单元）；不开工 #165（其自检硬门未满足）。

## 下一步（给下一棒）

1. **（第 41 轮）进入 M2：** 第一批 ready = #178 / #179 / #180 / #181（#182 等 #181）；建议执行顺序 #178 ∥ #180 ∥ #179 → #181 → #182。旧表述： v1.1.0 发布（`af67c6d`），仅剩 #167 验收关单 + #101（人类）。旧表述： #165 已批次完成并上线（`f1ef4c4` / Version `c2cd3d43`），待 Planner 关单；关单后 #167 的两个前置即全部满足。旧表述： **#169**（inbound 巡检入 `WORKFLOW §1`，P2）与 **#171**（统一 CSP 验收串到 `AGENTS.md` + `docs/DEPLOYMENT.md`，P3；D-001 的口径本轮已先修，剩两个文案位）。**#165 已具备开工条件但需 Planner 先验收并关 #164/#168**（它的自检硬门是「#164 CLOSED」）；**#167** 等 #165。
2. **开工前自查**（避免踩已知坑）：
    - #165 开工前先确认 **#164 已 close**，且 `pnpm-workspace.yaml` 里**已存在 vite-plugin 锁定 override**（仅 pin 不够 —— 见 D-010）。
    - #167 开工前确认 **#165 与 #168 均已 close**；先发依赖与修复，后发版。
    - #168 只取 `f98be0d`（cherry-pick 保留作者），**不 merge fork 分支**；预期会让 `scroll-reveal.test.ts` 现有 2 条用例失败（**那是预期，不是回归**）。
    - #164/#165/#168 都含运行时/部署链改动 → **部署串行、后部署者先 `git pull` 再 build**（第 30 轮事故坑）。
3. **若你看到的目标值与当天 registry 不一致：** #164 正文已写「默认不追新」，按锁定值执行；确需改目标则**停下留「等待 Planner 重定目标」评论**，不要自行改路线（peer 链是硬约束）。
4. ~~**D-009 待人类裁决**~~ ✅ **已裁决（2026-10-03）**：授权批次处置；**逐个合并自动 PR 仍禁止**，不得用 `--admin` 单独 merge 任何 dependabot PR。
5. **Planner 验收纪律（D-006）：** Executor 完成后**留结果评论、不要自行关单**；由 Planner 逐条对照验收标准核对后才关单。
6. 每轮开始仍按 `docs/WORKFLOW.md:§1/§3`：fetch → pull → **跑一遍 inbound remote 巡检**（本轮已加入 HANDOFF §六命令速查，#169 负责把它升为强制规则）→ 读本文件 + `PLAN.md` + `DECISIONS.md` + HANDOFF → 检查锁 → 选 `ready` 任务（P0>P1>…、Milestone 优先、编号小优先）。
7. **合并马拉松方法沉淀（第 22 轮）：** 独立分支逐个 `merge main`（records 取分支侧、`§7.4` 用行并集脚本合）→ 每分支 CI 核心 5 项绿 → `--admin --squash` 合并；链式堆叠分支只合链顶、其余标 superseded 关；squash 默认消息会带入全部分支 commit subject（`docs: #N` 的需手动补关）。
8. **记录类文件可直推 main（D-008）**；代码/文档修复仍走分支 + PR。

## 阻塞项

- 🔴→✅ **#173 已解（第 37 轮续）**：两条 high 公告（`http-cache-semantics <=4.2.0` / `braces <=3.0.3`）**上游没发补丁**（GitHub 告警 #187 `patched: null`）→ 无代码解法。用户授权采纳方案 ②：PR **#174** = `pnpm quality:audit` + `.config/audit-allowlist.json`（带 `reason`/`issue`/`expires` 的豁免清单；**级别不变、未知公告仍失败、条目到期仍失败**）。**到期日 2026-10-17**，届时必须核对上游是否已发 `4.2.1` / `3.0.4`。策略已立为 **D-011**。
- **#101**：需人类配 `CLOUDFLARE_API_TOKEN` Secret（本轮复核仍缺；**配好前不要把 deploy job 加回 CI**）。
- ~~D-009 裁决~~：✅ 已裁决（2026-10-03），**不再阻塞 #165。**
- ~~#166~~：本轮 Planner 自办并关闭，已从队列移除。
- 人类侧待办（均需凭据/仓库设置，Agent 不可自决；**均不阻塞 M1**）：`PROJECT_TOKEN` 值/权限复核 + `projects/1` 是否存在；`size:xs` 手工建 label（补 `issues: write` 会扩大 `pull_request_target` 权限面）；`update-linked-issues` 补权限还是删除；是否把协作方贡献改为正式 fork PR 流程（属 Settings，默认方案：保持「fork 直提 + Planner 巡检 + 建单移植」）。
- ~~#120~~：已于第 32 轮关闭。**当前无任何由 Planner 造成的执行阻塞。**
