// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { initKeyboardNavigation } from './keyboard-nav-controller'
import { initLanguageSwitcher, resolveLocalizedPath } from './language-switcher-controller'
import { initMobileNavigation } from './mobile-nav-controller'

const mobileMarkup = `
    <div data-mobile-nav>
        <button data-mobile-menu-button type="button" aria-expanded="false"></button>
        <div data-mobile-nav-overlay></div>
        <div data-mobile-nav-drawer></div>
        <button data-mobile-nav-close type="button"></button>
        <a href="/join/" data-mobile-nav-link>Join</a>
    </div>
`

const keyboardMarkup = `
    <div data-keyboard-nav>
        <button data-keyboard-nav-close type="button"></button>
    </div>
`

const languageMarkup = `
    <div data-language-switcher>
        <button data-language-toggle type="button" aria-expanded="false"></button>
        <div data-language-menu></div>
        <button data-language-option data-locale="zh" type="button">中文</button>
        <button data-language-option data-locale="en" type="button">English</button>
    </div>
`

describe('navigation controls', () => {
    beforeEach(() => {
        document.body.innerHTML = ''
        document.body.style.overflow = ''
        vi.restoreAllMocks()
    })

    it('opens and closes the mobile drawer without leaking body scroll state', () => {
        document.body.innerHTML = mobileMarkup

        const root = document.querySelector('[data-mobile-nav]') as HTMLElement
        const menuButton = document.querySelector('[data-mobile-menu-button]') as HTMLButtonElement
        const overlay = document.querySelector('[data-mobile-nav-overlay]') as HTMLElement
        const drawer = document.querySelector('[data-mobile-nav-drawer]') as HTMLElement

        const cleanup = initMobileNavigation(root)

        menuButton.click()
        expect(drawer.classList.contains('active')).toBe(true)
        expect(overlay.classList.contains('active')).toBe(true)
        expect(menuButton.getAttribute('aria-expanded')).toBe('true')
        expect(document.body.style.overflow).toBe('hidden')

        overlay.click()
        expect(drawer.classList.contains('active')).toBe(false)
        expect(menuButton.getAttribute('aria-expanded')).toBe('false')
        expect(document.body.style.overflow).toBe('')

        cleanup?.()
    })

    it('uses locale-aware keyboard navigation targets', () => {
        document.body.innerHTML = keyboardMarkup

        const navigate = vi.fn()
        const cleanup = initKeyboardNavigation(
            document.querySelector('[data-keyboard-nav]') as HTMLElement,
            {
                basePath: '/en',
                navigate,
                isSmallScreen: () => false,
            }
        )

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'H', bubbles: true }))
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'J', bubbles: true }))

        expect(navigate).toHaveBeenNthCalledWith(1, '/en/')
        expect(navigate).toHaveBeenNthCalledWith(2, '/en/join/')

        cleanup?.()
    })

    it('skips keyboard navigation bindings on small screens', () => {
        document.body.innerHTML = keyboardMarkup

        const navigate = vi.fn()
        initKeyboardNavigation(document.querySelector('[data-keyboard-nav]') as HTMLElement, {
            navigate,
            isSmallScreen: () => true,
        })

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'H', bubbles: true }))

        expect(navigate).not.toHaveBeenCalled()
    })

    it('resolves localized paths without a duplicated locale prefix', () => {
        expect(resolveLocalizedPath('/team/', 'en')).toBe('/en/team/')
        expect(resolveLocalizedPath('/en/team/', 'zh')).toBe('/team/')
        expect(resolveLocalizedPath('/', 'en')).toBe('/en/')
    })

    it('persists locale choice and navigates to the matching localized route', () => {
        document.body.innerHTML = languageMarkup

        const navigate = vi.fn()
        const persistLocale = vi.fn()
        const cleanup = initLanguageSwitcher(
            document.querySelector('[data-language-switcher]') as HTMLElement,
            {
                currentPath: () => '/en/team/',
                navigate,
                persistLocale,
            }
        )

        ;(document.querySelector('[data-language-toggle]') as HTMLButtonElement).click()
        ;(
            document.querySelector('[data-language-option][data-locale="zh"]') as HTMLButtonElement
        ).click()

        expect(persistLocale).toHaveBeenCalledWith('zh')
        expect(navigate).toHaveBeenCalledWith('/team/')
        expect(
            document.querySelector('[data-language-toggle]')?.getAttribute('aria-expanded')
        ).toBe('false')

        cleanup?.()
    })
})
