# 交接说明（HANDOFF）

**本棒 Agent：** `deepseek-v4.1-flash-20260929T155840Z`
**时间：** 2026-09-29（UTC，约 15:58 起）
**仓库 / 分支：** `HUAT-FSAC/Guidance-Astro` ｜ `main`
**本棒起点 HEAD：** `cf52391`（工作区干净、与 `origin/main` 0/0 同步）

> 下一棒请先按 `docs/WORKFLOW.md:§1/§3` 与 `AGENTS.md` 的「发布与部署」执行：
> `git fetch --all --prune` → `git pull --rebase` → 读 `.agent/STATE.md` + 本文件 → 检查 `.agent/LOCK` → 选任务。

---

## 一、本棒做了什么

### 第 1 轮：清理 `astro check` 弃用提示（`a47d534`，已 push / 已部署 / CI 7/7 绿）

`refactor: 清理 astro check 弃用提示 8→2，行为等价`

| 文件                                       | 改动                                 | 依据                                                                 |
| ------------------------------------------ | ------------------------------------ | -------------------------------------------------------------------- |
| `src/utils/toast.ts:270`                   | `substr(2,9)` → `slice(2,11)`        | `substr(start,len)` ≡ `slice(start,start+len)`（start≥0 字面量）     |
| `src/utils/search-history.ts:46`           | 同上                                 | 同上                                                                 |
| `src/components/docs/MemberCard.astro:40`  | `substr(2,8)` → `slice(2,10)`        | 同上                                                                 |
| `src/components/overrides/PageFrame.astro` | 删除未使用的 `import type { Props }` | 该类型文件内零引用                                                   |
| `src/middleware/cache-policy.ts:7`         | 未用形参 `context` → `_context`      | 对齐 eslint `argsIgnorePattern:'^_'` 与 TS `noUnusedParameters`      |
| `src/components/Giscus.astro`              | 显式 `is:inline`                     | Astro 因该 `<script>` 含自定义属性本已按内联处理（hint astro(4000)） |

验证：`astro check` **0 errors / 8 hints → 2 hints**；lint、`format:check`、`tsc --noEmit` 全清；
`pnpm audit --audit-level=moderate` 干净；`vitest` **391 passed**；`pnpm build` 成功。
CI run `36594790382` **7/7 success**。

**剩余 2 条 hint 刻意未动**（无测试覆盖且属行为/兼容性变更）：

- `src/components/docs/BilibiliVideo.astro:13` — `scrolling="no"`（废弃 HTML 属性；现代等价是 CSS `overflow:hidden`，
  但跨源 iframe 滚动条行为需浏览器实测）
- `src/utils/share.ts:109` — `document.execCommand('copy')`（降级路径；线上 HTTPS 必走 `navigator.clipboard`，
  该分支实际不可达。可顺手修的是「忽略返回值 → 失败仍上报成功」，但价值很低）

### 第 1 轮：部署 + 线上验收

- `pnpm deploy:worker` → Worker 版本 **`99887664-a8ea-4edf-9a17-fb2a23bdcd81`**。
- `curl -sI https://huat-fsac.eu.org/` → `HTTP/2 200`；CSP 含 `'nonce-…'`；无 `x-frame-options`。
- 产物核对：线上 `/_astro/enhanced-search.4nj0vnrI.js` 含 `toString(36).slice(2,11)`，`substr(2,` 出现 0 次。

### 第 2 轮：主动发现 → 建单 #116

`https://github.com/HUAT-FSAC/Guidance-Astro/issues/116`（`priority:p2` / `type:bug` / `area:frontend` / `risk:medium`）

> 仓库**没有** `auto-discovered` 标签，故用了 `type:bug` + `risk:medium` 代替。

事实：线上 sitemap 只有 8 条 URL，其中 **6 条是 302**（`src/pages/en/archive/**/*.astro` 的
`Astro.redirect(...)` 兼容桩），只有 2 条 200（两个 showcase 页）；而站点有 166 个内容页。

### 第 3 轮：实现 #116 并关闭（`751607a`，已 push / 已部署 / CI 7/7 绿 / issue 已关）

**改动**

1. 新增 `src/integrations/sitemap-paths.ts`：构建期扫描文件系统，推导
    - 内容页站点路径 → sitemap 的 `customPages`；
    - 应剔除的页面（跳转桩 / 声明 `noindex` 的页如 `/docs/`）→ sitemap 的 `filter`。
2. `astro.config.mjs`：注册 `@astrojs/sitemap`（Starlight 检测到用户已注册时会跳过自己那份，
   故显式复刻 `getSitemapConfig()`：`i18n.defaultLocale='root'`、`locales={root:'zh-CN', en:'en'}`，
   否则双语 `hreflang` 失效）。
3. 新增 `tests/unit/sitemap-paths.test.ts`（18 例）。
4. 显式声明已在依赖树中的 `@astrojs/sitemap@3.7.3`、`github-slugger@2.0.0`（lockfile 仅 +6 行、无新增包）。

**验证（本地 + 线上都做了全量抓取）**

- sitemap 条数 **8 → 167**（165 内容页 + 2 showcase）。
- 本地 `wrangler dev` SSR：**167/167 = 200**；线上 `huat-fsac.eu.org`：**167/167 = 200，非 200 为 0**。
- 线上 sitemap 与本地构建产物集合**完全相同**（逐条 diff，两侧独有均为空）。
- 6 个 302 跳转桩与 `/docs/` 全部剔除；`/`、`/en/`、`/docs-center/`、`/join/`、`/team/` 等关键页仍在。
- 167 条中 **120 条**带 `xhtml:link rel="alternate"` 双语 hreflang（其余为单语页面，符合预期）。
- 部署版本 `be4edbf6-a3da-473b-a5f2-4e2c11bd5a43`；CI run `36597170430` 7/7 success。

### 第 4 轮起：见「三、下一棒要做」

---

## 二、交棒时主干状态

- `main` 全绿；本棒代码提交的 CI run 全部 success（`a47d534` → 7/7，`751607a` → 7/7）。
- 线上已部署且与 `main` 同步。
- 工作区除 `.agent/LOCK`（本地锁，已被 `.gitignore` 忽略）外干净。
- 开放 issue：**#101**（P1，阻塞于人类配 Secret）。#116 已关闭。

---

## 三、下一棒要做（按优先级）

1. **内容页内部链接完整性静态扫描**（推荐，低风险高信号）：
   把 `src/content/docs/**/*.md|mdx` 里的站内链接解析出来，与「合法路由集合」比对找 404。
   可直接复用 `src/integrations/sitemap-paths.ts` 的 `collectContentPagePaths()` 作为合法路由集合，
   但要注意它**只含内容页**：还要并上
    - `src/pages/` 下的静态页（`showcase-dashboard` 等），
    - `dist/client/_redirects`（或 `astro.config.mjs` 的 `redirects`）里的旧路径 301 映射，
    - 外部链接与锚点（`#...`）要跳过或单独处理。
2. **备选建单**（每轮最多新建 1 个 issue，先 `gh issue list --state all --search "<关键词>"` 查重）：
    - `src/utils/toast.ts`（443 行）**全仓无引用**，疑似死代码；但实现完整（含 i18n），可能是有意预留 →
      **建议先建单让人决定，不要直接删**。
    - `.gitignore` 的 `src/content/docs/en/archive/` 规则**指错目录**（真正的乱码归档桩在
      `src/pages/en/archive/`）；该规则对已跟踪文件无效，还会静默吞掉该目标目录的新增文件。
3. **#101 阻塞**（人类配 Secret），**不要**在无 Secret 下把 deploy job 加回 `ci-cd.yml`。
4. 剩余 2 条 `astro check` hint（见 §一末），价值低，可按需处理。

---

## 四、阻塞项（需人类操作）

- **#101 恢复 CI 自动部署**：需在 GitHub 仓库 `Settings → Secrets and variables → Actions` 配置
  `CLOUDFLARE_API_TOKEN`（**`CLOUDFLARE_ACCOUNT_ID` 不需要**——`account_id` 已在 `wrangler.json`
  并由 build 注入 `dist/server/wrangler.json`）。配好后按 #101 拆解把 deploy job 加回
  （完整实现见提交 `8475f88`）。
- 在此之前：线上部署只能靠**本机 `wrangler` OAuth**——本棒已验证可用（本棒已成功部署 2 次）。
  该登录态只存在于当前 Windows profile（换机/重装需重跑 `wrangler login`，且需 strip 本地 proxy）。
- 本棒未在 #101 下新增留言（上一棒 2026-09-29 已留言，避免刷屏）。

---

## 五、注意事项 / 坑

1. **分支保护与直推**：`main` 受保护（要求 PR + `quality-gate`），但当前 token 具 **bypass** 权限，
   本棒两次直接 push `main` 均成功（remote 打印 "Bypassed rule violations"，属预期）。
   若下一棒 token 权限不同而被拒，改走 `auto/<时间戳>-<简述>` 分支 + PR（**不自动 merge**）。
2. **依赖 override 时效性（上一棒的教训）**：`pnpm-workspace.yaml` 用一批 `"pkg@<X": ">=Y"` override
   压平传递依赖漏洞。安全公告拓宽受影响区间时旧下限会漏网 → `Audit Dependencies` 失败、main 变红。
   **第一反应**：`pnpm why <pkg>` → 把 override 下限提到 patched 版本 → `pnpm install` → `pnpm audit` 复验。
3. **双远程**：`origin` = `HUAT-FSAC/Guidance-Astro`（权威）；`wsyhuat` = fork，`wsyhuat/main` 是**独立代码线**
   （含单独首页 UI 重设计），**不要**当上游、不要向它 rebase。
4. **部署判据**：影响线上运行产物的改动（`src/**`、`astro.config.mjs`、`public/**`、依赖）push `main` 后
   **自动**执行 `pnpm deploy:worker`，以 `curl -sI https://huat-fsac.eu.org/` 含 `content-security-policy: nonce-` 为验收。
   纯文档 / 纯 `.agent/**` 改动可不必部署。
5. **`.astro` 文件是 CRLF**（`.gitattributes` 声明 `eol=lf`，git 入库时归一为 LF）。
   编辑工具要保留原行尾；`prettier` 不覆盖 `.astro`。**注意 `.md`/`.mjs` 会过 prettier**
   （husky `lint-staged`），所以写完 `.agent/*.md`、`astro.config.mjs` 后建议本地先跑一次
   `pnpm format:check`，否则 pre-commit 会改写文件、使 `Write` 工具报 “modified since read”。
6. **`fix: #N ...` 形式的 commit 会被 GitHub 自动关闭对应 issue**（本棒 `751607a` 即如此，
   在 push 后 #116 立刻被自动 close）。若某 issue 想保持 open，别在 subject 里写 `fix: #N`。
7. **⚠️ 内容页 URL 会被 Astro 逐段 slug（重要，本棒踩过）**：
   内容页（`src/content/docs/**`）的地址由 Astro 内容加载器生成，规则是
   `withoutFileExt.split('/').map(githubSlug).join('/').replace(/\/index$/,'')`
   （`astro/dist/content/utils.js → getContentEntryIdAndSlug`），即**逐段 slug**；
   而 `src/pages/**` 下的静态页**不做 slug**、按文件名原样映射。真实例子：

    | 源文件                                                     | 实际可访问 URL                                           |
    | ---------------------------------------------------------- | -------------------------------------------------------- |
    | `content/docs/archive/general/ROS 入门/…ws-and-package.md` | `/archive/general/ros-入门/…`（大写转小写、空格转 `-`）  |
    | `content/docs/archive/general/vsc-c-c++-dev-and-debug.mdx` | `/archive/general/vsc-c-c-dev-and-debug/`（`++` 被丢弃） |
    | `pages/en/archive/general/ROS 入门/x.astro`                | `/en/archive/general/ROS 入门/x/`（保留空格）            |

    中文段名不受影响（`电池箱` → `电池箱`）。**任何“由文件路径推断 URL”的代码都必须套用这一步**，
    否则会写出 404 的 URL。`src/integrations/sitemap-paths.ts` 已实现并有单测覆盖。

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
curl -s https://huat-fsac.eu.org/sitemap-0.xml | grep -o '<loc>' | wc -l   # → 167

# 本地 SSR 全量抓取（复现 sitemap 验收）
pnpm build
env -u HTTP_PROXY -u HTTPS_PROXY -u http_proxy -u https_proxy \
  pnpm exec wrangler dev dist/server/entry.mjs --config dist/server/wrangler.json --port 8787
# 另开终端：curl --noproxy '*' http://127.0.0.1:8787<path>  （wrangler dev 需 strip proxy）

# CI 状态（gh run list 比 gh api 列 runs 更可靠；加 --branch main 过滤）
gh run list --workflow=ci-cd.yml --branch main --limit 5
```

---

## 七、与看板 / 前一棒的一致性

- `docs/WORKFLOW.md:§4` 任务表 T-001..T-038 **全部 已完成**，无 Ready 任务。
- 上一棒（`5f5d9e2` + `cf52391`）已完成：推送上一棒的 #99/#100/#102–#105、修复 undici override
  致 main 红灯、消除 `docs/WORKFLOW.md` §2 文档漂移。
- 本棒新增并关闭 **#116**；开放 issue 仅剩 **#101**（P1，阻塞于人类配 Secret）。
