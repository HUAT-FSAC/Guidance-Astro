# 交接说明（HANDOFF）

**本棒：** `planner-20261003T073200Z`（第 41 轮，**Planning Agent 第 3 轮**）｜**时间：** 2026-10-03T07:32–07:40Z（UTC，`date -u`）
**主干：** `origin/main` = **`a6443d1`**（CI/CD Pipeline **success**）｜**最新 tag：** `v1.1.0`（GitHub Release = Latest）｜**线上：** Worker `c2cd3d43`，`/` 200 + CSP 头/体 nonce 一致 + sitemap 168
**本轮结论：** ✅ **M1 收官**（#164/#165/#166/#167/#168/#169/#171/#173 全闭，仅 #101 等人类配 Secret）→ 🆕 **M2 稳态防复发开局**：GitHub Milestone #1（due 2026-10-24）+ **5 个 `ready` 单 #178–#182**
**锁：** 无（Planning 轮不占执行锁；本棒零代码改动、未部署）

> **下一棒（Execution）第一步见 §三。**

---

## 一、本轮做了什么

1. **验收并关闭 #167**（M1 最后一单）：核 `af67c6d`（发版）与 `a6443d1`（记录）的 main CI 均 success、Release `v1.1.0` = Latest、四方一致（tag / release / `package.json` 1.1.0 / CHANGELOG 22 条）。关闭评论里明确认可执行方**纠正了 Planner 自设的一条不可达验收标准**（详见 §五.1）。
2. **逐条重新核实用户给的 5 个 M2 候选**（不继承旧结论，全部现场取证）：
    - ① dependabot **至今没有 `groups:`**（`.github/dependabot.yml` 两块 `schedule: weekly` + `open-pull-requests-limit: 10`）→ 真缺口；
    - ② rp 链路本身健康（本次自动打 tag + Release），缺的是**「Release PR 何时合并」的规则**（#96 曾积压 12 天）→ 真缺口，政策先记 **D-012**；
    - ③ `pnpm-workspace.yaml:45` 锁 `1.62.5` 无抬版触发器；`.config/audit-allowlist.json` 两条豁免 **2026-10-17 到期**，目前只能"撞红才发现" → 真缺口；
    - ④ 外部贡献验收/归属：**大部分已被 #169 落地的 `WORKFLOW §1.6` 覆盖**（建 Issue 移植、`cherry-pick -x` 保留原作者、禁止 merge 外部分支）⇒ **不为凑数单独建单**，只作为 #181 的附带项与人类可选 Settings 待办；
    - ⑤ `WORKFLOW §1.2`「不另起文档」+ `§4` 头部「与 Projects `projects/1` 保持一致」与现行 `.agent` + Issues 接口**实测仍冲突** → 真缺口，并派生快照漂移项。
3. **产出**：Milestone #1 + **#178 #179 #180 #181 #182**；`PLAN.md`（§一 改为「M1 已收官、现处 M2」、**新增 §四 M2 全章**、§五 加 5.1 结论）；`DECISIONS.md` **新增 D-012**；`STATE.md` 刷新；`WORKFLOW §7.4` 追加（111 → 112，只增不减）。

## 二、M2 ready 队列（执行方看这张表即可开工）

| 顺位 | Issue                             | 优先级 | 前置 / 文件冲突                                                                                                                     |
| ---- | --------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| ①    | **#178** dependabot `groups:`     | P2     | 无前置；只动 `.github/dependabot.yml`。⚠️ 有**延迟判据**：合并后须在 **10-06 周一扫描之后**回单留言实测分组效果，缺留言只算部分完成 |
| ①′   | **#180** 只读供应链探针           | P2     | 无前置；新增 workflow + `§6` 一行。**边界：绝不得 gate 任何交付**（不接进 `ci-cd.yml`、不做 required check）                        |
| ①″   | **#179** 发版节奏成文（落 D-012） | P2     | 无前置；动 `WORKFLOW` + `DEPLOYMENT` + `PROJECT_MANAGEMENT_MODEL`（后两者只引用）⇒ 与 #181/#182 **同文件串行**                      |
| ②    | **#181** 消除双 SSOT              | P2     | 动 `WORKFLOW §1.2` / `§4` 头部 / `AGENTS.md` 锚定段                                                                                 |
| ③    | **#182** 快照与 OAuth 跨平台路径  | P3     | **blocked by #181**（同文件）                                                                                                       |

**建议顺序：** #178 ∥ #180 ∥ #179 → #181 → #182。

## 三、下一棒第一步

1. `git fetch --all --prune && git pull --rebase` → 跑 `WORKFLOW §1.6` 的 inbound 巡检 → 读 `PLAN.md §四` + `DECISIONS.md`（**D-011 到期机制、D-012 发版节奏是本轮新增硬约束**）→ `STATE.md` → 建锁 → 认领 #178 或 #180。
2. ⚠️ inbound 巡检**本轮实测仍有输出**（`f98be0d`、`d89b87e`）——那是 squash 导致的**已知误报**，处置办法见 §1.6 的"已知局限"：登记吸收后的 SHA + 用 `git diff --stat main <remote>/main -- <路径>` 做内容级终判（实测已为空 = 无未吸收内容）。**不要每轮重复 triage 它。**
3. ⏰ **2026-10-17 之前**做一次 D-011 核对：`npm view http-cache-semantics dist-tags.latest`、`npm view braces dist-tags.latest`（期望 ≠ `4.2.0` / `3.0.3`）。已发补丁 → 删豁免条目并正常升级；仍未发 → **需要一次显式续期决定（那是真正的 Decision Gate，不得静默延长）**。
4. 之后若出现 `feat:` 级变更：按 D-012，**minor 随 Milestone 收尾再发版**，不必立刻合并 Release PR。

## 四、仍未处理（都不属于 M2 ready）

- **#101**：等人类配 `CLOUDFLARE_API_TOKEN`（配好前不要把 deploy job 加回 `ci-cd.yml`）。
- 人类可选：`PROJECT_TOKEN` 值/权限复核、`size:xs` label、`update-linked-issues` 去留、是否把协作方贡献改成正式 fork PR 流程（**默认维持现状**：fork 直提 + Planner 巡检 + 建单移植）。

## 五、纪律与判据（本轮实测得出，别再犯）

1. **发版验收禁止用「CHANGELOG 能否 grep 到某 commit」**：`chore(deps)` / `docs:` 不是 release-please 的 changelog 可见类型，该判据**在设计上不可满足**。正确做法 = `git merge-base --is-ancestor <sha> <tag>` + 四方核验。
2. **rp `workflow_dispatch` 后 PR 无变化不是失败**（那是它判定"无 changelog 可见新提交"的正确行为），别去改 commit 前缀骗过它。
3. `pnpm update <pkg>` 会连带改写 `package.json` 的声明范围；真·全新解析探针要用只放 3 个配置文件的隔离目录，且**不能加 `--ignore-workspace`**（会跳过 overrides）。
4. 受限沙箱里 `pnpm install` 下载新包会报 `ERR_SQLITE_ERROR`（写 `~/.local/share/pnpm/store/v11`）；**别把 store 挪进工作区**（会 purge `node_modules` 重下 ~950 包）。
5. 部署验收判据：`content-security-policy:.*nonce-`（字面串 `content-security-policy: nonce-` 永不匹配，#171）；更强的是同一请求**头/体 nonce 一致**。sitemap 计数用 `grep -o '<loc>' | wc -l`。
6. 只读探针类改动不要接进主 CI。`gh` 传 milestone 用**标题**不是编号；建 milestone 的到期字段是 `due_on`。

## 六、关键命令速查

```bash
git fetch --all --prune && git pull --rebase
for r in $(git remote); do [ "$r" = origin ] && continue; echo "== inbound $r/main =="; git log --oneline "HEAD..$r/main" 2>/dev/null; done
git diff --stat main wsyhuat/main -- src/utils/scroll-reveal.ts src/styles/docs-global.css   # 内容级终判（空=已吸收）

export PATH="$HOME/.local/share/mise/installs/pnpm/11:$HOME/.local/share/mise/installs/node/22/bin:$PATH"
export npm_config_verify_deps_before_run=false          # 规避沙箱 deps-status 竞态
pnpm quality:audit && pnpm peers check
npm view http-cache-semantics dist-tags.latest; npm view braces dist-tags.latest        # D-011 到期核对
npm view @cloudflare/vite-plugin dist-tags.latest peerDependencies.wrangler               # D-010 抬版核对
python3 -c "import yaml;yaml.safe_load(open('.github/dependabot.yml'))"                  # #178 用
mise exec -- pnpm test:run   # 基线 429 passed (39 files)
pnpm test:e2e                # 基线 97 passed
gh pr list --state open --author app/dependabot --json number --jq 'length'   # 基线 0
```
