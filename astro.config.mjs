import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://huat-fsac.eu.org',
	trailingSlash: 'always',
	integrations: [starlight({
		title: 'FSAC AST 文档',
		logo: {
			src: './src/assets/logo-canvas.png'
		},
		social: {
			github: 'https://github.com/HUAT-FSAC'
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
			link: 'root/open-source-projects'
		}, {
			label: '2024 预备无人系统部队员学习图',
			link: 'root/2024-learning-roadmap'
		}],
		lastUpdated: true,
		pagination: false,
	}),
	],
});
