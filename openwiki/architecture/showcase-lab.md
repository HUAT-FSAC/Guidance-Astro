---
type: concept
title: Showcase Lab Architecture
description: Architecture of the interactive autonomous driving Showcase Lab dashboard, including Presentation Console, Compare Mode, Demo Scripts, and Cache Simulator.
tags: [showcase-lab, architecture, interactive]
timestamp: 2026-04-15
---

# Showcase Lab Architecture

The Showcase Lab is an interactive autonomous driving demonstration dashboard accessible at `/showcase-dashboard/` (Chinese) and `/en/showcase-dashboard/` (English). It visualizes autonomous vehicle subsystems, track maps, and sensor data using pure SVG and browser state management.

## Entry Points

| Page                      | Language | File                                    |
| ------------------------- | -------- | --------------------------------------- |
| `/showcase-dashboard/`    | Chinese  | `src/pages/showcase-dashboard.astro`    |
| `/en/showcase-dashboard/` | English  | `src/pages/en/showcase-dashboard.astro` |

The English entry point (`src/pages/en/showcase-dashboard.astro`, 111 bytes) is a minimal wrapper that imports the same components with locale set to `'en'`.

## Data Layer

### Source Data (`src/data/showcase-lab.ts`, 48520 bytes)

Defines the core data structures and content:

```typescript
interface ShowcaseScenario {
    id: string
    name: string
    tagline: string
    description: string
    strategy: ShowcaseStrategy
    track: ShowcaseTrackMap
    trend: ShowcaseTrend
    stages: ShowcaseStage[]
    subsystems: ShowcaseSubsystem[]
}

interface ShowcaseReplayFrame {
    id: string
    title: string
    summary: string
    progressPath?: string
    car?: { x: number; y: number }
    metricOverrides?: ShowcaseReplayMetricOverride[]
    stageOverrides?: ShowcaseReplayStageOverride[]
}
```

Key data types:

- **ShowcaseMetric**: Real-time metrics (speed, latency, accuracy)
- **ShowcaseTrackMap**: SVG path definitions for track visualization
- **ShowcaseTrend**: Time-series data for trend charts
- **ShowcaseStage**: Pipeline stage status (optimal/tracking/watch)
- **ShowcaseSubsystem**: Subsystem descriptions (sensing, planning, control)
- **ShowcaseScript**: Narration scripts for guided demos
- **ShowcaseScriptStep**: Individual narration steps

### Internationalization (`src/data/showcase-lab-i18n.ts`, 14413 bytes)

Bilingual labels for all UI elements:

```typescript
const showcaseUiLabels = {
    zh: { backHome: '返回首页', title: '智能驾驶交互实验室', ... },
    en: { backHome: 'Back to home', title: 'Autonomous Driving Interaction Lab', ... }
}
```

### Utility Layer (`src/utils/showcase-lab.ts`, 18971 bytes)

Manages showcase lab state and data access:

- `SHOWCASE_SELECTION_STORAGE_KEY` - LocalStorage key for persistence
- `getDefaultShowcaseSelection()` - Returns default scenario/subsystem
- `resolveScenario(scenarioId)` - Resolves scenario by ID
- `getShowcaseReplaySnapshot(selection, frameIndex)` - Builds complete replay snapshot
- `advanceShowcaseReplay()` - Advances to next replay frame
- `advanceShowcaseScript()` - Advances narration script
- `driftShowcaseCache()` - Simulates cache state changes
- `warmShowcaseCache()` - Simulates cache warming
- `resetShowcaseCache()` - Resets cache simulation

## Client Architecture (`src/utils/showcase-lab-client.ts`, 35001 bytes)

The client-side logic manages all interactive behavior:

### Runtime State

```typescript
interface ShowcaseRuntimeState {
    selection: ShowcaseSelection // Current scenario + subsystem
    frameIndex: number // Current replay frame
    isPlaying: boolean // Auto-play state
    isCompareEnabled: boolean // Compare mode toggle
    compareScenarioId: string | null // Comparison scenario
    scriptId: string | null // Active narration script
    scriptStepIndex: number // Current script step
    isScriptPlaying: boolean // Script auto-play
    cacheSimulationState: ShowcaseCacheSimulationState
}
```

### Initialization

`bindShowcaseLab()` initializes the dashboard:

1. Reads locale from `[data-showcase-lab]` element
2. Restores selection from LocalStorage
3. Sets up scenario chip event listeners
4. Initializes Presentation Console controls
5. Binds replay controls (play/pause/frame navigation)
6. Starts cache simulation timer

## UI Components

### Main Dashboard Layout

```
┌─────────────────────────────────────────────────────────┐
│  Header: Logo | Scenario Chips | Back Link              │
├─────────────────────────────────────────────────────────┤
│  Left Panel          │  Center Panel    │  Right Panel │
│  - Scenario Info     │  - Track Map     │  - Metrics   │
│  - Strategy          │  - Car Position  │  - Trends    │
│  - Subsystems        │  - Markers       │  - Stages    │
├─────────────────────────────────────────────────────────┤
│  Presentation Console                                    │
│  - Compare Mode | Demo Script | Cache Simulator         │
│  - Replay Controls (Play/Pause/Frame)                   │
└─────────────────────────────────────────────────────────┘
```

### Presentation Console Features

#### Compare Mode

- Toggle between current scenario and comparison scenario
- Displays delta values for metrics (positive/negative changes)
- Visual indicators show improvement or degradation
- Proven by E2E tests in `tests/e2e/showcase-lab.spec.ts`

#### Demo Script Narration

- Step-by-step guided walkthrough of autonomous driving concepts
- Each step updates the track position, metrics, and descriptions
- Auto-play with configurable timing
- Manual step navigation with previous/next controls
- Steps defined in `showcaseScripts` data

#### Cache Simulator

Simulates offline/online cache behavior:

- **Warm**: Cache is fully populated, fast responses
- **Drift**: Cache ages, some entries become stale
- **Reset**: Cache is cleared, cold start simulation
- Visual indicators show cache state (cold/warm/drifting)

### SVG Visualizations

All visualizations use inline SVG for performance:

1. **Track Map**: Bezier curves for track path, circles for cones/apex/gates
2. **Car Position**: Animated circle following progress path
3. **Trend Chart**: Polyline connecting data points with cursor indicator
4. **Progress Path**: Highlighted portion of track showing completed section

## Data Persistence

User selections persist via LocalStorage:

```typescript
const SHOWCASE_SELECTION_STORAGE_KEY = 'huat-showcase-lab-selection'
```

Stored data includes:

- Selected scenario ID
- Selected subsystem ID
- Compare mode state
- Script selection

## Bilingual Support

The dashboard detects locale from the root element:

```typescript
function getShowcaseLocale(): ShowcaseLocale {
    const root = document.querySelector<HTMLElement>('[data-showcase-lab]')
    return root?.dataset.locale === 'en' ? 'en' : 'zh'
}
```

All UI labels are fetched from `showcaseUiLabels[locale]`.

## Related Pages

- [Home Page Components](../components/home-page.md)
- [Interactive Features](../features/showcase-lab.md)
- [Data Management](../utilities/data-management.md)
