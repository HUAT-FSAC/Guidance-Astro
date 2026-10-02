# 交接说明（HANDOFF）

**本棒 Agent：** `muse-spark-20261002T121515Z`（第 32 轮）
**时间：** 2026-10-02T12:15Z 起（UTC；上一棒锁已删，本轮新建锁）
**仓库 / 分支：** `HUAT-FSAC/Guidance-Astro` ｜ 主干 `main@d6768b8`
**状态：** #120 按推荐方案 A（删）执行并合并关闭；#101 复核 secret 仍缺、维持阻塞；开放仅 #101；relay PR 为零；线上 Version `73738007` 健康；main CI 全绿 run 37006389469

> 下一棒请先按 `docs/WORKFLOW.md:§1/§3` 与 `AGENTS.md` 的「发布与部署」执行：
> `git fetch --all --prune` → `git pull --rebase` → 读 `.agent/STATE.md` + 本文件 → 检查 `.agent/LOCK` → 选任务。

---

## 一、本棒做了什么（第 32 轮）

用户指令"待人类两项按推荐来" → 分两路：

1. **#120（执行推荐方案 A：删）**：单内 A/B 中 A 为推荐（零引用 2 个月 + `share-controller` 独立实现已满足需求 + 曾耗一次维护轮转 `a47d534`；YAGNI）→ 开工前复核：全仓 `git grep utils/toast` 仍空 + 线上 200/200 健康 → 建分支 `refactor/utils/remove-toast-dead-code`，`git rm src/utils/toast.ts`（443 行）→ 本地 §6 全绿（lint 0 / format / tsc 0 / test 412/412 / build Complete；残留 grep 空）→ **PR #163**（CI 全绿：核心 5 项 + 3-run QualityGate + Preview）→ `--admin --squash` 合并 `d6768b8`，body `Closes` 自动关 #120（已核对）→ main run 37006389469 全绿。**删除无行为变化（tree-shaking 本就不打包它），无需部署。**
2. **#101（复核）**：`gh secret list` 仍仅 CODECOV/PROJECT，`CLOUDFLARE_API_TOKEN` 未配 → deploy job 加回继续阻塞（无人类之外可做动作）；线上 OAuth 路径抽查健康（`/` + `/docs-center/contributing/` 均 200）。维持开放，不滥发评论。

> 前棒摘要：第 31 轮（#162 rp 瞬时故障调查关闭）；第 30 轮（4-PR 合并 + 上线，坑：部署前必 pull）；第 28–29 轮（#158→#159；#160→#161）。明细见 git 历史与 `docs/WORKFLOW.md:§7.4`（已 99+ 行）。

## 二、交棒时主干状态

- `main@d6768b8` CI 全绿；relay issue 全关（除 #101）。
- 开放 issue：仅 **#101**（人类配 `CLOUDFLARE_API_TOKEN` Secret；配好前不加回 deploy job）。
- 开放 PR：无 relay PR；自动 PR（dependabot/release-please/metrics），**协议禁止自动 merge，不碰**。
- 线上 Version `73738007` 与 main 内容一致（其后仅记录 commit + 死代码删除，均不进产物）。

## 三、下一棒要做（按优先级）

1. **新候选（主动发现）**：显式链接面解析法可延伸到 nav/页脚/LanguageSwitcher/`LinkCard`；或开新审计维度。观察项已清空（`--max-warnings`/tsc-tests 预防性缺口留人类）。
2. 若 rp 同类 GraphQL 报错短期再现，回 #162 留证据（notify-failure 自动开单）。
3. #101 Secret 配好后按单把 deploy job 加回 `ci-cd.yml`（完整实现见 `8475f88`；`ACCOUNT_ID` 不需要）。
4. 复发套路：audit 类走五.10；漂移类全量 `git grep`；口径同步类全仓 grep 找漏网。2 条 `astro check` hint 勿动。

## 四、阻塞项（需人类操作）

- **#101**：`Settings → Secrets and variables → Actions` 配 `CLOUDFLARE_API_TOKEN`。
- 人类侧：`PROJECT_TOKEN`、`size:xs` label、`update-linked-issues` 去留。
- 部署走本机 `wrangler` OAuth；换机重跑 `wrangler login`（strip proxy）。

## 五、注意事项 / 坑

1. **⚠️ 部署前必须 `git pull`**（第 30 轮）：GitHub 端合并后本地即落后。规程：部署前必 pull + 确认目标文件 + lock 变动时 `pnpm install`；部署后 curl 抽查变更页。
2. **⚠️ gh issue `--label` 名错整体失败**：先 `gh label list`，建后回查。
3. **侧边栏/导航显式链接是审计盲区**（#158）：解析 `link:` → 在集合/页面找文件。
4. **内容集合只有两个**：`docs` + `i18n`；`src/content/` 下其他目录是死文件。
5. **部署判据**：进产物才 deploy + CSP 验收；记录/注释/死代码删除不部署。
6. **双远程**：`origin` 权威；`huat-fsac-docs` 旧名一律过期。
7. **⚠️ `pnpm` 不在裸 PATH**：同命令内 export（跨调用不继承）。
8. **关 issue 双保险**：subject 关键字 + body `Closes`；合并后核对。
9. **`gh run list` 幽灵行**：交叉核对 `headSha`。
10. **override 下限核对上游区间**（裸 `>=X` 放走 major；#160）；**本地门禁含 `pnpm audit`**；公告期叠基转绿。
11. **comment 反引号用 `--body-file`**；jq 嵌套引号分步查。
12. **CRLF 噪声**：token 级比较；"modified since read" 先重读。
13. **prettier 破损表格去对齐**：别 `--no-verify`。
14. **WSL2 + LHCI**：PATH 加 Windows 段 + `CHROME_PATH`；清字面量目录。
15. **commitlint** 每行 ≤100；别 `--no-verify`。
16. **时间戳 `date -u`**。
17. **孤儿判定找构造点**；删前 0 引用 + 产物验证。
18. **全量 `git grep`**，别 `--include`。
19. **外链先分类**再建单。
20. **三元组审计**（#148）；labeler 默认 OR；门禁审覆盖面 + 反向注入；命令实跑；`file:line` 内容核验；集合差先分类；修后复查同段。
21. **全绿 ≠ 无害**：重命名前确认引用。
22. **锁协议**：超 30min 可接管；正常结束删锁；锁不提交。

## 六、关键命令速查

```bash
git fetch --all --prune && git pull --rebase
cat .agent/STATE.md .agent/HANDOFF.md
mise exec -- pnpm lint && mise exec -- pnpm format:check
mise exec -- pnpm exec tsc --noEmit && mise exec -- pnpm test:run
mise exec -- pnpm build && mise exec -- pnpm audit --audit-level=moderate
export PATH="$HOME/.local/share/mise/installs/pnpm/11:$HOME/.local/share/mise/installs/node/22/bin:$PATH"
gh pr list --state open --json number,title,headRefName --jq '.[] | "#\(.number) \(.title)"'
mise exec -- pnpm deploy:worker   # 先 git pull，见坑 1
curl -sI https://huat-fsac.eu.org/ | grep -iE '^(HTTP|content-security-policy)'
```

## 七、与看板 / 前一棒的一致性

- `docs/WORKFLOW.md:§4` T-001..T-038 全部已完成；现走 issue 线，`§7.4` 逐轮追加（本轮新增第 32 轮行）。
- 前棒结论与坑位已并入第五节；更早见 git 历史。
- 免 review 自主推进长期生效：新 PR 仍需 CI 全绿才可合并；自动 PR 不碰。
