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
 * Usage: pnpm assets:logo   (等价于 node scripts/quality/optimize-logo.mjs)
 */
import sharp from 'sharp'
import { access, mkdir, readFile, writeFile } from 'node:fs/promises'
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

function fail(message) {
    console.error(`[optimize-logo] ${message}`)
    process.exit(1)
}

// 母版是构建期源(不随站点发布)。缺失时给出可执行的恢复指令,而不是抛一个裸 ENOENT。
try {
    await access(masterPath)
} catch {
    fail(
        `母版缺失:${masterPath}\n` +
            `  恢复:git show HEAD:src/assets/logo-master.png > src/assets/logo-master.png`
    )
}

// public/assets 由本脚本按需创建,避免新克隆的仓库首次运行直接崩在 writeFile 上。
await mkdir(outDir, { recursive: true })

const master = await readFile(masterPath)

let meta
try {
    meta = await sharp(master).metadata()
} catch (error) {
    fail(`母版不是可读的图片:${masterPath} (${error.message})`)
}

// 边界:0 尺寸/损坏文件会让后面的缩放与比例计算产出 NaN。
if (!meta.width || !meta.height) {
    fail(`母版尺寸异常:${meta.width}x${meta.height}`)
}
if (!meta.hasAlpha) {
    fail(`母版缺少 alpha 通道(${meta.channels} channels)——压平后 logo 会带上不透明底色`)
}

console.log(
    `Source: logo-master.png ${meta.width}x${meta.height} ${meta.format} alpha=${meta.hasAlpha} ${toKB(master.length)} KB`
)

const targetHeight = Math.round((meta.height * TARGET_WIDTH) / meta.width)

/** Shared pipeline: keep alpha, downscale, never upscale. */
const base = () => sharp(master).resize({ width: TARGET_WIDTH, withoutEnlargement: true })

/** 逐个编码并保留格式名,便于定位是哪一个编码器/shrp 插件出问题。 */
async function encode(ext, encodeFn) {
    try {
        return await encodeFn()
    } catch (error) {
        fail(`编码 logo.${ext} 失败:${error.message}`)
    }
}

const outputs = {
    png: await encode('png', () =>
        base()
            .png({ quality: 90, palette: true, effort: 10, compressionLevel: 9, alphaQuality: 90 })
            .toBuffer()
    ),
    webp: await encode('webp', () =>
        base().webp({ quality: 82, alphaQuality: 90, effort: 5 }).toBuffer()
    ),
    avif: await encode('avif', () => base().avif({ quality: 55, effort: 4 }).toBuffer()),
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
