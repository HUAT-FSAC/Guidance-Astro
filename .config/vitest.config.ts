import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        environment: 'node',
        include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],
        setupFiles: ['tests/unit/setup-browser.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html', 'lcov'],
            reportsDirectory: 'coverage',
            thresholds: {
                statements: 70,
                branches: 70,
                functions: 70,
                lines: 70,
            },
        },
    },
})
