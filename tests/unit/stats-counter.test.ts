// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MockIntersectionObserver } from './setup-browser'

import { destroyStatsCounters, initStatsCounters } from '../../src/utils/stats-counter'

function SSRMarkup() {
    // 与 Stats.astro 改后一致：SSR 直接输出真值，data-target/data-suffix 供 JS 动画使用
    document.body.innerHTML = `
        <div class="stats-bar">
            <div class="stat-item"><div class="value is-static">2015</div></div>
            <div class="stat-item"><div class="value" data-target="50" data-suffix="+">50+</div></div>
            <div class="stat-item"><div class="value" data-target="7" data-suffix="+">7+</div></div>
        </div>`
}

describe('stats-counter (SSR 真值 + 渐进增强)', () => {
    let rafQueue: FrameRequestCallback[]

    beforeEach(() => {
        MockIntersectionObserver.observed.length = 0
        MockIntersectionObserver.instances.length = 0
        document.body.innerHTML = ''
        rafQueue = []
        vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
            rafQueue.push(cb)
            return rafQueue.length
        })
    })

    afterEach(() => {
        destroyStatsCounters()
        document.body.innerHTML = ''
        vi.restoreAllMocks()
    })

    it('无计数器节点时不抛错', () => {
        expect(() => initStatsCounters()).not.toThrow()
        expect(MockIntersectionObserver.instances).toHaveLength(0)
    })

    it('初始化时把 SSR 真值重置为 0，交集后动画到目标值', () => {
        SSRMarkup()
        const animated = document.querySelectorAll<HTMLElement>('.stat-item .value[data-target]')
        expect(animated[0].textContent).toBe('50+')

        initStatsCounters()

        // 重置为 0（动画起点），静态项不受影响
        expect(animated[0].textContent).toBe('0+')
        expect(animated[1].textContent).toBe('0+')
        expect(document.querySelector('.stat-item .value.is-static')?.textContent).toBe('2015')
        expect(MockIntersectionObserver.instances).toHaveLength(1)

        const start = performance.now()
        MockIntersectionObserver.instances[0].trigger(animated[0], true)

        // 驱动 rAF：中途应为 0~50 之间的中间值（带后缀）
        expect(rafQueue.length).toBeGreaterThan(0)
        rafQueue.splice(0).forEach((cb) => cb(start + 500))
        const mid = animated[0].textContent!
        expect(mid.endsWith('+')).toBe(true)
        const midNum = parseInt(mid, 10)
        expect(midNum).toBeGreaterThanOrEqual(0)
        expect(midNum).toBeLessThanOrEqual(50)

        // 播完：精确落到目标值
        rafQueue.splice(0).forEach((cb) => cb(start + 2000))
        // update 递归调度的后续帧继续推进
        let guard = 0
        while (animated[0].textContent !== '50+' && guard++ < 10) {
            rafQueue.splice(0).forEach((cb) => cb(start + 2000 + guard * 100))
        }
        expect(animated[0].textContent).toBe('50+')
    })

    it('静态项（无 data-target）不被观察', () => {
        document.body.innerHTML =
            '<div class="stat-item"><div class="value is-static">2015</div></div>'
        initStatsCounters()
        expect(MockIntersectionObserver.instances).toHaveLength(0)
    })

    it('destroy 后可重新初始化（astro 视图切换场景）', () => {
        SSRMarkup()
        initStatsCounters()
        const before = MockIntersectionObserver.instances.length
        destroyStatsCounters()
        initStatsCounters()
        // mock 的 instances 数组只增不减：重初始化应新增一个观察实例
        expect(MockIntersectionObserver.instances.length).toBe(before + 1)
    })
})
