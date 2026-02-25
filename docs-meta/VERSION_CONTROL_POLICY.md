# 版本控制与分支策略

本文档定义仓库的分支模型、评审门禁与发布规范，确保主干稳定可发布。

## 1) 分支模型

- `main`：生产主干，仅接受通过 PR 合并的变更。
- `develop`：集成分支，用于预发布验证与阶段联调。
- `feature/*`：功能开发分支。
- `fix/*`：缺陷修复分支。
- `chore/*`：工程与脚手架调整分支。

## 2) 主干保护策略（main）

建议在 GitHub Branch Protection 中配置：

- 禁止直接推送到 `main`。
- 必须通过 Pull Request 合并。
- 至少 `1` 名评审通过（关键改动建议 `2` 名）。
- 必须通过 Required checks（按工作流演进维护）：
  - `Lint and Format`
  - `Type Check`
  - `Tests`
  - `Build`
  - `Quality Gate (E2E/LHCI/Budget)`
  - `Preview Build`

## 3) CODEOWNERS 审阅策略

- 关键目录由 `.github/CODEOWNERS` 指定责任人。
- 命中 `CODEOWNERS` 的文件改动会自动请求对应评审。
- 未获得对应评审通过，不应合并。

## 4) 提交与 PR 规范

- 提交信息遵循 Conventional Commits。
- PR 必须关联 Issue（`Closes #...` 或 `Related #...`）。
- PR 模板中的验证证据（lint/typecheck/test/build）为必填项。

## 5) 发布与版本标签

- 版本号遵循 SemVer：`MAJOR.MINOR.PATCH`。
- 每次发布需：
  1. 更新 `docs-meta/CHANGELOG.md`（至少记录 Added/Changed/Fixed）。
  2. 创建标签：`vX.Y.Z`。
  3. 记录部署环境与回滚点。

## 6) 回滚策略

- 紧急回滚优先采用“回滚到最近稳定 tag”。
- 回滚后需在 24 小时内补充复盘 Issue（`type:retrospective`）。
