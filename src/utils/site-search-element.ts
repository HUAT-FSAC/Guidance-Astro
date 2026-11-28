/**
 * SiteSearch 自定义元素（#262）。
 *
 * 与上游 @astrojs/starlight components/Search.astro 的差异仅限脚本生命周期：
 * - 上游把 PagefindUI 初始化挂在 window DOMContentLoaded 上，ClientRouter（astro:transitions）
 *   的客户端导航不会再次触发该事件，SPA 导航后搜索弹窗内没有输入框；
 * - 上游从不移除 window 级监听，旧实例在导航后持续泄漏，且其 showModal 会因元素脱离文档抛错。
 * 这里改为 connectedCallback 内按实例初始化、disconnectedCallback 清理监听；
 * 每次异步加载恢复后重新核对当前容器与已有 UI，避免生命周期重入及过时目标写入。
 * PagefindUI 从 /pagefind/ 检索 bundle 自带的运行时脚本加载（与索引同源发布，无新增依赖）。
 */

interface PagefindUIConstructor {
    new (options: Record<string, unknown>): unknown
}

/** 检索 bundle 的 UI 脚本（pagefind build 产物，与 pagefind.js 同目录发布） */
const BUNDLE_UI_SCRIPT = '/pagefind/pagefind-ui.js'
/** 检索 bundle 自带的默认 UI 样式，与 UI 脚本同版本 */
const BUNDLE_UI_CSS = '/pagefind/pagefind-ui.css'

/** 共享在途请求和成功结果。失败后等待用户重试，避免生命周期回调重复请求。 */
function retryableResource<T>(url: string, load: () => Promise<T>) {
    let request: Promise<T | null> | undefined
    let failed = false
    return (retry: boolean) => {
        if (request && !(retry && failed)) return request
        failed = false
        request = load().catch((error: unknown) => {
            failed = true
            console.error(`[site-search] failed to load ${url}:`, error)
            return null
        })
        return request
    }
}

const loadPagefindUI = retryableResource(
    BUNDLE_UI_SCRIPT,
    () =>
        new Promise<PagefindUIConstructor>((resolve, reject) => {
            // PagefindUI 是 IIFE。经典脚本可以重试同一 URL，避开浏览器缓存的模块加载失败。
            const script = document.createElement('script')
            script.src = BUNDLE_UI_SCRIPT
            script.onload = () => {
                script.remove()
                const constructor = (window as { PagefindUI?: PagefindUIConstructor }).PagefindUI
                if (constructor) resolve(constructor)
                else reject(new Error('window.PagefindUI missing after loading bundle script'))
            }
            script.onerror = () => {
                script.remove()
                reject(new Error('Script request failed'))
            }
            document.head.appendChild(script)
        })
)

const loadBundleUiCss = retryableResource(BUNDLE_UI_CSS, async () => {
    const response = await fetch(BUNDLE_UI_CSS)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return response.text()
})

function ensureBundleUiCss(css: string): void {
    // ClientRouter 会替换 head。用已缓存的 CSS 恢复原层叠，避免重新请求。
    if (document.head.querySelector('style[data-site-search-ui-css]')) return
    const style = document.createElement('style')
    style.dataset.siteSearchUiCss = ''
    style.textContent = `@layer starlight.core { ${css} }`
    document.head.appendChild(style)
}

class SiteSearchElement extends HTMLElement {
    private keydownListener: ((event: KeyboardEvent) => void) | null = null
    private pageLoadListener: (() => void) | null = null

    connectedCallback(): void {
        this.bindModalControls()
        this.initPagefindUI()
        // ClientRouter 导航可能保留本元素但清空其渲染内容（也可能整体替换元素）；
        // astro:page-load 在两种情况下都会触发，作为 UI 重建的兜底时机
        this.pageLoadListener = () => this.initPagefindUI()
        document.addEventListener('astro:page-load', this.pageLoadListener)
    }

    disconnectedCallback(): void {
        if (this.keydownListener) {
            window.removeEventListener('keydown', this.keydownListener)
            this.keydownListener = null
        }
        if (this.pageLoadListener) {
            document.removeEventListener('astro:page-load', this.pageLoadListener)
            this.pageLoadListener = null
        }
        document.body.toggleAttribute('data-search-modal-open', false)
    }

    private bindModalControls(): void {
        const openBtn = this.querySelector<HTMLButtonElement>('button[data-open-modal]')
        const closeBtn = this.querySelector<HTMLButtonElement>('button[data-close-modal]')
        const dialog = this.querySelector('dialog')
        const dialogFrame = this.querySelector('.dialog-frame')
        const retryBtn = this.querySelector<HTMLButtonElement>('[data-search-retry]')
        if (!openBtn || !closeBtn || !dialog || !dialogFrame) return

        const closeModal = () => dialog.close()

        let isNavigating = false
        /** 弹窗打开期间点击链接或弹窗外区域时关闭 */
        const onClick = (event: MouseEvent) => {
            const target = event.target as Element | null
            const isLink = Boolean(target?.closest('a[href]'))
            if (isLink) {
                isNavigating = true
                closeModal()
                return
            }
            if (target && document.body.contains(target) && !dialogFrame.contains(target)) {
                closeModal()
            }
        }

        const openModal = (event?: MouseEvent) => {
            isNavigating = false
            dialog.showModal()
            document.body.toggleAttribute('data-search-modal-open', true)
            const input = this.querySelector<HTMLInputElement>('.pagefind-ui__search-input')
            const visibleRetry = retryBtn?.closest('[hidden]') ? null : retryBtn
            const focusTarget = input ?? visibleRetry
            focusTarget?.focus()
            event?.stopPropagation()
            window.addEventListener('click', onClick)
        }

        openBtn.addEventListener('click', openModal)
        openBtn.disabled = false
        closeBtn.addEventListener('click', closeModal)
        if (retryBtn) {
            retryBtn.onclick = () => {
                const target = this.querySelector('#starlight__search')
                if (!target || retryBtn.getAttribute('aria-disabled') === 'true') return
                retryBtn.setAttribute('aria-disabled', 'true')
                void this.renderPagefindUI(target, true)
            }
        }

        dialog.addEventListener('close', () => {
            document.body.toggleAttribute('data-search-modal-open', false)
            window.removeEventListener('click', onClick)
            if (!isNavigating) {
                openBtn.focus()
            }
            isNavigating = false
        })

        // Ctrl/Cmd+K 切换弹窗；监听持有本实例引用，断开连接时一并移除。
        // key 大小写不敏感：真实键盘 Ctrl+K 给出 'k'，带 Shift 的组合键给出 'K'，
        // 两者都应触发（#289 之前由增强搜索的 toLowerCase 判断覆盖，现由本元素独占）。
        this.keydownListener = (event: KeyboardEvent) => {
            if (
                (event.metaKey === true || event.ctrlKey === true) &&
                event.key.toLowerCase() === 'k'
            ) {
                if (dialog.open) {
                    closeModal()
                } else {
                    openModal()
                }
                event.preventDefault()
            }
        }
        window.addEventListener('keydown', this.keydownListener)
    }

    private initPagefindUI(): void {
        if (import.meta.env.DEV) return
        const onIdle =
            window.requestIdleCallback ??
            ((callback: IdleRequestCallback) => setTimeout(callback, 1))
        onIdle(() => {
            const target = this.querySelector('#starlight__search')
            if (this.isConnected && target) void this.renderPagefindUI(target)
        })
    }

    private async renderPagefindUI(target: Element, retry = false): Promise<void> {
        const [PagefindUI, css] = await Promise.all([loadPagefindUI(retry), loadBundleUiCss(retry)])
        // 导航可能已替换容器。多个生命周期回调可共享请求，但只有第一个回调构造 UI。
        if (!this.isConnected || this.querySelector('#starlight__search') !== target) return
        if (css !== null) ensureBundleUiCss(css)
        if (target.querySelector('.pagefind-ui')) return

        const recovery = this.querySelector<HTMLElement>('[data-search-recovery]')
        const retryBtn = recovery?.querySelector<HTMLButtonElement>('[data-search-retry]')
        const openDialog = this.querySelector('dialog[open]')
        const activeElement = document.activeElement
        const moveFocus = openDialog && (activeElement === openDialog || activeElement === retryBtn)

        retryBtn?.removeAttribute('aria-disabled')
        const ready = PagefindUI !== null && css !== null
        if (recovery) recovery.hidden = ready
        if (!ready) {
            if (moveFocus) retryBtn?.focus()
            return
        }

        let translations: Record<string, string> = {}
        try {
            translations = JSON.parse(this.dataset.translations || '{}')
        } catch {
            /* 翻译数据损坏时退回 UI 内置文案 */
        }

        new PagefindUI({
            element: target,
            baseUrl: import.meta.env.BASE_URL,
            bundlePath: import.meta.env.BASE_URL.replace(/\/$/, '') + '/pagefind/',
            showImages: false,
            translations,
            showSubResults: true,
        })
        if (moveFocus) target.querySelector('input')?.focus()
    }
}

if (!customElements.get('site-search')) {
    customElements.define('site-search', SiteSearchElement)
}
