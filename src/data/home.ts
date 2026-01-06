// ==================== 类型定义 ====================

export interface StatItem {
    value: string;
    label: string;
    icon?: string;
}

export interface SeasonItem {
    year: string;
    teamImg: string;
    carImg: string;
    advisor?: string;           // 指导老师
    captain?: string;           // 队长
    members?: {                 // 成员分组
        group: string;          // 组别名称
        names: string[];        // 成员名单
    }[];
}

export interface SponsorItem {
    title: string;
    logo: string;
    link?: string;
}

export interface SponsorGroup {
    name: string;
    items: SponsorItem[];
}

export interface NewsItem {
    title: string;
    description: string;
    image: string;
    link: string;
    date?: string;
}

export interface AchievementItem {
    badge?: string;
    title: string;
    description: string;
    ctaText: string;
    ctaLink: string;
    image: string;
}

// ==================== Hero 区域配置 ====================

export const heroConfig = {
    title: "HUAT FSAC",
    subtitle: "方程式赛车队",
    description: "我们是一群充满激情的工程学子，致力于设计、制造并驾驶无人驾驶方程式赛车。在 Formula Student 赛场上，我们追求卓越，挑战极限。",
    ctaText: "开始探索",
    ctaLink: "/2024-learning-roadmap/",
    backgroundImage: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1920"
};

// ==================== 统计数据 ====================

export const stats: StatItem[] = [
    { value: "2015", label: "成立年份" },
    { value: "50+", label: "团队成员" },
    { value: "10+", label: "年赛事经验" },
];

// ==================== 成就展示 ====================

export const achievements: AchievementItem[] = [
    {
        badge: "我们的赛车",
        title: "征服赛道",
        description: "欢迎来到 HUAT FSAC - 见证我们如何用前沿的电动和无人驾驶技术重新定义赛车运动。从概念设计到赛道验证，每一步都凝聚着我们对工程卓越的追求。",
        ctaText: "查看赛车",
        ctaLink: "/cars/",
        image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800"
    },
    {
        badge: "我们的团队",
        title: "创新与激情的交汇",
        description: "认识我们充满活力的工程学子团队，他们设计、制造并驾驶单座赛车。每年在 Formula Student 比赛中，我们都在挑战可能的边界，打造获胜的机器。",
        ctaText: "认识团队",
        ctaLink: "/team/",
        image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800"
    }
];

// ==================== 新闻动态 ====================

export const newsItems: NewsItem[] = [
    {
        title: "2024赛季圆满收官",
        description: "在本赛季的最后一场比赛中，我们取得了优异的成绩。感谢所有团队成员的辛勤付出和赞助商的大力支持！",
        image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600",
        link: "/news/2024-season-finale/",
        date: "2024年12月"
    },
    {
        title: "新一代赛车研发启动",
        description: "我们正式开始了新一代无人驾驶赛车的设计与研发工作，采用全新的感知融合方案和控制策略。",
        image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600",
        link: "/news/new-car-development/",
        date: "2024年11月"
    },
    {
        title: "技术分享：路径规划算法详解",
        description: "本期技术分享会上，规控组的同学为大家详细讲解了我们采用的路径规划算法及其优化过程。",
        image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600",
        link: "/news/path-planning/",
        date: "2024年10月"
    }
];

// ==================== Formula Student 介绍 ====================

export const formulaStudentInfo = {
    title: "探索 Formula Student 的世界",
    subtitle: "FORMULA STUDENT",
    description: "Formula Student 是全球最顶尖的工程赛事之一，600多支队伍从零开始设计制造赛车。比赛不仅考验速度，更注重创新、可持续性和工程设计能力。",
    ctaText: "了解更多",
    ctaLink: "/about-fs/"
};

// ==================== 赛季展示 ====================

export const seasons: SeasonItem[] = [
    {
        year: "2025",
        teamImg: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800",
        carImg: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800",
        advisor: "金湘遂",
        captain: "潘世泉",
        members: [
            { group: "机械部", names: ["潘世泉", "黄宇轩", "陈柏霖", "罗炯恒", "成杰", "刘文涛", "雷世豪", "汪智强", "闫博", "杨昌鑫", "涂伟麟"] },
            { group: "电气部", names: ["许基天", "郑雨乐", "郑舟鑫", "周凌", "魏博", "于欣渤", "崔心怡", "汪雅兰", "刘定智", "吴民正", "何流"] },
            { group: "算法部", names: ["陈子扬", "徐子达", "张鑫跃", "陈娟", "蔡俊翔", "卫冠杰", "金俊杰", "万仁成", "黄昭然"] },
            { group: "项管部", names: ["房静琳", "熊傲然", "王颂扬"] },
        ]
    },
    {
        year: "2024",
        teamImg: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800",
        carImg: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800",
        advisor: "指导老师",
        captain: "队长姓名",
        members: [
            { group: "算法部 - 惯导", names: ["成员A", "成员B"] },
            { group: "算法部 - 雷达", names: ["成员C", "成员D"] },
            { group: "算法部 - 视觉", names: ["成员E", "成员F"] },
            { group: "算法部 - 规划控制", names: ["蔡俊翔", "成员G"] },
            { group: "电气部 - 线束", names: ["成员H", "成员I"] },
            { group: "电气部 - 软件", names: ["成员J", "成员K"] },
            { group: "电气部 - 硬件", names: ["成员L", "成员M"] },
            { group: "电气部 - 电池箱", names: ["成员N", "成员O"] },
            { group: "机械部 - 转向悬架", names: ["成员P", "成员Q"] },
            { group: "机械部 - 传动", names: ["成员R", "成员S"] },
            { group: "机械部 - 车架车身", names: ["成员T", "成员U"] },
            { group: "机械部 - 制动", names: ["成员V", "成员W"] },
            { group: "项管部 - 新媒体", names: ["成员X"] },
            { group: "项管部 - 营销", names: ["成员Y"] },
            { group: "项管部 - 运营", names: ["成员Z"] },
        ]
    },
    {
        year: "2023",
        teamImg: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800",
        carImg: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800",
        advisor: "指导老师",
        captain: "队长姓名",
        members: [
            { group: "算法部", names: ["成员A", "成员B", "成员C"] },
            { group: "电气部", names: ["成员D", "成员E", "成员F"] },
            { group: "机械部", names: ["成员G", "成员H", "成员I"] },
            { group: "项管部", names: ["成员J", "成员K"] },
        ]
    },
];

// ==================== 赞助商 ====================

export const sponsorGroups: SponsorGroup[] = [
    {
        name: "核心赞助",
        items: [
            { title: "湖北汽车工业学院", logo: "./../assets/logos/huat.jpg" },
            // { title: "赞助商 A", logo: "https://via.placeholder.com/200x80/1a1a1a/f39c12?text=Sponsor+A" },
        ]
    }
    // {
    //     name: "战略合作伙伴",
    //     items: [
    //         { title: "合作伙伴 A", logo: "https://via.placeholder.com/150x60/1a1a1a/888?text=Partner+A" },
    //         { title: "合作伙伴 B", logo: "https://via.placeholder.com/150x60/1a1a1a/888?text=Partner+B" },
    //         { title: "合作伙伴 C", logo: "https://via.placeholder.com/150x60/1a1a1a/888?text=Partner+C" },
    //     ]
    // },
    // {
    //     name: "技术支持",
    //     items: [
    //         { title: "技术支持 A", logo: "https://via.placeholder.com/120x50/1a1a1a/666?text=Tech+A" },
    //         { title: "技术支持 B", logo: "https://via.placeholder.com/120x50/1a1a1a/666?text=Tech+B" },
    //     ]
    // }
];
