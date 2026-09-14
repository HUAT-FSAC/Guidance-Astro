# Content Authoring Guide / 内容编写指南

> 本指南面向**写文档**的贡献者(技术组各模块、招新组、赛季归档)。
> 通用贡献流程见 [`CONTRIBUTING.md`](../.github/CONTRIBUTING.md);
> 开发与部署见 [`docs/WORKFLOW.md`](./WORKFLOW.md) 和 [`docs/DEPLOYMENT.md`](./DEPLOYMENT.md)。

---

## 1. 内容组织

```text
src/content/docs/
├── index.mdx                # 中文首页
├── about-fs.mdx             # 关于 FSAC
├── cars.mdx                 # 历代赛车
├── team.mdx                 # 团队
├── join.mdx                 # 招新
├── open-source-projects.mdx # 开源项目
├── 404.mdx                  # 404 页
├── docs-center/             # 文档中心(内部导航聚合)
├── en/                      # 英文镜像(与上述平行)
└── news/                    # 团队新闻(走 i18n)
```

> ⚠️ **不要**直接编辑 `src/content/docs/en/archive/`:它已被 `.gitignore` 排除,
> 属于历史脏数据,只用于保留原 URL 不 404。

### Frontmatter(Starlight 必填)

```mdx
---
title: 感知模块
description: 2025 赛季感知模块目标、传感器选型与算法简介
sidebar:
    order: 3
    badge:
        text: 新
        variant: tip
tableOfContents:
    minHeadingLevel: 2
    maxHeadingLevel: 3
---

你的内容...
```

字段说明:

- `title`:必填,出现在页面标题、TOC、侧边栏
- `description`:必填,影响 SEO meta description
- `sidebar.order`:越小越靠前
- `sidebar.badge`:可选,支持 `note / tip / dangerous / caution / success`

---

## 2. MDX 速查

### 2.1 特殊字符

- **表格内** `<` 必须转义:`| <1A |` ❌ → `| \<1A |` ✅
- 公式用 `$...$`(行内)/ `$$...$$`(块)
- 反引号代码:` `<script>...` `

### 2.2 Aside(替代 callout)

```mdx
import { Aside } from '@astrojs/starlight/components'

<Aside type="note">支持 note / tip / caution / danger,**不**支持 warning。</Aside>
```

### 2.3 Tabs(多方案对比)

```mdx
import { Tabs, TabItem } from '@astrojs/starlight/components'

<Tabs>
    <TabItem label="pnpm">pnpm install</TabItem>
    <TabItem label="npm">npm install</TabItem>
</Tabs>
```

### 2.4 Steps(线性流程)

```mdx
import { Steps } from '@astrojs/starlight/components'

<Steps>1. 第一步 2. 第二步 3. 第三步</Steps>
```

### 2.5 卡片网格

```mdx
import { Card, CardGrid } from '@astrojs/starlight/components'

<CardGrid>
    <Card title="快速开始" icon="rocket">
        3 分钟跑起来
    </Card>
    <Card title="架构" icon="puzzle">
        理解系统
    </Card>
</CardGrid>
```

### 2.6 链接

```mdx
[相对链接](../cars/) # 同语言站内
[跨语言链接](https://huat-fsac.eu.org/en/cars/)
[外部链接](https://github.com/HUAT-FSAC){target="\_blank" rel="noopener"}
```

---

## 3. 静态资源

### 3.1 目录约定

```text
src/assets/docs/
├── 2025/
│   ├── 感知/        # 模块名用中文,跟仓库其它素材一致
│   ├── 定位建图/
│   ├── 规控/
│   ├── 仿真测试/
│   ├── 电气/
│   ├── 机械/
│   └── 项管/
├── archive/         # 历史素材(可选保留)
└── videos/          # 视频(.mp4 / .webm)
```

> 模块名固定为**中文**,与线下文件夹结构一致;引用时无须翻译。

### 3.2 引用方式

**优先用** `astro:assets` 的 `<Image>`(自动压缩 + `width/height` 防 CLS):

```mdx
import { Image } from 'astro:assets'
import lidarSetup from '../../assets/docs/2025/感知/lidar-setup.png'

<Image src={lidarSetup} alt="激光雷达安装示意图" width={1200} />
```

> `width/height` 是**原始尺寸**,Astro 会按响应式断点输出 `srcset`。
> 不要再手写 `<img>`,除非这是纯 SVG 装饰。

**仅在需要**远程地址(CDN/Unsplash 等)时:

```mdx
<Image src="https://cdn.example.com/x.png" alt="..." inferSize />
```

### 3.3 提交前自检

- [ ] 图片已压缩:`pnpm exec sharp-cli -i src/assets/docs/.../x.png -o .../x.webp webp` 或 `scripts/optimize-images.mjs`
- [ ] 大图(>500KB)考虑拆分为多图或转为 AVIF/WebP
- [ ] 没有把 `public/` 的相对路径硬编码进 MDX(应该是 `src/assets/`)

---

## 4. 国际化(中英)

- **默认语言** = 中文,目录在 `src/content/docs/`(无前缀)
- **英文** 在 `src/content/docs/en/`,**文件名必须一一对应**
- **UI 字符串**(按钮、菜单)用 `src/content/i18n/<locale>.json`
- 翻译未跟上时:在 `en/<file>.mdx` 顶部加 `draft: true`,Starlight 会隐藏它(避免 SEO 抓取半成品)

---

## 5. 侧边栏 / 导航

侧边栏由 [`.config/sidebar.mjs`](../.config/sidebar.mjs) **集中**配置(不在 frontmatter 散落):

```js
// .config/sidebar.mjs
export default {
    docs: [
        {
            label: '关于车队',
            items: ['about-fs', 'team', 'cars'],
        },
        {
            label: '2025 赛季',
            autogenerate: { directory: 'seasons/2025' },
        },
    ],
}
```

要新增顶层分类 → 改 `.config/sidebar.mjs`;
只在现有分类下加页 → 让 `autogenerate` 自动扫。

---

## 6. 数据 vs 内容

| 类型                             | 放哪里                                | 适合                           |
| -------------------------------- | ------------------------------------- | ------------------------------ |
| 长期稳定、纯数据(奖项、车型尺寸) | `src/data/seasons/*.json` / `cars.ts` | TypeScript 类型校验,跨多页复用 |
| 文档叙事 + 偶发数据              | `src/content/docs/**.mdx` frontmatter | 写在文里更易维护               |
| 运行时配置(URL、Webhook)         | `src/config/**.ts`                    | 与代码版本同步                 |

> 如果某段数据只被一个 MDX 用,放 frontmatter;
> 如果被 ≥2 个 MDX 用,抽到 `src/data/`。

---

## 7. 提交前清单

- [ ] `pnpm build` 无 MDX 警告(常见:Aside type 拼写、未闭合标签)
- [ ] 中英文同步更新(或在 `en/` 加 `draft: true`)
- [ ] 新增图片已压缩、已放到 `src/assets/docs/<年份>/<模块>/`
- [ ] 修改了导航 → 已同步 `.config/sidebar.mjs`
- [ ] 大改动 → 在 PR 描述里粘贴 `pnpm build` 输出最后 10 行

---

## 8. 常见错误

| 错误                                                                 | 修正                                                |
| -------------------------------------------------------------------- | --------------------------------------------------- |
| `<Aside type="warning">`                                             | Starlight 不支持 `warning`,改 `caution` 或 `danger` |
| `<Image src="https://..." width={800} height={600}>` 但远端没设 CORS | 改用本地 `src/assets/`,或加 `inferSize`             |
| 表格内写 `<1A>` 报错                                                 | 写 `\<1A` 或 `` `<1A` ``                            |
| 在 `en/` 加新页但中文没建                                            | 强制要求**双向**同步,或加 `draft: true`             |
| 把 SVG 直接放 `public/` 引用                                         | 尽量走 `src/assets/`;`public/` 仅放 PWA / 第三方    |
| 在 frontmatter 写 JSX                                                | frontmatter 只能是 YAML,组件要写在 `---` 下面       |
