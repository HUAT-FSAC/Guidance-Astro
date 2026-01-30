/**
 * 性能监控工具模块
 * 提供 Web Vitals 性能指标采集和上报功能
 *
 * @example
 * ```typescript
 * // 在页面加载时初始化
 * import { initPerformanceMonitor } from '../utils/performance';
 * initPerformanceMonitor();
 * ```
 */

/**
 * 性能指标类型
 */
export interface PerformanceMetric {
    /** 指标名称 */
    name: 'FCP' | 'LCP' | 'CLS' | 'FID' | 'TTFB' | 'INP'
    /** 指标值 */
    value: number
    /** 评级: good | needs-improvement | poor */
    rating: 'good' | 'needs-improvement' | 'poor'
    /** 导航类型 */
    navigationType?: string
}

/**
 * 性能指标阈值 (根据 Google Web Vitals 标准)
 */
const THRESHOLDS = {
    FCP: { good: 1800, poor: 3000 },
    LCP: { good: 2500, poor: 4000 },
    CLS: { good: 0.1, poor: 0.25 },
    FID: { good: 100, poor: 300 },
    TTFB: { good: 800, poor: 1800 },
    INP: { good: 200, poor: 500 },
}

/**
 * 获取指标评级
 * @param name - 指标名称
 * @param value - 指标值
 * @returns 评级
 */
function getRating(name: keyof typeof THRESHOLDS, value: number): PerformanceMetric['rating'] {
    const threshold = THRESHOLDS[name]
    if (value <= threshold.good) return 'good'
    if (value <= threshold.poor) return 'needs-improvement'
    return 'poor'
}

/**
 * 上报性能指标到 Umami
 * @param metric - 性能指标
 */
function reportToUmami(metric: PerformanceMetric): void {
    // 检查 Umami 是否可用
    if (typeof window === 'undefined') return

    const umami = (
        window as unknown as {
            umami?: { track: (event: string, data: Record<string, unknown>) => void }
        }
    ).umami

    if (umami?.track) {
        umami.track(`web-vital-${metric.name.toLowerCase()}`, {
            value: Math.round(metric.value),
            rating: metric.rating,
            navigationType: metric.navigationType || 'navigate',
        })
    }
}

/**
 * 控制台输出性能指标 (仅开发环境)
 * @param metric - 性能指标
 */
function logMetric(metric: PerformanceMetric): void {
    if (process.env.NODE_ENV !== 'production') {
        const colors = {
            good: '\x1b[32m',
            'needs-improvement': '\x1b[33m',
            poor: '\x1b[31m',
        }
        const reset = '\x1b[0m'
        console.log(
            `${colors[metric.rating]}[${metric.name}]${reset} ${metric.value.toFixed(2)} (${metric.rating})`
        )
    }
}

/**
 * 监听 First Contentful Paint (FCP)
 */
function observeFCP(callback: (metric: PerformanceMetric) => void): void {
    if (typeof PerformanceObserver === 'undefined') return

    try {
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntriesByName('first-contentful-paint')
            if (entries.length > 0) {
                const entry = entries[0]
                const value = entry.startTime
                callback({
                    name: 'FCP',
                    value,
                    rating: getRating('FCP', value),
                })
                observer.disconnect()
            }
        })
        observer.observe({ type: 'paint', buffered: true })
    } catch {
        // Safari 等不支持的浏览器
    }
}

/**
 * 监听 Largest Contentful Paint (LCP)
 */
function observeLCP(callback: (metric: PerformanceMetric) => void): void {
    if (typeof PerformanceObserver === 'undefined') return

    try {
        let lastValue = 0
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries()
            const lastEntry = entries[entries.length - 1]
            if (lastEntry) {
                lastValue = lastEntry.startTime
            }
        })
        observer.observe({ type: 'largest-contentful-paint', buffered: true })

        // 在页面可见性变化或卸载时报告
        const reportLCP = () => {
            if (lastValue > 0) {
                callback({
                    name: 'LCP',
                    value: lastValue,
                    rating: getRating('LCP', lastValue),
                })
                observer.disconnect()
            }
        }

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                reportLCP()
            }
        })
        window.addEventListener('pagehide', reportLCP, { once: true })
    } catch {
        // 不支持的浏览器
    }
}

/**
 * 监听 Cumulative Layout Shift (CLS)
 */
function observeCLS(callback: (metric: PerformanceMetric) => void): void {
    if (typeof PerformanceObserver === 'undefined') return

    try {
        let clsValue = 0
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                const layoutShift = entry as PerformanceEntry & {
                    hadRecentInput?: boolean
                    value?: number
                }
                if (!layoutShift.hadRecentInput && layoutShift.value) {
                    clsValue += layoutShift.value
                }
            }
        })
        observer.observe({ type: 'layout-shift', buffered: true })

        // 在页面卸载时报告
        const reportCLS = () => {
            callback({
                name: 'CLS',
                value: clsValue,
                rating: getRating('CLS', clsValue),
            })
            observer.disconnect()
        }

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                reportCLS()
            }
        })
        window.addEventListener('pagehide', reportCLS, { once: true })
    } catch {
        // 不支持的浏览器
    }
}

/**
 * 获取 Time to First Byte (TTFB)
 */
function observeTTFB(callback: (metric: PerformanceMetric) => void): void {
    if (typeof performance === 'undefined') return

    try {
        const navEntry = performance.getEntriesByType(
            'navigation'
        )[0] as PerformanceNavigationTiming
        if (navEntry) {
            const value = navEntry.responseStart - navEntry.requestStart
            callback({
                name: 'TTFB',
                value,
                rating: getRating('TTFB', value),
                navigationType: navEntry.type,
            })
        }
    } catch {
        // 不支持的浏览器
    }
}

/**
 * 初始化性能监控
 * @param options - 配置选项
 *
 * @example
 * ```typescript
 * // 基础使用
 * initPerformanceMonitor();
 *
 * // 自定义回调
 * initPerformanceMonitor({
 *     onMetric: (metric) => {
 *         console.log(metric.name, metric.value);
 *     }
 * });
 * ```
 */
export function initPerformanceMonitor(
    options: {
        /** 自定义指标回调 */
        onMetric?: (metric: PerformanceMetric) => void
        /** 是否上报到 Umami */
        reportToAnalytics?: boolean
        /** 是否在控制台输出 */
        logToConsole?: boolean
    } = {}
): void {
    const {
        onMetric,
        reportToAnalytics = true,
        logToConsole = process.env.NODE_ENV !== 'production',
    } = options

    const handleMetric = (metric: PerformanceMetric) => {
        if (logToConsole) logMetric(metric)
        if (reportToAnalytics) reportToUmami(metric)
        if (onMetric) onMetric(metric)
    }

    // 在页面加载完成后开始监控
    if (typeof window !== 'undefined') {
        if (document.readyState === 'complete') {
            startObserving()
        } else {
            window.addEventListener('load', startObserving, { once: true })
        }
    }

    function startObserving() {
        observeFCP(handleMetric)
        observeLCP(handleMetric)
        observeCLS(handleMetric)
        observeTTFB(handleMetric)
    }
}

/**
 * 手动上报自定义性能指标
 * @param name - 指标名称
 * @param value - 指标值 (毫秒)
 *
 * @example
 * ```typescript
 * // 记录首屏渲染时间
 * reportCustomMetric('hero-render', performance.now());
 * ```
 */
export function reportCustomMetric(name: string, value: number): void {
    const umami = (
        window as unknown as {
            umami?: { track: (event: string, data: Record<string, unknown>) => void }
        }
    ).umami

    if (umami?.track) {
        umami.track(`custom-metric-${name}`, {
            value: Math.round(value),
        })
    }
}
