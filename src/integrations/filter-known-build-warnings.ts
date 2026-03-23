import type { AstroIntegration } from 'astro'

const STARLIGHT_MISSING_404_WARNING = 'Entry docs → 404 was not found.'

export function shouldFilterBuildWarning(args: unknown[]): boolean {
    return args.length === 1 && args[0] === STARLIGHT_MISSING_404_WARNING
}

export default function filterKnownBuildWarnings(): AstroIntegration {
    let originalWarn: typeof console.warn | undefined

    return {
        name: 'filter-known-build-warnings',
        hooks: {
            'astro:config:setup': () => {
                if (originalWarn) return

                originalWarn = console.warn
                console.warn = (...args: Parameters<typeof console.warn>) => {
                    if (shouldFilterBuildWarning(args)) return
                    originalWarn?.(...args)
                }
            },
            'astro:build:done': () => {
                if (originalWarn) {
                    console.warn = originalWarn
                    originalWarn = undefined
                }
            },
        },
    }
}
