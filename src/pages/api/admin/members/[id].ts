export const prerender = false

import type { APIRoute } from 'astro'
import { hasRole } from '@lib/auth'
import { env } from 'cloudflare:workers'

// 获取单个成员详情
export const GET: APIRoute = async ({ params }) => {
    const userId = params.id

    if (!userId) {
        return new Response(JSON.stringify({ error: '缺少用户 ID' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    const user = await env.DB.prepare(
        `SELECT id, username, email, display_name, avatar_url, role, created_at, updated_at 
         FROM users WHERE id = ? AND role IN ('member', 'admin', 'super_admin')`
    )
        .bind(userId)
        .first<{
            id: string
            username: string
            email: string
            display_name: string | null
            avatar_url: string | null
            role: string
            created_at: number
            updated_at: number
        }>()

    if (!user) {
        return new Response(JSON.stringify({ error: '成员不存在' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    return new Response(JSON.stringify(user), {
        headers: { 'Content-Type': 'application/json' },
    })
}

// 更新成员信息
export const PATCH: APIRoute = async ({ params, request, locals }) => {
    const userId = params.id
    const currentUser = locals.user

    if (!currentUser || !hasRole(currentUser.role, 'admin')) {
        return new Response(JSON.stringify({ error: '权限不足' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    if (!userId) {
        return new Response(JSON.stringify({ error: '缺少用户 ID' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    let body: {
        display_name?: string
        role?: string
        email?: string
    }

    try {
        body = await request.json()
    } catch {
        return new Response(JSON.stringify({ error: '请求格式错误' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    // 检查目标用户是否存在且是成员
    const targetUser = await env.DB.prepare('SELECT role FROM users WHERE id = ?')
        .bind(userId)
        .first<{ role: string }>()

    if (!targetUser) {
        return new Response(JSON.stringify({ error: '用户不存在' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    const updates: string[] = []
    const values: (string | number)[] = []

    // 更新显示名称
    if (body.display_name !== undefined) {
        if (body.display_name.length > 32) {
            return new Response(JSON.stringify({ error: '显示名称不能超过 32 个字符' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            })
        }
        updates.push('display_name = ?')
        values.push(body.display_name || null)
    }

    // 更新邮箱
    if (body.email !== undefined) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(body.email)) {
            return new Response(JSON.stringify({ error: '邮箱格式不正确' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            })
        }

        // 检查邮箱是否已被其他用户使用
        const existingEmail = await env.DB.prepare(
            'SELECT id FROM users WHERE email = ? AND id != ?'
        )
            .bind(body.email, userId)
            .first<{ id: string }>()

        if (existingEmail) {
            return new Response(JSON.stringify({ error: '该邮箱已被使用' }), {
                status: 409,
                headers: { 'Content-Type': 'application/json' },
            })
        }

        updates.push('email = ?')
        values.push(body.email)
    }

    // 更新角色
    if (body.role !== undefined) {
        const validRoles = ['user', 'member', 'admin', 'super_admin']
        if (!validRoles.includes(body.role)) {
            return new Response(JSON.stringify({ error: '无效的角色' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            })
        }

        // 只有 super_admin 可以设置为 super_admin
        if (body.role === 'super_admin' && !hasRole(currentUser.role, 'super_admin')) {
            return new Response(JSON.stringify({ error: '权限不足，无法设置为超级管理员' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' },
            })
        }

        // 不能修改自己的角色
        if (userId === currentUser.id) {
            return new Response(JSON.stringify({ error: '不能修改自己的角色' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            })
        }

        // 不能修改同等级或更高等级用户的角色
        if (hasRole(targetUser.role, currentUser.role) && targetUser.role !== 'user') {
            return new Response(JSON.stringify({ error: '无法修改同级别或更高级别用户的角色' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' },
            })
        }

        updates.push('role = ?')
        values.push(body.role)
    }

    if (updates.length === 0) {
        return new Response(JSON.stringify({ error: '没有要更新的字段' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    updates.push('updated_at = ?')
    values.push(Date.now())
    values.push(userId)

    await env.DB.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`)
        .bind(...values)
        .run()

    return new Response(JSON.stringify({ ok: true }), {
        headers: { 'Content-Type': 'application/json' },
    })
}

// 删除成员
export const DELETE: APIRoute = async ({ params, locals }) => {
    const userId = params.id
    const currentUser = locals.user

    if (!currentUser || !hasRole(currentUser.role, 'admin')) {
        return new Response(JSON.stringify({ error: '权限不足' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    if (!userId) {
        return new Response(JSON.stringify({ error: '缺少用户 ID' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    // 不能删除自己
    if (userId === currentUser.id) {
        return new Response(JSON.stringify({ error: '不能删除自己' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    // 检查目标用户
    const targetUser = await env.DB.prepare('SELECT role FROM users WHERE id = ?')
        .bind(userId)
        .first<{ role: string }>()

    if (!targetUser) {
        return new Response(JSON.stringify({ error: '用户不存在' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    // 不能删除 super_admin（除非自己是 super_admin）
    if (targetUser.role === 'super_admin' && !hasRole(currentUser.role, 'super_admin')) {
        return new Response(JSON.stringify({ error: '权限不足，无法删除超级管理员' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    // 删除用户（oauth_accounts 会通过外键级联删除）
    await env.DB.prepare('DELETE FROM users WHERE id = ?').bind(userId).run()

    return new Response(JSON.stringify({ ok: true }), {
        headers: { 'Content-Type': 'application/json' },
    })
}
