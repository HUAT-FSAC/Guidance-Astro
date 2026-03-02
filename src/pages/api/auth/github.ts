export const prerender = false

import type { APIRoute } from 'astro'

export const GET: APIRoute = async ({ locals, url }) => {
    const env = locals.runtime.env
    const redirect = url.searchParams.get('redirect') || '/'
    const state = btoa(JSON.stringify({ redirect }))

    const params = new URLSearchParams({
        client_id: env.GITHUB_CLIENT_ID,
        redirect_uri: `${url.origin}/api/auth/callback/github/`,
        scope: 'read:user user:email',
        state,
    })

    return Response.redirect(`https://github.com/login/oauth/authorize?${params}`, 302)
}
