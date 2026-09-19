import { existsSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * T-035 回归防护。
 *
 * logo 曾以 231KB 的「误命名为 .jpg 的透明 PNG」挂在首页；且它压在随主题变化的
 * header 底色上，一旦被压平成 JPEG 就会丢掉 alpha，在亮/暗主题其一变成黑/白底
 * 矩形。这里锁住四件事：三格式都在且不超预算、旧的 logo.jpg 不再出现、母版存在
 * （保证 `pnpm assets:logo` 可再生成）、两个组件都走 <picture> 三层。
 *
 * 与 scripts/quality/optimize-logo.mjs 的 BUDGET_KB 保持一致。
 */
const assetsDir = join(process.cwd(), 'public', 'assets')
const srcDir = join(process.cwd(), 'src')

const FORMAT_BUDGET_KB: Record<string, number> = { png: 40, webp: 30, avif: 20 }

describe('logo assets (T-035)', () => {
    it('ships avif/webp/png derivatives within budget', () => {
        for (const [ext, budgetKB] of Object.entries(FORMAT_BUDGET_KB)) {
            const file = join(assetsDir, `logo.${ext}`)
            expect(existsSync(file), `${file} 缺失，请跑 pnpm assets:logo 重新生成`).toBe(true)
            expect(statSync(file).size / 1024).toBeLessThanOrEqual(budgetKB)
        }
    })

    it('no longer ships the misnamed logo.jpg', () => {
        expect(existsSync(join(assetsDir, 'logo.jpg'))).toBe(false)
    })

    it('keeps a master source so the generator stays idempotent', () => {
        expect(existsSync(join(srcDir, 'assets', 'logo-master.png'))).toBe(true)
    })

    it('renders the logo through a 3-layer <picture>', () => {
        const targets = [
            join(srcDir, 'components', 'overrides', 'Header.astro'),
            join(srcDir, 'components', 'showcase-lab', 'LabApp.astro'),
        ]

        for (const file of targets) {
            const source = readFileSync(file, 'utf8')
            expect(source, `${file} 未使用 <picture>`).toContain('<picture')
            expect(source).toContain('type="image/avif"')
            expect(source).toContain('type="image/webp"')
            expect(source).toContain('src="/assets/logo.png"')
            // 显式宽高比占位,避免 CLS(原实现误写为 64x64)
            expect(source).toContain('width="512"')
            expect(source).toContain('height="201"')
        }
    })
})
