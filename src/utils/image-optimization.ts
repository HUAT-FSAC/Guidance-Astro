/**
 * 图片优化工具模块
 * 统一处理外部图片和本地图片的优化
 */

// 默认降级图片（可以是站点 logo 或占位图）
const DEFAULT_FALLBACK_IMAGE = '/favicon.png'

/**
 * 验证 URL 是否有效
 */
function isValidUrl(url: string): boolean {
    try {
        new URL(url)
        return true
    } catch {
        return false
    }
}

/**
 * 优化外部图片 URL（支持多种 CDN）
 * @param url - 原始图片 URL
 * @param width - 目标宽度
 * @param quality - 图片质量 (0-100)
 * @param format - 输出格式 (webp/avif/auto)
 * @returns 优化后的 URL
 */
export function optimizeExternalImage(
    url: string,
    width: number = 1920,
    quality: number = 85,
    format: 'webp' | 'avif' | 'auto' = 'webp'
): string {
    // 空值检查
    if (!url || typeof url !== 'string') {
        console.warn('[image-optimization] 无效的图片 URL，使用默认图片')
        return DEFAULT_FALLBACK_IMAGE
    }

    // URL 验证
    if (!isValidUrl(url) && !url.startsWith('/')) {
        console.warn('[image-optimization] URL 格式无效:', url)
        return DEFAULT_FALLBACK_IMAGE
    }

    try {
        // 本地图片 - 直接返回
        if (url.startsWith('/') || url.startsWith('./')) {
            return url
        }

        // Unsplash 优化
        if (url.includes('unsplash.com')) {
            const base = url.split('?')[0]
            return `${base}?fm=${format === 'auto' ? 'webp' : format}&w=${width}&q=${quality}`
        }

        // Cloudinary 优化
        if (url.includes('cloudinary.com') || url.includes('res.cloudinary.com')) {
            const formatParam = format === 'auto' ? 'f_auto' : `f_${format}`
            return url.replace('/upload/', `/upload/${formatParam},w_${width},q_${quality}/`)
        }

        // Imgix 优化
        if (url.includes('imgix.net')) {
            const separator = url.includes('?') ? '&' : '?'
            const formatParam = format === 'auto' ? 'auto=format' : `fm=${format}`
            return `${url}${separator}${formatParam}&w=${width}&q=${quality}`
        }

        // Pexels 优化
        if (url.includes('pexels.com') || url.includes('images.pexels.com')) {
            const separator = url.includes('?') ? '&' : '?'
            return `${url}${separator}w=${width}&auto=compress&cs=tinysrgb`
        }

        // GitHub 头像优化
        if (url.includes('avatars.githubusercontent.com')) {
            const separator = url.includes('?') ? '&' : '?'
            return `${url}${separator}s=${width}`
        }

        // 其他外部图片 - 返回原 URL
        return url
    } catch (error) {
        console.error('[image-optimization] 图片优化失败:', error, 'URL:', url)
        return DEFAULT_FALLBACK_IMAGE
    }
}

/**
 * 生成响应式图片的 srcset
 * @param url - 原始图片 URL
 * @param widths - 宽度数组
 * @returns srcset 字符串
 */
export function generateSrcSet(url: string, widths: number[] = [400, 800, 1200, 1920]): string {
    if (!url || typeof url !== 'string') {
        return ''
    }

    try {
        return widths
            .map((width) => {
                try {
                    return `${optimizeExternalImage(url, width)} ${width}w`
                } catch (e) {
                    console.warn(`[image-optimization] 生成 srcset 失败 (width: ${width}):`, e)
                    return null
                }
            })
            .filter(Boolean)
            .join(', ')
    } catch (error) {
        console.error('[image-optimization] 生成 srcset 失败:', error)
        return ''
    }
}

/**
 * 获取图片加载策略
 * @param isAboveFold - 是否在首屏
 * @returns loading 属性值
 */
export function getImageLoadingStrategy(isAboveFold: boolean): 'lazy' | 'eager' {
    return isAboveFold ? 'eager' : 'lazy'
}

/**
 * 获取图片优先级
 * @param isAboveFold - 是否在首屏
 * @returns fetchpriority 属性值
 */
export function getImageFetchPriority(isAboveFold: boolean): 'high' | 'auto' | 'low' {
    return isAboveFold ? 'high' : 'auto'
}

/**
 * 生成图片 alt 文本
 * @param title - 图片标题
 * @param context - 图片上下文描述
 * @returns alt 文本
 */
export function generateAltText(title: string, context: string = ''): string {
    if (!title || typeof title !== 'string') {
        return '图片'
    }
    return context ? `${title} - ${context}` : title
}

/**
 * 处理图片加载错误
 * @param imgElement - 图片元素
 * @param fallbackUrl - 降级图片 URL
 */
export function handleImageError(
    imgElement: HTMLImageElement,
    fallbackUrl: string = DEFAULT_FALLBACK_IMAGE
): void {
    if (imgElement.src !== fallbackUrl && fallbackUrl !== window.location.href) {
        console.warn('[image-optimization] 图片加载失败，使用降级图片:', imgElement.src)
        imgElement.src = fallbackUrl
        imgElement.onerror = null // 防止无限循环
    }
}

/**
 * 预加载关键图片
 * @param urls - 图片 URL 数组
 */
export function preloadImages(urls: string[]): void {
    if (typeof window === 'undefined') return

    urls.forEach((url) => {
        if (!url || typeof url !== 'string') return

        try {
            const img = new Image()
            img.src = url
        } catch (error) {
            console.warn('[image-optimization] 预加载图片失败:', url, error)
        }
    })
}
