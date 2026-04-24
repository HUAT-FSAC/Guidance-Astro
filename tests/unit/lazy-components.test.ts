import { describe, expect, it } from 'vitest'

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
