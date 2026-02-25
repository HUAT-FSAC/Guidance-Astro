# ADR-001: 选择 Astro + Starlight 作为文档站技术栈

## 状态

已采纳

## 背景

HUAT FSAC 车队需要一个文档站点来承载技术文档、赛季归档、团队介绍和招新信息。核心需求：

- 中英文双语支持
- 以 MDX 为主的内容管理
- 高性能（静态生成，低 JS 开销）
- 部署简单（静态文件托管）
- 团队成员技术栈以前端为主，学习成本需可控

## 决策

采用 Astro 5 作为框架，Starlight 作为文档主题，部署到 Cloudflare Pages。

## 备选方案

| 方案 | 优势 | 劣势 |
|------|------|------|
| Astro + Starlight | 零 JS 静态输出、内置 i18n/搜索/侧边栏、MDX 原生支持、Cloudflare Pages 一键部署 | 生态相对年轻，自定义组件需覆盖 Starlight 默认实现 |
| VitePress | Vue 生态成熟、配置简单 | i18n 需手动配置、自定义首页灵活度低 |
| Docusaurus | React 生态、插件丰富 | 构建产物含大量 JS、冷启动慢、配置复杂 |
| Next.js + MDX | 全栈能力强、SSR/ISR 灵活 | 文档场景过度工程化、运行时成本高 |

## 影响

- 正面：构建产物接近零 JS，Lighthouse 性能分数稳定在 90+；Starlight 内置的搜索、侧边栏、TOC 减少了大量自定义开发；Cloudflare Pages 免费额度足够团队使用
- 负面：需要覆盖 Starlight 组件（PageFrame、MarkdownContent、PageTitle）来实现自定义功能（阅读进度、分享按钮、面包屑）；View Transitions 下的客户端生命周期管理需要额外注意

## 参考

- [Astro 文档](https://docs.astro.build)
- [Starlight 文档](https://starlight.astro.build)
- [Cloudflare Pages](https://pages.cloudflare.com)
