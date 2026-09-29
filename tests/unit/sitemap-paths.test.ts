import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import {
    collectContentPagePaths,
    collectNonIndexablePagePaths,
    docFilePathToSitePath,
    isNoIndexPage,
    isRedirectStub,
    listFiles,
    pageFilePathToSitePath,
} from '../../src/integrations/sitemap-paths'

const contentDir = fileURLToPath(new URL('../../src/content/docs/', import.meta.url))
const pagesDir = fileURLToPath(new URL('../../src/pages/', import.meta.url))

describe('sitemap-paths: docFilePathToSitePath', () => {
    it('折叠 index 并补尾斜杠', () => {
        expect(docFilePathToSitePath('index.mdx')).toBe('/')
        expect(docFilePathToSitePath('news/index.md')).toBe('/news/')
        expect(docFilePathToSitePath('en/index.mdx')).toBe('/en/')
    })

    it('保留多级路径与语言前缀', () => {
        expect(docFilePathToSitePath('cars.mdx')).toBe('/cars/')
        expect(docFilePathToSitePath('en/archive/sensing/resource-roundup.md')).toBe(
            '/en/archive/sensing/resource-roundup/'
        )
    })

    it('保留非 ASCII 路径（仓库存在中文文件名）', () => {
        expect(docFilePathToSitePath('en/archive/2025/electrical/电池箱.mdx')).toBe(
            '/en/archive/2025/electrical/电池箱/'
        )
    })

    it('按 Astro 内容加载器规则逐段 slug（不同步就会写出 404 的 URL）', () => {
        // 实测：/archive/general/ros-入门/ros-toturial-creating-ws-and-package/ 才是 200
        expect(
            docFilePathToSitePath(
                'archive/general/ROS 入门/ros-toturial-creating-ws-and-package.md'
            )
        ).toBe('/archive/general/ros-入门/ros-toturial-creating-ws-and-package/')
        // 实测：/archive/general/vsc-c-c-dev-and-debug/ 才是 200（`++` 被 slug 丢弃）
        expect(docFilePathToSitePath('archive/general/vsc-c-c++-dev-and-debug.mdx')).toBe(
            '/archive/general/vsc-c-c-dev-and-debug/'
        )
    })

    it('排除状态码页、内部文件与非 Markdown', () => {
        expect(docFilePathToSitePath('404.mdx')).toBeNull()
        expect(docFilePathToSitePath('en/404.mdx')).toBeNull()
        expect(docFilePathToSitePath('_draft.mdx')).toBeNull()
        expect(docFilePathToSitePath('guide/_partial.md')).toBeNull()
        expect(docFilePathToSitePath('robots.txt')).toBeNull()
    })

    it('兼容 Windows 风格分隔符', () => {
        expect(docFilePathToSitePath('en\\archive\\sensing\\index.md')).toBe('/en/archive/sensing/')
    })
})

describe('sitemap-paths: pageFilePathToSitePath', () => {
    it('映射静态页面', () => {
        expect(pageFilePathToSitePath('index.astro')).toBe('/')
        expect(pageFilePathToSitePath('showcase-dashboard.astro')).toBe('/showcase-dashboard/')
        expect(pageFilePathToSitePath('en/showcase-dashboard.astro')).toBe(
            '/en/showcase-dashboard/'
        )
        expect(pageFilePathToSitePath('en/archive/sensing/资料汇总.astro')).toBe(
            '/en/archive/sensing/资料汇总/'
        )
    })

    it('非 .astro 返回 null（端点需单独的扩展名约定）', () => {
        expect(pageFilePathToSitePath('rss.xml.ts')).toBeNull()
    })

    it('静态页面路径不做 slug（与内容页相反，保留原始字符）', () => {
        expect(pageFilePathToSitePath('en/archive/general/ROS 入门/x.astro')).toBe(
            '/en/archive/general/ROS 入门/x/'
        )
    })
})

describe('sitemap-paths: 页面可索引性判定', () => {
    it('识别跳转桩', () => {
        expect(isRedirectStub("---\nreturn Astro.redirect('/x/', 302)\n---\n")).toBe(true)
        expect(isRedirectStub('<html><body>hi</body></html>')).toBe(false)
    })

    it('识别 noindex', () => {
        expect(isNoIndexPage('<meta name="robots" content="noindex,follow" />')).toBe(true)
        expect(isNoIndexPage("<meta name='robots' content='noindex'>")).toBe(true)
        expect(isNoIndexPage('<meta name="robots" content="index,follow" />')).toBe(false)
    })
})

describe('sitemap-paths: 针对真实仓库目录', () => {
    const contentPaths = collectContentPagePaths(contentDir)
    const nonIndexablePaths = collectNonIndexablePagePaths(pagesDir)

    it('内容页路径格式规范', () => {
        expect(contentPaths.length).toBeGreaterThan(100)
        for (const path of contentPaths) {
            expect(path.startsWith('/')).toBe(true)
            expect(path.endsWith('/')).toBe(true)
            expect(path).not.toContain('//')
            // slug 之后不应残留空格或 `+`（残留即说明未同步 Astro 的 slug 规则）
            expect(path).not.toContain(' ')
            expect(path).not.toContain('+')
        }
    })

    it('真实仓库中需要 slug 的路径已归一', () => {
        expect(contentPaths).toContain(
            '/archive/general/ros-入门/ros-toturial-creating-ws-and-package/'
        )
        expect(contentPaths).toContain('/archive/general/vsc-c-c-dev-and-debug/')
        expect(contentPaths).toContain('/en/archive/general/vsc-c-c-dev-and-debug/')
        expect(contentPaths.some((path) => path.includes('c++'))).toBe(false)
    })

    it('包含已知内容页', () => {
        expect(contentPaths).toContain('/')
        expect(contentPaths).toContain('/en/')
        expect(contentPaths).toContain('/cars/')
        expect(contentPaths).toContain('/en/news/new-car-development/')
        expect(contentPaths).toContain('/en/archive/sensing/resource-roundup/')
    })

    it('不包含 404 等状态码页', () => {
        expect(contentPaths.some((path) => path.includes('/404/'))).toBe(false)
    })

    it('收集到跳转桩与 noindex 页', () => {
        expect(nonIndexablePaths).toContain('/en/archive/sensing/资料汇总/')
        expect(nonIndexablePaths).toContain('/en/archive/planning-control/资料汇总/')
        expect(nonIndexablePaths).toContain(
            '/en/archive/general/ROS 入门/ros-toturial-creating-ws-and-package/'
        )
        expect(nonIndexablePaths).toContain('/docs/')
        expect(nonIndexablePaths.length).toBe(7)
    })

    it('剔除清单与内容页不重叠（filter 不会误删内容页）', () => {
        const overlap = nonIndexablePaths.filter((path) => contentPaths.includes(path))
        expect(overlap).toEqual([])
    })

    it('listFiles 返回相对路径且不含隐藏文件', () => {
        const files = listFiles(pagesDir)
        expect(files).toContain('docs.astro')
        expect(files.every((file) => !file.startsWith('/'))).toBe(true)
        expect(files.some((file) => file.split('/').some((s) => s.startsWith('.')))).toBe(false)
    })
})
