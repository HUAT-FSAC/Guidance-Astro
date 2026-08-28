export interface NavItem {
    label: string
    href: string
}

export function getNavItems(locale: 'zh' | 'en' = 'zh'): NavItem[] {
    if (locale === 'en') {
        return [
            { label: 'Home', href: '/en/' },
            { label: 'Team', href: '/en/team/' },
            { label: 'Cars', href: '/en/cars/' },
            { label: 'Docs', href: '/en/docs-center/' },
            { label: 'Join Us', href: '/en/join/' },
        ]
    }
    return [
        { label: '首页', href: '/' },
        { label: '关于我们', href: '/team/' },
        { label: '关于赛车', href: '/cars/' },
        { label: '学习模块', href: '/docs-center/' },
        { label: '加入我们', href: '/join/' },
    ]
}

export function isEnglishPath(pathname: string): boolean {
    return pathname.startsWith('/en/')
}

export function getMobileNavItems(locale: 'zh' | 'en' = 'zh'): { label: string; link: string }[] {
    if (locale === 'en') {
        return [
            { label: '🏠 Home', link: '/en/' },
            { label: '🤝 Join Us', link: '/en/join/' },
            { label: '👥 Team', link: '/en/team/' },
            { label: '🚗 Cars', link: '/en/cars/' },
            { label: 'ℹ️ About FS', link: '/en/about-fs/' },
            { label: '📚 Learning Roadmap', link: '/en/2024-learning-roadmap/' },
        ]
    }
    return [
        { label: '🏠 首页', link: '/' },
        { label: '🤝 加入我们', link: '/join/' },
        { label: '👥 团队', link: '/team/' },
        { label: '🚗 赛车', link: '/cars/' },
        { label: 'ℹ️ 关于 Formula Student', link: '/about-fs/' },
        { label: '📚 2024 学习指南', link: '/2024-learning-roadmap/' },
    ]
}
