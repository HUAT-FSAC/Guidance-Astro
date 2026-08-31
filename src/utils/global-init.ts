/**
 * 全局初始化模块
 * 在页面加载时初始化所有全局功能
 */

let searchShortcutCleanup: (() => void) | undefined

/**
 * 初始化卡片鼠标追踪光效
 * Emil Kowalski: 卡片悬停时显示跟随鼠标的光晕效果
 */
function initCardGlowEffect(): void {
    if (typeof document === 'undefined') return

    const cards = document.querySelectorAll<HTMLElement>('.sl-link-card, .card')
    cards.forEach((card) => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect()
            const x = ((e.clientX - rect.left) / rect.width) * 100
            const y = ((e.clientY - rect.top) / rect.height) * 100
            card.style.setProperty('--mouse-x', `${x}%`)
            card.style.setProperty('--mouse-y', `${y}%`)
        })
    })
}

/**
 * 初始化所有全局功能
 */
export function initGlobalFeatures(): void {
    if (typeof window === 'undefined') return

    // 初始化搜索快捷键（关键功能，同步加载）
    import('./enhanced-search').then(({ initSearchShortcut }) => {
        // SPA 导航会重复触发本函数，先清理上一次的监听器
        searchShortcutCleanup?.()
        searchShortcutCleanup = initSearchShortcut()
    })

    // 初始化卡片光效
    initCardGlowEffect()

    // 延迟加载非关键功能
    setTimeout(() => {
        // 初始化性能监控
        import('./performance').then(({ initPerformanceMonitor }) => {
            initPerformanceMonitor({
                reportToAnalytics: true,
                logToConsole: import.meta.env.DEV,
            })
        })

        // 初始化分析跟踪
        import('./analytics').then(({ initAnalytics }) => {
            initAnalytics()
        })
    }, 500)

    // 开发环境提示
    if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log('[GlobalInit] All features initialized')
    }
}

/**
 * 设置全局初始化生命周期
 * 处理 Astro 页面导航
 */
export function setupGlobalInit(): void {
    if (typeof document === 'undefined') return

    const init = () => {
        initGlobalFeatures()
    }

    // 初始加载
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true })
    } else {
        init()
    }

    // Astro 页面导航
    document.addEventListener('astro:page-load', init)
}

// 自动执行初始化
setupGlobalInit()
