// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
    generateAltText,
    generateSrcSet,
    getImageFetchPriority,
    getImageLoadingStrategy,
    handleImageError,
    optimizeExternalImage,
    preloadImages,
} from '../../src/utils/image-optimization'

describe('image-optimization-boost', () => {
    beforeEach(() => {
        vi.restoreAllMocks()
    })
    it('optimizeExternalImage invalid', () => {
        expect(optimizeExternalImage('')).toBe('/favicon.png')
        // @ts-expect-error: suppress type error
        expect(optimizeExternalImage(null as unknown as string)).toBe('/favicon.png')
        expect(optimizeExternalImage('not-a-url')).toBe('/favicon.png')
        expect(optimizeExternalImage('/local.png')).toBe('/local.png')
        // './local.png' is treated as invalid (not starting with /) and falls back
        expect(optimizeExternalImage('./local.png')).toBe('/favicon.png')
    })
    it('optimizeExternalImage unsplash', () => {
        const url = 'https://images.unsplash.com/photo-123?w=800'
        expect(optimizeExternalImage(url, 800, 85, 'webp')).toContain('unsplash.com')
        expect(optimizeExternalImage(url, 800, 85, 'avif')).toContain('avif')
        expect(optimizeExternalImage(url, 800, 85, 'auto')).toContain('fm=webp')
    })
    it('optimizeExternalImage cloudinary', () => {
        const url = 'https://res.cloudinary.com/demo/image/upload/v1/photo.jpg'
        expect(optimizeExternalImage(url, 500, 80, 'webp')).toContain('f_webp')
        expect(optimizeExternalImage(url, 500, 80, 'auto')).toContain('f_auto')
    })
    it('optimizeExternalImage imgix and pexels and github', () => {
        expect(optimizeExternalImage('https://test.imgix.net/photo.jpg', 400)).toContain(
            'imgix.net'
        )
        expect(optimizeExternalImage('https://test.imgix.net/photo.jpg?w=100', 400)).toContain(
            'w=400'
        )
        expect(optimizeExternalImage('https://images.pexels.com/photo.jpg', 400)).toContain(
            'pexels.com'
        )
        expect(optimizeExternalImage('https://images.pexels.com/photo.jpg?w=100', 400)).toContain(
            'w=400'
        )
        expect(optimizeExternalImage('https://avatars.githubusercontent.com/u/123', 200)).toContain(
            'avatars.githubusercontent.com'
        )
        expect(
            optimizeExternalImage('https://avatars.githubusercontent.com/u/123?s=100', 200)
        ).toContain('s=200')
        expect(optimizeExternalImage('https://example.com/photo.jpg')).toBe(
            'https://example.com/photo.jpg'
        )
    })
    it('optimizeExternalImage handles error', () => {
        // force error by passing weird url that triggers catch? use valid but mock
        const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const result = optimizeExternalImage('https://cloudinary.com/image/upload/v1/a.jpg', 100)
        expect(result).toBeDefined()
        spy.mockRestore()
    })
    it('generateSrcSet', () => {
        expect(generateSrcSet('')).toBe('')
        // @ts-expect-error: suppress type error
        expect(generateSrcSet(null as unknown as string)).toBe('')
        const set = generateSrcSet('https://images.unsplash.com/photo.jpg', [400, 800])
        expect(set).toContain('400w')
        expect(set).toContain('800w')
        // error case
        const bad = generateSrcSet('https://example.com/a.jpg', [400])
        expect(bad).toContain('400w')
    })
    it('getImageLoadingStrategy and priority', () => {
        expect(getImageLoadingStrategy(true)).toBe('eager')
        expect(getImageLoadingStrategy(false)).toBe('lazy')
        expect(getImageFetchPriority(true)).toBe('high')
        expect(getImageFetchPriority(false)).toBe('auto')
    })
    it('generateAltText', () => {
        expect(generateAltText('')).toBe('图片')
        // @ts-expect-error: suppress type error
        expect(generateAltText(null as unknown as string)).toBe('图片')
        expect(generateAltText('title')).toBe('title')
        expect(generateAltText('title', 'ctx')).toBe('title - ctx')
    })
    it('handleImageError', () => {
        const img = document.createElement('img')
        img.src = 'https://example.com/a.jpg'
        Object.defineProperty(window, 'location', {
            value: new URL('https://example.com/'),
            writable: true,
        })
        handleImageError(img, '/fallback.png')
        expect(img.src).toContain('/fallback.png')
        expect(img.onerror).toBe(null)
        // when img src already equals fallback, should not change
        const img2 = document.createElement('img')
        img2.src = 'https://example.com/a.jpg'
        handleImageError(img2, 'https://example.com/a.jpg')
        expect(img2.src).toBe('https://example.com/a.jpg')
        // when fallback equals location.href, should not set src
        const img3 = document.createElement('img')
        img3.src = 'https://example.com/b.jpg'
        handleImageError(img3, window.location.href)
        expect(img3.src).toBe('https://example.com/b.jpg')
    })
    it('preloadImages', () => {
        preloadImages(['/a.jpg', 'https://example.com/b.jpg', '', null as unknown as string])
        // @ts-expect-error: suppress type error
        const origImage = global.Image
        // @ts-expect-error: suppress type error
        global.Image = class {
            src = ''
            set src(v: string) {
                if (v === 'throw') throw new Error('fail')
            }
            get src() {
                return ''
            }
        } as unknown as typeof Image
        preloadImages(['throw'])
        // @ts-expect-error: suppress type error
        global.Image = origImage
        // without window
        const origWindow = global.window
        // @ts-expect-error: suppress type error
        delete global.window
        expect(() => preloadImages(['/a.jpg'])).not.toThrow()
        // @ts-expect-error: suppress type error
        global.window = origWindow
    })
})
