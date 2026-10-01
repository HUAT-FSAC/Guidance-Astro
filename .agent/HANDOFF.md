# 交接说明（HANDOFF）

**本棒 Agent：** `muse-spark-20261001T114700Z`（第 21–27 轮）
**时间：** 2026-10-01T11:47Z 起（UTC），第 21-27 轮完成
**仓库 / 分支：** `HUAT-FSAC/Guidance-Astro` ｜ 主干 `main@912fd4e`
**状态：** #121–#152 全关；活跃 #154 → PR #155、#156 → PR #157（CI 均全绿，待人类 review+merge）；开放 #101、#120、#154、#156

> 下一棒请先按 `docs/WORKFLOW.md:§1/§3` 与 `AGENTS.md` 的「发布与部署」执行：
> `git fetch --all --prune` → `git pull --rebase` → 读 `.agent/STATE.md` + 本文件 → 检查 `.agent/LOCK` → 选任务。
>
> 第 22 轮已合并全部 14 PR，本节"分散在十四个分支"的预警**已失效**（历史保留）。合并方式：#122→#124→#127→#129→#131→#133→#135→#137 逐个同步 main 后 squash；链顶 #149 一次带入 6 个修复，被替代的 #139/#141/#143/#145/#147 已关闭。`docs/WORKFLOW.md:§7.4` 共 89 行（基线 71 + 18），无冲突标记。

---

## 一、本棒做了什么（第 21–27 轮）

| 轮  | 结果                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | 产出    |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| 21  | 上棒 1-20 轮结论全部沿用（13 PR 全 OPEN 且 MERGEABLE、main 基线 `46f53f4` 未变、审计维度 #121–#146 闭环）→ **工作流自动化配置审计**（承 #146 维度）：通读 `project-automation.yml` 实锤**两处失效**建单 **#148**（`check-milestone-deadline` 永不运行：无 schedule 触发 + 恒假条件 + 预警写死已合并 PR #1；`update-issue-status` 空转：只 log 不写）→ 修 `b247567`（两处 `if: false` 显式禁用 + NOTE 注释，零行为变更）→ **PR #149**；YAML 解析 OK + 旧可执行条件 0 残留 + §6 全绿（lint/tsc/format/test 412/build）；**有意未动** `update-linked-issues` 权限与 `PROJECT_TOKEN` 凭据（留人类） | PR #149 |

> 上棒 1-20 轮明细见本文件 git 历史（`git show origin/auto/mimo-flash-20260930T113551Z/146-labeler-and-semantics:.agent/HANDOFF.md` 第一节表格）。
> | 22 | **合并马拉松**（用户指令）：分支保护要求 1 review + `quality-gate` 上下文（永不满足）+ enforce_admins=false → `--admin --squash` 是唯一路径，每分支 CI 核心 5 项绿后执行 · 顺序 #122（解冻 Audit）→ #124/#127/#129/#131/#133/#135/#137（records 取分支侧、§7.4 行并集）→ 链顶 #149 带入 6 修复（#139/#141/#143/#145/#147 标 superseded 关；`docs: #144` 手动补关，其余 `fix: #N` 自动关）· main@35e1abc run 36863298437 **全绿**（Audit/Lint/Type/Tests/Build/QualityGate/Preview）· 纠错两处：merge-commit 的 `show --stat` 是 combined diff（须三点 diff 核对）；第 21 轮记录曾替换掉 §7.4 第 20 轮行，已从 `2d08c90` 补回（89=71+18） | main 解锁 |
> | 23 | **README 部署行 ACCOUNT_ID 漂移**（§已观察第 1 条，第 9 轮因 PR #124 拆行冲突推迟）：复核 `README.md:70`/`README.en.md:71` 仍写 TOKEN/ACCOUNT_ID，与 Makefile:123 + DEPLOYMENT:36 + AGENTS.md 矛盾 → 建单 **#150** → 修 2 行（对齐 Makefile 文案 + prettier 表格重对齐，`git stash` 对照证语义仅 2 行）→ **PR #151**（CI 核心 5 项绿；docs-only 无需部署；**留待人类 review+merge**，新工作无合并授权） | PR #151 |
> | 24 | **`format:check` 剩余缺口**（§已观察第 3 条）：精确重测 hook 覆盖 287 − CI 覆盖 = 154 盲区，剔除生成物/快照后有意义缺口 **50 文件**，全量 check 仅 20 脏、活文件仅 2 个 → 排除实证：`*.astro` 无 parser、`*.yml`/`*.mdx` hook 未覆盖（均不扩）→ 建单 **#152** → `format`/`format:check` 扩 7 组 glob + 新增 `.prettierignore` + 归一 2 文件 → **PR #153**（精确命中 + 反向注入 exit 1 + §6 全绿；留待人类合并） | PR #153 |
> | 25 | **合并落 main + LHCI 抖动实锤**（人类 review 通过"没问题，继续"后 `--admin --squash`）：#151/#153 落 main@9e41da7，#150/#152 靠 body `Closes` 自动关（`docs:`/`fix:` 均生效，已核对）；main 首跑 QualityGate `/` perf 0.59 失败 → 同 SHA `--failed` 重跑转绿（run 36879855991 全 success），并案 `d95cc55`（纯记录 commit）同 job 0.77 失败 —— 实锤抖动非回归 | main 全绿 |
> | 26 | **LHCI 抖动加固**（§已观察项转活跃）：建单 **#154**（证据 0.59/0.77 + 同 SHA 重跑转绿；T-022 冷机 0.83 余量薄）→ `numberOfRuns: 1→3` 1 行（assert 取中位数，0.8 error 档不动；下调阈值/改 warn 明确不做）→ **PR #155**（CI 全绿：核心 5 项 + QualityGate `12 total runs` 中位数断言过 + Preview；本地 JSON 解析 + format 全过 + lint/tsc/test；留待人类合并） | PR #155 |
> | 27 | **workflow 注释口径漂移 part 2**（承 #148 三元组法，复审剩余 6 个 workflow；行为侧全清）→ 建单 **#156**：A=release-please 头部 T-021 整段过期（闸 09-22 已开、#85 已合并、无 PAT 下自开 #96 为 e2e 铁证，与 §4 终局行矛盾）+ B=stale 头部 allowlist 虚假描述（无 `labels:` 过滤，实为 denylist）→ 修 2 文件纯注释（diff 逐行全 `#`，`yaml.safe_load` jobs 不变）→ **PR #157**（CI 全绿；留待人类合并；ROADMAP:39/ dated 快照有意不碰） | PR #157 |

| 轮  | 结果                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | 产出    |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| 1   | `pnpm audit` 实测 **5 漏洞** → 建单 **#121** → override 提下限 + lockfile 重解析 → 门禁全绿 → `1b3851b` → **PR #122** → **CI 7/7 success（含 Audit）**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | PR #122 |
| 2   | 主动扫描 → README **4 死链 + 结构树失真 + en 命令表破损** → 建单 **#123** → 修 2 文件 → `ea55094` → **PR #124** → CI Lint/Type/Tests 绿                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | PR #124 |
| 3   | `70/60/70/70` 扫描 → README 阈值过时（实际 80/80/80/80）→ 建单 **#125** → 修 2 行 `49f18a1` → **折入 PR #124**（同表格相邻行必冲突实测）→ `Closes #125`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | PR #124 |
| 4   | 锚点/脚本/TODO/内容 4 扫全清 → `docs/` 索引比对 → **树缺 2 文件 + agents/** → 建单 **#126** → +3 行 `835be3b` → 16==16 → **PR #127**（与全部开放 PR 零交集）                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | PR #127 |
| 5-7 | **无操作 ×3（计 3/5）**：sitemap 167/167、首页 30 资源 200、7 安全头齐、`_headers`↔`security.ts` 一致、35 重定向全通、65 外链 0 真死链、测试无 `.only/.skip`、manifest 图标齐、密钥/env 扫描 0 泄漏                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | —       |
| 8   | 协议完整性扫描 → 两份 **23.5MB md5 相同 webm**，副本零引用 → 建单 **#128** → `git rm` `945d951` → 门禁全绿（test **412**/build）→ **PR #129** → 计数清零                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | PR #129 |
| 9   | 复盘第 3 轮 `--include` 漏扫 → `git grep` 全量补扫 → **Makefile 三处漂移**（help 阈值 / 部署行 ACCOUNT_ID / audit `--prod` vs CI 全量实测 2 vs 5）→ 建单 **#130** → 修 4 行 `81582c2` → `make help`/`make audit` 实测断言 + §6 全绿 → **PR #131**；另发 #121 更正评论                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | PR #131 |
| 10  | 例行同步无新事项 → **Quality Gate 本地全量验证**（CI 因 needs-audit 全程跳过，#122 合并后激活——提前排雷）：E2E **95/95** ✅ · bundle/routes/theme 预算 ✅ · LHCI collect 4 URL + assert **exit 0** ✅（WSL 环境绕过见坑 19）→ 无新 issue，计数保持 0/5                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | —       |
| 11  | 延展第 9 轮模式全仓复扫（`70/60` 全豁免、`audit --prod` 0 残留）→ `CLOUDFLARE_ACCOUNT_ID` 命中 **PROJECT_MANAGEMENT_MODEL 漂移 5 处**（称「自动部署已恢复」+ 要配 ACCOUNT_ID，T-033 口径同步漏了此文件）→ 查重（与 #101 关联非重复）→ 建单 **#132** → 修 10 行 `10aba9c` → 断言/三方交叉核对 + §6 全绿 → **PR #133**（恢复类表述条件式化，#101 完成后无需回改）                                                                                                                                                                                                                                                                                                                                                                                                                   | PR #133 |
| 12  | 三连验证（coverage 实跑 exit 0 · `.agent/LOCK` 设计内本地锁无漂移 · `quality:lighthouse` 脚本）→ 命中**两处失效**建单 **#134**：脚本裸 `lhci` 未装依赖必挂（4 处文档在教）+ lighthouserc **重复键**致 T-022 error 0.80 底线静默失效（现仅 warn，加载器 require() last-wins 实证）→ 修 3 文件 `d43dfe9`（dlx@0.15.1 与 CI 逐字节一致、零依赖）→ 端到端 exit 0 + §6 全绿 → **PR #135**（踩 commitlint footer 坑 21）                                                                                                                                                                                                                                                                                                                                                                | PR #135 |
| 13  | 延展 #132 模式做**全仓 file:line 引用内容级核验**（55 处三级解析+逐条比对）→ **9 处内容漂移**（5 文件：astro.config :11/:12/:147 全错、middleware.ts:19 已重构、CONTRIBUTING 指空行、§7.6 og-image 漏 T-038 更正、TODOLIST Hero 路径 ×8）→ 建单 **#136** → 修 16 行 `f48d2c3` → 6/6 内容断言 PASS + 旧模式 0 残留 + §6 全绿 → **PR #137**（CONTRIBUTING 改 §5/§6 章节引用免疫漂移）                                                                                                                                                                                                                                                                                                                                                                                               | PR #137 |
| 14  | 延展 #134 教训做**全仓命令引用核验**（`pnpm`/`npm run`/`make`/`pnpm exec`/`npx`，20 候选）→ 排除散文误报 + `pnpm exec tsc --noEmit` 三方一致（Makefile:76/ci-cd.yml:42）+ 归档快照豁免后**实锤 1 处双失效** → 建单 **#138** → 修 2 文件 `a2e5853`：`pnpm exec sharp-cli`（未装依赖）改 `pnpm dlx sharp-cli --format webp`（6.x 尾参 `webp` 报 `Unknown argument`，沙箱实跑修正）+ `optimize-images.mjs` 硬编码 `/workspace/*`（无 devcontainer 故恒空跑）改脚本位置解析仓库根 → **PR #139**；195 行 diff 已证等价（main 原文件本就不 prettier 干净）；沙箱假仓实跑 exit 0；§6 全绿                                                                                                                                                                                                | PR #139 |
| 15  | **CI 门禁自审计**（首次审「门禁本身覆盖什么」）→ 实锤 `format:check` glob（`package.json:50-51`）同时窄了目录集与扩展名集：hook 管全仓 `**/*.mjs\|md`、CI 只管 `{src,tests}/**` 5 种扩展名 + 根级 3 种 → 全仓 369 文件 `prettier --check` **26 个不合规且全部落盲区** → **盲区放行实证**（往 `scripts/quality/check-theme-contrast.mjs` 注入格式问题，`format:check` exit **0** 放行）→ 建单 **#140** → 修 `41c3289`（glob 扩 `{src,tests,scripts}` + 归一 `collect-github-metrics.mjs`）→ **PR #141**（叠 #139 之上）；验证 format:check 1→0、盲区反向 0→1 拦截、token 级 558/558 零差异、§6 全绿；md/yml 与 `.github/` 按「yml 语义敏感宜单独 PR」收敛为后续                                                                                                                    | PR #141 |
| 16  | 承 #140 审 **eslint 侧**：`pnpm lint` = `eslint src` 而 eslint 配置声明全仓 `**/*.ts\|tsx` + `**/*.astro` → **`tests/` 40 个 ts 文件不在 CI lint 门禁内**，`eslint tests` 实测 18 warnings（15 no-unused-vars + 3 sort-imports）→ 先排除误报（根级 4 个 `*.config.ts` 属 `ignores` 有意排除；根级 vitest/playwright config 是 `.config/` 薄 re-export shim **非重复**）→ 建单 **#142** → 修 `88733cb`（10 文件 24+/27−，lint 扩 `src tests` + 归一 18 warning）→ **PR #143**；验证 0 problems + 注入未用变量现被报出 + **412 tests / 38 files 全过** + §6 全绿；**过程自查修正**：误给 `branch-boost3.test.ts:99` 体内有引用的 `enc` 加 `_` 前缀，412 仍全绿（静默测试弱化）已改回                                                                                                | PR #143 |
| 17  | **11 个 PR 合并安全预演**（无可认领 issue，转交付风险审计）：`git merge-tree` 逐个验证各 PR 对 main **零冲突**，但按序实际合并暴露——**除 #122 外每个 PR 都在 3 个记录文件冲突**（11 分支全改 STATE/HANDOFF/§7.4），**内容文件零冲突**（#135/#137 `ARCHITECTURE.md` 不同行自动合并成功）→ 产出 `§二·〇 合并操作手册`（顺序 + 确定性解法 + **验收 `grep -c mimo-flash docs/WORKFLOW.md` == 13** + squash 手动关 12 issue）；演练用 scratch 分支并已删除，主干未受影响                                                                                                                                                                                                                                                                                                               | —       |
| 18  | **数值口径审计**（承 #125/#130）：route 预算 80/260KB 与代码一致、覆盖率实测 **94.02/85.3/94.69/95.1** vs 阈值 80（最紧 branches +5.3，无脆弱性）→ 核实 STATE 挂起项：\`public/og-image.png\` 系 **ADR-002:57 有意保留**，预算条目**有效不删** → 复查 og:image 决策留痕链**实锤 2 处残留**：\`§7.6\` **验证行仍校验 png 为 PNG** 与同段决策行矛盾（#136 只改决策行 = **部分修复制造新矛盾**）+ \`ADR-002:42\` 行号指向文档头部 → 建单 **#144** → 修 \`84baa42\`（2 文件 3 行，决策行与 #137 **逐字一致**故合并无冲突）→ **PR #145**；3/3 断言 + 线上 curl 实测 + §6 全绿                                                                                                                                                                                                          | PR #145 |
| 19  | **配置一致性审计**（新维度：label 自动化配置本身）：把 \`.github/labeler.yml\` 9 个 label 键与仓库 39 个真实 label 逐一比对 → \`size:xs\` **不存在**；查历史 PR 标签发现 \`breaking-change\` 出现在**所有** PR（含只改 README 的 #124）→ 官方 README 定位根因：**无顶层 \`any\`/\`all\` 键的规则默认按 any(OR)**，\`base-branch: main\` 单独成立即命中；第二处：\`size:xs\` 需 \`issues: write\` 才能创建而 workflow 只有 \`contents: read\`+\`pull-requests: write\` → 建单 **#146** → 修 \`850979d\`（仅 \`breaking-change\` 包 \`all:\`）→ **PR #147**；验证：写**本地 labeler 判定复现器**（官方语义+\`yaml\`+\`minimatch\`），**修复前与线上标签 3/3 吻合**（证明复现忠实）→ 修复后 **6/6 断言 PASS**（含 2 正例防漏打）+ §6 全绿；\`size:xs\` 属仓库设置/权限决策**未擅动** | PR #147 |
| 20  | **i18n 中英对称性审计**（新维度，无缺陷结清）：路径集合差（zh 缺 en 24 / en 缺 36）**不能直接判缺**（en 用翻译后 slug）→ 逐一分类：**5 个 en 中文文件名文件是有意重定向 stub**（meta refresh 指向新英文 slug，线上旧路由 200、新 slug 200 ✅）+ 其余为单语内容（en 独有 28 / zh 独有 8）→ 查语言切换器：en 独有页**未生成 zh 链接**（Starlight 正确省略），zh 对应路径 404 但**无入口指向** ✅ → **无缺陷，维度结清**                                                                                                                                                                                                                                                                                                                                                             | —       |

### 要点（下一棒可能用到）

1. **#121 audit（`1b3851b`）**：与 #115（undici）同类根因——公告拓宽区间时旧 override 下限漏网。套路：`pnpm why <pkg>` → 提下限 → `pnpm install` → `pnpm audit` 复验 + §6 门禁。**高频复发**。**第 9 轮更正**：fast-uri ×2 走 `@astrojs/check`（**在 dependencies**，pnpm `dev: False`）为 prod 声明链，brace-expansion ×3 才是 dev 链——「不进运行时产物、无需部署」结论经 `dist/server` grep（无 fast-uri/ajv/yaml-language-server）验证**不变**；已发更正评论到 #121。
2. **#123 README（`ea55094`）**：4 死链（根路径 404，实际在 `.github/`，**不要移动文件**）；结构树归并；en 表分隔行 + `make help` 拆行。链接扫描跳过 `file:///`、示例链接、历史归档。
3. **#125 阈值（`49f18a1`）**：`70/60/70/70` → `80/80/80/80`（真值 `.config/vitest.config.ts:12-17`）。**不改** WORKFLOW 日志、ROADMAP 时间切片。折入逻辑见坑 12。
4. **#126 目录树（`835be3b`）**：验收脚本：树条目正则 `[├└]── (\S+)` + 目录尾 `/` `rstrip` 归一，与 `os.listdir('docs')` 集合比对 0 差异。
5. **#128 重复副本（`945d951`）**：`git ls-files` >500KB 逐一 md5 `uniq -w32 -D`——全仓唯一重复对即此。删零引用重复文件不动历史（blob 共享）。
6. **#130 Makefile（`81582c2`）**：`make help` 的 `##` 注释是用户可见输出；`make audit` 原 `--prod` **无法复现 CI 判定**（实测 2 vs 5），已改 `--audit-level=moderate` 与 `ci-cd.yml:78` 一字不差。**教训见坑 17**（`--include` 扩展名过滤漏 Makefile）。README 同问题两行仍待 #124 合并（见 STATE「已观察未建单」）。
7. **已观察未建单**（见 STATE）：README ACCOUNT_ID（等 #124）、GitHub Project `projects/1`（缺 scope 不可判定）、tests 未入 tsc（预防性缺口无实证，保守不建单）。
8. **Quality Gate 本地验证（第 10 轮）**：CI 的 quality-gate job `needs: build`，而 build `needs: audit`——main Audit 一红它就全程 skipped（#122 合并前）。本地五环节已全绿：`quality:bundle/routes/theme` + `pnpm test:e2e`（**95/95**）+ LHCI（`pnpm dlx @lhci/cli@0.15.1 collect/assert --config=.config/lighthouserc.json`，4 URL，assert 仅 warn）。**LHCI 在本机会触发 WSL 坑（见坑 19）**；审计页面为 `/`、`/docs-center/`、`/team/`、`/join/`——本棒 5 个 PR 均不碰这些页面，#122 合并后 rebase 转绿置信度完整。
9. **#132 T-033 口径同步白名单遗漏（第 11 轮）**：同类治理文档的口径同步若只改 `AGENTS.md`/`DEPLOYMENT.md`/`WORKFLOW §3` 三处，**还要 `git grep` 关键词（如 `CLOUDFLARE_ACCOUNT_ID`、`自动部署`）全仓找漏网文件**——`docs/PROJECT_MANAGEMENT_MODEL.md` 就是漏网者（发布部署小节停留 2026-08-28 口径 5 处漂移）。修复采用**条件式表述**（「恢复后……」），使 #101 完成后无需回改。
10. **#134 quality:lighthouse 链路两处失效（第 12 轮）**：① **「文档教的命令」要实跑复现**——`package.json` 调裸 `lhci` 而依赖未装，CI 内联 `pnpm dlx @0.15.1` 掩盖了脚本已死，Makefile/README×2/ARCHITECTURE 四处在教死命令（修复=脚本改 dlx 同版本，与 CI 逐字节一致、**零依赖零 lockfile**）；② **配置文件的重复 JSON 键静默生效**——T-022 想写 error0.80+warn0.85 双档，`require()` last-wins 只剩 warn，**error 底线整体丢失**；断言生效值必须 `node -e require()` 实测 + 读加载器源码，不能看文件字面。LHCI 一指标只能一个档位，双档不可表达（取舍记录在 #134）。
11. **#136 内容级核验三步法（第 13 轮）**：行号在≠内容对——扫描分三级：①存在性（文件/行号范围）→ ②**逐条读被引行与断言比对**（本轮 9 处中 8 处是范围通过但内容错）→ ③同名文件歧义用行号范围+上下文排除（TODOLIST 裸名 Hero.astro 靠 ≤203 行段排除 4 行 overrides）。**文档互引优先用 § 章节引用**（CONTRIBUTING 改 §5/§6 后免疫 §4/§7.4 追加漂移）。口诀：`git grep` 拿到引用 → 打开目标行看内容 → 再看断言。
12. **文档里的命令一律实跑（第 14 轮，#138）**：静态比对只能查出「依赖没装」，查不出「语法已变」——doc 示例 `sharp-cli … webp` 在 6.x 已是 `Unknown argument: webp`（exit 2），只有真跑才看得见。**`pnpm exec <bin>` 只解析 `node_modules/.bin`**（#134 裸 `lhci`、#138 `sharp-cli` 同根因）→ 文档场景一律写 `pnpm dlx`；脚本里的**环境绝对路径**（`/workspace/*`）在本仓无 devcontainer 下恒不存在且 `existsSync` 静默跳过、exit 0 骗人，**一律用 `import.meta.url` 解析仓库根**。核验配方：抽全仓 `pnpm|npm run|make|npx` → 对照 package.json scripts / Makefile target 集合 → 再逐条实跑（散文误报与归档快照要人工剔）。
13. **门禁本身也要审覆盖面（第 15 轮，#140）**：CI 只检查「被 glob 覆盖的部分」，glob 写窄了 = 门禁静默失效且**全绿**。审法：①把 hook 配置（lint-staged）与 CI 脚本的 glob **并排 diff**；②对全仓跑一次 `prettier --check`/`eslint` 看有多少文件在门禁外；③**反向注入**一个违规文件验证真被拦截（exit 0 = 盲区）。对齐时**以 hook 为基准**（收窄 hook 只会让更多文件脱离格式化）。
14. **重命名 unused 变量前先确认函数体内无引用（第 16 轮踩坑，412 全绿骗人）**：给 `branch-boost3.test.ts` 的 `enc` 加 `_` 前缀时，它在函数体里被 `typeof enc === 'function'` 使用 → 该测试的回调分支永远走不到，而 **vitest 412 tests 依然全绿**（断言恰好不依赖该分支）。**绿灯 ≠ 改动无害**：批量重命名后必须 ①grep 新名确认所有出现处 ②逐个核对「声明之外是否被引用」③对参数类尤其检查函数体。与坑「行号在≠内容对」同源——**表面信号（绿灯/行号存在）都不等于语义正确**。
15. **部分修复会制造新的段内矛盾（第 18 轮，#144）**：#136 把 `WORKFLOW §7.6` 决策行改对了却漏掉同段验证行（仍校验 `og-image.png`），结果「决策说 jpg、验证查 png」。**「旧模式 grep 归零」式验证会放过它**（png 在 §7.4 历史行里仍有出现）。修引用后必须**复查同一小节/同一段落的其余引用是否指向同一对象**，并断言「决策行与验证行命中同一文件名」。
16. **YAML 多条件默认是 OR（第 19 轮，#146）**：labeler（及同类「列表即规则」的配置）里，**顶层没有 `any`/`all` 键时默认按 `any`(OR) 处理** —— 写 `base-branch: main` + `changed-files: [...]` 看似 AND，实测所有 PR 都被命中。审自动化配置要问「**这多个条件是 AND 还是 OR**」，并**用线上真实产物反推规则**（本轮：比对 39 个真实 label + 查历史 PR 标签 + timeline 确认 actor）。**验证配置语义的最可靠办法是写复现器**：本轮按官方语义复现判定，修复前输出与线上标签 3/3 吻合才敢下结论；且**必须带正例**（本轮 2 个正例确保修复没把真命中也一起关掉）。
17. **集合差 ≠ 缺陷，先分类再下判断（第 20 轮）**：i18n 审计里「zh 缺 en 24 项 / en 缺 zh 36 项」若直接建单会造 60 个假 issue —— 实际是**翻译后 slug**（`入门`↔`onboarding`）+ **有意重定向 stub** + **单语内容**三层。判缺陷前先问：①命名是否语义对应而非字面相同？②差异文件是内容还是重定向壳？③**用户是否真的会被坑**（本轮关键证据：语言切换器对缺失语言会省略，不会生成死链 → 用户无感知 → 不算缺陷）。

## 二·〇、合并操作手册（第 17 轮实测演练得出，11 个 PR 必读）

**实测结论**：`git merge-tree` 显示 11 个 PR **各自对 main 均无冲突**；但按序实际合并时，**除 #122 外每个 PR 都会在 3 个记录文件冲突**（`.agent/STATE.md`、`.agent/HANDOFF.md`、`docs/WORKFLOW.md`）——因为 11 个分支**全部**改这三个文件。**内容文件（真正的修复）零冲突**：唯一同文件的是 #135 与 #137 的 `docs/ARCHITECTURE.md`（不同行，实测自动合并成功）。

**建议合并顺序**：先 **#122**（它让 main 的 Audit 转绿，是其余 PR 的前提）→ 再 #124 / #127 / #129 / #131 / #133 / #135 / #137 → 最后链式 **#139 → #141 → #143**（后两者叠在前者之上，重复内容会自动成为 no-op）。

**每次冲突的确定性解法**：

```bash
# 1) 记录文件取「进来的那个」（= 更新的一轮）
git checkout --theirs .agent/STATE.md .agent/HANDOFF.md

# 2) §7.4 必须「两边全保留」：最省事是不手改，改用核验法——
#    每个 PR 的行都是纯新增，合并后按下面命令查缺，补齐即可
git show origin/<该PR分支>:docs/WORKFLOW.md | grep '^| 2026-09-30 | mimo-flash'
```

**验收标准（全部合并后）**：

```bash
grep -c mimo-flash docs/WORKFLOW.md     # 必须 == 13
grep -rn '^<<<<<<<' .agent/ docs/       # 必须无输出
```

13 行的构成（按轮次去重后的并集）：第 1 / 2 / 3 / 4 / 8 / 9 / 10 / 11 / 12 / 13 / 14 / 15 / 16 轮 —— 注意 **#141 携带 2 行、#143 携带 3 行**（含它们上游分支的行），所以直接相加会得 16，去重后是 13。

**squash 合并注意**：squash 会改写 commit subject，`fix:/docs:/chore: #N` 的 issue 关联可能丢失，合并后需**手动核对并关闭** #121/#123/#125/#126/#128/#130/#132/#134/#136/#138/#140/#142。

## 二、交棒时主干状态

- **`main@9e41da7` 全绿**（run 36879855991：Audit/Lint/Type/Tests/Build/QualityGate/Preview 全 success；首跑 QualityGate 曾因 LHCI perf 抖动失败，同 SHA 重跑转绿）。直推冻结解除，记录文件恢复惯例直推。
- 16 PR 全关：11 个 squash-merged（#122/#124/#127/#129/#131/#133/#135/#137/#149/#151/#153）；5 个 superseded-closed（#139/#141/#143/#145/#147，内容已在 #149 内）。issue #121…#152 全关，开放仅 #101/#120/#154。
- main 门禁（第 26 轮实测 run 36882006978）：lint/format/tsc/test/build/e2e/3-run LHCI（12 total runs 中位数断言）/Preview 全绿；各分支合并前 CI 核心 5 项逐个验证。
- 本轮合并均为非运行时改动，**未部署**（均不进产物，无需部署）。
- 开放 issue：**#101**（人类配 Secret）、**#120**（question）。开放 PR：无（14 个全关）。

## 三、下一棒要做（按优先级）

1. **#155/#157 合并后**：核对 #154/#156 自动关（body `Closes`）；若 main QualityGate 再抖动，回 #154 留证据（0.8 阈值不动）。
2. **新候选**：暂无（观察项已清空：workflow 注释经 #148/#156 两轮复审全清，剩余均为有意不做；`--max-warnings`/tsc-tests 预防性缺口留人类）。下一棒转主动发现（新审计维度）或等人类（#101 Secret、#120 裁决、#155/#157 合并）。
3. **人类待办**：`PROJECT_TOKEN` 轮换/确认 + projects/1；`update-linked-issues` 补权限还是删除；`size:xs` 手工建 label；#101 配 Secret；#120 裁决 toast.ts。
4. #120 被人类裁决后按单内验收执行；#101 Secret 配好后按单把 deploy job 加回 `ci-cd.yml`（完整实现见 `8475f88`）。
5. **audit 类复发**：走一.1 套路；**重复大文件类**：走一.5 md5 扫描法；**文档漂移类**：全量 `git grep` 而非 `--include` 过滤（坑 17）；**口径同步类**：同步完三处权威文档后全仓 grep 关键词找漏网文件（一.9，#132 套路）。
6. 剩余 2 条 `astro check` hint（`BilibiliVideo.astro:13`、`share.ts:109`）勿动。

## 四、阻塞项（需人类操作）

- 人类侧：`PROJECT_TOKEN`、`size:xs` label、`update-linked-issues` 去留（见三.2）。
- **#101**：GitHub `Settings → Secrets and variables → Actions` 配 `CLOUDFLARE_API_TOKEN`（`CLOUDFLARE_ACCOUNT_ID` 不需要）。配好前不要把 deploy job 加回 CI。
- **#120**：toast.ts 删留二选一。
- 线上部署走本机 `wrangler` OAuth（`pnpm deploy:worker`）；登录态只在当前机器 profile，换机需重跑 `wrangler login`（strip 本地 proxy）。

## 五、注意事项 / 坑（沿用上棒并新增 ⚠️）

1. **main 直推当前被 #121 冻结**（见二）；token 有 bypass 权限，恢复后可按惯例直推记录文件。
2. **双远程**：`origin` = `HUAT-FSAC/Guidance-Astro`（权威）；`wsyhuat` = fork，**不要**当上游。
3. **部署判据**：影响线上产物（`src/**`、`astro.config.mjs`、`public/**`、依赖）push main 后自动 `pnpm deploy:worker` + CSP nonce 验收；纯 `.agent/**` / docs / Makefile 注释 / dev override / 零引用死文件删除 / workflow 显式禁用**不必部署**。本轮（workflow-only）不部署。
4. **⚠️ `pnpm` 不在裸 PATH**：跑命令 `mise exec -- pnpm ...`；**git hook 需要 pnpm 在 PATH**，提交前 `export PATH="$HOME/.local/share/mise/installs/pnpm/11:$HOME/.local/share/mise/installs/node/22/bin:$PATH"`，否则 pre-commit 报 `pnpm: not found`。
5. **commit subject 关 issue**：`fix:/docs:/chore: #N` 落 main 时预期关；PR body `Closes #N` 双保险；**squash 改写 subject 会漏——合并后核对手动关**。
6. **`gh run list` 可能浮出 re-run 历史 run**：对照 `headSha`。
7. **依赖 override 时效性（高频复发）**：见一.1 套路（#115、#121）。
8. **gh comment 带反引号一律 `--body-file`**：shell 双引号内反引号会被命令替换（本棒踩过）。
9. **内容页 URL 逐段 slug**（`github-slugger`），推 URL 走 `src/integrations/sitemap-paths.ts`；链接扫描跳过 `@assets/` 目标。
10. **CRLF 噪声会伪造 diff 规模（第 15 轮踩坑）**：本地磁盘 `.mjs` 可能 CRLF 而 git 存 LF（Windows checkout），`prettier --write` 后「归一前 cp 副本 vs 归一后」显示 568 行差异，**绝大部分是行尾噪声**，真实改动仅 20 行。**证明格式归一无语义变化要用 token 级比较**（TypeScript scanner 逐 token，558 vs 558 差异 0），别用行数 diff；且副本要从 `git show <ref>:<path>` 取而非从磁盘 cp。
11. **行尾**：部分 `.mdx` 磁盘 CRLF；`.md` 等过 lint-staged prettier，Edit 报 "modified since read" 先重读。
12. **`.gitignore` 已修复（#118）**；**社区文件在 `.github/` 是约定，链接指过去别移文件**（#123 教训）。
13. **⚠️ prettier 对结构破损 markdown 表格的规范输出 = 整表去对齐**（第 3 轮实测）：在含破损表格的基线上提交该文件会带入去对齐 diff——#125 折入 #124 的技术原因；**不要 `--no-verify` 绕过**（跳过 commitlint）。
14. **md 锚点扫描按 GitHub slug 规则**：小写、**去含句点的标点**、空格转 `-`、CJK 保留（漏剔 `.` 假阳性）；目录集合比对 `rstrip('/')` 归一。
15. **pnpm 子命令不是脚本**：`pnpm audit/dlx/exec` 不代表 `package.json` 要有同名 script。
16. **⚠️ 资源「孤儿」判定不可凭字符串搜索**：`Hero.astro` 动态构造 srcset、`cars.ts` 按年份构造——**找构造点或用 md5/引用双证据**；删文件前全类型 grep 0 引用 + 构建产物验证。
17. **外链 404 分类再建单**：占位符（`YOUR_USERNAME`/`<page>`）、「形如…」示例、历史快照、匿名不可见的 settings/私有看板——都不算死链；仅确定性 404/410 且指向真实内容才建单（第 6 轮 65 外链 0 真死链的判定依据）。
18. **⚠️ 全量扫描别用 `--include` 扩展名过滤**（第 9 轮复盘）：第 3 轮 `grep --include="*.md" *.ts ...` 漏了**无扩展名的 Makefile**（`make help` 的 `##` 注释是用户可见输出，与 README 同期漂移未被发现）。定稿前用 `git grep`（tracked 全量、天然排除 dist/node_modules）复扫一遍关键模式。
19. **pnpm audit 的 `dev: False` ≠ 影响运行时**：`dependencies` 里的构建期 CLI（如 `@astrojs/check`）链也会标 prod——判「是否需部署」要 grep `dist/server` 实证，别只看 dev 标记（#121 更正评论的来龙去脉）。
20. **⚠️ 本机是 WSL2，LHCI/chrome-launcher 会踩坑**（第 10 轮）：`is-wsl` 检测 → chrome-launcher 走 `makeWin32TmpDir`，但本会话 PATH 无 `/mnt/c/Users/...` 段 → 临时目录构造为 `undefined:/Users/undefined/...` 报 ENOENT。**绕过**：`export PATH="/mnt/c/Users/<Windows用户名>/AppData/Local:$PATH"`（Windows 用户名以 `ls /mnt/c/Users/` 为准，本机为 `21711`）+ `export CHROME_PATH=$HOME/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome`。**运行副产物**：chrome-launcher 会在 CWD 造出 `C:\Users\...` 字面量目录（4 个/次）——跑完 `find . -maxdepth 1 -name 'C:*lighthouse*' -type d -exec rm -rf {} +` 清理。CI（ubuntu-latest）无此问题。
21. **⚠️ `gh run list` 偶发返回对不上的瞬时结果**（第 10 轮踩过）：同一查询先后返回过「main 在 3a49e03/3852436 上 failure」的幽灵行（复跑同查询全绿、failure 过滤 0 命中、两个 SHA 虽是 main 祖先但其 ci-cd run 均绿——实为其他工作流/其他分页的串扰）。**判定 CI 状态前复跑一次查询并交叉核对 `workflowName`/`headSha`/`createdAt`**，别拿单次输出下结论。
22. **⚠️ commitlint `footer-max-line-length ≤ 100`**（第 12 轮连拒两次）：`git commit -m` 的**正文段落按 footer 规则逐行查 ≤100 字符**（`subject-max-length` 同为 100，但 CJK 也按 1 字符计）。被拒时输出只有 `found 1 problems` 不带规则名——**直接 `echo "<msg>" | pnpm exec commitlint` 看完整规则报错**，然后把正文折行到每行 <100 再提交（多行同段落仍算 footer，注意别用 `--no-verify` 绕过）。
23. **记录时间戳用 `date -u` 不要用本地时间（第 17 轮自查）**：本棒前几轮把本地时间（UTC+8）当成 UTC 写进 `最后更新`，一度还写出 `2026-09-31`（9 月无 31 日）这种不存在的日期。写记录前先 `date -u +%Y-%m-%dT%H:%MZ` 取真值，别手算时区。
24. **自动化 workflow 要审"触发器 × 条件 × 目标"三元组（第 21 轮，#148）**：只看脚本逻辑会漏掉三类静默失效 —— ① `on:` 里没有 `schedule` 却写 `if: github.event.schedule == ...`（永不运行）；② `issue_number: 1` 写死（目标是已合并 PR，预警发错地方，注释里"或者创建一个新 issue"就是作者留下的自供状）；③ 名为 Update 实为只读（有算无写，绿灯但无事发生）。审法：①把 `on:` 触发器与每个 job 的 `if:` 并排比对；②把脚本里所有写死 ID 拿 `gh issue view` 验证一次；③把自称 Update/Sync 的 job 全文搜 `github.rest` 写调用个数（0 个即空转）。修法上**只做零风险的显式禁用**（`if: false` + NOTE）：**不要**补触发器去激活一个目标错误的 job，**不要**顺手给缺权限的 job 加权限——行为变更与权限决策一律留人类（同 #146 只修 ① 留 ② 的处理）。

## 六、关键命令速查

```bash
# 同步与状态
git fetch --all --prune && git pull --rebase
cat .agent/STATE.md .agent/HANDOFF.md

# 本机门禁（mise 环境，见坑 4）
mise exec -- pnpm audit --audit-level=moderate   # main 上 5 漏洞为 #121 既有；make audit 已同口径
mise exec -- pnpm lint && mise exec -- pnpm format:check
mise exec -- pnpm exec tsc --noEmit && mise exec -- pnpm test:run
mise exec -- pnpm build
mise exec -- pnpm quality:bundle && mise exec -- pnpm quality:theme

# 提交（husky 需 pnpm 在 PATH，见坑 4）
export PATH="$HOME/.local/share/mise/installs/pnpm/11:$HOME/.local/share/mise/installs/node/22/bin:$PATH"

# PR / CI
for n in 122 124 127 129 131 133 135 137 139 141 143 145 147 149; do gh pr view $n --json number,state,mergedAt --jq '"#\(.number) \(.state) \(.mergedAt // "-")"'; done
gh run list --workflow=ci-cd.yml --branch main --limit 5 --json headSha,status,conclusion

# 全量漂移扫描（坑 17，别加 --include）
git grep -n "关键模式" -- . ':!docs/reports' ':!docs/plans'

# 重复大文件检测（坑 15，#128 套路）
git ls-files -z | xargs -0 -I{} sh -c 'test -f "{}" && s=$(stat -c%s "{}") && [ "$s" -gt 512000 ] && echo "{}"' \
  | while read f; do md5sum "$f"; done | sort | uniq -w32 -D

# 部署与线上验收（仅产物变化时）
mise exec -- pnpm deploy:worker
curl -sI https://huat-fsac.eu.org/ | grep -iE '^(HTTP|content-security-policy)'
curl -s https://huat-fsac.eu.org/sitemap-0.xml | grep -o '<loc>' | wc -l   # 167
```

## 七、与看板 / 前一棒的一致性

- `docs/WORKFLOW.md:§4` T-001..T-038 全部已完成；走 issue 线（#121→PR #122 …… #148→PR #149），`§7.4` 已逐轮追加日志行（随各自分支入库）。
- 上棒 `mimo-flash-20260930T113551Z`（20 轮，#121–#146 十四单十三 PR + 第 10/17/20 轮验证）的结论与坑位全部沿用；本棒第 21 轮新增 #148→PR #149（project-automation 两失效 job 显式禁用）与坑 24（自动化 workflow 触发器×条件×目标三元组审法）；第 22 轮按用户指令合并全部 14 PR（main 全绿，已解锁）；第 23 轮 #150→PR #151（README 部署行 2 行）；第 24 轮 #152→PR #153（format 剩余缺口，7 组 glob + .prettierignore + 归一 2 文件）；第 25 轮按人类指令合并 #151/#153（main@9e41da7 全绿，LHCI 抖动同 SHA 重跑转绿实锤）；第 26 轮 #154→PR #155（numberOfRuns 1→3，3-run QualityGate 全绿）；第 27 轮 #156→PR #157（workflow 注释口径 part 2，纯注释 2 文件）。
