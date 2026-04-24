/**
 * HUAT FSAC Service Worker
 * 提供离线访问和资源缓存支持
 */

const CACHE_NAME = 'huat-fsac-v4';
const OFFLINE_URL = '/offline.html';

// 需要预缓存的关键资源
const PRECACHE_ASSETS = [
    '/',
    '/favicon.png',
    '/favicon.svg',
    '/manifest.json',
    '/og-image.png',
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
    '.avif',
    '.woff',
    '.woff2',
    '.ico'
];

// 缓存策略配置
const CACHE_STRATEGIES = {
    NETWORK_FIRST: ['text/html', 'application/xhtml+xml'],
    CACHE_FIRST: ['text/css', 'application/javascript', 'image/', 'font/'],
    STALE_WHILE_REVALIDATE: ['application/json', 'application/xml']
};

/**
 * 响应是否适合写入运行时缓存
 */
function shouldCacheResponse(request, response) {
    if (!response || !response.ok) {
        return false;
    }

    const pathname = new URL(request.url).pathname;
    if (pathname === '/sw.js') {
        return false;
    }

    const cacheControl = response.headers.get('Cache-Control') || '';
    return !cacheControl.includes('no-store');
}

/**
 * 检查 URL 是否可缓存
 */
function isCacheable(url) {
    try {
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
    } catch (error) {
        return false;
    }
}

/**
 * 获取响应的内容类型
 */
function getContentType(response) {
    const contentType = response.headers.get('Content-Type') || '';
    return contentType;
}

/**
 * 确定缓存策略
 */
function getCacheStrategy(request, response) {
    if (request.mode === 'navigate') {
        return 'NETWORK_FIRST';
    }

    if (!response) {
        return 'NETWORK_FIRST';
    }

    const contentType = getContentType(response);

    for (const [strategy, types] of Object.entries(CACHE_STRATEGIES)) {
        if (types.some(type => contentType.includes(type))) {
            return strategy;
        }
    }

    return 'NETWORK_FIRST';
}

/**
 * 网络优先策略（用于 HTML 页面）
 */
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);

        // 缓存成功的响应
        if (shouldCacheResponse(request, networkResponse)) {
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

        // 返回一个基本的错误响应
        return new Response('Network error occurred', {
            status: 408,
            headers: { 'Content-Type': 'text/plain' }
        });
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
        if (isCacheable(request.url) && shouldCacheResponse(request, networkResponse)) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        // 对于图片，返回一个占位符
        if (request.url.includes('.' + CACHEABLE_EXTENSIONS.filter(ext => ext.startsWith('.')).join('|'))) {
            return new Response('', {
                status: 404,
                headers: { 'Content-Type': 'text/plain' }
            });
        }

        throw error;
    }
}

/**
 *  stale-while-revalidate 策略（用于频繁更新的资源）
 */
async function staleWhileRevalidate(request) {
    const cachedResponse = await caches.match(request);

    // 并行请求网络
    const fetchPromise = fetch(request).then(async (networkResponse) => {
        if (shouldCacheResponse(request, networkResponse)) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    });

    // 如果有缓存，立即返回，同时在后台更新
    if (cachedResponse) {
        return cachedResponse;
    }

    // 否则等待网络响应
    return fetchPromise;
}

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
 * 请求拦截
 */
self.addEventListener('fetch', (event) => {
    const { request } = event;

    if (request.method !== 'GET') {
        return;
    }

    if (request.url.startsWith('chrome-extension://') ||
        request.url.includes('__vite') ||
        request.url.includes('hot-update') ||
        request.url.includes('livereload')) {
        return;
    }

    const url = new URL(request.url);
    const pathname = url.pathname;

    let strategy;

    if (request.mode === 'navigate') {
        strategy = 'NETWORK_FIRST';
    } else if (pathname.startsWith('/_astro/') || pathname.startsWith('/pagefind/') ||
               CACHEABLE_EXTENSIONS.some(ext => pathname.endsWith(ext) && (
                   ext === '.woff' || ext === '.woff2' || ext === '.css' ||
                   ext === '.png' || ext === '.jpg' || ext === '.jpeg' ||
                   ext === '.svg' || ext === '.webp' || ext === '.avif'
               ))) {
        strategy = 'CACHE_FIRST';
    } else if (pathname.endsWith('.json') || pathname.endsWith('.xml')) {
        strategy = 'STALE_WHILE_REVALIDATE';
    } else {
        strategy = 'NETWORK_FIRST';
    }

    event.respondWith(
        (async () => {
            try {
                switch (strategy) {
                    case 'CACHE_FIRST':
                        return cacheFirst(request);
                    case 'STALE_WHILE_REVALIDATE':
                        return staleWhileRevalidate(request);
                    case 'NETWORK_FIRST':
                    default:
                        return networkFirst(request);
                }
            } catch (_) {
                const cachedResponse = await caches.match(request);
                if (cachedResponse) {
                    return cachedResponse;
                }

                if (request.mode === 'navigate') {
                    return caches.match(OFFLINE_URL);
                }

                return new Response('Network error occurred', {
                    status: 408,
                    headers: { 'Content-Type': 'text/plain' }
                });
            }
        })()
    );
});

/**
 * 后台同步（用于离线数据同步）
 */
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-analytics') {
        console.log('[SW] Syncing analytics data');
        // 实现分析数据同步逻辑
    } else if (event.tag === 'sync-content') {
        console.log('[SW] Syncing content data');
        // 实现内容数据同步逻辑
    }
});

/**
 * 推送通知
 */
self.addEventListener('push', (event) => {
    try {
        const data = event.data?.json() ?? {};

        const options = {
            body: data.body || '有新内容可用',
            icon: data.icon || '/favicon.png',
            badge: data.badge || '/favicon.png',
            tag: data.tag || 'default',
            requireInteraction: data.requireInteraction || false,
            data: data.data || { url: data.url || '/' },
            timestamp: data.timestamp || Date.now(),
            actions: data.actions || [],
            vibrate: data.vibrate || [100, 50, 100]
        };

        event.waitUntil(
            self.registration.showNotification(data.title || 'HUAT FSAC', options)
        );
    } catch (error) {
        console.error('[SW] Push notification error:', error);
    }
});

/**
 * 通知点击处理
 */
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const notificationData = event.notification.data || {};
    const url = notificationData.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // 如果已有窗口打开，聚焦它并导航
                for (const client of clientList) {
                    if (client.url && client.focus) {
                        client.focus();
                        client.navigate(url);
                        return;
                    }
                }
                // 否则打开新窗口
                return clients.openWindow(url);
            })
    );
});

/**
 * 通知关闭处理
 */
self.addEventListener('notificationclose', (event) => {
    console.log('[SW] Notification closed:', event.notification);
});

/**
 * 定期清理过期缓存
 */
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'cleanup-cache') {
        event.waitUntil(
            caches.open(CACHE_NAME)
                .then((cache) => {
                    return cache.keys().then((keys) => {
                        const now = Date.now();
                        const expiredRequests = keys.filter((request) => {
                            // 清理超过30天的缓存
                            const url = new URL(request.url);
                            const timestamp = url.searchParams.get('_ts');
                            if (timestamp) {
                                const cacheTime = parseInt(timestamp, 10);
                                return now - cacheTime > 30 * 24 * 60 * 60 * 1000;
                            }
                            return false;
                        });

                        return Promise.all(
                            expiredRequests.map((request) => cache.delete(request))
                        );
                    });
                })
        );
    }
});
