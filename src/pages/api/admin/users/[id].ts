export const prerender = false

import type { APIRoute } from 'astro'
import { hasRole } from '@lib/auth'

export const PATCH: APIRoute = async ({ params, request, locals }) => {
    const env = locals.runtime.env
    const userId = params.id

    let body: { role?: string }
    try {
        body = await request.json()
    } catch {
        return new Response(JSON.stringify({ error: '请求格式错误' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    if (!body.role) {
        return new Response(JSON.stringify({ error: '缺少 role 字段' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    const validRoles = ['user', 'member', 'admin', 'super_admin']
    if (!validRoles.includes(body.role)) {
        return new Response(JSON.stringify({ error: '无效的角色' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    if (body.role === 'super_admin' && !hasRole(locals.user!.role, 'super_admin')) {
        return new Response(JSON.stringify({ error: '权限不足' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    if (userId === locals.user!.id) {
        return new Response(JSON.stringify({ error: '不能修改自己的角色' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    await env.DB.prepare('UPDATE users SET role = ?, updated_at = ? WHERE id = ?')
        .bind(body.role, Date.now(), userId)
        .run()

    return new Response(JSON.stringify({ ok: true }), {
        headers: { 'Content-Type': 'application/json' },
    })
}
