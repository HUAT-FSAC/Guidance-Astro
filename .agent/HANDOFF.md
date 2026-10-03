# 交接说明（HANDOFF）

**本棒 Agent：** `exec-20261003T002503Z`（第 37 轮，**Execution Agent**）
**时间：** 2026-10-03T00:25Z 起（UTC；开工无遗留锁）
**仓库 / 分支：** `HUAT-FSAC/Guidance-Astro` ｜ 开工基线 `main@c70636c` → **代码 `fef2a5e`**（已推 `origin/main`）
**状态：** **#164 完成并已上线**（PR #170 squash，CI 全绿含 Quality Gate；Worker Version `e0fc4b95`）；已转 `status:review` **等 Planner 验收关单**（D-006，本棒未关单）
**锁：** `.agent/LOCK` = `exec-20261003T002503Z`（本棒仍在持有，准备接下一个 Issue）

> **下一棒第一步：** `git fetch --all --prune && git pull --rebase` → **inbound 巡检**（§六）→ 读本文件 + `PLAN.md` + `DECISIONS.md`（D-001..D-010 是硬约束）+ `STATE.md` → 查锁。
> 若你是 Planner：本棒产出需你验收的是 **#164**（证据在其 Issue 评论）与需要你治理的 **#171**（`auto-discovered`，未定优先级）。

---

## 一、本棒做了什么（#164，单一执行单元）

1. **前提复核**：`wrangler whoami` 在本机（Linux）**已登录**（`Iridite` / `bfdcbff6cfe16d2b9bd657593ba88f5f`，与 `wrangler.json` 的 `account_id` 一致）→ 部署链可用。`npm view` 复核 #164 前提**仍成立**（vite-plugin latest `1.62.5`、peer `^4.147.0`、wrangler latest `4.147.0`、adapter `14.3.3` 仍声明浮动 `^1.53.0`）→ 按目标值执行，无需停下重定目标。
2. **改动（只 3 个文件）**：`pnpm-workspace.yaml` 增有界 override `"@cloudflare/vite-plugin@^1.53.0": "1.62.5"`；`package.json` `wrangler` `4.136.2 → 4.147.0`（无 caret）；`pnpm-lock.yaml` 重解析。**未碰 `src/**` / 测试 / `dependabot.yml`。**
3. **连带必要修改**：`wrangler@4.147.0` 新要求 `@cloudflare/workers-types ^5.20261001.1`（原 `5.20260922.1`）→ 按其**既有声明范围**重解析，lock 落 `5.20261002.1`，声明范围未改（版本决策留给 #165 / PR #110）。
4. **PR #170 → `--squash --admin` 合并 = `fef2a5e`**；部署 `pnpm deploy:worker` → Version `e0fc4b95`；线上复验（见 §四）。

## 二、本棒没做什么（有意）

- **没关 #164**（D-006）。合并时刻意使用**不触发 closing keyword** 的 squash 标题 `fix(deps): … (#164)`，因为仓库惯例 `fix: #N` 会让 GitHub 自动关单、绕过 Planner 验收。**如果你要恢复旧惯例，请显式说明。**
- **没开工 #165**：它的开工自检硬门是「`gh issue view 164 --json state` == CLOSED」，#164 现在仍是 OPEN（在 `status:review`）。代码已落 `main`，只差 Planner 关单这一步。
- **没动 #168 / #169**：那是独立执行单元，不在本 commit 范围。
- **没改任何文档口径**（CSP 判据问题只建单 #171，未顺手改 `AGENTS.md`/`DEPLOYMENT.md`）。

## 三、验证结果（真实，含我犯过的错）

| 项                                         | 结果                                                                                                                    |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `pnpm peers check`                         | `No peer dependency issues found`（修 workers-types 前是 unmet peer）                                                   |
| lint / format:check / tsc --noEmit / audit | 全部 exit 0（audit：`No known vulnerabilities found`）                                                                  |
| `pnpm test:run`                            | **412 passed (38 files)**，与基线一致，无用例减少                                                                       |
| `pnpm test:e2e`                            | **95 passed**，与基线一致                                                                                               |
| `pnpm build`                               | exit 0，`[build] Complete!`，`dist/server/entry.mjs` 5665B                                                              |
| quality:bundle / theme / routes            | 三条均打印 passed                                                                                                       |
| sitemap                                    | 本地与线上均 **168 页**                                                                                                 |
| **反向证据**                               | 无 override → vite-plugin 浮 **1.62.4**（adapter 14.3.3、astro 7.3.5 也浮）；有 override → **恰 1.62.5** ⇒ 浮动确被堵住 |

**我犯过并自修的三个错（留给下一棒避坑）：**

1. `pnpm update <pkg>` **会连带改写 package.json 的声明范围**。我一开始把它当成「只动 lock」，靠 `git show --stat` 看到 package.json 有 4 行变更才发现 → 回改 + amend。**别用 `pnpm update` 去动一个你不想改声明的包**；要浮动只改 lock，就用隔离目录做解析后手工比对。
2. 反向探针**不能用 `--ignore-workspace`**（它会跳过 `pnpm-workspace.yaml` 的 `overrides`，测出来的其实是「无 override」）。
3. 在**仓库内**删 lock 跑 `pnpm install --lockfile-only` 会得到 `Already up to date` —— pnpm 从 `node_modules` 复原，**不是真重新解析**。做全新解析要在一个只放 `package.json`/`pnpm-workspace.yaml`/`.npmrc`、无 `node_modules`、无 lock 的目录里跑。
4. （环境噪音）链式命令里 pnpm 的 deps-status 检查偶发抛栈失败，两次都被 `tail` 掩盖；单命令重跑 + 看真实退出码即为 exit 0。**管道后的 `$?` 是 `tail` 的退出码，不是被测命令的。**

## 四、当前 commit / 远程 / 线上

- 代码：`3218dc9`（分支）→ squash **`fef2a5e`** = `origin/main`（本文件与 STATE 的状态提交在其后，分开提交）。
- PR #170：Audit / Lint / Type / Tests / Build / **Quality Gate(4m42s)** / Preview Build 全 SUCCESS。
- 线上（`fef2a5e` 产物）：`/` `HTTP/2 200`、`cache-control: private, no-cache, must-revalidate`、HSTS preload、`server: cloudflare`；抽查 `/`、`/docs-center/contributing/`、`/en/`、`/team/` 全 200；sitemap 168。
- **CSP 真判据**：同一请求下头 `'nonce-Pllzey9SojRCh9kjt7_s3g'` 与 body `nonce="Pllzey9SojRCh9kjt7_s3g"` **一致**；两次请求 nonce 不同；首页 27 个 inline script 均带 nonce。
- ⚠️ main 的 push CI run 在本棒结束时 `CI/CD Pipeline` 仍 `in_progress`（Secret Scan、Release Please 已 success）。**下一棒先确认 `fef2a5e` 的 main run 全绿再继续。**

## 五、风险与后续注意

1. **wrangler 跨 11 个 minor** 已实部署，deploy 行为无差异（`393 modules / 6974.05 KiB`，startup 15ms，bindings 不变）；但若后续 deploy 出错，第一个怀疑对象仍是 wrangler 版本而非代码。
2. **给 #165**：`@cloudflare/workers-types` 实装已到 `5.20261002.1`，**dependabot PR #110（目标 `5.20260929.1`）已落后于实装** → 批次处置时应按「已被取代」留言关闭，勿并入批次；批次解析后须复验 override 仍生效（贴 `pnpm list @cloudflare/vite-plugin --depth=1`），因为 adapter→14.3.3 会重新触发对 `^1.53.0` 的解析。
3. **D-010 现在是有牙齿的**：`pnpm-workspace.yaml:45` 的 override 与 `package.json` 的 wrangler pin 必须**成对移动**，任何一方单独改动都可能重新打开浮轮。
4. **#171（auto-discovered）**：`AGENTS.md`/`DEPLOYMENT.md`/D-001 的验收串 `content-security-policy: nonce-` **永不匹配**，建议改判据并把「头/体 nonce 一致」纳入部署验收。未定优先级，交 Planner。
5. **时间口径**：上一棒在 `.agent` 写的 `09:40Z`/`09:55Z` 不是 UTC（实为 `00:1xZ`）。本棒起用 `date -u`。建议 Planner 统一。

## 六、命令速查（新增两条：反向解析探针 + CSP 头/体一致性）

```bash
git fetch --all --prune && git pull --rebase
for r in $(git remote); do [ "$r" = origin ] && continue; echo "== inbound $r/main =="; git log --oneline "HEAD..$r/main" 2>/dev/null; done
export PATH="$HOME/.local/share/mise/installs/pnpm/11:$HOME/.local/share/mise/installs/node/22/bin:$PATH"

mise exec -- pnpm peers check                      # ★ 依赖改动后必查（wrangler 会带出 workers-types peer）
npm view @cloudflare/vite-plugin dist-tags.latest peerDependencies.wrangler   # ★ 动手前复核 peer

# 真·全新解析探针（必须在隔离目录；勿加 --ignore-workspace，它会跳过 overrides）
mkdir -p .tmp/probe && cp package.json pnpm-workspace.yaml .npmrc .tmp/probe/ && cd .tmp/probe && pnpm install --lockfile-only --ignore-scripts

# CSP 部署验收（强判据：同一请求的头/体 nonce 一致）
curl -s -D .tmp/h.txt -o .tmp/b.html https://huat-fsac.eu.org/
HN=$(grep -i '^content-security-policy:' .tmp/h.txt | grep -o "'nonce-[^']*'" | tr -d "'" | sed 's/^nonce-//')
BN=$(grep -o 'nonce="[^"]*"' .tmp/b.html | head -1 | sed 's/nonce="//;s/"//'); [ "$HN" = "$BN" ] && echo NONCE_MATCH
grep -o "<loc>" <(curl -s https://huat-fsac.eu.org/sitemap-0.xml) | wc -l     # 应为 168（勿用 grep -c，XML 是单行）
```

## 七、与规划侧的一致性

- `PLAN.md` §2.2 的 M1 任务 1（#164）**已交付待验收**；`DECISIONS.md` **D-010** 已在本单落地为代码事实（D-003 未被推翻）。
- 下一棒可执行：`ready` = **#168（P1）**、**#169（P2）**；`blocked` = **#165**（等 Planner 关 #164）、**#167**（等 #165 + #168）。
- `docs/WORKFLOW.md:§7.4` 已追加第 37 轮行（只增不减）。
