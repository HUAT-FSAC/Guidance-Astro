import type { KVNamespace } from '@cloudflare/workers-types'

interface SessionData {
    userId: string
    role: string
    expiresAt: number
}

const SESSION_TTL = 7 * 24 * 60 * 60 // 7 days in seconds
const COOKIE_NAME = 'fsac_session'

export function generateToken(): string {
    const bytes = new Uint8Array(32)
    crypto.getRandomValues(bytes)
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

export async function createSession(
    kv: KVNamespace,
    userId: string,
    role: string
): Promise<string> {
    const token = generateToken()
    const data: SessionData = { userId, role, expiresAt: Date.now() + SESSION_TTL * 1000 }
    await kv.put(token, JSON.stringify(data), { expirationTtl: SESSION_TTL })
    return token
}

export async function getSession(kv: KVNamespace, token: string): Promise<SessionData | null> {
    const raw = await kv.get(token)
    if (!raw) return null
    const data: SessionData = JSON.parse(raw)
    if (data.expiresAt < Date.now()) {
        await kv.delete(token)
        return null
    }
    return data
}

export async function deleteSession(kv: KVNamespace, token: string): Promise<void> {
    await kv.delete(token)
}

export function getSessionCookie(token: string): string {
    return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_TTL}`
}

export function getClearSessionCookie(): string {
    return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`
}

export function getTokenFromCookie(cookieHeader: string | null): string | null {
    if (!cookieHeader) return null
    const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`))
    return match ? match[1] : null
}
