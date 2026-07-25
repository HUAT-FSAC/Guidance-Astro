import { setupComponentLifecycle } from './component-init'
import { announce, trapFocus } from './accessibility'

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
    const optionButtons = Array.from(root.querySelectorAll<HTMLButtonElement>(SELECTORS.option))

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

    let untrapFocus: (() => void) | null = null

    const closeMenu = () => {
        toggle.setAttribute('aria-expanded', 'false')
        menu.classList.remove('open')
        if (untrapFocus) {
            untrapFocus()
            untrapFocus = null
        }
        toggle.focus()
    }

    const openMenu = () => {
        toggle.setAttribute('aria-expanded', 'true')
        menu.classList.add('open')
        untrapFocus = trapFocus(menu)
    }

    const toggleMenu = () => {
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true'
        if (isExpanded) {
            closeMenu()
        } else {
            openMenu()
        }
    }

    const optionHandlers = new Map<HTMLButtonElement, () => void>()
    optionButtons.forEach((option) => {
        const handler = () => {
            const locale = option.dataset.locale as LanguageOption | undefined
            if (!locale) {
                return
            }

            persistLocale(locale)

            const localeName = option.textContent?.trim() || locale
            announce(`已切换语言为 ${localeName}`)

            closeMenu()
            navigate(resolveLocalizedPath(getCurrentPath(), locale))
        }

        optionHandlers.set(option, handler)
        option.addEventListener('click', handler)
    })

    const handleDocumentClick = (event: Event) => {
        if (!root.contains(event.target as Node)) {
            // No focus return on outside click to avoid jarring behavior
            toggle.setAttribute('aria-expanded', 'false')
            menu.classList.remove('open')
            if (untrapFocus) {
                untrapFocus()
                untrapFocus = null
            }
        }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            closeMenu()
        }

        const isExpanded = toggle.getAttribute('aria-expanded') === 'true'
        if (isExpanded) {
            const currentIndex = optionButtons.indexOf(document.activeElement as HTMLButtonElement)

            if (event.key === 'ArrowDown') {
                event.preventDefault()
                const nextIndex = (currentIndex + 1) % optionButtons.length
                optionButtons[nextIndex].focus()
            } else if (event.key === 'ArrowUp') {
                event.preventDefault()
                const nextIndex = (currentIndex - 1 + optionButtons.length) % optionButtons.length
                optionButtons[nextIndex].focus()
            }
        }
    }

    toggle.addEventListener('click', toggleMenu)
    root.addEventListener('keydown', handleKeyDown)
    document.addEventListener('click', handleDocumentClick)

    // Initial state
    toggle.setAttribute('aria-expanded', 'false')
    menu.classList.remove('open')

    return () => {
        toggle.removeEventListener('click', toggleMenu)
        root.removeEventListener('keydown', handleKeyDown)
        document.removeEventListener('click', handleDocumentClick)
        optionHandlers.forEach((handler, option) => option.removeEventListener('click', handler))
        if (untrapFocus) untrapFocus()
    }
}

export function setupLanguageSwitcherLifecycle(
    selector = '[data-language-switcher]',
    options: LanguageSwitcherOptions = {}
): void {
    setupComponentLifecycle(selector, (element) => initLanguageSwitcher(element, options))
}
