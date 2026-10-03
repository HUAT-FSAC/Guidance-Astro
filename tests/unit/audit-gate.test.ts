import { describe, expect, it, vi } from 'vitest'

import {
    classifyAdvisories,
    entryKey,
    formatVerdict,
    loadAllowlist,
    main,
} from '../../scripts/quality/audit-gate.mjs'

const NOW = new Date('2026-10-03T12:00:00Z')

function advisory(overrides = {}) {
    return {
        github_advisory_id: 'GHSA-example-aaaa-bbbb',
        module_name: 'left-pad',
        severity: 'high',
        vulnerable_versions: '<=1.0.0',
        patched_versions: '>=1.0.1',
        ...overrides,
    }
}

function report(...advisories: Array<Record<string, unknown>>) {
    return { advisories: Object.fromEntries(advisories.map((a, i) => [String(1000 + i), a])) }
}

const entry = (overrides = {}) => ({
    ghsa: 'GHSA-example-aaaa-bbbb',
    package: 'left-pad',
    reason: 'no upstream patch',
    issue: 'https://example.invalid/issues/1',
    added: '2026-10-03',
    expires: '2026-10-17',
    ...overrides,
})

describe('classifyAdvisories', () => {
    it('allows an advisory whose GHSA *and* package are listed and not expired', () => {
        const v = classifyAdvisories(report(advisory()), [entry()], NOW)
        expect(v.blocking).toHaveLength(0)
        expect(v.expired).toHaveLength(0)
        expect(v.allowed).toHaveLength(1)
        // floor, not ceil: 2026-10-03T12:00Z → 2026-10-17T23:59:59Z is 14.5 days
        expect(v.allowed[0].daysLeft).toBe(14)
    })

    it('fails an advisory that is not in the allowlist', () => {
        const v = classifyAdvisories(report(advisory()), [], NOW)
        expect(v.blocking).toHaveLength(1)
        expect(v.blocking[0].reason).toBe('not-allowlisted')
    })

    it('does not match on GHSA alone — the package must match too', () => {
        const v = classifyAdvisories(report(advisory({ module_name: 'other-pkg' })), [entry()], NOW)
        expect(v.blocking).toHaveLength(1)
        expect(v.allowed).toHaveLength(0)
    })

    it('fails once the entry expires, and flags a malformed expiry', () => {
        const late = classifyAdvisories(report(advisory()), [entry({ expires: '2026-10-01' })], NOW)
        expect(late.expired).toHaveLength(1)
        expect(late.expired[0].reason).toBe('expired')

        const bogus = classifyAdvisories(report(advisory()), [entry({ expires: 'tomorrow' })], NOW)
        expect(bogus.expired[0].reason).toBe('invalid-expiry')
    })

    it('reports allowlist entries that matched nothing so they can be cleaned up', () => {
        const v = classifyAdvisories(report(), [entry()], NOW)
        expect(v.unused).toHaveLength(1)
        expect(entryKey(entry())).toBe('GHSA-example-aaaa-bbbb::left-pad')
    })

    it('treats an empty report as clean', () => {
        const v = classifyAdvisories(report(), [], NOW)
        expect(formatVerdict(v)).toContain('audit clean')
    })
})

describe('formatVerdict', () => {
    it('prints the expiry, the tracking issue and the reason for allowed advisories', () => {
        const text = formatVerdict(classifyAdvisories(report(advisory()), [entry()], NOW))
        expect(text).toContain('2026-10-17')
        expect(text).toContain('issues/1')
        expect(text).toContain('GHSA-example-aaaa-bbbb')
    })

    it('warns when an entry is about to expire', () => {
        const soon = new Date('2026-10-16T00:00:00Z')
        const text = formatVerdict(
            classifyAdvisories(report(advisory()), [entry({ expires: '2026-10-17' })], soon)
        )
        expect(text).toContain('expiring within 3 days')
    })
})

describe('main', () => {
    const fakeRunner =
        (stdout: string, status = 1) =>
        () => ({ stdout, stderr: '', status })

    it('exits 0 when every advisory is allow-listed', () => {
        const stdout = JSON.stringify(report(advisory()))
        const log = vi.spyOn(console, 'log').mockImplementation(() => {})
        const code = main({
            repoRoot: process.cwd(),
            now: NOW,
            entries: [entry()],
            runner: fakeRunner(stdout),
        })
        log.mockRestore()
        expect(code).toBe(0)
    })

    it('exits 1 when an unknown advisory shows up', () => {
        const stdout = JSON.stringify(
            report(advisory({ github_advisory_id: 'GHSA-new-cccc-dddd' }))
        )
        const log = vi.spyOn(console, 'log').mockImplementation(() => {})
        const code = main({
            repoRoot: process.cwd(),
            now: NOW,
            entries: [],
            runner: fakeRunner(stdout),
        })
        log.mockRestore()
        expect(code).toBe(1)
    })

    it('exits 1 when the only matching entry has expired', () => {
        const stdout = JSON.stringify(report(advisory()))
        const log = vi.spyOn(console, 'log').mockImplementation(() => {})
        const code = main({
            repoRoot: process.cwd(),
            now: NOW,
            entries: [entry({ expires: '2026-10-01' })],
            runner: fakeRunner(stdout),
        })
        log.mockRestore()
        expect(code).toBe(1)
    })

    it('throws instead of silently passing when audit output is not JSON', () => {
        expect(() =>
            main({ repoRoot: process.cwd(), now: NOW, runner: fakeRunner('', 3) })
        ).toThrow(/did not return JSON/)
    })
})

describe('the real allowlist file', () => {
    it('parses and every entry carries reason + issue + future expiry', () => {
        const entries = loadAllowlist()
        expect(entries.length).toBeGreaterThan(0)
        for (const e of entries) {
            expect(e.ghsa).toMatch(/^GHSA-/i)
            expect(e.package).toBeTruthy()
            expect(e.reason.length).toBeGreaterThan(20)
            expect(e.issue).toMatch(/^https:\/\//)
            expect(new Date(`${e.expires}T23:59:59Z`).getTime()).toBeGreaterThan(Date.now())
        }
    })
})
