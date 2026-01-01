import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import sidebar from "./sidebar.mjs";

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
			sidebar,
			lastUpdated: true,
			pagination: false,
		}),
	],
});

