/**
 * 推送通知管理工具
 * 处理 Web Push 订阅、取消订阅和权限管理
 */

// VAPID 公钥（需要从环境变量获取）
const VAPID_PUBLIC_KEY =
    typeof import.meta !== 'undefined' && import.meta.env?.VAPID_PUBLIC_KEY
        ? import.meta.env.VAPID_PUBLIC_KEY
        : ''

interface PushSubscription {
    endpoint: string
    keys: {
        p256dh: string
        auth: string
    }
}

/**
 * 检查浏览器是否支持推送通知
 */
export function isPushSupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window
}

/**
 * 检查通知权限状态
 */
export async function getNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
        return 'denied'
    }
    return Notification.permission
}

/**
 * 请求通知权限
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
        return 'denied'
    }

    const permission = await Notification.requestPermission()
    return permission
}

/**
 * 将 base64 字符串转换为 Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

    const rawData = atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i)
    }

    return outputArray as Uint8Array<ArrayBuffer>
}

/**
 * 获取当前推送订阅
 */
export async function getCurrentSubscription(): Promise<PushSubscription | null> {
    if (!isPushSupported()) {
        return null
    }

    try {
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()

        if (!subscription) {
            return null
        }

        return {
            endpoint: subscription.endpoint,
            keys: {
                p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
                auth: arrayBufferToBase64(subscription.getKey('auth')!),
            },
        }
    } catch (error) {
        console.error('获取订阅失败:', error)
        return null
    }
}

/**
 * 将 ArrayBuffer 转换为 base64 字符串
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
}

/**
 * 订阅推送通知
 */
export async function subscribeToPush(): Promise<{ success: boolean; error?: string }> {
    if (!isPushSupported()) {
        return { success: false, error: '您的浏览器不支持推送通知' }
    }

    // 检查权限
    const permission = await requestNotificationPermission()
    if (permission !== 'granted') {
        return { success: false, error: '需要通知权限才能订阅' }
    }

    try {
        const registration = await navigator.serviceWorker.ready

        // 检查是否已有订阅
        let subscription = await registration.pushManager.getSubscription()

        if (!subscription) {
            // 创建新订阅
            if (!VAPID_PUBLIC_KEY) {
                return { success: false, error: 'VAPID 公钥未配置' }
            }

            const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY)

            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey,
            })
        }

        // 发送到服务器保存
        const pushSubscription: PushSubscription = {
            endpoint: subscription.endpoint,
            keys: {
                p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
                auth: arrayBufferToBase64(subscription.getKey('auth')!),
            },
        }

        const response = await fetch('/api/notifications/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pushSubscription),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || '订阅失败')
        }

        return { success: true }
    } catch (error) {
        console.error('订阅推送失败:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : '订阅失败',
        }
    }
}

/**
 * 取消推送订阅
 */
export async function unsubscribeFromPush(): Promise<{ success: boolean; error?: string }> {
    if (!isPushSupported()) {
        return { success: false, error: '您的浏览器不支持推送通知' }
    }

    try {
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()

        if (subscription) {
            // 从服务器删除订阅
            await fetch('/api/notifications/subscribe', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ endpoint: subscription.endpoint }),
            })

            // 取消浏览器订阅
            await subscription.unsubscribe()
        }

        return { success: true }
    } catch (error) {
        console.error('取消订阅失败:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : '取消订阅失败',
        }
    }
}

/**
 * 检查订阅状态
 */
export async function checkSubscriptionStatus(): Promise<{
    subscribed: boolean
    subscription?: PushSubscription
}> {
    const subscription = await getCurrentSubscription()

    if (!subscription) {
        return { subscribed: false }
    }

    // 验证服务器端是否也有记录
    try {
        const response = await fetch('/api/notifications/subscribe')
        if (response.ok) {
            const data = await response.json()
            return {
                subscribed: data.subscribed,
                subscription,
            }
        }
    } catch (error) {
        console.error('检查订阅状态失败:', error)
    }

    return { subscribed: false }
}

/**
 * 显示本地通知（测试用）
 */
export function showLocalNotification(
    title: string,
    options?: NotificationOptions
): Notification | null {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
        return null
    }

    return new Notification(title, {
        icon: '/favicon.png',
        badge: '/favicon.png',
        ...options,
    })
}

/**
 * 初始化推送通知（自动订阅）
 */
export async function initPushNotifications(autoSubscribe = false): Promise<void> {
    if (!isPushSupported()) {
        console.warn('[PushNotifications] 浏览器不支持推送通知')
        return
    }

    const permission = await getNotificationPermission()

    if (permission === 'denied') {
        console.warn('[PushNotifications] 通知权限已被拒绝')
        return
    }

    if (autoSubscribe && permission === 'granted') {
        const { subscribed } = await checkSubscriptionStatus()
        if (!subscribed) {
            await subscribeToPush()
        }
    }
}

/**
 * 暴露到全局
 */
if (typeof window !== 'undefined') {
    ;(
        window as unknown as {
            huatPush?: {
                isSupported: typeof isPushSupported
                getPermission: typeof getNotificationPermission
                requestPermission: typeof requestNotificationPermission
                subscribe: typeof subscribeToPush
                unsubscribe: typeof unsubscribeFromPush
                checkStatus: typeof checkSubscriptionStatus
                showNotification: typeof showLocalNotification
                init: typeof initPushNotifications
            }
        }
    ).huatPush = {
        isSupported: isPushSupported,
        getPermission: getNotificationPermission,
        requestPermission: requestNotificationPermission,
        subscribe: subscribeToPush,
        unsubscribe: unsubscribeFromPush,
        checkStatus: checkSubscriptionStatus,
        showNotification: showLocalNotification,
        init: initPushNotifications,
    }
}
