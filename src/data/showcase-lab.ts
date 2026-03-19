export type ShowcaseMetricTone = 'accent' | 'positive' | 'warning'
export type ShowcaseStageTone = 'optimal' | 'tracking' | 'watch'

export interface ShowcaseMetric {
    id: string
    label: string
    value: string
    unit: string
    note: string
    tone?: ShowcaseMetricTone
}

export interface ShowcaseTrackMarker {
    x: number
    y: number
    type: 'cone' | 'apex' | 'gate'
}

export interface ShowcaseTrackMap {
    label: string
    objective: string
    path: string
    progressPath: string
    car: {
        x: number
        y: number
    }
    markers: ShowcaseTrackMarker[]
}

export interface ShowcaseTrend {
    label: string
    values: number[]
    startLabel: string
    endLabel: string
}

export interface ShowcaseStage {
    id: string
    label: string
    state: string
    detail: string
    tone: ShowcaseStageTone
}

export interface ShowcaseSubsystem {
    id: string
    label: string
    eyebrow: string
    headline: string
    summary: string
    bullets: string[]
}

export interface ShowcaseStrategy {
    title: string
    copy: string
}

export interface ShowcaseReplayMetricOverride {
    id: string
    value: string
    note?: string
    tone?: ShowcaseMetricTone
}

export interface ShowcaseReplayStageOverride {
    id: string
    state: string
    detail?: string
    tone?: ShowcaseStageTone
}

export interface ShowcaseReplayFrame {
    id: string
    title: string
    summary: string
    progressPath?: string
    car?: {
        x: number
        y: number
    }
    trendIndex: number
    metricOverrides?: ShowcaseReplayMetricOverride[]
    stageOverrides?: ShowcaseReplayStageOverride[]
}

export interface ShowcaseReplay {
    frameDurationMs: number
    frames: ShowcaseReplayFrame[]
}

export interface ShowcaseScenario {
    id: string
    name: string
    tagline: string
    description: string
    badges: string[]
    strategy: ShowcaseStrategy
    metrics: ShowcaseMetric[]
    track: ShowcaseTrackMap
    trend: ShowcaseTrend
    stages: ShowcaseStage[]
    subsystems: ShowcaseSubsystem[]
    replay: ShowcaseReplay
    defaultSubsystemId: string
}

// 赛道设计规范：
// 1. 发车校准：直线制动区，锥桶均匀分布在赛道两侧，车辆在中间
// 2. 直线高速：长直道，锥桶均匀分布在两侧
// 3. 高速循迹：大弯曲S型赛道
// 4. 八字绕环：∞符号（两个对称圆形），中间有直线通道，车辆从直线进入，绕环后出去
// 5. 紧急制动：直线赛道，锥桶均匀分布

export const showcaseScenarios: ShowcaseScenario[] = [
    {
        id: 'launch-calibration',
        name: '发车校准',
        tagline: '传感器同步与车端自检的最后 12 秒',
        description:
            '在起跑线前完成 LiDAR、IMU、制动器和转向系统的联调，确保车辆以可控状态进入赛道。',
        badges: ['Launch Prep', 'Safety First', 'Offline Demo'],
        strategy: {
            title: '保守起步策略',
            copy: '优先锁定定位与制动可信度，再逐步释放驱动输出，避免带着不确定性冲出发车区。',
        },
        metrics: [
            {
                id: 'speed',
                label: '当前车速',
                value: '18',
                unit: 'km/h',
                note: '低速滚动自检',
                tone: 'accent',
            },
            {
                id: 'cone-lock',
                label: '锥桶锁定率',
                value: '98.4',
                unit: '%',
                note: '双传感器对齐完成',
                tone: 'positive',
            },
            {
                id: 'localization',
                label: '定位置信度',
                value: '99.2',
                unit: '%',
                note: '惯导重投影稳定',
                tone: 'positive',
            },
            {
                id: 'latency',
                label: '控制延迟',
                value: '12',
                unit: 'ms',
                note: '仍保留安全冗余',
                tone: 'warning',
            },
        ],
        track: {
            label: '发车区直线制动区',
            objective: '完成起跑前的定位和执行器闭环确认',
            path: 'M40 80 L280 80 L280 140 L40 140 Z',
            progressPath: 'M60 110 L220 110',
            car: { x: 220, y: 110 },
            markers: [
                { x: 60, y: 65, type: 'cone' },
                { x: 100, y: 65, type: 'cone' },
                { x: 140, y: 65, type: 'cone' },
                { x: 180, y: 65, type: 'cone' },
                { x: 220, y: 65, type: 'cone' },
                { x: 260, y: 65, type: 'cone' },
                { x: 60, y: 155, type: 'cone' },
                { x: 100, y: 155, type: 'cone' },
                { x: 140, y: 155, type: 'cone' },
                { x: 180, y: 155, type: 'cone' },
                { x: 220, y: 155, type: 'cone' },
                { x: 260, y: 155, type: 'cone' },
                { x: 50, y: 110, type: 'gate' },
                { x: 270, y: 110, type: 'gate' },
            ],
        },
        trend: {
            label: '系统稳定度',
            values: [72, 78, 85, 91, 95, 97],
            startLabel: '自检启动',
            endLabel: '允许发车',
        },
        stages: [
            {
                id: 'perception',
                label: '感知',
                state: '锥桶与边界线同步完成',
                detail: 'LiDAR 与双目摄像头的目标簇已经对齐，可用于起跑区域识别。',
                tone: 'optimal',
            },
            {
                id: 'localization',
                label: '定位',
                state: '组合导航偏差收敛到 5 cm 内',
                detail: 'IMU 预积分已回归稳定，GNSS 作为边界校验输入。',
                tone: 'optimal',
            },
            {
                id: 'planning',
                label: '规划',
                state: '起步轨迹锁定为安全走廊',
                detail: '限制初始横摆率，优先保持直行稳定。',
                tone: 'tracking',
            },
            {
                id: 'control',
                label: '控制',
                state: '转向与制动冗余均在线',
                detail: '制动器回压与方向盘编码器都已通过阈值检查。',
                tone: 'optimal',
            },
            {
                id: 'actuation',
                label: '执行器',
                state: '驱动扭矩处于限幅模式',
                detail: '起步阶段扭矩输出被限制在安全范围内，待自检完成后逐步释放。',
                tone: 'tracking',
            },
        ],
        subsystems: [
            {
                id: 'perception',
                label: '感知',
                eyebrow: 'Cone Detection',
                headline: '起步前先把赛道边界看清楚',
                summary: '发车校准阶段，感知模块需要优先完成锥桶与边界的识别和对齐。',
                bullets: ['锥桶目标聚类', '边界线拟合', '双传感器对齐'],
            },
            {
                id: 'localization',
                label: '定位',
                eyebrow: 'Pose Initialization',
                headline: '定位初始化是发车的先决条件',
                summary: '通过惯导预积分和 GNSS 校验，确保车辆位姿在起跑前已收敛。',
                bullets: ['惯导预积分稳定', 'GNSS 边界校验', '位姿偏差收敛'],
            },
            {
                id: 'planning',
                label: '规划',
                eyebrow: 'Launch Planner',
                headline: '首段轨迹以安全走廊为主',
                summary: '起步轨迹规划优先考虑安全性和稳定性，而非速度。',
                bullets: ['安全走廊约束', '起步速度限制', '横摆率约束'],
            },
            {
                id: 'control',
                label: '控制',
                eyebrow: 'System Check',
                headline: '执行器闭环检查通过后才允许起步',
                summary: '控制模块在发车前需要确认转向和制动系统的冗余状态。',
                bullets: ['转向冗余检查', '制动冗余检查', '执行器回读校验'],
            },
            {
                id: 'actuation',
                label: '执行器',
                eyebrow: 'Torque Limiter',
                headline: '扭矩限幅模式确保安全起步',
                summary: '起步阶段驱动扭矩被限制在安全范围内，防止意外加速。',
                bullets: ['扭矩限幅', '逐步释放策略', '安全阈值监控'],
            },
        ],
        replay: {
            frameDurationMs: 500,
            frames: [
                {
                    id: 'sync-calibration',
                    title: '同步校准',
                    summary: '系统正在逐项确认定位和制动状态',
                    trendIndex: 0,
                },
                {
                    id: 'launch-ready',
                    title: '校准完成，释放起步窗口',
                    summary: '允许车辆以低扭矩进入发车区',
                    progressPath: 'M60 110 L180 110',
                    car: { x: 180, y: 110 },
                    trendIndex: 3,
                    metricOverrides: [
                        {
                            id: 'speed',
                            value: '24',
                            note: '自检完成，扭矩开始释放',
                            tone: 'accent',
                        },
                    ],
                    stageOverrides: [
                        {
                            id: 'actuation',
                            state: '扭矩释放提升到 52%',
                            detail: '执行层保持限幅，但允许更顺畅的起步。',
                            tone: 'tracking',
                        },
                    ],
                },
            ],
        },
        defaultSubsystemId: 'perception',
    },
    {
        id: 'straight-high-speed',
        name: '直线高速',
        tagline: '在直线赛道上追求极限速度，考验动力与空气动力学',
        description:
            '车辆进入长直道区域，系统专注于动力输出最大化、空气动力学优化和高速稳定性控制。',
        badges: ['Straight Line', 'Top Speed', 'Aero Dynamics'],
        strategy: {
            title: '极速冲刺策略',
            copy: '在直线赛道上释放全部动力，同时保持车辆稳定性，追求最高尾速。',
        },
        metrics: [
            {
                id: 'speed',
                label: '当前车速',
                value: '156',
                unit: 'km/h',
                note: '接近极速',
                tone: 'accent',
            },
            {
                id: 'acceleration',
                label: '纵向加速度',
                value: '4.2',
                unit: 'm/s²',
                note: '全力加速中',
                tone: 'positive',
            },
            {
                id: 'localization',
                label: '定位置信度',
                value: '99.5',
                unit: '%',
                note: '高速定位稳定',
                tone: 'positive',
            },
            {
                id: 'aero-load',
                label: '空气下压力',
                value: '892',
                unit: 'N',
                note: '下压力充足',
                tone: 'accent',
            },
        ],
        track: {
            label: '直线高速赛道',
            objective: '在直线赛道上达到最高速度并保持稳定',
            path: 'M30 90 L310 90 L310 130 L30 130 Z',
            progressPath: 'M50 110 L250 110',
            car: { x: 250, y: 110 },
            markers: [
                { x: 50, y: 75, type: 'cone' },
                { x: 90, y: 75, type: 'cone' },
                { x: 130, y: 75, type: 'cone' },
                { x: 170, y: 75, type: 'cone' },
                { x: 210, y: 75, type: 'cone' },
                { x: 250, y: 75, type: 'cone' },
                { x: 290, y: 75, type: 'cone' },
                { x: 50, y: 145, type: 'cone' },
                { x: 90, y: 145, type: 'cone' },
                { x: 130, y: 145, type: 'cone' },
                { x: 170, y: 145, type: 'cone' },
                { x: 210, y: 145, type: 'cone' },
                { x: 250, y: 145, type: 'cone' },
                { x: 290, y: 145, type: 'cone' },
                { x: 40, y: 110, type: 'gate' },
                { x: 300, y: 110, type: 'gate' },
                { x: 170, y: 110, type: 'apex' },
            ],
        },
        trend: {
            label: '速度提升',
            values: [65, 88, 112, 134, 148, 156],
            startLabel: '入直道',
            endLabel: '尾速峰值',
        },
        stages: [
            {
                id: 'perception',
                label: '感知',
                state: '远距离目标跟踪稳定',
                detail: '高速直线段优先保证远距离锥桶的连续识别。',
                tone: 'optimal',
            },
            {
                id: 'localization',
                label: '定位',
                state: '高速纵向定位精度保持',
                detail: '惯导与轮速融合保证高速下的纵向距离估计准确。',
                tone: 'optimal',
            },
            {
                id: 'planning',
                label: '规划',
                state: '全力加速，保持直线',
                detail: '规划器释放全部动力请求，同时保持车辆直线行驶。',
                tone: 'optimal',
            },
            {
                id: 'control',
                label: '控制',
                state: '高速稳定性控制',
                detail: '控制器专注于高速下的横向稳定性，防止车辆偏移。',
                tone: 'optimal',
            },
            {
                id: 'actuation',
                label: '执行器',
                state: '动力输出最大化',
                detail: '驱动系统全力输出，达到最大加速度。',
                tone: 'optimal',
            },
        ],
        subsystems: [
            {
                id: 'perception',
                label: '感知',
                eyebrow: 'Long Range Vision',
                headline: '高速直线需要看得更远',
                summary: '在直线高速场景下，远距离目标的识别和跟踪至关重要。',
                bullets: ['远距离锥桶检测', '高速目标跟踪', '路面状况预判'],
            },
            {
                id: 'localization',
                label: '定位',
                eyebrow: 'High Speed Localization',
                headline: '高速下的纵向精度是关键',
                summary: '直线高速场景下，纵向距离的精确估计直接影响制动点判断。',
                bullets: ['惯导轮速融合', '纵向距离估计', '高速漂移补偿'],
            },
            {
                id: 'planning',
                label: '规划',
                eyebrow: 'Speed Planner',
                headline: '全力加速，精准制动',
                summary: '规划器在直线段释放全部动力，同时预判制动点。',
                bullets: ['最大加速度规划', '制动点预判', '尾速优化'],
            },
            {
                id: 'control',
                label: '控制',
                eyebrow: 'Stability Control',
                headline: '高速下的横向稳定性',
                summary: '高速行驶时，微小的横向偏移都会被放大，需要精确控制。',
                bullets: ['横向稳定性控制', '空气动力学补偿', '高速转向微调'],
            },
            {
                id: 'actuation',
                label: '执行器',
                eyebrow: 'Power Delivery',
                headline: '动力输出的极致追求',
                summary: '执行器需要在保证安全的前提下，释放最大动力。',
                bullets: ['最大扭矩输出', '动力响应优化', '热管理监控'],
            },
        ],
        replay: {
            frameDurationMs: 500,
            frames: [
                {
                    id: 'entry-accel',
                    title: '入直道，全力加速',
                    summary: '车辆进入直线赛道，系统开始全力加速',
                    trendIndex: 0,
                },
                {
                    id: 'mid-speed',
                    title: '速度持续提升',
                    summary: '车辆速度快速提升，接近极速',
                    progressPath: 'M50 110 L170 110',
                    car: { x: 170, y: 110 },
                    trendIndex: 3,
                    metricOverrides: [
                        {
                            id: 'speed',
                            value: '134',
                            note: '速度持续提升中',
                            tone: 'accent',
                        },
                    ],
                },
                {
                    id: 'top-speed',
                    title: '达到尾速峰值',
                    summary: '车辆达到直线赛道最高速度',
                    progressPath: 'M50 110 L290 110',
                    car: { x: 290, y: 110 },
                    trendIndex: 5,
                    metricOverrides: [
                        {
                            id: 'speed',
                            value: '156',
                            note: '达到极速',
                            tone: 'accent',
                        },
                    ],
                },
            ],
        },
        defaultSubsystemId: 'planning',
    },
    {
        id: 'high-speed-lap',
        name: '高速循迹',
        tagline: '高速工况下维持稳定、激进但可解释的单圈策略',
        description:
            '车辆已完成起步校验，进入高速循迹区间，系统重点关注横向稳定性、控制延迟与锥桶连续识别。',
        badges: ['High Speed', 'MPC', 'Telemetry'],
        strategy: {
            title: 'MPC 速度优先策略',
            copy: '在保证锥桶识别连续性的前提下，提高目标车速和过弯出口速度，让单圈成绩更具竞争力。',
        },
        metrics: [
            {
                id: 'speed',
                label: '当前车速',
                value: '104',
                unit: 'km/h',
                note: '出口速度持续抬升',
                tone: 'accent',
            },
            {
                id: 'cone-lock',
                label: '锥桶连续识别',
                value: '96.7',
                unit: '%',
                note: '高速下仍保持稳定',
                tone: 'positive',
            },
            {
                id: 'localization',
                label: '定位置信度',
                value: '98.7',
                unit: '%',
                note: '过弯区误差可控',
                tone: 'positive',
            },
            {
                id: 'latency',
                label: '控制延迟',
                value: '9',
                unit: 'ms',
                note: '高频控制窗口',
                tone: 'accent',
            },
        ],
        track: {
            label: '大弯曲S型高速赛道',
            objective: '在大曲率变化前提前完成速度与姿态调整',
            path: 'M30 140 C50 60 120 40 160 80 C200 120 240 60 280 80 C320 100 300 160 260 160 C220 160 180 120 140 140 C100 160 60 180 30 140',
            progressPath: 'M30 140 C50 60 120 40 160 80 C180 100 200 90 220 85',
            car: { x: 220, y: 85 },
            markers: [
                { x: 55, y: 35, type: 'cone' },
                { x: 100, y: 30, type: 'cone' },
                { x: 145, y: 35, type: 'cone' },
                { x: 200, y: 35, type: 'cone' },
                { x: 245, y: 35, type: 'cone' },
                { x: 285, y: 45, type: 'cone' },
                { x: 55, y: 155, type: 'cone' },
                { x: 100, y: 150, type: 'cone' },
                { x: 145, y: 155, type: 'cone' },
                { x: 200, y: 155, type: 'cone' },
                { x: 245, y: 155, type: 'cone' },
                { x: 285, y: 165, type: 'cone' },
                { x: 130, y: 55, type: 'apex' },
                { x: 250, y: 85, type: 'apex' },
                { x: 40, y: 140, type: 'gate' },
                { x: 300, y: 130, type: 'gate' },
            ],
        },
        trend: {
            label: '圈速收益',
            values: [74, 79, 84, 88, 92, 96],
            startLabel: '入圈',
            endLabel: '冲线',
        },
        stages: [
            {
                id: 'perception',
                label: '感知',
                state: '高速遮挡补偿启用',
                detail: '对短时丢失的锥桶轨迹做插值，减少高速抖动。',
                tone: 'tracking',
            },
            {
                id: 'localization',
                label: '定位',
                state: '横向误差压在 8 cm 内',
                detail: '组合导航以赛道几何约束进行高频修正。',
                tone: 'optimal',
            },
            {
                id: 'planning',
                label: '规划',
                state: '提前两段弯心规划出弯速度',
                detail: '路径平滑与速度规划一体求解，减少补偿式修正。',
                tone: 'optimal',
            },
            {
                id: 'control',
                label: '控制',
                state: 'MPC 以高频滚动方式更新',
                detail: '当前页面以遥测数值映射控制回路响应效果。',
                tone: 'optimal',
            },
            {
                id: 'actuation',
                label: '执行器',
                state: '驱动与再生制动协调输出',
                detail: '高速场景下把出弯加速与能量回收统一考虑。',
                tone: 'tracking',
            },
        ],
        subsystems: [
            {
                id: 'perception',
                label: '感知',
                eyebrow: 'Cone Tracking',
                headline: '高速下最怕的是连续识别断层',
                summary: '页面通过"锥桶连续识别"指标直接映射高速工况里的感知连续性。',
                bullets: ['短时遮挡插值', '图像与点云双通道确认', '低置信目标自动降权'],
            },
            {
                id: 'localization',
                label: '定位',
                eyebrow: 'Pose Stability',
                headline: '定位不是越频繁越好，而是越稳越好',
                summary: '高速度下的定位重点是控制横向误差，而不是单点精度展示。',
                bullets: ['赛道几何约束', '过弯段横摆率校正', '姿态漂移快速收敛'],
            },
            {
                id: 'planning',
                label: '规划',
                eyebrow: 'Trajectory Engine',
                headline: '规划器提前考虑两个弯后的出口速度',
                summary: '首版展示将复杂算法转成可读的策略文案，让非技术观众也能理解。',
                bullets: ['弯心前移策略', '出弯速度目标', '与控制器共享约束'],
            },
            {
                id: 'control',
                label: '控制',
                eyebrow: 'Closed Loop',
                headline: '控制延迟越低，车辆越敢贴近理想线',
                summary: '控制面板强调的是"响应速度"和"稳定度"的可视化感受。',
                bullets: ['高频滚动优化', '横向误差即时补偿', '速度控制前馈补偿'],
            },
            {
                id: 'actuation',
                label: '执行器',
                eyebrow: 'Torque Delivery',
                headline: '扭矩释放必须跟得上轨迹更新节奏',
                summary: '出弯阶段需要执行层及时释放扭矩，否则规划收益无法兑现。',
                bullets: ['扭矩平滑输出', '再生制动融合', '驱动状态回读'],
            },
        ],
        replay: {
            frameDurationMs: 500,
            frames: [
                {
                    id: 'entry-balance',
                    title: '入弯前压姿态',
                    summary: '系统在大曲率变化前先压住姿态和横向误差。',
                    trendIndex: 0,
                },
                {
                    id: 'apex-attack',
                    title: 'MPC 抢出口速度',
                    summary: '规划与控制开始共享更激进的出弯速度目标。',
                    progressPath: 'M30 140 C50 60 120 40 160 80 C180 100 190 95 200 90',
                    car: { x: 200, y: 90 },
                    trendIndex: 2,
                    metricOverrides: [
                        {
                            id: 'speed',
                            value: '112',
                            note: '接近理想出口速度',
                            tone: 'accent',
                        },
                    ],
                    stageOverrides: [
                        {
                            id: 'control',
                            state: 'MPC 输出开始贴近理想线',
                            detail: '控制器把更多余量用于争取出口速度。',
                            tone: 'optimal',
                        },
                    ],
                },
                {
                    id: 'finish-straight',
                    title: '出弯稳定，准备冲线',
                    summary: '高速循迹进入直线收束阶段，圈速收益逐渐兑现。',
                    progressPath:
                        'M30 140 C50 60 120 40 160 80 C200 120 240 60 280 80 C300 90 295 120 280 130',
                    car: { x: 280, y: 130 },
                    trendIndex: 5,
                },
            ],
        },
        defaultSubsystemId: 'planning',
    },
    {
        id: 'figure-eight',
        name: '八字绕环',
        tagline: '高机动工况下优先保持横向稳定和姿态可控',
        description:
            '在连续反向弯里，车辆比拼的不是极限速度，而是系统在短时间内切换控制目标的能力。',
        badges: ['Figure Eight', 'Lateral Grip', 'Control Balance'],
        strategy: {
            title: '稳定优先策略',
            copy: '规划器会主动压低局部目标速度，把更多控制余量留给姿态修正和路径跟踪。',
        },
        metrics: [
            {
                id: 'speed',
                label: '当前车速',
                value: '62',
                unit: 'km/h',
                note: '为横向稳定让路',
                tone: 'accent',
            },
            {
                id: 'yaw-margin',
                label: '横摆裕度',
                value: '14.8',
                unit: 'deg/s',
                note: '仍有安全修正空间',
                tone: 'positive',
            },
            {
                id: 'localization',
                label: '定位置信度',
                value: '98.9',
                unit: '%',
                note: '连续弯心切换稳定',
                tone: 'positive',
            },
            {
                id: 'latency',
                label: '控制延迟',
                value: '11',
                unit: 'ms',
                note: '快速反向切换',
                tone: 'warning',
            },
        ],
        track: {
            label: '八字绕环赛道（∞符号）',
            objective: '连续反向弯中的姿态收敛与路径跟踪演示',
            path: 'M80 110 L120 110 C120 110 100 50 140 50 C180 50 180 110 140 110 C100 110 100 170 140 170 C180 170 180 110 160 110 L200 110',
            progressPath: 'M80 110 L120 110 C120 110 110 70 140 70 C160 70 160 110 140 110',
            car: { x: 140, y: 110 },
            markers: [
                { x: 90, y: 75, type: 'cone' },
                { x: 90, y: 145, type: 'cone' },
                { x: 110, y: 75, type: 'cone' },
                { x: 110, y: 145, type: 'cone' },
                { x: 120, y: 35, type: 'cone' },
                { x: 140, y: 20, type: 'cone' },
                { x: 160, y: 35, type: 'cone' },
                { x: 120, y: 185, type: 'cone' },
                { x: 140, y: 200, type: 'cone' },
                { x: 160, y: 185, type: 'cone' },
                { x: 180, y: 35, type: 'cone' },
                { x: 200, y: 20, type: 'cone' },
                { x: 220, y: 35, type: 'cone' },
                { x: 180, y: 185, type: 'cone' },
                { x: 200, y: 200, type: 'cone' },
                { x: 220, y: 185, type: 'cone' },
                { x: 190, y: 75, type: 'cone' },
                { x: 190, y: 145, type: 'cone' },
                { x: 140, y: 110, type: 'apex' },
                { x: 200, y: 110, type: 'apex' },
                { x: 80, y: 110, type: 'gate' },
                { x: 220, y: 110, type: 'gate' },
            ],
        },
        trend: {
            label: '横向稳定度',
            values: [68, 75, 82, 88, 91, 94],
            startLabel: '左弯切入',
            endLabel: '右弯切出',
        },
        stages: [
            {
                id: 'perception',
                label: '感知',
                state: '近距锥桶刷新频率提升',
                detail: '连续弯内优先保证近场目标的更新和剔除。',
                tone: 'tracking',
            },
            {
                id: 'localization',
                label: '定位',
                state: '反向弯姿态估计连续稳定',
                detail: '高频姿态修正保证路径跟踪不出现跳变。',
                tone: 'optimal',
            },
            {
                id: 'planning',
                label: '规划',
                state: '速度目标以稳定优先',
                detail: '主动让出速度空间，换取更平滑的反向切换。',
                tone: 'optimal',
            },
            {
                id: 'control',
                label: '控制',
                state: '横摆率抑制强于直线段',
                detail: '控制器优先保证车身姿态不超限。',
                tone: 'tracking',
            },
            {
                id: 'actuation',
                label: '执行器',
                state: '制动与转向同步收敛',
                detail: '通过执行层协调减少反向弯中的二次摆动。',
                tone: 'watch',
            },
        ],
        subsystems: [
            {
                id: 'perception',
                label: '感知',
                eyebrow: 'Near-field Vision',
                headline: '八字绕环更依赖近场感知密度',
                summary: '当车辆频繁改变方向时，近场目标比远场目标更能决定控制质量。',
                bullets: ['近场锥桶优先刷新', '遮挡目标快速剔除', '曲率突变区域增密采样'],
            },
            {
                id: 'localization',
                label: '定位',
                eyebrow: 'Motion Tracking',
                headline: '连续反向弯要求姿态估计不能抖',
                summary: '定位模块在这个场景里主要承担姿态连续性保障。',
                bullets: ['高频姿态融合', '横摆率约束校正', '轮速异常抑制'],
            },
            {
                id: 'planning',
                label: '规划',
                eyebrow: 'Stability Planner',
                headline: '规划器主动降低目标速度换稳定',
                summary: '这是一个很适合在展示页里解释"为什么不是越快越好"的场景。',
                bullets: ['局部速度限幅', '反向弯平滑切线', '留出控制修正余量'],
            },
            {
                id: 'control',
                label: '控制',
                eyebrow: 'Yaw Control',
                headline: '横摆率控制是绕环成功的关键',
                summary: '页面用横摆裕度指标替代复杂控制曲线，更容易理解。',
                bullets: ['横摆率优先约束', '方向盘回正速度控制', '左右弯切换平顺化'],
            },
            {
                id: 'actuation',
                label: '执行器',
                eyebrow: 'Brake Steering Blend',
                headline: '执行层负责把"稳"真正落到车上',
                summary: '如果执行层动作不一致，再好的规划也会放大摆动。',
                bullets: ['转向与制动同步', '驱动扭矩及时收敛', '异常回读触发保护'],
            },
        ],
        replay: {
            frameDurationMs: 500,
            frames: [
                {
                    id: 'left-entry',
                    title: '左弯切入，稳定优先',
                    summary: '系统先降低速度，为第一次反向切换预留姿态空间。',
                    trendIndex: 0,
                },
                {
                    id: 'mid-transition',
                    title: '反向切线开始交接',
                    summary: '控制器重点抑制横摆率，避免切换时车身二次摆动。',
                    progressPath: 'M80 110 L120 110 C120 110 115 90 140 90 C155 90 155 110 145 110',
                    car: { x: 145, y: 110 },
                    trendIndex: 2,
                    metricOverrides: [
                        {
                            id: 'yaw-margin',
                            value: '16.1',
                            note: '姿态控制开始收敛',
                            tone: 'positive',
                        },
                    ],
                    stageOverrides: [
                        {
                            id: 'control',
                            state: '横摆率抑制进入强约束段',
                            detail: '控制器把更多权重放到姿态稳定上。',
                            tone: 'optimal',
                        },
                    ],
                },
                {
                    id: 'right-exit',
                    title: '右弯切出，路径重新拉直',
                    summary: '系统完成反向弯切换，开始回收速度与路径余量。',
                    progressPath:
                        'M80 110 L120 110 C120 110 100 50 140 50 C180 50 180 110 160 110 L190 110',
                    car: { x: 190, y: 110 },
                    trendIndex: 5,
                },
            ],
        },
        defaultSubsystemId: 'planning',
    },
    {
        id: 'emergency-brake',
        name: '紧急制动',
        tagline: '识别障碍、发出制动指令并确认车辆停稳',
        description:
            '这是最能体现安全闭环的一段演示：发现风险后，系统必须在极短时间内完成降速和停车确认。',
        badges: ['EBS', 'Safety Loop', 'Hard Stop'],
        strategy: {
            title: '安全闭环优先策略',
            copy: '所有上层模块的目标都会在障碍确认后统一收敛到"最短可控停车"，体现整车安全逻辑。',
        },
        metrics: [
            {
                id: 'speed',
                label: '触发前车速',
                value: '72',
                unit: 'km/h',
                note: '制动前最后采样',
                tone: 'accent',
            },
            {
                id: 'ebrake-distance',
                label: '刹停距离',
                value: '11.6',
                unit: 'm',
                note: '处于安全范围内',
                tone: 'positive',
            },
            {
                id: 'risk-score',
                label: '风险确认度',
                value: '99.8',
                unit: '%',
                note: '障碍物多模态确认',
                tone: 'positive',
            },
            {
                id: 'latency',
                label: '制动触发延迟',
                value: '7',
                unit: 'ms',
                note: '执行链路短而直接',
                tone: 'accent',
            },
        ],
        track: {
            label: '直线制动区',
            objective: '在障碍确认后最短时间内安全停车并给出停稳确认',
            path: 'M30 90 L310 90 L310 130 L30 130 Z',
            progressPath: 'M50 110 L200 110',
            car: { x: 200, y: 110 },
            markers: [
                { x: 50, y: 75, type: 'cone' },
                { x: 90, y: 75, type: 'cone' },
                { x: 130, y: 75, type: 'cone' },
                { x: 170, y: 75, type: 'cone' },
                { x: 210, y: 75, type: 'cone' },
                { x: 250, y: 75, type: 'cone' },
                { x: 290, y: 75, type: 'cone' },
                { x: 50, y: 145, type: 'cone' },
                { x: 90, y: 145, type: 'cone' },
                { x: 130, y: 145, type: 'cone' },
                { x: 170, y: 145, type: 'cone' },
                { x: 210, y: 145, type: 'cone' },
                { x: 250, y: 145, type: 'cone' },
                { x: 290, y: 145, type: 'cone' },
                { x: 260, y: 110, type: 'apex' },
                { x: 40, y: 110, type: 'gate' },
                { x: 300, y: 110, type: 'gate' },
            ],
        },
        trend: {
            label: '停车可信度',
            values: [61, 72, 84, 92, 97, 100],
            startLabel: '障碍识别',
            endLabel: '停稳确认',
        },
        stages: [
            {
                id: 'perception',
                label: '感知',
                state: '障碍物确认进入锁定状态',
                detail: '多模态输入一致判定后，风险对象不再允许轻易撤销。',
                tone: 'optimal',
            },
            {
                id: 'localization',
                label: '定位',
                state: '停车距离估计实时更新',
                detail: '定位模块持续给出剩余距离和速度约束。',
                tone: 'tracking',
            },
            {
                id: 'planning',
                label: '规划',
                state: '全局目标切换为最短可控停车',
                detail: '速度轨迹立即收敛到制动曲线，停止追求单圈收益。',
                tone: 'optimal',
            },
            {
                id: 'control',
                label: '控制',
                state: '制动压力快速爬升',
                detail: '控制器优先保证减速度建立，转向仅保持直线稳定。',
                tone: 'optimal',
            },
            {
                id: 'actuation',
                label: '执行器',
                state: '制动闭环确认停稳',
                detail: '执行层回读速度接近零后发布停稳完成信号。',
                tone: 'tracking',
            },
        ],
        subsystems: [
            {
                id: 'perception',
                label: '感知',
                eyebrow: 'Obstacle Detection',
                headline: '安全闭环的第一步是确认风险不是误报',
                summary: '障碍一旦进入锁定状态，就会推动整个系统进入制动优先模式。',
                bullets: ['多模态风险交叉确认', '风险对象锁定防抖', '误报目标快速剔除'],
            },
            {
                id: 'localization',
                label: '定位',
                eyebrow: 'Distance Estimation',
                headline: '定位模块负责把剩余距离讲清楚',
                summary: '在制动场景中，定位最重要的是提供可靠的剩余距离和姿态信息。',
                bullets: ['剩余距离实时估计', '姿态稳定约束', '低速区回读修正'],
            },
            {
                id: 'planning',
                label: '规划',
                eyebrow: 'Safety Planning',
                headline: '规划目标在一瞬间从"快"切到"停"',
                summary: '这个场景最适合展示无人驾驶系统不是单点算法，而是完整决策链。',
                bullets: ['最短可控停车曲线', '放弃所有速度收益', '把控制与执行器优先级拉满'],
            },
            {
                id: 'control',
                label: '控制',
                eyebrow: 'Brake Control',
                headline: '控制器负责把制动力建立得又快又稳',
                summary: '页面中的制动触发延迟指标，直接反映控制与执行层的耦合效率。',
                bullets: ['制动压力快速建立', '直线稳定保持', '停稳阈值判定'],
            },
            {
                id: 'actuation',
                label: '执行器',
                eyebrow: 'Safety Actuation',
                headline: '执行层给出最后的停稳确认',
                summary: '只要执行器没有回读停稳，页面就不会宣告安全闭环完成。',
                bullets: ['速度归零回读', '制动器状态确认', '停稳信号上报'],
            },
        ],
        replay: {
            frameDurationMs: 500,
            frames: [
                {
                    id: 'risk-lock',
                    title: '障碍确认锁定',
                    summary: '多模态输入达成一致，系统进入制动优先模式。',
                    trendIndex: 0,
                },
                {
                    id: 'brake-build',
                    title: '制动力快速建立',
                    summary: '控制器把所有目标统一收敛到最短可控停车。',
                    progressPath: 'M50 110 L230 110',
                    car: { x: 230, y: 110 },
                    trendIndex: 3,
                    metricOverrides: [
                        {
                            id: 'latency',
                            value: '5',
                            note: '制动指令已进入快速建立阶段',
                            tone: 'accent',
                        },
                    ],
                    stageOverrides: [
                        {
                            id: 'control',
                            state: '制动压力建立进入峰值段',
                            detail: '直线稳定与减速度目标保持一致。',
                            tone: 'optimal',
                        },
                    ],
                },
                {
                    id: 'stop-confirm',
                    title: '停稳确认完成',
                    summary: '执行层回读速度接近零，发布安全闭环完成信号。',
                    progressPath: 'M50 110 L280 110',
                    car: { x: 280, y: 110 },
                    trendIndex: 5,
                    metricOverrides: [
                        {
                            id: 'ebrake-distance',
                            value: '11.2',
                            note: '最终停稳距离继续收敛',
                            tone: 'positive',
                        },
                    ],
                },
            ],
        },
        defaultSubsystemId: 'actuation',
    },
]

export interface ShowcaseConfigSelection {
    scenarioId: string
    subsystemId: string
}

export interface CacheResource {
    id: string
    status: 'ready' | 'stale' | 'pending'
    lastSync: number
}

export type CacheMode = 'cold' | 'syncing' | 'ready'

export interface ShowcaseCacheSimulationState {
    mode: CacheMode
    resources: CacheResource[]
    hitRate: number
    lastSyncTime: number | null
}

export const showcaseCacheSimulationConfig = {
    initialState: {
        mode: 'cold' as CacheMode,
        resources: [],
        hitRate: 0,
        lastSyncTime: null,
    },
    warmCacheState: {
        mode: 'ready' as CacheMode,
        resources: [
            { id: 'scenario-data', status: 'ready' as const, lastSync: Date.now() },
            { id: 'metrics-cache', status: 'ready' as const, lastSync: Date.now() },
            { id: 'track-geometry', status: 'ready' as const, lastSync: Date.now() },
            { id: 'subsystem-config', status: 'ready' as const, lastSync: Date.now() },
            { id: 'replay-frames', status: 'ready' as const, lastSync: Date.now() },
        ],
        hitRate: 94,
        lastSyncTime: Date.now(),
    },
    driftState: {
        mode: 'syncing' as CacheMode,
        resources: [
            { id: 'scenario-data', status: 'stale' as const, lastSync: Date.now() - 5000 },
            { id: 'metrics-cache', status: 'pending' as const, lastSync: Date.now() },
            { id: 'track-geometry', status: 'stale' as const, lastSync: Date.now() - 3000 },
            { id: 'subsystem-config', status: 'ready' as const, lastSync: Date.now() },
            { id: 'replay-frames', status: 'pending' as const, lastSync: Date.now() },
        ],
        hitRate: 67,
        lastSyncTime: Date.now(),
    },
}

export const SHOWCASE_SELECTION_STORAGE_KEY = 'huat-showcase-lab-selection'

export const showcaseScripts = [
    {
        id: 'full-pipeline',
        name: '全链路讲解',
        description: '从感知到执行器的完整链路演示',
        steps: [
            { scenarioId: 'launch-calibration', subsystemId: 'perception', title: '感知层准备' },
            { scenarioId: 'launch-calibration', subsystemId: 'localization', title: '定位收敛' },
            { scenarioId: 'straight-high-speed', subsystemId: 'planning', title: '直线高速规划' },
            { scenarioId: 'high-speed-lap', subsystemId: 'control', title: '高速循迹控制' },
            { scenarioId: 'figure-eight', subsystemId: 'actuation', title: '八字绕环执行' },
            { scenarioId: 'emergency-brake', subsystemId: 'perception', title: '安全闭环' },
        ],
    },
    {
        id: 'high-speed',
        name: '高速场景',
        description: '重点展示高速循迹和直线加速',
        steps: [
            { scenarioId: 'straight-high-speed', subsystemId: 'planning', title: '直线加速' },
            { scenarioId: 'high-speed-lap', subsystemId: 'control', title: '高速过弯' },
            { scenarioId: 'high-speed-lap', subsystemId: 'actuation', title: '出弯加速' },
        ],
    },
    {
        id: 'safety-demo',
        name: '安全演示',
        description: '展示紧急制动和安全闭环',
        steps: [
            { scenarioId: 'emergency-brake', subsystemId: 'perception', title: '障碍识别' },
            { scenarioId: 'emergency-brake', subsystemId: 'planning', title: '制动规划' },
            { scenarioId: 'emergency-brake', subsystemId: 'control', title: '制动执行' },
            { scenarioId: 'emergency-brake', subsystemId: 'actuation', title: '停稳确认' },
        ],
    },
]

export const defaultShowcaseSelection = {
    scenarioId: 'launch-calibration',
    subsystemId: 'perception',
}

export function getScenarioById(id: string): ShowcaseScenario | undefined {
    return showcaseScenarios.find((s) => s.id === id)
}

export function getDefaultScenario(): ShowcaseScenario {
    return showcaseScenarios[0]
}
