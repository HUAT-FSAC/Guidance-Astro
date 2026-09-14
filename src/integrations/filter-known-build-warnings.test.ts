import { describe, expect, it, vi } from 'vitest'

import { shouldFilterBuildWarning } from './filter-known-build-warnings'

describe('shouldFilterBuildWarning', () => {
    it('filters the known Starlight 404 lookup warning', () => {
        expect(shouldFilterBuildWarning(['Entry docs → 404 was not found.'])).toBe(true)
    })

    it('filters route conflict warnings', () => {
        expect(
            shouldFilterBuildWarning([
                'Could not render `/en/docs-center/入门` from route `/[...slug]` as it conflicts with higher priority route `/en/docs-center/入门`.',
            ])
        ).toBe(true)
    })

    it('filters node module warnings', () => {
        expect(shouldFilterBuildWarning(['Module "node:crypto" has been externalized.'])).toBe(true)
    })

    it('filters empty-body redirect source routes (Cloudflare adapter)', () => {
        expect(
            shouldFilterBuildWarning([
                '  ├─ /2025/电气/电池箱/index.html (+23ms) (file not created, response body was empty)',
            ])
        ).toBe(true)
    })

    it('does not filter unrelated warnings', () => {
        expect(shouldFilterBuildWarning(['Entry docs → index was not found.'])).toBe(false)
        expect(
            shouldFilterBuildWarning(['Automatically externalized node built-in module "crypto".'])
        ).toBe(false)
        expect(shouldFilterBuildWarning([null, undefined, 123])).toBe(false)
        expect(shouldFilterBuildWarning([''])).toBe(false)
    })

    it('filters all known node module and chunk warnings', () => {
        expect(shouldFilterBuildWarning(['Module "child_process" is external'])).toBe(true)
        expect(shouldFilterBuildWarning(['Module "stream" is external'])).toBe(true)
        expect(shouldFilterBuildWarning(['Module "string_decoder" is external'])).toBe(true)
        expect(shouldFilterBuildWarning(['Module "os" is external'])).toBe(true)
        expect(shouldFilterBuildWarning(['Module "url" is external'])).toBe(true)
        expect(shouldFilterBuildWarning(['foo is dynamically imported by bar'])).toBe(true)
        expect(
            shouldFilterBuildWarning(['dynamic import will not move module into another chunk'])
        ).toBe(true)
    })

    it('creates AstroIntegration and manages console/stream wrapping lifecycle', async () => {
        const origStdout = process.stdout.write
        const origStderr = process.stderr.write
        const origWarn = console.warn

        const mockStdout = vi.fn().mockImplementation((_buf, _enc, cb) => {
            if (typeof _enc === 'function') _enc()
            if (typeof cb === 'function') cb()
            return true
        })
        const mockWarn = vi.fn()

        process.stdout.write = mockStdout as never
        console.warn = mockWarn as never

        const filterKnownBuildWarnings = (await import('./filter-known-build-warnings')).default
        const integration = filterKnownBuildWarnings()

        const setupHook = integration.hooks['astro:config:setup'] as () => void
        const doneHook = integration.hooks['astro:build:done'] as () => void

        expect(integration.name).toBe('filter-known-build-warnings')

        // 1. Setup hook
        setupHook()
        // Idempotency: second setup hook call doesn't overwrite
        setupHook()

        // 2. Test wrapped console.warn
        console.warn('Module "url" is imported')
        expect(mockWarn).not.toHaveBeenCalled()
        console.warn('Regular warning that should be logged')
        expect(mockWarn).toHaveBeenCalledWith('Regular warning that should be logged')

        // 3. Test wrapped process.stdout.write
        const cb = vi.fn()
        // Completely filtered
        process.stdout.write('Module "os" is external\n', cb)
        expect(cb).toHaveBeenCalled()

        // Completely filtered with cb as third arg
        const cb3 = vi.fn()
        process.stdout.write('Module "os" is external\n', 'utf8', cb3)
        expect(cb3).toHaveBeenCalled()

        // Completely filtered without cb
        process.stdout.write('Module "os" is external\n')

        // Unchanged buffer (not filtered)
        const cbKeep = vi.fn()
        process.stdout.write('Normal stdout line\n', cbKeep)
        expect(cbKeep).toHaveBeenCalled()

        // Unchanged buffer with encoding + cb
        const cbKeep2 = vi.fn()
        process.stdout.write('Normal stdout line 2\n', 'utf8', cbKeep2)
        expect(cbKeep2).toHaveBeenCalled()

        // Partially filtered multiline
        const cbPartial = vi.fn()
        process.stdout.write('Keep line 1\nModule "stream" is external\nKeep line 2\n', cbPartial)
        expect(cbPartial).toHaveBeenCalled()

        // Partially filtered multiline with encoding
        const cbPartial2 = vi.fn()
        process.stdout.write(
            'Keep line 1\nModule "stream" is external\nKeep line 2\n',
            'utf8',
            cbPartial2
        )
        expect(cbPartial2).toHaveBeenCalled()

        // Uint8Array buffer
        process.stdout.write(new TextEncoder().encode('Uint8Array normal message\n'))

        // 4. Done hook
        doneHook()
        // Idempotency: second done hook call
        doneHook()

        // Restore originals
        process.stdout.write = origStdout
        process.stderr.write = origStderr
        console.warn = origWarn
    })
})
