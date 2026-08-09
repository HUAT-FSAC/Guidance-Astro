---
type: concept
title: Showcase Lab Features
description: Interactive Showcase Lab dashboard features including Presentation Console, Compare Mode, Demo Scripts, and Cache Simulator.
tags: [showcase-lab, features, interactive]
timestamp: 2026-04-15
---

# Showcase Lab Features

The Showcase Lab is an interactive autonomous driving demonstration dashboard.

## Access

- Chinese: `/showcase-dashboard/` → `src/pages/showcase-dashboard.astro`
- English: `/en/showcase-dashboard/` → `src/pages/en/showcase-dashboard.astro`

## Dashboard Layout

```
┌─────────────────────────────────────────────────────────┐
│  Header                                                  │
│  [← Back Home] 智能驾驶交互实验室 [Scenario Chips]      │
├─────────────────────────────────────────────────────────┤
│  Left Panel          │  Center Panel    │  Right Panel │
│  - Scenario Name     │  - Track Map SVG │  - Metrics   │
│  - Strategy          │  - Car Position  │  - Trend     │
│  - Subsystems        │  - Cones/Gates   │  - Stages    │
├─────────────────────────────────────────────────────────┤
│  Presentation Console                                    │
│  [Compare Mode] [Demo Script] [Cache Simulator]         │
│  [◀◀] [◀] [▶/⏸] [▶▶] [Frame X/Y]                      │
└─────────────────────────────────────────────────────────┘
```

## Replay System

### Replay Frames

Each scenario contains multiple replay frames showing progressive states:

```typescript
interface ShowcaseReplayFrame {
    id: string
    title: string
    summary: string
    progressPath?: string // SVG path for track progress
    car?: { x: number; y: number } // Car position
    metricOverrides?: ShowcaseReplayMetricOverride[]
    stageOverrides?: ShowcaseReplayStageOverride[]
}
```

### Controls

| Control   | Description             |
| --------- | ----------------------- |
| `◀◀`      | Jump to start           |
| `◀`       | Previous frame          |
| `▶/⏸`     | Play/Pause auto-advance |
| `▶▶`      | Next frame              |
| Frame X/Y | Current frame indicator |

### Auto-Play

Frames auto-advance when playing, with smooth transitions between states.

## Presentation Console

The Presentation Console provides three comparison and narration modes:

### Compare Mode

Compares current scenario against another scenario:

- **Delta Display**: Shows positive/negative changes in metrics
- **Visual Indicators**: Color-coded (green for improvement, red for degradation)
- **Toggle**: Enable/disable comparison
- **Scenario Selection**: Choose comparison target

```typescript
interface ShowcaseReplayMetricOverride {
    id: string
    value: string
    note?: string
    tone?: ShowcaseMetricTone // 'accent' | 'positive' | 'warning'
}
```

### Demo Script

Step-by-step guided narration:

```typescript
interface ShowcaseScript {
    id: string
    title: string
    steps: ShowcaseScriptStep[]
}

interface ShowcaseScriptStep {
    id: string
    title: string
    content: string
    frameIndex: number
    highlightSubsystems?: string[]
}
```

#### Features

- Step navigation (previous/next)
- Auto-play narration
- Frame synchronization
- Subsystem highlighting

### Cache Simulator

Simulates offline/online cache behavior:

| State | Description                      |
| ----- | -------------------------------- |
| Warm  | Cache is fully populated         |
| Drift | Cache ages, entries become stale |
| Reset | Cache is cleared (cold start)    |

#### Simulation Controls

- **Warm**: Simulate cache warming
- **Drift**: Simulate cache aging
- **Reset**: Simulate cold start

```typescript
interface ShowcaseCacheSimulationState {
    status: 'warm' | 'drift' | 'cold'
    hitRate: number
    lastUpdated: number
}
```

## Track Visualization

### SVG Track Map

Renders track using SVG:

```typescript
interface ShowcaseTrackMap {
    label: string
    objective: string
    path: string // Full track path (SVG path data)
    progressPath: string // Completed portion path
    car: { x: number; y: number }
    markers: ShowcaseTrackMarker[]
}
```

### Track Markers

```typescript
interface ShowcaseTrackMarker {
    x: number
    y: number
    type: 'cone' | 'apex' | 'gate'
}
```

- **cone**: Traffic cone markers
- **apex**: Track apex points
- **gate**: Timing gates

## Metrics Display

### Real-time Metrics

```typescript
interface ShowcaseMetric {
    id: string
    label: string
    value: string
    unit: string
    note: string
    tone?: ShowcaseMetricTone // 'accent' | 'positive' | 'warning'
}
```

### Metric Tones

| Tone     | Color  | Meaning          |
| -------- | ------ | ---------------- |
| accent   | Blue   | Normal/standard  |
| positive | Green  | Good/optimal     |
| warning  | Orange | Attention needed |

## Trend Visualization

```typescript
interface ShowcaseTrend {
    label: string
    values: number[] // Time-series data
    startLabel: string
    endLabel: string
}
```

Rendered as SVG polyline with cursor indicator.

## Pipeline Stages

```typescript
interface ShowcaseStage {
    id: string
    label: string
    state: string
    detail: string
    tone: ShowcaseStageTone // 'optimal' | 'tracking' | 'watch'
}
```

### Stage Tones

| Tone     | Badge | Meaning           |
| -------- | ----- | ----------------- |
| optimal  | READY | System ready      |
| tracking | TRACK | Actively tracking |
| watch    | GUARD | Needs attention   |

## Subsystem Display

```typescript
interface ShowcaseSubsystem {
    id: string
    label: string
    eyebrow: string
    headline: string
    summary: string
    bullets: string[]
}
```

Displays detailed information about each autonomous driving subsystem:

- Sensing (感知)
- Localization & Mapping (定位建图)
- Planning & Control (规划控制)

## Data Persistence

User selections persist via LocalStorage:

```typescript
const SHOWCASE_SELECTION_STORAGE_KEY = 'huat-showcase-lab-selection'
```

Stored data:

- Selected scenario ID
- Selected subsystem ID
- Compare mode state
- Script selection

## Bilingual Support

All UI labels are bilingual:

```typescript
export const showcaseUiLabels = {
    zh: {
        title: '智能驾驶交互实验室',
        scenarioInfo: '场景信息',
        // ...
    },
    en: {
        title: 'Autonomous Driving Interaction Lab',
        scenarioInfo: 'Scenario overview',
        // ...
    },
}
```

## Related Pages

- [Showcase Lab Architecture](../architecture/showcase-lab.md)
- [Interactive Features](./interactive.md)
- [Data Management](../utilities/data-management.md)
