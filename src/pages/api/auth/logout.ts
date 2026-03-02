export const prerender = false

import type { APIRoute } from 'astro'
import { deleteSession, getClearSessionCookie, getTokenFromCookie } from '@lib/session'

export const POST: APIRoute = async ({ request, locals }) => {
    const token = getTokenFromCookie(request.headers.get('cookie'))
    if (token) {
        await deleteSession(locals.runtime.env.SESSION_KV, token)
    }

    return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': getClearSessionCookie(),
        },
    })
}
