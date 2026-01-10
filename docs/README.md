# 📚 文档中心

欢迎来到 HUAT FSAC Guidance-Astro 项目的文档中心。

## 📁 文档结构

### [技术报告](./reports/)

存放项目开发过程中的各类技术报告，包括：

- **[完成报告](./reports/completion/)** - 任务完成总结
- **[实施报告](./reports/implementation/)** - 功能实施详情
- **[历史归档](./reports/archive/)** - 历史文档存档

### [使用指南](./guides/)

项目文档管理和维护指南。

---

## 🔗 快速链接

### 完成报告
- [TODOLIST 完成总结](./reports/completion/COMPLETION_SUMMARY.md)
- [任务完成汇总](./reports/completion/TASK_COMPLETION_SUMMARY.md)

### 实施报告
- [组件初始化防护](./reports/implementation/COMPONENT_INITIALIZATION_REPORT.md)
- [数据重构](./reports/implementation/DATA_REFACTORING_REPORT.md)
- [错误处理](./reports/implementation/ERROR_HANDLING_REPORT.md)
- [图片优化](./reports/implementation/IMAGE_OPTIMIZATION_REPORT.md)
- [Lint 配置](./reports/implementation/LINT_CONFIG_REPORT.md)
- [新功能修复](./reports/implementation/NEW_FIXES_REPORT.md)
- [性能优化](./reports/implementation/PERFORMANCE_OPTIMIZATION_REPORT.md)

---

## 📝 文档规范

所有新增的技术报告应包含以下 YAML Front Matter：

```yaml
---
title: "报告标题"
type: "completion-report | implementation-report"
date: YYYY-MM-DD
status: draft | in-progress | completed
tags:
  - tag1
  - tag2
related:
  - 相关文档.md
---
```

---

## 🔍 查找文档

- **按类型查找**：浏览 `reports/` 下的分类文件夹
- **全局搜索**：使用 VS Code 的全局搜索 (Ctrl+Shift+F)
- **标签搜索**：在文档中搜索 `tags:` 字段

---

**最后更新**: 2026-01-10
