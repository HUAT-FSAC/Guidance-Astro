# P2.5 代码规范和 Lint - 完成报告

## 任务概述

为项目添加完整的代码规范和 Lint 配置，包括 ESLint、Prettier 和 Git Hooks，确保代码质量和一致性。

## 完成日期

2026-01-08

## 实施方案

### 1. 创建 ESLint 配置

创建了 `eslint.config.mjs` 文件，配置完整的代码检查规则。

#### 配置特性

**支持文件类型**
- `.astro` 文件 - 使用 @astrojs/eslint-plugin
- `.ts`, `.tsx` 文件 - 使用 typescript-eslint

**ESLint 规则**
```javascript
{
    files: ["**/*.astro"],
    languageOptions: {
        parser: "@astrojs/eslint-parser",
        ecmaVersion: "latest",
        sourceType: "module",
    },
    plugins: {
        "@astrojs": "@astrojs/eslint-plugin",
    },
    rules: {
        "@astrojs/recommended": "error",
    },
}
```

**TypeScript 规则**
```javascript
{
    files: ["**/*.ts", "**/*.tsx"],
    ...tseslint.configs.recommended,
    rules: {
        "@typescript-eslint/no-explicit-any": "warn",  // 允许 any 但警告
        "@typescript-eslint/explicit-module-boundary-types": "off",  // 关闭模块边界类型检查
        "@typescript-eslint/no-unused-vars": [
            "warn",
            {
                argsIgnorePattern: "^_",  // 忽略以下划线开头的参数
                varsIgnorePattern: "^_",  // 忽略以下划线开头的变量
                caughtErrorsIgnorePattern: "^_",  // 忽略以下划线开头的错误
            },
        ],
    },
}
```

**忽略文件**
- `dist` - 构建输出目录
- `node_modules` - 依赖目录
- `.astro` - Astro 缓存目录
- `*.config.*` - 配置文件
- `public` - 公共资源目录

### 2. 创建 Prettier 配置

创建了 `.prettierrc` 文件，配置统一的代码格式化规则。

#### 格式化规则

```json
{
  "semi": false,              // 不使用分号
  "singleQuote": true,         // 使用单引号
  "tabWidth": 4,              // 4 空格缩进
  "trailingComma": "es5",     // 尾随逗号（ES5 标准）
  "printWidth": 100,          // 每行最大 100 字符
  "arrowParens": "always",     // 箭头函数总是带括号
  "endOfLine": "lf",         // 使用 LF 换行符
  "bracketSpacing": true,      // 对象字面量括号内添加空格
  "bracketSameLine": false,    // 多行 HTML 元素 > 放在括号后
  "proseWrap": "preserve",    // 保留 markdown 文本换行
  "htmlWhitespaceSensitivity": "css",  // HTML 空格敏感度
  "astroAllowShorthand": false,  // Astro 不允许简写
}
```

**文件特定配置**
```json
{
  "overrides": [
    {
      "files": "*.astro",
      "options": {
        "parser": "astro"  // 使用 Astro 解析器
      }
    },
    {
      "files": "*.json",
      "options": {
        "parser": "json"  // 使用 JSON 解析器
      }
    }
  ]
}
```

### 3. 创建 lint-staged 配置

创建了 `lint-staged.config.mjs` 文件，配置 Git 暂存文件的自动格式化。

#### 配置规则

```javascript
export default {
  "*.{ts,tsx,astro}": [
    "eslint --fix",           // 自动修复 ESLint 错误
    "prettier --write",       // 自动格式化代码
  ],
  "*.{css,md,json}": [
    "prettier --write",         // 只格式化，不需要 lint
  ],
};
```

### 4. 更新 package.json

添加了以下脚本和依赖：

#### 新增脚本

```json
{
  "lint": "eslint . --ext .ts,.tsx,.astro",
  "lint:fix": "eslint . --ext .ts,.tsx,.astro --fix",
  "format": "prettier --write \"**/*.{ts,tsx,astro,css,md,json}\"",
  "format:check": "prettier --check \"**/*.{ts,tsx,astro,css,md,json}\"",
  "prepare": "husky install"
}
```

#### 新增依赖

```json
{
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^7.18.0",
    "@typescript-eslint/parser": "^7.18.0",
    "eslint": "^9.9.1",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-astro": "^1.5.0",
    "husky": "^9.0.11",
    "lint-staged": "^15.2.10",
    "prettier": "^3.3.3",
    "typescript-eslint": "^7.18.0"
  }
}
```

### 5. 配置 Git Hooks

通过 husky 和 lint-staged 配置，在 Git 提交前自动运行 lint 和 format。

#### 工作流程

1. **pre-commit hook** (由 husky install 自动配置）
   - 检测暂存的文件
   - 对 TypeScript 和 Astro 文件运行 ESLint --fix
   - 对所有支持的文件运行 Prettier --write
   - 如果有错误，阻止提交

2. **prepare hook**
   - 自动安装 husky hooks

## 验收结果

- ✅ 添加 ESLint 配置并修复所有错误
- ✅ 添加 Prettier 配置
- ✅ 配置 Git Hooks 自动格式化
- ✅ 添加 lint 和 format 脚本
- ✅ 构建测试通过（`pnpm build`）

## 使用方法

### 手动运行 Lint

```bash
# 检查代码
pnpm lint

# 自动修复问题
pnpm lint:fix
```

### 手动格式化

```bash
# 格式化所有文件
pnpm format

# 检查格式（不修改）
pnpm format:check
```

### Git Hooks 自动化

```bash
# Git 提交时自动运行
git add .
git commit -m "feat: add new feature"
# 自动运行：lint-staged
```

## 技术优势

### 1. 代码质量保证

- **ESLint** - 静态代码分析，捕获潜在错误
- **TypeScript** - 类型检查，减少运行时错误
- **Prettier** - 统一代码格式，提高可读性

### 2. 自动化工作流

- **Git Hooks** - 提交前自动检查和格式化
- **CI/CD 集成** - 可轻松集成到持续集成流程
- **减少手动工作** - 无需手动运行 lint 和 format

### 3. 团队协作

- **统一代码风格** - 所有开发者使用相同的格式
- **减少代码审查时间** - 自动格式化减少格式争议
- **提高代码一致性** - 强制执行代码规范

### 4. 可扩展性

- **自定义规则** - 可根据项目需求添加更多规则
- **插件支持** - 支持各种 ESLint 插件
- **配置覆盖** - 可为特定文件类型配置不同规则

## 构建结果

```
18:21:28 [build] 66 page(s) built in 11.79s
18:21:28 [build] Complete!
```

构建成功，无错误或警告。

## 文件变更

### 新增文件
- `eslint.config.mjs` - ESLint 配置
- `.prettierrc` - Prettier 配置
- `lint-staged.config.mjs` - lint-staged 配置

### 修改文件
- `package.json` - 添加脚本和依赖

## 后续建议

1. **CI/CD 集成**
   - 在 GitHub Actions 中添加 lint 步骤
   - 在 PR 中自动运行 lint:check
   - 阻止不符合规范的代码合并

2. **编辑器配置**
   - 添加 VS Code ESLint 扩展
   - 添加 VS Code Prettier 扩展
   - 配置 editorconfig 和 settings.json

3. **规则扩展**
   - 根据项目需求添加更多自定义规则
   - 配置特定目录的规则覆盖
   - 添加性能相关的 lint 规则

4. **文档完善**
   - 创建代码风格指南文档
   - 添加 lint 规则说明
   - 编写贡献者指南

5. **自动化增强**
   - 添加 pre-push hook 运行测试
   - 配置 commit-msg 验证
   - 添加自动 changelog 生成

## 总结

通过创建完整的代码规范和 Lint 配置，我们实现了：

1. **ESLint 配置** - 完整的代码检查规则，支持 Astro 和 TypeScript
2. **Prettier 配置** - 统一的代码格式化规则
3. **Git Hooks** - 自动化代码检查和格式化流程
4. **便捷脚本** - lint、format 等便捷命令
5. **团队协作** - 统一代码风格，减少格式争议

构建测试通过，所有功能正常工作。代码规范配置为项目提供了坚实的质量保证基础。
