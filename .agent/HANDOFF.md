# 交接说明（HANDOFF）

**本棒 Agent：** `muse-spark-20261002T133206Z`（第 34 轮，Execution Agent 规则）
**时间：** 2026-10-02T13:32Z 起（UTC；上一棒锁已删，本轮新建锁）
**仓库 / 分支：** `HUAT-FSAC/Guidance-Astro` ｜ 主干 `main@a789466`
**状态：** 验证轮——无 PLAN.md、唯一开放 #101 仍阻塞，无 ready 任务；主干 CI 全绿、线上 200、audit 0 漏洞；无代码改动，未用 auto-discovered 额度

> 下一棒请先按 `docs/WORKFLOW.md:§1/§3` 执行：
> `git fetch --all --prune` → `git pull --rebase` → 读 `.agent/STATE.md` + 本文件 + `.agent/ENV.md` → 检查 `.agent/LOCK` → 选任务（仅 ready、无 blocked、P0>P1>…、Milestone 优先、编号小优先；无可选则验证轮）。

---

## 一、本棒做了什么（第 34 轮：验证轮）

1. 环境确认：在仓内（`git rev-parse` ✅）、分支 main、树干净、`main@a789466` 与 origin 一致、无 PLAN.md。
2. 任务选择：唯一开放 #101，前置依赖（`CLOUDFLARE_API_TOKEN`）仍缺（secret 复查仅 CODECOV/PROJECT）→ 不可选；无其他 ready issue → 本轮无执行目标。
3. 健康验证（三查全绿）：main CI 最新 run 37009784096 success＋线上 `/` 200＋`pnpm audit --audit-level=moderate` 0 漏洞 → 无 auto-discovered issue 成立条件。
4. 未做：任何代码/PR/部署/评论（无事项）。

> 前棒摘要：第 33 轮（sidebar 12/12 验证）；第 32 轮（#120 删 toast→#163）；第 31 轮（#162 关闭）；第 30 轮（4-PR 合并 + 上线）。明细见 git 历史与 `docs/WORKFLOW.md:§7.4`（已 101 行）。

## 二、交棒时主干状态

- `main@a789466` CI 全绿；relay issue 全关（除 #101）。
- 开放 issue：仅 **#101**（blocked：人类配 Secret；配好前不加回 deploy job）。
- 开放 PR：无 relay PR；自动 PR 不碰。
- 线上 Version `73738007` 健康（200）。

## 三、下一棒要做（按优先级）

1. 若 `.agent/PLAN.md` 出现或有新 ready issue（无 blocked、依赖满足）：按 P0>P1>…、Milestone 优先、编号小优先认领，每轮一个 Issue；完成后**不擅自关单**，留执行结果评论等 Planner 确认（Execution Agent 规则变更：不再用 `Closes` 自动关）。
2. 若仍无可选：验证轮（三查）+ 计数；连续 5 轮无操作按旧例停手待命（当前 2/5）。
3. #101 Secret 配好后：按单把 deploy job 加回 `ci-cd.yml`（实现见 `8475f88`），验证后**留结果**（Planner 关单）。
4. 2 条 `astro check` hint 勿动。

## 四、阻塞项（需人类/Planner）

- **#101**：配 `CLOUDFLARE_API_TOKEN`（Actions Secrets）。
- 人类侧：`PROJECT_TOKEN`、`size:xs` label、`update-linked-issues` 去留。
- 部署走本机 `wrangler` OAuth；换机重跑 `wrangler login`（strip proxy）。

## 五、注意事项 / 坑（执行相关精简版，全量见 git 历史）

1. **部署前必 `git pull`**（第 30 轮）；进产物才 deploy + CSP 验收。
2. **sitemap 比对先 unquote**；计数只取 sitemap-0。
3. **gh label 名错整体失败**，建后回查；comment 反引号用 `--body-file`；jq 嵌套引号分步查。
4. **内容集合只有两个**（`docs` + `i18n`）； sidebar link 审法：解析 `link:` → 找文件。
5. **`pnpm` 不在裸 PATH**：同命令内 export；**commit 含 `pnpm audit`**（公告随时发布）。
6. **override 下限核对上游区间**（裸 `>=X` 放走 major）。
7. **关单规则已变**：Execution Agent 不关单、不写 `Closes`，留结果评论等 Planner（本轮起）。
8. **CRLF/token 比较；commitlint ≤100；时间戳 `date -u`；全量 `git grep`**。
9. **锁协议**：超 30min 可接管；正常结束删锁；锁不提交。

## 六、关键命令速查

```bash
git fetch --all --prune && git pull --rebase
cat .agent/STATE.md .agent/HANDOFF.md
mise exec -- pnpm audit --audit-level=moderate
gh issue list --state open --json number,title --jq '.[] | "#\(.number) \(.title)"'
export PATH="$HOME/.local/share/mise/installs/pnpm/11:$HOME/.local/share/mise/installs/node/22/bin:$PATH"
curl -s -o /dev/null -w "%{http_code}\n" https://huat-fsac.eu.org/
```

## 七、与看板 / 前一棒的一致性

- `docs/WORKFLOW.md:§4` T-001..T-038 全部已完成；现走 issue 线，`§7.4` 逐轮追加（本轮新增第 34 轮行）。
- 规则变更已在本页三/五.7 落字；更早见 git 历史。
