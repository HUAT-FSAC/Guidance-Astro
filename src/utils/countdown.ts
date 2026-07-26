/**
 * 比赛倒计时客户端逻辑
 *
 * 从 .countdown-section[data-start-date] 读取赛事开始日期，
 * 每秒更新天/时/分/秒；过期则切到「赛事已结束」状态。
 *
 * 抽离自 Countdown.astro 原先的 <script define:vars> 内联脚本——
 * define:vars 会输出未打包的原始内联脚本，无法被浏览器缓存；
 * 改为 data 属性传参 + 打包模块后进入可缓存 chunk。
 */

import { createLogger } from './logger'

const log = createLogger('Countdown')

interface CountdownState {
    timer: number
    cleanup: () => void
}

const instances = new WeakMap<Element, CountdownState>()

function pad(n: number): string {
    return String(n).padStart(2, '0')
}

function initCountdown(section: Element): void {
    if (instances.has(section)) {
        log.info('已初始化，跳过重入', { section })
        return
    }

    const startDate = section.getAttribute('data-start-date')
    if (!startDate) {
        log.warn('缺少 data-start-date，放弃初始化', { section })
        return
    }

    const displayEl = section.querySelector<HTMLElement>('#countdown-display')
    const endedEl = section.querySelector<HTMLElement>('#countdown-ended')
    const daysEl = section.querySelector<HTMLElement>('#cd-days')
    const hoursEl = section.querySelector<HTMLElement>('#cd-hours')
    const minutesEl = section.querySelector<HTMLElement>('#cd-minutes')
    const secondsEl = section.querySelector<HTMLElement>('#cd-seconds')

    const target = new Date(startDate).getTime()
    if (Number.isNaN(target)) {
        log.error('startDate 解析为无效日期', { startDate })
        return
    }

    log.info('初始化倒计时', { section, startDate, targetTimestamp: target })

    function update(): void {
        const diff = target - Date.now()

        if (diff <= 0) {
            displayEl?.classList.add('hidden')
            endedEl?.classList.remove('hidden')
            log.info('赛事已结束，切换到回顾状态', { startDate })
            stop()
            return
        }

        const days = Math.floor(diff / 86_400_000)
        const hours = Math.floor((diff % 86_400_000) / 3_600_000)
        const minutes = Math.floor((diff % 3_600_000) / 60_000)
        const seconds = Math.floor((diff % 60_000) / 1000)

        if (daysEl) daysEl.textContent = String(days)
        if (hoursEl) hoursEl.textContent = pad(hours)
        if (minutesEl) minutesEl.textContent = pad(minutes)
        if (secondsEl) secondsEl.textContent = pad(seconds)
    }

    let timer = 0
    function start(): void {
        if (timer) return
        update()
        timer = window.setInterval(update, 1000)
        log.info('倒计时定时器已启动', { intervalMs: 1000 })
    }
    function stop(): void {
        if (timer) {
            clearInterval(timer)
            timer = 0
            log.info('倒计时定时器已停止')
        }
    }

    start()

    instances.set(section, {
        timer,
        cleanup: stop,
    })
}

/** 初始化页面上所有倒计时区块。在 astro:page-load 下调用。 */
export function initCountdowns(): void {
    const sections = document.querySelectorAll('.countdown-section[data-start-date]')
    log.info('扫描倒计时区块', { found: sections.length })
    sections.forEach(initCountdown)
}

/** 视图切换前清理所有倒计时定时器。 */
export function destroyCountdowns(): void {
    const sections = document.querySelectorAll('.countdown-section[data-start-date]')
    let cleaned = 0
    sections.forEach((section) => {
        const state = instances.get(section)
        if (state) {
            state.cleanup()
            instances.delete(section)
            cleaned++
        }
    })
    log.info('清理完成', { scanned: sections.length, cleaned })
}
