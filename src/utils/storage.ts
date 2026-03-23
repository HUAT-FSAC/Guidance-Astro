/**
 * 安全的 localStorage 工具模块
 * 处理隐私模式、存储配额超限等异常情况
 */
import { handleStorageError, safeJsonParse, safeJsonStringify } from './error-handler'

/**
 * 安全地获取 localStorage 项
 * @param key - 存储键名
 * @param defaultValue - 默认值（获取失败时返回）
 * @returns 存储的值或默认值
 */
export function safeGetItem(key: string, defaultValue: string | null = null): string | null {
    try {
        if (typeof localStorage === 'undefined') {
            return defaultValue
        }
        return localStorage.getItem(key) ?? defaultValue
    } catch (error) {
        handleStorageError(key, 'get', error)
        return defaultValue
    }
}

/**
 * 安全地设置 localStorage 项
 * @param key - 存储键名
 * @param value - 要存储的值
 * @returns 是否成功存储
 */
export function safeSetItem(key: string, value: string): boolean {
    try {
        if (typeof localStorage === 'undefined') {
            return false
        }
        localStorage.setItem(key, value)
        return true
    } catch (error) {
        handleStorageError(key, 'set', error)
        return false
    }
}

/**
 * 安全地移除 localStorage 项
 * @param key - 存储键名
 * @returns 是否成功移除
 */
export function safeRemoveItem(key: string): boolean {
    try {
        if (typeof localStorage === 'undefined') {
            return false
        }
        localStorage.removeItem(key)
        return true
    } catch (error) {
        handleStorageError(key, 'remove', error)
        return false
    }
}

/**
 * 安全地获取并解析 JSON 数据
 * @param key - 存储键名
 * @param defaultValue - 默认值
 * @returns 解析后的对象或默认值
 */
export function safeGetJSON<T>(key: string, defaultValue: T): T {
    const item = safeGetItem(key)
    if (item === null) {
        return defaultValue
    }
    return safeJsonParse(item, defaultValue)
}

/**
 * 安全地存储 JSON 数据
 * @param key - 存储键名
 * @param value - 要存储的对象
 * @returns 是否成功存储
 */
export function safeSetJSON<T>(key: string, value: T): boolean {
    const jsonString = safeJsonStringify(value, '')
    if (!jsonString) {
        return false
    }
    return safeSetItem(key, jsonString)
}
