import { defineMiddleware } from 'astro:middleware'
import { applyStandardHeaders, generateNonce } from './config/security'

export const onRequest = defineMiddleware(async (context, next) => {
    const { pathname } = context

    // 生成 CSP nonce（每个请求唯一）
    const nonce = generateNonce()

    // 将 nonce 存储在 locals 中，供页面内联脚本使用
    context.locals.cspNonce = nonce

    const secureResponse = (response: Response) => applyStandardHeaders(response, pathname, nonce)

    return secureResponse(await next())
})
