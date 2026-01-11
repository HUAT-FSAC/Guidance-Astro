/**
 * 图片优化工具模块
 * 统一处理外部图片和本地图片的优化
 */

/**
 * 优化外部图片 URL（支持多种 CDN）
 * @param url - 原始图片 URL
 * @param width - 目标宽度
 * @param quality - 图片质量 (0-100)
 * @param format - 输出格式 (webp/avif/auto)
 * @returns 优化后的 URL
 */
export function optimizeExternalImage(
    url: string,
    width: number = 1920,
    quality: number = 85,
    format: "webp" | "avif" | "auto" = "webp"
): string {
    if (!url) return "";

    // Unsplash 优化
    if (url.includes("unsplash.com")) {
        const base = url.split("?")[0];
        return `${base}?fm=${format === "auto" ? "webp" : format}&w=${width}&q=${quality}`;
    }

    // Cloudinary 优化
    if (url.includes("cloudinary.com") || url.includes("res.cloudinary.com")) {
        // 插入转换参数到 /upload/ 之后
        const formatParam = format === "auto" ? "f_auto" : `f_${format}`;
        return url.replace("/upload/", `/upload/${formatParam},w_${width},q_${quality}/`);
    }

    // Imgix 优化
    if (url.includes("imgix.net")) {
        const separator = url.includes("?") ? "&" : "?";
        const formatParam = format === "auto" ? "auto=format" : `fm=${format}`;
        return `${url}${separator}${formatParam}&w=${width}&q=${quality}`;
    }

    // Pexels 优化
    if (url.includes("pexels.com") || url.includes("images.pexels.com")) {
        const separator = url.includes("?") ? "&" : "?";
        return `${url}${separator}w=${width}&auto=compress&cs=tinysrgb`;
    }

    // 本地图片或其他 - 返回原 URL (可以通过 Astro 的 Image 组件优化)
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
