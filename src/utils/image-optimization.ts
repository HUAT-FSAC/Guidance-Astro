/**
 * 图片优化工具模块
 * 统一处理外部图片和本地图片的优化
 */

/**
 * 优化外部图片 URL（支持 Unsplash 和其他 CDN）
 * @param url - 原始图片 URL
 * @param width - 目标宽度
 * @param quality - 图片质量 (0-100)
 * @returns 优化后的 URL
 */
export function optimizeExternalImage(
    url: string,
    width: number = 1920,
    quality: number = 85
): string {
    if (!url) return "";

    // Unsplash 优化
    if (url.includes("unsplash.com")) {
        const base = url.split("?")[0];
        return `${base}?fm=webp&w=${width}&q=${quality}`;
    }

    // 其他 CDN 可以在这里添加优化逻辑
    // 例如：images.unsplash.com, images.pexels.com 等

    return url;
}

/**
 * 生成响应式图片的 srcset
 * @param url - 原始图片 URL
 * @param widths - 宽度数组
 * @returns srcset 字符串
 */
export function generateSrcSet(
    url: string,
    widths: number[] = [400, 800, 1200, 1920]
): string {
    return widths
        .map((width) => `${optimizeExternalImage(url, width)} ${width}w`)
        .join(", ");
}

/**
 * 获取图片加载策略
 * @param isAboveFold - 是否在首屏
 * @returns loading 属性值
 */
export function getImageLoadingStrategy(isAboveFold: boolean): "lazy" | "eager" {
    return isAboveFold ? "eager" : "lazy";
}

/**
 * 获取图片优先级
 * @param isAboveFold - 是否在首屏
 * @returns fetchpriority 属性值
 */
export function getImageFetchPriority(isAboveFold: boolean): "high" | "auto" | "low" {
    return isAboveFold ? "high" : "auto";
}

/**
 * 生成图片 alt 文本
 * @param title - 图片标题
 * @param context - 图片上下文描述
 * @returns alt 文本
 */
export function generateAltText(title: string, context: string = ""): string {
    if (!title) return "";
    return context ? `${title} - ${context}` : title;
}
