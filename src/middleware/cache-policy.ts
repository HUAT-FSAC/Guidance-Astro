import { defineMiddleware } from 'astro:middleware'

/**
 * 强制 HTML 响应使用私有的 no-cache 策略
 * 必须在 security-headers 之后执行（覆盖 applyStandardHeaders 设置的默认 Cache-Control）
 */
export const enforceHtmlCachePrivacy = defineMiddleware(async (context, next) => {
    const response = await next()

    const contentType = response.headers.get('content-type') || ''
    if (contentType.includes('text/html')) {
        response.headers.set('Cache-Control', 'private, no-cache, must-revalidate')
    }

    return response
})
