/**
 * 图片懒加载工具模块
 * 使用 Intersection Observer 实现高性能图片懒加载
 */

/**
 * 懒加载配置选项
 */
export interface LazyImageOptions {
    /** 根元素（默认为 viewport） */
    root?: Element | null
    /** 根元素边距 */
    rootMargin?: string
    /** 触发阈值 */
    threshold?: number | number[]
    /** 加载前回调 */
    onLoad?: (img: HTMLImageElement) => void
    /** 加载错误回调 */
    onError?: (img: HTMLImageElement) => void
    /** 启用 blur-up 效果 */
    enableBlurUp?: boolean
}

/**
 * 默认配置
 */
const defaultOptions: LazyImageOptions = {
    root: null,
    rootMargin: '50px 0px',
    threshold: 0.01,
    enableBlurUp: true,
}

/**
 * 创建懒加载观察器
 * @param options - 配置选项
 * @returns cleanup 函数
 */
export function createLazyImageObserver(options: LazyImageOptions = {}): () => void {
    const config = { ...defaultOptions, ...options }

    // 检查浏览器支持
    if (typeof IntersectionObserver === 'undefined') {
        // 降级处理：立即加载所有图片
        document.querySelectorAll<HTMLImageElement>('img[data-src]').forEach((img) => {
            loadImage(img, config)
        })
        return () => {}
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const img = entry.target as HTMLImageElement
                    loadImage(img, config)
                    observer.unobserve(img)
                }
            })
        },
        {
            root: config.root,
            rootMargin: config.rootMargin,
            threshold: config.threshold,
        }
    )

    // 观察所有带 data-src 属性的图片
    document.querySelectorAll<HTMLImageElement>('img[data-src]').forEach((img) => {
        observer.observe(img)
    })

    // 返回清理函数
    return () => {
        observer.disconnect()
    }
}

/**
 * 加载单个图片
 * @param img - 图片元素
 * @param options - 配置选项
 */
function loadImage(img: HTMLImageElement, options: LazyImageOptions): void {
    const src = img.dataset.src
    const srcset = img.dataset.srcset

    if (!src) return

    // 添加加载中状态
    img.classList.add('lazy-loading')

    // 预加载图片
    const tempImage = new Image()

    tempImage.onload = () => {
        // 设置真实 src
        img.src = src
        if (srcset) {
            img.srcset = srcset
        }

        // 移除 data 属性
        delete img.dataset.src
        delete img.dataset.srcset

        // 更新状态类
        img.classList.remove('lazy-loading')
        img.classList.add('lazy-loaded')

        // 触发回调
        options.onLoad?.(img)
    }

    tempImage.onerror = () => {
        img.classList.remove('lazy-loading')
        img.classList.add('lazy-error')
        options.onError?.(img)
    }

    tempImage.src = src
}

/**
 * 生成 blur-up 占位符样式
 * @returns CSS 样式字符串
 */
export function getBlurUpStyles(): string {
    return `
        img[data-src] {
            filter: blur(10px);
            transition: filter 0.3s ease-out;
        }
        
        img.lazy-loaded {
            filter: blur(0);
        }
        
        img.lazy-loading {
            opacity: 0.7;
        }
        
        img.lazy-error {
            opacity: 0.5;
            filter: grayscale(100%);
        }
    `
}

/**
 * 初始化懒加载（用于页面加载和 SPA 导航）
 * @param options - 配置选项
 */
export function initLazyImages(options: LazyImageOptions = {}): () => void {
    let cleanup = createLazyImageObserver(options)

    // Astro 页面导航时重新初始化
    const handlePageLoad = () => {
        cleanup()
        cleanup = createLazyImageObserver(options)
    }

    document.addEventListener('astro:page-load', handlePageLoad)

    // 返回完整清理函数
    return () => {
        cleanup()
        document.removeEventListener('astro:page-load', handlePageLoad)
    }
}
