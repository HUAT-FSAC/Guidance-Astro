# 交接说明（HANDOFF）

**本棒 Agent：** `deepseek-v4.1-flash-20260929T155840Z`
**时间：** 2026-09-29（UTC，约 15:58 起）
**仓库 / 分支：** `HUAT-FSAC/Guidance-Astro` ｜ `main`
**本轮起点 HEAD：** `cf52391`（工作区干净、与 `origin/main` 0/0 同步）

> 下一棒请先按 `docs/WORKFLOW.md:§1/§3` 与 `AGENTS.md` 的「发布与部署」执行：
> `git fetch --all --prune` → `git pull --rebase` → 读 `.agent/STATE.md` + 本文件 → 检查 `.agent/LOCK` → 选任务。

---

## 一、本棒做了什么

### 第 1 轮：清理 `astro check` 弃用提示（`a47d534`，已 push / 已部署 / CI 全绿）

`refactor: 清理 astro check 弃用提示 8→2，行为等价`

| 文件                                       | 改动                                   | 依据                                                                 |
| ------------------------------------------ | -------------------------------------- | -------------------------------------------------------------------- |
| `src/utils/toast.ts:270`                   | `substr(2,9)` → `slice(2,11)`          | `substr(start,len)` ≡ `slice(start,start+len)`（start≥0 字面量）     |
| `src/utils/search-history.ts:46`           | 同上                                   | 同上                                                                 |
| `src/components/docs/MemberCard.astro:40`  | `substr(2,8)` → `slice(2,10)`          | 同上                                                                 |
| `src/components/overrides/PageFrame.astro` | 删除 `import type { Props }`（未使用） | 该类型文件内零引用，纯删除                                           |
| `src/middleware/cache-policy.ts:7`         | 未用形参 `context` → `_context`        | 对齐 eslint `argsIgnorePattern:'^_'` 与 TS `noUnusedParameters`      |
| `src/components/Giscus.astro`              | 显式 `is:inline`                       | Astro 因该 `<script>` 含自定义属性本已按内联处理（hint astro(4000)） |

验证（全部本地复跑）：`astro check` **0 errors / 8 hints → 2 hints**；`lint`、`format:check`、`tsc --noEmit` 全清；`pnpm audit --audit-level=moderate` 干净；`vitest` **391 passed**；`pnpm build` 成功。CI run `36594790382` **7/7 job success**。

**剩余 2 条 hint 刻意未动**（无测试覆盖且属行为/兼容性变更）：

- `src/components/docs/BilibiliVideo.astro:13` — `scrolling="no"`（废弃 HTML 属性；现代等价是 CSS `overflow:hidden`，但跨源 iframe 滚动条行为需浏览器实测）
- `src/utils/share.ts:109` — `document.execCommand('copy')`（降级路径；线上 HTTPS 必走 `navigator.clipboard`，该分支不可达）

### 第 1 轮：部署 + 线上验收

- `pnpm deploy:worker` → Worker 版本 **`99887664-a8ea-4edf-9a17-fb2a23bdcd81`**（4 个改动静态资源，200 个复用）。
- `curl -sI https://huat-fsac.eu.org/` → `HTTP/2 200`；CSP 含 `'nonce-…'`、`frame-src … https://player.bilibili.com`；无 `x-frame-options`；`cache-control: private, no-cache, must-revalidate`。
- 产物核对：线上 `/_astro/enhanced-search.4nj0vnrI.js` 含 `toString(36).slice(2,11)`，`substr(2,` 出现 0 次。

### 第 1 轮：补 `.agent/.gitignore`

仓库此前**没有** `.agent/.gitignore`，按协议创建的 `.agent/LOCK` 会被误提交。已新增（内容：`LOCK`）。`.agent/` 无 `ISSUE_DRAFTS/`（本环境 gh 可用，未需要）。

### 第 2 轮：主动发现 → 建单 #116

`https://github.com/HUAT-FSAC/Guidance-Astro/issues/116`（`priority:p2` / `type:bug` / `area:frontend` / `risk:medium`）

> 仓库**没有** `auto-discovered` 标签，故用了 `type:bug` + `risk:medium` 代替；下一棒若想按 §7 模板标注，可先建该标签。

核心事实（可复现）：

```bash
curl -s https://huat-fsac.eu.org/sitemap-0.xml | grep -o '<loc>[^<]*</loc>' | wc -l   # → 8
```

8 条里 **6 条返回 302**（都是 `src/pages/en/archive/**/*.astro` 的 `Astro.redirect(...)` 兼容桩），**只有 2 条是 200**（`/showcase-dashboard/`、`/en/showcase-dashboard/`）。站点实际有 **166** 个 `src/content/docs/**/*.md|mdx` 内容文件 + 9 个 `src/pages/*.astro`。

根因：`astro.config.mjs:41` `output: 'server'`（全 SSR）→ Starlight 内容页走动态 `[...slug]`，`@astrojs/sitemap` 构建期枚举不到；能枚举的只有 `src/pages/` 下的具体路径页。`dist/client/sitemap-0.xml` 与线上一致，可本地复现。

### 第 3 轮：实现 #116

见本文件「三、下一棒要做」第 1 条（若已落地，`git log` 里会有 `fix:` 提交并在 #116 下有验证评论）。

---

## 二、交棒时主干状态

- `main` 全绿；本棒代码提交（`a47d534`）的 CI run `36594790382`：Audit / Lint&Format / Type Check / Tests / Build / Quality Gate / Preview 全部 success。
- 线上已部署且与 `main` 同步（纯 `.agent/*` 之后的文档提交不影响运行产物）。
- 工作区除 `.agent/LOCK`（本地锁，已被 `.gitignore` 忽略）外干净。

---

## 三、下一棒要做（按优先级）

1. **#116 sitemap 补全**（本轮正在做；若未完成，先看 `git log` / 本文件末尾的「未完成」段）。
    - 注意坑：`dist/client/sitemap-0.xml` 是**静态资源**，Worker 的 `assets` 绑定会先命中它，因此新增的运行时路由需要确认优先级（必要时要同步停掉 Starlight 内置 sitemap 生成）。
2. **候选发现（尚未建单，先查重再建）**：
    - `src/utils/toast.ts`（443 行）**全仓无引用**，疑似死代码；但它是完整实现（`createToast(locale)` 带 i18n），可能是有意预留 —— **建议先建单让人决定，不要直接删**。
    - `.gitignore` 的 `src/content/docs/en/archive/` 规则**指错目录**：真正的乱码旧归档桩在 `src/pages/en/archive/`（6 个 `.astro`，且已跟踪）。规则对已跟踪文件无效，还会静默吞掉该目录新增文件。
3. 剩余 2 条 `astro check` hint（见第一节末），价值低、需浏览器实测，可按需处理。
4. **#101 阻塞**（人类配 Secret），**不要**在无 Secret 下把 deploy job 加回 `ci-cd.yml`。

---

## 四、阻塞项（需人类操作）

- **#101 恢复 CI 自动部署**：需在 GitHub 仓库 `Settings → Secrets and variables → Actions` 配置 `CLOUDFLARE_API_TOKEN`（`CLOUDFLARE_ACCOUNT_ID` **不需要**——`account_id` 已在 `wrangler.json` 并由 build 注入 `dist/server/wrangler.json`）。配好后按 #101 拆解把 deploy job 加回（完整实现见提交 `8475f88`）。
- 在此之前：线上部署只能靠**本机 `wrangler` OAuth**——本棒已验证本机登录态可用（`pnpm deploy:worker` 成功）。该登录态只存在于当前 Windows profile（换机/重装需重跑 `wrangler login`，且需 strip 本地 proxy）。
- 本棒已在 #101 下无新增留言（上一棒 2026-09-29 已留言，避免刷屏）。

---

## 五、注意事项 / 坑

1. **分支保护与直推**：`main` 受保护（要求 PR + `quality-gate`），但当前 token 具 **bypass** 权限，本棒直接 push `main` 成功（remote 打印 "Bypassed rule violations"，属预期）。若下一棒 token 权限不同而被拒，改走 `auto/<时间戳>-<简述>` 分支 + PR（**不自动 merge**）。
2. **依赖 override 时效性（重要教训，上一棒记录）**：`pnpm-workspace.yaml` 用一批 `"pkg@<X": ">=Y"` override 压平传递依赖漏洞。安全公告拓宽受影响区间时旧下限会漏网 → `pnpm audit --audit-level=moderate` 失败、main 变红。**遇 `Audit Dependencies` 失败时第一反应**：`pnpm why <pkg>` → 把 `pnpm-workspace.yaml` 对应 override 下限提到 patched 版本 → `pnpm install` → `pnpm audit` 复验。
3. **双远程**：`origin` = `HUAT-FSAC/Guidance-Astro`（权威）；`wsyhuat` = fork，`wsyhuat/main` 是**独立代码线**（含单独首页 UI 重设计），**不要**当上游、不要向它 rebase。
4. **部署判据**：影响线上运行产物的改动（`src/**`、`astro.config.mjs`、`public/**`、依赖）push `main` 后**自动**执行 `pnpm deploy:worker`，以 `curl -sI https://huat-fsac.eu.org/` 含 `content-security-policy: nonce-` 为验收。纯文档 / 纯 `.agent/**` 改动可不必部署。
5. **`.astro` 文件是 CRLF**（`.gitattributes` 声明 `eol=lf`，git 入库时归一为 LF）。用工具编辑时注意别引入混合行尾；`prettier` 不覆盖 `.astro`，`astro check` 也不报行尾。
6. **仓库无 `robots.txt` 源文件**：线上 `/robots.txt` 只有一段 Cloudflare「content signals」注释块，**没有 `User-agent`/`Allow`/`Disallow`/`Sitemap` 指令**（`grep -iE '^(user-agent|allow|disallow|sitemap)'` 无匹配）。疑似 zone 级注入；若要控制需确认是在 Cloudflare 侧还是仓库侧补 `public/robots.txt`。

---

## 六、关键命令速查

```bash
# 同步与状态
git fetch --all --prune && git pull --rebase
cat .agent/STATE.md .agent/HANDOFF.md

# 门禁（§6）
pnpm audit --audit-level=moderate && pnpm lint && pnpm format:check \
  && pnpm exec tsc --noEmit && pnpm test:run && pnpm build

# astro 诊断（非门禁项，但能发现弃用/未用告警）
pnpm exec astro check

# 部署与线上验收
pnpm deploy:worker
curl -sI https://huat-fsac.eu.org/ | grep -iE '^(HTTP|content-security-policy|cache-control)'
curl -s https://huat-fsac.eu.org/sitemap-0.xml | grep -o '<loc>[^<]*</loc>' | wc -l

# CI 状态（gh run list 比 gh api 列 runs 更可靠）
gh run list --workflow=ci-cd.yml --limit 5
```

---

## 七、与看板 / 前一棒的一致性

- `docs/WORKFLOW.md:§4` 任务表 T-001..T-038 **全部 已完成**，无 Ready 任务。
- 本棒起点（上一棒 `5f5d9e2` + `cf52391`）已完成：推送上一棒的 #99/#100/#102–#105、修复 undici override 致 main 红灯、消除 `docs/WORKFLOW.md` §2 文档漂移。
- 开放 issue：**#101**（P1，阻塞于人类配 Secret）、**#116**（P2，本棒建单）。
