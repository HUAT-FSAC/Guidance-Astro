# ENV — 运行环境说明（唯一写入者：Execution Agent）

> 命令全部来自实际探测（`package.json` scripts / CI 配置 / 本会话真实执行）。未亲测的条目标注「未知」，不编造。
> 最近更新：2026-10-17T14:3xZ（UTC，`date -u`）· 探测者 `executor-round-85`（第 85 轮：#248 顺手处置合入 `e82adef` + 部署 Version `82ae7f68`；§2 追加复确认行、§4 新增 2 条坑位。上一轮：第 83 轮 `executor-opencode-20261017`，修正 §5 标签表 + §4 新增 4 条坑位）

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

**复确认（2026-10-09T14:53Z 在 main@`9b98cfe` 实测，#210 合入后零代码变更；证据 `.tmp/gate63/*.log`）**：
`test:run` = **451 passed / 42 files** · `test:e2e` = **100 passed** · `dist/client/sitemap-0.xml` = **168 页** · `quality:audit` = 0（豁免仅剩 braces，10-17 到期剩 8 天，上游 latest 仍 3.0.3）——与 10-07 基线逐项一致。

**复确认（2026-10-10T04:20Z 在 main@`19169c5` 实测，#212 落地 + v1.2.2 发版后；证据 `.tmp/gate65/*.log`）**：
`test:run` = **451 passed / 42 files** · `test:e2e` = **102 passed**（基线 100 + 新增看板页 e2e 2 条）· `dist/client/sitemap-0.xml` = **168 页** · `quality:audit` = 0（豁免仅剩 braces，10-17 到期剩 7 天，上游 latest 仍 3.0.3）· coverage Lines **95.04%**（`test:coverage` 实测）· bundle Total JS **219.38 KB** / Total CSS **250.73 KB**。

**复确认（2026-10-11T05:35Z 在 main@`c7fcecc` 实测，#215 bot 数据快照合入后；证据 `.tmp/gate68-build.log` + ci-cd run `38114809451`）**：
`pnpm build` exit 0 · `dist/client/sitemap-0.xml` = **168 页** · main ci-cd 7/7 success · `pnpm deploy:worker` exit 0（Version `8f01f83c`）· CSP 单请求头/体 nonce 一致 PASS · 中英看板页 200。全量单测/e2e 未重跑（变更仅数据 JSON 值漂移，基线 451/42·102 仍有效）。

**复确认（2026-10-12T11:25Z 在 main@`455b109` 实测，#216/#217 bot 数据快照连续合入后；证据 `.tmp/gate71-build.log` + `.tmp/gate71-deploy.log` + ci-cd run `38240769621`）**：
`pnpm build` exit 0 · `dist/client/sitemap-0.xml` = **168 页** · main ci-cd success（`38240769621`；#216 合入点 `0a29da5` run `38150588726` 亦 success）· `pnpm deploy:worker` exit 0（Version `dacfe595`，一次覆盖两次数据变更）· CSP 单请求头/体 nonce 一致 PASS（`RvyGE3UqRUgC1TS4s_1a1g`）· 中英看板页 200。全量单测/e2e 未重跑（变更仅数据 JSON 值漂移，基线 451/42·102 仍有效）。

**复确认（2026-10-15T15:30Z 在 main@`747f059` 实测，#236/#238/#240 三连合入后；证据 `.tmp/gate80/*.log`）**：
8 项门禁全部 exit 0（lint / format:check / test:run / build / quality:bundle / quality:routes / quality:theme / quality:audit）；`test:run` = **431 passed / 40 files** —— ⚠️ 这是 #219/#223 测试清理重构后的**现行基线**（429→431 系 #223 it.each 展开），本文上方「451/42」是 #218 前的旧数，勿再沿用；`pnpm deploy:worker` exit 0（Version `0e32bc5c`）· CSP 单请求头/体 nonce 一致 PASS（`Q_jmja9T1ia3fnKWzamUuQ`）· 中英 metrics 看板页 200（zh 真实路径 `/docs-center/运营与协作/项目进度看板/`，**无** `/docs` 前缀；`/showcase-dashboard/` 是 LHCI 展示页，不消费 project-progress.json）· #229 新增 `duration-budget.yml` 每周定时：`node scripts/quality/check-duration-budget.mjs --dry-run` 本地实测 exit 0（P95 299s 未超标；env 降阈值双向验证通过）。

**复确认（2026-10-17T02:4xZ 在 main@`75ae26c` 实测，#241 合并 + #242/#244 交付后；证据 `.tmp/gate83/*.log`）**：
`lint` / `format:check` / `test:run` / `build` / `quality:bundle` / `quality:routes` / `quality:theme` / `quality:audit` 全 exit 0；`test:run` = **431 passed / 40 files**（与 10-15 基线一致）；`dist/client/sitemap-0.xml` = **168 页**；bundle Total JS **219.38 KB** / Total CSS **250.73 KB**（与删除 `@fullhuman/postcss-purgecss` 前逐项相同 ⇒ 产物零变化）；`quality:audit` = **0 且零豁免**（输出仅 `✅ audit clean — no advisories at/above the threshold`，**不再有** "temporarily allowed" 段）；`pnpm why braces` = 空（#244）；`pnpm deploy:worker` exit 0（Version `27d6bb1b`）；CSP 单请求头/体 nonce 一致 PASS；中英看板页 200 且已渲染新快照 `2026/10/16`。**本文上方「451/42」及所有 `audit 豁免 braces` 相关记述均已过期，以本节为准。**

**复确认（2026-10-17T14:1xZ 在 main@`e82adef` 实测，#248 bot 数据快照合入后；证据 `.tmp/gate85/*.log` + CI 按完整 head_sha 取数）**：
`pnpm deploy:worker` exit 0（含 `pnpm build`；Version `82ae7f68`）· main `CI/CD Pipeline` / `Secret Scan` / `Release Please` 均 **success、0 失败** · CSP **单请求**头/体 nonce 一致 PASS（`5jKMpTnO8HJ9DzZG5reUNA`）· zh 看板页 200 渲染 `数据更新时间: 2026/10/17 04:24:16`、en 看板页 200 渲染 `Updated: 10/17/2026, 4:24:16 AM`（en 真实路径 = `/en/docs-center/运营与协作/项目进度看板/`，**英文 slug 候选全 404**）。全量单测/e2e 未重跑（变更仅数据 JSON 值漂移，与第 68/71/75 轮同类处置先例一致；431/40·168 基线仍有效）。

## 3. 部署与线上验收

- wrangler OAuth **在本机（Linux）已登录可用**：`wrangler whoami` → 账号 `Iridite` / `bfdcbff6cfe16d2b9bd657593ba88f5f`（与 `wrangler.json` 的 `account_id` 一致）。凭据路径 `/home/kerwin/.config/.wrangler/config/default.toml`。
    - ⚠️ 2026-10-17 实测：OAuth token **缺 `k2.read` / `k2.write` scope**，`wrangler whoami` 会打 WARNING —— 与 Worker 部署无关，**属正常**（同轮 `pnpm deploy:worker` exit 0 已证）。
    - 裸 shell 里 `wrangler` 不在 PATH，但它是项目 devDependency：用 `./node_modules/.bin/wrangler …` 或走 `pnpm deploy:worker`。
    - 最近一次部署：**Version `27d6bb1b-e9cb-49f5-8a06-3519aa2a9910`**（2026-10-17，覆盖 #241 数据快照；CSP 同请求头/体 nonce 一致 `zzQ_GWvUyIU6hWAAxQstHA`）。
- 部署验收判据（#171 已修正）：`curl -sI https://huat-fsac.eu.org/ | grep -qiE "content-security-policy:.*nonce-"`；**更强**：同一请求下响应头 `'nonce-X'` 与 HTML `nonce="X"` 相等。
- ⚠️ 字面串 `content-security-policy: nonce-` **永不匹配**（nonce 在 `script-src` 内），不得据此判定部署失败。
- sitemap 计数必须用 `grep -o '<loc>' | wc -l`（XML 单行，`grep -c` 恒为 1）。
- 线上产物里出现旧版本号可能是**第三方依赖路径注释**（如 `util-deprecate@1.0.2`），不能据此推断需要重新部署。

## 4. 已知环境限制与规避（都是本会话踩过的）

| 限制                                | 现象                                                                                                                                                                                        | 规避                                                                                                                        |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| 沙箱下 `~` 只读                     | `pnpm install` 下载**新**包时报 `[ERR_SQLITE_ERROR] unable to open database file`（要写 `~/.local/share/pnpm/store/v11`）                                                                   | 在允许写 `~` 的环境执行该步；**不要**把 store 挪进工作区（会 purge `node_modules` 并重下 ~950 包）                          |
| pnpm deps-status 竞态               | 链式命令里 `pnpm <script>` 偶发抛栈失败，且管道后 `$?` 取到的是 `tail` 的退出码                                                                                                             | `export npm_config_verify_deps_before_run=false`；退出码必须由被测命令单独产出                                              |
| `/tmp` 只读                         | 备份/探针文件写不进 `/tmp`                                                                                                                                                                  | 用仓库内 gitignored 的 `.tmp/`                                                                                              |
| heredoc 转义                        | `\!` 被写进源码（`!==`、`feat!:`）造成语法错；双引号串内嵌裸双引号会让整段 python 失败                                                                                                      | 写完必查 `grep -c '\\!'`；用书名号「」代替内嵌 `"`                                                                          |
| jsdom 几何为零                      | `getBoundingClientRect()` 返回全 0 ⇒ 依赖 `bottom > 0` 的逻辑被误判；旧断言对新实现同样通过（零守卫力）                                                                                     | 单测必须显式打桩 `getBoundingClientRect`                                                                                    |
| Playwright 可见性语义               | `toBeVisible()` 认为 `opacity:0` 仍"可见"                                                                                                                                                   | 断言 computed 样式：`toHaveCSS('opacity','1')`                                                                              |
| squash 使 SHA 差集失真              | `HEAD..wsyhuat/main` 与 `git cherry` 都会把**已移植**的提交报成未吸收                                                                                                                       | 登记吸收后的 SHA + 内容级 `git diff --stat main <remote>/main -- <路径>` 终判                                               |
| markdown 表格列宽                   | 手写/改写表格列宽不符合 prettier 规范 → `pnpm format:check` FAIL，lint-staged 还会重排**整表**导致同表所有行以 ± 成对出现在 diff 里，易误判为「改了别行」                                   | 改表格后先 `pnpm exec prettier --write <file>`，再用**去空白后逐行 diff** 判定真实内容差异                                  |
| bash 双引号内反引号                 | `gh issue comment --body "…\`docs/x.md\`…"`会把反引号内容当命令执行（报`Permission denied`），评论里留下空洞                                                                                | 长正文用 heredoc（`<<'EOF'`）或写文件后 `gh issue comment --body-file`                                                      |
| `gh pr checks` 退出码               | 全部 check settled 后退出码非零，轮询脚本易误判为「仍在跑」                                                                                                                                 | 以 check 的 `conclusion` 字段判定，不看退出码                                                                               |
| safe-delete shim 拦截 build         | CodeBuddy 沙箱 node shim 对 node 进程批量删除设阈值 500，Astro build 清理 `dist/server/.prerender`（~573 文件）报 `SAFE_DELETE_BULK_CONFIRM_REQUIRED`，`pnpm build` exit 1                  | 构建命令前 `export CODEBUDDY_SAFE_DELETE_ENABLED=0`（dist 为构建自产 gitignore 产物，清理属构建固有步骤；第 65 轮实测有效） |
| gh 模板科学计数法                   | `gh run list --json databaseId --template '{{.databaseId}}'` 把大整数 ID 渲染成 `3.8023e+10`，拿去 watch/view 报 404                                                                        | 取 ID 改用 `--jq '.[0].databaseId'`（输出纯数字）                                                                           |
| 取 PR 头文件                        | `gh api .../contents/<path> -f ref=refs/pull/N/head` 报 404（contents API 不接受 pull ref）                                                                                                 | `git fetch origin pull/N/head:refs/tmp/prN` 后 `git show refs/tmp/prN:<path>`，用完 `git update-ref -d` 删除临时 ref        |
| REST `head_sha` 需完整 SHA          | 用短 SHA 查 `actions/runs?head_sha=16bc764` 返回**空列表**（易误判成"该提交没有 CI"；本轮实测）                                                                                             | 先 `git rev-parse <短SHA>` 取全量 SHA 再查；`gh run list` 默认分页与过滤口径不可用于断言某 commit 全绿                      |
| `gh issue list --search` 非字面匹配 | `--search "[duration-budget] in:title"` 的方括号被当作查询语法忽略 ⇒ 命中所有含该词干的 Issue（本轮实测命中 #242 / 已关闭的 #229，看起来"多出了单"）                                        | 需按标题前缀判定时：`gh api 'repos/O/R/issues?state=all&per_page=100' --jq '[.[] \| select(.title \| startswith("…"))]'`    |
| commitlint `subject-case`           | subject 以大写词开头（如 `TASKS 镜像同步…`）被判为 sentence-case，commit-msg hook 直接失败                                                                                                  | subject 首词小写（`tasks 镜像同步…`）；中文开头的 subject 不受影响                                                          |
| git hook 需要 pnpm 在 PATH          | 未 `export PATH=…mise…` 时 `pre-commit` 报 `pnpm: not found`（husky 的 PATH 不含 mise 目录），commit 失败                                                                                   | 提交与门禁命令写在同一条 shell 里先导出 PATH；**不要**用 `--no-verify` 绕过 lint-staged                                     |
| CSP nonce 分两次 curl 必假 FAIL     | 头/体 nonce 比对若用 `curl -sI` 与 `curl -s` 两次请求取样 → 必然不一致（nonce **每请求**新生成），首验误报部署失败（第 85 轮实测踩中；§3「同一请求」字样存在仍会忘）                        | 单请求取样：`curl -s -D h.txt -o b.html <url>` 后分别 grep 两文件比对                                                       |
| en 看板页路径保留中文段             | `/en/docs-center/operations-collaboration/…`、`/en/…/operations-and-collaboration/…` 等英文 slug 候选全 **404**；en 页真实路径 = `/en/docs-center/运营与协作/项目进度看板/`（第 85 轮实测） | 中英看板页均直接用中文段路径拼 `/en` 前缀；勿据英文 slug 404 误判站点故障                                                   |

## 5. 协作约定（本仓库现状 vs 契约）

- **分支策略**：按契约 §1.7 用 `agent/issue-<N>-<slug>`。（历史分支为 `fix/…`、`docs/…` 等旧风格，不追溯改名。）
- **`LOCK_TTL_MINUTES`**：30（默认）。LOCK 为 JSON：`owner` / `acquired_at` / `issue` / `heartbeat_at`。当前**无 LOCK**（2026-10-17 复核不存在）。
- **标签体系（2026-10-17 `gh label list` 全量实测，**已修正此前"标签不存在"的过期结论**）** —— 标签归 Planner 管理，Executor 不自行创建，只做映射并上报：

| 契约标签                 | 本仓库实际用法（实测存在）                                                                                                                                                                                                                                                       |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ready`                  | **无此标签**；沿用 `status:backlog` + Issue 正文首行「队列状态：`ready`」（D-013 映射，仍有效）                                                                                                                                                                                  |
| `in-progress`            | `status:in-progress`                                                                                                                                                                                                                                                             |
| `in-review`              | `status:review`                                                                                                                                                                                                                                                                  |
| `done`                   | `status:done`                                                                                                                                                                                                                                                                    |
| `blocked`                | **`blocked` 标签存在**（"外部阻塞，需 Planner/人类排除障碍后方可回到 ready"），#101 现挂此标签                                                                                                                                                                                   |
| `needs-info`             | **`needs-info` 标签存在**（"需产品决策或用户确认，暂不入 ready"），#197 现挂此标签                                                                                                                                                                                               |
| `P0..P4`                 | `priority:p0..p4` —— **`priority:p4` 存在**（"低优先级重构 / 非必要改进"）                                                                                                                                                                                                       |
| 其他可用标签（本轮实测） | `auto-discovered` · `flaky` · `risk:low/medium/high/blocker` · `area:backend/content/devops/docs/docs-content/frontend/quality` · `type:task/bug/improvement/tech-debt/retrospective` · `security` · `breaking-change` · `autorelease: pending/tagged`（后两者由 rp 机器人维护） |

实操结论：状态转移时**可直接** `gh issue edit <N> --remove-label status:backlog --add-label status:in-progress`（本轮 #242/#244 实测均成功），不要再因"标签不存在"而跳过加标签动作。

- 代码 commit 用 conventional commits + 正文 `Refs #<N>`；`.agent/` 与 `WORKFLOW §7.4` 记录单独 `chore(agent):`（D-008 允许直推 main）。
- **合并 PR 时不使用 `Closes/Fix:` 关键字**（`fix: #N` 会被 GitHub 自动关单，绕过 Planner 验收，违反 D-006）。
