export default [
    {
        label: "🏠 概览与入口",
        collapsed: false,
        items: [
            { label: "🏠 首页", link: "/" },
            { label: "🤝 加入我们", link: "/join/" },
            { label: "👥 团队", link: "/team/" },
            { label: "🚗 赛车", link: "/cars/" },
            { label: "ℹ️ 关于 Formula Student", link: "/about-fs/" },
        ],
    },
    {
        label: "📚 文档中心",
        collapsed: false,
        autogenerate: { directory: "文档中心" },
    },
    {
        label: "📰 新闻动态",
        collapsed: false,
        autogenerate: { directory: "news" },
    },
    {
        label: "🏎️ 2025 赛季文档",
        collapsed: false,
        items: [
            { label: "📁 无人系统组 - 感知", collapsed: true, autogenerate: { directory: "2025/感知" } },
            { label: "📁 无人系统组 - 定位建图", collapsed: true, autogenerate: { directory: "2025/定位建图" } },
            { label: "📁 无人系统组 - 规控", collapsed: true, autogenerate: { directory: "2025/规控" } },
            { label: "📁 无人系统组 - 仿真测试", collapsed: true, autogenerate: { directory: "2025/仿真测试" } },
            { label: "📁 电气部", collapsed: true, autogenerate: { directory: "2025/电气" } },
            { label: "📁 机械部", collapsed: true, autogenerate: { directory: "2025/机械" } },
            { label: "📁 项管部", collapsed: true, autogenerate: { directory: "2025/项管" } },
        ],
    },
    {
        label: "📚 2024 赛季文档",
        collapsed: true,
        items: [
            { label: "📁 感知融合", collapsed: true, autogenerate: { directory: "感知" } },
            { label: "📁 定位建图", collapsed: true, autogenerate: { directory: "定位建图" } },
            { label: "📁 仿真测试", collapsed: true, autogenerate: { directory: "仿真测试" } },
            { label: "📁 规划控制", collapsed: true, autogenerate: { directory: "规控" } },
        ],
    },
    {
        label: "📘 通用教程与指南",
        collapsed: true,
        items: [
            { label: "2024 无人系统部学习指南", link: "/2024-learning-roadmap/" },
            { label: "HUAT 无人车队开源项目", link: "/open-source-projects/" },
            { label: "🛠️ 基础工具与环境", collapsed: true, autogenerate: { directory: "综合" } },
        ],
    },
];


