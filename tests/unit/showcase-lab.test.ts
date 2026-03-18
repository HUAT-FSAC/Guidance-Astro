import { describe, expect, it } from 'vitest'

import {
    showcaseScenarios,
    type ShowcaseScenario,
    validateShowcaseConfig,
} from '../../src/data/showcase-lab'
import {
    buildTrendPolyline,
    getDefaultShowcaseSelection,
    resolveScenario,
    resolveShowcaseSelection,
} from '../../src/utils/showcase-lab'

describe('showcase lab', () => {
    it('returns the configured default selection', () => {
        expect(getDefaultShowcaseSelection()).toEqual({
            scenarioId: 'launch-calibration',
            subsystemId: 'perception',
        })
    })

    it('falls back to the default scenario when the requested scenario is unknown', () => {
        expect(resolveScenario('does-not-exist').id).toBe('launch-calibration')
    })

    it('uses the selected scenario default subsystem when only scenario is provided', () => {
        expect(
            resolveShowcaseSelection({
                scenarioId: 'emergency-brake',
            }),
        ).toEqual({
            scenarioId: 'emergency-brake',
            subsystemId: 'actuation',
        })
    })

    it('falls back to the scenario default subsystem when the requested subsystem is invalid', () => {
        expect(
            resolveShowcaseSelection({
                scenarioId: 'figure-eight',
                subsystemId: 'unknown',
            }),
        ).toEqual({
            scenarioId: 'figure-eight',
            subsystemId: 'planning',
        })
    })

    it('keeps a valid subsystem when it exists in the selected scenario', () => {
        expect(
            resolveShowcaseSelection({
                scenarioId: 'emergency-brake',
                subsystemId: 'actuation',
            }),
        ).toEqual({
            scenarioId: 'emergency-brake',
            subsystemId: 'actuation',
        })
    })

    it('throws when a scenario default subsystem is not part of the scenario definition', () => {
        const invalidScenario: ShowcaseScenario = {
            ...showcaseScenarios[0],
            id: 'invalid-showcase',
            subsystems: showcaseScenarios[0].subsystems.filter(
                (subsystem) => subsystem.id !== 'perception',
            ),
            defaultSubsystemId: 'perception',
        }

        expect(() =>
            validateShowcaseConfig([invalidScenario], {
                scenarioId: 'invalid-showcase',
                subsystemId: 'perception',
            }),
        ).toThrow(/defaultSubsystemId/)
    })

    it('creates stable SVG polyline points from trend values', () => {
        expect(buildTrendPolyline([72, 84, 96], 120, 60, 10)).toBe('10,50 60,30 110,10')
    })
})
