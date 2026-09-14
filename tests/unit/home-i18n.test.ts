import { describe, expect, it } from 'vitest'

import {
    getHomeContent,
    getRaceEvents,
    getSponsorGroups,
    raceEvents,
    sponsorGroups,
} from '../../src/data/home'

describe('home i18n', () => {
    it('returns chinese home content by default', () => {
        const content = getHomeContent('zh')
        expect(content.hero.title).toBe('HUAT FSAC')
        expect(content.hero.subtitle).toContain('方程式')
        expect(content.sectionHeaders.features.title).toContain('核心模块')
    })

    it('returns english home content', () => {
        const content = getHomeContent('en')
        expect(content.hero.subtitle).toContain('Formula Student')
        expect(content.hero.ctaText).toBe('Start Exploring')
        expect(content.sectionHeaders.features.title).toContain('Core Modules')
    })

    it('keeps locale-specific labels distinct', () => {
        const zh = getHomeContent('zh')
        const en = getHomeContent('en')

        expect(zh.sectionHeaders.features.label).not.toBe(en.sectionHeaders.features.label)
        expect(zh.newsItems[0].title).not.toBe(en.newsItems[0].title)
    })

    it('returns localized sponsor groups and falls back when En is missing', () => {
        const defaultGroups = getSponsorGroups()
        const zhGroups = getSponsorGroups('zh')
        const enGroups = getSponsorGroups('en')

        expect(defaultGroups[0].name).toBe('核心赞助')
        expect(zhGroups[0].name).toBe('核心赞助')
        expect(enGroups[0].name).toBe('Core Sponsors')
        expect(zhGroups[0].items[0].title).toBe('湖北汽车工业学院')
        expect(enGroups[0].items[0].title).toBe('Hubei University of Automotive Technology')

        // Test fallback branches
        const originalGroups = [...sponsorGroups]
        sponsorGroups.push({
            name: '测试赞助',
            items: [{ title: '测试企业', logo: '/assets/test.png' }],
        })
        try {
            const fallbackResult = getSponsorGroups('en')
            const lastGroup = fallbackResult[fallbackResult.length - 1]
            expect(lastGroup.name).toBe('测试赞助')
            expect(lastGroup.items[0].title).toBe('测试企业')
        } finally {
            sponsorGroups.length = originalGroups.length
        }
    })

    it('returns localized race events and falls back when En is missing', () => {
        const defaultEvents = getRaceEvents()
        const zhEvents = getRaceEvents('zh')
        const enEvents = getRaceEvents('en')

        expect(defaultEvents[0].name).toBe('中国大学生方程式系列赛 2025')
        expect(zhEvents[0].name).toBe('中国大学生方程式系列赛 2025')
        expect(enEvents[0].name).toBe('Formula Student China 2025')
        expect(zhEvents[0].location).toBe('上海国际赛车场')
        expect(enEvents[0].location).toBe('Shanghai International Circuit')

        // Test fallback branches
        const originalEvents = [...raceEvents]
        raceEvents.push({
            name: '备用赛事',
            abbr: 'FSC TEST',
            location: '测试赛道',
            startDate: '2026-10-01',
            endDate: '2026-10-03',
        })
        try {
            const fallbackResult = getRaceEvents('en')
            const lastEvent = fallbackResult[fallbackResult.length - 1]
            expect(lastEvent.name).toBe('备用赛事')
            expect(lastEvent.location).toBe('测试赛道')
        } finally {
            raceEvents.length = originalEvents.length
        }
    })
})
