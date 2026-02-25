import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'
import sidebar from './.config/sidebar.mjs'

// https://astro.build/config
export default defineConfig({
    site: 'https://huat-fsac.eu.org',
    trailingSlash: 'always',
    redirects: {
        '/docs/': '/',
        '/2024-learning-roadmap/': '/archive/2024/2024-learning-roadmap/',
        '/2025/感知/': '/archive/2025/sensing/',
        '/2025/定位建图/': '/archive/2025/localization-mapping/',
        '/2025/规控/': '/archive/2025/planning-control/',
        '/2025/仿真测试/': '/archive/2025/simulation/',
        '/2025/电气/': '/archive/2025/electrical/',
        '/2025/机械/': '/archive/2025/mechanical/',
        '/2025/项管/': '/archive/2025/management/',
        '/感知/': '/archive/sensing/',
        '/定位建图/': '/archive/localization-mapping/',
        '/规控/': '/archive/planning-control/',
        '/仿真测试/': '/archive/simulation/',
        '/综合/': '/archive/general/',
        '/文档中心/': '/docs-center/',
    },
    integrations: [
        starlight({
            title: 'FSAC AST Docs',
            favicon: '/favicon.png',
            customCss: [
                // 全局文档样式
                './src/styles/docs-global.css',
                // 代码块样式增强
                './src/styles/code-blocks.css',
            ],
            head: [
                // 安全头部
                {
                    tag: 'meta',
                    attrs: {
                        'http-equiv': 'X-Content-Type-Options',
                        content: 'nosniff',
                    },
                },
                {
                    tag: 'meta',
                    attrs: {
                        'http-equiv': 'X-Frame-Options',
                        content: 'SAMEORIGIN',
                    },
                },
                {
                    tag: 'meta',
                    attrs: {
                        'http-equiv': 'X-XSS-Protection',
                        content: '1; mode=block',
                    },
                },
                {
                    tag: 'meta',
                    attrs: {
                        name: 'referrer',
                        content: 'strict-origin-when-cross-origin',
                    },
                },
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
                        content: 'https://huat-fsac.eu.org/og-image.png',
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
                        content: 'https://huat-fsac.eu.org/og-image.png',
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
                // 性能优化：预加载关键资源
                {
                    tag: 'link',
                    attrs: {
                        rel: 'preload',
                        href: '/favicon.png',
                        as: 'image',
                        type: 'image/png',
                    },
                },
                // 性能优化：预加载首屏字体（如果使用）
                {
                    tag: 'link',
                    attrs: {
                        rel: 'preload',
                        href: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap',
                        as: 'style',
                        crossorigin: 'anonymous',
                    },
                },
                // 分析脚本
                {
                    tag: 'script',
                    attrs: {
                        src: 'https://cloud.umami.is/script.js',
                        'data-website-id':
                            import.meta.env.UMAMI_WEBSITE_ID || '',
                        defer: true,
                    },
                },
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
                        content: '#f39c12',
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
        }),
    ],
})
