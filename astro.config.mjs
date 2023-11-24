import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://huat-fsac.eu.org',
	trailingSlash: 'always',
	integrations: [starlight({
		title: 'FSAC AST Docs',
		favicon: '/favicon.png',
		head: [
			{
				tag: 'script',
				attrs: {
					src: 'https://analytics.eu.umami.is/script.js',
					'data-website-id': 'e86c2669-d540-49f3-94f4-a7fe7284ccb4',
				},
			}
		],
		logo: {
			src: './src/assets/logo-canvas.png'
		},
		social: {
			github: 'https://github.com/HUAT-FSAC'
		},
		tableOfContents: {
			minHeadingLevel: 2,
			maxHeadingLevel: 4,
		},
		sidebar: [{
			label: '📁 感知融合',
			collapsed: true,
			autogenerate: {
				directory: '感知'
			}
		}, {
			label: '📁 定位建图',
			collapsed: true,
			autogenerate: {
				directory: '定位建图'
			}
		}, {
			label: '📁 仿真测试',
			collapsed: true,
			autogenerate: {
				directory: '仿真测试'
			}
		}, {
			label: '📁 规划控制',
			collapsed: true,
			autogenerate: {
				directory: '规控'
			}
		}, {
			label: '📁 综合',
			collapsed: true,
			autogenerate: {
				directory: '综合'
			}
		}, {
			label: 'HUAT 无人车队开源项目',
			link: '/open-source-projects'
		}, {
			label: '2024 无人系统部学习指南',
			link: '/2024-learning-roadmap'
		}],
		lastUpdated: true,
		pagination: false,
	}),
	],
});
