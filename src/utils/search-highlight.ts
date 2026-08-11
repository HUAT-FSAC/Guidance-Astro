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
export function highlightSearchResults(
    content: string,
    query: string,
    className: string = 'search-highlight'
): string {
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
 * 仅处理文本节点，避免破坏属性值/现有标记，防止查询文本注入 HTML
 * @param container 容器元素
 * @param query 搜索查询
 */
export function initSearchResultHighlight(container: HTMLElement, query: string): void {
    if (!query || query.trim().length === 0) {
        return
    }

    const lowerQuery = query.trim().toLowerCase()

    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
            if (!node.nodeValue || node.nodeValue.length === 0) {
                return NodeFilter.FILTER_REJECT
            }
            const parent = node.parentElement
            if (
                !parent ||
                parent.closest('.search-highlight, script, style, noscript, code, pre')
            ) {
                return NodeFilter.FILTER_REJECT
            }
            return NodeFilter.FILTER_ACCEPT
        },
    })

    const textNodes: Text[] = []
    while (walker.nextNode()) {
        textNodes.push(walker.currentNode as Text)
    }

    for (const node of textNodes) {
        highlightTextNode(node, lowerQuery)
    }
}

/**
 * 高亮单个文本节点中匹配的部分
 * @param node 文本节点
 * @param lowerQuery 小写化的搜索查询
 */
function highlightTextNode(node: Text, lowerQuery: string): void {
    const text = node.nodeValue ?? ''
    if (!text.toLowerCase().includes(lowerQuery)) {
        return
    }

    const parent = node.parentNode
    if (!parent) {
        return
    }

    const fragment = document.createDocumentFragment()
    let remaining = text

    while (true) {
        const index = remaining.toLowerCase().indexOf(lowerQuery)
        if (index === -1) {
            break
        }

        if (index > 0) {
            fragment.appendChild(document.createTextNode(remaining.slice(0, index)))
        }

        const span = document.createElement('span')
        span.className = 'search-highlight'
        span.textContent = remaining.slice(index, index + lowerQuery.length)
        fragment.appendChild(span)

        remaining = remaining.slice(index + lowerQuery.length)
    }

    if (remaining) {
        fragment.appendChild(document.createTextNode(remaining))
    }

    parent.replaceChild(fragment, node)
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
        init: initSearchResultHighlight,
    }
}
