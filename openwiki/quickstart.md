---
type: concept
title: Quick Start Guide
description: Quick start guide for the HUAT FSAC documentation site, including setup, development, and deployment.
tags: [quickstart, setup, development]
timestamp: 2026-04-15
---

# Quick Start Guide

Welcome to the HUAT FSAC documentation site! This guide will help you get started with development and contribution.

## What Is This?

The HUAT FSAC documentation site is built with [Astro](https://docs.astro.build/) and [Starlight](https://starlight.astro.build/), deployed to Cloudflare Pages. It serves as the knowledge hub for the HUAT Formula Student Autonomous Racing team.

## Prerequisites

- Node.js 18+
- pnpm 8+

## Quick Setup

```bash
# Clone the repository
git clone https://github.com/HUAT-FSAC/Guidance-Astro.git
cd Guidance-Astro

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Visit http://localhost:4321 to view the site.

## Build and Preview

```bash
# Build for production
pnpm build

# Preview the build
pnpm preview
```

## Project Structure

```
Guidance-Astro/
├── .config/             # Configuration files
│   ├── astro.config.mjs # Astro + Starlight configuration
│   ├── sidebar.mjs      # Sidebar navigation structure
│   └── security.ts      # Security headers and CSP
├── public/              # Static assets
│   ├── manifest.json    # PWA configuration
│   ├── sw.js            # Service Worker
│   └── offline.html     # Offline fallback page
├── src/
│   ├── components/      # Astro components
│   ├── config/          # Security and monitoring config
│   ├── content/         # MDX content collections
│   ├── data/            # Data files
│   ├── integrations/    # Custom Astro integrations
│   ├── middleware.ts    # Request middleware
│   ├── pages/           # Page components
│   ├── styles/          # Global styles
│   ├── types/           # TypeScript types
│   └── utils/           # Utility modules
├── scripts/             # Build/optimization scripts
└── tests/               # Test files
```

## Key Features

| Feature      | Description                         | Documentation                                       |
| ------------ | ----------------------------------- | --------------------------------------------------- |
| Bilingual    | Chinese/English support             | [i18n Configuration](configuration/i18n.md)         |
| PWA          | Offline access                      | [PWA and Offline Support](features/pwa.md)          |
| Search       | Pagefind-powered search             | [Interactive Features](features/interactive.md)     |
| Themes       | Light/dark mode + color schemes     | [Interactive Features](features/interactive.md)     |
| Showcase Lab | Interactive autonomous driving demo | [Showcase Lab](architecture/showcase-lab.md)        |
| Security     | CSP, security headers, nonce        | [Security Configuration](configuration/security.md) |

## Common Tasks

### Adding Documentation

1. Create an MDX file in `src/content/docs/`
2. Add frontmatter:
    ```yaml
    ---
    title: Page Title
    description: Page description
    ---
    ```
3. The page will be automatically routed

See [Content Collections](content/collections.md) for details.

### Adding a New Section to Home Page

1. Create a component in `src/components/home/sections/`
2. Import it in `src/content/docs/index.mdx`
3. Add data to `src/data/home.ts` if needed

See [Home Page Components](components/home-page.md) for details.

### Adding a New Page

1. Create an Astro component in `src/pages/`
2. Add route configuration if needed
3. Add redirect in `.config/astro.config.mjs` if replacing an old URL

See [Pages and Routing](architecture/pages-routing.md) for details.

### Modifying Sidebar

Edit `.config/sidebar.mjs` to add, remove, or reorganize sidebar items.

See [Sidebar Configuration](configuration/sidebar.md) for details.

### Adding a Theme Color

1. Add to `THEME_COLORS` in `src/utils/theme-controller.ts`
2. Add translation to `src/content/i18n/en.json` and `zh.json`

See [Interactive Features](features/interactive.md) for details.

## Development Commands

| Command                | Description              |
| ---------------------- | ------------------------ |
| `pnpm dev`             | Start development server |
| `pnpm build`           | Build for production     |
| `pnpm preview`         | Preview build            |
| `pnpm lint`            | Run ESLint               |
| `pnpm lint:fix`        | Fix ESLint issues        |
| `pnpm format`          | Format with Prettier     |
| `pnpm test`            | Run unit tests           |
| `pnpm test:run`        | Run unit tests (single)  |
| `pnpm test:e2e`        | Run E2E tests            |
| `pnpm clean`           | Clean build artifacts    |
| `pnpm quality:bundle`  | Check bundle budgets     |
| `pnpm metrics:collect` | Collect GitHub metrics   |

## Wiki Navigation

### Architecture

- [Overview](architecture/overview.md) - System architecture overview
- [Build and Deployment](architecture/build-deployment.md) - Build pipeline and deployment
- [Showcase Lab Architecture](architecture/showcase-lab.md) - Showcase lab technical details
- [Pages and Routing](architecture/pages-routing.md) - URL structure and routing
- [Middleware](architecture/middleware.md) - Request middleware

### Configuration

- [Astro Configuration](configuration/astro-config.md) - Astro and Starlight config
- [Sidebar Configuration](configuration/sidebar.md) - Navigation structure
- [Security Configuration](configuration/security.md) - CSP and security headers
- [i18n Configuration](configuration/i18n.md) - Internationalization
- [Environment Variables](configuration/environment.md) - Environment setup
- [Tooling](configuration/tooling.md) - ESLint, Prettier, TypeScript

### Content

- [Content Collections](content/collections.md) - MDX content structure

### Components

- [Home Page Components](components/home-page.md) - Home page sections
- [Documentation Components](components/docs-components.md) - Doc page components
- [Starlight Overrides](components/starlight-overrides.md) - Custom Starlight components
- [Navigation Components](components/navigation.md) - Navigation system

### Features

- [Interactive Features](features/interactive.md) - Search, theme, share
- [Showcase Lab Features](features/showcase-lab.md) - Presentation console, compare mode
- [PWA and Offline Support](features/pwa.md) - Service worker and offline

### Integrations

- [Custom Astro Integrations](integrations/custom-integrations.md) - Build-time integrations

### Utilities

- [Data Management](utilities/data-management.md) - Data files and schemas
- [Utility Modules](utilities/modules.md) - Shared utilities

### Operations

- [Development Scripts](operations/scripts.md) - Build scripts
- [GitHub Actions](operations/github-actions.md) - CI/CD workflows

### Development

- [Testing Strategy](development/testing.md) - Test coverage and invariants
- [Skills](development/skills.md) - AI/LLM skill definitions

## Troubleshooting

### Build Warnings

Some build warnings are expected and filtered by the `filter-known-build-warnings` integration. See [Custom Astro Integrations](integrations/custom-integrations.md).

### PWA Not Working

- Ensure `manifest.json` is accessible at `/manifest.json`
- Check browser console for service worker errors
- Clear site data and reload

### Search Not Working

- Run `pnpm build` to regenerate the search index
- Check that Pagefind output exists in `dist/pagefind/`

## Related Links

- [HUAT FSAC Website](https://huat-fsac.eu.org)
- [GitHub Organization](https://github.com/HUAT-FSAC)
- [Astro Documentation](https://docs.astro.build/)
- [Starlight Documentation](https://starlight.astro.build/)
