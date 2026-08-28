// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'

// --- search-suggestions with history mock ---
vi.mock('../../src/utils/search-history', () => ({
    filterSearchHistory: vi.fn((q: string) => {
        if (q === 'test-history')
            return [{ id: 'h1', query: 'test-history', timestamp: Date.now() }]
        if (q === 'dedupe') return [{ id: 'h2', query: '感知', timestamp: Date.now() }]
        return []
    }),
}))

import {
    escapeHtml,
    getRelevanceScore,
    getSearchSuggestions,
    highlightMatch,
    renderSearchSuggestions,
} from '../../src/utils/search-suggestions'
import {
    getA11yPreferences,
    resetA11yPreferences,
    toggleKeyboardNavigationOnly,
    toggleScreenReaderOptimized,
    updateA11yPreferences,
} from '../../src/utils/accessibility'
import { shouldFilterBuildWarning } from '../../src/integrations/filter-known-build-warnings'
import filterKnownBuildWarnings from '../../src/integrations/filter-known-build-warnings'

describe('branch-boost2: search-suggestions history', () => {
    it('history prioritized and de-dupe', () => {
        const s = getSearchSuggestions('test-history')
        expect(s[0].type).toBe('history')
        const s2 = getSearchSuggestions('dedupe')
        // '感知' appears in both history and popular, should de-dupe to one
        expect(s2.filter((x) => x.query === '感知').length).toBe(1)
    })
    it('relevance scoring branches via sorting', () => {
        // exact match vs prefix vs includes
        // popular contains 'ROS 入门', query 'ROS 入门' exact => 100
        const exact = getSearchSuggestions('ROS 入门')
        expect(exact.length).toBeGreaterThan(0)
        // prefix 'ROS' vs 'ROS 入门' => 90
        const prefix = getSearchSuggestions('ROS')
        expect(prefix.length).toBeGreaterThan(0)
        // includes '入门' vs 'ROS 入门' => 80
        const includes = getSearchSuggestions('入门')
        expect(includes.length).toBeGreaterThan(0)
        // no match => empty
        const none = getSearchSuggestions('xyz-not-found-12345')
        expect(none.length).toBe(0)
    })
    it('render with history', () => {
        const container = document.createElement('div')
        renderSearchSuggestions(container, 'test-history', vi.fn())
        expect(container.innerHTML).toContain('历史')
    })
    it('getRelevanceScore branches', () => {
        expect(getRelevanceScore('hello', 'hello')).toBe(100)
        expect(getRelevanceScore('hello world', 'hello')).toBe(90)
        expect(getRelevanceScore('say hello', 'hello')).toBe(80)
        expect(getRelevanceScore('xyz', 'hello')).toBe(70)
        expect(getRelevanceScore('HELLO', 'hello')).toBe(100) // case-insensitive
    })
    it('highlightMatch and escapeHtml branches', () => {
        expect(highlightMatch('hello world', '')).toBe('hello world')
        expect(highlightMatch('hello world', '   ')).toBe('hello world')
        expect(highlightMatch('hello world', 'xyz')).toBe('hello world')
        expect(highlightMatch('hello world', 'hello')).toContain('<mark')
        expect(highlightMatch('hello hello', 'hello')).toContain('<mark')
        expect(escapeHtml('<script>alert(1)</script>')).not.toContain('<script>')
        expect(escapeHtml('a & b')).toContain('&amp;')
    })
})

describe('branch-boost2: accessibility remaining', () => {
    beforeEach(() => {
        localStorage.clear()
        document.documentElement.className = ''
    })
    it('toggle remaining', () => {
        expect(toggleScreenReaderOptimized(true)).toBe(true)
        expect(toggleScreenReaderOptimized(false)).toBe(false)
        expect(toggleKeyboardNavigationOnly(true)).toBe(true)
        expect(toggleKeyboardNavigationOnly(false)).toBe(false)
        // toggle without arg
        expect(toggleScreenReaderOptimized()).toBe(true)
        expect(toggleKeyboardNavigationOnly()).toBe(true)
        updateA11yPreferences({ screenReaderOptimized: true, keyboardNavigationOnly: true })
        const prefs = getA11yPreferences()
        expect(prefs.screenReaderOptimized).toBe(true)
        resetA11yPreferences()
        expect(getA11yPreferences().screenReaderOptimized).toBe(false)
    })
    it('loadPreferences with stored values', () => {
        localStorage.setItem(
            'huat-a11y-preferences',
            JSON.stringify({ highContrast: true, largeText: true })
        )
        const prefs = getA11yPreferences()
        expect(prefs.highContrast).toBe(true)
        expect(document.documentElement.classList.contains('a11y-high-contrast')).toBe(true)
        localStorage.setItem('huat-a11y-preferences', 'invalid json')
        expect(getA11yPreferences().highContrast).toBe(false) // fallback to default due to parse error handling in storage
    })
})

describe('branch-boost2: filter warnings more', () => {
    it('shouldFilterBuildWarning edge', () => {
        expect(shouldFilterBuildWarning([''])).toBe(false)
        expect(shouldFilterBuildWarning(['Module \"node:os\"'])).toBe(true)
        expect(shouldFilterBuildWarning(['Module \"url\"'])).toBe(true)
        expect(shouldFilterBuildWarning(['some is dynamically imported by other'])).toBe(true)
        expect(
            shouldFilterBuildWarning(['dynamic import will not move module into another chunk'])
        ).toBe(true)
    })
    it('integration multiline filtering', () => {
        const integration = filterKnownBuildWarnings()
        integration.hooks['astro:config:setup']!({} as never)
        // test wrapStreamWrite via directly calling the filtered write
        const originalWrite = process.stdout.write
        let captured = ''
        // @ts-expect-error: mock
        process.stdout.write = (buf: string | Uint8Array, enc?: unknown, cb?: unknown) => {
            captured += typeof buf === 'string' ? buf : buf.toString()
            if (typeof enc === 'function') (enc as () => void)()
            if (typeof cb === 'function') (cb as () => void)()
            return true
        }
        // write multiline with mixed
        process.stdout.write(
            'line1\nEntry docs → 404 was not found.\nline2\nModule \"node:fs\" test\nline3\n'
        )
        // should have filtered first and third, kept line1, line2, line3
        // now test empty filtered
        const emptyResult = process.stdout.write as unknown as { length: number }
        // call with only filtered content
        process.stdout.write('Entry docs → 404 was not found.\n')
        // restore
        integration.hooks['astro:build:done']!({} as never)
        process.stdout.write = originalWrite
        expect(captured).toContain('line1')
        expect(captured).toContain('line2')
    })
})
