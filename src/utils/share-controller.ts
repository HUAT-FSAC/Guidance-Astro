import { setupComponentLifecycle } from './component-init'
import {
    canUseNativeShare,
    copyToClipboard,
    generateQRCodeDataUrl,
    getPageShareData,
    nativeShare,
    openShareWindow,
    type SharePlatform,
} from './share'

export interface ShareMenuOptions {
    toggleSelector?: string
    menuSelector?: string
    toastSelector?: string
    modalSelector?: string
    modalImageSelector?: string
    modalCloseSelector?: string
    nativeShareSelector?: string
    optionSelector?: string
}

export function initShareMenu(container: HTMLElement, options: ShareMenuOptions = {}): () => void {
    const {
        toggleSelector = '#share-toggle-btn',
        menuSelector = '#share-menu',
        toastSelector = '#share-toast',
        modalSelector = '#qrcode-modal',
        modalImageSelector = '#qrcode-img',
        modalCloseSelector = '#qrcode-close',
        nativeShareSelector = '.native-share',
        optionSelector = '[data-share-action]',
    } = options

    const toggleBtn = container.querySelector(toggleSelector) as HTMLButtonElement | null
    const menu = container.querySelector(menuSelector) as HTMLElement | null
    const toast = container.querySelector(toastSelector) as HTMLElement | null
    const qrcodeModal = container.querySelector(modalSelector) as HTMLElement | null
    const qrcodeImg = container.querySelector(modalImageSelector) as HTMLImageElement | null
    const qrcodeClose = container.querySelector(modalCloseSelector) as HTMLButtonElement | null
    const nativeShareBtn = container.querySelector(nativeShareSelector) as HTMLButtonElement | null
    const shareOptions = Array.from(container.querySelectorAll<HTMLElement>(optionSelector))

    if (!toggleBtn || !menu) {
        return () => {}
    }

    if (canUseNativeShare() && nativeShareBtn) {
        nativeShareBtn.style.display = 'flex'
    }

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        if (!toast) {
            return
        }

        toast.textContent = message
        toast.className = `share-toast ${type} show`

        window.setTimeout(() => {
            toast.classList.remove('show')
        }, 3000)
    }

    const closeMenu = () => {
        menu.classList.remove('open')
        toggleBtn.setAttribute('aria-expanded', 'false')
    }

    const toggleMenu = () => {
        const isOpen = menu.classList.toggle('open')
        toggleBtn.setAttribute('aria-expanded', String(isOpen))
    }

    const handleDocumentClick = (event: MouseEvent) => {
        if (!container.contains(event.target as Node)) {
            closeMenu()
        }
    }

    const handleEsc = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            closeMenu()
            qrcodeModal?.classList.remove('show')
        }
    }

    const handleToggleClick = (event: MouseEvent) => {
        event.stopPropagation()
        toggleMenu()
    }

    const handleToggleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            toggleMenu()
        }
    }

    const handleShareAction = async (event: Event) => {
        const action = (event.currentTarget as HTMLElement).dataset.shareAction
        if (!action) {
            return
        }

        const shareData = getPageShareData()

        switch (action) {
            case 'copy': {
                const result = await copyToClipboard(shareData.url)
                showToast(result.message, result.success ? 'success' : 'error')
                break
            }
            case 'native': {
                const result = await nativeShare(shareData)
                if (!result.success && result.message !== '分享已取消') {
                    showToast(result.message, 'error')
                }
                break
            }
            case 'wechat': {
                if (qrcodeImg) {
                    qrcodeImg.src = await generateQRCodeDataUrl(shareData.url, 200)
                }
                qrcodeModal?.classList.add('show')
                break
            }
            default: {
                const result = openShareWindow(action as SharePlatform, shareData)
                if (!result.success) {
                    showToast(result.message, 'error')
                }
            }
        }

        closeMenu()
    }

    const handleModalClick = (event: MouseEvent) => {
        if (event.target === qrcodeModal) {
            qrcodeModal?.classList.remove('show')
        }
    }

    const handleModalClose = () => {
        qrcodeModal?.classList.remove('show')
    }

    toggleBtn.addEventListener('click', handleToggleClick)
    toggleBtn.addEventListener('keydown', handleToggleKeyDown)
    document.addEventListener('click', handleDocumentClick)
    document.addEventListener('keydown', handleEsc)
    qrcodeClose?.addEventListener('click', handleModalClose)
    qrcodeModal?.addEventListener('click', handleModalClick)

    shareOptions.forEach((option) => {
        option.addEventListener('click', handleShareAction)
    })

    return () => {
        toggleBtn.removeEventListener('click', handleToggleClick)
        toggleBtn.removeEventListener('keydown', handleToggleKeyDown)
        document.removeEventListener('click', handleDocumentClick)
        document.removeEventListener('keydown', handleEsc)
        qrcodeClose?.removeEventListener('click', handleModalClose)
        qrcodeModal?.removeEventListener('click', handleModalClick)

        shareOptions.forEach((option) => {
            option.removeEventListener('click', handleShareAction)
        })
    }
}

export function setupShareMenuLifecycle(selector: string, options: ShareMenuOptions = {}): void {
    setupComponentLifecycle(selector, (element) => initShareMenu(element, options))
}
