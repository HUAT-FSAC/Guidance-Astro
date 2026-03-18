import { expect, test } from '@playwright/test'

const STORAGE_KEY = 'huat-showcase-lab-selection'

test.describe('智能驾驶交互实验室', () => {
    test('首页存在模块标题和默认场景内容', async ({ page }) => {
        await page.goto('/')

        const lab = page.locator('[data-showcase-lab]')
        await expect(lab).toBeVisible()
        await expect(lab).toContainText('智能驾驶交互实验室')
        await expect(lab).toContainText('发车校准')
        await expect(lab).toContainText('保守起步策略')

        const defaultScenario = lab.getByRole('button', { name: /发车校准/ })
        await expect(defaultScenario).toHaveAttribute('aria-pressed', 'true')
    })

    test('点击场景按钮后关键指标、徽章和赛道标记同步更新', async ({ page }) => {
        await page.goto('/')

        const lab = page.locator('[data-showcase-lab]')
        const scenarioTitle = lab.locator('[data-showcase-scenario-name]')
        const speedMetric = lab.locator('[data-showcase-metric="speed"]')
        const trackMarkers = lab.locator('#showcase-track-markers circle')

        await expect(scenarioTitle).toContainText('发车校准')
        await expect(trackMarkers).toHaveCount(6)
        const initialSpeed = await speedMetric.textContent()

        await lab.getByRole('button', { name: /高速循迹/ }).click()

        await expect(scenarioTitle).toContainText('高速循迹')
        await expect(speedMetric).not.toHaveText(initialSpeed ?? '')
        await expect(trackMarkers).toHaveCount(7)
        await expect(lab).toContainText('MPC 速度优先策略')
        await expect(lab.locator('#showcase-badges')).toContainText('Telemetry')
    })

    test('点击关注子系统后详情区内容变化', async ({ page }) => {
        await page.goto('/')

        const lab = page.locator('[data-showcase-lab]')
        const subsystemPanel = lab.locator('[data-showcase-subsystem-panel]')

        await expect(subsystemPanel).toContainText('起步前先把赛道边界看清楚')

        await lab.getByRole('button', { name: /规划/ }).click()

        await expect(subsystemPanel).toContainText('首段轨迹以安全走廊为主')
        await expect(subsystemPanel).toContainText('Trajectory Planner')
    })

    test('切换场景后子系统 tabs 会重建并回到场景默认焦点', async ({ page }) => {
        await page.goto('/')

        const lab = page.locator('[data-showcase-lab]')
        const subsystemPanel = lab.locator('[data-showcase-subsystem-panel]')
        const subsystemTabs = lab.locator('#showcase-subsystem-tabs')

        await lab.getByRole('button', { name: /规划/ }).click()
        await expect(subsystemPanel).toContainText('首段轨迹以安全走廊为主')

        await lab.getByRole('button', { name: /紧急制动/ }).click()

        await expect(subsystemTabs.getByRole('button', { name: /^执行确认$/ })).toBeVisible()
        await expect(subsystemTabs.getByRole('button', { name: /^执行确认$/ })).toHaveAttribute(
            'aria-pressed',
            'true',
        )
        await expect(subsystemTabs.getByRole('button', { name: /^执行器$/ })).toHaveCount(0)
        await expect(subsystemPanel).toContainText('执行层给出最后的停稳确认')
    })

    test('刷新后保留上次场景选择', async ({ page }) => {
        await page.goto('/')

        const lab = page.locator('[data-showcase-lab]')
        await lab.getByRole('button', { name: /紧急制动/ }).click()

        await expect(lab.locator('[data-showcase-scenario-name]')).toContainText('紧急制动')

        const storedSelection = await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY)
        expect(storedSelection).toContain('emergency-brake')
        expect(storedSelection).toContain('actuation')

        await page.reload()

        await expect(lab.locator('[data-showcase-scenario-name]')).toContainText('紧急制动')
        await expect(lab.getByRole('button', { name: /紧急制动/ })).toHaveAttribute(
            'aria-pressed',
            'true',
        )
        await expect(lab.locator('#showcase-subsystem-tabs').getByRole('button', { name: /^执行确认$/ })).toHaveAttribute(
            'aria-pressed',
            'true',
        )
        await expect(lab).toContainText('安全闭环优先策略')
    })
})
