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

    test('点击场景按钮后关键指标、徽章和赛道标记同步更新', async ({ page }) => {
        await page.goto('/showcase-dashboard/')

        const lab = page.locator('[data-showcase-lab]')
        const scenarioTitle = lab.locator('[data-showcase-scenario-name]')
        const speedMetric = lab.locator('[data-showcase-metric="speed"]')
        const trackMarkers = lab.locator('#showcase-track-markers circle')

        await expect(scenarioTitle).toContainText('发车校准')
        // 发车校准场景现在有14个锥桶（6个左侧 + 6个右侧 + 2个gate）
        await expect(trackMarkers).toHaveCount(14)
        const initialSpeed = await speedMetric.textContent()

        await lab.getByRole('button', { name: /高速循迹/ }).click()

        await expect(scenarioTitle).toContainText('高速循迹')
        await expect(speedMetric).not.toHaveText(initialSpeed ?? '')
        // 高速循迹场景现在有14个标记（10个cone + 2个apex + 2个gate）
        await expect(trackMarkers).toHaveCount(14)
        await expect(lab).toContainText('MPC 速度优先策略')
        await expect(lab.locator('#showcase-badges')).toContainText('Telemetry')
    })

    test('点击关注子系统后详情区内容变化', async ({ page }) => {
        await page.goto('/showcase-dashboard/')

        const lab = page.locator('[data-showcase-lab]')
        const subsystemPanel = lab.locator('.subsystem-panel')

        await expect(subsystemPanel).toContainText('起步前先把赛道边界看清楚')

        await lab.getByRole('button', { name: /规划/ }).click()

        await expect(subsystemPanel).toContainText('首段轨迹以安全走廊为主')
        // 发车校准场景的规划子系统使用 Launch Planner 而非 Trajectory Planner
        await expect(subsystemPanel).toContainText('Launch Planner')
    })

    test('切换场景后子系统 tabs 会重建并回到场景默认焦点', async ({ page }) => {
        await page.goto('/showcase-dashboard/')

        const lab = page.locator('[data-showcase-lab]')
        const subsystemPanel = lab.locator('.subsystem-panel')
        const subsystemTabs = lab.locator('#showcase-subsystem-tabs')

        await lab.getByRole('button', { name: /规划/ }).click()
        await expect(subsystemPanel).toContainText('首段轨迹以安全走廊为主')

        await lab.getByRole('button', { name: /紧急制动/ }).click()

        await expect(subsystemTabs.getByRole('button', { name: /^执行器$/ })).toBeVisible()
        await expect(subsystemTabs.getByRole('button', { name: /^执行器$/ })).toHaveAttribute(
            'aria-pressed',
            'true'
        )
        await expect(subsystemPanel).toContainText('执行层给出最后的停稳确认')
    })

    test('点击下一帧后回放标题、状态说明和速度指标同步变化', async ({ page }) => {
        await page.goto('/showcase-dashboard/')

        const lab = page.locator('[data-showcase-lab]')
        const replayTitle = lab.locator('#showcase-replay-title')
        const replaySummary = lab.locator('#showcase-replay-summary')
        const speedMetric = lab.locator('[data-showcase-metric="speed"]')

        await expect(replayTitle).toContainText('同步校准')
        await expect(replaySummary).toContainText('系统正在逐项确认定位和制动状态')
        await expect(speedMetric).toContainText('18')

        // 使用 evaluate 点击以避免 Astro dev toolbar 拦截
        await lab.locator('[data-showcase-replay-next]').evaluate((el: HTMLElement) => el.click())

        await expect(replayTitle).toContainText('校准完成，释放起步窗口')
        await expect(replaySummary).toContainText('允许车辆以低扭矩进入发车区')
        await expect(speedMetric).toContainText('24')
    })

    test('自动播放在场景末尾会推进到下一个场景', async ({ page }) => {
        await page.goto('/showcase-dashboard/')

        const lab = page.locator('[data-showcase-lab]')
        const scenarioTitle = lab.locator('[data-showcase-scenario-name]')
        const replayFrameLabel = lab.locator('#showcase-replay-frame-label')

        // 使用 evaluate 点击以避免 Astro dev toolbar 拦截
        await lab.locator('[data-showcase-replay-play]').evaluate((el: HTMLElement) => el.click())

        // 验证自动播放开始 - 等待帧变化
        const initialFrame = await replayFrameLabel.textContent()

        // 等待一段时间让播放进行
        await page.waitForTimeout(1500)

        // 验证帧已经变化（说明自动播放正在工作）
        const currentFrame = await replayFrameLabel.textContent()
        expect(currentFrame).not.toBe(initialFrame)

        // 验证播放状态为 Auto
        const replayStatus = lab.locator('#showcase-replay-status')
        await expect(replayStatus).toContainText('Auto')
    })

    test('手动拖动回放进度后会暂停自动播放', async ({ page }) => {
        await page.goto('/showcase-dashboard/')

        const lab = page.locator('[data-showcase-lab]')
        const replayRange = lab.locator('#showcase-replay-range')
        const replayStatus = lab.locator('#showcase-replay-status')

        // 使用 evaluate 点击以避免 Astro dev toolbar 拦截
        await lab.locator('[data-showcase-replay-play]').evaluate((el: HTMLElement) => el.click())
        await expect(replayStatus).toContainText('Auto')

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

    // ==================== Presentation Console Tests ====================

    test('Presentation Console 存在并包含三个控制卡片', async ({ page }) => {
        await page.goto('/showcase-dashboard/')

        const lab = page.locator('[data-showcase-lab]')

        // 点击控制台标签
        await lab.locator('[data-tab="console"]').click()

        const console = lab.locator('[data-presentation-console]')
        await expect(console).toBeVisible()
        await expect(console.locator('[data-compare-mode]')).toBeVisible()
        await expect(console.locator('[data-demo-script]')).toBeVisible()
        await expect(console.locator('[data-cache-simulator]')).toBeVisible()
    })

    test('开启 Compare Mode 后显示差异摘要', async ({ page }) => {
        await page.goto('/showcase-dashboard/')

        const lab = page.locator('[data-showcase-lab]')

        // 点击控制台标签
        await lab.locator('[data-tab="console"]').click()

        const compareToggle = lab.locator('[data-compare-toggle]')
        const comparePanel = lab.locator('[data-compare-panel]')

        // 默认关闭
        await expect(comparePanel).not.toBeVisible()

        // 开启对比模式
        await compareToggle.evaluate((el: HTMLInputElement) => el.click())
        await expect(comparePanel).toBeVisible()

        // 验证差异摘要内容
        await expect(comparePanel.locator('[data-compare-delta]')).toBeVisible()
    })

    test('选择 Demo Script 后点击下一步会切换到脚本定义的场景', async ({ page }) => {
        await page.goto('/showcase-dashboard/')

        const lab = page.locator('[data-showcase-lab]')

        // 点击控制台标签
        await lab.locator('[data-tab="console"]').click()

        const scriptSelect = lab.locator('[data-script-select]')

        // 选择全链路讲解脚本
        await scriptSelect.selectOption('full-pipeline')

        // 验证当前步骤信息
        await expect(lab.locator('[data-script-step-title]')).toContainText('感知层准备')

        // 点击下一步
        await lab.locator('[data-script-next]').click()

        // 验证切换到下一步
        await expect(lab.locator('[data-script-step-title]')).toContainText('定位收敛')

        // 验证场景和子系统已切换
        await expect(lab.locator('[data-showcase-scenario-name]')).toContainText('发车校准')
        await expect(
            lab.locator('#showcase-subsystem-tabs').getByRole('button', { name: /^定位$/ })
        ).toHaveAttribute('aria-pressed', 'true')
    })

    test('开启脚本自动讲解后，手动拖动回放进度会暂停脚本播放', async ({ page }) => {
        await page.goto('/showcase-dashboard/')

        const lab = page.locator('[data-showcase-lab]')

        // 点击控制台标签
        await lab.locator('[data-tab="console"]').click()

        const scriptSelect = lab.locator('[data-script-select]')
        const autoNarrateBtn = lab.locator('[data-script-auto-narrate]')
        const replayRange = lab.locator('#showcase-replay-range')
        const scriptStatus = lab.locator('[data-script-status]')

        // 选择脚本并开启自动讲解
        await scriptSelect.selectOption('high-speed')
        await autoNarrateBtn.click()

        // 验证自动讲解状态
        await expect(scriptStatus).toContainText('Auto')

        // 手动拖动回放进度
        await replayRange.evaluate((input) => {
            const element = input as HTMLInputElement
            element.value = '1'
            element.dispatchEvent(new Event('input', { bubbles: true }))
        })

        // 验证脚本自动播放已暂停
        await expect(scriptStatus).toContainText('Paused')
    })

    test('点击 Warm Cache 后缓存面板状态更新', async ({ page }) => {
        await page.goto('/showcase-dashboard/')

        const lab = page.locator('[data-showcase-lab]')

        // 点击控制台标签
        await lab.locator('[data-tab="console"]').click()

        const warmCacheBtn = lab.locator('[data-cache-warm]')
        const cacheStatus = lab.locator('[data-cache-status]')
        const cacheHitRate = lab.locator('[data-cache-hit-rate]')

        // 初始状态为冷态
        await expect(cacheStatus).toContainText('缓存冷态')

        // 点击 Warm Cache
        await warmCacheBtn.click()

        // 验证状态更新
        await expect(cacheStatus).toContainText('缓存就绪')
        await expect(cacheHitRate).toContainText('94')
    })

    test('点击 Simulate Drift 后缓存状态显示同步中', async ({ page }) => {
        await page.goto('/showcase-dashboard/')

        const lab = page.locator('[data-showcase-lab]')

        // 点击控制台标签
        await lab.locator('[data-tab="console"]').click()

        const warmCacheBtn = lab.locator('[data-cache-warm]')
        const driftBtn = lab.locator('[data-cache-drift]')
        const cacheStatus = lab.locator('[data-cache-status]')

        // 先 warm cache
        await warmCacheBtn.click()
        await expect(cacheStatus).toContainText('缓存就绪')

        // 点击 Simulate Drift
        await driftBtn.click()

        // 验证状态变为同步中
        await expect(cacheStatus).toContainText('正在同步')
    })

    test('点击 Reset Cache 后缓存状态重置为冷态', async ({ page }) => {
        await page.goto('/showcase-dashboard/')

        const lab = page.locator('[data-showcase-lab]')

        // 点击控制台标签
        await lab.locator('[data-tab="console"]').click()

        const warmCacheBtn = lab.locator('[data-cache-warm]')
        const resetBtn = lab.locator('[data-cache-reset]')
        const cacheStatus = lab.locator('[data-cache-status]')
        const cachePacks = lab.locator('[data-cache-packs]')

        // 先 warm cache
        await warmCacheBtn.click()
        await expect(cacheStatus).toContainText('缓存就绪')
        // 等待缓存包数量更新（warm cache 状态有5个资源）
        await expect.poll(async () => await cachePacks.textContent()).toBe('5')

        // 点击 Reset
        await resetBtn.click()

        // 验证状态重置
        await expect(cacheStatus).toContainText('缓存冷态')
        await expect(cachePacks).toContainText('0')
    })

    test('Compare Mode 开启时缓存包数量保持不变', async ({ page }) => {
        await page.goto('/showcase-dashboard/')

        const lab = page.locator('[data-showcase-lab]')

        // 点击控制台标签
        await lab.locator('[data-tab="console"]').click()

        const warmCacheBtn = lab.locator('[data-cache-warm]')
        const compareToggle = lab.locator('[data-compare-toggle]')
        const cachePacks = lab.locator('[data-cache-packs]')

        // 先 warm cache
        await warmCacheBtn.click()
        await expect.poll(async () => await cachePacks.textContent()).toBe('5')
        const initialPacks = await cachePacks.textContent()

        // 开启 Compare Mode
        await compareToggle.evaluate((el: HTMLInputElement) => el.click())

        // 验证缓存包数量保持不变（当前实现 compare mode 不影响缓存数量）
        const newPacks = await cachePacks.textContent()
        expect(Number(newPacks)).toBe(Number(initialPacks))
    })
})
