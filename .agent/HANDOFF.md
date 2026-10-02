# 交接说明（HANDOFF）

**本棒 Agent：** `glm-5.3-flash-20261002T000919Z`（第 28 轮起）
**时间：** 2026-10-02T00:09Z 起接管（UTC）
**仓库 / 分支：** `HUAT-FSAC/Guidance-Astro` ｜ 主干 `main@41d654f`（CI 全绿）
**状态：** ⚠️ 本棒**接管了 muse-spark 的过期锁**（其锁 2026-10-01T16:15Z，距接管 8h > 30min，判定崩溃；其最终记录 commit `41d654f` 已入库，无未落盘工作）。#121–#156 全关；活跃 #154 → PR #155、#156 → PR #157（CI 全绿）、#158 → PR #159（本轮新建）；开放 #101、#120、#154、#156、#158

> 下一棒请先按 `docs/WORKFLOW.md:§1/§3` 与 `AGENTS.md` 的「发布与部署」执行：
> `git fetch --all --prune` → `git pull --rebase` → 读 `.agent/STATE.md` + 本文件 → 检查 `.agent/LOCK` → 选任务。

---

## 一、本棒做了什么（第 28 轮）

| 轮  | 结果                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | 产出    |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| 28  | 接管过期锁 → 例行同步（#155/#157 仍 OPEN 零评审、#101/#120 仍阻塞、main CI 全绿）→ 主动发现新维度：**数据文件审计**（`src/data/` seasons schema 三年一致、图片引用 5/5 在位、showcase/home/cars 图片路径在位）+ **侧边栏显式 link ↔ 集合树一致性**（12 link 解析，1 个未解析）→ 实锤 **#158**：`.config/sidebar.mjs:22`「内容贡献指南」指向 `/docs-center/contributing/`，但页面文件错位在 `src/content/docs-center/`（集合外，`docsLoader()` 只加载 `src/content/docs/`）→ **永不构建，自 `ac60adb`（2026-04-23）起线上 404**（curl 实证）→ 查重无重复 → 修：`git mv` 进 `src/content/docs/docs-center/`（sitemap **167→168** 实证）+ 移除 `sidebar: true` + 同页 4 处过期引用（`:20`/`:72` 仓库链接 `huat-fsac-docs` **404 实测**改 `Guidance-Astro`、`:26-27` clone 占位符仓库名、`:121`「自动部署」条件式）→ **PR #159**（本地全绿 lint/format/tsc/test 412/build/bundle/theme/routes/**e2e 95**；**内容页进产物，合并后必须 `pnpm deploy:worker`**；留待人类合并） | PR #159 |

> 上棒 muse-spark（第 21–27 轮，#148/#150/#152/#154/#156 五单五 PR + 第 22 轮合并马拉松 + 第 25 轮受权合并 #151/#153）与上上棒 mimo-flash（第 1–20 轮，#121–#146 审计马拉松）的明细见本文件 git 历史与 `docs/WORKFLOW.md:§7.4`（已 95+ 行）。

## 二、交棒时主干状态

- `main@41d654f`（纯记录 commit）CI 全绿；Audit/Lint/Type/Tests/Build/QualityGate/Preview 全 success。
- 开放 issue：**#101**（人类配 `CLOUDFLARE_API_TOKEN` Secret）、**#120**（toast.ts 删留 question）、#154/#156/#158（均有待合并 PR）。
- 开放 PR：**#155**（#154 LHCI numberOfRuns 1→3）、**#157**（#156 workflow 注释口径，纯注释）、**#159**（#158 侧边栏 404 修复，**合并后需部署**）；另有 #96/#97/#106~#114 自动 PR（dependabot/release-please/metrics），**协议禁止自动 merge，不碰**。
- 本棒未动 main 代码（修复在分支）；记录文件照惯例直推 main。

## 三、下一棒要做（按优先级）

1. **例行同步**：若人类已合并 #155/#157 → 核对 #154/#156 自动关（body `Closes`）；若合并 **#159** → 核对 #158 自动关 + **必须 `pnpm deploy:worker`**（见五.3 判据）+ `curl -sI` CSP nonce + 新页 `/docs-center/contributing/` 200 抽查；若 main QualityGate 再抖动，回 #154 留证据（0.8 阈值不动）。
2. **人类待办**：review+merge #155/#157/#159；`PROJECT_TOKEN` 轮换/确认 + projects/1；`update-linked-issues` 补权限还是删除；`size:xs` 手工建 label；#101 配 Secret（配好前不要把 deploy job 加回 CI）；#120 裁决 toast.ts。
3. **新候选（主动发现）**：本轮的「sidebar 显式 link ↔ 集合树」解析法可延伸到**其余显式链接面**——`astro.config.mjs` 的 Starlight `nav`/社交链接、页脚、LanguageSwitcher、`LinkCard` 等内容内嵌导航组件；同法：解析 link → 集合文件/重定向存在性。其余旧观察项已清空（workflow 注释经 #148/#156 两轮复审全清；`--max-warnings`/tsc-tests 预防性缺口留人类）。
4. #120 被人类裁决后按单内验收执行；#101 Secret 配好后按单把 deploy job 加回 `ci-cd.yml`（完整实现见 `8475f88`）。
5. 复发套路：audit 类走旧一.1（`pnpm why` → 提下限 → `pnpm install` → 复验）；文档漂移类全量 `git grep`（坑 18）；口径同步类改完三处权威文档后全仓 grep 找漏网（#132 套路）。剩余 2 条 `astro check` hint（`BilibiliVideo.astro:13`、`share.ts:109`）勿动。

## 四、阻塞项（需人类操作）

- **#101**：GitHub `Settings → Secrets and variables → Actions` 配 `CLOUDFLARE_API_TOKEN`（`CLOUDFLARE_ACCOUNT_ID` 不需要）。
- **#120**：toast.ts 删留二选一。
- 人类侧：`PROJECT_TOKEN`、`size:xs` label、`update-linked-issues` 去留。
- 线上部署走本机 `wrangler` OAuth（`pnpm deploy:worker`）；登录态只在当前 Windows 用户 profile（`%APPDATA%\xdg.config\.wrangler\`），换机需重跑 `wrangler login`（strip 本地 proxy）。

## 五、注意事项 / 坑（沿用上棒并新增 ⚠️）

1. **⚠️ gh issue create 的 `--label` 名错会整体失败**（第 28 轮踩）：标签真实名是 `priority:p2` 不是 `P2`——`gh issue create --label P2` 报 `could not add label` 且 **issue 根本没建**（静默）。建单后必须 `gh issue list` 回查编号。全量标签先 `gh label list`。
2. **⚠️ 侧边栏/导航显式链接是链接审计盲区**（第 28 轮 #158 的发现源）：sitemap 只含**已构建**页面——文件错位在集合外时 sitemap/构建全绿、链接 404 且无人报错。审法：解析 `.config/sidebar.mjs`（及 nav/页脚等）每个 `link:` → 在 `src/content/docs/`+`src/pages/` 找对应文件（`index` 折叠、slug 归一）；`autogenerate.directory` 验目录存在。
3. **内容集合只有两个**（`src/content.config.ts`）：`docs`（`src/content/docs/**`，docsLoader）+ `i18n`。`src/content/` 下任何其他目录都是集合外死文件（本轮 `docs-center/` 即此类）。
4. **部署判据**：影响线上产物（`src/**`、`astro.config.mjs`、`public/**`、依赖、**内容页新增/修改**）push main 后必须 `pnpm deploy:worker` + CSP nonce 验收；纯 `.agent/**` / workflow 注释 / Makefile / docs 记录**不必部署**。#159 合并后属前者。
5. **双远程**：`origin` = `HUAT-FSAC/Guidance-Astro`（权威）；`wsyhuat` = fork，**不要**当上游。内容/文档里出现的 `huat-fsac-docs` 旧仓库名一律是过期引用（本轮 3 处实证 404）。
6. **⚠️ `pnpm` 不在裸 PATH**：跑命令 `mise exec -- pnpm ...`；git hook 需要 pnpm 在 PATH，提交前同一条命令内 `export PATH="$HOME/.local/share/mise/installs/pnpm/11:$HOME/.local/share/mise/installs/node/22/bin:$PATH"`（跨调用不继承，husky 拦过两次）。
7. **commit subject 关 issue**：`fix:/docs:/chore: #N` 落 main 时预期关；PR body `Closes #N` 双保险；**squash 改写 subject 会漏——合并后核对手动关**。
8. **`gh run list` 可能浮出幽灵行/re-run**：判定 CI 状态前复跑查询并交叉核对 `headSha`/`workflowName`（坑 20/21）。
9. **依赖 override 时效性（高频复发）**：`pnpm audit` 公告拓宽区间时旧 override 下限漏网——`pnpm why <pkg>` → 提下限 → `pnpm install` → 复验（#115/#121 套路）。
10. **gh comment 带反引号一律 `--body-file`**：shell 双引号内反引号会被命令替换。
11. **CRLF 噪声会伪造 diff 规模**：本地磁盘 CRLF 而 git 存 LF；证格式归一无语义变化用 token 级比较（第 15 轮坑 10）；Edit 报 "modified since read" 先重读（坑 11）。
12. **prettier 对破损表格的规范输出 = 整表去对齐**：别 `--no-verify` 绕 husky。
13. **pnpm audit 的 `dev: False` ≠ 影响运行时**：判「是否需部署」要 grep `dist/server` 实证（#121 更正评论）。
14. **⚠️ WSL2 + LHCI**：`export PATH="/mnt/c/Users/21711/AppData/Local:$PATH"` + `export CHROME_PATH=$HOME/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome`；跑完清理 CWD 的 `C:\Users\...` 字面量目录。CI ubuntu-latest 无此问题。
15. **commitlint**：subject 与正文每行 ≤100 字符（`footer-max-line-length`），被拒时 `echo "<msg>" | pnpm exec commitlint` 看完整规则；别 `--no-verify`。
16. **记录时间戳用 `date -u`**，别拿 UTC+8 当 UTC、别手算日期（出现过 `2026-09-31`）。
17. **资源「孤儿」判定不可凭字符串搜索**（Hero.astro 动态 srcset）；删文件前全类型 grep 0 引用 + 构建产物验证；重复大文件走 `git ls-files` >500KB + md5 `uniq -w32 -D`（#128 套路）。
18. **全量扫描别用 `--include` 扩展名过滤**：用 `git grep`（tracked 全量、排除 dist/node_modules）——Makefile 无扩展名曾被漏（坑 17）。
19. **外链 404 分类再建单**：占位符/示例/历史快照/私有不可见 ≠ 死链；仅确定性 404/410 指向真实内容才建单。mailto 不属 HTTP 死链。
20. **自动化 workflow 审「触发器 × 条件 × 目标」三元组**（#148）；labeler 类「列表即规则」默认 OR（#146）；门禁本身要审覆盖面 + 反向注入验证拦截（#140 套路）；「文档教的命令」一律实跑（#134/#138 套路）；`file:line` 引用做内容级核验（#136 三步法）；集合差 ≠ 缺陷先分类（#20 i18n）；部分修复会制造段内新矛盾（#144——修完引用复查同段其余引用）。
21. **重命名 unused 变量前先确认函数体内无引用**：412 全绿 ≠ 改动无害（静默测试弱化，第 16 轮）。
22. **锁协议**：`.agent/LOCK` 超 30min 可接管（HANDOFF 注明「接管过期锁」）；正常结束删锁。锁不提交（`.agent/.gitignore`）。

## 六、关键命令速查

```bash
# 同步与状态
git fetch --all --prune && git pull --rebase
cat .agent/STATE.md .agent/HANDOFF.md

# 本机门禁（mise 环境，见坑 6）
mise exec -- pnpm lint && mise exec -- pnpm format:check
mise exec -- pnpm exec tsc --noEmit && mise exec -- pnpm test:run
mise exec -- pnpm build && mise exec -- pnpm quality:bundle && mise exec -- pnpm quality:theme
mise exec -- pnpm quality:routes && mise exec -- pnpm test:e2e
mise exec -- pnpm audit --audit-level=moderate

# 提交（husky 需 pnpm 在 PATH，同命令内 export，见坑 6）
export PATH="$HOME/.local/share/mise/installs/pnpm/11:$HOME/.local/share/mise/installs/node/22/bin:$PATH"

# PR / CI
gh pr list --state open --json number,title,headRefName --jq '.[] | "#\(.number) \(.title)"'
gh run list --workflow=ci-cd.yml --branch main --limit 5 --json headSha,status,conclusion

# 侧边栏 link 解析（第 28 轮方法，Python）
#   links = re.findall(r"link:\s*'([^']+)'", open('.config/sidebar.mjs').read())
#   逐个映射 src/content/docs/<p>/index.{mdx,md} / src/pages/... ；未解析即疑点

# 部署与线上验收（仅产物变化时）
mise exec -- pnpm deploy:worker
curl -sI https://huat-fsac.eu.org/ | grep -iE '^(HTTP|content-security-policy)'
curl -s -o /dev/null -w "%{http_code}" https://huat-fsac.eu.org/docs-center/contributing/   # 修复合并部署后应为 200
```

## 七、与看板 / 前一棒的一致性

- `docs/WORKFLOW.md:§4` T-001..T-038 全部已完成；现走 issue 线，`§7.4` 逐轮追加日志行（本轮新增第 28 轮 #158→PR #159 行，随记录 commit 入 main）。
- 上棒 muse-spark 第 21–27 轮结论与坑位全部沿用（并入第五节）；上上棒 mimo-flash 第 1–20 轮见 git 历史。
- 本轮接管过期锁已在此页首部注明；无未落盘的上一棒工作（其 `41d654f` 记录 commit 已在 main）。
