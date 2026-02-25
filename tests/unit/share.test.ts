import { describe, expect, it } from 'vitest'

import {
    generateShareUrl,
    generateQRCodeUrl,
    generateQRCodeDataUrl,
    canUseNativeShare,
    type ShareData,
} from '../../src/utils/share'

const mockShareData: ShareData = {
    url: 'https://huat-fsac.eu.org/docs/',
    title: 'HUAT FSAC 文档',
    description: '方程式赛车队文档站',
}

describe('share', () => {
    describe('generateShareUrl', () => {
        it('should generate Twitter share URL', () => {
            const url = generateShareUrl('twitter', mockShareData)
            expect(url).toContain('twitter.com/intent/tweet')
            expect(url).toContain(encodeURIComponent(mockShareData.url))
            expect(url).toContain(encodeURIComponent(mockShareData.title))
        })

        it('should generate Weibo share URL', () => {
            const url = generateShareUrl('weibo', mockShareData)
            expect(url).toContain('service.weibo.com/share')
            expect(url).toContain(encodeURIComponent(mockShareData.url))
        })

        it('should generate Telegram share URL', () => {
            const url = generateShareUrl('telegram', mockShareData)
            expect(url).toContain('t.me/share/url')
            expect(url).toContain(encodeURIComponent(mockShareData.url))
        })

        it('should generate LinkedIn share URL', () => {
            const url = generateShareUrl('linkedin', mockShareData)
            expect(url).toContain('linkedin.com/sharing')
            expect(url).toContain(encodeURIComponent(mockShareData.url))
        })

        it('should generate Facebook share URL', () => {
            const url = generateShareUrl('facebook', mockShareData)
            expect(url).toContain('facebook.com/sharer')
            expect(url).toContain(encodeURIComponent(mockShareData.url))
        })

        it('should generate email mailto link', () => {
            const url = generateShareUrl('email', mockShareData)
            expect(url).toContain('mailto:')
            expect(url).toContain(encodeURIComponent(mockShareData.title))
            expect(url).toContain(encodeURIComponent(mockShareData.url))
        })

        it('should return raw URL for wechat', () => {
            const url = generateShareUrl('wechat', mockShareData)
            expect(url).toBe(mockShareData.url)
        })

        it('should handle special characters in title', () => {
            const data = { ...mockShareData, title: 'Test & <script>alert(1)</script>' }
            const url = generateShareUrl('twitter', data)
            expect(url).not.toContain('<script>')
            expect(url).toContain(encodeURIComponent(data.title))
        })
    })

    describe('generateQRCodeDataUrl', () => {
        it('should generate a data URL', async () => {
            const dataUrl = await generateQRCodeDataUrl('https://example.com')
            expect(dataUrl).toMatch(/^data:image\/png;base64,/)
        })

        it('should respect custom size', async () => {
            const dataUrl = await generateQRCodeDataUrl('https://example.com', 100)
            expect(dataUrl).toMatch(/^data:image\/png;base64,/)
        })
    })

    describe('generateQRCodeUrl (deprecated)', () => {
        it('should generate QR code URL with default size', () => {
            const url = generateQRCodeUrl('https://example.com')
            expect(url).toContain('200x200')
            expect(url).toContain(encodeURIComponent('https://example.com'))
        })

        it('should generate QR code URL with custom size', () => {
            const url = generateQRCodeUrl('https://example.com', 300)
            expect(url).toContain('300x300')
        })
    })

    describe('canUseNativeShare', () => {
        it('should return false in Node environment', () => {
            // navigator.share is not available in Node/jsdom
            expect(canUseNativeShare()).toBe(false)
        })
    })
})
