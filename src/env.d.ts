// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

import type { D1Database, KVNamespace } from '@cloudflare/workers-types'

declare global {
    namespace App {
        interface Locals {
            runtime: {
                env: {
                    DB: D1Database
                    SESSION_KV: KVNamespace
                    SESSION_SECRET: string
                    GITHUB_CLIENT_ID: string
                    GITHUB_CLIENT_SECRET: string
                    QQ_APP_ID: string
                    QQ_APP_KEY: string
                }
            }
            user?: {
                id: string
                username: string
                email: string
                role: string
                displayName?: string
                avatarUrl?: string
            }
        }
    }
}

export {}
