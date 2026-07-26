/**
 * 轻量级前端日志工具
 *
 * - 开发环境（import.meta.env.DEV）输出 info/warn/error，便于排查；
 * - 生产环境静默 info/warn，仅保留 error，避免污染用户控制台；
 * - 统一 `[Scope] message` 前缀，与项目既有日志风格（[Analytics]/[GlobalInit] 等）一致。
 *
 * @example
 * const log = createLogger('Showcase')
 * log.info('初始化轮播', { total: 3 })
 * log.warn('缺少 DOM 节点', { missing: ['title'] })
 * log.error('解析数据失败', { raw })
 */

/* eslint-disable no-console -- 本模块即日志出口，是 console 的唯一封装点 */

type LogContext = Record<string, unknown>

export interface Logger {
    info(message: string, context?: LogContext): void
    warn(message: string, context?: LogContext): void
    error(message: string, context?: LogContext): void
}

const isDev = import.meta.env.DEV

/** 创建带作用域前缀的 logger 实例。 */
export function createLogger(scope: string): Logger {
    const tag = `[${scope}]`
    return {
        info(message, context) {
            if (!isDev) return
            if (context) console.info(tag, message, context)
            else console.info(tag, message)
        },
        warn(message, context) {
            if (!isDev) return
            if (context) console.warn(tag, message, context)
            else console.warn(tag, message)
        },
        error(message, context) {
            // error 始终输出，即便在生产环境
            if (context) console.error(tag, message, context)
            else console.error(tag, message)
        },
    }
}
