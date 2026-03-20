/**
 * 书签/收藏管理工具
 * 提供页面书签功能，支持分类、导出导入
 */

import { safeGetItem, safeSetItem } from './storage'

const STORAGE_KEY = 'huat-bookmarks'
const MAX_BOOKMARKS = 100

export interface Bookmark {
    id: string
    url: string
    title: string
    path: string
    tags: string[]
    timestamp: number
    notes?: string
}

let bookmarksCache: Bookmark[] = []

/**
 * 加载书签
 */
function loadBookmarks(): void {
    try {
        const stored = safeGetItem(STORAGE_KEY)
        if (stored) {
            bookmarksCache = JSON.parse(stored)
        }
    } catch {
        bookmarksCache = []
    }
}

/**
 * 保存书签
 */
function saveBookmarks(): void {
    try {
        safeSetItem(STORAGE_KEY, JSON.stringify(bookmarksCache.slice(0, MAX_BOOKMARKS)))
    } catch {}
}

/**
 * 生成唯一 ID
 */
function generateId(): string {
    return `bookmark-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 添加书签
 */
export function addBookmark(options: {
    url?: string
    title?: string
    path?: string
    tags?: string[]
    notes?: string
}): Bookmark {
    loadBookmarks()

    const url = options.url || window.location.href
    const title = options.title || document.title
    const path = options.path || window.location.pathname

    const bookmark: Bookmark = {
        id: generateId(),
        url,
        title,
        path,
        tags: options.tags || [],
        timestamp: Date.now(),
        notes: options.notes,
    }

    const existingIndex = bookmarksCache.findIndex((b) => b.path === path)
    if (existingIndex !== -1) {
        bookmarksCache[existingIndex] = { ...bookmark, id: bookmarksCache[existingIndex].id }
    } else {
        bookmarksCache.unshift(bookmark)
    }

    saveBookmarks()
    return bookmark
}

/**
 * 移除书签
 */
export function removeBookmark(id: string): void {
    loadBookmarks()
    bookmarksCache = bookmarksCache.filter((b) => b.id !== id)
    saveBookmarks()
}

/**
 * 检查是否已收藏
 */
export function isBookmarked(path?: string): boolean {
    loadBookmarks()
    const checkPath = path || window.location.pathname
    return bookmarksCache.some((b) => b.path === checkPath)
}

/**
 * 获取所有书签
 */
export function getBookmarks(): Bookmark[] {
    loadBookmarks()
    return [...bookmarksCache]
}

/**
 * 按标签获取书签
 */
export function getBookmarksByTag(tag: string): Bookmark[] {
    loadBookmarks()
    return bookmarksCache.filter((b) => b.tags.includes(tag))
}

/**
 * 获取所有标签
 */
export function getAllTags(): string[] {
    loadBookmarks()
    const tags = new Set<string>()
    bookmarksCache.forEach((b) => {
        b.tags.forEach((t) => tags.add(t))
    })
    return Array.from(tags).sort()
}

/**
 * 更新书签
 */
export function updateBookmark(
    id: string,
    updates: Partial<Pick<Bookmark, 'title' | 'tags' | 'notes'>>
): void {
    loadBookmarks()
    const index = bookmarksCache.findIndex((b) => b.id === id)
    if (index !== -1) {
        bookmarksCache[index] = { ...bookmarksCache[index], ...updates }
        saveBookmarks()
    }
}

/**
 * 导出书签为 JSON
 */
export function exportBookmarks(): string {
    loadBookmarks()
    return JSON.stringify(bookmarksCache, null, 2)
}

/**
 * 从 JSON 导入书签
 */
export function importBookmarks(jsonData: string): number {
    try {
        const imported = JSON.parse(jsonData)
        if (!Array.isArray(imported)) throw new Error('Invalid format')

        loadBookmarks()
        const existingPaths = new Set(bookmarksCache.map((b) => b.path))
        let count = 0

        imported.forEach((bookmark) => {
            if (!existingPaths.has(bookmark.path)) {
                bookmarksCache.unshift({
                    ...bookmark,
                    id: generateId(),
                })
                count++
            }
        })

        saveBookmarks()
        return count
    } catch {
        throw new Error('导入失败，请检查 JSON 格式')
    }
}

/**
 * 清空所有书签
 */
export function clearBookmarks(): void {
    bookmarksCache = []
    saveBookmarks()
}

/**
 * 格式化时间显示
 */
export function formatBookmarkTime(timestamp: number): string {
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
        year: 'numeric',
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
            huatBookmarks?: {
                add: typeof addBookmark
                remove: typeof removeBookmark
                isBookmarked: typeof isBookmarked
                get: typeof getBookmarks
                getByTag: typeof getBookmarksByTag
                getTags: typeof getAllTags
                update: typeof updateBookmark
                export: typeof exportBookmarks
                import: typeof importBookmarks
                clear: typeof clearBookmarks
            }
        }
    ).huatBookmarks = {
        add: addBookmark,
        remove: removeBookmark,
        isBookmarked,
        get: getBookmarks,
        getByTag: getBookmarksByTag,
        getTags: getAllTags,
        update: updateBookmark,
        export: exportBookmarks,
        import: importBookmarks,
        clear: clearBookmarks,
    }
}
