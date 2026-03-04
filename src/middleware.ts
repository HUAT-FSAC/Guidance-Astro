import { defineMiddleware } from 'astro:middleware'
import { getSession, getTokenFromCookie } from '@lib/session'
import { hasRole } from '@lib/auth'

export const onRequest = defineMiddleware(async (context, next) => {
    const { url, request, locals } = context
    const pathname = url.pathname
    const isAdminRoute = pathname.startsWith('/admin/')
    const isAdminApiRoute = pathname.startsWith('/api/admin/')

    // 尝试恢复会话并注入用户上下文
    const cookieHeader = context.isPrerendered ? null : request.headers.get('cookie')
    const token = getTokenFromCookie(cookieHeader)
    const env = locals.runtime?.env

    if (token && env?.SESSION_KV && env?.DB) {
        const session = await getSession(env.SESSION_KV, token)
        if (session) {
            const user = await env.DB.prepare(
                'SELECT id, username, email, display_name, avatar_url, role FROM users WHERE id = ?'
            )
                .bind(session.userId)
                .first<{
                    id: string
                    username: string
                    email: string
                    display_name?: string | null
                    avatar_url?: string | null
                    role: string
                }>()

            if (user) {
                locals.user = {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    displayName: user.display_name ?? undefined,
                    avatarUrl: user.avatar_url ?? undefined,
                }
            }
        }
    }

    // 管理后台需要登录
    if ((isAdminRoute || isAdminApiRoute) && !locals.user) {
        const redirectTo = encodeURIComponent(`${pathname}${url.search}`)
        if (isAdminApiRoute) {
            return new Response(JSON.stringify({ error: '未登录' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            })
        }
        return context.redirect(`/login/?redirect=${redirectTo}`)
    }

    // 管理后台需要 admin 及以上
    if ((isAdminRoute || isAdminApiRoute) && locals.user && !hasRole(locals.user.role, 'admin')) {
        if (isAdminApiRoute) {
            return new Response(JSON.stringify({ error: '权限不足' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' },
            })
        }
        return context.redirect('/')
    }

    return next()
})
