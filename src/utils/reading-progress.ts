/**
 * 阅读进度持久化工具
 * 自动保存和恢复文档阅读位置
 */

import { safeStorage } from './storage'

const STORAGE_KEY = 'huat-reading-progress'
const MAX_ENTRIES = 100

interface ReadingProgressEntry {
    path: string
    scrollPercent: number
    scrollY: number
    timestamp: number
    title?: string
}

let progressCache: Map<string, ReadingProgressEntry> = new Map()
let isSaving = false
let saveTimeout: number | null = null

/**
 * 加载进度数据
 */
function loadProgress(): void {
    try {
        const stored = safeStorage.getItem(STORAGE_KEY)
        if (stored) {
            const data: ReadingProgressEntry[] = JSON.parse(stored)
            progressCache = new Map(data.map((entry) => [entry.path, entry]))
        }
    } catch {
        progressCache = new Map()
    }
}

/**
 * 保存进度数据
 */
function saveProgress(): void {
    if (isSaving) return
    isSaving = true

    try {
        const entries = Array.from(progressCache.values())
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, MAX_ENTRIES)
        safeStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
    } catch {
    } finally {
        isSaving = false
    }
}

/**
 * 防抖保存
 */
function debouncedSave(): void {
    if (saveTimeout) {
        clearTimeout(saveTimeout)
    }
    saveTimeout = window.setTimeout(() => {
        saveProgress()
        saveTimeout = null
    }, 500)
}

/**
 * 获取当前页面滚动百分比
 */
function getScrollPercent(): number {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
    if (scrollHeight <= 0) return 0
    return Math.round((window.scrollY / scrollHeight) * 100)
}

/**
 * 保存当前页面阅读进度
 */
export function saveCurrentProgress(): void {
    if (typeof window === 'undefined') return

    const path = window.location.pathname
    const scrollPercent = getScrollPercent()
    const title = document.title

    progressCache.set(path, {
        path,
        scrollPercent,
        scrollY: window.scrollY,
        timestamp: Date.now(),
        title,
    })

    debouncedSave()
}

/**
 * 获取指定路径的阅读进度
 */
export function getProgress(path: string): ReadingProgressEntry | undefined {
    loadProgress()
    return progressCache.get(path)
}

/**
 * 获取当前页面的阅读进度
 */
export function getCurrentProgress(): ReadingProgressEntry | undefined {
    if (typeof window === 'undefined') return undefined
    return getProgress(window.location.pathname)
}

/**
 * 恢复当前页面的阅读进度
 */
export function restoreCurrentProgress(options?: {
    immediate?: boolean
    threshold?: number
}): boolean {
    if (typeof window === 'undefined') return false

    const { immediate = false, threshold = 5 } = options || {}
    const progress = getCurrentProgress()

    if (!progress || progress.scrollPercent < threshold) {
        return false
    }

    const doRestore = () => {
        window.scrollTo({
            top: progress.scrollY,
            behavior: immediate ? 'auto' : 'smooth',
        })
    }

    if (immediate) {
        doRestore()
    } else {
        requestAnimationFrame(() => {
            setTimeout(doRestore, 100)
        })
    }

    return true
}

/**
 * 获取所有阅读进度记录
 */
export function getAllProgress(): ReadingProgressEntry[] {
    loadProgress()
    return Array.from(progressCache.values()).sort((a, b) => b.timestamp - a.timestamp)
}

/**
 * 清除指定路径的阅读进度
 */
export function clearProgress(path: string): void {
    loadProgress()
    progressCache.delete(path)
    saveProgress()
}

/**
 * 清除所有阅读进度
 */
export function clearAllProgress(): void {
    progressCache.clear()
    saveProgress()
}

/**
 * 初始化阅读进度跟踪
 */
export function initReadingProgress(): (() => void) | undefined {
    if (typeof window === 'undefined') return undefined

    loadProgress()

    let scrollThrottle: number | null = null

    const handleScroll = () => {
        if (scrollThrottle) return
        scrollThrottle = window.setTimeout(() => {
            saveCurrentProgress()
            scrollThrottle = null
        }, 200)
    }

    const handleBeforeUnload = () => {
        saveCurrentProgress()
        saveProgress()
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
        window.removeEventListener('scroll', handleScroll)
        window.removeEventListener('beforeunload', handleBeforeUnload)
        if (scrollThrottle) clearTimeout(scrollThrottle)
        if (saveTimeout) clearTimeout(saveTimeout)
    }
}

/**
 * 格式化阅读进度显示
 */
export function formatProgress(percent: number): string {
    if (percent <= 0) return '未开始'
    if (percent >= 100) return '已完成'
    return `${percent}%`
}

/**
 * 格式化时间显示
 */
export function formatTime(timestamp: number): string {
    const now = Date.now()
    const diff = now - timestamp

    const minute = 60 * 1000
    const hour = 60 * minute
    const day = 24 * hour
    const week = 7 * day

    if (diff < minute) return '刚刚'
    if (diff < hour) return `${Math.floor(diff / minute)} 分钟前`
    if (diff < day) return `${Math.floor(diff / hour)} 小时前`
    if (diff < week) return `${Math.floor(diff / day)} 天前`

    const date = new Date(timestamp)
    return date.toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric',
    })
}

/**
 * 暴露到全局（便于调试）
 */
if (typeof window !== 'undefined') {
    ;(
        window as unknown as {
            huatReadingProgress?: {
                save: typeof saveCurrentProgress
                get: typeof getCurrentProgress
                restore: typeof restoreCurrentProgress
                getAll: typeof getAllProgress
                clear: typeof clearAllProgress
            }
        }
    ).huatReadingProgress = {
        save: saveCurrentProgress,
        get: getCurrentProgress,
        restore: restoreCurrentProgress,
        getAll: getAllProgress,
        clear: clearAllProgress,
    }
}
