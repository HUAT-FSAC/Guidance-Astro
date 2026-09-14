/**
 * Middleware 纯工具函数
 * 无副作用，便于单独测试和复用
 */

/**
 * 给 HTML 中所有 <script> 标签注入 nonce 属性（跳过已带 nonce 的）
 */
export function injectNonceIntoHtml(html: string, nonce: string): string {
    return html.replace(/<script(?=[\s>])(?![^>]*\bnonce=)/g, `<script nonce="${nonce}"`)
}

/**
 * 按路由裁剪无用 CSS（例如中文页不加载英文专属样式，避免 18KB 浪费）
 */
export function pruneRouteCss(html: string, pathname: string): string {
    // 英文 locale 样式仅在 /en/* 下需要（兼容有无尾斜杠）
    const isEn = pathname === '/en' || pathname.startsWith('/en/')
    if (!isEn) {
        html = html.replace(/<link[^>]*href="\/_astro\/en\.[^"]*\.css"[^>]*>\n?/g, '')
    }
    return html
}
