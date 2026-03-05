export default [
    {
        label: '🏠 概览与入口',
        collapsed: false,
        items: [
            { label: '🏠 首页', link: '/' },
            { label: '🤝 加入我们', link: '/join/' },
            { label: '👥 团队', link: '/team/' },
            { label: '🚗 赛车', link: '/cars/' },
            { label: 'ℹ️ 关于 Formula Student', link: '/about-fs/' },
            { label: '📊 项目进度看板', link: '/docs-center/运营与协作/项目进度看板/' },
        ],
    },
    {
        label: '📚 文档中心',
        collapsed: false,
        autogenerate: { directory: 'docs-center' },
    },
    {
        label: '📰 新闻动态',
        collapsed: false,
        autogenerate: { directory: 'news' },
    },
    {
        label: '🏎️ 2025 赛季文档',
        collapsed: false,
        items: [
            {
                label: '📁 无人系统组 - 感知',
                collapsed: true,
                autogenerate: { directory: 'archive/2025/sensing' },
            },
            {
                label: '📁 无人系统组 - 定位建图',
                collapsed: true,
                autogenerate: { directory: 'archive/2025/localization-mapping' },
            },
            {
                label: '📁 无人系统组 - 规控',
                collapsed: true,
                autogenerate: { directory: 'archive/2025/planning-control' },
            },
            {
                label: '📁 无人系统组 - 仿真测试',
                collapsed: true,
                autogenerate: { directory: 'archive/2025/simulation' },
            },
            {
                label: '📁 电气部',
                collapsed: true,
                autogenerate: { directory: 'archive/2025/electrical' },
            },
            {
                label: '📁 机械部',
                collapsed: true,
                autogenerate: { directory: 'archive/2025/mechanical' },
            },
            {
                label: '📁 项管部',
                collapsed: true,
                autogenerate: { directory: 'archive/2025/management' },
            },
            {
                label: '📁 过检模块',
                collapsed: true,
                autogenerate: { directory: 'archive/2025/inspection' },
            },
        ],
    },
    {
        label: '📚 2024 赛季文档',
        collapsed: true,
        items: [
            {
                label: '📁 感知融合',
                collapsed: true,
                autogenerate: { directory: 'archive/sensing' },
            },
            {
                label: '📁 定位建图',
                collapsed: true,
                autogenerate: { directory: 'archive/localization-mapping' },
            },
            {
                label: '📁 仿真测试',
                collapsed: true,
                autogenerate: { directory: 'archive/simulation' },
            },
            {
                label: '📁 规划控制',
                collapsed: true,
                autogenerate: { directory: 'archive/planning-control' },
            },
        ],
    },
    {
        label: '📘 通用教程与指南',
        collapsed: true,
        items: [
            { label: '2024 无人系统部学习指南', link: '/archive/2024/2024-learning-roadmap/' },
            { label: 'HUAT 无人车队开源项目', link: '/open-source-projects/' },
            {
                label: '🛠️ 基础工具与环境',
                collapsed: true,
                autogenerate: { directory: 'archive/general' },
            },
        ],
    },
]
