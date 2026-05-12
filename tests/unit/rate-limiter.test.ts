/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { createRateLimiter } from '../src/utils/rate-limiter';

describe('Rate Limiter', () => {
    it('should allow requests within limit', () => {
        const limiter = createRateLimiter({ maxRequests: 5, windowMs: 60000 });
        const ip = '192.168.1.1';

        for (let i = 0; i < 5; i++) {
            expect(limiter.tryAcquire(ip)).toBe(true);
        }
    });

    it('should block requests exceeding limit', () => {
        const limiter = createRateLimiter({ maxRequests: 5, windowMs: 60000 });
        const ip = '192.168.1.1';

        for (let i = 0; i < 5; i++) {
            limiter.tryAcquire(ip);
        }

        expect(limiter.tryAcquire(ip)).toBe(false);
    });

    it('should reset after window expires', async () => {
        const limiter = createRateLimiter({ maxRequests: 1, windowMs: 100 });
        const ip = '192.168.1.1';

        expect(limiter.tryAcquire(ip)).toBe(true);
        expect(limiter.tryAcquire(ip)).toBe(false);

        await new Promise(resolve => setTimeout(resolve, 150));

        expect(limiter.tryAcquire(ip)).toBe(true);
    });

    it('should handle different IPs independently', () => {
        const limiter = createRateLimiter({ maxRequests: 2, windowMs: 60000 });

        expect(limiter.tryAcquire('192.168.1.1')).toBe(true);
        expect(limiter.tryAcquire('192.168.1.1')).toBe(true);
        expect(limiter.tryAcquire('192.168.1.1')).toBe(false);

        expect(limiter.tryAcquire('192.168.1.2')).toBe(true);
        expect(limiter.tryAcquire('192.168.1.2')).toBe(true);
        expect(limiter.tryAcquire('192.168.1.2')).toBe(false);
    });
});