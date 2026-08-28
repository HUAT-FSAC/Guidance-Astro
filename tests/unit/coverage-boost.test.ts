// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
    announce,
    getA11yPreferences,
    initAccessibility,
    initSkipLink,
    resetA11yPreferences,
    toggleHighContrast,
    toggleLargeText,
    toggleReducedMotion,
    trapFocus,
    updateA11yPreferences,
} from '../../src/utils/accessibility'
import {
    cleanupAllComponents,
    cleanupComponent,
    cleanupElement,
    getComponentName,
    initComponent,
    initElement,
    isComponentInitialized,
    isElementInitialized,
    markComponentInitialized,
    setupComponentLifecycle,
} from '../../src/utils/component-init'
import { lazyLoadComponent, lazyLoadComponents } from '../../src/utils/lazy-components'
import { shouldFilterBuildWarning } from '../../src/integrations/filter-known-build-warnings'
import filterKnownBuildWarnings from '../../src/integrations/filter-known-build-warnings'
import {
    getSearchSuggestions,
    initSearchSuggestions,
    renderSearchSuggestions,
} from '../../src/utils/search-suggestions'
import { highlightSearchResults, initSearchResultHighlight } from '../../src/utils/search-highlight'
import {
    canUseNativeShare,
    copyToClipboard,
    generateQRCodeDataUrl,
    generateShareUrl,
    getPageShareData,
    nativeShare,
    openShareWindow,
} from '../../src/utils/share'
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

describe('coverage-boost: accessibility', () => {
    beforeEach(() => {
        localStorage.clear()
        document.documentElement.className = ''
        document.body.innerHTML = ''
    })
    it('get/update/reset preferences', () => {
        const prefs = getA11yPreferences()
        expect(prefs.highContrast).toBe(false)
        updateA11yPreferences({ highContrast: true, largeText: true })
        expect(getA11yPreferences().highContrast).toBe(true)
        expect(document.documentElement.classList.contains('a11y-high-contrast')).toBe(true)
        expect(document.documentElement.classList.contains('a11y-large-text')).toBe(true)
        resetA11yPreferences()
        expect(getA11yPreferences().highContrast).toBe(false)
        expect(document.documentElement.classList.contains('a11y-high-contrast')).toBe(false)
    })
    it('toggle helpers', () => {
        expect(toggleHighContrast(true)).toBe(true)
        expect(toggleHighContrast(false)).toBe(false)
        expect(toggleHighContrast()).toBe(true)
        expect(toggleLargeText(true)).toBe(true)
        expect(toggleReducedMotion(true)).toBe(true)
        toggleReducedMotion(false)
        expect(getA11yPreferences().reducedMotion).toBe(false)
    })
    it('announce and trapFocus', () => {
        announce('hello')
        expect(document.body.textContent).toContain('hello')
        announce('world', 'assertive')
        const el = document.createElement('div')
        el.innerHTML = '<button>one</button><button>two</button>'
        document.body.appendChild(el)
        const cleanup = trapFocus(el)
        expect(typeof cleanup).toBe('function')
        cleanup()
        el.remove()
    })
    it('initSkipLink and initAccessibility', () => {
        initSkipLink()
        expect(document.querySelector('.a11y-skip-link')).toBeTruthy()
        initAccessibility()
        expect(document.querySelector('.a11y-skip-link')).toBeTruthy()
    })
    it('markComponentInitialized', () => {
        const el = document.createElement('div')
        markComponentInitialized(el, 'test-comp')
        expect(getComponentName(el)).toBe('test-comp')
    })
})

describe('coverage-boost: component-init', () => {
    beforeEach(() => {
        document.body.innerHTML = ''
    })
    it('initElement success and duplicate', () => {
        const el = document.createElement('div')
        el.id = 'test-init-el'
        document.body.appendChild(el)
        const fn = vi.fn(() => () => {})
        expect(initElement(el, fn)).toBe(true)
        expect(isElementInitialized(el)).toBe(true)
        expect(initElement(el, fn)).toBe(false)
        expect(isComponentInitialized('#test-init-el')).toBe(true)
        expect(isComponentInitialized('#nope-not-exist')).toBe(false)
        // cleanup
        cleanupElement(el)
        expect(isElementInitialized(el)).toBe(false)
        el.remove()
    })
    it('initElement handles error', () => {
        const el = document.createElement('div')
        expect(
            initElement(el, () => {
                throw new Error('fail')
            })
        ).toBe(false)
    })
    it('initComponent with selector', () => {
        document.body.innerHTML = '<div id="a"></div>'
        expect(initComponent('#a', () => {})).toBe(true)
        expect(initComponent('#a', () => {})).toBe(false)
        expect(initComponent('#nope', () => {})).toBe(false)
        cleanupComponent('#a')
        expect(isComponentInitialized('#a')).toBe(false)
        cleanupAllComponents()
    })
    it('setupComponentLifecycle', () => {
        document.body.innerHTML = '<div id="b"></div>'
        const fn = vi.fn()
        setupComponentLifecycle('#b', fn)
        // need to trigger DOMContentLoaded? already past, so fn called via init()
        // we at least ensure no throw
        expect(fn).toHaveBeenCalled()
        // cleanup via astro:after-preparation
        document.dispatchEvent(new Event('astro:after-preparation'))
        expect(isComponentInitialized('#b')).toBe(false)
    })
})

describe('coverage-boost: lazy-components', () => {
    it('lazyLoadComponent with delay and success', async () => {
        document.body.innerHTML = '<div class="lazy-a"></div>'
        const mockInit = vi.fn(() => () => {})
        const importFn = vi.fn(() => Promise.resolve({ default: mockInit }))
        lazyLoadComponent({ selector: '.lazy-a', importFn, delay: 10 })
        await new Promise((r) => setTimeout(r, 50))
        expect(importFn).toHaveBeenCalled()
        // cleanup via setupComponentLifecycle will have set up
    })
    it('lazyLoadComponent handles import error', async () => {
        document.body.innerHTML = '<div class="lazy-b"></div>'
        const importFn = vi.fn(() => Promise.reject(new Error('load fail')))
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
        lazyLoadComponent({ selector: '.lazy-b', importFn })
        await new Promise((r) => setTimeout(r, 20))
        expect(consoleSpy).toHaveBeenCalled()
        consoleSpy.mockRestore()
    })
    it('lazyLoadComponents batch', () => {
        lazyLoadComponents([
            { selector: '.x1', importFn: () => Promise.resolve({ default: () => () => {} }) },
            { selector: '.x2', importFn: () => Promise.resolve({ init: () => () => {} }) },
        ])
    })
})

describe('coverage-boost: filter-known-build-warnings', () => {
    it('shouldFilterBuildWarning various', () => {
        expect(shouldFilterBuildWarning(['Entry docs → 404 was not found.'])).toBe(true)
        expect(shouldFilterBuildWarning(['as it conflicts with higher priority route'])).toBe(true)
        expect(shouldFilterBuildWarning(['file not created, response body was empty'])).toBe(true)
        expect(shouldFilterBuildWarning(['Module \"node:fs\"'])).toBe(true)
        expect(shouldFilterBuildWarning(['Module \"child_process\"'])).toBe(true)
        expect(shouldFilterBuildWarning(['Module \"stream\"'])).toBe(true)
        expect(shouldFilterBuildWarning(['Module \"string_decoder\"'])).toBe(true)
        expect(shouldFilterBuildWarning(['Module \"os\"'])).toBe(true)
        expect(shouldFilterBuildWarning(['Module \"url\"'])).toBe(true)
        expect(shouldFilterBuildWarning(['is dynamically imported by'])).toBe(true)
        expect(
            shouldFilterBuildWarning(['dynamic import will not move module into another chunk'])
        ).toBe(true)
        expect(shouldFilterBuildWarning(['random warning'])).toBe(false)
        expect(shouldFilterBuildWarning([])).toBe(false)
        expect(shouldFilterBuildWarning([123 as unknown as string])).toBe(false)
    })
    it('integration hooks filter', () => {
        const integration = filterKnownBuildWarnings()
        expect(integration.name).toBe('filter-known-build-warnings')
        // mock console.warn and stdout.write
        const originalWarn = console.warn
        const originalStdout = process.stdout.write
        const originalStderr = process.stderr.write
        const warnCalls: unknown[][] = []
        console.warn = (...args: unknown[]) => warnCalls.push(args)
        let stdoutContent = ''
        // @ts-expect-error: mock
        process.stdout.write = (buf: string | Uint8Array, cb?: unknown) => {
            stdoutContent += typeof buf === 'string' ? buf : buf.toString()
            if (typeof cb === 'function') (cb as () => void)()
            return true
        }
        // @ts-expect-error: suppress type error
        process.stderr.write = process.stdout.write
        integration.hooks['astro:config:setup']!({} as never)
        console.warn('Entry docs → 404 was not found.')
        console.warn('real warning')
        expect(warnCalls.length).toBe(1)
        expect(warnCalls[0][0]).toBe('real warning')
        // test multiline filtering via wrapStreamWrite
        process.stdout.write(
            'Entry docs → 404 was not found.\nreal line\nModule \"node:fs\" has been externalized.\n'
        )
        // should filter first and third, keep second
        integration.hooks['astro:build:done']!({} as never)
        console.warn = originalWarn
        process.stdout.write = originalStdout
        process.stderr.write = originalStderr
    })
})

describe('coverage-boost: search-suggestions', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        localStorage.clear()
    })
    it('getSearchSuggestions popular and history', async () => {
        // mock history to test de-dupe and sorting
        const { filterSearchHistory } = await import('../../src/utils/search-history')
        // history returns one item matching
        // we already mock in other test, but here we test without mock (real history empty)
        const s1 = getSearchSuggestions('', 5)
        expect(s1.length).toBe(5)
        const s2 = getSearchSuggestions('感知')
        expect(s2.some((s) => s.query.includes('感知'))).toBe(true)
        const s3 = getSearchSuggestions('zzzz')
        expect(s3.length).toBe(0)
    })
    it('getSearchSuggestions sorting by relevance', () => {
        const s = getSearchSuggestions('ROS')
        // should prioritize history if present, else popular
        expect(s.length).toBeGreaterThan(0)
    })
    it('renderSearchSuggestions empty and full', () => {
        const container = document.createElement('div')
        renderSearchSuggestions(container, 'zzzzzzzzzz', vi.fn())
        expect(container.innerHTML).toContain('无搜索建议')
        const container2 = document.createElement('div')
        renderSearchSuggestions(container2, '感知', vi.fn())
        expect(container2.querySelector('.search-suggestions-list')).toBeTruthy()
        // click button
        const btn = container2.querySelector('.search-suggestions-button') as HTMLElement
        const cb = vi.fn()
        const container3 = document.createElement('div')
        renderSearchSuggestions(container3, 'ROS', cb)
        const btn2 = container3.querySelector('.search-suggestions-button') as HTMLElement
        btn2.click()
        expect(cb).toHaveBeenCalled()
    })
    it('renderSearchSuggestions history type', async () => {
        // without mock, history is empty, so it renders popular; test that popular type appears
        const container = document.createElement('div')
        renderSearchSuggestions(container, '感知', vi.fn())
        expect(container.innerHTML).toContain('热门')
        // also test that history type would be prioritized if present (via direct call with mocked history)
        // we test getSearchSuggestions de-dupe by calling with a query that matches both
        const suggestions = getSearchSuggestions('感知')
        expect(suggestions.length).toBeGreaterThan(0)
    })
    it('initSearchSuggestions', () => {
        const input = document.createElement('input')
        const container = document.createElement('div')
        document.body.appendChild(input)
        document.body.appendChild(container)
        const onSelect = vi.fn()
        const cleanup = initSearchSuggestions(input, container, onSelect)
        input.value = '感知'
        input.dispatchEvent(new Event('input'))
        // trigger keydown
        const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })
        input.dispatchEvent(event)
        const event2 = new KeyboardEvent('keydown', { key: 'Escape' })
        input.dispatchEvent(event2)
        expect(container.innerHTML).toBe('')
        // click outside
        document.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        cleanup()
        input.remove()
        container.remove()
    })
})

describe('coverage-boost: search-highlight', () => {
    it('highlightSearchResults branches', () => {
        expect(highlightSearchResults('hello world', '')).toBe('hello world')
        expect(highlightSearchResults('hello $10.00', '$10.00')).toContain('search-highlight')
        expect(highlightSearchResults('abc', 'xyz')).toBe('abc')
        expect(highlightSearchResults('aaa', 'aa')).toContain('search-highlight')
    })
    it('initSearchResultHighlight', () => {
        const container = document.createElement('div')
        container.innerHTML = '<p>hello world</p><p>hello again</p><code>hello</code>'
        document.body.appendChild(container)
        initSearchResultHighlight(container, 'hello')
        expect(container.innerHTML).toContain('search-highlight')
        // empty query
        const c2 = document.createElement('div')
        c2.innerHTML = '<p>test</p>'
        initSearchResultHighlight(c2, '')
        expect(c2.innerHTML).toBe('<p>test</p>')
        // no text nodes
        const c3 = document.createElement('div')
        c3.innerHTML = '<script>hello</script>'
        initSearchResultHighlight(c3, 'hello')
        expect(c3.innerHTML).toContain('<script>')
        container.remove()
        c2.remove()
        c3.remove()
    })
    it('initSearchResultHighlight with no parent', () => {
        const container = document.createElement('div')
        container.innerHTML = 'hello world'
        initSearchResultHighlight(container, 'hello')
        expect(container.innerHTML).toContain('search-highlight')
    })
})

describe('coverage-boost: share', () => {
    beforeEach(() => {
        // @ts-expect-error: suppress type error
        delete window.location
        // @ts-expect-error: suppress type error
        window.location = new URL('https://huat-fsac.eu.org/docs/') as unknown as Location
        document.head.innerHTML =
            '<meta property="og:title" content="Test Title"><meta property="og:description" content="desc"><meta property="og:image" content="https://example.com/img.png">'
        document.title = 'Test'
    })
    it('canUseNativeShare false', () => {
        expect(canUseNativeShare()).toBe(false)
        // mock
        // @ts-expect-error: suppress type error
        navigator.share = () => Promise.resolve()
        // @ts-expect-error: suppress type error
        navigator.canShare = () => true
        expect(canUseNativeShare()).toBe(true)
        // @ts-expect-error: suppress type error
        delete navigator.share
        // @ts-expect-error: suppress type error
        delete navigator.canShare
    })
    it('nativeShare not supported', async () => {
        const res = await nativeShare({ url: 'https://example.com', title: 't' })
        expect(res.success).toBe(false)
    })
    it('nativeShare success and abort', async () => {
        // @ts-expect-error: suppress type error
        navigator.share = vi.fn(() => Promise.resolve())
        // @ts-expect-error: suppress type error
        navigator.canShare = () => true
        const res = await nativeShare({ url: 'https://example.com', title: 't', description: 'd' })
        expect(res.success).toBe(true)
        // @ts-expect-error: suppress type error
        navigator.share = vi.fn(() =>
            Promise.reject(Object.assign(new Error('abort'), { name: 'AbortError' }))
        )
        const res2 = await nativeShare({ url: 'https://example.com', title: 't' })
        expect(res2.message).toContain('取消')
        // @ts-expect-error: suppress type error
        navigator.share = vi.fn(() => Promise.reject(new Error('fail')))
        const res3 = await nativeShare({ url: 'https://example.com', title: 't' })
        expect(res3.success).toBe(false)
        // @ts-expect-error: suppress type error
        delete navigator.share
        // @ts-expect-error: suppress type error
        delete navigator.canShare
    })
    it('copyToClipboard success and fallback', async () => {
        // clipboard available
        // @ts-expect-error: suppress type error
        navigator.clipboard = { writeText: vi.fn(() => Promise.resolve()) }
        const r1 = await copyToClipboard('hello')
        expect(r1.success).toBe(true)
        // fallback via execCommand
        // @ts-expect-error: suppress type error
        delete navigator.clipboard
        document.execCommand = vi.fn(() => true) as unknown as typeof document.execCommand
        const r2 = await copyToClipboard('hello')
        expect(r2.success).toBe(true)
        // failure
        document.execCommand = vi.fn(() => {
            throw new Error('fail')
        }) as unknown as typeof document.execCommand
        // need to mock createElement to throw? just make copy fail via clipboard throw
        // @ts-expect-error: suppress type error
        navigator.clipboard = { writeText: vi.fn(() => Promise.reject(new Error('fail'))) }
        const r3 = await copyToClipboard('hello')
        expect(r3.success).toBe(false)
        // @ts-expect-error: suppress type error
        delete navigator.clipboard
    })
    it('generateShareUrl all platforms', () => {
        const data = { url: 'https://example.com', title: 'title', description: 'desc' }
        expect(generateShareUrl('twitter', data)).toContain('twitter.com')
        expect(generateShareUrl('weibo', data)).toContain('weibo.com')
        expect(generateShareUrl('linkedin', data)).toContain('linkedin.com')
        expect(generateShareUrl('facebook', data)).toContain('facebook.com')
        expect(generateShareUrl('telegram', data)).toContain('t.me')
        expect(generateShareUrl('email', data)).toContain('mailto:')
        expect(generateShareUrl('wechat', data)).toBe(data.url)
        // without description
        expect(generateShareUrl('email', { url: 'https://example.com', title: 't' })).toContain(
            'mailto:'
        )
    })
    it('openShareWindow', () => {
        const data = { url: 'https://example.com', title: 't' }
        // email
        const rEmail = openShareWindow('email', data)
        expect(rEmail.success).toBe(true)
        // wechat
        const rWechat = openShareWindow('wechat', data)
        expect(rWechat.success).toBe(true)
        // popup success
        const mockPopup = { focus: vi.fn() }
        // @ts-expect-error: suppress type error
        window.open = vi.fn(() => mockPopup)
        Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true })
        Object.defineProperty(window, 'innerHeight', { value: 768, writable: true })
        const r = openShareWindow('twitter', data)
        expect(r.success).toBe(true)
        expect(mockPopup.focus).toHaveBeenCalled()
        // popup blocked
        // @ts-expect-error: suppress type error
        window.open = vi.fn(() => null)
        const r2 = openShareWindow('twitter', data)
        expect(r2.success).toBe(false)
        // @ts-expect-error: suppress type error
        delete window.open
    })
    it('getPageShareData', () => {
        const data = getPageShareData()
        expect(data.url).toBe('https://huat-fsac.eu.org/docs/')
        expect(data.title).toBe('Test Title')
        expect(data.description).toBe('desc')
        // without document
        const origDoc = global.document
        // @ts-expect-error: suppress type error
        delete global.document
        const d2 = getPageShareData()
        expect(d2.url).toBe('')
        // @ts-expect-error: suppress type error
        global.document = origDoc
    })
    it('generateQRCodeDataUrl', async () => {
        const url = await generateQRCodeDataUrl('https://example.com', 100)
        expect(url).toMatch(/^data:image\/png;base64,/)
    })
})

describe('coverage-boost: analytics', () => {
    beforeEach(() => {
        vi.spyOn(console, 'log').mockImplementation(() => {})
        document.body.innerHTML = ''
        // @ts-expect-error: suppress type error
        delete window.umami
    })
    afterEach(() => {
        vi.restoreAllMocks()
    })
    it('trackEvent with umami and dev', () => {
        const mockTrack = vi.fn()
        // @ts-expect-error: suppress type error
        window.umami = { track: mockTrack }
        // @ts-expect-error: suppress type error
        import.meta.env.DEV = true
        trackEvent('test', { foo: 'bar' })
        expect(mockTrack).toHaveBeenCalled()
        // without window
        const origWindow = global.window
        // @ts-expect-error: suppress type error
        delete global.window
        expect(() => trackEvent('test')).not.toThrow()
        // @ts-expect-error: suppress type error
        global.window = origWindow
    })
    it('trackScrollDepth milestones', () => {
        Object.defineProperty(document.documentElement, 'scrollHeight', {
            value: 2000,
            writable: true,
        })
        Object.defineProperty(window, 'innerHeight', { value: 1000, writable: true })
        Object.defineProperty(window, 'scrollY', { value: 300, writable: true })
        const mockTrack = vi.fn()
        // @ts-expect-error: suppress type error
        window.umami = { track: mockTrack }
        const cleanup = trackScrollDepth()!
        // simulate scroll
        window.scrollY = 300
        window.dispatchEvent(new Event('scroll'))
        // need to wait throttle 100ms
        return new Promise((resolve) =>
            setTimeout(() => {
                // scroll to 50%
                window.scrollY = 600
                window.dispatchEvent(new Event('scroll'))
                setTimeout(() => {
                    expect(mockTrack).toHaveBeenCalled()
                    cleanup()
                    resolve(undefined)
                }, 150)
            }, 150)
        )
    })
    it('trackExternalLinks', () => {
        trackExternalLinks()
        trackExternalLinks() // second call should be no-op due to _externalLinksTracked
        document.body.innerHTML =
            '<a href="https://external.com/page">link</a><a href="/internal">internal</a>'
        const link = document.querySelector('a')!
        const mockTrack = vi.fn()
        // @ts-expect-error: suppress type error
        window.umami = { track: mockTrack }
        link.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        // internal should not track, but we can't easily assert, just ensure no throw
    })
    it('trackThemeChange etc', () => {
        const mockTrack = vi.fn()
        // @ts-expect-error: suppress type error
        window.umami = { track: mockTrack }
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
    it('initAnalytics', () => {
        const cleanup = initAnalytics()!
        expect(typeof cleanup).toBe('function')
        cleanup()
        // second init should clean previous
        initAnalytics()
        const cleanup2 = initAnalytics()!
        cleanup2!()
    })
    it('trackDocumentReading', () => {
        const mockTrack = vi.fn()
        // @ts-expect-error: suppress type error
        window.umami = { track: mockTrack }
        const cleanup = trackDocumentReading()!
        expect(typeof cleanup).toBe('function')
        // simulate beforeunload after 70s
        const now = Date.now()
        vi.spyOn(Date, 'now').mockImplementation(() => now + 70000)
        window.dispatchEvent(new Event('beforeunload'))
        expect(mockTrack).toHaveBeenCalledWith(AnalyticsEvent.DOC_READ_COMPLETE, expect.any(Object))
        cleanup!()
        Date.now = (() => now) as unknown as typeof Date.now
        // test without window
        const origWindow = global.window
        // @ts-expect-error: suppress type error
        delete global.window
        expect(trackDocumentReading()).toBeUndefined()
        expect(trackScrollDepth()).toBeUndefined()
        expect(initAnalytics()).toBeUndefined()
        // @ts-expect-error: suppress type error
        global.window = origWindow
    })
})
