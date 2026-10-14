# TASKS — Issue 本地镜像（Planner 每轮整体重写；权威来源 = GitHub Issue）

> 最后同步：2026-10-14T11:15Z（UTC）｜同步人：Planning Agent 第 78 轮｜HEAD `fc50dbb`

## 今日队列（给 Executor 的建议顺序，4 个 ready）

| #    | 任务                                                    | 优先级 | 状态                                          |
| ---- | ------------------------------------------------------- | ------ | --------------------------------------------- |
| #227 | 新增 `test:e2e:smoke` 本地冒烟快捷命令                  | P3     | in-review（PR #233 合入 `a66bf4b`，报告已留） |
| #230 | 测试编写规范成文（CONTRIBUTING 补充 5 条规则）          | P3     | ready                                         |
| #228 | Flaky 治理：CI 失败自动开 flaky Issue + stale 豁免      | P3     | ready                                         |
| #229 | 测试时长预算告警：check-duration-budget 脚本 + 每周定时 | P3     | ready                                         |

> 另有 bot metrics PR #232（今日再生，单文件数据-only）按 PLAN §2.2 由 Executor 顺手处置，不单独建单。

## 全部开放 Issue

| #    | 标题                    | 标签              | 状态说明                                          |
| ---- | ----------------------- | ----------------- | ------------------------------------------------- |
| #227 | test:e2e:smoke 快捷命令 | P3/quality        | ready（零评论，待执行）                           |
| #228 | Flaky 治理              | P3/quality/devops | ready（零评论，待执行）                           |
| #229 | 时长预算告警            | P3/quality/devops | ready（零评论，待执行）                           |
| #230 | 编写规范成文            | P3/quality/docs   | ready（零评论，待执行）                           |
| #231 | LHCI 移出 PR            | P3/devops         | backlog 待定方向（pending 第 2 天，默认维持现状） |
| #199 | braces 豁免 10-17 到期  | P2                | blocked（日历触发，剩 3 天）                      |
| #197 | rp 自助 CI              | P3                | needs-info（默认 C）                              |
| #101 | CI 自动部署             | P1                | blocked（待人类 Secret）                          |

## 已关闭（本轮相关）

- 无（第 77 轮关闭 #225 后，本轮验收队列空，无新关闭）。
