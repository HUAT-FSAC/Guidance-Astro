/**
 * 懒加载组件工具
 * 用于延迟加载非关键组件，优化代码分割和页面加载速度
 */

import { setupComponentLifecycle } from './component-init'

/**
 * 懒加载组件配置
 */
export interface LazyComponentConfig {
    selector: string
    importFn: () => Promise<{ default: (element: HTMLElement) => () => void } | { init: (element: HTMLElement) => () => void }>
    delay?: number
}

/**
 * 懒加载组件
 * @param config 组件配置
 */
export function lazyLoadComponent(config: LazyComponentConfig): void {
    const { selector, importFn, delay = 1000 } = config

    const initFn = async (element: HTMLElement): Promise<() => void> => {
        try {
            // 延迟加载组件
            const module = await importFn()
            const init = module.default || module.init

            if (typeof init === 'function') {
                return init(element)
            }
        } catch (error) {
            console.error(`Failed to lazy load component for selector "${selector}":`, error)
        }

        return () => {}
    }

    setupComponentLifecycle(selector, initFn)
}

/**
 * 批量懒加载组件
 * @param configs 组件配置数组
 */
export function lazyLoadComponents(configs: LazyComponentConfig[]): void {
    configs.forEach((config) => {
        lazyLoadComponent(config)
    })
}

/**
 * 懒加载主题控制器
 */
export function lazyLoadThemeController(): void {
    lazyLoadComponent({
        selector: '[data-theme-switcher]',
        importFn: () => import('./theme-controller').then((module) => ({
            init: module.initThemeController
        })),
        delay: 500
    })
}

/**
 * 懒加载分享菜单
 */
export function lazyLoadShareMenu(): void {
    lazyLoadComponent({
        selector: '[data-share-container], [data-share-button]',
        importFn: () => import('./share-controller').then((module) => ({
            init: module.initShareMenu
        })),
        delay: 1000
    })
}

/**
 * 懒加载所有非关键组件
 */
export function lazyLoadAllComponents(): void {
    lazyLoadThemeController()
    lazyLoadShareMenu()
}