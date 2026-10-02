# 交接说明（HANDOFF）

**本棒 Agent：** `muse-spark-20261002T111151Z`（第 30 轮）
**时间：** 2026-10-02T11:11Z 起（UTC；上一棒锁已按协议删除，本轮新建锁）
**仓库 / 分支：** `HUAT-FSAC/Guidance-Astro` ｜ 主干 `main@0437947`
**状态：** #154/#156/#158/#160 本轮全部合并关闭；开放仅 #101、#120；开放 relay PR 已清零；线上 Version `73738007`（contributing 200 + CSP nonce ✅）；main CI 全绿 run 37000100746

> 下一棒请先按 `docs/WORKFLOW.md:§1/§3` 与 `AGENTS.md` 的「发布与部署」执行：
> `git fetch --all --prune` → `git pull --rebase` → 读 `.agent/STATE.md` + 本文件 → 检查 `.agent/LOCK` → 选任务。

---

## 一、本棒做了什么（第 30 轮：合并马拉松 part 2）

用户明确"不需要 review，直接推进"（免 review 自主推进长期生效）→ 四 PR 事先 CI 全绿 → 按序 `--admin --squash` 合并（分支保护 review 对象 + 永不满足 `quality-gate` 上下文，只能 admin；质量本身用 CI 卡）：
① **#161**（P1 devalue，`795d89d`，main Audit 自愈）→ 部署 `0b79c574` + CSP ✅；
② **#159**（`bd30e3f`，栈上已含 #161，合后剩余 diff 仅 contributing）→ 部署；
③ **#155**（`4e8c362`，CI 配置，无需部署）；
④ **#157**（`0437947`，纯注释，无需部署）。
body `Closes` 四 issue 自动关（已核对 #154/#156/#158/#160 closed）。main run 37000100746 **全绿**（Audit/3-run QualityGate/Preview）。

**事故**：GitHub 端 squash 落 main 后本地树仍停留在合并前，两次部署上线了旧树（`/docs-center/contributing/` 线上 404、sitemap 无命中——复测发现）→ `git pull` + `pnpm install`（#161 换了 lock）重建 → Version `73738007`：contributing **200** + sitemap 命中 + CSP ✅。旧树部署无实质影响（内容=此前线上版本），同会话内纠正。**坑 23** 见第五节。

> 前棒摘要：glm棒第 28–29 轮（#158 侧边栏 404→PR #159；#160 devalue→PR #161，#159 叠基 #161）；muse-spark 第 21–27 轮（#148/#150/#152/#154/#156 五单五 PR + 第 22 轮 14-PR 合并马拉松 + 第 25 轮受权合并）；mimo-flash 第 1–20 轮（#121–#146）。明细见 git 历史与 `docs/WORKFLOW.md:§7.4`（已 97+ 行）。

## 二、交棒时主干状态

- `main@0437947` CI 全绿；relay issue 全关（#121…#160 中除 #101/#120 外）。
- 开放 issue：**#101**（人类配 `CLOUDFLARE_API_TOKEN` Secret）、**#120**（toast.ts 删留 question）。
- 开放 PR：无 relay PR；#96/#97/#106~#114 自动 PR（dependabot/release-please/metrics），**协议禁止自动 merge，不碰**。
- 线上已追平 main（含 devalue 5.9.4 + contributing 新页）。

## 三、下一棒要做（按优先级）

1. **新候选（主动发现）**：第 28 轮「sidebar 显式 link ↔ 集合树」解析法可延伸到其余显式链接面——`astro.config.mjs` 的 Starlight `nav`/社交链接、页脚、LanguageSwitcher、`LinkCard` 等内容内嵌导航组件；或开新审计维度。其余旧观察项已清空（`--max-warnings`/tsc-tests 预防性缺口留人类）。
2. #120 被人类裁决后按单内验收执行；#101 Secret 配好后按单把 deploy job 加回 `ci-cd.yml`（完整实现见 `8475f88`）。
3. 复发套路：audit 类走五.9（`pnpm why` → 提下限 → `pnpm install` → 复验）；文档漂移类全量 `git grep`（坑 18）；口径同步类改完三处权威文档后全仓 grep 找漏网（#132 套路）。剩余 2 条 `astro check` hint（`BilibiliVideo.astro:13`、`share.ts:109`）勿动。

## 四、阻塞项（需人类操作）

- **#101**：GitHub `Settings → Secrets and variables → Actions` 配 `CLOUDFLARE_API_TOKEN`（`CLOUDFLARE_ACCOUNT_ID` 不需要）。
- **#120**：toast.ts 删留二选一。
- 人类侧：`PROJECT_TOKEN`、`size:xs` label、`update-linked-issues` 去留。
- 线上部署走本机 `wrangler` OAuth（`pnpm deploy:worker`）；登录态只在当前机器 profile（`%APPDATA%\xdg.config\.wrangler\`），换机需重跑 `wrangler login`（strip 本地 proxy）。

## 五、注意事项 / 坑

1. **⚠️ 部署前必须 `git pull` 到落 main 后的最新主干（第 30 轮新坑）**：凡经 GitHub 端合并（`--admin --squash`）落 main，本地 `git log` 即落后——此时 `pnpm deploy:worker` 会构建旧树并上线旧产物。规程：部署前必 `git pull` + `ls` 确认目标文件在位 + `pnpm install`（若 lock 变动）；部署后 curl 抽查本次变更页（本轮：contributing 200 + sitemap 命中）。
2. **⚠️ gh issue create 的 `--label` 名错会整体失败**：标签真实名是 `priority:p2` 不是 `P2`——名错则 issue 根本没建。建单后 `gh issue list` 回查；先 `gh label list`。
3. **⚠️ 侧边栏/导航显式链接是链接审计盲区**（#158）：sitemap 只含已构建页面——文件错位在集合外时构建全绿、链接 404 无人报错。审法：解析 `.config/sidebar.mjs` 每个 `link:` → 在 `src/content/docs/`+`src/pages/` 找对应文件；`autogenerate.directory` 验目录存在。
4. **内容集合只有两个**（`src/content.config.ts`）：`docs`（`src/content/docs/**`）+ `i18n`。`src/content/` 下其他目录都是集合外死文件。
5. **部署判据**：影响线上产物（`src/**`、`astro.config.mjs`、`public/**`、依赖、内容页新增/修改）push main 后必须 `pnpm deploy:worker` + CSP nonce 验收；纯 `.agent/**` / workflow 注释 / docs 记录**不必部署**。
6. **双远程**：`origin` = `HUAT-FSAC/Guidance-Astro`（权威）；`wsyhuat` = fork，**不要**当上游。内容里的 `huat-fsac-docs` 旧仓库名一律过期（多处 404 实证）。
7. **⚠️ `pnpm` 不在裸 PATH**：`mise exec -- pnpm ...`；提交前同一条命令内 export PATH（跨调用不继承，husky 拦过多次）。
8. **commit subject 关 issue**：`fix:/docs:/chore: #N` + body `Closes #N` 双保险；合并后核对（第 25 轮证 `docs:` 不影响 body 关键字生效）。
9. **`gh run list` 幽灵行**：判 CI 状态前交叉核对 `headSha`/`workflowName`（坑 20/21）。
10. **依赖 override 时效性（高频复发）**：`pnpm why` → 提下限 → `pnpm install` → 复验（#115/#121/#160）。下限须核对上游声明区间：裸 `>=X` 会放走 major（devalue 6.0.2 越界 `^5.8.1`，须 `">=X <Y.0.0"`）。**本地门禁含 `pnpm audit --audit-level=moderate`**；公告期开放 PR 集体转红——叠基可转绿并固化合并顺序（先合修复 PR）。
11. **gh comment 带反引号一律 `--body-file`**。
12. **CRLF 噪声伪造 diff**：证归一无语义用 token 级比较；Edit "modified since read" 先重读。
13. **prettier 破损表格输出整表去对齐**：别 `--no-verify` 绕 husky。
14. **⚠️ WSL2 + LHCI**：`PATH` 加 `/mnt/c/Users/21711/AppData/Local` + `CHROME_PATH` 指 playwright chromium；跑完清理 CWD 字面量目录。CI 无此问题。
15. **commitlint**：每行 ≤100 字符；别 `--no-verify`。
16. **记录时间戳用 `date -u`**（出过 `2026-09-31`）。
17. **资源「孤儿」判定**：动态构造需找构造点；删前全类型 grep 0 引用 + 产物验证；大文件 `git ls-files` + md5（#128 套路）。
18. **全量扫描用 `git grep`**，别 `--include` 过滤（漏过无扩展名 Makefile）。
19. **外链 404 先分类**：占位符/示例/快照/私有 ≠ 死链。
20. **自动化 workflow 审「触发器 × 条件 × 目标」三元组**（#148）；labeler 默认 OR（#146）；门禁审覆盖面 + 反向注入（#140）；「文档教的命令」一律实跑（#134/#138）；`file:line` 内容级核验（#136）；集合差先分类（#20）；部分修复复查同段（#144）。
21. **412 全绿 ≠ 改动无害**：重命名 unused 变量先确认函数体内无引用（第 16 轮）。
22. **锁协议**：`.agent/LOCK` 超 30min 可接管（注明「接管过期锁」）；正常结束删锁；锁不提交。

## 六、关键命令速查

```bash
# 同步与状态
git fetch --all --prune && git pull --rebase
cat .agent/STATE.md .agent/HANDOFF.md

# 本机门禁（mise 环境，见坑 7）
mise exec -- pnpm lint && mise exec -- pnpm format:check
mise exec -- pnpm exec tsc --noEmit && mise exec -- pnpm test:run
mise exec -- pnpm build && mise exec -- pnpm quality:bundle && mise exec -- pnpm quality:theme
mise exec -- pnpm quality:routes && mise exec -- pnpm test:e2e
mise exec -- pnpm audit --audit-level=moderate

# 提交（husky 需 pnpm 在 PATH，同命令内 export）
export PATH="$HOME/.local/share/mise/installs/pnpm/11:$HOME/.local/share/mise/installs/node/22/bin:$PATH"

# PR / CI（注意 gh pr create 偶发空回，建后 list 核对）
gh pr list --state open --json number,title,headRefName --jq '.[] | "#\(.number) \(.title)"'
gh run list --workflow=ci-cd.yml --branch main --limit 5 --json headSha,status,conclusion

# 部署与线上验收（仅产物变化时；先 git pull，见坑 1）
mise exec -- pnpm deploy:worker
curl -sI https://huat-fsac.eu.org/ | grep -iE '^(HTTP|content-security-policy)'
curl -s -o /dev/null -w "%{http_code}" https://huat-fsac.eu.org/docs-center/contributing/
```

## 七、与看板 / 前一棒的一致性

- `docs/WORKFLOW.md:§4` T-001..T-038 全部已完成；现走 issue 线，`§7.4` 逐轮追加日志行（本轮新增第 30 轮行，随记录 commit 入 main）。
- 前棒（glm 第 28–29 轮）结论与坑位已并入第五节；更早见 git 历史。
- 用户已授权免 review 自主推进长期生效：新 PR 仍需 CI 全绿才可合并；自动 PR（dependabot/release-please/metrics）不碰。
