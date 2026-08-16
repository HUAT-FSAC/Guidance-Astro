# Cloudflare Worker SSR 部署切换 — 实施计划

**Goal:** 让线上 `huat-fsac.eu.org` 走 Worker SSR（middleware CSP nonce 生效），不再以静态 Pages CDN 为主。

**背景:** 代码侧已完成 SSR 改造（`output: 'server'` + `@astrojs/cloudflare` + `src/middleware.ts`），Cloudflare Pages 的 build command 也已改为 `wrangler deploy`。但自定义域名仍绑在 Pages 静态层，线上尚无 CSP nonce。

**预计耗时:** 30–45 分钟（Dashboard 操作 + 一次重新部署 + 验证）

**前置条件:**

- Cloudflare 账号 **Iridite**（`bfdcbff6cfe16d2b9bd657593ba88f5f`）管理员权限
- 本地可选：`wrangler login` 已完成

---

## 现状快照（2026-08-13）

| 层级                | 状态                                                                            |
| ------------------- | ------------------------------------------------------------------------------- |
| `astro.config.mjs`  | ✅ `output: 'server'` + `adapter: cloudflare()`                                 |
| `src/middleware.ts` | ✅ 每请求 CSP nonce + 安全头                                                    |
| 本地构建            | ✅ 产出 `dist/server/entry.mjs` + `wrangler.json`                               |
| Pages build command | ✅ `pnpm build && pnpm exec wrangler deploy --config dist/server/wrangler.json` |
| Pages 环境变量      | ❌ 缺 `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID`                          |
| 域名路由            | ❌ `huat-fsac.eu.org` 仍在 Pages，未绑 Worker                                   |
| 线上 CSP nonce      | ❌ 未生效                                                                       |

---

## Task 1: 创建 API Token

**Where:** [Cloudflare Dashboard → My Profile → API Tokens](https://dash.cloudflare.com/profile/api-tokens)

**Step 1:** Create Custom Token（或 Edit Cloudflare Workers 模板 + 补权限）

**Step 2:** 权限至少包含：

| 权限                         | 级别 |
| ---------------------------- | ---- |
| Account → Workers Scripts    | Edit |
| Account → Workers KV Storage | Edit |
| Account → Cloudflare Pages   | Edit |

**Step 3:** Account Resources 选 **Iridite**，创建并复制 token（只显示一次）

**验证:** token 字符串已安全保存（密码管理器或 CI secret，勿提交 git）

---

## Task 2: Pages 环境变量

**Where:** Dashboard → Workers & Pages → **Pages** 项目 `huat-fsac` → Settings → Environment variables

**Step 1:** 添加变量（**Production + Preview 都要勾选**）：

| Name                    | Value                              | Type      |
| ----------------------- | ---------------------------------- | --------- |
| `CLOUDFLARE_API_TOKEN`  | Task 1 的 token                    | Encrypt   |
| `CLOUDFLARE_ACCOUNT_ID` | `bfdcbff6cfe16d2b9bd657593ba88f5f` | Plaintext |

**验证:** Settings 页能看到两个变量，且 Production / Preview 均已启用

---

## Task 3: 域名从 Pages 切到 Worker

> Pages 与 Worker 同名 `huat-fsac`，操作前确认进入的是正确类型（Pages vs Worker）。

### 3a. 从 Pages 移除自定义域名

**Where:** Pages 项目 `huat-fsac` → Custom domains

**Step 1:** 移除 `huat-fsac.eu.org`（保留 `huat-fsac.pages.dev` 作对比用）

### 3b. 绑到 Worker

**Where:** **Worker** `huat-fsac` → Settings → Domains & Routes → Add → Custom domain

**Step 1:** 添加 `huat-fsac.eu.org`，等待状态 **Active**

**验证（可选，切正式域名前）:** 访问 `https://huat-fsac.<account>.workers.dev/`，Response Headers 含 `Content-Security-Policy` 且 HTML 含 `nonce=`

---

## Task 4: 重新部署

任选一种：

**A. Dashboard Retry（推荐）**

Pages 项目 `huat-fsac` → Deployments → 最新部署 → Retry deployment

**B. Git 触发**

```bash
git commit --allow-empty -m "chore: trigger Worker SSR redeploy"
git push origin main
```

**C. 本地直 deploy（需 wrangler login）**

```bash
pnpm deploy:worker
```

**验证 build log 必须包含:**

```
pnpm build
...
wrangler deploy --config dist/server/wrangler.json
Successfully deployed huat-fsac
```

**常见失败:**

| 报错                 | 处理                          |
| -------------------- | ----------------------------- |
| Authentication error | 检查 Task 2 环境变量          |
| KV namespace         | 确认 token 有 Workers KV Edit |

---

## Task 5: 线上验收

访问 `https://huat-fsac.eu.org/`，检查 Response Headers：

| 检查项                    | 切换前（当前）            | 切换后（目标）                       |
| ------------------------- | ------------------------- | ------------------------------------ |
| `Content-Security-Policy` | 无                        | 有，含 `'nonce-...'`                 |
| HTML `Cache-Control`      | `public, s-maxage=604800` | `private, no-cache, must-revalidate` |
| 页面源码                  | 无 `nonce=`               | inline `<script>` 带 nonce           |

PowerShell 快速检查：

```powershell
$r = Invoke-WebRequest -Uri "https://huat-fsac.eu.org/" -UseBasicParsing
$r.Headers["Content-Security-Policy"]
$r.Headers["Cache-Control"]
$r.Content -match 'nonce='
```

本地对照（不碰线上）：

```bash
pnpm build && pnpm preview:ssr
# http://127.0.0.1:8787
```

---

## Task 6: 收尾（可选）

- [ ] 更新 `docs/DEPLOYMENT.md`（静态部署说明 → Worker SSR）
- [ ] 提交未 push 的 `src/middleware.ts` 小改动（headers / Content-Type 修复）
- [ ] 确认 CI `quality-gate` job 的 `preview:ssr` smoke test 仍绿

---

## 回滚方案

若切换后站点异常：

1. Worker `huat-fsac` → Domains → 移除 `huat-fsac.eu.org`
2. Pages 项目 → Custom domains → 重新添加 `huat-fsac.eu.org`
3. Pages → Deployments → 回滚到切换前的一次静态部署

回滚后 CSP nonce 不会生效，但站点可恢复可访问。

---

## 相关文件

| 文件                             | 用途                       |
| -------------------------------- | -------------------------- |
| `astro.config.mjs`               | SSR + Cloudflare adapter   |
| `src/middleware.ts`              | CSP nonce 注入             |
| `src/config/security.ts`         | CSP / 安全头定义           |
| `wrangler.json`                  | Worker 根配置              |
| `dist/server/wrangler.json`      | 构建产物（含 ASSETS 绑定） |
| `scripts/patch-cf-pages.mjs`     | PATCH Pages build command  |
| `package.json` → `deploy:worker` | 本地 Worker 部署           |

---

## 执行顺序

```
Task 1 (Token) → Task 2 (Env Vars) → Task 3 (域名) → Task 4 (部署) → Task 5 (验收) → Task 6 (文档)
```

后期执行时，按 Task 1–5 顺序走一遍即可；代码无需再改。
