import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('home custom cursor safety', () => {
    it('home page should not mount custom cursor override', () => {
        const source = readFileSync(resolve('src/content/docs/index.mdx'), 'utf-8')

        expect(source).not.toContain('import CustomCursor')
        expect(source).not.toContain('<CustomCursor />')
    })

    it('only hides native cursor when custom cursor is explicitly enabled', () => {
        const source = readFileSync(resolve('src/components/home/ui/CustomCursor.astro'), 'utf-8')

        expect(source).toContain('html.fsac-custom-cursor-enabled')
        expect(source).not.toMatch(/:global\(\*\)\s*\{\s*cursor:\s*none\s*!important;/m)
    })

    it('disables custom cursor on touch or coarse pointer devices', () => {
        const source = readFileSync(resolve('src/components/home/ui/CustomCursor.astro'), 'utf-8')

        expect(source).toContain('(hover: none), (pointer: coarse)')
    })
})
