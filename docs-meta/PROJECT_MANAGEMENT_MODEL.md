# 项目管理模型（GitHub Projects）

本仓库采用 **GitHub Projects (v2)** 作为统一任务看板，Issue/PR 作为执行单元，标签作为轻量元数据。

## 1) 字段模型

项目看板需创建以下字段（建议类型）：

| 字段 | 类型 | 说明 |
|---|---|---|
| `Priority` | Single select | `P0 / P1 / P2 / P3` |
| `Status` | Single select | `Backlog / In Progress / Review / Done` |
| `Owner` | Assignee / Text | 责任人 |
| `ETA` | Date | 计划完成时间 |
| `Risk` | Single select | `Low / Medium / High / Blocker` |
| `Area` | Single select | `frontend / backend / docs / devops / quality / content` |
| `Sprint` | Single select / Text | 迭代标识（如 `2026W09`） |

## 2) 标签字典

为支持自动化映射，统一采用以下标签前缀：

- `priority:*`：`priority:p0` `priority:p1` `priority:p2` `priority:p3`
- `status:*`：`status:backlog` `status:in-progress` `status:review` `status:done`
- `risk:*`：`risk:low` `risk:medium` `risk:high` `risk:blocker`
- `area:*`：`area:frontend` `area:backend` `area:docs` `area:devops` `area:quality` `area:content`
- `type:*`：`type:task` `type:bug` `type:tech-debt` `type:retrospective` `type:improvement`

## 3) 状态流转规则

- 新建 Issue：默认 `status:backlog`
- Issue 被指派（assigned）：切换 `status:in-progress`
- 关联 PR 打开/进入评审：切换 `status:review`
- PR 合并或 Issue 关闭：切换 `status:done`

> 规则由 `.github/workflows/project-automation.yml` 自动执行，并保留完整事件轨迹。

## 4) 自动化配置（仓库变量）

工作流支持将 Issue 自动加入 Project，并同步 `Status` 字段。请在仓库 Variables 中配置：

- `PROJECT_V2_ID`
- `PROJECT_STATUS_FIELD_ID`
- `PROJECT_STATUS_BACKLOG_OPTION_ID`
- `PROJECT_STATUS_IN_PROGRESS_OPTION_ID`
- `PROJECT_STATUS_REVIEW_OPTION_ID`
- `PROJECT_STATUS_DONE_OPTION_ID`

若以上变量未配置，工作流会退化为”仅标签驱动”，不会阻断流程。

### 获取变量值的方法

1. 获取 `PROJECT_V2_ID`：

```bash
gh api graphql -f query='
  query($org: String!, $number: Int!) {
    organization(login: $org) {
      projectV2(number: $number) { id }
    }
  }' -f org=”HUAT-FSAC” -F number=1
```

> 如果项目挂在个人账号下，将 `organization` 替换为 `user`，`$org` 替换为用户名。

2. 获取 `PROJECT_STATUS_FIELD_ID` 和各 Option ID：

```bash
gh api graphql -f query='
  query($projectId: ID!) {
    node(id: $projectId) {
      ... on ProjectV2 {
        fields(first: 20) {
          nodes {
            ... on ProjectV2SingleSelectField {
              id
              name
              options { id name }
            }
          }
        }
      }
    }
  }' -f projectId=”<上一步获取的 PROJECT_V2_ID>”
```

在返回结果中找到 `name: “Status”` 的字段，其 `id` 即为 `PROJECT_STATUS_FIELD_ID`，`options` 数组中各选项的 `id` 对应：

| 选项名 | 变量名 |
|--------|--------|
| Backlog | `PROJECT_STATUS_BACKLOG_OPTION_ID` |
| In Progress | `PROJECT_STATUS_IN_PROGRESS_OPTION_ID` |
| Review | `PROJECT_STATUS_REVIEW_OPTION_ID` |
| Done | `PROJECT_STATUS_DONE_OPTION_ID` |

3. 在仓库中配置变量：

```bash
gh variable set PROJECT_V2_ID --body “<value>”
gh variable set PROJECT_STATUS_FIELD_ID --body “<value>”
gh variable set PROJECT_STATUS_BACKLOG_OPTION_ID --body “<value>”
gh variable set PROJECT_STATUS_IN_PROGRESS_OPTION_ID --body “<value>”
gh variable set PROJECT_STATUS_REVIEW_OPTION_ID --body “<value>”
gh variable set PROJECT_STATUS_DONE_OPTION_ID --body “<value>”
```

## 5) 运营建议

- 每周例会按 `Status` + `Priority` 双维度过板。
- `risk:high/blocker` 需在 24 小时内更新处理进展。
- `Done` 项目需确保 PR 链接和验证证据齐全，便于复盘追溯。
