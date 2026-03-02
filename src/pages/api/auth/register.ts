export const prerender = false

import type { APIRoute } from 'astro'
import { hashPassword, validateEmail, validatePassword, validateUsername } from '@lib/auth'
import { createUser, getUserByEmail, getUserByUsername } from '@lib/db'
import { createSession, getSessionCookie } from '@lib/session'

export const POST: APIRoute = async ({ request, locals }) => {
    const env = locals.runtime.env
    const jsonErr = (msg: string) =>
        new Response(JSON.stringify({ error: msg }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        })

    let body: { username?: string; email?: string; password?: string }
    try {
        body = await request.json()
    } catch {
        return jsonErr('请求格式错误')
    }

    const { username, email, password } = body
    if (!username || !email || !password) return jsonErr('请填写所有字段')

    const usernameCheck = validateUsername(username)
    if (!usernameCheck.valid) return jsonErr(usernameCheck.message!)

    if (!validateEmail(email)) return jsonErr('邮箱格式不正确')

    const passwordCheck = validatePassword(password)
    if (!passwordCheck.valid) return jsonErr(passwordCheck.message!)

    if (await getUserByEmail(env.DB, email)) return jsonErr('该邮箱已注册')
    if (await getUserByUsername(env.DB, username)) return jsonErr('该用户名已被使用')

    const userId = crypto.randomUUID()
    const passwordHash = await hashPassword(password)

    await createUser(env.DB, {
        id: userId,
        username,
        email,
        password_hash: passwordHash,
        display_name: username,
        avatar_url: null,
        role: 'user',
    })

    const token = await createSession(env.SESSION_KV, userId, 'user')

    return new Response(JSON.stringify({ ok: true }), {
        status: 201,
        headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': getSessionCookie(token),
        },
    })
}
