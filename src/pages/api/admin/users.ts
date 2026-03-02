export const prerender = false

import type { APIRoute } from 'astro'

export const GET: APIRoute = async ({ locals, url }) => {
    const env = locals.runtime.env
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = 20
    const offset = (page - 1) * limit

    const countResult = await env.DB.prepare('SELECT COUNT(*) as total FROM users').first<{
        total: number
    }>()
    const users = await env.DB.prepare(
        'SELECT id, username, email, display_name, avatar_url, role, created_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?'
    )
        .bind(limit, offset)
        .all()

    return new Response(
        JSON.stringify({
            users: users.results,
            total: countResult?.total || 0,
            page,
            totalPages: Math.ceil((countResult?.total || 0) / limit),
        }),
        {
            headers: { 'Content-Type': 'application/json' },
        }
    )
}
