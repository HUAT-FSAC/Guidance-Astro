import type { D1Database } from '@cloudflare/workers-types'

export interface User {
    id: string
    username: string
    email: string
    password_hash: string | null
    display_name: string | null
    avatar_url: string | null
    role: string
    created_at: number
    updated_at: number
}

export interface OAuthAccount {
    id: string
    user_id: string
    provider: string
    provider_id: string
    access_token: string | null
}

export async function getUserByEmail(db: D1Database, email: string): Promise<User | null> {
    return db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first<User>()
}

export async function getUserByUsername(db: D1Database, username: string): Promise<User | null> {
    return db.prepare('SELECT * FROM users WHERE username = ?').bind(username).first<User>()
}

export async function getUserById(db: D1Database, id: string): Promise<User | null> {
    return db.prepare('SELECT * FROM users WHERE id = ?').bind(id).first<User>()
}

export async function createUser(
    db: D1Database,
    user: Omit<User, 'created_at' | 'updated_at'>
): Promise<void> {
    const now = Date.now()
    await db
        .prepare(
            'INSERT INTO users (id, username, email, password_hash, display_name, avatar_url, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
        )
        .bind(
            user.id,
            user.username,
            user.email,
            user.password_hash,
            user.display_name,
            user.avatar_url,
            user.role,
            now,
            now
        )
        .run()
}

export async function getOAuthAccount(
    db: D1Database,
    provider: string,
    providerId: string
): Promise<OAuthAccount | null> {
    return db
        .prepare('SELECT * FROM oauth_accounts WHERE provider = ? AND provider_id = ?')
        .bind(provider, providerId)
        .first<OAuthAccount>()
}

export async function createOAuthAccount(db: D1Database, account: OAuthAccount): Promise<void> {
    await db
        .prepare(
            'INSERT INTO oauth_accounts (id, user_id, provider, provider_id, access_token) VALUES (?, ?, ?, ?, ?)'
        )
        .bind(
            account.id,
            account.user_id,
            account.provider,
            account.provider_id,
            account.access_token
        )
        .run()
}
