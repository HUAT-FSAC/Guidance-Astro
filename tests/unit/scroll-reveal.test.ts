// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MockIntersectionObserver } from '../../tests/unit/setup-browser'

import { initScrollReveal } from '../../src/utils/scroll-reveal'

/**
 * #168：scroll reveal 改为「默认可见 + JS 增强」。
 *
 * 语义要点（CSS 侧不再默认 opacity:0，只有脚本确认离屏才隐藏）：
 *   1. 无 IntersectionObserver → 全部直接显现，不做任何隐藏；
 *   2. 近视口元素（rect.top < viewportHeight * 1.25 且 rect.bottom > 0）→ 立即可见，且不被 observe；
 *   3. 离屏元素 → 标 data-visible="false" 并交给观察器，进入视口后翻 "true"；
 *   4. 2s 兜底：观察器没触发但元素其实已在视口内（或高度为 0）→ 强制显现，避免永久隐藏。
 *
 * jsdom 的 getBoundingClientRect() 默认返回全 0 → bottom > 0 不成立，会被判为「离屏」，
 * 因此近视口/兜底两类必须显式打桩 rect 才能真正覆盖（否则用例对新旧实现同判通过，无守卫力）。
 */

function rect(top: number, bottom: number): DOMRect {
    return {
        top,
        bottom,
        left: 0,
        right: 100,
        width: 100,
        height: bottom - top,
        x: 0,
        y: top,
        toJSON: () => ({}),
    } as DOMRect
}

function mountReveal(count = 1): HTMLElement[] {
    document.body.innerHTML = ''
    const els: HTMLElement[] = []
    for (let i = 0; i < count; i++) {
        const el = document.createElement('div')
        el.className = 'reveal-upon-scroll'
        document.body.appendChild(el)
        els.push(el)
    }
    return els
}

describe('initScrollReveal', () => {
    beforeEach(() => {
        MockIntersectionObserver.observed.length = 0
        MockIntersectionObserver.instances.length = 0
        document.body.innerHTML = ''
    })

    afterEach(() => {
        document.body.innerHTML = ''
        vi.unstubAllGlobals()
        vi.useRealTimers()
        vi.restoreAllMocks()
    })

    it('does nothing when no reveal elements exist', () => {
        expect(() => initScrollReveal()).not.toThrow()
        expect(MockIntersectionObserver.instances).toHaveLength(0)
    })

    it('observes off-screen reveal elements and marks them visible on intersection', () => {
        const [el] = mountReveal()
        el.getBoundingClientRect = () => rect(5000, 5100) // 远离心视口 → 走观察器

        initScrollReveal()

        expect(MockIntersectionObserver.instances).toHaveLength(1)
        expect(MockIntersectionObserver.observed).toContain(el)
        expect(el.dataset.visible).toBe('false')

        MockIntersectionObserver.instances[0].trigger(el, true)
        expect(el.dataset.visible).toBe('true')
    })

    it('does not mark elements visible until they intersect', () => {
        const [el] = mountReveal()
        el.getBoundingClientRect = () => rect(5000, 5100)

        initScrollReveal()
        MockIntersectionObserver.instances[0].trigger(el, false)

        expect(el.dataset.visible).not.toBe('true')
    })

    // ── #168 新增：渐进增强的三条核心语义 ─────────────────────────────

    it('reveals elements near the viewport immediately and does not observe them', () => {
        const [el] = mountReveal()
        // jsdom 默认 innerHeight = 768 → 768 * 1.25 = 960；bottom > 0 才算近视口
        el.getBoundingClientRect = () => rect(100, 200)

        initScrollReveal()

        expect(el.dataset.visible).toBe('true')
        expect(MockIntersectionObserver.observed).not.toContain(el)
        expect(MockIntersectionObserver.instances).toHaveLength(1) // 观察器仍为离屏元素而建立
    })

    it('reveals everything without hiding when IntersectionObserver is unavailable', () => {
        vi.stubGlobal('IntersectionObserver', undefined)
        const els = mountReveal(3)

        initScrollReveal()

        els.forEach((el) => expect(el.dataset.visible).toBe('true'))
        expect(MockIntersectionObserver.instances).toHaveLength(0)
    })

    it('falls back to visible after the safety timer for elements the observer never reported', () => {
        vi.useFakeTimers()
        const [el] = mountReveal()
        el.getBoundingClientRect = () => rect(5000, 5100)

        initScrollReveal()
        expect(el.dataset.visible).toBe('false')

        // 模拟「观察器一直没回调，但元素其实已滚进视口」
        el.getBoundingClientRect = () => rect(50, 150)
        vi.advanceTimersByTime(2000)

        expect(el.dataset.visible).toBe('true')
    })

    it('cleans up previous observer and timer on re-init (astro:page-load 重入安全)', () => {
        const [el] = mountReveal()
        el.getBoundingClientRect = () => rect(5000, 5100)

        initScrollReveal()
        const first = MockIntersectionObserver.instances[0]
        // 桩件的 disconnect 是无副作用的空函数，因此用 spy 断言它真的被调用过
        const disconnectSpy = vi.spyOn(first, 'disconnect')

        initScrollReveal()

        expect(disconnectSpy).toHaveBeenCalledTimes(1)
        expect(MockIntersectionObserver.instances.length).toBeGreaterThanOrEqual(2)
    })
})
