export const prerender = false

import type { APIRoute } from 'astro'
import { createOAuthAccount, createUser, getOAuthAccount, getUserById } from '@lib/db'
import { createSession, getSessionCookie } from '@lib/session'
import { env } from 'cloudflare:workers'

interface GitHubUser {
    id: number
    login: string
    email: string | null
    avatar_url: string
    name: string | null
}

interface GitHubEmail {
    email: string
    primary: boolean
    verified: boolean
}

export const GET: APIRoute = async ({ url }) => {
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')

    if (!code) return new Response('Missing code', { status: 400 })

    let redirectTo = '/'
    if (state) {
        try {
            redirectTo = JSON.parse(atob(state)).redirect || '/'
        } catch {
            /* ignore */
        }
    }

    // Exchange code for access_token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
            client_id: env.GITHUB_CLIENT_ID,
            client_secret: env.GITHUB_CLIENT_SECRET,
            code,
        }),
    })
    const tokenData = (await tokenRes.json()) as { access_token?: string }
    if (!tokenData.access_token) return new Response('OAuth failed', { status: 400 })

    const accessToken = tokenData.access_token

    // Get GitHub user info
    const userRes = await fetch('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${accessToken}`, 'User-Agent': 'HUAT-FSAC' },
    })
    const ghUser = (await userRes.json()) as GitHubUser

    // Get email if not public
    let email = ghUser.email
    if (!email) {
        const emailRes = await fetch('https://api.github.com/user/emails', {
            headers: { Authorization: `Bearer ${accessToken}`, 'User-Agent': 'HUAT-FSAC' },
        })
        const emails = (await emailRes.json()) as GitHubEmail[]
        const primary = emails.find((e) => e.primary && e.verified)
        email = primary?.email || emails[0]?.email || null
    }

    if (!email) return new Response('无法获取 GitHub 邮箱', { status: 400 })

    const providerId = String(ghUser.id)
    const existing = await getOAuthAccount(env.DB, 'github', providerId)

    let userId: string
    if (existing) {
        userId = existing.user_id
    } else {
        userId = crypto.randomUUID()
        await createUser(env.DB, {
            id: userId,
            username: `gh_${ghUser.login}`,
            email,
            password_hash: null,
            display_name: ghUser.name || ghUser.login,
            avatar_url: ghUser.avatar_url,
            role: 'user',
        })
        await createOAuthAccount(env.DB, {
            id: crypto.randomUUID(),
            user_id: userId,
            provider: 'github',
            provider_id: providerId,
            access_token: accessToken,
        })
    }

    const user = await getUserById(env.DB, userId)
    const token = await createSession(env.SESSION_KV, userId, user?.role || 'user')

    return new Response(null, {
        status: 302,
        headers: {
            Location: redirectTo,
            'Set-Cookie': getSessionCookie(token),
        },
    })
}
