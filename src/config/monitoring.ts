/**
 * 监控和告警配置
 * 配置网站监控、性能追踪和错误报告
 */

export interface MonitorConfig {
    enabled: boolean
    uptimeRobot: {
        apiKey: string
        monitorIds: string[]
    }
    analytics: {
        umami: {
            websiteId: string
            host: string
        }
    }
    performance: {
        enabled: boolean
        reportTo: string
        thresholds: {
            fcp: number // ms
            lcp: number // ms
            cls: number
            fid: number // ms
            ttfb: number // ms
        }
    }
    alerts: {
        enabled: boolean
        email: string[]
        slack?: {
            webhookUrl: string
            channel: string
        }
    }
}

export const defaultConfig: MonitorConfig = {
    enabled: true,
    uptimeRobot: {
        apiKey: process.env.UPTIME_ROBOT_API_KEY || '',
        monitorIds: (process.env.UPTIME_ROBOT_MONITOR_IDS || '').split(',').filter(Boolean),
    },
    analytics: {
        umami: {
            websiteId: process.env.UMAMI_WEBSITE_ID || '',
            host: process.env.UMAMI_HOST || 'https://cloud.umami.is',
        },
    },
    performance: {
        enabled: true,
        reportTo: 'umami',
        thresholds: {
            fcp: 1800, // 1.8s
            lcp: 2500, // 2.5s
            cls: 0.1,
            fid: 100, // 100ms
            ttfb: 800, // 800ms
        },
    },
    alerts: {
        enabled: true,
        email: (process.env.ALERT_EMAILS || '').split(',').filter(Boolean),
        slack: process.env.SLACK_WEBHOOK_URL
            ? {
                  webhookUrl: process.env.SLACK_WEBHOOK_URL,
                  channel: process.env.SLACK_CHANNEL || '#dev-alerts',
              }
            : undefined,
    },
}

export function getMonitorConfig(): MonitorConfig {
    const monitorIds = process.env.UPTIME_ROBOT_MONITOR_IDS
        ? process.env.UPTIME_ROBOT_MONITOR_IDS.split(',').filter(Boolean)
        : defaultConfig.uptimeRobot.monitorIds

    return {
        ...defaultConfig,
        uptimeRobot: {
            apiKey: process.env.UPTIME_ROBOT_API_KEY || defaultConfig.uptimeRobot.apiKey,
            monitorIds,
        },
        analytics: {
            umami: {
                websiteId: process.env.UMAMI_WEBSITE_ID || defaultConfig.analytics.umami.websiteId,
                host: process.env.UMAMI_HOST || defaultConfig.analytics.umami.host,
            },
        },
        alerts: {
            enabled: process.env.ALERTS_ENABLED !== 'false',
            email: (process.env.ALERT_EMAILS || '').split(',').filter(Boolean),
            slack: process.env.SLACK_WEBHOOK_URL
                ? {
                      webhookUrl: process.env.SLACK_WEBHOOK_URL,
                      channel: process.env.SLACK_CHANNEL || '#dev-alerts',
                  }
                : undefined,
        },
    }
}

export function checkPerformanceThresholds(metrics: {
    fcp?: number
    lcp?: number
    cls?: number
    fid?: number
    ttfb?: number
}): { passed: boolean; failed: string[] } {
    const config = getMonitorConfig()
    const failed: string[] = []

    if (metrics.fcp !== undefined && metrics.fcp > config.performance.thresholds.fcp) {
        failed.push(`FCP: ${metrics.fcp}ms > ${config.performance.thresholds.fcp}ms`)
    }

    if (metrics.lcp !== undefined && metrics.lcp > config.performance.thresholds.lcp) {
        failed.push(`LCP: ${metrics.lcp}ms > ${config.performance.thresholds.lcp}ms`)
    }

    if (metrics.cls !== undefined && metrics.cls > config.performance.thresholds.cls) {
        failed.push(`CLS: ${metrics.cls} > ${config.performance.thresholds.cls}`)
    }

    if (metrics.fid !== undefined && metrics.fid > config.performance.thresholds.fid) {
        failed.push(`FID: ${metrics.fid}ms > ${config.performance.thresholds.fid}ms`)
    }

    if (metrics.ttfb !== undefined && metrics.ttfb > config.performance.thresholds.ttfb) {
        failed.push(`TTFB: ${metrics.ttfb}ms > ${config.performance.thresholds.ttfb}ms`)
    }

    return {
        passed: failed.length === 0,
        failed,
    }
}

export async function sendAlert(
    type: 'performance' | 'error' | 'uptime',
    message: string,
    details?: Record<string, unknown>
): Promise<void> {
    const config = getMonitorConfig()

    if (!config.alerts.enabled) {
        return
    }

    const alertData = {
        type,
        message,
        details,
        timestamp: new Date().toISOString(),
        url: typeof window !== 'undefined' ? window.location.href : undefined,
    }

    // Send to Slack if configured
    if (config.alerts.slack) {
        try {
            await fetch(config.alerts.slack.webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    channel: config.alerts.slack.channel,
                    text: `🚨 ${type.toUpperCase()} Alert: ${message}`,
                    attachments: [
                        {
                            color: type === 'performance' ? 'warning' : 'danger',
                            fields: Object.entries(details || {}).map(([key, value]) => ({
                                title: key,
                                value: String(value),
                                short: true,
                            })),
                        },
                    ],
                }),
            })
        } catch (error) {
            console.error('Failed to send Slack alert:', error)
        }
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
        console.log('Alert sent:', alertData)
    }
}

/**
 * 事件追踪统一收口到 analytics.ts，此处仅做 re-export 保持向后兼容
 */
export { trackEvent } from '../utils/analytics'

export function trackPageView(url: string, referrer?: string): void {
    if (typeof window === 'undefined') return
    if (window.umami) {
        ;(window.umami as { track: (name: string, data?: Record<string, unknown>) => void }).track(
            'pageview',
            { url, referrer }
        )
    }
}
