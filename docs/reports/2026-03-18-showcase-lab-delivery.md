# 2026-03-18 Showcase Lab 交付报告

## 分支与基线

- 当前仓库分支:
  - `main` / `origin/main` -> `4902df4` `ci: fix github actions protected branch push error`
  - `origin/master` -> `ae5c576` `feat: add imu-parts-overview.jpg for ins5711daa documentation`
  - `origin/feat/backend-auth` -> `e9a3043`
  - `origin/dependabot/...` -> `ed0acd0`
- 根提交(初始版本): `ec9d10f` `fully init`
- 本次开发以主线基线 `main@4902df4` 为确认参考，并在独立工作分支 `feat/showcase-lab-front` 上实现。

## Phase 0 - 需求扩展

- 规格文档: `docs/plans/2026-03-18-showcase-lab-design.md`
- 将“前端纯展示、无后端依赖”的要求扩展为一个首页展示模块 `Autonomous Showcase Lab`。
- 目标能力:
  - 用静态数据和 SVG 展示无人驾驶赛车从感知到执行器的闭环。
  - 通过场景切换展示不同任务模式下的产品概念与交互逻辑。
  - 使用 `localStorage` 持久化用户选择，支持纯前端离线演示。
  - 在视觉上提供高辨识度的数据卡片、趋势线、赛道预览和系统链路。

## Phase 1 - 规划

- 实施计划: `docs/plans/2026-03-18-showcase-lab-plan.md`
- 核心设计决策:
  - 数据层与状态解析层拆分，避免把展示逻辑散落在组件里。
  - 组件以单个 section 接入首页，不破坏现有 Starlight 首页拼装结构。
  - 场景切换采用本地状态驱动，不依赖任何服务端 API。
  - 把可回归风险最高的点放进测试: 场景切换、SVG 重绘、子系统切换、本地存储恢复。

## Phase 2 - 并行执行

- 首页新增 `ShowcaseLab` 展示模块，接入首页文档入口。
- 新增 4 个纯前端展示场景:
  - 发车校准
  - 高速循迹
  - 八字绕环
  - 紧急制动
- 每个场景包含:
  - 遥测指标卡片
  - 赛道 SVG 预览与标记点
  - 趋势曲线
  - 系统链路卡片
  - 子系统焦点说明
- 本地交互能力:
  - 场景切换
  - 子系统切换
  - `localStorage` 持久化
  - 场景默认子系统回落
- 关键工程补强:
  - 子系统 tabs 改为按当前场景完整重建，解除“所有场景必须共享同一 tab 集合”的隐藏约束。
  - 去掉 `innerHTML` 更新路径，改为 `createElement` / `replaceChildren`，缩小未来 DOM 注入面。
  - 去掉外部 Google Fonts 依赖，保持演示模块的本地可运行属性。
  - 新增展示配置校验，显式验证默认场景和默认子系统是否有效。

## Phase 3 - QA 循环

- `pnpm lint` -> 通过
- `pnpm build` -> 通过
- `pnpm test:run` -> 通过，`10` 个测试文件 `78` 个测试全部通过
- `pnpm test:e2e -- tests/e2e/showcase-lab.spec.ts --workers=1` -> 通过，`5` 个 Playwright 用例全部通过
- 说明:
  - 当前环境直接用 Playwright 拉起默认 dev server 偶发 `spawn EPERM` / 连接异常。
  - 最终 E2E 采用“先构建 `dist`，再用临时静态服务托管”的稳定路径完成验证。

## Phase 4 - 多维度验证

- 架构评审:
  - 已修复场景切换后子系统 tabs 不重建的问题。
  - 已修复单例初始化问题，组件现在按实例独立绑定。
- 安全评审:
  - 已移除外部字体依赖。
  - 已将动态区域更新改为 DOM API，不再依赖 `innerHTML`。
- 代码质量评审:
  - 已补强默认配置一致性校验。
  - 已新增覆盖 SVG 标记、徽章刷新、tab 重建、本地存储恢复的测试。

## Phase 5 - 交付结论

- 交付结果满足“纯前端、无后端依赖、可直接展示核心产品概念”的目标。
- 当前实现适合作为首页第一版产品展示模块，也具备继续扩展新场景和新子系统的基础。
- 无阻断性问题遗留。
- 可继续迭代方向:
  - 把场景数据进一步抽离为可复用内容源。
  - 为展示模块补充离线缓存或 PWA 层能力。
  - 如果后续需要更强复用性，可将 SSR 与客户端渲染进一步统一成单一模板源。
