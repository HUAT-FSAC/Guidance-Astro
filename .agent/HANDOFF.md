# 交接说明（HANDOFF）

**本棒 Agent：** `glm-5.3-flash-20260929T234352Z`
**时间：** 2026-09-29T23:43Z – 2026-09-30T01:05Z（UTC），共 8 轮，按接力协议 §九.1 停止
**仓库 / 分支：** `HUAT-FSAC/Guidance-Astro` ｜ `main`
**本棒起点 HEAD：** `751607a` ｜ **交棒 HEAD：** `3f5e7d4`（CI 7/7 绿）

> 下一棒请先按 `docs/WORKFLOW.md:§1/§3` 与 `AGENTS.md` 的「发布与部署」执行：
> `git fetch --all --prune` → `git pull --rebase` → 读 `.agent/STATE.md` + 本文件 → 检查 `.agent/LOCK` → 选任务。

---

## 一、本棒做了什么（8 轮总览）

| 轮  | 结果                                                                                                                                                                                      | 产出                                       |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| 1   | 接管 deepseek 过期锁（其中断于第 4 轮，STATE/HANDOFF 已改未提交）→ 补提 `8cec201`；ENV.md 首轮探测；内链扫描发现 16 处 404 → 建单 #117 → 修复+回归测试 `748a3cb` → 部署 → 线上验收 → 关单 | CI 7/7（`36648032991`），部署 `df007a5b`   |
| 2   | `.gitignore` 误规则纠偏：建单 #118 → 一行恢复 → 验证 → 关单                                                                                                                               | `03dc7c7`，CI 7/7（`36649026704`），未部署 |
| 3   | `public/robots.txt`：建单 #119 → 实现 `2a905d0` → 三层验证 → 手动关单                                                                                                                     | 部署 `62778a8e`，CI 7/7（`36649823634`）   |
| 4   | 建单 #120（toast.ts 死代码删留，`question` 标签留人类）                                                                                                                                   | 无代码改动                                 |
| 5   | `src/pages` 静态页内链复扫：**0 断链**（#117 覆盖面补全）                                                                                                                                 | 无需建单                                   |
| 6-8 | 连续 3 轮评估无安全可推进事项 → **§九.1 停止**（期间核实「旧提交 CI 失败」为 9 月 3-4 日历史 run 被 re-run 浮上列表，main 顶端始终全绿）                                                  | 无                                         |

### 三个闭环的要点（下一棒可能用到）

1. **#117 内链完整性（`748a3cb`，9 文件 +233/−53）**
    - 修复：docs-center 5×LinkCard（`/文档中心/x/`→`/docs-center/x/`）+ `/2025/`→`/archive/2025/`；sensing `/感知/*`→`/archive/2025/sensing/*`；planning-control `/规控/*`→`/archive/2025/planning-control/*`（`高避`→`高速循迹`）+ `/规控/资料汇总/`→`/archive/planning-control/资料汇总/`；news 去除 `/news/` 死链；2024-learning-roadmap 中 2 处相对 `综合` 绝对化、en 1 处 `++`→slug。
    - 架构：`redirects` 从 `astro.config.mjs` 抽到 `src/config/redirects.ts`（行为等价，astro.config 本就有导入本地 TS 模块的先例）。
    - **回归门禁**：`tests/unit/internal-links.test.ts`（3 例）——全量解引用内容页内链 vs 合法集合（`sitemap-paths.ts` 的 slug 路由 + 静态页 + redirects 键 + public 文件）。**以后写 404 内链 CI 直接红**。本地单跑：`pnpm test:run tests/unit/internal-links.test.ts`。
    - 线上验收：15 个目标 URL 全 200；5 个修复页旧路径 0 残留。
2. **#118 gitignore（`03dc7c7`）**：`8874314`（2026-08-06）把规则从 `src/pages/en/archive/` 错改成 `src/content/docs/en/archive/`（真实内容目录，69 个已跟踪文件），会静默拦截该目录**新增**文件（#117 时已实际踩中，被迫 `git add -f`）。已恢复原指向并 `git check-ignore` 双向验证。
3. **#119 robots.txt（`2a905d0`）**：源站此前无 robots.txt → CF 注入 content-signals 托管文本。新增 `public/robots.txt`（Allow 全站 + `Sitemap: https://huat-fsac.eu.org/sitemap-index.xml`）后**CF 注入让位**（仅源站缺失时才注入），无需 zone 人工配置。三层验证：构建产物 → 本地 `wrangler dev` → 线上 200。

---

## 二、交棒时主干状态

- `main` = `3f5e7d4`，与 `origin/main` 同步；本棒全部推送的 CI run 均 7/7 success；本地门禁（lint/format/tsc/vitest **412**/audit/build/bundle/theme）全绿。
- 线上 `https://huat-fsac.eu.org` 版本 `62778a8e`，与 main 同步；`/`、`/robots.txt`、`/sitemap-index.xml`（167 URL）全部健康。
- 工作区干净（LOCK 为本地运行时锁，不入库，本棒结束时已删除）。
- 开放 issue：**#101**（P1，人类配 Secret）、**#120**（P3 question，人类决策）。开放 PR 均为 dependabot / release-please 自动 PR（**协议禁止自动 merge**，不碰）。

---

## 三、下一棒要做（按优先级）

1. **例行评估即可**：可接手 issue 仅 #101（阻塞于人类）与 #120（question，跳过）。若无新 issue / 人类新任务，预计快速触发 §九.1 停止——属正常，不必强行造任务。
2. 若 #120 被人类裁决（删/留），按单内验收标准执行。
3. 若 #101 的 Secret 已配好：按 #101 拆解把 deploy job 加回 `ci-cd.yml`（完整实现见提交 `8475f88`），此后部署回归 CI 自动。
4. 剩余 2 条 `astro check` hint（`BilibiliVideo.astro:13` scrolling、`share.ts:109` execCommand）价值低、需浏览器实测，勿动。

---

## 四、阻塞项（需人类操作）

- **#101**：在 GitHub `Settings → Secrets and variables → Actions` 配置 `CLOUDFLARE_API_TOKEN`（`CLOUDFLARE_ACCOUNT_ID` 不需要）。**Secret 没配之前不要把 deploy job 加回 CI**（main 会红）。
- **#120**：toast.ts 删留二选一。
- 在此之前线上部署走本机 `wrangler` OAuth（本棒成功部署 2 次；登录态只在当前 Windows profile，换机需重跑 `wrangler login`，需 strip 本地 proxy）。

---

## 五、注意事项 / 坑（本棒新增 ⚠️ 标记）

1. **分支保护与直推**：`main` 受保护但当前 token 有 **bypass** 权限，直推成功（remote 打印 "Bypassed rule violations" 属预期）。权限不同则走 `auto/<时间戳>-<简述>` 分支 + PR（不自动 merge）。
2. **双远程**：`origin` = `HUAT-FSAC/Guidance-Astro`（权威）；`wsyhuat` = fork 且是独立代码线，**不要**当上游。
3. **部署判据**：影响线上产物的改动（`src/**`、`astro.config.mjs`、`public/**`、依赖）push 后**自动** `pnpm deploy:worker`；纯 `.agent/**` / `.gitignore` / docs 改动不必部署。⚠️ **CF 托管 robots.txt 会因源站缺失而注入**——现在源站已有（#119），该问题已消失。
4. **内容页 URL 逐段 slug**（#116/#117 两次验证）：`src/content/docs/**` 的 URL 经 `github-slugger` 逐段处理（`vsc-c-c++-dev-and-debug`→`vsc-c-c-dev-and-debug`、`ROS 入门`→`ros-入门`），`src/pages/**` 不 slug。推 URL 必须走 `src/integrations/sitemap-paths.ts`。
5. ⚠️ **`@assets/` 别名图片不是断链**：MDX 里 `![alt](@assets/...)` 由 Astro 构建期处理为 `/_image/?href=/_astro/...`（线上实测）。链接扫描必须跳过 `@` 开头目标，否则 50+ 条误报。
6. **行尾**：部分内容 `.mdx` 磁盘上是 CRLF。编辑用**单行替换**最稳；`.gitattributes` 已归一 LF 入库。`.md`/`.mjs`/`.ts` 会过 husky lint-staged prettier（**包括 `.agent/*.md`**，所以 prettier 会在提交时重排你刚写的 STATE/HANDOFF——Edit 前若报 "modified since read" 先重读）。
7. **`.gitignore` 已修复（#118）**：`src/content/docs/en/archive/` 不再被忽略。若未来 add 被拒，先查 ignore 规则再怀疑权限。
8. **`fix: #N` commit subject 自动关闭 issue**（#117 即如此）；**不想自动关就用 `feat:` / `chore:` 前缀**（#119 即如此——部署前无法预知线上效果时先不关单，验证后再手动关）。
9. ⚠️ **`gh run list` 可能浮出被 re-run 的历史 run**：轮 6 曾见 9 月 3-4 日旧提交的 failure run 出现在 `--branch main --limit 2` 顶部，实为历史 run 被 re-run，**main 顶端始终全绿**。判断主干健康要用 `git log --oneline -1` 的 HEAD sha 对照最新 run 的 headSha，别只看列表前几行。
10. **依赖 override 时效性**：`pnpm-workspace.yaml` 用 override 压平传递依赖漏洞；安全公告拓宽区间时旧下限漏网 → `Audit Dependencies` 红。第一反应：`pnpm why <pkg>` → 提 override 下限 → `pnpm install` → `pnpm audit` 复验。

---

## 六、关键命令速查

```bash
# 同步与状态
git fetch --all --prune && git pull --rebase
cat .agent/STATE.md .agent/HANDOFF.md

# 门禁（§6）
pnpm audit --audit-level=moderate && pnpm lint && pnpm format:check \
  && pnpm exec tsc --noEmit && pnpm test:run && pnpm build

# 链接完整性回归（#117 新增）
pnpm test:run tests/unit/internal-links.test.ts

# 部署与线上验收
pnpm deploy:worker
curl -sI https://huat-fsac.eu.org/ | grep -iE '^(HTTP|content-security-policy|cache-control)'
curl -s https://huat-fsac.eu.org/robots.txt                 # → Allow + Sitemap（#119）
curl -s https://huat-fsac.eu.org/sitemap-0.xml | grep -o '<loc>' | wc -l   # → 167

# CI 状态（对照 HEAD sha 判断主干健康，见坑 9）
git log --oneline -1
gh run list --workflow=ci-cd.yml --branch main --limit 5
gh run watch <runId> --exit-status --interval 20

# 本地 SSR 抽查（需 strip proxy）
env -u HTTP_PROXY -u HTTPS_PROXY -u http_proxy -u https_proxy \
  pnpm exec wrangler dev dist/server/entry.mjs --config dist/server/wrangler.json --port 8788
curl -s --noproxy '*' http://127.0.0.1:8788/robots.txt
```

---

## 七、与看板 / 前一棒的一致性

- `docs/WORKFLOW.md:§4` 任务表 T-001..T-038 全部已完成；本棒工作走 issue 线（#117/#118/#119/#120），`§7.4` 已逐轮追加日志。
- 上一棒 deepseek 的结论（#116 sitemap 167 条、`@assets` 扫描注意事项）经本棒线上实测复核，全部成立。
- 本棒无未完成事项、无未提交改动；LOCK 已删除。
