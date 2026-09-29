# ENV.md — 环境探测缓存（人工可编辑覆盖，人工版本优先）

- 主分支：main
- 构建：pnpm build（产出 dist/server/entry.mjs，Cloudflare Worker SSR）
- 测试：pnpm test:run（Vitest；e2e 为 pnpm test:e2e，Playwright）
- Lint：pnpm lint（ESLint src）；另有 pnpm format:check（Prettier）、pnpm exec tsc --noEmit（typecheck）
- 包管理器：pnpm 11（存在 pnpm-lock.yaml；Node 22，见 .nvmrc）
- gh：可用（账号 zhangjszs，token scopes: repo/workflow）
- 其他门禁（CI 同款）：pnpm audit --audit-level=moderate、pnpm quality:bundle、pnpm quality:theme、pnpm quality:routes
- 部署：push main 后本机执行 `pnpm deploy:worker`，验 `curl -sI https://huat-fsac.eu.org/` 含 `content-security-policy: nonce-`
- 探测于 2026-09-29T23:43Z，agent glm-5.3-flash-20260929T234352Z
