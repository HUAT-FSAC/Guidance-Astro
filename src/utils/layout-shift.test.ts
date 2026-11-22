import { describe, expect, it } from 'vitest'
import { createClsTracker } from './layout-shift'

describe('CLS session windows', () => {
    it('keeps the largest window and ignores recent input without bridging a one-second gap', () => {
        const track = createClsTracker()

        expect(track([])).toBe(0)
        expect(
            track([
                { startTime: 0, value: 0.08 },
                { startTime: 900, value: 0.06 },
            ])
        ).toBeCloseTo(0.14)
        expect(
            track([
                { startTime: 1500, value: 0.8, hadRecentInput: true },
                { startTime: 1900, value: 0.12 },
            ])
        ).toBeCloseTo(0.14)
    })

    it('starts a new window at five seconds even while shifts remain less than a second apart', () => {
        const track = createClsTracker()
        const firstWindow = [0, 900, 1800, 2700, 3600, 4500].map((startTime) => ({
            startTime,
            value: 0.1,
        }))

        expect(track(firstWindow)).toBeCloseTo(0.6)
        expect(track([{ startTime: 5000, value: 0.4 }])).toBeCloseTo(0.6)
        expect(track([{ startTime: 5900, value: 0.3 }])).toBeCloseTo(0.7)
    })
})
