/**
 * 搜索结果高亮工具
 * 用于在搜索结果页面高亮显示匹配的文本
 */

/**
 * 高亮搜索结果中的匹配文本
 * @param content 原始内容
 * @param query 搜索查询
 * @param className 高亮类名
 */
export function highlightSearchResults(content: string, query: string, className: string = 'search-highlight'): string {
    if (!query || query.trim().length === 0) {
        return content
    }

    const lowerQuery = query.toLowerCase().trim()
    const regex = new RegExp(`(${escapeRegExp(lowerQuery)})`, 'gi')

    return content.replace(regex, (match) => {
        return `<span class="${className}">${match}</span>`
    })
}

/**
 * 转义正则表达式特殊字符
 * @param string 要转义的字符串
 */
function escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * 初始化搜索结果高亮
 * @param container 容器元素
 * @param query 搜索查询
 */
export function initSearchResultHighlight(container: HTMLElement, query: string): void {
    if (!query || query.trim().length === 0) {
        return
    }

    // 高亮标题
    const titles = container.querySelectorAll('h1, h2, h3, h4, h5, h6')
    titles.forEach((title) => {
        title.innerHTML = highlightSearchResults(title.innerHTML, query)
    })

    // 高亮段落
    const paragraphs = container.querySelectorAll('p')
    paragraphs.forEach((paragraph) => {
        paragraph.innerHTML = highlightSearchResults(paragraph.innerHTML, query)
    })

    // 高亮列表项
    const listItems = container.querySelectorAll('li')
    listItems.forEach((item) => {
        item.innerHTML = highlightSearchResults(item.innerHTML, query)
    })

    // 高亮链接文本
    const links = container.querySelectorAll('a')
    links.forEach((link) => {
        if (link.textContent) {
            link.innerHTML = highlightSearchResults(link.innerHTML, query)
        }
    })
}

/**
 * 暴露到全局
 */
if (typeof window !== 'undefined') {
    ;(
        window as unknown as {
            huatSearchHighlight?: {
                highlight: typeof highlightSearchResults
                init: typeof initSearchResultHighlight
            }
        }
    ).huatSearchHighlight = {
        highlight: highlightSearchResults,
        init: initSearchResultHighlight
    }
}
