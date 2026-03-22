import { expect, test } from '@playwright/test'

test.describe('导航功能', () => {
    test('侧边栏导航可用', async ({ page }) => {
        await page.setViewportSize({ width: 1600, height: 900 })
        await page.goto('/docs-center/')
        const navLinks = page.locator('nav a, aside a')
        await expect(navLinks.first()).toBeVisible()
        expect(await navLinks.count()).toBeGreaterThan(0)
    })

    test('英文侧边栏导航可用', async ({ page }) => {
        await page.setViewportSize({ width: 1600, height: 900 })
        await page.goto('/en/docs-center/')
        const navLinks = page.locator('nav a, aside a')
        await expect(navLinks.first()).toBeVisible()
        await expect(page.locator('body')).toContainText('Overview')
        await expect(page.locator('body')).toContainText('Processes & Templates')
    })

    test('英文旧中文 slug 会重定向到英文 slug', async ({ page }) => {
        await page.goto('/en/docs-center/流程与模板/')
        await expect(page).toHaveURL(/\/en\/docs-center\/processes-and-templates\/?$/)
    })

    test('英文感知旧中文 slug 会重定向到英文 slug', async ({ page }) => {
        await page.goto('/en/archive/2025/sensing/激光雷达/')
        await expect(page).toHaveURL(/\/en\/archive\/2025\/sensing\/lidar\/?$/)
    })

    test('英文规控旧中文 slug 会重定向到英文 slug', async ({ page }) => {
        await page.goto('/en/archive/2025/planning-control/控制/')
        await expect(page).toHaveURL(
            /\/en\/archive\/2025\/planning-control\/control-fundamentals\/?$/
        )
    })

    test('英文电气旧中文 slug 会重定向到英文 slug', async ({ page }) => {
        await page.goto('/en/archive/2025/electrical/软件/')
        await expect(page).toHaveURL(/\/en\/archive\/2025\/electrical\/software-development\/?$/)
    })

    test('英文机械旧中文 slug 会重定向到英文 slug', async ({ page }) => {
        await page.goto('/en/archive/2025/mechanical/制动/')
        await expect(page).toHaveURL(/\/en\/archive\/2025\/mechanical\/braking-system\/?$/)
    })

    test('英文定位建图旧中文 slug 会重定向到英文 slug', async ({ page }) => {
        await page.goto('/en/archive/2025/localization-mapping/学习路线/')
        await expect(page).toHaveURL(/\/en\/archive\/2025\/localization-mapping\/learning-path\/?$/)
    })

    test('英文仿真旧中文 slug 会重定向到英文 slug', async ({ page }) => {
        await page.goto('/en/archive/2025/simulation/仿真/')
        await expect(page).toHaveURL(/\/en\/archive\/2025\/simulation\/simulation-platforms\/?$/)
    })

    test('英文项管旧中文 slug 会重定向到英文 slug', async ({ page }) => {
        await page.goto('/en/archive/2025/management/营销/')
        await expect(page).toHaveURL(/\/en\/archive\/2025\/management\/business-development\/?$/)
    })

    test('英文旧感知资料页会重定向到英文 slug', async ({ page }) => {
        await page.goto('/en/archive/sensing/资料汇总/')
        await expect(page).toHaveURL(/\/en\/archive\/sensing\/resource-roundup\/?$/)
    })

    test('英文旧规控资料页会重定向到英文 slug', async ({ page }) => {
        await page.goto('/en/archive/planning-control/资料汇总/')
        await expect(page).toHaveURL(/\/en\/archive\/planning-control\/resource-roundup\/?$/)
    })

    test('英文旧 ROS 入门页会重定向到英文 slug', async ({ page }) => {
        await page.goto(
            '/en/archive/general/ROS%20%E5%85%A5%E9%97%A8/ros-toturial-creating-ws-and-package/'
        )
        await expect(page).toHaveURL(
            /\/en\/archive\/general\/ros-basics\/create-workspace-and-package\/?$/
        )
    })

    test('英文旧数据集生成页会重定向到英文 slug', async ({ page }) => {
        await page.goto(
            '/en/archive/sensing/%E6%95%B0%E6%8D%AE%E9%9B%86%E7%9B%B8%E5%85%B3/dataset-generating/'
        )
        await expect(page).toHaveURL(/\/en\/archive\/sensing\/datasets\/dataset-generation\/?$/)
    })

    test('英文 2025 赛季文档入口可访问', async ({ page }) => {
        await page.goto('/en/archive/2025/')
        await expect(page.locator('h1#_top')).toContainText('2025 Season Documentation Center')
        await expect(page.locator('body')).toContainText('Department Guide')
    })

    test('英文综合资源页可访问', async ({ page }) => {
        await page.goto('/en/archive/general/')
        await expect(page.locator('h1#_top')).toContainText('General Resources')
        await expect(page.locator('body')).toContainText(
            'tools, environment setup, and shared learning references'
        )
    })

    test('英文 ROS 安装页可访问', async ({ page }) => {
        await page.goto('/en/archive/general/ros-installing/')
        await expect(page.locator('h1#_top')).toContainText('ROS1 (Melodic) Installation Guide')
    })

    test('英文 ROS 工作区教程页可访问', async ({ page }) => {
        await page.goto('/en/archive/general/ros-basics/create-workspace-and-package/')
        await expect(page.locator('h1#_top')).toContainText(
            'ROS Basics: Create a Workspace and Run a ROS Package'
        )
        await expect(page.locator('body')).toContainText('creating a workspace')
    })

    test('英文激光雷达页可访问', async ({ page }) => {
        await page.goto('/en/archive/2025/sensing/lidar/')
        await expect(page.locator('h1#_top')).toContainText('LiDAR')
        await expect(page.locator('body')).toContainText('Ground-segmentation algorithm')
    })

    test('英文控制基础页可访问', async ({ page }) => {
        await page.goto('/en/archive/2025/planning-control/control-fundamentals/')
        await expect(page.locator('h1#_top')).toContainText('Control Fundamentals')
        await expect(page.locator('body')).toContainText('Pure Pursuit')
    })

    test('英文惯导配置页可访问', async ({ page }) => {
        await page.goto('/en/archive/2025/localization-mapping/ins5711daa/')
        await expect(page.locator('h1#_top')).toContainText('INS5711DAA INS Setup')
        await expect(page.locator('body')).toContainText('RTK service configuration')
    })

    test('英文学习路线页可访问', async ({ page }) => {
        await page.goto('/en/archive/2025/localization-mapping/learning-path/')
        await expect(page.locator('h1#_top')).toContainText('Learning Path')
        await expect(page.locator('body')).toContainText(
            'Coordinate transforms and spatial synchronization'
        )
    })

    test('英文仿真平台页可访问', async ({ page }) => {
        await page.goto('/en/archive/2025/simulation/simulation-platforms/')
        await expect(page.locator('h1#_top')).toContainText('Simulation Platforms')
        await expect(page.locator('body')).toContainText('Fssim')
    })

    test('英文软件开发页可访问', async ({ page }) => {
        await page.goto('/en/archive/2025/electrical/software-development/')
        await expect(page.locator('h1#_top')).toContainText('Software Development')
        await expect(page.locator('body')).toContainText('VCU software architecture')
    })

    test('英文制动系统页可访问', async ({ page }) => {
        await page.goto('/en/archive/2025/mechanical/braking-system/')
        await expect(page.locator('h1#_top')).toContainText('Braking System')
        await expect(page.locator('body')).toContainText('Emergency Brake System')
    })

    test('英文商务合作页可访问', async ({ page }) => {
        await page.goto('/en/archive/2025/management/business-development/')
        await expect(page.locator('h1#_top')).toContainText('Business Development')
        await expect(page.locator('body')).toContainText('Sponsor Tiers')
    })

    test('英文感知资料页可访问', async ({ page }) => {
        await page.goto('/en/archive/sensing/resource-roundup/')
        await expect(page.locator('h1#_top')).toContainText('Resource Roundup')
        await expect(page.locator('body')).toContainText('Point-cloud processing methods')
    })

    test('英文规控资料页可访问', async ({ page }) => {
        await page.goto('/en/archive/planning-control/resource-roundup/')
        await expect(page.locator('h1#_top')).toContainText('Resource Roundup')
        await expect(page.locator('body')).toContainText('Common planning-and-control algorithms')
    })

    test('英文数据集标注页可访问', async ({ page }) => {
        await page.goto('/en/archive/sensing/datasets/dataset-labeling-basics/')
        await expect(page.locator('h1#_top')).toContainText('Dataset Labeling Basics')
        await expect(page.locator('body')).toContainText('labelme')
    })

    test('英文旧仿真入门页可访问', async ({ page }) => {
        await page.goto('/en/archive/simulation/fssim-introduction/')
        await expect(page.locator('h1#_top')).toContainText('FSSIM Introduction and Quick Start')
        await expect(page.locator('body')).toContainText('AMZ Driverless team')
    })

    test('面包屑导航显示', async ({ page }) => {
        await page.goto('/docs-center/')
        await expect(page.locator('h1#_top')).toBeVisible()
    })

    test('首页 CTA 按钮可点击', async ({ page }) => {
        await page.goto('/')
        const cta = page.locator('.hero-cta').first()
        if (await cta.isVisible()) {
            await expect(cta).toHaveAttribute('href', /.+/)
        }
    })

    test('404 页面处理', async ({ page }) => {
        const response = await page.goto('/this-page-does-not-exist/')
        expect(response?.status()).toBe(404)
    })
})
