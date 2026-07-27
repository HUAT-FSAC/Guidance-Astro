/**
 * 粒子背景（星空 + 连线）客户端逻辑
 *
 * 抽离自 ParticleBackground.astro 的内联 <script>，便于单测与打包缓存。
 *
 * 性能优化（相对原实现）：
 * - 提升密度阈值 + MAX_PARTICLES 上限，降低粒子数（桌面 ≤80、移动 ≤35）。
 * - 连线绘制由 O(n²) 改为空间哈希网格：按 maxDistance 分桶，仅查相邻 9 桶，
 *   复杂度降至 O(n·k)；并仅对 j>i 的配对绘制以避免重复。
 * - 连线在 <1024px 也关闭（原仅 <768px），减轻平板主线程压力。
 * - lineColor 由琥珀 243,156,18 统一为品牌蓝 59,130,246。
 *
 * 保留：prefers-reduced-motion / saveData / 小屏禁用 / visibilitychange 暂停 /
 * requestIdleCallback 延迟初始化 / data-theme 变化重算颜色 / 完整 cleanup。
 */

import { createLogger } from './logger'

const log = createLogger('ParticleBg')

interface Particle {
    x: number
    y: number
    size: number
    speedX: number
    speedY: number
    opacity: number
    twinkleSpeed: number
}

let cleanup: (() => void) | undefined

function initParticles(): void {
    const canvas = document.getElementById('particleCanvas') as HTMLCanvasElement | null
    if (!canvas) {
        log.info('未找到 #particleCanvas，跳过初始化')
        return
    }

    // 清理上一次实例（View Transitions 跨页面复用同一模块）
    if (cleanup) {
        log.info('检测到上一实例，先清理再重建')
        cleanup()
        cleanup = undefined
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isSmallScreen = window.matchMedia('(max-width: 768px)').matches
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
    const saveData = connection?.saveData

    if (prefersReducedMotion || saveData || isSmallScreen) {
        canvas.style.display = 'none'
        log.info('禁用粒子背景（性能/无障碍策略）', {
            prefersReducedMotion,
            saveData: !!saveData,
            isSmallScreen,
        })
        return
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) {
        log.warn('获取 2d 上下文失败，放弃渲染')
        return
    }

    const canvasEl: HTMLCanvasElement = canvas
    const ctx2d: CanvasRenderingContext2D = ctx

    // 桌面/平板/移动分级参数
    const MAX_PARTICLES = isSmallScreen ? 35 : 80
    const DESKTOP_DENSITY = 22000 // 原 15000，越大粒子越少
    const MOBILE_DENSITY = 40000 // 原 26000
    const LINES_MIN_WIDTH = 1024 // <1024px 关闭连线

    let particles: Particle[] = []
    let animationId = 0
    let particleColor = '255, 255, 255'
    let lineColor = '59, 130, 246' // 统一为品牌蓝（原琥珀 243,156,18）
    let drawLines = window.innerWidth >= LINES_MIN_WIDTH
    let particleDensity = isSmallScreen ? MOBILE_DENSITY : DESKTOP_DENSITY
    let maxDistance = isSmallScreen ? 80 : 110
    let frameInterval = isSmallScreen ? 1000 / 30 : 1000 / 60
    let lastFrame = 0

    function updateSettings(): void {
        const smallScreen = window.matchMedia('(max-width: 768px)').matches
        drawLines = window.innerWidth >= LINES_MIN_WIDTH
        particleDensity = smallScreen ? MOBILE_DENSITY : DESKTOP_DENSITY
        maxDistance = smallScreen ? 80 : 110
        frameInterval = smallScreen ? 1000 / 30 : 1000 / 60
    }

    function updateColors(): void {
        const isLight = document.documentElement.getAttribute('data-theme') === 'light'
        particleColor = isLight ? '100, 100, 100' : '255, 255, 255'
        lineColor = '59, 130, 246'
    }

    function initParticleArray(): void {
        particles = []
        const rawCount = Math.floor((canvasEl.width * canvasEl.height) / particleDensity)
        const count = Math.min(rawCount, MAX_PARTICLES)

        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * canvasEl.width,
                y: Math.random() * canvasEl.height,
                size: Math.random() * 2 + 0.5,
                speedX: (Math.random() - 0.5) * 0.3,
                speedY: (Math.random() - 0.5) * 0.3,
                opacity: Math.random() * 0.8 + 0.2,
                twinkleSpeed: Math.random() * 0.02 + 0.01,
            })
        }

        log.info('粒子数组已生成', { rawCount, count, capped: rawCount > count })
    }

    function resize(): void {
        updateSettings()
        canvasEl.width = window.innerWidth
        canvasEl.height = window.innerHeight
        initParticleArray()
        log.info('画布尺寸更新', { width: canvasEl.width, height: canvasEl.height, drawLines })
    }

    /** 构建空间哈希网格：cell 大小 = maxDistance，值为该格内的粒子下标数组。 */
    function buildGrid(): Map<string, number[]> {
        const grid = new Map<string, number[]>()
        const cell = maxDistance
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i]
            const key = `${Math.floor(p.x / cell)},${Math.floor(p.y / cell)}`
            const bucket = grid.get(key)
            if (bucket) bucket.push(i)
            else grid.set(key, [i])
        }
        return grid
    }

    function drawLinesWithGrid(): void {
        const grid = buildGrid()
        const cell = maxDistance
        const maxDistanceSq = maxDistance * maxDistance

        for (let i = 0; i < particles.length; i++) {
            const p1 = particles[i]
            const cx = Math.floor(p1.x / cell)
            const cy = Math.floor(p1.y / cell)

            // 仅查相邻 9 桶；用 j>i 避免重复绘制同一配对
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    const bucket = grid.get(`${cx + dx},${cy + dy}`)
                    if (!bucket) continue
                    for (const j of bucket) {
                        if (j <= i) continue
                        const p2 = particles[j]
                        const ddx = p1.x - p2.x
                        const ddy = p1.y - p2.y
                        const distanceSq = ddx * ddx + ddy * ddy
                        if (distanceSq < maxDistanceSq) {
                            const alpha = 0.1 * (1 - distanceSq / maxDistanceSq)
                            ctx2d.beginPath()
                            ctx2d.moveTo(p1.x, p1.y)
                            ctx2d.lineTo(p2.x, p2.y)
                            ctx2d.strokeStyle = `rgba(${lineColor}, ${alpha})`
                            ctx2d.lineWidth = 0.5
                            ctx2d.stroke()
                        }
                    }
                }
            }
        }
    }

    function animate(now: number): void {
        if (now - lastFrame < frameInterval) {
            animationId = requestAnimationFrame(animate)
            return
        }
        lastFrame = now

        ctx2d.clearRect(0, 0, canvasEl.width, canvasEl.height)

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i]
            p.opacity += Math.sin(now * p.twinkleSpeed) * 0.01
            p.opacity = Math.max(0.1, Math.min(1, p.opacity))

            p.x += p.speedX
            p.y += p.speedY

            if (p.x < 0) p.x = canvasEl.width
            if (p.x > canvasEl.width) p.x = 0
            if (p.y < 0) p.y = canvasEl.height
            if (p.y > canvasEl.height) p.y = 0

            ctx2d.beginPath()
            ctx2d.arc(p.x, p.y, p.size, 0, Math.PI * 2)
            ctx2d.fillStyle = `rgba(${particleColor}, ${p.opacity})`
            ctx2d.fill()
        }

        if (drawLines) drawLinesWithGrid()

        animationId = requestAnimationFrame(animate)
    }

    function startAnimation(): void {
        if (animationId) return
        lastFrame = 0
        animationId = requestAnimationFrame(animate)
        log.info('粒子动画已启动', { frameInterval, drawLines })
    }

    function stopAnimation(): void {
        if (!animationId) return
        cancelAnimationFrame(animationId)
        animationId = 0
        log.info('粒子动画已停止')
    }

    const handleVisibility = (): void => {
        if (document.hidden) {
            log.info('页面隐藏，暂停动画')
            stopAnimation()
        } else {
            log.info('页面恢复可见，恢复动画')
            startAnimation()
        }
    }

    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                updateColors()
                log.info('检测到主题切换，已重算颜色', {
                    theme: document.documentElement.getAttribute('data-theme'),
                })
            }
        }
    })

    updateColors()
    resize()
    startAnimation()
    log.info('粒子背景初始化完成', { particleCount: particles.length, maxDistance })

    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', handleVisibility)
    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme'],
    })

    canvas.style.opacity = '1'

    cleanup = () => {
        stopAnimation()
        window.removeEventListener('resize', resize)
        document.removeEventListener('visibilitychange', handleVisibility)
        observer.disconnect()
        log.info('已清理粒子背景事件与监听')
    }
}

function scheduleInit(): void {
    const run = () => initParticles()
    const idle = (
        window as Window & {
            requestIdleCallback?: (cb: IdleRequestCallback, opts?: IdleRequestOptions) => number
        }
    ).requestIdleCallback

    if (idle) {
        log.info('调度到 requestIdleCallback 初始化（timeout 1500ms）')
        idle(run, { timeout: 1500 })
    } else {
        log.info('requestIdleCallback 不可用，200ms 后初始化')
        setTimeout(run, 200)
    }
}

/** 初始化粒子背景（延迟到 idle）。在 astro:page-load 下调用，内部有重入保护。 */
export function initParticleBackground(): void {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        log.info('initParticleBackground: 文档已就绪，调度初始化', {
            readyState: document.readyState,
        })
        scheduleInit()
    } else {
        log.info('initParticleBackground: 文档未就绪，等待 DOMContentLoaded', {
            readyState: document.readyState,
        })
        document.addEventListener('DOMContentLoaded', scheduleInit, { once: true })
    }
}

/** 视图切换前清理，避免在无粒子画布的页面上继续跑动画。 */
export function destroyParticleBackground(): void {
    if (cleanup) {
        log.info('destroyParticleBackground: 清理粒子背景实例')
        cleanup()
        cleanup = undefined
    }
}
