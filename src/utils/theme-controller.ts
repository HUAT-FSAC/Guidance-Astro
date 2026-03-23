import { setupComponentLifecycle } from './component-init'
import { safeGetItem, safeSetItem } from './storage'

type ThemeScheme = 'light' | 'dark'

export interface ThemeColor {
    key: string
    color: string
    accent: string
}

export const THEME_COLORS: ThemeColor[] = [
    { key: 'classicOrange', color: '#f39c12', accent: '#e67e22' },
    { key: 'gamingBlue', color: '#3498db', accent: '#2980b9' },
    { key: 'racingRed', color: '#e74c3c', accent: '#c0392b' },
    { key: 'techPurple', color: '#9b59b6', accent: '#8e44ad' },
    { key: 'speedGreen', color: '#2ecc71', accent: '#27ae60' },
] as const

export const THEME_STORAGE_KEYS = {
    scheme: 'huat-color-scheme',
    color: 'huat-theme-color',
    accent: 'huat-theme-accent',
    starlightScheme: 'starlight-theme',
} as const

const DEFAULT_LONG_PRESS_DURATION = 400

export interface ThemeControllerOptions {
    toggleSelector?: string
    dropdownSelector?: string
    optionSelector?: string
    indicatorSelector?: string
    currentSchemeTargetSelector?: string
    longPressDuration?: number
}

declare global {
    interface Window {
        StarlightThemeProvider?: {
            updatePickers: (theme?: string) => void
        }
    }
}

function resolveCurrentSchemeTarget(root: HTMLElement, selector?: string): HTMLElement {
    if (!selector) {
        return root
    }

    return (root.querySelector(selector) as HTMLElement | null) ?? root
}

function isThemeScheme(value: string | null): value is ThemeScheme {
    return value === 'light' || value === 'dark'
}

function getPreferredScheme(): ThemeScheme {
    if (
        typeof window !== 'undefined' &&
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
        return 'dark'
    }

    return 'light'
}

function setDropdownState(root: HTMLElement, dropdownSelector: string, isOpen: boolean): void {
    const dropdown = root.querySelector(dropdownSelector)
    const toggle = root.querySelector('button')

    dropdown?.classList.toggle('active', isOpen)
    dropdown?.setAttribute('aria-hidden', String(!isOpen))
    toggle?.setAttribute('aria-expanded', String(isOpen))
}

function isDropdownVisible(root: HTMLElement, dropdownSelector: string): boolean {
    return root.querySelector(dropdownSelector)?.classList.contains('active') ?? false
}

function getInitialScheme(): ThemeScheme {
    const customScheme = safeGetItem(THEME_STORAGE_KEYS.scheme)
    if (isThemeScheme(customScheme)) {
        return customScheme
    }

    const starlightScheme = safeGetItem(THEME_STORAGE_KEYS.starlightScheme)
    if (isThemeScheme(starlightScheme)) {
        return starlightScheme
    }

    return getPreferredScheme()
}

function syncThemePickers(scheme: ThemeScheme): void {
    if (typeof window !== 'undefined') {
        window.StarlightThemeProvider?.updatePickers(scheme)
    }
}

function persistThemeScheme(scheme: ThemeScheme): void {
    safeSetItem(THEME_STORAGE_KEYS.scheme, scheme)
    safeSetItem(THEME_STORAGE_KEYS.starlightScheme, scheme)
    syncThemePickers(scheme)
}

export function initThemeController(
    root: HTMLElement,
    options: ThemeControllerOptions = {}
): () => void {
    const {
        toggleSelector = '.theme-toggle',
        dropdownSelector = '.theme-dropdown',
        optionSelector = '.color-option',
        indicatorSelector = '.color-indicator',
        currentSchemeTargetSelector,
        longPressDuration = DEFAULT_LONG_PRESS_DURATION,
    } = options

    const toggle = root.querySelector(toggleSelector) as HTMLElement | null
    const dropdown = root.querySelector(dropdownSelector) as HTMLElement | null
    const indicator = root.querySelector(indicatorSelector) as HTMLElement | null
    const currentSchemeTarget = resolveCurrentSchemeTarget(root, currentSchemeTargetSelector)

    if (!toggle || !dropdown) {
        return () => {}
    }

    let longPressTimer: ReturnType<typeof setTimeout> | undefined
    let longPressTriggered = false

    const applyScheme = (scheme: ThemeScheme) => {
        document.documentElement.setAttribute('data-theme', scheme)
        currentSchemeTarget.setAttribute('data-current-scheme', scheme)
    }

    const applyThemeColor = (color: string, accent: string) => {
        document.documentElement.style.setProperty('--sl-color-accent', color)
        document.documentElement.style.setProperty('--sl-color-accent-high', accent)

        root.querySelectorAll<HTMLElement>(optionSelector).forEach((option) => {
            option.classList.toggle('active', option.dataset.color === color)
        })

        if (indicator) {
            indicator.style.background = color
        }
    }

    const clearLongPressTimer = () => {
        if (longPressTimer) {
            clearTimeout(longPressTimer)
            longPressTimer = undefined
        }
    }

    const startLongPress = () => {
        longPressTriggered = false
        clearLongPressTimer()
        longPressTimer = setTimeout(() => {
            longPressTriggered = true
            setDropdownState(root, dropdownSelector, true)
        }, longPressDuration)
    }

    const handlePointerDown = (event: PointerEvent) => {
        if (event.button !== 0) {
            return
        }

        startLongPress()
    }

    const handlePointerUp = () => {
        clearLongPressTimer()
    }

    const handleMouseDown = (event: MouseEvent) => {
        if (event.button !== 0) {
            return
        }

        startLongPress()
    }

    const handleMouseUp = () => {
        clearLongPressTimer()
    }

    const handleTouchStart = () => {
        startLongPress()
    }

    const handleTouchEnd = () => {
        clearLongPressTimer()
    }

    const handleToggleClick = () => {
        if (longPressTriggered) {
            longPressTriggered = false
            return
        }

        if (isDropdownVisible(root, dropdownSelector)) {
            setDropdownState(root, dropdownSelector, false)
            return
        }

        const current =
            document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
        const next = current === 'dark' ? 'light' : 'dark'
        applyScheme(next)
        persistThemeScheme(next)
    }

    const handleContextMenu = (event: Event) => {
        event.preventDefault()
        event.stopPropagation()
        setDropdownState(root, dropdownSelector, !isDropdownVisible(root, dropdownSelector))
    }

    const handleDocumentClick = (event: MouseEvent) => {
        if (!root.contains(event.target as Node)) {
            setDropdownState(root, dropdownSelector, false)
        }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            setDropdownState(root, dropdownSelector, false)
        }
    }

    const handleColorClick = (event: Event) => {
        const option = event.currentTarget as HTMLElement
        const { color, accent } = option.dataset

        if (!color || !accent) {
            return
        }

        applyThemeColor(color, accent)
        safeSetItem(THEME_STORAGE_KEYS.color, color)
        safeSetItem(THEME_STORAGE_KEYS.accent, accent)
        setDropdownState(root, dropdownSelector, false)
    }

    if (typeof window !== 'undefined' && 'PointerEvent' in window) {
        toggle.addEventListener('pointerdown', handlePointerDown)
        toggle.addEventListener('pointerup', handlePointerUp)
        toggle.addEventListener('pointercancel', handlePointerUp)
    } else {
        toggle.addEventListener('mousedown', handleMouseDown)
        toggle.addEventListener('mouseup', handleMouseUp)
    }

    if (typeof window !== 'undefined' && 'ontouchstart' in window) {
        toggle.addEventListener('touchstart', handleTouchStart, { passive: true })
        toggle.addEventListener('touchend', handleTouchEnd)
        toggle.addEventListener('touchcancel', handleTouchEnd)
    }

    toggle.addEventListener('click', handleToggleClick)
    toggle.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('click', handleDocumentClick)
    document.addEventListener('keydown', handleKeyDown)

    root.querySelectorAll<HTMLElement>(optionSelector).forEach((option) => {
        option.addEventListener('click', handleColorClick)
    })

    applyScheme(getInitialScheme())

    const savedColor = safeGetItem(THEME_STORAGE_KEYS.color)
    const savedAccent = safeGetItem(THEME_STORAGE_KEYS.accent)
    if (savedColor && savedAccent) {
        applyThemeColor(savedColor, savedAccent)
    } else {
        applyThemeColor(THEME_COLORS[0].color, THEME_COLORS[0].accent)
    }

    setDropdownState(root, dropdownSelector, false)

    return () => {
        clearLongPressTimer()

        if (typeof window !== 'undefined' && 'PointerEvent' in window) {
            toggle.removeEventListener('pointerdown', handlePointerDown)
            toggle.removeEventListener('pointerup', handlePointerUp)
            toggle.removeEventListener('pointercancel', handlePointerUp)
        } else {
            toggle.removeEventListener('mousedown', handleMouseDown)
            toggle.removeEventListener('mouseup', handleMouseUp)
        }

        if (typeof window !== 'undefined' && 'ontouchstart' in window) {
            toggle.removeEventListener('touchstart', handleTouchStart)
            toggle.removeEventListener('touchend', handleTouchEnd)
            toggle.removeEventListener('touchcancel', handleTouchEnd)
        }

        toggle.removeEventListener('click', handleToggleClick)
        toggle.removeEventListener('contextmenu', handleContextMenu)
        document.removeEventListener('click', handleDocumentClick)
        document.removeEventListener('keydown', handleKeyDown)

        root.querySelectorAll<HTMLElement>(optionSelector).forEach((option) => {
            option.removeEventListener('click', handleColorClick)
        })
    }
}

export function setupThemeControllerLifecycle(
    selector: string,
    options: ThemeControllerOptions = {}
): void {
    setupComponentLifecycle(selector, (element) => initThemeController(element, options))
}
