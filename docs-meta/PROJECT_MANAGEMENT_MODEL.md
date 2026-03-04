# GitHub Projects 管理模型

> 本文档定义 HUAT FSAC 项目管理的标准流程和字段规范

---

## 项目看板结构

我们使用 GitHub Projects v2 作为任务跟踪系统，看板 URL:
`https://github.com/orgs/HUAT-FSAC/projects/1`

### 视图配置

1. **Board View (默认)** - 按状态分栏的看板视图
2. **Table View** - 表格视图，便于批量编辑
3. **Roadmap View** - 时间线视图，按里程碑展示

---

## 字段定义

### 标准字段

| 字段名     | 类型          | 可选值                                                  | 说明         |
| ---------- | ------------- | ------------------------------------------------------- | ------------ |
| `Title`    | Text          | -                                                       | 任务标题     |
| `Status`   | Single select | Backlog / Ready / In Progress / Review / Blocked / Done | 任务状态     |
| `Priority` | Single select | P0 / P1 / P2 / P3                                       | 优先级       |
| `Area`     | Single select | Frontend / Backend / Docs / DevOps / Quality / Content  | 领域分类     |
| `Owner`    | Text          | -                                                       | 负责人       |
| `ETA`      | Date          | -                                                       | 预计完成日期 |
| `Risk`     | Single select | Low / Medium / High / Blocker                           | 风险等级     |
| `Sprint`   | Text          | 如: 2026W10                                             | 所属迭代     |

### 标签体系

所有标签遵循 `category:value` 格式：

```
# 优先级
priority:p0    # 紧急 - 立即处理
priority:p1    # 高 - 本周完成
priority:p2    # 中 - 两周内完成
priority:p3    # 低 - 有空时处理

# 状态
status:backlog      # 待办
status:ready        # 就绪，可开始
status:in-progress  # 进行中
status:review       # 审核中
status:blocked      # 阻塞
status:done         # 已完成

# 领域
area:frontend   # 前端
area:backend    # 后端
area:docs       # 文档
area:devops     # 运维/DevOps
area:quality    # 质量/测试
area:content    # 内容运营

# 风险
risk:low        # 低风险
risk:medium     # 中等风险
risk:high       # 高风险
risk:blocker    # 阻塞性风险

# 类型
type:task       # 任务
type:bug        # Bug
type:feature    # 功能
type:debt       # 技术债
type:retro      # 复盘/改进
```

---

## 工作流自动化

### 自动触发规则

1. **新 Issue 自动入盘**
    - 触发: Issue 被创建
    - 动作: 自动添加到 Projects，状态设为 Backlog

2. **PR 关联自动更新**
    - 触发: PR 描述包含 `Closes #xxx`
    - 动作: 关联 Issue 状态自动改为 Review

3. **PR 合并自动关闭**
    - 触发: PR 被合并
    - 动作: 关联 Issue 自动关闭，状态改为 Done

4. **里程碑到期提醒**
    - 触发: 每天上午 9 点
    - 动作: 检查 3 天内到期的里程碑，发送提醒

---

## 状态流转规则

```
Backlog → Ready → In Progress → Review → Done
   ↑          ↓        ↓           ↓
   └──────────┴────────┴──── Blocked
```

### 流转条件

| 从状态      | 到状态      | 条件                     |
| ----------- | ----------- | ------------------------ |
| Backlog     | Ready       | 已分配 Owner，有明确 ETA |
| Ready       | In Progress | 负责人开始工作           |
| In Progress | Review      | 代码/文档已提交 PR       |
| Review      | Done        | PR 已合并，验证通过      |
| Any         | Blocked     | 遇到阻塞问题，需标注原因 |
| Blocked     | In Progress | 阻塞已解决               |

---

## 周会流程

### 会前准备 (每周五)

1. 项目经理检查所有 In Progress 任务进度
2. 标记 Blocked 任务，准备讨论方案
3. 更新本周完成的 Done 任务

### 会议议程

1. **燃尽回顾** (5分钟)
    - 上周完成量 vs 计划量
    - 查看项目进度看板

2. **阻塞问题** (10分钟)
    - Blocked 状态任务讨论
    - 资源协调与重新分配

3. **本周计划** (10分钟)
    - Ready → In Progress 的任务
    - 新进入 Backlog 的高优先级任务

4. **质量指标** (5分钟)
    - CI 通过率趋势
    - 未解决的 Lint/Type 错误

---

## 模板使用指南

### 创建新任务

1. 点击 "New Issue"
2. 选择 "任务卡" 模板
3. 填写必填字段:
    - 标题: `[Task] <模块>: <简要描述>`
    - Priority: 根据紧急程度选择
    - Area: 选择对应领域
    - ETA: 预计完成日期
4. 提交后自动进入 Projects Backlog

### 创建 PR

1. 分支命名: `type/area/description`
    - 例: `feat/backend/auth-login`
2. 使用 PR 模板填写完整信息
3. 必须包含验证证据 (lint/typecheck/test/build)
4. 关联 Issue: `Closes #xxx`

---

## 报告与度量

### 周度指标

- **Lead Time**: Issue 创建到关闭的平均时间
- **Cycle Time**: In Progress 到 Done 的平均时间
- **WIP 数量**: 同时进行的任务数 (建议 ≤5)
- **完成率**: 本周计划完成数 / 实际完成数

### 质量指标

- **CI 通过率**: 最近 7 天构建成功率
- **PR Review Time**: PR 提交到合并的平均时间
- **Bug 逃逸率**: 生产环境发现的 Bug 数

---

## 相关链接

- [项目进度看板](/docs-center/运营与协作/项目进度看板/)
- [CI/CD 流程](../.github/workflows/ci-cd.yml)
- [自动化工作流](../.github/workflows/project-automation.yml)
