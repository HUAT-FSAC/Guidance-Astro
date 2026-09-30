# 交接说明（HANDOFF）

**本棒 Agent：** `mimo-flash-20260930T113551Z`
**时间：** 2026-09-30T11:35Z 起（UTC），第 1-8 轮完成（进行中；第 5-7 轮无操作 ×3 后第 8 轮重启产出）
**仓库 / 分支：** `HUAT-FSAC/Guidance-Astro` ｜ 基线 `main@46f53f4`
**产出分支：** `auto/.../121-audit-override-bump`（PR **#122**，CI 7/7 绿）、`auto/.../123-readme-dead-links`（PR **#124** = #123+#125）、`auto/.../126-docs-index-drift`（PR **#127** = #126）、`auto/.../128-dedup-webm`（本 PR = #128，**最新全量记录**）

> 下一棒请先按 `docs/WORKFLOW.md:§1/§3` 与 `AGENTS.md` 的「发布与部署」执行：
> `git fetch --all --prune` → `git pull --rebase` → 读 `.agent/STATE.md` + 本文件 → 检查 `.agent/LOCK` → 选任务。
>
> ⚠️ **本棒记录文件分散在四个分支**（#122 合并前禁直推 main）：第 1 轮随 PR #122，第 2-3 轮随 PR #124，第 4 轮随 PR #127，**第 5-8 轮（本版，最新）随本 PR**。冲突一律取**最新（本分支）**；`docs/WORKFLOW.md:§7.4` 各轮增行全部保留（#121 / #123+#125 / #126 / #128）。

---

## 一、本棒做了什么（8 轮：4 有产出 + 3 无操作 + 1 有产出）

| 轮  | 结果                                                                                                                                                                                                               | 产出    |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------- |
| 1   | 门禁首关 `pnpm audit` 实测 **5 漏洞** → 建单 **#121** → override 提下限 + lockfile 重解析 → 门禁全绿 → `1b3851b` → **PR #122** → **CI 7/7 success（含 Audit）**                                                    | PR #122 |
| 2   | 主动扫描 → README **4 死链 + 结构树失真 + en 命令表破损** → 建单 **#123** → 修 2 文件（+9/−14）→ 链接复扫 68 条 **0 broken** → `ea55094` → **PR #124** → CI Lint/Type/Tests 绿                                     | PR #124 |
| 3   | `70/60/70/70` 扫描 → README 阈值描述过时（实际 80/80/80/80，T-026 已上调）→ 建单 **#125** → 修 2 行 `49f18a1` → **折入 PR #124**（同表格相邻行，独立分支必冲突实测确认）→ `Closes #125`                            | PR #124 |
| 4   | 锚点/脚本/TODO/内容对称 4 扫全清 → `docs/` 索引比对 → **docs/README.md 树缺 2 文件 + agents/** → 建单 **#126** → 树 +3 行 `835be3b` → 集合比对 16==16 → **PR #127**（与全部开放 PR 零交集）                        | PR #127 |
| 5-7 | **无操作 ×3（计 3/5）**：sitemap 167/167 200、首页 30 资源 200、7 安全头齐、`_headers`↔`security.ts` 一致、35 重定向全通过、65 外链 0 真死链、测试无 `.only/.skip`、manifest 图标齐、engines 一致、同文件锚点 0 坏 | —       |
| 8   | 协议完整性扫描（密钥/env/大二进制 0 泄漏）→ 发现两份 **23.5MB md5 相同 webm**，副本全仓零引用 → 建单 **#128** → `git rm` → 门禁全绿（test **412**/build，产物含正本）→ `945d951` → **本 PR** → 无操作计数清零      | 本 PR   |

### 要点（下一棒可能用到）

1. **#121 audit（`1b3851b`）**：与已关 #115（undici）同类根因——安全公告拓宽区间时旧 override 下限漏网。修法固定套路：`pnpm why <pkg>` → 提下限 → `pnpm install` → `pnpm audit` 复验 + §6 门禁。**这类问题高频复发**。均为 dev 传递依赖，不进产物 → **无需部署**。
2. **#123 README（`ea55094`）**：4 死链（根路径 `./CONTRIBUTING.md` 等 404，实际在 `.github/`，**不要移动文件**）；结构树归并；en 表分隔行 + `make help` 拆行。链接扫描脚本：提 `](相对路径)` → `existsSync`；**跳过 `file:///`、示例链接、历史归档**。
3. **#125 阈值（`49f18a1`）**：`70/60/70/70` → `80/80/80/80`（真值 `.config/vitest.config.ts:12-17`）。**不改** WORKFLOW 日志（:67/:174）与 ROADMAP 时间切片（:22，「截止 2026-09-01」，:42 已记升 80）。**折入逻辑见坑 13**。
4. **#126 目录树（`835be3b`）**：手写树漏 `CONTRIBUTING-content.md`/`HANDOFF-2026-09-19.md`/`agents/`。验收脚本：树条目正则 `[├└]── (\S+)` + **目录尾 `/` 用 `rstrip` 归一**，与 `os.listdir('docs')` 集合比对 0 差异。
5. **#128 重复副本（`945d951`）**：`planning-and-control/showcase.webm`（23.5MB）与 `videos/showcase.webm` md5 完全相同且零引用（zh/en 内容页都引正本），推测 `dc0fe2b` 目录重构时内容页迁走视频遗留。**方法**：`git ls-files` >500KB 逐一 md5 `uniq -w32 -D`——全仓唯一重复对即此。删除零引用重复文件不动历史（blob 本就共享）。
6. **已观察未建单**（见 STATE）：README 部署行 ACCOUNT_ID 漂移（等 #124）；GitHub Project `projects/1` 匿名 404（缺 `read:project` scope 不可判定，不建单）。

## 二、交棒时主干状态

- **⚠️ `main` 顶端 `46f53f4` 的 `Audit Dependencies` 门禁已失效**：main 下次任何 push 该 job 必红（公告晚于最后绿 run 482）。**PR #122 合并前禁止直推 `main`**——本棒八轮记录都只能落在分支上。
- **PR #122 / #124 / #127 / 本 PR 均待人类 review+merge**（协议禁止自动 merge）。除 #122 外的 Audit 红灯 = main 既有失效，#122 合并后 rebase 即绿（各 PR body 已声明）。
- 本地门禁（第 8 轮实测）：lint / format / tsc / test **412** / build 全绿；audit 在本分支为 main 既有 5 漏洞（修复在 #122 分支）。
- 线上健康（第 2/5 轮实测）：`/` 200 + CSP nonce、sitemap **167/167 全 200**、首页 30 资源 200、7 安全头齐、35 重定向全通。本棒改动不进产物，**未部署**（线上 `62778a8e` = main 产物，一致）。
- 开放 issue：**#101**（人类配 Secret）、**#120**（question）、**#121**（待 #122）、**#123/#125**（待 #124）、**#126**（待 #127）、**#128**（待本 PR）。
- 开放 PR：**#122、#124、#127、本 PR**（均本棒）；#97 metrics、#96 release-please、#106~#114 dependabot **不碰不 merge**。

## 三、下一棒要做（按优先级）

1. `gh pr view 122 --json state,mergedAt`：
    - **已合并** → main 恢复常绿，可直推记录文件；未合并的 #124/#127/本 PR rebase 让 Audit 转绿；#121 未被 `Closes` 自动关则手动关。
    - **未合并** → 遵守禁令走分支；例行评估（可接手仅 #101/#120；ACCOUNT_ID 漂移待 #124）→ 连续无操作满 5 触发 §九.1 停止（**当前 0/5**）。
2. 各 PR 合并时按 body `Closes` 关单核对：#122→#121、#124→#123+#125、#127→#126、本 PR→#128；squash 改写 subject 导致未关的**手动关**。
3. **#124 合并后**：建单修 README 部署行 ACCOUNT_ID 漂移（见一.6 / STATE：2 行改 `CLOUDFLARE_API_TOKEN` 并注明 ACCOUNT_ID 由 `wrangler.json` 提供）。
4. #120 被人类裁决后按单内验收执行；#101 Secret 配好后按单把 deploy job 加回 `ci-cd.yml`（完整实现见 `8475f88`）。
5. **audit 类复发**：直接走一.1 套路。**重复大文件类**：走一.5 的 md5 扫描法。
6. 剩余 2 条 `astro check` hint（`BilibiliVideo.astro:13`、`share.ts:109`）勿动。

## 四、阻塞项（需人类操作）

- **#122 / #124 / #127 / 本 PR review + merge**——#122 优先，它是解除「main 禁直推」的钥匙。
- **#101**：GitHub `Settings → Secrets and variables → Actions` 配 `CLOUDFLARE_API_TOKEN`（`CLOUDFLARE_ACCOUNT_ID` 不需要）。配好前不要把 deploy job 加回 CI。
- **#120**：toast.ts 删留二选一。
- 线上部署走本机 `wrangler` OAuth（`pnpm deploy:worker`）；登录态只在当前机器 profile，换机需重跑 `wrangler login`（strip 本地 proxy）。

## 五、注意事项 / 坑（沿用上棒并新增 ⚠️）

1. **main 直推当前被 #121 冻结**（见二）；token 有 bypass 权限，恢复后可按惯例直推记录文件。
2. **双远程**：`origin` = `HUAT-FSAC/Guidance-Astro`（权威）；`wsyhuat` = fork，**不要**当上游。
3. **部署判据**：影响线上产物（`src/**`、`astro.config.mjs`、`public/**`、依赖）push main 后自动 `pnpm deploy:worker` + CSP nonce 验收；纯 `.agent/**` / docs / dev override / **零引用死文件删除**不必部署。本棒八轮均不部署。
4. **⚠️ `pnpm` 不在裸 PATH**：跑命令 `mise exec -- pnpm ...`；**git hook 需要 pnpm 在 PATH**，提交前 `export PATH="$HOME/.local/share/mise/installs/pnpm/11:$HOME/.local/share/mise/installs/node/22/bin:$PATH"`，否则 pre-commit 报 `pnpm: not found`。
5. **`fix: #N` / `docs: #N` / `chore: #N` commit subject** 落 main 时预期关 issue；PR body 用 `Closes #N` 双保险；**squash 合并可能改写 subject 导致不自动关——合并后核对手动关**。
6. **`gh run list` 可能浮出 re-run 历史 run**：对照 `headSha`，别只看列表前几行。
7. **依赖 override 时效性（高频复发）**：见一.1 套路（#115、#121）。
8. **gh comment 带反引号一律 `--body-file`**：shell 双引号内反引号会被当命令替换执行，评论缺段（本棒踩过）。
9. **内容页 URL 逐段 slug**（`github-slugger`），推 URL 走 `src/integrations/sitemap-paths.ts`；链接扫描跳过 `@assets/` 目标。
10. **行尾**：部分 `.mdx` 磁盘 CRLF；`.md` 等会过 lint-staged prettier，Edit 报 "modified since read" 先重读。
11. **`.gitignore` 已修复（#118）**；**社区文件在 `.github/` 是约定，链接指过去别移文件**（#123 教训，坑 12 合并至此条说明）。
12. **⚠️ prettier 对结构破损 markdown 表格的规范输出 = 整表去对齐**（第 3 轮实测）：在含破损表格的基线上提交该文件，lint-staged 会带入去对齐 diff——这是 #125 折入 #124 的技术原因；**不要 `--no-verify` 绕过**（会跳过 commitlint）。
13. **md 锚点扫描按 GitHub slug 规则**：小写、**去含句点的标点**、空格转 `-`、CJK 保留（漏剔 `.` 会假阳性）；目录集合比对 `rstrip('/')` 归一。
14. **pnpm 子命令不是脚本**：`pnpm audit/dlx/exec` 不代表 `package.json` 要有同名 script。
15. **⚠️ 资源「孤儿」判定不可凭字符串搜索**：`Hero.astro` 动态构造 srcset（`` `${base}-768.avif` ``）、`cars.ts` 按年份构造路径——**必须找到构造点或用 md5/引用双证据**；删文件前全类型 grep（md/mdx/ts/astro/mjs/json/yml）0 引用 + 构建产物验证。
16. **外链 404 分类再建单**：占位符（`YOUR_USERNAME`、`<page>`）、「形如…」行内示例、历史快照（HANDOFF-*/docs/reports）、匿名不可见的 settings/私有看板——**都不算死链**；仅确定性 404/410 且指向真实内容才建单（第 6 轮 65 外链 0 真死链）。

## 六、关键命令速查

```bash
# 同步与状态
git fetch --all --prune && git pull --rebase
cat .agent/STATE.md .agent/HANDOFF.md

# 本机门禁（mise 环境，见坑 4）
mise exec -- pnpm audit --audit-level=moderate   # main 上现有 5 漏洞为 #121 既有
mise exec -- pnpm lint && mise exec -- pnpm format:check
mise exec -- pnpm exec tsc --noEmit && mise exec -- pnpm test:run
mise exec -- pnpm build
mise exec -- pnpm quality:bundle && mise exec -- pnpm quality:theme

# 提交（husky 需 pnpm 在 PATH，见坑 4）
export PATH="$HOME/.local/share/mise/installs/pnpm/11:$HOME/.local/share/mise/installs/node/22/bin:$PATH"

# PR / CI
gh pr view 122 --json state,mergedAt; gh pr view 124 --json state,mergedAt
gh pr view 127 --json state,mergedAt; gh pr list --limit 5
gh run list --workflow=ci-cd.yml --branch main --limit 5 --json headSha,status,conclusion

# 重复大文件检测（坑 15，#128 套路）
git ls-files -z | xargs -0 -I{} sh -c 'test -f "{}" && s=$(stat -c%s "{}") && [ "$s" -gt 512000 ] && echo "{}"' \
  | while read f; do md5sum "$f"; done | sort | uniq -w32 -D

# 部署与线上验收（仅产物变化时）
mise exec -- pnpm deploy:worker
curl -sI https://huat-fsac.eu.org/ | grep -iE '^(HTTP|content-security-policy)'
curl -s https://huat-fsac.eu.org/sitemap-0.xml | grep -o '<loc>' | wc -l   # 167
```

## 七、与看板 / 前一棒的一致性

- `docs/WORKFLOW.md:§4` T-001..T-038 全部已完成；本棒走 issue 线（#121→PR #122、#123+#125→PR #124、#126→PR #127、#128→本 PR），`§7.4` 已逐轮追加日志行（随各自分支入库）。
- 上一棒 `glm-5.3-flash-20260929T234352Z`（8 轮，#117/#118/#119 闭环、#120 建单、§九.1 停止）的结论与坑位全部沿用；本棒新增坑 4（mise PATH）、8（comment 反引号）、11-16（社区文件位置/prettier 破损表格/锚点 slug/pnpm 子命令/资源判定/外链分类），并把坑 7 展开为可复用套路。
- 上棒「可接手 issue 仅 #101/#120」的判断在本棒起点仍成立，故进入主动发现模式：产出 **#121/#123/#125/#126/#128 五单四 PR**，中途 3 轮无操作后靠协议完整性扫描重启产出。
