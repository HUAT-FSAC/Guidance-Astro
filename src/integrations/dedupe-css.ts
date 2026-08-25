import type { AstroIntegration } from 'astro'
import { readdir, readFile, unlink, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

/**
 * 构建后 CSS 去重
 *
 * Vite 在 cssCodeSplit 下会为不同入口产出内容重叠的样式资产
 * （实测：同一份 Hero 样式被打进两个文件，其一为另一的规则子集），
 * SSR manifest 会把两份同时挂到页面上，造成双倍传输。
 *
 * 本集成在 build:done 时：
 *   1. 对 _astro/*.css 做规则级子集比较（压缩后按 `}` 切分、去空白）；
 *   2. 若 B ⊆ A，则把全构建产物中对 B 的引用改写到 A；
 *   3. 删除 B，记录节省的字节数。
 */
function ruleSet(css: string): Set<string> {
    return new Set(
        css
            .split('}')
            .map((rule) => rule.replace(/\s+/g, ''))
            .filter(Boolean)
    )
}

async function listFilesRecursively(directory: string): Promise<string[]> {
    const entries = await readdir(directory, { withFileTypes: true })
    const files = await Promise.all(
        entries.map(async (entry) => {
            const fullPath = join(directory, entry.name)
            if (entry.isDirectory()) return listFilesRecursively(fullPath)
            return [fullPath]
        })
    )
    return files.flat()
}

export default function dedupeCss(): AstroIntegration {
    return {
        name: 'dedupe-css',
        hooks: {
            'astro:build:done': async ({ dir, logger }) => {
                const assetsDir = join(dir.pathname, '_astro')
                let cssFiles: string[]
                try {
                    cssFiles = (await readdir(assetsDir))
                        .filter((name) => name.endsWith('.css'))
                        .map((name) => join(assetsDir, name))
                } catch {
                    logger.warn('No _astro directory found, skipping CSS dedupe')
                    return
                }

                const contents = new Map<string, string>(
                    await Promise.all(
                        cssFiles.map(async (file) => [file, await readFile(file, 'utf8')] as const)
                    )
                )
                const sets = new Map<string, Set<string>>(
                    [...contents].map(([file, css]) => [file, ruleSet(css)])
                )

                // 为每个冗余文件挑选最小的超集作为改写目标，减少对只引用冗余文件的页面带来的额外字节
                const redirect = new Map<string, string>()
                for (const [candidate, candidateSet] of sets) {
                    if (redirect.has(candidate)) continue
                    let best: string | null = null
                    for (const [other, otherSet] of sets) {
                        if (other === candidate || redirect.has(other)) continue
                        if (otherSet.size < candidateSet.size) continue
                        let covered = true
                        for (const rule of candidateSet) {
                            if (!otherSet.has(rule)) {
                                covered = false
                                break
                            }
                        }
                        if (!covered) continue
                        if (!best || otherSet.size < sets.get(best)!.size) best = other
                    }
                    if (best) redirect.set(candidate, best)
                }

                if (redirect.size === 0) {
                    logger.info('CSS assets already deduplicated')
                    return
                }

                // 引用可能出现在 SSR 入口、chunks 以及 HTML 里；统一做精确文件名替换
                const serverDir = join(dir.pathname, '../server')
                const redirectedNames = new Set(
                    [...redirect.keys()].map((file) => file.split('/').pop()!)
                )
                const referenceFiles = (
                    await Promise.all([
                        listFilesRecursively(serverDir),
                        listFilesRecursively(assetsDir),
                    ])
                ).flat()
                let savedBytes = 0
                for (const [redundant, target] of redirect) {
                    const redundantName = redundant.split('/').pop()!
                    const targetName = target.split('/').pop()!
                    for (const file of referenceFiles) {
                        if (file === redundant || redirectedNames.has(file.split('/').pop()!))
                            continue
                        const text = await readFile(file, 'utf8')
                        if (!text.includes(redundantName)) continue
                        await writeFile(file, text.replaceAll(redundantName, targetName), 'utf8')
                    }
                    savedBytes += contents.get(redundant)!.length
                    await unlink(redundant)
                    logger.info(`Deduped ${redundantName} into ${targetName}`)
                }
                logger.info(`CSS dedupe saved ${(savedBytes / 1024).toFixed(1)} KB`)
            },
        },
    }
}
