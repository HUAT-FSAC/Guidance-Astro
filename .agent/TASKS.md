# TASKS — Issue 本地镜像（Planner 每轮整体重写；权威来源 = GitHub Issue）

> 最后同步：2026-10-13T14:30Z（UTC）｜同步人：Planning Agent 第 77 轮｜HEAD `e7faa76`

## 今日队列（给 Executor 的建议顺序，4 个 ready）

| #    | 任务                                                    | 优先级 | 状态  |
| ---- | ------------------------------------------------------- | ------ | ----- |
| #227 | 新增 `test:e2e:smoke` 本地冒烟快捷命令                  | P3     | ready |
| #228 | Flaky 治理：CI 失败自动开 flaky Issue + stale 豁免      | P3     | ready |
| #229 | 测试时长预算告警：check-duration-budget 脚本 + 每周定时 | P3     | ready |
| #230 | 测试编写规范成文（CONTRIBUTING 补充 5 条规则）          | P3     | ready |

## 全部开放 Issue

| #    | 标题                    | 标签              | 状态说明                             |
| ---- | ----------------------- | ----------------- | ------------------------------------ |
| #227 | test:e2e:smoke 快捷命令 | P3/quality        | ready（#225 拆分）                   |
| #228 | Flaky 治理              | P3/quality/devops | ready（#225 拆分；`flaky` 标签已建） |
| #229 | 时长预算告警            | P3/quality/devops | ready（#225 拆分）                   |
| #230 | 编写规范成文            | P3/quality/docs   | ready（#225 拆分）                   |
| #231 | LHCI 移出 PR            | P3/devops         | backlog 待定方向（默认维持现状）     |
| #199 | braces 豁免 10-17 到期  | P2                | blocked（日历触发，剩 4 天）         |
| #197 | rp 自助 CI              | P3                | needs-info（默认 C）                 |
| #101 | CI 自动部署             | P1                | blocked（待人类 Secret）             |

## 已关闭（本轮相关）

- #225：伞单，拆分为 #227–#231 后关闭。
- #226：bot metrics PR（非 Issue，直接合入 `c9dad3e`）。
