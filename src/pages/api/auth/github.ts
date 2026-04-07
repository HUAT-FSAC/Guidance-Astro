export const prerender = false

import type { APIRoute } from 'astro'
import { env } from 'cloudflare:workers'

export const GET: APIRoute = async ({ url }) => {
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
