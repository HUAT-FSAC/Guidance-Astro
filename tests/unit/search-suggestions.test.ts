// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
    getSearchSuggestions,
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
    })
})
