import {
    defaultShowcaseSelection,
    showcaseCacheSimulationConfig,
    type ShowcaseCacheSimulationState,
    type ShowcaseMetric,
    type ShowcaseReplayFrame,
    type ShowcaseScenario,
    showcaseScenarios,
    type ShowcaseScript,
    showcaseScripts,
    type ShowcaseScriptStep,
    type ShowcaseStage,
    type ShowcaseSubsystem,
} from '../data/showcase-lab'

export interface ShowcaseSelection {
    scenarioId: string
    subsystemId: string
}

export interface ShowcaseReplayState {
    selection: ShowcaseSelection
    frameIndex: number
}

export interface ShowcaseReplaySnapshot {
    selection: ShowcaseSelection
    scenario: ShowcaseScenario
    subsystem: ShowcaseSubsystem
    frameIndex: number
    frame: ShowcaseReplayFrame
    metrics: ShowcaseMetric[]
    stages: ShowcaseStage[]
    track: ShowcaseScenario['track']
    trendCursorIndex: number
}

export const SHOWCASE_SELECTION_STORAGE_KEY = 'huat-showcase-lab-selection'

function getDefaultScenario(): ShowcaseScenario {
    return (
        showcaseScenarios.find((scenario) => scenario.id === defaultShowcaseSelection.scenarioId) ??
        showcaseScenarios[0]
    )
}

export function getDefaultShowcaseSelection(): ShowcaseSelection {
    return { ...defaultShowcaseSelection }
}

export function resolveScenario(scenarioId?: string | null): ShowcaseScenario {
    return showcaseScenarios.find((scenario) => scenario.id === scenarioId) ?? getDefaultScenario()
}

export function resolveSubsystem(
    scenario: ShowcaseScenario,
    subsystemId?: string | null
): ShowcaseSubsystem {
    return (
        scenario.subsystems.find((subsystem) => subsystem.id === subsystemId) ??
        scenario.subsystems.find((subsystem) => subsystem.id === scenario.defaultSubsystemId) ??
        scenario.subsystems[0]
    )
}

export function resolveShowcaseSelection(
    selection?: Partial<ShowcaseSelection> | null
): ShowcaseSelection {
    const scenario = resolveScenario(selection?.scenarioId)
    const subsystem = resolveSubsystem(scenario, selection?.subsystemId)

    return {
        scenarioId: scenario.id,
        subsystemId: subsystem.id,
    }
}

export function getShowcaseSnapshot(selection?: Partial<ShowcaseSelection> | null): {
    selection: ShowcaseSelection
    scenario: ShowcaseScenario
    subsystem: ShowcaseSubsystem
} {
    const resolvedSelection = resolveShowcaseSelection(selection)
    const scenario = resolveScenario(resolvedSelection.scenarioId)
    const subsystem = resolveSubsystem(scenario, resolvedSelection.subsystemId)

    return {
        selection: resolvedSelection,
        scenario,
        subsystem,
    }
}

export function resolveReplayFrameIndex(
    scenario: ShowcaseScenario,
    frameIndex?: number | null
): number {
    const maxIndex = scenario.replay.frames.length - 1

    if (maxIndex <= 0) {
        return 0
    }

    if (typeof frameIndex !== 'number' || Number.isNaN(frameIndex)) {
        return 0
    }

    return Math.min(Math.max(Math.floor(frameIndex), 0), maxIndex)
}

function applyMetricOverrides(
    metrics: ShowcaseMetric[],
    frame: ShowcaseReplayFrame
): ShowcaseMetric[] {
    return metrics.map((metric) => {
        const override = frame.metricOverrides?.find((entry) => entry.id === metric.id)

        if (!override) {
            return metric
        }

        return {
            ...metric,
            value: override.value,
            note: override.note ?? metric.note,
            tone: override.tone ?? metric.tone,
        }
    })
}

function applyStageOverrides(stages: ShowcaseStage[], frame: ShowcaseReplayFrame): ShowcaseStage[] {
    return stages.map((stage) => {
        const override = frame.stageOverrides?.find((entry) => entry.id === stage.id)

        if (!override) {
            return stage
        }

        return {
            ...stage,
            state: override.state,
            detail: override.detail ?? stage.detail,
            tone: override.tone ?? stage.tone,
        }
    })
}

export function getShowcaseReplaySnapshot(
    selection?: Partial<ShowcaseSelection> | null,
    frameIndex?: number | null
): ShowcaseReplaySnapshot {
    const { selection: resolvedSelection, scenario, subsystem } = getShowcaseSnapshot(selection)
    const resolvedFrameIndex = resolveReplayFrameIndex(scenario, frameIndex)
    const frame = scenario.replay.frames[resolvedFrameIndex]

    return {
        selection: resolvedSelection,
        scenario,
        subsystem,
        frameIndex: resolvedFrameIndex,
        frame,
        metrics: applyMetricOverrides(scenario.metrics, frame),
        stages: applyStageOverrides(scenario.stages, frame),
        track: {
            ...scenario.track,
            progressPath: frame.progressPath ?? scenario.track.progressPath,
            car: frame.car ?? scenario.track.car,
        },
        trendCursorIndex: Math.min(frame.trendIndex, scenario.trend.values.length - 1),
    }
}

function resolveNextScenario(selection: ShowcaseSelection): ShowcaseSelection {
    const scenario = resolveScenario(selection.scenarioId)
    const scenarioIndex = showcaseScenarios.findIndex((entry) => entry.id === scenario.id)
    const nextScenario = showcaseScenarios[(scenarioIndex + 1) % showcaseScenarios.length]
    return resolveShowcaseSelection({ scenarioId: nextScenario.id })
}

export function advanceShowcaseReplay(
    selection: ShowcaseSelection,
    frameIndex: number
): { selection: ShowcaseSelection; frameIndex: number; isAtEnd: boolean } {
    const scenario = resolveScenario(selection.scenarioId)
    const maxFrameIndex = scenario.replay.frames.length - 1
    const nextFrameIndexBeforeClamp = frameIndex + 1

    if (nextFrameIndexBeforeClamp > maxFrameIndex) {
        const nextSelection = resolveNextScenario(selection)
        return {
            selection: nextSelection,
            frameIndex: 0,
            isAtEnd: false,
        }
    }

    const nextFrameIndex = resolveReplayFrameIndex(scenario, nextFrameIndexBeforeClamp)

    return {
        selection,
        frameIndex: nextFrameIndex,
        isAtEnd: false,
    }
}

export function buildTrendPolyline(
    values: number[],
    width = 320,
    height = 96,
    padding = 12
): string {
    if (values.length === 0) {
        return ''
    }

    if (values.length === 1) {
        const x = Math.round(width / 2)
        const y = Math.round(height / 2)
        return `${x},${y}`
    }

    const min = Math.min(...values)
    const max = Math.max(...values)
    const range = max - min || 1
    const availableWidth = width - padding * 2
    const availableHeight = height - padding * 2

    return values
        .map((value, index) => {
            const x = padding + (availableWidth * index) / (values.length - 1)
            const y = height - padding - ((value - min) / range) * availableHeight
            return `${Math.round(x)},${Math.round(y)}`
        })
        .join(' ')
}

export function buildTrendCursor(
    values: number[],
    index: number,
    width = 320,
    height = 96,
    padding = 12
): { x: number; y: number } {
    if (values.length === 0) {
        return {
            x: Math.round(width / 2),
            y: Math.round(height / 2),
        }
    }

    const clampedIndex = Math.min(Math.max(index, 0), values.length - 1)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const range = max - min || 1
    const availableWidth = width - padding * 2
    const availableHeight = height - padding * 2
    const value = values[clampedIndex]

    return {
        x: Math.round(padding + (availableWidth * clampedIndex) / Math.max(values.length - 1, 1)),
        y: Math.round(height - padding - ((value - min) / range) * availableHeight),
    }
}

// ==================== Presentation Console Utilities ====================

export interface ShowcaseComparisonSnapshot {
    primaryScenario: ShowcaseScenario
    compareScenario: ShowcaseScenario
    primaryFrame: ShowcaseReplayFrame
    compareFrame: ShowcaseReplayFrame
    metricDeltas: Array<{
        id: string
        label: string
        primaryValue: number
        compareValue: number
        delta: number
        deltaPercent: number
    }>
    deltaHighlights: string[]
}

export function resolveCompareScenarioId(currentScenarioId: string): string {
    const currentIndex = showcaseScenarios.findIndex((s) => s.id === currentScenarioId)
    const nextIndex = (currentIndex + 1) % showcaseScenarios.length
    return showcaseScenarios[nextIndex].id
}

function parseMetricValue(value: string): number {
    const parsed = parseFloat(value)
    return Number.isNaN(parsed) ? 0 : parsed
}

export function getShowcaseComparisonSnapshot(
    primaryScenarioId: string,
    compareScenarioId: string,
    primaryFrameIndex = 0,
    compareFrameIndex = 0
): ShowcaseComparisonSnapshot {
    const primaryScenario = resolveScenario(primaryScenarioId)
    const compareScenario = resolveScenario(compareScenarioId)

    const primaryFrame =
        primaryScenario.replay.frames[resolveReplayFrameIndex(primaryScenario, primaryFrameIndex)]
    const compareFrame =
        compareScenario.replay.frames[resolveReplayFrameIndex(compareScenario, compareFrameIndex)]

    const primaryMetrics = applyMetricOverrides(primaryScenario.metrics, primaryFrame)
    const compareMetrics = applyMetricOverrides(compareScenario.metrics, compareFrame)

    const metricDeltas = primaryMetrics
        .map((primaryMetric) => {
            const compareMetric = compareMetrics.find((m) => m.id === primaryMetric.id)
            if (!compareMetric) return null

            const primaryValue = parseMetricValue(primaryMetric.value)
            const compareValue = parseMetricValue(compareMetric.value)
            const delta = primaryValue - compareValue
            const deltaPercent = compareValue !== 0 ? (delta / compareValue) * 100 : 0

            return {
                id: primaryMetric.id,
                label: primaryMetric.label,
                primaryValue,
                compareValue,
                delta,
                deltaPercent,
            }
        })
        .filter((item): item is NonNullable<typeof item> => item !== null)

    const deltaHighlights: string[] = []

    const speedDelta = metricDeltas.find((d) => d.id === 'speed')
    if (speedDelta && Math.abs(speedDelta.deltaPercent) > 20) {
        deltaHighlights.push(speedDelta.delta > 0 ? '主场景速度显著更高' : '对比场景速度显著更高')
    }

    const latencyDelta = metricDeltas.find((d) => d.id === 'latency')
    if (latencyDelta && latencyDelta.delta < 0) {
        deltaHighlights.push('主场景控制延迟更低')
    }

    if (deltaHighlights.length === 0) {
        deltaHighlights.push('两场景策略侧重点不同')
    }

    return {
        primaryScenario,
        compareScenario,
        primaryFrame,
        compareFrame,
        metricDeltas,
        deltaHighlights,
    }
}

export interface ShowcaseScriptSnapshot {
    script: ShowcaseScript | null
    currentStep: ShowcaseScriptStep | null
    stepIndex: number
    totalSteps: number
    isValid: boolean
}

export interface ShowcaseScriptState {
    scriptId: string | null
    stepIndex: number
}

export function resolveShowcaseScript(scriptId?: string | null): ShowcaseScript | null {
    if (!scriptId) return null
    return showcaseScripts.find((script) => script.id === scriptId) ?? null
}

export function getShowcaseScriptSnapshot(
    scriptId?: string | null,
    stepIndex?: number | null
): ShowcaseScriptSnapshot {
    const script = resolveShowcaseScript(scriptId)

    if (!script) {
        return {
            script: null,
            currentStep: null,
            stepIndex: 0,
            totalSteps: 0,
            isValid: false,
        }
    }

    const resolvedStepIndex = Math.min(
        Math.max(typeof stepIndex === 'number' ? stepIndex : 0, 0),
        script.steps.length - 1
    )

    return {
        script,
        currentStep: script.steps[resolvedStepIndex],
        stepIndex: resolvedStepIndex,
        totalSteps: script.steps.length,
        isValid: true,
    }
}

export function advanceShowcaseScript(
    scriptId: string | null,
    currentStepIndex: number
): ShowcaseScriptState {
    const script = resolveShowcaseScript(scriptId)

    if (!script) {
        return { scriptId: null, stepIndex: 0 }
    }

    const nextStepIndex = currentStepIndex + 1

    if (nextStepIndex < script.steps.length) {
        return { scriptId, stepIndex: nextStepIndex }
    }

    return { scriptId, stepIndex: 0 }
}

export function getDefaultCacheSimulationState(): ShowcaseCacheSimulationState {
    return { ...showcaseCacheSimulationConfig.initialState }
}

export function warmShowcaseCache(): ShowcaseCacheSimulationState {
    return { ...showcaseCacheSimulationConfig.warmCacheState }
}

export function driftShowcaseCache(): ShowcaseCacheSimulationState {
    return { ...showcaseCacheSimulationConfig.driftState }
}

export function resetShowcaseCache(): ShowcaseCacheSimulationState {
    return getDefaultCacheSimulationState()
}

export function getCacheSimulationSummary(state: ShowcaseCacheSimulationState): {
    statusLabel: string
    statusTone: 'positive' | 'warning' | 'neutral'
    readyCount: number
    staleCount: number
    pendingCount: number
} {
    const readyCount = state.resources.filter((r) => r.status === 'ready').length
    const staleCount = state.resources.filter((r) => r.status === 'stale').length
    const pendingCount = state.resources.filter((r) => r.status === 'pending').length

    let statusLabel: string
    let statusTone: 'positive' | 'warning' | 'neutral'

    switch (state.mode) {
        case 'ready':
            statusLabel = '缓存就绪'
            statusTone = 'positive'
            break
        case 'syncing':
            statusLabel = '正在同步'
            statusTone = 'warning'
            break
        case 'cold':
        default:
            statusLabel = '缓存冷态'
            statusTone = 'neutral'
            break
    }

    return {
        statusLabel,
        statusTone,
        readyCount,
        staleCount,
        pendingCount,
    }
}
