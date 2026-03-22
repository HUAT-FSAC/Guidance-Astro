import { defineConfig } from 'astro/config'
import cloudflare from '@astrojs/cloudflare'
import starlight from '@astrojs/starlight'
import sidebar from './.config/sidebar.mjs'

export default defineConfig({
    adapter: cloudflare({ imageService: 'compile' }),
    site: 'https://huat-fsac.eu.org',
    trailingSlash: 'always',
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
        '/en/docs-center/入门/': '/en/docs-center/onboarding/',
        '/en/docs-center/流程与模板/': '/en/docs-center/processes-and-templates/',
        '/en/docs-center/资源中心/': '/en/docs-center/resource-hub/',
        '/en/docs-center/体验与反馈/': '/en/docs-center/feedback-and-experience/',
        '/en/docs-center/运营与协作/': '/en/docs-center/operations-and-collaboration/',
        '/en/docs-center/运营与协作/项目进度看板/':
            '/en/docs-center/operations-and-collaboration/project-progress-board/',
    },
    integrations: [
        starlight({
            title: { zh: 'HUAT FSAC', en: 'HUAT FSAC' },
            description:
                'HUAT FSAC documentation site for autonomous Formula Student engineering, race-car development, and team knowledge sharing.',
            favicon: '/favicon.png',
            defaultLocale: 'root',
            locales: {
                root: { label: '中文', lang: 'zh' },
                en: { label: 'English', lang: 'en' },
            },
            customCss: ['./src/styles/docs-global.css', './src/styles/code-blocks.css'],
            head: [
                {
                    tag: 'meta',
                    attrs: { 'http-equiv': 'X-Content-Type-Options', content: 'nosniff' },
                },
                { tag: 'meta', attrs: { 'http-equiv': 'X-Frame-Options', content: 'SAMEORIGIN' } },
                {
                    tag: 'meta',
                    attrs: { 'http-equiv': 'X-XSS-Protection', content: '1; mode=block' },
                },
                {
                    tag: 'meta',
                    attrs: { name: 'referrer', content: 'strict-origin-when-cross-origin' },
                },
                {
                    tag: 'meta',
                    attrs: {
                        name: 'description',
                        content:
                            'HUAT FSAC documentation hub for Formula Student, autonomous racing systems, engineering guides, and team knowledge.',
                    },
                },
                {
                    tag: 'meta',
                    attrs: {
                        name: 'keywords',
                        content:
                            'HUAT, FSAC, Formula Student, autonomous racing, student engineering, 湖北汽车工业学院',
                    },
                },
                { tag: 'meta', attrs: { property: 'og:title', content: 'HUAT FSAC' } },
                {
                    tag: 'meta',
                    attrs: {
                        property: 'og:description',
                        content:
                            'Student-built autonomous Formula Student race cars, technical documentation, and team knowledge from HUAT FSAC.',
                    },
                },
                { tag: 'meta', attrs: { property: 'og:type', content: 'website' } },
                { tag: 'meta', attrs: { property: 'og:url', content: 'https://huat-fsac.eu.org' } },
                {
                    tag: 'meta',
                    attrs: {
                        property: 'og:image',
                        content: 'https://huat-fsac.eu.org/og-image.png',
                    },
                },
                { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' } },
                { tag: 'meta', attrs: { name: 'twitter:title', content: 'HUAT FSAC' } },
                {
                    tag: 'meta',
                    attrs: {
                        name: 'twitter:description',
                        content:
                            'Student-built autonomous Formula Student race cars, technical documentation, and team knowledge from HUAT FSAC.',
                    },
                },
                {
                    tag: 'meta',
                    attrs: {
                        name: 'twitter:image',
                        content: 'https://huat-fsac.eu.org/og-image.png',
                    },
                },
                {
                    tag: 'link',
                    attrs: { rel: 'dns-prefetch', href: 'https://images.unsplash.com' },
                },
                { tag: 'link', attrs: { rel: 'dns-prefetch', href: 'https://cloud.umami.is' } },
                { tag: 'link', attrs: { rel: 'preconnect', href: 'https://images.unsplash.com' } },
                { tag: 'link', attrs: { rel: 'preconnect', href: 'https://cloud.umami.is' } },
                {
                    tag: 'link',
                    attrs: { rel: 'preload', href: '/favicon.png', as: 'image', type: 'image/png' },
                },
                {
                    tag: 'link',
                    attrs: {
                        rel: 'preload',
                        href: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap',
                        as: 'style',
                        crossorigin: 'anonymous',
                    },
                },
                {
                    tag: 'script',
                    attrs: {
                        src: 'https://cloud.umami.is/script.js',
                        'data-website-id': import.meta.env.UMAMI_WEBSITE_ID || '',
                        defer: true,
                    },
                },
                { tag: 'link', attrs: { rel: 'manifest', href: '/manifest.json' } },
                { tag: 'meta', attrs: { name: 'theme-color', content: '#f39c12' } },
                { tag: 'link', attrs: { rel: 'apple-touch-icon', href: '/favicon.png' } },
                {
                    tag: 'script',
                    content: `(function() {
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
                    })();`,
                },
                {
                    tag: 'script',
                    content: `if ('serviceWorker' in navigator) {
                        window.addEventListener('load', function() {
                            navigator.serviceWorker.register('/sw.js')
                                .then(function(registration) {
                                    console.log('[SW] Registration successful:', registration.scope);
                                })
                                .catch(function(error) {
                                    console.log('[SW] Registration failed:', error);
                                });
                        });
                    }`,
                },
            ],
            logo: { src: './src/assets/logo-canvas.png' },
            social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/HUAT-FSAC' }],
            tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 4 },
            components: {
                PageFrame: './src/components/overrides/PageFrame.astro',
                MarkdownContent: './src/components/overrides/MarkdownContent.astro',
                PageTitle: './src/components/overrides/PageTitle.astro',
            },
            sidebar,
            lastUpdated: true,
            pagination: false,
            pagefind: true,
        }),
    ],
})
