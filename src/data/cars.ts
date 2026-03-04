// ==================== 赛车数据 ====================

export interface CarSpec {
    /** 参数名 */
    label: string
    /** 参数值 */
    value: string
    /** 单位（可选） */
    unit?: string
}

export interface CarHighlight {
    /** 系统名称 */
    title: string
    /** emoji 图标 */
    icon: string
    /** 技术要点列表 */
    points: string[]
}

export interface CarAchievement {
    /** 奖项 emoji */
    medal: string
    /** 赛事名称 */
    event: string
    /** 成绩描述 */
    result: string
}

export interface CarData {
    /** 年份，用于 Tab 标识 */
    year: number
    /** 赛车名称 */
    name: string
    /** 赛车别称 */
    nickname: string
    /** 简短描述 */
    description: string
    /** 封面图 URL */
    image: string
    /** 技术标签 */
    tags: string[]
    /** 技术参数 */
    specs: CarSpec[]
    /** 技术亮点 */
    highlights: CarHighlight[]
    /** 赛季成绩 */
    achievements: CarAchievement[]
}

export const carsData: CarData[] = [
    {
        year: 2024,
        name: 'AST-2024',
        nickname: '追风',
        description: '融合多传感器感知与 MPC 轨迹跟踪控制，实现复杂赛道全状态自主驾驶。',
        image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1200&auto=format&fit=crop',
        tags: ['激光雷达融合', 'MPC 控制', 'Jetson AGX Orin', '四轮电驱'],
        specs: [
            { label: '整车质量', value: '210', unit: 'kg' },
            { label: '最大功率', value: '80', unit: 'kW' },
            { label: '0→100 km/h', value: '3.2', unit: 's' },
            { label: '最高车速', value: '120', unit: 'km/h' },
            { label: '续航里程', value: '22', unit: 'km' },
            { label: '轴距', value: '1580', unit: 'mm' },
        ],
        highlights: [
            {
                title: '感知系统',
                icon: '🔭',
                points: ['3D 激光雷达 × 1', '双目摄像头 × 2', '高精度 IMU / GNSS 组合导航'],
            },
            {
                title: '计算平台',
                icon: '💻',
                points: [
                    'NVIDIA Jetson AGX Orin',
                    '自主研发 VCU 控制单元',
                    'CAN / Ethernet 混合通信',
                ],
            },
            {
                title: '电驱系统',
                icon: '⚡',
                points: ['永磁同步电机 × 4', '自研电机控制器', '再生制动能量回收'],
            },
            {
                title: '底盘系统',
                icon: '🔧',
                points: ['双横臂独立悬架', '电控差速系统', '碳纤维车身结构'],
            },
        ],
        achievements: [
            { medal: '🏆', event: 'FSC 2024 无人驾驶组', result: '自动化项目完成全场' },
            { medal: '🥈', event: '高速循迹赛', result: '单圈最快成绩前列' },
        ],
    },
    {
        year: 2023,
        name: 'AST-2023',
        nickname: '疾风',
        description: '优化感知算法与路径规划策略，完成所有动态赛事项目。',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&auto=format&fit=crop',
        tags: ['点云处理', 'ROS2', 'PID 控制', '四轮独立驱动'],
        specs: [
            { label: '整车质量', value: '225', unit: 'kg' },
            { label: '最大功率', value: '60', unit: 'kW' },
            { label: '0→100 km/h', value: '3.8', unit: 's' },
            { label: '最高车速', value: '110', unit: 'km/h' },
            { label: '轴距', value: '1560', unit: 'mm' },
        ],
        highlights: [
            {
                title: '感知系统',
                icon: '🔭',
                points: ['固态激光雷达 × 2', '单目摄像头 × 4', 'RTK-GNSS 高精度定位'],
            },
            {
                title: '计算平台',
                icon: '💻',
                points: ['NVIDIA Xavier NX', '工业级上位机', 'ROS2 Humble'],
            },
            {
                title: '电驱系统',
                icon: '⚡',
                points: ['永磁同步电机 × 4', '商用电机控制器', '电池热管理系统'],
            },
            {
                title: '底盘系统',
                icon: '🔧',
                points: ['钢管车架', '推拉杆悬架', '铝合金轮毂'],
            },
        ],
        achievements: [
            { medal: '🏆', event: 'FSC 2023 无人驾驶组', result: '完成全部动态项目' },
            { medal: '🥉', event: '8 字绕环赛', result: '成功完赛' },
        ],
    },
    {
        year: 2022,
        name: 'AST-2022',
        nickname: '破风',
        description: '首次实现完全自主驾驶，完成所有动态项目，里程碑赛季。',
        image: 'https://images.unsplash.com/photo-1611186871348-b1499e27f5e4?w=1200&auto=format&fit=crop',
        tags: ['完全自主驾驶', '激光雷达', 'SLAM', '里程碑'],
        specs: [
            { label: '整车质量', value: '240', unit: 'kg' },
            { label: '最大功率', value: '48', unit: 'kW' },
            { label: '最高车速', value: '100', unit: 'km/h' },
        ],
        highlights: [
            {
                title: '感知系统',
                icon: '🔭',
                points: ['机械旋转激光雷达', '前置摄像头 × 2', 'IMU + 里程计'],
            },
            {
                title: '计算平台',
                icon: '💻',
                points: ['工业上位机', 'ROS1 Noetic', '自研感知软件栈'],
            },
            {
                title: '电驱系统',
                icon: '⚡',
                points: ['轮毂电机 × 4', '商用 BMS', '磷酸铁锂电池包'],
            },
            {
                title: '里程碑',
                icon: '🏁',
                points: ['首次完全自主完赛', 'SLAM 建图首次上车', '全队 30+ 人协作'],
            },
        ],
        achievements: [{ medal: '🏆', event: 'FSC 2022', result: '首次完成全部动态项目' }],
    },
    {
        year: 2021,
        name: 'AST-2021',
        nickname: '逐风',
        description: '引入激光雷达感知系统，搭建第一套完整感知算法链路。',
        image: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=1200&auto=format&fit=crop',
        tags: ['激光雷达首装', '目标检测', 'ROS1', '感知起步'],
        specs: [
            { label: '整车质量', value: '255', unit: 'kg' },
            { label: '最大功率', value: '36', unit: 'kW' },
        ],
        highlights: [
            {
                title: '感知系统',
                icon: '🔭',
                points: ['首次搭载激光雷达', '基于点云的锥桶检测', '摄像头辅助感知'],
            },
            {
                title: '计算平台',
                icon: '💻',
                points: ['Intel NUC 工控机', 'ROS1 Melodic', '感知算法自研起步'],
            },
            {
                title: '电驱系统',
                icon: '⚡',
                points: ['集中驱动电机', '铅酸电池方案', '基础制动控制'],
            },
            {
                title: '里程碑',
                icon: '🏁',
                points: ['首套感知算法链路', '首次参加自动化赛事', '团队规模扩至 20+'],
            },
        ],
        achievements: [
            { medal: '🎖️', event: 'FSC 2021', result: '首次参加自动化赛 EBS / 制动项目' },
        ],
    },
]

/** 技术演进时间线节点 */
export const techEvolution = [
    { year: 2019, milestone: '电动车首制', icon: '🚗' },
    { year: 2020, milestone: '无人驾驶原型', icon: '🤖' },
    { year: 2021, milestone: '激光雷达上车', icon: '🔭' },
    { year: 2022, milestone: '全自主首次完赛', icon: '🏁' },
    { year: 2023, milestone: '全动态项目完成', icon: '🏆' },
    { year: 2024, milestone: '多传感融合 + MPC', icon: '🚀' },
]
