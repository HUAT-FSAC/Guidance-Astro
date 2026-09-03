import { defineMiddleware } from 'astro:middleware'
import { generateNonce } from '../config/security'

/**
 * 每请求生成唯一 CSP nonce 并存入 context.locals
 * 必须在其他读取 nonce 的 step 之前执行
 */
export const injectNonce = defineMiddleware(async (context, next) => {
    const nonce = generateNonce()
    ;(context.locals as Record<string, unknown>).cspNonce = nonce
    return next()
})
