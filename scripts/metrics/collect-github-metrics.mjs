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
            nodes {
              number
              state
              createdAt
              closedAt
              labels(first: 20) {
                nodes {
                  name
                }
              }
            }
          }
          pullRequests(first: 100, orderBy: {field: UPDATED_AT, direction: DESC}, states: [OPEN, CLOSED, MERGED]) {
            nodes {
              number
              state
              createdAt
              closedAt
              mergedAt
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

    if (!token) {
        await writePayload({
            ...basePayload,
            status: 'degraded',
            reason: 'Missing GITHUB_TOKEN or GH_TOKEN, metrics collection skipped.',
            metrics: emptyMetrics,
            counts: emptyCounts,
            samples: emptySamples,
        })
        return
    }

    try {
        const now = Date.now()
        const windowStart = now - WINDOW_DAYS * 24 * 60 * 60 * 1000
        const isWithinWindow = (isoDate) => (isoDate ? new Date(isoDate).getTime() >= windowStart : false)

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
        const mergedPullRequestsInWindow = pullRequests.filter((item) => isWithinWindow(item.mergedAt))
        const openedPullRequestsInWindow = pullRequests.filter((item) => isWithinWindow(item.createdAt))
        const prCycleTimes = mergedPullRequestsInWindow.map((item) =>
            daysBetween(item.createdAt, item.mergedAt)
        )

        const runsInWindow = workflowRuns.filter((item) => isWithinWindow(item.created_at))
        const successfulRuns = runsInWindow.filter((item) => item.conclusion === 'success')
        const failedRuns = runsInWindow.filter((item) => item.conclusion === 'failure')

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
                ciSuccessRatePercent: Number(
                    ((successfulRuns.length / Math.max(runsInWindow.length, 1)) * 100).toFixed(2)
                ),
                wipIssueCount: openIssues.filter((item) => hasLabel(item, 'status:in-progress')).length,
                reviewIssueCount: openIssues.filter((item) => hasLabel(item, 'status:review')).length,
                backlogIssueCount: openIssues.filter((item) => hasLabel(item, 'status:backlog')).length,
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
        })
    }
}

main()
