declare global {
    interface Window {
        huatPush?: {
            isSupported: () => boolean;
            getPermission: () => Promise<NotificationPermission>;
            requestPermission: () => Promise<NotificationPermission>;
            subscribe: () => Promise<{ success: boolean; error?: string }>;
            unsubscribe: () => Promise<{ success: boolean; error?: string }>;
            checkStatus: () => Promise<{ subscribed: boolean; subscription?: PushSubscription }>;
            showNotification: (title: string, options?: NotificationOptions) => Notification | null;
            init: (autoSubscribe?: boolean) => Promise<void>;
        };
    }
}

export function isPushSupported(): boolean {
    return typeof window !== 'undefined' && 'PushManager' in window && 'Notification' in window;
}

export async function getNotificationPermission(): Promise<NotificationPermission> {
    if (!isPushSupported()) {
        return 'denied';
    }
    return await Notification.requestPermission();
}

export async function subscribeToPush(): Promise<{ success: boolean; error?: string }> {
    try {
        if (!isPushSupported()) {
            return { success: false, error: 'Push notifications not supported' };
        }

        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: import.meta.env.PUSH_PUBLIC_KEY || '',
        });

        return { success: true };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

export async function unsubscribeFromPush(): Promise<{ success: boolean; error?: string }> {
    try {
        if (!isPushSupported()) {
            return { success: false, error: 'Push notifications not supported' };
        }

        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        if (subscription) {
            await subscription.unsubscribe();
        }

        return { success: true };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}