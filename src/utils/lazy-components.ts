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
    importFn: () => Promise<
        | { default: (element: HTMLElement) => () => void }
        | { init: (element: HTMLElement) => () => void }
    >
    delay?: number
}

/**
 * 懒加载组件
 * @param config 组件配置
 */
export function lazyLoadComponent(config: LazyComponentConfig): void {
    const { selector, importFn, delay } = config

    const initFn = (element: HTMLElement): (() => void) | void => {
        let cleanup: (() => void) | undefined

        const load = async () => {
            try {
                // 如果有延迟，先等待
                if (delay) {
                    await new Promise((resolve) => setTimeout(resolve, delay))
                }
                // 延迟加载组件
                const module = await importFn()
                const init = 'default' in module ? module.default : module.init

                if (typeof init === 'function') {
                    cleanup = init(element)
                }
            } catch (error) {
                console.error(`Failed to lazy load component for selector "${selector}":`, error)
            }
        }

        load()

        return () => {
            if (cleanup) cleanup()
        }
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
