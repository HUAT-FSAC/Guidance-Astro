import { expect, test } from '@playwright/test'

test.describe('导航功能', () => {
    test('中文文档中心导航、面包屑与 chrome 文案', async ({ page }) => {
        await page.setViewportSize({ width: 1600, height: 900 })
        await page.goto('/docs-center/')
        const navLinks = page.locator('nav a, aside a')
        await expect(navLinks.first()).toBeVisible()
        expect(await navLinks.count()).toBeGreaterThan(0)
        await expect(page.locator('h1#_top')).toBeVisible()
        await expect(page.locator('button[data-nav-theme-toggle]').first()).toHaveAttribute(
            'aria-label',
            '切换主题'
        )
        await expect(page.locator('#imageLightbox')).toHaveAttribute('aria-label', '图片预览')
    })

    test('英文侧边栏导航可用', async ({ page }) => {
        await page.setViewportSize({ width: 1600, height: 900 })
        await page.goto('/en/docs-center/')
        const navLinks = page.locator('nav a, aside a')
        await expect(navLinks.first()).toBeVisible()
        await expect(page.locator('body')).toContainText('Overview')
        await expect(page.locator('body')).toContainText('Processes & Templates')
    })

    test('英文文档页包屑、chrome 文案为英文（#204）', async ({ page }) => {
        await page.goto('/en/archive/general/ros-installing/')
        const crumbs = page.locator('nav.breadcrumbs')
        await expect(crumbs).toBeVisible()
        await expect(crumbs).toHaveAttribute('aria-label', 'Breadcrumbs')
        await expect(crumbs).toContainText('Documentation Archive')
        await expect(crumbs).not.toContainText(/[\u4e00-\u9fff]/)
        await expect(page.locator('button[data-nav-theme-toggle]').first()).toHaveAttribute(
            'aria-label',
            'Toggle theme'
        )
        const lightbox = page.locator('#imageLightbox')
        await expect(lightbox).toHaveAttribute('aria-label', 'Image preview')
        await expect(lightbox.locator('.lightbox-close')).toHaveAttribute('aria-label', 'Close')
        await expect(lightbox.locator('.lightbox-prev')).toHaveAttribute(
            'aria-label',
            'Previous image'
        )
        const badge = page.locator('#readingTimeBadge')
        await expect(badge).toContainText(/min read/)
        await expect(badge).not.toContainText(/[\u4e00-\u9fff]/)
    })

    test('旧中文 slug 跳转桩在浏览器生效（代表路径）', async ({ page }) => {
        // 跳转桩是统一的 meta-refresh 桩页（src/content/**/旧中文名.mdx），机制相同，
        // 此处按深度抽 3 条代表；另 5 条的 fallback 链接由 internal-links 单测覆盖
        const cases: Array<[string, RegExp]> = [
            ['/en/docs-center/流程与模板/', /\/en\/docs-center\/processes-and-templates\/?$/],
            ['/en/archive/2025/sensing/激光雷达/', /\/en\/archive\/2025\/sensing\/lidar\/?$/],
            [
                '/en/archive/2025/management/营销/',
                /\/en\/archive\/2025\/management\/business-development\/?$/,
            ],
        ]
        for (const [from, expected] of cases) {
            await test.step(`stub ${from}`, async () => {
                await page.goto(from)
                await expect(page).toHaveURL(expected)
            })
        }
    })

    test('服务端 302 跳转映射正确', async ({ request }) => {
        // .astro 跳转桩（src/pages/en/**）走服务端 302，无需浏览器即可验证
        const cases: Array<[string, RegExp]> = [
            ['/en/archive/sensing/资料汇总/', /\/en\/archive\/sensing\/resource-roundup\/?$/],
            [
                '/en/archive/planning-control/资料汇总/',
                /\/en\/archive\/planning-control\/resource-roundup\/?$/,
            ],
            [
                '/en/archive/general/ROS%20%E5%85%A5%E9%97%A8/ros-toturial-creating-ws-and-package/',
                /\/en\/archive\/general\/ros-basics\/create-workspace-and-package\/?$/,
            ],
            [
                '/en/archive/sensing/%E6%95%B0%E6%8D%AE%E9%9B%86%E7%9B%B8%E5%85%B3/dataset-generating/',
                /\/en\/archive\/sensing\/datasets\/dataset-generation\/?$/,
            ],
        ]
        for (const [from, expected] of cases) {
            await test.step(`302 ${from}`, async () => {
                const res = await request.get(from, { maxRedirects: 0 })
                expect(res.status()).toBe(302)
                expect(res.headers()['location']).toMatch(expected)
            })
        }
    })

    test('英文内容页可访问（HTTP 断言）', async ({ request }) => {
        // SSR 首屏 HTML 即含标题与正文，无需浏览器渲染即可验证内容回归
        const cases: Array<[string, string, string]> = [
            ['/en/archive/2025/', '2025 Season Documentation Center', 'Department Guide'],
            ['/en/archive/general/', 'General Resources', 'tools, environment setup'],
            [
                '/en/archive/general/ros-installing/',
                'ROS1 (Melodic) Installation Guide',
                'ROS1 (Melodic) Installation Guide',
            ],
            [
                '/en/archive/general/ros-basics/create-workspace-and-package/',
                'ROS Basics: Create a Workspace and Run a ROS Package',
                'creating a workspace',
            ],
            ['/en/archive/2025/sensing/lidar/', 'LiDAR', 'Ground-segmentation algorithm'],
            [
                '/en/archive/2025/planning-control/control-fundamentals/',
                'Control Fundamentals',
                'Pure Pursuit',
            ],
            [
                '/en/archive/2025/localization-mapping/ins5711daa/',
                'INS5711DAA INS Setup',
                'RTK service configuration',
            ],
            [
                '/en/archive/2025/localization-mapping/learning-path/',
                'Learning Path',
                'Coordinate transforms',
            ],
            ['/en/archive/2025/simulation/simulation-platforms/', 'Simulation Platforms', 'Fssim'],
            [
                '/en/archive/2025/electrical/software-development/',
                'Software Development',
                'VCU software architecture',
            ],
            [
                '/en/archive/2025/mechanical/braking-system/',
                'Braking System',
                'Emergency Brake System',
            ],
            [
                '/en/archive/2025/management/business-development/',
                'Business Development',
                'Sponsor Tiers',
            ],
            ['/en/archive/sensing/resource-roundup/', 'Resource Roundup', 'Point-cloud'],
            [
                '/en/archive/sensing/datasets/dataset-labeling-basics/',
                'Dataset Labeling',
                'labelme',
            ],
            [
                '/en/archive/simulation/fssim-introduction/',
                'FSSIM Introduction and Quick Start',
                'AMZ Driverless team',
            ],
            ['/en/docs-center/onboarding/', 'Onboarding', 'Onboarding'],
            [
                '/en/news/new-car-development/',
                'Development Begins for the Next-Generation Race Car',
                'Development Begins',
            ],
            [
                '/en/archive/general/vsc-c-c-dev-and-debug/',
                'C/C++ Development and Debugging with VS Code',
                'VS Code',
            ],
        ]
        for (const [url, h1, snippet] of cases) {
            await test.step(`200 ${url}`, async () => {
                const res = await request.get(url)
                expect(res.status()).toBe(200)
                const html = await res.text()
                expect(html).toContain(h1)
                expect(html).toContain(snippet)
            })
        }
    })

    test('404 页面处理', async ({ page }) => {
        const response = await page.goto('/this-page-does-not-exist/')
        expect(response?.status()).toBe(404)
    })
})
