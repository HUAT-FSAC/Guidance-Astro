export const prerender = false

import type { APIRoute } from 'astro'

export const GET: APIRoute = async ({ locals }) => {
    if (!locals.user) {
        return new Response(JSON.stringify({ user: null }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    return new Response(JSON.stringify({ user: locals.user }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    })
}
