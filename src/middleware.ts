/**
 * Middleware 入口
 *
 * 实现已拆分为 src/middleware/pipeline.ts 及以下 step：
 * - src/middleware/nonce.ts
 * - src/middleware/html-transform.ts
 * - src/middleware/security-headers.ts
 * - src/middleware/cache-policy.ts
 *
 * Astro 通过本文件的 `onRequest` 导出自动发现并运行 middleware。
 */
export { onRequest } from './middleware/pipeline'
