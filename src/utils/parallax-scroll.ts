/**
 * Parallax Scrolling logic for elements with [data-parallax]
 * Extracted from src/components/home/ui/ParallaxScroll.astro
 */

let _parallaxCleanup: (() => void) | undefined

export function initParallax(): void {
    if (_parallaxCleanup) {
        _parallaxCleanup()
        _parallaxCleanup = undefined
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const parallaxElements = document.querySelectorAll<HTMLElement>('[data-parallax]')
    if (parallaxElements.length === 0) return

    let isTicking = false

    function updateParallax(): void {
        const scrollY = window.scrollY
        const windowHeight = window.innerHeight

        parallaxElements.forEach((el) => {
            const rect = el.getBoundingClientRect()

            if (rect.top <= windowHeight && rect.bottom >= 0) {
                const speed = parseFloat(el.getAttribute('data-parallax-speed') || '0.3')
                const parallaxType = el.getAttribute('data-parallax-type') || 'background'

                if (parallaxType === 'background') {
                    const centerDistance = rect.top + rect.height / 2 - windowHeight / 2
                    const move = centerDistance * speed
                    el.style.backgroundPositionY = `calc(50% + ${move}px)`
                } else if (parallaxType === 'transform') {
                    const move = scrollY * speed
                    el.style.transform = `translateY(${move}px)`
                }
            }
        })
    }

    function onScroll(): void {
        if (!isTicking) {
            window.requestAnimationFrame(() => {
                updateParallax()
                isTicking = false
            })
            isTicking = true
        }
    }

    updateParallax()
    window.addEventListener('scroll', onScroll, { passive: true })

    _parallaxCleanup = () => {
        window.removeEventListener('scroll', onScroll)
    }
}
