# Architecture / 架构

> 给贡献者的"系统地图" — 在动手改代码前,先了解数据从哪来、经过哪里、最后怎么呈现。
> 详细信息散落在 [ADR](./docs/adr/)、[`docs/WORKFLOW.md`](./docs/WORKFLOW.md) 与 [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md)。

---

## 1. 一图概览

```text
                              ┌────────────────────────────┐
                              │  Cloudflare Edge (Worker)  │
   https://huat-fsac.eu.org  ▶│  src/middleware.ts (SSR)    │──▶  Cache-Control + CSP nonce
                              │  注入 nonce / 裁剪路由 CSS  │
                              └────────────┬───────────────┘
                                           │
                                           ▼
                  ┌────────────────────────────────────────────────────┐
                  │            Astro 7 (output: 'server')              │
                  │  astro.config.mjs                                   │
                  ├────────────────────────────────────────────────────┤
                  │  路由 (src/pages)          内容 (Starlight)         │
                  │  ├ index.astro (zh)        ├ content/docs/zh/**     │
                  │  ├ en/   (en)              ├ content/docs/en/**     │
                  │  └ …                      └ content.config.ts      │
                  ├────────────────────────────────────────────────────┤
                  │  组件 (src/components)                             │
                  │  ├ home / docs / navigation / overrides / icons    │
                  │  ├ contributing / showcase-lab / Giscus / ErrorBn  │
                  │  └ DocPage                                          │
                  ├────────────────────────────────────────────────────┤
                  │  数据 (src/data)        集成 (src/integrations)     │
                  │  ├ cars.ts              ├ critical-css.ts          │
                  │  ├ home.ts              ├ dedupe-css.ts            │
                  │  ├ seasons/*.json       ├ cloudflare-static-hdr…   │
                  │  ├ sponsors.json        └ filter-known-build-…     │
                  │  └ showcase-lab.ts                                │
                  ├────────────────────────────────────────────────────┤
                  │  配置 (src/config)        工具 (src/utils)          │
                  │  ├ security.ts (CSP/HSTS)├ i18n,image,perf…        │
                  │  └ monitoring.ts (告警)                            │
                  └────────────────────────────────────────────────────┘
                                           │
                                           ▼
                  ┌────────────────────────────────────────────────────┐
                  │   Build artifacts (dist/)                          │
                  │   ├ client/  静态资源 (PWA / favicon / og-image)   │
                  │   └ server/  entry.mjs + wrangler.json (Worker)     │
                  └────────────────────────────────────────────────────┘
```

---

## 2. 技术栈快照

| 层        | 选型                                                             | 关键文件                                                   | 备注                                        |
| --------- | ---------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------- |
| 框架      | **Astro 7.1.3** (`output: 'server'`)                             | [`astro.config.mjs:11`](./astro.config.mjs)                | SSR,默认零 JS                               |
| 适配器    | `@astrojs/cloudflare`                                            | `astro.config.mjs:12`                                      | 编译期图片 (`imageService: 'compile'`)      |
| 文档主题  | **Starlight 0.41**                                               | `src/content.config.ts`                                    | i18n/搜索/侧边栏/TOC                        |
| 部署      | **Cloudflare Workers SSR**                                       | [`dist/server/wrangler.json`](./dist/server/wrangler.json) | `pnpm deploy:worker`                        |
| 包管理    | **pnpm 11.22** + `pnpm-workspace.yaml`                           | `pnpm-workspace.yaml`                                      | 依赖白名单见 `onlyBuiltDependencies`        |
| 测试      | **Vitest 4.1** + **Playwright 1.61**                             | `vitest.config.ts` / `playwright.config.ts`                | 覆盖率阈值 70/60/70/70                      |
| 质量      | ESLint 9 + Prettier 3 + Husky 9 + commitlint 20 + lint-staged 15 | `.config/*`                                                | 提交时 ESLint + Prettier 走 lint-staged     |
| 分析/告警 | Umami + Feishu/WeCom Webhook                                     | `src/config/monitoring.ts`                                 | `checkPerformanceAndAlert`                  |
| 搜索      | Pagefind                                                         | 由 Starlight 自动集成                                      | `pnpm build` 后注入 `dist/client/pagefind/` |
| PWA       | 手写 Service Worker + manifest                                   | `public/sw.js` / `public/manifest.json`                    | 智能缓存策略(见 `_headers`)                 |

> 详细选型理由:见 [`docs/adr/001-astro-starlight-tech-stack.md`](./docs/adr/001-astro-starlight-tech-stack.md)。

---

## 3. 目录与职责

```text
.
├── astro.config.mjs          # Astro/Starlight/purgecss 集成入口
├── wrangler.json             # 顶层 CF 资源(若用 Pages 兼容层);实际部署用 dist/server/wrangler.json
├── .config/                  # 集中配置(sidebar / vitest / playwright / lighthouserc / lint-staged / commitlint)
├── public/                   # 不参与构建的静态资源(favicon、og-image、sw.js、_headers)
├── src/
│   ├── middleware.ts         # 每请求 CSP nonce + 路由级 CSS 裁剪 + 安全响应头
│   ├── content.config.ts     # Starlight content collections(zh/en)
│   ├── env.d.ts              # Astro env 类型
│   ├── assets/               # 可优化图片(经 sharp 处理)
│   │   ├── docs/<year>/<module>/  # 文档插图
│   │   └── code/             # 代码截图
│   ├── components/
│   │   ├── home/             # 首页 Hero / Stats / TeamMembers / JoinUs / ShowcaseLab
│   │   ├── docs/             # ImageLightbox / PageTitle / 等阅读体验组件
│   │   ├── navigation/       # 顶栏 / 侧边栏
│   │   ├── overrides/        # Starlight 默认组件覆盖(PageFrame / MarkdownContent)
│   │   ├── showcase-lab/     # Showcase Lab 演示组件
│   │   ├── contributing/     # 贡献者榜单(由 GitHub API 注入)
│   │   ├── icons/            # SVG 图标合集
│   │   ├── DocPage.astro     # 自定义文档页布局
│   │   ├── ErrorBoundary.astro
│   │   └── Giscus.astro      # 评论(条件加载)
│   ├── content/
│   │   ├── docs/             # zh 内容(默认 locale)
│   │   ├── docs/en/          # en 内容
│   │   ├── docs-center/      # 文档中心(多语言导航)
│   │   ├── news/             # 团队新闻(由 i18n 文件渲染)
│   │   └── i18n/             # UI 字符串(zh/en)
│   ├── data/
│   │   ├── cars.ts           # 历代赛车元数据
│   │   ├── home.ts           # 首页多语言文案
│   │   ├── seasons/*.json    # 赛季历史(2023/2024/2025)
│   │   ├── sponsors.json     # 赞助商
│   │   └── showcase-lab*.ts  # Showcase Lab 数据
│   ├── pages/                # 自定义路由(非 Starlight)
│   │   ├── index.astro       # 中文首页
│   │   └── en/               # 英文首页
│   ├── styles/               # 全局 / 文档 / 主题 / 排版样式
│   ├── types/                # 共享 TS 类型
│   ├── utils/                # i18n / 性能 / 图片 / 字符串工具
│   ├── config/
│   │   ├── security.ts       # CSP nonce 生成、applyStandardHeaders、isCSPValid
│   │   └── monitoring.ts     # Web Vitals + 告警 Webhook(Feishu/WeCom)
│   └── integrations/         # 自定义 Vite/Astro 集成
│       ├── critical-css.ts   # 首屏 CSS 内联
│       ├── dedupe-css.ts     # CSS 去重
│       ├── cloudflare-static-headers.ts
│       ├── cloudflare-redirects.ts
│       └── filter-known-build-warnings.ts
├── scripts/                  # 离线脚本(check-bundle-budget / check-theme-contrast / collect-metrics)
├── tests/                    # tests/unit (Vitest) + tests/e2e (Playwright)
└── docs/                     # 仓库自身文档(ADR / 计划 / 报告)
    ├── WORKFLOW.md           # 开发流程 + 任务看板 SSOT
    ├── DEPLOYMENT.md         # 部署与回滚
    ├── PROJECT_MANAGEMENT_MODEL.md
    ├── VERSION_CONTROL_POLICY.md
    ├── adr/                  # 架构决策记录
    ├── agents/               # Agent 子流程(domain / issue-tracker / triage)
    ├── plans/                # 设计/计划
    └── reports/              # 报告与归档
```

---

## 4. 请求生命周期(SSR)

```text
client GET /
  │
  ▼
Cloudflare Edge → Worker 'huat-fsac' (wrangler.json:1)
  │
  ▼
src/middleware.ts onRequest
  ├─ generateNonce()                      # base64url, 16 字节
  ├─ ctx.locals.cspNonce = nonce
  ├─ next()                               # 进入 Astro 渲染
  │     │
  │     ▼
  │   Astro route → Starlight → MDX render
  │     │
  │     ▼
  │   <script> 注入 nonce="…"
  │
  ├─ pruneRouteCss(html, pathname)        # 切语言时去掉对方 CSS(~18KB)
  └─ applyStandardHeaders(res, …)
        ├─ Content-Security-Policy: nonce-…
        ├─ Strict-Transport-Security: max-age=31536000
        ├─ X-Content-Type-Options: nosniff
        ├─ Referrer-Policy: strict-origin-when-cross-origin
        ├─ Cache-Control: private, no-cache, must-revalidate  (HTML)
        └─ Cache-Control: public, max-age=31536000, immutable   (_astro/*)
  │
  ▼
client (HTML 携带 nonce → 内联脚本通过 CSP)
```

> HTML 必须 `private, no-cache, must-revalidate`:nonce 每请求不同,禁止 CDN 共享缓存。
> `_astro/*` 走 `immutable`:Vite 带 hash 指纹,永久缓存安全(由 `@astrojs/cloudflare` 自动注入)。

---

## 5. 构建流水线

```text
pnpm build
  │
  ├─ Vite 构建
  │   ├─ 静态资源 (dist/client/_astro/*.{js,css,webp,avif})
  │   ├─ dedupe-css 集成(节省 ~34KB)
  │   ├─ critical-css 集成(首屏内联)
  │   └─ filter-known-build-warnings 集成(过滤已知第三方警告)
  │
  ├─ @astrojs/cloudflare
  │   ├─ 生成 dist/server/entry.mjs (Worker 入口)
  │   ├─ 生成 dist/server/wrangler.json (assets binding ASSETS→../client)
  │   └─ 注入 _headers(immutable for /_astro/*)
  │
  ├─ @astrojs/sitemap → dist/client/sitemap-index.xml
  │
  └─ Starlight 注入 Pagefind → dist/client/pagefind/

最终产物:
  dist/
    client/                 # 上传到 Cloudflare Assets
    server/entry.mjs        # Worker 入口
    server/wrangler.json    # wrangler 部署配置
```

部署命令:

```bash
pnpm deploy:worker         # = pnpm build && wrangler deploy --config dist/server/wrangler.json
```

详见 [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md)。

---

## 6. 数据流(以"赛季档案"为例)

```text
content collection
  src/content/docs/zh/seasons/2024.mdx  (MDX,内联 frontmatter)
  ──────────────────────────────────────
  Starlight loader 解析 frontmatter
  ──────────────────────────────────────
  src/components/home/sections/Seasons.astro
       ├ 读 src/data/seasons/2024.json(纯数据:奖项、车型、首图)
       └ 读 MDX frontmatter(标题、摘要、日期)
  ──────────────────────────────────────
  在首页 / 文档页对应路由渲染
  ──────────────────────────────────────
  Astro build → 静态 HTML
```

> ⚠️ 团队成员/联系方式等**个人信息**应直接维护在 `src/data/seasons/*.json` 或 MDX frontmatter 内,
> 不要硬编码在组件里(便于多语言复用 + 隐私保护)。

---

## 7. 测试架构

| 层级   | 工具             | 入口                        | 覆盖范围                                      |
| ------ | ---------------- | --------------------------- | --------------------------------------------- |
| 单元   | Vitest 4         | `tests/unit/**`             | `src/utils`、`src/config`、`src/integrations` |
| 组件   | Vitest 4 (jsdom) | `tests/unit/components/**`  | Astro 组件 props 与渲染                       |
| 端到端 | Playwright 1.6   | `tests/e2e/**`              | 关键路径:首页/搜索/PWA/语言切换/移动端导航    |
| 视觉   | Lighthouse CI    | `.config/lighthouserc.json` | 性能 ≥ 0.85(可配),SEO/可访问性                |
| 质量   | 自研脚本         | `scripts/quality/*`         | 包体积预算 / 主题对比度                       |

> 覆盖率门禁见 [`docs/WORKFLOW.md §6`](./docs/WORKFLOW.md#6-质量门禁definition-of-done);CI 拓扑见
> [`.github/workflows/ci-cd.yml`](./.github/workflows/ci-cd.yml)。

---

## 8. 安全模型(纵深防御)

| 层       | 措施                                                                                   | 责任文件                                       |
| -------- | -------------------------------------------------------------------------------------- | ---------------------------------------------- |
| 传输     | HTTPS-only + HSTS max-age=31536000                                                     | `src/config/security.ts`                       |
| 内容     | CSP nonce(每请求唯一) + 严格 source 列表                                               | `src/middleware.ts` · `src/config/security.ts` |
| 框架     | `X-Content-Type-Options: nosniff` + `Referrer-Policy: strict-origin-when-cross-origin` | `src/config/security.ts`                       |
| 缓存     | HTML `private, no-cache`;`_astro/*` `immutable`                                        | `src/middleware.ts` · `_headers`               |
| 依赖     | Dependabot weekly + `pnpm audit` + `pnpm-workspace.yaml overrides`                     | `.github/dependabot.yml`                       |
| 凭据     | `.dev.vars.example` 模板,真实 `.dev.vars` 已 `.gitignore`;CI 用 GitHub Secrets         | `.gitignore`                                   |
| 漏洞上报 | 私有 Advisory,见 [`SECURITY.md`](./SECURITY.md)                                        | `SECURITY.md`                                  |
| CSP 自检 | `isCSPValid()` 单测覆盖                                                                | `src/config/security.test.ts`                  |

---

## 9. 性能预算与监控

- **构建体积**:`pnpm quality:bundle`(JS/CSS/字体/og-image 上限)
- **Lighthouse**:`pnpm quality:lighthouse`(performance 0.85 error)
- **运行时**:Web Vitals(FCP/LCP/CLS/TTFB)→ Umami 事件 + 阈值告警(Feishu/WeCom)
- **CI 指标**:`collect-metrics.yml` 周度抓取 DORA-style 数据
- **协作通知**:`notify-collaboration.yml` PR 创建/合并/失败飞书+企微

---

## 10. 演进方向

参见 [`docs/ROADMAP.md`](./docs/ROADMAP.md) 与 [`docs/adr/`](./docs/adr/)。
新模块接入时,请:

1. 在 `docs/adr/` 新增 ADR,说明决策/备选/影响。
2. 在 `docs/WORKFLOW.md §4` 追加任务编号,登记负责人与状态。
3. 同步 `ARCHITECTURE.md` 目录树 / 流程图(本文件)。

> 本文档为"系统地图",不是"用户文档"。给最终用户看的内容放在 `src/content/docs/`,
> 给贡献者看的内容放在 [`docs/`](./docs/) 与 [`CONTRIBUTING.md`](./CONTRIBUTING.md)。
