# TEST_PERF.md — 测试性能基准与优化记录

> 幂等规则：本文件一旦建立即为对照基准，不重建；后续优化只在「优化记录」追加条目。
> 覆盖率不得低于本基准值（Statements 93.98 / Branches 84.84 / Functions 94.73 / Lines 95.04）。
> 关联：`docs/WORKFLOW.md §6`（质量门禁）、`.config/vitest.config.ts`、`.config/playwright.config.ts`、`.github/workflows/ci-cd.yml`

## 0. 基准快照（2026-10-12，首次建立）

测量环境：Linux 本机，Node v22.23.2，pnpm 11.22.0，Vitest 4.1.11，Playwright 1.63.0 / chromium-1243。
数据来源：本地实跑（unit ×2 取值、coverage ×1、e2e ×1）+ CI 历史日志（`gh run view`）。局限：本地 E2E 跑 1 次（机器性能与 CI runner 不同，仅作量级对照）；CI 取 2026-10-12 main 最新绿 run。

### 0.1 本地测试总览

| 套件                                                  | 文件数                      | 用例数 | 通过率          | 时长                                                                                                      |
| ----------------------------------------------------- | --------------------------- | ------ | --------------- | --------------------------------------------------------------------------------------------------------- |
| Vitest 单元测试（`pnpm test:run`）                    | 42（含 `src/**/*.test.ts`） | 451    | 100%（451/451） | run1 Duration 3.40s / wall 5s；run2 Duration 3.02s / wall 4s                                              |
| 覆盖率（`pnpm test:coverage`）                        | 同上                        | 同上   | 100%            | wall 5s（含 v8 覆盖率采集）                                                                               |
| Playwright E2E（本地默认 workers，`--reporter=json`） | 10 spec                     | 102    | 100%（102/102） | wall 158s（另含前置 `pnpm build` 17s、wrangler dev 启动）；CI（workers=2）同套件 67s，runner 核数/IO 更强 |

### 0.2 覆盖率基准（`pnpm test:coverage` 实测，阈值 80/80/80/80）

| 指标       | 实测               | 阈值 | 余量              |
| ---------- | ------------------ | ---- | ----------------- |
| Statements | 93.98% (2345/2495) | 80   | +13.98            |
| Branches   | 84.84% (1260/1485) | 80   | **+4.84（最紧）** |
| Functions  | 94.73% (468/494)   | 80   | +14.73            |
| Lines      | 95.04% (2242/2359) | 80   | +15.04            |

⚠️ Branches 余量仅 4.84pp：删除 `coverage-boost` 类凑覆盖率文件时，必须先把其中独有的分支覆盖迁入专文件，否则可能跌破门禁。

### 0.3 CI 总时长及 Job 拆解（run 38268280414，main，2026-10-12，全绿，端到端 6m48s / 408s）

| Job                            | 耗时     | 备注                                              |
| ------------------------------ | -------- | ------------------------------------------------- |
| Lint and Format                | 41s      |                                                   |
| Type Check                     | 29s      |                                                   |
| Audit Dependencies             | 34s      |                                                   |
| Tests（vitest coverage）       | 42s      | 与本地一致，量级正常                              |
| Build                          | 32s      | 需前置 lint/test/typecheck/audit 全绿（串行瓶颈） |
| Quality Gate (E2E/LHCI/Budget) | **299s** | 唯一瓶颈，见下表                                  |
| Preview Build                  | 21s      | 串行等 quality-gate，实际只做 `ls` 检查           |

Quality Gate 内部分解（299s）：

| Step                                                 | 耗时     | 备注                                 |
| ---------------------------------------------------- | -------- | ------------------------------------ |
| Setup Node & pnpm（含 install）                      | 14s      |                                      |
| Download build artifacts                             | 2s       | 产物复用设计正确，无重复 build       |
| bundle + route 预算检查                              | 4s       |                                      |
| Install Playwright browser（`--with-deps chromium`） | 19s      | 无缓存，每次重装                     |
| **Run E2E tests（102 tests, workers=2）**            | **67s**  | 单 runner，未分片                    |
| **Run Lighthouse CI（collect + assert）**            | **186s** | **全流水线最大单步**，4 URL 全量采集 |
| Verify dist 等杂项                                   | ~7s      |                                      |

结论：本地单元测试（~3s）不是问题；**CI 瓶颈 = Quality Gate 串行结构（299s，占总量 73%），其中 LHCI 186s + E2E 67s + pw 安装 19s**。

### 0.4 最慢 Top 10 单元测试（`vitest --reporter=verbose` 实测）

| #   | 测试                                                                     | 耗时                                                  |
| --- | ------------------------------------------------------------------------ | ----------------------------------------------------- |
| 1   | `coverage-boost.test.ts > analytics > trackScrollDepth milestones`       | 304ms（含真实定时等待，flaky 嫌疑）                   |
| 2   | `theme-contrast.test.ts > keeps src free of unguarded light text colors` | 188ms（全 `src` 扫描，应为门禁而非单测）              |
| 3   | `showcase-lab-client.test.ts > schedules replay timer…`                  | 134ms（timer/300 行 DOM fixture 文件内多个 50~120ms） |
| 4   | `share.test.ts > generateQRCodeDataUrl`                                  | 122ms（真实 qrcode 生成，可 mock 或移入门禁）         |
| 5   | `showcase-lab-client.test.ts > renders required DOM nodes…`              | 120ms                                                 |
| 6   | `showcase-lab-client.test.ts > handles script selection…`                | 104ms                                                 |
| 7   | `showcase-lab-client.test.ts > handles cache controls…`                  | 91ms                                                  |
| 8   | `showcase-lab-client.test.ts > updates state when scenario chip…`        | 90ms                                                  |
| 9   | `showcase-lab-client.test.ts > handles comparison mode toggle…`          | 89ms                                                  |
| 10  | `src/utils/floating-controls.test.ts > toggles theme…`                   | 85ms                                                  |

Top 10 合计约 1.3s，占单元测试总时长（~3.4s）约 38%，但绝对值小——**单元测试侧优化意义在于可维护性而非时长**。

### 0.5 E2E 分文件耗时与最慢用例（本地实测，102/102 通过，wall 158s；各文件为串行加总，实际并行执行）

| spec                         | 用例数 | 串行加总 | 备注                                                      |
| ---------------------------- | ------ | -------- | --------------------------------------------------------- |
| `navigation.spec.ts`         | 36     | 63.6s    | 最大文件；13 重定向 + 15 英文页为同构重复（R6）           |
| `i18n-switcher.spec.ts`      | 14     | 51.9s    | 单用例均值 3.7s，全为整页重载；与 controller 单测重复度高 |
| `component-conflict.spec.ts` | 12     | 36.0s    | 主题长按等待 + 重复 `goto`                                |
| `showcase-lab.spec.ts`       | 16     | 19.6s    | 16 次重复 `goto /showcase-dashboard/`（R7）               |
| `accessibility.spec.ts`      | 5      | 13.7s    | 静态断言，可降级（R8）                                    |
| `mobile-header.spec.ts`      | 3      | 8.5s     | 必须 E2E，保留                                            |
| `smoke.spec.ts`              | 8      | 8.1s     | 与多文件重叠，留 2~3 个（R7）                             |
| `docs-features.spec.ts`      | 4      | 7.1s     | 纯 DOM 断言，可降级（R8）                                 |
| `metrics-dashboard.spec.ts`  | 2      | 3.8s     | 中/英重复，`test.each` 合并                               |
| `scroll-reveal.spec.ts`      | 2      | 3.1s     | 无 JS 用例保留，有 JS 用例与单测二选一                    |

最慢 Top 10 E2E（均为整页导航/等待类）：

| 耗时   | 用例                                                  |
| ------ | ----------------------------------------------------- |
| 4696ms | i18n-switcher > 语言切换后主题色保持不变              |
| 4572ms | i18n-switcher > 切换回中文后更新 localStorage         |
| 4151ms | i18n-switcher > 从英文首页切换回中文首页              |
| 4135ms | i18n-switcher > 切换语言后保存到 localStorage         |
| 4125ms | i18n-switcher > 从中文首页切换到英文首页              |
| 4085ms | component-conflict > 主题切换按钮长按后面板并保存颜色 |
| 4050ms | i18n-switcher > 语言切换后主题切换按钮仍然可见        |
| 3996ms | i18n-switcher > 语言切换后主题模式保持不变            |
| 3507ms | i18n-switcher > 从英文文档页切换回中文文档页          |
| 3484ms | component-conflict > 主题按钮点击切换主题并持久化     |

结论：E2E 耗时 = 页面加载次数 × 单次加载成本。**削减 `goto` 次数（R6/R7/R8）比优化单用例更有效**；i18n-switcher 后两类（localStorage/主题保持）与 `language-switcher-controller`/`theme-controller` 单测重复，E2E 只留导航切换即可。

---

## 阶段一：测试合理性审计（2026-10-12，只分析未改动）

### 🔴 建议删除（每项已实地抽查行数/用例数，见第 4 列证据）

| #   | 目标                                                                                                                            | 依据                                                                                                                                                                                                                                                       | 证据                         | 预计节省                                           |
| --- | ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | -------------------------------------------------- |
| D1  | `tests/unit/coverage-boost.test.ts` 整文件（592 行，约 37 用例）                                                                | 典型凑覆盖率文件，横跨 8 模块；与 5 个专文件重复（search-suggestions/highlight、share、analytics、lazy-components）；含破坏性 mock（`process.stdout/stderr`、`delete window/location`、`import.meta.env.DEV`）与 `setTimeout 150ms` flaky（即 Top1 304ms） | `wc -l`=592；Top1 出自本文件 | ~37 用例，~0.5~1s；主要收益是去 flaky 与去维护负担 |
| D2  | `tests/unit/branch-boost2.test.ts` + `branch-boost3.test.ts`（共约 12 用例）                                                    | boost2 与专文件 mock 打架（同模块 mock 返回值不一致）、排序用例重复、stdout 弱断言；boost3 是 search-suggestions 与 coverage-boost 的弱化复刻 + `Buffer/Uint8Array` 实现细节                                                                               | `wc -l`=147/110              | ~12 用例，~0.2s                                    |
| D3  | `tests/unit/image-optimization.test.ts`（48 行，3 用例）                                                                        | 被 `image-optimization-boost.test.ts:18-92` 完全覆盖                                                                                                                                                                                                       | 行数/内容比对                | 3 用例                                             |
| D4  | `tests/unit/error-handler.test.ts`（80 行，3 用例）                                                                             | 被 `error-handler-boost.test.ts` 子集覆盖（register/wrapSync/handleImageError 相同）                                                                                                                                                                       | 内容比对                     | 3 用例                                             |
| D5  | `share.test.ts:71-101` deprecated 段 + `coverage-boost` 内 QR 重复段                                                            | `generateQRCodeUrl`（deprecated）只测字符串拼接；`^data:image/png` 正则两处重复                                                                                                                                                                            | 行号定位                     | ~4 用例                                            |
| D6  | `analytics.test.ts` 弱用例与 `coverage-boost` analytics 段二选一 + `lazy-components.test.ts:12-29,102-118` 4 个纯 `not.toThrow` | `not.toThrow`/`toBeTruthy` 零行为断言（`grep -c`：analytics 2 处、lazy 4 处）                                                                                                                                                                              | grep 实测                    | ~9 用例                                            |

合计：约 65~70 用例（451 → 约 385），单元时长预计 3.4s → ~2.5s。**风险**：D1/D6 含独有分支覆盖，删除前必须先迁移（见 §0.2 Branches 余量警告）。

### 🟡 建议重构

| #   | 目标                                                                                                                                                                             | 依据                                                                                 | 预计节省                                         |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------ |
| R1  | `showcase-lab.test.ts` + `showcase-lab-client.test.ts` + `showcase-lab-i18n.test.ts` 三合一                                                                                      | i18n 快照并入主文件；client 300+ 行 DOM fixture 只留 init/teardown 行为              | ~15 用例 / ~0.3s + 大幅降维护成本                |
| R2  | `security.test.ts`（约 30 用例，每个 header 一个 `it`，另有"恰好 7 个 header"锁数量）                                                                                            | 表驱动压缩到约 10 用例；数量断言改为 ≥ 阈值，添 header 不红                          | ~20 用例，防未来 flaky                           |
| R3  | `*-controller.test.ts` 5 文件（share/theme/language/mobile-nav/keyboard，共约 70 用例）                                                                                          | 大量 `aria-expanded/长按/右键/双路径/Lifecycle not.toThrow` 测实现细节；参数化可砍半 | ~30 用例                                         |
| R4  | i18n 四文件（`i18n` + `breadcrumbs/home/ui-copy-i18n`）                                                                                                                          | 同测 `getTranslations` 字典，按字典合并                                              | ~10 用例                                         |
| R5  | 重型"全库扫描"单测：`internal-links`（全站 0 失效）、`theme-contrast`（全 `src` 扫描，Top2 188ms）、`sitemap-paths` 真实仓库检查段、`logo-assets` 文件存在检查                   | 新增一页/一图即红，属门禁语义；移出 unit 改 CI quality-gate 或仅受影响 PR 跑         | 去 flaky（省时有限，意义在稳定性）               |
| R6  | E2E `navigation.spec.ts` 36 用例（13 重定向 + 15 英文页）→ 2 个参数化循环；重定向矩阵降级为中间件单元测试                                                                        | URL/文案不同而已的重复 `goto`                                                        | E2E 36 → 约 8 用例，省 ~15~20s（含 server 往返） |
| R7  | E2E `showcase-lab.spec.ts` 16 次重复 `goto /showcase-dashboard/` → `beforeEach` 一次进入 + 状态重置；`metrics-dashboard` 2 用例 → `test.each`；`smoke` 8 用例留 2~3 个，其余下沉 | 重复页面加载是 E2E 主成本                                                            | 省 ~10~15s                                       |
| R8  | E2E `docs-features`/`accessibility`/`component-conflict` 静态 DOM 断言降级 jsdom 或单次加载多断言                                                                                | 不必 5~12 次重复 `goto`                                                              | 省 ~10s                                          |

### 🟢 保留

`storage`、`search-history-boost`（唯一真测 history/去重/20上限）、`search-highlight`、`scroll-reveal`、`stats-counter`、`error-handler-boost`（去重后）、`image-optimization-boost:113-184`、`showcase-lab` 核心快照、`sitemap-paths:19-93` 纯函数段、`audit-gate`/`supply-chain-watch` 脚本探针、`security` 精简后、E2E `mobile-header`（视口矩阵，必须 E2E）、`scroll-reveal` 无 JS 用例。

---

## 阶段二：加速方案（逐维度，附 diff / 提速 / 风险）

> 单次 CI 实测 408s。以下按"不改动测试语义"（P0，可直接实施）与"需改测试"（P1，配合阶段一）分层。

### 1. 并行化

**P0-1：Quality Gate 拆分为 3 并行 job**（最大项：299s 串行 → 取 max ≈ 190s，省约 100s）。

```yaml
# ci-cd.yml：quality-gate 拆为三个 job，各自 needs: build + download dist artifact
quality-budget:  needs: build   # bundle + routes，~20s（含 setup/install）
quality-e2e:     needs: build   # pw install + E2E，~100s
quality-lhci:    needs: build   # LHCI，~200s
preview:         needs: [build] # 不再等 quality-gate（见 P0-4）
```

风险：低。产物复用机制已验证（现 quality-gate/preview 均下载同一 artifact，无重复 build）。

**P0-2：E2E 分片 2 runner**（67s → 约 35s，省约 30s）。

```yaml
# quality-e2e job 加矩阵
strategy:
    matrix:
        shard: ['1/2', '2/2']
run: pnpm exec playwright test --config=.config/playwright.config.ts --shard=${{ matrix.shard }}
```

或简单档：`.config/playwright.config.ts:11` `workers: CI ? 2 : undefined` → 4（零 CI 改动，省约 20s；分片更稳，推荐分片）。
风险：低。`fullyParallel: true` 已开（`playwright.config.ts:8`）；单 chromium 项目无跨浏览器状态；`showcase-lab` 用例若有共享服务端状态需确认串扰——本地验证一次即可。

### 2. 缓存

**P0-3：缓存 Playwright 浏览器**（省约 19s/次）。

```yaml
- uses: actions/cache@v5
  with:
      path: ~/.cache/ms-playwright
      key: playwright-${{ runner.os }}-chromium-1243
- run: pnpm exec playwright install --with-deps chromium # 命中时约 2s
```

风险：极低。版本 pin 在 lockfile，key 绑定版本号即可防漂移。
现状：pnpm store 缓存已有（`setup/action.yml` 经 `setup-node cache: pnpm`），7 job 各自 install 但命中 store 后多为链接时间，暂不建议动。

### 3. 增量执行

**P0-4：`preview` 只 `needs: [build]`**（preview 21s 移出关键路径；其 `quality:bundle` 重复检查可删，省约 30s）：

```yaml
preview:
    needs: [build] # 现为 needs: [build, quality-gate]
```

**P1-1：文档-only 变更跳过重型 job**（docs/openwiki 纯文档 PR 省约 350s/次，频率高）：

```yaml
concurrency:
    group: ${{ github.workflow }}-${{ github.ref }}
    cancel-in-progress: true
# + 新增 changes job（dorny/paths-filter）：docs-only 时 quality-e2e/quality-lhci 跳过
```

风险：中。需保证"文档"判定不含 `src/`、`astro.config.mjs`、`public/` 等影响构建的路径；白名单漏项会导致缺陷逃逸，建议首版只放行 `docs/**、openwiki/**、*.md` 且保留 build job 必跑。

### 4. I/O 优化

单元测试侧 I/O 可忽略（3.4s 全内存/jsdom，无外部服务、无真实 DB）。唯一 I/O 型用例是 R5 的四组"全库扫描"（读全站文件），移出 unit 后本地 `test:run` 反馈更快（估计 3.4s → ~2.5s，与 D1~D6 叠加约 ~2s）。
E2E 侧 I/O = 重复 `goto`（R6/R7/R8），属测试改写范畴，见阶段一。

### 5. 环境加速

- Runner 规格：当前 `ubuntu-latest` 对本流水线足够（build 32s、test 42s 均健康），暂不建议自托管/大规格 runner（成本无收益）。
- 镜像瘦身：`playwright install --with-deps chromium` 的 apt 部分不可省（CI 跑在干净镜像）；配合 P0-3 缓存即可。
- LHCI 瘦身（**最大单项 186s**）：PR 只跑首页 1 URL，main 全量 4 URL。`.config/lighthouserc.json` 按 `GITHUB_REF == main` 切两档配置，预计 PR 流水线省约 120~140s。风险：低；PR 仍保留首页性能信号，全量回归由 main 守住。

### 6. 流水线结构

**P0-5：顶层加 `concurrency.cancel-in-progress`**（不省单次时长，省排队浪费：同分支多次 push 不再全量跑完）：

```yaml
concurrency:
    group: ${{ github.workflow }}-${{ github.ref }}
    cancel-in-progress: true
```

**P0-6：`build` 前置最小集**（`needs: [lint, test, typecheck, audit]` → `needs: [test, typecheck]`；lint/audit 不阻塞构建，并行跑）：单次省约 10~40s（取决于最慢者；实测 lint 41s vs test 42s，约省 10s；若某次 lint 抖动则省更多）。风险：低；lint 失败仍会红，只是 build 先跑浪费几十秒——可接受，或反向选择保持现状（明确可二选一）。

**P0-7：quality-gate 内 smoke 先行 fast-fail**（`smoke.spec.ts` 先跑，失败即停，不跑 102 全量）：省失败场景下的约 60s + LHCI 186s 空转。风险：极低，一行 `--project` 顺序或拆 step 即可。

### 提速汇总（单次 main push，实测 408s 为分母）

| 组合                                                     | 预计单次时长                  | 说明                         |
| -------------------------------------------------------- | ----------------------------- | ---------------------------- |
| 现状                                                     | 408s                          |                              |
| P0（P0-1 并行 + P0-2 分片 + P0-3 缓存 + P0-4/P0-6 结构） | 约 260~290s（省约 30%）       | 零测试改动，可直接实施       |
| P0 + LHCI 分档（PR 1 URL）                               | PR 约 150~180s（省约 55~60%） | PR 频率最高，体感最强        |
| P0 + 阶段一 D/R（E2E 102→约 60 用例）                    | 再省约 30~40s                 | 需改测试，配合覆盖率门禁验证 |

---

## 阶段三：补充建议（测试之外）

1. **本地快速反馈**：`test:run` 已 3~5s，无需 watch 调优；建议给 E2E 加 `smoke` 快捷命令（`playwright test smoke.spec.ts`，约 10s 内验证构建可用性），避免本地全量 E2E 等待。
2. **Flaky 治理机制**：D1 的 `setTimeout 150ms` 与 R5 的"新增一页即红"类是主要 flaky 来源；建议新增 CI 失败自动打 `flaky` 标签 + `stale.yml` 豁免已有（`stale.yml` 已避开部分标签，flaky 标签建议加入豁免）。
3. **时长监控与预算告警**：`scripts/metrics/collect-github-metrics.mjs` 已有指标采集入口（`metrics:collect` + `collect-metrics.yml`），建议加一条规则：Quality Gate P95 超 6min 或单 spec 超 60s 自动开 Issue（复用 `secret-scan.yml` 的"失败开 issue"模式）。
4. **编写规范**：新增测试默认要求——纯函数/分支优先 Vitest；整站扫描类断言禁止进 `tests/unit`（走 quality-gate）；E2E 新增用例必须能回答"为何不能是单元测试"；覆盖率补测试必须写在归属模块的专文件内（禁止新的 `*-boost` 文件）。
5. **金字塔长期方向**：当前 451 unit : 102 e2e（约 4.4:1），结构尚可；执行阶段一后约 385:60（约 6.4:1）更健康。长期把 LHCI 从每次 PR 改为 main + 定时（`supply-chain-watch.yml` 的 schedule 模式可复用），PR 只留预算检查 + smoke。

---

## 优化记录（追加式）

| 日期       | 改动                                                                                                                                                                                                                                                           | 指标前后对比                                                                                                                                                                                                       | commit                            | 验证                                                                     |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------- | ------------------------------------------------------------------------ |
| 2026-10-12 | 建立基准（本文件创建）。实测：unit 42文件/451用例/100%/3.4s；覆盖率 93.98/84.84/94.73/95.04；CI 408s（Quality Gate 299s：E2E 67s + LHCI 186s）                                                                                                                 | —（基准）                                                                                                                                                                                                          | 待填（本文件合入 main 的 commit） | `test:run`×2 + `test:coverage`×1 + CI run 38268280414                    |
| 2026-10-12 | #218 CI P0（PR #221，同日合入 `07da359`）                                                                                                                                                                                                                      | CI 端到端 408s→281s（-31%，run 38268280414→38279113746）：Quality Gate 299s→199s；E2E 67s单runner→分片46s（另+9s smoke快fail）；LHCI主分支保持全量196s；pw浏览器缓存命中后install 19s→14s；preview 21s串行→19s并行 | `07da359`                         | Quality E2E(1/2+2/2)/Budget/LHCI/Gate聚合全绿；分片51+51零交集本地已验证 |
| 2026-10-12 | #219 测试清理D1~D6（PR #222，同日合入 `d03129f`，D5放弃见#219评论）                                                                                                                                                                                            | 用例 451→429（40文件）；覆盖率 93.98/84.84/94.73/95.04→94.34/85.25/94.73/95.33（四项均≥基线）；CI Tests job 42s→36s                                                                                                | `d03129f`                         | lint/format/tsc/test:run/build全绿；E2E未跑（仅tests/变更）              |
| 2026-10-12 | #223 测试重构R1~R8（待合入）：R2 security表驱动；R3 lifecycle弱断言升级为初始化+行为测试；R6 navigation浏览器36→7（跳转桩抽样+302/EN页转request断言）；R7 showcase16→7、i18n14→5、conflict12→2、docs4→2、a11y5→1、smoke8→5；R1/R4/R5经实证复核后放弃（详见PR） | E2E 102→36用例，本地wall 158s→8s；unit 429→431（it.each展开）；覆盖率94.34/85.25/94.73/95.33→94.42/85.31/94.93/95.33（四项≥#219快照）                                                                              | 待填                              | vitest 431全绿；E2E 36/36全绿；lint/format/tsc全绿                       |

## 待办建议（未确认 / 未实施）

- [x] P0-1~P0-7 CI 结构优化（#218/PR #221 已合入，CI 408s→281s，见优化记录）
- [x] D1~D6 删除清单（#219/PR #222 已合入，D5 放弃，覆盖率四项≥基线，见优化记录）
- [x] R1~R8 重构清单（#223 实施中：R2/R3/R6/R7/R8 落地，R1/R4/R5 经实证复核后放弃）
- [x] LHCI PR/ main 分档（随 #218 落地：`.config/lighthouserc.pr.json`，PR 档本地 18s）
- [x] 本地 E2E 基准回填（已完成：102/102，wall 158s，见 §0.5）
- [ ] 阶段三 1~5（规范与监控，建议各建 Issue 跟踪）

---

_维护说明：每次实施优化后重跑 `pnpm test:run` + `pnpm test:coverage` + 取最新 CI run，追加一行到「优化记录」并更新本快照；覆盖率任一指标低于 §0.2 基准即回滚。_
