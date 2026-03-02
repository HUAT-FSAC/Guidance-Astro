import { describe, expect, it } from 'vitest'
import {
    generateToken,
    getClearSessionCookie,
    getSessionCookie,
    getTokenFromCookie,
} from '../../../src/lib/session'

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
