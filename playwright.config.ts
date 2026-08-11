import config from './.config/playwright.config.ts'
import { defineConfig } from '@playwright/test'

export default defineConfig({
    ...config,
    testDir: './tests/e2e',
})
