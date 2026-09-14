// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'

import {
    type LazyComponentConfig,
    lazyLoadComponent,
    lazyLoadComponents,
} from '../../src/utils/lazy-components'

describe('lazy-components', () => {
    describe('lazyLoadComponent', () => {
        it('does not throw when selector matches no elements', () => {
            expect(() =>
                lazyLoadComponent({
                    selector: '.non-existent-element',
                    importFn: () => Promise.resolve({ default: () => () => {} }),
                })
            ).not.toThrow()
        })

        it('does not throw with delay option', () => {
            expect(() =>
                lazyLoadComponent({
                    selector: '.non-existent-element',
                    importFn: () => Promise.resolve({ default: () => () => {} }),
                    delay: 100,
                })
            ).not.toThrow()
        })

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
        it('processes multiple component configs without throwing', () => {
            const configs: LazyComponentConfig[] = [
                {
                    selector: '.component-a',
                    importFn: () => Promise.resolve({ default: () => () => {} }),
                },
                {
                    selector: '.component-b',
                    importFn: () => Promise.resolve({ init: () => () => {} }),
                },
            ]

            expect(() => lazyLoadComponents(configs)).not.toThrow()
        })

        it('handles empty config array', () => {
            expect(() => lazyLoadComponents([])).not.toThrow()
        })
    })
})
