/**
 * Toast 通知系统
 * 提供全局通知功能，支持多种类型和配置
 */

import { safeGetItem, safeSetItem } from './storage'
import type { Locale } from './i18n'
import { getTranslations } from './i18n'

export type ToastType = 'success' | 'warning' | 'error' | 'info'

export interface ToastOptions {
    /** 通知类型 */
    type?: ToastType
    /** 持续时间（毫秒），0 表示不自动关闭 */
    duration?: number
    /** 位置 */
    position?:
        | 'top-right'
        | 'top-left'
        | 'bottom-right'
        | 'bottom-left'
        | 'top-center'
        | 'bottom-center'
    /** 是否可关闭 */
    closable?: boolean
    /** 动画 */
    animation?: 'fade' | 'slide' | 'bounce'
    /** 语言 */
    locale?: Locale
}

const DEFAULT_OPTIONS: Required<Omit<ToastOptions, 'locale'>> & { locale: Locale } = {
    type: 'info',
    duration: 4000,
    position: 'bottom-right',
    closable: true,
    animation: 'slide',
    locale: 'zh',
}

const STORAGE_KEY = 'huat-toast-history'
const MAX_HISTORY = 50

interface ToastHistoryItem {
    id: string
    message: string
    type: ToastType
    timestamp: number
}

let toastContainer: HTMLElement | null = null
let toastHistory: ToastHistoryItem[] = []

/**
 * 初始化 Toast 容器
 */
function initToastContainer(): HTMLElement {
    if (toastContainer) return toastContainer

    toastContainer = document.createElement('div')
    toastContainer.id = 'huat-toast-container'
    toastContainer.className = 'huat-toast-container'
    document.body.appendChild(toastContainer)

    const style = document.createElement('style')
    style.textContent = `
        .huat-toast-container {
            position: fixed;
            z-index: 9999;
            pointer-events: none;
            display: flex;
            flex-direction: column;
            gap: 12px;
            padding: 16px;
        }
        .huat-toast-container.top-right { top: 0; right: 0; align-items: flex-end; }
        .huat-toast-container.top-left { top: 0; left: 0; align-items: flex-start; }
        .huat-toast-container.bottom-right { bottom: 0; right: 0; align-items: flex-end; }
        .huat-toast-container.bottom-left { bottom: 0; left: 0; align-items: flex-start; }
        .huat-toast-container.top-center { top: 0; left: 50%; transform: translateX(-50%); align-items: center; }
        .huat-toast-container.bottom-center { bottom: 0; left: 50%; transform: translateX(-50%); align-items: center; }
        
        .huat-toast {
            pointer-events: auto;
            min-width: 300px;
            max-width: 450px;
            padding: 16px 20px;
            border-radius: 12px;
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            display: flex;
            align-items: flex-start;
            gap: 12px;
            position: relative;
            overflow: hidden;
        }
        
        :global([data-theme='light']) .huat-toast {
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
        }
        
        .huat-toast.success {
            background: linear-gradient(135deg, rgba(34, 197, 94, 0.95), rgba(22, 163, 74, 0.95));
            border: 1px solid rgba(34, 197, 94, 0.5);
            color: white;
        }
        
        .huat-toast.warning {
            background: linear-gradient(135deg, rgba(245, 158, 11, 0.95), rgba(217, 119, 6, 0.95));
            border: 1px solid rgba(245, 158, 11, 0.5);
            color: white;
        }
        
        .huat-toast.error {
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(220, 38, 38, 0.95));
            border: 1px solid rgba(239, 68, 68, 0.5);
            color: white;
        }
        
        .huat-toast.info {
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.95), rgba(37, 99, 235, 0.95));
            border: 1px solid rgba(59, 130, 246, 0.5);
            color: white;
        }
        
        .huat-toast-icon {
            flex-shrink: 0;
            width: 24px;
            height: 24px;
        }
        
        .huat-toast-content {
            flex: 1;
            min-width: 0;
        }
        
        .huat-toast-message {
            font-size: 14px;
            line-height: 1.5;
            margin: 0;
            word-wrap: break-word;
        }
        
        .huat-toast-close {
            flex-shrink: 0;
            width: 20px;
            height: 20px;
            padding: 0;
            background: rgba(255, 255, 255, 0.2);
            border: none;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s;
        }
        
        .huat-toast-close:hover {
            background: rgba(255, 255, 255, 0.3);
        }
        
        .huat-toast-close svg {
            width: 14px;
            height: 14px;
            color: white;
        }
        
        .huat-toast-progress {
            position: absolute;
            bottom: 0;
            left: 0;
            height: 3px;
            background: rgba(255, 255, 255, 0.3);
            width: 100%;
        }
        
        .huat-toast-progress-bar {
            height: 100%;
            background: white;
            transition: width linear;
        }
        
        @keyframes toastSlideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes toastSlideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        @keyframes toastSlideInLeft {
            from { transform: translateX(-100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes toastSlideOutLeft {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(-100%); opacity: 0; }
        }
        
        @keyframes toastFadeIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes toastFadeOut {
            from { opacity: 1; transform: scale(1); }
            to { opacity: 0; transform: scale(0.9); }
        }
        
        @keyframes toastBounceIn {
            0% { opacity: 0; transform: scale(0.3); }
            50% { transform: scale(1.05); }
            70% { transform: scale(0.9); }
            100% { opacity: 1; transform: scale(1); }
        }
        
        .huat-toast.animating-in {
            animation-duration: 0.3s;
            animation-fill-mode: both;
            animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .huat-toast.animating-out {
            animation-duration: 0.2s;
            animation-fill-mode: both;
            animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .huat-toast.slide-in-right { animation-name: toastSlideInRight; }
        .huat-toast.slide-out-right { animation-name: toastSlideOutRight; }
        .huat-toast.slide-in-left { animation-name: toastSlideInLeft; }
        .huat-toast.slide-out-left { animation-name: toastSlideOutLeft; }
        .huat-toast.fade-in { animation-name: toastFadeIn; }
        .huat-toast.fade-out { animation-name: toastFadeOut; }
        .huat-toast.bounce-in { animation-name: toastBounceIn; }
        
        @media (max-width: 640px) {
            .huat-toast {
                min-width: auto;
                max-width: calc(100vw - 32px);
            }
            .huat-toast-container {
                padding: 12px;
            }
        }
    `
    document.head.appendChild(style)

    return toastContainer
}

/**
 * 获取图标 SVG
 */
function getIconSVG(type: ToastType): string {
    const icons = {
        success: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
        warning: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
        error: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`,
        info: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
    }
    return icons[type]
}

/**
 * 生成唯一 ID
 */
function generateId(): string {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 加载历史记录
 */
function loadHistory(): void {
    try {
        const stored = safeGetItem(STORAGE_KEY)
        if (stored) {
            toastHistory = JSON.parse(stored)
        }
    } catch {
        toastHistory = []
    }
}

/**
 * 保存历史记录
 */
function saveHistory(): void {
    try {
        safeSetItem(STORAGE_KEY, JSON.stringify(toastHistory.slice(-MAX_HISTORY)))
    } catch {}
}

/**
 * 添加到历史记录
 */
function addToHistory(message: string, type: ToastType): void {
    loadHistory()
    toastHistory.push({
        id: generateId(),
        message,
        type,
        timestamp: Date.now(),
    })
    saveHistory()
}

/**
 * 显示 Toast 通知
 */
export function showToast(message: string, options: ToastOptions = {}): string {
    const opts = { ...DEFAULT_OPTIONS, ...options }
    const t = getTranslations(opts.locale)
    const container = initToastContainer()
    container.className = `huat-toast-container ${opts.position}`

    const id = generateId()
    const toast = document.createElement('div')
    toast.id = id
    toast.className = `huat-toast ${opts.type}`

    const isLeft = opts.position.includes('left')
    const slideDirection = isLeft ? 'left' : 'right'

    let animationInClass = 'fade-in'
    let animationOutClass = 'fade-out'

    if (opts.animation === 'slide') {
        animationInClass = `slide-in-${slideDirection}`
        animationOutClass = `slide-out-${slideDirection}`
    } else if (opts.animation === 'bounce') {
        animationInClass = 'bounce-in'
    }

    toast.innerHTML = `
        <div class="huat-toast-icon">${getIconSVG(opts.type)}</div>
        <div class="huat-toast-content">
            <p class="huat-toast-message">${message}</p>
        </div>
        ${
            opts.closable
                ? `
            <button class="huat-toast-close" aria-label="${t.common.close}">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
        `
                : ''
        }
        ${
            opts.duration > 0
                ? `
            <div class="huat-toast-progress">
                <div class="huat-toast-progress-bar" style="width: 0%; transition-duration: ${opts.duration}ms;"></div>
            </div>
        `
                : ''
        }
    `

    container.appendChild(toast)

    toast.classList.add('animating-in', animationInClass)

    let timeoutId: number | null = null

    const closeToast = () => {
        if (timeoutId) {
            clearTimeout(timeoutId)
            timeoutId = null
        }
        toast.classList.remove('animating-in', animationInClass)
        toast.classList.add('animating-out', animationOutClass)
        toast.addEventListener(
            'animationend',
            () => {
                toast.remove()
            },
            { once: true }
        )
    }

    if (opts.closable) {
        const closeBtn = toast.querySelector('.huat-toast-close') as HTMLButtonElement
        closeBtn.addEventListener('click', closeToast)
    }

    if (opts.duration > 0) {
        timeoutId = window.setTimeout(closeToast, opts.duration)
        requestAnimationFrame(() => {
            const progressBar = toast.querySelector('.huat-toast-progress-bar') as HTMLElement
            if (progressBar) {
                progressBar.style.width = '100%'
            }
        })
    }

    addToHistory(message, opts.type)

    return id
}

/**
 * 快捷方法
 */
export function createToast(locale: Locale = 'zh') {
    return {
        success: (message: string, options?: Omit<ToastOptions, 'locale'>) =>
            showToast(message, { ...options, type: 'success', locale }),
        warning: (message: string, options?: Omit<ToastOptions, 'locale'>) =>
            showToast(message, { ...options, type: 'warning', locale }),
        error: (message: string, options?: Omit<ToastOptions, 'locale'>) =>
            showToast(message, { ...options, type: 'error', locale }),
        info: (message: string, options?: Omit<ToastOptions, 'locale'>) =>
            showToast(message, { ...options, type: 'info', locale }),
    }
}

export const toast = createToast('zh')

/**
 * 获取历史记录
 */
export function getToastHistory(): ToastHistoryItem[] {
    loadHistory()
    return [...toastHistory].reverse()
}

/**
 * 清空历史记录
 */
export function clearToastHistory(): void {
    toastHistory = []
    saveHistory()
}

/**
 * 暴露到全局（便于调试）
 */
if (typeof window !== 'undefined') {
    ;(window as unknown as { huatToast?: typeof toast }).huatToast = toast
}
