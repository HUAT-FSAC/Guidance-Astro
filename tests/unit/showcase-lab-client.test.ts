// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
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
    root.dataset.showcaseReady = 'false'
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
        <select data-script-select></select>
        <div data-script-step-info></div>
        <div data-script-status></div>
        <button data-cache-warm></button>
        <button data-cache-drift></button>
        <button data-cache-reset></button>
        <input data-compare-toggle type="checkbox" />
        <div data-compare-panel></div>
        <select data-compare-scenario-select></select>
        <ul data-compare-highlights></ul>
        <div data-metric-id="speed">
            <div data-primary-value></div>
            <div data-compare-value></div>
            <div data-delta-indicator></div>
        </div>
        <button data-scenario-id="launch-calibration"></button>
        <button data-scenario-id="straight-high-speed"></button>
        <button data-subsystem-id="perception"></button>
    `

    return root
}

describe('showcase-lab-client', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    it('renders required DOM nodes from a fixture root', () => {
        const root = buildRoot()
        bindShowcaseLab(root)

        expect(root.querySelector('#showcase-tagline')?.textContent).not.toBe('')
        expect(root.querySelector('#showcase-track-path')?.getAttribute('d')).not.toBeNull()
        expect(root.querySelector('#showcase-metrics-grid')?.children.length).toBeGreaterThan(0)
    })

    it('updates state when a scenario chip is clicked', () => {
        const root = buildRoot()
        bindShowcaseLab(root)

        const originalTitle = root.querySelector('#showcase-tagline')?.textContent
        const chip = root.querySelector(
            '[data-scenario-id="straight-high-speed"]'
        ) as HTMLElement | null
        expect(chip).toBeTruthy()

        chip?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        expect(root.querySelector('#showcase-tagline')?.textContent).not.toBe(originalTitle)
    })

    it('schedules replay timer when playing and clears it when paused', () => {
        const root = buildRoot()
        bindShowcaseLab(root)

        const playButton = root.querySelector('[data-showcase-replay-play]') as HTMLElement | null
        expect(playButton).toBeTruthy()

        playButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        expect(root.dataset.replayTimerId).not.toBe('')

        playButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
        expect(root.dataset.replayTimerId).toBeUndefined()
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
        document.body.removeChild(root)
    })

    it('restores stored selection before first render', () => {
        const stored = {
            scenarioId: 'emergency-brake',
            subsystemId: 'actuation',
        }
        const root = buildRoot({ storageKey: 'showcase-selection-override' })
        ;(globalThis as Record<string, unknown>).localStorage = {
            getItem: (key: string) =>
                key === 'showcase-selection-override' ? JSON.stringify(stored) : null,
            setItem: () => {},
            removeItem: () => {},
            clear: () => {},
        } as unknown as Storage

        bindShowcaseLab(root)
        expect(root.querySelector('[data-showcase-scenario-name]')?.textContent).not.toBe('')
    })
})
