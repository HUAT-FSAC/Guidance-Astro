# Agent 接力状态（STATE）

> 本文件由“时间流接力开发”的每一棒追加/更新，与 `docs/WORKFLOW.md:§4/§7.4` 保持一致。
> 只记录进度/下一步/阻塞，不复制看板全表。**详细交接与命令速查见 `.agent/HANDOFF.md`。**

**最后更新：** 2026-10-02T12:15Z ｜ **当前 agent-id：** `muse-spark-20261002T121515Z` ｜ **状态：** 第 32 轮完成（#120 按推荐方案 A 删除+PR #163 合并；#101 复核仍缺 Secret），进行中（无操作计数 0/5）
**主干：** `main@d6768b8`（CI 全绿 run 37006389469；线上 Version `73738007` 健康，本轮删死代码无运行时影响、无需部署）｜ **活跃：** 无 ｜ **开放：** #101（人类配 Secret，仍阻塞）

> 第 22 轮合并马拉松完成：按用户指令 review+merge 全部 14 PR —— #122→#124→#127→#129→#131→#133→#135→#137 逐个同步 main（records 取分支侧、§7.4 取并集）+ 链顶 #149 一次性带入 #138/#140/#142/#144/#146/#148（被替代 PR #139/#141/#143/#145/#147 已关闭）。`--admin` 合并系人类明确授权 + 每分支 CI 核心 5 项全绿后执行（分支保护的 review 对象 + 永不满足的 `quality-gate` 上下文只能由 admin 绕过，质量本身未绕）。验收：§7.4 共 89 行（基线 71 + 18）、`grep -rn '^<<<<<<<'` 无输出、main run 36863298437 全绿。

## 当前活跃任务

- **#150/#152**（均已关）：#151/#153 经人类 review（chat 明确"没问题，继续"）后 `--admin --squash` 合并（分支保护 review 对象 + 永不满足的 `quality-gate` 上下文，只能 admin；两 PR CI 事先全绿含 QualityGate）；body `Closes` 自动关（`docs:`/`fix:` 均生效，已核对 #150/#152 closed）。
- **#154/#156/#158/#160**（均已关，第 30 轮合并，细见下）：① #161 → 部署；② #159 → 部署；③ #155；④ #157。body `Closes` 自动关已核对；线上 Version `73738007`。
- **#120**（P3，本轮结清）：用户指令"按推荐来" → 执行单内推荐方案 A（删）：删前复核全仓 `utils/toast` 零引用依旧 + 线上 200/200 健康 → `git rm src/utils/toast.ts`（443 行）→ 本地 §6 全绿（lint/format/tsc/test 412/build）→ **PR #163**（CI 全绿；删除无行为变化，**无需部署**）→ `--admin --squash` 合并，body `Closes` 自动关 #120（已核对）。
- 无其他活跃任务（#101 等人类）。

## ⚠️ 重要警告（给下一棒）

**main 直推冻结已解除**（第 22 轮）：`main@35e1abc` CI 全绿（含 Audit，run 36863298437）。记录文件（`.agent/**`、`docs/WORKFLOW.md:§7.4`）恢复惯例直推；代码/文档修复仍走独立分支+PR（WORKFLOW §5）。

> 历史备注（冻结期 2026-09-30~2026-10-01）：`pnpm audit` 公告晚于主干最后绿 run，`#122` 合并前禁直推 main；`gh run list --branch main --limit 100` 的 60 个 failure 全是 2026-09-29T15:00Z 前历史（时间窗假象，坑 20 变体）。

## 开放 issue 现状

- **#101**（P1）：阻塞人类配 `CLOUDFLARE_API_TOKEN` Secret，跳过。
- **#120**：第 32 轮按推荐方案 A 删除并合并关闭。
- **#101**（P1）：复核 secret 仍仅 CODECOV/PROJECT（`CLOUDFLARE_API_TOKEN` 未配），deploy job 加回仍阻塞；线上 OAuth 路径健康（200/200）。
- **#121/#123/#125/#126/#128/#130/#132/#134/#136/#138/#140/#142/#144/#146/#148**：第 22 轮已合并关闭（#122/#124/#127/#129/#131/#133/#135/#137 squash 落 main；#139/#141/#143/#145/#147 被链顶 #149 替代关闭，issue 逐一手动关并注明）。
- **#150/#152**：已合并关闭（body `Closes` 自动关，已核对）。
- **#154/#156/#158/#160**：第 30 轮已合并关闭（body `Closes` 自动关，已核对）。
- **#162**：rp 在 `bd30e3f` 的失败告警——GitHub GraphQL 瞬时故障（前后 run 全绿，#96 管线正常），已诊断关闭（见第 31 轮），无代码改动。
- 开放 PR：无（relay PR 全合；#155/#157 合并无需部署）；#97 metrics、#96 release-please、#106~#114 dependabot 全是自动 PR，**协议禁止自动 merge，不碰**。

## 已观察、未建单（待时机）

- **GitHub Project 看板 URL**：`docs/PROJECT_MANAGEMENT_MODEL.md:10` 的 `projects/1` 匿名 404——gh token 缺 `read:project` scope 无法验证（私有看板可能 404），**不可判定不建单**；另 `add-to-project` 在 run 36742311392 报 `PROJECT_TOKEN` Bad credentials，需人类轮换/确认。若后续能验证确实不存在，改指向 `docs/WORKFLOW.md:§4`。
- ~~**`format:check` 覆盖缺口的剩余部分**~~（已结清，第 24 轮 #152）：md/`.config`/`.github`/根 md/public/src-md 7 组 glob 已补 + `.prettierignore` 冻结快照；剩余 `yml/yaml/astro/mdx` 为**有意不做**（hook 未覆盖/`*.astro` 无 parser 实证），不再建单。

- **i18n 中英对称性已结清**（第 20 轮验证，无缺陷）：en 侧用翻译后 slug，路径集合差（zh 缺 24 / en 缺 36）**不可直接判缺**；5 个 en 中文文件名文件是**有意重定向 stub**（线上旧路由 200 → 新 slug 200），其余为单语内容，**语言切换器对缺失语言正确省略**（无死链）。复查时**先分类再判缺陷**，别拿路径差直接建单。
- **门禁自审计已覆盖两侧**（第 15-16 轮 + 第 24 轮 #152 收尾）：`format:check`（#140→#152）与 `eslint`（#142）均已对齐到 hook 声明范围（7 组 glob + `.prettierignore`）。**剩余均为有意不做**：`yml/yaml/astro/mdx`（hook 未覆盖/`*.astro` 无 parser 实证）、历史快照冻结；`pnpm lint` 未设 `--max-warnings`（阻断策略属人类决策）；`tsc --noEmit` 不覆盖 `tests/**`（预防性，见下条）。

- **测试文件未纳入 tsc**：`tsconfig.json` include 仅 `src/**`，`tsc --noEmit` 不覆盖 `tests/**`（vitest 用 esbuild 不查类型）——预防性缺口、当前无实证缺陷，且纳入可能暴露存量类型错需连带修复，**暂不建单**（保守原则）。

## 本棒已完成

### 第 13 轮（#136，主动发现）

例行同步（main `46f53f4` / 8 PR 全 OPEN / 无可认领 / main ci-cd 双查——首查再现 3a49e03/3852436 幽灵行，深查 100 run 证明 failure 19 个全为本棒分支 Audit 红、main 零失败，坑 20 证据加固）→ 延展 #132 模式做**全仓 `file:line` 引用内容级核验**（55 处，三级解析+逐条比对）→ 9 处内容漂移（5 文件）→ 查重无重复 → 建单 **#136** → 修 16 行 `f48d2c3`：astro.config `:11/:12/:147`→`:67/:68/:204`、middleware.ts:19→三段式新路径、CONTRIBUTING 改 §5/§6 章节引用、§7.6 og-image png→jpg（补 T-038 遗漏）、TODOLIST Hero 路径 ×8 → **PR #137**。验证：6/6 内容断言 PASS、旧模式 0 残留、§6 全绿。

### 第 14 轮（#138，主动发现）

例行同步（main `46f53f4` / 9 PR 全 OPEN / #122 未合并故无可认领 / #101/#120 仍阻塞）→ 延展 #134「文档教的命令要实跑复现」做全仓命令引用核验（`pnpm`/`npm run`/`make`/`pnpm exec`/`npx`，20 候选）→ 排除散文误报 + `pnpm exec tsc --noEmit` 三方一致（Makefile:76 / ci-cd.yml:42）+ 归档快照豁免后**实锤 1 处双失效** → 建单 **#138** → 修 `a2e5853`（2 文件）：`pnpm exec sharp-cli`（未装依赖，`Command not found`）改 `pnpm dlx sharp-cli --format webp`（6.x 尾参 `webp` 报 `Unknown argument`，沙箱实跑修正）、裸 `scripts/optimize-images.mjs` 改 `node` 前缀 + 硬编码 `/workspace/*` 改脚本位置解析仓库根（仓库无 `.devcontainer`，该路径本项目任何环境都不存在，脚本静默空跑）→ **PR #139**。195 行 diff 已证等价（main 原文件本就不 prettier 干净，lint-staged 强制归一；`prettier(原版+语义改动)` ≡ 提交版）。沙箱假仓实跑脚本 exit 0。§6 全绿。

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

## 下一步（给下一棒）

1. **本轮合并已完成**：#163 落 main，#120 自动关已核对；开放 relay issue/PR 已清零（仅 #101 阻塞）。
2. **新候选**：侧边栏 link 解析法可延伸到**导航 nav/页脚/LanguageSwitcher 等其余显式链接面**（第 28 轮只做了 sidebar.mjs）；其余观察项均已清空（workflow 注释经 #148/#156 两轮复审全清；`--max-warnings`/tsc-tests 预防性缺口留人类）。或等人类（#101 Secret、#120 裁决）。
3. **人类待办**：`PROJECT_TOKEN` 轮换/确认 + projects/1 是否存在；`update-linked-issues` 补权限还是删除；`size:xs` 手工建 label；#101 配 Secret；#120 裁决 toast.ts。（本轮起免 review 自主推进：新 PR 合并无需等待人类指令，但仍需 CI 全绿。）
4. 每轮开始仍按 `docs/WORKFLOW.md:§1/§3`：fetch → pull → 读本文件 + HANDOFF → 检查锁 → 选任务。
5. **合并马拉松方法沉淀（第 22 轮）**：独立分支逐个 `merge main`（records 取分支侧、`§7.4` 用行并集脚本合）→ 每分支 CI 核心 5 项绿 → `--admin --squash` 合并；链式堆叠分支只合链顶、其余标 superseded 关；squash 默认消息会带入全部分支 commit subject（含 `fix: #N`，多数 issue 自动关，`docs: #N` 的需手动补关）。

## 阻塞项

- **#101**：需人类配 `CLOUDFLARE_API_TOKEN` Secret（此前不要把 deploy job 加回 CI）。
- **#120**：toast.ts 删留二选一，等人类。
- 人类侧：`PROJECT_TOKEN`、`size:xs` label、`update-linked-issues` 去留（见上）。
