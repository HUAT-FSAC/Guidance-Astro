// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'

import {
    announce,
    getA11yPreferences,
    initAccessibility,
    initSkipLink,
    resetA11yPreferences,
    toggleHighContrast,
    toggleKeyboardNavigationOnly,
    toggleLargeText,
    toggleReducedMotion,
    toggleScreenReaderOptimized,
    trapFocus,
    updateA11yPreferences,
} from '../../src/utils/accessibility'
describe('accessibility', () => {
    beforeEach(() => {
        localStorage.clear()
        document.documentElement.className = ''
        document.body.innerHTML = ''
    })
    it('get/update/reset preferences', () => {
        const prefs = getA11yPreferences()
        expect(prefs.highContrast).toBe(false)
        updateA11yPreferences({ highContrast: true, largeText: true })
        expect(getA11yPreferences().highContrast).toBe(true)
        expect(document.documentElement.classList.contains('a11y-high-contrast')).toBe(true)
        expect(document.documentElement.classList.contains('a11y-large-text')).toBe(true)
        resetA11yPreferences()
        expect(getA11yPreferences().highContrast).toBe(false)
        expect(document.documentElement.classList.contains('a11y-high-contrast')).toBe(false)
    })
    it('toggle helpers', () => {
        expect(toggleHighContrast(true)).toBe(true)
        expect(toggleHighContrast(false)).toBe(false)
        expect(toggleHighContrast()).toBe(true)
        expect(toggleLargeText(true)).toBe(true)
        expect(toggleReducedMotion(true)).toBe(true)
        toggleReducedMotion(false)
        expect(getA11yPreferences().reducedMotion).toBe(false)
    })
    it('announce and trapFocus', () => {
        announce('hello')
        expect(document.body.textContent).toContain('hello')
        announce('world', 'assertive')
        const el = document.createElement('div')
        el.innerHTML = '<button>one</button><button>two</button>'
        document.body.appendChild(el)
        const cleanup = trapFocus(el)
        expect(typeof cleanup).toBe('function')
        cleanup()
        el.remove()
    })
    it('initSkipLink and initAccessibility', () => {
        initSkipLink()
        expect(document.querySelector('.a11y-skip-link')).toBeTruthy()
        initAccessibility()
        expect(document.querySelector('.a11y-skip-link')).toBeTruthy()
    })
})
describe('accessibility toggles', () => {
    beforeEach(() => {
        localStorage.clear()
        document.documentElement.className = ''
    })
    it('toggle remaining', () => {
        expect(toggleScreenReaderOptimized(true)).toBe(true)
        expect(toggleScreenReaderOptimized(false)).toBe(false)
        expect(toggleKeyboardNavigationOnly(true)).toBe(true)
        expect(toggleKeyboardNavigationOnly(false)).toBe(false)
        // toggle without arg
        expect(toggleScreenReaderOptimized()).toBe(true)
        expect(toggleKeyboardNavigationOnly()).toBe(true)
        updateA11yPreferences({ screenReaderOptimized: true, keyboardNavigationOnly: true })
        const prefs = getA11yPreferences()
        expect(prefs.screenReaderOptimized).toBe(true)
        resetA11yPreferences()
        expect(getA11yPreferences().screenReaderOptimized).toBe(false)
    })
    it('loadPreferences with stored values', () => {
        localStorage.setItem(
            'huat-a11y-preferences',
            JSON.stringify({ highContrast: true, largeText: true })
        )
        const prefs = getA11yPreferences()
        expect(prefs.highContrast).toBe(true)
        expect(document.documentElement.classList.contains('a11y-high-contrast')).toBe(true)
        localStorage.setItem('huat-a11y-preferences', 'invalid json')
        expect(getA11yPreferences().highContrast).toBe(false) // fallback to default due to parse error handling in storage
    })
})

describe('accessibility focus trap', () => {
    it('announce and trapFocus with shift+tab', () => {
        announce('test1')
        announce('test2', 'assertive')
        const el = document.createElement('div')
        el.innerHTML = '<button>one</button><button>two</button>'
        document.body.appendChild(el)
        const cleanup = trapFocus(el)
        const first = el.querySelector('button')!
        const last = el.querySelectorAll('button')[1] as HTMLElement
        // focus first, then shift+tab should go to last
        first.focus()
        expect(document.activeElement).toBe(first)
        const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true })
        el.dispatchEvent(event)
        expect(document.activeElement).toBe(last)
        // tab from last should go to first
        last.focus()
        const event2 = new KeyboardEvent('keydown', { key: 'Tab' })
        el.dispatchEvent(event2)
        expect(document.activeElement).toBe(first)
        cleanup()
        el.remove()
    })
})
