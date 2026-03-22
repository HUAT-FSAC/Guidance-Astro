import { describe, expect, it } from 'vitest'

import {
    defaultLocale,
    getAlternateLocales,
    getLocaleFromPath,
    getTranslations,
    localePath,
    t,
} from '../../src/utils/i18n'

describe('i18n', () => {
    describe('getTranslations', () => {
        it('should return zh translations by default', () => {
            const trans = getTranslations()
            expect(trans).toBeDefined()
            expect(typeof trans).toBe('object')
        })

        it('should return en translations', () => {
            const trans = getTranslations('en')
            expect(trans).toBeDefined()
        })

        it('should fallback to default for unknown locale', () => {
            const trans = getTranslations('xx' as 'en')
            expect(trans).toEqual(getTranslations(defaultLocale))
        })
    })

    describe('t', () => {
        it('should resolve dot-separated key path', () => {
            expect(t('zh', 'nav.home')).toBe('首页')
        })

        it('should resolve english key path', () => {
            expect(t('en', 'nav.home')).toBe('Home')
        })

        it('should return fallback for missing key', () => {
            expect(t('zh', 'nonexistent.deep.key', 'fallback')).toBe('fallback')
        })

        it('should return key itself when no fallback and key missing', () => {
            expect(t('zh', 'totally.missing.key')).toBe('totally.missing.key')
        })

        it('should return fallback when value is not a string', () => {
            expect(t('zh', 'nav', 'fallback')).toBe('fallback')
        })
    })

    describe('getLocaleFromPath', () => {
        it('should detect en from /en/docs/', () => {
            expect(getLocaleFromPath('/en/docs/')).toBe('en')
        })

        it('should detect zh from /zh/docs/', () => {
            expect(getLocaleFromPath('/zh/docs/')).toBe('zh')
        })

        it('should return default locale for paths without locale prefix', () => {
            expect(getLocaleFromPath('/docs-center/')).toBe(defaultLocale)
        })

        it('should return default locale for root path', () => {
            expect(getLocaleFromPath('/')).toBe(defaultLocale)
        })
    })

    describe('localePath', () => {
        it('should not add prefix for default locale', () => {
            expect(localePath('/docs/', 'zh')).toBe('/docs/')
        })

        it('should add /en/ prefix for English', () => {
            expect(localePath('/docs/', 'en')).toBe('/en/docs/')
        })

        it('should handle paths without leading slash', () => {
            expect(localePath('docs/', 'en')).toBe('/en/docs/')
        })

        it('should return / for default root path', () => {
            expect(localePath('/', 'zh')).toBe('/')
        })

        it('should return /en/ for english root path', () => {
            expect(localePath('/', 'en')).toBe('/en/')
        })
    })

    describe('getAlternateLocales', () => {
        it('should return other locales for zh page', () => {
            const alternates = getAlternateLocales('/docs/', 'zh')
            expect(alternates).toHaveLength(1)
            expect(alternates[0].locale).toBe('en')
            expect(alternates[0].path).toBe('/en/docs/')
        })

        it('should return other locales for en page', () => {
            const alternates = getAlternateLocales('/en/docs/', 'en')
            expect(alternates).toHaveLength(1)
            expect(alternates[0].locale).toBe('zh')
            expect(alternates[0].path).toBe('/docs/')
        })

        it('should map root page alternates correctly', () => {
            const zhAlternates = getAlternateLocales('/', 'zh')
            expect(zhAlternates[0].path).toBe('/en/')

            const enAlternates = getAlternateLocales('/en/', 'en')
            expect(enAlternates[0].path).toBe('/')
        })
    })
})
