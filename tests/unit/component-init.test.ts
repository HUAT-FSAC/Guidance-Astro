/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { initComponentManager, registerComponent } from '../src/utils/component-init';

describe('Component Initialization Manager', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('should register components', () => {
        const mockInit = vi.fn();
        registerComponent('test-component', mockInit);

        expect(mockInit).not.toHaveBeenCalled();
    });

    it('should initialize registered components', () => {
        const mockInit = vi.fn();
        registerComponent('test-component', mockInit);

        const container = document.createElement('div');
        container.setAttribute('data-component', 'test-component');
        document.body.appendChild(container);

        initComponentManager();

        expect(mockInit).toHaveBeenCalled();
    });

    it('should skip initialization if element not found', () => {
        const mockInit = vi.fn();
        registerComponent('non-existent', mockInit);

        initComponentManager();

        expect(mockInit).not.toHaveBeenCalled();
    });

    it('should pass element to init function', () => {
        const mockInit = vi.fn();
        registerComponent('test-component', mockInit);

        const container = document.createElement('div');
        container.setAttribute('data-component', 'test-component');
        document.body.appendChild(container);

        initComponentManager();

        expect(mockInit).toHaveBeenCalledWith(container);
    });
});