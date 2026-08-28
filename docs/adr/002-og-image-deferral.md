# ADR-002: 动态 og:image 延期方案

## 状态

已采纳（延期）

## 背景

- `astro.config.mjs:147` 全站 `og:image` / `twitter:image` 固定为 `https://huat-fsac.eu.org/og-image.png`（`public/og-image.png` 583KB 静态文件），满足 `TODOLIST.md:216` P1.1 静态 OG/Twitter 已完成。
- `TODOLIST.md:218` 动态 `og:image`（按页面标题/封面生成个性化预览图）标记为“待按需生成”，`docs/WORKFLOW.md:65` T-003 要求文档化延期方案。
- 站点已切 Workers SSR（`docs/adr/001-astro-starlight-tech-stack.md:7`），具备按请求动态生成图片的运行时能力，但当前流量以站内文档为主，社交分享以固定品牌图已可接受；引入动态生成会增加依赖与构建/运行时成本。

## 决策

延期实现动态 `og:image`，保留静态 `public/og-image.png` 作为全站默认，满足 `astro.config.mjs:147` 现有 `og:image` / `og:url` 配置。

触发后再按以下方案实施，不提前投入：

- **静态兜底**：`public/og-image.png` 继续作为 `og:image` 默认值，确保微信/QQ/ Twitter `summary_large_image` 有图。
- **动态能力预研**：已验证 `astro.config.mjs` SSR 下可通过 Worker 端 `GET /og/:slug.png` 按 `title` + `description` 实时渲染（候选：`satori` + `sharp` 或 `astro-og-canvas`），但暂不接入 `build`。
- **触发条件**：任一达成即重议
    1. 社交分享点击率 < 阈值且运营侧明确需要按篇定制封面
    2. 文档日 PV > 5k 且 SEO 评估显示个性化 OG 对收录/外链有显著收益
    3. 有可复用的品牌模板（标题 + 车队色 + LOGO）且设计资源到位
- **验收标准（实施时）**
    - `pnpm build` 增量 < 10s，`dist/client` 增量 < 500KB 或走 Worker 动态路由不落地静态
    - 生成图 1200×630，`content-type: image/png`，文本无乱码（中文 `Noto Sans SC` 子集）
    - `curl -sI https://huat-fsac.eu.org/<page>/ | grep og:image` 指向对应图，`curl -s https://huat-fsac.eu.org/og/<slug>.png | file -` 为 PNG
    - `src/middleware.ts` CSP 兼容（`img-src` 已含 `https:`，无需改 `style-src`）

## 备选方案

| 方案                                      | 优势                                                                  | 劣势                                                                       |
| ----------------------------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| A 静态固定图（当前）                      | 零成本、零运行时、构建快、缓存友好（`public/og-image.png` immutable） | 各页面分享预览一致，无法突出单篇标题                                       |
| B 构建时批量生成（`satori` + `sharp`）    | 每页一张静态 PNG，CDN 命中高，无运行时开销                            | 构建时间 + 产物体积随页数线性增长（200 页 ≈ +30MB），增量构建复杂          |
| C Worker 动态路由（`GET /og/[slug].png`） | 按需生成，产物小，支持标题动态排版                                    | 首次命中需 Worker CPU（`nodejs_compat`）、字体子集管理、边缘缓存策略需设计 |

## 影响

- 正面：避免过早复杂化，`pnpm build` 保持 7s 级（`quality:bundle` 已紧），`dist/server/entry.mjs` 不引入 `satori`/`sharp` 大体积依赖；线上 `og:image` 已可用，`lighthouse` / `quality:theme` 不受影响。
- 负面：单篇分享无法展示标题差异，SEO 外链展示一致；需在 `docs/WORKFLOW.md:7` 留痕，后续重议时需评估字体与缓存。

## 参考

- `astro.config.mjs:147` / `public/og-image.png` / `dist/server/chunks/translations_qcqmP1T9.mjs:1277`
- `docs/TODOLIST.md:214` P1.1 / `docs/WORKFLOW.md:65` T-003 / `docs/adr/001-astro-starlight-tech-stack.md:7`
- `docs/DEPLOYMENT.md:103` 分享验证（静态 OG 已满足 `Open Graph Checker`）
