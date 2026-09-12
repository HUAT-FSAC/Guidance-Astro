// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
    initMobileNavigation,
    setupMobileNavigationLifecycle,
} from '../../src/utils/mobile-nav-controller'

describe('mobile-nav-controller', () => {
    let root: HTMLElement

    beforeEach(() => {
        root = document.createElement('div')
        root.dataset.mobileNav = 'true'
        root.innerHTML = `
            <button data-mobile-menu-button type="button" aria-expanded="false">Menu</button>
            <div data-mobile-nav-overlay data-open="false"></div>
            <div data-mobile-nav-drawer data-open="false"></div>
            <button data-mobile-nav-close type="button">Close</button>
            <a href="/join/" data-mobile-nav-link>Join</a>
            <a href="/about/" data-mobile-nav-link>About</a>
        `
        document.body.appendChild(root)
        document.body.style.overflow = ''
    })

    afterEach(() => {
        document.body.innerHTML = ''
        document.body.style.overflow = ''
        vi.restoreAllMocks()
    })

    it('returns early when required elements are missing', () => {
        const empty = document.createElement('div')
        expect(initMobileNavigation(empty)).toBeUndefined()

        const partial = document.createElement('div')
        partial.innerHTML = '<button data-mobile-menu-button></button>'
        expect(initMobileNavigation(partial)).toBeUndefined()
    })

    it('handles open and close interactions via menu button, close button, overlay, and links', () => {
        const cleanup = initMobileNavigation(root)
        const menuBtn = root.querySelector('[data-mobile-menu-button]') as HTMLButtonElement
        const overlay = root.querySelector('[data-mobile-nav-overlay]') as HTMLElement
        const drawer = root.querySelector('[data-mobile-nav-drawer]') as HTMLElement
        const closeBtn = root.querySelector('[data-mobile-nav-close]') as HTMLButtonElement
        const navLink = root.querySelector('[data-mobile-nav-link]') as HTMLAnchorElement

        // Open via menu button
        menuBtn.click()
        expect(drawer.dataset.open).toBe('true')
        expect(overlay.dataset.open).toBe('true')
        expect(menuBtn.getAttribute('aria-expanded')).toBe('true')
        expect(document.body.style.overflow).toBe('hidden')

        // Close via close button
        closeBtn.click()
        expect(drawer.dataset.open).toBe('false')
        expect(overlay.dataset.open).toBe('false')
        expect(menuBtn.getAttribute('aria-expanded')).toBe('false')
        expect(document.body.style.overflow).toBe('')

        // Open and close via overlay
        menuBtn.click()
        overlay.click()
        expect(drawer.dataset.open).toBe('false')

        // Open and close via nav link
        menuBtn.click()
        navLink.click()
        expect(drawer.dataset.open).toBe('false')

        if (typeof cleanup === 'function') cleanup()
    })

    it('handles Escape keydown correctly', () => {
        const cleanup = initMobileNavigation(root)
        const menuBtn = root.querySelector('[data-mobile-menu-button]') as HTMLButtonElement
        const drawer = root.querySelector('[data-mobile-nav-drawer]') as HTMLElement

        // Keydown when closed does nothing
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
        expect(drawer.dataset.open).toBe('false')

        // Keydown with other key when open does nothing
        menuBtn.click()
        expect(drawer.dataset.open).toBe('true')
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
        expect(drawer.dataset.open).toBe('true')

        // Keydown Escape closes
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
        expect(drawer.dataset.open).toBe('false')

        if (typeof cleanup === 'function') cleanup()
    })

    it('works without an optional close button', () => {
        const closeBtn = root.querySelector('[data-mobile-nav-close]') as HTMLElement
        closeBtn.remove()

        const cleanup = initMobileNavigation(root)
        const menuBtn = root.querySelector('[data-mobile-menu-button]') as HTMLButtonElement
        const drawer = root.querySelector('[data-mobile-nav-drawer]') as HTMLElement

        menuBtn.click()
        expect(drawer.dataset.open).toBe('true')

        if (typeof cleanup === 'function') cleanup()
    })

    it('cleans up event listeners and resets body overflow', () => {
        const cleanup = initMobileNavigation(root)
        const menuBtn = root.querySelector('[data-mobile-menu-button]') as HTMLButtonElement
        const drawer = root.querySelector('[data-mobile-nav-drawer]') as HTMLElement

        menuBtn.click()
        expect(document.body.style.overflow).toBe('hidden')

        if (typeof cleanup === 'function') cleanup()

        expect(document.body.style.overflow).toBe('')
        menuBtn.click()
        // Listener should be removed so drawer state doesn't change
        expect(drawer.dataset.open).toBe('false')
    })

    it('setupMobileNavigationLifecycle registers without error', () => {
        expect(() => setupMobileNavigationLifecycle('[data-mobile-nav]')).not.toThrow()
    })
})
