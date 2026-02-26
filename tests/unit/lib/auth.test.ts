import { describe, expect, it } from 'vitest'
import {
    hashPassword,
    hasRole,
    validateEmail,
    validatePassword,
    validateUsername,
    verifyPassword,
} from '../../../src/lib/auth'

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
