import { expect, test } from '@playwright/test'

interface VitalsProbe {
    active: Record<string, number>
    document: Document
    pageLoads: number
    sent: string[]
}

test.use({ reducedMotion: 'reduce' })

for (const enabled of [true, false]) {
    test(`keeps one document-level Web Vitals sample with analytics ${enabled ? 'enabled' : 'absent'}`, async ({
        page,
        baseURL,
    }) => {
        const received: string[] = []
        await page.route('**/*', async (route) => {
            const url = new URL(route.request().url())
            if (url.origin !== new URL(baseURL!).origin) return route.abort()
            if (url.pathname !== '/__vitals-test-receiver') return route.continue()
            const data = route.request().postDataJSON() as { name: string }
            received.push(data.name)
            await route.fulfill({ status: 204 })
        })
        await page.addInitScript((analyticsEnabled) => {
            const active: Record<string, number> = {
                'layout-shift': 0,
                'largest-contentful-paint': 0,
            }
            const probe: VitalsProbe = { active, document, pageLoads: 0, sent: [] }
            Reflect.set(window, 'vitalsProbe', probe)
            document.addEventListener('astro:page-load', () => probe.pageLoads++)
            const NativeObserver = window.PerformanceObserver
            window.PerformanceObserver = class extends NativeObserver {
                private monitoredType?: string

                override observe(options?: PerformanceObserverInit) {
                    super.observe(options)
                    const type = options?.type
                    if (type && type in active && !this.monitoredType) {
                        this.monitoredType = type
                        active[type]++
                    }
                }

                override disconnect() {
                    super.disconnect()
                    if (this.monitoredType) {
                        active[this.monitoredType]--
                        this.monitoredType = undefined
                    }
                }
            }
            if (analyticsEnabled) {
                Reflect.set(window, 'umami', {
                    track(name: string, data: Record<string, unknown>) {
                        if (!name.startsWith('web-vital-')) return
                        probe.sent.push(name)
                        void fetch('/__vitals-test-receiver', {
                            method: 'POST',
                            headers: { 'content-type': 'application/json' },
                            body: JSON.stringify({ name, data }),
                            keepalive: true,
                        })
                    },
                })
            }
        }, enabled)

        await page.goto('/')
        const activeObservers = () =>
            page.evaluate(() => (Reflect.get(window, 'vitalsProbe') as VitalsProbe).active)
        const oneOfEach = { 'layout-shift': 1, 'largest-contentful-paint': 1 }
        await expect.poll(activeObservers).toEqual(oneOfEach)
        for (const destination of ['/join/', '/docs-center/', '/team/']) {
            const previousPageLoads = await page.evaluate((href) => {
                const probe = Reflect.get(window, 'vitalsProbe') as VitalsProbe
                const previousPageLoads = probe.pageLoads
                const link = document.createElement('a')
                link.href = href
                document.body.appendChild(link)
                link.click()
                return previousPageLoads
            }, destination)
            await expect
                .poll(() =>
                    page.evaluate(
                        () => (Reflect.get(window, 'vitalsProbe') as VitalsProbe).pageLoads
                    )
                )
                .toBeGreaterThan(previousPageLoads)
            await expect.poll(() => new URL(page.url()).pathname).toBe(destination)
        }
        await page.evaluate(() => new Promise((resolve) => setTimeout(resolve, 750)))
        expect(
            await page.evaluate(
                () => (Reflect.get(window, 'vitalsProbe') as VitalsProbe).document === document
            )
        ).toBe(true)
        expect(await activeObservers()).toEqual(oneOfEach)

        const sent = await page.evaluate(() => {
            let visibility: DocumentVisibilityState = 'visible'
            Object.defineProperty(document, 'visibilityState', { get: () => visibility })
            for (const state of ['hidden', 'visible', 'hidden'] as const) {
                visibility = state
                document.dispatchEvent(new Event('visibilitychange'))
            }
            window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true }))
            window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }))
            return (Reflect.get(window, 'vitalsProbe') as VitalsProbe).sent
        })
        await expect.poll(activeObservers).toEqual({
            'layout-shift': 0,
            'largest-contentful-paint': 0,
        })
        if (enabled) {
            expect(sent.filter((name) => name === 'web-vital-cls')).toHaveLength(1)
            expect(sent).toContain('web-vital-ttfb')
            expect(new Set(sent).size).toBe(sent.length)
            await expect.poll(() => received.toSorted()).toEqual(sent.toSorted())
        } else {
            expect(sent).toEqual([])
            expect(received).toEqual([])
        }
    })
}
