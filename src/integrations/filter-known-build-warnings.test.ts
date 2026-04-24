import { describe, expect, it } from 'vitest'

import { shouldFilterBuildWarning } from './filter-known-build-warnings'

describe('shouldFilterBuildWarning', () => {
    it('filters the known Starlight 404 lookup warning', () => {
        expect(shouldFilterBuildWarning(['Entry docs → 404 was not found.'])).toBe(true)
    })

    it('filters route conflict warnings', () => {
        expect(
            shouldFilterBuildWarning([
                'Could not render `/en/docs-center/入门` from route `/[...slug]` as it conflicts with higher priority route `/en/docs-center/入门`.',
            ])
        ).toBe(true)
    })

    it('filters node module warnings', () => {
        expect(shouldFilterBuildWarning(['Module "node:crypto" has been externalized.'])).toBe(true)
    })

    it('does not filter unrelated warnings', () => {
        expect(shouldFilterBuildWarning(['Entry docs → index was not found.'])).toBe(false)
        expect(
            shouldFilterBuildWarning(['Automatically externalized node built-in module "crypto".'])
        ).toBe(false)
    })
})
