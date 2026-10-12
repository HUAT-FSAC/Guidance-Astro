// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
    escapeHtml,
    getRelevanceScore,
    getSearchSuggestions,
    highlightMatch,
    initSearchSuggestions,
    renderSearchSuggestions,
} from '../../src/utils/search-suggestions'

vi.mock('../../src/utils/search-history', () => ({
    filterSearchHistory: vi.fn(() => []),
}))

describe('search-suggestions', () => {
    beforeEach(() => {
        vi.restoreAllMocks()
    })

    describe('getSearchSuggestions', () => {
        it('returns popular searches when query is empty', () => {
            const suggestions = getSearchSuggestions('')
            expect(suggestions.length).toBeGreaterThan(0)
            expect(suggestions[0].type).toBe('popular')
            expect(suggestions[0].query).toBe('ROS 入门')
        })

        it('limits the number of suggestions', () => {
            const suggestions = getSearchSuggestions('', 3)
            expect(suggestions.length).toBe(3)
        })

        it('filters popular searches by query', () => {
            const suggestions = getSearchSuggestions('ROS')
            expect(suggestions.length).toBeGreaterThan(0)
            expect(suggestions.every((s) => s.query.toLowerCase().includes('ros'))).toBe(true)
        })

        it('returns popular type for popular searches', () => {
            const suggestions = getSearchSuggestions('')
            expect(suggestions.every((s) => s.type === 'popular')).toBe(true)
        })

        it('assigns unique ids to suggestions', () => {
            const suggestions = getSearchSuggestions('')
            const ids = suggestions.map((s) => s.id)
            const uniqueIds = new Set(ids)
            expect(uniqueIds.size).toBe(ids.length)
        })

        it('handles Chinese query matching', () => {
            const suggestions = getSearchSuggestions('感知')
            expect(suggestions.length).toBeGreaterThan(0)
            expect(suggestions.some((s) => s.query.includes('感知'))).toBe(true)
        })

        it('returns empty array for non-matching query', () => {
            const suggestions = getSearchSuggestions('zzzzzzzzzzz')
            expect(suggestions.length).toBe(0)
        })

        it('sorts history suggestions first, then by timestamp, then by relevance', async () => {
            const searchHistoryModule = await import('../../src/utils/search-history')
            const spy = vi.spyOn(searchHistoryModule, 'filterSearchHistory').mockReturnValue([
                { id: '1', query: 'ROS 定位', timestamp: 1000 },
                { id: '2', query: 'ROS 高级', timestamp: 2000 },
            ])

            const suggestions = getSearchSuggestions('ROS')
            expect(suggestions[0].type).toBe('history')
            expect(suggestions[0].query).toBe('ROS 高级') // Higher timestamp
            expect(suggestions[1].query).toBe('ROS 定位')
            spy.mockReturnValue([])
        })
    })

    describe('renderSearchSuggestions and initSearchSuggestions', () => {
        beforeEach(() => {
            document.body.innerHTML = ''
        })

        it('renders empty message when no suggestions found', () => {
            const container = document.createElement('div')
            document.body.appendChild(container)

            renderSearchSuggestions(container, 'zzzzzzzzzzz', () => {})
            expect(container.innerHTML).toContain('search-suggestions-empty')
        })

        it('renders suggestions with icons and triggers onSelect when clicked', () => {
            const container = document.createElement('div')
            document.body.appendChild(container)

            const onSelect = vi.fn()
            renderSearchSuggestions(container, '', onSelect)

            const buttons = container.querySelectorAll('.search-suggestions-button')
            expect(buttons.length).toBeGreaterThan(0)
            ;(buttons[0] as HTMLButtonElement).click()
            expect(onSelect).toHaveBeenCalled()
        })

        it('handles keyboard navigation and clicks outside in initSearchSuggestions', () => {
            vi.useFakeTimers()
            const container = document.createElement('div')
            const input = document.createElement('input')
            document.body.appendChild(input)
            document.body.appendChild(container)

            const onSelect = vi.fn()
            const cleanup = initSearchSuggestions(input, container, onSelect)

            // Trigger input
            input.value = 'ROS'
            input.dispatchEvent(new Event('input'))
            vi.advanceTimersByTime(250)

            // ArrowDown
            input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
            const items = container.querySelectorAll('.search-suggestions-item')
            expect(items[0].classList.contains('active')).toBe(true)

            // ArrowUp wraps to last
            input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }))
            expect(items[items.length - 1].classList.contains('active')).toBe(true)

            // Enter triggers click on active
            input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
            expect(onSelect).toHaveBeenCalled()

            // Escape clears container
            input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
            expect(container.innerHTML).toBe('')

            // Click outside clears container
            input.value = 'ROS'
            input.dispatchEvent(new Event('input'))
            vi.advanceTimersByTime(250)
            expect(container.innerHTML).not.toBe('')

            document.dispatchEvent(new MouseEvent('click'))
            expect(container.innerHTML).toBe('')

            // Cleanup
            cleanup()
            vi.useRealTimers()
        })

        it('prioritizes history suggestions and de-dupes against popular', async () => {
            const searchHistoryModule = await import('../../src/utils/search-history')
            const spy = vi
                .spyOn(searchHistoryModule, 'filterSearchHistory')
                .mockImplementation((query: string) => {
                    if (query === 'test-history')
                        return [{ id: 'h1', query: 'test-history', timestamp: 1 }]
                    if (query === 'dedupe')
                        return [
                            { id: 'h2', query: 'dedupe one', timestamp: 2 },
                            { id: 'h3', query: 'dedupe two', timestamp: 1 },
                            { id: 'h4', query: 'dedupe zero', timestamp: 0 },
                        ]
                    if (query === 'overlap') return [{ id: 'h5', query: '感知', timestamp: 3 }]
                    return []
                })

            const historyFirst = getSearchSuggestions('test-history')
            expect(historyFirst[0].type).toBe('history')

            // two history items are ordered by timestamp, newest first
            const two = getSearchSuggestions('dedupe')
            expect(two[0].query).toBe('dedupe one')
            expect(two[1].query).toBe('dedupe two')
            expect(two[2].query).toBe('dedupe zero')

            // multiple popular matches exercise the relevance-score sort path
            const multi = getSearchSuggestions('o')
            expect(multi.length).toBeGreaterThan(1)
            expect(multi.every((s) => s.type === 'popular')).toBe(true)

            // '感知' exists in both history and popular -> exactly one entry
            const deduped = getSearchSuggestions('overlap')
            expect(deduped.filter((x) => x.query === '感知')).toHaveLength(1)

            spy.mockReturnValue([])
        })

        it('renders history type when history matches', async () => {
            const searchHistoryModule = await import('../../src/utils/search-history')
            const spy = vi
                .spyOn(searchHistoryModule, 'filterSearchHistory')
                .mockReturnValue([{ id: 'h1', query: 'test-history', timestamp: 1 }])

            const container = document.createElement('div')
            document.body.appendChild(container)
            renderSearchSuggestions(container, 'test-history', vi.fn())
            expect(container.innerHTML).toContain('历史')
            spy.mockReturnValue([])
        })

        it('moves active state across multiple items on ArrowDown', () => {
            vi.useFakeTimers()
            const container = document.createElement('div')
            const input = document.createElement('input')
            document.body.appendChild(input)
            document.body.appendChild(container)

            const cleanup = initSearchSuggestions(input, container, vi.fn())
            input.value = ''
            input.dispatchEvent(new Event('input'))
            vi.advanceTimersByTime(250)

            const items = container.querySelectorAll('.search-suggestions-item')
            expect(items.length).toBeGreaterThan(1)
            input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }))
            expect(items[0].classList.contains('active')).toBe(true)
            expect(items[1].classList.contains('active')).toBe(false)

            cleanup()
            vi.useRealTimers()
            input.remove()
            container.remove()
        })

        it('scores relevance by match tier', () => {
            expect(getRelevanceScore('hello', 'hello')).toBe(100)
            expect(getRelevanceScore('hello world', 'hello')).toBe(90)
            expect(getRelevanceScore('say hello', 'hello')).toBe(80)
            expect(getRelevanceScore('xyz', 'hello')).toBe(70)
            expect(getRelevanceScore('HELLO', 'hello')).toBe(100) // case-insensitive
        })

        it('highlights matches and escapes html', () => {
            expect(highlightMatch('hello world', '')).toBe('hello world')
            expect(highlightMatch('hello world', '   ')).toBe('hello world')
            expect(highlightMatch('hello world', 'xyz')).toBe('hello world')
            expect(highlightMatch('hello world', 'hello')).toContain('<mark')
            expect(highlightMatch('hello hello', 'hello')).toContain('<mark')
            expect(escapeHtml('<script>alert(1)</script>')).not.toContain('<script>')
            expect(escapeHtml('a & b')).toContain('&amp;')
        })
    })
})
