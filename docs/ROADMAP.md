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

---

## 2. 当前在做 / 已规划

任务由 [`docs/WORKFLOW.md §4`](./WORKFLOW.md#4-任务看板唯一任务表agent-读写此处) 滚动维护,本表只列**正在**或**已规划**且**未完成**的项。

| 编号  | 任务                                                                                                                   | 优先级 | 状态   | 备注                       |
| ----- | ---------------------------------------------------------------------------------------------------------------------- | ------ | ------ | -------------------------- |
| T-014 | 文档与架构梳理(批 2):ARCHITECTURE / CONTRIBUTING-content / ROADMAP / social-preview / welcome / stale / doc issue 模板 | P1     | 进行中 | 详见 `docs/WORKFLOW.md §4` |
| T-015 | 自动化与发布(批 3):release-please / labeler / secret scan / Makefile                                                   | P2     | 待办   | 依赖 T-014                 |

---

## 3. 方向性 TODO(本季度讨论)

下列是**方向性目标**,尚未拆成具体任务卡。**任何人都可以提 Issue 认领或建议调整**:

### 3.1 内容侧

- **2026 赛季内容** — 招新、新车发布、赛季规划文档化(主语言:中,英文可后置)
- **实验室介绍** — 智能驾驶实验室 / 工程实训中心 301 等线下资产信息结构化
- **Showcase Lab 扩展** — 招新组 demo、感知 demo、规控 demo 录屏与可交互 demo

### 3.2 平台侧

- **动态 og:image** — 当前使用静态品牌图(见 [ADR-002](./adr/002-og-image-deferral.md));
  触发条件:分享 CTR 显著下降 / 日 PV > 5k / 品牌模板就绪 任一
- **多语言贡献流程** — 让非中文母语成员更容易贡献(en `draft: true` 路径 + 翻译记忆库)
- **i18n UI 字符串** — 当前部分 UI 仍是中文硬编码(主要在 `src/components/home/`),
  抽到 `src/content/i18n/<locale>.json` 并补全英文

### 3.3 工程侧

- **Starlight 升级** — 跟进上游,关注 Breaking Change(0.41 → 0.42+)
- **Astro 7 → 8** — 跟踪上游,谨慎升级
- **Vitest 4 / Playwright 1.6** — 已经用最新,**持续小版本升级**
- **测试覆盖率** — 单元从 70 → 80 推动(关注 e2e 关键路径)
- **包体积** — `_astro/*` 单文件预算(目前只有全站预算),细分到路由级

### 3.4 社区侧

- **GitHub Discussions 启用** — 想法/问答/Show & Tell 走 Discussions,Issue 只留任务/缺陷
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
- **修 bug / 提 PR**:见 [`CONTRIBUTING.md`](../CONTRIBUTING.md)
- **聊架构**:在 Discussion 引用 [本目录 ADR](./adr/) 编号

> 路线图不是承诺,是当下共识。每季度评审一次,根据赛季节点/团队规模调整。
