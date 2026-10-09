# Roadmap / 路线图

> 本文档面向**贡献者**和**协作者**说明:
> 已经完成了什么、当前在做什么、接下来会做什么。
>
> 任务来源:`docs/TODOLIST.md`(本仓库 P0-P4 任务表)与 GitHub Issues。
> 实时状态以 `docs/WORKFLOW.md §4 任务看板` 为准(SSOT)。

---

## 1. 已完成(2026-Q1 ~ Q3)

> 截止 2026-09-01,全部 P0-P4 共 20 项已落地。
> 完整归档见 [`docs/reports/`](./reports/)。

| 主题                  | 关键产出                                                                                                | 验证                               |
| --------------------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| **TypeScript 安全**   | 移除 `as any`、Astro `type Props` 化、CI typecheck 必过                                                 | `pnpm build` 零错误                |
| **主题对比度**        | Hero/Achievement 亮色遮罩 + WCAG AA 调色                                                                | `pnpm quality:theme` ✅            |
| **i18n / 搜索 / PWA** | Starlight 中英、Pagefind、Service Worker 智能缓存                                                       | Playwright e2e                     |
| **Workers SSR**       | `output: server` + 每请求 CSP nonce + 边缘缓存                                                          | `curl -sI` 含 `nonce-`             |
| **CI 流水线**         | setup 复合 action、Node 22、coverage 70/60/70/70                                                        | `.github/workflows/ci-cd.yml`      |
| **包体积预算**        | og-image 583KB→88KB、check-bundle-budget、LHCI 0.85                                                     | `pnpm quality:bundle`              |
| **依赖治理**          | Dependabot weekly + `pnpm audit`                                                                        | `.github/dependabot.yml`           |
| **告警闭环**          | Feishu/WeCom Webhook + Web Vitals 阈值告警                                                              | `checkPerformanceAndAlert` 12 用例 |
| **官网评审整改**      | Hero 9MB→294KB、移动端双导航、SEO h1 唯一、@fontsource                                                  | 269 unit + 95 e2e                  |
| **开源合规基线**      | MIT+HUAT FSAC、CODEOWNERS、CODE_OF_CONDUCT、SUPPORT、editorconfig、nvmrc、中英 README、Discussions 入口 | `pnpm install/lint/build`          |
| **文档与架构梳理**    | ARCHITECTURE / CONTRIBUTING-content / ROADMAP / social-preview / welcome / stale / doc issue 模板       | `pnpm build` ✅ docs 可读          |
| **自动化与发布**      | release-please / labeler / gitleaks + pre-commit / Makefile 22 targets                                  | `pnpm lint/build` + YAML/TOML OK   |

---

## 2. 当前在做 / 已规划

> 单一事实来源为 `docs/WORKFLOW.md §4`,此处为 2026-10 刷新（季度评审机械修正，#210）:

| 看板编号      | 状态           | 说明                                                                                                                                                                                                                                                       |
| ------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| T-021         | 已完成         | 路线 C 稳态（不动组织规则）：GITHUB_TOKEN 可推分支/更新已有 Release PR/打 tag/发 Release，唯独新建 PR 被 403 → 维护者 `gh pr create` 补建 runbook 见 WORKFLOW §4；v1.0.0/v1.0.1/v1.0.2 连续三次发布验证、失败 issue 全关，A1(PAT)/A2(App) 留作可选自动优化 |
| T-023 / T-027 | 已完成         | dependabot 积压清零(22→0):actions 9 项 major + astro 7.3.2 + cloudflare 14.3.1 + wrangler 4.131.1 + typescript 6 + eslint 10 + jsdom 30 + lint-staged 17                                                                                                   |
| T-025         | 已完成         | home 组件 UI 中文抽取到 `src/content/i18n/{zh,en}.json`,英文页中文泄漏修复                                                                                                                                                                                 |
| T-026         | 已完成         | Starlight 0.41.11（0.42 经实测 satteri WASI 破坏 workerd 暂缓）；Astro 8 保持预研；覆盖率 70→80 突破（Statements 94.8%/Branches 86.2%/Functions 94.9%/Lines 95.7%），阈值提升至 80；路由级 bundle 预算门禁就绪                                             |
| T-028         | 已完成         | i18n 清尾:数据层(seasons/sponsors)双语、站点全局 meta 修复、死代码清理、overrides 切换器无障碍                                                                                                                                                             |
| T-024         | 已起草(待回填) | 2026 赛季内容(招新/新车),需车队提供赛季信息(素材待回填,见 §3.1)                                                                                                                                                                                            |
| T-029 / T-030 | 已起草(待回填) | 方向性工作拆卡：T-029 实验室介绍结构化、T-030 Showcase Lab 扩展 demo(素材待回填,见 §3.1)                                                                                                                                                                   |

- 动态 og:image 仍按 [ADR-002](./adr/002-og-image-deferral.md) 延期,触发条件未变。

---

## 3. 方向性 TODO(本季度讨论)

下列是**方向性目标**,尚未拆成具体任务卡。**任何人都可以提 Issue 认领或建议调整**:

> ✅ **2026-09-22 更新**：§3.1 内容侧三项（2026 赛季内容 / 实验室介绍 / Showcase 扩展）已起草上线，剩素材/清单待车队回填，详见 §3.1 标注；下方其余条目仍为长期方向。
>
> ✅ **2026-10-05 更新**：§3.2 i18n UI 字符串、§3.3 测试覆盖率与路由级包体积已标注完成状态（T-025/T-026/T-028）；§3.3 Starlight 升级按 D-004 标记暂缓。
>
> ✅ **2026-10-09 更新**：季度评审机械刷新（#210）— §2 摘要时点更新为 2026-10、T-024/T-029/T-030 与 §3.1「已起草」口径对齐、§3.2 按 D-016 收敛（#203/#204 已交付）、§3.3 补 D-015 majors 暂缓指引。

### 3.1 内容侧

- **2026 赛季内容** — 招新、新车发布、赛季规划文档化(主语言:中,英文可后置)（✅ 2026-09-22 已起草 `news/2026-season-preview.mdx`，未知项标注「待车队确认」）
- **实验室介绍** — 智能驾驶实验室 / 工程实训中心 301 等线下资产信息结构化（✅ 2026-09-22 已起草 `labs.mdx`，设备清单占位待车队盘点）
- **Showcase Lab 扩展** — 招新组 demo、感知 demo、规控 demo 录屏与可交互 demo（✅ 2026-09-22 已起草 `showcase-demos.mdx`，录屏素材待交）

### 3.2 平台侧

- **动态 og:image** — 当前使用静态品牌图(见 [ADR-002](./adr/002-og-image-deferral.md));
  触发条件:分享 CTR 显著下降 / 日 PV > 5k / 品牌模板就绪 任一
- **多语言贡献流程** — 让非中文母语成员更容易贡献(en `draft: true` 路径 + 翻译记忆库)
- **i18n UI 字符串** ✅（T-025 + T-028）— home 组件中文已抽取到
  `src/content/i18n/{zh,en}.json`，数据层双语与全局 meta 已完成；
  残留硬编码中文已按 D-016（用户裁定 =A，只修缺陷类）治理完毕：
  面包屑（#203）与其余 aria-label / 英文站可见文案（#204）随 v1.2.1 上线；
  Bucket E（Giscus / TeamNews chrome）用户未选，不建单

### 3.3 工程侧

- **Starlight 升级** ⏸（D-004 暂缓）— 0.42 经实测 satteri WASI 破坏 workerd 构建链，
  等上游修复；触发条件：上游发布兼容 workerd 的 0.42.x 补丁
- **Astro 7 → 8** — 跟踪上游,谨慎升级
- **Vitest 4 / Playwright 1.6** — 已经用最新,**持续小版本升级**
- **majors 类升级** ⏸（D-015 暂缓，2026-10-03 裁定）— Astro 7→8、TypeScript 6→7 等 semver-major 一律不自动摄入；重评触发见 `.agent/DECISIONS.md` D-015
- **测试覆盖率** ✅（T-026）— Statements 94.8% / Branches 86.2% /
  Functions 94.9% / Lines 95.7%，阈值已提升至 80；
  仍关注 e2e 关键路径持续覆盖
- **包体积** ✅（T-026）— 全站 + 路由级预算门禁均已就绪
  （`pnpm quality:bundle`）；后续仅随新页面调整阈值

### 3.4 社区侧

- **GitHub Discussions 分流** ✅ 已启用 — 问答/想法/展示走 [Discussions](https://github.com/HUAT-FSAC/Guidance-Astro/discussions),Issue 只留任务/缺陷;规则详见 [CONTRIBUTING](../.github/CONTRIBUTING.md) 的「讨论分流」一节
- **Discord / 飞书外部群** — 招募与社区互动(独立决策,不影响本仓库)

---

## 4. 不做(明确范围外)

为避免范围蔓延,以下**明确不做**,需要时单独立 ADR 推翻:

- ❌ 用户系统 / 登录 / 评论平台自建(评论用 [Giscus](https://giscus.app/) 复用 GitHub)
- ❌ 商城 / 支付(赞助/招新走线下渠道,站点仅展示)
- ❌ 多团队聚合(本仓库只服务 HUAT FSAC 一支车队)
- ❌ 复杂 CMS(Starlight content collections + 文件 git 已够用)

---

## 5. 怎么参与

- **提建议**:开 [Discussion](https://github.com/HUAT-FSAC/Guidance-Astro/discussions) → Ideas
- **接任务**:看 [`docs/WORKFLOW.md §4`](./WORKFLOW.md) 待办行,自荐或评论
- **修 bug / 提 PR**:见 [`CONTRIBUTING.md`](../.github/CONTRIBUTING.md)
- **聊架构**:在 Discussion 引用 [本目录 ADR](./adr/) 编号

> 路线图不是承诺,是当下共识。每季度评审一次,根据赛季节点/团队规模调整。
