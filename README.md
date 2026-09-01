# HUAT FSAC · Guidance Astro

> 基于 **Astro 7 + Starlight** 构建的 HUAT 方程式赛车队(Formula Student)官方文档站点。
> 中英双语 · Cloudflare Workers SSR · PWA · 多主题 · Pagefind 搜索 · CSP nonce 加固。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Deploy](https://img.shields.io/badge/Deploy-Cloudflare%20Workers-orange)](https://huat-fsac.eu.org)
[![Node](https://img.shields.io/badge/node-22.23.2-brightgreen)](./.nvmrc)
[![pnpm](https://img.shields.io/badge/pnpm-11.22.0-blue)](https://pnpm.io)
[![Last commit](https://img.shields.io/github/last-commit/HUAT-FSAC/Guidance-Astro)](https://github.com/HUAT-FSAC/Guidance-Astro/commits/main)
[![Issues](https://img.shields.io/github/issues/HUAT-FSAC/Guidance-Astro)](https://github.com/HUAT-FSAC/Guidance-Astro/issues)
[![PRs](https://img.shields.io/github/issues-pr/HUAT-FSAC/Guidance-Astro)](https://github.com/HUAT-FSAC/Guidance-Astro/pulls)
[![Analytics](https://img.shields.io/badge/Analytics-Umami-blue)](https://cloud.umami.is/share/ADsMBsz2WVJPbqjO)

🇬🇧 [English](./README.en.md) · 🇨🇳 **简体中文**(本文件)

> ⚠️ 线上服务由 **Cloudflare Worker SSR** 提供(`output: server` + `@astrojs/cloudflare`):
> `wrangler deploy --config dist/server/wrangler.json` 由 GitHub Actions `push main` → `deploy` job 触发(详见 [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md))。
> `*.pages.dev` 域返回 404 为预期行为,请勿删除 zone 内的 `huat-fsac.eu.org` DNS 记录。

---

## ✨ 特性

- 🚀 **高性能** — Astro 7 + Vite terser + 代码分割,首屏零 JS
- 📱 **PWA** — 离线访问 / 安装到桌面,Service Worker 智能缓存
- 🌐 **国际化** — 中英文双语,`src/content/docs/{zh,en}/`
- 🎨 **多主题** — 经典橙 / 电竞蓝 / 赛道红 / 科技紫 / 极速绿
- ♿ **可访问性** — WCAG AA,移动端触摸目标优化
- 📊 **分析集成** — Umami Analytics 事件追踪
- 🔍 **全文搜索** — Pagefind 驱动的站内搜索 + 建议 + 高亮
- 🔒 **安全加固** — CSP(base64url nonce)+ HSTS + 安全响应头 + Worker 边缘配置
- 🤖 **质量门禁** — Husky + commitlint + lint-staged + Vitest + Playwright + ESLint + Prettier

---

## 🚀 快速开始

### 环境要求

- **Node.js** `22.23.2`(参见 [`.nvmrc`](./.nvmrc),`engines` 要求 `>=22.0.0`)
- **pnpm** `11.22.0`(`packageManager` 字段)
- **Wrangler** `4.114.0`(部署用,本地 `dev:worker` 不强制)

### 本地开发

```bash
git clone https://github.com/HUAT-FSAC/Guidance-Astro.git
cd Guidance-Astro
pnpm install
pnpm dev                 # http://localhost:4321
```

### 常用命令

| 命令                                | 说明                                                              |
| ----------------------------------- | ----------------------------------------------------------------- |
| `pnpm dev`                          | 启动开发服务器                                                    |
| `pnpm build`                        | 构建生产版本(产物在 `dist/`)                                      |
| `pnpm preview`                      | 本地预览构建结果(静态)                                            |
| `pnpm preview:ssr`                  | 用 Wrangler 本地跑 SSR                                            |
| `pnpm lint` / `pnpm lint:fix`       | ESLint 检查 / 自动修复                                            |
| `pnpm format` / `pnpm format:check` | Prettier 格式化 / 校验                                            |
| `pnpm test:run`                     | Vitest 单元测试(单次)                                             |
| `pnpm test:coverage`                | 覆盖率报告(70/60/70/70 阈值)                                      |
| `pnpm test:e2e`                     | Playwright 端到端测试                                             |
| `pnpm quality:bundle`               | 构建体积预算                                                      |
| `pnpm quality:theme`                | 主题对比度                                                        |
| `pnpm quality:lighthouse`           | Lighthouse CI 断言                                                |
| `pnpm deploy:worker`                | `build` + `wrangler deploy`(需 `CLOUDFLARE_API_TOKEN/ACCOUNT_ID`) |
| `make help`                         | 列出所有 `make` 快捷命令(`make dev/build/ci/deploy/secret-scan`)  |

---

## 📁 项目结构

```text
Guidance-Astro/
├── README.md            # 本文件(中文)
├── README.en.md         # English version
├── LICENSE              # MIT
├── CONTRIBUTING.md      # 贡献指南
├── CODE_OF_CONDUCT.md   # 行为准则
├── SUPPORT.md           # 支持渠道
├── SECURITY.md          # 安全漏洞上报
├── CHANGELOG.md         # 版本记录
├── .editorconfig        # 编辑器风格统一
├── .nvmrc               # Node 版本
├── .github/             # Issue / PR 模板 + CI + Dependabot
├── public/              # 静态资源(PWA、favicon、_headers)
├── src/                 # 站点源码
│   ├── assets/          # 可优化的图片资源
│   ├── components/      # Astro 组件
│   ├── content/docs/    # 站点发布的 MDX(中英文)
│   ├── data/            # 主页、车辆、Showcase Lab 等数据
│   └── pages/           # 路由页面
├── scripts/             # 构建与质量脚本
├── tests/               # Vitest 单元 + Playwright E2E
├── docs/                # 仓库文档(部署、ADR、计划、报告)
└── openwiki/            # 由定时工作流自动生成的证据索引(勿手改)
```

> 站点正文在 [`src/content/docs/`](./src/content/docs/)。
> 仓库自身开发文档在 [`docs/`](./docs/)。
> [`openwiki/`](./openwiki/) 由 GitHub Actions 定时刷新,请勿手改。

---

## 🛠️ 开发指南

### MDX 编写规范

**特殊字符转义**:表格内 `<` 需转义:

- ❌ `| <1A |` · ✅ `| \<1A |` 或 `| \`<1A\` |`

**Aside 组件类型**(Starlight):支持 `note / tip / caution / danger`,**不**支持 `warning`。

### 静态资源管理

文档图片请放在 `src/assets/docs/<年份>/<模块>/`,引用方式:

```mdx
import { Image } from 'astro:assets'
import myImage from '../../assets/docs/2025/感知/lidar-setup.png'

<Image src={myImage} alt="激光雷达安装示意图" />
```

### 依赖与构建 (pnpm)

- **删除** `package-lock.json`(避免与 pnpm 冲突)
- **保留并提交** `pnpm-lock.yaml`
- `pnpm-workspace.yaml` 中的构建配置**严禁删除**

---

## 🤝 贡献

欢迎贡献!完整流程见 [CONTRIBUTING.md](./CONTRIBUTING.md)。速查:

1. Fork 仓库 → 创建分支 `type/area/desc`
2. 提交时遵循 [Conventional Commits](https://www.conventionalcommits.org/)
3. 推送后提 PR,关联 Issue(若有)
4. 通过 [`docs/WORKFLOW.md §6 质量门禁`](./docs/WORKFLOW.md#6-质量门禁definition-of-done) 后合并

提 PR 前请阅读 [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)。

---

## 📚 文档

| 文件                                                           | 说明                          |
| -------------------------------------------------------------- | ----------------------------- |
| [CONTRIBUTING.md](./CONTRIBUTING.md)                           | 如何搭建环境、提交代码与开 PR |
| [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)                     | 社区行为准则                  |
| [SUPPORT.md](./SUPPORT.md)                                     | 提问、讨论、联系方式          |
| [SECURITY.md](./SECURITY.md)                                   | 安全漏洞的私下上报方式        |
| [CHANGELOG.md](./CHANGELOG.md)                                 | 版本变更记录                  |
| [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)                     | 部署说明                      |
| [docs/WORKFLOW.md](./docs/WORKFLOW.md)                         | 开发流程与质量门禁            |
| [ARCHITECTURE.md](./ARCHITECTURE.md)                           | 系统架构与目录职责            |
| [docs/ROADMAP.md](./docs/ROADMAP.md)                           | 路线图与方向性 TODO           |
| [docs/adr/](./docs/adr/)                                       | 架构决策记录(ADR)             |
| [docs/CONTRIBUTING-content.md](./docs/CONTRIBUTING-content.md) | MDX/资产/侧边栏 编写规范      |

---

## 🔐 安全

**请勿**在公开 Issue 提交安全漏洞。请用 [GitHub Private Vulnerability Reporting](https://github.com/HUAT-FSAC/Guidance-Astro/security/advisories/new),详见 [SECURITY.md](./SECURITY.md)。

---

## 📄 许可证

[MIT](./LICENSE) © 2026 HUAT FSAC

---

## 🔗 相关链接

- [线上站点](https://huat-fsac.eu.org)
- [GitHub 组织](https://github.com/HUAT-FSAC)
- [Astro 文档](https://docs.astro.build/)
- [Starlight 文档](https://starlight.astro.build/)
