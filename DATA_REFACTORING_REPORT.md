# P2.3 数据文件重构 - 完成报告

## 任务概述

将 `src/data/home.ts` 文件中大量硬编码的数据分离到独立的 JSON 文件，提高代码的可维护性和可扩展性，便于非技术人员更新数据。

## 完成日期

2026-01-08

## 实施方案

### 1. 创建赛季数据目录

创建了 `src/data/seasons/` 目录，用于存储各赛季的数据。

#### 文件结构

```
src/data/seasons/
├── 2025.json  # 2025 赛季数据
├── 2024.json  # 2024 赛季数据
└── 2023.json  # 2023 赛季数据
```

#### 数据结构

每个 JSON 文件包含一个赛季的完整数据：

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
        "names": [
          "潘世泉",
          "黄宇轩",
          "陈柏霖",
          "罗炯恒",
          "成杰",
          "刘文涛",
          "雷世豪",
          "汪智强",
          "闫博",
          "杨昌鑫",
          "涂伟麟"
        ]
      },
      {
        "group": "电气部",
        "names": [
          "许基天",
          "郑雨乐",
          "郑舟鑫",
          "周凌",
          "魏博",
          "于欣渤",
          "崔心怡",
          "汪雅兰",
          "刘定智",
          "吴民正",
          "何流"
        ]
      },
      {
        "group": "算法部",
        "names": [
          "陈子扬",
          "徐子达",
          "张鑫跃",
          "陈娟",
          "蔡俊翔",
          "卫冠杰",
          "金俊杰",
          "万仁成",
          "黄昭然"
        ]
      },
      {
        "group": "项管部",
        "names": [
          "房静琳",
          "熊傲然",
          "王颂扬"
        ]
      }
    ]
  }
]
```

### 2. 创建赞助商数据文件

创建了 `src/data/sponsors.json` 文件，用于存储赞助商数据。

#### 数据结构

```json
{
  "groups": [
    {
      "name": "核心赞助",
      "items": [
        {
          "title": "湖北汽车工业学院",
          "logo": "/assets/huat.jpg"
        }
      ]
    }
  ]
}
```

### 3. 更新 home.ts

修改 `src/data/home.ts`，从 JSON 文件导入数据。

#### 导入语句

```typescript
// ==================== 赛季展示 ====================
// 从 JSON 文件导入赛季数据
import seasons2025 from "./seasons/2025.json";
import seasons2024 from "./seasons/2024.json";
import seasons2023 from "./seasons/2023.json";

export const seasons: SeasonItem[] = [
    ...seasons2025,
    ...seasons2024,
    ...seasons2023,
];

// ==================== 赞助商 ====================
// 从 JSON 文件导入赞助商数据
import sponsorsData from "./sponsors.json";

export const sponsorGroups: SponsorGroup[] = sponsorsData.groups;
```

#### 保留内容

- 类型定义（`StatItem`, `SeasonItem`, `SponsorItem`, `SponsorGroup`, `NewsItem`, `AchievementItem`）
- Hero 配置
- 统计数据
- 成就数据
- 新闻数据
- Formula Student 介绍

## 验收结果

- ✅ 将赛季成员数据迁移到单独的 JSON 文件
- ✅ 将赞助商数据迁移到单独的 JSON 文件
- ✅ 便于非技术人员更新数据
- ✅ 保持类型安全
- ✅ 构建测试通过（`pnpm build`）

## 技术优势

### 1. 可维护性

- **分离关注点** - 数据与代码逻辑分离
- **易于更新** - 非技术人员可以直接编辑 JSON 文件
- **版本控制友好** - JSON 文件变更更清晰

### 2. 可扩展性

- **添加新赛季** - 只需创建新的 JSON 文件并导入
- **修改数据** - 不需要修改 TypeScript 代码
- **灵活的结构** - JSON 格式易于理解和修改

### 3. 类型安全

- **TypeScript 类型检查** - JSON 导入自动类型检查
- **接口定义** - 保留在 home.ts 中
- **编译时验证** - 数据结构错误在编译时发现

### 4. 代码简洁

- **减少代码行数** - home.ts 从 205 行减少到 137 行
- **更清晰的结构** - 数据文件独立管理
- **更好的组织** - 按赛季和赞助商分类

## 文件变更

### 新增文件
- `src/data/seasons/2025.json` - 2025 赛季数据
- `src/data/seasons/2024.json` - 2024 赛季数据
- `src/data/seasons/2023.json` - 2023 赛季数据
- `src/data/sponsors.json` - 赞助商数据

### 修改文件
- `src/data/home.ts` - 从 JSON 文件导入数据，减少代码行数

## 使用示例

### 添加新赛季

1. 创建新的 JSON 文件：
```bash
# src/data/seasons/2026.json
[
  {
    "year": "2026",
    "teamImg": "https://...",
    "carImg": "https://...",
    "advisor": "指导老师",
    "captain": "队长",
    "members": [...]
  }
]
```

2. 在 home.ts 中导入：
```typescript
import seasons2026 from "./seasons/2026.json";

export const seasons: SeasonItem[] = [
    ...seasons2025,
    ...seasons2024,
    ...seasons2023,
    ...seasons2026,  // 添加新赛季
];
```

### 更新赞助商

直接编辑 `src/data/sponsors.json`：
```json
{
  "groups": [
    {
      "name": "核心赞助",
      "items": [
        {
          "title": "湖北汽车工业学院",
          "logo": "/assets/huat.jpg"
        },
        {
          "title": "新赞助商",
          "logo": "/assets/new-sponsor.png"
        }
      ]
    }
  ]
}
```

## 后续建议

1. **使用 Content Collections**
   - 将新闻数据也迁移到 Content Collections
   - 利用 Astro 的内容管理功能
   - 支持前端路由和 SEO

2. **添加数据验证**
   - 使用 JSON Schema 验证数据结构
   - 添加单元测试验证数据完整性
   - 创建数据更新脚本

3. **国际化支持**
   - 为每个语言创建独立的 JSON 文件
   - 支持多语言数据
   - 根据语言动态加载

4. **数据管理工具**
   - 创建简单的数据管理界面
   - 支持在线编辑和预览
   - 自动生成 JSON 文件

5. **版本控制**
   - 为每个赛季创建版本标签
   - 支持历史数据查询
   - 记录数据变更历史

## 总结

通过将数据从 `home.ts` 分离到独立的 JSON 文件，我们实现了：

1. **更好的可维护性** - 数据与代码逻辑分离
2. **更高的可扩展性** - 易于添加新赛季和赞助商
3. **更强的类型安全** - TypeScript 类型检查确保数据正确
4. **更简洁的代码** - 减少了 home.ts 的代码行数
5. **更友好的更新方式** - 非技术人员可以直接编辑 JSON 文件

构建测试通过，所有功能正常工作。数据文件重构为项目提供了更好的数据管理基础。
