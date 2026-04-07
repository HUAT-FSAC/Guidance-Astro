export const prerender = false

import type { APIRoute } from 'astro'
import { env } from 'cloudflare:workers'

/**
 * 获取 VAPID 公钥
 * 用于前端订阅推送通知
 */
export const GET: APIRoute = async () => {
    const publicKey = env.VAPID_PUBLIC_KEY

    if (!publicKey) {
        return new Response(JSON.stringify({ error: 'VAPID 公钥未配置' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    return new Response(JSON.stringify({ publicKey }), {
        headers: { 'Content-Type': 'application/json' },
    })
}
