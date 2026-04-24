import type { AstroIntegration } from 'astro'

const shouldFilterMessage = (message: string): boolean => {
    if (!message) return false
    return (
        message === 'Entry docs → 404 was not found.' ||
        message.includes('as it conflicts with higher priority route') ||
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

export default function filterKnownBuildWarnings(): AstroIntegration {
    let originalWarn: typeof console.warn | undefined
    let originalStdoutWrite: typeof process.stdout.write | undefined
    let originalStderrWrite: typeof process.stderr.write | undefined

    return {
        name: 'filter-known-build-warnings',
        hooks: {
            'astro:config:setup': () => {
                // 拦截 console.warn
                if (!originalWarn) {
                    originalWarn = console.warn
                    console.warn = (...args: Parameters<typeof console.warn>) => {
                        if (shouldFilterBuildWarning(args)) return
                        originalWarn?.(...args)
                    }
                }

                // 拦截 stdout
                if (!originalStdoutWrite) {
                    originalStdoutWrite = process.stdout.write
                    process.stdout.write = ((
                        buffer: string | Uint8Array,
                        encoding?: BufferEncoding | ((err?: Error) => void),
                        cb?: (err?: Error) => void
                    ): boolean => {
                        const str = typeof buffer === 'string' ? buffer : buffer.toString()
                        if (shouldFilterMessage(str)) return true
                        if (typeof encoding === 'function') {
                            return originalStdoutWrite!.call(process.stdout, buffer, encoding)
                        }
                        return originalStdoutWrite!.call(
                            process.stdout,
                            buffer,
                            encoding as BufferEncoding,
                            cb
                        )
                    }) as typeof process.stdout.write
                }

                // 拦截 stderr
                if (!originalStderrWrite) {
                    originalStderrWrite = process.stderr.write
                    process.stderr.write = ((
                        buffer: string | Uint8Array,
                        encoding?: BufferEncoding | ((err?: Error) => void),
                        cb?: (err?: Error) => void
                    ): boolean => {
                        const str = typeof buffer === 'string' ? buffer : buffer.toString()
                        if (shouldFilterMessage(str)) return true
                        if (typeof encoding === 'function') {
                            return originalStderrWrite!.call(process.stderr, buffer, encoding)
                        }
                        return originalStderrWrite!.call(
                            process.stderr,
                            buffer,
                            encoding as BufferEncoding,
                            cb
                        )
                    }) as typeof process.stderr.write
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
