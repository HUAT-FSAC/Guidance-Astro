import { describe, expect, it } from 'vitest'

import { getHomeContent } from '../../src/data/home'

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
})
