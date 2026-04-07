export const prerender = false

import type { APIRoute } from 'astro'
import { hashPassword, validateUsername, verifyPassword } from '@lib/auth'
import { getUserById } from '@lib/db'
import { env } from 'cloudflare:workers'

export const GET: APIRoute = async ({ locals }) => {
    const user = locals.user
    if (!user) {
        return new Response(JSON.stringify({ error: '未登录' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        })
    }
    const fullUser = await getUserById(env.DB, user.id)
    if (!fullUser) {
        return new Response(JSON.stringify({ error: '用户不存在' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    return new Response(
        JSON.stringify({
            id: fullUser.id,
            username: fullUser.username,
            email: fullUser.email,
            displayName: fullUser.display_name,
            avatarUrl: fullUser.avatar_url,
            role: fullUser.role,
            createdAt: fullUser.created_at,
        }),
        { headers: { 'Content-Type': 'application/json' } }
    )
}

export const PATCH: APIRoute = async ({ request, locals }) => {
    const user = locals.user
    if (!user) {
        return new Response(JSON.stringify({ error: '未登录' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    let body: {
        displayName?: string
        currentPassword?: string
        newPassword?: string
    }

    try {
        body = await request.json()
    } catch {
        return new Response(JSON.stringify({ error: '请求格式错误' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        })
    }
    const fullUser = await getUserById(env.DB, user.id)
    if (!fullUser) {
        return new Response(JSON.stringify({ error: '用户不存在' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    const updates: string[] = []
    const values: unknown[] = []

    // 更新显示名称
    if (body.displayName !== undefined) {
        const nameCheck = validateUsername(body.displayName)
        if (!nameCheck.valid) {
            return new Response(JSON.stringify({ error: nameCheck.message }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            })
        }
        updates.push('display_name = ?')
        values.push(body.displayName)
    }

    // 更新密码
    if (body.newPassword) {
        if (!body.currentPassword) {
            return new Response(JSON.stringify({ error: '请提供当前密码' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            })
        }

        if (!fullUser.password_hash) {
            return new Response(JSON.stringify({ error: 'OAuth 用户无法修改密码' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            })
        }

        const valid = await verifyPassword(body.currentPassword, fullUser.password_hash)
        if (!valid) {
            return new Response(JSON.stringify({ error: '当前密码错误' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            })
        }

        if (body.newPassword.length < 8) {
            return new Response(JSON.stringify({ error: '新密码至少 8 位' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            })
        }

        updates.push('password_hash = ?')
        values.push(await hashPassword(body.newPassword))
    }

    if (updates.length === 0) {
        return new Response(JSON.stringify({ error: '没有要更新的内容' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    // 添加 updated_at 和 id
    updates.push('updated_at = ?')
    values.push(Date.now())
    values.push(user.id)

    const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`
    await env.DB.prepare(sql)
        .bind(...values)
        .run()

    return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    })
}
