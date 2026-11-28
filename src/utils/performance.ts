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

import { createClsTracker, type LayoutShiftSample } from './layout-shift'

let initialized = false

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
            value:
                metric.name === 'CLS' ? Number(metric.value.toFixed(4)) : Math.round(metric.value),
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
        // 开发环境下输出性能指标到控制台，用于调试
        // 这是有意的设计，不是代码异味
        // eslint-disable-next-line no-console
        console.log(
            `${colors[metric.rating]}[${metric.name}]${reset} ${metric.value.toFixed(2)} (${metric.rating})`
        )
    }
}

function observeEntries(
    type: string,
    collect: (entries: readonly PerformanceEntry[]) => void
): PerformanceObserver | undefined {
    if (
        typeof PerformanceObserver === 'undefined' ||
        !PerformanceObserver.supportedEntryTypes.includes(type)
    ) {
        return undefined
    }

    const observer = new PerformanceObserver((list) => collect(list.getEntries()))
    observer.observe({ type, buffered: true })
    return observer
}

function observeDocument(report: (metric: PerformanceMetric) => void): void {
    const emit = (name: PerformanceMetric['name'], value: number) => {
        report({ name, value, rating: getRating(name, value) })
    }

    let fcpReported = false
    const collectFcp = (entries: readonly PerformanceEntry[]) => {
        const firstPaint = entries.find(({ name }) => name === 'first-contentful-paint')
        if (!firstPaint || fcpReported) return
        fcpReported = true
        fcpObserver?.disconnect()
        emit('FCP', firstPaint.startTime)
    }
    const fcpObserver = observeEntries('paint', collectFcp)

    let lcp: number | undefined
    const collectLcp = (entries: readonly PerformanceEntry[]) => {
        lcp = entries.at(-1)?.startTime ?? lcp
    }
    const lcpObserver = observeEntries('largest-contentful-paint', collectLcp)

    let cls = 0
    const trackCls = createClsTracker()
    const collectCls = (entries: readonly PerformanceEntry[]) => {
        cls = trackCls(entries as readonly (PerformanceEntry & LayoutShiftSample)[])
    }
    const clsObserver = observeEntries('layout-shift', collectCls)

    let finished = false
    const onVisibilityChange = () => {
        if (document.visibilityState === 'hidden') finish()
    }
    const finish = () => {
        if (finished) return
        finished = true
        document.removeEventListener('visibilitychange', onVisibilityChange)
        window.removeEventListener('pagehide', finish)

        const pendingFcp = fcpObserver?.takeRecords() ?? []
        collectLcp(lcpObserver?.takeRecords() ?? [])
        collectCls(clsObserver?.takeRecords() ?? [])
        fcpObserver?.disconnect()
        lcpObserver?.disconnect()
        clsObserver?.disconnect()

        collectFcp(pendingFcp)
        if (lcp !== undefined) emit('LCP', lcp)
        if (clsObserver) emit('CLS', cls)
    }

    // Each document sends one sample at its first hide or pagehide.
    // An SPA swap or BFCache restore retains the same sample identity.
    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('pagehide', finish)
    onVisibilityChange()
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
            const value = navEntry.responseStart
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
    if (typeof window === 'undefined' || initialized) return
    initialized = true

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

    function startObserving() {
        observeTTFB(handleMetric)
        observeDocument(handleMetric)
    }

    if (document.readyState === 'complete') {
        startObserving()
    } else {
        window.addEventListener('load', startObserving, { once: true })
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
