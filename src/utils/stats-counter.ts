/**
 * Stats 计数器动画
 *
 * 抽离自 Stats.astro 的内联 <script>，便于打包缓存与单测。
 *
 * 行为：IntersectionObserver 触发 easeOut 计数；若 PageLoader 仍在前台显示，
 * 则等待 pageLoaderHidden 事件后再启动（3s 保底），避免首屏动画被加载层遮挡。
 */

import { createLogger } from './logger'

const log = createLogger('Stats')

let cleanup: (() => void) | undefined

function animateCounters(): () => void {
    const counters = document.querySelectorAll<HTMLElement>('.stat-item .value[data-target]')
    if (counters.length === 0) {
        log.warn('未找到计数器节点，放弃动画')
        return () => {}
    }

    log.info('注册计数器观察', { count: counters.length })

    const observer = new IntersectionObserver(
        (entries) => {
            for (const entry of entries) {
                if (!entry.isIntersecting) continue
                const el = entry.target as HTMLElement
                if (el.dataset.animated) continue
                el.dataset.animated = 'true'

                const target = parseInt(el.dataset.target || '0', 10)
                const suffix = el.dataset.suffix || ''
                const duration = 2000
                const startTime = performance.now()

                log.info('开始计数动画', { target, suffix, duration })

                function update(currentTime: number): void {
                    const elapsed = currentTime - startTime
                    const progress = Math.min(elapsed / duration, 1)
                    // easeOutQuart
                    const easeProgress = 1 - Math.pow(1 - progress, 4)
                    const current = Math.floor(easeProgress * target)
                    el.textContent = current + suffix

                    if (progress < 1) {
                        requestAnimationFrame(update)
                    } else {
                        el.textContent = target + suffix
                        log.info('计数动画完成', { target, suffix })
                    }
                }

                requestAnimationFrame(update)
                observer.unobserve(el)
            }
        },
        { threshold: 0.1 }
    )

    counters.forEach((counter) => observer.observe(counter))
    return () => observer.disconnect()
}

function initCounters(): void {
    if (cleanup) {
        log.info('重新初始化：先清理上一实例')
        cleanup()
        cleanup = undefined
    }

    const loader = document.getElementById('pageLoader')
    const isLoaderActive =
        loader && !loader.classList.contains('loaded') && loader.style.display !== 'none'

    if (isLoaderActive) {
        log.info('PageLoader 仍在显示，等待 pageLoaderHidden 后再启动（3s 保底）')
        let started = false
        let observerCleanup: (() => void) | undefined
        const startCounters = (): void => {
            if (started) return
            started = true
            log.info('收到启动信号，开始注册计数器')
            observerCleanup = animateCounters()
        }

        window.addEventListener('pageLoaderHidden', startCounters, { once: true })
        const fallbackTimer = window.setTimeout(startCounters, 3000)

        cleanup = () => {
            window.clearTimeout(fallbackTimer)
            window.removeEventListener('pageLoaderHidden', startCounters)
            observerCleanup?.()
        }
    } else {
        log.info('PageLoader 未激活，直接启动计数器')
        const observerCleanup = animateCounters()
        cleanup = () => observerCleanup()
    }
}

/** 初始化页面上所有计数器。在 astro:page-load 下调用，内部有重入保护。 */
export function initStatsCounters(): void {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        log.info('initStatsCounters: 文档已就绪，立即初始化', { readyState: document.readyState })
        initCounters()
    } else {
        log.info('initStatsCounters: 文档未就绪，等待 DOMContentLoaded', {
            readyState: document.readyState,
        })
        document.addEventListener('DOMContentLoaded', initCounters, { once: true })
    }
}

/** 视图切换前清理。 */
export function destroyStatsCounters(): void {
    if (cleanup) {
        log.info('destroyStatsCounters: 清理计数器实例')
        cleanup()
        cleanup = undefined
    }
}
