# 贡献指南

感谢您对 HUAT FSAC 文档站点的贡献！本指南将帮助您了解如何参与项目开发。

---

## 📋 目录

- [行为准则](#行为准则)
- [如何贡献](#如何贡献)
- [开发环境设置](#开发环境设置)
- [代码风格指南](#代码风格指南)
- [提交规范](#提交规范)
- [Pull Request 流程](#pull-request-流程)
- [报告问题](#报告问题)

---

## 行为准则

请尊重所有贡献者，保持友善和专业的交流氛围。我们致力于创建一个开放、包容的社区环境。

---

## 如何贡献

### 贡献类型

1. **文档内容** - 添加或更新技术文档
2. **Bug 修复** - 修复已知问题
3. **功能开发** - 添加新功能
4. **样式优化** - 改进 UI/UX
5. **翻译** - 完善多语言支持

### 贡献流程

1. Fork 本仓库
2. 创建功能分支
3. 进行更改
4. 提交 Pull Request
5. 等待审核

---

## 开发环境设置

### 环境要求

- **Node.js** 22.0.0 或更高版本
- **pnpm** 9.0.0 或更高版本
- **Git** 2.0.0 或更高版本

### 安装步骤

```bash
# 1. Fork 并克隆仓库
git clone https://github.com/YOUR_USERNAME/Guidance-Astro.git
cd Guidance-Astro

# 2. 安装依赖
pnpm install

# 3. 启动开发服务器
pnpm dev
```

### 常用命令

| 命令                  | 说明                 |
| --------------------- | -------------------- |
| `pnpm dev`            | 启动开发服务器       |
| `pnpm build`          | 构建生产版本         |
| `pnpm preview`        | 预览构建结果         |
| `pnpm lint`           | 运行代码检查         |
| `pnpm lint:fix`       | 自动修复代码问题     |
| `pnpm format`         | 格式化代码           |
| `pnpm test:run`       | 执行单元测试         |
| `pnpm test:coverage`  | 生成测试覆盖率报告   |
| `pnpm test:e2e`       | 执行关键路径烟雾测试 |
| `pnpm quality:bundle` | 执行构建体积预算检查 |

---

## 代码风格指南

### 通用规范

- 使用 **4 空格** 缩进
- 使用 **单引号** 字符串
- 不使用分号（除非必要）
- 每行最大 **100** 个字符

### TypeScript/JavaScript

```typescript
// ✅ 正确
const greeting = 'Hello, World!'

function calculateSum(a: number, b: number): number {
    return a + b
}

// ❌ 错误
const greeting = 'Hello, World!'

function calculateSum(a, b) {
    return a + b
}
```

### Astro 组件

```astro
---
// 类型定义
interface Props {
    title: string
    description?: string
}

// 解构 props
const { title, description } = Astro.props
---

<div class="component">
    <h2>{title}</h2>
    {description && <p>{description}</p>}
</div>

<style>
    .component {
        padding: 1rem;
    }
</style>
```

### CSS 规范

- 使用 BEM 命名或组件作用域样式
- 颜色使用 CSS 变量
- 优先使用 `rem` 单位

```css
/* ✅ 正确 */
.feature-card {
    padding: 1.5rem;
    background: var(--sl-color-gray-6);
    border-radius: var(--radius-md);
}

.feature-card__title {
    font-size: 1.25rem;
    color: var(--sl-color-text);
}

/* ❌ 错误 */
.card {
    padding: 24px;
    background: #1a1a2e;
    border-radius: 16px;
}
```

---

## 提交规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范。

### 提交格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 类型 (type)

| 类型       | 说明                   |
| ---------- | ---------------------- |
| `feat`     | 新功能                 |
| `fix`      | Bug 修复               |
| `docs`     | 文档更新               |
| `style`    | 代码格式（不影响功能） |
| `refactor` | 代码重构               |
| `perf`     | 性能优化               |
| `test`     | 测试相关               |
| `chore`    | 构建/工具变更          |

### 示例

```bash
# 新功能
git commit -m "feat(home): add language switcher component"

# Bug 修复
git commit -m "fix(docs): correct table overflow on mobile"

# 文档更新
git commit -m "docs: update README with development guide"

# 样式调整
git commit -m "style(hero): improve button hover animation"
```

### 本地提交钩子

- 项目通过 `husky` + `lint-staged` 在 `pre-commit` 阶段自动检查 **staged** 文件。
- 首次拉取后执行 `pnpm install` 会自动安装 Git hooks（`prepare` 脚本）。
- 若提交被阻断，请先运行 `pnpm lint:fix` 与 `pnpm format`，重新 `git add` 后再提交。

---

## Pull Request 流程

分支保护、评审门禁与发布策略请参见 [`docs/VERSION_CONTROL_POLICY.md`](./docs/VERSION_CONTROL_POLICY.md)。

### 创建 PR 前

1. ✅ 确保代码通过 `pnpm build`
2. ✅ 运行 `pnpm lint` 无错误
3. ✅ 代码已格式化 `pnpm format`
4. ✅ 提交信息符合规范

### PR 模板

```markdown
## 描述

简要描述此 PR 的更改内容。

## 更改类型

- [ ] Bug 修复
- [ ] 新功能
- [ ] 文档更新
- [ ] 样式优化
- [ ] 性能优化
- [ ] 其他

## 相关 Issue

关联的 Issue 编号：#xxx

## 测试

描述你如何测试这些更改。

## 截图

如有 UI 变更，请附上截图。

## 检查清单

- [ ] 代码已通过构建
- [ ] 已运行代码检查
- [ ] 已更新相关文档
- [ ] 已测试更改功能
```

---

## 报告问题

安全漏洞请**不要**开公开 Issue，按照 [SECURITY.md](./SECURITY.md) 私下上报。

### Issue 模板

**Bug 报告**

```markdown
## Bug 描述

清晰简洁地描述问题。

## 复现步骤

1. 进入 '...'
2. 点击 '...'
3. 滚动到 '...'
4. 看到错误

## 预期行为

描述你期望发生的情况。

## 实际行为

描述实际发生的情况。

## 截图

如适用，添加截图帮助解释问题。

## 环境

- 浏览器：[如 Chrome 120]
- 操作系统：[如 Windows 11]
- 设备：[如 Desktop/Mobile]
```

**功能请求**

```markdown
## 功能描述

清晰简洁地描述你想要的功能。

## 解决的问题

描述这个功能解决什么问题。

## 可能的解决方案

如有想法，描述可能的实现方式。

## 其他信息

添加任何其他相关信息。
```

---

## 📞 联系方式

如有问题，可通过以下方式联系：

- **GitHub Issues**: [创建 Issue](https://github.com/HUAT-FSAC/Guidance-Astro/issues)
- **Email**: contact@huat-fsac.eu.org

---

感谢您的贡献！🎉
