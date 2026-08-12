/**
 * Patch Cloudflare Pages Git build to deploy SSR via Workers (wrangler deploy).
 * Astro 7 + @astrojs/cloudflare targets Workers, not static Pages upload.
 */
import { readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const ACCOUNT_ID = 'bfdcbff6cfe16d2b9bd657593ba88f5f'
const PROJECT = 'huat-fsac'

function getToken() {
    const configPath = join(homedir(), 'AppData/Roaming/xdg.config/.wrangler/config/default.toml')
    const raw = readFileSync(configPath, 'utf8')
    const match = raw.match(/^oauth_token\s*=\s*"([^"]+)"/m)
    if (!match) throw new Error('oauth_token not found in wrangler config')
    return match[1]
}

const body = {
    build_config: {
        build_command: 'pnpm build && pnpm exec wrangler deploy --config dist/server/wrangler.json',
        destination_dir: 'dist/client',
        build_caching: true,
        root_dir: '',
    },
    deployment_configs: {
        production: {
            compatibility_date: '2026-04-15',
            compatibility_flags: ['nodejs_compat'],
        },
        preview: {
            compatibility_date: '2026-04-15',
            compatibility_flags: ['nodejs_compat'],
        },
    },
}

const token = getToken()
const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT}`,
    {
        method: 'PATCH',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    }
)

const json = await res.json()
if (!json.success) {
    console.error('PATCH failed:', JSON.stringify(json, null, 2))
    process.exit(1)
}

console.log('PATCH success')
console.log('build_command:', json.result.build_config.build_command)
console.log('destination_dir:', json.result.build_config.destination_dir)
