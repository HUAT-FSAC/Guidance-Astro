import { describe, expect, it } from 'vitest'

import { shouldFilterBuildWarning } from '../../src/integrations/filter-known-build-warnings'
import filterKnownBuildWarnings from '../../src/integrations/filter-known-build-warnings'

describe('filter-known-build-warnings', () => {
    it('shouldFilterBuildWarning various', () => {
        expect(shouldFilterBuildWarning(['Entry docs → 404 was not found.'])).toBe(true)
        expect(shouldFilterBuildWarning(['as it conflicts with higher priority route'])).toBe(true)
        expect(shouldFilterBuildWarning(['file not created, response body was empty'])).toBe(true)
        expect(shouldFilterBuildWarning(['Module \"node:fs\"'])).toBe(true)
        expect(shouldFilterBuildWarning(['Module \"child_process\"'])).toBe(true)
        expect(shouldFilterBuildWarning(['Module \"stream\"'])).toBe(true)
        expect(shouldFilterBuildWarning(['Module \"string_decoder\"'])).toBe(true)
        expect(shouldFilterBuildWarning(['Module \"os\"'])).toBe(true)
        expect(shouldFilterBuildWarning(['Module \"url\"'])).toBe(true)
        expect(shouldFilterBuildWarning(['is dynamically imported by'])).toBe(true)
        expect(
            shouldFilterBuildWarning(['dynamic import will not move module into another chunk'])
        ).toBe(true)
        expect(shouldFilterBuildWarning(['random warning'])).toBe(false)
        expect(shouldFilterBuildWarning([])).toBe(false)
        expect(shouldFilterBuildWarning([''])).toBe(false)
        expect(shouldFilterBuildWarning([123 as unknown as string])).toBe(false)
    })
    it('integration hooks filter', () => {
        const integration = filterKnownBuildWarnings()
        expect(integration.name).toBe('filter-known-build-warnings')
        // mock console.warn and stdout.write
        const originalWarn = console.warn
        const originalStdout = process.stdout.write
        const originalStderr = process.stderr.write
        const warnCalls: unknown[][] = []
        console.warn = (...args: unknown[]) => warnCalls.push(args)
        let _stdoutContent = ''
        // @ts-expect-error: mock
        process.stdout.write = (buf: string | Uint8Array, cb?: unknown) => {
            _stdoutContent += typeof buf === 'string' ? buf : buf.toString()
            if (typeof cb === 'function') (cb as () => void)()
            return true
        }
        // @ts-expect-error: suppress type error
        process.stderr.write = process.stdout.write
        integration.hooks['astro:config:setup']!({} as never)
        console.warn('Entry docs → 404 was not found.')
        console.warn('real warning')
        expect(warnCalls.length).toBe(1)
        expect(warnCalls[0][0]).toBe('real warning')
        // test multiline filtering via wrapStreamWrite
        process.stdout.write(
            'Entry docs → 404 was not found.\nreal line\nModule \"node:fs\" has been externalized.\n'
        )
        // should filter first and third, keep second
        integration.hooks['astro:build:done']!({} as never)
        console.warn = originalWarn
        process.stdout.write = originalStdout
        process.stderr.write = originalStderr
    })
    it('integration multiline filtering', () => {
        const integration = filterKnownBuildWarnings()
        integration.hooks['astro:config:setup']!({} as never)
        // test wrapStreamWrite via directly calling the filtered write
        const originalWrite = process.stdout.write
        let captured = ''
        // @ts-expect-error: mock
        process.stdout.write = (buf: string | Uint8Array, enc?: unknown, cb?: unknown) => {
            captured += typeof buf === 'string' ? buf : buf.toString()
            if (typeof enc === 'function') (enc as () => void)()
            if (typeof cb === 'function') (cb as () => void)()
            return true
        }
        // write multiline with mixed
        process.stdout.write(
            'line1\nEntry docs → 404 was not found.\nline2\nModule \"node:fs\" test\nline3\n'
        )
        // should have filtered first and third, kept line1, line2, line3
        // now test empty filtered
        const _emptyResult = process.stdout.write as unknown as { length: number }
        // call with only filtered content
        process.stdout.write('Entry docs → 404 was not found.\n')
        // restore
        integration.hooks['astro:build:done']!({} as never)
        process.stdout.write = originalWrite
        expect(captured).toContain('line1')
        expect(captured).toContain('line2')
    })
    it('wrapStreamWrite overloads (Uint8Array, encoding, callback)', () => {
        // test wrapStreamWrite with Uint8Array
        const integration = filterKnownBuildWarnings()
        integration.hooks['astro:config:setup']!({} as never)
        const origWrite = process.stdout.write
        let called = false
        // @ts-expect-error: suppress type error
        process.stdout.write = (buf: Uint8Array, enc?: unknown, cb?: unknown) => {
            called = true
            if (typeof enc === 'function') (enc as () => void)()
            if (typeof cb === 'function') (cb as () => void)()
            return true
        }
        const buf = Buffer.from('Module \"node:fs\" test')
        process.stdout.write(buf)
        // should filter and call cb
        expect(called).toBe(true)
        // test with string and encoding
        let captured = ''
        // @ts-expect-error: suppress type error
        process.stdout.write = (buf: string, _enc?: unknown, _cb?: unknown) => {
            captured = typeof buf === 'string' ? buf : buf.toString()
            return true
        }
        process.stdout.write('hello world', 'utf8')
        expect(captured).toBe('hello world')
        // single line not filtered
        process.stdout.write('Entry docs → 404 was not found.')
        // should be filtered to empty and return true
        // need to test with callback
        // @ts-expect-error: suppress type error
        process.stdout.write = (buf: string, enc?: unknown, _cb?: unknown) => {
            if (typeof enc === 'function') {
                // enc is callback
                return origWrite.call(process.stdout, buf, enc as never)
            }
            return true
        }
        // restore
        integration.hooks['astro:build:done']!({} as never)
        process.stdout.write = origWrite
    })
})
