/**
 * Post-build: write a Pages-compatible wrangler.json for dist/server.
 * Pages rejects ASSETS binding, account_id, and main alongside pages_build_output_dir.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const wranglerPath = join('dist', 'server', 'wrangler.json')
const generated = JSON.parse(readFileSync(wranglerPath, 'utf8'))

const pagesConfig = {
    name: generated.name || 'huat-fsac',
    compatibility_date: generated.compatibility_date || '2026-04-15',
    compatibility_flags: generated.compatibility_flags || ['nodejs_compat'],
    pages_build_output_dir: '../client',
    kv_namespaces: generated.kv_namespaces || [{ binding: 'SESSION' }],
    no_bundle: generated.no_bundle ?? true,
}

writeFileSync(wranglerPath, JSON.stringify(pagesConfig, null, 2) + '\n', 'utf8')
console.log('[patch-wrangler-pages] wrote Pages-compatible wrangler.json')
