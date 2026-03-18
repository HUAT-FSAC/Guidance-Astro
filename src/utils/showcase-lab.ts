import {
    defaultShowcaseSelection,
    type ShowcaseScenario,
    showcaseScenarios,
    type ShowcaseSubsystem,
} from '../data/showcase-lab'

export interface ShowcaseSelection {
    scenarioId: string
    subsystemId: string
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
    subsystemId?: string | null,
): ShowcaseSubsystem {
    return (
        scenario.subsystems.find((subsystem) => subsystem.id === subsystemId) ??
        scenario.subsystems.find((subsystem) => subsystem.id === scenario.defaultSubsystemId) ??
        scenario.subsystems[0]
    )
}

export function resolveShowcaseSelection(
    selection?: Partial<ShowcaseSelection> | null,
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

export function buildTrendPolyline(
    values: number[],
    width = 320,
    height = 96,
    padding = 12,
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
