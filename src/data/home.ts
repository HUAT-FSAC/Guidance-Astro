// ==================== 类型定义 ====================

import type { Locale } from '../utils/i18n'

export interface StatItem {
    value: string
    label: string
    icon?: string
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

export interface SeasonItem {
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

export interface FeatureCardItem {
    href: string
    icon: string
    title: string
    description: string
}

export interface SectionHeader {
    label?: string
    title: string
}

export interface ShowcaseLabels {
    kicker: string
    heading: string
    description: string
    features: string[]
    ctaText: string
}

export interface RecruitmentContent {
    badge: string
    title: string
    description: string
    departments: string[]
    ctaText: string
}

export interface SeasonsLabels {
    regionLabel: string
    badge: string
    teamCaption: string
    machineCaption: string
    advisor: string
    captain: string
}

export interface HomeContent {
    hero: {
        title: string
        subtitle: string
        description: string
        ctaText: string
        ctaLink: string
        backgroundImage: string
    }
    stats: StatItem[]
    achievements: AchievementItem[]
    newsItems: NewsItem[]
    formulaStudentInfo: {
        title: string
        subtitle: string
        description: string
        ctaText: string
        ctaLink: string
    }
    sectionHeaders: {
        features: SectionHeader
        seasons: SectionHeader
        sponsors: SectionHeader
        contributors: SectionHeader
    }
    featureCards: FeatureCardItem[]
    showcase: ShowcaseLabels
    recruitment: RecruitmentContent
    seasonsLabels: SeasonsLabels
}

const sharedHeroImage = 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1920'
const sharedCarImage = 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800'
const sharedTeamImage = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800'

const zhContent: HomeContent = {
    hero: {
        title: 'HUAT FSAC',
        subtitle: '方程式赛车队',
        description:
            '我们是一群充满激情的工程学子，致力于设计、制造并驾驶无人驾驶方程式赛车。在 Formula Student 赛场上，我们追求卓越，挑战极限。',
        ctaText: '开始探索',
        ctaLink: '/archive/2024/2024-learning-roadmap/',
        backgroundImage: sharedHeroImage,
    },
    stats: [
        { value: '2015', label: '成立年份' },
        { value: '50+', label: '团队成员' },
        { value: '10+', label: '年赛事经验' },
    ],
    achievements: [
        {
            badge: '我们的赛车',
            title: '征服赛道',
            description:
                '欢迎来到 HUAT FSAC，见证我们如何用前沿的电动和无人驾驶技术重新定义赛车运动。从概念设计到赛道验证，每一步都凝聚着我们对工程卓越的追求。',
            ctaText: '查看赛车',
            ctaLink: '/cars/',
            image: sharedCarImage,
        },
        {
            badge: '我们的团队',
            title: '创新与激情的交汇',
            description:
                '认识我们充满活力的工程学子团队，他们设计、制造并驾驶单座赛车。每年在 Formula Student 比赛中，我们都在挑战可能的边界，打造获胜的机器。',
            ctaText: '认识团队',
            ctaLink: '/team/',
            image: sharedTeamImage,
        },
    ],
    newsItems: [
        {
            title: '2024赛季圆满收官',
            description:
                '在本赛季的最后一场比赛中，我们取得了优异的成绩。感谢所有团队成员的辛勤付出和赞助商的大力支持。',
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
    ],
    formulaStudentInfo: {
        title: '探索 Formula Student 的世界',
        subtitle: 'FORMULA STUDENT',
        description:
            'Formula Student 是全球最顶尖的工程赛事之一，600多支队伍从零开始设计制造赛车。比赛不仅考验速度，更注重创新、可持续性和工程设计能力。',
        ctaText: '了解更多',
        ctaLink: '/about-fs/',
    },
    sectionHeaders: {
        features: { label: '学习资源', title: '📚 核心模块' },
        seasons: { label: '我们的足迹', title: '🏎️ 赛季回顾' },
        sponsors: { title: '❤️ 合作伙伴' },
        contributors: { label: '开源贡献', title: '🤝 贡献者' },
    },
    featureCards: [
        {
            href: '/archive/2025/sensing/',
            icon: 'rocket',
            title: '🤖 算法部',
            description: '感知 · 定位建图 · 规控 · 仿真',
        },
        {
            href: '/archive/2025/electrical/',
            icon: 'seti:bicep',
            title: '⚡ 电气部',
            description: '线束 · 软件 · 硬件 · 电池箱',
        },
        {
            href: '/archive/2025/mechanical/',
            icon: 'setting',
            title: '🔧 机械部',
            description: '转向悬架 · 传动 · 车架 · 制动',
        },
        {
            href: '/archive/2025/management/',
            icon: 'open-book',
            title: '📋 项管部',
            description: '新媒体 · 营销 · 运营管理',
        },
    ],
    showcase: {
        kicker: 'Autonomous Showcase',
        heading: '智能驾驶交互实验室',
        description:
            '用完全本地的数据、SVG 可视化和浏览器状态管理，直观展示无人驾驶赛车从感知到执行器的整条闭环。',
        features: ['多场景预设', '实时可视化', '离线演示'],
        ctaText: '进入实验室',
    },
    recruitment: {
        badge: '🎯 2025 招新',
        title: '加入我们的车队',
        description:
            '我们正在寻找充满热情的工程学子。无论你是算法爱好者、硬件极客、机械迷还是创意达人，这里都有属于你的舞台。与我们一起设计、制造并驾驶无人驾驶方程式赛车。',
        departments: ['🤖 算法部', '⚡ 电气部', '🔧 机械部', '📋 项管部'],
        ctaText: '立即报名',
    },
    seasonsLabels: {
        regionLabel: '赛季回顾',
        badge: 'Season Team',
        teamCaption: '车队成员',
        machineCaption: '赛车实拍',
        advisor: '指导老师',
        captain: '队长',
    },
}

const enContent: HomeContent = {
    hero: {
        title: 'HUAT FSAC',
        subtitle: 'Formula Student Autonomous Team',
        description:
            'We are a student engineering team building autonomous Formula Student race cars, from system design and manufacturing to track validation and competition delivery.',
        ctaText: 'Start Exploring',
        ctaLink: '/en/archive/2024/2024-learning-roadmap/',
        backgroundImage: sharedHeroImage,
    },
    stats: [
        { value: '2015', label: 'Founded' },
        { value: '50+', label: 'Team Members' },
        { value: '10+', label: 'Years of Competition' },
    ],
    achievements: [
        {
            badge: 'Our Cars',
            title: 'Engineering for the Track',
            description:
                'Explore how HUAT FSAC turns ideas into race-ready autonomous vehicles. From concept development to on-track validation, every generation reflects a sharper engineering process.',
            ctaText: 'View Cars',
            ctaLink: '/en/cars/',
            image: sharedCarImage,
        },
        {
            badge: 'Our Team',
            title: 'Built by Students Who Ship',
            description:
                'Meet the students behind HUAT FSAC. We work across perception, controls, electronics, mechanics, operations, and manufacturing to deliver a complete race car program.',
            ctaText: 'Meet the Team',
            ctaLink: '/en/team/',
            image: sharedTeamImage,
        },
    ],
    newsItems: [
        {
            title: '2024 Season Closed with a Strong Finish',
            description:
                'Our final event of the season marked another major step forward for the team. Thanks to every member and partner who made the year possible.',
            image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600',
            link: '/en/news/2024-season-finale/',
            date: 'December 2024',
        },
        {
            title: 'Development Begins on the Next Car',
            description:
                'We have officially launched development of the next-generation autonomous race car with updated perception fusion and control strategies.',
            image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600',
            link: '/en/news/new-car-development/',
            date: 'November 2024',
        },
        {
            title: 'Technical Talk: Path Planning in Practice',
            description:
                'This session walked through the team’s path-planning stack, including design choices, tradeoffs, and the optimization process behind it.',
            image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600',
            link: '/en/news/path-planning/',
            date: 'October 2024',
        },
    ],
    formulaStudentInfo: {
        title: 'Discover Formula Student',
        subtitle: 'FORMULA STUDENT',
        description:
            'Formula Student is one of the world’s most demanding engineering competitions. Teams design and build a race car from scratch while proving speed, innovation, sustainability, and execution.',
        ctaText: 'Learn More',
        ctaLink: '/en/about-fs/',
    },
    sectionHeaders: {
        features: { label: 'Learning Paths', title: '📚 Core Modules' },
        seasons: { label: 'Team Journey', title: '🏎️ Season Review' },
        sponsors: { title: '❤️ Partners' },
        contributors: { label: 'Open Source', title: '🤝 Contributors' },
    },
    featureCards: [
        {
            href: '/en/archive/2025/sensing/',
            icon: 'rocket',
            title: '🤖 Algorithms',
            description: 'Perception · Localization · Planning · Simulation',
        },
        {
            href: '/en/archive/2025/electrical/',
            icon: 'seti:bicep',
            title: '⚡ Electrical',
            description: 'Harness · Software · Hardware · Battery Pack',
        },
        {
            href: '/en/archive/2025/mechanical/',
            icon: 'setting',
            title: '🔧 Mechanical',
            description: 'Suspension · Drivetrain · Chassis · Brakes',
        },
        {
            href: '/en/archive/2025/management/',
            icon: 'open-book',
            title: '📋 Operations',
            description: 'Media · Sponsorship · Program Delivery',
        },
    ],
    showcase: {
        kicker: 'Autonomous Showcase',
        heading: 'Interactive Autonomous Lab',
        description:
            'A local, browser-based demo that visualizes the full loop from perception to actuation with scenario presets and lightweight state management.',
        features: ['Scenario presets', 'Live visualization', 'Offline demo'],
        ctaText: 'Open the Lab',
    },
    recruitment: {
        badge: '🎯 2025 Recruiting',
        title: 'Join the Team',
        description:
            'We are looking for students who want to build real systems, work across disciplines, and deliver race-ready engineering. There is room here for software, hardware, mechanical, and operations talent.',
        departments: ['🤖 Algorithms', '⚡ Electrical', '🔧 Mechanical', '📋 Operations'],
        ctaText: 'Apply Now',
    },
    seasonsLabels: {
        regionLabel: 'Season Review',
        badge: 'Season Team',
        teamCaption: 'The Team',
        machineCaption: 'The Car',
        advisor: 'Advisor',
        captain: 'Captain',
    },
}

export function getHomeContent(locale: Locale = 'zh'): HomeContent {
    return locale === 'en' ? enContent : zhContent
}

// ==================== 赛季展示 ====================
import seasons2025 from './seasons/2025.json'
import seasons2024 from './seasons/2024.json'
import seasons2023 from './seasons/2023.json'

export const seasons: SeasonItem[] = [...seasons2025, ...seasons2024, ...seasons2023]

// ==================== 赞助商 ====================
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

// Backward-compatible Chinese defaults for existing imports.
export const heroConfig = getHomeContent('zh').hero
export const stats: StatItem[] = getHomeContent('zh').stats
export const achievements: AchievementItem[] = getHomeContent('zh').achievements
export const newsItems: NewsItem[] = getHomeContent('zh').newsItems
export const formulaStudentInfo = getHomeContent('zh').formulaStudentInfo

export const zhHomeContent = getHomeContent('zh')
export const enHomeContent = getHomeContent('en')
