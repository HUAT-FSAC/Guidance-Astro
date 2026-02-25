/**
 * 全局错误处理工具
 * 提供统一的错误捕获、报告和处理机制
 */

/**
 * 错误类型
 */
export enum ErrorType {
    COMPONENT_ERROR = 'COMPONENT_ERROR',
    IMAGE_ERROR = 'IMAGE_ERROR',
    SCRIPT_ERROR = 'SCRIPT_ERROR',
    NETWORK_ERROR = 'NETWORK_ERROR',
}

/**
 * 错误信息接口
 */
export interface ErrorInfo {
    type: ErrorType
    message: string
    stack?: string
    component?: string
    timestamp: number
    userAgent?: string
    url?: string
}

/**
 * 错误处理器类型
 */
export type ErrorHandler = (error: ErrorInfo) => void

/**
 * 错误处理器注册表
 */
const errorHandlers = new Map<ErrorType, Set<ErrorHandler>>()

/**
 * 错误历史记录（用于调试）
 */
const errorHistory: ErrorInfo[] = []
const MAX_ERROR_HISTORY = 50

/**
 * 注册错误处理器
 * @param type - 错误类型
 * @param handler - 错误处理器
 */
export function registerErrorHandler(type: ErrorType, handler: ErrorHandler): () => void {
    if (!errorHandlers.has(type)) {
        errorHandlers.set(type, new Set())
    }

    const handlers = errorHandlers.get(type)!
    handlers.add(handler)

    return () => {
        handlers.delete(handler)
    }
}

/**
 * 触发错误
 * @param error - 错误信息
 */
export function triggerError(error: ErrorInfo): void {
    const handlers = errorHandlers.get(error.type)
    if (handlers) {
        handlers.forEach((handler) => {
            try {
                handler(error)
            } catch (e) {
                console.error('Error handler failed:', e)
            }
        })
    }

    // 记录错误历史
    errorHistory.push(error)
    if (errorHistory.length > MAX_ERROR_HISTORY) {
        errorHistory.shift()
    }

    // 默认日志
    console.error(`[${error.type}]`, error.message, error)
}

/**
 * 创建错误信息
 * @param type - 错误类型
 * @param message - 错误消息
 * @param component - 组件名称
 * @param error - 原始错误对象
 * @returns 错误信息
 */
export function createErrorInfo(
    type: ErrorType,
    message: string,
    component?: string,
    error?: Error
): ErrorInfo {
    return {
        type,
        message,
        stack: error?.stack,
        component,
        timestamp: Date.now(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
    }
}

/**
 * 包装异步函数，自动捕获错误
 * @param fn - 异步函数
 * @param component - 组件名称
 * @returns 包装后的函数
 */
export function wrapAsync<T extends (...args: unknown[]) => Promise<unknown>>(
    fn: T,
    component?: string
): T {
    return (async (...args: Parameters<T>) => {
        try {
            return await fn(...args)
        } catch (error) {
            const errorInfo = createErrorInfo(
                ErrorType.COMPONENT_ERROR,
                error instanceof Error ? error.message : String(error),
                component,
                error instanceof Error ? error : undefined
            )
            triggerError(errorInfo)
            throw error
        }
    }) as T
}

/**
 * 包装同步函数，自动捕获错误
 * @param fn - 同步函数
 * @param component - 组件名称
 * @returns 包装后的函数
 */
export function wrapSync<T extends (...args: unknown[]) => unknown>(fn: T, component?: string): T {
    return ((...args: Parameters<T>): ReturnType<T> => {
        try {
            return fn(...args) as ReturnType<T>
        } catch (error) {
            const errorInfo = createErrorInfo(
                ErrorType.COMPONENT_ERROR,
                error instanceof Error ? error.message : String(error),
                component,
                error instanceof Error ? error : undefined
            )
            triggerError(errorInfo)
            throw error
        }
    }) as T
}

/**
 * 获取错误历史
 * @returns 错误历史记录
 */
export function getErrorHistory(): ErrorInfo[] {
    return [...errorHistory]
}

/**
 * 清除错误历史
 */
export function clearErrorHistory(): void {
    errorHistory.length = 0
}

/**
 * 设置全局错误处理器
 */
export function setupGlobalErrorHandlers(): void {
    if (typeof window === 'undefined') return

    // 全局错误处理
    window.addEventListener('error', (event) => {
        const errorInfo = createErrorInfo(
            ErrorType.SCRIPT_ERROR,
            event.message || 'Unknown error',
            'Global',
            event.error
        )
        triggerError(errorInfo)
    })

    // 未处理的 Promise 拒绝
    window.addEventListener('unhandledrejection', (event) => {
        const errorInfo = createErrorInfo(
            ErrorType.SCRIPT_ERROR,
            event.reason instanceof Error ? event.reason.message : String(event.reason),
            'Global',
            event.reason instanceof Error ? event.reason : undefined
        )
        triggerError(errorInfo)
    })
}

/**
 * 图片加载错误处理
 * @param img - 图片元素
 * @param fallbackSrc - 备用图片 URL
 */
export function handleImageError(img: HTMLImageElement, fallbackSrc?: string): void {
    const errorInfo = createErrorInfo(
        ErrorType.IMAGE_ERROR,
        `Failed to load image: ${img.src}`,
        'Image',
        new Error(`Image load failed: ${img.src}`)
    )
    triggerError(errorInfo)

    if (fallbackSrc && img.src !== fallbackSrc) {
        img.src = fallbackSrc
    } else {
        img.style.display = 'none'
        img.alt = '图片加载失败'
    }
}

/**
 * 创建安全的图片加载器
 * @param src - 图片 URL
 * @param fallbackSrc - 备用图片 URL
 * @param onLoad - 加载成功回调
 * @param onError - 加载失败回调
 */
export function createSafeImageLoader(
    src: string,
    fallbackSrc?: string,
    onLoad?: () => void,
    onError?: () => void
): HTMLImageElement {
    const img = new Image()

    img.onload = () => {
        if (onLoad) onLoad()
    }

    img.onerror = () => {
        handleImageError(img, fallbackSrc)
        if (onError) onError()
    }

    img.src = src

    return img
}
