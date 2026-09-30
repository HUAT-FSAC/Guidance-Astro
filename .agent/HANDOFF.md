# 交接说明（HANDOFF）

**本棒 Agent：** `glm-5.3-flash-20260929T234352Z`
**时间：** 2026-09-29T23:43Z 起（UTC）
**仓库 / 分支：** `HUAT-FSAC/Guidance-Astro` ｜ `main`
**本棒起点 HEAD：** `751607a`（工作区有上一棒未提交的 STATE/HANDOFF 更新，已补提）

> 下一棒请先按 `docs/WORKFLOW.md:§1/§3` 与 `AGENTS.md` 的「发布与部署」执行：
> `git fetch --all --prune` → `git pull --rebase` → 读 `.agent/STATE.md` + 本文件 → 检查 `.agent/LOCK` → 选任务。

---

## 一、本棒做了什么

### 第 1 轮：接管 + 补提上一棒遗留（`8cec201`）

- 上一棒 `deepseek-v4.1-flash-20260929T155840Z` 完成了 3 轮工作（`a47d534` astro check 清理、#116 sitemap 修复 `751607a`）后**在第 4 轮中断**：LOCK 未删（过期 6.5h+）、STATE/HANDOFF 已改未提交。本棒判定记录与 git 历史吻合 → 补提为 `8cec201` 并推送。
- 首轮环境探测 → 新增 `.agent/ENV.md`（此前仓库从无此文件）。

### 第 1 轮：内部链接完整性扫描 → 建单 #117 → 修复并关闭（`748a3cb`）

**扫描**（一次性脚本，未入库）：解析 `src/content/docs/**` 全部 md/mdx 的站内链接（markdown + MDX 属性），与「内容页逐段 slug 路由 + `src/pages` 静态页 + redirects 键 + public 文件」比对。结果：290 条内链中 **16 处 404**，分布 6 个文件；根因是内容迁移后旧中文分组路径（`/规控/`、`/感知/`、`/文档中心/`、`/2025/`）未同步 + `++` 文件名 slug 陷阱。

**修复（9 文件 +233/−53）**

1. 6 个内容文件 16 处链接全部指向已核实存在的路由（映射表见 #117 单内表格）。
2. `astro.config.mjs` 的 `redirects` 表抽到 `src/config/redirects.ts`（行为等价；astro.config 已有导入本地 TS 模块的先例）。
3. 新增 `tests/unit/internal-links.test.ts`（3 例）——把扫描固化为**永久回归门禁**：合法集合复用 `src/integrations/sitemap-paths.ts` 导出（`docFilePathToSitePath` / `pageFilePathToSitePath` / `listFiles`），redirects 从新模块 import。**新加内容页如果写了 404 内链，CI 直接红。**

**验证**

- 本地：lint / format:check / tsc / vitest **412 passed**（409+新 3）/ audit / build / quality:bundle / quality:theme 全绿；sitemap 仍 167 条。
- CI run `36648032991` **7/7 success**。
- 部署版本 `df007a5b-f9ae-4d30-8352-3911fe1a7dac`；线上 15 个目标 URL 逐条 **200**；5 个修复页旧路径出现 **0** 次；`curl -sI /` 含 `content-security-policy: nonce-`。
- #117 由 `fix: #117` 提交自动关闭，已回填修复报告评论（含验证证据）。

---

## 二、交棒时主干状态

- `main` 全绿（本地门禁 + CI 7/7）；线上与 `main` 同步（版本 `df007a5b`）。
- 开放 issue：**#101**（P1，阻塞于人类配 Secret）。#117 已关闭。
- 工作区干净（LOCK 为本地运行时锁，不入库）。

---

## 三、下一棒要做（按优先级）

1. **`.gitignore` 误规则纠偏**（轮 2 候选）：规则 `src/content/docs/en/archive/` 指向**真实内容目录**（69 个已跟踪 md/mdx），#117 修复时它实际拦截了 `git add`（被迫 `-f`）。动手前先 `git log -S "src/content/docs/en/archive"` 确认当初意图；最小修复 = 删除该条。是否给 `src/pages/en/archive/`（6 个跳转桩 .astro）补规则属产品决策，留给人定。
2. **备选建单**（每轮最多 1 个新 issue，先查重）：
    - `src/utils/toast.ts`（443 行）全仓无引用，疑似死代码但实现完整（含 i18n）→ 建单让人决定，**不要直接删**。
    - `public/robots.txt` 缺失：线上 `/robots.txt` 只有 Cloudflare content-signals 注释块、无指令行（疑似 zone 级注入）。#116 后 sitemap 已有 167 条，补 `Sitemap:` 行是自然下一步，但需先确认改哪一侧（本地加 `public/robots.txt` 后 `wrangler dev` + 线上各验一次）。
3. **#101 阻塞**（人类配 Secret），**不要**在无 Secret 下把 deploy job 加回 `ci-cd.yml`。
4. 剩余 2 条 `astro check` hint（`BilibiliVideo.astro:13` scrolling、`share.ts:109` execCommand）价值低、需浏览器实测，勿动。

---

## 四、阻塞项（需人类操作）

- **#101 恢复 CI 自动部署**：需在 GitHub 仓库 `Settings → Secrets and variables → Actions` 配置 `CLOUDFLARE_API_TOKEN`（`CLOUDFLARE_ACCOUNT_ID` 不需要）。配好后按 #101 拆解把 deploy job 加回（完整实现见提交 `8475f88`）。
- 在此之前线上部署走本机 `wrangler` OAuth（本棒已成功部署 1 次；登录态只存在于当前 Windows profile，换机需重跑 `wrangler login`）。

---

## 五、注意事项 / 坑

1. **分支保护与直推**：`main` 受保护，但当前 token 有 **bypass** 权限，直接 push `main` 成功（remote 打印 "Bypassed rule violations" 属预期）。token 权限不同则改走 `auto/<时间戳>-<简述>` 分支 + PR（不自动 merge）。
2. **双远程**：`origin` = `HUAT-FSAC/Guidance-Astro`（权威）；`wsyhuat` = fork 且是独立代码线，**不要**当上游。
3. **部署判据**：影响线上产物的改动（`src/**`、`astro.config.mjs`、`public/**`、依赖）push 后**自动** `pnpm deploy:worker`，验收 `curl -sI https://huat-fsac.eu.org/` 含 `content-security-policy: nonce-`。纯 `.agent/**` / docs 改动可不部署。
4. **内容页 URL 逐段 slug**（#116/#117 两次验证）：`src/content/docs/**` 的 URL 由 `github-slugger` 逐段处理（`vsc-c-c++-dev-and-debug` → `vsc-c-c-dev-and-debug`、`ROS 入门` → `ros-入门`），`src/pages/**` 不 slug。任何由文件路径推 URL 的代码必须走 `src/integrations/sitemap-paths.ts`。
5. **`@assets/` 别名图片不是断链**：MDX 里 `![alt](@assets/...)` 由 Astro 构建期处理为 `/_image/?href=/_astro/...`（线上已实测）。链接扫描必须跳过 `@` 开头目标，否则几十条误报。
6. **行尾**：部分内容 `.mdx` 在磁盘上是 CRLF（`archive/sensing/index.mdx`、`archive/planning-control/index.mdx`、`archive/2024/2024-learning-roadmap.mdx`、`en/archive/2024/2024-learning-roadmap.mdx` 混合）。编辑用**单行替换**最稳；`.gitattributes` 已把 md/mdx 归一为 LF 入库，diff 不会爆炸。`.md`/`.mjs`/`.ts` 会过 husky lint-staged prettier，写完先 `pnpm format:check`。
7. **`.gitignore` 的 `src/content/docs/en/archive/` 规则会拦截 `git add`**（对该目录下**新增**文件；已跟踪文件的修改用 `-f` 可绕）。轮 2 修复前，遇到 add 被拒属正常，不要误判成权限问题。
8. **`fix: #N` commit subject 会自动关闭 issue**（本棒 #117 即如此）。想保持 open 就别在 subject 写 `fix: #N`。
9. **依赖 override 时效性**：`pnpm-workspace.yaml` 用 override 压平传递依赖漏洞；安全公告拓宽区间时旧下限漏网 → `Audit Dependencies` 红。第一反应：`pnpm why <pkg>` → 提 override 下限 → `pnpm install` → `pnpm audit` 复验。

---

## 六、关键命令速查

```bash
# 同步与状态
git fetch --all --prune && git pull --rebase
cat .agent/STATE.md .agent/HANDOFF.md

# 门禁（§6）
pnpm audit --audit-level=moderate && pnpm lint && pnpm format:check \
  && pnpm exec tsc --noEmit && pnpm test:run && pnpm build

# 链接完整性回归（#117 新增，随时可跑）
pnpm test:run tests/unit/internal-links.test.ts

# 部署与线上验收
pnpm deploy:worker
curl -sI https://huat-fsac.eu.org/ | grep -iE '^(HTTP|content-security-policy|cache-control)'
curl -s https://huat-fsac.eu.org/sitemap-0.xml | grep -o '<loc>' | wc -l   # → 167

# CI 状态
gh run list --workflow=ci-cd.yml --branch main --limit 5
gh run watch <runId> --exit-status --interval 20
```

---

## 七、与看板 / 前一棒的一致性

- `docs/WORKFLOW.md:§4` 任务表 T-001..T-038 全部已完成，无 Ready 任务；本棒工作走 issue 线（#117），已在 `§7.4` 追加日志。
- 上一棒 deepseek 的 #116（sitemap 8→167）结论仍成立；本棒 sitemap 复验 167 条不变。
- 开放 issue 仅剩 **#101**（阻塞于人类配 Secret）。
