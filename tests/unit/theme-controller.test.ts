/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ThemeController } from '../src/utils/theme-controller';

describe('Theme Controller', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
        localStorage.clear();
    });

    afterEach(() => {
        document.body.innerHTML = '';
        localStorage.clear();
    });

    it('should initialize with default theme', () => {
        const controller = new ThemeController();
        expect(controller.currentTheme).toBe('light');
    });

    it('should load theme from localStorage', () => {
        localStorage.setItem('theme', 'dark');
        const controller = new ThemeController();
        expect(controller.currentTheme).toBe('dark');
    });

    it('should apply theme to document', () => {
        const controller = new ThemeController();
        controller.setTheme('dark');

        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should save theme to localStorage', () => {
        const controller = new ThemeController();
        controller.setTheme('dark');

        expect(localStorage.getItem('theme')).toBe('dark');
    });

    it('should toggle theme', () => {
        const controller = new ThemeController();
        expect(controller.currentTheme).toBe('light');

        controller.toggleTheme();
        expect(controller.currentTheme).toBe('dark');

        controller.toggleTheme();
        expect(controller.currentTheme).toBe('light');
    });

    it('should validate theme values', () => {
        const controller = new ThemeController();
        
        expect(() => controller.setTheme('invalid' as any)).toThrow();
    });
});