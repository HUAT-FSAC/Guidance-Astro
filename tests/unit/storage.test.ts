// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
    safeGetItem,
    safeSetItem,
    safeRemoveItem,
    safeGetJSON,
    safeSetJSON,
} from '../../src/utils/storage'

describe('storage', () => {
    beforeEach(() => {
        localStorage.clear()
        vi.spyOn(console, 'warn').mockImplementation(() => {})
    })

    afterEach(() => {
        localStorage.clear()
        vi.restoreAllMocks()
    })

    describe('safeGetItem', () => {
        it('should return stored value', () => {
            localStorage.setItem('key', 'value')
            expect(safeGetItem('key')).toBe('value')
        })

        it('should return default when key missing', () => {
            expect(safeGetItem('missing', 'fallback')).toBe('fallback')
        })

        it('should return null by default when key missing', () => {
            expect(safeGetItem('missing')).toBeNull()
        })

        it('should return default when localStorage throws', () => {
            vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
                throw new Error('access denied')
            })
            expect(safeGetItem('key', 'safe')).toBe('safe')
        })
    })

    describe('safeSetItem', () => {
        it('should store value and return true', () => {
            expect(safeSetItem('key', 'value')).toBe(true)
            expect(localStorage.getItem('key')).toBe('value')
        })

        it('should return false when localStorage throws', () => {
            vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
                throw new Error('quota exceeded')
            })
            expect(safeSetItem('key', 'value')).toBe(false)
        })
    })

    describe('safeRemoveItem', () => {
        it('should remove item and return true', () => {
            localStorage.setItem('key', 'value')
            expect(safeRemoveItem('key')).toBe(true)
            expect(localStorage.getItem('key')).toBeNull()
        })

        it('should return false when localStorage throws', () => {
            vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
                throw new Error('access denied')
            })
            expect(safeRemoveItem('key')).toBe(false)
        })
    })

    describe('safeGetJSON', () => {
        it('should parse stored JSON', () => {
            localStorage.setItem('obj', JSON.stringify({ a: 1 }))
            expect(safeGetJSON('obj', {})).toEqual({ a: 1 })
        })

        it('should return default for missing key', () => {
            expect(safeGetJSON('missing', { fallback: true })).toEqual({ fallback: true })
        })

        it('should return default for invalid JSON', () => {
            localStorage.setItem('bad', 'not-json{')
            expect(safeGetJSON('bad', [])).toEqual([])
        })
    })

    describe('safeSetJSON', () => {
        it('should serialize and store object', () => {
            expect(safeSetJSON('obj', { b: 2 })).toBe(true)
            expect(JSON.parse(localStorage.getItem('obj')!)).toEqual({ b: 2 })
        })

        it('should handle circular references gracefully', () => {
            const circular: Record<string, unknown> = {}
            circular.self = circular
            expect(safeSetJSON('circ', circular)).toBe(false)
        })
    })
})
