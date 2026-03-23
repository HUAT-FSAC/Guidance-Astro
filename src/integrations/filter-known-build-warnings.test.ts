import { describe, expect, it } from 'vitest'

import { shouldFilterBuildWarning } from './filter-known-build-warnings'

describe('shouldFilterBuildWarning', () => {
    it('filters the known Starlight 404 lookup warning', () => {
        expect(shouldFilterBuildWarning(['Entry docs → 404 was not found.'])).toBe(true)
    })

    it('does not filter unrelated warnings', () => {
        expect(shouldFilterBuildWarning(['Entry docs → index was not found.'])).toBe(false)
        expect(
            shouldFilterBuildWarning(['Automatically externalized node built-in module "crypto".'])
        ).toBe(false)
        expect(shouldFilterBuildWarning(['Entry docs → 404 was not found.', 'extra'])).toBe(false)
    })
})
