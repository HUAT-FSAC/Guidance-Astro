import { defineMiddleware, sequence } from 'astro:middleware'
import { enforceHtmlCachePrivacy } from './cache-policy'
import { applySecurityHeaders } from './security-headers'
import { transformHtml } from './html-transform'
import { injectNonce } from './nonce'

// Astro can run middleware again for the error page using the same request locals.
// It keeps headers from the first response when it merges in the error page body.
const ensureRequestNonce = defineMiddleware((context, next) =>
    context.locals.cspNonce ? next() : injectNonce(context, next)
)

/**
 * Middleware pipeline
 *
 * 执行顺序（最外层 → 最内层）：
 * 1. enforceHtmlCachePrivacy：普通 HTML 使用 private, no-cache，错误页使用 no-store
 * 2. applySecurityHeaders：应用安全头部 + 默认 Cache-Control
 * 3. transformHtml：注入 nonce + 裁剪路由 CSS
 * 4. ensureRequestNonce：在同一请求的正常渲染和错误回退间复用 nonce
 */
export const onRequest = defineMiddleware(
    sequence(enforceHtmlCachePrivacy, applySecurityHeaders, transformHtml, ensureRequestNonce)
)
