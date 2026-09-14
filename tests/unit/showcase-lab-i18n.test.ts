import { describe, expect, it } from 'vitest'

import { showcaseScenarios, showcaseScripts } from '../../src/data/showcase-lab'
import {
    getLocalizedShowcaseReplaySnapshot,
    getLocalizedShowcaseScenarios,
    getLocalizedShowcaseScripts,
    getLocalizedShowcaseScriptStep,
    localizeShowcaseScenario,
    showcaseUiLabels,
} from '../../src/data/showcase-lab-i18n'
import { getShowcaseReplaySnapshot } from '../../src/utils/showcase-lab'

const launch = showcaseScenarios[0]

describe('showcase lab i18n', () => {
    it('exposes both locale label tables', () => {
        expect(showcaseUiLabels.zh.title).toBe('智能驾驶交互实验室')
        expect(showcaseUiLabels.en.title).toBe('Autonomous Driving Interaction Lab')
    })

    it('passes zh scenarios through unchanged', () => {
        const localized = localizeShowcaseScenario(launch, 'zh')
        expect(localized).toBe(launch)
    })

    it('returns every scenario localized for en', () => {
        const localized = getLocalizedShowcaseScenarios('en')
        expect(localized).toHaveLength(showcaseScenarios.length)
        const launchEn = localized[0]
        expect(launchEn.name).toMatch(/Launch calibration/)
        expect(launchEn.tagline).not.toBe(launch.tagline)
        expect(launchEn.strategy.title).not.toBe(launch.strategy.title)
        expect(launchEn.track.label).not.toBe(launch.track.label)
        expect(launchEn.trend.startLabel).not.toBe(launch.trend.startLabel)
    })

    it('localizes metrics and stages with copy maps', () => {
        const [launchEn] = getLocalizedShowcaseScenarios('en')
        expect(launchEn.metrics.every((metric) => metric.label !== metric.note)).toBe(true)
        expect(launchEn.metrics[0].note).not.toBe('Telemetry update')
        expect(launchEn.stages[0].state).not.toBe(launch.stages[0].state)
        expect(launchEn.stages[0].detail).not.toBe(launch.stages[0].detail)
    })

    it('localizes replay frames including metric and stage overrides', () => {
        const [launchEn] = getLocalizedShowcaseScenarios('en')
        expect(launchEn.replay.frames).toHaveLength(launch.replay.frames.length)
        const frame = launchEn.replay.frames[0]
        expect(frame.title).toContain('Replay step 1')
        expect(frame.summary).toBe('Telemetry snapshot for the current scenario step.')
        const overrideFrame = launchEn.replay.frames.find((f) => f.metricOverrides)!
        expect(overrideFrame.metricOverrides?.[0]?.note).toBeDefined()
        expect(overrideFrame.stageOverrides?.[0]?.state).toBeDefined()
    })

    it('localizes subsystem copy when a known subsystem is present', () => {
        const [launchEn] = getLocalizedShowcaseScenarios('en')
        const perception = launchEn.subsystems.find((s) => s.id === 'perception')
        expect(perception?.headline).toMatch(/track boundary/)
    })

    it('falls back to the original scenario when the id has no metadata', () => {
        const fake = { ...launch, id: 'unknown-scenario' }
        expect(localizeShowcaseScenario(fake, 'en')).toBe(fake)
    })

    it('passes zh scripts through unchanged', () => {
        expect(getLocalizedShowcaseScripts('zh')).toBe(showcaseScripts)
    })

    it('localizes every en script name and description', () => {
        const scripts = getLocalizedShowcaseScripts('en')
        expect(scripts).toHaveLength(showcaseScripts.length)
        expect(scripts[0].name).toBe('Full pipeline walkthrough')
        expect(scripts[0].description).toContain('perception-to-actuation')
        expect(scripts[1].name).toBe('High-speed scenarios')
        expect(scripts[2].name).toBe('Safety demonstration')
        expect(scripts[0].steps[0].title).toContain('·')
        expect(scripts[0].steps[0].narration).toContain('Explain how')
    })

    it('falls back when a script step references an unknown scenario or subsystem', () => {
        const [script] = getLocalizedShowcaseScripts('en')
        const fallback = getLocalizedShowcaseScriptStep(
            { ...script.steps[0], scenarioId: 'nope', subsystemId: 'nope' },
            'en'
        )
        expect(fallback?.title).toBe('Scenario · Subsystem')
    })

    it('returns null for a null script step', () => {
        expect(getLocalizedShowcaseScriptStep(null, 'en')).toBeNull()
    })

    it('passes zh replay snapshots through unchanged', () => {
        const snapshot = getShowcaseReplaySnapshot({ scenarioId: 'launch-calibration' })
        expect(getLocalizedShowcaseReplaySnapshot(snapshot, 'zh')).toBe(snapshot)
    })

    it('localizes a full en replay snapshot', () => {
        const snapshot = getShowcaseReplaySnapshot({ scenarioId: 'launch-calibration' })
        const localized = getLocalizedShowcaseReplaySnapshot(snapshot, 'en')
        expect(localized.scenario.name).not.toBe(snapshot.scenario.name)
        expect(localized.subsystem.label).not.toBe(snapshot.subsystem.label)
        expect(localized.metrics[0].label).not.toBe(snapshot.metrics[0].label)
        expect(localized.stages[0].detail).not.toBe(snapshot.stages[0].detail)
        expect(localized.track.label).not.toBe(snapshot.track.label)
        expect(localized.frame.title).toContain('Replay step')
    })

    it('falls back to the first frame when the frame index is out of range', () => {
        const snapshot = getShowcaseReplaySnapshot({ scenarioId: 'launch-calibration' })
        const localized = getLocalizedShowcaseReplaySnapshot({ ...snapshot, frameIndex: 999 }, 'en')
        expect(localized.frameIndex).toBe(999)
        expect(localized.frame).toBe(localized.scenario.replay.frames[0])
    })

    it('falls back to the first subsystem when the subsystem is unknown', () => {
        const snapshot = getShowcaseReplaySnapshot({ scenarioId: 'launch-calibration' })
        const localized = getLocalizedShowcaseReplaySnapshot(
            {
                ...snapshot,
                subsystem: { ...snapshot.subsystem, id: 'does-not-exist' },
            },
            'en'
        )
        expect(localized.subsystem.id).toBe(localized.scenario.subsystems[0].id)
    })
})
