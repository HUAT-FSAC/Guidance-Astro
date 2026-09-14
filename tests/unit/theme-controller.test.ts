// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
    initThemeController,
    setupThemeControllerLifecycle,
    THEME_COLORS,
    THEME_STORAGE_KEYS,
} from '../../src/utils/theme-controller'
import { isComponentInitialized } from '../../src/utils/component-init'

const themeHtml = () => `
  <div id="theme-root">
    <button class="theme-toggle">toggle</button>
    <div class="theme-dropdown" data-open="false">
      <button class="color-option" data-color="#3b82f6" data-accent="#2563eb" title="Classic Blue">blue</button>
      <button class="color-option" data-color="#e74c3c" data-accent="#c0392b" title="Racing Red">red</button>
    </div>
    <div class="color-indicator"></div>
  </div>
`

const mount = () => {
    document.body.innerHTML = themeHtml()
    return document.getElementById('theme-root')!
}

describe('theme controller', () => {
    beforeEach(() => {
        localStorage.clear()
        document.documentElement.removeAttribute('data-theme')
        vi.useRealTimers()
    })

    afterEach(() => {
        document.body.innerHTML = ''
        vi.useRealTimers()
    })

    it('returns a noop when the toggle or dropdown is missing', () => {
        const root = document.createElement('div')
        const cleanup = initThemeController(root, {
            toggleSelector: '.missing-toggle',
            dropdownSelector: '.missing-dropdown',
        })
        expect(cleanup).toBeInstanceOf(Function)
        expect(cleanup()).toBeUndefined()
    })

    it('keeps the dropdown closed on plain click and toggles the scheme', () => {
        const root = mount()
        const cleanup = initThemeController(root)
        const toggle = root.querySelector('.theme-toggle')!
        const dropdown = root.querySelector<HTMLElement>('.theme-dropdown')!

        toggle.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        expect(dropdown.dataset.open).toBe('false')
        cleanup()
    })

    it('toggles the color scheme on click and persists it', () => {
        const root = mount()
        initThemeController(root)
        const toggle = root.querySelector('.theme-toggle')!

        toggle.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
        expect(localStorage.getItem(THEME_STORAGE_KEYS.scheme)).toBe('dark')

        toggle.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        expect(document.documentElement.getAttribute('data-theme')).toBe('light')
        expect(localStorage.getItem(THEME_STORAGE_KEYS.starlightScheme)).toBe('light')
    })

    it('opens and closes the dropdown via context menu', () => {
        const root = mount()
        const cleanup = initThemeController(root)
        const toggle = root.querySelector('.theme-toggle')!
        const dropdown = root.querySelector<HTMLElement>('.theme-dropdown')!

        toggle.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }))
        expect(dropdown.dataset.open).toBe('true')

        toggle.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }))
        expect(dropdown.dataset.open).toBe('false')
        cleanup()
    })

    it('opens the dropdown after a long press', () => {
        vi.useFakeTimers()
        const root = mount()
        const cleanup = initThemeController(root, { longPressDuration: 400 })
        const toggle = root.querySelector('.theme-toggle')!
        const dropdown = root.querySelector<HTMLElement>('.theme-dropdown')!

        toggle.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }))
        vi.advanceTimersByTime(400)
        expect(dropdown.dataset.open).toBe('true')

        // the following click is swallowed after a long press
        toggle.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        expect(dropdown.dataset.open).toBe('true')
        cleanup()
        vi.useRealTimers()
    })

    it('navigates the color options with the arrow keys', () => {
        const root = mount()
        const cleanup = initThemeController(root)
        const toggle = root.querySelector('.theme-toggle')!
        const options = root.querySelectorAll<HTMLElement>('.color-option')

        toggle.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }))
        options[0].focus()
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
        expect(document.activeElement).toBe(options[1])
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
        expect(document.activeElement).toBe(options[0])

        cleanup()
    })

    it('closes the dropdown on Escape and on outside clicks', () => {
        const root = mount()
        const cleanup = initThemeController(root)
        const toggle = root.querySelector('.theme-toggle')!
        const dropdown = root.querySelector<HTMLElement>('.theme-dropdown')!

        toggle.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
        expect(dropdown.dataset.open).toBe('false')

        toggle.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        document.dispatchEvent(new MouseEvent('click'))
        expect(dropdown.dataset.open).toBe('false')
        cleanup()
    })

    it('applies a selected theme color and closes the dropdown', () => {
        const root = mount()
        const cleanup = initThemeController(root)
        const options = root.querySelectorAll<HTMLElement>('.color-option')
        const dropdown = root.querySelector<HTMLElement>('.theme-dropdown')!
        const indicator = root.querySelector<HTMLElement>('.color-indicator')!

        options[0].dispatchEvent(new MouseEvent('click', { bubbles: true }))
        expect(document.documentElement.style.getPropertyValue('--sl-color-accent')).toBe('#3b82f6')
        expect(options[0].dataset.selected).toBe('true')
        expect(options[1].dataset.selected).toBe('false')
        expect(indicator.style.background).toBe('rgb(59, 130, 246)')
        expect(dropdown.dataset.open).toBe('false')
        expect(localStorage.getItem(THEME_STORAGE_KEYS.color)).toBe('#3b82f6')
        expect(localStorage.getItem(THEME_STORAGE_KEYS.accent)).toBe('#2563eb')

        cleanup()
    })

    it('ignores color options without data attributes', () => {
        const root = mount()
        const cleanup = initThemeController(root)
        const bare = document.createElement('button')
        bare.classList.add('color-option')
        root.appendChild(bare)

        expect(() => bare.dispatchEvent(new MouseEvent('click', { bubbles: true }))).not.toThrow()
        cleanup()
    })

    it('restores a saved scheme, color and accent on init', () => {
        localStorage.setItem(THEME_STORAGE_KEYS.scheme, 'dark')
        localStorage.setItem(THEME_STORAGE_KEYS.starlightScheme, 'dark')
        localStorage.setItem(THEME_STORAGE_KEYS.color, '#e74c3c')
        localStorage.setItem(THEME_STORAGE_KEYS.accent, '#c0392b')

        const root = mount()
        const cleanup = initThemeController(root)
        const options = root.querySelectorAll<HTMLElement>('.color-option')

        expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
        expect(options[0].dataset.selected).toBe('false')
        expect(options[1].dataset.selected).toBe('true')
        expect(document.documentElement.style.getPropertyValue('--sl-color-accent')).toBe('#e74c3c')

        cleanup()
    })

    it('applies the default color when nothing is saved', () => {
        const root = mount()
        const cleanup = initThemeController(root)
        expect(document.documentElement.style.getPropertyValue('--sl-color-accent')).toBe(
            THEME_COLORS[0].color
        )
        cleanup()
    })

    it('falls back through starlight scheme and prefers dark via media query', () => {
        const matchMedia = vi.fn().mockReturnValue({
            matches: true,
            media: '(prefers-color-scheme: dark)',
            onchange: null,
            addEventListener: () => {},
            removeEventListener: () => {},
            addListener: () => {},
            removeListener: () => {},
            dispatchEvent: () => false,
        })
        vi.stubGlobal('matchMedia', matchMedia)

        localStorage.setItem(THEME_STORAGE_KEYS.starlightScheme, 'dark')
        const root = mount()
        initThemeController(root)
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark')

        vi.unstubAllGlobals()
    })

    it('falls back to light when no scheme is stored and the OS prefers light', () => {
        const root = mount()
        initThemeController(root)
        expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    })

    it('uses the pointer event path when available and cleans up listeners', () => {
        Object.defineProperty(window, 'PointerEvent', {
            value: MouseEvent,
            writable: true,
            configurable: true,
        })

        const root = mount()
        const toggle = root.querySelector('.theme-toggle')!
        const pointerDown = vi.spyOn(toggle, 'addEventListener')
        const cleanup = initThemeController(root)

        expect(pointerDown).toHaveBeenCalledWith('pointerdown', expect.any(Function))
        const pointerUp = vi.spyOn(toggle, 'removeEventListener')
        cleanup()
        expect(pointerUp).toHaveBeenCalledWith('pointerup', expect.any(Function))

        delete (window as { PointerEvent?: unknown }).PointerEvent
    })

    it('falls back to mouse and touch listeners without PointerEvent', () => {
        delete (window as { PointerEvent?: unknown }).PointerEvent
        Object.defineProperty(window, 'ontouchstart', {
            value: null,
            configurable: true,
        })

        const root = mount()
        const toggle = root.querySelector('.theme-toggle')!
        const mouseDown = vi.spyOn(toggle, 'addEventListener')
        const cleanup = initThemeController(root)

        expect(mouseDown).toHaveBeenCalledWith('mousedown', expect.any(Function))

        delete (window as { ontouchstart?: unknown }).ontouchstart
    })

    it('supports a custom current-scheme target selector', () => {
        const root = mount()
        const target = document.createElement('span')
        target.id = 'current-scheme'
        root.appendChild(target)
        const cleanup = initThemeController(root, {
            currentSchemeTargetSelector: '#current-scheme',
        })
        expect(target.getAttribute('data-current-scheme')).toBe('light')
        cleanup()
    })

    it('initializes on DOMContentLoaded when the document is loading', () => {
        const root = mount()
        Object.defineProperty(document, 'readyState', { value: 'loading', configurable: true })
        setupThemeControllerLifecycle('#theme-root', {})
        expect(isComponentInitialized('#theme-root')).toBe(false)

        document.dispatchEvent(new Event('DOMContentLoaded'))
        expect(isComponentInitialized('#theme-root')).toBe(true)

        document.dispatchEvent(new Event('astro:page-load'))
        document.dispatchEvent(new Event('astro:after-preparation'))
        expect(isComponentInitialized('#theme-root')).toBe(false)
        Object.defineProperty(document, 'readyState', { value: 'complete', configurable: true })
    })

    it('initializes immediately when the document is ready', () => {
        const root = mount()
        Object.defineProperty(document, 'readyState', { value: 'complete', configurable: true })
        setupThemeControllerLifecycle('#theme-root', {})
        expect(isComponentInitialized('#theme-root')).toBe(true)

        document.dispatchEvent(new Event('astro:page-load'))
        document.dispatchEvent(new Event('astro:after-preparation'))
        expect(isComponentInitialized('#theme-root')).toBe(false)
    })
})
