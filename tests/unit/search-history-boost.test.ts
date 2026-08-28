// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
    addSearchHistory,
    clearSearchHistory,
    filterSearchHistory,
    formatSearchTime,
    getSearchHistory,
    removeSearchHistory,
} from '../../src/utils/search-history'

describe('search-history-boost', () => {
    beforeEach(() => {
        localStorage.clear()
        clearSearchHistory()
        vi.spyOn(Date, 'now').mockImplementation(() => 1000000)
    })
    afterEach(() => {
        vi.restoreAllMocks()
        clearSearchHistory()
    })
    it('add and get', () => {
        addSearchHistory('  ROS  ')
        addSearchHistory('ROS')
        const h = getSearchHistory()
        expect(h.length).toBe(1)
        expect(h[0].query).toBe('ROS')
    })
    it('add empty ignored', () => {
        addSearchHistory('')
        addSearchHistory('   ')
        expect(getSearchHistory().length).toBe(0)
    })
    it('dedupe case-insensitive and limit 20', () => {
        for (let i = 0; i < 25; i++) addSearchHistory(`q${i}`)
        expect(getSearchHistory().length).toBe(20)
        addSearchHistory('Q1')
        const h = getSearchHistory()
        expect(h[0].query).toBe('Q1')
        expect(h.filter((x) => x.query.toLowerCase() === 'q1').length).toBe(1)
    })
    it('remove and clear', () => {
        addSearchHistory('a')
        addSearchHistory('b')
        const h = getSearchHistory()
        removeSearchHistory(h[0].id)
        expect(getSearchHistory().length).toBe(1)
        clearSearchHistory()
        expect(getSearchHistory().length).toBe(0)
    })
    it('filter', () => {
        addSearchHistory('感知')
        addSearchHistory('规划')
        expect(filterSearchHistory('感知').length).toBe(1)
        expect(filterSearchHistory('').length).toBe(2)
        expect(filterSearchHistory('   ').length).toBe(2)
        expect(filterSearchHistory('不存在').length).toBe(0)
    })
    it('formatSearchTime', () => {
        const now = Date.now()
        expect(formatSearchTime(now - 30 * 1000)).toBe('刚刚')
        expect(formatSearchTime(now - 5 * 60 * 1000)).toContain('分钟前')
        expect(formatSearchTime(now - 2 * 60 * 60 * 1000)).toContain('小时前')
        expect(formatSearchTime(now - 2 * 24 * 60 * 60 * 1000)).toMatch(/\d+月\d+日|\d+\/\d+/)
    })
    it('handles storage parse error', () => {
        localStorage.setItem('huat-search-history', 'invalid json')
        expect(getSearchHistory()).toEqual([])
        // filter should also handle
        expect(filterSearchHistory('a')).toEqual([])
    })
})
