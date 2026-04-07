export const prerender = false

import type { APIRoute } from 'astro'
import { deleteSession, getClearSessionCookie, getTokenFromCookie } from '@lib/session'
import { env } from 'cloudflare:workers'

export const POST: APIRoute = async ({ request }) => {
    const token = getTokenFromCookie(request.headers.get('cookie'))
    if (token) {
        await deleteSession(env.SESSION_KV, token)
    }

    return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': getClearSessionCookie(),
        },
    })
}
