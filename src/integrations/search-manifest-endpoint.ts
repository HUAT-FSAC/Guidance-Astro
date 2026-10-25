/**
 * 构建期搜索路由清单端点（#262 / #281 / D-022）。
 *
 * 仅由 `src/integrations/search-routes.ts` 在 `astro build` 命令下以
 * `/_search-manifest.json` 注入并预渲染为静态 JSON：
 * - 这是构建元数据，不是把任何现有文档或动态页面变静态；
 * - 直接消费已安装 Starlight 导出的真实 routes（含真实 id/locale/entryMeta/isFallback 与 entry.data），
 *   真实英文正文（无论是否与中文同名）均按正文规则收录，仅排除真正 isFallback、draft、pagefind:false、404；
 * - 产物由 `scripts/search/build-index.ts` 读取并在收尾时删除，
 *   不进入发布资产，也不进入 sitemap（注入路由不在 docs 内容页清单内）。
 */
import type { APIRoute } from 'astro'
import { routes } from '@astrojs/starlight/utils/routing'

import { classifyRoutes } from './search-manifest-filter'

export const prerender = true

export const GET: APIRoute = async () => {
    const classified = classifyRoutes(routes)

    return new Response(JSON.stringify(classified), {
        headers: { 'content-type': 'application/json; charset=utf-8' },
    })
}
