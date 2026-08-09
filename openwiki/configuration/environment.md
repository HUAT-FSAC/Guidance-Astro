---
type: concept
title: Environment Configuration
description: Environment variables, secrets, Wrangler configuration, and optional integrations (GitHub OAuth, QQ auth, push notifications, analytics).
tags: [configuration, environment, secrets, cloudflare]
timestamp: 2026-04-15
---

# Environment Configuration

## Environment Variables

### `.dev.vars.example`

Documents required and optional environment variables:

| Variable                   | Purpose                           | Required |
| -------------------------- | --------------------------------- | -------- |
| `UMAMI_WEBSITE_ID`         | Umami Analytics tracking          | Optional |
| `GITHUB_CLIENT_ID`         | GitHub OAuth authentication       | Optional |
| `GITHUB_CLIENT_SECRET`     | GitHub OAuth authentication       | Optional |
| `QQ_APP_ID`                | QQ authentication                 | Optional |
| `QQ_APP_KEY`               | QQ authentication                 | Optional |
| `VAPID_PUBLIC_KEY`         | Web Push notification public key  | Optional |
| `VAPID_PRIVATE_KEY`        | Web Push notification private key | Optional |
| `UPTIME_ROBOT_API_KEY`     | Uptime monitoring API key         | Optional |
| `UPTIME_ROBOT_MONITOR_IDS` | Uptime monitoring IDs             | Optional |
| `FEISHU_WEBHOOK_URL`       | Feishu notification webhook       | Optional |
| `WECOM_WEBHOOK_URL`        | WeCom notification webhook        | Optional |
| `SLACK_WEBHOOK_URL`        | Slack notification webhook        | Optional |
| `SLACK_CHANNEL`            | Slack notification channel        | Optional |
| `ALERT_EMAILS`             | Alert email addresses             | Optional |

### GitHub Actions Secrets

Used by workflows in `.github/workflows/`:

| Secret                 | Used By                  | Purpose                  |
| ---------------------- | ------------------------ | ------------------------ |
| `FEISHU_WEBHOOK_URL`   | notify-collaboration.yml | PR notifications         |
| `WECOM_WEBHOOK_URL`    | notify-collaboration.yml | PR notifications         |
| `PROJECT_TOKEN`        | project-automation.yml   | GitHub Projects access   |
| `OPENROUTER_API_KEY`   | openwiki-update.yml      | AI documentation updates |
| `CLOUDFLARE_API_TOKEN` | ci-cd.yml                | Deployment               |

## Wrangler Configuration

### `wrangler.json`

```json
{
    "compatibility_date": "2026-04-15",
    "compatibility_flags": ["nodejs_compat"]
}
```

- **compatibility_date**: Sets the Cloudflare Workers compatibility date
- **nodejs_compat**: Enables Node.js compatibility for Workers

### Development

Run locally with Wrangler:

```bash
pnpm dev:worker
# Equivalent to: wrangler pages dev dist --compatibility-date=2024-04-01
```

## Optional Integrations

### Umami Analytics

Analytics tracking via Umami:

```javascript
// In .config/astro.config.mjs head array:
{
    tag: 'script',
    attrs: {
        src: 'https://cloud.umami.is/script.js',
        'data-website-id': process.env.UMAMI_WEBSITE_ID || '',
        defer: true,
    },
}
```

Event tracking is implemented in `src/utils/analytics.ts` with an `AnalyticsEvent` enum for typed events.

### GitHub OAuth

For authentication features (if enabled):

- `GITHUB_CLIENT_ID` - GitHub App client ID
- `GITHUB_CLIENT_SECRET` - GitHub App client secret

### QQ Authentication

For QQ login integration:

- `QQ_APP_ID` - QQ App ID
- `QQ_APP_KEY` - QQ App Key

### Web Push Notifications

For browser push notifications:

- `VAPID_PUBLIC_KEY` - VAPID public key
- `VAPID_PRIVATE_KEY` - VAPID private key

## Monitoring Configuration

`src/config/monitoring.ts` (6310 bytes) defines monitoring settings:

```typescript
export interface MonitorConfig {
    enabled: boolean
    uptimeRobot: { apiKey: string; monitorIds: string[] }
    analytics: { umami: { websiteId: string; host: string } }
    performance: { enabled: boolean; reportTo: string; thresholds: {...} }
    alerts: { enabled: boolean; email: string[]; slack?: {...} }
}
```

### Performance Thresholds

```typescript
thresholds: {
    fcp: 1800,    // First Contentful Paint (ms)
    lcp: 2500,    // Largest Contentful Paint (ms)
    cls: 0.1,     // Cumulative Layout Shift
    fid: 100,     // First Input Delay (ms)
    ttfb: 800,    // Time to First Byte (ms)
}
```

## Build-Time Environment Variables

Some environment variables affect the build:

| Variable                      | Effect                                        |
| ----------------------------- | --------------------------------------------- |
| `BUNDLE_BUDGET_TOTAL_JS_KB`   | Override JS bundle budget (default: 380)      |
| `BUNDLE_BUDGET_TOTAL_CSS_KB`  | Override CSS bundle budget (default: 180)     |
| `BUNDLE_BUDGET_SINGLE_JS_KB`  | Override single JS file budget (default: 100) |
| `BUNDLE_BUDGET_SINGLE_CSS_KB` | Override single CSS file budget (default: 95) |

## Related Pages

- [Astro Configuration](./astro-config.md)
- [Security Configuration](./security.md)
- [GitHub Actions](../operations/github-actions.md)
- [Build and Deployment](../architecture/build-deployment.md)
