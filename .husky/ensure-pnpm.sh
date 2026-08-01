#!/usr/bin/env sh
# Ensure pnpm is available.
# On Windows, mise-managed node ships a corepack shim (pnpm.CMD) inside the
# node install dir, which may be missing from git's hook PATH.
if ! command -v pnpm >/dev/null 2>&1; then
    if command -v mise >/dev/null 2>&1 && command -v cygpath >/dev/null 2>&1; then
        export PATH="$(cygpath -u "$(mise where node 2>/dev/null)"):$PATH"
    fi
fi
