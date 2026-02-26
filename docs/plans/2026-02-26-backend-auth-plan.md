# 后端用户认证 & 权限系统 - 实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为 HUAT FSAC 文档站添加基于 Cloudflare 全家桶的用户认证和权限控制系统

**Architecture:** Astro hybrid mode + @astrojs/cloudflare adapter，D1 存用户数据，KV 存 session，middleware 做路由级权限拦截

**Tech Stack:** Astro 5, @astrojs/cloudflare, Cloudflare D1, Cloudflare KV, bcryptjs, vanilla JS

**Design Doc:** `docs/plans/2026-02-26-backend-auth-design.md`

---

## Task 1: 基础设施 — 安装依赖 & 切换 hybrid 模式

**Files:**

- Modify: `package.json`
- Modify: `astro.config.mjs`
- Modify: `tsconfig.json`

**Step 1: 安装 Cloudflare adapter 和 bcryptjs**

```bash
pnpm add @astrojs/cloudflare bcryptjs
pnpm add -D @types/bcryptjs wrangler
```

**Step 2: 修改 astro.config.mjs — 添加 cloudflare adapter 和 hybrid 模式**

在文件顶部添加 import：

```ts
import cloudflare from '@astrojs/cloudflare'
```

在 `defineConfig` 中添加：

```ts
output: 'hybrid',
adapter: cloudflare(),
```

**Step 3: 修改 tsconfig.json — 添加 @lib 路径别名**

在 paths 中添加：

```json
"@lib/*": ["src/lib/*"]
```

**Step 4: 验证构建**

```bash
pnpm build
```

Expected: 构建成功，输出切换为 SSR 模式

**Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml astro.config.mjs tsconfig.json
git commit -m "feat: 切换 Astro 到 hybrid 模式并添加 Cloudflare adapter"
```

---

## Task 2: 基础设施 — wrangler.toml & D1/KV 配置

**Files:**

- Create: `wrangler.toml`
- Create: `src/db/schema.sql`
- Create: `.dev.vars.example`

**Step 1: 创建 wrangler.toml**

```toml
name = "huat-fsac-docs"
compatibility_date = "2024-12-01"
compatibility_flags = ["nodejs_compat"]

[vars]
ENVIRONMENT = "production"

[[d1_databases]]
binding = "DB"
database_name = "fsac-auth"
database_id = "placeholder-replace-after-create"

[[kv_namespaces]]
binding = "SESSION_KV"
id = "placeholder-replace-after-create"
```

**Step 2: 创建 src/db/schema.sql**

```sql
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  username      TEXT UNIQUE NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  display_name  TEXT,
  avatar_url    TEXT,
  role          TEXT NOT NULL DEFAULT 'user',
  created_at    INTEGER NOT NULL,
  updated_at    INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS oauth_accounts (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider      TEXT NOT NULL,
  provider_id   TEXT NOT NULL,
  access_token  TEXT,
  UNIQUE(provider, provider_id)
);

CREATE INDEX IF NOT EXISTS idx_oauth_user ON oauth_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_provider ON oauth_accounts(provider, provider_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
```

**Step 3: 创建 .dev.vars.example**

```
SESSION_SECRET=your-secret-key-min-32-chars
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
QQ_APP_ID=your-qq-app-id
QQ_APP_KEY=your-qq-app-key
```

**Step 4: 将 .dev.vars 添加到 .gitignore**

在 .gitignore 中添加：

```
.dev.vars
.wrangler/
```

**Step 5: 创建 D1 数据库和 KV namespace（本地开发）**

```bash
pnpm wrangler d1 create fsac-auth
pnpm wrangler kv namespace create SESSION_KV
```

将返回的 database_id 和 kv id 填入 wrangler.toml

**Step 6: 初始化本地数据库**

```bash
pnpm wrangler d1 execute fsac-auth --local --file=src/db/schema.sql
```

**Step 7: Commit**

```bash
git add wrangler.toml src/db/schema.sql .dev.vars.example .gitignore
git commit -m "feat: 添加 wrangler 配置和 D1 数据库 schema"
```

---

## Task 3: Cloudflare 类型定义 & lib 层基础

**Files:**

- Create: `src/env.d.ts` (或修改已有)
- Create: `src/lib/db.ts`
- Create: `src/lib/session.ts`
- Create: `src/lib/auth.ts`

**Step 1: 创建 Cloudflare runtime 类型定义**

在 `src/env.d.ts` 中声明 Cloudflare bindings 类型，让 `locals.runtime.env` 有类型提示：

```ts
/// <reference types="astro/client" />

type D1Database = import('@cloudflare/workers-types').D1Database
type KVNamespace = import('@cloudflare/workers-types').KVNamespace

type Runtime = import('@astrojs/cloudflare').Runtime<{
    DB: D1Database
    SESSION_KV: KVNamespace
    SESSION_SECRET: string
    GITHUB_CLIENT_ID: string
    GITHUB_CLIENT_SECRET: string
    QQ_APP_ID: string
    QQ_APP_KEY: string
}>

declare namespace App {
    interface Locals extends Runtime {
        user?: {
            id: string
            username: string
            email: string
            role: string
            displayName?: string
            avatarUrl?: string
        }
    }
}
```

安装类型包：

```bash
pnpm add -D @cloudflare/workers-types
```

**Step 2: 创建 src/lib/db.ts — D1 操作封装**

```ts
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
```

**Step 3: 创建 src/lib/session.ts — Session 管理**

```ts
import type { KVNamespace } from '@cloudflare/workers-types'

interface SessionData {
    userId: string
    role: string
    expiresAt: number
}

const SESSION_TTL = 7 * 24 * 60 * 60 // 7 天（秒）
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
```

**Step 4: 创建 src/lib/auth.ts — Auth 工具函数**

```ts
import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10
const ROLE_HIERARCHY = ['visitor', 'user', 'member', 'admin', 'super_admin'] as const

export type Role = (typeof ROLE_HIERARCHY)[number]

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
}

export function hasRole(userRole: string, requiredRole: Role): boolean {
    const userLevel = ROLE_HIERARCHY.indexOf(userRole as Role)
    const requiredLevel = ROLE_HIERARCHY.indexOf(requiredRole)
    return userLevel >= requiredLevel
}

export function validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function validatePassword(password: string): { valid: boolean; message?: string } {
    if (password.length < 8) return { valid: false, message: '密码至少 8 位' }
    return { valid: true }
}

export function validateUsername(username: string): { valid: boolean; message?: string } {
    if (username.length < 2) return { valid: false, message: '用户名至少 2 个字符' }
    if (username.length > 32) return { valid: false, message: '用户名最多 32 个字符' }
    if (!/^[a-zA-Z0-9_\u4e00-\u9fff]+$/.test(username))
        return { valid: false, message: '用户名只能包含字母、数字、下划线和中文' }
    return { valid: true }
}
```

**Step 5: 验证类型检查**

```bash
pnpm astro check
```

**Step 6: Commit**

```bash
git add src/env.d.ts src/lib/db.ts src/lib/session.ts src/lib/auth.ts package.json pnpm-lock.yaml
git commit -m "feat: 添加 auth/session/db lib 层和 Cloudflare 类型定义"
```

---

## Task 4: 单元测试 — lib 层

**Files:**

- Create: `tests/unit/lib/auth.test.ts`
- Create: `tests/unit/lib/session.test.ts`

**Step 1: 编写 auth.test.ts**

```ts
import { describe, it, expect } from 'vitest'
import {
    hashPassword,
    verifyPassword,
    hasRole,
    validateEmail,
    validatePassword,
    validateUsername,
} from '../../src/lib/auth'

describe('auth', () => {
    describe('hashPassword / verifyPassword', () => {
        it('should hash and verify password correctly', async () => {
            const hash = await hashPassword('testpass123')
            expect(hash).not.toBe('testpass123')
            expect(await verifyPassword('testpass123', hash)).toBe(true)
            expect(await verifyPassword('wrongpass', hash)).toBe(false)
        })
    })

    describe('hasRole', () => {
        it('should check role hierarchy correctly', () => {
            expect(hasRole('super_admin', 'admin')).toBe(true)
            expect(hasRole('admin', 'admin')).toBe(true)
            expect(hasRole('member', 'admin')).toBe(false)
            expect(hasRole('user', 'member')).toBe(false)
            expect(hasRole('member', 'user')).toBe(true)
        })
    })

    describe('validateEmail', () => {
        it('should validate email format', () => {
            expect(validateEmail('test@example.com')).toBe(true)
            expect(validateEmail('invalid')).toBe(false)
            expect(validateEmail('')).toBe(false)
        })
    })

    describe('validatePassword', () => {
        it('should require minimum 8 characters', () => {
            expect(validatePassword('1234567').valid).toBe(false)
            expect(validatePassword('12345678').valid).toBe(true)
        })
    })

    describe('validateUsername', () => {
        it('should validate username rules', () => {
            expect(validateUsername('a').valid).toBe(false)
            expect(validateUsername('ab').valid).toBe(true)
            expect(validateUsername('测试用户').valid).toBe(true)
            expect(validateUsername('user@name').valid).toBe(false)
            expect(validateUsername('a'.repeat(33)).valid).toBe(false)
        })
    })
})
```

**Step 2: 编写 session.test.ts**

```ts
import { describe, it, expect } from 'vitest'
import {
    generateToken,
    getTokenFromCookie,
    getSessionCookie,
    getClearSessionCookie,
} from '../../src/lib/session'

describe('session', () => {
    describe('generateToken', () => {
        it('should generate 64-char hex token', () => {
            const token = generateToken()
            expect(token).toHaveLength(64)
            expect(/^[0-9a-f]+$/.test(token)).toBe(true)
        })

        it('should generate unique tokens', () => {
            const t1 = generateToken()
            const t2 = generateToken()
            expect(t1).not.toBe(t2)
        })
    })

    describe('getTokenFromCookie', () => {
        it('should extract token from cookie header', () => {
            expect(getTokenFromCookie('fsac_session=abc123; other=val')).toBe('abc123')
            expect(getTokenFromCookie('other=val')).toBeNull()
            expect(getTokenFromCookie(null)).toBeNull()
        })
    })

    describe('getSessionCookie', () => {
        it('should return valid Set-Cookie string', () => {
            const cookie = getSessionCookie('mytoken')
            expect(cookie).toContain('fsac_session=mytoken')
            expect(cookie).toContain('HttpOnly')
            expect(cookie).toContain('Secure')
            expect(cookie).toContain('SameSite=Lax')
        })
    })

    describe('getClearSessionCookie', () => {
        it('should return cookie with Max-Age=0', () => {
            const cookie = getClearSessionCookie()
            expect(cookie).toContain('Max-Age=0')
        })
    })
})
```

**Step 3: 运行测试**

```bash
pnpm test:run
```

Expected: 全部通过

**Step 4: Commit**

```bash
git add tests/unit/lib/
git commit -m "test: 添加 auth 和 session lib 层单元测试"
```

---

## Task 5: Middleware — Auth 拦截

**Files:**

- Create: `src/middleware.ts`

**Step 1: 创建 src/middleware.ts**

```ts
import { defineMiddleware } from 'astro:middleware'
import { getSession, getTokenFromCookie } from '@lib/session'
import { getUserById } from '@lib/db'
import { hasRole, type Role } from '@lib/auth'

// 完全公开的路由前缀，无需任何检查
const PUBLIC_PREFIXES = ['/_', '/api/auth/', '/login', '/register']

// 需要 admin 角色的路由
const ADMIN_PREFIXES = ['/admin']

// 需要 member 角色的受限文档路由
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

    // 公开路由直接放行
    if (isPublicRoute(pathname)) return next()

    // 尝试读取 session
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

    // 检查路由权限
    const requiredRole = getRequiredRole(pathname)
    if (requiredRole) {
        if (!context.locals.user) {
            return context.redirect(`/login/?redirect=${encodeURIComponent(pathname)}`)
        }
        if (!hasRole(context.locals.user.role, requiredRole)) {
            return new Response('Forbidden', { status: 403 })
        }
    }

    // API 路由（非 auth）需要登录
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
```

**Step 2: 验证构建**

```bash
pnpm build
```

Expected: 构建成功

**Step 3: Commit**

```bash
git add src/middleware.ts
git commit -m "feat: 添加 auth middleware 路由级权限拦截"
```

---

## Task 6: API — 注册接口

**Files:**

- Create: `src/pages/api/auth/register.ts`

**Step 1: 创建注册 API**

```ts
// src/pages/api/auth/register.ts
export const prerender = false

import type { APIRoute } from 'astro'
import { hashPassword, validateEmail, validatePassword, validateUsername } from '@lib/auth'
import { createUser, getUserByEmail, getUserByUsername } from '@lib/db'
import { createSession, getSessionCookie } from '@lib/session'

export const POST: APIRoute = async ({ request, locals }) => {
    const env = locals.runtime.env
    const json = (key: string, msg: string) =>
        new Response(JSON.stringify({ error: msg }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        })

    let body: { username?: string; email?: string; password?: string }
    try {
        body = await request.json()
    } catch {
        return json('body', '请求格式错误')
    }

    const { username, email, password } = body
    if (!username || !email || !password) return json('fields', '请填写所有字段')

    const usernameCheck = validateUsername(username)
    if (!usernameCheck.valid) return json('username', usernameCheck.message!)

    if (!validateEmail(email)) return json('email', '邮箱格式不正确')

    const passwordCheck = validatePassword(password)
    if (!passwordCheck.valid) return json('password', passwordCheck.message!)

    // 检查重复
    if (await getUserByEmail(env.DB, email)) return json('email', '该邮箱已注册')
    if (await getUserByUsername(env.DB, username)) return json('username', '该用户名已被使用')

    const userId = crypto.randomUUID()
    const passwordHash = await hashPassword(password)

    await createUser(env.DB, {
        id: userId,
        username,
        email,
        password_hash: passwordHash,
        display_name: username,
        avatar_url: null,
        role: 'user',
    })

    const token = await createSession(env.SESSION_KV, userId, 'user')

    return new Response(JSON.stringify({ ok: true }), {
        status: 201,
        headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': getSessionCookie(token),
        },
    })
}
```

**Step 2: 验证构建**

```bash
pnpm build
```

**Step 3: Commit**

```bash
git add src/pages/api/auth/register.ts
git commit -m "feat: 添加用户注册 API"
```

---

## Task 7: API — 登录接口

**Files:**

- Create: `src/pages/api/auth/login.ts`

**Step 1: 创建登录 API**

```ts
// src/pages/api/auth/login.ts
export const prerender = false

import type { APIRoute } from 'astro'
import { verifyPassword } from '@lib/auth'
import { getUserByEmail, getUserByUsername } from '@lib/db'
import { createSession, getSessionCookie } from '@lib/session'

export const POST: APIRoute = async ({ request, locals }) => {
    const env = locals.runtime.env

    let body: { account?: string; password?: string }
    try {
        body = await request.json()
    } catch {
        return new Response(JSON.stringify({ error: '请求格式错误' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    const { account, password } = body
    if (!account || !password) {
        return new Response(JSON.stringify({ error: '请填写账号和密码' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    // 支持邮箱或用户名登录
    const user = account.includes('@')
        ? await getUserByEmail(env.DB, account)
        : await getUserByUsername(env.DB, account)

    if (!user || !user.password_hash) {
        return new Response(JSON.stringify({ error: '账号或密码错误' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    const valid = await verifyPassword(password, user.password_hash)
    if (!valid) {
        return new Response(JSON.stringify({ error: '账号或密码错误' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    const token = await createSession(env.SESSION_KV, user.id, user.role)

    return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': getSessionCookie(token),
        },
    })
}
```

**Step 2: Commit**

```bash
git add src/pages/api/auth/login.ts
git commit -m "feat: 添加用户登录 API"
```

---

## Task 8: API — 登出 & 获取当前用户

**Files:**

- Create: `src/pages/api/auth/logout.ts`
- Create: `src/pages/api/auth/me.ts`

**Step 1: 创建登出 API**

```ts
// src/pages/api/auth/logout.ts
export const prerender = false

import type { APIRoute } from 'astro'
import { deleteSession, getTokenFromCookie, getClearSessionCookie } from '@lib/session'

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
```

**Step 2: 创建获取当前用户 API**

```ts
// src/pages/api/auth/me.ts
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
```

**Step 3: Commit**

```bash
git add src/pages/api/auth/logout.ts src/pages/api/auth/me.ts
git commit -m "feat: 添加登出和获取当前用户 API"
```

---

## Task 9: API — GitHub OAuth

**Files:**

- Create: `src/pages/api/auth/github.ts`
- Create: `src/pages/api/auth/callback/github.ts`

**Step 1: 创建 GitHub OAuth 发起跳转**

```ts
// src/pages/api/auth/github.ts
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
```

**Step 2: 创建 GitHub OAuth 回调**

```ts
// src/pages/api/auth/callback/github.ts
export const prerender = false

import type { APIRoute } from 'astro'
import { createUser, getOAuthAccount, createOAuthAccount, getUserById } from '@lib/db'
import { createSession, getSessionCookie } from '@lib/session'

interface GitHubUser {
    id: number
    login: string
    email: string | null
    avatar_url: string
    name: string | null
}

interface GitHubEmail {
    email: string
    primary: boolean
    verified: boolean
}

export const GET: APIRoute = async ({ url, locals }) => {
    const env = locals.runtime.env
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')

    if (!code) return new Response('Missing code', { status: 400 })

    let redirectTo = '/'
    if (state) {
        try {
            redirectTo = JSON.parse(atob(state)).redirect || '/'
        } catch {
            /* ignore */
        }
    }

    // 用 code 换 access_token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
            client_id: env.GITHUB_CLIENT_ID,
            client_secret: env.GITHUB_CLIENT_SECRET,
            code,
        }),
    })
    const tokenData = (await tokenRes.json()) as { access_token?: string }
    if (!tokenData.access_token) return new Response('OAuth failed', { status: 400 })

    const accessToken = tokenData.access_token

    // 获取 GitHub 用户信息
    const userRes = await fetch('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${accessToken}`, 'User-Agent': 'HUAT-FSAC' },
    })
    const ghUser = (await userRes.json()) as GitHubUser

    // 获取邮箱（如果 profile 没有公开邮箱）
    let email = ghUser.email
    if (!email) {
        const emailRes = await fetch('https://api.github.com/user/emails', {
            headers: { Authorization: `Bearer ${accessToken}`, 'User-Agent': 'HUAT-FSAC' },
        })
        const emails = (await emailRes.json()) as GitHubEmail[]
        const primary = emails.find((e) => e.primary && e.verified)
        email = primary?.email || emails[0]?.email || null
    }

    if (!email) return new Response('无法获取 GitHub 邮箱', { status: 400 })

    const providerId = String(ghUser.id)

    // 查找已有 OAuth 关联
    const existing = await getOAuthAccount(env.DB, 'github', providerId)

    let userId: string
    if (existing) {
        userId = existing.user_id
    } else {
        // 创建新用户
        userId = crypto.randomUUID()
        await createUser(env.DB, {
            id: userId,
            username: `gh_${ghUser.login}`,
            email,
            password_hash: null,
            display_name: ghUser.name || ghUser.login,
            avatar_url: ghUser.avatar_url,
            role: 'user',
        })
        await createOAuthAccount(env.DB, {
            id: crypto.randomUUID(),
            user_id: userId,
            provider: 'github',
            provider_id: providerId,
            access_token: accessToken,
        })
    }

    const user = await getUserById(env.DB, userId)
    const token = await createSession(env.SESSION_KV, userId, user?.role || 'user')

    return new Response(null, {
        status: 302,
        headers: {
            Location: redirectTo,
            'Set-Cookie': getSessionCookie(token),
        },
    })
}
```

**Step 3: Commit**

```bash
git add src/pages/api/auth/github.ts src/pages/api/auth/callback/github.ts
git commit -m "feat: 添加 GitHub OAuth 登录"
```

---

## Task 10: API — QQ 互联 OAuth

**Files:**

- Create: `src/pages/api/auth/qq.ts`
- Create: `src/pages/api/auth/callback/qq.ts`

**Step 1: 创建 QQ OAuth 发起跳转**

```ts
// src/pages/api/auth/qq.ts
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
```

**Step 2: 创建 QQ OAuth 回调**

```ts
// src/pages/api/auth/callback/qq.ts
export const prerender = false

import type { APIRoute } from 'astro'
import { createUser, getOAuthAccount, createOAuthAccount, getUserById } from '@lib/db'
import { createSession, getSessionCookie } from '@lib/session'

export const GET: APIRoute = async ({ url, locals }) => {
    const env = locals.runtime.env
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')

    if (!code) return new Response('Missing code', { status: 400 })

    let redirectTo = '/'
    if (state) {
        try {
            redirectTo = JSON.parse(atob(state)).redirect || '/'
        } catch {
            /* ignore */
        }
    }

    // 用 code 换 access_token
    const tokenParams = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: env.QQ_APP_ID,
        client_secret: env.QQ_APP_KEY,
        code,
        redirect_uri: `${url.origin}/api/auth/callback/qq/`,
    })
    const tokenRes = await fetch(`https://graph.qq.com/oauth2.0/token?${tokenParams}`)
    const tokenText = await tokenRes.text()
    const tokenMatch = tokenText.match(/access_token=([^&]+)/)
    if (!tokenMatch) return new Response('OAuth failed', { status: 400 })
    const accessToken = tokenMatch[1]

    // 获取 openid
    const openidRes = await fetch(`https://graph.qq.com/oauth2.0/me?access_token=${accessToken}`)
    const openidText = await openidRes.text()
    const openidMatch = openidText.match(/"openid":"([^"]+)"/)
    if (!openidMatch) return new Response('获取 openid 失败', { status: 400 })
    const openid = openidMatch[1]

    // 获取用户信息
    const infoParams = new URLSearchParams({
        access_token: accessToken,
        oauth_consumer_key: env.QQ_APP_ID,
        openid,
    })
    const infoRes = await fetch(`https://graph.qq.com/user/get_user_info?${infoParams}`)
    const info = (await infoRes.json()) as {
        nickname?: string
        figureurl_qq_2?: string
        ret?: number
    }
    if (info.ret !== 0) return new Response('获取用户信息失败', { status: 400 })

    // 查找已有 OAuth 关联
    const existing = await getOAuthAccount(env.DB, 'qq', openid)

    let userId: string
    if (existing) {
        userId = existing.user_id
    } else {
        userId = crypto.randomUUID()
        await createUser(env.DB, {
            id: userId,
            username: `qq_${openid.slice(0, 8)}`,
            email: `${openid}@qq.oauth`,
            password_hash: null,
            display_name: info.nickname || 'QQ用户',
            avatar_url: info.figureurl_qq_2 || null,
            role: 'user',
        })
        await createOAuthAccount(env.DB, {
            id: crypto.randomUUID(),
            user_id: userId,
            provider: 'qq',
            provider_id: openid,
            access_token: accessToken,
        })
    }

    const user = await getUserById(env.DB, userId)
    const token = await createSession(env.SESSION_KV, userId, user?.role || 'user')

    return new Response(null, {
        status: 302,
        headers: {
            Location: redirectTo,
            'Set-Cookie': getSessionCookie(token),
        },
    })
}
```

**Step 3: Commit**

```bash
git add src/pages/api/auth/qq.ts src/pages/api/auth/callback/qq.ts
git commit -m "feat: 添加 QQ 互联 OAuth 登录"
```

---

## Task 11: 前端页面 — 登录页

**Files:**

- Create: `src/pages/login.astro`
- Create: `src/styles/auth.css`

**Step 1: 创建 src/styles/auth.css — 登录/注册共用样式**

简洁的表单样式，与现有站点风格一致（使用 Starlight CSS 变量）：

```css
.auth-container {
    max-width: 420px;
    margin: 4rem auto;
    padding: 2rem;
}

.auth-card {
    background: var(--sl-color-bg-nav);
    border: 1px solid var(--sl-color-hairline);
    border-radius: 12px;
    padding: 2rem;
}

.auth-card h1 {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
    text-align: center;
}

.auth-field {
    margin-bottom: 1rem;
}

.auth-field label {
    display: block;
    margin-bottom: 0.25rem;
    font-size: 0.875rem;
    color: var(--sl-color-text);
}

.auth-field input {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--sl-color-hairline);
    border-radius: 6px;
    background: var(--sl-color-bg);
    color: var(--sl-color-text);
    font-size: 1rem;
}

.auth-field input:focus {
    outline: 2px solid var(--sl-color-accent);
    outline-offset: -1px;
}

.auth-btn {
    width: 100%;
    padding: 0.625rem;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    cursor: pointer;
    margin-top: 0.5rem;
}

.auth-btn-primary {
    background: var(--sl-color-accent);
    color: var(--sl-color-bg);
}

.auth-btn-github {
    background: #24292e;
    color: #fff;
}

.auth-btn-qq {
    background: #12b7f5;
    color: #fff;
}

.auth-divider {
    text-align: center;
    margin: 1.25rem 0;
    color: var(--sl-color-gray-3);
    font-size: 0.875rem;
}

.auth-error {
    background: #fef2f2;
    color: #dc2626;
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    font-size: 0.875rem;
    margin-bottom: 1rem;
    display: none;
}

.auth-link {
    text-align: center;
    margin-top: 1rem;
    font-size: 0.875rem;
}

.auth-link a {
    color: var(--sl-color-accent);
}
```

**Step 2: 创建 src/pages/login.astro**

登录页面，包含账号密码表单 + GitHub/QQ OAuth 按钮。使用 vanilla JS 处理表单提交。

页面标记 `export const prerender = false` 以启用 SSR。

包含：

- 账号（邮箱或用户名）+ 密码输入
- 登录按钮
- GitHub 登录按钮（链接到 /api/auth/github/）
- QQ 登录按钮（链接到 /api/auth/qq/）
- 错误提示区域
- 跳转注册页链接
- 读取 URL 中的 `redirect` 参数，登录成功后跳转

`<script>` 中用 fetch POST `/api/auth/login/`，成功后 `location.href = redirect || '/'`

**Step 3: Commit**

```bash
git add src/pages/login.astro src/styles/auth.css
git commit -m "feat: 添加登录页面"
```

---

## Task 12: 前端页面 — 注册页

**Files:**

- Create: `src/pages/register.astro`

**Step 1: 创建 src/pages/register.astro**

注册页面，与登录页共用 auth.css 样式。

包含：

- 用户名、邮箱、密码、确认密码输入
- 注册按钮
- 前端校验（密码长度、两次密码一致、用户名格式）
- 错误提示区域
- 跳转登录页链接

`<script>` 中用 fetch POST `/api/auth/register/`，成功后跳转首页

**Step 2: Commit**

```bash
git add src/pages/register.astro
git commit -m "feat: 添加注册页面"
```

---

## Task 13: 前端页面 — 个人资料页

**Files:**

- Create: `src/pages/profile.astro`

**Step 1: 创建 src/pages/profile.astro**

个人资料页，SSR 渲染，显示当前用户信息。

包含：

- 头像、用户名、邮箱、角色显示
- 已绑定的 OAuth 账号列表
- 登出按钮

`<script>` 中登出按钮 fetch POST `/api/auth/logout/`，成功后跳转首页

**Step 2: Commit**

```bash
git add src/pages/profile.astro
git commit -m "feat: 添加个人资料页面"
```

---

## Task 14: 管理后台 — 仪表盘 & 用户管理 API

**Files:**

- Create: `src/pages/api/admin/users.ts`
- Create: `src/pages/api/admin/users/[id].ts`

**Step 1: 创建用户列表 API**

```ts
// src/pages/api/admin/users.ts
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
```

**Step 2: 创建用户角色更新 API**

```ts
// src/pages/api/admin/users/[id].ts
export const prerender = false

import type { APIRoute } from 'astro'
import { hasRole } from '@lib/auth'

export const PATCH: APIRoute = async ({ params, request, locals }) => {
    const env = locals.runtime.env
    const userId = params.id

    let body: { role?: string }
    try {
        body = await request.json()
    } catch {
        return new Response(JSON.stringify({ error: '请求格式错误' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    if (!body.role) {
        return new Response(JSON.stringify({ error: '缺少 role 字段' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    const validRoles = ['user', 'member', 'admin', 'super_admin']
    if (!validRoles.includes(body.role)) {
        return new Response(JSON.stringify({ error: '无效的角色' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    // 只有 super_admin 能设置 super_admin 角色
    if (body.role === 'super_admin' && !hasRole(locals.user!.role, 'super_admin')) {
        return new Response(JSON.stringify({ error: '权限不足' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    // 不能修改自己的角色
    if (userId === locals.user!.id) {
        return new Response(JSON.stringify({ error: '不能修改自己的角色' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    await env.DB.prepare('UPDATE users SET role = ?, updated_at = ? WHERE id = ?')
        .bind(body.role, Date.now(), userId)
        .run()

    return new Response(JSON.stringify({ ok: true }), {
        headers: { 'Content-Type': 'application/json' },
    })
}
```

**Step 3: Commit**

```bash
git add src/pages/api/admin/
git commit -m "feat: 添加管理后台用户管理 API"
```

---

## Task 15: 管理后台 — 页面

**Files:**

- Create: `src/pages/admin/index.astro`
- Create: `src/pages/admin/users.astro`
- Create: `src/pages/admin/members.astro`
- Create: `src/styles/admin.css`

**Step 1: 创建 src/styles/admin.css — 管理后台共用样式**

简洁的后台布局样式：侧边导航 + 内容区域，表格样式，使用 Starlight CSS 变量。

**Step 2: 创建 src/pages/admin/index.astro — 仪表盘**

SSR 页面，显示：

- 用户总数、各角色人数统计（从 D1 查询）
- 最近注册的用户列表
- 侧边导航：仪表盘、用户管理、成员管理

**Step 3: 创建 src/pages/admin/users.astro — 用户管理**

SSR 页面，包含：

- 用户列表表格（用户名、邮箱、角色、注册时间）
- 角色下拉修改（fetch PATCH `/api/admin/users/[id]/`）
- 分页

**Step 4: 创建 src/pages/admin/members.astro — 成员管理**

SSR 页面，包含：

- 按赛季查看成员列表
- 从 D1 读取 role=member 的用户
- 未来扩展：编辑赛季数据

**Step 5: Commit**

```bash
git add src/pages/admin/ src/styles/admin.css
git commit -m "feat: 添加管理后台页面（仪表盘、用户管理、成员管理）"
```

---

## Task 16: 文档权限控制 — Starlight 集成

**Files:**

- Modify: `src/middleware.ts`
- Modify: `src/components/overrides/MarkdownContent.astro`

**Step 1: 修改 middleware 支持 frontmatter access 字段**

当前 middleware 按路由前缀判断权限。需要增强：对 Starlight 文档页面，读取对应 MDX 的 frontmatter `access` 字段来判断。

由于 Starlight 的文档页面是静态预渲染的，要实现逐页权限控制有两种方式：

**方式 A（推荐）：** 将需要权限控制的文档页面标记为 SSR（`export const prerender = false`），但 Starlight 的 content collection 页面不支持这样做。

**方式 B（实际可行）：** 在 middleware 中按路由前缀控制（当前方案），将整个 `/docs-center/` 和 `/archive/` 目录设为需要 member 权限。这是最简单且可靠的方式。

保持当前 middleware 的路由前缀方案不变。如果未来需要更细粒度的控制，可以将特定文档移到 SSR 页面中。

**Step 2: 修改 MarkdownContent.astro — 添加登录提示**

在 Starlight 的 MarkdownContent override 中，检查 `Astro.locals.user`：

- 如果用户未登录且当前页面在受限路径下，显示"请登录后查看"提示 + 登录按钮
- 如果用户已登录但角色不够，显示"权限不足"提示

注意：由于受限文档页面是静态预渲染的，middleware 无法在构建时拦截。实际的权限拦截需要将这些页面切换为 SSR，或者在 Starlight 的 route 配置中处理。

**实际方案：** 在 astro.config.mjs 中，不对受限文档做静态预渲染。通过在 `src/pages/` 下创建动态路由来代理受限文档内容，而非依赖 Starlight 的自动路由。

这部分复杂度较高，建议作为 Phase 2 单独迭代。当前先完成：

- 公开文档保持 Starlight 静态渲染
- `/admin/*` 和 API 路由的权限控制（已在 middleware 中实现）
- 登录/注册/个人资料页面

**Step 3: Commit**

```bash
git add src/middleware.ts src/components/overrides/MarkdownContent.astro
git commit -m "feat: 文档权限控制基础集成"
```

---

## Task 17: 导航集成 — 登录状态显示

**Files:**

- Modify: `src/components/overrides/PageFrame.astro`

**Step 1: 修改 PageFrame.astro**

在 Starlight 的 PageFrame override 中，添加顶部导航栏的登录状态：

- 未登录：显示"登录"链接
- 已登录：显示用户名 + 头像，点击跳转 `/profile/`
- 管理员：额外显示"管理后台"链接

通过 `Astro.locals.user` 获取当前用户信息（SSR 页面可用，静态页面需要客户端 JS fetch `/api/auth/me/`）。

对于静态预渲染的页面，使用客户端 JS：

```ts
// 页面加载后 fetch /api/auth/me/ 获取用户状态
// 动态更新导航栏的登录/用户信息显示
```

**Step 2: Commit**

```bash
git add src/components/overrides/PageFrame.astro
git commit -m "feat: 导航栏添加登录状态显示"
```

---

## Task 18: 初始化 super_admin & 种子数据

**Files:**

- Create: `src/db/seed.sql`

**Step 1: 创建种子数据脚本**

```sql
-- src/db/seed.sql
-- 创建初始 super_admin 账号
-- 密码需要在插入前用 bcryptjs 生成 hash
-- 示例：密码 "admin123456" 的 hash（实际部署时替换）
INSERT OR IGNORE INTO users (id, username, email, password_hash, display_name, role, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin',
  'admin@huat-fsac.eu.org',
  '$2a$10$PLACEHOLDER_HASH_REPLACE_ME',
  '超级管理员',
  'super_admin',
  strftime('%s', 'now') * 1000,
  strftime('%s', 'now') * 1000
);
```

**Step 2: 创建一个 Node 脚本生成密码 hash**

```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('你的密码', 10).then(h => console.log(h))"
```

将输出的 hash 替换到 seed.sql 中。

**Step 3: 执行种子数据**

```bash
pnpm wrangler d1 execute fsac-auth --local --file=src/db/seed.sql
```

**Step 4: Commit**

```bash
git add src/db/seed.sql
git commit -m "feat: 添加初始管理员种子数据脚本"
```

---

## Task 19: E2E 测试 — 认证流程

**Files:**

- Create: `tests/e2e/auth.spec.ts`

**Step 1: 编写认证 E2E 测试**

使用 Playwright 测试：

- 访问 `/login/` 页面能正常渲染
- 访问 `/register/` 页面能正常渲染
- 访问 `/admin/` 未登录时重定向到 `/login/`
- 注册 → 登录 → 查看 profile → 登出 完整流程
- GitHub/QQ OAuth 按钮存在且链接正确

注意：E2E 测试需要本地 wrangler dev 服务器运行，在 playwright.config.ts 中配置 `webServer` 命令为 `pnpm wrangler pages dev dist`。

**Step 2: 运行 E2E 测试**

```bash
pnpm build && pnpm test:e2e
```

**Step 3: Commit**

```bash
git add tests/e2e/auth.spec.ts playwright.config.ts
git commit -m "test: 添加认证流程 E2E 测试"
```

---

## Task 20: 最终验证 & 部署准备

**Files:**

- Modify: `.github/workflows/ci-cd.yml` (如需要)
- Modify: `package.json` (添加 wrangler 相关 scripts)

**Step 1: 添加 package.json scripts**

```json
{
    "scripts": {
        "dev:worker": "wrangler pages dev dist",
        "db:migrate": "wrangler d1 execute fsac-auth --file=src/db/schema.sql",
        "db:migrate:local": "wrangler d1 execute fsac-auth --local --file=src/db/schema.sql",
        "db:seed:local": "wrangler d1 execute fsac-auth --local --file=src/db/seed.sql"
    }
}
```

**Step 2: 全量验证**

```bash
pnpm lint
pnpm format:check
pnpm test:run
pnpm build
```

Expected: 全部通过

**Step 3: 部署前检查清单**

- [ ] Cloudflare Dashboard 创建 D1 数据库，更新 wrangler.toml 中的 database_id
- [ ] Cloudflare Dashboard 创建 KV namespace，更新 wrangler.toml 中的 id
- [ ] Cloudflare Pages 设置环境变量：SESSION_SECRET, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
- [ ] GitHub OAuth App 创建，回调地址设为 `https://huat-fsac.eu.org/api/auth/callback/github/`
- [ ] QQ 互联应用创建（可后续添加），回调地址设为 `https://huat-fsac.eu.org/api/auth/callback/qq/`
- [ ] 执行远程数据库 migration：`pnpm db:migrate`
- [ ] 生成 admin 密码 hash 并执行 seed

**Step 4: Commit**

```bash
git add package.json
git commit -m "chore: 添加 wrangler 开发和数据库管理脚本"
```
