/**
 * Scroll Reveal animation using IntersectionObserver
 * Extracted from src/components/home/ui/ScrollReveal.astro
 *
 * 设计原则：内容默认可见（见 docs-global.css 的 .reveal-upon-scroll）。
 * 仅当脚本确认元素在视口之外时，才标记 data-visible="false" 将其隐藏，
 * 进入视口后翻转为 "true" 渐显。这样在无 JS / 脚本异常 / 观察器失败时，
 * 内容不会永久停留在 opacity:0（此前的实现会因此"消失"）。
 */

let _scrollRevealCleanup: (() => void) | undefined

function revealElement(el: Element): void {
    if (el instanceof HTMLElement) {
        el.dataset.visible = 'true'
    }
}

export function initScrollReveal(): void {
    if (_scrollRevealCleanup) {
        _scrollRevealCleanup()
        _scrollRevealCleanup = undefined
    }

    const revealElements = Array.from(document.querySelectorAll<HTMLElement>('.reveal-upon-scroll'))
    if (revealElements.length === 0) return

    // 无 IntersectionObserver：直接全部显示，不做隐藏
    if (typeof IntersectionObserver === 'undefined') {
        revealElements.forEach(revealElement)
        return
    }

    const observerOptions: IntersectionObserverInit = {
        root: null,
        // 提前约 25% 视口高度触发，元素进入视口前就开始渐显，避免"空白一片"
        rootMargin: '0px 0px 25% 0px',
        threshold: 0,
    }

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                revealElement(entry.target)
                observer.unobserve(entry.target)
            }
        })
    }, observerOptions)

    const viewportHeight = window.innerHeight || document.documentElement.clientHeight
    const isNearViewport = (el: HTMLElement): boolean => {
        const rect = el.getBoundingClientRect()
        return rect.top < viewportHeight * 1.25 && rect.bottom > 0
    }

    revealElements.forEach((el) => {
        if (isNearViewport(el)) {
            // 首屏 / 锚点定位 / 刷新恢复滚动位置：立即可见，避免"闪现空白"
            revealElement(el)
        } else {
            el.dataset.visible = 'false'
            revealObserver.observe(el)
        }
    })

    // 兜底：观察器异常时，确保已在视口内的元素不至于永久隐藏
    const safetyTimer = window.setTimeout(() => {
        document
            .querySelectorAll<HTMLElement>('.reveal-upon-scroll[data-visible="false"]')
            .forEach((el) => {
                if (isNearViewport(el) || el.getBoundingClientRect().height === 0) {
                    revealElement(el)
                }
            })
    }, 2000)

    _scrollRevealCleanup = () => {
        window.clearTimeout(safetyTimer)
        revealObserver.disconnect()
    }
}
