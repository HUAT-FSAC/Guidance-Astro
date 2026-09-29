/**
 * 站点 redirects 表（由 astro.config.mjs 抽出，issue #117）。
 *
 * 单一来源：astro.config.mjs 的 `redirects` 字段直接引用本模块，链接完整性
 * 回归测试（tests/unit/internal-links.test.ts）也以它为「旧路径 301 合法集合」，
 * 避免测试端用正则反解析配置文件。
 *
 * 键为站点绝对路径（trailingSlash: 'always'，一律以 / 结尾），值为重定向目标。
 */
export const siteRedirects: Record<string, string> = {
    '/docs/': '/',
    '/2024-learning-roadmap/': '/archive/2024/2024-learning-roadmap/',
    '/2025/感知/': '/archive/2025/sensing/',
    '/2025/感知/激光雷达/': '/archive/2025/sensing/激光雷达/',
    '/2025/感知/摄像头/': '/archive/2025/sensing/摄像头/',
    '/2025/定位建图/': '/archive/2025/localization-mapping/',
    '/2025/定位建图/ins5711daa/': '/archive/2025/localization-mapping/ins5711daa/',
    '/2025/定位建图/学习路线/': '/archive/2025/localization-mapping/学习路线/',
    '/2025/定位建图/记录/': '/archive/2025/localization-mapping/记录/',
    '/2025/规控/': '/archive/2025/planning-control/',
    '/2025/规控/控制/': '/archive/2025/planning-control/控制/',
    '/2025/规控/直线/': '/archive/2025/planning-control/直线/',
    '/2025/规控/高速循迹/': '/archive/2025/planning-control/高速循迹/',
    '/2025/仿真测试/': '/archive/2025/simulation/',
    '/2025/仿真测试/仿真/': '/archive/2025/simulation/仿真/',
    '/2025/电气/': '/archive/2025/electrical/',
    '/2025/电气/电池箱/': '/archive/2025/electrical/电池箱/',
    '/2025/电气/硬件/': '/archive/2025/electrical/硬件/',
    '/2025/电气/线束/': '/archive/2025/electrical/线束/',
    '/2025/电气/软件/': '/archive/2025/electrical/软件/',
    '/2025/机械/': '/archive/2025/mechanical/',
    '/2025/机械/传动/': '/archive/2025/mechanical/传动/',
    '/2025/机械/制动/': '/archive/2025/mechanical/制动/',
    '/2025/机械/车架车身/': '/archive/2025/mechanical/车架车身/',
    '/2025/机械/转向悬架/': '/archive/2025/mechanical/转向悬架/',
    '/2025/项管/': '/archive/2025/management/',
    '/2025/项管/新媒体/': '/archive/2025/management/新媒体/',
    '/2025/项管/营销/': '/archive/2025/management/营销/',
    '/2025/项管/运营/': '/archive/2025/management/运营/',
    '/感知/': '/archive/sensing/',
    '/定位建图/': '/archive/localization-mapping/',
    '/规控/': '/archive/planning-control/',
    '/仿真测试/': '/archive/simulation/',
    '/综合/': '/archive/general/',
    '/文档中心/': '/docs-center/',
}
