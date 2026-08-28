import { defineConfig } from 'astro/config'
import cloudflare from '@astrojs/cloudflare'
import starlight from '@astrojs/starlight'
import sidebar from './.config/sidebar.mjs'
import filterKnownBuildWarnings from './src/integrations/filter-known-build-warnings'
import dedupeCss from './src/integrations/dedupe-css'
import purgecss from 'vite-plugin-purgecss'

// https://astro.build/config
export default defineConfig({
    output: 'server',
    adapter: cloudflare({ imageService: 'compile' }),
    site: 'https://huat-fsac.eu.org',
    trailingSlash: 'always',
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
                        /^__/,
                        /^lang-/,
                        /^_astro/,
                        'data-theme',
                        // Starlight 布局（无前缀，易被误删）
                        /^sidebar/,
                        /^main-pane/,
                        /^right-sidebar/,
                        /^page/,
                        /^content/,
                        /^header/,
                        /^footer/,
                        /^pagination/,
                        /^hero/,
                        /^card/,
                        /^markdown/,
                        /^not-content/,
                        /^admonition/,
                        /^starlight-toc/,
                        /^starlight-aside/,
                        /^starlight-tabs/,
                        /^search/,
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
                        // Starlight Search
                        /^site-search/,
                        'site-search',
                        /^pagefind/,
                        'pagefind-ui',
                        /^dialog/,
                        'dialog',
                        'data-open-modal',
                        'data-close-modal',
                        'data-search-modal-open',
                    ],
                    deep: [
                        /sidebar/,
                        /main-pane/,
                        /page/,
                        /header/,
                        /search/,
                        /sl-/,
                        /site-search/,
                        /pagefind/,
                        /dialog/,
                    ],
                    greedy: [/sl-/, /starlight/, /site-search/, /pagefind/, /sidebar/, /main-pane/],
                },
            }),
        ],
    },
    redirects: {
        '/docs/': '/',
        '/2024-learning-roadmap/': '/archive/2024/2024-learning-roadmap/',
        '/2025/感知/': '/archive/2025/sensing/',
        '/2025/感知/激光雷达/': '/archive/2025/sensing/激光雷达/',
        '/2025/感知/摄像头/': '/archive/2025/sensing/摄像头/',
        '/2025/定位建图/': '/archive/2025/localization-mapping/',
        '/2025/定位建图/ins5711daa/': '/archive/2025/localization-mapping/ins5711daa/',
        '/2025/定位建图/学习路线/': '/archive/2025/localization-mapping/学习路线/',
        '/2025/定位建图/记录/': '/archive/2025/localization-mapping/记录/',
        '/2025/规控/': '/archive/2025/planning-control/',
        '/2025/规控/控制/': '/archive/2025/planning-control/控制/',
        '/2025/规控/直线/': '/archive/2025/planning-control/直线/',
        '/2025/规控/高速循迹/': '/archive/2025/planning-control/高速循迹/',
        '/2025/仿真测试/': '/archive/2025/simulation/',
        '/2025/仿真测试/仿真/': '/archive/2025/simulation/仿真/',
        '/2025/电气/': '/archive/2025/electrical/',
        '/2025/电气/电池箱/': '/archive/2025/electrical/电池箱/',
        '/2025/电气/硬件/': '/archive/2025/electrical/硬件/',
        '/2025/电气/线束/': '/archive/2025/electrical/线束/',
        '/2025/电气/软件/': '/archive/2025/electrical/软件/',
        '/2025/机械/': '/archive/2025/mechanical/',
        '/2025/机械/传动/': '/archive/2025/mechanical/传动/',
        '/2025/机械/制动/': '/archive/2025/mechanical/制动/',
        '/2025/机械/车架车身/': '/archive/2025/mechanical/车架车身/',
        '/2025/机械/转向悬架/': '/archive/2025/mechanical/转向悬架/',
        '/2025/项管/': '/archive/2025/management/',
        '/2025/项管/新媒体/': '/archive/2025/management/新媒体/',
        '/2025/项管/营销/': '/archive/2025/management/营销/',
        '/2025/项管/运营/': '/archive/2025/management/运营/',
        '/感知/': '/archive/sensing/',
        '/定位建图/': '/archive/localization-mapping/',
        '/规控/': '/archive/planning-control/',
        '/仿真测试/': '/archive/simulation/',
        '/综合/': '/archive/general/',
        '/文档中心/': '/docs-center/',
    },
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
                // SEO 元数据
                {
                    tag: 'meta',
                    attrs: {
                        name: 'description',
                        content:
                            'HUAT FSAC - 湖北汽车工业学院方程式赛车队。我们是一群充满激情的工程学子，致力于设计、制造并驾驶无人驾驶方程式赛车。',
                    },
                },
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
                        property: 'og:title',
                        content: 'HUAT FSAC - 方程式赛车队',
                    },
                },
                {
                    tag: 'meta',
                    attrs: {
                        property: 'og:description',
                        content:
                            '我们是一群充满激情的工程学子，致力于设计、制造并驾驶无人驾驶方程式赛车。在 Formula Student 赛场上，我们追求卓越，挑战极限。',
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
                        name: 'twitter:title',
                        content: 'HUAT FSAC - 方程式赛车队',
                    },
                },
                {
                    tag: 'meta',
                    attrs: {
                        name: 'twitter:description',
                        content:
                            '我们是一群充满激情的工程学子，致力于设计、制造并驾驶无人驾驶方程式赛车。在 Formula Student 赛场上，我们追求卓越，挑战极限。',
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
    ],
})
