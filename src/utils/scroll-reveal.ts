/**
 * Scroll Reveal animation using IntersectionObserver
 * Extracted from src/components/home/ui/ScrollReveal.astro
 */

let _scrollRevealCleanup: (() => void) | undefined

export function initScrollReveal(): void {
    if (_scrollRevealCleanup) {
        _scrollRevealCleanup()
        _scrollRevealCleanup = undefined
    }

    const revealElements = document.querySelectorAll('.reveal-upon-scroll')
    if (revealElements.length === 0) return

    const observerOptions: IntersectionObserverInit = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15,
    }

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible')
                observer.unobserve(entry.target)
            }
        })
    }, observerOptions)

    revealElements.forEach((el) => {
        el.classList.remove('is-visible')
        revealObserver.observe(el)
    })

    _scrollRevealCleanup = () => revealObserver.disconnect()
}
