import { expect, test } from '@playwright/test'

// 项目进度看板（#212）：组件消费采集器超集 schema 的数据文件，
// 断言关键数值真实渲染且不出现 undefined / NaN 之类的 schema 破绽。
test.describe('项目进度看板', () => {
    test('中文看板页渲染真实指标数据', async ({ page }) => {
        await page.goto('/docs-center/运营与协作/项目进度看板/')
        await expect(page.locator('.metrics-dashboard')).toBeVisible()

        // 概览卡片：总任务 / 已完成 / CI 通过率 / 测试覆盖率，数值非空且非 undefined / NaN
        const values = page.locator('.metric-value')
        await expect(values).toHaveCount(4)
        for (let i = 0; i < 4; i += 1) {
            const text = (await values.nth(i).innerText()).trim()
            expect(text.length).toBeGreaterThan(0)
            expect(text).not.toContain('undefined')
            expect(text).not.toContain('NaN')
        }

        // 状态分布图例有真实分桶；优先级四档固定渲染；里程碑与质量区块有数据
        await expect(page.locator('.status-legend .legend-item').first()).toBeVisible()
        await expect(page.locator('.priority-item')).toHaveCount(4)
        await expect(page.locator('.milestone-card').first()).toBeVisible()
        await expect(page.locator('.quality-item')).toHaveCount(3)
        await expect(page.locator('.dashboard-footer')).toBeVisible()
    })

    test('英文看板页渲染真实指标数据', async ({ page }) => {
        await page.goto('/en/docs-center/operations-and-collaboration/project-progress-board/')
        await expect(page.locator('.metrics-dashboard')).toBeVisible()
        const values = page.locator('.metric-value')
        await expect(values).toHaveCount(4)
        for (let i = 0; i < 4; i += 1) {
            const text = (await values.nth(i).innerText()).trim()
            expect(text.length).toBeGreaterThan(0)
            expect(text).not.toContain('undefined')
            expect(text).not.toContain('NaN')
        }
        await expect(page.locator('.status-legend .legend-item').first()).toBeVisible()
    })
})
