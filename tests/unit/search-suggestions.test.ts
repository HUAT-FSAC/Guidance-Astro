import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getSearchSuggestions } from '../../src/utils/search-suggestions'

vi.mock('../../src/utils/search-history', () => ({
    filterSearchHistory: vi.fn(() => []),
}))

describe('search-suggestions', () => {
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
    })
})
