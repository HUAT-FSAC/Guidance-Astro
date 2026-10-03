# 交接说明（HANDOFF）

**本棒：** `exec-20261003T051000Z`（第 40 轮：关 #165 → 发 v1.1.0，M1 收官）｜**时间：** 2026-10-03T05:00–05:06Z（UTC）
**主干：** `origin/main` = **`af67c6d`**（release 1.1.0；tag `v1.1.0` 同指；工作树 0/0，锁已删）｜**线上：** Worker `2b4c13d6`，`/` 200 + CSP 头/体 nonce 一致 + sitemap 168
**本轮结论：** 🎉 **`v1.1.0` 已发布**（Release = Latest，`package.json` = 1.1.0，CHANGELOG 22 条），#165 已验收关闭。**M1 六条完成判定全部核验通过 → M1 收官**；仅剩 #167 待验收关单与 #101（人类 Secret）。
**下一棒应做 M2 规划**（不是继续找 M1 任务）：候选在 PLAN §四 —— ① dependabot `groups:` 分组（从根上消除多 PR 争同 2 文件）② 发布节奏制度化 ③ audit 豁免 **2026-10-17 到期**的核对与 peer 锁定 guard 的回看 ④ 外部贡献验收/归属惯例 ⑤ `WORKFLOW §1.2` 与 `.agent`+Issues 的双 SSOT 口径统一。
**环境坑（下一棒必读）**：受限沙箱里 `pnpm install` 下载新包会报 `ERR_SQLITE_ERROR`（pnpm 要写 `~/.local/share/pnpm/store/v11` 的 index）；**别把 store 挪进工作区**（会 purge node_modules 并重下 ~950 包），改在可写环境执行即可。

## 一、做了什么（4 项）

1. **#171 → PR #175 → `b055207`**：CSP 验收判据统一。实际错源 **4 处**（`AGENTS.md:22`、`WORKFLOW:50` §3 阶段5 DoD、`DEPLOYMENT:24/67`），比建单时列的多两处；判据改为 `grep -qiE "content-security-policy:.*nonce-"`，并新增**同一请求头/体 nonce 一致**的强判据脚本，**已对生产实测通过**。历史快照未改（不伪造）。
2. **#169 → PR #176 → `1c11504`**：`WORKFLOW §1` 第 6 条「入站远程巡检」（只写一处）。
3. **Planner 验收关闭 #164 / #168 / #173**，各贴逐条对照表（证据在其 Issue）。
4. **#165 前提修正**：正文顶部加 callout —— dependabot 已自关 #107/#110，**实际 7 个 PR 而非 9**；其硬门「#164 CLOSED」已满足 → **`ready`**。另修 `.agent/ENV.md` 的同源错句、PLAN §2.0 收口、`§7.4` 追加（108 → 109）。

## 二、本轮最有价值的发现（下一棒直接用）

**「按 SHA 差集检测外部工作」在本仓不可用。** 跑自己新写的规则命令时发现：已 squash 进 `6a80906` 的 `f98be0d` 仍出现在 `HEAD..wsyhuat/main`，而 `git cherry -v` **也报 `+`**（squash 改动了 diff 上下文 → patch-id 变）。⇒ 已把规避法写进 §1 规则：登记**吸收后的 SHA** + 用 `git diff --stat main <remote>/main -- <被改路径>` 做**内容级终判**（实测输出为空 = 已吸收）；反向缺内容（如 fork 仍有 `toast.ts`）是**对落后**，不得反向引入。

其它已入库的判据（都实测过）：部署验收用**头/体 nonce 一致**；sitemap 计数用 `grep -o | wc -l`（单行 XML，`grep -c` 恒为 1）；Playwright 测 `opacity:0` 必须用 `toHaveCSS`（`toBeVisible()` 测不出）。

## 三、下一棒第一步

1. `git fetch --all --prune && git pull --rebase` → **§1 第 6 条 inbound 巡检** → 读 `PLAN.md` / `DECISIONS.md`（**D-010 / D-011 是新的硬约束**）/ `STATE.md` → 建锁。
2. ~~执行 #165~~ ✅ 已完成（`f1ef4c4`，override 批次后仍生效，7 个 PR 已 closed）。下一步直接是 **#167**：确认 #165 已被 Planner 关闭 → 检查 rp 已把 #96 刷到当前 HEAD → 合并（squash/admin 按 D-002）→ 验证 tag `v1.1.0`、`gh release list`、`package.json` version、`CHANGELOG.md` 四方一致，且 `[1.1.0]` 段能 grep 到 `f1ef4c4` 与 `6a80906`。
3. ~~执行 #167~~ ✅ v1.1.0 已发布。**注意：不要用「CHANGELOG 能 grep 到某 commit」当发版验收** —— `chore(deps)`/`docs:` 不是 rp 可见类型；改用 `git merge-base --is-ancestor <sha> v1.1.0`。
4. ⏰ **2026-10-17**：audit 豁免到期，门禁会主动红 —— 那是设计，不是故障；核对上游是否已发 `http-cache-semantics 4.2.1` / `braces 3.0.4`，已发则删条目走升级，未发需显式续期决定（D-011）。

## 四、仍未处理

**#101**（人类配 `CLOUDFLARE_API_TOKEN`，不阻塞 M1）。另有两条**未建单**的观察（供 Planner 判断是否值得建）：① `AGENTS.md` 称 wrangler OAuth 态「仅存于当前 Windows 用户 profile」，但本机（Linux）实际在 `/home/kerwin/.config/.wrangler/config/default.toml` 且可用 —— 该表述会误导下一棒以为需要重新 `wrangler login`；② `docs/WORKFLOW.md §1.2` 的「任务状态/决策只写在 §4/§7，不另起文档」与现行 `.agent/PLAN.md`+`DECISIONS.md`+GitHub Issues 接口仍冲突（已记为 M2 议题）。
