// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'

import {
    type LazyComponentConfig,
    lazyLoadComponent,
    lazyLoadComponents,
} from '../../src/utils/lazy-components'

describe('lazy-components', () => {
    describe('lazyLoadComponent', () => {
        it('loads component with default export when matching element exists', async () => {
            const el = document.createElement('div')
            el.className = 'test-lazy-default'
            document.body.appendChild(el)

            const cleanupFn = vi.fn()
            const initFn = vi.fn().mockReturnValue(cleanupFn)
            const importFn = vi.fn().mockResolvedValue({ default: initFn })

            lazyLoadComponent({
                selector: '.test-lazy-default',
                importFn,
            })

            await Promise.resolve()
            await Promise.resolve()

            expect(importFn).toHaveBeenCalled()
            expect(initFn).toHaveBeenCalledWith(el)
            document.body.removeChild(el)
        })

        it('loads component with init export and delay option', async () => {
            vi.useFakeTimers()
            const el = document.createElement('div')
            el.className = 'test-lazy-init'
            document.body.appendChild(el)

            const initFn = vi.fn()
            const importFn = vi.fn().mockResolvedValue({ init: initFn })

            lazyLoadComponent({
                selector: '.test-lazy-init',
                importFn,
                delay: 200,
            })

            expect(importFn).not.toHaveBeenCalled()
            await vi.advanceTimersByTimeAsync(200)

            expect(importFn).toHaveBeenCalled()
            expect(initFn).toHaveBeenCalledWith(el)
            vi.useRealTimers()
            document.body.removeChild(el)
        })

        it('handles import error gracefully and logs to console.error', async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
            const el = document.createElement('div')
            el.className = 'test-lazy-error'
            document.body.appendChild(el)

            const error = new Error('Chunk load failed')
            lazyLoadComponent({
                selector: '.test-lazy-error',
                importFn: () => Promise.reject(error),
            })

            await Promise.resolve()
            await Promise.resolve()

            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('Failed to lazy load component'),
                error
            )
            consoleSpy.mockRestore()
            document.body.removeChild(el)
        })
    })

    describe('lazyLoadComponents', () => {
        it('initializes matching components for each config', async () => {
            const first = document.createElement('div')
            first.className = 'component-a'
            const second = document.createElement('div')
            second.className = 'component-b'
            document.body.append(first, second)

            const initA = vi.fn().mockReturnValue(() => {})
            const initB = vi.fn().mockReturnValue(() => {})
            const configs: LazyComponentConfig[] = [
                { selector: '.component-a', importFn: () => Promise.resolve({ default: initA }) },
                { selector: '.component-b', importFn: () => Promise.resolve({ init: initB }) },
            ]

            lazyLoadComponents(configs)
            await Promise.resolve()
            await Promise.resolve()

            expect(initA).toHaveBeenCalledWith(first)
            expect(initB).toHaveBeenCalledWith(second)
            first.remove()
            second.remove()
        })
    })
})
