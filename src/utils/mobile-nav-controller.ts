import { setupComponentLifecycle } from './component-init'

const SELECTORS = {
    menuButton: '[data-mobile-menu-button]',
    drawer: '[data-mobile-nav-drawer]',
    overlay: '[data-mobile-nav-overlay]',
    closeButton: '[data-mobile-nav-close]',
    navLink: '[data-mobile-nav-link]',
}

export function initMobileNavigation(root: HTMLElement): (() => void) | void {
    const menuBtn = root.querySelector(SELECTORS.menuButton) as HTMLButtonElement | null
    const drawer = root.querySelector(SELECTORS.drawer) as HTMLElement | null
    const overlay = root.querySelector(SELECTORS.overlay) as HTMLElement | null
    const closeBtn = root.querySelector(SELECTORS.closeButton) as HTMLButtonElement | null
    const navLinks = root.querySelectorAll<HTMLAnchorElement>(SELECTORS.navLink)

    if (!menuBtn || !drawer || !overlay) {
        return
    }

    const closeDrawer = () => {
        drawer.classList.remove('active')
        overlay.classList.remove('active')
        menuBtn.setAttribute('aria-expanded', 'false')
        document.body.style.overflow = ''
    }

    const openDrawer = () => {
        drawer.classList.add('active')
        overlay.classList.add('active')
        menuBtn.setAttribute('aria-expanded', 'true')
        document.body.style.overflow = 'hidden'
    }

    const handleEsc = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && drawer.classList.contains('active')) {
            closeDrawer()
        }
    }

    menuBtn.addEventListener('click', openDrawer)
    closeBtn?.addEventListener('click', closeDrawer)
    overlay.addEventListener('click', closeDrawer)
    navLinks.forEach((link) => link.addEventListener('click', closeDrawer))
    document.addEventListener('keydown', handleEsc)
    closeDrawer()

    return () => {
        menuBtn.removeEventListener('click', openDrawer)
        closeBtn?.removeEventListener('click', closeDrawer)
        overlay.removeEventListener('click', closeDrawer)
        navLinks.forEach((link) => link.removeEventListener('click', closeDrawer))
        document.removeEventListener('keydown', handleEsc)
        document.body.style.overflow = ''
    }
}

export function setupMobileNavigationLifecycle(selector = '[data-mobile-nav]'): void {
    setupComponentLifecycle(selector, initMobileNavigation)
}
