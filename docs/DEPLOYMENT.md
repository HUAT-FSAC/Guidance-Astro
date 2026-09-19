# Deployment Guide

This document describes how to deploy the HUAT FSAC documentation site to **Cloudflare Workers SSR**.

Production: [https://huat-fsac.eu.org](https://huat-fsac.eu.org) — zone route `huat-fsac.eu.org/*` → Worker `huat-fsac` (`wrangler.json:1`). `*.pages.dev` and Pages static output do **not** contain HTML under SSR; 404 on `pages.dev` is expected. Do not delete the zone DNS record for `huat-fsac.eu.org`.

---

## Architecture

- `astro.config.mjs:11` `output: 'server'` + `adapter: cloudflare({ imageService: 'compile' })`
- `src/middleware.ts:19` generates per-request CSP nonce via `src/config/security.ts` and injects `nonce="…"` into every `<script>`; `Cache-Control: private, no-cache, must-revalidate` for HTML
- `pnpm build` emits `dist/server/entry.mjs` (Worker) + `dist/server/wrangler.json` (assets binding `ASSETS → ../client`) + `dist/client/` (static assets)
- Deploy target is **Cloudflare Workers**, not `wrangler pages deploy`

---

## Deployment Path (current: Agent-local wrangler)

自 2026-09-19 起 `ci-cd.yml` **不再包含 `deploy` job**：Cloudflare API Token Secret 未配置，留着只会让 `main` 每次 push 长红。线上部署由 Agent / 维护者在本机执行（wrangler 走 OAuth 登录，不需要 Secret）：

```bash
pnpm deploy:worker   # ≡ pnpm build && wrangler deploy --config dist/server/wrangler.json
curl -sI https://huat-fsac.eu.org/ | grep -i content-security-policy   # 必须含 nonce-
```

### Restoring GitHub Actions auto-deploy

1. Create a custom token at <https://dash.cloudflare.com/profile/api-tokens> with:
    - `Workers Scripts — Edit`
    - `Workers KV Storage — Edit`（`SESSION` KV namespace）
    - `Cloudflare Pages — Edit`（仅下方 Pages 兜底路径需要）
2. `gh secret set CLOUDFLARE_API_TOKEN --repo HUAT-FSAC/Guidance-Astro`
3. Put the `deploy` job back: `git show 8475f88:.github/workflows/ci-cd.yml`（该版本已含缺 token 的 preflight 报错与部署后 nonce 重试断言）。

`CLOUDFLARE_ACCOUNT_ID` **不是必需的 Secret**：`account_id` 已提交在 `wrangler.json:3`，`pnpm build` 会把它注入 `dist/server/wrangler.json`，wrangler 部署时直接读取。

原 `deploy` job 的执行条件与产物复用（恢复后保持一致）：

- `if: github.ref == 'refs/heads/main' && github.event_name == 'push'`
- `environment: production` → `https://huat-fsac.eu.org`
- Reuses the `dist` artifact from `build` (no second `pnpm build`)
- Post-check: served HTML must contain `'nonce-…'`

### Alternative: Pages Git build invoking `wrangler deploy`

The Pages project `huat-fsac` has its Build Command patched to:

```
pnpm build && pnpm exec wrangler deploy --config dist/server/wrangler.json
```

(see `scripts/patch-cf-pages.mjs:22` and `docs/plans/2026-08-13-cloudflare-worker-ssr-deploy-plan.md:23`)

This path also requires **Pages → Settings → Environment variables** `CLOUDFLARE_API_TOKEN` (Encrypt) + `CLOUDFLARE_ACCOUNT_ID` (Plaintext) for **both Production and Preview**. Agent-local `pnpm deploy:worker` is the current primary path; the Pages-build path is kept as fallback and for `Retry deployment` from the Dashboard.

---

## Agent Auto-Deploy (current primary path) / Manual Fallback

Agent 已通过 `wrangler whoami`（OAuth `zcw85590@gmail.com` / `Iridite`）登录时，**`push main` 后无需人工指令**：

```bash
# Agent 自动执行（已写入 AGENTS.md 发布与部署）
pnpm deploy:worker
# ≡ pnpm build && wrangler deploy --config dist/server/wrangler.json
curl -sI https://huat-fsac.eu.org/ | grep -i content-security-policy # 必须含 nonce-
```

人工兜底（Agent 未登录或 CI Secrets 缺失）：

```bash
# once per machine
wrangler login

# deploy current checkout
pnpm deploy:worker
```

Verify locally without touching production:

```bash
pnpm build && pnpm preview:ssr
# http://127.0.0.1:8787  → check Response Headers → content-security-policy
```

---

## Verification (DoD for T-001)

After any deploy (auto or manual):

```bash
curl -sI https://huat-fsac.eu.org/ | grep -i content-security-policy
# expect: content-security-policy: default-src 'self'; script-src 'self' … 'nonce-…'

curl -s https://huat-fsac.eu.org/ | grep -o 'nonce-' | head -n 3
# expect: ≥1 match

curl -sI https://huat-fsac.eu.org/ | grep -i cache-control
# HTML: private, no-cache, must-revalidate
# /_astro/*.css: public, max-age=31536000, immutable
```

| Check                     | Before cutover (static Pages) | After Worker SSR                     |
| ------------------------- | ----------------------------- | ------------------------------------ |
| `content-security-policy` | absent                        | present, contains `'nonce-…'`        |
| HTML `cache-control`      | `public, s-maxage=…`          | `private, no-cache, must-revalidate` |
| HTML source               | no `nonce=`                   | inline `<script nonce="…">`          |

If `curl -sI https://huat-fsac.pages.dev/` returns 404, it is expected — SSR HTML is only served by the Worker.

---

## Preview Deployments

- PRs do **not** auto-deploy to Workers. CI runs `quality-gate` against `pnpm preview:ssr` (Playwright `tests/e2e/smoke.spec.ts`).
- To preview a branch manually: `pnpm build && wrangler deploy --config dist/server/wrangler.json` from that branch (requires `wrangler login`) or use `wrangler dev`.
- Workers preview URL: `https://huat-fsac.<account>.workers.dev/` (Response Headers should also contain CSP nonce).

---

## Rollback

### Via Dashboard

1. Cloudflare → Workers & Pages → **Workers** `huat-fsac` → Deployments
2. Select previous deployment → Rollback

### Via CLI

```bash
wrangler deployments list --config dist/server/wrangler.json
wrangler rollback --config dist/server/wrangler.json <deployment-id>
```

For Pages-managed fallback: Pages → `huat-fsac` → Deployments → Retry / Rollback (re-invokes the Git build that runs `wrangler deploy`).

---

## Troubleshooting

| Symptom                                  | Cause                                                         | Fix                                                                                                                        |
| ---------------------------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `Authentication error` in deploy job     | `CLOUDFLARE_API_TOKEN` missing or lacks Workers/KV/Pages Edit | Recreate token per task above; re-add to GitHub Secrets (and Pages env vars if using that path)                            |
| `KV namespace` error                     | Token missing Workers KV Edit                                 | Add permission and recreate token                                                                                          |
| `pages.dev` 404                          | SSR has no static HTML                                        | Expected — use `huat-fsac.eu.org` or `workers.dev`                                                                         |
| CSP header missing after deploy          | Deployed static Pages bundle, not Worker                      | Ensure `wrangler deploy --config dist/server/wrangler.json` ran; check `dist/server/wrangler.json` `assets.binding` exists |
| `pnpm: command not found` in Pages build | pnpm not in image                                             | Pages uses pnpm when `pnpm-lock.yaml` exists; retry build                                                                  |

---

## Related Documentation

- `docs/PROJECT_MANAGEMENT_MODEL.md:189` — release & deploy flow (broken auto-deploy note)
- `docs/plans/2026-08-13-cloudflare-worker-ssr-deploy-plan.md` — step-by-step cutover (Tasks 1–6)
- `docs/WORKFLOW.md:50` — stage 5 DoD (`curl -sI … nonce-`)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Astro Cloudflare Adapter](https://docs.astro.build/en/guides/deploy/cloudflare/)
- [Wrangler Deploy](https://developers.cloudflare.com/workers/wrangler/commands/#deploy)
