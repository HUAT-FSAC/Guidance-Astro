# Agent 接力状态（STATE）

> 本文件由“时间流接力开发”的每一棒追加/更新，与 `docs/WORKFLOW.md:§4/§7.4` 保持一致。
> 只记录进度/下一步/阻塞，不复制看板全表。**详细交接与命令速查见 `.agent/HANDOFF.md`。**

**最后更新：** 2026-09-29T16:25Z ｜ **当前 agent-id：** `deepseek-v4.1-flash-20260929T155840Z` ｜ **状态：进行中（第 3 轮）**
**本轮起点 HEAD：** `cf52391`（工作区干净、与 `origin/main` 0/0）

## 当前活跃任务

- **#116 [P2] sitemap 仅含 8 条 URL**（本轮第 2 轮主动发现并归档，第 3 轮**正在实现**）。
    - 根因：`output: 'server'` 全 SSR + Starlight 内容页走动态 `[...slug]` → 构建期无法枚举；`@astrojs/sitemap` 只收录 `src/pages/` 下的具体路径页，含 6 个 `en/archive` 302 跳转桩。
    - 证据与验收标准见 issue 正文。

## 本棒已完成

1. **`a47d534` refactor：清理 `astro check` 弃用提示 8→2（行为等价）** —— 已 push `main`、CI 全绿。
    - `toast.ts` / `search-history.ts` 的 `substr(2,9)`、`MemberCard.astro` 的 `substr(2,8)` → `slice`；`PageFrame.astro` 删除未使用的 `import type { Props }`；`cache-policy.ts` 未用形参 `context` → `_context`；`Giscus.astro` 显式 `is:inline`。
    - 验证：`astro check` 0 errors、8 hints → 2 hints；lint / format:check / tsc / audit 全清；`vitest` 391 passed；`pnpm build` OK；CI run `36594790382` 7/7 job success。
    - 剩余 2 条（`BilibiliVideo.astro` 的 `scrolling`、`share.ts:109` 的 `document.execCommand`）涉及真实行为/兼容性，**未动**（无测试覆盖、需浏览器验证）。
2. **部署**：`pnpm deploy:worker` 成功 → Worker 版本 `99887664-a8ea-4edf-9a17-fb2a23bdcd81`；线上 `curl -sI https://huat-fsac.eu.org/` → `HTTP/2 200` + CSP 含 `nonce-`，`frame-src` 含 bilibili，无 `x-frame-options`。
    - 产物核对：线上 `/_astro/enhanced-search.4nj0vnrI.js` 含 `toString(36).slice(2,11)`，`substr(2,` 计数为 0。
3. **`.agent/.gitignore`**：新增（忽略 `LOCK`）。此前仓库无该文件，导致按协议创建的 `.agent/LOCK` 会被误提交。
4. **#116 建单**：见上「当前活跃任务」。

## 扫描结论（主动发现，本轮）

- 线上 8 条 sitemap URL 逐条实测：6 条 302、2 条 200（详见 #116）。
- `src/utils/toast.ts`（443 行，导出 `showToast`/`createToast`/`toast`/`getToastHistory`/`clearToastHistory`）**全仓无任何引用** → 疑似死代码（`git log` 显示自 `971b9ac` 引入后从未接线）。**尚未处理、尚未建单**。
- `.gitignore` 的 `src/content/docs/en/archive/` 规则**指向错误目录**：真正含乱码文件名的旧归档桩在 `src/pages/en/archive/`（6 个 `.astro`），而该目录已被跟踪（69 文件），规则对已跟踪文件无效 → 规则等于无效且会静默吞掉该目录的新增文件。
- `pnpm audit` 干净；`src/` 无 TODO/FIXME；主干 CI 全绿。

## 下一步（给下一棒）

1. 完成 / 复核 **#116**（本轮正在实现）；若本轮未完成，HANDOFF 会写明卡点。
2. 候选（尚未建单）：`src/utils/toast.ts` 死代码（建议先建单再删，或保留——它是完整实现，可能是有意预留）；`.gitignore` 归档目录规则纠偏。
3. 剩余 2 条 `astro check` hint：`BilibiliVideo.astro:13` 的 `scrolling="no"`（应换 CSS `overflow:hidden`，需浏览器验证）、`share.ts:109` 的 `document.execCommand`（降级路径忽略返回值，失败仍上报成功；线上 HTTPS 不会走到该分支，价值低）。
4. override 时效性提醒见 `docs/WORKFLOW.md` 与 HANDOFF §五.2。

## 阻塞项

- **#101**（恢复 CI 自动部署）：阻塞于**人类操作**——需在仓库 `Settings → Secrets and variables → Actions` 配置 `CLOUDFLARE_API_TOKEN`（`CLOUDFLARE_ACCOUNT_ID` 不需要，见 `wrangler.json`）。在此之前线上部署只能走本机 `pnpm deploy:worker`（本棒已验证 wrangler OAuth 可用）。
