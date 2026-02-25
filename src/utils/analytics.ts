/**
 * HUAT FSAC 分析和监控工具模块
 * 提供自定义事件跟踪功能，与 Umami Analytics 集成
 */

declare global {
    interface Window {
        umami?: {
            track: (eventName: string, eventData?: Record<string, unknown>) => void
        }
    }
}

/**
 * 事件类型枚举
 */
export enum AnalyticsEvent {
    // 页面交互
    PAGE_SCROLL_25 = 'page_scroll_25',
    PAGE_SCROLL_50 = 'page_scroll_50',
    PAGE_SCROLL_75 = 'page_scroll_75',
    PAGE_SCROLL_100 = 'page_scroll_100',

    // 文档阅读
    DOC_READ_START = 'doc_read_start',
    DOC_READ_COMPLETE = 'doc_read_complete',
    DOC_TIME_ON_PAGE = 'doc_time_on_page',

    // 导航
    NAV_CLICK = 'nav_click',
    EXTERNAL_LINK = 'external_link',
    SEARCH_OPEN = 'search_open',
    SEARCH_QUERY = 'search_query',

    // 主题
    THEME_CHANGE = 'theme_change',

    // 招新
    JOIN_CLICK = 'join_click',

    // 错误
    ERROR_OCCURRED = 'error_occurred',
}

/**
 * 跟踪事件
 */
export function trackEvent(
    eventName: AnalyticsEvent | string,
    eventData?: Record<string, unknown>
): void {
    // 检查是否启用了分析
    if (typeof window === 'undefined') return

    // 使用 Umami 跟踪
    if (window.umami) {
        window.umami.track(eventName, eventData)
    }

    // 开发模式下打印到控制台
    if (import.meta.env.DEV) {
        console.log(`[Analytics] ${eventName}`, eventData)
    }
}

/**
 * 跟踪页面滚动深度
 * @returns 清理函数，用于移除事件监听器
 */
export function trackScrollDepth(): (() => void) | undefined {
    if (typeof window === 'undefined') return undefined

    const milestones = new Set<number>()

    const handleScroll = () => {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
        if (scrollHeight <= 0) return

        const scrollPercent = Math.round((window.scrollY / scrollHeight) * 100)

        // 跟踪关键节点
        if (scrollPercent >= 25 && !milestones.has(25)) {
            milestones.add(25)
            trackEvent(AnalyticsEvent.PAGE_SCROLL_25, { percent: 25 })
        }
        if (scrollPercent >= 50 && !milestones.has(50)) {
            milestones.add(50)
            trackEvent(AnalyticsEvent.PAGE_SCROLL_50, { percent: 50 })
        }
        if (scrollPercent >= 75 && !milestones.has(75)) {
            milestones.add(75)
            trackEvent(AnalyticsEvent.PAGE_SCROLL_75, { percent: 75 })
        }
        if (scrollPercent >= 95 && !milestones.has(100)) {
            milestones.add(100)
            trackEvent(AnalyticsEvent.PAGE_SCROLL_100, { percent: 100 })
        }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    // 返回清理函数
    return () => window.removeEventListener('scroll', handleScroll)
}

/**
 * 跟踪文档阅读完成率
 * @returns 清理函数，用于移除事件监听器
 */
let _docReadingCleanup: (() => void) | undefined

export function trackDocumentReading(): (() => void) | undefined {
    if (typeof window === 'undefined') return undefined

    // 清理上一次的监听器
    if (_docReadingCleanup) {
        _docReadingCleanup()
        _docReadingCleanup = undefined
    }

    const startTime = Date.now()
    const pathname = window.location.pathname

    // 记录开始阅读
    trackEvent(AnalyticsEvent.DOC_READ_START, { path: pathname })

    // 页面离开时记录阅读时间
    const handleUnload = () => {
        const timeOnPage = Math.round((Date.now() - startTime) / 1000)

        // 只有阅读超过 10 秒才记录
        if (timeOnPage >= 10) {
            trackEvent(AnalyticsEvent.DOC_TIME_ON_PAGE, {
                path: pathname,
                seconds: timeOnPage,
            })
        }

        // 超过 60 秒视为完成阅读
        if (timeOnPage >= 60) {
            trackEvent(AnalyticsEvent.DOC_READ_COMPLETE, {
                path: pathname,
                seconds: timeOnPage,
            })
        }
    }

    window.addEventListener('beforeunload', handleUnload)

    _docReadingCleanup = () => window.removeEventListener('beforeunload', handleUnload)
    return _docReadingCleanup
}

/**
 * 跟踪外部链接点击（仅绑定一次）
 */
let _externalLinksTracked = false

export function trackExternalLinks(): void {
    if (typeof window === 'undefined') return
    if (_externalLinksTracked) return
    _externalLinksTracked = true

    document.addEventListener('click', (e) => {
        const link = (e.target as HTMLElement).closest('a')
        if (!link) return

        const href = link.getAttribute('href')
        if (!href) return

        // 检查是否是外部链接
        if (href.startsWith('http') && !href.includes(window.location.hostname)) {
            trackEvent(AnalyticsEvent.EXTERNAL_LINK, {
                url: href,
                text: link.textContent?.trim().slice(0, 50),
            })
        }
    })
}

/**
 * 跟踪主题切换
 */
export function trackThemeChange(theme: string): void {
    trackEvent(AnalyticsEvent.THEME_CHANGE, { theme })
}

/**
 * 跟踪招新点击
 */
export function trackJoinClick(source: string): void {
    trackEvent(AnalyticsEvent.JOIN_CLICK, { source })
}

/**
 * 跟踪错误
 */
export function trackError(error: Error | string, context?: Record<string, unknown>): void {
    trackEvent(AnalyticsEvent.ERROR_OCCURRED, {
        message: typeof error === 'string' ? error : error.message,
        ...context,
    })
}

/**
 * 初始化所有分析跟踪
 * @returns 清理函数
 */
let _scrollDepthCleanup: (() => void) | undefined

export function initAnalytics(): (() => void) | undefined {
    if (typeof window === 'undefined') return undefined

    // 清理上一次的滚动深度监听器
    if (_scrollDepthCleanup) {
        _scrollDepthCleanup()
        _scrollDepthCleanup = undefined
    }

    // 跟踪滚动深度
    _scrollDepthCleanup = trackScrollDepth()

    // 跟踪文档阅读
    trackDocumentReading()

    // 跟踪外部链接（内部有防重复机制）
    trackExternalLinks()

    return () => {
        _scrollDepthCleanup?.()
        _scrollDepthCleanup = undefined
        _docReadingCleanup?.()
        _docReadingCleanup = undefined
    }
}
