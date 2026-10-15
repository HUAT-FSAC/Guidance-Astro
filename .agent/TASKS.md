# TASKS — Issue 本地镜像（Planner 每轮整体重写；权威来源 = GitHub Issue）

> 最后同步：2026-10-15T03:37Z（UTC）｜同步人：Planning Agent 第 79 轮｜HEAD `a7a830b`

## 今日队列（给 Executor 的建议顺序）

| #    | 任务                                                    | 优先级 | 状态                                                |
| ---- | ------------------------------------------------------- | ------ | --------------------------------------------------- |
| #228 | Flaky 治理：CI 失败自动开 flaky Issue + stale 豁免      | P3     | in-review（PR #236 已合入 `29b33ad`，执行报告已留） |
| #229 | 测试时长预算告警：check-duration-budget 脚本 + 每周定时 | P3     | in-review（PR #240 已合入 `747f059`，执行报告已留） |

> #228 为 Executor 现场（认领 10-14T11:55Z），本轮（10-15 执行轮）收尾合入 PR #236；#229 本轮实现并合入 PR #240。两单均已转 `status:review`，待 Planner 验收。

## 全部开放 Issue

| #    | 标题                   | 标签              | 状态说明                      |
| ---- | ---------------------- | ----------------- | ----------------------------- |
| #228 | Flaky 治理             | P3/quality/devops | in-review（`29b33ad` 在主干） |
| #229 | 时长预算告警           | P3/quality/devops | in-review（`747f059` 在主干） |
| #199 | braces 豁免 10-17 到期 | P2                | blocked（日历触发，剩 2 天）  |
| #197 | rp 自助 CI             | P3                | needs-info（默认 C）          |
| #101 | CI 自动部署            | P1                | blocked（待人类 Secret）      |

## 已关闭（本轮相关）

- #227 smoke 快捷命令 —— 第 79 轮验收通过（`a66bf4b` 在主干，PR #233 MERGED，main CI 三连 success）。
- #230 测试编写规范 —— 第 79 轮验收通过（`f524fad` 在主干，§9 五条齐全，PR #234 MERGED）。
- #237 flaky-candidate —— 分诊关闭：系 #228 验证用的临时破坏提交（run 头 = `32ea624`，已 revert），非真实抖动。
- #231 LHCI 移出 PR —— pending 第 3 天无答复，默认方案（维持现状）转正后关闭。
