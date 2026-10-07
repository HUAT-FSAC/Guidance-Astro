import { describe, expect, it } from 'vitest'

import { getTranslations } from '../../src/utils/i18n'

const CJK = /[\u4e00-\u9fff]/

type Translations = ReturnType<typeof getTranslations>

// #204 新增词表段：a11y（ThemeToggle / ImageLightbox）与英文站可见文案
// （ErrorBoundary / ReadingProgress / CarsShowcase / Video / ImageCompare）
const NEW_SECTIONS = {
    lightbox: (t: Translations) => t.docs.lightbox,
    imageCompare: (t: Translations) => t.docs.imageCompare,
    video: (t: Translations) => t.docs.video,
    errorBoundary: (t: Translations) => t.errors.boundary,
    showcaseCars: (t: Translations) => t.showcase.cars,
} as const

function deepKeys(value: unknown, prefix = ''): string[] {
    if (value === null || typeof value !== 'object') return [prefix]
    return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
        deepKeys(child, prefix ? `${prefix}.${key}` : key)
    )
}

describe('ui copy i18n (#204)', () => {
    it('localizes the theme toggle aria-label via the existing accessibility dictionary', () => {
        expect(getTranslations('zh').accessibility.toggleTheme).toBe('切换主题')
        expect(getTranslations('en').accessibility.toggleTheme).toBe('Toggle theme')
    })

    it('keeps the zh lightbox labels unchanged and serves english ones on en', () => {
        const zh = getTranslations('zh').docs.lightbox
        const en = getTranslations('en').docs.lightbox

        expect(zh.dialog).toBe('图片预览')
        expect(zh.close).toBe('关闭')
        expect(zh.prev).toBe('上一张')
        expect(zh.next).toBe('下一张')
        expect(en.dialog).toBe('Image preview')
        expect(en.close).toBe('Close')
        expect(en.prev).toBe('Previous image')
        expect(en.next).toBe('Next image')
    })

    it('localizes the doc floating actions share button aria-label', () => {
        expect(getTranslations('zh').docs.social.sharePage).toBe('分享此页面')
        expect(getTranslations('en').docs.social.sharePage).toBe('Share this page')
    })

    it('keeps the zh error boundary copy unchanged and serves english ones on en', () => {
        const zh = getTranslations('zh').errors.boundary
        const en = getTranslations('en').errors.boundary

        expect(zh.defaultFallback).toBe('组件加载失败，请刷新页面重试。')
        expect(zh.badgeRecoverable).toBe('可恢复')
        expect(zh.badgeFatal).toBe('严重错误')
        expect(zh.title).toBe('出错了')
        expect(zh.titleFatal).toBe('发生严重错误')
        expect(zh.detailsTitle).toBe('错误详情')
        expect(zh.tryRecover).toBe('尝试恢复')
        expect(zh.reloadPage).toBe('刷新页面')
        expect(zh.report).toBe('报告问题')
        expect(en.badgeRecoverable).toBe('Recoverable')
        expect(en.badgeFatal).toBe('Fatal error')
        expect(en.title).toBe('Something went wrong')
        expect(en.titleFatal).toBe('A critical error occurred')
        expect(en.detailsTitle).toBe('Error details')
        expect(en.reportSubject).toBe('Website error report')
    })

    it('keeps the {n} placeholder in both reading time templates and interpolates', () => {
        const zh = getTranslations('zh').docs.readingTime
        const en = getTranslations('en').docs.readingTime

        expect(zh).toBe('约 {n} 分钟阅读')
        expect(en).toBe('About {n} min read')
        expect(zh.replace('{n}', '7')).toBe('约 7 分钟阅读')
        expect(en.replace('{n}', '7')).not.toMatch(CJK)
    })

    it('localizes the cars showcase headings, tab aria-label and alt template', () => {
        const zh = getTranslations('zh').showcase.cars
        const en = getTranslations('en').showcase.cars

        expect(zh.yearTabsAria).toBe('选择赛车年份')
        expect(zh.coreTech).toBe('核心技术')
        expect(zh.seasonResults).toBe('赛季成绩')
        expect(zh.evolution).toBe('技术演进')
        expect(en.yearTabsAria).toBe('Select racing car year')
        expect(en.coreTech).toBe('Core Technology')
        expect(en.seasonResults).toBe('Season Results')
        expect(en.evolution).toBe('Technical Evolution')

        for (const tpl of [zh.carAlt, en.carAlt]) {
            expect(tpl).toContain('{year}')
            expect(tpl).toContain('{nickname}')
        }
        expect(zh.carAlt.replace('{year}', '2024').replace('{nickname}', '疾风')).toBe(
            '2024 赛车 疾风'
        )
    })

    it('keeps zh video and image compare defaults unchanged and english on en', () => {
        const zhVideo = getTranslations('zh').docs.video
        const enVideo = getTranslations('en').docs.video
        const zhCompare = getTranslations('zh').docs.imageCompare
        const enCompare = getTranslations('en').docs.imageCompare

        expect(zhVideo.fallback).toBe('您的浏览器不支持 video 标签。')
        expect(zhVideo.bilibili).toBe('B 站视频')
        expect(enVideo.fallback).toBe('Your browser does not support the video tag.')
        expect(enVideo.bilibili).toBe('Bilibili video')
        expect(zhCompare.before).toBe('之前')
        expect(zhCompare.after).toBe('之后')
        expect(zhCompare.alt).toBe('图片对比')
        expect(enCompare.before).toBe('Before')
        expect(enCompare.after).toBe('After')
        expect(enCompare.alt).toBe('Image comparison')
    })

    it('keeps en and zh key sets in sync across every new section', () => {
        for (const [name, pick] of Object.entries(NEW_SECTIONS)) {
            const zhKeys = deepKeys(pick(getTranslations('zh'))).sort()
            const enKeys = deepKeys(pick(getTranslations('en'))).sort()
            expect(enKeys, `section ${name}`).toEqual(zhKeys)
            expect(zhKeys.length).toBeGreaterThan(0)
        }
        // 顶层散键：docs.social.sharePage / docs.readingTime
        expect(deepKeys(getTranslations('zh').docs.readingTime)).toEqual(
            deepKeys(getTranslations('en').docs.readingTime)
        )
    })

    it('leaves no chinese copy in the english dictionaries of the new sections', () => {
        for (const [name, pick] of Object.entries(NEW_SECTIONS)) {
            const offenders = deepKeys(pick(getTranslations('en'))).filter((key) => {
                const value = key
                    .split('.')
                    .reduce<unknown>(
                        (node, part) => (node as Record<string, unknown> | undefined)?.[part],
                        pick(getTranslations('en')) as unknown
                    )
                return typeof value === 'string' && CJK.test(value)
            })
            expect(offenders, `section ${name}`).toEqual([])
        }
    })
})
