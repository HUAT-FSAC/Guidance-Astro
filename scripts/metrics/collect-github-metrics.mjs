import fs from 'node:fs/promises'
import path from 'node:path'

const WINDOW_DAYS = 30
const OUTPUT_PATH = path.join('src', 'data', 'metrics', 'project-progress.json')

function mean(numbers) {
    if (numbers.length === 0) return 0
    return numbers.reduce((sum, value) => sum + value, 0) / numbers.length
}

function daysBetween(startISO, endISO) {
    const start = new Date(startISO).getTime()
    const end = new Date(endISO).getTime()
    const diff = (end - start) / (1000 * 60 * 60 * 24)
    return Number(Math.max(diff, 0).toFixed(2))
}

function toISO(input) {
    return new Date(input).toISOString()
}

function parseRepo(repoEnv) {
    if (!repoEnv || !repoEnv.includes('/')) return null
    const [owner, repo] = repoEnv.split('/')
    if (!owner || !repo) return null
    return { owner, repo }
}

function hasLabel(issue, labelName) {
    return (issue.labels?.nodes ?? []).some((item) => item.name === labelName)
}

async function withRetry(fn, retries = 2, delayMs = 1200) {
    let lastError
    for (let attempt = 0; attempt <= retries; attempt += 1) {
        try {
            return await fn()
        } catch (error) {
            lastError = error
            if (attempt === retries) break
            await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)))
        }
    }
    throw lastError
}

async function writePayload(payload) {
    await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true })
    await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(payload, null, 4)}\n`, 'utf8')
}

async function fetchGitHubGraphQL({ owner, repo, token }) {
    const query = `
      query RepoMetrics($owner: String!, $repo: String!) {
        repository(owner: $owner, name: $repo) {
          issues(first: 100, orderBy: {field: UPDATED_AT, direction: DESC}, states: [OPEN, CLOSED]) {
            totalCount
            nodes {
              number
              title
              state
              createdAt
              updatedAt
              closedAt
              labels(first: 20) {
                nodes {
                  name
                }
              }
            }
          }
          openIssues: issues(states: [OPEN]) {
            totalCount
          }
          closedIssues: issues(states: [CLOSED]) {
            totalCount
          }
          pullRequests(first: 100, orderBy: {field: UPDATED_AT, direction: DESC}, states: [OPEN, CLOSED, MERGED]) {
            totalCount
            nodes {
              number
              title
              state
              createdAt
              updatedAt
              closedAt
              mergedAt
            }
          }
          milestones(first: 20, states: [OPEN, CLOSED]) {
            totalCount
            nodes {
              title
              description
              state
              dueOn
              progressPercentage
            }
          }
        }
      }
    `

    return withRetry(async () => {
        const response = await fetch('https://api.github.com/graphql', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                'User-Agent': 'guidance-astro-metrics-collector',
            },
            body: JSON.stringify({
                query,
                variables: { owner, repo },
            }),
        })

        if (!response.ok) {
            const text = await response.text()
            throw new Error(`GraphQL request failed (${response.status}): ${text}`)
        }

        const body = await response.json()
        if (body.errors?.length) {
            throw new Error(`GraphQL errors: ${JSON.stringify(body.errors)}`)
        }
        return body.data.repository
    })
}

async function fetchWorkflowRuns({ owner, repo, token }) {
    return withRetry(async () => {
        const response = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/actions/workflows/ci-cd.yml/runs?per_page=50`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/vnd.github+json',
                    'User-Agent': 'guidance-astro-metrics-collector',
                },
            }
        )

        if (!response.ok) {
            const text = await response.text()
            throw new Error(`Workflow runs request failed (${response.status}): ${text}`)
        }
        const body = await response.json()
        return body.workflow_runs ?? []
    })
}

// 读入上一次落盘的数据文件，用于 carry-forward：本地构建类指标（coverage/bundle）
// 在 GitHub 侧不可得，沿用上次真实实测值；API 失败降级时旧看板字段也整体沿用。
async function readPreviousPayload() {
    try {
        const raw = await fs.readFile(OUTPUT_PATH, 'utf8')
        return JSON.parse(raw)
    } catch {
        return null
    }
}

// 取最近一次 main 分支 ci-cd run 的 job 结论，推导 lintErrors/typeErrors。
// 门禁是零错误闸（通过 ⇒ 恰好 0），失败计 1 用于看板标红。取不到 job 时返回 null，交由 carry-forward 兜底。
async function fetchLatestMainRunJobs({ owner, repo, token }) {
    return withRetry(async () => {
        const runsResponse = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/actions/workflows/ci-cd.yml/runs?branch=main&per_page=1`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/vnd.github+json',
                    'User-Agent': 'guidance-astro-metrics-collector',
                },
            }
        )
        if (!runsResponse.ok) {
            const text = await runsResponse.text()
            throw new Error(`Main runs request failed (${runsResponse.status}): ${text}`)
        }
        const runsBody = await runsResponse.json()
        const run = runsBody.workflow_runs?.[0]
        if (!run) return null
        const jobsResponse = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/actions/runs/${run.id}/jobs?per_page=100`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/vnd.github+json',
                    'User-Agent': 'guidance-astro-metrics-collector',
                },
            }
        )
        if (!jobsResponse.ok) {
            const text = await jobsResponse.text()
            throw new Error(`Jobs request failed (${jobsResponse.status}): ${text}`)
        }
        const jobsBody = await jobsResponse.json()
        return jobsBody.jobs ?? []
    })
}

function jobErrorCount(jobs, nameFragment) {
    const job = jobs?.find((item) => item.name?.includes(nameFragment))
    if (!job) return null
    return job.conclusion === 'success' ? 0 : 1
}

const EMPTY_BUNDLE_SIZE = { current: 0, budget: 0, percentage: 0 }

function degradedLegacyView(previous) {
    const previousQuality = previous?.qualityMetrics ?? null
    return {
        summary: previous?.summary ?? {
            totalIssues: 0,
            closedIssues: 0,
            openIssues: 0,
            ciPassRate: 0,
        },
        byStatus: previous?.byStatus ?? {},
        byPriority: previous?.byPriority ?? {},
        milestones: previous?.milestones ?? [],
        qualityMetrics: previousQuality ?? {
            lintErrors: 0,
            typeErrors: 0,
            testCoverage: 0,
            bundleSize: EMPTY_BUNDLE_SIZE,
        },
        recentActivity: previous?.recentActivity ?? [],
    }
}

// 由 GitHub 实时数据构建看板组件（ProjectMetricsDashboard.astro）消费的旧 schema 字段，
// 与新 schema（metrics/counts/samples）合成超集输出。
function buildLegacyView({
    issues,
    pullRequests,
    openIssuesTotalCount,
    closedIssuesTotalCount,
    milestoneNodes,
    ciSuccessRatePercent,
    jobErrors,
    previous,
}) {
    const summary = {
        totalIssues: issues.totalCount,
        closedIssues: closedIssuesTotalCount,
        openIssues: openIssuesTotalCount,
        ciPassRate: Math.round(ciSuccessRatePercent),
    }

    // 状态分布：done = 全部已关闭 Issue；其余按开放 Issue 的状态标签分桶。
    // 本仓无 status:ready 标签（ready 以 status:backlog + 正文标注表达），
    // 未带任何状态标签的开放 Issue 计入 ready，保证 byStatus 求和 = totalIssues。
    const byStatus = {
        backlog: 0,
        ready: 0,
        inProgress: 0,
        review: 0,
        blocked: 0,
        done: closedIssuesTotalCount,
    }
    let labeledOpenCount = 0
    for (const item of issues.nodes) {
        if (item.state !== 'OPEN') continue
        if (hasLabel(item, 'status:in-progress')) {
            byStatus.inProgress += 1
            labeledOpenCount += 1
        } else if (hasLabel(item, 'status:review')) {
            byStatus.review += 1
            labeledOpenCount += 1
        } else if (hasLabel(item, 'status:blocked') || hasLabel(item, 'blocked')) {
            // 本仓实际使用裸 blocked 标签（历史遗留），两种写法都认
            byStatus.blocked += 1
            labeledOpenCount += 1
        } else if (hasLabel(item, 'status:backlog')) {
            byStatus.backlog += 1
            labeledOpenCount += 1
        }
    }
    byStatus.ready += Math.max(openIssuesTotalCount - labeledOpenCount, 0)

    // 优先级分布：按已取回的最近更新 100 条 Issue（开放+关闭）样本计数
    const byPriority = { p0: 0, p1: 0, p2: 0, p3: 0 }
    for (const item of issues.nodes) {
        for (const key of ['p0', 'p1', 'p2', 'p3']) {
            if (hasLabel(item, `priority:${key}`)) {
                byPriority[key] += 1
            }
        }
    }

    const milestones = milestoneNodes.map((item) => ({
        title: item.title ?? '',
        description: item.description ?? '',
        status: item.state === 'CLOSED' ? 'completed' : 'in-progress',
        completionRate: Math.round(item.progressPercentage ?? 0),
        dueDate: item.dueOn ? item.dueOn.slice(0, 10) : null,
    }))

    const previousQuality = previous?.qualityMetrics ?? null
    const bundleSize = previousQuality?.bundleSize ?? EMPTY_BUNDLE_SIZE
    const qualityMetrics = {
        lintErrors: jobErrors.lint ?? previousQuality?.lintErrors ?? 0,
        typeErrors: jobErrors.type ?? previousQuality?.typeErrors ?? 0,
        testCoverage: previousQuality?.testCoverage ?? 0,
        bundleSize: {
            ...bundleSize,
            percentage:
                bundleSize.budget > 0
                    ? Math.round((bundleSize.current / bundleSize.budget) * 100)
                    : 0,
        },
    }

    const recentActivity = [
        ...issues.nodes.map((item) => ({
            type: 'issue',
            title: item.title ?? '',
            status: item.state === 'CLOSED' ? 'closed' : 'open',
            updatedAt: toISO(item.updatedAt ?? item.createdAt),
        })),
        ...pullRequests.nodes.map((item) => ({
            type: 'pr',
            title: item.title ?? '',
            status:
                item.state === 'MERGED' ? 'merged' : item.state === 'CLOSED' ? 'closed' : 'open',
            updatedAt: toISO(item.updatedAt ?? item.createdAt),
        })),
    ]
        .filter((item) => item.title)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 8)

    return { summary, byStatus, byPriority, milestones, qualityMetrics, recentActivity }
}

async function main() {
    const repository = parseRepo(process.env.GITHUB_REPOSITORY || process.argv[2])
    const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN
    const generatedAt = new Date().toISOString()

    if (!repository) {
        throw new Error('Missing repository. Provide GITHUB_REPOSITORY (owner/repo).')
    }

    const basePayload = {
        generatedAt,
        repository: `${repository.owner}/${repository.repo}`,
        windowDays: WINDOW_DAYS,
    }
    const emptyMetrics = {
        issueLeadTimeDays: 0,
        prCycleTimeDays: 0,
        issueCloseRatePercent: 0,
        prMergeRatePercent: 0,
        ciSuccessRatePercent: 0,
        wipIssueCount: 0,
        reviewIssueCount: 0,
        backlogIssueCount: 0,
    }
    const emptyCounts = {
        openIssueCount: 0,
        openPullRequestCount: 0,
        openedIssuesInWindow: 0,
        closedIssuesInWindow: 0,
        openedPullRequestsInWindow: 0,
        mergedPullRequestsInWindow: 0,
        ciRunsInWindow: 0,
        ciFailedRunsInWindow: 0,
    }
    const emptySamples = {
        latestIssueUpdatedAt: null,
        latestMergedPullRequestAt: null,
    }

    const previous = await readPreviousPayload()

    if (!token) {
        await writePayload({
            ...basePayload,
            status: 'degraded',
            reason: 'Missing GITHUB_TOKEN or GH_TOKEN, metrics collection skipped.',
            metrics: emptyMetrics,
            counts: emptyCounts,
            samples: emptySamples,
            ...degradedLegacyView(previous),
        })
        return
    }

    try {
        const now = Date.now()
        const windowStart = now - WINDOW_DAYS * 24 * 60 * 60 * 1000
        const isWithinWindow = (isoDate) =>
            isoDate ? new Date(isoDate).getTime() >= windowStart : false

        const repositoryData = await fetchGitHubGraphQL({
            owner: repository.owner,
            repo: repository.repo,
            token,
        })
        const workflowRuns = await fetchWorkflowRuns({
            owner: repository.owner,
            repo: repository.repo,
            token,
        })

        const issues = repositoryData.issues.nodes
        const pullRequests = repositoryData.pullRequests.nodes

        const openIssues = issues.filter((item) => item.state === 'OPEN')
        const closedIssuesInWindow = issues.filter(
            (item) => item.state === 'CLOSED' && isWithinWindow(item.closedAt)
        )
        const openedIssuesInWindow = issues.filter((item) => isWithinWindow(item.createdAt))

        const issueLeadTimes = closedIssuesInWindow.map((item) =>
            daysBetween(item.createdAt, item.closedAt)
        )

        const openPullRequests = pullRequests.filter((item) => item.state === 'OPEN')
        const mergedPullRequestsInWindow = pullRequests.filter((item) =>
            isWithinWindow(item.mergedAt)
        )
        const openedPullRequestsInWindow = pullRequests.filter((item) =>
            isWithinWindow(item.createdAt)
        )
        const prCycleTimes = mergedPullRequestsInWindow.map((item) =>
            daysBetween(item.createdAt, item.mergedAt)
        )

        const runsInWindow = workflowRuns.filter((item) => isWithinWindow(item.created_at))
        const successfulRuns = runsInWindow.filter((item) => item.conclusion === 'success')
        const failedRuns = runsInWindow.filter((item) => item.conclusion === 'failure')

        // CI 门禁 job 状态用于看板 lint/type 错误数；获取失败不阻塞采集，回退 carry-forward
        let latestMainRunJobs = null
        try {
            latestMainRunJobs = await fetchLatestMainRunJobs({
                owner: repository.owner,
                repo: repository.repo,
                token,
            })
        } catch {
            latestMainRunJobs = null
        }
        const jobErrors = {
            lint: latestMainRunJobs ? jobErrorCount(latestMainRunJobs, 'Lint') : null,
            type: latestMainRunJobs ? jobErrorCount(latestMainRunJobs, 'Type Check') : null,
        }
        const ciSuccessRatePercent = Number(
            ((successfulRuns.length / Math.max(runsInWindow.length, 1)) * 100).toFixed(2)
        )
        const legacyView = buildLegacyView({
            issues: repositoryData.issues,
            pullRequests: repositoryData.pullRequests,
            openIssuesTotalCount: repositoryData.openIssues.totalCount,
            closedIssuesTotalCount: repositoryData.closedIssues.totalCount,
            milestoneNodes: repositoryData.milestones.nodes,
            ciSuccessRatePercent,
            jobErrors,
            previous,
        })

        const payload = {
            ...basePayload,
            status: 'ok',
            metrics: {
                issueLeadTimeDays: Number(mean(issueLeadTimes).toFixed(2)),
                prCycleTimeDays: Number(mean(prCycleTimes).toFixed(2)),
                issueCloseRatePercent: Number(
                    (
                        (closedIssuesInWindow.length / Math.max(openedIssuesInWindow.length, 1)) *
                        100
                    ).toFixed(2)
                ),
                prMergeRatePercent: Number(
                    (
                        (mergedPullRequestsInWindow.length /
                            Math.max(openedPullRequestsInWindow.length, 1)) *
                        100
                    ).toFixed(2)
                ),
                ciSuccessRatePercent,
                wipIssueCount: openIssues.filter((item) => hasLabel(item, 'status:in-progress'))
                    .length,
                reviewIssueCount: openIssues.filter((item) => hasLabel(item, 'status:review'))
                    .length,
                backlogIssueCount: openIssues.filter((item) => hasLabel(item, 'status:backlog'))
                    .length,
            },
            counts: {
                openIssueCount: openIssues.length,
                openPullRequestCount: openPullRequests.length,
                openedIssuesInWindow: openedIssuesInWindow.length,
                closedIssuesInWindow: closedIssuesInWindow.length,
                openedPullRequestsInWindow: openedPullRequestsInWindow.length,
                mergedPullRequestsInWindow: mergedPullRequestsInWindow.length,
                ciRunsInWindow: runsInWindow.length,
                ciFailedRunsInWindow: failedRuns.length,
            },
            samples: {
                latestIssueUpdatedAt: issues[0]?.createdAt ? toISO(issues[0].createdAt) : null,
                latestMergedPullRequestAt: mergedPullRequestsInWindow[0]?.mergedAt
                    ? toISO(mergedPullRequestsInWindow[0].mergedAt)
                    : null,
            },
            ...legacyView,
        }

        await writePayload(payload)
    } catch (error) {
        await writePayload({
            ...basePayload,
            status: 'degraded',
            reason: error instanceof Error ? error.message : String(error),
            metrics: emptyMetrics,
            counts: emptyCounts,
            samples: emptySamples,
            ...degradedLegacyView(previous),
        })
    }
}

main()
