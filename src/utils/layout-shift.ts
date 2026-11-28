export interface LayoutShiftSample {
    startTime: number
    value: number
    hadRecentInput?: boolean
}

/** Track the largest CLS session across successive PerformanceObserver batches. */
export function createClsTracker() {
    let sessionStart = 0
    let lastShift = -Infinity
    let sessionValue = 0
    let maximum = 0

    return (entries: readonly LayoutShiftSample[]): number => {
        for (const { startTime, value, hadRecentInput } of entries) {
            if (hadRecentInput) continue
            if (startTime - lastShift >= 1000 || startTime - sessionStart >= 5000) {
                sessionStart = startTime
                sessionValue = 0
            }
            lastShift = startTime
            sessionValue += value
            maximum = Math.max(maximum, sessionValue)
        }
        return maximum
    }
}
