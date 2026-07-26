import type { AstroIntegration } from 'astro'

const shouldFilterMessage = (message: string): boolean => {
    if (!message) return false
    return (
        message === 'Entry docs → 404 was not found.' ||
        // Starlight 的 [...slug] 通配路由尝试渲染 /404，与 Astro 高优先级 404 路由冲突；
        // 404 页面仍由高优先级路由正常生成，告警良性。
        message.includes('as it conflicts with higher priority route') ||
        // Cloudflare 适配器把 redirects 交给 _redirects 边缘处理，源路由不产出 HTML 正文；
        // 重定向目标页面与 _redirects 均已正确生成，空正文属预期行为。
        message.includes('file not created, response body was empty') ||
        message.includes('Module "node:') ||
        message.includes('Module "child_process') ||
        message.includes('Module "stream') ||
        message.includes('Module "string_decoder') ||
        message.includes('Module "os') ||
        message.includes('Module "url') ||
        message.includes('is dynamically imported by') ||
        message.includes('dynamic import will not move module into another chunk')
    )
}

export function shouldFilterBuildWarning(args: unknown[]): boolean {
    for (const arg of args) {
        if (typeof arg === 'string' && shouldFilterMessage(arg)) {
            return true
        }
    }
    return false
}

/**
 * 多行缓冲区逐行过滤：移除匹配已知良性告警的行，保留其余行。
 * 若整段都被过滤则返回空串（调用方据此跳过写入）。
 * 单行时退化为整行匹配过滤。
 */
function filterMultiline(text: string): string {
    if (!text.includes('\n')) {
        return shouldFilterMessage(text) ? '' : text
    }
    const kept = text.split('\n').filter((line) => !shouldFilterMessage(line))
    return kept.join('\n')
}

/**
 * 包裹 process.stdout/stderr.write：对文本缓冲区做逐行过滤。
 * - 全部行被过滤：模拟写入成功并触发回调，不写出任何内容；
 * - 部分行被过滤：写出过滤后的字符串；
 * - 无行被过滤：原样写出原始 buffer（保留 Uint8Array 等非文本场景）。
 */
function wrapStreamWrite(original: typeof process.stdout.write): typeof process.stdout.write {
    return function (
        this: typeof process.stdout,
        buffer: string | Uint8Array,
        encodingOrCb?: unknown,
        cb?: unknown
    ): boolean {
        const raw = typeof buffer === 'string' ? buffer : buffer.toString()
        const filtered = filterMultiline(raw)

        // 全部被过滤：跳过写入，但仍触发回调以避免挂起
        if (filtered === '') {
            if (typeof encodingOrCb === 'function') {
                ;(encodingOrCb as (err?: Error | null) => void)()
            } else if (typeof cb === 'function') {
                ;(cb as (err?: Error | null) => void)()
            }
            return true
        }

        // 无变化：原样写出原始 buffer
        if (filtered === raw) {
            if (typeof encodingOrCb === 'function') {
                return original.call(this, buffer, encodingOrCb as never)
            }
            return original.call(this, buffer, encodingOrCb as BufferEncoding, cb as never)
        }

        // 部分过滤：写出过滤后的字符串
        if (typeof encodingOrCb === 'function') {
            return original.call(this, filtered, encodingOrCb as never)
        }
        return original.call(this, filtered, encodingOrCb as BufferEncoding, cb as never)
    } as typeof process.stdout.write
}

export default function filterKnownBuildWarnings(): AstroIntegration {
    let originalWarn: typeof console.warn | undefined
    let originalStdoutWrite: typeof process.stdout.write | undefined
    let originalStderrWrite: typeof process.stderr.write | undefined

    return {
        name: 'filter-known-build-warnings',
        hooks: {
            'astro:config:setup': () => {
                // 拦截 console.warn（单条告警）
                if (!originalWarn) {
                    originalWarn = console.warn
                    console.warn = (...args: Parameters<typeof console.warn>) => {
                        if (shouldFilterBuildWarning(args)) return
                        originalWarn?.(...args)
                    }
                }

                // 拦截 stdout（路由树等多行输出）
                if (!originalStdoutWrite) {
                    originalStdoutWrite = process.stdout.write
                    process.stdout.write = wrapStreamWrite(originalStdoutWrite)
                }

                // 拦截 stderr
                if (!originalStderrWrite) {
                    originalStderrWrite = process.stderr.write
                    process.stderr.write = wrapStreamWrite(originalStderrWrite)
                }
            },
            'astro:build:done': () => {
                // 恢复原始方法
                if (originalWarn) {
                    console.warn = originalWarn
                    originalWarn = undefined
                }
                if (originalStdoutWrite) {
                    process.stdout.write = originalStdoutWrite
                    originalStdoutWrite = undefined
                }
                if (originalStderrWrite) {
                    process.stderr.write = originalStderrWrite
                    originalStderrWrite = undefined
                }
            },
        },
    }
}
