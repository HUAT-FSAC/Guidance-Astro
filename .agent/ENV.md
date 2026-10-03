# ENV — 运行环境说明（唯一写入者：Execution Agent）

> 命令全部来自实际探测（`package.json` scripts / CI 配置 / 本会话真实执行）。未亲测的条目标注「未知」，不编造。
> 最近更新：2026-10-03T09:50Z（UTC，`date -u`）· 探测者 `executor-exec-20261003T0950Z`

## 1. 工具链（实测）

| 项                 | 值                                                                                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 仓库 / 主干        | `HUAT-FSAC/Guidance-Astro` · `main`                                                                                                                     |
| Node               | v22.23.2（`.nvmrc` = 22，`engines` ≥22.0.0）                                                                                                            |
| pnpm               | 11.22.0（`packageManager` 字段锁定；**禁用 npm/yarn**）                                                                                                 |
| pnpm 是否在裸 PATH | **否**。同命令内 `export PATH="$HOME/.local/share/mise/installs/pnpm/11:$HOME/.local/share/mise/installs/node/22/bin:$PATH"` 或用 `mise exec -- pnpm …` |
| 其他远端           | `wsyhuat` = 协作方 fork（**每轮必须 inbound 巡检**，见 `WORKFLOW §1.6`）                                                                                |
| gh 可用性与 scope  | 账号 `zhangjszs`；scopes = `repo` `workflow` `read:org` `gist` ⇒ **无 `read:project`**，GitHub Projects 不可验证                                        |

## 2. 门禁命令（与 CI 同款，逐项需取真实退出码）

```bash
pnpm install                 # 依赖同步（--frozen-lockfile 用于验证 lock 一致）
pnpm lint                    # eslint src tests
pnpm format:check            # prettier --check（含 .agent/*.md 与根 *.md）
pnpm exec tsc --noEmit       # typecheck（只覆盖 src/**，tests/** 不在内 —— 已知边界）
pnpm test:run                # Vitest
pnpm test:e2e                # Playwright（webServer = pnpm preview:ssr，需先 pnpm build）
pnpm build                   # Astro → dist/server/entry.mjs（SSR）
pnpm quality:bundle          # 包体积预算
pnpm quality:theme           # 主题对比度
pnpm quality:routes          # 路由预算
pnpm quality:audit           # 依赖审计门禁（#173：moderate + .config/audit-allowlist.json 带到期日豁免）
node scripts/quality/supply-chain-watch.mjs   # 只读探针（#180），永不阻塞
pnpm deploy:worker           # 本机部署（= pnpm build && wrangler deploy --config dist/server/wrangler.json）
```

**基线（2026-10-03T09:55Z 在 `agent/issue-182-…` 分支实测，用于判断"是否真的跑了用例"）**：
`test:run` = **436 passed / 40 files**（构成：原 412/38 + #173 audit-gate 13 + #168 scroll-reveal 4 + #180 supply-chain-watch 7）；`test:e2e` = **97 passed**；`dist/client/sitemap-0.xml` = **168 页**；`dependabot` 开放 PR（2026-10-03 第 49 轮后）= 2 个 majors（#186/#188）—— minor-and-patch 组 #187 已按 D-014=A 批次处置（`4bec1e9`）关闭。
⚠️ 本文件早期版本把基线写成 429/39（漏算 #180 的 7 条），已于 #182 同轮以实测修正 —— 记此教训：**基线数字也必须来自当轮真实运行，不能沿用记忆。**

## 3. 部署与线上验收

- wrangler OAuth **在本机（Linux）已登录可用**：`wrangler whoami` → 账号 `Iridite` / `bfdcbff6cfe16d2b9bd657593ba88f5f`（与 `wrangler.json` 的 `account_id` 一致）。凭据路径 `/home/kerwin/.config/.wrangler/config/default.toml`。
- 部署验收判据（#171 已修正）：`curl -sI https://huat-fsac.eu.org/ | grep -qiE "content-security-policy:.*nonce-"`；**更强**：同一请求下响应头 `'nonce-X'` 与 HTML `nonce="X"` 相等。
- ⚠️ 字面串 `content-security-policy: nonce-` **永不匹配**（nonce 在 `script-src` 内），不得据此判定部署失败。
- sitemap 计数必须用 `grep -o '<loc>' | wc -l`（XML 单行，`grep -c` 恒为 1）。
- 线上产物里出现旧版本号可能是**第三方依赖路径注释**（如 `util-deprecate@1.0.2`），不能据此推断需要重新部署。

## 4. 已知环境限制与规避（都是本会话踩过的）

| 限制                   | 现象                                                                                                                      | 规避                                                                                               |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| 沙箱下 `~` 只读        | `pnpm install` 下载**新**包时报 `[ERR_SQLITE_ERROR] unable to open database file`（要写 `~/.local/share/pnpm/store/v11`） | 在允许写 `~` 的环境执行该步；**不要**把 store 挪进工作区（会 purge `node_modules` 并重下 ~950 包） |
| pnpm deps-status 竞态  | 链式命令里 `pnpm <script>` 偶发抛栈失败，且管道后 `$?` 取到的是 `tail` 的退出码                                           | `export npm_config_verify_deps_before_run=false`；退出码必须由被测命令单独产出                     |
| `/tmp` 只读            | 备份/探针文件写不进 `/tmp`                                                                                                | 用仓库内 gitignored 的 `.tmp/`                                                                     |
| heredoc 转义           | `\!` 被写进源码（`!==`、`feat!:`）造成语法错；双引号串内嵌裸双引号会让整段 python 失败                                    | 写完必查 `grep -c '\\!'`；用书名号「」代替内嵌 `"`                                                 |
| jsdom 几何为零         | `getBoundingClientRect()` 返回全 0 ⇒ 依赖 `bottom > 0` 的逻辑被误判；旧断言对新实现同样通过（零守卫力）                   | 单测必须显式打桩 `getBoundingClientRect`                                                           |
| Playwright 可见性语义  | `toBeVisible()` 认为 `opacity:0` 仍"可见"                                                                                 | 断言 computed 样式：`toHaveCSS('opacity','1')`                                                     |
| squash 使 SHA 差集失真 | `HEAD..wsyhuat/main` 与 `git cherry` 都会把**已移植**的提交报成未吸收                                                     | 登记吸收后的 SHA + 内容级 `git diff --stat main <remote>/main -- <路径>` 终判                      |

## 5. 协作约定（本仓库现状 vs 契约）

- **分支策略**：按契约 §1.7 用 `agent/issue-<N>-<slug>`。（历史分支为 `fix/…`、`docs/…` 等旧风格，不追溯改名。）
- **`LOCK_TTL_MINUTES`**：30（默认）。LOCK 为 JSON：`owner` / `acquired_at` / `issue` / `heartbeat_at`。
- **标签体系落差（契约 1.3 vs 仓库实际）** —— 标签归 Planner 管理，Executor 不自行创建，只做映射并上报：

| 契约标签                 | 本仓库实际用法                                                                        |
| ------------------------ | ------------------------------------------------------------------------------------- |
| `ready`                  | **无此标签**；沿用 `status:backlog` + Issue 正文首行「队列状态：`ready`」             |
| `in-progress`            | `status:in-progress`                                                                  |
| `in-review`              | `status:review`                                                                       |
| `blocked` / `needs-info` | **标签不存在** ⇒ 暂时只能用 Issue comment + STATE/HANDOFF 表达，并请求 Planner 建标签 |
| `P0..P4`                 | `priority:p0..p3`（**无 `priority:p4`**）                                             |

- 代码 commit 用 conventional commits + 正文 `Refs #<N>`；`.agent/` 与 `WORKFLOW §7.4` 记录单独 `chore(agent):`（D-008 允许直推 main）。
- **合并 PR 时不使用 `Closes/Fix:` 关键字**（`fix: #N` 会被 GitHub 自动关单，绕过 Planner 验收，违反 D-006）。
