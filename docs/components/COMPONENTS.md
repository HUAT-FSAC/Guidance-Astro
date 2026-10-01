# 组件库文档

本文档介绍 HUAT FSAC 网站的所有公共组件及其使用方法。

## 目录

- [首页组件](#首页组件)
    - [Hero](#hero)
    - [Achievement](#achievement)
    - [Features](#features)
    - [NewsSection](#newssection)
    - [Seasons](#seasons)
    - [Sponsors](#sponsors)
    - [Recruitment](#recruitment)
    - [FormulaStudentInfo](#formulastudentinfo)
    - [Stats](#stats)
    - [Acknowledgement](#acknowledgement)
- [UI 组件](#ui-组件)
    - [ThemeSwitcher](#themeswitcher)
    - [BackToTop](#backtotop)
    - [KeyboardNav](#keyboardnav)
    - [ParticleBackground](#particlebackground)
    - [MobileNavigation](#mobilenavigation)
    - [ScrollProgress](#scrollprogress)
- [文档组件](#文档组件)
    - [ImageLightbox](#imagelightbox)
    - [Breadcrumbs](#breadcrumbs)
    - [ReadingProgress](#readingprogress)

---

## 首页组件

### Hero

英雄区域组件，展示网站主要信息。

**文件位置**: `src/components/home/sections/Hero.astro`

**Props**:

```typescript
interface Props {
    title: string // 主标题
    subtitle?: string // 副标题
    description?: string // 描述文字
    ctaText: string // 按钮文字
    ctaLink: string // 按钮链接
    backgroundImage?: string // 背景图片 URL
}
```

**使用示例**:

```astro
---
import Hero from '../../components/home/sections/Hero.astro';
---

<Hero
  title="HUAT FSAC"
  subtitle="无人驾驶方程式赛车队"
  description="我们是一群充满激情的工程学子..."
  ctaText="开始探索"
  ctaLink="/docs"
  backgroundImage="https://images.unsplash.com/..."
/>
```

**功能特点**:

- 响应式设计，支持移动端
- 打字机效果动画
- 背景图片懒加载
- 亮色/暗色主题适配

---

### Achievement

成就展示组件，展示团队成就。

**文件位置**: `src/components/home/sections/Achievement.astro`

**Props**:

```typescript
interface Props {
    badge?: string // 徽章文字
    title: string // 标题
    description: string // 描述
    ctaText: string // 按钮文字
    ctaLink: string // 按钮链接
    image: string // 图片 URL
    reverse?: boolean // 是否反转布局
}
```

**使用示例**:

```astro
---
import Achievement from '../../components/home/sections/Achievement.astro';
---

<Achievement
  badge="2024赛季"
  title="全国一等奖"
  description="在2024赛季 Formula Student 中国赛中获得全国一等奖..."
  ctaText="查看详情"
  ctaLink="/achievements"
  image="https://images.unsplash.com/..."
  reverse={false}
/>
```

---

### Features

核心模块展示组件。

**文件位置**: `src/components/home/sections/Features.astro`

**使用示例**:

```astro
---
import Features from '../../components/home/sections/Features.astro';
---

<Features />
```

---

### NewsSection

新闻动态展示组件。

**文件位置**: `src/components/home/sections/NewsSection.astro`

**Props**:

```typescript
interface Props {
    title: string // 标题
    subtitle?: string // 副标题
    news: NewsItem[] // 新闻列表
}

interface NewsItem {
    title: string
    description: string
    image: string
    link: string
    date?: string
}
```

**使用示例**:

```astro
---
import NewsSection from '../../components/home/sections/NewsSection.astro';

const newsItems = [
  {
    title: "新车研发启动",
    description: "2025赛季新车研发正式启动...",
    image: "https://images.unsplash.com/...",
    link: "/news/new-car-development",
    date: "2024-11"
  }
];
---

<NewsSection
  title="新闻动态"
  subtitle="保持更新，了解最新进展"
  news={newsItems}
/>
```

---

### Seasons

赛季回顾组件，展示历年赛季信息。

**文件位置**: `src/components/home/sections/Seasons.astro`

**Props**:

```typescript
interface Props {
    seasons: SeasonItem[]
}

interface SeasonItem {
    year: string
    teamImg: string
    carImg: string
    advisor?: string
    captain?: string
    members?: {
        group: string
        names: string[]
    }[]
}
```

**使用示例**:

```astro
---
import Seasons from '../../components/home/sections/Seasons.astro';
import { seasons } from '../../data/seasons/2025.json';
---

<Seasons seasons={seasons} />
```

---

### Sponsors

赞助商展示组件。

**文件位置**: `src/components/home/sections/Sponsors.astro`

**Props**:

```typescript
interface Props {
    groups: SponsorGroup[]
}

interface SponsorGroup {
    name: string
    items: {
        title: string
        logo: string
        link?: string
    }[]
}
```

**使用示例**:

```astro
---
import Sponsors from '../../components/home/sections/Sponsors.astro';
import { sponsorGroups } from '../../data/sponsors.json';
---

<Sponsors groups={sponsorGroups} />
```

---

### Recruitment

招新入口组件。

**文件位置**: `src/components/home/sections/Recruitment.astro`

**使用示例**:

```astro
---
import Recruitment from '../../components/home/sections/Recruitment.astro';
---

<Recruitment />
```

---

### FormulaStudentInfo

Formula Student 介绍组件。

**文件位置**: `src/components/home/sections/FormulaStudentInfo.astro`

**Props**:

```typescript
interface Props {
    title: string
    subtitle?: string
    description: string
    ctaText: string
    ctaLink: string
}
```

**使用示例**:

```astro
---
import FormulaStudentInfo from '../../components/home/sections/FormulaStudentInfo.astro';
---

<FormulaStudentInfo
  title="什么是 Formula Student"
  subtitle="全球大学生顶级工程设计竞赛"
  description="Formula Student（又称 Formula SAE）是一项面向全球大学生的顶级工程设计竞赛..."
  ctaText="了解更多"
  ctaLink="/about-fs"
/>
```

---

### Stats

统计数据展示组件。

**文件位置**: `src/components/home/sections/Stats.astro`

**Props**:

```typescript
interface Props {
    stats: {
        value: string
        label: string
        icon?: string
    }[]
}
```

**使用示例**:

```astro
---
import Stats from '../../components/home/sections/Stats.astro';

const stats = [
  { value: "5", label: "年历程", icon: "🏆" },
  { value: "50+", label: "名队员", icon: "👥" },
  { value: "10+", label: "家赞助商", icon: "🤝" },
  { value: "20+", label: "项荣誉", icon: "🎖️" }
];
---

<Stats {stats} />
```

---

### Acknowledgement

致谢组件。

**文件位置**: `src/components/home/sections/Acknowledgement.astro`

**使用示例**:

```astro
---
import Acknowledgement from '../../components/home/sections/Acknowledgement.astro';
---

<Acknowledgement />
```

---

## UI 组件

### ThemeSwitcher

主题切换组件，支持亮色/暗色模式和主题色切换。

**文件位置**: `src/components/home/ui/ThemeSwitcher.astro`

**使用示例**:

```astro
---
import ThemeSwitcher from '../../components/home/ui/ThemeSwitcher.astro';
---

<ThemeSwitcher />
```

**功能特点**:

- 亮色/暗色模式切换
- 5 种主题色可选（经典橙、电竞蓝、赛道红、科技紫、极速绿）
- 自动保存用户偏好
- 键盘导航支持

---

### BackToTop

返回顶部组件。

**文件位置**: `src/components/home/ui/BackToTop.astro`

**使用示例**:

```astro
---
import BackToTop from '../../components/home/ui/BackToTop.astro';
---

<BackToTop />
```

---

### KeyboardNav

键盘导航提示组件。

**文件位置**: `src/components/home/ui/KeyboardNav.astro`

**使用示例**:

```astro
---
import KeyboardNav from '../../components/home/ui/KeyboardNav.astro';
---

<KeyboardNav />
```

---

### ParticleBackground

粒子背景效果组件。

**文件位置**: `src/components/home/ui/ParticleBackground.astro`

**使用示例**:

```astro
---
import ParticleBackground from '../../components/home/ui/ParticleBackground.astro';
---

<ParticleBackground />
```

---

### MobileNavigation

移动端导航组件。

**文件位置**: `src/components/home/ui/MobileNavigation.astro`

**使用示例**:

```astro
---
import MobileNavigation from '../../components/home/ui/MobileNavigation.astro';
---

<MobileNavigation />
```

---

### ScrollProgress

滚动进度指示器组件。

**文件位置**: `src/components/home/ui/ScrollProgress.astro`

**使用示例**:

```astro
---
import ScrollProgress from '../../components/home/ui/ScrollProgress.astro';
---

<ScrollProgress />
```

---

## 文档组件

### ImageLightbox

图片灯箱组件，支持图片对比。

**文件位置**: `src/components/docs/ImageLightbox.astro`

**使用示例**:

```astro
---
import ImageLightbox from '../../components/docs/ImageLightbox.astro';
---

<ImageLightbox
  src="https://images.unsplash.com/..."
  alt="图片描述"
/>

<!-- 图片对比示例 -->
<ImageCompare
  before="https://images.unsplash.com/...1"
  after="https://images.unsplash.com/...2"
  alt="前后对比"
/>
```

---

### Breadcrumbs

面包屑导航组件。

**文件位置**: `src/components/docs/Breadcrumbs.astro`

**Props**:

```typescript
interface Props {
    items: {
        label: string
        href?: string
    }[]
}
```

**使用示例**:

```astro
---
import Breadcrumbs from '../../components/docs/Breadcrumbs.astro';
---

<Breadcrumbs
  items={[
    { label: '文档中心', href: '/docs' },
    { label: '感知', href: '/docs/感知' },
    { label: '摄像头' }
  ]}
/>
```

---

### ReadingProgress

阅读进度组件。

**文件位置**: `src/components/docs/ReadingProgress.astro`

**使用示例**:

```astro
---
import ReadingProgress from '../../components/docs/ReadingProgress.astro';
---

<ReadingProgress />
```

---

## 工具函数

### storage.ts

安全的 localStorage 操作工具。

```typescript
import {
    safeGetItem,
    safeSetItem,
    safeRemoveItem,
    safeGetJSON,
    safeSetJSON,
} from '../utils/storage'

// 获取值
const value = safeGetItem('key', 'default')

// 设置值
safeSetItem('key', 'value')

// 获取 JSON
const data = safeGetJSON('key', { default: true })

// 设置 JSON
safeSetJSON('key', { data: true })
```

### image-optimization.ts

图片优化工具。

```typescript
import {
    optimizeExternalImage,
    generateSrcSet,
    getImageLoadingStrategy,
    getImageFetchPriority,
} from '../utils/image-optimization'

// 优化外部图片
const optimizedUrl = optimizeExternalImage(url, 1200, 85)

// 生成 srcset
const srcset = generateSrcSet(url, [400, 800, 1200])

// 获取加载策略
const loading = getImageLoadingStrategy(true) // "eager"
const priority = getImageFetchPriority(true) // "high"
```

### error-handling.ts

错误处理工具。

```typescript
import {
    registerErrorHandler,
    triggerError,
    createErrorInfo,
    wrapAsync,
    ErrorType,
} from '../utils/error-handling'

// 注册错误处理器
registerErrorHandler(ErrorType.COMPONENT_ERROR, (error) => {
    console.error('Component error:', error)
})

// 包装异步函数
const safeFetch = wrapAsync(fetchData, 'MyComponent')
```

### component-initialization.ts

组件初始化管理工具。

```typescript
import {
    initComponent,
    cleanupComponent,
    setupComponentLifecycle,
    initComponents,
} from '../utils/component-initialization'

// 初始化单个组件
initComponent('.my-component', (element) => {
    // 初始化逻辑
    return () => {
        // 清理逻辑
    }
})

// 设置组件生命周期
setupComponentLifecycle('.my-component', (element) => {
    // 初始化逻辑
    return () => {
        // 清理逻辑
    }
})

// 批量初始化
initComponents([
    { selector: '.component-1', initFn: fn1 },
    { selector: '.component-2', initFn: fn2 },
])
```

---

## 最佳实践

### 1. 组件导入

使用相对路径导入组件：

```astro
---
import Hero from '../components/home/sections/Hero.astro';
import { safeGetItem } from '../utils/storage';
---
```

### 2. 类型定义

在 `src/data/home.ts` 中定义组件 Props 类型：

```typescript
interface Props {
    title: string
    description?: string
}
```

### 3. 错误处理

使用 `try-catch` 包装可能出错的代码：

```typescript
try {
    // 可能出错的代码
} catch (error) {
    console.error('Error:', error)
}
```

### 4. 性能优化

- 非首屏图片使用 `loading="lazy"`
- 背景图片使用优化后的 URL
- 使用 `decoding="async"` 解码图片

### 5. 可访问性

- 为交互元素添加 `aria-label`
- 使用语义化 HTML 标签
- 确保键盘导航正常

---

**最后更新**: 2026-01-17
**版本**: 1.0.0
