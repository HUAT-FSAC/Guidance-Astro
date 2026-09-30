# 交接说明（HANDOFF）

**本棒 Agent：** `mimo-flash-20260930T113551Z`
**时间：** 2026-09-30T11:35Z 起（UTC），第 1 轮完成（进行中）
**仓库 / 分支：** `HUAT-FSAC/Guidance-Astro` ｜ 基线 `main@46f53f4` ｜ 工作分支 `auto/mimo-flash-20260930T113551Z/121-audit-override-bump`（PR #122）

> 下一棒请先按 `docs/WORKFLOW.md:§1/§3` 与 `AGENTS.md` 的「发布与部署」执行：
> `git fetch --all --prune` → `git pull --rebase` → 读 `.agent/STATE.md` + 本文件 → 检查 `.agent/LOCK` → 选任务。

---

## 一、本棒第 1 轮做了什么

**任务：#121 `pnpm audit` 5 漏洞（主动发现，门禁首关即失败）**

| 项   | 内容                                                                                                                                                                                                                                                                                                                                                           |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 发现 | `pnpm audit --audit-level=moderate` 报 5 漏洞（3 moderate \| 2 high）：`brace-expansion` 3 条新公告（`>=4.0.0 <5.0.12`，含 2 high，71 条传递路径，主链 `eslint>minimatch`）、`fast-uri` 2 条（`>=4.0.0 <4.1.5`，主链 `ajv>@astrojs/check`/`@commitlint`）。CI `Audit Dependencies` 跑同款命令 → main 下次 push 即红（最后成功 run 482 @ `46f53f4` 在公告之前） |
| 建单 | Issue **#121**（P1，`auto-discovered` 等标签），assignee @me，认领评论已发                                                                                                                                                                                                                                                                                     |
| 修复 | `pnpm-workspace.yaml`：`brace-expansion: 5.0.9 → 5.0.12`、`"fast-uri@<4.1.3": ">=4.1.3" → "fast-uri@<4.1.5": ">=4.1.5"`；`pnpm install` 重解析 lockfile（2 包：brace-expansion 5.0.12、fast-uri 4.2.1）                                                                                                                                                        |
| 验证 | audit → No known vulnerabilities found；lint ✅ format:check ✅ tsc ✅ test:run **412 passed** ✅ build ✅ quality:bundle ✅ quality:theme ✅                                                                                                                                                                                                                  |
| 提交 | `1b3851b fix: #121 提升 brace-expansion/fast-uri override 下限修复 pnpm audit 5 漏洞`（分支，非 main）                                                                                                                                                                                                                                                         |
| PR   | **#122**（Closes #121），CI run 36711338379 **success 7/7**，`Audit Dependencies: success`                                                                                                                                                                                                                                                                     |
| 部署 | 无需（仅 dev 工具链 override，不进运行时产物）                                                                                                                                                                                                                                                                                                                 |

## 二、交棒时状态

- **⚠️ `main` 顶端 `46f53f4` 的 Audit 门禁已失效**：任何人下次 push main，`Audit Dependencies` 会红。**在 PR #122 合并前，不要直推 `main`（包括 `.agent/**`、`docs/**` 记录文件）**——一律走分支，或等 #122 合并。
- PR #122 **待人类 review+merge**（协议禁止自动 merge）。合并后 main 恢复常绿，`chore: #121` 之类不会被 auto-close 语义影响——注意：PR 标题/body 含 `Closes #121`，合并时 GitHub 会自动关 #121，无需手动关（若想留痕，可在合并前补评论）。
- 开放 issue：**#101**（P1，阻塞人类 Secret）、**#120**（P3 question，等人类）、**#121**（本棒，待 #122 合并）。
- 开放 PR：**#122**（本棒）；#97 metrics、#96 release-please、#106~#114 dependabot 全是自动 PR，**不碰不 merge**。
- 工作区干净（无 LOCK 遗留；`.agent/LOCK` 运行时锁不入库）。

## 三、下一棒要做（按优先级）

1. `gh pr view 122 --json state,mergedAt`：若已合并 → 确认 main CI Audit 绿 → 关 #121（或已被 Closes 自动关）→ 恢复正常直推/分支流程。
2. 若未合并 → 遵守上文警告，不 push main；例行评估后若无可安全推进事项，按 §九.1 停止（属正常）。
3. #101/#120 维持跳过（分别阻塞人类 Secret / 人类决策）。
4. 若出现新的 `pnpm audit` 公告（该文件是高频复发点）：同 #115/#121 套路——`pnpm why <pkg>` → 提 override 下限 → `pnpm install` → 复验 audit+门禁 → 分支+PR。

## 四、阻塞项（需人类操作）

- **#101**：GitHub `Settings → Secrets and variables → Actions` 配 `CLOUDFLARE_API_TOKEN`（`CLOUDFLARE_ACCOUNT_ID` 不需要）。Secret 没配前不要把 deploy job 加回 CI。
- **#120**：toast.ts 删留二选一。
- **#122**：review + merge（合并前 main 禁直推，见二）。
- 线上部署仍走本机 `wrangler` OAuth（`pnpm deploy:worker`）；登录态只在当前机器 profile，换机需重跑 `wrangler login`（strip 本地 proxy）。

## 五、注意事项 / 坑（沿用上一棒并新增 ⚠️）

1. **分支保护与直推**：`main` 受保护但当前 token 有 **bypass** 权限——**但本轮起被 #121 暂时冻结**（Audit 会红），直到 #122 合并。权限/状态不同则一律 `auto/<agent-id>/<issue>-<简述>` 分支 + PR（不自动 merge）。
2. **双远程**：`origin` = `HUAT-FSAC/Guidance-Astro`（权威）；`wsyhuat` = fork 独立代码线，**不要**当上游。
3. **部署判据**：影响线上产物的改动（`src/**`、`astro.config.mjs`、`public/**`、依赖）push main 后自动 `pnpm deploy:worker` + CSP nonce 验收；纯 `.agent/**` / docs 改动不必部署。本棒 #121 属工具链 override，也不必部署。
4. **环境：`pnpm` 不在裸 PATH**——本机用 **mise**（`mise.toml` 固定 node 22 / pnpm 11）。shell 里跑门禁用 `mise exec -- pnpm ...`；**git hook（husky/lint-staged）需要 `pnpm` 在 PATH**，提交前 `export PATH="$HOME/.local/share/mise/installs/pnpm/11:$HOME/.local/share/mise/installs/node/22/bin:$PATH"`，否则 pre-commit 报 `pnpm: not found`（本棒踩过）。
5. **`fix: #N` commit subject 自动关 issue**（合并/直推到 main 时）；不想自动关用 `feat:`/`chore:` 前缀。本棒 PR body 用了 `Closes #121`（合并即关，符合预期）。
6. **`gh run list` 可能浮出被 re-run 的历史 run**：判断主干健康用 `git log --oneline -1` 的 HEAD sha 对照最新 run 的 `headSha`，别只看列表前几行。
7. **依赖 override 时效性（高频复发）**：安全公告拓宽区间时旧下限漏网 → Audit 红。第一反应：`pnpm why <pkg>` → 提 override 下限 → `pnpm install` → `pnpm audit` 复验。#115（undici）、#121（brace-expansion/fast-uri）均此类。
8. **内容页 URL 逐段 slug**：`src/content/docs/**` 的 URL 经 `github-slugger` 逐段处理，`src/pages/**` 不 slug；推 URL 走 `src/integrations/sitemap-paths.ts`。链接扫描跳过 `@assets/` 开头目标（构建期处理，非断链）。
9. **行尾**：部分 `.mdx` 磁盘 CRLF，编辑用单行替换最稳；`.md`/`.mjs`/`.ts` 会过 husky lint-staged prettier（含 `.agent/*.md`），Edit 前若报 "modified since read" 先重读。
10. **`.gitignore` 已修复（#118）**：`src/content/docs/en/archive/` 不被忽略；add 被拒先查 ignore 规则。
11. **剩余 2 条 `astro check` hint**（`BilibiliVideo.astro` scrolling、`share.ts` execCommand）价值低、需浏览器实测，勿动。

## 六、关键命令速查

```bash
# 同步与状态
git fetch --all --prune && git pull --rebase
cat .agent/STATE.md .agent/HANDOFF.md

# 本机门禁（mise 环境，见坑 4）
mise exec -- pnpm audit --audit-level=moderate
mise exec -- pnpm lint && mise exec -- pnpm format:check
mise exec -- pnpm exec tsc --noEmit && mise exec -- pnpm test:run
mise exec -- pnpm build
mise exec -- pnpm quality:bundle && mise exec -- pnpm quality:theme

# 提交（husky 需 pnpm 在 PATH，见坑 4）
export PATH="$HOME/.local/share/mise/installs/pnpm/11:$HOME/.local/share/mise/installs/node/22/bin:$PATH"

# CI 与 PR
gh pr view 122 --json state,mergedAt
gh run list --workflow=ci-cd.yml --branch main --limit 5 --json headSha,status,conclusion

# 部署与线上验收（仅产物变化时）
mise exec -- pnpm deploy:worker
curl -sI https://huat-fsac.eu.org/ | grep -iE '^(HTTP|content-security-policy)'
curl -s https://huat-fsac.eu.org/robots.txt
```

## 七、与看板 / 前一棒的一致性

- `docs/WORKFLOW.md:§4` T-001..T-038 全部已完成；本棒工作走 issue 线（#121→PR #122），`§7.4` 已追加日志行。
- 上一棒 `glm-5.3-flash-20260929T234352Z`（8 轮，#117/#118/#119 闭环、#120 建单、§九.1 停止）的结论与坑位全部沿用，本棒新增坑 4（mise/pnpm PATH）。
