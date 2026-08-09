---
type: concept
title: Development Tooling
description: Git hooks (Husky), commitlint conventions, pnpm workspace setup, ESLint, Prettier, and TypeScript configuration.
tags: [tooling, git-hooks, linting, formatting]
timestamp: 2026-04-15
---

# Development Tooling

## Git Hooks

### Husky Configuration

Husky is configured in `package.json`:

```json
{
    "scripts": {
        "prepare": "husky"
    }
}
```

The `.husky/` directory contains git hooks for pre-commit checks.

## Commit Conventions

### commitlint

Two configuration files exist:

1. `commitlint.config.cjs` (root)
2. `.config/commitlint.config.cjs` (511 bytes)

Uses `@commitlint/config-conventional` for conventional commit messages:

```
<type>(<optional scope>): <description>

[optional body]

[optional footer(s)]
```

Valid types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

### Lint-Staged

`.config/lint-staged.config.mjs` (127 bytes):

```javascript
export default {
    '*.{ts,tsx,css,json,mjs}': ['eslint --fix', 'prettier --write'],
}
```

Runs ESLint and Prettier on staged files before commit.

## Code Linting

### ESLint

`.config/eslint.config.mjs` (1836 bytes):

```javascript
export default [
    // ... ESLint configuration
]
```

Uses `eslint-plugin-astro` for Astro-specific linting rules.

### Running Lint

```bash
pnpm lint      # Check for issues
pnpm lint:fix  # Auto-fix issues
```

## Code Formatting

### Prettier

Configuration in `.config/.prettierrc` (406 bytes) and `prettier.config.cjs` (245 bytes).

### Running Format

```bash
pnpm format        # Format code
pnpm format:check  # Check formatting without modifying
```

## TypeScript

### Configuration

`tsconfig.json` (595 bytes) at the root:

```json
{
    "compilerOptions": {
        // TypeScript configuration
    }
}
```

### Type Definitions

- `src/env.d.ts` (1390 bytes) - Environment type declarations
- `src/types/bcryptjs.d.ts` (433 bytes) - bcryptjs type declarations

### Astro Check

```bash
pnpm astro check
# Uses @astrojs/check for type checking
```

## Package Manager

### pnpm Workspace

`pnpm-workspace.yaml` (121 bytes) defines the workspace configuration.

### Dependencies

`package.json` includes security overrides for known vulnerabilities:

```json
{
    "pnpm": {
        "overrides": {
            "minimatch@<3.1.3": ">=3.1.3",
            "ajv@<6.14.0": "~6.14.0"
            // ... more overrides
        }
    }
}
```

### Engines

```json
{
    "engines": {
        "node": ">=22.0.0"
    },
    "packageManager": "pnpm@9.15.9"
}
```

## Quality Scripts

| Script                    | Description              |
| ------------------------- | ------------------------ |
| `pnpm lint`               | ESLint check             |
| `pnpm lint:fix`           | ESLint auto-fix          |
| `pnpm format`             | Prettier formatting      |
| `pnpm format:check`       | Prettier check only      |
| `pnpm quality:bundle`     | Bundle size budget check |
| `pnpm quality:lighthouse` | Lighthouse CI audit      |

## Configuration Files Summary

| File                             | Purpose                       |
| -------------------------------- | ----------------------------- |
| `.config/eslint.config.mjs`      | ESLint configuration          |
| `.config/.prettierrc`            | Prettier configuration        |
| `.config/commitlint.config.cjs`  | Commit message linting        |
| `.config/lint-staged.config.mjs` | Pre-commit linting            |
| `.config/vitest.config.ts`       | Vitest configuration          |
| `.config/playwright.config.ts`   | Playwright configuration      |
| `.config/lighthouserc.json`      | Lighthouse CI configuration   |
| `.config/.browserslistrc`        | Browser support targets       |
| `tsconfig.json`                  | TypeScript configuration      |
| `prettier.config.cjs`            | Prettier configuration (root) |

## Related Pages

- [Environment Configuration](./environment.md)
- [Testing Strategy](../development/testing.md)
- [Build and Deployment](../architecture/build-deployment.md)
