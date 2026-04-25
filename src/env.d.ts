// Astro 生成的类型声明文件需要使用三斜杠引用指令
// 这是 Astro 框架的要求，无法使用 ES 模块的 import 语法
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

// 静态构建模式：使用内联类型声明替代 @cloudflare/workers-types
// 避免 workers-types 与 DOM 类型的冲突
type D1Database = unknown
type KVNamespace = unknown

declare module 'cloudflare:workers' {
    export interface Env {
        DB: D1Database
        SESSION_KV: KVNamespace
        SESSION_SECRET: string
        GITHUB_CLIENT_ID: string
        GITHUB_CLIENT_SECRET: string
        QQ_APP_ID: string
        QQ_APP_KEY: string
        UMAMI_WEBSITE_ID?: string
        VAPID_PUBLIC_KEY?: string
        VAPID_PRIVATE_KEY?: string
    }
    export const env: Env
}

declare global {
    namespace App {
        interface Locals {
            user?: {
                id: string
                username: string
                email: string
                role: string
                displayName?: string
                avatarUrl?: string
            }
            // CSP nonce，用于允许特定的内联脚本
            cspNonce?: string
            // Cloudflare Execution Context
            cfContext?: ExecutionContext
        }
    }
}

export {}
