# Agent 接力状态（STATE）

> 本文件由“时间流接力开发”的每一棒追加/更新，与 `docs/WORKFLOW.md:§4/§7.4` 保持一致。
> 只记录进度/下一步/阻塞，不复制看板全表。**详细交接与命令速查见 `.agent/HANDOFF.md`。**

**最后更新：** 2026-10-01T13:00Z ｜ **当前 agent-id：** `muse-spark-20261001T114700Z` ｜ **状态：** 第 22 轮完成（14 PR 全合并，main 已解锁），进行中（无操作计数 0/5）
**主干：** `main@35e1abc`（CI 全绿：Audit/Lint/Type/Tests/Build/QualityGate/Preview）｜ **已关 issue：** #121/#123/#125/#126/#128/#130/#132/#134/#136/#138/#140/#142/#144/#146/#148（15 个）｜ **开放：** #101（人类配 Secret）、#120（question）

> 第 22 轮合并马拉松完成：按用户指令 review+merge 全部 14 PR —— #122→#124→#127→#129→#131→#133→#135→#137 逐个同步 main（records 取分支侧、§7.4 取并集）+ 链顶 #149 一次性带入 #138/#140/#142/#144/#146/#148（被替代 PR #139/#141/#143/#145/#147 已关闭）。`--admin` 合并系人类明确授权 + 每分支 CI 核心 5 项全绿后执行（分支保护的 review 对象 + 永不满足的 `quality-gate` 上下文只能由 admin 绕过，质量本身未绕）。验收：§7.4 共 89 行（基线 71 + 18）、`grep -rn '^<<<<<<<'` 无输出、main run 36863298437 全绿。

## 当前活跃任务

- 无（第 22 轮已合并全部 14 PR，15 个 issue 全关）。main 已解锁，可直推记录文件、可正常建单走分支。
- **新候选（此前被 #122/#124 阻塞，现已解锁）**：
    1. README 部署行 ACCOUNT_ID 漂移（`README.md:70`/`README.en.md:71`，参照 #130 文案，2 行）——见§已观察第 1 条。
    2. `format:check` 剩余缺口（扩展名集 `md`/`yml`/`astro` + `.github/` 目录集，24 文件归一，yml 语义敏感宜逐个确认）——见§已观察第 3 条。

## ⚠️ 重要警告（给下一棒）

**main 直推冻结已解除**（第 22 轮）：`main@35e1abc` CI 全绿（含 Audit，run 36863298437）。记录文件（`.agent/**`、`docs/WORKFLOW.md:§7.4`）恢复惯例直推；代码/文档修复仍走独立分支+PR（WORKFLOW §5）。

> 历史备注（冻结期 2026-09-30~2026-10-01）：`pnpm audit` 公告晚于主干最后绿 run，`#122` 合并前禁直推 main；`gh run list --branch main --limit 100` 的 60 个 failure 全是 2026-09-29T15:00Z 前历史（时间窗假象，坑 20 变体）。

## 开放 issue 现状

- **#101**（P1）：阻塞人类配 `CLOUDFLARE_API_TOKEN` Secret，跳过。
- **#120**（P3，`question`）：toast.ts 删留等人类决策，跳过。
- **#121/#123/#125/#126/#128/#130/#132/#134/#136/#138/#140/#142/#144/#146/#148**：第 22 轮已合并关闭（#122/#124/#127/#129/#131/#133/#135/#137 squash 落 main；#139/#141/#143/#145/#147 被链顶 #149 替代关闭，issue 逐一手动关并注明）。
- 开放 PR：无（本棒 14 个全关：9 merged + 5 superseded-closed）；#97 metrics、#96 release-please、#106~#114 dependabot 全是自动 PR，**协议禁止自动 merge，不碰**。

## 已观察、未建单（待时机）

- **README 部署行 ACCOUNT_ID 漂移**（新建候选 1，已解锁）：`README.md:70` / `README.en.md:71` 写 `pnpm deploy:worker`「需 `CLOUDFLARE_API_TOKEN/ACCOUNT_ID`」——参照 #130 的 Makefile 文案改（`CLOUDFLARE_API_TOKEN` only + ACCOUNT_ID 由 wrangler.json 提供，2 行）。
- **GitHub Project 看板 URL**：`docs/PROJECT_MANAGEMENT_MODEL.md:10` 的 `projects/1` 匿名 404——gh token 缺 `read:project` scope 无法验证（私有看板可能 404），**不可判定不建单**；另 `add-to-project` 在 run 36742311392 报 `PROJECT_TOKEN` Bad credentials，需人类轮换/确认。若后续能验证确实不存在，改指向 `docs/WORKFLOW.md:§4`。
- **`format:check` 覆盖缺口的剩余部分**（新建候选 2，已解锁）：#140 只补了 `scripts/` 目录集；**扩展名集**（漏 `md`/`yml`/`yaml`/`astro`）与 **`.github/` 目录集**仍缺——此前测得全仓不合规 26 项中 `.github/` 15 个 yml（纯引号风格）、`src/content/docs/**` 7 个 `.md`、`docs/components/COMPONENTS.md` 1 个。**建单时注意**：扩全量需一次性归一 24 个文件（含 workflow，语义敏感宜逐个确认）。

- **i18n 中英对称性已结清**（第 20 轮验证，无缺陷）：en 侧用翻译后 slug，路径集合差（zh 缺 24 / en 缺 36）**不可直接判缺**；5 个 en 中文文件名文件是**有意重定向 stub**（线上旧路由 200 → 新 slug 200），其余为单语内容，**语言切换器对缺失语言正确省略**（无死链）。复查时**先分类再判缺陷**，别拿路径差直接建单。
- **门禁自审计已覆盖两侧**（第 15-16 轮）：`format:check`（#140）与 `eslint`（#142）的 CI 脚本覆盖面均已补齐到「配置/hook 声明的范围」。**剩余已知缺口**：`format:check` 的扩展名集（`md`/`yml`/`astro`）与 `.github/` 目录集未补（24 个文件待归一，yml 语义敏感）；`pnpm lint` 未设 `--max-warnings`（有意，阻断策略属人类决策）；`tsc --noEmit` 不覆盖 `tests/**`（预防性，见下条）。

- **测试文件未纳入 tsc**：`tsconfig.json` include 仅 `src/**`，`tsc --noEmit` 不覆盖 `tests/**`（vitest 用 esbuild 不查类型）——预防性缺口、当前无实证缺陷，且纳入可能暴露存量类型错需连带修复，**暂不建单**（保守原则）。

## 本棒已完成

### 第 1 轮（#121）

门禁首关 `pnpm audit` 实测 5 漏洞 → 建单 **#121** → override 提下限（brace-expansion 5.0.12 / fast-uri >=4.1.5）+ lockfile 重解析 → 门禁全绿（audit 0 / lint / format / tsc / test **412** / build / bundle / theme）→ `1b3851b` → **PR #122** → CI **7/7 success**。

### 第 2 轮（#123）

主动扫描 → README **4 死链 + 结构树失真 + en 命令表破损** → 建单 **#123** → 修 2 文件（+9/−14）→ 链接复扫 68 条 0 broken → `ea55094` → **PR #124** → CI Lint/Type/Tests 绿。

### 第 3 轮（#125）

全仓 `70/60/70/70` 扫描 → README 阈值描述与实际 80/80/80/80 不一致 → 建单 **#125** → 修 2 行 `49f18a1` → **折入 PR #124**（同表格相邻行，独立分支必冲突实测确认）→ CI run 36716822328 绿（Audit 既有红，已回评 #125）。

### 第 4 轮（#126）

扫描 4 项全清（md 锚点 0 broken〔GitHub slug 去句点规则〕/ pnpm 脚本与 make 目标全存在 / src TODO 0 / 内容 en 90 在位）→ `docs/` 索引比对 → **树缺 `CONTRIBUTING-content.md`/`HANDOFF-2026-09-19.md`/`agents/`** → 建单 **#126** → +3 行 `835be3b` → 集合比对 16==16 → **PR #127** → CI Lint/Type/Tests 绿。

### 第 5-7 轮（无操作 ×3，计数 3/5）

- 第 5 轮：同文件锚点 0 broken、engines/node 22 一致、public 孤儿扫描不可靠（动态 srcset 构造，不建单）、sitemap **167/167 全 200**、`_headers`↔`security.ts` 一致、首页 30 资源 200、7 安全头齐。
- 第 6 轮：35 重定向全通（源 3xx 目标 200）；65 核心文档外链 404 全定性为占位符/示例/历史快照/不可判定私有看板 → 0 真死链。
- 第 7 轮：测试无 `.only/.skip`、无旧域名、`SITE_URL` 正确、manifest 链接与 3 图标齐。

### 第 8 轮（#128，计数清零）

协议完整性扫描（密钥/env/大二进制 **0 泄漏**）→ >500KB 文件 md5 唯一重复对 = 两份 23.5MB webm，副本 `planning-and-control/showcase.webm` 全仓零引用 → 建单 **#128** → `git rm` `945d951` → 门禁全绿（test 412/build，产物含正本 chunk）→ **PR #129** → CI 与声明一致。

### 第 9 轮（#130）

复盘第 3 轮 `--include` 扩展名过滤漏洞 → `git grep` 全量扫 `70/60/70/70` + `TOKEN/ACCOUNT_ID` → 发现 **Makefile 三处漂移**（`:87` help 阈值、`:123` 部署行 ACCOUNT_ID、`:144` audit 仅 `--prod` 与 CI 全量 moderate 口径分裂实测 2 vs 5）→ 建单 **#130** → 修 3 处（4 行）`81582c2` → 断言：`make help` 0 残留 + 新文案在；`make audit` 实跑 5 与 `ci-cd.yml:78` 同命令同结果；§6 全绿（lint/format/tsc/test 412/build）→ **PR #131**。另：**#121 发更正评论**（fast-uri ×2 prod 声明链、无需部署结论经 dist grep 验证不变）。

### 第 10 轮（Quality Gate 本地全量验证，无新 issue）

例行同步：main 仍 `46f53f4`、5 个 PR 全 OPEN、无可认领 issue（#101/#120 仍阻塞）、无他人新活动、main 的 ci-cd 最新 run 全绿（早前一次查询浮出的 3a49e03/3852436「failure」复现为 API 瞬时异常，重查一致为全绿）。

转验证模式（CI Quality Gate 因 needs-audit **全程跳过**，#122 合并后会重新激活——提前本地排雷）：

1. **E2E**：`pnpm test:e2e` → **95/95 passed**（18.6s，webServer `preview:ssr` 自动起）——本会话首次全量 e2e。
2. **预算三件套**：`quality:theme` ✅ / `quality:bundle` ✅（Top CSS 120.89KB）/ `quality:routes` ✅。
3. **LHCI**：collect 4 URL（`/`、`/docs-center/`、`/team/`、`/join/`）+ assert **exit 0**（仅 warn：FCP 2350ms>2000、join 页 color-contrast、INP auditRan；error 级 perf≥0.8/title/lang/alt 全过）。
    - ⚠️ **本机是 WSL2**（`6.18.33.2-microsoft-standard-WSL2`）：chrome-launcher 走 WSL 分支，会话 PATH 无 `/mnt/c/Users/...` 段 → 临时目录构造成 `undefined:/Users/undefined/...` 报 ENOENT。**绕过**：`PATH="/mnt/c/Users/21711/AppData/Local:$PATH"` + `CHROME_PATH=~/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome`（坑 19）。**纯本地环境问题，CI ubuntu-latest 不受影响**（历史 Quality Gate 7/7 绿含 LHCI）。
    - 运行副产物：chrome-launcher 在 CWD 造出 4 个 `C:\Users\...` 字面量目录，已清理（未入库）。

**结论**：Quality Gate 五环节本地全绿 → #122 合并后 4 个功能 PR（#124/#127/#129/#131）rebase 转绿的置信度完整（这些 PR 均不改动 LHCI 审计页面与运行时产物）。

### 第 11 轮（#132，主动发现）

例行同步（main `46f53f4` / 6 PR 全 OPEN 且全 MERGEABLE / 无可认领 / main ci-cd 全绿）→ 延展第 9 轮发现模式做全仓 `git grep` 复扫：`70/60/70/70` 全部命中均为已知/豁免（README 待 #124、ROADMAP 快照、WORKFLOW 日志、本轮记录自身）、`audit --prod` 零残留、**`CLOUDFLARE_ACCOUNT_ID` 命中 `docs/PROJECT_MANAGEMENT_MODEL.md:192/215`** → 读上下文确认该发布部署小节停留在 2026-08-28 口径（称「✅ 自动部署已恢复」、要求配 ACCOUNT_ID、发版首选写 push main、手动兜底标签颠倒、`DEPLOYMENT.md:22` 行号漂移），**T-033 口径同步白名单漏掉此文件**（AGENTS.md/DEPLOYMENT.md/WORKFLOW §3 都改了）→ 查重（无重复单；与 #101 关联非重复：#101 恢复动作、本单文档口径）→ 建单 **#132** → 修 5 处（10 行替换）`10aba9c` → 断言：ACCOUNT_ID 仅剩否定式 ×2 / 无「自动部署已恢复」/ 无 `:22` 引用 / 三方口径交叉核对（AGENTS.md:22/24 + DEPLOYMENT.md:20/36 + ci-cd.yml:153 及顶层 job 无 deploy）→ §6 全绿（lint/format/tsc/test 412/build）→ **PR #133**（与 #122/#124/#127/#129/#131 文件零交集）。恢复类表述全部条件式化——**#101 完成后本文件无需回改**。

### 第 12 轮（#134，主动发现）

例行同步（main `46f53f4` / 7 PR 全 OPEN / 无可认领 / main ci-cd 双查全绿〔坑 20〕）→ 本轮验证第 9 轮改动的连锁主张：① `pnpm test:coverage` 实跑 **exit 0**（80/80/80/80 阈值实证通过，CI Tests job 同口径全绿）；② `.agent/LOCK` 机制核对 = `.agent/.gitignore` 设计内本地锁 + WORKFLOW:150 §7.4 认领行权威，无漂移不建单；③ **`quality:lighthouse` 脚本可执行性** → 发现两处失效合并建单 **#134**：A=`package.json:60` 调裸 `lhci` 而依赖未装（干净检出必挂，Makefile/README×2/ARCHITECTURE 四处在教死命令，CI 内联 dlx 掩盖）；B=`lighthouserc.json` **重复键** `categories:performance`（T-022 `860253d` 意图 error0.80+warn0.85 双档，JSON 后者覆盖 + LHCI 加载器 `:78` require() last-wins 实证）→ **error 底线静默失效**。修 3 文件 `d43dfe9`：脚本改 `pnpm dlx @lhci/cli@0.15.1`（与 `ci-cd.yml:148-149` 程序化逐字节比对 MATCHES，零依赖零 lockfile）+ 删重复键恢复 `error@0.8` + ARCHITECTURE `:250/:276` 口径。验证：修复前 `lhci not found` 复现 → 修复后 `pnpm quality:lighthouse` 端到端 **exit 0**（4 URL collect+assert）；第 10 轮实测分数 91/97/95/97 证 error@0.80 余量 11+ 分；§6 全绿 → **PR #135**。**踩坑**：commitlint `footer-max-line-length≤100`（坑 21，两次提交被拒后折行通过）。

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

## 下一步（给下一棒）

1. **新候选建单**（main 已解锁，直接走分支+PR）：① README 部署行 ACCOUNT_ID（2 行）；② `format:check` 剩余缺口（24 文件，yml 逐个确认）。
2. **人类待办**：`PROJECT_TOKEN` 轮换/确认 + projects/1 是否存在；`update-linked-issues` 补权限还是删除；`size:xs` 手工建 label；#101 配 Secret；#120 裁决 toast.ts。
3. 每轮开始仍按 `docs/WORKFLOW.md:§1/§3`：fetch → pull → 读本文件 + HANDOFF → 检查锁 → 选任务。
4. **合并马拉松方法沉淀（第 22 轮）**：独立分支逐个 `merge main`（records 取分支侧、`§7.4` 用行并集脚本合）→ 每分支 CI 核心 5 项绿 → `--admin --squash` 合并；链式堆叠分支只合链顶、其余标 superseded 关；squash 默认消息会带入全部分支 commit subject（含 `fix: #N`，多数 issue 自动关，`docs: #N` 的需手动补关）。

## 阻塞项

- **#101**：需人类配 `CLOUDFLARE_API_TOKEN` Secret（此前不要把 deploy job 加回 CI）。
- **#120**：toast.ts 删留二选一，等人类。
- 人类侧：`PROJECT_TOKEN`、`size:xs` label、`update-linked-issues` 去留（见上）。
