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

/**
 * 展示实验室选择状态接口
 */
export interface ShowcaseSelection {
    scenarioId: string
    subsystemId: string
}

/**
 * 展示实验室回放状态接口
 */
export interface ShowcaseReplayState {
    selection: ShowcaseSelection
    frameIndex: number
}

/**
 * 展示实验室回放快照接口，包含完整的场景数据
 */
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

/**
 * 展示实验室选择状态存储键
 */
export const SHOWCASE_SELECTION_STORAGE_KEY = 'huat-showcase-lab-selection'

/**
 * 获取默认场景
 * @returns 默认的展示场景
 */
function getDefaultScenario(): ShowcaseScenario {
    return (
        showcaseScenarios.find((scenario) => scenario.id === defaultShowcaseSelection.scenarioId) ??
        showcaseScenarios[0]
    )
}

/**
 * 获取默认的展示选择
 * @returns 默认的场景和子系统选择
 */
export function getDefaultShowcaseSelection(): ShowcaseSelection {
    return { ...defaultShowcaseSelection }
}

/**
 * 根据场景 ID 解析场景
 * @param scenarioId - 场景 ID，可选
 * @returns 匹配的场景或默认场景
 */
export function resolveScenario(scenarioId?: string | null): ShowcaseScenario {
    return showcaseScenarios.find((scenario) => scenario.id === scenarioId) ?? getDefaultScenario()
}

/**
 * 解析子系统
 * @param scenario - 所属场景
 * @param subsystemId - 子系统 ID，可选
 * @returns 匹配的子系统或默认子系统
 */
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

/**
 * 解析完整的展示选择
 * @param selection - 部分选择数据，可选
 * @returns 完整有效的选择
 */
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

/**
 * 获取展示快照（基础数据）
 * @param selection - 部分选择数据，可选
 * @returns 包含选择、场景和子系统的快照
 */
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

/**
 * 解析回放帧索引
 * @param scenario - 场景对象
 * @param frameIndex - 帧索引，可选
 * @returns 有效的帧索引（在边界内）
 */
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

/**
 * 应用度量数据的覆盖值
 * @param metrics - 原始度量数据
 * @param frame - 当前帧数据
 * @returns 应用覆盖值后的度量数据
 */
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

/**
 * 应用阶段数据的覆盖值
 * @param stages - 原始阶段数据
 * @param frame - 当前帧数据
 * @returns 应用覆盖值后的阶段数据
 */
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

/**
 * 获取完整的回放快照
 * @param selection - 部分选择数据，可选
 * @param frameIndex - 帧索引，可选
 * @returns 完整的回放快照数据
 */
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

/**
 * 解析下一个场景
 * @param selection - 当前选择
 * @returns 下一个场景的选择
 */
function resolveNextScenario(selection: ShowcaseSelection): ShowcaseSelection {
    const scenario = resolveScenario(selection.scenarioId)
    const scenarioIndex = showcaseScenarios.findIndex((entry) => entry.id === scenario.id)
    const nextScenario = showcaseScenarios[(scenarioIndex + 1) % showcaseScenarios.length]
    return resolveShowcaseSelection({ scenarioId: nextScenario.id })
}

/**
 * 前进回放，自动切换到下一帧或下一个场景
 * @param selection - 当前选择
 * @param frameIndex - 当前帧索引
 * @returns 新的选择和帧索引
 */
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

/**
 * 构建趋势图的折线点字符串
 * @param values - 数据值数组
 * @param width - SVG 宽度，默认 320
 * @param height - SVG 高度，默认 96
 * @param padding - 内边距，默认 12
 * @returns SVG 折线点字符串
 */
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

/**
 * 构建趋势图游标位置
 * @param values - 数据值数组
 * @param index - 游标索引
 * @param width - SVG 宽度，默认 320
 * @param height - SVG 高度，默认 96
 * @param padding - 内边距，默认 12
 * @returns 游标坐标
 */
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

/**
 * 展示对比快照接口
 */
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

/**
 * 解析对比场景 ID
 * @param currentScenarioId - 当前场景 ID
 * @returns 下一个场景的 ID
 */
export function resolveCompareScenarioId(currentScenarioId: string): string {
    const currentIndex = showcaseScenarios.findIndex((s) => s.id === currentScenarioId)
    const nextIndex = (currentIndex + 1) % showcaseScenarios.length
    return showcaseScenarios[nextIndex].id
}

/**
 * 解析度量值（从字符串转为数字）
 * @param value - 字符串形式的度量值
 * @returns 数字形式的度量值
 */
function parseMetricValue(value: string): number {
    const parsed = parseFloat(value)
    return Number.isNaN(parsed) ? 0 : parsed
}

/**
 * 获取展示对比快照
 * @param primaryScenarioId - 主场景 ID
 * @param compareScenarioId - 对比场景 ID
 * @param primaryFrameIndex - 主场景帧索引，默认 0
 * @param compareFrameIndex - 对比场景帧索引，默认 0
 * @returns 完整的对比快照数据
 */
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

/**
 * 展示脚本快照接口
 */
export interface ShowcaseScriptSnapshot {
    script: ShowcaseScript | null
    currentStep: ShowcaseScriptStep | null
    stepIndex: number
    totalSteps: number
    isValid: boolean
}

/**
 * 展示脚本状态接口
 */
export interface ShowcaseScriptState {
    scriptId: string | null
    stepIndex: number
}

/**
 * 解析展示脚本
 * @param scriptId - 脚本 ID，可选
 * @returns 匹配的脚本或 null
 */
export function resolveShowcaseScript(scriptId?: string | null): ShowcaseScript | null {
    if (!scriptId) return null
    return showcaseScripts.find((script) => script.id === scriptId) ?? null
}

/**
 * 获取展示脚本快照
 * @param scriptId - 脚本 ID，可选
 * @param stepIndex - 步骤索引，可选
 * @returns 脚本快照数据
 */
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

/**
 * 前进展示脚本到下一步
 * @param scriptId - 脚本 ID
 * @param currentStepIndex - 当前步骤索引
 * @returns 新的脚本状态
 */
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

/**
 * 获取默认缓存模拟状态
 * @returns 默认的缓存状态
 */
export function getDefaultCacheSimulationState(): ShowcaseCacheSimulationState {
    return { ...showcaseCacheSimulationConfig.initialState }
}

/**
 * 预热缓存
 * @returns 预热后的缓存状态
 */
export function warmShowcaseCache(): ShowcaseCacheSimulationState {
    return { ...showcaseCacheSimulationConfig.warmCacheState }
}

/**
 * 漂移缓存
 * @returns 漂移后的缓存状态
 */
export function driftShowcaseCache(): ShowcaseCacheSimulationState {
    return { ...showcaseCacheSimulationConfig.driftState }
}

/**
 * 重置缓存
 * @returns 重置后的缓存状态
 */
export function resetShowcaseCache(): ShowcaseCacheSimulationState {
    return getDefaultCacheSimulationState()
}

/**
 * 获取缓存模拟摘要
 * @param state - 当前缓存状态
 * @returns 缓存摘要数据
 */
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
