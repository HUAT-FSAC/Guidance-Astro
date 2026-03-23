import { setupComponentLifecycle } from './component-init'

const SELECTORS = {
    closeButton: '[data-keyboard-nav-close]',
}

export interface KeyboardNavOptions {
    basePath?: string
    navigate?: (path: string) => void
    searchSelector?: string
    isSmallScreen?: () => boolean
}

function normalizeBasePath(basePath = ''): string {
    if (!basePath || basePath === '/') {
        return ''
    }

    return basePath.startsWith('/')
        ? basePath.replace(/\/$/, '')
        : `/${basePath.replace(/\/$/, '')}`
}

function buildPath(basePath: string, path: '/' | '/join/'): string {
    return basePath ? `${basePath}${path}` : path
}

export function initKeyboardNavigation(
    root: HTMLElement,
    options: KeyboardNavOptions = {}
): (() => void) | void {
    const helpModal = root
    const closeBtn = helpModal.querySelector(SELECTORS.closeButton) as HTMLButtonElement | null
    const basePath = normalizeBasePath(options.basePath)
    const navigate =
        options.navigate ??
        ((path: string) => {
            window.location.href = path
        })
    const searchSelector =
        options.searchSelector ?? '[data-pagefind-ui], .search-input, button[aria-label*="Search"]'
    const isSmallScreen =
        options.isSmallScreen ?? (() => window.matchMedia('(max-width: 768px)').matches)

    if (isSmallScreen()) {
        helpModal.classList.remove('visible')
        return
    }

    const showHelp = () => {
        helpModal.classList.add('visible')
    }

    const hideHelp = () => {
        helpModal.classList.remove('visible')
    }

    const handleOverlayClick = (event: Event) => {
        if (event.target === helpModal) {
            hideHelp()
        }
    }

    const handleKeydown = (event: KeyboardEvent) => {
        const target = event.target as HTMLElement | null
        const isInputTarget =
            target instanceof HTMLElement &&
            (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable)

        if (isInputTarget) {
            return
        }

        switch (event.key) {
            case '?':
                event.preventDefault()
                showHelp()
                break
            case 'Escape':
                hideHelp()
                break
            case 'h':
            case 'H':
                navigate(buildPath(basePath, '/'))
                break
            case 't':
            case 'T':
                window.scrollTo({ top: 0, behavior: 'smooth' })
                break
            case '/': {
                event.preventDefault()
                const searchTarget = document.querySelector(searchSelector) as HTMLElement | null
                searchTarget?.click()
                break
            }
            case 'j':
            case 'J':
                navigate(buildPath(basePath, '/join/'))
                break
        }
    }

    closeBtn?.addEventListener('click', hideHelp)
    helpModal.addEventListener('click', handleOverlayClick)
    document.addEventListener('keydown', handleKeydown)
    hideHelp()

    return () => {
        closeBtn?.removeEventListener('click', hideHelp)
        helpModal.removeEventListener('click', handleOverlayClick)
        document.removeEventListener('keydown', handleKeydown)
    }
}

export function setupKeyboardNavLifecycle(
    selector = '[data-keyboard-nav]',
    options: KeyboardNavOptions = {}
): void {
    setupComponentLifecycle(selector, (element) => initKeyboardNavigation(element, options))
}
