import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
	site: "https://huat-fsac.eu.org",
	trailingSlash: "always",
	integrations: [
		starlight({
			title: "FSAC AST Docs",
			favicon: "/favicon.png",
			customCss: [
				// 全局文档样式
				"./src/styles/docs-global.css",
				// 代码块样式增强
				"./src/styles/code-blocks.css",
			],
			head: [
				{
					tag: "script",
					attrs: {
						src: "https://cloud.umami.is/script.js",
						"data-website-id": "e25fd750-bde4-4599-a440-99ed5a381af0",
					},
				},
			],
			logo: { src: "./src/assets/logo-canvas.png" },
			social: [{ icon: "github", label: "GitHub", href: "https://github.com/HUAT-FSAC" }],
			tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 4 },
			// 自定义组件覆盖
			components: {
				// 添加图片灯箱等全局功能
				PageFrame: './src/components/overrides/PageFrame.astro',
			},
			sidebar: [
				{
					label: "🏎️ 2025 赛季文档",
					collapsed: false,
					items: [
						{ label: "📁 算法部 - 感知", collapsed: true, autogenerate: { directory: "2025/感知" } },
						{ label: "📁 算法部 - 定位建图", collapsed: true, autogenerate: { directory: "2025/定位建图" } },
						{ label: "📁 算法部 - 规控", collapsed: true, autogenerate: { directory: "2025/规控" } },
						{ label: "📁 算法部 - 仿真测试", collapsed: true, autogenerate: { directory: "2025/仿真测试" } },
						{ label: "📁 电气部", collapsed: true, autogenerate: { directory: "2025/电气" } },
						{ label: "📁 机械部", collapsed: true, autogenerate: { directory: "2025/机械" } },
						{ label: "📁 项管部", collapsed: true, autogenerate: { directory: "2025/项管" } },
					],
				},
				{
					label: "📚 2024 赛季文档",
					collapsed: true,
					items: [
						{ label: "📁 感知融合", collapsed: true, autogenerate: { directory: "感知" } },
						{ label: "📁 定位建图", collapsed: true, autogenerate: { directory: "定位建图" } },
						{ label: "📁 仿真测试", collapsed: true, autogenerate: { directory: "仿真测试" } },
						{ label: "📁 规划控制", collapsed: true, autogenerate: { directory: "规控" } },
						{ label: "📁 综合", collapsed: true, autogenerate: { directory: "综合" } },
					],
				},
				{ label: "HUAT 无人车队开源项目", link: "/open-source-projects/" },
				{ label: "2024 无人系统部学习指南", link: "/2024-learning-roadmap/" },
			],
			lastUpdated: true,
			pagination: false,
		}),
	],
});
