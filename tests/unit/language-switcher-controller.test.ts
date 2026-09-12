// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
    initLanguageSwitcher,
    resolveLocalizedPath,
    setupLanguageSwitcherLifecycle,
} from '../../src/utils/language-switcher-controller'
import * as a11yModule from '../../src/utils/accessibility'

describe('language-switcher-controller', () => {
    let root: HTMLElement

    beforeEach(() => {
        root = document.createElement('div')
        root.dataset.languageSwitcher = 'true'
        root.innerHTML = `
            <button data-language-toggle aria-expanded="false">Language</button>
            <div data-language-menu data-open="false">
                <button data-language-option data-locale="zh">中文</button>
                <button data-language-option data-locale="en">English</button>
                <button data-language-option>No Locale</button>
            </div>
        `
        document.body.appendChild(root)
    })

    afterEach(() => {
        document.body.innerHTML = ''
        vi.restoreAllMocks()
    })

    describe('resolveLocalizedPath', () => {
        it('normalizes empty or relative paths', () => {
            expect(resolveLocalizedPath('', 'zh')).toBe('/')
            expect(resolveLocalizedPath('about', 'zh')).toBe('/about')
        })

        it('resolves zh paths by removing locale prefixes', () => {
            expect(resolveLocalizedPath('/en/about', 'zh')).toBe('/about')
            expect(resolveLocalizedPath('/zh/about', 'zh')).toBe('/about')
            expect(resolveLocalizedPath('/en', 'zh')).toBe('/')
            expect(resolveLocalizedPath('/', 'zh')).toBe('/')
        })

        it('resolves en paths correctly', () => {
            expect(resolveLocalizedPath('/', 'en')).toBe('/en/')
            expect(resolveLocalizedPath('/about', 'en')).toBe('/en/about')
            expect(resolveLocalizedPath('/en/about', 'en')).toBe('/en/about')
        })
    })

    describe('initLanguageSwitcher', () => {
        it('returns early if toggle or menu is missing', () => {
            const empty = document.createElement('div')
            expect(initLanguageSwitcher(empty)).toBeUndefined()
        })

        it('toggles menu open and closed on click', () => {
            const cleanup = initLanguageSwitcher(root)
            const toggle = root.querySelector('[data-language-toggle]') as HTMLButtonElement
            const menu = root.querySelector('[data-language-menu]') as HTMLElement

            toggle.click()
            expect(toggle.getAttribute('aria-expanded')).toBe('true')
            expect(menu.dataset.open).toBe('true')

            toggle.click()
            expect(toggle.getAttribute('aria-expanded')).toBe('false')
            expect(menu.dataset.open).toBe('false')

            if (typeof cleanup === 'function') cleanup()
        })

        it('closes menu on document click outside', () => {
            initLanguageSwitcher(root)
            const toggle = root.querySelector('[data-language-toggle]') as HTMLButtonElement
            const menu = root.querySelector('[data-language-menu]') as HTMLElement

            toggle.click()
            expect(menu.dataset.open).toBe('true')

            document.dispatchEvent(new MouseEvent('click'))
            expect(menu.dataset.open).toBe('false')
            expect(toggle.getAttribute('aria-expanded')).toBe('false')
        })

        it('closes menu on Escape key', () => {
            initLanguageSwitcher(root)
            const toggle = root.querySelector('[data-language-toggle]') as HTMLButtonElement
            const menu = root.querySelector('[data-language-menu]') as HTMLElement

            toggle.click()
            expect(menu.dataset.open).toBe('true')

            root.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
            expect(menu.dataset.open).toBe('false')
        })

        it('navigates with ArrowDown and ArrowUp between options', () => {
            initLanguageSwitcher(root)
            const toggle = root.querySelector('[data-language-toggle]') as HTMLButtonElement
            const options = Array.from(
                root.querySelectorAll<HTMLButtonElement>('[data-language-option]')
            )

            toggle.click()
            options[0].focus()

            root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
            expect(document.activeElement).toBe(options[1])

            root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
            expect(document.activeElement).toBe(options[2])

            root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
            expect(document.activeElement).toBe(options[0])

            root.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
            expect(document.activeElement).toBe(options[2])
        })

        it('handles option click and performs navigation and persistence', () => {
            const navigate = vi.fn()
            const persistLocale = vi.fn()
            const announceSpy = vi.spyOn(a11yModule, 'announce')

            initLanguageSwitcher(root, {
                navigate,
                currentPath: () => '/about',
                persistLocale,
            })

            const options = Array.from(
                root.querySelectorAll<HTMLButtonElement>('[data-language-option]')
            )
            options[1].click() // en

            expect(persistLocale).toHaveBeenCalledWith('en')
            expect(announceSpy).toHaveBeenCalledWith('已切换语言为 English')
            expect(navigate).toHaveBeenCalledWith('/en/about')
        })

        it('handles option click with default option text and ignore missing locale', () => {
            const navigate = vi.fn()
            initLanguageSwitcher(root, { navigate })

            const options = Array.from(
                root.querySelectorAll<HTMLButtonElement>('[data-language-option]')
            )
            options[2].click() // no locale
            expect(navigate).not.toHaveBeenCalled()
        })

        it('handles default localStorage persistence safely', () => {
            const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
                throw new Error('quota exceeded')
            })

            initLanguageSwitcher(root, {
                currentPath: () => '/',
                navigate: () => {},
            })

            const options = Array.from(
                root.querySelectorAll<HTMLButtonElement>('[data-language-option]')
            )
            expect(() => options[0].click()).not.toThrow()
            setItemSpy.mockRestore()
        })

        it('cleans up event listeners', () => {
            const cleanup = initLanguageSwitcher(root)
            const toggle = root.querySelector('[data-language-toggle]') as HTMLButtonElement
            const menu = root.querySelector('[data-language-menu]') as HTMLElement

            if (typeof cleanup === 'function') cleanup()

            toggle.click()
            expect(menu.dataset.open).toBe('false')
        })
    })

    describe('setupLanguageSwitcherLifecycle', () => {
        it('registers lifecycle without error', () => {
            expect(() => setupLanguageSwitcherLifecycle('[data-language-switcher]')).not.toThrow()
        })
    })
})
