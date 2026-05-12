## 概述

- **变更摘要**：
- **业务价值**：
- **风险说明**：

## Projects 字段映射（与 Issue 对齐）

- **Priority**: `priority:p0 | priority:p1 | priority:p2 | priority:p3`
- **Status**: `status:review`（PR 阶段）
- **Owner**:
- **ETA**: `YYYY-MM-DD`
- **Risk**: `risk:low | risk:medium | risk:high | risk:blocker`
- **Area**: `area:frontend | area:backend | area:docs | area:devops | area:quality | area:content`
- **Sprint**: `2026Wxx`

## 关联 Issue

- Closes #
- Related #

## 变更类型

- [ ] 🐛 Bug 修复
- [ ] ✨ 新功能
- [ ] 📝 文档更新
- [ ] ⚡ 性能优化
- [ ] ♻️ 重构
- [ ] 🔧 工程/配置变更

## 验证证据（必填）

请粘贴关键日志摘要或截图链接，至少覆盖 `lint/typecheck/test/build`。

- **Lint** (`pnpm lint`):
    - 结果：
    - 证据：
- **TypeCheck** (`pnpm exec tsc --noEmit`):
    - 结果：
    - 证据：
- **Test** (`pnpm test:run` 或相关测试命令):
    - 结果：
    - 证据：
- **Build** (`pnpm build`):
    - 结果：
    - 证据：

## 影响范围

- [ ] `src/components`
- [ ] `src/content`
- [ ] `docs-meta`
- [ ] `.github/workflows`
- [ ] 其他：

## 检查清单

- [ ] 我已提供可追溯验证证据（日志/截图/链接）
- [ ] 我已更新相关文档与模板（如适用）
- [ ] 我确认无敏感信息泄露（token/密钥/内部地址）
- [ ] 我的提交信息遵循 Conventional Commits
