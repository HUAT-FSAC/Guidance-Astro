// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
    ErrorType,
    clearErrorHistory,
    createErrorInfo,
    getErrorHistory,
    handleImageError,
    registerErrorHandler,
    triggerError,
    wrapSync,
} from '../../src/utils/error-handler'

describe('error-handler', () => {
    beforeEach(() => {
        clearErrorHistory()
        vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
        clearErrorHistory()
        vi.restoreAllMocks()
    })

    it('should register handlers and record triggered errors', () => {
        const handler = vi.fn()
        const unregister = registerErrorHandler(ErrorType.COMPONENT_ERROR, handler)
        const errorInfo = createErrorInfo(
            ErrorType.COMPONENT_ERROR,
            'component failed',
            'UnitTest',
            new Error('component failed')
        )

        triggerError(errorInfo)

        expect(handler).toHaveBeenCalledTimes(1)
        expect(handler).toHaveBeenCalledWith(errorInfo)
        expect(getErrorHistory()).toHaveLength(1)

        unregister()
    })

    it('should capture and rethrow sync errors via wrapSync', () => {
        const handler = vi.fn()
        const unregister = registerErrorHandler(ErrorType.COMPONENT_ERROR, handler)
        const wrapped = wrapSync(() => {
            throw new Error('sync failed')
        }, 'SyncCase')

        expect(() => wrapped()).toThrowError('sync failed')
        expect(handler).toHaveBeenCalledWith(
            expect.objectContaining({
                type: ErrorType.COMPONENT_ERROR,
                message: 'sync failed',
                component: 'SyncCase',
            })
        )
        expect(getErrorHistory()).toHaveLength(1)

        unregister()
    })

    it('should apply fallback or hide broken image', () => {
        const firstImage = document.createElement('img')
        firstImage.src = 'https://example.com/photo.png'
        handleImageError(firstImage, 'https://example.com/fallback.png')

        expect(firstImage.src).toContain('/fallback.png')

        const secondImage = document.createElement('img')
        secondImage.src = 'https://example.com/missing.png'
        handleImageError(secondImage)

        expect(secondImage.style.display).toBe('none')
        expect(secondImage.alt).toBe('图片加载失败')
        expect(getErrorHistory()).toHaveLength(2)
    })
})
