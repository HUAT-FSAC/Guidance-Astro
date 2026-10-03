# ENV.md — 环境探测缓存（人工可编辑覆盖，人工版本优先）

- 主分支：main
- 构建：pnpm build（产出 dist/server/entry.mjs，Cloudflare Worker SSR）
- 测试：pnpm test:run（Vitest；e2e 为 pnpm test:e2e，Playwright）
- Lint：pnpm lint（ESLint src）；另有 pnpm format:check（Prettier）、pnpm exec tsc --noEmit（typecheck）
- 包管理器：pnpm 11（存在 pnpm-lock.yaml；Node 22，见 .nvmrc）
- gh：可用（账号 zhangjszs，token scopes 实测：`gist` / `read:org` / `repo` / `workflow`；**无 `read:project`** → GitHub Projects 看板不可验证）
- 远程（`git remote -v` 实测）：`origin` = `HUAT-FSAC/Guidance-Astro`（主干）；`wsyhuat` = `wsyhuat/Guidance-Astro`（**协作方 fork**，需每轮巡检 inbound，见 #169）
- Actions Secrets（`gh api .../actions/secrets` 实测）：仅 `CODECOV_TOKEN` / `PROJECT_TOKEN`；**无 `CLOUDFLARE_API_TOKEN`**（#101 阻塞根因）
- 其他门禁（CI 同款）：pnpm audit --audit-level=moderate、pnpm quality:bundle、pnpm quality:theme、pnpm quality:routes
- 部署：push main 后本机执行 `pnpm deploy:worker`，验 `curl -sI https://huat-fsac.eu.org/` 含 `content-security-policy: nonce-`
- 探测于 2026-09-29T23:43Z，agent glm-5.3-flash-20260929T234352Z
- 复核于 2026-10-03T09:55Z，agent planner-20261003T094000Z（更正 token scopes；补 second remote 与 Secrets 实测值。其余条目本轮未重测，仍沿用原探测结果）
