/**
 * 搜索历史记录工具
 * 保存和管理搜索查询历史
 */

import { safeStorage } from './storage'

const STORAGE_KEY = 'huat-search-history'
const MAX_HISTORY = 20

interface SearchHistoryItem {
    id: string
    query: string
    timestamp: number
}

let historyCache: SearchHistoryItem[] = []

/**
 * 加载历史记录
 */
function loadHistory(): void {
    try {
        const stored = safeStorage.getItem(STORAGE_KEY)
        if (stored) {
            historyCache = JSON.parse(stored)
        }
    } catch {
        historyCache = []
    }
}

/**
 * 保存历史记录
 */
function saveHistory(): void {
    try {
        safeStorage.setItem(STORAGE_KEY, JSON.stringify(historyCache))
    } catch {}
}

/**
 * 生成唯一 ID
 */
function generateId(): string {
    return `search-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 添加搜索记录
 */
export function addSearchHistory(query: string): void {
    if (!query || query.trim().length === 0) return

    const trimmedQuery = query.trim()
    loadHistory()

    historyCache = historyCache.filter(
        (item) => item.query.toLowerCase() !== trimmedQuery.toLowerCase()
    )

    historyCache.unshift({
        id: generateId(),
        query: trimmedQuery,
        timestamp: Date.now(),
    })

    historyCache = historyCache.slice(0, MAX_HISTORY)
    saveHistory()
}

/**
 * 获取搜索历史
 */
export function getSearchHistory(): SearchHistoryItem[] {
    loadHistory()
    return [...historyCache]
}

/**
 * 删除指定搜索记录
 */
export function removeSearchHistory(id: string): void {
    loadHistory()
    historyCache = historyCache.filter((item) => item.id !== id)
    saveHistory()
}

/**
 * 清空搜索历史
 */
export function clearSearchHistory(): void {
    historyCache = []
    saveHistory()
}

/**
 * 搜索历史（支持过滤）
 */
export function filterSearchHistory(filter: string): SearchHistoryItem[] {
    loadHistory()
    if (!filter || filter.trim().length === 0) {
        return [...historyCache]
    }
    const lowerFilter = filter.toLowerCase()
    return historyCache.filter((item) => item.query.toLowerCase().includes(lowerFilter))
}

/**
 * 格式化时间显示
 */
export function formatSearchTime(timestamp: number): string {
    const now = Date.now()
    const diff = now - timestamp

    const minute = 60 * 1000
    const hour = 60 * minute
    const day = 24 * hour

    if (diff < minute) return '刚刚'
    if (diff < hour) return `${Math.floor(diff / minute)} 分钟前`
    if (diff < day) return `${Math.floor(diff / hour)} 小时前`

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
            huatSearchHistory?: {
                add: typeof addSearchHistory
                get: typeof getSearchHistory
                remove: typeof removeSearchHistory
                clear: typeof clearSearchHistory
                filter: typeof filterSearchHistory
            }
        }
    ).huatSearchHistory = {
        add: addSearchHistory,
        get: getSearchHistory,
        remove: removeSearchHistory,
        clear: clearSearchHistory,
        filter: filterSearchHistory,
    }
}
