/**
 * HUAT FSAC 国际化工具模块
 * 提供多语言支持功能
 */

import enTranslations from '../content/i18n/en.json'
import zhTranslations from '../content/i18n/zh.json'

export type Locale = 'en' | 'zh'

export const defaultLocale: Locale = 'zh'

export const locales: Locale[] = ['zh', 'en']

export const localeNames: Record<Locale, string> = {
    zh: '中文',
    en: 'English',
}

type TranslationData = typeof zhTranslations

const translations: Record<Locale, TranslationData> = {
    en: enTranslations,
    zh: zhTranslations,
}

/**
 * 获取指定语言的翻译对象
 */
export function getTranslations(locale: Locale = defaultLocale): TranslationData {
    return translations[locale] || translations[defaultLocale]
}

/**
 * 根据键路径获取翻译文本
 * @param locale 语言代码
 * @param key 键路径，如 "nav.home" 或 "hero.title"
 * @param fallback 未找到时的默认值
 */
export function t(locale: Locale, key: string, fallback?: string): string {
    const trans = getTranslations(locale)
    const keys = key.split('.')

    let result: unknown = trans
    for (const k of keys) {
        if (result && typeof result === 'object' && k in result) {
            result = (result as Record<string, unknown>)[k]
        } else {
            return fallback || key
        }
    }

    return typeof result === 'string' ? result : fallback || key
}

/**
 * 从 URL 路径中获取语言代码
 */
export function getLocaleFromPath(pathname: string): Locale {
    const segments = pathname.split('/').filter(Boolean)
    const firstSegment = segments[0]

    if (firstSegment && locales.includes(firstSegment as Locale)) {
        return firstSegment as Locale
    }

    return defaultLocale
}

/**
 * 生成多语言路径
 */
export function localePath(path: string, locale: Locale): string {
    // 移除开头的斜杠
    const cleanPath = path.startsWith('/') ? path.slice(1) : path

    // 如果是默认语言（中文），不添加语言前缀
    if (locale === defaultLocale) {
        return `/${cleanPath}`
    }

    // 其他语言添加前缀
    return `/${locale}/${cleanPath}`
}

/**
 * 获取当前路径的其他语言版本
 */
export function getAlternateLocales(
    pathname: string,
    currentLocale: Locale
): Array<{ locale: Locale; path: string; name: string }> {
    // 移除当前语言前缀
    let cleanPath = pathname
    for (const locale of locales) {
        if (pathname.startsWith(`/${locale}/`)) {
            cleanPath = pathname.slice(locale.length + 1)
            break
        }
    }

    return locales
        .filter((locale) => locale !== currentLocale)
        .map((locale) => ({
            locale,
            path: localePath(cleanPath, locale),
            name: localeNames[locale],
        }))
}

/**
 * 检查浏览器偏好语言
 */
export function getBrowserLocale(): Locale {
    if (typeof navigator === 'undefined') {
        return defaultLocale
    }

    const browserLang = navigator.language.toLowerCase()

    if (browserLang.startsWith('zh')) {
        return 'zh'
    }
    if (browserLang.startsWith('en')) {
        return 'en'
    }

    return defaultLocale
}
