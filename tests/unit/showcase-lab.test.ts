import { describe, expect, it } from 'vitest'

import {
    type ShowcaseScenario,
    showcaseScenarios,
    showcaseScripts,
    validateShowcaseConfig,
} from '../../src/data/showcase-lab'
import {
    advanceShowcaseReplay,
    buildTrendPolyline,
    getDefaultShowcaseSelection,
    getShowcaseReplaySnapshot,
    resolveReplayFrameIndex,
    resolveScenario,
    resolveShowcaseSelection,
    // Presentation Console utilities
    resolveCompareScenarioId,
    getShowcaseComparisonSnapshot,
    resolveShowcaseScript,
    getShowcaseScriptSnapshot,
    advanceShowcaseScript,
    getDefaultCacheSimulationState,
    warmShowcaseCache,
    driftShowcaseCache,
    resetShowcaseCache,
    getCacheSimulationSummary,
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
            })
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
            })
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
            })
        ).toEqual({
            scenarioId: 'emergency-brake',
            subsystemId: 'actuation',
        })
    })

    it('clamps replay frame indices to the valid range of the selected scenario', () => {
        expect(resolveReplayFrameIndex(resolveScenario('launch-calibration'), 99)).toBe(2)
        expect(resolveReplayFrameIndex(resolveScenario('high-speed-lap'), -5)).toBe(0)
    })

    it('builds a replay snapshot by composing scenario data with frame overrides', () => {
        const snapshot = getShowcaseReplaySnapshot(
            {
                scenarioId: 'launch-calibration',
                subsystemId: 'perception',
            },
            1
        )

        expect(snapshot.frame.title).toBe('校准完成，释放起步窗口')
        expect(snapshot.metrics.find((metric) => metric.id === 'speed')?.value).toBe('24')
        expect(snapshot.stages.find((stage) => stage.id === 'planning')?.state).toBe(
            '起步窗口已打开'
        )
        expect(snapshot.track.car).toEqual({ x: 264, y: 104 })
        expect(snapshot.trendCursorIndex).toBe(2)
    })

    it('advances from the last replay frame to the next scenario default selection', () => {
        expect(
            advanceShowcaseReplay(
                {
                    scenarioId: 'launch-calibration',
                    subsystemId: 'perception',
                },
                2
            )
        ).toEqual({
            selection: {
                scenarioId: 'high-speed-lap',
                subsystemId: 'planning',
            },
            frameIndex: 0,
            isAtEnd: false,
        })
    })

    it('throws when a scenario default subsystem is not part of the scenario definition', () => {
        const invalidScenario: ShowcaseScenario = {
            ...showcaseScenarios[0],
            id: 'invalid-showcase',
            subsystems: showcaseScenarios[0].subsystems.filter(
                (subsystem) => subsystem.id !== 'perception'
            ),
            defaultSubsystemId: 'perception',
        }

        expect(() =>
            validateShowcaseConfig([invalidScenario], {
                scenarioId: 'invalid-showcase',
                subsystemId: 'perception',
            })
        ).toThrow(/defaultSubsystemId/)
    })

    it('creates stable SVG polyline points from trend values', () => {
        expect(buildTrendPolyline([72, 84, 96], 120, 60, 10)).toBe('10,50 60,30 110,10')
    })

    // ==================== Presentation Console Tests ====================

    describe('comparison mode', () => {
        it('resolves compare scenario id to the next scenario in rotation', () => {
            expect(resolveCompareScenarioId('launch-calibration')).toBe('high-speed-lap')
            expect(resolveCompareScenarioId('high-speed-lap')).toBe('figure-eight')
            expect(resolveCompareScenarioId('emergency-brake')).toBe('launch-calibration')
        })

        it('returns comparison snapshot with primary and compare scenarios', () => {
            const snapshot = getShowcaseComparisonSnapshot(
                'launch-calibration',
                'high-speed-lap',
                0,
                0
            )

            expect(snapshot.primaryScenario.id).toBe('launch-calibration')
            expect(snapshot.compareScenario.id).toBe('high-speed-lap')
            expect(snapshot.primaryFrame).toBeDefined()
            expect(snapshot.compareFrame).toBeDefined()
            expect(snapshot.metricDeltas.length).toBeGreaterThan(0)
            expect(snapshot.deltaHighlights.length).toBeGreaterThan(0)
        })

        it('calculates metric deltas correctly', () => {
            const snapshot = getShowcaseComparisonSnapshot(
                'high-speed-lap',
                'launch-calibration',
                0,
                0
            )

            const speedDelta = snapshot.metricDeltas.find((d) => d.id === 'speed')
            expect(speedDelta).toBeDefined()
            expect(speedDelta?.primaryValue).toBe(104) // high-speed-lap speed
            expect(speedDelta?.compareValue).toBe(18) // launch-calibration speed
            expect(speedDelta?.delta).toBe(86)
        })

        it('clamps frame indices to valid ranges', () => {
            const snapshot = getShowcaseComparisonSnapshot(
                'launch-calibration',
                'high-speed-lap',
                99, // Out of bounds
                -5 // Out of bounds
            )

            expect(snapshot.primaryFrame).toBeDefined()
            expect(snapshot.compareFrame).toBeDefined()
        })
    })

    describe('demo script', () => {
        it('resolves script by id', () => {
            const script = resolveShowcaseScript('full-pipeline')
            expect(script).toBeDefined()
            expect(script?.id).toBe('full-pipeline')
            expect(script?.steps.length).toBeGreaterThan(0)
        })

        it('returns null for unknown script id', () => {
            expect(resolveShowcaseScript('unknown')).toBeNull()
            expect(resolveShowcaseScript(null)).toBeNull()
        })

        it('returns script snapshot with current step', () => {
            const snapshot = getShowcaseScriptSnapshot('full-pipeline', 1)

            expect(snapshot.isValid).toBe(true)
            expect(snapshot.script?.id).toBe('full-pipeline')
            expect(snapshot.currentStep).toBeDefined()
            expect(snapshot.stepIndex).toBe(1)
            expect(snapshot.totalSteps).toBe(showcaseScripts[0].steps.length)
        })

        it('returns invalid snapshot for null script id', () => {
            const snapshot = getShowcaseScriptSnapshot(null, 0)

            expect(snapshot.isValid).toBe(false)
            expect(snapshot.script).toBeNull()
            expect(snapshot.currentStep).toBeNull()
        })

        it('clamps step index to valid range', () => {
            const snapshot = getShowcaseScriptSnapshot('full-pipeline', 99)
            const lastIndex = showcaseScripts[0].steps.length - 1

            expect(snapshot.stepIndex).toBe(lastIndex)
        })

        it('advances script to next step', () => {
            const nextState = advanceShowcaseScript('full-pipeline', 0)

            expect(nextState.scriptId).toBe('full-pipeline')
            expect(nextState.stepIndex).toBe(1)
        })

        it('wraps script back to first step after last step', () => {
            const lastIndex = showcaseScripts[0].steps.length - 1
            const nextState = advanceShowcaseScript('full-pipeline', lastIndex)

            expect(nextState.scriptId).toBe('full-pipeline')
            expect(nextState.stepIndex).toBe(0)
        })

        it('returns null script id when advancing null script', () => {
            const nextState = advanceShowcaseScript(null, 0)

            expect(nextState.scriptId).toBeNull()
            expect(nextState.stepIndex).toBe(0)
        })
    })

    describe('cache simulation', () => {
        it('returns default cold cache state', () => {
            const state = getDefaultCacheSimulationState()

            expect(state.mode).toBe('cold')
            expect(state.cachedPacks).toBe(0)
            expect(state.hitRate).toBe(0)
            expect(state.resources.length).toBe(5)
            expect(state.resources.every((r) => r.status === 'pending')).toBe(true)
        })

        it('returns warm cache state', () => {
            const state = warmShowcaseCache()

            expect(state.mode).toBe('ready')
            expect(state.cachedPacks).toBe(5)
            expect(state.hitRate).toBe(94)
            expect(state.resources.every((r) => r.status === 'ready')).toBe(true)
        })

        it('returns drift cache state', () => {
            const state = driftShowcaseCache()

            expect(state.mode).toBe('syncing')
            expect(state.cachedPacks).toBe(3)
            expect(state.hitRate).toBe(62)
            expect(state.resources.some((r) => r.status === 'stale')).toBe(true)
        })

        it('resets cache to cold state', () => {
            const warmState = warmShowcaseCache()
            expect(warmState.mode).toBe('ready')

            const resetState = resetShowcaseCache()
            expect(resetState.mode).toBe('cold')
            expect(resetState.cachedPacks).toBe(0)
        })

        it('generates correct cache summary', () => {
            const coldState = getDefaultCacheSimulationState()
            const coldSummary = getCacheSimulationSummary(coldState)

            expect(coldSummary.statusLabel).toBe('缓存冷态')
            expect(coldSummary.statusTone).toBe('neutral')
            expect(coldSummary.readyCount).toBe(0)
            expect(coldSummary.staleCount).toBe(0)
            expect(coldSummary.pendingCount).toBe(5)

            const warmState = warmShowcaseCache()
            const warmSummary = getCacheSimulationSummary(warmState)

            expect(warmSummary.statusLabel).toBe('缓存就绪')
            expect(warmSummary.statusTone).toBe('positive')
            expect(warmSummary.readyCount).toBe(5)

            const driftState = driftShowcaseCache()
            const driftSummary = getCacheSimulationSummary(driftState)

            expect(driftSummary.statusLabel).toBe('正在同步')
            expect(driftSummary.statusTone).toBe('warning')
            expect(driftSummary.staleCount).toBeGreaterThan(0)
        })
    })
})
