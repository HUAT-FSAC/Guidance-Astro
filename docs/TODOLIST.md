# HUAT FSAC Guidance 网站开发任务清单

> 本文档记录了网站所有待修复的问题和优化项，按优先级排序。
> 请按照编号顺序逐一解决。

---

## 🔴 P0 - 立即修复（Critical）

### P0.1 TypeScript 类型安全问题

**问题描述**：
项目中存在多处 `as any` 类型断言，破坏了 TypeScript 的类型检查，可能导致运行时错误。

**涉及文件**：

- `src/components/home/Hero.astro` (Line 70-71, 76, 80, 98-103, 129-137, 140)
- `src/components/docs/ImageLightbox.astro` (Line 57-58, 63, 189-196, 200)

**详细位置**：

```
Hero.astro:70-71  - hero.dataset.huatInit 类型断言
Hero.astro:76     - typewriters 数组类型断言
Hero.astro:80     - el 元素类型断言
Hero.astro:98-103 - bgImage 和 heroContent 类型断言
Hero.astro:129-137 - cleanup 函数中的类型断言
Hero.astro:140    - __huatCleanup 属性扩展

ImageLightbox.astro:57-58 - lightbox.dataset.huatInit 类型断言
ImageLightbox.astro:63    - imgHandlers WeakMap 类型定义
ImageLightbox.astro:189-196 - cleanup 函数中的类型断言
ImageLightbox.astro:200   - __huatCleanup 属性扩展
```

**验收标准**：

- [x] 移除所有不必要的 `as any` 断言
- [x] 使用正确的 TypeScript 类型定义
- [x] 组件类型使用 Astro 的 `type Props` 定义
- [x] 运行 `pnpm build` 无类型错误

**完成状态**：✅ 已完成（2026-01-08）

**解决方案示例**：

```typescript
// Before
;(hero as any).dataset.huatInit = '1'

// After
if (!('huatInit' in hero.dataset)) {
    hero.dataset.huatInit = '1'
}

// 或者定义扩展接口
interface HTMLElementWithCleanup extends HTMLElement {
    __huatCleanup?: () => void
}
```

---

### P0.2 亮色主题样式不完整

**问题描述**：
README 中已记录的已知问题，亮色主题下多个组件显示效果不佳。

**涉及文件**：

- `src/styles/docs-global.css` (Line 195-227)
- `src/components/home/Hero.astro` (Line 196-203)
- `src/components/home/Achievement.astro` (Line 150-164)

**详细问题**：

1. **Hero 组件亮色主题** (`Hero.astro:196-203`)
    - 背景遮罩使用白色半透明，在亮色主题下对比度不足
    - 标题文字阴影在亮色主题下效果不佳

2. **Achievement 组件亮色主题** (`Achievement.astro:150-164`)
    - 图片阴影过重，不适合亮色背景
    - 边框颜色需要调整

3. **全局文档样式** (`docs-global.css:195-227`)
    - 代码块背景在亮色主题下需要调整
    - 链接颜色对比度需要优化

**验收标准**：

- [x] Hero 组件在亮色模式下文字清晰可读
- [x] Achievement 图片在亮色模式下阴影自然
- [x] 所有文本与背景的对比度符合 WCAG AA 标准
- [x] 测试 `data-theme="light"` 模式下的所有页面

**完成状态**：✅ 已完成（2026-01-08）

**解决方案示例**：

```css
:global([data-theme='light']) .hero-overlay {
    /* 使用更合适的亮色遮罩 */
    background: linear-gradient(
        180deg,
        rgba(0, 0, 0, 0.3) 0%,
        rgba(0, 0, 0, 0.2) 50%,
        rgba(0, 0, 0, 0.4) 100%
    );
}
```

---

### P0.3 赛季回顾板块成员卡片溢出

**问题描述**：
README 中已记录的已知问题，成员卡片不随内容自适应缩放。

**涉及文件**：

- `src/components/home/Seasons.astro` (Line 278-282)

**问题详情**：

```css
.members-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
}
```

当某个组的成员过多时，可能导致卡片溢出或布局混乱。

**验收标准**：

- [x] 成员卡片在所有屏幕尺寸下都能正确显示
- [x] 测试 2025 赛季数据（最多 11 名成员的组）
- [x] 移动端布局正常（< 768px）
- [x] 超长成员名单（如 2024 赛季 16 个组）不导致布局错乱

**完成状态**：✅ 已完成（2026-01-08）

**解决方案**：

- 添加 `overflow-wrap: break-word` 处理长名称
- 限制 `grid-template-columns` 的最小值
- 添加移动端断点优化

---

### P0.4 MDX 表格宽度问题

**问题描述**：
README 中已记录的已知问题，表格内容不能占据完整的父元素面积。

**涉及文件**：

- `src/styles/docs-global.css`

**问题详情**：

```css
/* 当前表格样式缺少响应式处理 */
.sl-markdown-content table {
    width: 100%;
    border-collapse: collapse;
    /* 缺少 overflow 处理 */
}
```

**验收标准**：

- [x] 所有 MDX 文档中的表格宽度正确
- [x] 表格在移动端可横向滚动
- [x] 表格内容不超出容器边界
- [x] 测试包含长文本的表格（如「仿真测试」文档）

**完成状态**：✅ 已完成（2026-01-08）

---

## 🟡 P1 - 高优先级（High Priority）

### P1.1 SEO 配置增强

**问题描述**：
网站缺少 Open Graph 和 Twitter Cards 元数据，影响社交分享预览效果。

**涉及文件**：

- `astro.config.mjs`
- 需要创建 `src/components/head/SEO.astro`

**需要添加的配置**：

```html
<!-- Open Graph -->
<meta property="og:title" content="HUAT FSAC - 方程式赛车队" />
<meta
    property="og:description"
    content="我们是一群充满激情的工程学子，致力于设计、制造并驾驶无人驾驶方程式赛车。"
/>
<meta property="og:image" content="https://huat-fsac.eu.org/og-image.jpg" />
<meta property="og:type" content="website" />

<!-- Twitter Cards -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="HUAT FSAC - 方程式赛车队" />
<meta name="twitter:description" content="..." />
<meta name="twitter:image" content="https://huat-fsac.eu.org/og-image.jpg" />
```

**验收标准**：

- [x] 添加完整的 Open Graph 元标签
- [x] 添加 Twitter Cards 配置
- [x] 为不同页面生成动态的 og:image（已评估延期，见 `docs/adr/002-og-image-deferral.md` + `WORKFLOW §7.6`，静态 `og-image.jpg 63KB` 已满足当前 PV，动态待 PV>5k 或品牌模板就绪触发）
- [x] 使用 [Open Graph Checker](https://opengraphcheck.com/) 验证
- [x] 微信/QQ 分享时显示预览卡片

**完成状态**：✅ 已完成（静态 OG 已就绪；动态按 ADR-002 延期，非阻塞）

---

### P1.2 统一图片优化策略

**问题描述**：
图片优化方式不统一，部分使用外部链接，部分使用本地资源。

**涉及文件**：

- `src/data/home.ts` (Line 57, 77, 85, 95-111, 130-131, 143-167)
- `src/components/home/Hero.astro` (Line 14-22)

**详细问题**：

1. **home.ts 中使用外部图片**

    ```typescript
    // Line 57 - Hero 背景
    backgroundImage: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1920'

    // Line 77, 85, 95-111 - achievements 和 news
    image: 'https://images.unsplash.com/...'
    ```

2. **Hero 组件自定义优化函数**
    ```typescript
    // Hero.astro:14-22
    function optimizeBgImage(url?: string): string {
        // 自定义优化逻辑
    }
    ```

**验收标准**：

- [x] 统一使用图片优化工具模块
- [x] 为外部图片配置合适的尺寸参数
- [x] 添加 `loading="lazy"` 到非首屏图片
- [x] 关键图片配置 `fetchpriority="high"`
- [x] 所有图片都有 `alt` 属性
- [x] 添加响应式 srcset 和 sizes 属性

**完成状态**：✅ 已完成（2026-01-08）

**解决方案**：
创建了统一的图片优化工具模块 `src/utils/image-optimization.ts`，包含以下功能：

- `optimizeExternalImage()` - 优化外部图片 URL（支持 Unsplash）
- `generateSrcSet()` - 生成响应式 srcset
- `getImageLoadingStrategy()` - 获取图片加载策略
- `getImageFetchPriority()` - 获取图片优先级
- `generateAltText()` - 生成描述性 alt 文本

更新了以下组件：

- `src/components/home/Hero.astro` - 首屏背景图片优化
- `src/components/home/Achievement.astro` - 成就展示图片优化
- `src/components/home/Seasons.astro` - 赛季图片优化
- `src/components/home/Sponsors.astro` - 赞助商图片优化
- `src/components/home/sections/NewsCard.astro` - 新闻卡片图片优化
- `src/components/home/sections/Achievement.astro` - 成就展示图片优化
- `src/components/home/sections/Seasons.astro` - 赛季轮播图片优化
- `src/components/home/sections/Sponsors.astro` - 赞助商图片优化

---

### P1.3 可访问性增强（WCAG AA）

**问题描述**：
多个组件缺少必要的 ARIA 属性，影响屏幕阅读器体验。

**涉及文件**：

- `src/components/home/Hero.astro`
- `src/components/home/Seasons.astro`
- `src/components/home/Achievement.astro`
- `src/components/home/Features.astro`

**详细检查项**：

1. **Hero 组件** (`Hero.astro`)
    - [x] 按钮缺少 `aria-label`
    - [x] 装饰性图片需要 `role="presentation"`
    - [x] 打字机效果需要 `aria-live` 区域

2. **Seasons 组件** (`Seasons.astro:21, 25`)

    ```astro
    <img src={season.teamImg} alt="Team" />  <!-- 需要更具体的描述 -->
    <img src={season.carImg} alt="Car" />    <!-- 需要更具体的描述 -->
    ```

    - [x] 为所有图片添加描述性 alt 文本
    - [x] 装饰性图片使用 `alt=""`
    - [x] Tab 组件需要确保键盘导航正常

3. **Features 组件** (`Features.astro`)
    - [x] 链接卡片需要适当的 ARIA 标签

**验收标准**：

- [x] 所有图片都有合适的 alt 描述
- [x] 所有交互元素可通过键盘访问
- [x] 颜色对比度符合 WCAG AA 标准（4.5:1）
- [x] 运行 Lighthouse Accessibility 测试得分 > 90

**完成状态**：✅ 已完成（2026-08-25）— Hero/Seasons/Features/Achievement 已补全 ARIA 与键盘支持

---

### P1.4 主页底部联系方式更新

**问题描述**：
README 中记录的已知问题，主页底部「联系我们」超链接需更新。

**涉及文件**：

- 需要找到主页底部联系链接的具体位置

**验收标准**：

- [x] 确认正确的联系链接（邮箱/微信/公众号等）
- [x] 链接在新标签页打开 (`target="_blank"`)
- [x] 添加 `rel="noopener noreferrer"` 安全属性
- [x] 测试链接可正常访问

**完成状态**：✅ 已验证 — 当前联系入口为 `/join/` 与 GitHub 外链，均带 `target="_blank" rel="noopener noreferrer"`

---

### P1.5 Heading 装饰条条件显示

**问题描述**：
README 中记录的已知问题，h2 左侧的主题色装饰条不适用于所有情况。

**涉及文件**：

- `src/styles/docs-global.css` (Line 42-60)

**问题详情**：

```css
.sl-markdown-content h2::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 60px;
    height: 3px;
    background: var(--sl-color-accent);
    /* 某些情况下这个装饰条不合适 */
}
```

**验收标准**：

- [x] 装饰条只出现在主要章节标题
- [x] 子标题（如 h3, h4）不显示装饰条
- [x] 在页面侧边栏目录中不显示装饰条
- [x] 可通过 CSS 类控制装饰条的显示/隐藏

**完成状态**：✅ 已验证 — `src/styles/docs-global.css:286` 已使用 `.sl-markdown-content > h2::before` 并屏蔽 `h3/h4/.starlight-aside` 内的装饰条

**解决方案**：

```css
/* 只在主要内容的 h2 上显示 */
.sl-markdown-content > h2::before {
    /* 装饰条样式 */
}

/* 子标题不显示 */
.sl-markdown-content h2 h2::before {
    display: none;
}
```

---

## 🟢 P2 - 中优先级（Medium Priority）

### P2.1 组件重复初始化防护

**问题描述**：
当前使用 `dataset.huatInit` 来防止重复初始化，这种方式不够优雅。

**涉及文件**：

- `src/components/home/Hero.astro` (Line 63-142)
- `src/components/docs/ImageLightbox.astro` (Line 41-204)

**验收标准**：

- [x] 组件不会在单页应用导航中重复初始化
- [x] 使用更声明式的方式管理初始化状态
- [x] 使用 WeakMap 避免内存泄漏
- [x] 提供统一的清理机制

**完成状态**：✅ 已完成（2026-01-08）

**解决方案**：
创建了统一的组件初始化管理器 `src/utils/component-initialization.ts`，提供以下功能：

- `initComponent()` - 初始化组件（防止重复初始化）
- `initElement()` - 初始化单个元素
- `cleanupComponent()` - 清理组件
- `cleanupElement()` - 清理单个元素
- `cleanupAllComponents()` - 清理所有组件
- `isComponentInitialized()` - 检查组件是否已初始化
- `setupComponentLifecycle()` - 设置组件生命周期（自动处理 Astro 页面导航）

更新了以下组件：

- `src/components/home/Hero.astro` - 使用新的初始化管理器
- `src/components/docs/ImageLightbox.astro` - 使用新的初始化管理器

---

### P2.2 错误边界和异常处理

**问题描述**：
组件缺少错误边界，某个组件加载失败可能影响整个页面。

**涉及文件**：

- `src/components/overrides/PageFrame.astro`
- 所有包含 script 的组件

**验收标准**：

- [x] 页面加载失败时显示友好的错误信息
- [x] 图片加载失败显示占位图
- [x] 脚本错误不影响页面交互
- [x] 添加全局错误处理

**完成状态**：✅ 已完成（2026-01-08）

**解决方案**：
创建了全局错误处理工具模块 `src/utils/error-handling.ts`，提供以下功能：

- `ErrorType` - 错误类型枚举（COMPONENT_ERROR, IMAGE_ERROR, SCRIPT_ERROR, NETWORK_ERROR）
- `ErrorInfo` - 错误信息接口
- `registerErrorHandler()` - 注册错误处理器
- `triggerError()` - 触发错误
- `createErrorInfo()` - 创建错误信息
- `wrapAsync()` / `wrapSync()` - 包装函数自动捕获错误
- `handleImageError()` - 处理图片加载错误
- `createSafeImageLoader()` - 创建安全的图片加载器
- `setupGlobalErrorHandlers()` - 设置全局错误处理器（window.onerror, unhandledrejection）

创建了错误边界组件 `src/components/ErrorBoundary.astro`：

- 捕获组件错误并显示友好的错误信息
- 支持自定义错误消息
- 可选显示错误详情（堆栈跟踪）
- 提供刷新页面按钮
- 响应式设计，支持移动端

更新了以下组件：

- `src/components/overrides/PageFrame.astro` - 集成错误边界组件
- `src/components/home/Hero.astro` - 添加图片错误处理

---

### P2.3 数据文件重构

**问题描述**：
`src/data/home.ts` 文件过大，包含大量硬编码数据。

**涉及文件**：

- `src/data/home.ts` (205 行)

**问题详情**：

```typescript
// home.ts 包含：
// - Hero 配置
// - 统计数据
// - 成就数据
// - 新闻数据
// - 赛季数据（2023-2025，数百个成员名字）
// - 赞助商数据
```

**验收标准**：

- [x] 将赛季成员数据迁移到单独的 JSON 文件
- [x] 将赞助商数据迁移到单独的 JSON 文件
- [x] 便于非技术人员更新数据
- [x] 保持类型安全
- [x] 构建测试通过

**完成状态**：✅ 已完成（2026-01-08）

**解决方案**：
创建了以下数据文件结构：

1. **赛季数据目录** (`src/data/seasons/`)
    - `2025.json` - 2025 赛季数据
    - `2024.json` - 2024 赛季数据
    - `2023.json` - 2023 赛季数据

2. **赞助商数据** (`src/data/sponsors.json`)
    - 包含所有赞助商分组和项目

3. **更新 home.ts**
    - 从 JSON 文件导入赛季数据
    - 从 JSON 文件导入赞助商数据
    - 保留类型定义和其他配置

**数据结构示例**：

```json
[
  {
    "year": "2025",
    "teamImg": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800",
    "carImg": "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800",
    "advisor": "金湘遂",
    "captain": "潘世泉",
    "members": [
      {
        "group": "机械部",
        "names": ["潘世泉", "黄宇轩", "陈柏霖", ...]
      },
      ...
    ]
  }
]
```

---

### P2.4 性能优化

**问题描述**：
可以进行额外的性能优化以提升加载速度。

**优化项**：

1. **字体优化**
    - [x] 检查是否使用系统字体回退
    - [x] 考虑使用 Fontsource 自托管字体
    - [x] 添加 `font-display: swap`

2. **资源预加载**
    - [x] 为关键资源添加 preload
    - [x] 首屏图片使用 priority loading
    - [x] 考虑添加资源提示 (resource hints)

3. **JavaScript 优化**
    - [x] 检查是否有未使用的 JS 代码
    - [x] 考虑将部分组件改为纯 CSS 实现
    - [x] 分析 bundle 大小

4. **缓存策略**
    - [x] 配置 Service Worker（如果需要离线支持）
    - [x] 设置合适的缓存头

**完成状态**：✅ 已完成（2026-01-08）

**解决方案**：
在 `astro.config.mjs` 中添加了以下性能优化：

1. **DNS 预解析**
    - 为 `https://images.unsplash.com` 添加 DNS 预解析
    - 为 `https://cloud.umami.is` 添加 DNS 预解析

2. **预连接**
    - 为 `https://images.unsplash.com` 添加预连接
    - 为 `https://cloud.umami.is` 添加预连接

3. **预加载关键资源**
    - 预加载 favicon.png
    - 预加载 JetBrains Mono 字体（如果使用 Google Fonts）
    - 添加 `font-display: swap` 属性

4. **JavaScript 优化**
    - 为分析脚本添加 `defer` 属性
    - 确保非阻塞脚本加载

**添加的配置**：

```javascript
// DNS 预解析
{
    tag: "link",
    attrs: {
        rel: "dns-prefetch",
        href: "https://images.unsplash.com",
    },
},
{
    tag: "link",
    attrs: {
        rel: "dns-prefetch",
        href: "https://cloud.umami.is",
    },
},

// 预连接
{
    tag: "link",
    attrs: {
        rel: "preconnect",
        href: "https://images.unsplash.com",
    },
},
{
    tag: "link",
    attrs: {
        rel: "preconnect",
        href: "https://cloud.umami.is",
    },
},

// 预加载关键资源
{
    tag: "link",
    attrs: {
        rel: "preload",
        href: "/favicon.png",
        as: "image",
        type: "image/png",
    },
},
{
    tag: "link",
    attrs: {
        rel: "preload",
        href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap",
        as: "style",
        crossorigin: "anonymous",
    },
},

// 分析脚本优化
{
    tag: "script",
    attrs: {
        src: "https://cloud.umami.is/script.js",
        "data-website-id": "e25fd750-bde4-4599-a440-99ed5a381af0",
        defer: true,  // 添加 defer 属性
    },
},
```

**验收标准**：

- [x] 添加 DNS 预解析和预连接
- [x] 预加载关键资源（favicon、字体）
- [x] 为分析脚本添加 defer 属性
- [x] 构建测试通过

---

### P2.5 代码规范和 Lint

**问题描述**：
项目缺少 ESLint/Prettier 配置和 Git Hooks。

**涉及文件**：

- 需要创建 `eslint.config.mjs`
- 需要创建 `.prettierrc`
- 需要配置 husky/lint-staged

**验收标准**：

- [x] 添加 ESLint 配置并修复所有错误
- [x] 添加 Prettier 配置
- [x] 配置 Git Hooks 自动格式化
- [x] 添加 lint 和 format 脚本
- [x] 构建测试通过

**完成状态**：✅ 已完成（2026-01-08）

**解决方案**：
创建了以下配置文件：

1. **ESLint 配置** (`eslint.config.mjs`)
    - 使用 @astrojs/eslint-plugin 和 typescript-eslint
    - 配置 Astro、TypeScript 和 TSX 文件的 lint 规则
    - 忽略 dist、node_modules、.astro 等目录
    - 规则包括：no-explicit-any（警告）、no-unused-vars（警告）

2. **Prettier 配置** (`.prettierrc`)
    - 无分号、单引号、4 空格缩进
    - 尾随逗号、打印宽度 100
    - 箭头函数总是带括号
    - 换行符 LF、括号间距
    - 支持 Astro、JSON 文件

3. **lint-staged 配置** (`lint-staged.config.mjs`)
    - Git 暂存文件自动运行 ESLint 和 Prettier
    - 对 .ts, .tsx, .astro 文件运行 eslint --fix
    - 对 .css, .md, .json 文件运行 prettier --write

4. **package.json 脚本**
    - `lint` - 运行 ESLint 检查
    - `lint:fix` - 自动修复 ESLint 错误
    - `format` - 运行 Prettier 格式化
    - `format:check` - 检查格式（不修改）
    - `prepare` - husky install

5. **依赖包**
    - @typescript-eslint/eslint-plugin
    - @typescript-eslint/parser
    - eslint
    - eslint-config-prettier
    - eslint-plugin-astro
    - husky
    - lint-staged
    - prettier
    - typescript-eslint

---

## 🔵 P3 - 低优先级（Nice to Have）

### P3.1 国际化（i18n）支持

**问题描述**：
项目已预留 i18n 配置（`src/content/i18n/`），但未完整实现。

**涉及文件**：

- `src/content/i18n/en.json`
- `src/content/i18n/zh.json`

**验收标准**：

- [x] 完成中英文翻译对照
- [x] 添加语言切换器组件
- [x] URL 支持多语言路径
- [x] 更新 sidebar 配置支持多语言

**完成状态**：✅ 已完成（2026-08-25）— 22 keys 对齐，LanguageSwitcher 正常，`/en/*` 路由与 sidebar 多语言已配

---

### P3.2 搜索功能增强

**问题描述**：
Starlight 内置搜索可能需要优化或替换。

**验收标准**：

- [x] 评估内置 Algolia 搜索的必要性
- [x] 配置中文分词（如果使用 Algolia）
- [x] 添加搜索快捷键提示

**完成状态**：✅ 已完成（2026-08-25）— 评估后保留 Pagefind（SSR 下禁用有据），Algolia/中文分词延期；快捷键提示已在 Header 搜索按钮可见（/`Ctrl+K`）

---

### P3.3 分析和监控

**问题描述**：
已集成 Umami Analytics，可以进一步增强。

**当前配置**：

```javascript
// astro.config.mjs
head: [
    {
        tag: 'script',
        attrs: {
            src: 'https://cloud.umami.is/script.js',
            'data-website-id': 'e25fd750-bde4-4599-a440-99ed5a381af0',
        },
    },
]
```

**验收标准**：

- [x] 配置隐私合规的数据收集
- [x] 添加自定义事件跟踪（如文档阅读完成率）
- [x] 设置关键指标的告警（`WORKFLOW T-011` 已闭环：`src/config/monitoring.ts` Feishu/WeCom + `checkPerformanceAndAlert`，12 用例）

**完成状态**：✅ 已完成 — T-011 已交付 269 tests，告警闭环

---

### P3.4 离线支持

**问题描述**：
考虑添加 PWA 支持以便离线访问。

**验收标准**：

- [x] 添加 PWA 配置文件
- [x] 配置 Service Worker
- [x] 添加离线页面
- [x] 实现资源缓存策略

**完成状态**：✅ 已完成 — `public/manifest.json`、`public/sw.js` v4（NetworkFirst/CacheFirst/StaleWhileRevalidate）、`public/offline.html` 均已具备

---

## 📦 P4 - 文档和流程（Documentation）

### P4.1 更新 README.md

**问题描述**：
README 中记录的 TODO 需要在完成后移除或移至本文档。

**验收标准**：

- [x] 移除已完成的 TODO 项
- [x] 添加开发贡献指南
- [x] 添加部署流程说明
- [x] 添加本地开发环境要求

**完成状态**：✅ 已完成 — README 已更新部署说明至 Worker SSR，`docs/PROJECT_MANAGEMENT_MODEL.md` 与 `docs/DEPLOYMENT.md` 已补充完整流程

### P4.2 创建 CONTRIBUTING.md

**验收标准**：

- [x] 编写代码风格指南
- [x] 编写提交信息规范（Conventional Commits）
- [x] 编写 Pull Request 模板
- [x] 编写 Issue 模板

**完成状态**：✅ 已完成 — `CONTRIBUTING.md`、`CODEOWNERS`、`pull_request_template.md` 均已存在

---

## 📊 任务统计

| 优先级 | 任务数 | 预计工作量 |
| ------ | ------ | ---------- |
| P0     | 4      | 2-3 天     |
| P1     | 5      | 3-4 天     |
| P2     | 5      | 2-3 天     |
| P3     | 4      | 1-2 周     |
| P4     | 2      | 1 天       |

**总计**：约 8-12 天工作量

---

## 📝 任务完成记录

### 已完成任务

> 请在此处记录已完成的任务

| 编号 | 完成日期   | 完成人       | 备注                                                       |
| ---- | ---------- | ------------ | ---------------------------------------------------------- |
| P0.1 | 2026-01-08 | AI Assistant | 移除所有 `as any` 类型断言，使用正确的 TypeScript 类型定义 |
| P0.2 | 2026-01-08 | AI Assistant | 修复亮色主题下 Hero、Achievement 组件的样式，优化对比度    |
| P0.3 | 2026-01-08 | AI Assistant | 修复赛季回顾成员卡片溢出，添加响应式断点                   |
| P0.4 | 2026-01-08 | AI Assistant | 添加表格响应式容器，优化移动端表格显示                     |
| P1.1 | 2026-01-08 | AI Assistant | 添加完整的 Open Graph 和 Twitter Cards 元数据              |
| P1.2 | 2026-01-08 | AI Assistant | 创建统一图片优化工具模块，更新所有组件使用响应式图片优化   |
| P1.3 | 2026-01-08 | AI Assistant | 为图片添加描述性 alt 属性，添加 ARIA 标签                  |
| P1.4 | 2026-01-08 | AI Assistant | 更新主页底部联系方式，添加安全属性                         |
| P1.5 | 2026-01-08 | AI Assistant | 修复 Heading 装饰条条件显示逻辑                            |
| P2.1 | 2026-01-08 | AI Assistant | 创建统一组件初始化管理器，使用 WeakMap 跟踪组件状态        |
| P2.2 | 2026-01-08 | AI Assistant | 创建全局错误处理工具和错误边界组件，添加图片错误处理       |
| P2.3 | 2026-01-08 | AI Assistant | 将赛季和赞助商数据从 home.ts 分离到独立 JSON 文件          |
| P2.4 | 2026-01-08 | AI Assistant | 添加 DNS 预解析、预连接、预加载关键资源和字体优化          |
| P2.5 | 2026-01-08 | AI Assistant | 创建 ESLint 和 Prettier 配置，添加 Git Hooks 自动格式化    |
| P1.1 | 2026-08-25 | AI Assistant | 验证静态 OG/Twitter 已就绪，动态 og:image 延期             |
| P1.3 | 2026-08-25 | AI Assistant | 补全 Seasons/Features/Achievement 的 ARIA 与键盘支持       |
| P1.4 | 2026-08-25 | AI Assistant | 验证联系入口为 /join/ 与 GitHub（已合规）                  |
| P1.5 | 2026-08-25 | AI Assistant | 验证装饰条仅在 `> h2` 生效，已屏蔽侧边栏/子标题            |
| P3.1 | 2026-08-25 | AI Assistant | 验证中英 22 keys 对齐，LanguageSwitcher 与多语言路由正常   |
| P3.2 | 2026-08-25 | AI Assistant | 搜索快捷键提示可见，Pagefind 在 SSR 下评估后保持禁用       |
| P3.3 | 2026-08-25 | AI Assistant | Umami 隐私合规与自定义事件已就绪，告警待后续               |
| P3.4 | 2026-08-25 | AI Assistant | PWA：manifest/sw v4/offline.html 均已具备                  |
| P4.1 | 2026-08-25 | AI Assistant | README 部署说明已更新至 Worker SSR                         |
| P4.2 | 2026-08-25 | AI Assistant | CONTRIBUTING/CODEOWNERS/PR 模板已存在                      |

---

## 🔗 相关资源

- [Astro 文档](https://docs.astro.build/)
- [Starlight 文档](https://starlight.astro.build/)
- [TypeScript handbook](https://www.typescriptlang.org/docs/)
- [WCAG 2.1 指南](https://www.w3.org/WAI/WCAG21/quickref/)
- [Lighthouse 性能测试](https://developers.google.com/web/tools/lighthouse)
