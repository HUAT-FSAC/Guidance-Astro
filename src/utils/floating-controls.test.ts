// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { initShareMenu } from './share-controller'
import { initThemeController, THEME_STORAGE_KEYS } from './theme-controller'

const themeMarkup = `
    <div data-theme-switcher data-current-scheme="dark">
        <button class="theme-toggle" type="button" aria-expanded="false">
            <span class="color-indicator"></span>
            <span class="icon-sun"></span>
            <span class="icon-moon"></span>
        </button>
        <div class="theme-dropdown" aria-hidden="true">
            <button class="color-option" data-color="#f39c12" data-accent="#e67e22"></button>
            <button class="color-option" data-color="#2ecc71" data-accent="#27ae60"></button>
        </div>
    </div>
`

const shareMarkup = `
    <div data-share-container>
        <button id="share-toggle-btn" type="button" aria-expanded="false"></button>
        <div id="share-menu"></div>
        <div id="share-toast"></div>
        <div id="qrcode-modal"></div>
        <img id="qrcode-img" />
        <button id="qrcode-close" type="button"></button>
        <button class="native-share" type="button" style="display:none"></button>
        <button data-share-action="copy" type="button"></button>
    </div>
`

const shareCustomMarkup = `
    <div data-share-button>
        <button data-share-toggle type="button" aria-expanded="false"></button>
        <div data-share-menu></div>
        <div data-share-toast></div>
        <div data-share-modal></div>
        <img data-share-image />
        <button data-share-close type="button"></button>
        <button class="native-share" type="button" style="display:none"></button>
        <button data-share-action="copy" type="button"></button>
    </div>
`

describe('floating controls', () => {
    beforeEach(() => {
        document.documentElement.setAttribute('data-theme', 'dark')
        document.documentElement.removeAttribute('style')
        document.body.innerHTML = ''
        localStorage.clear()
        vi.restoreAllMocks()
        Object.defineProperty(window, 'StarlightThemeProvider', {
            configurable: true,
            writable: true,
            value: {
                updatePickers: vi.fn(),
            },
        })
    })

    it('toggles theme and persists the selected scheme', () => {
        document.body.innerHTML = themeMarkup
        localStorage.setItem(THEME_STORAGE_KEYS.scheme, 'dark')

        const cleanup = initThemeController(
            document.querySelector('[data-theme-switcher]') as HTMLElement
        )

        ;(document.querySelector('.theme-toggle') as HTMLButtonElement).click()

        expect(document.documentElement.getAttribute('data-theme')).toBe('light')
        expect(localStorage.getItem(THEME_STORAGE_KEYS.scheme)).toBe('light')
        expect(localStorage.getItem(THEME_STORAGE_KEYS.starlightScheme)).toBe('light')
        expect(
            document.querySelector('[data-theme-switcher]')?.getAttribute('data-current-scheme')
        ).toBe('light')
        expect(window.StarlightThemeProvider?.updatePickers).toHaveBeenCalledWith('light')

        cleanup?.()
    })

    it('falls back to the starlight theme when no custom scheme is stored', () => {
        document.body.innerHTML = themeMarkup
        localStorage.setItem(THEME_STORAGE_KEYS.starlightScheme, 'light')

        const cleanup = initThemeController(
            document.querySelector('[data-theme-switcher]') as HTMLElement
        )

        expect(document.documentElement.getAttribute('data-theme')).toBe('light')
        expect(
            document.querySelector('[data-theme-switcher]')?.getAttribute('data-current-scheme')
        ).toBe('light')

        cleanup?.()
    })

    it('opens the color menu on long press and persists the selected palette', () => {
        document.body.innerHTML = themeMarkup

        vi.useFakeTimers()
        const cleanup = initThemeController(
            document.querySelector('[data-theme-switcher]') as HTMLElement
        )

        const toggle = document.querySelector('.theme-toggle') as HTMLButtonElement
        toggle.dispatchEvent(new PointerEvent('pointerdown', { button: 0, bubbles: true }))
        vi.advanceTimersByTime(450)

        expect(document.querySelector('.theme-dropdown')?.classList.contains('active')).toBe(true)

        toggle.dispatchEvent(new PointerEvent('pointerup', { button: 0, bubbles: true }))
        ;(document.querySelector('[data-color="#2ecc71"]') as HTMLButtonElement).click()

        expect(localStorage.getItem(THEME_STORAGE_KEYS.color)).toBe('#2ecc71')
        expect(localStorage.getItem(THEME_STORAGE_KEYS.accent)).toBe('#27ae60')
        expect(document.documentElement.style.getPropertyValue('--sl-color-accent').trim()).toBe(
            '#2ecc71'
        )
        expect(document.querySelector('.theme-dropdown')?.classList.contains('active')).toBe(false)

        cleanup?.()
        vi.useRealTimers()
    })

    it('opens the share menu and closes it when clicking outside', () => {
        document.body.innerHTML = shareMarkup

        const cleanup = initShareMenu(
            document.querySelector('[data-share-container]') as HTMLElement
        )

        ;(document.getElementById('share-toggle-btn') as HTMLButtonElement).click()
        expect(document.getElementById('share-menu')?.classList.contains('open')).toBe(true)
        expect(document.getElementById('share-toggle-btn')?.getAttribute('aria-expanded')).toBe(
            'true'
        )

        document.body.click()

        expect(document.getElementById('share-menu')?.classList.contains('open')).toBe(false)
        expect(document.getElementById('share-toggle-btn')?.getAttribute('aria-expanded')).toBe(
            'false'
        )

        cleanup?.()
    })

    it('supports custom selectors for share controls', () => {
        document.body.innerHTML = shareCustomMarkup

        const cleanup = initShareMenu(
            document.querySelector('[data-share-button]') as HTMLElement,
            {
                toggleSelector: '[data-share-toggle]',
                menuSelector: '[data-share-menu]',
                toastSelector: '[data-share-toast]',
                modalSelector: '[data-share-modal]',
                modalImageSelector: '[data-share-image]',
                modalCloseSelector: '[data-share-close]',
            }
        )

        ;(document.querySelector('[data-share-toggle]') as HTMLButtonElement).click()

        expect(document.querySelector('[data-share-menu]')?.classList.contains('open')).toBe(true)
        expect(document.querySelector('[data-share-toggle]')?.getAttribute('aria-expanded')).toBe(
            'true'
        )

        cleanup?.()
    })

    it('does not respond after cleanup, preventing duplicate bindings on re-init', () => {
        document.body.innerHTML = themeMarkup
        localStorage.setItem(THEME_STORAGE_KEYS.scheme, 'dark')

        const root = document.querySelector('[data-theme-switcher]') as HTMLElement
        const toggle = document.querySelector('.theme-toggle') as HTMLButtonElement

        const cleanup = initThemeController(root)
        cleanup?.()
        toggle.click()

        expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    })
})
