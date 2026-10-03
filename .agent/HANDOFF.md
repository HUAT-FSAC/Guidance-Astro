# 交接说明（HANDOFF）

**本棒 Agent：** `planner-20261003T094000Z`（第 36 轮，**Planning Agent 第 2 轮**）
**时间：** 2026-10-03T09:40Z 起（UTC；上一棒无遗留锁）
**仓库 / 分支：** `HUAT-FSAC/Guidance-Astro` ｜ 主干 `main@f9bed16`（与 `origin/main` 0/0）
**状态：** M1 稳态治理队列从 4 项扩到 **6 项 `ready`**；#164 目标值因新事实被**重写**；新建 #168/#169；#166 由 Planner 自办关闭；**零代码改动**

> 🔵 **本棒仍是 Planning Agent。** 未修改 `src/**`、未修改依赖清单、未部署。
> **下一棒（Execution Agent）开工顺序：**
> `git fetch --all --prune` → `git pull --rebase` → **inbound remote 巡检（见 §六，本轮新增）** → 读 `.agent/PLAN.md` + `.agent/DECISIONS.md`（**D-001..D-010 是硬约束，先读**）+ `.agent/STATE.md` + `.agent/ENV.md` + 本文件 → 检查 `.agent/LOCK` → 从 §二 认领**一个**任务。

---

## 一、本棒做了什么（第 36 轮：Planning Agent 第 2 轮）

1. **例行同步**：`fetch --all --prune` → 工作区干净 → `main@f9bed16` 与 origin 一致（0/0）→ 无 LOCK → 无需 pull。
2. **执行验收：结论是「无可验收项」**。第 35 轮入队的 #164/#165/#166/#167 **全部仍 `status:backlog`、无 assignee、无执行评论**，`f9bed16` 后零新 commit。队列不是被做坏了，是**没人接棒**（约 9h）。
3. **实测发现两个会改变路线的新事实**（详见 `STATE.md` 第 36 轮）：
    - **#164 的目标值已失效** —— `@cloudflare/vite-plugin` 一周连发 6 版，`wrangler` peer 从 `^4.143.0` 棘轮到 **`^4.147.0`**；adapter 的 `^1.53.0` 浮动范围在 `14.3.2`/`14.3.3`/`latest` 完全相同。
    - **协作方 fork 里有无人认领的线上缺陷修复** —— `wsyhuat/main` 的 `f98be0d`（2026-10-02T07:55Z），修首页可见性 / 层叠冲突 / 境外头像三件事，`.agent` 与 Issue **零记录**，静置约 12h。
4. **产出**：重写 **#164**（标题 + 正文）、新建 **#168**（P1）与 **#169**（P2）、给 **#167** 正文加 `#168` 依赖边、给 #164/#165/#167/#168/#169 各留 Planner 标注、**关闭 #166**（Planner 自有文件的体检属本职，不占执行队列）；落盘 **D-010**；刷新 `PLAN.md` / `STATE.md` / 本文件；`WORKFLOW §7.4` 追加第 36 轮行。
5. **本轮复核（不是叙述，是实测）**：`main` CI/CD Pipeline success（run `37042211284`）／线上 `/` **200**／`pnpm audit --audit-level=moderate` **0 漏洞**／Actions Secrets 仍仅 `CODECOV_TOKEN`+`PROJECT_TOKEN`（#101 阻塞有效）／`gh release list` 仍 `v1.0.2`／开放 PR 11 个。

## 二、当前 ready 队列（M1 稳态治理，6 项）

```
[#164] 锁定 vite-plugin + wrangler→4.147.0  ──▶  [#165] dependabot 批次处置  ──▶  [#167] 发布 v1.1.0
                                                                              ▲            ──┘
[#168] 首页可见性 / 层叠冲突 / 头像外链（无前置，与 #164 零文件重叠可并行）──┘
[#169] inbound 巡检入 WORKFLOW §1（无前置，纯文档）
```

| 顺位 | Issue | 优先级 | 依赖      | 一句话                                                              |
| ---- | ----- | ------ | --------- | ------------------------------------------------------------------- |
| ①    | #164  | P1     | 无        | 有界 override 锁 vite-plugin + `wrangler` pin `4.147.0`（成对）     |
| ①′   | #168  | P1     | 无        | 首页无 JS 不可见 + stagger/reveal 冲突 + 境外头像（移植 `f98be0d`） |
| ①″   | #169  | P2     | 无        | `WORKFLOW §1` 补 inbound remote 巡检（纯文档，走 PR）               |
| ②    | #165  | P1     | #164      | dependabot 9 PR（#106–#114）批次处置，解除限流 9/10                 |
| ③    | #167  | P2     | #165,#168 | 合并 rp PR #96，发布 v1.1.0                                         |

**认领前必查（防踩已知坑）：**

- #165 开工前：确认 **#164 已 close** 且 `pnpm-workspace.yaml` 里**已有 vite-plugin 锁定 override**（光抬 pin 不够，见 D-010）。
- #167 开工前：确认 **#165 与 #168 都已 close**（先发依赖与修复，后发版；v1.1.0 不应带已知缺陷）。
- #168 与 #164 **可安全并行**（Planner 已核文件集不重叠：#168 动 `src/components/home/sections/**`、`src/styles/**`、`src/utils/**`、`public/assets/avatars/**`、`tests/**`；#164 只动 `package.json`/`pnpm-lock.yaml`/`pnpm-workspace.yaml`）。但 **#164/#165/#168 各自都要部署 → 部署必须串行，后部署者先 `git pull`**（第 30 轮事故坑）。

**D-006 纪律：** Executor 完成后**留结果评论、不要自行关单**；由 Planner 逐条对照验收标准核对后关单。

## 三、下一棒要注意的关键事实（本轮新发现）

1. **⚠️ peer 是逐发布日棘轮，不是静态阈值。** `@cloudflare/vite-plugin` 1.62.0→1.62.5（9/28–10/2）把 `wrangler` 下限从 `^4.143.0` 抬到 `^4.147.0`。**任何「照着旧 Issue 里的数字执行」的做法都可能已经过期** —— 动手前先 `npm view` 复核，若与 Issue 正文不一致：**停下留评论，不要自行改路线**（版本路线归 Planner）。
2. **`main` 现在绿是因为 lockfile 挡住了。** 实测 `pnpm-lock.yaml:463` 钉 vite-plugin `1.54.8`（peer `^4.131.1`，wrangler `4.136.2` 满足）。一旦重新解析（#165 批次、`pnpm update`）就浮到 `1.62.5` → 需 `^4.147.0`。
3. **`pnpm-workspace.yaml` 里 `minimumReleaseAge: 0`** → 无发布年龄保护，解析必然取最新。这是棘轮能立刻命中本仓库的原因，别误以为有护栏。
4. **协作方 fork 不是视觉分叉，只是携带修复。** Planner 实测 `git diff HEAD f98be0d` 的 `src/**` 差异**恰好等于**该 commit 的 4 个文件；但 fork 整体落后两周（仍含已删的 `src/utils/toast.ts`、`contributing.md` 旧路径、旧 workflow）→ **禁止 `merge wsyhuat/main`，只取单个 commit。**
5. **`f98be0d` 会让 `tests/unit/scroll-reveal.test.ts` 现有 2 条用例失败**（`:25-36` 断言必被 observe、`:38-46` 断言未相交不显）。jsdom 的 `getBoundingClientRect()` 返回全 0 → 新逻辑判定为近视口立即显现。**这是预期，不是回归**：按新语义改写用例，不要为了让旧断言过而把实现改回「默认隐藏」。
6. **首页 25 个 reveal 区块在服务端 HTML 里没有 `data-visible`**（实测），CSS 默认 `opacity:0`（`docs-global.css:871-883`）—— 这是 #168 的核心证据，也是新增 e2e（禁用 JS）断言的依据。

## 四、Decision Gate 结果与剩余阻塞

- ✅ **本轮不存在需要用户裁决的开放 Decision Gate。** M1 全部 6 项均可由既有事实执行。
- ✅ **D-010 已由 Planner 自主裁定**（锁定 vite-plugin + wrangler pin 跟随 peer）。若不同意：**回退成本 = 删一条 `pnpm-workspace.yaml` override + revert 一个 pin 行**。
- ✅ **D-009 已裁决（2026-10-03）**：授权 dependabot 批次处置；**逐个合并自动 PR 仍禁止**，不得 `--admin` 单独 merge 任何 dependabot PR。
- **#101**：配 `CLOUDFLARE_API_TOKEN`（Actions Secrets）。**配好前不要把 deploy job 加回 CI**；实现已备好（`8475f88`）。
- 人类侧（**均不阻塞 M1**）：`PROJECT_TOKEN` 值/权限复核 + `projects/1` 是否存在；`size:xs` 手工建 label；`update-linked-issues` 去留；是否把协作方贡献改为正式 fork PR 流程（默认方案：保持「fork 直提 + Planner 巡检 + 建单移植」）。

## 五、注意事项 / 坑（执行相关精简版，全量见 git 历史）

1. **依赖链串行**：#164 → #165 → #167；#168 → #167（见 §二）。
2. **部署前必 `git pull`** 并确认目标文件在位（第 30 轮两次上线旧树的事故）。
3. **`pnpm` 不在裸 PATH**：同命令内 export 或用 `mise exec -- pnpm`；跨 shell 不继承 PATH，**commit 前须同命令内 export**，否则 husky 拦 commit。
4. **本地门禁清单必须含 `pnpm audit`**（CI 第 2 job；公告随时发布，#160 教训）。
5. **override 必须是有界区间**（D-007）：禁裸 `>=X`；本轮新增的 vite-plugin 锁定也适用同纪律。
6. **gh label 名错会整体失败不建单**（`priority:p2` 不是 `P2`），建单后回查；comment 反引号用 `--body-file`。
7. **sitemap 比对先 unquote**（percent-encoding 假阳性）；计数只取 sitemap-0（169 是混入 sitemap-index 自身）。
8. **记录类文件（`.agent/\*\*`、`WORKFLOW §7.4`）可直推 main**（D-008）；**代码与文档修复仍走分支 + PR**。
9. **锁协议**：超 30min 可接管；正常结束删锁；锁不提交。
10. **关单纪律**：Executor 不关单（D-006）；Planner 验收后关。
11. **§7.4 追加是历史行不可删**（本棒 104 → 105 行；上一棒遗留的「103」计数已不准，本轮实测为 104）。
12. **`src/styles/**` 是 §7.3 高冲突文件**；同窗口勿与他人并行动它（#168 独占中）。

## 六、关键命令速查

```bash
git fetch --all --prune && git pull --rebase

# ★ 本轮新增：inbound remote 巡检（发现协作方工作；输出非空必须登记，不得无声略过）
for r in $(git remote); do
    [ "$r" = origin ] && continue
    echo "== inbound $r/main =="; git log --oneline "HEAD..$r/main" 2>/dev/null
done

cat .agent/PLAN.md .agent/DECISIONS.md .agent/STATE.md .agent/HANDOFF.md
mise exec -- pnpm audit --audit-level=moderate
gh issue list --state open --json number,title,labels --jq '.[] | "#\(.number) \(.title)"'
gh pr list --state open --author "app/dependabot" --json number --jq 'length'   # 限流占用计数
npm view @cloudflare/vite-plugin dist-tags.latest peerDependencies.wrangler      # ★ 动手前复核 peer
npm view wrangler dist-tags.latest
gh api repos/HUAT-FSAC/Guidance-Astro/actions/secrets --jq '.secrets[].name'     # #101 复核
export PATH="$HOME/.local/share/mise/installs/pnpm/11:$HOME/.local/share/mise/installs/node/22/bin:$PATH"
curl -s -o /dev/null -w "%{http_code}\n" https://huat-fsac.eu.org/
curl -s https://huat-fsac.eu.org/ | grep -c 'reveal-upon-scroll'                 # #168 基线=25
```

## 七、与看板 / 前一棒的一致性

- `docs/WORKFLOW.md:§4` T-001..T-038 全部已完成 → 阶段判定仍为**功能期结束、漂移治理期**（`PLAN.md` §一，本轮把判据从 7 项扩到 **10 项**，新增 peer 稳定性 / 外部贡献可见性 / 首页健壮性）。
- 长期决策 **D-001..D-010** 落 `.agent/DECISIONS.md`；本轮新增 **D-010（Planner 自主裁定）**，D-003 **未被推翻**（只是把同样的纪律应用到被依赖方）。
- 本轮 `§7.4` 追加第 36 轮行；`STATE.md` 已刷新到 `main@f9bed16` 基线。
- **闭环一致性自检（本轮已做，对应 #166）**：PLAN §二队列 ↔ `gh issue list --state open` ↔ STATE「开放 issue 现状」三者**逐号对齐**，无孤儿、无已做未关、无重复。
- ⚠️ 已知文档口径冲突（**未在本轮处理，属 M2 议题**）：`WORKFLOW §1.2` 仍写「任务状态/决策只在 §4/§7，不另起文档」，而接力体系现已以 `.agent/PLAN.md`+`DECISIONS.md`+GitHub Issues 为任务与决策接口。需要一条 `docs:` PR 明确从属关系，避免两个 SSOT 并存。
