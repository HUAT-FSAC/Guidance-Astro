// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { initShareMenu, setupShareMenuLifecycle } from '../../src/utils/share-controller'
import * as shareModule from '../../src/utils/share'

describe('share-controller', () => {
    let container: HTMLElement

    beforeEach(() => {
        vi.useFakeTimers()
        container = document.createElement('div')
        container.innerHTML = `
            <button id="share-toggle-btn" aria-expanded="false">Share</button>
            <div id="share-menu" class="share-menu">
                <button class="native-share" data-share-action="native" style="display: none;">Native</button>
                <button data-share-action="copy">Copy</button>
                <button data-share-action="wechat">WeChat</button>
                <button data-share-action="twitter">Twitter</button>
                <button data-share-action="">Empty</button>
            </div>
            <div id="share-toast" class="share-toast"></div>
            <div id="qrcode-modal" class="qrcode-modal">
                <img id="qrcode-img" src="" alt="qrcode" />
                <button id="qrcode-close">Close</button>
            </div>
        `
        document.body.appendChild(container)
    })

    afterEach(() => {
        document.body.innerHTML = ''
        vi.restoreAllMocks()
        vi.useRealTimers()
    })

    it('returns a no-op if toggle button or menu is missing', () => {
        const emptyContainer = document.createElement('div')
        const cleanup = initShareMenu(emptyContainer)
        expect(typeof cleanup).toBe('function')
        cleanup()
    })

    it('shows native share button when canUseNativeShare is true', () => {
        vi.spyOn(shareModule, 'canUseNativeShare').mockReturnValue(true)
        initShareMenu(container)

        const nativeBtn = container.querySelector('.native-share') as HTMLElement
        expect(nativeBtn.style.display).toBe('flex')
    })

    it('toggles menu on click and updates aria-expanded', () => {
        initShareMenu(container)
        const toggleBtn = container.querySelector('#share-toggle-btn') as HTMLButtonElement
        const menu = container.querySelector('#share-menu') as HTMLElement

        toggleBtn.click()
        expect(menu.classList.contains('open')).toBe(true)
        expect(toggleBtn.getAttribute('aria-expanded')).toBe('true')

        toggleBtn.click()
        expect(menu.classList.contains('open')).toBe(false)
        expect(toggleBtn.getAttribute('aria-expanded')).toBe('false')
    })

    it('toggles menu on Enter or Space keydown', () => {
        initShareMenu(container)
        const toggleBtn = container.querySelector('#share-toggle-btn') as HTMLButtonElement
        const menu = container.querySelector('#share-menu') as HTMLElement

        toggleBtn.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
        expect(menu.classList.contains('open')).toBe(true)

        toggleBtn.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }))
        expect(menu.classList.contains('open')).toBe(false)

        toggleBtn.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }))
        expect(menu.classList.contains('open')).toBe(false)
    })

    it('closes menu when clicking outside container', () => {
        initShareMenu(container)
        const toggleBtn = container.querySelector('#share-toggle-btn') as HTMLButtonElement
        const menu = container.querySelector('#share-menu') as HTMLElement

        toggleBtn.click()
        expect(menu.classList.contains('open')).toBe(true)

        document.dispatchEvent(new MouseEvent('click'))
        expect(menu.classList.contains('open')).toBe(false)
    })

    it('closes menu and modal on Escape key', () => {
        initShareMenu(container)
        const toggleBtn = container.querySelector('#share-toggle-btn') as HTMLButtonElement
        const menu = container.querySelector('#share-menu') as HTMLElement
        const modal = container.querySelector('#qrcode-modal') as HTMLElement

        toggleBtn.click()
        modal.classList.add('show')

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
        expect(menu.classList.contains('open')).toBe(false)
        expect(modal.classList.contains('show')).toBe(false)
    })

    it('handles copy action and shows toast', async () => {
        vi.spyOn(shareModule, 'copyToClipboard').mockResolvedValue({
            success: true,
            message: '复制成功',
        })
        initShareMenu(container)

        const copyBtn = container.querySelector('[data-share-action="copy"]') as HTMLElement
        const toast = container.querySelector('#share-toast') as HTMLElement

        copyBtn.click()
        await vi.runAllTimersAsync()

        expect(toast.textContent).toBe('复制成功')
        expect(toast.classList.contains('show')).toBe(false) // hidden after 3000ms
    })

    it('handles copy failure and shows error toast', async () => {
        vi.spyOn(shareModule, 'copyToClipboard').mockResolvedValue({
            success: false,
            message: '复制失败',
        })
        initShareMenu(container)

        const copyBtn = container.querySelector('[data-share-action="copy"]') as HTMLElement
        const toast = container.querySelector('#share-toast') as HTMLElement

        copyBtn.click()
        await Promise.resolve()

        expect(toast.textContent).toBe('复制失败')
        expect(toast.className).toContain('error')
    })

    it('handles native share action', async () => {
        const nativeSpy = vi.spyOn(shareModule, 'nativeShare').mockResolvedValue({
            success: false,
            message: '分享出错',
        })
        initShareMenu(container)

        const nativeBtn = container.querySelector('[data-share-action="native"]') as HTMLElement
        const toast = container.querySelector('#share-toast') as HTMLElement

        nativeBtn.click()
        await Promise.resolve()

        expect(nativeSpy).toHaveBeenCalled()
        expect(toast.textContent).toBe('分享出错')
    })

    it('does not show toast if native share was cancelled', async () => {
        vi.spyOn(shareModule, 'nativeShare').mockResolvedValue({
            success: false,
            message: '分享已取消',
        })
        initShareMenu(container)

        const nativeBtn = container.querySelector('[data-share-action="native"]') as HTMLElement
        const toast = container.querySelector('#share-toast') as HTMLElement

        nativeBtn.click()
        await Promise.resolve()

        expect(toast.textContent).toBe('')
    })

    it('handles wechat share action by opening QR code modal', async () => {
        vi.spyOn(shareModule, 'generateQRCodeDataUrl').mockResolvedValue(
            'data:image/png;base64,mock'
        )
        initShareMenu(container)

        const wechatBtn = container.querySelector('[data-share-action="wechat"]') as HTMLElement
        const modal = container.querySelector('#qrcode-modal') as HTMLElement
        const img = container.querySelector('#qrcode-img') as HTMLImageElement

        wechatBtn.click()
        await Promise.resolve()

        expect(modal.classList.contains('show')).toBe(true)
        expect(img.src).toBe('data:image/png;base64,mock')
    })

    it('handles platform share window action', () => {
        const openSpy = vi.spyOn(shareModule, 'openShareWindow').mockReturnValue({
            success: false,
            message: '无法打开分享窗口',
        })
        initShareMenu(container)

        const twitterBtn = container.querySelector('[data-share-action="twitter"]') as HTMLElement
        const toast = container.querySelector('#share-toast') as HTMLElement

        twitterBtn.click()
        expect(openSpy).toHaveBeenCalledWith('twitter', expect.any(Object))
        expect(toast.textContent).toBe('无法打开分享窗口')
    })

    it('ignores option click without share action', () => {
        initShareMenu(container)
        const emptyBtn = container.querySelector('[data-share-action=""]') as HTMLElement
        emptyBtn.click()
    })

    it('closes modal on backdrop click and close button click', () => {
        initShareMenu(container)
        const modal = container.querySelector('#qrcode-modal') as HTMLElement
        const closeBtn = container.querySelector('#qrcode-close') as HTMLElement

        modal.classList.add('show')
        closeBtn.click()
        expect(modal.classList.contains('show')).toBe(false)

        modal.classList.add('show')
        modal.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        expect(modal.classList.contains('show')).toBe(false)
    })

    it('cleans up event listeners', () => {
        const cleanup = initShareMenu(container)
        const toggleBtn = container.querySelector('#share-toggle-btn') as HTMLButtonElement
        const menu = container.querySelector('#share-menu') as HTMLElement

        cleanup()

        toggleBtn.click()
        expect(menu.classList.contains('open')).toBe(false)
    })

    it('setupShareMenuLifecycle initializes properly', () => {
        expect(() => setupShareMenuLifecycle('#non-existent')).not.toThrow()
    })
})
