/**
 * 分享工具模块
 * 提供社交媒体分享、链接复制和 Web Share API 支持
 *
 * @example
 * ```typescript
 * import { copyToClipboard, generateShareUrl, nativeShare } from '../utils/share';
 *
 * // 复制链接
 * await copyToClipboard(window.location.href);
 *
 * // 生成 Twitter 分享链接
 * const twitterUrl = generateShareUrl('twitter', url, title);
 * ```
 */

/**
 * 分享平台类型
 */
export type SharePlatform =
    'twitter' | 'weibo' | 'wechat' | 'linkedin' | 'facebook' | 'telegram' | 'email'

/**
 * 分享数据接口
 */
export interface ShareData {
    url: string
    title: string
    description?: string
    image?: string
}

/**
 * 分享结果接口
 */
export interface ShareResult {
    success: boolean
    message: string
    platform?: SharePlatform | 'native' | 'clipboard'
}

/**
 * 检测是否支持 Web Share API
 */
export function canUseNativeShare(): boolean {
    return (
        typeof navigator !== 'undefined' &&
        typeof navigator.share === 'function' &&
        typeof navigator.canShare === 'function'
    )
}

/**
 * 使用原生 Web Share API 分享
 * @param data - 分享数据
 * @returns 分享结果
 */
export async function nativeShare(data: ShareData): Promise<ShareResult> {
    if (!canUseNativeShare()) {
        return {
            success: false,
            message: '当前浏览器不支持原生分享',
        }
    }

    try {
        await navigator.share({
            title: data.title,
            text: data.description || data.title,
            url: data.url,
        })

        return {
            success: true,
            message: '分享成功',
            platform: 'native',
        }
    } catch (error) {
        if ((error as Error).name === 'AbortError') {
            return {
                success: false,
                message: '分享已取消',
            }
        }
        return {
            success: false,
            message: '分享失败',
        }
    }
}

/**
 * 复制文本到剪贴板
 * @param text - 要复制的文本
 * @returns 分享结果
 */
export async function copyToClipboard(text: string): Promise<ShareResult> {
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text)
        } else {
            // 降级方案：使用 execCommand
            const textArea = document.createElement('textarea')
            textArea.value = text
            textArea.style.position = 'fixed'
            textArea.style.left = '-9999px'
            document.body.appendChild(textArea)
            textArea.select()
            document.execCommand('copy')
            document.body.removeChild(textArea)
        }

        return {
            success: true,
            message: '链接已复制到剪贴板',
            platform: 'clipboard',
        }
    } catch {
        return {
            success: false,
            message: '复制失败，请手动复制',
        }
    }
}

/**
 * 生成社交媒体分享链接
 * @param platform - 分享平台
 * @param data - 分享数据
 * @returns 分享链接
 */
export function generateShareUrl(platform: SharePlatform, data: ShareData): string {
    const { url, title, description } = data
    const encodedUrl = encodeURIComponent(url)
    const encodedTitle = encodeURIComponent(title)
    const encodedDesc = encodeURIComponent(description || title)

    const shareUrls: Record<SharePlatform, string> = {
        twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
        weibo: `https://service.weibo.com/share/share.php?url=${encodedUrl}&title=${encodedTitle}`,
        wechat: url, // 微信需要生成二维码
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
        email: `mailto:?subject=${encodedTitle}&body=${encodedDesc}%0A%0A${encodedUrl}`,
    }

    return shareUrls[platform]
}

/**
 * 打开分享窗口
 * @param platform - 分享平台
 * @param data - 分享数据
 * @returns 分享结果
 */
export function openShareWindow(platform: SharePlatform, data: ShareData): ShareResult {
    const url = generateShareUrl(platform, data)

    if (platform === 'email') {
        window.location.href = url
        return {
            success: true,
            message: '正在打开邮件客户端...',
            platform,
        }
    }

    if (platform === 'wechat') {
        return {
            success: true,
            message: '请使用微信扫描二维码分享',
            platform,
        }
    }

    // 打开弹窗
    const width = 600
    const height = 400
    const left = (window.innerWidth - width) / 2
    const top = (window.innerHeight - height) / 2

    const popup = window.open(
        url,
        `share_${platform}`,
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes`
    )

    if (popup) {
        popup.focus()
        return {
            success: true,
            message: '分享窗口已打开',
            platform,
        }
    }

    return {
        success: false,
        message: '无法打开分享窗口，请检查弹窗拦截设置',
        platform,
    }
}

/**
 * 获取当前页面的分享数据
 * @returns 分享数据
 */
export function getPageShareData(): ShareData {
    if (typeof document === 'undefined') {
        return { url: '', title: '' }
    }

    const title =
        document.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
        document.title ||
        'HUAT FSAC'

    const description =
        document.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
        document.querySelector('meta[name="description"]')?.getAttribute('content') ||
        ''

    const image = document.querySelector('meta[property="og:image"]')?.getAttribute('content') || ''

    return {
        url: window.location.href,
        title,
        description,
        image,
    }
}

/**
 * 生成微信分享二维码 Data URL（客户端本地生成，无第三方请求）
 * @param url - 要分享的链接
 * @param size - 二维码尺寸
 * @returns 二维码 Data URL
 */
export async function generateQRCodeDataUrl(url: string, size: number = 200): Promise<string> {
    const QRCode = await import('qrcode')
    return QRCode.toDataURL(url, { width: size, margin: 1 })
}

/**
 * @deprecated 使用 generateQRCodeDataUrl 替代，避免向第三方泄露 URL
 */
export function generateQRCodeUrl(url: string, size: number = 200): string {
    const encodedUrl = encodeURIComponent(url)
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedUrl}`
}

/**
 * 分享平台配置
 */
export const SHARE_PLATFORMS = [
    { id: 'clipboard' as const, name: '复制链接', icon: '📋', color: '#6b7280' },
    { id: 'twitter' as const, name: 'Twitter', icon: '𝕏', color: '#000000' },
    { id: 'weibo' as const, name: '微博', icon: '🔴', color: '#e6162d' },
    { id: 'wechat' as const, name: '微信', icon: '💬', color: '#07c160' },
    { id: 'telegram' as const, name: 'Telegram', icon: '✈️', color: '#0088cc' },
    { id: 'email' as const, name: '邮件', icon: '📧', color: '#ea4335' },
] as const
