## 开发流程锚定（Agent 必读）

> **流程的单一事实来源：`docs/WORKFLOW.md`**（任务与验收 = GitHub Issues；路线 = `.agent/PLAN.md`；长期决策 = `.agent/DECISIONS.md`。载体分工见 `WORKFLOW.md §1.2`）
> 开始任何任务前，必须完整读取 `docs/WORKFLOW.md` 的 `§1 锚定规则` + `§3 工作流` + `§4 任务看板`，并全程遵循 `§6 质量门禁` 与 `§7 多 Agent 协作协议`。结束任务后回写 `docs/WORKFLOW.md:§7.4` 与 `.agent/STATE.md` / `.agent/HANDOFF.md`，并把执行结果写回对应 Issue（**`§4` 是历史冻结看板，不再新增行**；载体分工见 `WORKFLOW.md §1.2`）。

<!-- OPENWIKI:START -->

## OpenWiki

This repository has a generated `openwiki/` evidence index. It is optional just-in-time context, not required startup reading.

- Treat source code and tests as authoritative. A brief's unknowns and review items are verification gaps, not automatic requirements.
- Prefer the narrowest quiet validation that proves the changed behavior. Preserve complete failure output.

The scheduled OpenWiki GitHub Actions workflow refreshes the repository wiki. Do not hand-edit generated OpenWiki pages unless explicitly asked; prefer updating source code/docs and letting OpenWiki regenerate.

<!-- OPENWIKI:END -->

## 发布与部署（2026-09 现状，改动前必读）

- 线上 https://huat-fsac.eu.org 由 **Cloudflare Worker SSR** 提供服务：zone 路由 `huat-fsac.eu.org/*` → Worker `huat-fsac`。`*.pages.dev` 与 Pages 静态产物不含 HTML（SSR 架构下 HTML 由 Worker 运行时生成），访问 404 是预期现象，不要试图"修复"Pages。
- **部署路径（2026-09-19 起）**：CI **已不含 `deploy` job**——Cloudflare API Token Secret 未配置，留着只会让 `main` 每次 push 长红。线上部署由 **Agent 本地 `wrangler` OAuth** 承担：完成任何影响线上站点的改动并 `push main` 后，**必须自动执行 `pnpm deploy:worker`（`pnpm build && wrangler deploy --config dist/server/wrangler.json`）并以 `curl -sI https://huat-fsac.eu.org/` 的 CSP 头**内含每请求新生成的 `'nonce-…'`** 为验（判据：`grep -qiE "content-security-policy:.*nonce-"`；**注意字面串 `content-security-policy: nonce-` 永远不会出现**，nonce 在 `script-src` 里，见 #171 / D-001）。更强的一步：同一请求下比对响应头与 HTML 里 `nonce="…"` 的值是否一致）**，无需等待用户显式指令；若部署失败则重试一次并回写 `docs/WORKFLOW.md:§7.4`。
- 本机未登录（`wrangler whoami` 失败）时先 `wrangler login`（需 strip 本地 proxy）；仍不可用则**显式告知用户线上滞后于 main**，不要静默跳过部署。注意该 OAuth 登录态只存在于**当前 Windows 用户 profile**（`%APPDATA%\xdg.config\.wrangler\config\default.toml`）——换机器或重装系统后需重跑一次 `wrangler login`。
- **恢复 CI 自动部署**：只需配 `CLOUDFLARE_API_TOKEN` Secret（`CLOUDFLARE_ACCOUNT_ID` 不需要——`account_id` 已提交在 `wrangler.json` 并由 build 注入 `dist/server/wrangler.json`），再把 deploy job 加回 `ci-cd.yml`（完整实现在提交 `8475f88`）。
- ⚠️ 不要删除 zone 里 `huat-fsac.eu.org` 的既有 DNS 记录，Worker Route 方案依赖它。
- 完整说明与恢复全自动部署的方法见 `docs/PROJECT_MANAGEMENT_MODEL.md` 的「发布与部署流程」与 `docs/DEPLOYMENT.md`。
