import type { AstroIntegration } from 'astro'
import { writeFile } from 'node:fs/promises'
import type { RedirectConfig } from 'astro'

function renderRedirectRule(from: string, to: string, status = 301): string {
    // 确保路径格式正确（Cloudflare Pages 规则格式）
    const fromPath = from.endsWith('/') ? from : `${from}/`
    const toPath = to.endsWith('/') ? to : `${to}/`
    return `${fromPath} ${toPath} ${status}`
}

export function renderCloudflareRedirects(redirects: Record<string, RedirectConfig>): string {
    const rules: string[] = []
    rules.push('# Cloudflare Pages Redirects')
    rules.push('# Auto-generated from astro.config.mjs')
    rules.push('')

    for (const [from, config] of Object.entries(redirects)) {
        if (typeof config === 'string') {
            rules.push(renderRedirectRule(from, config))
        } else if (config && typeof config === 'object' && 'destination' in config) {
            const status = config.status || 301
            rules.push(renderRedirectRule(from, config.destination, status))
        }
    }

    // 注意：不添加 /* /404.html 404 catch-all 规则
    // Cloudflare Pages 会自动使用 dist/404.html 处理不存在的路径
    // 手动添加 catch-all 规则会覆盖所有静态文件服务（包括 index.html），导致首页 404

    return rules.join('\n')
}

export default function cloudflareRedirects(): AstroIntegration {
    // 使用闭包存储 redirects 配置
    let redirectsConfig: Record<string, any> = {}

    return {
        name: 'cloudflare-redirects',
        hooks: {
            'astro:config:done': ({ config }) => {
                // 保存 redirects 配置供后续使用
                redirectsConfig = config.redirects || {}
            },
            'astro:build:done': async ({ dir }) => {
                const content = renderCloudflareRedirects(redirectsConfig)
                await writeFile(new URL('./_redirects', dir), content, 'utf8')
            },
        },
    }
}
