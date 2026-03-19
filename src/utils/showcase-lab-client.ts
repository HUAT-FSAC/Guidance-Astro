import type {
    ShowcaseCacheSimulationState,
    ShowcaseMetric,
    ShowcaseStage,
    ShowcaseSubsystem,
} from '../data/showcase-lab'
import { safeGetJSON, safeSetJSON } from './storage'
import {
    advanceShowcaseReplay,
    advanceShowcaseScript,
    buildTrendCursor,
    buildTrendPolyline,
    driftShowcaseCache,
    getCacheSimulationSummary,
    getDefaultCacheSimulationState,
    getShowcaseComparisonSnapshot,
    getShowcaseReplaySnapshot,
    getShowcaseScriptSnapshot,
    resetShowcaseCache,
    resolveCompareScenarioId,
    resolveReplayFrameIndex,
    resolveShowcaseScript,
    resolveShowcaseSelection,
    SHOWCASE_SELECTION_STORAGE_KEY,
    type ShowcaseReplaySnapshot,
    type ShowcaseSelection,
    warmShowcaseCache,
} from './showcase-lab'

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg'

interface ShowcaseRuntimeState {
    selection: ShowcaseSelection
    frameIndex: number
    isPlaying: boolean
    // Presentation Console state
    isCompareEnabled: boolean
    compareScenarioId: string | null
    scriptId: string | null
    scriptStepIndex: number
    isScriptPlaying: boolean
    cacheSimulationState: ShowcaseCacheSimulationState
}

function getRequiredElement<T extends Element>(root: ParentNode, selector: string): T {
    const element = root.querySelector<T>(selector)

    if (!element) {
        throw new Error(`Missing showcase element: ${selector}`)
    }

    return element
}

function createHtmlElement(
    document: Document,
    tagName: string,
    className?: string,
    text?: string
): HTMLElement {
    const element = document.createElement(tagName)

    if (className) {
        element.className = className
    }

    if (typeof text === 'string') {
        element.textContent = text
    }

    return element
}

function createSvgElement(document: Document, tagName: string, className?: string): SVGElement {
    const element = document.createElementNS(SVG_NAMESPACE, tagName)

    if (className) {
        element.setAttribute('class', className)
    }

    return element
}

function metricToneClassName(tone?: string): string {
    return `metric-card metric-card--${tone || 'accent'}`
}

function stageToneClassName(tone: string): string {
    return `stage-card tone-${tone}`
}

function stageBadge(tone: string): string {
    if (tone === 'optimal') return 'READY'
    if (tone === 'tracking') return 'TRACK'
    return 'GUARD'
}

function renderBadges(root: HTMLElement, badges: string[]): void {
    const container = getRequiredElement<HTMLElement>(root, '#showcase-badges')
    const document = root.ownerDocument

    container.replaceChildren(
        ...badges.map((badge) => createHtmlElement(document, 'span', 'showcase-badge', badge))
    )
}

function renderMetrics(root: HTMLElement, metrics: ShowcaseMetric[]): void {
    const container = getRequiredElement<HTMLElement>(root, '#showcase-metrics-grid')
    const document = root.ownerDocument
    const metricCards = metrics.map((metric) => {
        const card = createHtmlElement(document, 'article', metricToneClassName(metric.tone))
        card.dataset.showcaseMetric = metric.id

        const label = createHtmlElement(document, 'span', 'metric-label', metric.label)
        const valueRow = createHtmlElement(document, 'div', 'metric-value-row')
        const value = createHtmlElement(document, 'strong', 'metric-value', metric.value)
        const unit = createHtmlElement(document, 'span', 'metric-unit', metric.unit)
        const note = createHtmlElement(document, 'p', 'metric-note', metric.note)

        valueRow.append(value, unit)
        card.append(label, valueRow, note)
        return card
    })

    container.replaceChildren(...metricCards)
}

function renderStages(root: HTMLElement, stages: ShowcaseStage[]): void {
    const container = getRequiredElement<HTMLElement>(root, '#showcase-stage-list')
    const document = root.ownerDocument
    const stageCards = stages.map((stage) => {
        const card = createHtmlElement(document, 'article', stageToneClassName(stage.tone))
        const head = createHtmlElement(document, 'div', 'stage-head')
        const label = createHtmlElement(document, 'strong', undefined, stage.label)
        const badge = createHtmlElement(document, 'span', 'stage-badge', stageBadge(stage.tone))
        const state = createHtmlElement(document, 'p', 'stage-state', stage.state)
        const detail = createHtmlElement(document, 'p', 'stage-detail', stage.detail)

        head.append(label, badge)
        card.append(head, state, detail)
        return card
    })

    container.replaceChildren(...stageCards)
}

function renderMarkers(root: HTMLElement, snapshot: ShowcaseReplaySnapshot): void {
    const container = getRequiredElement<SVGGElement>(root, '#showcase-track-markers')
    const document = root.ownerDocument
    const circles = snapshot.track.markers.map((marker) => {
        const circle = createSvgElement(
            document,
            'circle',
            `track-marker track-marker--${marker.type}`
        )
        circle.setAttribute('cx', String(marker.x))
        circle.setAttribute('cy', String(marker.y))
        circle.setAttribute('r', '6')
        return circle
    })

    container.replaceChildren(...circles)
}

function renderSubsystemTabs(
    root: HTMLElement,
    subsystems: ShowcaseSubsystem[],
    activeSubsystemId: string
): void {
    const container = getRequiredElement<HTMLElement>(root, '#showcase-subsystem-tabs')
    const document = root.ownerDocument
    const tabs = subsystems.map((subsystem) => {
        const isActive = subsystem.id === activeSubsystemId
        const button = createHtmlElement(
            document,
            'button',
            `subsystem-tab${isActive ? ' is-active' : ''}`,
            subsystem.label
        )
        button.type = 'button'
        button.dataset.subsystemId = subsystem.id
        button.setAttribute('aria-pressed', String(isActive))
        return button
    })

    container.replaceChildren(...tabs)
}

function renderSubsystemList(root: HTMLElement, bullets: string[]): void {
    const container = getRequiredElement<HTMLElement>(root, '#showcase-subsystem-list')
    const document = root.ownerDocument

    container.replaceChildren(
        ...bullets.map((bullet) => createHtmlElement(document, 'li', undefined, bullet))
    )
}

function renderReplayPanel(
    root: HTMLElement,
    snapshot: ShowcaseReplaySnapshot,
    isPlaying: boolean
): void {
    getRequiredElement<HTMLElement>(root, '#showcase-replay-title').textContent =
        snapshot.frame.title
    getRequiredElement<HTMLElement>(root, '#showcase-replay-summary').textContent =
        snapshot.frame.summary
    getRequiredElement<HTMLElement>(root, '#showcase-replay-status').textContent = isPlaying
        ? 'Auto'
        : 'Paused'
    getRequiredElement<HTMLElement>(root, '#showcase-replay-autoplay').textContent = isPlaying
        ? 'Automatic Narration'
        : 'Manual Control'
    getRequiredElement<HTMLElement>(root, '#showcase-replay-frame-label').textContent =
        `Frame ${snapshot.frameIndex + 1} / ${snapshot.scenario.replay.frames.length}`

    const playButton = getRequiredElement<HTMLButtonElement>(root, '[data-showcase-replay-play]')
    playButton.textContent = isPlaying ? 'Pause' : 'Play'
    playButton.setAttribute('aria-pressed', String(isPlaying))

    const replayRange = getRequiredElement<HTMLInputElement>(root, '#showcase-replay-range')
    replayRange.max = String(snapshot.scenario.replay.frames.length - 1)
    replayRange.value = String(snapshot.frameIndex)
}

function syncScenarioChips(root: HTMLElement, scenarioId: string): void {
    root.querySelectorAll<HTMLElement>('[data-scenario-id]').forEach((button) => {
        const isActive = button.dataset.scenarioId === scenarioId
        button.classList.toggle('is-active', isActive)
        button.setAttribute('aria-pressed', String(isActive))
    })
}

function clearReplayTimer(root: HTMLElement): void {
    const timerId = Number(root.dataset.replayTimerId || '0')

    if (timerId) {
        window.clearTimeout(timerId)
    }

    delete root.dataset.replayTimerId
}

function clearScriptTimer(root: HTMLElement): void {
    const timerId = Number(root.dataset.scriptTimerId || '0')

    if (timerId) {
        window.clearTimeout(timerId)
    }

    delete root.dataset.scriptTimerId
}

// ==================== Presentation Console Rendering ====================

function renderComparePanel(root: HTMLElement, runtimeState: ShowcaseRuntimeState): void {
    const compareToggle = root.querySelector<HTMLInputElement>('[data-compare-toggle]')
    const comparePanel = root.querySelector<HTMLElement>('[data-compare-panel]')
    const compareScenarioSelect = root.querySelector<HTMLSelectElement>(
        '[data-compare-scenario-select]'
    )

    if (!compareToggle || !comparePanel || !compareScenarioSelect) return

    compareToggle.checked = runtimeState.isCompareEnabled
    comparePanel.style.display = runtimeState.isCompareEnabled ? 'block' : 'none'

    if (!runtimeState.isCompareEnabled) return

    const compareScenarioId =
        runtimeState.compareScenarioId ||
        resolveCompareScenarioId(runtimeState.selection.scenarioId)
    compareScenarioSelect.value = compareScenarioId

    const comparison = getShowcaseComparisonSnapshot(
        runtimeState.selection.scenarioId,
        compareScenarioId,
        runtimeState.frameIndex,
        0
    )

    // Render delta highlights
    const highlightsContainer = comparePanel.querySelector<HTMLUListElement>(
        '[data-compare-highlights]'
    )
    if (highlightsContainer) {
        highlightsContainer.innerHTML = comparison.deltaHighlights
            .map((highlight) => `<li>${highlight}</li>`)
            .join('')
    }

    // Render metric comparisons
    comparison.metricDeltas.slice(0, 2).forEach((delta) => {
        const metricEl = comparePanel.querySelector<HTMLElement>(`[data-metric-id="${delta.id}"]`)
        if (metricEl) {
            const primaryValueEl = metricEl.querySelector<HTMLElement>('[data-primary-value]')
            const compareValueEl = metricEl.querySelector<HTMLElement>('[data-compare-value]')
            const deltaIndicatorEl = metricEl.querySelector<HTMLElement>('[data-delta-indicator]')

            if (primaryValueEl) primaryValueEl.textContent = String(delta.primaryValue)
            if (compareValueEl) compareValueEl.textContent = String(delta.compareValue)
            if (deltaIndicatorEl) {
                const isPositive = delta.delta > 0
                deltaIndicatorEl.textContent = isPositive ? '↑' : delta.delta < 0 ? '↓' : '→'
                deltaIndicatorEl.style.color = isPositive
                    ? '#10b981'
                    : delta.delta < 0
                      ? '#fb7185'
                      : '#f59e0b'
            }
        }
    })
}

function renderScriptPanel(root: HTMLElement, runtimeState: ShowcaseRuntimeState): void {
    const scriptSelect = root.querySelector<HTMLSelectElement>('[data-script-select]')
    const scriptStepInfo = root.querySelector<HTMLElement>('[data-script-step-info]')
    const scriptStatus = root.querySelector<HTMLElement>('[data-script-status]')

    if (!scriptSelect || !scriptStepInfo || !scriptStatus) return

    const scriptSnapshot = getShowcaseScriptSnapshot(
        runtimeState.scriptId,
        runtimeState.scriptStepIndex
    )

    if (!scriptSnapshot.isValid) {
        scriptSelect.value = ''
        scriptStepInfo.style.display = 'none'
        scriptStatus.textContent = 'Ready'
        return
    }

    scriptSelect.value = runtimeState.scriptId || ''
    scriptStepInfo.style.display = 'block'
    scriptStatus.textContent = runtimeState.isScriptPlaying ? 'Auto' : 'Paused'

    const step = scriptSnapshot.currentStep
    if (!step) return

    const stepCounter = scriptStepInfo.querySelector<HTMLElement>('[data-script-step-counter]')
    const stepTitle = scriptStepInfo.querySelector<HTMLElement>('[data-script-step-title]')
    const stepNarration = scriptStepInfo.querySelector<HTMLElement>('[data-script-step-narration]')

    if (stepCounter) {
        stepCounter.textContent = `Step ${scriptSnapshot.stepIndex + 1} / ${scriptSnapshot.totalSteps}`
    }
    if (stepTitle) stepTitle.textContent = step.title
    if (stepNarration) stepNarration.textContent = step.narration
}

function renderCachePanel(root: HTMLElement, runtimeState: ShowcaseRuntimeState): void {
    const cacheStatus = root.querySelector<HTMLElement>('[data-cache-status]')
    const cachePacks = root.querySelector<HTMLElement>('[data-cache-packs]')
    const cacheHitRate = root.querySelector<HTMLElement>('[data-cache-hit-rate]')
    const cacheLastSync = root.querySelector<HTMLElement>('[data-cache-last-sync]')

    if (!cacheStatus || !cachePacks || !cacheHitRate || !cacheLastSync) return

    const state = runtimeState.cacheSimulationState
    const summary = getCacheSimulationSummary(state)

    cacheStatus.textContent = summary.statusLabel
    cacheStatus.setAttribute('data-status', state.mode)
    // 使用 resources 数组的长度作为缓存包数量
    cachePacks.textContent = String(state.resources.length)
    cacheHitRate.textContent = `${state.hitRate}%`
    // 格式化最后同步时间
    const lastSyncLabel = state.lastSyncTime
        ? new Date(state.lastSyncTime).toLocaleTimeString()
        : '从未同步'
    cacheLastSync.textContent = lastSyncLabel

    // Render resource statuses
    state.resources.forEach((resource, index) => {
        const resourceEl = root.querySelector<HTMLElement>(`[data-resource-index="${index}"]`)
        if (resourceEl) {
            const statusEl = resourceEl.querySelector<HTMLElement>('[data-cache-resource-status]')
            if (statusEl) {
                statusEl.setAttribute('data-status', resource.status)
                statusEl.textContent =
                    resource.status === 'ready'
                        ? 'Ready'
                        : resource.status === 'stale'
                          ? 'Stale'
                          : 'Pending'
            }
        }
    })
}

function renderShowcase(
    root: HTMLElement,
    runtimeState: ShowcaseRuntimeState
): ShowcaseRuntimeState {
    const snapshot = getShowcaseReplaySnapshot(runtimeState.selection, runtimeState.frameIndex)
    const trendCursor = buildTrendCursor(
        snapshot.scenario.trend.values,
        snapshot.trendCursorIndex,
        320,
        110,
        14
    )

    getRequiredElement<HTMLElement>(root, '[data-showcase-scenario-name]').textContent =
        snapshot.scenario.name
    getRequiredElement<HTMLElement>(root, '#showcase-tagline').textContent =
        snapshot.scenario.tagline
    getRequiredElement<HTMLElement>(root, '#showcase-description').textContent =
        snapshot.scenario.description
    getRequiredElement<HTMLElement>(root, '#showcase-strategy-title').textContent =
        snapshot.scenario.strategy.title
    getRequiredElement<HTMLElement>(root, '#showcase-strategy-copy').textContent =
        snapshot.scenario.strategy.copy
    getRequiredElement<HTMLElement>(root, '#showcase-track-label').textContent =
        snapshot.track.label
    getRequiredElement<HTMLElement>(root, '#showcase-track-objective').textContent =
        snapshot.track.objective
    getRequiredElement<SVGPathElement>(root, '#showcase-track-path').setAttribute(
        'd',
        snapshot.track.path
    )
    getRequiredElement<SVGPathElement>(root, '#showcase-track-progress').setAttribute(
        'd',
        snapshot.track.progressPath
    )
    renderMarkers(root, snapshot)
    getRequiredElement<SVGCircleElement>(root, '#showcase-track-car').setAttribute(
        'cx',
        String(snapshot.track.car.x)
    )
    getRequiredElement<SVGCircleElement>(root, '#showcase-track-car').setAttribute(
        'cy',
        String(snapshot.track.car.y)
    )
    getRequiredElement<HTMLElement>(root, '#showcase-trend-label').textContent =
        snapshot.scenario.trend.label
    getRequiredElement<SVGPolylineElement>(root, '#showcase-trend-line').setAttribute(
        'points',
        buildTrendPolyline(snapshot.scenario.trend.values, 320, 110, 14)
    )
    getRequiredElement<SVGCircleElement>(root, '#showcase-trend-cursor').setAttribute(
        'cx',
        String(trendCursor.x)
    )
    getRequiredElement<SVGCircleElement>(root, '#showcase-trend-cursor').setAttribute(
        'cy',
        String(trendCursor.y)
    )
    getRequiredElement<HTMLElement>(root, '#showcase-trend-start').textContent =
        snapshot.scenario.trend.startLabel
    getRequiredElement<HTMLElement>(root, '#showcase-trend-end').textContent =
        snapshot.scenario.trend.endLabel
    renderMetrics(root, snapshot.metrics)
    renderStages(root, snapshot.stages)
    renderBadges(root, snapshot.scenario.badges)
    renderSubsystemTabs(root, snapshot.scenario.subsystems, snapshot.selection.subsystemId)
    getRequiredElement<HTMLElement>(root, '#showcase-subsystem-eyebrow').textContent =
        snapshot.subsystem.eyebrow
    getRequiredElement<HTMLElement>(root, '#showcase-subsystem-headline').textContent =
        snapshot.subsystem.headline
    getRequiredElement<HTMLElement>(root, '#showcase-subsystem-summary').textContent =
        snapshot.subsystem.summary
    renderSubsystemList(root, snapshot.subsystem.bullets)
    renderReplayPanel(root, snapshot, runtimeState.isPlaying)
    syncScenarioChips(root, snapshot.selection.scenarioId)

    // Render Presentation Console
    renderComparePanel(root, runtimeState)
    renderScriptPanel(root, runtimeState)
    renderCachePanel(root, runtimeState)

    return {
        ...runtimeState,
        selection: snapshot.selection,
        frameIndex: snapshot.frameIndex,
    }
}

function scheduleReplay(
    root: HTMLElement,
    runtimeState: ShowcaseRuntimeState,
    applyState: (
        nextState: ShowcaseRuntimeState | ((prev: ShowcaseRuntimeState) => ShowcaseRuntimeState)
    ) => void
): void {
    clearReplayTimer(root)

    if (!runtimeState.isPlaying) {
        return
    }

    const snapshot = getShowcaseReplaySnapshot(runtimeState.selection, runtimeState.frameIndex)
    const timerId = window.setTimeout(() => {
        applyState((currentState) => ({
            ...advanceShowcaseReplay(currentState.selection, currentState.frameIndex),
            isPlaying: true,
        }))
    }, snapshot.scenario.replay.frameDurationMs)

    root.dataset.replayTimerId = String(timerId)
}

const SHOWCASE_CONSOLE_STORAGE_KEY = 'huat-showcase-console'

interface StoredConsoleState {
    isCompareEnabled: boolean
    compareScenarioId: string | null
    scriptId: string | null
    scriptStepIndex: number
    cacheSimulationMode: ShowcaseCacheSimulationState['mode']
}

function getStoredSelection(root: HTMLElement): ShowcaseSelection {
    const storageKey = root.getAttribute('data-storage-key') || SHOWCASE_SELECTION_STORAGE_KEY
    return resolveShowcaseSelection(safeGetJSON(storageKey, null))
}

function persistSelection(root: HTMLElement, selection: ShowcaseSelection): void {
    const storageKey = root.getAttribute('data-storage-key') || SHOWCASE_SELECTION_STORAGE_KEY
    safeSetJSON(storageKey, selection)
}

function getStoredConsoleState(): StoredConsoleState | null {
    return safeGetJSON<StoredConsoleState>(SHOWCASE_CONSOLE_STORAGE_KEY, null)
}

function persistConsoleState(
    state: Omit<ShowcaseRuntimeState, 'selection' | 'frameIndex' | 'isPlaying'>
): void {
    const storedState: StoredConsoleState = {
        isCompareEnabled: state.isCompareEnabled,
        compareScenarioId: state.compareScenarioId,
        scriptId: state.scriptId,
        scriptStepIndex: state.scriptStepIndex,
        cacheSimulationMode: state.cacheSimulationState.mode,
    }
    safeSetJSON(SHOWCASE_CONSOLE_STORAGE_KEY, storedState)
}

function scheduleScriptPlayback(
    root: HTMLElement,
    runtimeState: ShowcaseRuntimeState,
    applyState: (
        nextState: ShowcaseRuntimeState | ((prev: ShowcaseRuntimeState) => ShowcaseRuntimeState)
    ) => void
): void {
    clearScriptTimer(root)

    if (!runtimeState.isScriptPlaying || !runtimeState.scriptId) {
        return
    }

    const script = resolveShowcaseScript(runtimeState.scriptId)
    if (!script) return

    const timerId = window.setTimeout(() => {
        const nextScriptState = advanceShowcaseScript(
            runtimeState.scriptId,
            runtimeState.scriptStepIndex
        )
        const nextSnapshot = getShowcaseScriptSnapshot(
            nextScriptState.scriptId,
            nextScriptState.stepIndex
        )

        if (nextSnapshot.isValid && nextSnapshot.currentStep) {
            applyState((currentState) => ({
                ...currentState,
                selection: resolveShowcaseSelection({
                    scenarioId: nextSnapshot.currentStep!.scenarioId,
                    subsystemId: nextSnapshot.currentStep!.subsystemId,
                }),
                frameIndex: nextSnapshot.currentStep!.frameIndex,
                isPlaying: false,
                scriptStepIndex: nextScriptState.stepIndex,
                isScriptPlaying: true,
            }))
        }
    }, 3000) // 3 seconds per step

    root.dataset.scriptTimerId = String(timerId)
}

function bindShowcaseLab(root: HTMLElement): void {
    if (root.dataset.showcaseReady === 'true') {
        return
    }

    root.dataset.showcaseReady = 'true'

    const storedConsoleState = getStoredConsoleState()
    const initialCompareScenarioId =
        storedConsoleState?.compareScenarioId ||
        resolveCompareScenarioId(getStoredSelection(root).scenarioId)

    let runtimeState: ShowcaseRuntimeState = {
        selection: getStoredSelection(root),
        frameIndex: 0,
        isPlaying: false,
        // Presentation Console state
        isCompareEnabled: storedConsoleState?.isCompareEnabled || false,
        compareScenarioId: initialCompareScenarioId,
        scriptId: storedConsoleState?.scriptId || null,
        scriptStepIndex: storedConsoleState?.scriptStepIndex || 0,
        isScriptPlaying: false,
        cacheSimulationState: getDefaultCacheSimulationState(),
    }

    const applyState = (
        nextState: ShowcaseRuntimeState | ((prev: ShowcaseRuntimeState) => ShowcaseRuntimeState)
    ): void => {
        runtimeState = typeof nextState === 'function' ? nextState(runtimeState) : nextState
        runtimeState = renderShowcase(root, runtimeState)
        persistSelection(root, runtimeState.selection)
        persistConsoleState(runtimeState)
        scheduleReplay(root, runtimeState, applyState)
        scheduleScriptPlayback(root, runtimeState, applyState)
    }

    applyState(runtimeState)

    root.addEventListener('click', (event) => {
        if (!(event.target instanceof Element)) {
            return
        }

        const trigger = event.target.closest<HTMLElement>(
            '[data-scenario-id], [data-subsystem-id], [data-showcase-replay-prev], [data-showcase-replay-play], [data-showcase-replay-next], [data-script-prev], [data-script-next], [data-script-auto-narrate], [data-cache-warm], [data-cache-drift], [data-cache-reset]'
        )

        if (!trigger || !root.contains(trigger)) {
            return
        }

        if (trigger.dataset.scenarioId) {
            // When switching scenarios, update compare scenario if it conflicts
            const newScenarioId = trigger.dataset.scenarioId
            let newCompareScenarioId = runtimeState.compareScenarioId
            if (newCompareScenarioId === newScenarioId) {
                newCompareScenarioId = resolveCompareScenarioId(newScenarioId)
            }

            applyState({
                ...runtimeState,
                selection: resolveShowcaseSelection({ scenarioId: newScenarioId }),
                frameIndex: 0,
                isPlaying: false,
                compareScenarioId: newCompareScenarioId,
            })
            return
        }

        if (trigger.dataset.subsystemId) {
            applyState({
                ...runtimeState,
                selection: resolveShowcaseSelection({
                    scenarioId: runtimeState.selection.scenarioId,
                    subsystemId: trigger.dataset.subsystemId,
                }),
                frameIndex: runtimeState.frameIndex,
                isPlaying: false,
                isScriptPlaying: false, // Pause script on manual interaction
            })
            return
        }

        if (trigger.hasAttribute('data-showcase-replay-prev')) {
            const snapshot = getShowcaseReplaySnapshot(
                runtimeState.selection,
                runtimeState.frameIndex
            )
            applyState({
                ...runtimeState,
                frameIndex: resolveReplayFrameIndex(snapshot.scenario, runtimeState.frameIndex - 1),
                isPlaying: false,
                isScriptPlaying: false,
            })
            return
        }

        if (trigger.hasAttribute('data-showcase-replay-next')) {
            const snapshot = getShowcaseReplaySnapshot(
                runtimeState.selection,
                runtimeState.frameIndex
            )
            applyState({
                ...runtimeState,
                frameIndex: resolveReplayFrameIndex(snapshot.scenario, runtimeState.frameIndex + 1),
                isPlaying: false,
                isScriptPlaying: false,
            })
            return
        }

        if (trigger.hasAttribute('data-showcase-replay-play')) {
            applyState({
                ...runtimeState,
                isPlaying: !runtimeState.isPlaying,
                isScriptPlaying: false,
            })
            return
        }

        // Script controls
        if (trigger.hasAttribute('data-script-prev')) {
            const newStepIndex = Math.max(runtimeState.scriptStepIndex - 1, 0)
            const snapshot = getShowcaseScriptSnapshot(runtimeState.scriptId, newStepIndex)
            if (snapshot.isValid && snapshot.currentStep) {
                applyState({
                    ...runtimeState,
                    selection: resolveShowcaseSelection({
                        scenarioId: snapshot.currentStep.scenarioId,
                        subsystemId: snapshot.currentStep.subsystemId,
                    }),
                    frameIndex: snapshot.currentStep.frameIndex,
                    scriptStepIndex: newStepIndex,
                    isScriptPlaying: false,
                    isPlaying: false,
                })
            }
            return
        }

        if (trigger.hasAttribute('data-script-next')) {
            const nextState = advanceShowcaseScript(
                runtimeState.scriptId,
                runtimeState.scriptStepIndex
            )
            const snapshot = getShowcaseScriptSnapshot(nextState.scriptId, nextState.stepIndex)
            if (snapshot.isValid && snapshot.currentStep) {
                applyState({
                    ...runtimeState,
                    selection: resolveShowcaseSelection({
                        scenarioId: snapshot.currentStep.scenarioId,
                        subsystemId: snapshot.currentStep.subsystemId,
                    }),
                    frameIndex: snapshot.currentStep.frameIndex,
                    scriptStepIndex: nextState.stepIndex,
                    isScriptPlaying: false,
                    isPlaying: false,
                })
            }
            return
        }

        if (trigger.hasAttribute('data-script-auto-narrate')) {
            applyState({
                ...runtimeState,
                isScriptPlaying: !runtimeState.isScriptPlaying,
                isPlaying: false,
            })
            return
        }

        // Cache controls
        if (trigger.hasAttribute('data-cache-warm')) {
            const newCacheState = warmShowcaseCache()
            // Simulate extra cache for compare mode
            if (runtimeState.isCompareEnabled) {
                newCacheState.cachedPacks += 2
            }
            applyState({
                ...runtimeState,
                cacheSimulationState: newCacheState,
            })
            return
        }

        if (trigger.hasAttribute('data-cache-drift')) {
            applyState({
                ...runtimeState,
                cacheSimulationState: driftShowcaseCache(),
            })
            return
        }

        if (trigger.hasAttribute('data-cache-reset')) {
            applyState({
                ...runtimeState,
                cacheSimulationState: resetShowcaseCache(),
            })
            return
        }
    })

    root.addEventListener('input', (event) => {
        const target = event.target

        if (!(target instanceof HTMLInputElement)) {
            return
        }

        if (target.id === 'showcase-replay-range') {
            const snapshot = getShowcaseReplaySnapshot(
                runtimeState.selection,
                runtimeState.frameIndex
            )

            applyState({
                ...runtimeState,
                frameIndex: resolveReplayFrameIndex(snapshot.scenario, Number(target.value)),
                isPlaying: false,
                isScriptPlaying: false, // Pause script on manual interaction
            })
            return
        }

        // Compare mode toggle
        if (target.hasAttribute('data-compare-toggle')) {
            applyState({
                ...runtimeState,
                isCompareEnabled: target.checked,
            })
            return
        }
    })

    root.addEventListener('change', (event) => {
        const target = event.target

        if (!(target instanceof HTMLSelectElement)) {
            return
        }

        // Script selection
        if (target.hasAttribute('data-script-select')) {
            const scriptId = target.value || null
            const snapshot = getShowcaseScriptSnapshot(scriptId, 0)

            if (snapshot.isValid && snapshot.currentStep) {
                applyState({
                    ...runtimeState,
                    selection: resolveShowcaseSelection({
                        scenarioId: snapshot.currentStep.scenarioId,
                        subsystemId: snapshot.currentStep.subsystemId,
                    }),
                    frameIndex: snapshot.currentStep.frameIndex,
                    scriptId,
                    scriptStepIndex: 0,
                    isScriptPlaying: false,
                    isPlaying: false,
                })
            } else {
                applyState({
                    ...runtimeState,
                    scriptId: null,
                    scriptStepIndex: 0,
                    isScriptPlaying: false,
                })
            }
            return
        }

        // Compare scenario selection
        if (target.hasAttribute('data-compare-scenario-select')) {
            applyState({
                ...runtimeState,
                compareScenarioId: target.value,
            })
            return
        }
    })
}

export function initShowcaseLabs(): void {
    document.querySelectorAll<HTMLElement>('[data-showcase-lab]').forEach((root) => {
        bindShowcaseLab(root)
    })
}

export function teardownShowcaseLabs(): void {
    document.querySelectorAll<HTMLElement>('[data-showcase-lab]').forEach((root) => {
        clearReplayTimer(root)
        clearScriptTimer(root)
    })
}
