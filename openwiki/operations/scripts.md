---
type: concept
title: Development Scripts
description: Build and optimization scripts including image optimization, bundle budget checking, and GitHub metrics collection.
tags: [scripts, build, optimization]
timestamp: 2026-04-15
---

# Development Scripts

Build and optimization scripts in `scripts/`.

## Script Overview

| Script                 | File                                         | Purpose                                 |
| ---------------------- | -------------------------------------------- | --------------------------------------- |
| optimize-images        | `scripts/optimize-images.mjs` (3683 bytes)   | Image compression and format conversion |
| check-bundle-budget    | `scripts/quality/check-bundle-budget.mjs`    | Bundle size budget enforcement          |
| collect-github-metrics | `scripts/metrics/collect-github-metrics.mjs` | GitHub project metrics collection       |

## Image Optimization

`scripts/optimize-images.mjs` (3683 bytes)

### Purpose

Compresses and converts images to modern formats using sharp.

### Supported Formats

Input: `.jpg`, `.jpeg`, `.png`, `.gif`

Output: Original (compressed), `.webp`, `.avif`

### Configuration

```javascript
const imageDirectories = ['/workspace/src/assets', '/workspace/public/assets']

const outputFormats = [
    { format: 'webp', quality: 85 },
    { format: 'avif', quality: 80 },
]
```

### Processing

1. Resize to max 1920px width (no enlargement)
2. Compress original format
3. Generate WebP version (quality 85)
4. Generate AVIF version (quality 80)
5. Replace original with compressed version

### Usage

```bash
node scripts/optimize-images.mjs
```

## Bundle Budget

`scripts/quality/check-bundle-budget.mjs`

### Purpose

Enforces bundle size budgets for JavaScript and CSS.

### Budgets

| Metric          | Default | Environment Variable          |
| --------------- | ------- | ----------------------------- |
| Total JS        | 380 KB  | `BUNDLE_BUDGET_TOTAL_JS_KB`   |
| Total CSS       | 180 KB  | `BUNDLE_BUDGET_TOTAL_CSS_KB`  |
| Single JS file  | 100 KB  | `BUNDLE_BUDGET_SINGLE_JS_KB`  |
| Single CSS file | 95 KB   | `BUNDLE_BUDGET_SINGLE_CSS_KB` |

### Usage

```bash
pnpm quality:bundle
```

### Output

```
[bundle-budget] Total JS: 350.2 KB / 380 KB ✓
[bundle-budget] Total CSS: 165.8 KB / 180 KB ✓
[bundle-budget] Largest JS: 85.3 KB / 100 KB ✓
[bundle-budget] Largest CSS: 78.2 KB / 95 KB ✓
```

Exits with error code 1 if any budget is exceeded.

## GitHub Metrics Collection

`scripts/metrics/collect-github-metrics.mjs`

### Purpose

Collects project metrics from GitHub API and updates `src/data/metrics/project-progress.json`.

### Data Collected

- Issue counts (open/closed)
- Pull request counts
- Project board status
- Milestone progress

### Usage

```bash
pnpm metrics:collect
```

### Automation

Triggered by `collect-github-metrics.yml` workflow on schedule.

## Related Pages

- [Build and Deployment](../architecture/build-deployment.md)
    <!-- openwiki: broken internal link [./data-management.md] file "./data-management.md" does not exist. Fix the href or restore the target, then delete this comment. -->
- [Data Management](./data-management.md)
- [GitHub Actions](../operations/github-actions.md)
