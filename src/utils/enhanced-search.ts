/**
 * 增强搜索功能
 * 整合 Pagefind、搜索历史和快捷键
 */

import {
    addSearchHistory,
    formatSearchTime,
    getSearchHistory,
    removeSearchHistory,
} from './search-history'
import { initSearchResultHighlight } from './search-highlight'

let isSearchOpen = false

/**
 * 检查是否为 Mac
 */
function isMac(): boolean {
    return /Mac|iPod|iPhone|iPad/.test(navigator.platform) || navigator.userAgent.includes('Mac')
}

/**
 * 获取快捷键显示文本
 */
export function getSearchShortcut(): string {
    return isMac() ? '⌘ K' : 'Ctrl K'
}

/**
 * 打开 Pagefind 搜索对话框
 */
export function openSearch(): void {
    const searchButton = document.querySelector(
        '[data-pagefind-ui] button, .sl-search-input, [aria-label*="搜索"], [aria-label*="Search"], starlight-search button, button[aria-keyshortcuts]'
    ) as HTMLElement | null

    if (searchButton) {
        searchButton.click()
        isSearchOpen = true
        setTimeout(() => {
            setupSearchTracking()
        }, 100)
    } else {
        const event = new KeyboardEvent('keydown', {
            key: 'k',
            ctrlKey: !isMac(),
            metaKey: isMac(),
            bubbles: true,
        })
        document.dispatchEvent(event)
    }
}

/**
 * 设置搜索跟踪和建议
 */
function setupSearchTracking(): void {
    const pagefindInput = document.querySelector(
        'input[type="text"], input[type="search"]'
    ) as HTMLInputElement | null

    if (pagefindInput && !pagefindInput.dataset.tracked) {
        pagefindInput.dataset.tracked = 'true'

        let debounceTimer: ReturnType<typeof setTimeout> | null = null

        pagefindInput.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement
            const query = target.value.trim()

            if (debounceTimer) {
                clearTimeout(debounceTimer)
            }

            if (query.length >= 2) {
                debounceTimer = setTimeout(() => {
                    addSearchHistory(query)
                }, 1000)
            }
        })

        pagefindInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const query = pagefindInput.value.trim()
                if (query) {
                    addSearchHistory(query)
                }
            }
        })

        // 初始化搜索建议
        import('./search-suggestions').then(({ initSearchSuggestions }) => {
            // 创建建议容器
            const container = document.createElement('div')
            container.className = 'search-suggestions-container'
            container.style.position = 'absolute'
            container.style.top = '100%'
            container.style.left = '0'
            container.style.right = '0'
            container.style.backgroundColor = 'var(--sl-color-bg-base)'
            container.style.border = '1px solid var(--sl-color-border)'
            container.style.borderRadius = '0 0 var(--sl-radius-medium) var(--sl-radius-medium)'
            container.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)'
            container.style.zIndex = '1000'
            container.style.maxHeight = '300px'
            container.style.overflowY = 'auto'

            // 插入到输入框的父元素中
            const parent = pagefindInput.parentElement
            if (parent) {
                parent.style.position = 'relative'
                parent.appendChild(container)

                // 初始化搜索建议
                initSearchSuggestions(pagefindInput, container, (query) => {
                    pagefindInput.value = query
                    pagefindInput.dispatchEvent(new Event('input', { bubbles: true }))
                    pagefindInput.focus()
                })
            }
        })

        // 监听搜索结果加载完成事件
        const observer = new MutationObserver(() => {
            const searchResults = document.querySelector('[data-pagefind-ui]') || document.querySelector('.pagefind-ui')
            if (searchResults) {
                const query = pagefindInput.value.trim()
                if (query) {
                    initSearchResultHighlight(searchResults, query)
                }
            }
        })

        observer.observe(document.body, { childList: true, subtree: true })

        // 清理 observer
        pagefindInput.addEventListener('blur', () => {
            observer.disconnect()
        })
    }
}

/**
 * 关闭搜索
 */
export function closeSearch(): void {
    const closeButton = document.querySelector(
        '[data-pagefind-ui] button[aria-label*="Close"], [data-pagefind-ui] button[aria-label*="关闭"], dialog button[autofocus]'
    ) as HTMLElement | null

    if (closeButton) {
        closeButton.click()
    } else {
        const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
        document.dispatchEvent(event)
    }

    isSearchOpen = false
}

/**
 * 切换搜索状态
 */
export function toggleSearch(): void {
    if (isSearchOpen) {
        closeSearch()
    } else {
        openSearch()
    }
}

/**
 * 执行搜索（带历史记录）
 */
export function searchWithHistory(query: string): void {
    if (!query.trim()) return

    addSearchHistory(query)
    openSearch()

    setTimeout(() => {
        const input = document.querySelector(
            '[data-pagefind-ui] input, .sl-search-input input'
        ) as HTMLInputElement | null

        if (input) {
            input.value = query
            input.dispatchEvent(new Event('input', { bubbles: true }))
            input.focus()
        }
    }, 150)
}

/**
 * 渲染搜索历史到 DOM
 */
export function renderSearchHistory(
    container: HTMLElement,
    onSelect?: (query: string) => void
): void {
    const history = getSearchHistory()

    if (history.length === 0) {
        container.innerHTML = '<p class="search-history-empty">暂无搜索历史</p>'
        return
    }

    const list = document.createElement('ul')
    list.className = 'search-history-list'

    history.slice(0, 10).forEach((item) => {
        const li = document.createElement('li')
        li.className = 'search-history-item'
        li.innerHTML = `
            <button class="search-history-query" data-query="${escapeHtml(item.query)}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                </svg>
                <span>${escapeHtml(item.query)}</span>
                <time>${formatSearchTime(item.timestamp)}</time>
            </button>
            <button class="search-history-delete" data-id="${item.id}" aria-label="删除">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6 6 18"></path>
                    <path d="m6 6 12 12"></path>
                </svg>
            </button>
        `

        const queryBtn = li.querySelector('.search-history-query')
        if (queryBtn) {
            queryBtn.addEventListener('click', () => {
                const query = queryBtn.getAttribute('data-query') || ''
                if (onSelect) {
                    onSelect(query)
                } else {
                    searchWithHistory(query)
                }
            })
        }

        const deleteBtn = li.querySelector('.search-history-delete')
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation()
                const id = deleteBtn.getAttribute('data-id') || ''
                removeSearchHistory(id)
                renderSearchHistory(container, onSelect)
            })
        }

        list.appendChild(li)
    })

    container.innerHTML = ''
    container.appendChild(list)

    if (history.length > 0) {
        const clearBtn = document.createElement('button')
        clearBtn.className = 'search-history-clear'
        clearBtn.textContent = '清除全部历史'
        clearBtn.addEventListener('click', () => {
            import('./search-history').then(({ clearSearchHistory }) => {
                clearSearchHistory()
                renderSearchHistory(container, onSelect)
            })
        })
        container.appendChild(clearBtn)
    }
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
 * 初始化搜索快捷键
 */
export function initSearchShortcut(): () => void {
    const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault()
            e.stopPropagation()
            openSearch()
        }

        if (e.key === '/' && !isInputElement(e.target as HTMLElement)) {
            e.preventDefault()
            openSearch()
        }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
        document.removeEventListener('keydown', handleKeyDown)
    }
}

/**
 * 检查元素是否为输入元素
 */
function isInputElement(element: HTMLElement): boolean {
    const tagName = element.tagName.toLowerCase()
    return (
        tagName === 'input' ||
        tagName === 'textarea' ||
        tagName === 'select' ||
        element.isContentEditable
    )
}

if (typeof window !== 'undefined') {
    ;(
        window as unknown as {
            huatSearch?: {
                open: typeof openSearch
                close: typeof closeSearch
                toggle: typeof toggleSearch
                search: typeof searchWithHistory
                getShortcut: typeof getSearchShortcut
                renderHistory: typeof renderSearchHistory
            }
        }
    ).huatSearch = {
        open: openSearch,
        close: closeSearch,
        toggle: toggleSearch,
        search: searchWithHistory,
        getShortcut: getSearchShortcut,
        renderHistory: renderSearchHistory,
    }
}
