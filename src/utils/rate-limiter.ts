/**
 * API 限流保护模块
 * 基于内存的滑动窗口限流器
 * 适用于 Cloudflare Workers 环境
 */

interface RateLimitEntry {
    count: number
    resetTime: number
}

interface RateLimitConfig {
    // 时间窗口（毫秒）
    windowMs: number
    // 最大请求数
    maxRequests: number
}

// 不同端点的限流配置
export const rateLimitConfigs: Record<string, RateLimitConfig> = {
    // 登录接口：5 分钟内最多 5 次尝试
    login: { windowMs: 5 * 60 * 1000, maxRequests: 5 },
    // 注册接口：1 小时内最多 3 次
    register: { windowMs: 60 * 60 * 1000, maxRequests: 3 },
    // 默认配置：1 分钟内最多 60 次
    default: { windowMs: 60 * 1000, maxRequests: 60 },
}

// 简单的内存存储（注意：Workers 是分布式环境，这是每个实例的内存）
const rateLimitStore = new Map<string, RateLimitEntry>()

/**
 * 清理过期的限流记录
 */
function cleanupExpiredEntries(): void {
    const now = Date.now()
    for (const [key, entry] of rateLimitStore.entries()) {
        if (entry.resetTime < now) {
            rateLimitStore.delete(key)
        }
    }
}

/**
 * 检查是否超过限流阈值
 * @param identifier - 限流标识（IP + 端点）
 * @param config - 限流配置
 * @returns 限流结果
 */
export function checkRateLimit(
    identifier: string,
    config: RateLimitConfig = rateLimitConfigs.default
): { allowed: boolean; remaining: number; resetTime: number } {
    cleanupExpiredEntries()

    const now = Date.now()
    const entry = rateLimitStore.get(identifier)

    if (!entry || entry.resetTime < now) {
        // 新窗口或窗口已过期
        const newEntry: RateLimitEntry = {
            count: 1,
            resetTime: now + config.windowMs,
        }
        rateLimitStore.set(identifier, newEntry)
        return {
            allowed: true,
            remaining: config.maxRequests - 1,
            resetTime: newEntry.resetTime,
        }
    }

    // 当前窗口内
    if (entry.count >= config.maxRequests) {
        return {
            allowed: false,
            remaining: 0,
            resetTime: entry.resetTime,
        }
    }

    entry.count++
    return {
        allowed: true,
        remaining: config.maxRequests - entry.count,
        resetTime: entry.resetTime,
    }
}

/**
 * 从请求中获取客户端标识
 * 优先使用 CF-Connecting-IP，回退到 X-Forwarded-For 或直接 IP
 */
export function getClientIdentifier(request: Request, endpoint: string): string {
    const ip =
        request.headers.get('CF-Connecting-IP') ||
        request.headers.get('X-Forwarded-For')?.split(',')[0].trim() ||
        'unknown'
    return `${ip}:${endpoint}`
}

/**
 * 创建限流响应
 */
export function createRateLimitResponse(resetTime: number): Response {
    const retryAfter = Math.ceil((resetTime - Date.now()) / 1000)
    return new Response(
        JSON.stringify({
            error: '请求过于频繁，请稍后再试',
            retryAfter,
        }),
        {
            status: 429,
            headers: {
                'Content-Type': 'application/json',
                'Retry-After': String(retryAfter),
                'X-RateLimit-Limit': '5',
                'X-RateLimit-Remaining': '0',
                'X-RateLimit-Reset': String(Math.ceil(resetTime / 1000)),
            },
        }
    )
}
