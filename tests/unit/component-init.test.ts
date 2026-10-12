// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
    cleanupAllComponents,
    cleanupComponent,
    cleanupElement,
    getComponentName,
    initComponent,
    initElement,
    isComponentInitialized,
    isElementInitialized,
    markComponentInitialized,
    setupComponentLifecycle,
} from '../../src/utils/component-init'
describe('component-init', () => {
    beforeEach(() => {
        document.body.innerHTML = ''
    })
    it('initElement success and duplicate', () => {
        const el = document.createElement('div')
        el.id = 'test-init-el'
        document.body.appendChild(el)
        const fn = vi.fn(() => () => {})
        expect(initElement(el, fn)).toBe(true)
        expect(isElementInitialized(el)).toBe(true)
        expect(initElement(el, fn)).toBe(false)
        expect(isComponentInitialized('#test-init-el')).toBe(true)
        expect(isComponentInitialized('#nope-not-exist')).toBe(false)
        // cleanup
        cleanupElement(el)
        expect(isElementInitialized(el)).toBe(false)
        el.remove()
    })
    it('initElement handles error', () => {
        const el = document.createElement('div')
        expect(
            initElement(el, () => {
                throw new Error('fail')
            })
        ).toBe(false)
    })
    it('initComponent with selector', () => {
        document.body.innerHTML = '<div id="a"></div>'
        expect(initComponent('#a', () => {})).toBe(true)
        expect(initComponent('#a', () => {})).toBe(false)
        expect(initComponent('#nope', () => {})).toBe(false)
        cleanupComponent('#a')
        expect(isComponentInitialized('#a')).toBe(false)
        cleanupAllComponents()
    })
    it('markComponentInitialized and getComponentName', () => {
        const el = document.createElement('div')
        markComponentInitialized(el, 'test-comp')
        expect(getComponentName(el)).toBe('test-comp')
        el.remove()
    })
    it('setupComponentLifecycle', () => {
        document.body.innerHTML = '<div id="b"></div>'
        const fn = vi.fn()
        setupComponentLifecycle('#b', fn)
        // need to trigger DOMContentLoaded? already past, so fn called via init()
        // we at least ensure no throw
        expect(fn).toHaveBeenCalled()
        // cleanup via astro:after-preparation
        document.dispatchEvent(new Event('astro:after-preparation'))
        expect(isComponentInitialized('#b')).toBe(false)
    })
})
