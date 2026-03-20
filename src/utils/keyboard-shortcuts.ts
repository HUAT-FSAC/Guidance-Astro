/**
 * 键盘快捷键管理工具
 * 提供全局快捷键和快捷键提示面板
 */

import { safeGetItem, safeSetItem } from './storage'

const STORAGE_KEY = 'huat-shortcuts-enabled'

export interface KeyboardShortcut {
    key: string
    ctrl?: boolean
    shift?: boolean
    alt?: boolean
    meta?: boolean
    description: string
    category: string
    action: () => void
}

let shortcuts: KeyboardShortcut[] = []
let isEnabled = true

/**
 * 加载快捷键启用状态
 */
function loadEnabledState(): void {
    try {
        const stored = safeGetItem(STORAGE_KEY)
        if (stored !== null) {
            isEnabled = stored === 'true'
        }
    } catch {
        isEnabled = true
    }
}

/**
 * 保存快捷键启用状态
 */
function saveEnabledState(): void {
    try {
        safeSetItem(STORAGE_KEY, isEnabled.toString())
    } catch {}
}

/**
 * 注册快捷键
 */
export function registerShortcut(shortcut: KeyboardShortcut): void {
    shortcuts.push(shortcut)
}

/**
 * 注销快捷键
 */
export function unregisterShortcut(key: string): void {
    shortcuts = shortcuts.filter((s) => s.key !== key)
}

/**
 * 获取所有快捷键
 */
export function getShortcuts(): KeyboardShortcut[] {
    return [...shortcuts]
}

/**
 * 按分类获取快捷键
 */
export function getShortcutsByCategory(): Record<string, KeyboardShortcut[]> {
    const categories: Record<string, KeyboardShortcut[]> = {}
    shortcuts.forEach((shortcut) => {
        if (!categories[shortcut.category]) {
            categories[shortcut.category] = []
        }
        categories[shortcut.category].push(shortcut)
    })
    return categories
}

/**
 * 格式化快捷键显示
 */
export function formatShortcut(shortcut: KeyboardShortcut): string {
    const parts: string[] = []
    if (shortcut.ctrl) parts.push('Ctrl')
    if (shortcut.shift) parts.push('Shift')
    if (shortcut.alt) parts.push('Alt')
    if (shortcut.meta) parts.push('Meta')
    parts.push(shortcut.key.toUpperCase())
    return parts.join(' + ')
}

/**
 * 检查是否启用快捷键
 */
export function areShortcutsEnabled(): boolean {
    loadEnabledState()
    return isEnabled
}

/**
 * 启用/禁用快捷键
 */
export function toggleShortcuts(enabled: boolean): void {
    isEnabled = enabled
    saveEnabledState()
}

/**
 * 处理键盘事件
 */
function handleKeyDown(event: KeyboardEvent): void {
    loadEnabledState()
    if (!isEnabled) return

    const matchingShortcut = shortcuts.find((shortcut) => {
        if (shortcut.key.toLowerCase() !== event.key.toLowerCase()) return false
        if (shortcut.ctrl && !event.ctrlKey) return false
        if (shortcut.shift && !event.shiftKey) return false
        if (shortcut.alt && !event.altKey) return false
        if (shortcut.meta && !event.metaKey) return false
        if (!shortcut.ctrl && !shortcut.shift && !shortcut.alt && !shortcut.meta) {
            if (event.ctrlKey || event.shiftKey || event.altKey || event.metaKey) return false
        }
        return true
    })

    if (matchingShortcut) {
        event.preventDefault()
        event.stopPropagation()
        matchingShortcut.action()
    }
}

/**
 * 初始化键盘快捷键
 */
export function initKeyboardShortcuts(): (() => void) | undefined {
    loadEnabledState()
    document.addEventListener('keydown', handleKeyDown)

    return () => {
        document.removeEventListener('keydown', handleKeyDown)
    }
}

/**
 * 暴露到全局（便于调试）
 */
if (typeof window !== 'undefined') {
    ;(
        window as unknown as {
            huatShortcuts?: {
                register: typeof registerShortcut
                unregister: typeof unregisterShortcut
                get: typeof getShortcuts
                getByCategory: typeof getShortcutsByCategory
                areEnabled: typeof areShortcutsEnabled
                toggle: typeof toggleShortcuts
                format: typeof formatShortcut
            }
        }
    ).huatShortcuts = {
        register: registerShortcut,
        unregister: unregisterShortcut,
        get: getShortcuts,
        getByCategory: getShortcutsByCategory,
        areEnabled: areShortcutsEnabled,
        toggle: toggleShortcuts,
        format: formatShortcut,
    }
}
