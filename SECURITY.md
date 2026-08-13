# Security Policy

## Supported versions

This repository publishes a continuously deployed documentation site. Only the latest `main` deployment at [huat-fsac.eu.org](https://huat-fsac.eu.org) receives security updates.

## Reporting a vulnerability

Do **not** open a public GitHub Issue for security reports.

Please use [GitHub Private Vulnerability Reporting](https://github.com/HUAT-FSAC/Guidance-Astro/security/advisories/new).

We will acknowledge receipt as soon as possible and follow up after triaging the report. If the issue is accepted, a fix will be prepared privately and credited as you prefer. If it is declined, we will explain why.

## Scope

In scope:

- Cross-site scripting or content injection on the published site
- Secrets or credentials accidentally committed to this repository
- Misconfigured security headers that weaken visitor protection

Out of scope:

- Denial-of-service against Cloudflare or other upstream infrastructure
- Issues that require physical access or an already-compromised maintainer account
- Vulnerabilities in third-party dependencies that do not affect this deployment (please report those upstream)
