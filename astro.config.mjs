import { fileURLToPath } from 'node:url'

import { defineConfig } from 'astro/config'
import cloudflare from '@astrojs/cloudflare'
import sitemap from '@astrojs/sitemap'
import starlight from '@astrojs/starlight'
import sidebar from './.config/sidebar.mjs'
import filterKnownBuildWarnings from './src/integrations/filter-known-build-warnings'
import dedupeCss from './src/integrations/dedupe-css'
import {
    collectContentPagePaths,
    collectNonIndexablePagePaths,
} from './src/integrations/sitemap-paths'
import { siteRedirects } from './src/config/redirects'
import purgecss from 'vite-plugin-purgecss'

/** 站点正式域名（`site` 与 sitemap 的 `customPages` 共用同一来源） */
const SITE_URL = 'https://huat-fsac.eu.org'

/**
 * issue #116：本站是全 SSR（`output: 'server'`），Starlight 内容页走动态 `[...slug]` 路由。
 * `@astrojs/sitemap` 构建期只能枚举「有静态 pathname 的路由」，因此线上 sitemap 曾只剩
 * 8 条 URL（6 个跳转桩 + 2 个静态页），166 个内容页全部缺席。
 *
 * 这里在构建期扫描文件系统，把内容页路径补进 `customPages`，并用 `filter` 剔除跳转桩 /
 * noindex 页（推导规则见 `src/integrations/sitemap-paths.ts`）。
 */
const contentPagePaths = collectContentPagePaths(
    fileURLToPath(new URL('./src/content/docs/', import.meta.url))
)
const nonIndexablePagePaths = new Set(
    collectNonIndexablePagePaths(fileURLToPath(new URL('./src/pages/', import.meta.url)))
)

/**
 * 给 Markdown 渲染出的 <img> 补齐 loading="lazy" / decoding="async"。
 *
 * 背景：Starlight/Astro 默认不会为 markdown 里的图片添加这两个属性。本站文档单篇常含几十张
 * 截图，全部以同步方式发出会与首屏 LCP 争抢带宽；缺少 decoding="async" 时，大图解码也会
 * 占用主线程造成滚动掉帧。
 *
 * 采用手写的递归遍历而非 unist-util-visit，避免为了一个 8 行规则引入新依赖。
 * 只对「未显式声明」的属性兜底：作者手写的 loading="eager" / decoding="sync" 一律保留。
 */
function rehypeImageDefaults() {
    return (tree) => {
        const visit = (node) => {
            if (node && node.type === 'element' && node.tagName === 'img') {
                node.properties ??= {}
                if (node.properties.loading == null) {
                    node.properties.loading = 'lazy'
                }
                if (node.properties.decoding == null) {
                    node.properties.decoding = 'async'
                }
            }
            if (Array.isArray(node?.children)) {
                node.children.forEach(visit)
            }
        }
        visit(tree)
    }
}

// https://astro.build/config
export default defineConfig({
    output: 'server',
    adapter: cloudflare({ imageService: 'compile' }),
    site: SITE_URL,
    trailingSlash: 'always',
    markdown: {
        // ⚠️ 已知弃用：Astro 7 提示 `markdown.rehypePlugins` 已废弃，应改用
        //   `markdown.processor = unified({ rehypePlugins: [...] })`（来自 @astrojs/markdown-remark）。
        // 暂不迁移的两个原因：
        //   1. @astrojs/markdown-remark 尚未安装，为一个 8 行规则新增依赖不划算；
        //   2. Starlight 0.41 仍走旧 remark/rehype 管线，替换 processor 存在与其冲突的风险。
        // 迁移时机：Starlight 跟进 Astro 7 的 unified() 方案后，随大版本升级一起切。
        // 当前表现为构建期一条 deprecation warning，功能不受影响。
        rehypePlugins: [rehypeImageDefaults],
    },
    vite: {
        build: {
            cssCodeSplit: true,
        },
        plugins: [
            purgecss({
                content: [
                    './src/**/*.{astro,ts,tsx}',
                    './node_modules/@astrojs/starlight/**/*.astro',
                    './node_modules/@astrojs/starlight/**/*.ts',
                ],
                // 保留所有 @keyframes，防止 animation 引用断裂
                keyframes: false,
                // 保留 CSS 变量
                variables: false,
                // class 属性选择器（如 [class~="lg:sl-block"]）视为动态属性，不清理
                dynamicAttributes: ['class', 'data-open-modal', 'data-close-modal'],
                safelist: {
                    standard: [
                        /^lab-/,
                        /^sl-/,
                        /^starlight/,
                        /^is-/,
                        /^has-/,
                        /^_astro/,
                        'data-theme',
                        // Starlight 布局（无前缀，易被误删）
                        /^sidebar/,
                        /^main-pane/,
                        /^right-sidebar/,
                        /^page/,
                        /^content/,
                        /^header/,
                        /^pagination/,
                        /^hero/,
                        /^card/,
                        /^not-content/,
                        /^admonition/,
                        /^starlight-aside/,
                        /^kudos/,
                        /^label-icon/,
                        /^caret/,
                        /^breadcrumbs/,
                        /^reading-progress/,
                        /^edit-page/,
                        /^enhanced-content/,
                        /^lightbox/,
                        /^doc-fab/,
                        /^fab-/,
                        /^error-/,
                        /^astro-/,
                        // Starlight Search（pagefind-ui 被 /^pagefind/ 覆盖，不重复列）
                        'site-search',
                        /^pagefind/,
                        /^dialog/,
                        'data-search-modal-open',
                    ],
                    deep: [
                        /sidebar/,
                        /main-pane/,
                        /page/,
                        /header/,
                        // /search/ 已覆盖 site-search，不重复列
                        /search/,
                        /sl-/,
                        /pagefind/,
                        /dialog/,
                        // 全局美化层：伪类/通用选择器无 class 锚点，会被 purgecss 误删
                        /focus-visible/,
                        /scrollbar/,
                        /::selection/,
                    ],
                    greedy: [/sl-/, /starlight/, /site-search/, /pagefind/, /sidebar/, /main-pane/],
                },
            }),
        ],
    },
    redirects: siteRedirects,
    integrations: [
        filterKnownBuildWarnings(),
        dedupeCss(),
        starlight({
            title: '东风 HUAT 无人驾驶车队',
            prerender: false,
            favicon: '/favicon.png',
            customCss: [
                // 自托管字体（替代 Google Fonts 外链）
                './src/styles/fonts.css',
                // 全局文档样式
                './src/styles/docs-global.css',
                // 代码块样式增强
                './src/styles/code-blocks.css',
            ],
            head: [
                // 注意：Starlight 渲染的是 rel="shortcut icon"；如需主题化 favicon，
                // 需先补充 /favicon-dark.png 与 /favicon-light.png 资源
                // SEO 元数据（全局通用标签，各页面标题与描述由 frontmatter 与 Starlight i18n 自动驱动）
                {
                    tag: 'meta',
                    attrs: {
                        name: 'keywords',
                        content:
                            'HUAT, FSAC, Formula Student, 方程式赛车, 无人驾驶, 赛车, 湖北汽车工业学院',
                    },
                },
                {
                    tag: 'meta',
                    attrs: {
                        property: 'og:type',
                        content: 'website',
                    },
                },
                {
                    tag: 'meta',
                    attrs: {
                        property: 'og:url',
                        content: 'https://huat-fsac.eu.org',
                    },
                },
                {
                    tag: 'meta',
                    attrs: {
                        property: 'og:image',
                        content: 'https://huat-fsac.eu.org/og-image.jpg',
                    },
                },
                /* 补齐 og:image 的尺寸与替代文本：
                   缺 width/height 时 Facebook/LinkedIn 首帧无法预留版位，抓取后要二次布局；
                   缺 alt 时分享卡片对读屏用户没有任何可读描述。实际文件为 1200x630 JPEG。 */
                {
                    tag: 'meta',
                    attrs: {
                        property: 'og:image:width',
                        content: '1200',
                    },
                },
                {
                    tag: 'meta',
                    attrs: {
                        property: 'og:image:height',
                        content: '630',
                    },
                },
                {
                    tag: 'meta',
                    attrs: {
                        property: 'og:image:alt',
                        content: 'HUAT FSAC 东风 HUAT 无人驾驶车队',
                    },
                },
                {
                    tag: 'meta',
                    attrs: {
                        property: 'og:site_name',
                        content: 'HUAT FSAC',
                    },
                },
                {
                    tag: 'meta',
                    attrs: {
                        name: 'twitter:card',
                        content: 'summary_large_image',
                    },
                },
                {
                    tag: 'meta',
                    attrs: {
                        name: 'twitter:image',
                        content: 'https://huat-fsac.eu.org/og-image.jpg',
                    },
                },
                // 性能优化：DNS 预解析
                {
                    tag: 'link',
                    attrs: {
                        rel: 'dns-prefetch',
                        href: 'https://images.unsplash.com',
                    },
                },
                {
                    tag: 'link',
                    attrs: {
                        rel: 'dns-prefetch',
                        href: 'https://cloud.umami.is',
                    },
                },
                // 性能优化：预连接
                {
                    tag: 'link',
                    attrs: {
                        rel: 'preconnect',
                        href: 'https://images.unsplash.com',
                    },
                },
                {
                    tag: 'link',
                    attrs: {
                        rel: 'preconnect',
                        href: 'https://cloud.umami.is',
                    },
                },
                // 性能优化：移除 favicon 预加载（32px 图标无需关键路径优先；原 475KB 预加载触发警告）
                // 字体：已迁移至 @fontsource 自托管（src/styles/fonts.css），移除 Google Fonts 外链，避免大陆网络 RTT 与 FOUT
                // 分析脚本：仅当配置真实 ID 时注入，避免空 data-website-id 导致无效请求
                ...(import.meta.env.UMAMI_WEBSITE_ID
                    ? [
                          {
                              tag: 'script',
                              attrs: {
                                  src: 'https://cloud.umami.is/script.js',
                                  'data-website-id': import.meta.env.UMAMI_WEBSITE_ID,
                                  defer: true,
                              },
                          },
                      ]
                    : []),
                // PWA Manifest
                {
                    tag: 'link',
                    attrs: {
                        rel: 'manifest',
                        href: '/manifest.json',
                    },
                },
                // PWA 主题色
                {
                    tag: 'meta',
                    attrs: {
                        name: 'theme-color',
                        content: '#3b82f6',
                    },
                },
                // Apple Touch Icon
                {
                    tag: 'link',
                    attrs: {
                        rel: 'apple-touch-icon',
                        href: '/favicon.png',
                    },
                },
                // 主题初始化脚本 - 防止闪烁
                {
                    tag: 'script',
                    content: `
                        (function() {
                            try {
                                var scheme = localStorage.getItem('huat-color-scheme');
                                var color = localStorage.getItem('huat-theme-color');
                                var accent = localStorage.getItem('huat-theme-accent');
                                if (scheme) {
                                    document.documentElement.setAttribute('data-theme', scheme);
                                } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
                                    document.documentElement.setAttribute('data-theme', 'light');
                                }
                                if (color && accent) {
                                    document.documentElement.style.setProperty('--sl-color-accent', color);
                                    document.documentElement.style.setProperty('--sl-color-accent-high', accent);
                                }
                            } catch (e) {}
                        })();
                    `,
                },
                // Service Worker 注册
                {
                    tag: 'script',
                    content: `
						if ('serviceWorker' in navigator) {
							window.addEventListener('load', function() {
								navigator.serviceWorker.register('/sw.js')
									.then(function(registration) {
										console.log('[SW] Registration successful:', registration.scope);
									})
									.catch(function(error) {
										console.log('[SW] Registration failed:', error);
									});
							});
						}
					`,
                },
            ],
            logo: { src: './src/assets/logo-canvas.png' },
            social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/HUAT-FSAC' }],
            tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 4 },
            // 自定义组件覆盖
            components: {
                Header: './src/components/overrides/Header.astro',
                Hero: './src/components/overrides/Hero.astro',
                // 添加图片灯箱等全局功能
                PageFrame: './src/components/overrides/PageFrame.astro',
                // 自定义内容区域，添加阅读进度和编辑链接
                MarkdownContent: './src/components/overrides/MarkdownContent.astro',
                // 自定义页面标题，添加面包屑导航
                PageTitle: './src/components/overrides/PageTitle.astro',
            },
            sidebar,
            lastUpdated: true,
            pagination: false,
            pagefind: false,
            defaultLocale: 'root',
            locales: {
                root: { label: '简体中文', lang: 'zh-CN' },
                en: { label: 'English', lang: 'en', dir: 'ltr' },
            },
        }),
        // ⚠️ Starlight 检测到用户已注册 `@astrojs/sitemap` 时不会再注册自己的那份
        //    （见 @astrojs/starlight/index.ts 对 integrations 名称的判断），因此下面的
        //    `i18n` 必须与 Starlight 的 getSitemapConfig() 保持等价，否则双语 hreflang
        //    互链会失效。
        sitemap({
            i18n: {
                defaultLocale: 'root',
                locales: { root: 'zh-CN', en: 'en' },
            },
            customPages: contentPagePaths.map((path) => new URL(path, SITE_URL).href),
            filter: (page) =>
                !nonIndexablePagePaths.has(decodeURI(new URL(page, SITE_URL).pathname)),
        }),
    ],
})
