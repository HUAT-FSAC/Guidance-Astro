// ==================== 类型定义 ====================

export interface StatItem {
    value: string
    label: string
    icon?: string
    /** 年份类静态展示，不做计数动画（避免 2015 从 0 滚动） */
    static?: boolean
}

export interface RaceEvent {
    /** 赛事全称 */
    name: string
    /** 简短标签 */
    abbr: string
    /** 赛事地点 */
    location: string
    /** 赛事开始日期 ISO 8601，如 "2025-08-01" */
    startDate: string
    /** 赛事结束日期 */
    endDate: string
    /** 是否为当前重点备战赛事 */
    isPrimary?: boolean
}

export interface ThemeOption {
    name: string
    color: string
    accent: string
}

export interface SeasonSpec {
    label: string
    value: string
    col?: 'left' | 'right'
    fullWidth?: boolean
}

export interface SeasonItem {
    year: string
    carImg: string
    explainImg?: string
    specs?: SeasonSpec[]
    advisor?: string // 指导老师
    captain?: string // 队长
    members?: {
        // 成员分组
        group: string // 组别名称
        names: string[] // 成员名单
    }[]
}

export interface SponsorItem {
    title: string
    logo: string
    link?: string
}

export interface SponsorGroup {
    name: string
    items: SponsorItem[]
}

export interface NewsItem {
    title: string
    description: string
    image: string
    link: string
    date?: string
}

export interface AchievementItem {
    badge?: string
    title: string
    description: string
    ctaText: string
    ctaLink: string
    image: string
}

// ==================== Hero 区域配置 ====================
export const heroConfig = {
    title: 'HUAT FSAC',
    subtitle: '方程式赛车队',
    description:
        '我们是一群充满激情的工程学子，致力于设计、制造并驾驶无人驾驶方程式赛车。\n在 Formula Student 赛场上，我们追求卓越，挑战极限。',
    ctaText: '开始探索',
    ctaLink: '/2024-learning-roadmap/',
    backgroundImages: ['/assets/photo-together.jpg', '/assets/2023.jpg', '/assets/2022.jpg'],
}

// ==================== 统计数据 ====================
// 2015 为成立年份（静态展示，不作计数动画）；赛事经验自 2019 首次参赛至 2026 约 7 个赛季
export const stats: StatItem[] = [
    { value: '2015', label: '成立年份', static: true },
    { value: '50+', label: '团队成员' },
    { value: '7+', label: '年赛事经验' },
]

// ==================== 成就展示 ====================
export const achievements: AchievementItem[] = [
    {
        badge: '我们的赛车',
        title: '征服赛道',
        description:
            '欢迎来到 HUAT FSAC - 见证我们如何用前沿的电动和无人驾驶技术重新定义赛车运动。从概念设计到赛道验证，每一步都凝聚着我们对工程卓越的追求。',
        ctaText: '查看赛车',
        ctaLink: '/cars/',
        image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800',
    },
    {
        badge: '我们的团队',
        title: '创新与激情的交汇',
        description:
            '认识我们充满活力的工程学子团队，他们设计、制造并驾驶单座赛车。每年在 Formula Student 比赛中，我们都在挑战可能的边界，打造获胜的机器。',
        ctaText: '认识团队',
        ctaLink: '/team/',
        image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
    },
]

// ==================== 新闻动态 ====================
export const newsItems: NewsItem[] = [
    {
        title: '2024赛季圆满收官',
        description:
            '在本赛季的最后一场比赛中，我们取得了优异的成绩。感谢所有团队成员的辛勤付出和赞助商的大力支持！',
        image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600',
        link: '/news/2024-season-finale/',
        date: '2024年12月',
    },
    {
        title: '新一代赛车研发启动',
        description:
            '我们正式开始了新一代无人驾驶赛车的设计与研发工作，采用全新的感知融合方案和控制策略。',
        image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600',
        link: '/news/new-car-development/',
        date: '2024年11月',
    },
    {
        title: '技术分享：路径规划算法详解',
        description:
            '本期技术分享会上，规控组的同学为大家详细讲解了我们采用的路径规划算法及其优化过程。',
        image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600',
        link: '/news/path-planning/',
        date: '2024年10月',
    },
]

// ==================== Formula Student 介绍 ====================
export const formulaStudentInfo = {
    title: '探索 Formula Student 的世界',
    subtitle: 'FORMULA STUDENT',
    description:
        'Formula Student 是全球最顶尖的工程赛事之一，600多支队伍从零开始设计制造赛车。比赛不仅考验速度，更注重创新、可持续性和工程设计能力。',
    ctaText: '了解更多',
    ctaLink: '/about-fs/',
}

// ==================== 赛季展示 ====================
// 从 JSON 文件导入赛季数据
import seasons2025 from './seasons/2025.json'
import seasons2024 from './seasons/2024.json'
import seasons2023 from './seasons/2023.json'

export const seasons: SeasonItem[] = [...seasons2025, ...seasons2024, ...seasons2023]

// ==================== 赞助商 ====================
// 从 JSON 文件导入赞助商数据
import sponsorsData from './sponsors.json'

export const sponsorGroups: SponsorGroup[] = sponsorsData.groups

// ==================== 赛事配置 ====================
export const raceEvents: RaceEvent[] = [
    {
        name: '中国大学生方程式系列赛 2025',
        abbr: 'FSC 2025',
        location: '上海国际赛车场',
        startDate: '2025-09-01',
        endDate: '2025-09-05',
        isPrimary: true,
    },
]

// ==================== 首页内容聚合层（i18n） ====================
// 说明：src/content/docs/en/index.mdx 与 tests/unit/home-i18n.test.ts 依赖此聚合层。
// wsyhuat 分支引入了首页 section 组件与 mdx，但遗漏了该数据层，此处补齐。

export interface FeatureCardItem {
    href: string
    icon: string
    title: string
    description: string
}

export interface RecruitmentContent {
    badge: string
    title: string
    description: string
    departments: string[]
    ctaText: string
}

export interface ShowcaseContent {
    href: string
    title: string
    subtitle: string
    description: string
    features: string[]
    cta: string
    preview: {
        title: string
        subtitle: string
    }
}

export interface HomeContent {
    hero: {
        title: string
        subtitle: string
        description: string
        ctaText: string
        ctaLink: string
        backgroundImage: string
        backgroundImages: string[]
    }
    stats: StatItem[]
    showcase: ShowcaseContent
    achievements: AchievementItem[]
    sectionHeaders: {
        features: { label: string; title: string }
        seasons: { label: string; title: string }
        sponsors: { title: string }
        contributors: { label: string; title: string }
    }
    featureCards: FeatureCardItem[]
    newsItems: NewsItem[]
    seasonsLabels: { label: string; subtitle: string }
    recruitment: RecruitmentContent
    formulaStudentInfo: {
        title: string
        subtitle: string
        description: string
        ctaText: string
        ctaLink: string
    }
}

const zhShowcaseContent: ShowcaseContent = {
    href: '/showcase-dashboard/',
    title: '智能驾驶交互实验室',
    subtitle: 'AUTONOMOUS SHOWCASE',
    description:
        '用完全本地的数据、SVG 可视化和浏览器状态管理，直观展示无人驾驶赛车从感知到执行器的整条闭环。',
    features: ['多场景预设', '实时可视化', '离线演示'],
    cta: '进入实验室',
    preview: {
        title: '发车校准',
        subtitle: '传感器同步与车端自检的最后 12 秒',
    },
}

const enAchievements: AchievementItem[] = [
    {
        badge: 'OUR CARS',
        title: 'Conquer the Track',
        description:
            'Welcome to HUAT FSAC. See how cutting-edge electric and autonomous technology is reshaping racing, from concept design to track validation.',
        ctaText: 'View Our Cars',
        ctaLink: '/en/cars/',
        image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800',
    },
    {
        badge: 'OUR TEAM',
        title: 'Where Innovation Meets Passion',
        description:
            'Meet the engineering students who design, build and race single-seat cars. Every Formula Student season pushes us to expand what is possible.',
        ctaText: 'Meet the Team',
        ctaLink: '/en/team/',
        image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
    },
]

const enShowcaseContent: ShowcaseContent = {
    href: '/en/showcase-dashboard/',
    title: 'Autonomous Driving Lab',
    subtitle: 'AUTONOMOUS SHOWCASE',
    description:
        'Explore the complete autonomous racing loop through local data, SVG visualizations and browser-based state management—from perception to actuation.',
    features: ['Scenario presets', 'Live visualization', 'Offline demo'],
    cta: 'Enter the Lab',
    preview: {
        title: 'Launch Calibration',
        subtitle: 'The final 12 seconds of sensor sync and vehicle self-checks',
    },
}

// 中文内容
const zhHomeContent: HomeContent = {
    hero: {
        title: heroConfig.title,
        subtitle: heroConfig.subtitle,
        description: heroConfig.description,
        ctaText: heroConfig.ctaText,
        ctaLink: heroConfig.ctaLink,
        backgroundImage: heroConfig.backgroundImages[0],
        backgroundImages: heroConfig.backgroundImages,
    },
    stats,
    showcase: zhShowcaseContent,
    achievements,
    sectionHeaders: {
        features: { label: '模块', title: '核心模块' },
        seasons: { label: '赛季', title: '赛季回顾' },
        sponsors: { title: '赞助伙伴' },
        contributors: { label: '致谢', title: '鸣谢' },
    },
    featureCards: [
        {
            href: '/docs-center/',
            icon: 'open-book',
            title: '学习模块',
            description: '系统化的无人驾驶赛车技术学习路径与资料。',
        },
        {
            href: '/cars/',
            icon: 'rocket',
            title: '赛车研发',
            description: '从概念设计到赛道验证的全流程研发实践。',
        },
        {
            href: '/team/',
            icon: 'laptop',
            title: '团队介绍',
            description: '认识这支充满激情与创造力的工程学子团队。',
        },
        {
            href: '/join/',
            icon: 'document',
            title: '加入我们',
            description: '无论你擅长什么，这里都有属于你的位置。',
        },
    ],
    newsItems,
    seasonsLabels: { label: '关于赛车', subtitle: 'ABOUT THE RACE CAR' },
    recruitment: {
        badge: 'JOIN US',
        title: '加入 HUAT FSAC',
        description:
            '我们正在招募对赛车工程充满热情的同学，一起设计、制造并驾驶无人驾驶方程式赛车。',
        departments: [
            '感知算法',
            '规控决策',
            '嵌入式系统',
            '机械结构',
            '车身空气动力学',
            '商业运营',
        ],
        ctaText: '立即加入',
    },
    formulaStudentInfo,
}

// 英文内容
const enHomeContentData: HomeContent = {
    hero: {
        title: 'HUAT FSAC',
        subtitle: 'Formula Student Racing Team',
        description:
            'We are a group of passionate engineering students dedicated to designing, building and racing autonomous formula cars.\nOn the Formula Student stage, we pursue excellence and challenge the limits.',
        ctaText: 'Start Exploring',
        ctaLink: '/en/2024-learning-roadmap/',
        backgroundImage: heroConfig.backgroundImages[0],
        backgroundImages: heroConfig.backgroundImages,
    },
    stats: [
        { value: '2015', label: 'Founded', static: true },
        { value: '50+', label: 'Team Members' },
        { value: '7+', label: 'Years of Experience' },
    ],
    showcase: enShowcaseContent,
    achievements: enAchievements,
    sectionHeaders: {
        features: { label: 'MODULES', title: 'Core Modules' },
        seasons: { label: 'SEASONS', title: 'Season Review' },
        sponsors: { title: 'Our Sponsors' },
        contributors: { label: 'ACKNOWLEDGEMENT', title: 'Contributors' },
    },
    featureCards: [
        {
            href: '/en/docs-center/',
            icon: 'open-book',
            title: 'Learning Modules',
            description:
                'A systematic learning path and resources for autonomous race car technology.',
        },
        {
            href: '/en/cars/',
            icon: 'rocket',
            title: 'Car Development',
            description: 'End-to-end R&D practice from concept design to track validation.',
        },
        {
            href: '/en/team/',
            icon: 'laptop',
            title: 'Our Team',
            description: 'Meet the passionate and creative team of engineering students.',
        },
        {
            href: '/en/join/',
            icon: 'document',
            title: 'Join Us',
            description: 'No matter what you are good at, there is a place for you here.',
        },
    ],
    newsItems: [
        {
            title: '2024 Season Wraps Up Successfully',
            description:
                'We achieved excellent results in the final race of this season. Thanks to all team members for their hard work and sponsors for their strong support!',
            image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600',
            link: '/en/news/2024-season-finale/',
            date: 'Dec 2024',
        },
        {
            title: 'Next-Gen Car Development Kicks Off',
            description:
                'We have officially started the design and development of our new autonomous race car, adopting a brand-new perception fusion solution and control strategy.',
            image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600',
            link: '/en/news/new-car-development/',
            date: 'Nov 2024',
        },
        {
            title: 'Tech Talk: Path Planning Algorithm Explained',
            description:
                'At this tech talk, the planning group explained in detail the path planning algorithm we use and its optimization process.',
            image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600',
            link: '/en/news/path-planning/',
            date: 'Oct 2024',
        },
    ],
    seasonsLabels: { label: 'About the Car', subtitle: 'ABOUT THE RACE CAR' },
    recruitment: {
        badge: 'JOIN US',
        title: 'Join HUAT FSAC',
        description:
            'We are recruiting students passionate about race car engineering to design, build and race autonomous formula cars together.',
        departments: [
            'Perception',
            'Planning & Control',
            'Embedded Systems',
            'Mechanical',
            'Aero',
            'Business',
        ],
        ctaText: 'Join Now',
    },
    formulaStudentInfo: {
        title: 'Explore the World of Formula Student',
        subtitle: 'FORMULA STUDENT',
        description:
            'Formula Student is one of the world’s top engineering competitions, with over 600 teams designing and building cars from scratch. It tests not only speed, but also innovation, sustainability and engineering design.',
        ctaText: 'Learn More',
        ctaLink: '/en/about-fs/',
    },
}

export function getHomeContent(locale: 'zh' | 'en' = 'zh'): HomeContent {
    return locale === 'en' ? enHomeContentData : zhHomeContent
}

export const enHomeContent = enHomeContentData
