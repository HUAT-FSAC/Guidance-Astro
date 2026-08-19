import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import {
    findHardcodedLightTextInCss,
    findHardcodedLightTextInInlineStyles,
    scanThemeContrast,
} from '../../scripts/quality/check-theme-contrast.mjs'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

describe('theme contrast scanner', () => {
    it('flags unguarded white text that will vanish in light theme', () => {
        const css = `.quote { color: rgba(255, 255, 255, 0.85); }`
        expect(findHardcodedLightTextInCss(css, 'demo.css')).toEqual([
            { file: 'demo.css', line: 1, value: 'rgba(255, 255, 255, 0.85)' },
        ])
    })

    it('allows tokenized text and dark-theme-only rules', () => {
        const css = `
            .quote { color: var(--fs-color-text); }
            .badge { color: var(--fs-color-on-accent); }
            :root[data-theme='dark'] nav a,
            :root[data-theme='dark'] starlight-toc a { color: #ffffff; }
            .ok { color: #fff; /* theme-contrast:allow */ }
        `
        expect(findHardcodedLightTextInCss(css)).toEqual([])
    })

    it('does not treat custom properties or border-color as text color', () => {
        const css = `
            :root { --fs-color-heading: #ffffff; }
            .card { border-color: #fff; background: #fff; }
        `
        expect(findHardcodedLightTextInCss(css)).toEqual([])
    })

    it('flags inline style attributes', () => {
        const html = `<h2 style="color: white; margin: 0;">Hi</h2>`
        expect(findHardcodedLightTextInInlineStyles(html, 'join.mdx')).toEqual([
            { file: 'join.mdx', line: 1, value: 'white' },
        ])
    })

    it('keeps src free of unguarded light text colors', async () => {
        const violations = await scanThemeContrast(path.join(repoRoot, 'src'), repoRoot)
        expect(violations).toEqual([])
    })
})
