# 交接说明（HANDOFF）

**本棒 Agent：** `muse-spark-20261002T120405Z`（第 31 轮）
**时间：** 2026-10-02T12:04Z 起（UTC；上一棒锁已按协议删除，本轮新建锁）
**仓库 / 分支：** `HUAT-FSAC/Guidance-Astro` ｜ 主干 `main@3dbbf82`
**状态：** 验证轮——#162（rp 失败告警）调查为 GitHub 瞬时故障，已诊断关闭，无代码改动；开放仅 #101、#120；开放 relay PR 为零；线上 Version `73738007` 健康；main CI 全绿

> 下一棒请先按 `docs/WORKFLOW.md:§1/§3` 与 `AGENTS.md` 的「发布与部署」执行：
> `git fetch --all --prune` → `git pull --rebase` → 读 `.agent/STATE.md` + 本文件 → 检查 `.agent/LOCK` → 选任务。

---

## 一、本棒做了什么（第 31 轮：验证轮，无缺陷）

例行同步（main@3dbbf82 与 origin 一致、无可认领：#101/#120 仍阻塞、relay PR 已清零）→ 发现新告警 **#162**（notify-failure 自动开单：release-please 在 `bd30e3f` push 的 run 36999853682 失败）→ 读失败日志：`release-please-action@v5` 在 Fetching merge commits 阶段收到 GitHub GraphQL 内部错误（`Something went wrong while executing your query ... 73C0:8309B...`）→ 定性：API 侧瞬时故障，非权限（组织闸开着）、非配置（同 workflow 同 token 相邻 run 全绿：前 `795d89d` success，后 `4e8c362`/`0437947`/`3dbbf82` 连续 success）→ #96 在失败后被后续成功 run 正常更新（11:16:51Z），管线推进无影响（rp 无状态增量，单次失败零残留）→ 中文诊断评论后关闭 #162。**无代码改动，无需部署。**

> 前棒摘要：第 30 轮（4-PR 合并马拉松 part 2 + 上线，坑 23 部署前必 pull）；glm棒第 28–29 轮（#158→PR #159；#160→PR #161）；muse-spark 第 21–27 轮；mimo-flash 第 1–20 轮。明细见 git 历史与 `docs/WORKFLOW.md:§7.4`（已 98+ 行）。

## 二、交棒时主干状态

- `main@3dbbf82` CI 全绿；relay issue 全关（#121…#162 中除 #101/#120 外）。
- 开放 issue：**#101**（人类配 `CLOUDFLARE_API_TOKEN` Secret）、**#120**（toast.ts 删留 question）。
- 开放 PR：无 relay PR；#96/#97/#106~#114 自动 PR（dependabot/release-please/metrics），**协议禁止自动 merge，不碰**。
- 线上已追平 main（Version `73738007`，contributing 200 + CSP nonce ✅）。

## 三、下一棒要做（按优先级）

1. **新候选（主动发现）**：第 28 轮「sidebar 显式 link ↔ 集合树」解析法可延伸到其余显式链接面（nav/页脚/LanguageSwitcher/`LinkCard`）；或开新审计维度。其余观察项已清空（`--max-warnings`/tsc-tests 预防性缺口留人类）。
2. 若 rp 同类 GraphQL 报错短期内再现，回 #162 留证据（notify-failure 会自动开单，无需主动巡检）。
3. #120 被人类裁决后按单内验收执行；#101 Secret 配好后按单把 deploy job 加回 `ci-cd.yml`（完整实现见 `8475f88`）。
4. 复发套路：audit 类走五.10；文档漂移类全量 `git grep`；口径同步类改完三处权威文档后全仓 grep 找漏网。剩余 2 条 `astro check` hint（`BilibiliVideo.astro:13`、`share.ts:109`）勿动。

## 四、阻塞项（需人类操作）

- **#101**：GitHub `Settings → Secrets and variables → Actions` 配 `CLOUDFLARE_API_TOKEN`（`CLOUDFLARE_ACCOUNT_ID` 不需要）。
- **#120**：toast.ts 删留二选一。
- 人类侧：`PROJECT_TOKEN`、`size:xs` label、`update-linked-issues` 去留。
- 线上部署走本机 `wrangler` OAuth（`pnpm deploy:worker`）；登录态只在当前机器 profile，换机需重跑 `wrangler login`（strip 本地 proxy）。

## 五、注意事项 / 坑

1. **⚠️ 部署前必须 `git pull` 到落 main 后的最新主干（第 30 轮）**：凡经 GitHub 端合并落 main，本地即落后——此时 deploy 会构建旧树。规程：部署前必 `git pull` + 确认目标文件在位 + `pnpm install`（lock 变动时）；部署后 curl 抽查本次变更页。
2. **⚠️ gh issue create 的 `--label` 名错会整体失败**：真实名如 `priority:p2`；建单后回查编号；先 `gh label list`。
3. **⚠️ 侧边栏/导航显式链接是链接审计盲区**（#158）：sitemap 只含已构建页面。审法：解析 `link:` → 在 `src/content/docs/`+`src/pages/` 找对应文件。
4. **内容集合只有两个**：`docs`（`src/content/docs/**`）+ `i18n`；`src/content/` 下其他目录是死文件。
5. **部署判据**：影响线上产物才 `pnpm deploy:worker` + CSP 验收；纯记录/workflow 注释不部署。
6. **双远程**：`origin` 权威；`wsyhuat` fork 不当上游。`huat-fsac-docs` 旧名一律过期。
7. **⚠️ `pnpm` 不在裸 PATH**：`mise exec -- pnpm ...`；提交前同命令内 export（跨调用不继承）。
8. **commit subject 关 issue**：`fix:/docs:/chore: #N` + body `Closes #N` 双保险；合并后核对。
9. **`gh run list` 幽灵行**：交叉核对 `headSha`/`workflowName`。
10. **依赖 override 时效性（高频复发）**：`pnpm why` → 提下限 → `pnpm install` → 复验；下限须核对上游声明区间（裸 `>=X` 放走 major，写 `">=X <Y.0.0"`）。**本地门禁含 `pnpm audit`**；公告期 PR 集体转红——叠基转绿并固化合并顺序。
11. **gh comment 带反引号一律 `--body-file`**；jq 嵌套引号易炸，分步查（本轮连炸两次）。
12. **CRLF 噪声伪造 diff**：token 级比较；Edit "modified since read" 先重读。
13. **prettier 破损表格整表去对齐**：别 `--no-verify`。
14. **⚠️ WSL2 + LHCI**：PATH 加 Windows 段 + `CHROME_PATH`；清理字面量目录。CI 无此问题。
15. **commitlint** 每行 ≤100 字符；别 `--no-verify`。
16. **时间戳 `date -u`**（出过 `2026-09-31`）。
17. **资源「孤儿」判定**：找构造点；删前 0 引用 + 产物验证；大文件 md5（#128）。
18. **全量扫描用 `git grep`**，别 `--include`。
19. **外链 404 先分类**再建单。
20. **workflow 三元组审计**（#148）；labeler 默认 OR（#146）；门禁审覆盖面 + 反向注入（#140）；命令一律实跑（#134/#138）；`file:line` 内容级核验（#136）；集合差先分类（#20）；修后复查同段（#144）。
21. **全绿 ≠ 无害**：重命名前确认引用（第 16 轮）。
22. **锁协议**：超 30min 可接管（注明）；正常结束删锁；锁不提交。

## 六、关键命令速查

```bash
# 同步与状态
git fetch --all --prune && git pull --rebase
cat .agent/STATE.md .agent/HANDOFF.md

# 本机门禁（mise 环境，见坑 7；含 audit）
mise exec -- pnpm lint && mise exec -- pnpm format:check
mise exec -- pnpm exec tsc --noEmit && mise exec -- pnpm test:run
mise exec -- pnpm build && mise exec -- pnpm quality:bundle && mise exec -- pnpm quality:theme
mise exec -- pnpm quality:routes && mise exec -- pnpm test:e2e
mise exec -- pnpm audit --audit-level=moderate

# 提交（同命令内 export）
export PATH="$HOME/.local/share/mise/installs/pnpm/11:$HOME/.local/share/mise/installs/node/22/bin:$PATH"

# PR / CI
gh pr list --state open --json number,title,headRefName --jq '.[] | "#\(.number) \(.title)"'
gh run list --workflow=ci-cd.yml --branch main --limit 5 --json headSha,status,conclusion

# 部署与验收（先 git pull，见坑 1）
mise exec -- pnpm deploy:worker
curl -sI https://huat-fsac.eu.org/ | grep -iE '^(HTTP|content-security-policy)'
```

## 七、与看板 / 前一棒的一致性

- `docs/WORKFLOW.md:§4` T-001..T-038 全部已完成；现走 issue 线，`§7.4` 逐轮追加日志行（本轮新增第 31 轮行）。
- 前棒结论与坑位已并入第五节；更早见 git 历史。
- 免 review 自主推进长期生效：新 PR 仍需 CI 全绿才可合并；自动 PR 不碰。
