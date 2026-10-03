import { describe, expect, it, vi } from 'vitest'

import {
    evaluate,
    formatFindings,
    isNewer,
    main,
} from '../../scripts/quality/supply-chain-watch.mjs'

const entry = (overrides = {}) => ({
    ghsa: 'GHSA-aaaa-bbbb-cccc',
    package: 'left-pad',
    expires: '2026-10-17',
    patchedClaimed: '>=1.0.1',
    ...overrides,
})

const NOW = new Date('2026-10-03T12:00:00Z')

describe('isNewer', () => {
    it('按数字段比较，认得 date-based 版本', () => {
        expect(isNewer('1.0.1', '1.0.0')).toBe(true)
        expect(isNewer('4.2.0', '4.2.1')).toBe(false)
        expect(isNewer('5.20261002.1', '5.20260929.1')).toBe(true)
        expect(isNewer('4.2.1', '4.2.1')).toBe(false)
    })
})

describe('evaluate', () => {
    it('豁免未到期且补丁仍缺失 → 只报剩余天数', () => {
        const f = evaluate({
            entries: [entry()],
            latest: { 'left-pad': '1.0.0' },
            patched: { 'left-pad': false },
            now: NOW,
        })
        const a = f.find((x) => x.kind === 'allowlist')
        expect(a.state).toBe('ok')
        // 10-03 12:00Z → 10-17 23:59Z = 14.5 天，floor 取 14（保守显示剩余天数）
        expect(a.daysLeft).toBe(14)
    })

    it('剩余 ≤7 天 → expiring', () => {
        const f = evaluate({
            entries: [entry()],
            latest: {},
            patched: { 'left-pad': false },
            now: new Date('2026-10-13T00:00:00Z'),
        })
        expect(formatFindings(f).some((l) => l.startsWith('::warning::'))).toBe(true)
    })

    it('已过期 → ::error:: 提醒重新决策（但不改变退出码）', () => {
        const f = evaluate({
            entries: [entry({ expires: '2026-10-01' })],
            latest: {},
            patched: {},
            now: NOW,
        })
        expect(f.find((x) => x.kind === 'allowlist').state).toBe('expired')
        expect(formatFindings(f)[0]).toContain('::error::')
    })

    it('上游已发补丁 → 明确要求删豁免并升级（防豁免变成永久后门）', () => {
        const f = evaluate({
            entries: [entry()],
            latest: { 'left-pad': '1.0.1' },
            patched: { 'left-pad': true },
            now: NOW,
        })
        expect(formatFindings(f).some((l) => l.includes('豁免不再必要'))).toBe(true)
    })

    it('peer 锁定项以 notice 输出，供抬版回看', () => {
        const f = evaluate({
            entries: [],
            latest: { '@cloudflare/vite-plugin': '1.63.0' },
            peer: '^4.150.0',
            now: NOW,
        })
        const t = formatFindings(f).join('\n')
        expect(t).toContain('::notice::')
        expect(t).toContain('1.63.0')
        expect(t).toContain('4.150.0')
    })
})

describe('main 的 non-gating 契约', () => {
    it('即使豁免过期也返回 0（只读探针绝不把流水线弄红）', () => {
        const runner = () => ({ stdout: '1.0.0', stderr: '', status: 0 })
        const log = vi.spyOn(console, 'log').mockImplementation(() => {})
        expect(main({ runner, now: NOW })).toBe(0)
        log.mockRestore()
    })
})
