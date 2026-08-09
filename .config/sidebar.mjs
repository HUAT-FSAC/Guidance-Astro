export default [
    {
        label: '文档中心',
        translations: { en: 'Docs Center' },
        collapsed: false,
        items: [
            { label: '文档中心', translations: { en: 'Docs Center' }, link: '/docs-center/' },
            { label: '入门', translations: { en: 'Onboarding' }, link: '/docs-center/入门/' },
            {
                label: '流程与模板',
                translations: { en: 'Processes & Templates' },
                link: '/docs-center/流程与模板/',
            },
            {
                label: '资源中心',
                translations: { en: 'Resource Hub' },
                link: '/docs-center/资源中心/',
            },
            {
                label: '内容贡献指南',
                translations: { en: 'Contributing Guide' },
                link: '/docs-center/contributing/',
            },
            {
                label: '运营与协作',
                translations: { en: 'Operations & Collaboration' },
                collapsed: true,
                items: [
                    {
                        label: '运营与协作',
                        translations: { en: 'Operations & Collaboration' },
                        link: '/docs-center/运营与协作/',
                    },
                    {
                        label: '项目进度看板',
                        translations: { en: 'Project Progress Board' },
                        link: '/docs-center/运营与协作/项目进度看板/',
                    },
                ],
            },
            {
                label: '体验与反馈',
                translations: { en: 'Feedback & Experience' },
                link: '/docs-center/体验与反馈/',
            },
        ],
    },
    {
        label: '新闻动态',
        translations: { en: 'News' },
        collapsed: false,
        items: [{ autogenerate: { directory: 'news' } }],
    },
    {
        label: '2025 赛季文档',
        translations: { en: '2025 Season Docs' },
        collapsed: false,
        items: [
            {
                label: '感知',
                translations: { en: 'Sensing' },
                collapsed: true,
                items: [{ autogenerate: { directory: 'archive/2025/sensing' } }],
            },
            {
                label: '定位建图',
                translations: { en: 'Localization & Mapping' },
                collapsed: true,
                items: [{ autogenerate: { directory: 'archive/2025/localization-mapping' } }],
            },
            {
                label: '规划控制',
                translations: { en: 'Planning & Control' },
                collapsed: true,
                items: [{ autogenerate: { directory: 'archive/2025/planning-control' } }],
            },
            {
                label: '仿真测试',
                translations: { en: 'Simulation' },
                collapsed: true,
                items: [{ autogenerate: { directory: 'archive/2025/simulation' } }],
            },
            {
                label: '电气部',
                translations: { en: 'Electrical' },
                collapsed: true,
                items: [{ autogenerate: { directory: 'archive/2025/electrical' } }],
            },
            {
                label: '机械部',
                translations: { en: 'Mechanical' },
                collapsed: true,
                items: [{ autogenerate: { directory: 'archive/2025/mechanical' } }],
            },
            {
                label: '项管部',
                translations: { en: 'Operations' },
                collapsed: true,
                items: [{ autogenerate: { directory: 'archive/2025/management' } }],
            },
            {
                label: '过检模块',
                translations: { en: 'Inspection' },
                collapsed: true,
                items: [{ autogenerate: { directory: 'archive/2025/inspection' } }],
            },
        ],
    },
    {
        label: '2024 赛季文档',
        translations: { en: '2024 Season Docs' },
        collapsed: true,
        items: [
            {
                label: '感知融合',
                translations: { en: 'Sensing & Fusion' },
                collapsed: true,
                items: [{ autogenerate: { directory: 'archive/sensing' } }],
            },
            {
                label: '定位建图',
                translations: { en: 'Localization & Mapping' },
                collapsed: true,
                items: [{ autogenerate: { directory: 'archive/localization-mapping' } }],
            },
            {
                label: '仿真测试',
                translations: { en: 'Simulation' },
                collapsed: true,
                items: [{ autogenerate: { directory: 'archive/simulation' } }],
            },
            {
                label: '规划控制',
                translations: { en: 'Planning & Control' },
                collapsed: true,
                items: [{ autogenerate: { directory: 'archive/planning-control' } }],
            },
        ],
    },
    {
        label: '通用教程与指南',
        translations: { en: 'General Guides' },
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
                label: '基础工具与环境',
                translations: { en: 'Tools & Environment' },
                collapsed: true,
                items: [{ autogenerate: { directory: 'archive/general' } }],
            },
        ],
    },
]
