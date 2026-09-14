import { defineMiddleware } from 'astro:middleware'
import { injectNonceIntoHtml, pruneRouteCss } from './utils'

/**
 * 对 HTML 响应做后处理：
 * 1. 给 <script> 注入 nonce
 * 2. 按路由裁剪非当前 locale 的 CSS
 */
export const transformHtml = defineMiddleware(async (context, next) => {
    const response = await next()

    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('text/html')) {
        return response
    }

    const html = await response.text()
    const nonce = (context.locals as Record<string, unknown>).cspNonce as string | undefined
    const body = pruneRouteCss(injectNonceIntoHtml(html, nonce || ''), context.url.pathname)

    return new Response(body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
    })
})
