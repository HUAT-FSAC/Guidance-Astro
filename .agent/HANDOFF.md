# 交接说明（HANDOFF）

**本棒 Agent：** `mimo-flash-20260930T113551Z`
**时间：** 2026-09-30T11:35Z 起（UTC），第 1-4 轮完成（进行中）
**仓库 / 分支：** `HUAT-FSAC/Guidance-Astro` ｜ 基线 `main@46f53f4`
**产出分支：** `auto/.../121-audit-override-bump`（PR **#122**，CI 7/7 绿）、`auto/.../123-readme-dead-links`（PR **#124** = #123+#125，Lint/Type/Tests 绿）、`auto/.../126-docs-index-drift`（PR **#127**，Lint/Type/Tests 预期绿）

> 下一棒请先按 `docs/WORKFLOW.md:§1/§3` 与 `AGENTS.md` 的「发布与部署」执行：
> `git fetch --all --prune` → `git pull --rebase` → 读 `.agent/STATE.md` + 本文件 → 检查 `.agent/LOCK` → 选任务。
>
> ⚠️ **本棒记录文件分散在三个分支**（#122 合并前禁直推 main）：第 1 轮行随 PR #122，第 2-3 轮随 PR #124，**第 4 轮（本版，最新全量）随 PR #127**。三 PR 的 `.agent/STATE.md`、本文件、`docs/WORKFLOW.md:§7.4` 冲突时：**STATE/HANDOFF 取本文件（PR #127，第 4 轮）**，`§7.4` 各轮增行（#121/#123/#125/#126）全部保留。

---

## 一、本棒做了什么（4 轮）

| 轮  | 结果                                                                                                                                                                                                                                                                                                   | 产出    |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------- |
| 1   | 门禁首关 `pnpm audit` 实测 **5 漏洞**（brace-expansion 3 条含 2 high、fast-uri 2 条 moderate，公告晚于主干最后绿 run 482）→ 建单 **#121** 认领 → override 提下限 `brace-expansion 5.0.12` / `fast-uri >=4.1.5` + lockfile 重解析 → 门禁全绿 → `1b3851b` → **PR #122** → **CI 7/7 success（含 Audit）** | PR #122 |
| 2   | 主动扫描：docs 相对链接、i18n zh/en 256 键对称、内容页 52 图片引用、console.log（均 dev-gated）、`astro check`（仅 2 已知 hint）→ README **4 处死链 + 结构树失真 + 英文命令表破损** → 建单 **#123** 认领 → 修 2 文件（+9/−14）→ 链接复扫 68 条 **0 broken** → `ea55094` → **PR #124**                  | PR #124 |
| 3   | 全仓 `70/60/70/70` 扫描 → README 中英 `test:coverage` 阈值描述与实际配置 80/80/80/80 不一致（T-026 已上调）→ 建单 **#125** 认领 → 修 2 行 `49f18a1` → 实测独立分支会与 #124 真实冲突（prettier 对破损表格输出整表去对齐）→ **折入 PR #124**（`Closes #125`）                                           | PR #124 |
| 4   | 扫描 4 项全清（md 锚点 0 broken / 脚本与 make 目标全存在 / src TODO 0 / 内容 en 90 在位）→ 转 `docs/` 索引比对 → **docs/README.md 目录树缺 2 文件 + `agents/`** → 建单 **#126** 认领 → 树 +3 行 `835be3b` → 集合比对 **16==16 零差异** → **PR #127**（与 #122/#124 零交集，合并顺序无约束）            | PR #127 |

### 要点（下一棒可能用到）

1. **#121 audit（`1b3851b`）**：与已关 #115（undici）同类根因——安全公告拓宽区间时旧 override 下限漏网。修法固定套路：`pnpm why <pkg>` → 提下限 → `pnpm install` → `pnpm audit` 复验 + §6 门禁。**这类问题高频复发，是审计门禁的常态维护。**
    - brace-expansion：公告 `>=4.0.0 <5.0.12`（3 条，2 high，71 条传递路径，主链 `eslint>minimatch`、`rimraf>glob>minimatch`）。
    - fast-uri：公告 `>=4.0.0 <4.1.5`（2 条 moderate，5 条路径，主链 `ajv>@astrojs/check`/`@commitlint`）。
    - 均为 dev 工具链传递依赖，不进运行时产物 → **无需部署**。
2. **#123 README（`ea55094`）**：4 死链（`./CONTRIBUTING.md`、`./CODE_OF_CONDUCT.md` 根路径 404，实际在 `.github/`；GitHub 约定位置正确，**不要移动文件**）；结构树 4 行归并到 `.github/` 注释；en 命令表分隔行列数错误 + `make help` 并入上一行（既有破损，顺带修复），prettier 归一。
    - 扫描脚本思路：遍历 markdown 提取 `](相对路径)`，`path.resolve` 后 `fs.existsSync`。**历史归档（`docs/reports/archive/`、`.trae/`）里的 `file:///d:/...` 是本机绝对路径，非断链，跳过**；`docs/CONTRIBUTING-content.md` 的 `../cars/` 是文中示例链接，非仓库文件链接。
3. **#125 阈值描述（`49f18a1`）**：README 中英 `test:coverage` 行 `70/60/70/70` → `80/80/80/80`（实际值 `.config/vitest.config.ts:12-17`，T-026 于 2026-09-13 上调；`docs/ARCHITECTURE.md:63` 已是正确值可作参照）。**不改**：`WORKFLOW:67/174`（日志只追加）、`ROADMAP:22`（「截止 2026-09-01」时间切片，`:42` T-026 行已记升 80，历史自洽）。
    - **为何折入 PR #124 而非独立 PR**：改动区域与 #124 同表格相邻行；main 上 `README.en.md` 表格结构破损，prettier 规范输出是**整表去对齐**（实测），独立分支经 lint-staged 提交会带入去对齐版本并产生真实冲突；叠分支偏离「从 main 拉出」。commit 拆分（`docs: #125` 只含 2 行）保证 scope 纯净，两单随一个 PR 合并，双向 merge 已验证任一顺序干净。
4. **#126 目录树（`835be3b`）**：`docs/README.md` 手写目录树漏了 `CONTRIBUTING-content.md`、`HANDOFF-2026-09-19.md`、`agents/`（均实际存在且被引用）。修法：代码块内 +3 行，注释列按参考行 `#` 列对齐。**验收脚本**：树条目（正则 `[├└]── (\S+)`，**目录尾 `/` 要 `rstrip` 归一**）与 `os.listdir('docs')` 做集合比对，0 差异。
5. **已观察未建单**：README 部署行「需 `CLOUDFLARE_API_TOKEN/ACCOUNT_ID`」与 `DEPLOYMENT.md:36`（ACCOUNT_ID 非必需，`account_id` 在 `wrangler.json:3`）矛盾——**README.en.md 该行是 PR #124 拆行区域，#124 合并前建单必冲突**，推迟到合并后处理（详见 STATE「已观察、未建单」）。

## 二、交棒时主干状态

- **⚠️ `main` 顶端 `46f53f4` 的 `Audit Dependencies` 门禁已失效**：main 下次任何 push 该 job 必红（公告晚于最后绿 run 482）。**PR #122 合并前禁止直推 `main`（含 `.agent/**`、`docs/**` 记录文件）**——本棒四轮记录都只能落在分支上。
- **PR #122**（#121，CI 7/7 绿）、**PR #124**（#123+#125，Lint/Type/Tests 绿）、**PR #127**（#126，预期同绿）**均待人类 review+merge**（协议禁止自动 merge）。#124/#127 的 Audit 红灯 = main 既有失效，#122 合并后 rebase 即绿（各 PR body 已声明）。
- 本地门禁（修复后实测）：audit **0 漏洞** / lint / format / tsc / test **412** / build / bundle / theme 全绿。
- 线上健康（第 2 轮实测）：`/` 200 + CSP nonce、`/robots.txt` 200（Allow+Sitemap）、`/sitemap-0.xml` **167 URL**。本棒改动不进产物，**未部署**（线上仍 `62778a8e` = main 产物，一致）。
- 开放 issue：**#101**（P1，人类配 Secret）、**#120**（P3 question）、**#121**（待 #122）、**#123/#125**（同待 #124）、**#126**（待 #127）。
- 开放 PR：**#122**、**#124**、**#127**（本棒）；#97 metrics、#96 release-please、#106~#114 dependabot 全是自动 PR，**不碰不 merge**。

## 三、下一棒要做（按优先级）

1. `gh pr view 122 --json state,mergedAt`：
    - **已合并** → main 恢复常绿，可直推记录文件；若 #124/#127 未合并，rebase 它们让 Audit 转绿；若 #121 未被 `Closes` 自动关（如被 squash 改写 subject），手动关。
    - **未合并** → 遵守禁令，一切走分支；例行评估（可接手仅 #101 阻塞 / #120 question / ACCOUNT_ID 漂移待 #124）→ 预计触发 §九.1 停止，属正常。
2. `gh pr view 124 --json state,mergedAt`：合并时 #123 与 #125 **一并自动关**（body `Closes` ×2 + commit subject `docs: #123/#125`）；若有任一未关，手动关。#127 同理关 #126。
3. **#124 合并后**：建单修 README 部署行 ACCOUNT_ID 漂移（见一.5，改 2 行：`CLOUDFLARE_API_TOKEN/ACCOUNT_ID` → `CLOUDFLARE_API_TOKEN` 并注明 ACCOUNT_ID 由 `wrangler.json` 提供）。
4. #120 被人类裁决（删/留）后按单内验收标准执行。
5. #101 的 Secret 配好后：按单拆解把 deploy job 加回 `ci-cd.yml`（完整实现见提交 `8475f88`）。
6. **audit 类复发**：直接走 #121 套路（见一.1），建单→分支→PR，不必重新排查。
7. 剩余 2 条 `astro check` hint（`BilibiliVideo.astro:13` scrolling、`share.ts:109` execCommand）价值低、需浏览器实测，勿动。

## 四、阻塞项（需人类操作）

- **#122 / #124 / #127 review + merge**——这是解除「main 禁直推」的钥匙（#122 优先）。
- **#101**：GitHub `Settings → Secrets and variables → Actions` 配 `CLOUDFLARE_API_TOKEN`（`CLOUDFLARE_ACCOUNT_ID` 不需要）。Secret 没配前不要把 deploy job 加回 CI。
- **#120**：toast.ts 删留二选一。
- 线上部署走本机 `wrangler` OAuth（`pnpm deploy:worker`）；登录态只在当前机器 profile，换机需重跑 `wrangler login`（strip 本地 proxy）。

## 五、注意事项 / 坑（沿用上棒并新增 ⚠️）

1. **main 直推当前被 #121 冻结**（见二）；token 本身有 bypass 权限，恢复后可按上棒惯例直推记录文件。
2. **双远程**：`origin` = `HUAT-FSAC/Guidance-Astro`（权威）；`wsyhuat` = fork 独立代码线，**不要**当上游。
3. **部署判据**：影响线上产物的改动（`src/**`、`astro.config.mjs`、`public/**`、依赖）push main 后自动 `pnpm deploy:worker` + CSP nonce 验收；纯 `.agent/**` / docs / dev override 不必部署。本棒四轮均不部署。
4. **⚠️ 环境：`pnpm` 不在裸 PATH**（本机用 mise，`mise.toml` 固定 node 22 / pnpm 11）：
    - 跑命令：`mise exec -- pnpm ...`
    - **git hook（husky/lint-staged/commitlint）需要 `pnpm` 在 PATH**，提交前 `export PATH="$HOME/.local/share/mise/installs/pnpm/11:$HOME/.local/share/mise/installs/node/22/bin:$PATH"`，否则 pre-commit 报 `pnpm: not found`（本棒踩过）。
5. **`fix: #N` / `docs: #N` commit subject 自动关 issue**（落到 main 时）；PR body 用 `Closes #N` 合并即关。本棒 #121 用 `fix:`、#123/#125/#126 用 `docs:`，均预期合并时自动关。
6. **`gh run list` 可能浮出被 re-run 的历史 run**：判断主干健康用 HEAD sha 对照最新 run 的 `headSha`，别只看列表前几行。
7. **依赖 override 时效性（高频复发）**：见一.1 套路。#115（undici）、#121（brace-expansion/fast-uri）均此类。
8. **gh issue comment 别用反引号包裹含空格的词 + shell 双引号混用**：`"...\`Audit Dependencies\`..."`中反引号会被 bash 当命令替换执行，评论缺段（本棒踩过，靠补评修复）。**评论带反引号一律用`--body-file`**。
9. **内容页 URL 逐段 slug**：`src/content/docs/**` 经 `github-slugger` 逐段处理，`src/pages/**` 不 slug；推 URL 走 `src/integrations/sitemap-paths.ts`。链接扫描跳过 `@assets/` 开头目标（构建期处理，非断链）。
10. **行尾**：部分 `.mdx` 磁盘 CRLF，编辑用单行替换最稳；`.md`/`.mjs`/`.ts` 会过 husky lint-staged prettier（含 `.agent/*.md`、`README*.md`），Edit 前若报 "modified since read" 先重读。
11. **`.gitignore` 已修复（#118）**：`src/content/docs/en/archive/` 不被忽略。
12. **社区文件位置**：`CONTRIBUTING/CODE_OF_CONDUCT/SUPPORT/SECURITY.md` 在 `.github/` 是 GitHub 约定，**链接指过去，不要为"目录树好看"移动文件**（#123 教训）。
13. **⚠️ prettier 对「结构破损的 markdown 表格」的规范输出是整表去对齐**（第 3 轮实测）：main 上 `README.en.md` 表格分隔行列数错，`prettier --write` 会把整表压成无空格对齐——**在含该破损表格的基线上提交任何该文件改动，lint-staged 都会带入去对齐 diff**。这就是 #125 折入 PR #124 的技术原因；**不要**用 `--no-verify` 绕过（会跳过 commitlint）。
14. **md 锚点扫描必须按 GitHub slug 规则**：小写、**剔除句点在内的标点**、空格转 `-`、CJK 保留——第 4 轮首轮漏剔 `.` 误报 3 条 `#6-质量门禁...` 假阳性；目录集合比对时目录尾 `/` 要归一（`rstrip('/')`）。
15. **pnpm 子命令不是脚本**：`pnpm audit/dlx/exec` 出现在 workflow 里不代表 `package.json` 要有同名 script，脚本一致性扫描要排除。

## 六、关键命令速查

```bash
# 同步与状态
git fetch --all --prune && git pull --rebase
cat .agent/STATE.md .agent/HANDOFF.md

# 本机门禁（mise 环境，见坑 4）
mise exec -- pnpm audit --audit-level=moderate
mise exec -- pnpm lint && mise exec -- pnpm format:check
mise exec -- pnpm exec tsc --noEmit && mise exec -- pnpm test:run
mise exec -- pnpm build
mise exec -- pnpm quality:bundle && mise exec -- pnpm quality:theme

# 提交（husky 需 pnpm 在 PATH，见坑 4）
export PATH="$HOME/.local/share/mise/installs/pnpm/11:$HOME/.local/share/mise/installs/node/22/bin:$PATH"

# PR / CI
gh pr view 122 --json state,mergedAt; gh pr view 124 --json state,mergedAt; gh pr view 127 --json state,mergedAt
gh run list --workflow=ci-cd.yml --branch main --limit 5 --json headSha,status,conclusion

# 链接扫描（#123 脚本思路）
# 遍历 md 提 ](相对路径) → path.resolve → existsSync；跳过 file:/// 与示例链接
# 锚点扫描见坑 14（GitHub slug 规则）；目录树比对见一.4（rstrip 归一）

# 部署与线上验收（仅产物变化时）
mise exec -- pnpm deploy:worker
curl -sI https://huat-fsac.eu.org/ | grep -iE '^(HTTP|content-security-policy)'
curl -s https://huat-fsac.eu.org/robots.txt
curl -s https://huat-fsac.eu.org/sitemap-0.xml | grep -o '<loc>' | wc -l   # 167
```

## 七、与看板 / 前一棒的一致性

- `docs/WORKFLOW.md:§4` T-001..T-038 全部已完成；本棒走 issue 线（#121→PR #122、#123+#125→PR #124、#126→PR #127），`§7.4` 已逐轮追加日志行（随各自分支入库）。
- 上一棒 `glm-5.3-flash-20260929T234352Z`（8 轮，#117/#118/#119 闭环、#120 建单、§九.1 停止）的结论与坑位全部沿用；本棒新增坑 4（mise/pnpm PATH）、坑 8（gh comment 反引号）、坑 12（社区文件位置）、坑 13-15（prettier 破损表格行为 / 锚点 slug 规则 / pnpm 子命令），并把坑 7 展开为可复用套路。
- 上棒「可接手 issue 仅 #101/#120」的判断在本棒起点仍成立，故进入主动发现模式，产出 #121/#123/#125/#126 四单三 PR。
