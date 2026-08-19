import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

/**
 * Flags `color:` declarations that hardcode near-white values without a
 * theme-aware token. Those values stay white after switching to light theme
 * and disappear against `--fs-bg-surface`.
 *
 * Allowed:
 * - CSS custom properties (`--fs-color-heading: #ffffff`)
 * - `var(...)` (including `--fs-color-on-image` / `--fs-color-on-accent`)
 * - rules whose selector includes `[data-theme='dark']`
 * - same-line or previous-line `theme-contrast:allow`
 * - files in FILE_ALLOWLIST (always-dark chrome such as code frames)
 */

export const FILE_ALLOWLIST = new Set(['src/styles/code-blocks.css', 'src/pages/docs.astro'])

const HARDCODED_LIGHT_TEXT =
    /^(?:rgba?\(\s*255\s*,\s*255\s*,\s*255(?:\s*,\s*[\d.]+\s*)?\)|#fff(?:fff)?|white)$/i

const STYLE_BLOCK_RE = /<style\b[^>]*>([\s\S]*?)<\/style>/gi
const CSS_LIKE = /\.(css|astro|mdx)$/

function normalizeRel(filePath, root) {
    return path.relative(root, filePath).split(path.sep).join('/')
}

function isHardcodedLightText(value) {
    const trimmed = value
        .trim()
        .replace(/!important/gi, '')
        .trim()
    if (!trimmed || trimmed.startsWith('var(')) {
        return false
    }
    return HARDCODED_LIGHT_TEXT.test(trimmed)
}

function stripStringsAndComments(css) {
    let output = ''
    let allowMask = ''
    let i = 0
    let pendingAllow = false

    const push = (ch, allow) => {
        output += ch
        allowMask += allow ? 'A' : ' '
    }

    const markCurrentLineAllowed = () => {
        const chars = [...allowMask]
        for (let j = chars.length - 1; j >= 0; j -= 1) {
            if (output[j] === '\n') {
                break
            }
            chars[j] = 'A'
        }
        allowMask = chars.join('')
    }

    while (i < css.length) {
        const ch = css[i]
        const next = css[i + 1]

        if (ch === '/' && next === '*') {
            let end = css.indexOf('*/', i + 2)
            if (end === -1) {
                end = css.length
            } else {
                end += 2
            }
            const comment = css.slice(i, end)
            if (/theme-contrast:\s*allow/.test(comment)) {
                pendingAllow = true
                markCurrentLineAllowed()
            }
            for (const piece of comment) {
                push(piece === '\n' ? '\n' : ' ', pendingAllow)
            }
            i = end
            continue
        }

        if (ch === '"' || ch === "'") {
            push(ch, pendingAllow)
            i += 1
            continue
        }

        if (pendingAllow) {
            push(ch, true)
            if (ch === ';' || ch === '}') {
                pendingAllow = false
            }
            i += 1
            continue
        }

        push(ch, false)
        i += 1
    }

    return { output, allowMask }
}

function lineAt(css, index) {
    let line = 1
    for (let i = 0; i < index; i += 1) {
        if (css[i] === '\n') {
            line += 1
        }
    }
    return line
}

function isInsideDarkTheme(css, index) {
    let depth = 0
    for (let i = index; i >= 0; i -= 1) {
        const ch = css[i]
        if (ch === '}') {
            depth += 1
            continue
        }
        if (ch !== '{') {
            continue
        }
        if (depth > 0) {
            depth -= 1
            continue
        }
        let start = i - 1
        while (start >= 0 && css[start] !== '{' && css[start] !== '}') {
            start -= 1
        }
        const selector = css.slice(start + 1, i)
        if (/\[data-theme\s*=\s*['"]dark['"]\]/.test(selector)) {
            return true
        }
    }
    return false
}

export function findHardcodedLightTextInCss(css, file = '') {
    const violations = []
    const { output, allowMask } = stripStringsAndComments(css)
    const colorDecl = /(?<![-\w])color\s*:/gi
    let match

    while ((match = colorDecl.exec(output))) {
        const valueStart = match.index + match[0].length
        let valueEnd = valueStart
        while (
            valueEnd < output.length &&
            output[valueEnd] !== ';' &&
            output[valueEnd] !== '{' &&
            output[valueEnd] !== '}'
        ) {
            valueEnd += 1
        }
        const value = output.slice(valueStart, valueEnd)
        const allowed = allowMask.slice(match.index, valueEnd).includes('A')
        if (allowed || isInsideDarkTheme(output, match.index)) {
            continue
        }
        if (isHardcodedLightText(value)) {
            violations.push({
                file,
                line: lineAt(output, match.index),
                value: value.trim(),
            })
        }
    }

    return violations
}

export function extractCssChunks(source, filename = '') {
    if (filename.endsWith('.css')) {
        return [source]
    }
    const chunks = []
    STYLE_BLOCK_RE.lastIndex = 0
    let match
    while ((match = STYLE_BLOCK_RE.exec(source))) {
        chunks.push(match[1])
    }
    return chunks
}

export function findHardcodedLightTextInInlineStyles(source, file = '') {
    const violations = []
    const inlineStyle = /style\s*=\s*(["'])([\s\S]*?)\1/gi
    let match

    while ((match = inlineStyle.exec(source))) {
        const style = match[2]
        const colorDecl = /(?:^|;)\s*color\s*:\s*([^;]+)/gi
        let colorMatch
        while ((colorMatch = colorDecl.exec(style))) {
            const value = colorMatch[1]
            if (isHardcodedLightText(value)) {
                violations.push({
                    file,
                    line: lineAt(source, match.index + colorMatch.index),
                    value: value.trim(),
                })
            }
        }
    }

    return violations
}

async function listSourceFiles(root) {
    const files = []

    async function walk(dir) {
        const entries = await fs.readdir(dir, { withFileTypes: true })
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name)
            if (entry.isDirectory()) {
                if (
                    entry.name === 'node_modules' ||
                    entry.name === 'dist' ||
                    entry.name === '.astro'
                ) {
                    continue
                }
                await walk(fullPath)
            } else if (CSS_LIKE.test(entry.name)) {
                files.push(fullPath)
            }
        }
    }

    await walk(root)
    return files
}

export async function scanThemeContrast(srcRoot, repoRoot = process.cwd()) {
    const files = await listSourceFiles(srcRoot)
    const violations = []

    for (const filePath of files) {
        const rel = normalizeRel(filePath, repoRoot)
        if (FILE_ALLOWLIST.has(rel)) {
            continue
        }
        const source = await fs.readFile(filePath, 'utf8')
        const chunks = extractCssChunks(source, filePath)
        for (const chunk of chunks) {
            violations.push(...findHardcodedLightTextInCss(chunk, rel))
        }
        if (!filePath.endsWith('.css')) {
            violations.push(...findHardcodedLightTextInInlineStyles(source, rel))
        }
    }

    return violations
}

function formatViolations(violations) {
    return violations
        .map(
            (item) =>
                `  ${item.file}:${item.line}  color: ${item.value}\n` +
                `    use var(--fs-color-text|heading|muted|dimmed) or var(--fs-color-on-image|on-accent)`
        )
        .join('\n')
}

async function main() {
    const srcRoot = path.resolve(process.argv[2] ?? 'src')
    const violations = await scanThemeContrast(srcRoot)
    if (violations.length > 0) {
        console.error(
            `[theme-contrast] ${violations.length} hardcoded light text color(s) will vanish in light theme:\n${formatViolations(violations)}`
        )
        process.exit(1)
    }
    console.log('[theme-contrast] ok — text colors use theme tokens')
}

if (import.meta.url === pathToFileURL(path.resolve(process.argv[1] ?? '')).href) {
    await main()
}
