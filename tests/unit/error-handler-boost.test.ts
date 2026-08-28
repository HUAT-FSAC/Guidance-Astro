// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
    clearErrorHistory,
    createErrorInfo,
    createSafeImageLoader,
    ErrorType,
    getErrorHistory,
    handleImageError,
    handleStorageError,
    handleValidationError,
    registerErrorHandler,
    safeJsonParse,
    safeJsonStringify,
    setupGlobalErrorHandlers,
    triggerError,
    wrapAsync,
    wrapSync,
} from '../../src/utils/error-handler'

describe('error-handler-boost', () => {
    beforeEach(() => {
        clearErrorHistory()
        vi.spyOn(console, 'error').mockImplementation(() => {})
    })
    afterEach(() => {
        vi.restoreAllMocks()
        clearErrorHistory()
    })
    it('register and trigger', () => {
        const handler = vi.fn()
        const dereg = registerErrorHandler(ErrorType.COMPONENT_ERROR, handler)
        const info = createErrorInfo(ErrorType.COMPONENT_ERROR, 'msg', 'comp', new Error('e'))
        expect(info.type).toBe(ErrorType.COMPONENT_ERROR)
        expect(info.message).toBe('msg')
        expect(info.component).toBe('comp')
        expect(info.stack).toBeDefined()
        triggerError(info)
        expect(handler).toHaveBeenCalled()
        // handler throws
        const badHandler = vi.fn(() => {
            throw new Error('handler fail')
        })
        registerErrorHandler(ErrorType.COMPONENT_ERROR, badHandler)
        triggerError(info) // should not throw
        dereg()
        // history limit
        for (let i = 0; i < 55; i++) triggerError(createErrorInfo(ErrorType.SCRIPT_ERROR, `m${i}`))
        expect(getErrorHistory().length).toBe(50)
    })
    it('wrapAsync success and error', async () => {
        const fn = wrapAsync(async (x: unknown) => {
            if (x === 'fail') throw new Error('async fail')
            return x
        }, 'TestComp')
        expect(await fn('ok')).toBe('ok')
        await expect(fn('fail')).rejects.toThrow('async fail')
        // non-Error throw
        const fn2 = wrapAsync(async () => {
            throw 'string'
        }, 'c')
        await expect(fn2()).rejects.toBe('string')
    })
    it('wrapSync', () => {
        const fn = wrapSync((x: unknown) => {
            if (x === 'fail') throw new Error('sync fail')
            return x
        })
        expect(fn('ok')).toBe('ok')
        expect(() => fn('fail')).toThrow('sync fail')
        const fn2 = wrapSync(() => {
            throw 'oops'
        })
        expect(() => fn2()).toThrow('oops')
    })
    it('setupGlobalErrorHandlers', () => {
        setupGlobalErrorHandlers()
        // second call should be no-op
        setupGlobalErrorHandlers()
        // trigger error event
        const event = new ErrorEvent('error', { message: 'test', error: new Error('e') })
        window.dispatchEvent(event)
        const rej = new PromiseRejectionEvent('unhandledrejection', {
            reason: new Error('rej'),
            promise: Promise.resolve(),
        })
        window.dispatchEvent(rej)
        window.dispatchEvent(
            new PromiseRejectionEvent('unhandledrejection', {
                reason: 'string',
                promise: Promise.resolve(),
            })
        )
    })
    it('handleImageError', () => {
        const img = document.createElement('img')
        img.src = 'https://example.com/a.jpg'
        handleImageError(img, 'https://example.com/fallback.jpg')
        expect(img.src).toContain('fallback.jpg')
        // second call with same should return early due to dataset
        handleImageError(img, 'https://example.com/fallback2.jpg')
        expect(img.src).toContain('fallback.jpg') // not changed
        const img2 = document.createElement('img')
        img2.src = 'https://example.com/b.jpg'
        handleImageError(img2)
        expect(img2.style.display).toBe('none')
        expect(img2.alt).toBe('图片加载失败')
    })
    it('createSafeImageLoader', async () => {
        const img = createSafeImageLoader(
            'https://example.com/c.jpg',
            'https://example.com/fallback.jpg',
            vi.fn(),
            vi.fn()
        )
        expect(img.src).toContain('c.jpg')
        // simulate load
        img.onload!(new Event('load') as unknown as Event)
        // simulate error
        const onError = vi.fn()
        const img2 = createSafeImageLoader(
            'https://example.com/d.jpg',
            undefined,
            undefined,
            onError
        )
        img2.onerror!(new Event('error') as unknown as Event)
        expect(onError).toHaveBeenCalled()
    })
    it('handleStorageError and validation', () => {
        handleStorageError('key', 'get', new Error('e'))
        handleStorageError('key2', 'set')
        handleValidationError('field', 'msg', 'val')
        expect(getErrorHistory().length).toBeGreaterThan(0)
    })
    it('safeJsonParse/Stringify', () => {
        expect(safeJsonParse('{"a":1}', {})).toEqual({ a: 1 })
        expect(safeJsonParse('invalid', { a: 1 })).toEqual({ a: 1 })
        expect(safeJsonStringify({ a: 1 }, 'fallback')).toBe('{"a":1}')
        const circ: Record<string, unknown> = {}
        circ.self = circ
        expect(safeJsonStringify(circ, 'fallback')).toBe('fallback')
    })
})
