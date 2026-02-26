export const prerender = false

import type { APIRoute } from 'astro'

export const GET: APIRoute = async ({ locals, url }) => {
    const env = locals.runtime.env
    const redirect = url.searchParams.get('redirect') || '/'
    const state = btoa(JSON.stringify({ redirect }))

    const params = new URLSearchParams({
        response_type: 'code',
        client_id: env.QQ_APP_ID,
        redirect_uri: `${url.origin}/api/auth/callback/qq/`,
        state,
        scope: 'get_user_info',
    })

    return Response.redirect(`https://graph.qq.com/oauth2.0/authorize?${params}`, 302)
}
