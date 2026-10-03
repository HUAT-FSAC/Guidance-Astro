# 交接说明（HANDOFF）

**本棒 Agent：** `exec-20261003T002503Z`（第 37 轮，**Execution Agent**，两个执行单元：#164 → #168）
**时间：** 2026-10-03T00:25Z 起（UTC，`date -u`；开工无遗留锁）
**仓库 / 分支：** `HUAT-FSAC/Guidance-Astro` ｜ `main` = **`61711a4`**（代码 `fef2a5e` + 状态提交，均已推 `origin/main`）
**状态：** **#164 已上线并交回验收**（`status:review`，未关单）；**#168 代码完成但 PR 未合并**（`status:in-progress`）—— 被一条**外部新公告导致的主干级门禁红**卡住
**锁：** `.agent/LOCK` = `exec-20261003T002503Z`（本棒运行结束时删除）

> **下一棒第一步（重要）：** 先读 §五「当前阻塞」再选任务 —— 现在**任何 PR 的 `Audit Dependencies` 都会红**，这不是你的代码问题，也不要绕过它。

---

## 一、单元 1：#164（已完成，待 Planner 验收）

- 代码 commit `3218dc9` → squash 落 main = **`fef2a5e`**（PR **#170**，CI 六项全绿含 Quality Gate 4m42s）→ **已部署**，Worker Version **`e0fc4b95`**。
- 落地 D-010 成对不变量：`pnpm-workspace.yaml:45` 有界 override `"@cloudflare/vite-plugin@^1.53.0": "1.62.5"` + `package.json` wrangler `4.136.2 → 4.147.0`（无 caret）。
- 反向证据：无 override → vite-plugin 浮 **1.62.4**；有 override → **恰 1.62.5**。
- **连带必要修正**：wrangler 4.147.0 要求 `@cloudflare/workers-types ^5.20261001.1` → 按既有声明范围重解析得 `5.20261002.1`（声明未改）。
- **未关单**（D-006）。合并时刻意让 squash 标题**不命中 closing keyword**（仓库惯例 `fix: #N` 会被 GitHub 自动关单，那会绕过 Planner）。

## 二、单元 2：#168（代码完成，PR #172 未合并）

- 分支 `fix/home/reveal-progressive-enhancement`（已推送），两个 commit：
    - `f3989dc` **author 保留 `wsy-huat`**（`git cherry-pick -x f98be0d`，**未 merge fork 分支**）
    - `9f0f287` 本棒的回归守卫
- 三个缺陷全修：CSS 默认 `opacity:1`（离屏才 `data-visible=false`）+ 无 IO 全显现 + 2s 兜底；消除 `reveal`+`stagger` 同元素叠加；3 头像本地化（`grep avatars.githubusercontent.com` = 0）。
- 本地验证：**test:run 416 passed**（基线 412 + 4）/ **test:e2e 97 passed**（基线 95 + 2）/ lint+format+tsc+build+quality×3 全 0 / sitemap 168 / 产物 CSS `.reveal-upon-scroll{opacity:1}`。
- **守卫有效性已按要求取证**：同一用例对修复前 main 基线**实测失败**（`toHaveCSS` → `unexpected value "0"`），修复后通过。

## 三、我犯过并自修的错（下一棒直接抄这些规避）

1. **`pnpm update <pkg>` 会连带改写 package.json 的声明范围**（我把 workers-types 的 `^5.20260922.1` 变成了 `^5.20261002.1` 而一度没察觉）。只想像 lock 那样浮动就别用它；发现手段是 `git show --stat` 看到 package.json 有 4 行变更。
2. **反向解析探针的两个陷阱**：`--ignore-workspace` 会**跳过 `pnpm-workspace.yaml` 的 overrides**（测出来其实是"无 override"）；在仓库内删 lock 跑 `pnpm install --lockfile-only` 会打印 `Already up to date`（pnpm 从 `node_modules` 复原，**不是真重新解析**）。正确做法：只放 `package.json`+`pnpm-workspace.yaml`+`.npmrc` 的空目录。
3. **Playwright 的 `toBeVisible()` 测不出 `opacity:0`** —— 它只查尺寸与 `visibility`/`display`。必须用 `toHaveCSS('opacity','1')`，否则写出永真守卫。
4. **jsdom 的 `getBoundingClientRect()` 返回全 0** → `isNearViewport` 的 `rect.bottom > 0` 不成立 → 被判为**离屏**。这使 #168 正文"现有 2 条单测会失败"的预测**不成立**（旧断言对新实现同样通过 = 零守卫力）；我显式打桩 rect 才真正覆盖新语义。
5. **链式命令里 pnpm 的 deps-status 检查偶发抛栈**，且管道后的 `$?` 是 `tail` 的退出码 —— 门禁必须逐项单独取真实退出码（我用 `.tmp/gates.sh` 记录到 `results.txt`）。
6. 我在 WORKFLOW §7.4 追加时**误删了 `### 7.5 handoff 格式` 标题**，随后自查 diff 恢复。追加表格行的安全做法：锚定「`### 7.5 handoff 格式`」本身并在其**之前**插入行，别把标题一起替换掉。

## 四、当前 commit / 远程 / 线上

- `origin/main` = **`61711a4`**（`fef2a5e` 代码 + 记录）；main CI 三项在 00:57Z **全 success**。
- 线上 = `fef2a5e` 产物：`/` `HTTP/2 200`、HSTS、`cache-control: private, no-cache, must-revalidate`；抽查 4 路由 200；sitemap **168**；**CSP 头与 body 的 nonce 同一请求一致**且逐请求变（27 个 inline script）。
- ⚠️ `AGENTS.md` 的验收字面串 `content-security-policy: nonce-` **永不匹配**（本棒据此误判过一次 MISSING）→ 已建 **#171**；改用 `content-security-policy:.*nonce-` 或头/体一致判据。
- 未合并：PR **#172**（#168）。未部署：#168 的改动。
- backlog 实测变化：**dependabot 自行关闭了 #107 与 #110**（被 #164 的 `wrangler@4.147.0` / `workers-types@5.20261002.1` 取代）→ 开放 dependabot PR 从 9 个变为 **7 个**（#106/#108/#109/#111/#112/#113/#114）。已把这条事实评论到 #165（未改其正文/标签）。

## 五、当前阻塞（真实、有证据、非本棒代码造成）

**`Audit Dependencies` 现在对任何 PR 都会红。** 约 00:57–01:05Z 之间发布 2 条 high 公告：

| 包                     | 公告                | 受影响    | 声称已修复 | 实装                                                           | 上游补丁是否存在   |
| ---------------------- | ------------------- | --------- | ---------- | -------------------------------------------------------------- | ------------------ |
| `http-cache-semantics` | GHSA-ch52-4w7c-c8xp | `<=4.2.0` | `>=4.2.1`  | `4.2.0`（经 `astro`，SSR 运行时链）                            | ❌ latest 仍 4.2.0 |
| `braces`               | GHSA-vfj7-8cjw-p6xm | `<=3.0.3` | `>=3.0.4`  | `3.0.3`（经 `purgecss>fast-glob>micromatch`，仅 dev/build 链） | ❌ latest 仍 3.0.3 |

**没有代码层面的解法**：override 指向不存在的版本会让 install 直接失败。已登记 **`auto-discovered` #173**（未设优先级），里面写了三个候选方向：等上游 / 临时忽略并挂跟踪 / 暂时接受 main 红。**门禁政策与 audit 级别属人类/Planner 决策**，本棒未改 `.github/workflows/*`、未改 `package.json` 的 audit 级别，也**没有 `--admin` 合并 #172**（那绕的是真实失败的质量门禁，违反 §1.4）。

复查命令：`npm view http-cache-semantics dist-tags.latest`、`npm view braces dist-tags.latest`（任一出现补丁版即可解锁）。

## 六、下一棒的第一步

1. **先判断 #173 是否已解除**（上面两条 `npm view`），或人类/Planner 是否已给出 audit 政策。
2. 解除后：`gh pr merge 172 --squash --admin`（标题勿用 closing keyword）→ `git pull` → `pnpm install` → `pnpm deploy:worker` → 补 #168 验收第 **5/9/10** 项（3 个线上头像各 200、部署复验、亮暗截图）。
3. **#169 仍可直接开工**（纯 `docs/WORKFLOW.md`，与依赖/audit 无关）—— 但如果 audit 红未解，它的 PR 同样过不了门禁，建议先解 #173 或让它带着"已知外部红"待合并。
4. **#165**：仍不动工（自检硬门「#164 已 CLOSED」未满足，等 Planner 关 #164）。开工时注意 §四 的「7 个 PR」新事实 + 批次后复验 vite-plugin override 是否仍生效。
5. Planner 需要处理的三件事：验收关 **#164**、治理 **#171 / #173**（含 audit 政策）、以及 #165 正文的「9 PR」前提修正。

## 七、命令速查

```bash
git fetch --all --prune && git pull --rebase
for r in $(git remote); do [ "$r" = origin ] && continue; echo "== inbound $r/main =="; git log --oneline "HEAD..$r/main" 2>/dev/null; done
export PATH="$HOME/.local/share/mise/installs/pnpm/11:$HOME/.local/share/mise/installs/node/22/bin:$PATH"

mise exec -- pnpm peers check
npm view @cloudflare/vite-plugin dist-tags.latest peerDependencies.wrangler
npm view http-cache-semantics dist-tags.latest   # #173 解锁判据
npm view braces dist-tags.latest                 # #173 解锁判据
gh pr checks 172 | grep -viE skipping

# 部署验收（强判据：头/体 nonce 一致；勿用 AGENTS.md 的字面串）
curl -s -D .tmp/h.txt -o .tmp/b.html https://huat-fsac.eu.org/
HN=$(grep -i '^content-security-policy:' .tmp/h.txt | grep -o "'nonce-[^']*'" | tr -d "'" | sed 's/^nonce-//')
BN=$(grep -o 'nonce="[^"]*"' .tmp/b.html | head -1 | sed 's/nonce="//;s/"//'); [ "$HN" = "$BN" ] && echo NONCE_MATCH
grep -o "<loc>" <(curl -s https://huat-fsac.eu.org/sitemap-0.xml) | wc -l    # 168（勿用 grep -c）
```

## 八、与规划侧的一致性

- `PLAN.md` §2.2：任务 1（#164）**已交付待验收**；任务 3（#168）**代码完成、被 #173 卡住未合并**。
- `DECISIONS.md`：**D-010 已由 #164 落为代码事实**；D-003 未推翻；D-002 用于 #170 合并；**D-006 用于两单都不关单**。
- `docs/WORKFLOW.md:§7.4` 追加至 **107 行**（第 37 轮 2 行：#164、#168，只增不减）。
- 本棒未编辑 `PLAN.md` / `DECISIONS.md`（Planner 唯一写入点）；未替 #171/#173 设定优先级或 Milestone。
