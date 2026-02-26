import { defineMiddleware } from 'astro:middleware'
import { getSession, getTokenFromCookie } from '@lib/session'
import { getUserById } from '@lib/db'
import { hasRole, type Role } from '@lib/auth'

// Fully public route prefixes — no checks needed
const PUBLIC_PREFIXES = ['/_', '/api/auth/', '/login', '/register']

// Routes requiring admin role
const ADMIN_PREFIXES = ['/admin']

// Routes requiring member role (restricted docs)
const MEMBER_PREFIXES = ['/docs-center/', '/archive/']

function isPublicRoute(pathname: string): boolean {
    if (pathname === '/' || pathname === '/join/' || pathname === '/about-fs/') return true
    return PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))
}

function getRequiredRole(pathname: string): Role | null {
    if (ADMIN_PREFIXES.some((p) => pathname.startsWith(p))) return 'admin'
    if (MEMBER_PREFIXES.some((p) => pathname.startsWith(p))) return 'member'
    return null
}

export const onRequest = defineMiddleware(async (context, next) => {
    const { pathname } = context.url
    const env = context.locals.runtime.env

    // Public routes pass through
    if (isPublicRoute(pathname)) return next()

    // Try to read session
    const token = getTokenFromCookie(context.request.headers.get('cookie'))
    if (token) {
        const session = await getSession(env.SESSION_KV, token)
        if (session) {
            const user = await getUserById(env.DB, session.userId)
            if (user) {
                context.locals.user = {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    displayName: user.display_name ?? undefined,
                    avatarUrl: user.avatar_url ?? undefined,
                }
            }
        }
    }

    // Check route permissions
    const requiredRole = getRequiredRole(pathname)
    if (requiredRole) {
        if (!context.locals.user) {
            return context.redirect(`/login/?redirect=${encodeURIComponent(pathname)}`)
        }
        if (!hasRole(context.locals.user.role, requiredRole)) {
            return new Response('Forbidden', { status: 403 })
        }
    }

    // Non-auth API routes require login
    if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/')) {
        if (!context.locals.user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            })
        }
    }

    return next()
})
