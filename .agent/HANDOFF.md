# 交接说明（HANDOFF）

**本棒 Agent：** `muse-spark-20261002T125315Z`（第 33 轮）
**时间：** 2026-10-02T12:53Z 起（UTC；上一棒锁已删，本轮新建锁）
**仓库 / 分支：** `HUAT-FSAC/Guidance-Astro` ｜ 主干 `main@d731fad`
**状态：** 验证轮——显式导航面延伸复审零缺陷（sidebar 12/12 link 在位）；开放仅 #101；relay PR 为零；线上 Version `73738007` 健康；main CI 全绿

> 下一棒请先按 `docs/WORKFLOW.md:§1/§3` 与 `AGENTS.md` 的「发布与部署」执行：
> `git fetch --all --prune` → `git pull --rebase` → 读 `.agent/STATE.md` + 本文件 → 检查 `.agent/LOCK` → 选任务。

---

## 一、本棒做了什么（第 33 轮：验证轮，无缺陷）

例行同步无可认领 → 承 #158/第 28 轮建议复审其余显式导航面：Header 仅外部链接、无自定义 Footer（Starlight 默认）、sidebar 无 /en/ 项、内容内链已有回归测试覆盖 → fresh main 构建 + sitemap 比对：sidebar 12 个 `link:` **12/12 在位**（含 #159 修好的 contributing）；autogenerate 构建全绿；sitemap-0 恰 168 页（与 #159 的 167→168 吻合）。零缺陷，不建单。**教训**：sitemap `<loc>` 是 percent-encoded，CJK 路由比对必须 unquote（首轮 6 条假阳性）；计数剔除 sitemap-index 自身 loc。

> 前棒摘要：第 32 轮（#120 删 toast→#163）；第 31 轮（#162 瞬时故障关闭）；第 30 轮（4-PR 合并 + 上线）。明细见 git 历史与 `docs/WORKFLOW.md:§7.4`（已 100+ 行）。

## 二、交棒时主干状态

- `main@d731fad` CI 全绿；relay issue 全关（除 #101）。
- 开放 issue：仅 **#101**（人类配 `CLOUDFLARE_API_TOKEN` Secret；配好前不加回 deploy job）。
- 开放 PR：无 relay PR；自动 PR 不碰。
- 线上 Version `73738007` 与 main 一致。

## 三、下一棒要做（按优先级）

1. **新候选（主动发现）**：开新审计维度（显式链接面已清：sidebar 12/12 + Header/Footer 无内链 + 内容内链有回归测试）。观察项已清空（`--max-warnings`/tsc-tests 留人类）。
2. 若 rp 同类 GraphQL 报错再现，回 #162 留证据。
3. #101 Secret 配好后加回 deploy job（实现见 `8475f88`；`ACCOUNT_ID` 不需要）。
4. 复发套路：audit 走五.10；漂移全量 `git grep`；2 条 `astro check` hint 勿动。

## 四、阻塞项（需人类操作）

- **#101**：`Settings → Secrets and variables → Actions` 配 `CLOUDFLARE_API_TOKEN`。
- 人类侧：`PROJECT_TOKEN`、`size:xs` label、`update-linked-issues` 去留。
- 部署走本机 `wrangler` OAuth；换机重跑 `wrangler login`（strip proxy）。

## 五、注意事项 / 坑

1. **⚠️ 部署前必须 `git pull`**（第 30 轮）：GitHub 端合并后本地即落后。规程：pull + 确认文件 + lock 变动则 install；部署后 curl 抽查。
2. **⚠️ sitemap 比对先 unquote**（第 33 轮）：`<loc>` percent-encoded，CJK 直接比对假阳性；计数只取 sitemap-0（剔除 index 自身 loc）。
3. **⚠️ gh issue `--label` 名错整体失败**：先 `gh label list`，建后回查。
4. **侧边栏/导航显式链接是审计盲区**（#158，已清：sidebar 12/12 在位）：解析 `link:` → 集合/页面找文件。
5. **内容集合只有两个**：`docs` + `i18n`。
6. **部署判据**：进产物才 deploy + CSP 验收；记录/注释/死代码删除不部署。
7. **双远程**：`origin` 权威；`huat-fsac-docs` 旧名过期。
8. **⚠️ `pnpm` 不在裸 PATH**：同命令内 export。
9. **关 issue 双保险** + 合并后核对。
10. **override 下限核对上游区间**；**本地门禁含 `pnpm audit`**；公告期叠基转绿。
11. **comment 反引号用 `--body-file`**；jq 嵌套引号分步查。
12. **CRLF 噪声**：token 级比较；"modified since read" 先重读。
13. **prettier 破损表格去对齐**：别 `--no-verify`。
14. **WSL2 + LHCI**：PATH 加 Windows 段 + `CHROME_PATH`；清字面量目录。
15. **commitlint** 每行 ≤100；别 `--no-verify`。
16. **时间戳 `date -u`**。
17. **孤儿判定找构造点**；删前 0 引用 + 产物验证。
18. **全量 `git grep`**，别 `--include`。
19. **外链先分类**再建单。
20. **三元组审计**；labeler 默认 OR；门禁审覆盖面 + 反向注入；命令实跑；`file:line` 内容核验；集合差先分类；修后复查同段。
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

- `docs/WORKFLOW.md:§4` T-001..T-038 全部已完成；现走 issue 线，`§7.4` 逐轮追加（本轮新增第 33 轮行）。
- 前棒结论与坑位已并入第五节；更早见 git 历史。
- 免 review 自主推进长期生效：新 PR 仍需 CI 全绿才可合并；自动 PR 不碰。
