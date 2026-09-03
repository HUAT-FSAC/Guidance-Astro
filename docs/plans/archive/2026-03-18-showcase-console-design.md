# Showcase Console Enhancement Design

## 背景

现有 `ShowcaseLab` 已经支持场景切换、子系统聚焦和时间轴回放，能够完成基础的产品概念展示。但它仍然偏向“单人浏览”，缺少演示人员在首页直接讲解、比较和解释系统状态的能力。

这轮增强的目标，是在不引入后端、不接入真实离线能力的前提下，把模块升级成一个更完整的前端展示控制台，使其同时具备：

1. 场景对比能力
2. 脚本化讲解能力
3. 离线缓存概念展示能力

## 目标

1. 在现有 `ShowcaseLab` 内新增统一的 `Presentation Console`。
2. 提供 `Compare Mode`，支持主场景与对比场景差异摘要。
3. 提供 `Demo Script`，支持脚本步骤跳转和自动讲解。
4. 提供 `Offline Cache Simulator`，展示前端模拟的缓存状态与资源准备度。
5. 保持纯前端实现，所有数据来自本地静态配置与浏览器状态。
6. 保持与现有回放、场景切换、本地持久化逻辑兼容。

## 非目标

1. 不做真实网络缓存、Service Worker 或离线请求接管。
2. 不做可编辑脚本系统或后台内容管理。
3. 不引入新的状态管理库、图表库或 UI 框架。
4. 不把首页改造成独立全屏应用。

## 方案选择

### 方案 A：三个独立卡片，彼此弱耦合

为对比、脚本、离线状态分别新增独立卡片，各自管理自身状态。

优点：

1. 实现边界清晰
2. 测试相对简单

缺点：

1. 三个能力之间缺少联动
2. 演示体验容易变散

### 方案 B：统一控制台，共享展示状态

在现有 `ShowcaseLab` 中新增一个 `Presentation Console` 区域，内部包含 `Compare Mode`、`Demo Script` 和 `Offline Cache Simulator` 三个子卡片，并共享当前场景、子系统、回放帧等核心状态。

优点：

1. 与现有展示主体耦合自然
2. 演示者可以连续切换不同模式
3. 能让对比、脚本、离线状态互相响应

缺点：

1. 客户端状态机会更复杂
2. 需要更细致地定义状态边界

### 方案 C：单独新建演示页面

为控制台能力开辟独立页面，把 Showcase Lab 只保留在首页作为引导模块。

优点：

1. 表现空间最大
2. 不受首页版式约束

缺点：

1. 改动范围明显扩大
2. 与当前首页集成目标不符
3. 超出本轮 YAGNI 范围

## 推荐方案

选择方案 B。

它在不破坏现有首页结构的前提下，能把对比、讲解和缓存概念统一纳入一个前端控制台，展示效果和实现成本之间的平衡最好。

## 信息架构

继续沿用现有 `ShowcaseLab` 主体结构，在左侧已有的 `Mission Presets` 和 `Mission Replay` 下方新增一个 `Presentation Console` 容器，内部放置 3 个子卡片：

1. `Compare Mode`
2. `Demo Script`
3. `Offline Cache Simulator`

这些子卡片共享一套运行时状态，但只消费自己关心的那部分数据，不反向破坏原有展示层。

## 状态设计

客户端状态分为 4 组：

1. 基础展示状态
    - `scenarioId`
    - `subsystemId`
    - `frameIndex`
    - `isPlaying`
2. 对比状态
    - `isCompareEnabled`
    - `compareScenarioId`
3. 脚本状态
    - `scriptId`
    - `scriptStepIndex`
    - `isScriptPlaying`
4. 离线模拟状态
    - `cacheMode`
    - `cachedPacks`
    - `hitRate`
    - `lastSyncLabel`
    - `resourceStates`

所有状态继续允许通过 `localStorage` 做轻量持久化，确保刷新后仍保留用户刚才的演示上下文。

## Compare Mode 设计

`Compare Mode` 用于展示“当前主场景”和“另一个对比场景”的差异，不会渲染第二套完整的大面板，而是输出紧凑型差异摘要。

交互规则：

1. 默认关闭。
2. 开启后显示对比场景选择器。
3. 对比场景默认选为“不是当前主场景的下一个场景”。
4. 主场景依然由顶部 `Mission Presets` 决定。
5. 切换主场景时，如果与对比场景冲突，则自动替换对比场景为下一个合法候选。

展示内容：

1. 关键指标对比
    - 速度
    - 横向误差
    - 控制延迟
2. 策略标题对比
3. 风险标签对比
4. 当前回放帧标题对比
5. `Delta Highlights` 差异摘要文案

实现上不单独存储对比结果，而是基于两个场景快照运行时计算：

1. 主场景快照
2. 对比场景快照
3. 指标 delta
4. 差异文案

## Demo Script 设计

`Demo Script` 用来把 Showcase Lab 从“自由浏览”扩展成“可讲解演示”。

本轮只做预设脚本，不做自由编辑。初始提供 3 条脚本：

1. `全链路讲解`
2. `高速策略讲解`
3. `安全闭环讲解`

每个脚本由多个 `step` 组成，每步定义：

1. 目标场景
2. 目标子系统
3. 目标回放帧
4. 讲解标题
5. 讲解文案
6. 可选高亮焦点
    - `metrics`
    - `stages`
    - `track`
    - `subsystem`
    - `compare`

交互规则：

1. 选择脚本后，默认停在第 1 步。
2. 提供 `Prev Step / Next Step / Auto Narrate` 控件。
3. 自动讲解按固定节奏推进步骤。
4. 推进步骤时，会同步跳转主场景、子系统和回放帧。
5. 用户手动切换场景、子系统或拖动回放条时，脚本自动播放立即暂停。
6. 当前脚本和步骤保留，但不强制抢占用户控制权。

视觉上只做“提亮当前焦点 + 轻微弱化其它区域”的处理，不引入复杂遮罩或全屏导览。

## Offline Cache Simulator 设计

该卡片只做前端状态模拟，不提供真实离线能力。文案上会明确标注 `Simulation only`，避免误导。

展示内容：

1. 顶部状态
    - `Cache Cold`
    - `Cache Ready`
    - `Syncing`
2. 摘要指标
    - `Cached Packs`
    - `Hit Rate`
    - `Last Sync`
3. 资源清单
    - `Scenario Data`
    - `Replay Frames`
    - `Track SVG`
    - `Trend Snapshots`
    - `Script Presets`

资源状态包括：

1. `ready`
2. `stale`
3. `pending`

交互按钮：

1. `Warm Cache`
2. `Simulate Drift`
3. `Reset Cache`

联动规则：

1. 打开 Compare Mode 时，模拟的缓存包数量略增。
2. Demo Script 自动讲解开启时，若缓存为冷态，则展示“仅内存模拟”的提示。
3. 所有状态变化仅更新 UI 和本地持久化，不修改实际网络请求行为。

## 数据与实现设计

### 数据层

扩展现有 `src/data/showcase-lab.ts`，新增：

1. 对比模式所需的摘要规则或标签映射
2. 讲解脚本静态数据
3. 离线缓存模拟的初始资源状态配置

### 工具层

扩展 `src/utils/showcase-lab.ts`，新增能力：

1. 生成对比快照
2. 生成脚本快照
3. 脚本步骤推进
4. 缓存模拟状态推进与派生摘要

### 客户端层

扩展 `src/utils/showcase-lab-client.ts`：

1. 新增 Compare / Script / Cache 三组状态
2. 绑定新按钮、开关和选择器事件
3. 负责联动规则
4. 渲染卡片内容与高亮类名

### 视图层

更新 `src/components/home/sections/ShowcaseLab.astro`：

1. 新增 `Presentation Console`
2. 渲染 3 个控制卡片
3. 注入新增的初始状态占位
4. 扩展样式，保证桌面和移动端都可读

## 风险与对策

1. 风险：状态分支增加，容易出现联动冲突。
   对策：保持“基础展示状态”为唯一事实来源，其它模式只派生或驱动基础状态。

2. 风险：展示信息过多，首页变得杂乱。
   对策：使用紧凑摘要卡片，不复制大块现有内容。

3. 风险：脚本播放与手动交互冲突。
   对策：任何手动交互都暂停脚本自动推进。

4. 风险：离线缓存模拟被误解为真实离线能力。
   对策：统一标注 `Simulator` 和 `Simulation only`。

## 验收标准

1. 首页出现新的 `Presentation Console`。
2. Compare Mode 能展示主场景与对比场景的差异摘要。
3. Demo Script 能按步骤切换场景、子系统和回放帧。
4. 自动讲解在手动交互后会暂停。
5. Offline Cache Simulator 能响应 `Warm Cache / Simulate Drift / Reset Cache`。
6. 刷新页面后，控制台状态仍能从本地持久化恢复。
7. 构建、单测和目标 E2E 全部通过。
