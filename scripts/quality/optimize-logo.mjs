/**
 * T-035: Optimize the site logo (231KB regression fix).
 *
 * Background
 * ----------
 * `public/assets/logo.jpg` was, despite the extension, a 1374x539 **PNG with an alpha
 * channel** (231,335 B). Only ~6.7% of its pixels are opaque — it is a dark-red wordmark
 * on a transparent background, rendered on top of a theme-dependent header background
 * (`#ffffff` / `var(--fs-bg-surface)` for light, dark for `data-theme="dark"`).
 *
 * That has one hard constraint: **alpha must survive**. Flattening the fallback to a JPEG
 * bakes the transparent area into a solid colour (sharp's default is black), which turns
 * the logo into a black or white rectangle in whichever theme does not match the matte.
 *
 * Strategy
 * --------
 *  - Master source lives at `src/assets/logo-master.png` (never served, so the build stays
 *    idempotent — running this script twice produces identical output).
 *  - Emit three alpha-preserving derivatives into `public/assets/`:
 *      logo.avif  (primary, best compression)
 *      logo.webp  (secondary, near-universal support)
 *      logo.png   (fallback for the remaining ~3%, still transparent)
 *  - Downscale to 512px wide: the header renders the logo at 72px tall (~183px wide), so
 *    512px still covers 2x DPR with headroom.
 *
 * Usage: node scripts/quality/optimize-logo.mjs
 */
import sharp from 'sharp'
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const masterPath = join(repoRoot, 'src', 'assets', 'logo-master.png')
const outDir = join(repoRoot, 'public', 'assets')

const TARGET_WIDTH = 512

/** Soft ceilings; exceeded values are reported so the gate stays honest. */
const BUDGET_KB = { png: 40, webp: 30, avif: 20 }

function toKB(bytes) {
    return Number((bytes / 1024).toFixed(2))
}

const master = await readFile(masterPath)
const meta = await sharp(master).metadata()
if (!meta.hasAlpha) {
    throw new Error(`Expected an alpha channel in ${masterPath} (got ${meta.channels} channels)`)
}
console.log(
    `Source: logo-master.png ${meta.width}x${meta.height} ${meta.format} alpha=${meta.hasAlpha} ${toKB(master.length)} KB`
)

const targetHeight = Math.round((meta.height * TARGET_WIDTH) / meta.width)

/** Shared pipeline: keep alpha, downscale, never upscale. */
const base = () => sharp(master).resize({ width: TARGET_WIDTH, withoutEnlargement: true })

const outputs = {
    png: await base()
        .png({ quality: 90, palette: true, effort: 10, compressionLevel: 9, alphaQuality: 90 })
        .toBuffer(),
    webp: await base().webp({ quality: 82, alphaQuality: 90, effort: 5 }).toBuffer(),
    avif: await base().avif({ quality: 55, effort: 4 }).toBuffer(),
}

const failures = []
for (const [ext, buf] of Object.entries(outputs)) {
    const file = join(outDir, `logo.${ext}`)
    await writeFile(file, buf)

    const info = await sharp(buf).metadata()
    const kb = toKB(buf.length)
    const saved = `${(100 - (buf.length / master.length) * 100).toFixed(1)}%`
    console.log(
        `Wrote logo.${ext} ${info.width}x${info.height} ${info.format} alpha=${info.hasAlpha} ${kb} KB (${saved} smaller)`
    )

    if (!info.hasAlpha) {
        failures.push(`logo.${ext} lost its alpha channel — logo would gain an opaque matte`)
    }
    if (kb > BUDGET_KB[ext]) {
        failures.push(`logo.${ext} ${kb} KB > budget ${BUDGET_KB[ext]} KB`)
    }
}

if (failures.length > 0) {
    console.error('[optimize-logo] Check failed:')
    failures.forEach((item) => console.error(`- ${item}`))
    process.exit(1)
}

console.log(
    `[optimize-logo] OK — served bytes are now ${toKB(outputs.avif.length)}–${toKB(outputs.webp.length)} KB ` +
        `(was ${toKB(master.length)} KB). Intrinsic size ${TARGET_WIDTH}x${targetHeight}.`
)
