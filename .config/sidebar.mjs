export default [
    {
        label: '🏠 概览与入口',
        translations: { en: '🏠 Overview & Entry' },
        collapsed: false,
        items: [
            { label: '🏠 首页', translations: { en: '🏠 Home' }, link: '/' },
            { label: '🤝 加入我们', translations: { en: '🤝 Join Us' }, link: '/join/' },
            { label: '👥 团队', translations: { en: '👥 Team' }, link: '/team/' },
            { label: '🚗 赛车', translations: { en: '🚗 Cars' }, link: '/cars/' },
            {
                label: 'ℹ️ 关于 Formula Student',
                translations: { en: 'ℹ️ About Formula Student' },
                link: '/about-fs/',
            },
            {
                label: '📊 项目进度看板',
                translations: { en: '📊 Project Board' },
                link: '/docs-center/运营与协作/项目进度看板/',
            },
        ],
    },
    {
        label: '📚 文档中心',
        translations: { en: '📚 Docs Center' },
        collapsed: false,
        autogenerate: { directory: 'docs-center' },
    },
    {
        label: '📰 新闻动态',
        translations: { en: '📰 News' },
        collapsed: false,
        autogenerate: { directory: 'news' },
    },
    {
        label: '🏎️ 2025 赛季文档',
        translations: { en: '🏎️ 2025 Season Docs' },
        collapsed: false,
        items: [
            {
                label: '📁 无人系统组 - 感知',
                translations: { en: '📁 Autonomous - Sensing' },
                collapsed: true,
                autogenerate: { directory: 'archive/2025/sensing' },
            },
            {
                label: '📁 无人系统组 - 定位建图',
                translations: { en: '📁 Autonomous - Localization' },
                collapsed: true,
                autogenerate: { directory: 'archive/2025/localization-mapping' },
            },
            {
                label: '📁 无人系统组 - 规控',
                translations: { en: '📁 Autonomous - Planning & Control' },
                collapsed: true,
                autogenerate: { directory: 'archive/2025/planning-control' },
            },
            {
                label: '📁 无人系统组 - 仿真测试',
                translations: { en: '📁 Autonomous - Simulation' },
                collapsed: true,
                autogenerate: { directory: 'archive/2025/simulation' },
            },
            {
                label: '📁 电气部',
                translations: { en: '📁 Electrical' },
                collapsed: true,
                autogenerate: { directory: 'archive/2025/electrical' },
            },
            {
                label: '📁 机械部',
                translations: { en: '📁 Mechanical' },
                collapsed: true,
                autogenerate: { directory: 'archive/2025/mechanical' },
            },
            {
                label: '📁 项管部',
                translations: { en: '📁 Operations' },
                collapsed: true,
                autogenerate: { directory: 'archive/2025/management' },
            },
            {
                label: '📁 过检模块',
                translations: { en: '📁 Inspection' },
                collapsed: true,
                autogenerate: { directory: 'archive/2025/inspection' },
            },
        ],
    },
    {
        label: '📚 2024 赛季文档',
        translations: { en: '📚 2024 Season Docs' },
        collapsed: true,
        items: [
            {
                label: '📁 感知融合',
                translations: { en: '📁 Sensing & Fusion' },
                collapsed: true,
                autogenerate: { directory: 'archive/sensing' },
            },
            {
                label: '📁 定位建图',
                translations: { en: '📁 Localization & Mapping' },
                collapsed: true,
                autogenerate: { directory: 'archive/localization-mapping' },
            },
            {
                label: '📁 仿真测试',
                translations: { en: '📁 Simulation' },
                collapsed: true,
                autogenerate: { directory: 'archive/simulation' },
            },
            {
                label: '📁 规划控制',
                translations: { en: '📁 Planning & Control' },
                collapsed: true,
                autogenerate: { directory: 'archive/planning-control' },
            },
        ],
    },
    {
        label: '📘 通用教程与指南',
        translations: { en: '📘 General Guides' },
        collapsed: true,
        items: [
            {
                label: '2024 无人系统部学习指南',
                translations: { en: '2024 Autonomous Learning Roadmap' },
                link: '/archive/2024/2024-learning-roadmap/',
            },
            {
                label: 'HUAT 无人车队开源项目',
                translations: { en: 'HUAT Open Source Projects' },
                link: '/open-source-projects/',
            },
            {
                label: '🛠️ 基础工具与环境',
                translations: { en: '🛠️ Tools & Environment' },
                collapsed: true,
                autogenerate: { directory: 'archive/general' },
            },
        ],
    },
]
