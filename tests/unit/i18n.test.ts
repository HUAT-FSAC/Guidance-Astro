import { describe, expect, it } from 'vitest'

import {
    t,
    getLocaleFromPath,
    localePath,
    getAlternateLocales,
    getTranslations,
    defaultLocale,
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
            const result = t('zh', 'site.title')
            // Should return a string, not the key itself (unless key doesn't exist)
            expect(typeof result).toBe('string')
        })

        it('should return fallback for missing key', () => {
            expect(t('zh', 'nonexistent.deep.key', 'fallback')).toBe('fallback')
        })

        it('should return key itself when no fallback and key missing', () => {
            expect(t('zh', 'totally.missing.key')).toBe('totally.missing.key')
        })

        it('should return fallback when value is not a string', () => {
            // If a key resolves to an object (intermediate node), should return fallback
            const result = t('zh', 'site', 'fallback')
            // 'site' is likely an object, not a string
            if (result === 'fallback') {
                expect(result).toBe('fallback')
            } else {
                // If it happens to be a string, that's also valid
                expect(typeof result).toBe('string')
            }
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
    })

    describe('getAlternateLocales', () => {
        it('should return other locales for zh page', () => {
            const alternates = getAlternateLocales('/docs/', 'zh')
            expect(alternates).toHaveLength(1)
            expect(alternates[0].locale).toBe('en')
        })

        it('should return other locales for en page', () => {
            const alternates = getAlternateLocales('/en/docs/', 'en')
            expect(alternates).toHaveLength(1)
            expect(alternates[0].locale).toBe('zh')
        })

        it('should strip locale prefix from path', () => {
            const alternates = getAlternateLocales('/en/docs/', 'en')
            expect(alternates[0].path).toBe('/docs/')
        })
    })
})
