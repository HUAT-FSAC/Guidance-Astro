/**
 * 搜索建议工具
 * 提供搜索建议和自动完成功能
 */

import { filterSearchHistory } from './search-history'

/**
 * 热门搜索词
 */
const POPULAR_SEARCHES = [
    'ROS 入门',
    '感知',
    '定位建图',
    '规划控制',
    '仿真测试',
    '电气',
    '机械',
    '项目进度',
    'Formula Student',
    '加入我们',
    '团队介绍',
    '赛车',
    '数据集',
    'Docker',
    'VSCode 配置',
]

/**
 * 搜索建议项类型
 */
export interface SearchSuggestion {
    id: string
    type: 'history' | 'popular' | 'suggestion'
    query: string
    timestamp?: number
    score?: number
}

/**
 * 生成搜索建议
 * @param query 搜索查询
 * @param limit 建议数量限制
 */
export function getSearchSuggestions(query: string, limit: number = 10): SearchSuggestion[] {
    const suggestions: SearchSuggestion[] = []
    const lowerQuery = query.toLowerCase().trim()

    if (!lowerQuery) {
        // 显示热门搜索
        return POPULAR_SEARCHES.slice(0, limit).map((item, index) => ({
            id: `popular-${index}`,
            type: 'popular',
            query: item,
        }))
    }

    // 从搜索历史中获取建议
    const historySuggestions = filterSearchHistory(query).map((item) => ({
        id: `history-${item.id}`,
        type: 'history' as const,
        query: item.query,
        timestamp: item.timestamp,
    }))

    // 从热门搜索中获取建议
    const popularSuggestions = POPULAR_SEARCHES.filter((item) =>
        item.toLowerCase().includes(lowerQuery)
    ).map((item, index) => ({
        id: `popular-${index}`,
        type: 'popular' as const,
        query: item,
    }))

    // 合并建议并去重
    const combined = [...historySuggestions, ...popularSuggestions]
    const uniqueSuggestions = new Map<string, SearchSuggestion>()

    combined.forEach((suggestion) => {
        if (!uniqueSuggestions.has(suggestion.query)) {
            uniqueSuggestions.set(suggestion.query, suggestion)
        }
    })

    // 转换为数组并排序
    Array.from(uniqueSuggestions.values()).forEach((suggestion) => {
        suggestions.push(suggestion)
    })

    // 按相关性和时间排序
    suggestions.sort((a, b) => {
        // 优先显示历史记录
        if (a.type === 'history' && b.type !== 'history') return -1
        if (a.type !== 'history' && b.type === 'history') return 1

        // 历史记录按时间排序
        if (a.type === 'history' && b.type === 'history') {
            return (b.timestamp || 0) - (a.timestamp || 0)
        }

        // 其他按相关性排序
        const aScore = getRelevanceScore(a.query, lowerQuery)
        const bScore = getRelevanceScore(b.query, lowerQuery)
        return bScore - aScore
    })

    return suggestions.slice(0, limit)
}

/**
 * 计算搜索相关性得分
 * @param suggestion 建议文本
 * @param query 搜索查询
 */
function getRelevanceScore(suggestion: string, query: string): number {
    const lowerSuggestion = suggestion.toLowerCase()
    const lowerQuery = query.toLowerCase()

    // 完全匹配得分最高
    if (lowerSuggestion === lowerQuery) return 100

    // 前缀匹配得分较高
    if (lowerSuggestion.startsWith(lowerQuery)) return 90

    // 包含匹配得分
    if (lowerSuggestion.includes(lowerQuery)) return 80

    // 部分匹配得分
    return 70
}

/**
 * 渲染搜索建议
 * @param container 容器元素
 * @param query 搜索查询
 * @param onSelect 选择建议的回调
 */
export function renderSearchSuggestions(
    container: HTMLElement,
    query: string,
    onSelect: (query: string) => void
): void {
    const suggestions = getSearchSuggestions(query)

    if (suggestions.length === 0) {
        container.innerHTML = '<p class="search-suggestions-empty">无搜索建议</p>'
        return
    }

    const list = document.createElement('ul')
    list.className = 'search-suggestions-list'

    suggestions.forEach((suggestion) => {
        const li = document.createElement('li')
        li.className = `search-suggestions-item search-suggestions-${suggestion.type}`

        let icon = ''
        let typeLabel = ''

        switch (suggestion.type) {
            case 'history':
                icon =
                    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path><path d="M12 7v5l4 2"></path></svg>'
                typeLabel = '历史'
                break
            case 'popular':
                icon =
                    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>'
                typeLabel = '热门'
                break
            case 'suggestion':
                icon =
                    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>'
                typeLabel = '建议'
                break
        }

        li.innerHTML = `
            <button class="search-suggestions-button" data-query="${escapeHtml(suggestion.query)}">
                <span class="search-suggestions-icon">${icon}</span>
                <span class="search-suggestions-text">${highlightMatch(suggestion.query, query)}</span>
                <span class="search-suggestions-type">${typeLabel}</span>
            </button>
        `

        const button = li.querySelector('.search-suggestions-button')
        if (button) {
            button.addEventListener('click', () => {
                const selectedQuery = button.getAttribute('data-query') || ''
                onSelect(selectedQuery)
            })
        }

        list.appendChild(li)
    })

    container.innerHTML = ''
    container.appendChild(list)
}

/**
 * 高亮匹配的文本
 * @param text 原始文本
 * @param query 搜索查询
 */
function highlightMatch(text: string, query: string): string {
    if (!query || query.trim().length === 0) {
        return escapeHtml(text)
    }

    const lowerText = text.toLowerCase()
    const lowerQuery = query.toLowerCase()
    const index = lowerText.indexOf(lowerQuery)

    if (index === -1) {
        return escapeHtml(text)
    }

    const before = text.substring(0, index)
    const match = text.substring(index, index + query.length)
    const after = text.substring(index + query.length)

    return `${escapeHtml(before)}<mark class="search-match">${escapeHtml(match)}</mark>${escapeHtml(after)}`
}

/**
 * HTML 转义
 */
function escapeHtml(text: string): string {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
}

/**
 * 初始化搜索建议
 * @param input 搜索输入元素
 * @param container 建议容器元素
 * @param onSelect 选择建议的回调
 */
export function initSearchSuggestions(
    input: HTMLInputElement,
    container: HTMLElement,
    onSelect: (query: string) => void
): () => void {
    let debounceTimer: ReturnType<typeof setTimeout> | null = null

    const handleInput = () => {
        if (debounceTimer) {
            clearTimeout(debounceTimer)
        }

        debounceTimer = setTimeout(() => {
            const query = input.value
            renderSearchSuggestions(container, query, onSelect)
        }, 200)
    }

    const handleKeyDown = (e: KeyboardEvent) => {
        const items = container.querySelectorAll('.search-suggestions-item')
        const activeItem = container.querySelector('.search-suggestions-item.active')
        let activeIndex = Array.from(items).indexOf(activeItem as Element)

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault()
                activeIndex = (activeIndex + 1) % items.length
                break
            case 'ArrowUp':
                e.preventDefault()
                activeIndex = (activeIndex - 1 + items.length) % items.length
                break
            case 'Enter':
                e.preventDefault()
                if (activeItem) {
                    const button = activeItem.querySelector('.search-suggestions-button')
                    if (button) {
                        button.click()
                    }
                }
                return
            case 'Escape':
                container.innerHTML = ''
                return
        }

        // 更新激活状态
        items.forEach((item, index) => {
            if (index === activeIndex) {
                item.classList.add('active')
            } else {
                item.classList.remove('active')
            }
        })
    }

    const handleClickOutside = (e: MouseEvent) => {
        if (!container.contains(e.target as Node) && e.target !== input) {
            container.innerHTML = ''
        }
    }

    input.addEventListener('input', handleInput)
    input.addEventListener('keydown', handleKeyDown)
    document.addEventListener('click', handleClickOutside)

    return () => {
        input.removeEventListener('input', handleInput)
        input.removeEventListener('keydown', handleKeyDown)
        document.removeEventListener('click', handleClickOutside)
        if (debounceTimer) {
            clearTimeout(debounceTimer)
        }
    }
}

/**
 * 暴露到全局
 */
if (typeof window !== 'undefined') {
    ;(
        window as unknown as {
            huatSearchSuggestions?: {
                get: typeof getSearchSuggestions
                render: typeof renderSearchSuggestions
                init: typeof initSearchSuggestions
            }
        }
    ).huatSearchSuggestions = {
        get: getSearchSuggestions,
        render: renderSearchSuggestions,
        init: initSearchSuggestions,
    }
}
