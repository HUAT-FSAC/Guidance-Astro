---
type: reference
title: Project Structure
description: Directory-by-directory map of the Guidance-Astro repository showing the purpose of each directory and key files.
tags: [reference, structure]
---

# Project Structure

This is a directory-by-directory map of the repository, organized by purpose rather than a raw listing.

```text
Guidance-Astro/
├── .config/                    # Centralized configuration directory
│   ├── astro.config.mjs        # Alternative Astro config (static build, all integrations)
│   ├── sidebar.ts              # Starlight sidebar structure (zh/en)
│   ├── vitest.config.ts        # Vitest configuration
│   ├── playwright.config.ts    # Playwright E2E configuration
│   ├── eslint.config.mjs       # ESLint flat config
│   ├── lint-staged.config.mjs  # Husky lint-staged hooks
│   ├── .prettierrc             # Prettier configuration
│   ├── .browserslistrc          # Browser targets
│   └── lighthouserc.json       # Lighthouse CI assertions
├── .github/workflows/          # CI/CD pipelines
├── .husky/                     # Git hooks
├── docs/                       # Project planning and design docs
│   ├── guides/                 # Documentation conventions
│   ├── plans/                  # Feature planning documents
│   ├── reports/                # Implementation and completion reports
│   └── README.md
├── docs-meta/                  # Meta documentation (contributing, deployment, ADRs)
│   ├── adr/                    # Architectural decision records
│   ├── CONTRIBUTING.md
│   ├── DEPLOYMENT.md
│   ├── SECURITY.md
│   ├── TODOLIST.md
│   └── *.md                    # Feature reports, fix summaries
├── public/                     # Static assets (copied to dist/)
│   ├── favicon.{png,svg}
│   ├── og-image.png
│   ├── manifest.json           # PWA manifest
│   ├── sw.js                   # Service Worker
│   ├── offline.html            # PWA offline fallback
│   ├── team-extracted.html     # Legacy team page extraction artifact
│   └── assets/                 # Static images (team photos, car images, etc.)
├── scripts/                    # Build-time utility scripts
│   ├── quality/                # Bundle budget checking
│   ├── metrics/                # GitHub metrics collection
│   └── optimize-images.mjs     # Image optimization pipeline
├── src/
│   ├── assets/                 # Optimizable Astro assets
│   │   ├── logo-canvas.{png,avif,webp}  # Starlight logo
│   │   ├── huat.{avif,jpg,webp}        # Brand image
│   │   ├── code/               # Code snippet images
│   │   └── docs/               # Documentation images (by year/module)
│   ├── components/             # Astro + vanilla JS components
│   │   ├── overrides/          # Starlight component overrides
│   │   ├── home/               # Home page sections + UI widgets
│   │   ├── docs/               # Documentation enhancement components
│   │   ├── navigation/         # Anchor nav + sidebar state
│   │   ├── icons/              # Icon components
│   │   └── contributing/       # GitHub flow visualization
│   ├── config/                 # Security + monitoring configuration
│   ├── content/                # Starlight content collections
│   │   ├── docs/               # Documentation content (zh-CN primary)
│   │   │   ├── docs-center/    # Docs center content
│   │   ├── docs/en/            # English content mirrors
│   │   └─ i18n/                # UI translation files (zh.json, en.json)
│   ├── data/                   # Static data (TypeScript + JSON)
│   │   ├── home.ts             # Home page content + i18n aggregation
│   │   ├── cars.ts             # Car specifications and achievements
│   │   ├── showcase-lab.ts     # Showcase Lab data model + scenarios
│   │   ├── showcase-lab-i18n.ts # Showcase Lab UI strings
│   │   ├── sponsors.json       # Sponsor data
│   │   ├── seasons/            # Annual team rosters (2023-2025)
│   │   └── metrics/            # Project progress tracking
│   ├── integrations/           # Custom Astro build integrations
│   ├── pages/                  # Astro page routes
│   │   ├── docs.astro          # /docs/ legacy redirect stub
│   │   ├── showcase-dashboard.astro  # Interactive showcase dashboard
│   │   └── en/                 # Disabled legacy .astro.disabled pages
│   ├── styles/                 # Global + component styles
│   ├── types/                  # Type declarations
│   │   └── bcryptjs.d.ts       # bcryptjs type (for planned auth, not used)
│   ├── utils/                  # Client-side JS controllers and utilities
│   │   ├── content.config.ts   # Starlight content collection config
│   ├── middleware.ts           # Astro onRequest middleware (CSP nonce, security)
│   └── env.d.ts               # TypeScript env type declarations
├── tests/
│   ├── unit/                   # Vitest unit tests
│   └── e2e/                    # Playwright E2E tests
├── .dev.vars.example           # Cloudflare env var template
├── astro.config.mjs            # Production Astro config (Cloudflare adapter)
├── pnpm-workspace.yaml         # pnpm workspace config
├── package.json                # Scripts + dependencies
├── tsconfig.json               # TypeScript config
├── vitest.config.ts            # Root wrapper → .config/vitest.config.ts
├── eslint.config.mjs           # Root wrapper → .config/eslint.config.mjs
├── playwright.config.ts        # Root wrapper → .config/playwright.config.ts
├── prettier.config.cjs         # Root wrapper → .config/.prettierrc
├── commitlint.config.cjs       # Root wrapper → .config/commitlint.config.cjs
└── wrangler.json               # Cloudflare Workers config
```

## Key Files

| File                       | Role                                                                                                |
| -------------------------- | --------------------------------------------------------------------------------------------------- |
| `astro.config.mjs`         | Primary production config with Cloudflare adapter                                                   |
| `.config/astro.config.mjs` | Alternative static-only config (all 4 integrations, full i18n head injection)                       |
| `src/middleware.ts`        | Per-request CSP nonce + security headers                                                            |
| `src/content.config.ts`    | Starlight `docs` + `i18n` content collections                                                       |
| `src/env.d.ts`             | Type contracts: `App.Locals` + `cloudflare:workers` Env (note: many Env types are phantom/planning) |

## Configuration Pattern

Root-level config files (`vitest.config.ts`, `eslint.config.mjs`, `playwright.config.ts`, `prettier.config.cjs`, `commitlint.config.cjs`) are **thin wrappers** that re-export from `.config/`. This centralizes configuration while providing familiar root-level entry points. The `.config/` directory also contains `.browserslistrc` and `.prettierrc` for tools that look for config in standard locations.
