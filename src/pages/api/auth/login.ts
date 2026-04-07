export const prerender = false

import type { APIRoute } from 'astro'
import { verifyPassword } from '@lib/auth'
import { getUserByEmail, getUserByUsername } from '@lib/db'
import { createSession, getSessionCookie } from '@lib/session'
import {
    checkRateLimit,
    createRateLimitResponse,
    getClientIdentifier,
    rateLimitConfigs,
} from '@utils/rate-limiter'
import { env } from 'cloudflare:workers'

export const POST: APIRoute = async ({ request }) => {
    // 限流检查
    const clientId = getClientIdentifier(request, 'login')
    const rateLimit = checkRateLimit(clientId, rateLimitConfigs.login)
    if (!rateLimit.allowed) {
        return createRateLimitResponse(rateLimit.resetTime)
    }

    let body: { account?: string; password?: string }
    try {
        body = await request.json()
    } catch {
        return new Response(JSON.stringify({ error: '请求格式错误' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    const { account, password } = body
    if (!account || !password) {
        return new Response(JSON.stringify({ error: '请填写账号和密码' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    const user = account.includes('@')
        ? await getUserByEmail(env.DB, account)
        : await getUserByUsername(env.DB, account)

    if (!user || !user.password_hash) {
        return new Response(JSON.stringify({ error: '账号或密码错误' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    const valid = await verifyPassword(password, user.password_hash)
    if (!valid) {
        return new Response(JSON.stringify({ error: '账号或密码错误' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    const token = await createSession(env.SESSION_KV, user.id, user.role)

    return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': getSessionCookie(token),
        },
    })
}
