export const prerender = false

import type { APIRoute } from 'astro'
import { createOAuthAccount, createUser, getOAuthAccount, getUserById } from '@lib/db'
import { createSession, getSessionCookie } from '@lib/session'

export const GET: APIRoute = async ({ url, locals }) => {
    const env = locals.runtime.env
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
    const tokenParams = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: env.QQ_APP_ID,
        client_secret: env.QQ_APP_KEY,
        code,
        redirect_uri: `${url.origin}/api/auth/callback/qq/`,
    })
    const tokenRes = await fetch(`https://graph.qq.com/oauth2.0/token?${tokenParams}`)
    const tokenText = await tokenRes.text()
    const tokenMatch = tokenText.match(/access_token=([^&]+)/)
    if (!tokenMatch) return new Response('OAuth failed', { status: 400 })
    const accessToken = tokenMatch[1]

    // Get openid
    const openidRes = await fetch(`https://graph.qq.com/oauth2.0/me?access_token=${accessToken}`)
    const openidText = await openidRes.text()
    const openidMatch = openidText.match(/"openid":"([^"]+)"/)
    if (!openidMatch) return new Response('获取 openid 失败', { status: 400 })
    const openid = openidMatch[1]

    // Get user info
    const infoParams = new URLSearchParams({
        access_token: accessToken,
        oauth_consumer_key: env.QQ_APP_ID,
        openid,
    })
    const infoRes = await fetch(`https://graph.qq.com/user/get_user_info?${infoParams}`)
    const info = (await infoRes.json()) as {
        nickname?: string
        figureurl_qq_2?: string
        ret?: number
    }
    if (info.ret !== 0) return new Response('获取用户信息失败', { status: 400 })

    const existing = await getOAuthAccount(env.DB, 'qq', openid)

    let userId: string
    if (existing) {
        userId = existing.user_id
    } else {
        userId = crypto.randomUUID()
        await createUser(env.DB, {
            id: userId,
            username: `qq_${openid.slice(0, 8)}`,
            email: `${openid}@qq.oauth`,
            password_hash: null,
            display_name: info.nickname || 'QQ用户',
            avatar_url: info.figureurl_qq_2 || null,
            role: 'user',
        })
        await createOAuthAccount(env.DB, {
            id: crypto.randomUUID(),
            user_id: userId,
            provider: 'qq',
            provider_id: openid,
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
