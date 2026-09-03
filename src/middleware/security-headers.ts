import { defineMiddleware } from 'astro:middleware'
import { applyStandardHeaders } from '../config/security'

/**
 * 应用标准安全头部（含 CSP nonce）
 */
export const applySecurityHeaders = defineMiddleware(async (context, next) => {
    const response = await next()
    const nonce = (context.locals as Record<string, unknown>).cspNonce as string | undefined
    return applyStandardHeaders(response, context.url.pathname, nonce)
})
