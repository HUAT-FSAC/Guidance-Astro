/**
 * 全局初始化模块
 * 在页面加载时初始化所有全局功能
 */

import { initAnalytics } from './analytics'
import { initPerformanceMonitor } from './performance'
import { initSearchShortcut } from './enhanced-search'

/**
 * 初始化所有全局功能
 */
export function initGlobalFeatures(): void {
    if (typeof window === 'undefined') return

    // 初始化性能监控
    initPerformanceMonitor({
        reportToAnalytics: true,
        logToConsole: import.meta.env.DEV,
    })

    // 初始化分析跟踪
    initAnalytics()

    // 初始化搜索快捷键
    initSearchShortcut()

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
