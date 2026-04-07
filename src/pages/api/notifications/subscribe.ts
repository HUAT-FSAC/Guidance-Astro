export const prerender = false

import type { APIRoute } from 'astro'
import { env } from 'cloudflare:workers'

interface PushSubscription {
    endpoint: string
    keys: {
        p256dh: string
        auth: string
    }
}

/**
 * 保存推送订阅
 */
export const POST: APIRoute = async ({ request, locals }) => {
    const user = locals.user

    if (!user) {
        return new Response(JSON.stringify({ error: '请先登录' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    let subscription: PushSubscription
    try {
        subscription = await request.json()
    } catch {
        return new Response(JSON.stringify({ error: '无效的订阅数据' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    // 验证必要字段
    if (!subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
        return new Response(JSON.stringify({ error: '缺少必要的订阅字段' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    const now = Date.now()
    const id = `sub_${now}_${Math.random().toString(36).substr(2, 9)}`

    try {
        // 检查是否已存在相同的 endpoint
        const existing = await env.DB.prepare(
            'SELECT id FROM push_subscriptions WHERE endpoint = ?'
        )
            .bind(subscription.endpoint)
            .first<{ id: string }>()

        if (existing) {
            // 更新现有订阅
            await env.DB.prepare(
                'UPDATE push_subscriptions SET user_id = ?, p256dh = ?, auth = ?, updated_at = ? WHERE id = ?'
            )
                .bind(user.id, subscription.keys.p256dh, subscription.keys.auth, now, existing.id)
                .run()
        } else {
            // 创建新订阅
            await env.DB.prepare(
                'INSERT INTO push_subscriptions (id, user_id, endpoint, p256dh, auth, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
            )
                .bind(
                    id,
                    user.id,
                    subscription.endpoint,
                    subscription.keys.p256dh,
                    subscription.keys.auth,
                    now,
                    now
                )
                .run()
        }

        return new Response(JSON.stringify({ ok: true }), {
            headers: { 'Content-Type': 'application/json' },
        })
    } catch (error) {
        console.error('保存订阅失败:', error)
        return new Response(JSON.stringify({ error: '保存订阅失败' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        })
    }
}

/**
 * 取消推送订阅
 */
export const DELETE: APIRoute = async ({ request, locals }) => {
    const user = locals.user

    if (!user) {
        return new Response(JSON.stringify({ error: '请先登录' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    let endpoint: string
    try {
        const body = await request.json()
        endpoint = body.endpoint
    } catch {
        return new Response(JSON.stringify({ error: '无效的请求数据' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    if (!endpoint) {
        return new Response(JSON.stringify({ error: '缺少 endpoint' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    try {
        await env.DB.prepare('DELETE FROM push_subscriptions WHERE endpoint = ? AND user_id = ?')
            .bind(endpoint, user.id)
            .run()

        return new Response(JSON.stringify({ ok: true }), {
            headers: { 'Content-Type': 'application/json' },
        })
    } catch (error) {
        console.error('取消订阅失败:', error)
        return new Response(JSON.stringify({ error: '取消订阅失败' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        })
    }
}

/**
 * 获取当前用户的订阅状态
 */
export const GET: APIRoute = async ({ locals }) => {
    const user = locals.user

    if (!user) {
        return new Response(JSON.stringify({ error: '请先登录' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    try {
        const subscriptions = await env.DB.prepare(
            'SELECT id, endpoint, created_at FROM push_subscriptions WHERE user_id = ?'
        )
            .bind(user.id)
            .all<{ id: string; endpoint: string; created_at: number }>()

        return new Response(
            JSON.stringify({
                subscribed: subscriptions.results.length > 0,
                subscriptions: subscriptions.results,
            }),
            {
                headers: { 'Content-Type': 'application/json' },
            }
        )
    } catch (error) {
        console.error('获取订阅状态失败:', error)
        return new Response(JSON.stringify({ error: '获取订阅状态失败' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        })
    }
}
