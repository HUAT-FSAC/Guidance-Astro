import { describe, expect, it } from 'vitest'

import { getTranslations, localeNames } from '../../src/utils/i18n'

const CJK = /[\u4e00-\u9fff]/

function breadcrumbPaths(locale: 'en' | 'zh') {
    return getTranslations(locale).docs.breadcrumbs.paths
}

describe('breadcrumbs i18n', () => {
    it('resolves the same url segment to locale-specific labels', () => {
        const zh = breadcrumbPaths('zh')
        const en = breadcrumbPaths('en')

        expect(zh['sensing']).toBe('感知')
        expect(en['sensing']).toBe('Sensing')
        expect(zh['docs-center']).toBe('文档中心')
        expect(en['docs-center']).toBe('Documentation Center')
        expect(zh['ros-installing']).toBe('ROS 安装')
        expect(en['ros-installing']).toBe('ROS Installation')
    })

    it('keeps the zh labels unchanged from the pre-i18n mapping', () => {
        const zh = breadcrumbPaths('zh')

        expect(zh['2024-learning-roadmap']).toBe('2024 学习路线')
        expect(zh['localization-mapping']).toBe('定位建图')
        expect(zh['archive']).toBe('文档归档')
        expect(zh['入门']).toBe('入门指南')
        expect(zh['onboarding']).toBe('入门')
    })

    it('keeps en and zh path label keys in sync', () => {
        const zhKeys = Object.keys(breadcrumbPaths('zh')).sort()
        const enKeys = Object.keys(breadcrumbPaths('en')).sort()

        expect(enKeys).toEqual(zhKeys)
        expect(zhKeys.length).toBeGreaterThan(60)
    })

    it('leaves no chinese label in the english dictionary', () => {
        const offenders = Object.entries(breadcrumbPaths('en')).filter(([, label]) =>
            CJK.test(label)
        )

        expect(offenders).toEqual([])
    })

    it('provides a localized breadcrumb aria-label', () => {
        expect(getTranslations('zh').docs.breadcrumbs.ariaLabel).toBe('面包屑导航')
        expect(getTranslations('en').docs.breadcrumbs.ariaLabel).toBe('Breadcrumbs')
    })

    it('serves the home crumb and locale crumbs from shared dictionaries', () => {
        expect(getTranslations('zh').nav.home).toBe('首页')
        expect(getTranslations('en').nav.home).toBe('Home')
        // locale 前缀面包屑显示语言自称，与页面 locale 无关（沿用迁移前行为）
        expect(localeNames.en).toBe('English')
        expect(localeNames.zh).toBe('中文')
    })
})
