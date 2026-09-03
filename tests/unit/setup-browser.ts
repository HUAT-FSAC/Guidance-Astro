/* 共享浏览器桩：统一 localStorage / matchMedia / IntersectionObserver / Starlight global */

const storageMap = new Map<string, string>()

const localStorageMock = {
    getItem(key: string) {
        return storageMap.has(key) ? storageMap.get(key)! : null
    },
    setItem(key: string, value: string) {
        storageMap.set(key, String(value))
    },
    removeItem(key: string) {
        storageMap.delete(key)
    },
    clear() {
        storageMap.clear()
    },
    get length() {
        return storageMap.size
    },
    key(index: number) {
        return Array.from(storageMap.keys())[index] ?? null
    },
}

Object.defineProperty(globalThis, 'localStorage', {
    value: localStorageMock,
    writable: true,
    configurable: true,
})

Object.defineProperty(globalThis, 'matchMedia', {
    value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
    }),
    writable: true,
    configurable: true,
})

// @ts-expect-error Vitest/Rayrun global
if (typeof globalThis.IS_REACT_ACT === 'undefined') {
    Object.defineProperty(globalThis, 'IS_REACT_ACT', {
        value: false,
        writable: true,
        configurable: true,
    })
}

export class MockIntersectionObserver {
    readonly root = null
    readonly rootMargin = ''
    thresholds: number[] = []
    static observed: Element[] = []
    static instances: MockIntersectionObserver[] = []
    readonly observe = (_target: Element) => {
        MockIntersectionObserver.observed.push(_target)
    }
    readonly unobserve = () => {}
    readonly disconnect = () => {}
    readonly takeRecords = () => [] as IntersectionObserverEntry[]

    constructor(
        private callback: IntersectionObserverCallback,
        private options?: IntersectionObserverOptions
    ) {
        MockIntersectionObserver.instances.push(this)
    }

    trigger(target: Element, isIntersecting: boolean) {
        this.callback(
            [
                {
                    target,
                    isIntersecting,
                    intersectionRatio: isIntersecting ? 1 : 0,
                    time: 0,
                    boundingClientRect: {} as DOMRectReadOnly,
                    intersectionRect: {} as DOMRectReadOnly,
                    rootBounds: null,
                },
            ],
            this
        )
    }
}

Object.defineProperty(globalThis, 'IntersectionObserver', {
    value: MockIntersectionObserver,
    writable: true,
    configurable: true,
})

Object.defineProperty(globalThis, 'StarlightThemeProvider', {
    value: {
        updatePickers: () => {},
    },
    writable: true,
    configurable: true,
})
