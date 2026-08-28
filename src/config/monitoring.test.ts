// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
    checkPerformanceAndAlert,
    checkPerformanceThresholds,
    getMonitorConfig,
    sendAlert,
} from './monitoring'

describe('monitoring', () => {
    const originalEnv = process.env
    const originalFetch = global.fetch

    beforeEach(() => {
        vi.resetModules()
        process.env = { ...originalEnv }
        // @ts-expect-error: mock
        global.fetch = vi.fn(() => Promise.resolve({ ok: true } as Response))
        vi.spyOn(console, 'error').mockImplementation(() => {})
        vi.spyOn(console, 'log').mockImplementation(() => {})
    })

    afterEach(() => {
        vi.restoreAllMocks()
        process.env = originalEnv
        global.fetch = originalFetch
    })

    it('getMonitorConfig returns defaults', () => {
        delete process.env.UPTIME_ROBOT_API_KEY
        delete process.env.SLACK_WEBHOOK_URL
        const cfg = getMonitorConfig()
        expect(cfg.performance.thresholds.fcp).toBe(1800)
        expect(cfg.alerts.enabled).toBe(true)
    })

    it('checkPerformanceThresholds passes and fails', () => {
        expect(
            checkPerformanceThresholds({ fcp: 100, lcp: 100, cls: 0.05, fid: 50, ttfb: 100 }).passed
        ).toBe(true)
        const failed = checkPerformanceThresholds({
            fcp: 2000,
            lcp: 3000,
            cls: 0.2,
            fid: 200,
            ttfb: 1000,
        })
        expect(failed.passed).toBe(false)
        expect(failed.failed.join(';')).toContain('FCP')
        expect(failed.failed.join(';')).toContain('LCP')
        expect(failed.failed.join(';')).toContain('CLS')
        expect(failed.failed.join(';')).toContain('FID')
        expect(failed.failed.join(';')).toContain('TTFB')
    })

    it('sendAlert respects disabled', async () => {
        process.env.ALERTS_ENABLED = 'false'
        await sendAlert('error', 'test', { foo: 'bar' })
        expect(global.fetch).not.toHaveBeenCalled()
        process.env.ALERTS_ENABLED = 'true'
    })

    it('sendAlert sends to slack, feishu, wecom', async () => {
        process.env.SLACK_WEBHOOK_URL = 'https://slack.example.com/hook'
        process.env.FEISHU_WEBHOOK_URL = 'https://feishu.example.com/hook'
        process.env.WECOM_WEBHOOK_URL = 'https://wecom.example.com/hook'
        process.env.NODE_ENV = 'development'
        await sendAlert('performance', 'perf fail', { fcp: 2000 })
        expect(global.fetch).toHaveBeenCalledTimes(3)
        const calls = (global.fetch as unknown as ReturnType<typeof vi.fn>).mock.calls
        expect(calls[0][0]).toContain('slack')
        expect(calls[1][0]).toContain('feishu')
        expect(calls[2][0]).toContain('wecom')
        delete process.env.SLACK_WEBHOOK_URL
        delete process.env.FEISHU_WEBHOOK_URL
        delete process.env.WECOM_WEBHOOK_URL
    })

    it('sendAlert handles fetch failure', async () => {
        process.env.SLACK_WEBHOOK_URL = 'https://slack.example.com/hook'
        // @ts-expect-error: mock
        global.fetch = vi.fn(() => Promise.reject(new Error('network fail')))
        await sendAlert('error', 'fail test')
        expect(console.error).toHaveBeenCalled()
        delete process.env.SLACK_WEBHOOK_URL
    })

    it('checkPerformanceAndAlert triggers alert on fail', async () => {
        process.env.SLACK_WEBHOOK_URL = 'https://slack.example.com/hook'
        const result = await checkPerformanceAndAlert({ fcp: 9999 })
        expect(result.passed).toBe(false)
        expect(global.fetch).toHaveBeenCalled()
        delete process.env.SLACK_WEBHOOK_URL
    })

    it('checkPerformanceAndAlert passes without alert', async () => {
        const result = await checkPerformanceAndAlert({ fcp: 100 })
        expect(result.passed).toBe(true)
        expect(global.fetch).not.toHaveBeenCalled()
    })
})
