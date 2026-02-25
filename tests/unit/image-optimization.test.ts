import { describe, expect, it } from 'vitest'

import {
    generateAltText,
    generateSrcSet,
    getImageFetchPriority,
    getImageLoadingStrategy,
    optimizeExternalImage,
} from '../../src/utils/image-optimization'

describe('image-optimization', () => {
    it('should optimize unsplash url by params', () => {
        const optimized = optimizeExternalImage(
            'https://images.unsplash.com/photo-123?ixid=abc',
            640,
            80,
            'avif'
        )

        expect(optimized).toBe('https://images.unsplash.com/photo-123?fm=avif&w=640&q=80')
    })

    it('should optimize cloudinary and imgix url', () => {
        const cloudinary = optimizeExternalImage(
            'https://res.cloudinary.com/demo/image/upload/v123/sample.jpg',
            800,
            70,
            'auto'
        )
        const imgix = optimizeExternalImage('https://demo.imgix.net/sample.jpg', 1200, 90, 'webp')

        expect(cloudinary).toContain('/upload/f_auto,w_800,q_70/')
        expect(imgix).toContain('fm=webp&w=1200&q=90')
    })

    it('should generate srcset, loading strategy and alt text', () => {
        const srcset = generateSrcSet('https://images.unsplash.com/photo-123', [400, 800])

        expect(srcset).toContain('400w')
        expect(srcset).toContain('800w')
        expect(getImageLoadingStrategy(true)).toBe('eager')
        expect(getImageLoadingStrategy(false)).toBe('lazy')
        expect(getImageFetchPriority(true)).toBe('high')
        expect(getImageFetchPriority(false)).toBe('auto')
        expect(generateAltText('封面图')).toBe('封面图')
        expect(generateAltText('封面图', '自动驾驶竞赛')).toBe('封面图 - 自动驾驶竞赛')
    })
})
