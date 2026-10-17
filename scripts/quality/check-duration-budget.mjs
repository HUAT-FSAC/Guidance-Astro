import { execSync } from 'node:child_process'
import fs from 'node:fs'

// ===== 预算阈值（#229，依据 docs/TEST_PERF.md 阶段三第 3 项）=====
// 基线（2026-10-12 #218 优化后实测）：Quality 阶段墙钟 = 199s（budget/E2E/LHCI 三并行 + gate 聚合，
// wall ≈ max ≈ LHCI 全量 196s）；E2E 分片 step = 46s。
// ⚠️ 不能用 `Quality Gate` 聚合 job 自身时长做指标：#218 拆分后它只剩聚合 echo（实测 3-4s），
// 永远测不出阶段回退；必须取 Quality* 全部 job 的 min(started_at)..max(completed_at) 墙钟。
// 阈值取基线的约 1.8x / 2x，给正常抖动留余量；越过阈值说明流水线结构性回退
// （如 LHCI 全量误入快车道、E2E 分片失效、新增重量级用例），需人工研判而非自动处置。
// 阈值可用环境变量临时覆盖（与 check-bundle-budget.mjs 同模式），默认值即本常量。
// 空串 / 非法值视为「未覆盖」：workflow_dispatch 未填写的输入会以空串传入（#242 手工复核入口）。
const parseThreshold = (raw) => {
    const value = Number(`${raw ?? ''}`.trim())
    return Number.isFinite(value) && value > 0 ? value : null
}
const GATE_P95_BUDGET_SECONDS = parseThreshold(process.env.DURATION_BUDGET_GATE_P95_S) ?? 360
const E2E_STEP_BUDGET_SECONDS = parseThreshold(process.env.DURATION_BUDGET_E2E_STEP_S) ?? 90
const DEFAULT_RUNS = 20 // 采样最近 N 次成功 run；P95 需要足够样本才有统计意义
const QUALITY_JOB_KEYWORD = 'Quality' // ci-cd.yml 中 quality-budget/e2e/lhci/gate 四个 job 名共有的前缀
const E2E_STEP_PREFIX = 'Run E2E tests (shard' // quality-e2e 矩阵分片步骤（TEST_PERF 基线 46s）
const CI_WORKFLOW_FILE = 'ci-cd.yml'
const OUTPUT_DELIMITER = 'BUDGET_OUTPUT_EOF'

function parseArgs(argv) {
    const args = { dryRun: false, runs: DEFAULT_RUNS }
    for (let index = 0; index < argv.length; index += 1) {
        const arg = argv[index]
        if (arg === '--dry-run') {
            args.dryRun = true
        } else if (arg === '--runs' && argv[index + 1] !== undefined) {
            args.runs = Number(argv[index + 1])
            index += 1
        } else if (arg.startsWith('--runs=')) {
            args.runs = Number(arg.slice('--runs='.length))
        }
    }
    if (!Number.isFinite(args.runs) || args.runs < 1) args.runs = DEFAULT_RUNS
    return args
}

function resolveToken() {
    if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN
    if (process.env.GH_TOKEN) return process.env.GH_TOKEN
    try {
        return (
            execSync('gh auth token', {
                encoding: 'utf8',
                stdio: ['pipe', 'pipe', 'ignore'],
            }).trim() || null
        )
    } catch {
        return null
    }
}

function resolveRepository() {
    if (process.env.GITHUB_REPOSITORY?.includes('/')) return process.env.GITHUB_REPOSITORY
    try {
        const url = execSync('git remote get-url origin', {
            encoding: 'utf8',
            stdio: ['pipe', 'pipe', 'ignore'],
        }).trim()
        const match = url.match(/github\.com[:/](.+?)(?:\.git)?$/)
        if (match?.[1]) return match[1]
    } catch {
        // 忽略：落到默认值
    }
    return 'HUAT-FSAC/Guidance-Astro'
}

async function apiGet({ owner, repo, token, apiPath }) {
    // GitHub API 偶发 5xx/瞬时网络错误（实测 502）：对 GET 做小步重试，
    // 与 collect-github-metrics.mjs 的 withRetry 同模式；4xx 属确定错误不重试。
    let lastError
    for (let attempt = 0; attempt <= 2; attempt += 1) {
        try {
            const response = await fetch(
                `https://api.github.com/repos/${owner}/${repo}/${apiPath}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/vnd.github+json',
                        'X-GitHub-Api-Version': '2022-11-28',
                    },
                }
            )
            if (!response.ok) {
                throw new Error(
                    `GitHub API ${response.status} on ${apiPath}: ${(await response.text()).slice(0, 300)}`
                )
            }
            return await response.json()
        } catch (error) {
            lastError = error
            const retryable = !`${error.message}`.includes('GitHub API 4')
            if (attempt === 2 || !retryable) break
            await new Promise((resolve) => setTimeout(resolve, 1200 * (attempt + 1)))
        }
    }
    throw lastError
}

async function fetchSuccessfulMainRuns({ owner, repo, token, want }) {
    const payload = await apiGet({
        owner,
        repo,
        token,
        apiPath: `actions/workflows/${CI_WORKFLOW_FILE}/runs?branch=main&per_page=50`,
    })
    return (payload.workflow_runs ?? [])
        .filter((run) => run.conclusion === 'success')
        .slice(0, want)
}

function secondsBetween(startISO, endISO) {
    const ms = new Date(endISO).getTime() - new Date(startISO).getTime()
    if (!Number.isFinite(ms) || ms < 0) return null
    return Math.round(ms / 1000)
}

async function collectRunSample({ owner, repo, token, run }) {
    const payload = await apiGet({
        owner,
        repo,
        token,
        apiPath: `actions/runs/${run.id}/jobs?per_page=100`,
    })
    const sample = {
        runId: run.id,
        createdAt: run.created_at,
        gateSeconds: null,
        shardMaxSeconds: null,
    }
    let phaseStart = null
    let phaseEnd = null
    for (const job of payload.jobs ?? []) {
        if (job.name.includes(QUALITY_JOB_KEYWORD)) {
            // Quality 阶段墙钟 = Quality* 全部 job 的 min(start)..max(end)
            //（#218 拆分后 gate 聚合 job 只剩 echo，自身 3-4s 测不出阶段回退）
            if (job.started_at && (phaseStart === null || job.started_at < phaseStart)) {
                phaseStart = job.started_at
            }
            if (
                job.conclusion === 'success' &&
                job.completed_at &&
                (phaseEnd === null || job.completed_at > phaseEnd)
            ) {
                phaseEnd = job.completed_at
            }
        }
        for (const step of job.steps ?? []) {
            if (!step.name.startsWith(E2E_STEP_PREFIX) || step.conclusion !== 'success') continue
            const seconds = secondsBetween(step.started_at, step.completed_at)
            if (
                seconds !== null &&
                (sample.shardMaxSeconds === null || seconds > sample.shardMaxSeconds)
            ) {
                sample.shardMaxSeconds = seconds
            }
        }
    }
    if (phaseStart !== null && phaseEnd !== null) {
        sample.gateSeconds = secondsBetween(phaseStart, phaseEnd)
    }
    return sample
}

// 最近邻秩法（nearest-rank）：P95 = 升序第 ceil(0.95 * n) 个
function percentileNearestRank(sortedAsc, percentile) {
    if (sortedAsc.length === 0) return null
    const rank = Math.ceil(percentile * sortedAsc.length)
    return sortedAsc[Math.min(rank, sortedAsc.length) - 1]
}

// 秒数显示：#242 —— 无数据的列渲染 `-`（旧实现渲染成 `-s` 这种假单位）
const formatSeconds = (value) => (value === null || value === undefined ? '-' : `${value}s`)

function renderSampleTable(samples) {
    const lines = [
        '| run | 触发时间(UTC) | Quality 阶段墙钟 | E2E 分片最长 |',
        '| --- | --- | --- | --- |',
    ]
    for (const sample of samples) {
        lines.push(
            `| ${sample.runId} | ${sample.createdAt} | ${formatSeconds(sample.gateSeconds)} | ${formatSeconds(sample.shardMaxSeconds)} |`
        )
    }
    return lines.join('\n')
}

function buildIssueContent({
    repository,
    gateExceeded,
    gateP95,
    gateSamples,
    shardExceeded,
    shardMax,
    shardRunId,
    samples,
}) {
    const parts = []
    if (gateExceeded) parts.push(`Quality 阶段 P95 ${gateP95}s > ${GATE_P95_BUDGET_SECONDS}s`)
    if (shardExceeded) parts.push(`分片 ${shardMax}s > ${E2E_STEP_BUDGET_SECONDS}s`)
    const title = `[duration-budget] main 流水线时长超标（${parts.join('；')}）`
    const body = [
        'main ci-cd 流水线耗时超出预算（#229 定时检查，只上报不处置）。',
        '',
        gateExceeded
            ? `- Quality 阶段墙钟 P95 = ${gateP95}s（阈值 ${GATE_P95_BUDGET_SECONDS}s，样本 ${gateSamples.length} 次成功 run）`
            : `- Quality 阶段墙钟 P95 = ${gateP95}s（阈值内，样本 ${gateSamples.length} 次成功 run）`,
        shardExceeded
            ? `- E2E 分片 step 最长 = ${shardMax}s（阈值 ${E2E_STEP_BUDGET_SECONDS}s，见 run ${shardRunId}）`
            : `- E2E 分片 step 最长 = ${shardMax}s（阈值内，见 run ${shardRunId}）`,
        '',
        '采样明细：',
        '',
        renderSampleTable(samples),
        '',
        '研判指引（对照 docs/TEST_PERF.md 基线：Quality 阶段墙钟 199s / E2E 分片 46s）：',
        '1. 先区分是阶段墙钟变长（needs 链变长、排队延迟、LHCI 全量回潮）还是单个 step 真实回退',
        '2. 检查最近合入是否引入重量级用例、依赖或分片结构变更',
        '3. 研判为抖动可直接关闭本 Issue；判定为回退请转正式任务单跟进',
        '',
        `仓库: ${repository}`,
        '',
        '本 Issue 带 `flaky` 标签，不受 stale 自动关闭打扰（#228）。',
    ].join('\n')
    return { title, body }
}

function emitGitHubOutputs({ exceeded, title, body }) {
    const outputPath = process.env.GITHUB_OUTPUT
    if (!outputPath) return
    const record = [
        `exceeded=${exceeded}`,
        `issue-title<<${OUTPUT_DELIMITER}`,
        title,
        OUTPUT_DELIMITER,
        `issue-body<<${OUTPUT_DELIMITER}`,
        body,
        OUTPUT_DELIMITER,
        '',
    ].join('\n')
    fs.appendFileSync(outputPath, record, 'utf8')
}

async function main() {
    const args = parseArgs(process.argv.slice(2))
    const token = resolveToken()
    if (!token) {
        console.error(
            '无法获取 GitHub Token（GITHUB_TOKEN / GH_TOKEN 均未设置，gh auth token 也不可用）。'
        )
        console.error('没有凭据就无法采集真实 run 时长 —— 拒绝输出编造的判定。')
        process.exit(1)
    }
    const [owner, repo] = resolveRepository().split('/')

    console.log('#229 测试时长预算 — main ci-cd 流水线耗时检查（只读上报）')
    console.log(
        `仓库: ${owner}/${repo} · workflow: ${CI_WORKFLOW_FILE} · branch: main · 阈值: Quality 阶段墙钟 P95 ${GATE_P95_BUDGET_SECONDS}s / 分片 step ${E2E_STEP_BUDGET_SECONDS}s`
    )

    const runs = await fetchSuccessfulMainRuns({ owner, repo, token, want: args.runs })
    const samples = []
    for (const run of runs) {
        samples.push(await collectRunSample({ owner, repo, token, run }))
    }
    if (samples.length === 0) {
        console.log('样本: 0 次（main 分支暂无成功的 ci-cd run）→ 样本不足，无法判定')
        if (!args.dryRun) emitGitHubOutputs({ exceeded: false, title: '', body: '' })
        process.exit(0)
    }

    const gateSamples = samples
        .filter((sample) => sample.gateSeconds !== null)
        .map((sample) => sample.gateSeconds)
    const gateP95 = percentileNearestRank(
        [...gateSamples].sort((a, b) => a - b),
        0.95
    )
    const shardMaxSample = samples
        .filter((sample) => sample.shardMaxSeconds !== null)
        .reduce(
            (max, sample) =>
                max === null || sample.shardMaxSeconds > max.shardMaxSeconds ? sample : max,
            null
        )

    console.log('')
    console.log(
        `样本: ${samples.length}/${args.runs} 次成功 run（${samples[samples.length - 1].createdAt} .. ${samples[0].createdAt}）`
    )
    console.log('')
    console.log(renderSampleTable(samples))
    console.log('')

    let gateExceeded = false
    if (gateP95 === null) {
        console.log('Quality 阶段墙钟 P95 = 采样不足（无含 Quality job 的成功 run）→ 无法判定')
    } else {
        gateExceeded = gateP95 > GATE_P95_BUDGET_SECONDS
        console.log(
            `Quality 阶段墙钟 P95 = ${gateP95}s（阈值 ${GATE_P95_BUDGET_SECONDS}s，样本 ${gateSamples.length}）→ ${gateExceeded ? '超标' : '未超标'}`
        )
    }
    let shardExceeded = false
    if (shardMaxSample === null) {
        console.log('E2E 分片 step = 采样不足（无分片步骤数据）→ 无法判定')
    } else {
        shardExceeded = shardMaxSample.shardMaxSeconds > E2E_STEP_BUDGET_SECONDS
        console.log(
            `E2E 分片 step 最长 = ${shardMaxSample.shardMaxSeconds}s（run ${shardMaxSample.runId}，阈值 ${E2E_STEP_BUDGET_SECONDS}s）→ ${shardExceeded ? '超标' : '未超标'}`
        )
    }

    const exceeded = gateExceeded || shardExceeded
    console.log('')
    console.log(
        `结论: ${exceeded ? '超标' : '未超标'}${args.dryRun ? '（--dry-run：只打印结论，不写 workflow 输出、不开单）' : ''}`
    )

    if (!args.dryRun) {
        if (exceeded) {
            const { title, body } = buildIssueContent({
                repository: `${owner}/${repo}`,
                gateExceeded,
                gateP95,
                gateSamples,
                shardExceeded,
                shardMax: shardMaxSample?.shardMaxSeconds ?? 0,
                shardRunId: shardMaxSample?.runId ?? 'n/a',
                samples,
            })
            emitGitHubOutputs({ exceeded: true, title, body })
        } else {
            emitGitHubOutputs({ exceeded: false, title: '', body: '' })
        }
    }
    process.exit(0)
}

main().catch((error) => {
    console.error(`时长预算检查失败（采集/网络错误，非判定结论）: ${error.message}`)
    process.exit(1)
})
