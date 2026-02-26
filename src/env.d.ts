// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

type D1Database = import('@cloudflare/workers-types').D1Database
type KVNamespace = import('@cloudflare/workers-types').KVNamespace

type Runtime = import('@astrojs/cloudflare').Runtime<{
    DB: D1Database
    SESSION_KV: KVNamespace
    SESSION_SECRET: string
    GITHUB_CLIENT_ID: string
    GITHUB_CLIENT_SECRET: string
    QQ_APP_ID: string
    QQ_APP_KEY: string
}>

declare namespace App {
    interface Locals extends Runtime {
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
