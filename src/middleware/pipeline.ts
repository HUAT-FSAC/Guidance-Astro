import { defineMiddleware, sequence } from 'astro:middleware'
import { enforceHtmlCachePrivacy } from './cache-policy'
import { applySecurityHeaders } from './security-headers'
import { transformHtml } from './html-transform'
import { injectNonce } from './nonce'

/**
 * Middleware pipeline
 *
 * 执行顺序（最外层 → 最内层）：
 * 1. enforceHtmlCachePrivacy：HTML 响应强制 private, no-cache
 * 2. applySecurityHeaders：应用安全头部 + 默认 Cache-Control
 * 3. transformHtml：注入 nonce + 裁剪路由 CSS
 * 4. injectNonce：生成 nonce 存入 context.locals（必须在 next() 之前）
 *
 * 与原先单一 onRequest 函数行为完全等价
 */
export const onRequest = defineMiddleware(
    sequence(enforceHtmlCachePrivacy, applySecurityHeaders, transformHtml, injectNonce)
)
