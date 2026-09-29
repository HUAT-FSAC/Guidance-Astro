# Agent 接力状态（STATE）

> 本文件由“时间流接力开发”的每一棒追加/更新，与 `docs/WORKFLOW.md:§4/§7.4` 保持一致。
> 只记录进度/下一步/阻塞，不复制看板全表。**详细交接与命令速查见 `.agent/HANDOFF.md`。**

**最后更新：** 2026-09-29T16:40Z ｜ **当前 agent-id：** `deepseek-v4.1-flash-20260929T155840Z` ｜ **状态：进行中（第 4 轮）**
**本轮起点 HEAD：** `cf52391`（工作区干净、与 `origin/main` 0/0）

## 当前活跃任务

- 无进行中的 issue。**#116 已实现、验证、关闭**（见「本棒已完成」第 3 条）。
- 第 4 轮候选：内容页内部链接完整性静态扫描（未开始）。

## 本棒已完成

1. **`a47d534` refactor：清理 `astro check` 弃用提示 8→2（行为等价）** —— 已 push `main`、CI 全绿。
    - `toast.ts` / `search-history.ts` 的 `substr(2,9)`、`MemberCard.astro` 的 `substr(2,8)` → `slice`；`PageFrame.astro` 删除未使用的 `import type { Props }`；`cache-policy.ts` 未用形参 `context` → `_context`；`Giscus.astro` 显式 `is:inline`。
    - 验证：`astro check` 0 errors、8 hints → 2 hints；lint / format:check / tsc / audit 全清；`vitest` 391 passed；`pnpm build` OK；CI run `36594790382` 7/7 job success。
2. **部署（第 1 轮）**：`pnpm deploy:worker` 成功 → Worker 版本 `99887664-a8ea-4edf-9a17-fb2a23bdcd81`；线上 `curl -sI https://huat-fsac.eu.org/` → `HTTP/2 200` + CSP 含 `nonce-`，`frame-src` 含 bilibili，无 `x-frame-options`。
    - 产物核对：线上 `/_astro/enhanced-search.4nj0vnrI.js` 含 `toString(36).slice(2,11)`，`substr(2,` 计数为 0。
3. **`751607a` fix #116：sitemap 补全（8 → 167 条 URL，剔除 302 跳转桩）** —— push + 部署 + CI 全绿 + issue 已关。
    - 新增 `src/integrations/sitemap-paths.ts` + `tests/unit/sitemap-paths.test.ts`（18 例）；`astro.config.mjs` 注册 `@astrojs/sitemap` 并接 `customPages` / `filter`。
    - 线上逐条抓取 **167/167 = 200**；本地 SSR 亦 167/167 = 200；6 个 302 跳转桩 + noindex 的 `/docs/` 已剔除；167 条中 120 条带双语 hreflang。
    - 部署版本 `be4edbf6-a3da-473b-a5f2-4e2c11bd5a43`；CI run `36597170430` 7/7 job success。
    - 关键坑：内容页 URL 会被 Astro **逐段 slug**（`github-slugger`），静态页不会 —— 见 HANDOFF §五.7。
4. **`.agent/.gitignore`**：新增（忽略 `LOCK`）。此前仓库无该文件，导致按协议创建的 `.agent/LOCK` 会被误提交。
5. **依赖**：显式声明已在依赖树中的 `@astrojs/sitemap@3.7.3`、`github-slugger@2.0.0`（lockfile 仅 +6 行、无新增包）。

## 扫描结论（主动发现）

- sitemap 缺陷已修复（#116）。修复过程中额外确认：`archive/general/ROS 入门/*`、
  `archive/general/vsc-c-c++-dev-and-debug.mdx` 的真实可访问 URL 是 slug 化后的
  （`ros-入门`、`vsc-c-c-dev-and-debug`）—— 先前误判它们为“孤儿 404 页面”，实为路径推断口径错误。
- **`src/utils/toast.ts`（443 行）全仓无任何引用** —— 疑似死代码，但实现完整（`createToast(locale)` 带 i18n），
  可能是刻意预留。**未处理、未建单**（建议先建单由人决定）。
- **`.gitignore` 的 `src/content/docs/en/archive/` 规则指向错误目录**：真正的乱码归档桩在
  `src/pages/en/archive/`（6 个 `.astro`，已跟踪）；该规则的目标目录已跟踪 69 个文件、规则对已跟踪文件无效，
  却会静默吞掉该目录的**新增**文件（该目录内容现已全部进入 sitemap）。**未处理、未建单**。
- 剩余 2 条 `astro check` hint（`BilibiliVideo.astro:13` 的 `scrolling`、`share.ts:109` 的 `document.execCommand`）
  价值低、需浏览器实测，未动。
- 仓库无 `public/robots.txt`；线上 `/robots.txt` 只有 Cloudflare content-signals 注释块，无任何指令行，
  疑似 zone 级注入 —— 若要加 `Sitemap:` 需先确认改哪一侧。
- `pnpm audit` 干净；`src/` 无 TODO/FIXME；主干 CI 全绿。

## 下一步（给下一棒）

1. 第 4 轮：内容页内部链接静态扫描（把 `.md/.mdx` 里的站内链接解析后与合法路由集合比对，找 404）。
   已有素材：`src/integrations/sitemap-paths.ts` 的 `collectContentPagePaths()` 可直接用作“合法路由集合”，
   还要并上 `src/pages/` 的静态页与 `_redirects` 的 301 映射。
2. 视扫描结果建单或直接修（仅低风险高确定性才直接修）。
3. 备选建单：`src/utils/toast.ts` 死代码；`.gitignore` 归档目录规则纠偏。**每轮最多新建 1 个 issue。**

## 阻塞项

- **#101**（恢复 CI 自动部署）：阻塞于**人类操作**——需在仓库 `Settings → Secrets and variables → Actions` 配置 `CLOUDFLARE_API_TOKEN`（`CLOUDFLARE_ACCOUNT_ID` 不需要，见 `wrangler.json`）。在此之前线上部署只能走本机 `pnpm deploy:worker`（本棒已验证 wrangler OAuth 可用）。
