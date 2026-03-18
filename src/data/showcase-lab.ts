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
    defaultSubsystemId: string
}

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
            label: '发车区短环',
            objective: '完成起跑前的定位和执行器闭环确认',
            path: 'M36 146 C52 76 128 42 188 52 C246 62 284 116 264 166 C244 202 162 210 104 192 C62 180 28 162 36 146',
            progressPath: 'M36 146 C52 76 128 42 188 52 C214 56 236 72 250 94',
            car: { x: 250, y: 94 },
            markers: [
                { x: 54, y: 144, type: 'cone' },
                { x: 106, y: 84, type: 'apex' },
                { x: 182, y: 70, type: 'gate' },
                { x: 236, y: 122, type: 'cone' },
                { x: 184, y: 182, type: 'gate' },
                { x: 96, y: 178, type: 'cone' },
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
                detail: '发车前仅释放 35% 的目标扭矩，确保安全起步。',
                tone: 'watch',
            },
        ],
        subsystems: [
            {
                id: 'perception',
                label: '感知',
                eyebrow: 'Sensor Fusion',
                headline: '起步前先把赛道边界看清楚',
                summary: '系统会在起跑线前验证激光雷达点云与摄像头识别框是否一致，避免误把噪点当作有效锥桶。',
                bullets: ['双传感器时间戳对齐', '锥桶簇与图像框交叉验证', '异常目标自动降权'],
            },
            {
                id: 'localization',
                label: '定位',
                eyebrow: 'State Estimation',
                headline: '组合导航先收敛，再允许发车',
                summary: '如果姿态漂移还没有收敛，系统不会进入可发车状态。',
                bullets: ['IMU 与轮速计闭环修正', 'GNSS 仅作边界约束', '起跑区域采用高可信度状态锁'],
            },
            {
                id: 'planning',
                label: '规划',
                eyebrow: 'Trajectory Planner',
                headline: '首段轨迹以安全走廊为主',
                summary: '首版演示强调产品概念，因此展示的是“先稳定，再加速”的规划策略。',
                bullets: ['低横向加速度约束', '预留制动缓冲距离', '与控制器共享速度上限'],
            },
            {
                id: 'control',
                label: '控制',
                eyebrow: 'Vehicle Control',
                headline: '控制器实时监测每个执行环节',
                summary: '转向角、制动力与电机扭矩都会在本地页面中映射为状态变化。',
                bullets: ['MPC/PID 混合控制展示', '控制延迟可视化', '超阈值时切换保护逻辑'],
            },
            {
                id: 'actuation',
                label: '执行器',
                eyebrow: 'Drive by Wire',
                headline: '执行层是最终的安全闸门',
                summary: '即使上层全部就绪，执行层也会在校验通过前保持限幅输出。',
                bullets: ['驱动扭矩软启动', '制动器状态回读', '转向回正校验'],
            },
        ],
        defaultSubsystemId: 'perception',
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
            label: '高速单圈',
            objective: '在大曲率变化前提前完成速度与姿态调整',
            path: 'M30 162 C44 86 112 40 174 46 C242 54 286 110 276 154 C262 206 194 196 164 154 C134 114 78 110 70 150 C62 188 120 206 198 182',
            progressPath: 'M30 162 C44 86 112 40 174 46 C220 52 252 82 266 118',
            car: { x: 266, y: 118 },
            markers: [
                { x: 46, y: 160, type: 'cone' },
                { x: 92, y: 78, type: 'apex' },
                { x: 170, y: 60, type: 'gate' },
                { x: 236, y: 88, type: 'cone' },
                { x: 248, y: 158, type: 'gate' },
                { x: 146, y: 132, type: 'apex' },
                { x: 90, y: 170, type: 'cone' },
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
                summary: '页面通过“锥桶连续识别”指标直接映射高速工况里的感知连续性。',
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
                summary: '控制面板强调的是“响应速度”和“稳定度”的可视化感受。',
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
            label: '八字绕环',
            objective: '连续反向弯中的姿态收敛与路径跟踪演示',
            path: 'M92 112 C52 52 44 162 102 162 C160 162 148 52 102 52 C60 52 66 172 122 172 C188 172 198 52 246 52 C292 52 286 162 226 162 C166 162 174 52 122 52',
            progressPath: 'M92 112 C52 52 44 162 102 162 C138 162 148 120 138 92',
            car: { x: 138, y: 92 },
            markers: [
                { x: 72, y: 64, type: 'cone' },
                { x: 78, y: 158, type: 'apex' },
                { x: 126, y: 108, type: 'gate' },
                { x: 214, y: 66, type: 'cone' },
                { x: 226, y: 158, type: 'apex' },
                { x: 172, y: 112, type: 'gate' },
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
                summary: '这是一个很适合在展示页里解释“为什么不是越快越好”的场景。',
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
                headline: '执行层负责把“稳”真正落到车上',
                summary: '如果执行层动作不一致，再好的规划也会放大摆动。',
                bullets: ['转向与制动同步', '驱动扭矩及时收敛', '异常回读触发保护'],
            },
        ],
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
            copy: '所有上层模块的目标都会在障碍确认后统一收敛到“最短可控停车”，体现整车安全逻辑。',
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
            path: 'M34 112 L284 112',
            progressPath: 'M34 112 L196 112',
            car: { x: 196, y: 112 },
            markers: [
                { x: 56, y: 96, type: 'cone' },
                { x: 104, y: 128, type: 'gate' },
                { x: 164, y: 96, type: 'cone' },
                { x: 222, y: 112, type: 'apex' },
                { x: 262, y: 112, type: 'gate' },
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
                headline: '规划目标在一瞬间从“快”切到“停”',
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
                label: '执行确认',
                eyebrow: 'Safety Actuation',
                headline: '执行层给出最后的停稳确认',
                summary: '只要执行器没有回读停稳，页面就不会宣告安全闭环完成。',
                bullets: ['速度归零回读', '制动器状态确认', '停稳信号上报'],
            },
        ],
        defaultSubsystemId: 'actuation',
    },
]

export interface ShowcaseConfigSelection {
    scenarioId: string
    subsystemId: string
}

export const defaultShowcaseSelection: ShowcaseConfigSelection = {
    scenarioId: 'launch-calibration',
    subsystemId: 'perception',
}

export function validateShowcaseConfig(
    scenarios: ShowcaseScenario[],
    defaultSelection: ShowcaseConfigSelection,
): void {
    if (scenarios.length === 0) {
        throw new Error('Showcase scenarios must not be empty.')
    }

    const scenarioIds = new Set<string>()

    for (const scenario of scenarios) {
        if (scenarioIds.has(scenario.id)) {
            throw new Error(`Duplicate showcase scenario id: ${scenario.id}`)
        }

        scenarioIds.add(scenario.id)

        const subsystemIds = new Set<string>()

        for (const subsystem of scenario.subsystems) {
            if (subsystemIds.has(subsystem.id)) {
                throw new Error(
                    `Duplicate showcase subsystem id "${subsystem.id}" in scenario "${scenario.id}"`,
                )
            }

            subsystemIds.add(subsystem.id)
        }

        if (!subsystemIds.has(scenario.defaultSubsystemId)) {
            throw new Error(
                `Showcase scenario "${scenario.id}" defaultSubsystemId "${scenario.defaultSubsystemId}" is missing from subsystems`,
            )
        }
    }

    const defaultScenario = scenarios.find((scenario) => scenario.id === defaultSelection.scenarioId)

    if (!defaultScenario) {
        throw new Error(
            `Default showcase scenario "${defaultSelection.scenarioId}" is missing from showcaseScenarios`,
        )
    }

    if (!defaultScenario.subsystems.some((subsystem) => subsystem.id === defaultSelection.subsystemId)) {
        throw new Error(
            `Default showcase subsystem "${defaultSelection.subsystemId}" is missing from scenario "${defaultScenario.id}"`,
        )
    }
}

validateShowcaseConfig(showcaseScenarios, defaultShowcaseSelection)

