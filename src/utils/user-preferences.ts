/**
 * 用户偏好设置管理工具
 * 提供字体大小、行高、动画开关等用户自定义功能
 */

import { safeGetItem, safeSetItem } from './storage'

const STORAGE_KEY = 'huat-user-preferences'

export interface UserPreferences {
    fontSize: 'small' | 'medium' | 'large' | 'xlarge'
    lineHeight: 'compact' | 'normal' | 'relaxed'
    animations: boolean
    reducedMotion: boolean
    readingMode: boolean
}

const DEFAULT_PREFERENCES: UserPreferences = {
    fontSize: 'medium',
    lineHeight: 'normal',
    animations: true,
    reducedMotion: false,
    readingMode: false,
}

const FONT_SIZE_MAP: Record<UserPreferences['fontSize'], string> = {
    small: '14px',
    medium: '16px',
    large: '18px',
    xlarge: '20px',
}

const LINE_HEIGHT_MAP: Record<UserPreferences['lineHeight'], string> = {
    compact: '1.4',
    normal: '1.6',
    relaxed: '1.8',
}

let currentPreferences: UserPreferences = { ...DEFAULT_PREFERENCES }

/**
 * 加载用户偏好设置
 */
function loadPreferences(): void {
    try {
        const stored = safeGetItem(STORAGE_KEY)
        if (stored) {
            const parsed = JSON.parse(stored)
            currentPreferences = { ...DEFAULT_PREFERENCES, ...parsed }
        }
    } catch {
        currentPreferences = { ...DEFAULT_PREFERENCES }
    }
}

/**
 * 保存用户偏好设置
 */
function savePreferences(): void {
    try {
        safeSetItem(STORAGE_KEY, JSON.stringify(currentPreferences))
    } catch {}
}

/**
 * 应用用户偏好设置到 DOM
 */
function applyPreferences(): void {
    const root = document.documentElement

    root.style.setProperty('--huat-font-size', FONT_SIZE_MAP[currentPreferences.fontSize])
    root.style.setProperty('--huat-line-height', LINE_HEIGHT_MAP[currentPreferences.lineHeight])

    if (currentPreferences.animations === false || currentPreferences.reducedMotion) {
        root.classList.add('huat-no-animations')
    } else {
        root.classList.remove('huat-no-animations')
    }

    if (currentPreferences.readingMode) {
        root.classList.add('huat-reading-mode')
    } else {
        root.classList.remove('huat-reading-mode')
    }
}

/**
 * 获取当前用户偏好设置
 */
export function getPreferences(): UserPreferences {
    loadPreferences()
    return { ...currentPreferences }
}

/**
 * 更新用户偏好设置
 */
export function updatePreferences(updates: Partial<UserPreferences>): void {
    loadPreferences()
    currentPreferences = { ...currentPreferences, ...updates }
    savePreferences()
    applyPreferences()
}

/**
 * 重置为默认设置
 */
export function resetPreferences(): void {
    currentPreferences = { ...DEFAULT_PREFERENCES }
    savePreferences()
    applyPreferences()
}

/**
 * 初始化用户偏好设置
 */
export function initUserPreferences(): void {
    loadPreferences()
    applyPreferences()
}

/**
 * 字体大小切换
 */
export function setFontSize(size: UserPreferences['fontSize']): void {
    updatePreferences({ fontSize: size })
}

/**
 * 行高切换
 */
export function setLineHeight(height: UserPreferences['lineHeight']): void {
    updatePreferences({ lineHeight: height })
}

/**
 * 动画开关
 */
export function toggleAnimations(enabled: boolean): void {
    updatePreferences({ animations: enabled })
}

/**
 * 减少动效模式
 */
export function toggleReducedMotion(enabled: boolean): void {
    updatePreferences({ reducedMotion: enabled })
}

/**
 * 阅读模式
 */
export function toggleReadingMode(enabled: boolean): void {
    updatePreferences({ readingMode: enabled })
}

/**
 * 暴露到全局（便于调试）
 */
if (typeof window !== 'undefined') {
    ;(
        window as unknown as {
            huatPreferences?: {
                get: typeof getPreferences
                update: typeof updatePreferences
                reset: typeof resetPreferences
                setFontSize: typeof setFontSize
                setLineHeight: typeof setLineHeight
                toggleAnimations: typeof toggleAnimations
                toggleReducedMotion: typeof toggleReducedMotion
                toggleReadingMode: typeof toggleReadingMode
            }
        }
    ).huatPreferences = {
        get: getPreferences,
        update: updatePreferences,
        reset: resetPreferences,
        setFontSize,
        setLineHeight,
        toggleAnimations,
        toggleReducedMotion,
        toggleReadingMode,
    }
}
