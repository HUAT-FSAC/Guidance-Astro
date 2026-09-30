# 交接说明（HANDOFF）

**本棒 Agent：** `mimo-flash-20260930T113551Z`
**时间：** 2026-09-30T11:35Z 起（UTC），第 1-10 轮完成（进行中；第 5-7 轮无操作 ×3，第 8/9 轮连续产出，第 10 轮验证轮）
**仓库 / 分支：** `HUAT-FSAC/Guidance-Astro` ｜ 基线 `main@46f53f4`
**产出分支：** `auto/.../121-audit-override-bump`（PR **#122**）、`auto/.../123-readme-dead-links`（PR **#124** = #123+#125）、`auto/.../126-docs-index-drift`（PR **#127** = #126）、`auto/.../128-dedup-webm`（PR **#129** = #128）、`auto/.../130-makefile-drift`（PR **#131** = #130，**最新全量记录**）

> 下一棒请先按 `docs/WORKFLOW.md:§1/§3` 与 `AGENTS.md` 的「发布与部署」执行：
> `git fetch --all --prune` → `git pull --rebase` → 读 `.agent/STATE.md` + 本文件 → 检查 `.agent/LOCK` → 选任务。
>
> ⚠️ **本棒记录文件分散在五个分支**（#122 合并前禁直推 main）：第 1 轮随 PR #122，第 2-3 轮随 PR #124，第 4 轮随 PR #127，第 8 轮随 PR #129，**第 9 轮（本版，最新）随 PR #131**。冲突一律取**最新（PR #131）**；`docs/WORKFLOW.md:§7.4` 各轮增行全部保留（#121 / #123+#125 / #126 / #128 / #130）。

---

## 一、本棒做了什么（9 轮：1-4 产出 + 5-7 无操作 + 8-9 产出）

| 轮  | 结果                                                                                                                                                                                                                                                                  | 产出    |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| 1   | `pnpm audit` 实测 **5 漏洞** → 建单 **#121** → override 提下限 + lockfile 重解析 → 门禁全绿 → `1b3851b` → **PR #122** → **CI 7/7 success（含 Audit）**                                                                                                                | PR #122 |
| 2   | 主动扫描 → README **4 死链 + 结构树失真 + en 命令表破损** → 建单 **#123** → 修 2 文件 → `ea55094` → **PR #124** → CI Lint/Type/Tests 绿                                                                                                                               | PR #124 |
| 3   | `70/60/70/70` 扫描 → README 阈值过时（实际 80/80/80/80）→ 建单 **#125** → 修 2 行 `49f18a1` → **折入 PR #124**（同表格相邻行必冲突实测）→ `Closes #125`                                                                                                               | PR #124 |
| 4   | 锚点/脚本/TODO/内容 4 扫全清 → `docs/` 索引比对 → **树缺 2 文件 + agents/** → 建单 **#126** → +3 行 `835be3b` → 16==16 → **PR #127**（与全部开放 PR 零交集）                                                                                                          | PR #127 |
| 5-7 | **无操作 ×3（计 3/5）**：sitemap 167/167、首页 30 资源 200、7 安全头齐、`_headers`↔`security.ts` 一致、35 重定向全通、65 外链 0 真死链、测试无 `.only/.skip`、manifest 图标齐、密钥/env 扫描 0 泄漏                                                                   | —       |
| 8   | 协议完整性扫描 → 两份 **23.5MB md5 相同 webm**，副本零引用 → 建单 **#128** → `git rm` `945d951` → 门禁全绿（test **412**/build）→ **PR #129** → 计数清零                                                                                                              | PR #129 |
| 9   | 复盘第 3 轮 `--include` 漏扫 → `git grep` 全量补扫 → **Makefile 三处漂移**（help 阈值 / 部署行 ACCOUNT_ID / audit `--prod` vs CI 全量实测 2 vs 5）→ 建单 **#130** → 修 4 行 `81582c2` → `make help`/`make audit` 实测断言 + §6 全绿 → **PR #131**；另发 #121 更正评论 | PR #131 |
| 10  | 例行同步无新事项 → **Quality Gate 本地全量验证**（CI 因 needs-audit 全程跳过，#122 合并后激活——提前排雷）：E2E **95/95** ✅ · bundle/routes/theme 预算 ✅ · LHCI collect 4 URL + assert **exit 0** ✅（WSL 环境绕过见坑 19）→ 无新 issue，计数保持 0/5                | —       |

### 要点（下一棒可能用到）

1. **#121 audit（`1b3851b`）**：与 #115（undici）同类根因——公告拓宽区间时旧 override 下限漏网。套路：`pnpm why <pkg>` → 提下限 → `pnpm install` → `pnpm audit` 复验 + §6 门禁。**高频复发**。**第 9 轮更正**：fast-uri ×2 走 `@astrojs/check`（**在 dependencies**，pnpm `dev: False`）为 prod 声明链，brace-expansion ×3 才是 dev 链——「不进运行时产物、无需部署」结论经 `dist/server` grep（无 fast-uri/ajv/yaml-language-server）验证**不变**；已发更正评论到 #121。
2. **#123 README（`ea55094`）**：4 死链（根路径 404，实际在 `.github/`，**不要移动文件**）；结构树归并；en 表分隔行 + `make help` 拆行。链接扫描跳过 `file:///`、示例链接、历史归档。
3. **#125 阈值（`49f18a1`）**：`70/60/70/70` → `80/80/80/80`（真值 `.config/vitest.config.ts:12-17`）。**不改** WORKFLOW 日志、ROADMAP 时间切片。折入逻辑见坑 12。
4. **#126 目录树（`835be3b`）**：验收脚本：树条目正则 `[├└]── (\S+)` + 目录尾 `/` `rstrip` 归一，与 `os.listdir('docs')` 集合比对 0 差异。
5. **#128 重复副本（`945d951`）**：`git ls-files` >500KB 逐一 md5 `uniq -w32 -D`——全仓唯一重复对即此。删零引用重复文件不动历史（blob 共享）。
6. **#130 Makefile（`81582c2`）**：`make help` 的 `##` 注释是用户可见输出；`make audit` 原 `--prod` **无法复现 CI 判定**（实测 2 vs 5），已改 `--audit-level=moderate` 与 `ci-cd.yml:78` 一字不差。**教训见坑 17**（`--include` 扩展名过滤漏 Makefile）。README 同问题两行仍待 #124 合并（见 STATE「已观察未建单」）。
7. **已观察未建单**（见 STATE）：README ACCOUNT_ID（等 #124）、GitHub Project `projects/1`（缺 scope 不可判定）、tests 未入 tsc（预防性缺口无实证，保守不建单）。
8. **Quality Gate 本地验证（第 10 轮）**：CI 的 quality-gate job `needs: build`，而 build `needs: audit`——main Audit 一红它就全程 skipped（#122 合并前）。本地五环节已全绿：`quality:bundle/routes/theme` + `pnpm test:e2e`（**95/95**）+ LHCI（`pnpm dlx @lhci/cli@0.15.1 collect/assert --config=.config/lighthouserc.json`，4 URL，assert 仅 warn）。**LHCI 在本机会触发 WSL 坑（见坑 19）**；审计页面为 `/`、`/docs-center/`、`/team/`、`/join/`——本棒 5 个 PR 均不碰这些页面，#122 合并后 rebase 转绿置信度完整。

## 二、交棒时主干状态

- **⚠️ `main` 顶端 `46f53f4` 的 `Audit Dependencies` 门禁已失效**：main 下次任何 push 该 job 必红（公告晚于最后绿 run 482）。**PR #122 合并前禁止直推 `main`**——本棒十轮记录都只能落在分支上。
- **PR #122 / #124 / #127 / #129 / #131 均待人类 review+merge**（协议禁止自动 merge）。除 #122 外的 Audit 红灯 = main 既有失效，#122 合并后 rebase 即绿（各 PR body 已声明）。
- 本地门禁（第 10 轮实测，Quality Gate 五环节含此前 CI 跳过的部分）：lint / format / tsc / test **412** / build / **e2e 95/95** / bundle·routes·theme 预算 / **LHCI assert exit 0** 全绿；`make audit` 5 漏洞 = 与 CI 同口径同判定（main 既有，#122 合并后归 0）。
- 线上健康（第 2/5 轮实测）：`/` 200 + CSP nonce、sitemap **167/167 全 200**、首页 30 资源 200、7 安全头齐、35 重定向全通。本棒改动不进产物，**未部署**（线上 `62778a8e` = main 产物，一致）。
- 开放 issue：**#101**（人类配 Secret）、**#120**（question）、**#121**（待 #122）、**#123/#125**（待 #124）、**#126**（待 #127）、**#128**（待 #129）、**#130**（待 #131）。
- 开放 PR：**#122、#124、#127、#129、#131**（均本棒）；#97 metrics、#96 release-please、#106~#114 dependabot **不碰不 merge**。

## 三、下一棒要做（按优先级）

1. `gh pr view 122 --json state,mergedAt`：
    - **已合并** → main 恢复常绿，可直推记录文件；未合并的 #124/#127/#129/#131 rebase 让 Audit 转绿；核对 #121/#123/#125/#126/#128/#130 是否被 `Closes` 自动关（squash 改写 subject 会漏，**手动关**）。
    - **未合并** → 遵守禁令走分支；例行评估（可接手仅 #101/#120；README ACCOUNT_ID 待 #124）→ 连续无操作满 5 触发 §九.1 停止（**当前 0/5**）。
2. **#124 合并后**：建单修 README 两行 ACCOUNT_ID（`README.md:70`/`README.en.md:71`，参照 #130 Makefile 文案：`CLOUDFLARE_API_TOKEN` only + ACCOUNT_ID 由 wrangler.json 提供）。
3. #120 被人类裁决后按单内验收执行；#101 Secret 配好后按单把 deploy job 加回 `ci-cd.yml`（完整实现见 `8475f88`）。
4. **audit 类复发**：走一.1 套路；**重复大文件类**：走一.5 md5 扫描法；**文档漂移类**：全量 `git grep` 而非 `--include` 过滤（坑 17）。
5. 剩余 2 条 `astro check` hint（`BilibiliVideo.astro:13`、`share.ts:109`）勿动。

## 四、阻塞项（需人类操作）

- **#122 / #124 / #127 / #129 / #131 review + merge**——#122 优先，它是解除「main 禁直推」的钥匙。
- **#101**：GitHub `Settings → Secrets and variables → Actions` 配 `CLOUDFLARE_API_TOKEN`（`CLOUDFLARE_ACCOUNT_ID` 不需要）。配好前不要把 deploy job 加回 CI。
- **#120**：toast.ts 删留二选一。
- 线上部署走本机 `wrangler` OAuth（`pnpm deploy:worker`）；登录态只在当前机器 profile，换机需重跑 `wrangler login`（strip 本地 proxy）。

## 五、注意事项 / 坑（沿用上棒并新增 ⚠️）

1. **main 直推当前被 #121 冻结**（见二）；token 有 bypass 权限，恢复后可按惯例直推记录文件。
2. **双远程**：`origin` = `HUAT-FSAC/Guidance-Astro`（权威）；`wsyhuat` = fork，**不要**当上游。
3. **部署判据**：影响线上产物（`src/**`、`astro.config.mjs`、`public/**`、依赖）push main 后自动 `pnpm deploy:worker` + CSP nonce 验收；纯 `.agent/**` / docs / Makefile 注释 / dev override / 零引用死文件删除**不必部署**。本棒九轮均不部署。
4. **⚠️ `pnpm` 不在裸 PATH**：跑命令 `mise exec -- pnpm ...`；**git hook 需要 pnpm 在 PATH**，提交前 `export PATH="$HOME/.local/share/mise/installs/pnpm/11:$HOME/.local/share/mise/installs/node/22/bin:$PATH"`，否则 pre-commit 报 `pnpm: not found`。
5. **commit subject 关 issue**：`fix:/docs:/chore: #N` 落 main 时预期关；PR body `Closes #N` 双保险；**squash 改写 subject 会漏——合并后核对手动关**。
6. **`gh run list` 可能浮出 re-run 历史 run**：对照 `headSha`。
7. **依赖 override 时效性（高频复发）**：见一.1 套路（#115、#121）。
8. **gh comment 带反引号一律 `--body-file`**：shell 双引号内反引号会被命令替换（本棒踩过）。
9. **内容页 URL 逐段 slug**（`github-slugger`），推 URL 走 `src/integrations/sitemap-paths.ts`；链接扫描跳过 `@assets/` 目标。
10. **行尾**：部分 `.mdx` 磁盘 CRLF；`.md` 等过 lint-staged prettier，Edit 报 "modified since read" 先重读。
11. **`.gitignore` 已修复（#118）**；**社区文件在 `.github/` 是约定，链接指过去别移文件**（#123 教训）。
12. **⚠️ prettier 对结构破损 markdown 表格的规范输出 = 整表去对齐**（第 3 轮实测）：在含破损表格的基线上提交该文件会带入去对齐 diff——#125 折入 #124 的技术原因；**不要 `--no-verify` 绕过**（跳过 commitlint）。
13. **md 锚点扫描按 GitHub slug 规则**：小写、**去含句点的标点**、空格转 `-`、CJK 保留（漏剔 `.` 假阳性）；目录集合比对 `rstrip('/')` 归一。
14. **pnpm 子命令不是脚本**：`pnpm audit/dlx/exec` 不代表 `package.json` 要有同名 script。
15. **⚠️ 资源「孤儿」判定不可凭字符串搜索**：`Hero.astro` 动态构造 srcset、`cars.ts` 按年份构造——**找构造点或用 md5/引用双证据**；删文件前全类型 grep 0 引用 + 构建产物验证。
16. **外链 404 分类再建单**：占位符（`YOUR_USERNAME`/`<page>`）、「形如…」示例、历史快照、匿名不可见的 settings/私有看板——都不算死链；仅确定性 404/410 且指向真实内容才建单（第 6 轮 65 外链 0 真死链的判定依据）。
17. **⚠️ 全量扫描别用 `--include` 扩展名过滤**（第 9 轮复盘）：第 3 轮 `grep --include="*.md" *.ts ...` 漏了**无扩展名的 Makefile**（`make help` 的 `##` 注释是用户可见输出，与 README 同期漂移未被发现）。定稿前用 `git grep`（tracked 全量、天然排除 dist/node_modules）复扫一遍关键模式。
18. **pnpm audit 的 `dev: False` ≠ 影响运行时**：`dependencies` 里的构建期 CLI（如 `@astrojs/check`）链也会标 prod——判「是否需部署」要 grep `dist/server` 实证，别只看 dev 标记（#121 更正评论的来龙去脉）。
19. **⚠️ 本机是 WSL2，LHCI/chrome-launcher 会踩坑**（第 10 轮）：`is-wsl` 检测 → chrome-launcher 走 `makeWin32TmpDir`，但本会话 PATH 无 `/mnt/c/Users/...` 段 → 临时目录构造为 `undefined:/Users/undefined/...` 报 ENOENT。**绕过**：`export PATH="/mnt/c/Users/<Windows用户名>/AppData/Local:$PATH"`（Windows 用户名以 `ls /mnt/c/Users/` 为准，本机为 `21711`）+ `export CHROME_PATH=$HOME/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome`。**运行副产物**：chrome-launcher 会在 CWD 造出 `C:\Users\...` 字面量目录（4 个/次）——跑完 `find . -maxdepth 1 -name 'C:*lighthouse*' -type d -exec rm -rf {} +` 清理。CI（ubuntu-latest）无此问题。

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
for n in 122 124 127 129 131; do gh pr view $n --json number,state,mergedAt --jq '"#\(.number) \(.state) \(.mergedAt // "-")"'; done
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

- `docs/WORKFLOW.md:§4` T-001..T-038 全部已完成；本棒走 issue 线（#121→PR #122、#123+#125→PR #124、#126→PR #127、#128→PR #129、#130→PR #131），`§7.4` 已逐轮追加日志行（随各自分支入库）。
- 上一棒 `glm-5.3-flash-20260929T234352Z`（8 轮，#117/#118/#119 闭环、#120 建单、§九.1 停止）的结论与坑位全部沿用；本棒新增坑 4（mise PATH）、8（comment 反引号）、11-18（社区文件/prettier 破损表格/锚点 slug/pnpm 子命令/资源判定/外链分类/全量扫描过滤器/audit dev 标记），并把坑 7 展开为可复用套路。
- 上棒「可接手 issue 仅 #101/#120」的判断在本棒起点仍成立，故进入主动发现模式：产出 **#121/#123/#125/#126/#128/#130 六单五 PR**（中途 3 轮无操作后靠协议完整性扫描 + 扫描器复盘连续重启产出），第 10 轮完成 Quality Gate 本地全量验证（e2e 95/95 + LHCI 过，见一.8 与坑 19）。
