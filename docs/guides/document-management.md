# 📖 文档管理指南

本指南说明如何在 Guidance-Astro 项目中管理和维护 Markdown 文档。

## 📁 文档结构概览

```
docs/
├── README.md                      # 仓库文档索引
├── DEPLOYMENT.md                  # 部署
├── VERSION_CONTROL_POLICY.md      # 分支与发布
├── adr/                           # 架构决策记录
├── guides/                        # 使用指南
│   ├── document-management.md     # 本文档
│   ├── COLLAB_NOTIFICATION_SETUP.md
│   └── PUSH_NOTIFICATION_SETUP.md
├── plans/                         # 功能计划
├── reports/                       # 技术报告
│   ├── README.md
│   ├── completion/
│   ├── implementation/
│   └── archive/
└── components/
```

站点对外发布的 MDX 在 `src/content/docs/`，不要写进本目录。

---

## 📝 文档规范

### 1. 文件命名规范

**推荐格式**:

- 技术报告: `[主题]_[类型]_REPORT.md`
- 指南文档: `[主题]-guide.md`
- 会议记录: `YYYY-MM-DD-meeting-[主题].md`

**示例**:

```
✅ 好的命名:
- API_INTEGRATION_REPORT.md
- deployment-guide.md
- 2026-01-10-meeting-sprint-planning.md

❌ 避免:
- 新建文档.md
- report1.md
- temp.md
```

### 2. YAML Front Matter

每个技术报告文件应包含 YAML 元数据：

```yaml
---
title: '报告标题'
type: 'completion-report | implementation-report | guide'
date: YYYY-MM-DD
status: draft | in-progress | completed | archived
tags:
    - tag1
    - tag2
priority: high | medium | low
author: 作者名称
related:
    - 相关文档1.md
    - 相关文档2.md
---
```

**字段说明**:

- `title`: 报告标题（必填）
- `type`: 文档类型（必填）
- `date`: 创建/完成日期（必填）
- `status`: 文档状态（必填）
- `tags`: 标签数组（可选）
- `priority`: 优先级（可选）
- `author`: 作者（可选）
- `related`: 相关文档（可选）

### 3. Markdown 格式规范

#### 标题层级

```markdown
# H1 - 文档标题（每个文档只有一个）

## H2 - 主要章节

### H3 - 子章节

#### H4 - 详细内容
```

#### 代码块

````markdown
```typescript
// 使用语言标识符以获得语法高亮
const example = '代码示例'
```
````

#### 表格

```markdown
| 列1   | 列2   | 列3   |
| ----- | ----- | ----- |
| 数据1 | 数据2 | 数据3 |
```

#### 文件链接

```markdown
- 绝对路径: [文件名](file:///d:/path/to/file.ts)
- 相对路径: [README](../README.md)
```

---

## 🔄 工作流程

### 创建新报告

1. **确定报告类型**
    - 完成报告: 任务验收、总结
    - 实施报告: 功能开发、技术实现

2. **选择存放位置**

    ```bash
    cd docs/reports
    # 完成报告
    cd completion/
    # 或实施报告
    cd implementation/
    ```

3. **创建文件**

    ```bash
    # 使用标准命名
    touch NEW_FEATURE_REPORT.md
    ```

4. **添加元数据和内容**
    - 添加 YAML Front Matter
    - 编写报告内容
    - 保存文件

5. **更新索引**
    - 编辑 `docs/reports/README.md`
    - 在对应表格中添加新行

### 归档旧文档

当文档不再活跃时：

1. **移动到归档目录**

    ```bash
    git mv docs/reports/implementation/OLD_REPORT.md docs/reports/archive/
    ```

2. **更新状态**

    ```yaml
    status: archived
    ```

3. **更新索引**
    - 从主索引表格中移除
    - 在归档说明中注明

---

## 🔍 查找文档

### VS Code 全局搜索

- 按关键词: `Ctrl+Shift+F`
- 按文件名: `Ctrl+P`
- 按标签: 搜索 `tags: [关键词]`

### 命令行搜索

```bash
# 搜索内容
rg "关键词" docs/ -t md

# 查找文件
fd "关键词" docs/ -e md

# 搜索标签
rg "tags:.*关键词" docs/ -t md
```

### 按元数据筛选

```bash
# 查找所有进行中的文档
rg "status: in-progress" docs/ -t md

# 查找特定日期的文档
rg "date: 2026-01" docs/ -t md

# 查找高优先级文档
rg "priority: high" docs/ -t md
```

---

## 🛠️ 实用工具

### VS Code 扩展推荐

1. **Markdown All in One**
    - 快捷键支持
    - 目录生成
    - 列表格式化

2. **Markdown Preview Enhanced**
    - 增强预览
    - 导出 PDF
    - 图表支持

3. **Front Matter CMS**
    - 元数据管理
    - 可视化编辑
    - 批量操作

4. **Foam**
    - 双向链接
    - 知识图谱
    - 反向引用

### 快捷脚本

创建 `docs/scripts/new-report.ps1`：

```powershell
param(
    [Parameter(Mandatory=$true)]
    [string]$Name,

    [ValidateSet("completion", "implementation")]
    [string]$Type = "implementation"
)

$date = Get-Date -Format "yyyy-MM-dd"
$path = "docs/reports/$Type/${Name}_REPORT.md"

$template = @"
---
title: "$Name"
type: "$Type-report"
date: $date
status: draft
tags:
  - tag1
---

# $Name

## 概述

## 详细内容

---

**创建日期**: $date
"@

Set-Content -Path $path -Value $template
Write-Host "✅ 已创建报告: $path"
```

使用方法：

```powershell
.\docs\scripts\new-report.ps1 -Name "API_INTEGRATION" -Type "implementation"
```

---

## 📊 维护清单

### 每周检查

- [ ] 整理草稿文档
- [ ] 更新索引文件
- [ ] 检查断链

### 每月维护

- [ ] 归档已完成的旧文档
- [ ] 更新元数据
- [ ] 优化文档结构

### 季度回顾

- [ ] 评估文档体系
- [ ] 清理冗余文档
- [ ] 更新管理流程

---

## 💡 最佳实践

1. **保持简洁**: 避免冗长的文档，优先使用列表和表格
2. **及时更新**: 完成任务后立即创建报告
3. **规范命名**: 使用统一的命名格式
4. **添加链接**: 关联相关文档，形成知识网络
5. **版本控制**: 使用 `git mv` 移动文件以保留历史
6. **定期维护**: 按照维护清单定期整理

---

**本指南版本**: 1.0  
**最后更新**: 2026-01-10  
**维护者**: HUAT FSAC Team
