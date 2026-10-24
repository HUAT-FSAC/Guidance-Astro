/**
 * 构建期搜索路由清单集成（#262 / D-022）。
 *
 * 仅在 `astro build` 命令下注入 `/_search-manifest.json` 预渲染端点；
 * dev / preview 不注入，生产运行时不存在该端点。
 * Starlight 内置 pagefind 保持 false（astro.config.mjs），本集成不预渲染任何现有页面。
 */
import { fileURLToPath } from 'node:url'

import type { AstroIntegration } from 'astro'

export default function searchRoutes(): AstroIntegration {
    return {
        name: 'huat:search-routes',
        hooks: {
            'astro:config:setup': ({ command, injectRoute }) => {
                if (command !== 'build') return
                injectRoute({
                    pattern: '/_search-manifest.json',
                    entrypoint: fileURLToPath(
                        new URL('./search-manifest-endpoint.ts', import.meta.url)
                    ),
                    prerender: true,
                })
            },
        },
    }
}
