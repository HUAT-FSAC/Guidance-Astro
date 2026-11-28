import { docsLoader, i18nLoader } from '@astrojs/starlight/loaders'
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema'
import { defineCollection } from 'astro:content'

const uiTranslationsSchema = i18nSchema()

export type StarlightTranslationKey = keyof typeof uiTranslationsSchema.shape
export type StarlightTranslations = ReturnType<typeof uiTranslationsSchema.parse>

export const collections = {
    docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
    i18n: defineCollection({ loader: i18nLoader(), schema: uiTranslationsSchema }),
}
