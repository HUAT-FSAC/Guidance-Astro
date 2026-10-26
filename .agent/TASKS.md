# TASKS — Issue 本地镜像

> 同步：2026-10-26，Planning 第113轮；GitHub Issues 可读写，依据本轮真实状态**整体重写**，无降级。开工基线 `main@60144174dfe92067b83e98ad09ed732c005a5337`，fetch / pull --rebase 成功。
> D-013 映射：`ready` = `status:backlog` + 正文首行 `队列状态：ready`；`in-progress` = `status:in-progress`；`in-review` = `status:review`；`done` = `status:done`；`blocked` / `needs-info` 不并挂 backlog。

## 今日队列（2026-10-26，2 个 ready）

1. **[#287 消除搜索异步初始化重入导致的重复 PagefindUI](https://github.com/HUAT-FSAC/Guidance-Astro/issues/287)** — P1 / ready / low / M4。
    - 无硬依赖；#279/#262 唯一剩余实现切片。首次加载、异步重入及容器替换后保证一个有效 UI / 可见输入；更新现有真实行为回归，不以 `.first()`、隐藏或删重复 DOM 掩盖。
    - 原生生产浏览器验证 375px 中英查询、1600px VCU、负例、SPA、焦点/滚动锁与跨断点；完整 CI、部署与 nonce 验收。交付后在 #279 补剩余 AC、#262 补原九项重验，再分别转 review；Executor 不自行 close。
2. **[#286 调查 Quality 时长告警中的浏览器安装与调度长尾](https://github.com/HUAT-FSAC/Guidance-Astro/issues/286)** — P2 / ready / low / 无 milestone。
    - 无硬依赖，与 #287 独立；只读四个离群 run 的原始安装/调度日志与现有 `check-duration-budget.mjs --dry-run`。输出可证实根因、证据缺口及监测/后续修复建议，不修改 CI、缓存、依赖或阈值。
    - 不计 M4 搜索功能验收，不为单点调查新建 M5；由 Planner 验收后关单。

两单正文均有目标、范围/非目标、已满足依赖、可判定 AC 与测试要求，通过七条 ready 门禁；无未决产品取舍或高风险实施授权。

## 全部开放 Issue（7 项）

- **#287**：P1 / ready / low；M4，今日第 1 位，唯一初始化整改实现。
- **#286**：P2 / ready / low；无 milestone，今日第 2 位，只读安装/调度长尾调查，保留原始自动告警与 `flaky` 标签。
- **#279**：P1 / in-progress / low；M4，首次验收**部分通过**，review 退回。保留已交付可见入口/真实查询，剩余双 UI 由 #287 实现，本单仅父验收，不另开实现分支。
- **#262**：P2 / in-progress / medium；M4，第二次验收**部分通过**，review 退回。原九项 AC 不缩范围，已拆窄 #287，禁止第三次宽泛盲试。
- **#101**：P1 / blocked / medium；无 milestone。Secrets 仍仅 `CODECOV_TOKEN` / `PROJECT_TOKEN`；默认 B 单机 OAuth 部署，未经授权不恢复 CI deploy。
- **#197**：P3 / needs-info / medium；无 milestone。用户已确认默认 C，维持手工触发 Release PR CI，常驻观察、不重复提问。
- **#280**：P3 / blocked / medium；无 milestone。可选 Projects 的独立 `PROJECT_TOKEN` 凭据域，未授权不改权限/凭据/workflow；Projects 非任务 SSOT。

统计：ready=2、in-progress=2、in-review=0、blocked=2、needs-info=1；P0=0，P1=3（其中今日容量只占 #287，#279 为验收父单、#101 为外部常驻阻塞）。不重复计算父子实施容量；无未定级发现项、无需要重置的疑似中断现场。

## 昨日验收（第112轮执行产出 → 第113轮独立核验）

- **#281：通过并 done/closed**，[验收 6417321248](https://github.com/HUAT-FSAC/Guidance-Astro/issues/281#issuecomment-6417321248)。真实 Starlight routes / isFallback 替代同名中文 slug 推导；本轮 14 条行为单测通过，原生生产 VCU 命中英文 Control Fundamentals 正文并点击正确，原双语查询及负例通过。
- **#279：部分通过，in-progress**，[验收 6417355478](https://github.com/HUAT-FSAC/Guidance-Astro/issues/279#issuecomment-6417355478)。入口/中文及英文查询/SPA/关闭状态认可；首次加载同一外壳内 `PagefindUI=2`、两个可见 input，现有 `.first()` 绕过此缺口；剩余实现拆 #287。
- **#262：部分通过，in-progress**，[九项结论 6417363659](https://github.com/HUAT-FSAC/Guidance-Astro/issues/262#issuecomment-6417363659)。AC2/4/7/8 通过；AC5 认可既有错误路径与构建记录（本轮未破坏产物重跑）；AC1/3/6/9 仍有共享 UI/回归完整性缺口。连续两次未全通过，已拆窄实现与父单重验，不安排第三次宽泛试错。
- **PR282：交付认可**，仅 metrics JSON +51/-51，64 键路径（含根）一致，已随 Version `b0f72473` 上线；不把该 merge SHA 的 cancelled Pipeline 写成 success，最终 `6014417` Pipeline 成功。

## Milestone 与发版

- **M4 #3：实际 6 / 9，OPEN**。REST 成员列表与 GraphQL 一致：done=`#266/#264/#263/#268/#270/#281`；open=`#262/#279/#287`。REST 汇总曾漏计成员，本轮不凭汇总推断完成，成员实际 open=3。
- **M2 / M3**：既有 closed；#101/#197/#280/#286 不计 M4。
- **PR274 `release 1.4.0` minor：继续持合**，[6417370626](https://github.com/HUAT-FSAC/Guidance-Astro/pull/274#issuecomment-6417370626)。只有三个剩余 M4 成员验收关闭、实际 open 归零且 Planner 显式关闭 M4 后才可按 §11 发版。

## 开放 PR（4 张）

- **PR285**：常态 metrics 顺手项，head `426c81a65d1f5949b2884250fb2a60d308aebec1`，仅 JSON +35/-35，64 键路径（含根）一致，checks=0 / BLOCKED。按既有 update-branch → checks 绿 → 合入 → 必要部署及双语看板验收，不占今日 ready 名额。
- **PR274**：`1.4.0` minor 持合，head `42eb61571a5334b6a1863948263e5cc185f15831`。
- **PR186 / PR209**：majors 按 D-015 暂缓，保留 open standing reminders，不自动摄入、不计今日容量。

## 本轮证据与验证边界

- `pnpm test:run src/integrations/search-manifest-filter.test.ts`：exit 0，14 passed；`pnpm quality:audit`：exit 0，零豁免；Dependabot open alerts=0。
- 完整 `de758dc` 的 Pipeline `40204446775`、完整 `a063e34` 的 Pipeline `40206667979` 及各自 Secret Scan / Release Please success；最终 `60144174dfe92067b83e98ad09ed732c005a5337` Pipeline `40207745649` / Secret Scan `40207745676` / Release Please `40207745647` success。`50b3dfa` Pipeline `40207288251` cancelled，如实保留。
- strip proxy 后 `wrangler deployments list`：当前生产 Version `b0f72473-104f-4554-bd96-175785e45368`，100%。两次首页 200、各 27 script nonce 全部与本请求 CSP 一致，nonce `SJqPxDVvXf8MmgazICHzAQ` / `MiuonF_-a8JQWljWwdOr5Q` 不同，HTML `private, no-cache, must-revalidate`；清单 404、索引 entry 200、sitemap 无清单。
- 原生 Chromium 实跑 301/odometry/VCU 查询与点击、excerpt、负例、SPA 重开、Esc 事件完成后的焦点/滚动锁；截图 `.tmp/planner113-en-search.png` 显示第二输入框，`.tmp/planner113-spa-search.png` 为 SPA 样本。helper 的 Worker 元数据错误已反馈工具问题，原生查询无 pageerror；不混作产品故障。
- fork inbound 仍 `f98be0d/d89b87e`；七个改动路径内容级 diff 空，既有吸收 commit `6a80906`，不 merge fork。
- 本轮不写代码、测试或验证脚本，不新部署，不替 Executor 合并 PR；ENV/DIARY 只读，STATE/HANDOFF 仅按仓库强制回写规则追加接力补记。
