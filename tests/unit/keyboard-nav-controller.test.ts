// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
    initKeyboardNavigation,
    setupKeyboardNavLifecycle,
} from '../../src/utils/keyboard-nav-controller'

describe('keyboard-nav-controller', () => {
    let root: HTMLElement

    beforeEach(() => {
        root = document.createElement('div')
        root.dataset.keyboardNav = 'true'
        root.innerHTML = `
            <div class="modal-content">
                <button data-keyboard-nav-close>Close</button>
            </div>
        `
        document.body.appendChild(root)
    })

    afterEach(() => {
        document.body.innerHTML = ''
        vi.restoreAllMocks()
    })

    it('returns early on small screens', () => {
        const cleanup = initKeyboardNavigation(root, {
            isSmallScreen: () => true,
        })
        expect(root.dataset.visible).toBe('false')
        expect(cleanup).toBeUndefined()
    })

    it('shows and hides help modal via shortcuts and buttons', () => {
        const cleanup = initKeyboardNavigation(root, {
            isSmallScreen: () => false,
        })

        // Initial state is hidden
        expect(root.dataset.visible).toBe('false')

        // '?' opens help
        document.dispatchEvent(new KeyboardEvent('keydown', { key: '?' }))
        expect(root.dataset.visible).toBe('true')

        // 'Escape' closes help
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
        expect(root.dataset.visible).toBe('false')

        // Close button closes help
        root.dataset.visible = 'true'
        const closeBtn = root.querySelector('[data-keyboard-nav-close]') as HTMLButtonElement
        closeBtn.click()
        expect(root.dataset.visible).toBe('false')

        if (typeof cleanup === 'function') cleanup()
    })

    it('closes help on overlay click only', () => {
        initKeyboardNavigation(root, {
            isSmallScreen: () => false,
        })

        root.dataset.visible = 'true'
        const content = root.querySelector('.modal-content') as HTMLElement

        // Clicking inside content does not close
        content.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        expect(root.dataset.visible).toBe('true')

        // Clicking overlay directly closes
        root.dispatchEvent(new MouseEvent('click'))
        expect(root.dataset.visible).toBe('false')
    })

    it('ignores shortcuts when focused on input, textarea, select, or contenteditable', () => {
        const navigate = vi.fn()
        initKeyboardNavigation(root, {
            isSmallScreen: () => false,
            navigate,
        })

        const input = document.createElement('input')
        document.body.appendChild(input)
        input.focus()

        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'h', bubbles: true }))
        expect(navigate).not.toHaveBeenCalled()

        const textarea = document.createElement('textarea')
        document.body.appendChild(textarea)
        textarea.focus()
        textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'h', bubbles: true }))
        expect(navigate).not.toHaveBeenCalled()
    })

    it('handles navigation shortcuts h, H, j, J with base path', () => {
        const navigate = vi.fn()
        initKeyboardNavigation(root, {
            isSmallScreen: () => false,
            basePath: '/en/',
            navigate,
        })

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'h' }))
        expect(navigate).toHaveBeenCalledWith('/en/')

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'H' }))
        expect(navigate).toHaveBeenCalledWith('/en/')

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'j' }))
        expect(navigate).toHaveBeenCalledWith('/en/join/')

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'J' }))
        expect(navigate).toHaveBeenCalledWith('/en/join/')
    })

    it('handles navigation shortcuts with relative basePath or root basePath', () => {
        const navigate = vi.fn()
        initKeyboardNavigation(root, {
            isSmallScreen: () => false,
            basePath: 'zh',
            navigate,
        })

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'h' }))
        expect(navigate).toHaveBeenCalledWith('/zh/')

        const navigateRoot = vi.fn()
        initKeyboardNavigation(root, {
            isSmallScreen: () => false,
            basePath: '/',
            navigate: navigateRoot,
        })
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'h' }))
        expect(navigateRoot).toHaveBeenCalledWith('/')
    })

    it('handles scroll-to-top shortcut t and T', () => {
        const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
        initKeyboardNavigation(root, { isSmallScreen: () => false })

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 't' }))
        expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'T' }))
        expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
    })

    it('handles search shortcut / and clicks search target', () => {
        const searchBtn = document.createElement('button')
        searchBtn.className = 'search-input'
        const clickSpy = vi.fn()
        searchBtn.onclick = clickSpy
        document.body.appendChild(searchBtn)

        initKeyboardNavigation(root, { isSmallScreen: () => false })

        document.dispatchEvent(new KeyboardEvent('keydown', { key: '/' }))
        expect(clickSpy).toHaveBeenCalled()
    })

    it('cleans up event listeners', () => {
        const navigate = vi.fn()
        const cleanup = initKeyboardNavigation(root, {
            isSmallScreen: () => false,
            navigate,
        })

        if (typeof cleanup === 'function') cleanup()

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'h' }))
        expect(navigate).not.toHaveBeenCalled()
    })

    it('setupKeyboardNavLifecycle registers without error', () => {
        expect(() => setupKeyboardNavLifecycle('[data-keyboard-nav]')).not.toThrow()
    })
})
