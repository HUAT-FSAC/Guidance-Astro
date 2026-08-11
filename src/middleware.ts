import { defineMiddleware } from 'astro:middleware'
import { applyStandardHeaders, generateNonce } from './config/security'

// 给 HTML 中所有 <script> 标签注入 nonce 属性（跳过已带 nonce 的）
function injectNonceIntoHtml(html: string, nonce: string): string {
    return html.replace(/<script(?=[\s>])(?![^>]*\bnonce=)/g, `<script nonce="${nonce}"`)
}

export const onRequest = defineMiddleware(async (context, next) => {
    const { pathname } = context.url

    // 生成 CSP nonce（每个请求唯一）
    const nonce = generateNonce()

    // 将 nonce 存储在 locals 中，供页面内联脚本使用
    ;(context.locals as Record<string, unknown>).cspNonce = nonce

    const response = await next()

    const contentType = response.headers.get('content-type') || ''

    // 页面 HTML 注入 nonce 才能通过严格 CSP；nonce 每请求不同，禁止 CDN/共享缓存
    if (contentType.includes('text/html')) {
        const html = await response.text()
        const body = injectNonceIntoHtml(html, nonce)
        const secureResponse = applyStandardHeaders(
            new Response(body, {
                status: response.status,
                statusText: response.statusText,
            }),
            pathname,
            nonce
        )
        secureResponse.headers.set('Cache-Control', 'private, no-cache, must-revalidate')
        return secureResponse
    }

    return applyStandardHeaders(response, pathname, nonce)
})
