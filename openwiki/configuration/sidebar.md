---
type: concept
title: Sidebar Configuration
description: Navigation structure and sidebar configuration for the documentation site, including bilingual labels and auto-generated sections.
tags: [configuration, navigation, sidebar]
timestamp: 2026-04-15
---

# Sidebar Configuration

The sidebar configuration is defined in `.config/sidebar.mjs` (7531 bytes).

## Structure

The sidebar is an array of section objects, each containing items with optional nested subsections:

```javascript
export default [
    {
        label: '🏠 概览与入口',
        translations: { en: '🏠 Overview & Entry' },
        collapsed: false,
        items: [...]
    },
    // ... more sections
]
```

## Section Structure

### 1. Overview & Entry (概览与入口)

Top-level navigation for main pages:

| Label (ZH)              | Label (EN)               | Link                                    |
| ----------------------- | ------------------------ | --------------------------------------- |
| 🏠 首页                 | 🏠 Home                  | `/`                                     |
| 🤝 加入我们             | 🤝 Join Us               | `/join/`                                |
| 👥 团队                 | 👥 Team                  | `/team/`                                |
| 🚗 赛车                 | 🚗 Cars                  | `/cars/`                                |
| ℹ️ 关于 Formula Student | ℹ️ About Formula Student | `/about-fs/`                            |
| 📊 项目进度看板         | 📊 Project Board         | `/docs-center/运营与协作/项目进度看板/` |

### 2. Docs Center (文档中心)

Documentation center with nested operations section:

| Label (ZH)   | Label (EN)                 | Link                         |
| ------------ | -------------------------- | ---------------------------- |
| 文档中心     | Docs Center                | `/docs-center/`              |
| 入门         | Onboarding                 | `/docs-center/入门/`         |
| 流程与模板   | Processes & Templates      | `/docs-center/流程与模板/`   |
| 资源中心     | Resource Hub               | `/docs-center/资源中心/`     |
| 内容贡献指南 | Contributing Guide         | `/docs-center/contributing/` |
| 运营与协作   | Operations & Collaboration | `/docs-center/运营与协作/`   |
| 体验与反馈   | Feedback & Experience      | `/docs-center/体验与反馈/`   |

The "运营与协作" section is expanded with a nested item:

- 项目进度看板 → `/docs-center/运营与协作/项目进度看板/`

### 3. News (新闻动态)

Auto-generated section:

```javascript
{
    label: '📰 新闻动态',
    translations: { en: '📰 News' },
    collapsed: false,
    items: [{ autogenerate: { directory: 'news' } }],
}
```

Automatically includes all MDX files in `src/content/docs/news/`.

### 4. 2025 Season Docs (2025 赛季文档)

The largest section with nested subgroups for autonomous systems:

#### Autonomous Systems (无人系统组)

| Subgroup                          | Items                                                    |
| --------------------------------- | -------------------------------------------------------- |
| 感知 (Sensing)                    | Auto-generated from `archive/2025/sensing/`              |
| 定位建图 (Localization & Mapping) | Auto-generated from `archive/2025/localization-mapping/` |
| 规划控制 (Planning & Control)     | Auto-generated from `archive/2025/planning-control/`     |
| 仿真测试 (Simulation)             | Auto-generated from `archive/2025/simulation/`           |

#### Electrical (电气)

| Item   | Link                               |
| ------ | ---------------------------------- |
| 电池箱 | `/archive/2025/electrical/电池箱/` |
| 硬件   | `/archive/2025/electrical/硬件/`   |
| 线束   | `/archive/2025/electrical/线束/`   |
| 软件   | `/archive/2025/electrical/软件/`   |

#### Mechanical (机械)

| Item     | Link                                 |
| -------- | ------------------------------------ |
| 传动     | `/archive/2025/mechanical/传动/`     |
| 制动     | `/archive/2025/mechanical/制动/`     |
| 车架车身 | `/archive/2025/mechanical/车架车身/` |
| 转向悬架 | `/archive/2025/mechanical/转向悬架/` |

#### Management (项管)

| Item   | Link                               |
| ------ | ---------------------------------- |
| 新媒体 | `/archive/2025/management/新媒体/` |
| 营销   | `/archive/2025/management/营销/`   |
| 运营   | `/archive/2025/management/运营/`   |

## Auto-Generated Items

The `autogenerate` feature automatically creates sidebar items from content directories:

```javascript
{
    autogenerate: {
        directory: 'archive/2025/sensing'
    }
}
```

This scans `src/content/docs/archive/2025/sensing/` and creates sidebar entries for each MDX file.

## Collapsed State

Sections can be initially collapsed:

```javascript
{
    label: '感知',
    translations: { en: 'Sensing' },
    collapsed: true, // Initially collapsed
    items: [...]
}
```

When `collapsed: true`, the section starts folded. When `collapsed: false` or omitted, the section is expanded by default.

## Translations

All sidebar labels support bilingual translations:

```javascript
{
    label: '感知',
    translations: { en: 'Sensing' },
    // ...
}
```

The `label` is the default (Chinese), and `translations` provides localized versions.

## Adding New Sections

To add a new section to the sidebar:

1. Add a new object to the exported array in `.config/sidebar.mjs`
2. Include `label` and `translations`
3. Add `items` array with link entries or `autogenerate` directives

Example:

```javascript
{
    label: '新板块',
    translations: { en: 'New Section' },
    collapsed: false,
    items: [
        { label: '新页面', translations: { en: 'New Page' }, link: '/new-page/' },
    ],
}
```

## Related Pages

- [Astro Configuration](./astro-config.md)
- [Content Collections](../content/collections.md)
- [Internationalization](./i18n.md)
