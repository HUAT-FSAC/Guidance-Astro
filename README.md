# HUAT FSAC - Guidance Astro

基于 Astro 的 Starlight 模版构建的 HUAT 方程式赛车队文档站点。

[![Deploy Status](https://img.shields.io/badge/Deploy-Cloudflare%20Pages-orange)](https://huat-fsac.eu.org)
[![Analytics](https://img.shields.io/badge/Analytics-Umami-blue)](https://cloud.umami.is/share/ADsMBsz2WVJPbqjO)

Page was deployed @ Cloudflare Pages on behalf of @nekorectifier

---

## ✨ 特性

- 🚀 **高性能** - 基于 Astro 构建，支持零 JavaScript 静态生成，Vite terser 压缩与代码分割
- 📱 **PWA 支持** - 离线访问、可安装为应用，Service Worker 智能缓存策略
- 🌐 **国际化** - 中英文双语支持
- 🎨 **多主题** - 亮色/暗色主题，多色彩方案
- ♿ **可访问性** - 符合 WCAG AA 标准，移动端触摸目标优化
- 📊 **分析集成** - Umami Analytics 事件跟踪
- 🔍 **全文搜索** - Pagefind 驱动的站内搜索，搜索建议与高亮
- 🔒 **安全加固** - CSP、安全响应头、Cloudflare Pages 安全配置

---

## 🚀 快速开始

### 环境要求

- Node.js 18+
- pnpm 8+

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/HUAT-FSAC/Guidance-Astro.git
cd Guidance-Astro

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

访问 http://localhost:4321 查看站点。

### 构建生产版本

```bash
pnpm build
pnpm preview
```

---

## 📁 项目结构

```text
Guidance-Astro/
├── .config/             # 集中配置目录
│   ├── astro.config.mjs # Astro 主配置
│   ├── sidebar.mjs      # 侧边栏配置
│   ├── eslint.config.mjs
│   ├── vitest.config.ts
│   └── playwright.config.ts
├── public/              # 静态资源
│   ├── _headers         # Cloudflare Pages 安全头
│   ├── _redirects       # Cloudflare Pages 重定向
│   ├── favicon.png
│   ├── manifest.json    # PWA 配置
│   ├── sw.js            # Service Worker
│   └── offline.html     # 离线页面
├── src/
│   ├── assets/          # 可优化的资源
│   │   └── docs/        # 文档图片（含 avif/webp 优化格式）
│   ├── components/      # Astro 组件
│   │   ├── home/        # 主页组件
│   │   ├── docs/        # 文档组件
│   │   ├── contributing/# 贡献指南组件
│   │   └── navigation/  # 导航组件（锚点导航、侧边栏状态）
│   ├── config/          # 安全与缓存配置
│   ├── content/         # 内容集合
│   │   ├── docs/        # MDX 文档（中英文）
│   │   └── docs-center/ # 文档中心
│   ├── data/            # 数据配置（展示实验室等）
│   ├── integrations/    # Astro 集成（关键 CSS、构建警告过滤等）
│   ├── styles/          # 全局样式（含移动端响应式）
│   └── utils/           # 工具函数（搜索、懒加载、错误处理等）
├── scripts/             # 构建/优化脚本
├── tests/               # 测试文件
│   ├── unit/            # Vitest 单元测试
│   └── e2e/             # Playwright E2E 测试
└── docs-meta/           # 项目文档（贡献指南、变更日志等）
```

---

## 🛠️ 开发指南

### 常用命令

```bash
pnpm dev          # 启动开发服务器
pnpm build        # 构建生产版本
pnpm preview      # 预览构建结果
pnpm lint         # ESLint 检查
pnpm lint:fix     # ESLint 自动修复
pnpm format       # Prettier 格式化
pnpm test         # 运行 Vitest 单元测试
pnpm test:run     # 运行测试（单次）
pnpm test:e2e     # 运行 Playwright E2E 测试
pnpm clean        # 清理构建产物
```

### MDX 编写规范

**特殊字符转义**：内容中（特别是表格里）如果包含 `<` (小于号)，必须转义：

- ❌ 错误：`| <1A |`
- ✅ 正确：`| \<1A |` 或 ``| `<1A` |``

**Aside 组件类型**：Starlight 的 Aside 组件支持的类型：

- ✅ 正确：`note`, `tip`, `caution`, `danger`
- ❌ 错误：`warning`（不支持）

### 静态资源管理

文档图片请存放在 `src/assets/docs/` 下对应的年份和模块文件夹中：

```text
src/assets/docs/
├── 2025/
│   ├── 感知/
│   ├── 定位建图/
│   ├── 规控/
│   ├── 仿真测试/
│   ├── 电气/
│   ├── 机械/
│   └── 项管/
└── videos/
```

引用方式：

```mdx
import { Image } from 'astro:assets'
import myImage from '../../assets/docs/2025/感知/lidar-setup.png'

<Image src={myImage} alt="激光雷达安装示意图" />
```

### 依赖与构建 (pnpm)

- **删除** `package-lock.json` (避免与 pnpm 冲突)
- **保留并提交** `pnpm-lock.yaml`
- `pnpm-workspace.yaml` 中的构建配置**严禁删除**

---

## 📝 代码规范

项目已配置 ESLint 和 Prettier：

```bash
# 检查代码规范
pnpm lint

# 自动修复
pnpm lint:fix

# 格式化代码
pnpm format
```

---

## 🤝 贡献指南

欢迎贡献！请查看 [CONTRIBUTING.md](./docs-meta/CONTRIBUTING.md) 了解详情。

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

---

## 📄 许可证

MIT License - 详见 [LICENSE](./LICENSE)

---

## 🔗 相关链接

- [HUAT FSAC 官网](https://huat-fsac.eu.org)
- [GitHub 组织](https://github.com/HUAT-FSAC)
- [Astro 文档](https://docs.astro.build/)
- [Starlight 文档](https://starlight.astro.build/)
