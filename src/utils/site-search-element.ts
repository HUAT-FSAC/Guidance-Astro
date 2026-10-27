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

let uiConstructorPromise: Promise<PagefindUIConstructor | null> | null = null
let uiCssInjected = false

/** 加载 bundle 自带的 PagefindUI（IIFE，挂到 window.PagefindUI），失败时返回 null 并记录 */
function loadPagefindUI(): Promise<PagefindUIConstructor | null> {
    uiConstructorPromise ??= (async () => {
        try {
            await import(/* @vite-ignore */ BUNDLE_UI_SCRIPT)
            const constructor = (window as { PagefindUI?: PagefindUIConstructor }).PagefindUI
            if (!constructor)
                throw new Error('window.PagefindUI missing after loading bundle script')
            return constructor
        } catch (error) {
            console.error('[site-search] failed to load Pagefind UI from search bundle:', error)
            return null
        }
    })()
    return uiConstructorPromise
}

/** 把 bundle 的 UI 样式包进 starlight.core 层注入（与上游 @import 同层，保证站点覆盖规则仍然生效） */
async function injectBundleUiCss(): Promise<void> {
    if (uiCssInjected) return
    uiCssInjected = true
    try {
        const response = await fetch(BUNDLE_UI_CSS)
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const css = await response.text()
        const style = document.createElement('style')
        style.dataset.siteSearchUiCss = ''
        style.textContent = `@layer starlight.core { ${css} }`
        document.head.appendChild(style)
    } catch (error) {
        console.error('[site-search] failed to load Pagefind UI stylesheet:', error)
    }
}

class SiteSearchElement extends HTMLElement {
    private keydownListener: ((event: KeyboardEvent) => void) | null = null
    private pageLoadListener: (() => void) | null = null

    connectedCallback(): void {
        this.bindModalControls()
        void this.initPagefindUI()
        // ClientRouter 导航可能保留本元素但清空其渲染内容（也可能整体替换元素）；
        // astro:page-load 在两种情况下都会触发，作为 UI 重建的兜底时机
        this.pageLoadListener = () => void this.initPagefindUI()
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
            this.querySelector('input')?.focus()
            event?.stopPropagation()
            window.addEventListener('click', onClick)
        }

        openBtn.addEventListener('click', openModal)
        openBtn.disabled = false
        closeBtn.addEventListener('click', closeModal)

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

    private async initPagefindUI(): Promise<void> {
        if (import.meta.env.DEV) return
        const target = this.querySelector('#starlight__search')
        if (!target || target.querySelector('.pagefind-ui')) return

        void injectBundleUiCss()
        const onIdle =
            window.requestIdleCallback ??
            ((callback: IdleRequestCallback) => setTimeout(callback, 1))
        onIdle(async () => {
            // 导航可能已让本实例脱离文档； detached 容器不值得初始化
            if (!this.isConnected) return
            const freshTarget = this.querySelector('#starlight__search')
            if (!freshTarget || freshTarget.querySelector('.pagefind-ui')) return
            const PagefindUI = await loadPagefindUI()
            // connectedCallback 与 astro:page-load 可同时等待同一个脚本；
            // await 后容器可能已替换，或另一回调已完成初始化。检查与构造必须同步相邻。
            if (
                !PagefindUI ||
                !this.isConnected ||
                this.querySelector('#starlight__search') !== freshTarget ||
                freshTarget.querySelector('.pagefind-ui')
            )
                return

            let translations: Record<string, string> = {}
            try {
                translations = JSON.parse(this.dataset.translations || '{}')
            } catch {
                /* 翻译数据损坏时退回 UI 内置文案 */
            }

            new PagefindUI({
                element: freshTarget,
                baseUrl: import.meta.env.BASE_URL,
                bundlePath: import.meta.env.BASE_URL.replace(/\/$/, '') + '/pagefind/',
                showImages: false,
                translations,
                showSubResults: true,
            })
        })
    }
}

if (!customElements.get('site-search')) {
    customElements.define('site-search', SiteSearchElement)
}
