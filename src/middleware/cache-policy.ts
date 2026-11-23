import { defineMiddleware } from 'astro:middleware'

/**
 * 普通 HTML 使用私有缓存策略，错误 HTML 禁止存储
 * 必须在 security-headers 之后执行（覆盖 applyStandardHeaders 设置的默认 Cache-Control）
 */
export const enforceHtmlCachePrivacy = defineMiddleware(async (_context, next) => {
    const response = await next()

    const isHtml = response.headers.get('content-type')?.includes('text/html')
    const mayRenderErrorPage =
        response.body === null && (response.status === 404 || response.status === 500)
    // Astro 保留原响应的头。空 404/500 也需在框架填入错误页之前禁止缓存。
    if (mayRenderErrorPage || (isHtml && response.status >= 400)) {
        response.headers.set('Cache-Control', 'private, no-store')
    } else if (isHtml) {
        response.headers.set('Cache-Control', 'private, no-cache, must-revalidate')
    }

    return response
})
