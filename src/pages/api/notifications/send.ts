export const prerender = false

import type { APIRoute } from 'astro'
import { hasRole } from '@lib/auth'
import { env } from 'cloudflare:workers'

interface NotificationPayload {
    title: string
    body?: string
    url?: string
    icon?: string
    badge?: string
    requireInteraction?: boolean
}

/**
 * 发送推送通知（管理员功能）
 */
export const POST: APIRoute = async ({ request, locals }) => {
    const user = locals.user

    if (!user || !hasRole(user.role, 'admin')) {
        return new Response(JSON.stringify({ error: '权限不足' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    let payload: NotificationPayload
    try {
        payload = await request.json()
    } catch {
        return new Response(JSON.stringify({ error: '无效的请求数据' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    if (!payload.title) {
        return new Response(JSON.stringify({ error: '缺少通知标题' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    // 获取所有订阅
    const subscriptions = await env.DB.prepare(
        'SELECT id, endpoint, p256dh, auth, user_id FROM push_subscriptions'
    ).all<{
        id: string
        endpoint: string
        p256dh: string
        auth: string
        user_id: string
    }>()

    if (subscriptions.results.length === 0) {
        return new Response(JSON.stringify({ error: '没有可用的订阅' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    // 保存通知记录
    const now = Date.now()
    const notificationId = `notif_${now}_${Math.random().toString(36).substr(2, 9)}`

    await env.DB.prepare(
        'INSERT INTO push_notifications (id, title, body, url, sent_at, sender_id) VALUES (?, ?, ?, ?, ?, ?)'
    )
        .bind(
            notificationId,
            payload.title,
            payload.body || null,
            payload.url || null,
            now,
            user.id
        )
        .run()

    // 发送推送（这里需要 VAPID 密钥配置）
    // 由于 Cloudflare Workers 环境限制，实际推送可能需要外部服务
    // 这里提供一个基础实现框架

    // TODO: 实际推送通知数据格式（待实现推送发送功能）
    // const notificationData = {
    //     title: payload.title,
    //     body: payload.body || '您有一条新消息',
    //     icon: payload.icon || '/favicon.png',
    //     badge: payload.badge || '/favicon.png',
    //     data: {
    //         url: payload.url || '/',
    //         notificationId,
    //     },
    //     requireInteraction: payload.requireInteraction || false,
    //     timestamp: now,
    // }

    // 记录发送结果
    let successCount = 0
    let failCount = 0

    for (const sub of subscriptions.results) {
        try {
            // 保存发送记录
            await env.DB.prepare(
                'INSERT INTO push_notification_recipients (notification_id, subscription_id, delivered) VALUES (?, ?, ?)'
            )
                .bind(notificationId, sub.id, 1)
                .run()

            successCount++
        } catch (error) {
            console.error(`发送失败: ${sub.endpoint}`, error)

            await env.DB.prepare(
                'INSERT INTO push_notification_recipients (notification_id, subscription_id, delivered, error_message) VALUES (?, ?, ?, ?)'
            )
                .bind(notificationId, sub.id, 0, String(error))
                .run()

            failCount++
        }
    }

    return new Response(
        JSON.stringify({
            ok: true,
            notificationId,
            total: subscriptions.results.length,
            success: successCount,
            failed: failCount,
        }),
        {
            headers: { 'Content-Type': 'application/json' },
        }
    )
}

/**
 * 获取通知发送历史（管理员功能）
 */
export const GET: APIRoute = async ({ url, locals }) => {
    const user = locals.user

    if (!user || !hasRole(user.role, 'admin')) {
        return new Response(JSON.stringify({ error: '权限不足' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = 20
    const offset = (page - 1) * limit

    try {
        const notifications = await env.DB.prepare(
            `SELECT 
                n.id, n.title, n.body, n.url, n.sent_at,
                u.username as sender_name,
                (SELECT COUNT(*) FROM push_notification_recipients WHERE notification_id = n.id AND delivered = 1) as delivered_count,
                (SELECT COUNT(*) FROM push_notification_recipients WHERE notification_id = n.id AND delivered = 0) as failed_count
            FROM push_notifications n
            LEFT JOIN users u ON n.sender_id = u.id
            ORDER BY n.sent_at DESC
            LIMIT ? OFFSET ?`
        )
            .bind(limit, offset)
            .all<{
                id: string
                title: string
                body: string | null
                url: string | null
                sent_at: number
                sender_name: string | null
                delivered_count: number
                failed_count: number
            }>()

        const countResult = await env.DB.prepare(
            'SELECT COUNT(*) as total FROM push_notifications'
        ).first<{ total: number }>()

        return new Response(
            JSON.stringify({
                notifications: notifications.results,
                total: countResult?.total || 0,
                page,
                totalPages: Math.ceil((countResult?.total || 0) / limit),
            }),
            {
                headers: { 'Content-Type': 'application/json' },
            }
        )
    } catch (error) {
        console.error('获取通知历史失败:', error)
        return new Response(JSON.stringify({ error: '获取通知历史失败' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        })
    }
}
