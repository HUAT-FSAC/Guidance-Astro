/**
 * Showcase 首页轮播交互
 *
 * 从 <script type="application/json" id="showcase-data"> 读取模块数据，
 * 绑定 prev/next/dots、5s 自动轮播、hover 暂停。
 *
 * 抽离自 Showcase.astro 原先的 <script define:vars> 内联脚本——
 * define:vars 会让 Astro 把脚本作为未打包的原始内联脚本输出，无法被浏览器缓存。
 * 改为读取页面内 JSON + 打包模块后，脚本进入构建产物的可缓存 chunk。
 */

import { createLogger } from './logger'

const log = createLogger('Showcase')

interface ShowcaseModule {
    cn: string
    en: string
    link: string
    image: string
    desc: string
}

interface CarouselState {
    timer: number
    cleanup: () => void
}

const instances = new WeakMap<Element, CarouselState>()

function readModules(root: Element): ShowcaseModule[] | null {
    const dataEl = root.querySelector('#showcase-data')
    if (!dataEl?.textContent) {
        log.warn('readModules: 未找到 #showcase-data 或内容为空', {
            hasElement: !!dataEl,
        })
        return null
    }
    try {
        const parsed = JSON.parse(dataEl.textContent) as ShowcaseModule[]
        log.info('readModules: 解析数据成功', { count: parsed.length })
        return parsed
    } catch (err) {
        log.error('readModules: JSON 解析失败', {
            error: err instanceof Error ? err.message : String(err),
        })
        return null
    }
}

function initCarousel(section: Element): void {
    // 重入安全：已初始化则跳过
    if (instances.has(section)) {
        log.info('initCarousel: 已初始化，跳过重入', { section })
        return
    }

    const data = readModules(section)
    if (!data || data.length === 0) {
        log.warn('initCarousel: 数据为空，放弃初始化', {
            section,
            dataNull: data === null,
        })
        return
    }

    const slides = section.querySelectorAll<HTMLElement>('.showcase-slide')
    const titleEl = section.querySelector<HTMLElement>('#showcase-title')
    const enEl = section.querySelector<HTMLElement>('#showcase-en')
    const descEl = section.querySelector<HTMLElement>('#showcase-desc')
    const ctaEl = section.querySelector<HTMLAnchorElement>('#showcase-cta')
    const prevBtn = section.querySelector<HTMLElement>('#showcase-prev')
    const nextBtn = section.querySelector<HTMLElement>('#showcase-next')
    const dots = section.querySelectorAll<HTMLElement>('.showcase-dot')
    const total = data.length
    let current = 0

    // 收集缺失的必需节点，便于定位渲染异常
    const missing: string[] = []
    if (!titleEl) missing.push('#showcase-title')
    if (!enEl) missing.push('#showcase-en')
    if (!descEl) missing.push('#showcase-desc')
    if (!ctaEl) missing.push('#showcase-cta')
    if (total === 0) missing.push('data(total=0)')

    if (missing.length > 0) {
        log.warn('initCarousel: 缺少必需 DOM 节点，放弃初始化', {
            section,
            missing,
            slidesFound: slides.length,
        })
        return
    }

    log.info('initCarousel: 绑定事件并启动', {
        section,
        total,
        slidesFound: slides.length,
        dotsFound: dots.length,
        hasPrev: !!prevBtn,
        hasNext: !!nextBtn,
    })

    function goTo(index: number): void {
        const prev = current
        slides[prev]?.classList.remove('active')
        dots[prev]?.classList.remove('active')
        current = ((index % total) + total) % total
        slides[current]?.classList.add('active')
        dots[current]?.classList.add('active')
        titleEl!.textContent = data![current]!.cn
        enEl!.textContent = data![current]!.en
        descEl!.textContent = data![current]!.desc
        ctaEl!.href = data![current]!.link
        log.info('goTo: 切换幻灯片', { from: prev, to: current, total })
    }

    function next(): void {
        log.info('next: 用户/自动触发下一张', { from: current })
        goTo(current + 1)
    }

    function prev(): void {
        log.info('prev: 用户触发上一张', { from: current })
        goTo(current - 1)
    }

    function startTimer(): void {
        stopTimer()
        timer = window.setInterval(next, 5000)
        log.info('startTimer: 自动轮播已启动', { intervalMs: 5000 })
    }

    function stopTimer(): void {
        if (timer) {
            clearInterval(timer)
            timer = 0
            log.info('stopTimer: 自动轮播已停止')
        }
    }

    let timer = 0

    prevBtn?.addEventListener('click', prev)
    nextBtn?.addEventListener('click', next)
    dots.forEach((dot) => {
        dot.addEventListener('click', () => {
            const target = Number(dot.getAttribute('data-index') || '0')
            log.info('dot: 点击指示点跳转', { target, from: current })
            goTo(target)
        })
    })

    section.addEventListener('mouseenter', stopTimer)
    section.addEventListener('mouseleave', startTimer)

    startTimer()

    const cleanup = (): void => {
        stopTimer()
        prevBtn?.removeEventListener('click', prev)
        nextBtn?.removeEventListener('click', next)
        section.removeEventListener('mouseenter', stopTimer)
        section.removeEventListener('mouseleave', startTimer)
        log.info('cleanup: 已移除事件监听', { section })
    }

    instances.set(section, { timer, cleanup })
}

/**
 * 初始化页面上所有 Showcase 轮播。
 * 在 Astro View Transitions 下通过 astro:page-load 调用；
 * 内部对每个 section 做重入保护，并记录实例以便 before-swap 清理。
 */
export function initShowcaseCarousel(): void {
    const sections = document.querySelectorAll('.showcase-hero')
    log.info('initShowcaseCarousel: 扫描页面轮播节点', {
        found: sections.length,
    })
    sections.forEach(initCarousel)
}

/** 在视图切换前清理所有实例，避免跨页面的定时器泄漏。 */
export function destroyShowcaseCarousels(): void {
    const sections = document.querySelectorAll('.showcase-hero')
    let cleaned = 0
    sections.forEach((section) => {
        const state = instances.get(section)
        if (state) {
            state.cleanup()
            instances.delete(section)
            cleaned++
        }
    })
    log.info('destroyShowcaseCarousels: 清理完成', {
        scanned: sections.length,
        cleaned,
    })
}
