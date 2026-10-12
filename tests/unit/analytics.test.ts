// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
    AnalyticsEvent,
    initAnalytics,
    trackDocumentReading,
    trackError,
    trackEvent,
    trackExternalLinks,
    trackJoinClick,
    trackScrollDepth,
    trackThemeChange,
} from '../../src/utils/analytics'

function mockUmami() {
    const mockTrack = vi.fn()
    window.umami = { track: mockTrack }
    return mockTrack
}

describe('analytics', () => {
    beforeEach(() => {
        vi.spyOn(console, 'log').mockImplementation(() => {})
        delete (window as unknown as { umami?: unknown }).umami
        document.body.innerHTML = ''
    })

    afterEach(() => {
        vi.restoreAllMocks()
        vi.useRealTimers()
    })

    describe('trackEvent', () => {
        it('should not throw when umami is not available', () => {
            expect(() => trackEvent('test_event')).not.toThrow()
        })

        it('should call umami.track when available', () => {
            const mockTrack = mockUmami()

            trackEvent(AnalyticsEvent.THEME_CHANGE, { theme: 'dark' })
            expect(mockTrack).toHaveBeenCalledWith(AnalyticsEvent.THEME_CHANGE, { theme: 'dark' })
        })
    })

    describe('trackScrollDepth', () => {
        beforeEach(() => {
            Object.defineProperty(document.documentElement, 'scrollHeight', {
                value: 2000,
                configurable: true,
            })
            Object.defineProperty(window, 'innerHeight', { value: 1000, configurable: true })
            Object.defineProperty(window, 'scrollY', {
                value: 0,
                writable: true,
                configurable: true,
            })
        })

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

        it('tracks milestones deterministically with fake timers', () => {
            vi.useFakeTimers()
            const mockTrack = mockUmami()
            const cleanup = trackScrollDepth()!

            // 60% -> milestones 25 + 50 (throttle 100ms, no real waiting)
            window.scrollY = 600
            window.dispatchEvent(new Event('scroll'))
            vi.advanceTimersByTime(100)
            expect(mockTrack).toHaveBeenCalledWith(AnalyticsEvent.PAGE_SCROLL_25, { percent: 25 })
            expect(mockTrack).toHaveBeenCalledWith(AnalyticsEvent.PAGE_SCROLL_50, { percent: 50 })
            expect(mockTrack).not.toHaveBeenCalledWith(
                AnalyticsEvent.PAGE_SCROLL_75,
                expect.anything()
            )

            // 96% -> milestones 75 + 100
            window.scrollY = 1920
            window.dispatchEvent(new Event('scroll'))
            vi.advanceTimersByTime(100)
            expect(mockTrack).toHaveBeenCalledWith(AnalyticsEvent.PAGE_SCROLL_75, { percent: 75 })
            expect(mockTrack).toHaveBeenCalledWith(AnalyticsEvent.PAGE_SCROLL_100, {
                percent: 100,
            })

            // milestones fire only once
            const calls = mockTrack.mock.calls.length
            window.dispatchEvent(new Event('scroll'))
            vi.advanceTimersByTime(100)
            expect(mockTrack.mock.calls.length).toBe(calls)
            cleanup()
        })

        it('ignores scroll when page is not scrollable', () => {
            vi.useFakeTimers()
            const mockTrack = mockUmami()
            Object.defineProperty(document.documentElement, 'scrollHeight', {
                value: 500,
                configurable: true,
            })
            const cleanup = trackScrollDepth()!
            window.scrollY = 100
            window.dispatchEvent(new Event('scroll'))
            vi.advanceTimersByTime(100)
            expect(mockTrack).not.toHaveBeenCalled()
            cleanup()
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
            const _cleanup1 = trackDocumentReading()
            const cleanup2 = trackDocumentReading()
            // First listener should have been removed when second call happened
            expect(removeSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function))
            cleanup2!()
        })

        it('reports read start and completion', () => {
            const mockTrack = mockUmami()
            const cleanup = trackDocumentReading()!
            expect(mockTrack).toHaveBeenCalledWith(
                AnalyticsEvent.DOC_READ_START,
                expect.objectContaining({ path: '/' })
            )

            // 70s on page -> time-on-page + read-complete on unload (no real waiting)
            const now = Date.now()
            vi.spyOn(Date, 'now').mockImplementation(() => now + 70000)
            window.dispatchEvent(new Event('beforeunload'))
            expect(mockTrack).toHaveBeenCalledWith(
                AnalyticsEvent.DOC_TIME_ON_PAGE,
                expect.objectContaining({ seconds: 70 })
            )
            expect(mockTrack).toHaveBeenCalledWith(
                AnalyticsEvent.DOC_READ_COMPLETE,
                expect.any(Object)
            )
            cleanup!()
        })
    })

    describe('trackExternalLinks', () => {
        it('tracks external clicks, ignores internal links', () => {
            const mockTrack = mockUmami()
            trackExternalLinks()
            trackExternalLinks() // second call is a no-op (bind-once)

            document.body.innerHTML =
                '<a href="https://external.com/page">link</a><a href="/internal">internal</a>'
            const [external, internal] = Array.from(document.querySelectorAll('a'))
            external.dispatchEvent(new MouseEvent('click', { bubbles: true }))
            expect(mockTrack).toHaveBeenCalledWith(
                AnalyticsEvent.EXTERNAL_LINK,
                expect.objectContaining({ url: 'https://external.com/page' })
            )

            const calls = mockTrack.mock.calls.length
            internal.dispatchEvent(new MouseEvent('click', { bubbles: true }))
            expect(mockTrack.mock.calls.length).toBe(calls)
        })
    })

    describe('trackThemeChange, trackJoinClick, trackError', () => {
        it('forwards typed events to umami', () => {
            const mockTrack = mockUmami()
            trackThemeChange('dark')
            expect(mockTrack).toHaveBeenCalledWith(AnalyticsEvent.THEME_CHANGE, { theme: 'dark' })
            trackJoinClick('banner')
            expect(mockTrack).toHaveBeenCalledWith(AnalyticsEvent.JOIN_CLICK, { source: 'banner' })
            trackError(new Error('oops'), { foo: 'bar' })
            expect(mockTrack).toHaveBeenCalledWith(
                AnalyticsEvent.ERROR_OCCURRED,
                expect.objectContaining({ message: 'oops' })
            )
            trackError('string error')
            expect(mockTrack).toHaveBeenCalled()
        })
    })

    describe('initAnalytics', () => {
        it('should return a cleanup function and reset on re-init', () => {
            const cleanup = initAnalytics()!
            expect(typeof cleanup).toBe('function')
            cleanup()
            // second init should clean previous listeners without throwing
            initAnalytics()
            const cleanup2 = initAnalytics()!
            cleanup2!()
        })
    })

    describe('no-window guards', () => {
        it('returns undefined instead of throwing without window', () => {
            const origWindow = global.window
            try {
                // @ts-expect-error: suppress type error
                delete global.window
                expect(() => trackEvent('test')).not.toThrow()
                expect(trackScrollDepth()).toBeUndefined()
                expect(trackDocumentReading()).toBeUndefined()
                expect(() => trackExternalLinks()).not.toThrow()
                expect(initAnalytics()).toBeUndefined()
            } finally {
                // @ts-expect-error: suppress type error
                global.window = origWindow
            }
        })
    })
})
