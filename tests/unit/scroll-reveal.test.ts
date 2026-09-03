// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MockIntersectionObserver } from '../../tests/unit/setup-browser'

import { initScrollReveal } from '../../src/utils/scroll-reveal'

describe('initScrollReveal', () => {
    beforeEach(() => {
        MockIntersectionObserver.observed.length = 0
        MockIntersectionObserver.instances.length = 0
        document.body.innerHTML = ''
    })

    afterEach(() => {
        document.body.innerHTML = ''
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
        expect(el.dataset.visible).toBe('true')
    })

    it('does not mark elements visible until they intersect', () => {
        document.body.innerHTML = '<div class="reveal-upon-scroll"></div>'
        const el = document.querySelector('.reveal-upon-scroll') as HTMLElement

        initScrollReveal()
        MockIntersectionObserver.instances[0].trigger(el, false)

        expect(el.dataset.visible).not.toBe('true')
    })
})
