import { expect, test } from '@playwright/test'

const STORAGE_KEY = 'huat-showcase-lab-selection'

test.describe('智能驾驶交互实验室', () => {
    test('实验室页面存在模块标题和默认场景内容', async ({ page }) => {
        await page.goto('/showcase-dashboard/')

        const lab = page.locator('[data-showcase-lab]')
        await expect(lab).toBeVisible()
        await expect(lab).toContainText('智能驾驶交互实验室')
        await expect(lab).toContainText('发车校准')
        await expect(lab).toContainText('保守起步策略')

        const defaultScenario = lab.getByRole('button', { name: /发车校准/ })
        await expect(defaultScenario).toHaveAttribute('aria-pressed', 'true')
    })

    test('场景与子系统联动（单页多阶段）', async ({ page }) => {
        await page.goto('/showcase-dashboard/')

        const lab = page.locator('[data-showcase-lab]')
        const subsystemPanel = lab.locator('.subsystem-panel')
        const subsystemTabs = lab.locator('#showcase-subsystem-tabs')
        const scenarioTitle = lab.locator('[data-showcase-scenario-name]')

        // 阶段一：默认场景的子系统详情
        await expect(subsystemPanel).toContainText('起步前先把赛道边界看清楚')
        await lab.getByRole('button', { name: /规划/ }).click()
        await expect(subsystemPanel).toContainText('首段轨迹以安全走廊为主')
        await expect(subsystemPanel).toContainText('Launch Planner')

        // 阶段二：切换场景，指标与赛道标记同步
        const speedMetric = lab.locator('[data-showcase-metric="speed"]')
        const trackMarkers = lab.locator('#showcase-track-markers circle')
        await expect(trackMarkers).toHaveCount(14)
        const initialSpeed = await speedMetric.textContent()
        await lab.getByRole('button', { name: /高速循迹/ }).click()
        await expect(scenarioTitle).toContainText('高速循迹')
        await expect(speedMetric).not.toHaveText(initialSpeed ?? '')
        await expect(trackMarkers).toHaveCount(16)
        await expect(lab).toContainText('MPC 速度优先策略')
        await expect(lab.locator('#showcase-badges')).toContainText('Telemetry')

        // 阶段三：再切场景，tabs 重建并回到场景默认焦点
        await lab.getByRole('button', { name: /紧急制动/ }).click()
        await expect(subsystemTabs.getByRole('button', { name: /^执行器$/ })).toBeVisible()
        await expect(subsystemTabs.getByRole('button', { name: /^执行器$/ })).toHaveAttribute(
            'aria-pressed',
            'true'
        )
        await expect(subsystemPanel).toContainText('执行层给出最后的停稳确认')
    })

    test('回放控制：下一帧、自动播放与拖动暂停（单页多阶段）', async ({ page }) => {
        await page.goto('/showcase-dashboard/')

        const lab = page.locator('[data-showcase-lab]')
        const replayTitle = lab.locator('#showcase-replay-title')
        const replaySummary = lab.locator('#showcase-replay-summary')
        const speedMetric = lab.locator('[data-showcase-metric="speed"]')
        const replayStatus = lab.locator('#showcase-replay-status')
        const replayRange = lab.locator('#showcase-replay-range')

        // 阶段一：下一帧推进标题、说明与速度
        await expect(replayTitle).toContainText('同步校准')
        await expect(replaySummary).toContainText('系统正在逐项确认定位和制动状态')
        await expect(speedMetric).toContainText('18')
        // 使用 evaluate 点击以避免 Astro dev toolbar 拦截
        await lab.locator('[data-showcase-replay-next]').evaluate((el: HTMLElement) => el.click())
        await expect(replayTitle).toContainText('校准完成，释放起步窗口')
        await expect(replaySummary).toContainText('允许车辆以低扭矩进入发车区')
        await expect(speedMetric).toContainText('24')

        // 阶段二：自动播放推进帧
        const replayFrameLabel = lab.locator('#showcase-replay-frame-label')
        await lab.locator('[data-showcase-replay-play]').evaluate((el: HTMLElement) => el.click())
        const initialFrame = await replayFrameLabel.textContent()
        // 等待一段时间让播放进行
        await page.waitForTimeout(1500)
        const currentFrame = await replayFrameLabel.textContent()
        expect(currentFrame).not.toBe(initialFrame)
        await expect(replayStatus).toContainText('Auto')

        // 阶段三：手动拖动进度暂停自动播放
        await replayRange.evaluate((input) => {
            const element = input as HTMLInputElement
            element.value = '1'
            element.dispatchEvent(new Event('input', { bubbles: true }))
        })
        await expect(replayStatus).toContainText('Paused')
    })

    test('刷新后保留上次场景选择', async ({ page }) => {
        await page.goto('/showcase-dashboard/')

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
            'true'
        )
        await expect(
            lab.locator('#showcase-subsystem-tabs').getByRole('button', { name: /^执行器$/ })
        ).toHaveAttribute('aria-pressed', 'true')
        await expect(lab).toContainText('安全闭环优先策略')
    })

    test('演示控制台：存在、对比模式与缓存包（单页多阶段）', async ({ page }) => {
        await page.goto('/showcase-dashboard/')

        const lab = page.locator('[data-showcase-lab]')

        // 展开演示工具
        await lab.locator('[data-lab-tools]').evaluate((el: HTMLDetailsElement) => {
            el.open = true
        })

        // 阶段一：三个控制卡片存在
        const console = lab.locator('[data-presentation-console]')
        await expect(console).toBeVisible()
        await expect(console.locator('[data-compare-mode]')).toBeVisible()
        await expect(console.locator('[data-demo-script]')).toBeVisible()
        await expect(console.locator('[data-cache-simulator]')).toBeVisible()

        // 阶段二：对比模式开关与差异摘要
        const compareToggle = lab.locator('[data-compare-toggle]')
        const comparePanel = lab.locator('[data-compare-panel]')
        await expect(comparePanel).not.toBeVisible()
        await compareToggle.evaluate((el: HTMLInputElement) => el.click())
        await expect(comparePanel).toBeVisible()
        await expect(comparePanel.locator('[data-compare-delta]')).toBeVisible()

        // 阶段三：对比模式下缓存包数量保持不变
        const warmCacheBtn = lab.locator('[data-cache-warm]')
        const cachePacks = lab.locator('[data-cache-packs]')
        await warmCacheBtn.click()
        await expect.poll(async () => await cachePacks.textContent()).toBe('5')
        const newPacks = await cachePacks.textContent()
        expect(Number(newPacks)).toBe(5)
    })

    test('演示脚本：选择、步进与自动讲解暂停（单页多阶段）', async ({ page }) => {
        await page.goto('/showcase-dashboard/')

        const lab = page.locator('[data-showcase-lab]')

        // 展开演示工具
        await lab.locator('[data-lab-tools]').evaluate((el: HTMLDetailsElement) => {
            el.open = true
        })

        // 阶段一：选择脚本并步进
        const scriptSelect = lab.locator('[data-script-select]')
        await scriptSelect.selectOption('full-pipeline')
        await expect(lab.locator('[data-script-step-title]')).toContainText('感知层准备')
        await lab.locator('[data-script-next]').click()
        await expect(lab.locator('[data-script-step-title]')).toContainText('定位收敛')
        await expect(lab.locator('[data-showcase-scenario-name]')).toContainText('发车校准')
        await expect(
            lab.locator('#showcase-subsystem-tabs').getByRole('button', { name: /^定位$/ })
        ).toHaveAttribute('aria-pressed', 'true')

        // 阶段二：自动讲解后手动拖动暂停
        const autoNarrateBtn = lab.locator('[data-script-auto-narrate]')
        const replayRange = lab.locator('#showcase-replay-range')
        const scriptStatus = lab.locator('[data-script-status]')
        await scriptSelect.selectOption('high-speed')
        await autoNarrateBtn.click()
        await expect(scriptStatus).toContainText('Auto')
        await replayRange.evaluate((input) => {
            const element = input as HTMLInputElement
            element.value = '1'
            element.dispatchEvent(new Event('input', { bubbles: true }))
        })
        await expect(scriptStatus).toContainText('Paused')
    })

    test('缓存模拟：预热、漂移与重置生命周期（单页多阶段）', async ({ page }) => {
        await page.goto('/showcase-dashboard/')

        const lab = page.locator('[data-showcase-lab]')

        // 展开演示工具
        await lab.locator('[data-lab-tools]').evaluate((el: HTMLDetailsElement) => {
            el.open = true
        })

        const warmCacheBtn = lab.locator('[data-cache-warm]')
        const driftBtn = lab.locator('[data-cache-drift]')
        const resetBtn = lab.locator('[data-cache-reset]')
        const cacheStatus = lab.locator('[data-cache-status]')
        const cacheHitRate = lab.locator('[data-cache-hit-rate]')
        const cachePacks = lab.locator('[data-cache-packs]')

        // 阶段一：预热（冷态 -> 就绪，命中率 100%，5 个包）
        await expect(cacheStatus).toContainText('缓存冷态')
        await warmCacheBtn.click()
        await expect(cacheStatus).toContainText('缓存就绪')
        await expect(cacheHitRate).toContainText('100')
        await expect.poll(async () => await cachePacks.textContent()).toBe('5')

        // 阶段二：漂移（就绪 -> 同步中）
        await driftBtn.click()
        await expect(cacheStatus).toContainText('正在同步')

        // 阶段三：重置（同步中 -> 冷态，包清零）
        await resetBtn.click()
        await expect(cacheStatus).toContainText('缓存冷态')
        await expect(cachePacks).toContainText('0')
    })
})
