import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

/**
 * Audit gate (#173).
 *
 * `pnpm audit --audit-level=moderate` is a hard blocker for the whole pipeline
 * (`build` needs `audit`), which means a brand-new advisory with **no upstream
 * patch yet** freezes every PR and every push to `main` — with nothing an agent
 * can actually do about it (an override pointing at a version that does not
 * exist just breaks `pnpm install`).
 *
 * This gate replaces the blanket pass/fail with an explicit, auditable policy:
 *
 * - advisories are reported by `pnpm audit --json` at the same `moderate` level
 *   as before, so the severity semantics are unchanged;
 * - an advisory only passes when it matches an entry in `.config/audit-allowlist.json`
 *   by **both** GHSA id and package name **and** the entry has not expired;
 * - anything not allowlisted, or allowlisted but expired, fails the build;
 * - expiry is a real deadline: renewing requires re-checking whether upstream has
 *   published a patched version by then.
 *
 * The allowlist file is the review surface: every entry carries a reason, a
 * tracking issue and an expiry date.
 */

export const ALLOWLIST_REL = path.join('.config', 'audit-allowlist.json')

export function entryKey(entry) {
    return `${entry.ghsa}::${entry.package}`
}

/** Parse the allowlist; accepts either an array or `{ entries: [...] }`. */
export function loadAllowlist(repoRoot = process.cwd(), relPath = ALLOWLIST_REL) {
    const raw = JSON.parse(fs.readFileSync(path.join(repoRoot, relPath), 'utf8'))
    const entries = Array.isArray(raw) ? raw : raw.entries
    if (!Array.isArray(entries))
        throw new Error('audit allowlist must be an array or { entries: [...] }')
    return entries
}

/**
 * Split the audit report into allow-listed, expired and blocking advisories.
 * Pure — `now` is injected so expiry behaviour is testable.
 */
export function classifyAdvisories(report, entries, now = new Date()) {
    const byKey = new Map(entries.map((entry) => [entryKey(entry), entry]))
    const matchedKeys = new Set()
    const allowed = []
    const expired = []
    const blocking = []

    for (const advisory of Object.values(report?.advisories ?? {})) {
        const key = entryKey({ ghsa: advisory.github_advisory_id, package: advisory.module_name })
        const entry = byKey.get(key)
        if (!entry) {
            blocking.push({ advisory, reason: 'not-allowlisted' })
            continue
        }
        matchedKeys.add(key)
        const until = new Date(`${entry.expires}T23:59:59Z`)
        if (Number.isNaN(until.getTime())) {
            expired.push({ advisory, entry, reason: 'invalid-expiry' })
        } else if (until.getTime() < now.getTime()) {
            expired.push({ advisory, entry, reason: 'expired' })
        } else {
            allowed.push({
                advisory,
                entry,
                until,
                // Whole days remaining, rounded DOWN: 3.5 days left must already warn,
                // not be displayed as a comfortable 4.
                daysLeft: Math.max(0, Math.floor((until.getTime() - now.getTime()) / 86_400_000)),
            })
        }
    }

    const unused = entries.filter((entry) => !matchedKeys.has(entryKey(entry)))
    return { allowed, expired, blocking, unused }
}

const advisoryLine = (advisory) =>
    `  - ${advisory.severity ?? '?'}  ${advisory.module_name}  ${advisory.github_advisory_id}  ` +
    `(vulnerable ${advisory.vulnerable_versions} → patched ${advisory.patched_versions})`

/** Human-readable verdict; also the place where the policy is stated out loud. */
export function formatVerdict({ allowed, expired, blocking, unused }) {
    const lines = []

    if (blocking.length) {
        lines.push(`❌ ${blocking.length} advisory not covered by the allowlist (fail):`)
        lines.push(...blocking.map(({ advisory }) => advisoryLine(advisory)))
        lines.push(
            '   Add an entry to .config/audit-allowlist.json only after checking that',
            '   no patched version exists, with a reason, a tracking issue and an expiry.'
        )
    }

    if (expired.length) {
        lines.push(`❌ ${expired.length} allowlist entry is expired or malformed (fail):`)
        for (const { advisory, entry, reason } of expired) {
            lines.push(advisoryLine(advisory))
            lines.push(
                `     ${reason}: ${entry.expires} — re-check for a patched release, then renew or drop it`
            )
        }
    }

    if (allowed.length) {
        lines.push(`⚠️  ${allowed.length} advisory temporarily allowed (no upstream patch yet):`)
        for (const { advisory, entry, daysLeft } of allowed) {
            lines.push(advisoryLine(advisory))
            lines.push(
                `     expires ${entry.expires} (${daysLeft}d) · ${entry.issue} · ${entry.reason}`
            )
            if (daysLeft <= 3)
                lines.push(
                    `     ⏳ expiring within 3 days — re-check \`npm view ${entry.package} dist-tags.latest\``
                )
        }
    }

    if (unused.length) {
        lines.push(
            `ℹ️  ${unused.length} allowlist entry matched nothing (clean up when convenient):`
        )
        lines.push(
            ...unused.map(
                (entry) => `  - ${entry.ghsa}::${entry.package} (expires ${entry.expires})`
            )
        )
    }

    if (!blocking.length && !expired.length && !allowed.length)
        lines.push('✅ audit clean — no advisories at/above the threshold')

    return lines.join('\n')
}

/**
 * `runner` is injectable so the gate can be unit-tested without shelling out to
 * pnpm; anything spawnSync-shaped works (only stdout/stderr/status/error are read).
 *
 * @param {(command: string, args?: readonly string[], options?: Record<string, unknown>) => any} [runner]
 */
export function runAuditJson(runner = spawnSync) {
    const res = runner('pnpm', ['audit', '--json', '--audit-level=moderate'], {
        encoding: 'utf8',
        maxBuffer: 64 * 1024 * 1024,
    })
    if (res.error) throw res.error
    const stdout = (res.stdout ?? '').trim()
    if (!stdout.startsWith('{')) {
        throw new Error(
            `pnpm audit did not return JSON (exit ${res.status}): ${(res.stderr ?? '').slice(0, 400) || stdout.slice(0, 400)}`
        )
    }
    return JSON.parse(stdout)
}

/**
 * @param {{ repoRoot?: string, now?: Date, runner?: (...args: any[]) => any, entries?: object[] }} [options]
 * `entries` is a test seam: pass it to classify against a fixture instead of the
 * repository's real allowlist file.
 */
export function main({
    repoRoot = process.cwd(),
    now = new Date(),
    runner = spawnSync,
    entries,
} = {}) {
    const report = runAuditJson(runner)
    const verdict = classifyAdvisories(report, entries ?? loadAllowlist(repoRoot), now)
    console.log(formatVerdict(verdict))
    return verdict.blocking.length + verdict.expired.length === 0 ? 0 : 1
}

if (import.meta.url === pathToFileURL(path.resolve(process.argv[1] ?? '')).href) {
    process.exitCode = main()
}
