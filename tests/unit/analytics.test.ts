// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
    AnalyticsEvent,
    trackEvent,
    trackScrollDepth,
    trackExternalLinks,
    trackDocumentReading,
    initAnalytics,
} from '../../src/utils/analytics'

describe('analytics', () => {
    beforeEach(() => {
        vi.spyOn(console, 'log').mockImplementation(() => {})
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    describe('trackEvent', () => {
        it('should not throw when umami is not available', () => {
            expect(() => trackEvent('test_event')).not.toThrow()
        })

        it('should call umami.track when available', () => {
            const mockTrack = vi.fn()
            ;(window as unknown as { umami: { track: typeof mockTrack } }).umami = { track: mockTrack }

            trackEvent(AnalyticsEvent.THEME_CHANGE, { theme: 'dark' })
            expect(mockTrack).toHaveBeenCalledWith(AnalyticsEvent.THEME_CHANGE, { theme: 'dark' })

            delete (window as unknown as { umami?: unknown }).umami
        })
    })

    describe('trackScrollDepth', () => {
        it('should return a cleanup function', () => {
            const cleanup = trackScrollDepth()
            expect(typeof cleanup).toBe('function')
            cleanup!()
        })

        it('should remove scroll listener on cleanup', () => {
            const removeSpy = vi.spyOn(window, 'removeEventListener')
            const cleanup = trackScrollDepth()
            cleanup!()
            expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
        })
    })

    describe('trackDocumentReading', () => {
        it('should return a cleanup function', () => {
            const cleanup = trackDocumentReading()
            expect(typeof cleanup).toBe('function')
            cleanup!()
        })

        it('should remove beforeunload listener on cleanup', () => {
            const removeSpy = vi.spyOn(window, 'removeEventListener')
            const cleanup = trackDocumentReading()
            cleanup!()
            expect(removeSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function))
        })

        it('should clean up previous listener when called again', () => {
            const removeSpy = vi.spyOn(window, 'removeEventListener')
            const cleanup1 = trackDocumentReading()
            const cleanup2 = trackDocumentReading()
            // First listener should have been removed when second call happened
            expect(removeSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function))
            cleanup2!()
        })
    })

    describe('trackExternalLinks', () => {
        it('should not throw', () => {
            expect(() => trackExternalLinks()).not.toThrow()
        })
    })

    describe('initAnalytics', () => {
        it('should return a cleanup function', () => {
            const cleanup = initAnalytics()
            expect(typeof cleanup).toBe('function')
            cleanup!()
        })
    })
})
