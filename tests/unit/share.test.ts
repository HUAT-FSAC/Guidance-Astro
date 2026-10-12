// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
    canUseNativeShare,
    copyToClipboard,
    generateQRCodeDataUrl,
    generateQRCodeUrl,
    generateShareUrl,
    getPageShareData,
    nativeShare,
    openShareWindow,
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

        it('should return true when share and canShare are available', () => {
            // @ts-expect-error: suppress type error
            navigator.share = () => Promise.resolve()
            // @ts-expect-error: suppress type error
            navigator.canShare = () => true
            expect(canUseNativeShare()).toBe(true)
            // @ts-expect-error: suppress type error
            delete navigator.share
            // @ts-expect-error: suppress type error
            delete navigator.canShare
        })
    })

    describe('nativeShare, clipboard, popup and page data', () => {
        beforeEach(() => {
            Object.defineProperty(window, 'location', {
                value: new URL('https://huat-fsac.eu.org/docs/'),
                writable: true,
                configurable: true,
            })
            document.head.innerHTML =
                '<meta property="og:title" content="Test Title"><meta property="og:description" content="desc"><meta property="og:image" content="https://example.com/img.png">'
            document.title = 'Test'
        })

        it('nativeShare reports unsupported without navigator.share', async () => {
            const res = await nativeShare({ url: 'https://example.com', title: 't' })
            expect(res.success).toBe(false)
        })

        it('nativeShare resolves success, abort and failure', async () => {
            // @ts-expect-error: suppress type error
            navigator.share = vi.fn(() => Promise.resolve())
            // @ts-expect-error: suppress type error
            navigator.canShare = () => true
            const res = await nativeShare({
                url: 'https://example.com',
                title: 't',
                description: 'd',
            })
            expect(res.success).toBe(true)
            // @ts-expect-error: suppress type error
            navigator.share = vi.fn(() =>
                Promise.reject(Object.assign(new Error('abort'), { name: 'AbortError' }))
            )
            const res2 = await nativeShare({ url: 'https://example.com', title: 't' })
            expect(res2.message).toContain('取消')
            // @ts-expect-error: suppress type error
            navigator.share = vi.fn(() => Promise.reject(new Error('fail')))
            const res3 = await nativeShare({ url: 'https://example.com', title: 't' })
            expect(res3.success).toBe(false)
            // @ts-expect-error: suppress type error
            delete navigator.share
            // @ts-expect-error: suppress type error
            delete navigator.canShare
        })

        it('copyToClipboard prefers clipboard, falls back to execCommand', async () => {
            // @ts-expect-error: suppress type error
            navigator.clipboard = { writeText: vi.fn(() => Promise.resolve()) }
            const r1 = await copyToClipboard('hello')
            expect(r1.success).toBe(true)
            // @ts-expect-error: suppress type error
            delete navigator.clipboard
            document.execCommand = vi.fn(() => true) as unknown as typeof document.execCommand
            const r2 = await copyToClipboard('hello')
            expect(r2.success).toBe(true)
            document.execCommand = vi.fn(() => {
                throw new Error('fail')
            }) as unknown as typeof document.execCommand
            // @ts-expect-error: suppress type error
            navigator.clipboard = { writeText: vi.fn(() => Promise.reject(new Error('fail'))) }
            const r3 = await copyToClipboard('hello')
            expect(r3.success).toBe(false)
            // @ts-expect-error: suppress type error
            delete navigator.clipboard
        })

        it('openShareWindow handles email, wechat, popup and blocked popup', () => {
            const data = { url: 'https://example.com', title: 't' }
            expect(openShareWindow('email', data).success).toBe(true)
            expect(openShareWindow('wechat', data).success).toBe(true)
            const mockPopup = { focus: vi.fn() }
            // @ts-expect-error: suppress type error
            window.open = vi.fn(() => mockPopup)
            Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true })
            Object.defineProperty(window, 'innerHeight', { value: 768, writable: true })
            const r = openShareWindow('twitter', data)
            expect(r.success).toBe(true)
            expect(mockPopup.focus).toHaveBeenCalled()
            // @ts-expect-error: suppress type error
            window.open = vi.fn(() => null)
            const r2 = openShareWindow('twitter', data)
            expect(r2.success).toBe(false)
            // @ts-expect-error: suppress type error
            delete window.open
        })

        it('getPageShareData reads og meta and degrades without document', () => {
            const data = getPageShareData()
            expect(data.url).toBe('https://huat-fsac.eu.org/docs/')
            expect(data.title).toBe('Test Title')
            expect(data.description).toBe('desc')
            const origDoc = global.document
            try {
                // @ts-expect-error: suppress type error
                delete global.document
                const d2 = getPageShareData()
                expect(d2.url).toBe('')
            } finally {
                // @ts-expect-error: suppress type error
                global.document = origDoc
            }
        })
    })
})
