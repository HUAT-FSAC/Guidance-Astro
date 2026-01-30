/**
 * 组件初始化管理器
 * 提供统一的组件初始化和清理机制，防止重复初始化
 */

/**
 * 组件清理函数类型
 */
type CleanupFunction = () => void;

/**
 * 组件信息接口
 */
interface ComponentInfo {
    initialized: boolean;
    cleanup?: CleanupFunction;
}

/**
 * 使用 WeakMap 跟踪组件状态，避免内存泄漏
 */
const componentRegistry = new WeakMap<HTMLElement, ComponentInfo>();

/**
 * 初始化组件（防止重复初始化）
 * @param selector - 组件选择器
 * @param initFn - 初始化函数
 * @returns 是否成功初始化
 */
export function initComponent(
    selector: string,
    initFn: (element: HTMLElement) => CleanupFunction | void
): boolean {
    if (typeof document === "undefined") return false;

    const element = document.querySelector(selector) as HTMLElement | null;
    if (!element) return false;

    return initElement(element, initFn);
}

/**
 * 初始化单个元素（防止重复初始化）
 * @param element - DOM 元素
 * @param initFn - 初始化函数
 * @returns 是否成功初始化
 */
export function initElement(
    element: HTMLElement,
    initFn: (element: HTMLElement) => CleanupFunction | void
): boolean {
    const info = componentRegistry.get(element);

    if (info?.initialized) {
        return false;
    }

    try {
        const cleanup = initFn(element);

        componentRegistry.set(element, {
            initialized: true,
            cleanup: cleanup || undefined,
        });

        return true;
    } catch (error) {
        console.error(`Failed to initialize component:`, error);
        return false;
    }
}

/**
 * 清理组件
 * @param selector - 组件选择器
 */
export function cleanupComponent(selector: string): void {
    if (typeof document === "undefined") return;

    const element = document.querySelector(selector) as HTMLElement | null;
    if (!element) return;

    cleanupElement(element);
}

/**
 * 清理单个元素
 * @param element - DOM 元素
 */
export function cleanupElement(element: HTMLElement): void {
    const info = componentRegistry.get(element);
    if (!info) return;

    if (info.cleanup) {
        try {
            info.cleanup();
        } catch (error) {
            console.error(`Failed to cleanup component:`, error);
        }
    }

    componentRegistry.delete(element);
}

/**
 * 清理所有组件
 */
export function cleanupAllComponents(): void {
    if (typeof document === "undefined") return;

    const elements = document.querySelectorAll<HTMLElement>("[data-component-init]");
    elements.forEach((element) => {
        cleanupElement(element);
    });
}

/**
 * 检查组件是否已初始化
 * @param selector - 组件选择器
 * @returns 是否已初始化
 */
export function isComponentInitialized(selector: string): boolean {
    if (typeof document === "undefined") return false;

    const element = document.querySelector(selector) as HTMLElement | null;
    if (!element) return false;

    return isElementInitialized(element);
}

/**
 * 检查元素是否已初始化
 * @param element - DOM 元素
 * @returns 是否已初始化
 */
export function isElementInitialized(element: HTMLElement): boolean {
    const info = componentRegistry.get(element);
    return info?.initialized ?? false;
}

/**
 * 设置组件初始化标记（用于调试）
 * @param element - DOM 元素
 * @param componentName - 组件名称
 */
export function markComponentInitialized(
    element: HTMLElement,
    componentName: string
): void {
    element.dataset.componentInit = componentName;
}

/**
 * 获取组件名称（用于调试）
 * @param element - DOM 元素
 * @returns 组件名称
 */
export function getComponentName(element: HTMLElement): string | undefined {
    return element.dataset.componentInit;
}

/**
 * Astro 页面导航事件监听器
 * 自动在页面加载时初始化组件，在页面卸载时清理组件
 */
export function setupComponentLifecycle(
    selector: string,
    initFn: (element: HTMLElement) => CleanupFunction | void
): void {
    if (typeof document === "undefined") return;

    const init = () => {
        initComponent(selector, initFn);
    };

    const cleanup = () => {
        cleanupComponent(selector);
    };

    // DOMContentLoaded 事件
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, { once: true });
    } else {
        init();
    }

    // Astro 页面导航事件
    document.addEventListener("astro:page-load", init);
    document.addEventListener("astro:after-preparation", cleanup);
}

/**
 * 批量初始化组件
 * @param configs - 组件配置数组
 */
export function initComponents(
    configs: Array<{
        selector: string;
        initFn: (element: HTMLElement) => CleanupFunction | void;
    }>
): void {
    configs.forEach((config) => {
        setupComponentLifecycle(config.selector, config.initFn);
    });
}
