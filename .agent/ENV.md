# ENV — 运行环境说明（唯一写入者：Execution Agent）

> 命令全部来自实际探测（`package.json` scripts / CI 配置 / 本会话真实执行）。未亲测的条目标注「未知」，不编造。
> 最近更新：2026-10-09T14:32Z（UTC，`date -u`）· 探测者 `executor-20261009T134841Z`（本轮仅刷新头部戳 + §2 基线溯源标注 + §4 补两条实测限制；其余命令未重测，语义不变）

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

**基线（2026-10-07T07:3xZ 在 main@`f195c8e` 实测，#206 集成单合并 #205/#201/#203/#204 后回填；用于判断"是否真的跑了用例"）**：
`test:run` = **451 passed / 42 files**（构成：合并前 main 436/40 + #203 面包屑单测 + #204 ui-copy 单测）；`test:e2e` = **100 passed**（合并前 97 + #203 +2 + #204 +2，去重后 3）；`dist/client/sitemap-0.xml` = **168 页**；`quality:audit` = 0（豁免仅剩 braces，10-17 到期）。
（历史基线：2026-10-03 为 436/40 · 97 · 168。⚠️ 基线数字必须来自当轮真实运行，不能沿用记忆 —— 2026-10-03 轮曾把 429/39 误沿为基线。）

## 3. 部署与线上验收

- wrangler OAuth **在本机（Linux）已登录可用**：`wrangler whoami` → 账号 `Iridite` / `bfdcbff6cfe16d2b9bd657593ba88f5f`（与 `wrangler.json` 的 `account_id` 一致）。凭据路径 `/home/kerwin/.config/.wrangler/config/default.toml`。
- 部署验收判据（#171 已修正）：`curl -sI https://huat-fsac.eu.org/ | grep -qiE "content-security-policy:.*nonce-"`；**更强**：同一请求下响应头 `'nonce-X'` 与 HTML `nonce="X"` 相等。
- ⚠️ 字面串 `content-security-policy: nonce-` **永不匹配**（nonce 在 `script-src` 内），不得据此判定部署失败。
- sitemap 计数必须用 `grep -o '<loc>' | wc -l`（XML 单行，`grep -c` 恒为 1）。
- 线上产物里出现旧版本号可能是**第三方依赖路径注释**（如 `util-deprecate@1.0.2`），不能据此推断需要重新部署。

## 4. 已知环境限制与规避（都是本会话踩过的）

| 限制                   | 现象                                                                                                                                                      | 规避                                                                                               |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| 沙箱下 `~` 只读        | `pnpm install` 下载**新**包时报 `[ERR_SQLITE_ERROR] unable to open database file`（要写 `~/.local/share/pnpm/store/v11`）                                 | 在允许写 `~` 的环境执行该步；**不要**把 store 挪进工作区（会 purge `node_modules` 并重下 ~950 包） |
| pnpm deps-status 竞态  | 链式命令里 `pnpm <script>` 偶发抛栈失败，且管道后 `$?` 取到的是 `tail` 的退出码                                                                           | `export npm_config_verify_deps_before_run=false`；退出码必须由被测命令单独产出                     |
| `/tmp` 只读            | 备份/探针文件写不进 `/tmp`                                                                                                                                | 用仓库内 gitignored 的 `.tmp/`                                                                     |
| heredoc 转义           | `\!` 被写进源码（`!==`、`feat!:`）造成语法错；双引号串内嵌裸双引号会让整段 python 失败                                                                    | 写完必查 `grep -c '\\!'`；用书名号「」代替内嵌 `"`                                                 |
| jsdom 几何为零         | `getBoundingClientRect()` 返回全 0 ⇒ 依赖 `bottom > 0` 的逻辑被误判；旧断言对新实现同样通过（零守卫力）                                                   | 单测必须显式打桩 `getBoundingClientRect`                                                           |
| Playwright 可见性语义  | `toBeVisible()` 认为 `opacity:0` 仍"可见"                                                                                                                 | 断言 computed 样式：`toHaveCSS('opacity','1')`                                                     |
| squash 使 SHA 差集失真 | `HEAD..wsyhuat/main` 与 `git cherry` 都会把**已移植**的提交报成未吸收                                                                                     | 登记吸收后的 SHA + 内容级 `git diff --stat main <remote>/main -- <路径>` 终判                      |
| markdown 表格列宽      | 手写/改写表格列宽不符合 prettier 规范 → `pnpm format:check` FAIL，lint-staged 还会重排**整表**导致同表所有行以 ± 成对出现在 diff 里，易误判为「改了别行」 | 改表格后先 `pnpm exec prettier --write <file>`，再用**去空白后逐行 diff** 判定真实内容差异         |
| bash 双引号内反引号    | `gh issue comment --body "…\`docs/x.md\`…"`会把反引号内容当命令执行（报`Permission denied`），评论里留下空洞                                              | 长正文用 heredoc（`<<'EOF'`）或写文件后 `gh issue comment --body-file`                             |
| `gh pr checks` 退出码  | 全部 check settled 后退出码非零，轮询脚本易误判为「仍在跑」                                                                                               | 以 check 的 `conclusion` 字段判定，不看退出码                                                      |

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
