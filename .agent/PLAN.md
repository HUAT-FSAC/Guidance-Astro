# PLAN — 项目路线图（Planning Agent 唯一写入点）

> 路线与队列快照；任务/验收以 GitHub Issues 为准，长期约束以 `DECISIONS.md` 为准。历史见 Git、Issue 评论与不可变日报。

最后核实：2026-10-26，Planning 第113轮。开工 `main@60144174dfe92067b83e98ad09ed732c005a5337`，工作区干净；fetch / pull --rebase 成功。fork inbound 仍 `f98be0d/d89b87e`，七个路径内容级 diff 空（已由 `6a80906` 吸收），无新待移植工作，不 merge fork。

## 当前方向

1. 收敛搜索原范围的最后生命周期缺口：首次加载异步初始化重入会在单一外壳内创建两个 PagefindUI。#287 唯一实现，#279/#262 仅保留父验收责任，不重复开发。
2. M4 实际 **6/9**，保持 OPEN；PR274 `1.4.0` minor 继续持合。#281 索引收录已独立验收通过，不回退已完成成果，不为发版缩减原九项 AC。
3. 只读调查 #286 的 CI 浏览器安装/调度长尾；不把耗时位置等同根因、不擅自改主要 CI/CD。维持 Worker SSR、nonce、私有 HTML 缓存与 D-017 Q4 稳态方向。

## 昨日验收（2026-10-25 日报 → 第113轮）

输入：`.agent/DIARY/2026-10-25.md`、`2026-10-24.md`、STATE/HANDOFF/ENV，随后核对执行报告、关键 diff、完整 SHA CI 与生产真实浏览器。昨日日报存在，无需反推替代。

- **#281 通过关闭**：[6417321248](https://github.com/HUAT-FSAC/Guidance-Astro/issues/281#issuecomment-6417321248)。真实 routes/isFallback 生效；14 条纯行为单测本轮通过。生产 VCU 命中 `/en/archive/2025/planning-control/control-fundamentals/`，正文“maintain VCU communication”高亮并点击正确；中文 301、英文 odometry 与负例未退化。
- **#279 部分通过，review → in-progress**：[6417355478](https://github.com/HUAT-FSAC/Guidance-Astro/issues/279#issuecomment-6417355478)。可见入口、真实双语检索、SPA 与关闭行为认可；但原生首次加载 `site-search=1 / #starlight__search=1 / PagefindUI=2`，两个 input 均可见。现有 `.first()` 与仅外壳计数漏检，剩余实现拆 #287。
- **#262 第二次部分通过，review → in-progress**：[6417363659](https://github.com/HUAT-FSAC/Guidance-Astro/issues/262#issuecomment-6417363659)。AC2/4/7/8 通过，AC5 接受既有构建/失败路径记录；AC1/3/6/9 尚有共享 UI/回归完整性差距。按连续两次规则拆成初始化单一窄切片，不让 Executor 第三次宽泛盲试，也不改旧日报美化历史。
- **PR282 交付认可**：`50b3dfa` 仅 metrics 数据 +51/-51，64 键路径（含根）一致，已随 Version `b0f72473` 上线。该 SHA Pipeline cancelled，最终 `6014417` Pipeline success；不声称每个中间 SHA 都全绿。

## 今日目标（2026-10-26）

- #287：初始化重入、await 期间容器失效与 SPA 后重建有明确不重复的行为保证；真实浏览器查询前断言一个 UI / 可见输入，修复后部署并给父单追加证据。
- #286：对四个 CI 长尾样本给出有原始日志支撑的归因或明确未知，重跑现有只读时长采样，提出监测/后续任务，不实施 workflow 改造。

## 当前 Milestone：M4 开发入口与能力声明一致性（进度：6 / 9）

GitHub Milestone #3，`state=OPEN`。REST 成员列表与 GraphQL 双源一致：

- **done（6）**：#266、#264、#263、#268、#270、#281。
- **open（3）**：#262 / #279（in-progress 验收父单）、#287（ready 唯一实现切片）。
- REST milestone 汇总历史漏计成员，不能拿汇总当唯一证据；按逐单真实状态计数。本轮新增 #287 为原搜索范围整改，并非扩展新功能。

### 目标与验收

- #262 原九项 AC 保留；真实路由/英文不同名正文成果已获验收，剩余初始化只由 #287 实现。
- 首次加载与实际 SPA 后，中英/桌面/窄屏既有入口可用且有效容器恰好一个 PagefindUI / 可见输入；真实正文查询、excerpt 高亮、点击、负例、焦点/滚动锁与跨断点不退化。
- 索引 API 失败非零、旧 bundle 不可误用、清单/HTML 不发布、原门禁/预算/SSR nonce 与私有缓存边界维持；绿色 build 或 `.first()` 样本成功不能替代完整可用性。

### 完成信号（Success signal）

#287 交付并由 Planner 验收关闭，#279 剩余 AC 与 #262 原九项追加重验通过关闭；九成员实际 open 归零，再显式关闭 M4（D-020），才解除 PR274 持合。**当前未收敛。**

### 明确非目标（Non-goals）

- 不隐藏/删除搜索，不补全站翻译，不改变 SSR/认证/权限/SESSION/ASSETS/CSP/缓存，不新增 provider/服务/凭据/依赖。
- 不改 CI 编排、runner、缓存策略或预算阈值，不以禁用 job 掩盖凭据错误；#286 只调查，不计 M4。
- 不摄入 majors PR186/209，不实施可选 Projects 配置修复（#280），不启动 M5 或 Q4 新功能。

### 执行队列（2 个 ready，建议顺序）

1. **[#287 消除搜索异步初始化重入导致的重复 PagefindUI](https://github.com/HUAT-FSAC/Guidance-Astro/issues/287)**（P1，low，M4）：无硬依赖。先锁定真实异步重入边界，最小实例级防重入/失效处理与有区分力回归，再真实生产验收。
2. **[#286 调查 Quality 时长告警中的浏览器安装与调度长尾](https://github.com/HUAT-FSAC/Guidance-Astro/issues/286)**（P2，low，无 milestone）：无硬依赖。读取四个离群 run 原始日志与现有 `--dry-run`，报告根因/未知及建议，绝不先改 CI。

- 两单均通过七条 ready 门禁。#279/#262 是验收父单，不计第三/第四份实现容量，下一棒只领取 #287 实施，不重复开分支。
- **常态顺手项 PR285**：仅 metrics JSON +35/-35，head `426c81a65d1f5949b2884250fb2a60d308aebec1`，64 键路径（含根）一致，checks=0 / BLOCKED；沿既有 update-branch → checks 绿 → 合入 → 部署/双语看板验收，不占 ready 名额。

## 已知阻塞与依赖

- **#262 / #279**：待 #287 单一整改完成，分别补原 AC 证据后 review；本轮从 review 退回，不是重置 Executor 原有进行中现场。
- **#101**：blocked，Secrets 仍仅 CODECOV_TOKEN / PROJECT_TOKEN；默认 B 单机 OAuth 可用，不恢复 CI deploy。
- **#197**：needs-info，用户已确认默认 C 手工触发 Release PR CI；保留常驻观察，不重复提问。
- **#280**：blocked，可选 Projects 的独立凭据域；Projects 非任务 SSOT，不扩权、不禁 job。
- **PR274**：`1.4.0` minor 继续持合，[本轮说明 6417370626](https://github.com/HUAT-FSAC/Guidance-Astro/pull/274#issuecomment-6417370626)。#286 不计 M4，但 #287 原范围差距必须解决。
- **PR186 / PR209**：D-015 majors standing reminders，保持暂缓，不算饥饿积压而自动关闭。

## 治理与 Executor 信号回应

- 开放 Issue 7：ready=2、in-progress=2、in-review=0、blocked=2、needs-info=1；P0=0。P1 今日只实施 #287，#279 是验收父单、#101 是外部常驻阻塞，不重复计算容量。
- 全部开放项已检查重复、依赖/范围/可测 AC、优先级、阻塞与方向冲突；无未分诊 auto-discovered。#286 补 P2/low 与只读调查门禁，不因告警自动执行高风险 CI 修改。
- 日报“等待三单验收”已逐项回应；“M4 8/8 即收口”未采纳，因独立发现重复 UI，新增窄任务后真实为 6/9。已完成的路由修复予以关闭，不将整个昨日产出一概否定。
- 不改日报/ENV；按仓库强制规则仅向 STATE/HANDOFF 追加接力补记，下一棒自行刷新顶部执行快照。Issue 与 TASKS 冲突以 Issue 为准。

## 下一阶段

M4 三个剩余成员独立验收并显式关闭后，由 Executor 按 §11.1/§11.2/§11.3 完成 PR274 CI、minor 合并、四方一致性、全 M4 合入提交祖先判定与部署必要性判断。当前不创建依赖未满足的 ready 发版任务，不启动 M5。

## 已放弃的方向

- 以一个 `site-search` 外壳、唯一 ID 或 `.first()` 查询成功推断内部 UI 唯一。
- 因局部通过就采纳日报建议提前关闭 M4 / 发布 minor；第三次宽泛重试搜索而不拆小边界。
- 直接把时长异常当 E2E 测试回退，或凭耗时位置推断安装根因后擅自修改 CI。

## Decision Gate

`pending=0`，D-001..D-022 继续生效；无新长期产品取舍，不重复询问已确认默认。重复初始化是原功能低风险可回滚修复，#286 是只读调查，不授权突破红线。

## 本轮验证边界

- 本轮实跑：14 条路由行为单测、零豁免 audit；原生生产 301/odometry/VCU 查询与点击、负例 0、SPA 重开、Esc 事件完成后焦点/滚动锁。截图 `.tmp/planner113-en-search.png` 清楚显示第二输入框；helper Worker 报错已反馈，原生无 pageerror。
- 只读核验：两个代码合入完整 SHA 的 CI 三工作流 success，最终 `6014417` Pipeline `40207745649` success；`50b3dfa` Pipeline cancelled 如实保留。部署当前 `b0f72473-104f-4554-bd96-175785e45368` 100%；两次首页 27 script nonce 全部头体一致且跨请求不同，私有缓存不变、清单 404、索引 entry 200、sitemap 无清单。
- #286 已定位 668s/572s/599s 安装 step 与一例跨 job 启动长间隙，尚未逐份读安装日志定位底层原因，交 Executor 完成实际调查，不把推断冒充结论。
- 无代码/测试/验证脚本、合并或部署动作；未重跑全量单测/E2E/LHCI，采用已核实远端门禁与本轮真实表面证据。`pnpm format:check` 修正 TASKS 四行列表缩进后 exit 0；`pnpm build` exit 0，实际索引 zh=76/en=67（143 篇），排除 404×2/fallback×17/HTML 壳×23，164 文件/1054.2 KiB。保留 markdown 弃用与 Vite directive 警告完整输出（本会话 artifact://30），不称零警告，不以 build 绿色覆盖双 UI 差距。

## 给 Executor 的指令

先 #287 后 #286；#287 是唯一搜索实现，交付后补 #279 剩余 AC 与 #262 原九项重验再转 review，三单均不得自行关闭。开工刷新自有 STATE/HANDOFF，追加当日日报；M4 未经 Planner 显式关闭前不得合并 PR274。
