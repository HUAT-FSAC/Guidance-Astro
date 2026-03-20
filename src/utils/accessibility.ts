/**
 * 无障碍增强套件
 * 提供可访问性支持功能
 */

import { safeGetItem, safeSetItem } from './storage'

const PREFERENCES_KEY = 'huat-a11y-preferences'

export interface A11yPreferences {
    highContrast: boolean
    largeText: boolean
    reducedMotion: boolean
    screenReaderOptimized: boolean
    keyboardNavigationOnly: boolean
}

const DEFAULT_PREFERENCES: A11yPreferences = {
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    screenReaderOptimized: false,
    keyboardNavigationOnly: false,
}

let currentPreferences: A11yPreferences = { ...DEFAULT_PREFERENCES }

/**
 * 加载无障碍偏好设置
 */
function loadPreferences(): void {
    try {
        const stored = safeGetItem(PREFERENCES_KEY)
        if (stored) {
            currentPreferences = { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) }
        }
    } catch {
        currentPreferences = { ...DEFAULT_PREFERENCES }
    }
    applyPreferences()
}

/**
 * 保存无障碍偏好设置
 */
function savePreferences(): void {
    try {
        safeSetItem(PREFERENCES_KEY, JSON.stringify(currentPreferences))
    } catch {}
}

/**
 * 应用无障碍偏好设置
 */
function applyPreferences(): void {
    const html = document.documentElement

    if (currentPreferences.highContrast) {
        html.classList.add('a11y-high-contrast')
    } else {
        html.classList.remove('a11y-high-contrast')
    }

    if (currentPreferences.largeText) {
        html.classList.add('a11y-large-text')
    } else {
        html.classList.remove('a11y-large-text')
    }

    if (currentPreferences.reducedMotion) {
        html.classList.add('a11y-reduced-motion')
    } else {
        html.classList.remove('a11y-reduced-motion')
    }

    if (currentPreferences.screenReaderOptimized) {
        html.classList.add('a11y-screen-reader')
    } else {
        html.classList.remove('a11y-screen-reader')
    }

    if (currentPreferences.keyboardNavigationOnly) {
        html.classList.add('a11y-keyboard-only')
    } else {
        html.classList.remove('a11y-keyboard-only')
    }
}

/**
 * 获取当前无障碍偏好设置
 */
export function getA11yPreferences(): A11yPreferences {
    loadPreferences()
    return { ...currentPreferences }
}

/**
 * 更新无障碍偏好设置
 */
export function updateA11yPreferences(preferences: Partial<A11yPreferences>): void {
    loadPreferences()
    currentPreferences = { ...currentPreferences, ...preferences }
    savePreferences()
    applyPreferences()
}

/**
 * 重置无障碍偏好设置
 */
export function resetA11yPreferences(): void {
    currentPreferences = { ...DEFAULT_PREFERENCES }
    savePreferences()
    applyPreferences()
}

/**
 * 高对比度模式
 */
export function toggleHighContrast(enabled?: boolean): boolean {
    loadPreferences()
    currentPreferences.highContrast =
        enabled !== undefined ? enabled : !currentPreferences.highContrast
    savePreferences()
    applyPreferences()
    return currentPreferences.highContrast
}

/**
 * 大文字模式
 */
export function toggleLargeText(enabled?: boolean): boolean {
    loadPreferences()
    currentPreferences.largeText = enabled !== undefined ? enabled : !currentPreferences.largeText
    savePreferences()
    applyPreferences()
    return currentPreferences.largeText
}

/**
 * 减少动画模式
 */
export function toggleReducedMotion(enabled?: boolean): boolean {
    loadPreferences()
    currentPreferences.reducedMotion =
        enabled !== undefined ? enabled : !currentPreferences.reducedMotion
    savePreferences()
    applyPreferences()
    return currentPreferences.reducedMotion
}

/**
 * 屏幕阅读器优化
 */
export function toggleScreenReaderOptimized(enabled?: boolean): boolean {
    loadPreferences()
    currentPreferences.screenReaderOptimized =
        enabled !== undefined ? enabled : !currentPreferences.screenReaderOptimized
    savePreferences()
    applyPreferences()
    return currentPreferences.screenReaderOptimized
}

/**
 * 仅键盘导航
 */
export function toggleKeyboardNavigationOnly(enabled?: boolean): boolean {
    loadPreferences()
    currentPreferences.keyboardNavigationOnly =
        enabled !== undefined ? enabled : !currentPreferences.keyboardNavigationOnly
    savePreferences()
    applyPreferences()
    return currentPreferences.keyboardNavigationOnly
}

/**
 * 跳过导航链接
 */
export function initSkipLink(): void {
    const skipLink = document.createElement('a')
    skipLink.href = '#main-content'
    skipLink.className = 'a11y-skip-link'
    skipLink.textContent = '跳转到主要内容'
    document.body.prepend(skipLink)
}

/**
 * 焦点管理 - 防止焦点被困
 */
export function trapFocus(element: HTMLElement): () => void {
    const focusableElements = element.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement | null
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement | null

    function handleKeyDown(event: KeyboardEvent) {
        if (event.key !== 'Tab') return

        if (firstElement && lastElement) {
            if (event.shiftKey) {
                if (document.activeElement === firstElement) {
                    event.preventDefault()
                    lastElement.focus()
                }
            } else {
                if (document.activeElement === lastElement) {
                    event.preventDefault()
                    firstElement.focus()
                }
            }
        }
    }

    element.addEventListener('keydown', handleKeyDown)
    if (firstElement) firstElement.focus()

    return () => {
        element.removeEventListener('keydown', handleKeyDown)
    }
}

/**
 * 实时区域 - 用于屏幕阅读器通知
 */
let liveRegion: HTMLElement | null = null

export function announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    if (!liveRegion) {
        liveRegion = document.createElement('div')
        liveRegion.setAttribute('role', 'status')
        liveRegion.setAttribute('aria-live', priority)
        liveRegion.setAttribute('aria-atomic', 'true')
        liveRegion.className = 'a11y-live-region'
        document.body.appendChild(liveRegion)
    }

    liveRegion.textContent = message
    setTimeout(() => {
        if (liveRegion) liveRegion.textContent = ''
    }, 1000)
}

/**
 * 初始化无障碍增强套件
 */
export function initAccessibility(): void {
    loadPreferences()
    initSkipLink()
}

/**
 * 暴露到全局（便于调试）
 */
if (typeof window !== 'undefined') {
    ;(
        window as unknown as {
            huatA11y?: {
                getPreferences: typeof getA11yPreferences
                updatePreferences: typeof updateA11yPreferences
                resetPreferences: typeof resetA11yPreferences
                toggleHighContrast: typeof toggleHighContrast
                toggleLargeText: typeof toggleLargeText
                toggleReducedMotion: typeof toggleReducedMotion
                toggleScreenReaderOptimized: typeof toggleScreenReaderOptimized
                toggleKeyboardNavigationOnly: typeof toggleKeyboardNavigationOnly
                announce: typeof announce
            }
        }
    ).huatA11y = {
        getPreferences: getA11yPreferences,
        updatePreferences: updateA11yPreferences,
        resetPreferences: resetA11yPreferences,
        toggleHighContrast: toggleHighContrast,
        toggleLargeText: toggleLargeText,
        toggleReducedMotion: toggleReducedMotion,
        toggleScreenReaderOptimized: toggleScreenReaderOptimized,
        toggleKeyboardNavigationOnly: toggleKeyboardNavigationOnly,
        announce: announce,
    }
}
