// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
    bindShowcaseLab,
    clearReplayTimer,
    clearScriptTimer,
    initShowcaseLabs,
    teardownShowcaseLabs,
} from '../../src/utils/showcase-lab-client'
import { SHOWCASE_SELECTION_STORAGE_KEY } from '../../src/utils/showcase-lab'

function buildRoot(overrides: Record<string, string> = {}): HTMLElement {
    const root = document.createElement('div')
    root.dataset.locale = overrides.locale ?? 'zh'
    root.dataset.showcaseReady = overrides.showcaseReady ?? 'false'
    root.dataset.storageKey = overrides.storageKey ?? SHOWCASE_SELECTION_STORAGE_KEY
    root.dataset.showcaseLab = 'true'

    root.innerHTML = `
        <div data-showcase-scenario-name></div>
        <div id="showcase-tagline"></div>
        <div id="showcase-description"></div>
        <div id="showcase-strategy-title"></div>
        <div id="showcase-strategy-copy"></div>
        <div id="showcase-track-label"></div>
        <div id="showcase-track-objective"></div>
        <svg>
            <path id="showcase-track-path" />
            <path id="showcase-track-progress" />
            <circle id="showcase-track-car" />
            <polyline id="showcase-trend-line" />
            <circle id="showcase-trend-cursor" />
            <g id="showcase-track-markers"></g>
        </svg>
        <div id="showcase-trend-label"></div>
        <div id="showcase-trend-start"></div>
        <div id="showcase-trend-end"></div>
        <div id="showcase-metrics-grid"></div>
        <div id="showcase-stage-list"></div>
        <div id="showcase-badges"></div>
        <div id="showcase-subsystem-tabs"></div>
        <div id="showcase-subsystem-eyebrow"></div>
        <div id="showcase-subsystem-headline"></div>
        <div id="showcase-subsystem-summary"></div>
        <ul id="showcase-subsystem-list"></ul>
        <div id="showcase-replay-title"></div>
        <div id="showcase-replay-summary"></div>
        <div id="showcase-replay-status"></div>
        <div id="showcase-replay-autoplay"></div>
        <div id="showcase-replay-frame-label"></div>
        <input id="showcase-replay-range" type="range" />
        <button data-showcase-replay-play></button>
        <button data-showcase-replay-prev></button>
        <button data-showcase-replay-next></button>
        <select data-script-select>
            <option value=""></option>
            <option value="full-pipeline">Full Pipeline</option>
        </select>
        <div data-script-step-info>
            <span data-script-step-counter></span>
            <span data-script-step-title></span>
            <span data-script-step-narration></span>
        </div>
        <div data-script-status></div>
        <button data-script-prev></button>
        <button data-script-next></button>
        <button data-script-auto-narrate></button>
        <div data-cache-status></div>
        <div data-cache-packs></div>
        <div data-cache-hit-rate></div>
        <div data-cache-last-sync></div>
        <div data-resource-index="0"><span data-cache-resource-status></span></div>
        <div data-resource-index="1"><span data-cache-resource-status></span></div>
        <button data-cache-warm></button>
        <button data-cache-drift></button>
        <button data-cache-reset></button>
        <input data-compare-toggle type="checkbox" />
        <div data-compare-panel>
            <select data-compare-scenario-select>
                <option value=""></option>
                <option value="emergency-brake">Brake</option>
                <option value="straight-high-speed">Straight</option>
            </select>
            <ul data-compare-highlights></ul>
            <div data-metric-id="speed">
                <div data-primary-value></div>
                <div data-compare-value></div>
                <div data-delta-indicator></div>
            </div>
            <div data-metric-id="confidence">
                <div data-primary-value></div>
                <div data-compare-value></div>
                <div data-delta-indicator></div>
            </div>
        </div>
        <button data-scenario-id="launch-calibration"></button>
        <button data-scenario-id="straight-high-speed"></button>
        <button data-subsystem-id="perception"></button>
        <button data-subsystem-id="planning"></button>
    `

    return root
}

describe('showcase-lab-client', () => {
    beforeEach(() => {
        vi.useFakeTimers()
        localStorage.clear()
    })

    afterEach(() => {
        teardownShowcaseLabs()
        document.body.innerHTML = ''
        vi.clearAllTimers()
        vi.restoreAllMocks()
        vi.useRealTimers()
    })

    it('renders required DOM nodes from a fixture root', () => {
        const root = buildRoot()
        bindShowcaseLab(root)

        expect(root.querySelector('#showcase-tagline')?.textContent).not.toBe('')
        expect(root.querySelector('#showcase-track-path')?.getAttribute('d')).not.toBeNull()
        expect(root.querySelector('#showcase-metrics-grid')?.children.length).toBeGreaterThan(0)
    })

    it('returns early if root already has showcaseReady=true', () => {
        const root = buildRoot({ showcaseReady: 'true' })
        bindShowcaseLab(root)
        expect(root.querySelector('#showcase-tagline')?.textContent).toBe('')
    })

    it('updates state when a scenario chip is clicked and updates compare scenario if conflicting', () => {
        const root = buildRoot()
        bindShowcaseLab(root)

        const chip = root.querySelector('[data-scenario-id="straight-high-speed"]') as HTMLElement
        chip.click()
        expect(root.querySelector('#showcase-tagline')?.textContent).not.toBe('')

        // Click again with compare scenario matching
        const chipSame = root.querySelector(
            '[data-scenario-id="launch-calibration"]'
        ) as HTMLElement
        chipSame.click()
        expect(root.querySelector('#showcase-tagline')?.textContent).not.toBe('')
    })

    it('updates state when a subsystem tab is clicked', () => {
        const root = buildRoot()
        bindShowcaseLab(root)

        const planningBtn = root.querySelector('[data-subsystem-id="planning"]') as HTMLElement
        planningBtn.click()

        expect(root.querySelector('#showcase-subsystem-headline')?.textContent).not.toBe('')
    })

    it('schedules replay timer when playing and clears it when paused', () => {
        const root = buildRoot()
        bindShowcaseLab(root)

        const playButton = root.querySelector('[data-showcase-replay-play]') as HTMLElement
        playButton.click()
        expect(root.dataset.replayTimerId).not.toBeUndefined()

        // Advance timer to trigger scheduleReplay callback
        vi.advanceTimersByTime(2000)

        playButton.click()
        expect(root.dataset.replayTimerId).toBeUndefined()
    })

    it('handles replay prev, next buttons and range input', () => {
        const root = buildRoot()
        bindShowcaseLab(root)

        const prevBtn = root.querySelector('[data-showcase-replay-prev]') as HTMLElement
        const nextBtn = root.querySelector('[data-showcase-replay-next]') as HTMLElement
        const range = root.querySelector('#showcase-replay-range') as HTMLInputElement

        nextBtn.click()
        prevBtn.click()

        range.value = '1'
        range.dispatchEvent(new Event('input', { bubbles: true }))
        expect(range.value).toBe('1')
    })

    it('handles script selection, prev, next, auto-narrate and timer advance', () => {
        const root = buildRoot()
        bindShowcaseLab(root)

        const scriptSelect = root.querySelector('[data-script-select]') as HTMLSelectElement
        const nextBtn = root.querySelector('[data-script-next]') as HTMLElement
        const prevBtn = root.querySelector('[data-script-prev]') as HTMLElement
        const autoNarrateBtn = root.querySelector('[data-script-auto-narrate]') as HTMLElement

        // Select valid script
        scriptSelect.value = 'full-pipeline'
        scriptSelect.dispatchEvent(new Event('change', { bubbles: true }))

        // Step forward and backward
        nextBtn.click()
        prevBtn.click()

        // Toggle auto-narrate
        autoNarrateBtn.click()
        expect(root.dataset.scriptTimerId).not.toBeUndefined()

        // Advance script timer
        vi.advanceTimersByTime(4000)

        // Turn off auto-narrate
        autoNarrateBtn.click()

        // Select empty script
        scriptSelect.value = ''
        scriptSelect.dispatchEvent(new Event('change', { bubbles: true }))
    })

    it('handles cache controls (warm, drift, reset)', () => {
        const root = buildRoot()
        bindShowcaseLab(root)

        const warmBtn = root.querySelector('[data-cache-warm]') as HTMLElement
        const driftBtn = root.querySelector('[data-cache-drift]') as HTMLElement
        const resetBtn = root.querySelector('[data-cache-reset]') as HTMLElement

        warmBtn.click()
        expect(root.querySelector('[data-cache-status]')?.textContent).not.toBe('')

        driftBtn.click()
        expect(root.querySelector('[data-cache-status]')?.textContent).not.toBe('')

        resetBtn.click()
        expect(root.querySelector('[data-cache-status]')?.textContent).not.toBe('')
    })

    it('handles comparison mode toggle and scenario change', () => {
        const root = buildRoot()
        bindShowcaseLab(root)

        const compareToggle = root.querySelector('[data-compare-toggle]') as HTMLInputElement
        const compareSelect = root.querySelector(
            '[data-compare-scenario-select]'
        ) as HTMLSelectElement

        // Toggle comparison on
        compareToggle.checked = true
        compareToggle.dispatchEvent(new Event('input', { bubbles: true }))

        const comparePanel = root.querySelector('[data-compare-panel]') as HTMLElement
        expect(comparePanel.style.display).toBe('block')

        // Change compare scenario
        compareSelect.value = 'emergency-brake'
        compareSelect.dispatchEvent(new Event('change', { bubbles: true }))

        // Toggle comparison off
        compareToggle.checked = false
        compareToggle.dispatchEvent(new Event('input', { bubbles: true }))
        expect(comparePanel.style.display).toBe('none')
    })

    it('loads and restores stored console state from localStorage', () => {
        const storedConsole = {
            isCompareEnabled: true,
            compareScenarioId: 'emergency-brake',
            scriptId: 'high-speed',
            scriptStepIndex: 1,
            cacheSimulationMode: 'warmed',
        }
        localStorage.setItem('huat-showcase-console', JSON.stringify(storedConsole))

        const root = buildRoot()
        bindShowcaseLab(root)

        const comparePanel = root.querySelector('[data-compare-panel]') as HTMLElement
        expect(comparePanel.style.display).toBe('block')
    })

    it('supports English locale binding', () => {
        const root = buildRoot({ locale: 'en' })
        document.body.appendChild(root)
        bindShowcaseLab(root, 'en')

        expect(root.querySelector('#showcase-tagline')?.textContent).not.toBe('')
    })

    it('initializes and tears down via initShowcaseLabs and teardownShowcaseLabs', () => {
        const root = buildRoot()
        document.body.appendChild(root)

        initShowcaseLabs()
        expect(root.dataset.showcaseReady).toBe('true')

        teardownShowcaseLabs()
        expect(root.dataset.replayTimerId).toBeUndefined()
        expect(root.dataset.scriptTimerId).toBeUndefined()
    })

    it('clears all timers during teardown', () => {
        const root = buildRoot({ locale: 'zh' })
        document.body.appendChild(root)
        bindShowcaseLab(root)
        root.dataset.replayTimerId = '123'
        root.dataset.scriptTimerId = '456'

        const clearTimeoutSpy = vi.spyOn(window, 'clearTimeout')
        clearReplayTimer(root)
        clearScriptTimer(root)

        expect(clearTimeoutSpy).toHaveBeenCalledWith(123)
        expect(clearTimeoutSpy).toHaveBeenCalledWith(456)
        expect(root.dataset.replayTimerId).toBeUndefined()
        expect(root.dataset.scriptTimerId).toBeUndefined()
    })

    it('restores stored selection before first render', () => {
        const stored = {
            scenarioId: 'emergency-brake',
            subsystemId: 'actuation',
        }
        const root = buildRoot({ storageKey: 'showcase-selection-override' })
        localStorage.setItem('showcase-selection-override', JSON.stringify(stored))

        bindShowcaseLab(root)
        expect(root.querySelector('[data-showcase-scenario-name]')?.textContent).not.toBe('')
    })
})
