import {
    type ShowcaseMetric,
    type ShowcaseReplayFrame,
    type ShowcaseScenario,
    showcaseScenarios,
    type ShowcaseScript,
    showcaseScripts,
    type ShowcaseScriptStep,
    type ShowcaseStage,
} from './showcase-lab'
import type { ShowcaseReplaySnapshot } from '../utils/showcase-lab'

export type ShowcaseLocale = 'zh' | 'en'

export const showcaseUiLabels = {
    zh: {
        backHome: '返回首页',
        title: '智能驾驶交互实验室',
        scenarioInfo: '场景信息',
        currentStrategy: '当前策略',
        subsystems: '子系统',
        metrics: '指标',
        stages: '链路',
        console: '控制台',
        demoTools: '演示工具',
        closedLoop: '系统闭环',
        telemetry: '遥测',
        compareSummary: '差异摘要',
        scriptPlaceholder: '选择讲解脚本...',
        cacheCold: '缓存冷态',
        lastSyncNever: '从未同步',
        replayPaused: 'Paused',
        replayAuto: 'Auto',
        replayManual: 'Manual Control',
        replayAutomatic: 'Automatic Narration',
        play: 'Play',
        pause: 'Pause',
        frame: 'Frame',
        scriptReady: 'Ready',
        scriptPaused: 'Paused',
        scriptAuto: 'Auto',
    },
    en: {
        backHome: 'Back to home',
        title: 'Autonomous Driving Interaction Lab',
        scenarioInfo: 'Scenario overview',
        currentStrategy: 'Active strategy',
        subsystems: 'Subsystems',
        metrics: 'Metrics',
        stages: 'Pipeline',
        console: 'Console',
        demoTools: 'Demo tools',
        closedLoop: 'Closed loop',
        telemetry: 'Telemetry',
        compareSummary: 'Difference summary',
        scriptPlaceholder: 'Select a demo script...',
        cacheCold: 'Cache cold',
        lastSyncNever: 'Never synced',
        replayPaused: 'Paused',
        replayAuto: 'Auto',
        replayManual: 'Manual control',
        replayAutomatic: 'Automatic narration',
        play: 'Play',
        pause: 'Pause',
        frame: 'Frame',
        scriptReady: 'Ready',
        scriptPaused: 'Paused',
        scriptAuto: 'Auto',
    },
} as const

const scenarioMeta: Record<
    string,
    {
        name: string
        tagline: string
        description: string
        strategyTitle: string
        strategyCopy: string
        trackLabel: string
        trackObjective: string
        trendLabel: string
        trendStart: string
        trendEnd: string
    }
> = {
    'launch-calibration': {
        name: 'Launch calibration',
        tagline: 'The final 12 seconds of sensor sync and vehicle self-checks',
        description:
            'Align LiDAR, IMU, brakes, and steering before the car enters the track in a controlled state.',
        strategyTitle: 'Conservative launch strategy',
        strategyCopy:
            'Lock localization and brake confidence first, then release drive torque step by step.',
        trackLabel: 'Launch-lane braking zone',
        trackObjective: 'Confirm the localization and actuator loop before the start',
        trendLabel: 'System stability',
        trendStart: 'Self-check starts',
        trendEnd: 'Launch permitted',
    },
    'straight-high-speed': {
        name: 'Straight-line speed',
        tagline: 'Chasing top speed on the straight while balancing power and aero',
        description:
            'The car maximizes power delivery, aerodynamic efficiency, and high-speed stability on the long straight.',
        strategyTitle: 'Top-speed sprint strategy',
        strategyCopy:
            'Release power on the straight while preserving stability and the highest possible exit speed.',
        trackLabel: 'Straight-line speed track',
        trackObjective: 'Reach top speed on the straight and keep the car stable',
        trendLabel: 'Speed build-up',
        trendStart: 'Straight entry',
        trendEnd: 'Top-speed peak',
    },
    'high-speed-lap': {
        name: 'High-speed tracking',
        tagline: 'A fast, explainable lap strategy built for stable high-speed cornering',
        description:
            'The car enters the high-speed section with a focus on lateral stability, control latency, and continuous cone tracking.',
        strategyTitle: 'MPC speed-first strategy',
        strategyCopy:
            'Raise target and corner-exit speed while keeping cone tracking continuous and the lap competitive.',
        trackLabel: 'High-speed S-curve',
        trackObjective: 'Adjust speed and attitude before the curvature changes',
        trendLabel: 'Lap-time gain',
        trendStart: 'Lap entry',
        trendEnd: 'Finish line',
    },
    'figure-eight': {
        name: 'Figure-eight loop',
        tagline: 'Prioritizing lateral stability and controllable attitude in a high-mobility run',
        description:
            'The figure-eight tests how quickly the system can switch control objectives through consecutive reverse corners.',
        strategyTitle: 'Stability-first strategy',
        strategyCopy:
            'Lower local speed targets to preserve control headroom for attitude correction and path tracking.',
        trackLabel: 'Figure-eight track',
        trackObjective:
            'Demonstrate attitude convergence and path tracking through reverse corners',
        trendLabel: 'Lateral stability',
        trendStart: 'Left-corner entry',
        trendEnd: 'Right-corner exit',
    },
    'emergency-brake': {
        name: 'Emergency braking',
        tagline: 'Detect the obstacle, command braking, and confirm the vehicle has stopped',
        description:
            'After a risk is detected, the system must decelerate and confirm a safe stop within a very short window.',
        strategyTitle: 'Safety-loop-first strategy',
        strategyCopy:
            'Once an obstacle is confirmed, every upstream module converges on the shortest controllable stop.',
        trackLabel: 'Straight braking zone',
        trackObjective: 'Stop safely as quickly as possible and confirm the vehicle is stationary',
        trendLabel: 'Stop confidence',
        trendStart: 'Obstacle detected',
        trendEnd: 'Stop confirmed',
    },
}

const metricLabels: Record<string, string> = {
    speed: 'Vehicle speed',
    'cone-lock': 'Cone lock rate',
    localization: 'Localization confidence',
    latency: 'Control latency',
    acceleration: 'Longitudinal acceleration',
    'aero-load': 'Aero downforce',
    'yaw-margin': 'Yaw margin',
    'ebrake-distance': 'Braking distance',
    'risk-score': 'Risk confidence',
}

const metricNotes: Record<string, string> = {
    speed: 'Live vehicle telemetry',
    'cone-lock': 'Dual-sensor alignment',
    localization: 'Pose estimate is stable',
    latency: 'Safety headroom retained',
    acceleration: 'Power delivery active',
    'aero-load': 'Downforce is sufficient',
    'yaw-margin': 'Correction headroom remains',
    'ebrake-distance': 'Within the safe envelope',
    'risk-score': 'Multimodal obstacle confirmation',
}

const subsystemLabels: Record<string, string> = {
    perception: 'Perception',
    localization: 'Localization',
    planning: 'Planning',
    control: 'Control',
    actuation: 'Actuation',
}

const subsystemCopy: Record<
    string,
    { eyebrow: string; headline: string; summary: string; bullets: string[] }
> = {
    perception: {
        eyebrow: 'Perception',
        headline: 'Keep the track boundary visible',
        summary:
            'Perception keeps cones, boundaries, and risks continuously aligned for the rest of the stack.',
        bullets: ['Cone clustering', 'Boundary fitting', 'Sensor alignment'],
    },
    localization: {
        eyebrow: 'Pose estimation',
        headline: 'Stable pose makes every decision explainable',
        summary:
            'Localization combines inertial and track constraints to keep position and attitude trustworthy.',
        bullets: ['Inertial pre-integration', 'Track-geometry checks', 'Pose convergence'],
    },
    planning: {
        eyebrow: 'Trajectory planning',
        headline: 'Turn telemetry into a safe, readable trajectory',
        summary:
            'The planner balances speed, stability, and the available control margin for the current scenario.',
        bullets: ['Safety corridor', 'Speed target', 'Yaw-rate constraint'],
    },
    control: {
        eyebrow: 'Closed-loop control',
        headline: 'Close the loop quickly and smoothly',
        summary:
            'Control converts the planned trajectory into stable steering and braking commands.',
        bullets: ['Steering feedback', 'Brake feedback', 'Actuator readback'],
    },
    actuation: {
        eyebrow: 'Actuator output',
        headline: 'Make the strategy real on the vehicle',
        summary:
            'Actuation applies torque, steering, and braking while reporting the final vehicle state.',
        bullets: ['Torque limiting', 'Coordinated output', 'Safety threshold monitoring'],
    },
}

const stageCopy: Record<string, { state: string; detail: string }> = {
    optimal: {
        state: 'Operational',
        detail: 'Telemetry is within the expected operating envelope.',
    },
    tracking: {
        state: 'Tracking',
        detail: 'The subsystem is actively following the current strategy.',
    },
    watch: {
        state: 'Needs attention',
        detail: 'The subsystem is being monitored before the next transition.',
    },
}

function localizeMetric(metric: ShowcaseMetric): ShowcaseMetric {
    return {
        ...metric,
        label: metricLabels[metric.id] ?? metric.label,
        note: metricNotes[metric.id] ?? 'Telemetry update',
    }
}

function localizeFrame(
    frame: ShowcaseReplayFrame,
    scenarioName: string,
    index: number
): ShowcaseReplayFrame {
    return {
        ...frame,
        title: `${scenarioName} — Replay step ${index + 1}`,
        summary: 'Telemetry snapshot for the current scenario step.',
        metricOverrides: frame.metricOverrides?.map((override) => ({
            ...override,
            note: metricNotes[override.id] ?? 'Telemetry update',
        })),
        stageOverrides: frame.stageOverrides?.map((override) => ({
            ...override,
            state: stageCopy[override.tone ?? 'tracking'].state,
            detail: stageCopy[override.tone ?? 'tracking'].detail,
        })),
    }
}

export function localizeShowcaseScenario(
    scenario: ShowcaseScenario,
    locale: ShowcaseLocale
): ShowcaseScenario {
    if (locale === 'zh') return scenario

    const meta = scenarioMeta[scenario.id]
    if (!meta) return scenario

    return {
        ...scenario,
        name: meta.name,
        tagline: meta.tagline,
        description: meta.description,
        strategy: { title: meta.strategyTitle, copy: meta.strategyCopy },
        metrics: scenario.metrics.map(localizeMetric),
        track: { ...scenario.track, label: meta.trackLabel, objective: meta.trackObjective },
        trend: {
            ...scenario.trend,
            label: meta.trendLabel,
            startLabel: meta.trendStart,
            endLabel: meta.trendEnd,
        },
        stages: scenario.stages.map((stage) => ({
            ...stage,
            label: subsystemLabels[stage.id] ?? stage.label,
            ...stageCopy[stage.tone],
        })),
        subsystems: scenario.subsystems.map((subsystem) => ({
            ...subsystem,
            label: subsystemLabels[subsystem.id] ?? subsystem.label,
            ...(subsystemCopy[subsystem.id] ?? {}),
        })),
        replay: {
            ...scenario.replay,
            frames: scenario.replay.frames.map((frame, index) =>
                localizeFrame(frame, meta.name, index)
            ),
        },
    }
}

export function getLocalizedShowcaseScenarios(locale: ShowcaseLocale): ShowcaseScenario[] {
    return showcaseScenarios.map((scenario) => localizeShowcaseScenario(scenario, locale))
}

export function getLocalizedShowcaseScripts(locale: ShowcaseLocale): ShowcaseScript[] {
    if (locale === 'zh') return showcaseScripts

    return showcaseScripts.map((script) => ({
        ...script,
        name:
            script.id === 'full-pipeline'
                ? 'Full pipeline walkthrough'
                : script.id === 'high-speed'
                  ? 'High-speed scenarios'
                  : 'Safety demonstration',
        description:
            script.id === 'full-pipeline'
                ? 'Walk through the complete perception-to-actuation pipeline.'
                : script.id === 'high-speed'
                  ? 'Focus on high-speed tracking and straight-line acceleration.'
                  : 'Demonstrate emergency braking and the safety loop.',
        steps: script.steps.map((step) => localizeScriptStep(step, locale)),
    }))
}

function localizeScriptStep(step: ShowcaseScriptStep, locale: ShowcaseLocale): ShowcaseScriptStep {
    if (locale === 'zh') return step

    const scenario = scenarioMeta[step.scenarioId]
    const subsystem = subsystemLabels[step.subsystemId] ?? 'Subsystem'
    return {
        ...step,
        title: `${scenario?.name ?? 'Scenario'} · ${subsystem}`,
        narration: `Explain how ${subsystem.toLowerCase()} responds in this scenario.`,
    }
}

export function getLocalizedShowcaseReplaySnapshot(
    snapshot: ShowcaseReplaySnapshot,
    locale: ShowcaseLocale
): ShowcaseReplaySnapshot {
    if (locale === 'zh') return snapshot

    const scenario = localizeShowcaseScenario(snapshot.scenario, locale)
    const localizedMetrics = snapshot.metrics.map((metric) => ({
        ...localizeMetric(metric),
        value: metric.value,
        tone: metric.tone,
    }))
    const localizedStages: ShowcaseStage[] = snapshot.stages.map((stage) => ({
        ...stage,
        label: subsystemLabels[stage.id] ?? stage.label,
        ...stageCopy[stage.tone],
    }))
    const frame = scenario.replay.frames[snapshot.frameIndex] ?? scenario.replay.frames[0]

    return {
        ...snapshot,
        scenario,
        subsystem:
            scenario.subsystems.find((subsystem) => subsystem.id === snapshot.subsystem.id) ??
            scenario.subsystems[0],
        frame,
        metrics: localizedMetrics,
        stages: localizedStages,
        track: {
            ...snapshot.track,
            label: scenario.track.label,
            objective: scenario.track.objective,
        },
    }
}

export function getLocalizedShowcaseScriptStep(
    step: ShowcaseScriptStep | null,
    locale: ShowcaseLocale
): ShowcaseScriptStep | null {
    return step ? localizeScriptStep(step, locale) : null
}
