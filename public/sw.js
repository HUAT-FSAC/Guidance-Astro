/**
 * HUAT FSAC Service Worker
 * 提供离线访问和资源缓存支持
 */

const CACHE_NAME = 'huat-fsac-v1';
const OFFLINE_URL = '/offline.html';

// 需要预缓存的资源
const PRECACHE_ASSETS = [
    '/',
    '/favicon.png',
    '/manifest.json',
    OFFLINE_URL
];

// 需要缓存的静态资源类型
const CACHEABLE_EXTENSIONS = [
    '.html',
    '.css',
    '.js',
    '.json',
    '.png',
    '.jpg',
    '.jpeg',
    '.svg',
    '.webp',
    '.woff',
    '.woff2'
];

/**
 * 安装事件 - 预缓存关键资源
 */
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Pre-caching assets');
                return cache.addAll(PRECACHE_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

/**
 * 激活事件 - 清理旧缓存
 */
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => name !== CACHE_NAME)
                        .map((name) => {
                            console.log('[SW] Deleting old cache:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => self.clients.claim())
    );
});

/**
 * 检查 URL 是否可缓存
 */
function isCacheable(url) {
    const urlObj = new URL(url);

    // 只缓存同源请求
    if (urlObj.origin !== location.origin) {
        return false;
    }

    // 检查文件扩展名
    const pathname = urlObj.pathname;
    return CACHEABLE_EXTENSIONS.some(ext => pathname.endsWith(ext)) ||
        pathname === '/' ||
        pathname.endsWith('/');
}

/**
 * 网络优先策略（用于 HTML 页面）
 */
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);

        // 缓存成功的响应
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        // 网络失败，尝试从缓存获取
        const cachedResponse = await caches.match(request);

        if (cachedResponse) {
            return cachedResponse;
        }

        // 如果是导航请求，返回离线页面
        if (request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
        }

        throw error;
    }
}

/**
 * 缓存优先策略（用于静态资源）
 */
async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
        return cachedResponse;
    }

    try {
        const networkResponse = await fetch(request);

        // 缓存成功的响应
        if (networkResponse.ok && isCacheable(request.url)) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        // 返回一个占位响应或抛出错误
        throw error;
    }
}

/**
 * 请求拦截
 */
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // 跳过非 GET 请求
    if (request.method !== 'GET') {
        return;
    }

    // 跳过浏览器扩展和开发者工具请求
    if (request.url.startsWith('chrome-extension://') ||
        request.url.includes('__vite') ||
        request.url.includes('hot-update')) {
        return;
    }

    // HTML 页面使用网络优先策略
    if (request.mode === 'navigate' ||
        request.headers.get('accept')?.includes('text/html')) {
        event.respondWith(networkFirst(request));
        return;
    }

    // 静态资源使用缓存优先策略
    if (isCacheable(request.url)) {
        event.respondWith(cacheFirst(request));
        return;
    }
});

/**
 * 后台同步（可选）
 */
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-analytics') {
        console.log('[SW] Syncing analytics data');
    }
});

/**
 * 推送通知（可选）
 */
self.addEventListener('push', (event) => {
    const data = event.data?.json() ?? {};

    const options = {
        body: data.body || '有新内容可用',
        icon: '/favicon.png',
        badge: '/favicon.png',
        data: data.url || '/'
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'HUAT FSAC', options)
    );
});

/**
 * 通知点击处理
 */
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    event.waitUntil(
        clients.openWindow(event.notification.data)
    );
});
