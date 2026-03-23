import { setupComponentLifecycle } from './component-init'

const SELECTORS = {
    toggle: '[data-language-toggle]',
    menu: '[data-language-menu]',
    option: '[data-language-option]',
}

export type LanguageOption = 'en' | 'zh'

export interface LanguageSwitcherOptions {
    navigate?: (path: string) => void
    currentPath?: () => string
    persistLocale?: (locale: LanguageOption) => void
}

function normalizePath(path: string): string {
    if (!path) {
        return '/'
    }

    return path.startsWith('/') ? path : `/${path}`
}

export function resolveLocalizedPath(currentPath: string, locale: LanguageOption): string {
    const normalizedPath = normalizePath(currentPath)
    const cleanPath = normalizedPath.replace(/^\/(?:en|zh)(?=\/|$)/, '') || '/'

    if (locale === 'zh') {
        return cleanPath
    }

    return cleanPath === '/' ? '/en/' : `/en${cleanPath}`
}

function persistPreferredLocale(locale: LanguageOption): void {
    try {
        localStorage.setItem('preferred-locale', locale)
    } catch {
        // Ignore storage failures.
    }
}

export function initLanguageSwitcher(
    root: HTMLElement,
    options: LanguageSwitcherOptions = {}
): (() => void) | void {
    const toggle = root.querySelector(SELECTORS.toggle) as HTMLButtonElement | null
    const menu = root.querySelector(SELECTORS.menu) as HTMLElement | null
    const optionButtons = root.querySelectorAll<HTMLButtonElement>(SELECTORS.option)

    if (!toggle || !menu) {
        return
    }

    const navigate =
        options.navigate ??
        ((path: string) => {
            window.location.href = path
        })
    const getCurrentPath = options.currentPath ?? (() => window.location.pathname)
    const persistLocale = options.persistLocale ?? persistPreferredLocale

    const closeMenu = () => {
        toggle.setAttribute('aria-expanded', 'false')
        menu.classList.remove('open')
    }

    const toggleMenu = () => {
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true'
        toggle.setAttribute('aria-expanded', (!isExpanded).toString())
        menu.classList.toggle('open', !isExpanded)
    }

    const optionHandlers = new Map<HTMLButtonElement, () => void>()
    optionButtons.forEach((option) => {
        const handler = () => {
            const locale = option.dataset.locale as LanguageOption | undefined
            if (!locale) {
                return
            }

            persistLocale(locale)
            closeMenu()
            navigate(resolveLocalizedPath(getCurrentPath(), locale))
        }

        optionHandlers.set(option, handler)
        option.addEventListener('click', handler)
    })

    const handleDocumentClick = (event: Event) => {
        if (!root.contains(event.target as Node)) {
            closeMenu()
        }
    }

    const handleToggleKeydown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            closeMenu()
        }
    }

    toggle.addEventListener('click', toggleMenu)
    toggle.addEventListener('keydown', handleToggleKeydown)
    document.addEventListener('click', handleDocumentClick)
    closeMenu()

    return () => {
        toggle.removeEventListener('click', toggleMenu)
        toggle.removeEventListener('keydown', handleToggleKeydown)
        document.removeEventListener('click', handleDocumentClick)
        optionHandlers.forEach((handler, option) => option.removeEventListener('click', handler))
    }
}

export function setupLanguageSwitcherLifecycle(
    selector = '[data-language-switcher]',
    options: LanguageSwitcherOptions = {}
): void {
    setupComponentLifecycle(selector, (element) => initLanguageSwitcher(element, options))
}
