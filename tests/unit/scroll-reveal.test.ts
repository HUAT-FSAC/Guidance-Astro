// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { initScrollReveal } from '../../src/utils/scroll-reveal'

type ObserverCallback = IntersectionObserverCallback

class MockIntersectionObserver implements IntersectionObserver {
    readonly root = null
    readonly rootMargin = '0px'
    readonly thresholds = [0]
    readonly callback: ObserverCallback
    readonly observe = vi.fn((target: Element) => {
        MockIntersectionObserver.observed.push(target)
    })
    readonly unobserve = vi.fn()
    readonly disconnect = vi.fn()
    readonly takeRecords = vi.fn(() => [])

    static observed: Element[] = []
    static instances: MockIntersectionObserver[] = []

    constructor(callback: ObserverCallback) {
        this.callback = callback
        MockIntersectionObserver.instances.push(this)
    }

    trigger(target: Element, isIntersecting: boolean) {
        this.callback(
            [
                {
                    target,
                    isIntersecting,
                    intersectionRatio: isIntersecting ? 1 : 0,
                    time: 0,
                    boundingClientRect: {} as DOMRectReadOnly,
                    intersectionRect: {} as DOMRectReadOnly,
                    rootBounds: null,
                },
            ],
            this
        )
    }
}

describe('initScrollReveal', () => {
    beforeEach(() => {
        MockIntersectionObserver.observed = []
        MockIntersectionObserver.instances = []
        vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
        document.body.innerHTML = ''
    })

    afterEach(() => {
        document.body.innerHTML = ''
        vi.unstubAllGlobals()
        vi.restoreAllMocks()
    })

    it('does nothing when no reveal elements exist', () => {
        expect(() => initScrollReveal()).not.toThrow()
        expect(MockIntersectionObserver.instances).toHaveLength(0)
    })

    it('observes reveal elements and marks them visible on intersection', () => {
        document.body.innerHTML = '<div class="reveal-upon-scroll"></div>'
        const el = document.querySelector('.reveal-upon-scroll') as HTMLElement

        initScrollReveal()

        expect(MockIntersectionObserver.instances).toHaveLength(1)
        expect(MockIntersectionObserver.observed).toContain(el)

        MockIntersectionObserver.instances[0].trigger(el, true)
        expect(el.classList.contains('is-visible')).toBe(true)
        expect(MockIntersectionObserver.instances[0].unobserve).toHaveBeenCalledWith(el)
    })

    it('does not mark elements visible until they intersect', () => {
        document.body.innerHTML = '<div class="reveal-upon-scroll"></div>'
        const el = document.querySelector('.reveal-upon-scroll') as HTMLElement

        initScrollReveal()
        MockIntersectionObserver.instances[0].trigger(el, false)

        expect(el.classList.contains('is-visible')).toBe(false)
    })
})
