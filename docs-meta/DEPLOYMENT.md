# Deployment Guide

This document describes how to deploy the HUAT FSAC documentation site.

## Overview

The site is deployed to **Cloudflare Pages** and accessible at [huat-fsac.eu.org](https://huat-fsac.eu.org).

---

## Automatic Deployment

### GitHub Integration

Cloudflare Pages is connected to the GitHub repository. Any push to the `main` branch triggers automatic deployment.

```
Push to main → Cloudflare Build → Deploy to Production
```

### Build Settings

| Setting | Value |
|---------|-------|
| Framework preset | Astro |
| Build command | `pnpm build` |
| Build output directory | `dist` |
| Node.js version | 18.x |

---

## Manual Deployment

### Prerequisites

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login
```

### Deploy Steps

```bash
# 1. Build the site
pnpm build

# 2. Deploy to Cloudflare Pages
wrangler pages deploy dist --project-name=huat-fsac-guidance
```

---

## Environment Variables

No environment variables are required for build. All configuration is handled in `astro.config.mjs`.

---

## Preview Deployments

Every pull request generates a preview deployment at:
```
https://<commit-hash>.huat-fsac-guidance.pages.dev
```

---

## Rollback

### Via Cloudflare Dashboard

1. Go to [Cloudflare Pages Dashboard](https://dash.cloudflare.com/)
2. Select "huat-fsac-guidance" project
3. Navigate to "Deployments"
4. Find the previous deployment
5. Click "..." → "Rollback to this deployment"

### Via CLI

```bash
# List recent deployments
wrangler pages deployment list --project-name=huat-fsac-guidance

# Rollback to specific deployment
wrangler pages deployment rollback <deployment-id> --project-name=huat-fsac-guidance
```

---

## Troubleshooting

### Build Failures

1. **Check Node.js version** - Ensure using Node 18+
2. **Clear cache** - Try "Clear cache and deploy" in dashboard
3. **Check logs** - Review build logs for specific errors

### Common Issues

| Issue | Solution |
|-------|----------|
| `pnpm: command not found` | Cloudflare Pages uses pnpm by default when pnpm-lock.yaml exists |
| Type errors | Run `pnpm lint` locally before pushing |
| Missing dependencies | Check pnpm-lock.yaml is committed |

---

## Performance Monitoring

- **Umami Analytics**: [Dashboard](https://cloud.umami.is/share/ADsMBsz2WVJPbqjO)
- **Cloudflare Analytics**: Available in Pages dashboard

---

## Related Documentation

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Astro Deployment Guide](https://docs.astro.build/en/guides/deploy/cloudflare/)
