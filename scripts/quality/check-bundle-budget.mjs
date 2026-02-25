import fs from 'node:fs/promises'
import path from 'node:path'

const distDir = path.join('dist', '_astro')

const budgets = {
    maxTotalJsKB: Number(process.env.BUNDLE_BUDGET_TOTAL_JS_KB ?? 380),
    maxTotalCssKB: Number(process.env.BUNDLE_BUDGET_TOTAL_CSS_KB ?? 140),
    maxSingleJsKB: Number(process.env.BUNDLE_BUDGET_SINGLE_JS_KB ?? 100),
    maxSingleCssKB: Number(process.env.BUNDLE_BUDGET_SINGLE_CSS_KB ?? 95),
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
        failures.push(
            `Total JS exceeds budget: ${stats.totalJsKB} KB > ${budgets.maxTotalJsKB} KB`
        )
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

    console.log('[bundle-budget] Summary')
    console.log(`- Total JS: ${stats.totalJsKB} KB`)
    console.log(`- Total CSS: ${stats.totalCssKB} KB`)
    console.log(`- Largest JS: ${stats.largestJsKB} KB`)
    console.log(`- Largest CSS: ${stats.largestCssKB} KB`)
    console.log(`- Top JS: ${formatTopItems(stats.jsStats)}`)
    console.log(`- Top CSS: ${formatTopItems(stats.cssStats)}`)

    if (failures.length > 0) {
        console.error('[bundle-budget] Budget check failed:')
        failures.forEach((item) => console.error(`- ${item}`))
        process.exit(1)
    }

    console.log('[bundle-budget] Budget check passed.')
}

run()
