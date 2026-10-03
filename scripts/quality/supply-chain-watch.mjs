import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { loadAllowlist } from './audit-gate.mjs'

/**
 * Supply-chain watch (#180) — READ-ONLY, non-gating.
 *
 * 背景：M1 立了两把「只在被读到那天有效」的锁 ——
 *   ① `pnpm-workspace.yaml` 把 @cloudflare/vite-plugin 锁在固定版本（D-010）；
 *   ② `.config/audit-allowlist.json` 的豁免带到期日（D-011）。
 * 两者的失效方式都是「某天突然撞红」，而不是被主动提醒。本探针负责提前把
 * 到期天数与上游补丁可用性打到日志里。
 *
 * 边界（刻意的）：本脚本 **永远 exit 0**。它不接进 ci-cd.yml、不是 required check、
 * 不会因为发现过期而让 main 变红 —— 那是 audit-gate 的职责（它会红，且应该红）。
 */

export const WATCH_PACKAGES = ['@cloudflare/vite-plugin']
const WARN_WITHIN_DAYS = 7

function view(pkg, field, runner) {
    const args = ['view', pkg, field]
    const res = runner('npm', args, { encoding: 'utf8' })
    return ((res && res.stdout) || '').trim()
}

/** Compare dotted-numeric versions; returns a > b. Tolerates date-based majors. */
export function isNewer(a, b) {
    const pa = String(a)
        .split(/[.\-+]/)
        .map((x) => Number.parseInt(x, 10))
    const pb = String(b)
        .split(/[.\-+]/)
        .map((x) => Number.parseInt(x, 10))
    for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
        const x = Number.isNaN(pa[i]) ? 0 : (pa[i] ?? 0)
        const y = Number.isNaN(pb[i]) ? 0 : (pb[i] ?? 0)
        if (x !== y) return x > y
    }
    return false
}

/**
 * Pure evaluation so it is testable without npm/network.
 * `latest[pkg]` = upstream dist-tags.latest; `patched[pkg]` = whether the
 * advisory's claimed patched version actually exists upstream.
 */
export function evaluate({
    entries = [],
    latest = {},
    patched = {},
    peer = '',
    now = new Date(),
} = {}) {
    const findings = []
    for (const e of entries) {
        const until = new Date(`${e.expires}T23:59:59Z`)
        const daysLeft = Number.isNaN(until.getTime())
            ? null
            : Math.max(0, Math.floor((until.getTime() - now.getTime()) / 86_400_000))
        findings.push({
            kind: 'allowlist',
            ghsa: e.ghsa,
            pkg: e.package,
            daysLeft,
            expires: e.expires,
            state:
                until.getTime() < now.getTime()
                    ? 'expired'
                    : daysLeft <= WARN_WITHIN_DAYS
                      ? 'expiring'
                      : 'ok',
            patchAvailable: patched[e.package] === true,
            upstreamLatest: latest[e.package] ?? '',
        })
    }
    for (const pkg of WATCH_PACKAGES) {
        findings.push({
            kind: 'peer-lock',
            pkg,
            upstreamLatest: latest[pkg] ?? '',
            peerWrangler: peer,
            state: 'info',
            daysLeft: null,
        })
    }
    return findings
}

export function formatFindings(findings) {
    const lines = []
    for (const f of findings) {
        if (f.kind === 'allowlist') {
            if (f.state === 'expired')
                lines.push(
                    `::error::audit 豁免已过期 ${f.expires}：${f.pkg} ${f.ghsa} —— 请重新核对上游补丁并决定升级或显式续期（D-011）`
                )
            else if (f.patchAvailable)
                lines.push(
                    `::error::上游已发布 ${f.pkg} 的补丁版（latest=${f.upstreamLatest}）—— 豁免不再必要，请删除 .config/audit-allowlist.json 中 ${f.ghsa} 并升级`
                )
            else
                lines.push(
                    `::warning::audit 豁免剩余 ${f.daysLeft} 天（到期 ${f.expires}）：${f.pkg} ${f.ghsa}；上游 latest=${f.upstreamLatest || '未知'}，补丁${f.patchAvailable ? '已可用' : '仍缺失'}`
                )
        } else {
            lines.push(
                `::notice::peer 锁定回看：${f.pkg} 上游 latest=${f.upstreamLatest || '未知'}，其 wrangler peer 要求 ${f.peerWrangler || '未知'}；当前锁定值见 pnpm-workspace.yaml overrides（D-010）`
            )
        }
    }
    return lines
}

export function main({ runner = spawnSync, now = new Date(), repoRoot = process.cwd() } = {}) {
    let entries = []
    try {
        entries = loadAllowlist(repoRoot)
    } catch (err) {
        console.log(`::error::读不到 audit 豁免清单：${err.message}`)
        return 0
    }
    const pkgs = [...new Set([...entries.map((e) => e.package), ...WATCH_PACKAGES])]
    const latest = {}
    for (const p of pkgs) latest[p] = view(p, 'dist-tags.latest', runner)
    const patched = {}
    for (const e of entries) {
        const claimed = /([0-9]+(?:\.[0-9]+)+)/.exec(e.patchedClaimed || '')
        patched[e.package] = claimed
            ? isNewer(latest[e.package], claimed[1]) || latest[e.package] === claimed[1]
            : false
    }
    const peer = view(WATCH_PACKAGES[0], 'peerDependencies.wrangler', runner)
    console.log(formatFindings(evaluate({ entries, latest, patched, peer, now })).join('\n'))
    return 0 // 只读探针：永不因结果而让流水线变红
}

if (import.meta.url === pathToFileURL(path.resolve(process.argv[1] ?? '')).href) {
    process.exitCode = main()
}
