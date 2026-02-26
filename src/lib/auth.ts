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
