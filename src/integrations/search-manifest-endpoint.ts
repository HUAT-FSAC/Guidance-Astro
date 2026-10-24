/**
 * 构建期搜索路由清单端点（#262 / D-022）。
 *
 * 仅由 `src/integrations/search-routes.ts` 在 `astro build` 命令下以
 * `/_search-manifest.json` 注入并预渲染为静态 JSON：
 * - 这是构建元数据，不是把任何现有文档或动态页面变静态；
 * - 数据来自 `astro:content` 的真实 docs 集合（真实 slug / frontmatter），
 *   不从 sitemap 或原始 MDX 猜测；
 * - 产物由 `scripts/search/build-index.ts` 读取并在收尾时删除，
 *   不进入发布资产，也不进入 sitemap（注入路由不在 docs 内容页清单内）。
 */
import type { APIRoute } from 'astro'
import type { CollectionEntry } from 'astro:content'
import { getCollection } from 'astro:content'

import { classifyRoutes } from './search-manifest-filter'

export const prerender = true

export const GET: APIRoute = async () => {
    const docs = await getCollection('docs')
    const classified = classifyRoutes(
        docs.map((entry: CollectionEntry<'docs'>) => ({
            id: entry.id,
            draft: entry.data.draft === true,
            pagefind: entry.data.pagefind !== false,
            sidebarHidden: entry.data.sidebar?.hidden === true,
        }))
    )

    return new Response(JSON.stringify(classified), {
        headers: { 'content-type': 'application/json; charset=utf-8' },
    })
}
