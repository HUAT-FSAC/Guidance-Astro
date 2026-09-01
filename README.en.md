# HUAT FSAC · Guidance Astro

> The official documentation site of the **HUAT Formula Student (FSAC) team**, built with **Astro 7 + Starlight**.
> Bilingual (zh/en) · Cloudflare Workers SSR · PWA · Multi-theme · Pagefind search · CSP-nonce hardened.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Deploy](https://img.shields.io/badge/Deploy-Cloudflare%20Workers-orange)](https://huat-fsac.eu.org)
[![Node](https://img.shields.io/badge/node-22.23.2-brightgreen)](./.nvmrc)
[![pnpm](https://img.shields.io/badge/pnpm-11.22.0-blue)](https://pnpm.io)
[![Last commit](https://img.shields.io/github/last-commit/HUAT-FSAC/Guidance-Astro)](https://github.com/HUAT-FSAC/Guidance-Astro/commits/main)
[![Issues](https://img.shields.io/github/issues/HUAT-FSAC/Guidance-Astro)](https://github.com/HUAT-FSAC/Guidance-Astro/issues)
[![PRs](https://img.shields.io/github/issues-pr/HUAT-FSAC/Guidance-Astro)](https://github.com/HUAT-FSAC/Guidance-Astro/pulls)
[![Analytics](https://img.shields.io/badge/Analytics-Umami-blue)](https://cloud.umami.is/share/ADsMBsz2WVJPbqjO)

🇬🇧 **English**(this file) · 🇨🇳 [简体中文](./README.md)

> ⚠️ Production is served by **Cloudflare Workers SSR** (`output: server` + `@astrojs/cloudflare`):
> `wrangler deploy --config dist/server/wrangler.json` is triggered on `push main` by the GitHub Actions
> `deploy` job (see [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md)).
> The `*.pages.dev` domain returning 404 is **expected** — do not delete the `huat-fsac.eu.org` DNS records in the zone.

---

## ✨ Features

- 🚀 **Performance** — Astro 7, Vite terser, code splitting, zero-JS by default
- 📱 **PWA** — Offline, installable, smart Service Worker caching
- 🌐 **i18n** — Bilingual content under `src/content/docs/{zh,en}/`
- 🎨 **Themes** — Classic Orange / Esports Blue / Track Red / Tech Purple / Speed Green
- ♿ **A11y** — WCAG AA, mobile touch targets tuned
- 📊 **Analytics** — Umami event tracking
- 🔍 **Search** — Pagefind full-text search with suggestions & highlight
- 🔒 **Hardened** — CSP (base64url nonce) + HSTS + secure response headers + Worker edge config
- 🤖 **Quality gates** — Husky + commitlint + lint-staged + Vitest + Playwright + ESLint + Prettier

---

## 🚀 Quick start

### Requirements

- **Node.js** `22.23.2` (see [`.nvmrc`](./.nvmrc), `engines: >=22.0.0`)
- **pnpm** `11.22.0` (`packageManager` field)
- **Wrangler** `4.114.0` (deployment; not required for local dev)

### Local development

```bash
git clone https://github.com/HUAT-FSAC/Guidance-Astro.git
cd Guidance-Astro
pnpm install
pnpm dev                 # http://localhost:4321
```

### Common commands

| Command                             | Description                                                           |
| ----------------------------------- | --------------------------------------------------------------------- |
| `pnpm dev`                          | Start dev server                                                      |
| `pnpm build`                        | Production build (output in `dist/`)                                  |
| `pnpm preview`                      | Preview the static build locally                                      |
| `pnpm preview:ssr`                  | Run the SSR build with Wrangler locally                               |
| `pnpm lint` / `pnpm lint:fix`       | ESLint check / auto-fix                                               |
| `pnpm format` / `pnpm format:check` | Prettier write / check                                                |
| `pnpm test:run`                     | Vitest unit tests (single run)                                        |
| `pnpm test:coverage`                | Coverage report (70/60/70/70 thresholds)                              |
| `pnpm test:e2e`                     | Playwright end-to-end tests                                           |
| `pnpm quality:bundle`               | Bundle budget check                                                   |
| `pnpm quality:theme`                | Theme contrast check                                                  |
| `pnpm quality:lighthouse`           | Lighthouse CI assertions                                              |
| `pnpm deploy:worker`                | `build` + `wrangler deploy` (needs `CLOUDFLARE_API_TOKEN/ACCOUNT_ID`) |

---

## 📁 Project layout

```text
Guidance-Astro/
├── README.md            # Chinese version
├── README.en.md         # This file
├── LICENSE              # MIT
├── CONTRIBUTING.md      # Contributing guide
├── CODE_OF_CONDUCT.md   # Code of Conduct
├── SUPPORT.md           # Support channels
├── SECURITY.md          # Vulnerability disclosure
├── CHANGELOG.md         # Release history
├── .editorconfig        # Editor style consistency
├── .nvmrc               # Node version
├── .github/             # Issue / PR templates + CI + Dependabot
├── public/              # Static assets (PWA, favicon, _headers)
├── src/                 # Site source
│   ├── assets/          # Optimizable images
│   ├── components/      # Astro components
│   ├── content/docs/    # Published MDX (zh/en)
│   ├── data/            # Home, cars, Showcase Lab data
│   └── pages/           # Routes
├── scripts/             # Build & quality scripts
├── tests/               # Vitest unit + Playwright E2E
├── docs/                # Repo docs (deployment, ADRs, plans, reports)
└── openwiki/            # Auto-generated evidence index (do not edit by hand)
```

> Published site content lives under [`src/content/docs/`](./src/content/docs/).
> Repository development docs live under [`docs/`](./docs/).
> [`openwiki/`](./openwiki/) is refreshed by GitHub Actions — please do not hand-edit it.

---

## 🛠️ Development

### MDX guidelines

- Escape `<` inside table cells: prefer `\<` or wrap in backticks.
- Starlight `<Aside>` supports `note / tip / caution / danger` — **not** `warning`.

### Static assets

Document images should live under `src/assets/docs/<year>/<module>/`:

```mdx
import { Image } from 'astro:assets'
import myImage from '../../assets/docs/2025/perception/lidar-setup.png'

<Image src={myImage} alt="Lidar mounting diagram" />
```

### Dependency / build (pnpm)

- **Delete** any `package-lock.json` (don't conflict with pnpm).
- **Keep and commit** `pnpm-lock.yaml`.
- Do **not** remove build config in `pnpm-workspace.yaml`.

---

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full flow. TL;DR:

1. Fork → create branch `type/area/desc`
2. Follow [Conventional Commits](https://www.conventionalcommits.org/)
3. Push and open a PR, link any related Issue
4. Pass the quality gates in [`docs/WORKFLOW.md §6`](./docs/WORKFLOW.md#6-质量门禁definition-of-done) before merge

Please read [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) first.

---

## 📚 Documentation

| File                                       | Description                      |
| ------------------------------------------ | -------------------------------- |
| [CONTRIBUTING.md](./CONTRIBUTING.md)       | Dev setup, commits and PRs       |
| [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) | Community code of conduct        |
| [SUPPORT.md](./SUPPORT.md)                 | Where to ask, discuss, contact   |
| [SECURITY.md](./SECURITY.md)               | Private vulnerability disclosure |
| [CHANGELOG.md](./CHANGELOG.md)             | Release history                  |
| [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) | Deployment guide                 |
| [docs/WORKFLOW.md](./docs/WORKFLOW.md)     | Development flow & quality gates |
| [docs/adr/](./docs/adr/)                   | Architecture Decision Records    |

---

## 🔐 Security

**Do not** file public Issues for security reports. Use
[GitHub Private Vulnerability Reporting](https://github.com/HUAT-FSAC/Guidance-Astro/security/advisories/new) —
see [SECURITY.md](./SECURITY.md).

---

## 📄 License

[MIT](./LICENSE) © 2026 HUAT FSAC

---

## 🔗 Links

- [Live site](https://huat-fsac.eu.org)
- [GitHub org](https://github.com/HUAT-FSAC)
- [Astro docs](https://docs.astro.build/)
- [Starlight docs](https://starlight.astro.build/)
