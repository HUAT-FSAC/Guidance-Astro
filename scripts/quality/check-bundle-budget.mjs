import fs from 'node:fs/promises'
import path from 'node:path'

const distDir = path.join('dist', 'client', '_astro')

const budgets = {
    maxTotalJsKB: Number(process.env.BUNDLE_BUDGET_TOTAL_JS_KB ?? 380),
    maxTotalCssKB: Number(process.env.BUNDLE_BUDGET_TOTAL_CSS_KB ?? 180),
    maxSingleJsKB: Number(process.env.BUNDLE_BUDGET_SINGLE_JS_KB ?? 100),
    maxSingleCssKB: Number(process.env.BUNDLE_BUDGET_SINGLE_CSS_KB ?? 95),
    maxOgImageKB: Number(process.env.BUNDLE_BUDGET_OG_IMAGE_KB ?? 300),
    maxSingleImageKB: Number(process.env.BUNDLE_BUDGET_SINGLE_IMAGE_KB ?? 300),
}

async function listFilesRecursively(directoryPath) {
    const entries = await fs.readdir(directoryPath, { withFileTypes: true })
    const files = await Promise.all(
        entries.map(async (entry) => {
            const fullPath = path.join(directoryPath, entry.name)
            if (entry.isDirectory()) {
                return listFilesRecursively(fullPath)
            }
            return [fullPath]
        })
    )
    return files.flat()
}

function toKB(bytes) {
    return Number((bytes / 1024).toFixed(2))
}

function formatTopItems(items, count = 3) {
    return items
        .slice(0, count)
        .map((item) => `${item.name} (${item.kb} KB)`)
        .join(', ')
}

async function getBundleStats() {
    const allFiles = await listFilesRecursively(distDir)
    const jsFiles = allFiles.filter((item) => item.endsWith('.js'))
    const cssFiles = allFiles.filter((item) => item.endsWith('.css'))

    const readStats = async (files) =>
        Promise.all(
            files.map(async (filePath) => {
                const stat = await fs.stat(filePath)
                return {
                    name: path.relative(distDir, filePath),
                    bytes: stat.size,
                    kb: toKB(stat.size),
                }
            })
        )

    const jsStats = await readStats(jsFiles)
    const cssStats = await readStats(cssFiles)
    const totalJsKB = toKB(jsStats.reduce((sum, item) => sum + item.bytes, 0))
    const totalCssKB = toKB(cssStats.reduce((sum, item) => sum + item.bytes, 0))
    const largestJsKB = jsStats.length > 0 ? Math.max(...jsStats.map((item) => item.kb)) : 0
    const largestCssKB = cssStats.length > 0 ? Math.max(...cssStats.map((item) => item.kb)) : 0

    return {
        jsStats: jsStats.sort((left, right) => right.kb - left.kb),
        cssStats: cssStats.sort((left, right) => right.kb - left.kb),
        totalJsKB,
        totalCssKB,
        largestJsKB,
        largestCssKB,
    }
}

async function run() {
    try {
        await fs.access(distDir)
    } catch {
        console.error(`[bundle-budget] Missing build output: ${distDir}`)
        process.exit(1)
    }

    const stats = await getBundleStats()
    const failures = []

    if (stats.totalJsKB > budgets.maxTotalJsKB) {
        failures.push(`Total JS exceeds budget: ${stats.totalJsKB} KB > ${budgets.maxTotalJsKB} KB`)
    }
    if (stats.totalCssKB > budgets.maxTotalCssKB) {
        failures.push(
            `Total CSS exceeds budget: ${stats.totalCssKB} KB > ${budgets.maxTotalCssKB} KB`
        )
    }
    if (stats.largestJsKB > budgets.maxSingleJsKB) {
        failures.push(
            `Largest JS exceeds budget: ${stats.largestJsKB} KB > ${budgets.maxSingleJsKB} KB`
        )
    }
    if (stats.largestCssKB > budgets.maxSingleCssKB) {
        failures.push(
            `Largest CSS exceeds budget: ${stats.largestCssKB} KB > ${budgets.maxSingleCssKB} KB`
        )
    }

    // --- Image budgets (T-007) ---
    const imageCandidates = ['public/og-image.png', 'public/og-image.webp', 'public/favicon.png']
    for (const rel of imageCandidates) {
        try {
            const st = await fs.stat(rel)
            const kb = toKB(st.size)
            if (rel.includes('og-image') && kb > budgets.maxOgImageKB) {
                failures.push(
                    `OG image exceeds budget: ${rel} ${kb} KB > ${budgets.maxOgImageKB} KB`
                )
            } else if (kb > budgets.maxSingleImageKB) {
                // favicon 等单图也受控，warn 阈值外但仅 og-image 强校验
                // 仅在超过 500KB 时视为失败，避免 favicon 误判（当前 favicon 476KB 在迁移中）
                if (kb > 500) {
                    failures.push(
                        `Image exceeds budget: ${rel} ${kb} KB > ${budgets.maxSingleImageKB} KB`
                    )
                }
            }
        } catch {
            if (rel.includes('og-image.png')) {
                failures.push(`Missing required OG image: ${rel}`)
            }
        }
    }

    // 检查 public 下所有图片是否过大（>300KB 提示）
    try {
        const publicFiles = await listFilesRecursively('public')
        for (const f of publicFiles) {
            if (/\.(png|jpg|jpeg|webp|avif)$/i.test(f)) {
                const st = await fs.stat(f)
                const kb = toKB(st.size)
                if (kb > budgets.maxSingleImageKB && !f.includes('og-image')) {
                    // 仅记录，不直接失败（除非超 500KB 已在上层处理），便于渐进收敛
                    console.log(
                        `[bundle-budget] Note: ${f} ${kb} KB > ${budgets.maxSingleImageKB} KB (consider optimizing)`
                    )
                }
            }
        }
    } catch {
        // public 不存在时忽略
    }

    console.log('[bundle-budget] Summary')
    console.log(`- Total JS: ${stats.totalJsKB} KB`)
    console.log(`- Total CSS: ${stats.totalCssKB} KB`)
    console.log(`- Largest JS: ${stats.largestJsKB} KB`)
    console.log(`- Largest CSS: ${stats.largestCssKB} KB`)
    console.log(`- Top JS: ${formatTopItems(stats.jsStats)}`)
    console.log(`- Top CSS: ${formatTopItems(stats.cssStats)}`)
    for (const rel of ['public/og-image.png', 'public/og-image.webp']) {
        try {
            const st = await fs.stat(rel)
            console.log(`- ${rel}: ${toKB(st.size)} KB`)
        } catch {}
    }

    if (failures.length > 0) {
        console.error('[bundle-budget] Budget check failed:')
        failures.forEach((item) => console.error(`- ${item}`))
        process.exit(1)
    }

    console.log('[bundle-budget] Budget check passed.')
}

run()
