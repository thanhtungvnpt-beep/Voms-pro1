import { 
  PlantMetric, CausalNode, CausalLink, EmergencyAction, 
  HourlyDataPoint, OtdShipment, QualityDefect, MachineTelemetry, MaterialInventory 
} from '../types';

export const INITIAL_PLANTS: PlantMetric[] = [
  { 
    id: 'KHV', 
    name: 'KHV SMT & Assembly', 
    specialty: 'Chuyền SMT & Lắp ráp vi mạch cao tốc',
    actual: 12800, 
    target: 15000, 
    rate: 85, 
    oee: 91.2, 
    status: 'optimal', 
    statusText: 'Tối ưu', 
    imgUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&auto=format&fit=crop&q=70',
    manager: 'Trần Văn Hải',
    lines: 8,
    workers: 142,
    activeDefectRate: 0.12,
    note: 'Takt-time duy trì ổn định 3.8s/unit'
  },
  { 
    id: 'DREAM_TECH', 
    name: 'DREAM TECH Precision', 
    specialty: 'Đúc vỏ & Ép khuôn chính xác cao',
    actual: 13000, 
    target: 18000, 
    rate: 72, 
    oee: 86.4, 
    status: 'stable', 
    statusText: 'Ổn định', 
    imgUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=500&auto=format&fit=crop&q=70',
    manager: 'Park Min Woo',
    lines: 6,
    workers: 98,
    activeDefectRate: 0.28,
    note: 'Áp lực ép khuôn thủy lực đạt chuẩn 240 bar'
  },
  { 
    id: 'HSTEC', 
    name: 'HSTEC Advanced SMT', 
    specialty: 'Gia công bản mạch SMT nhiều lớp',
    actual: 12500, 
    target: 16000, 
    rate: 78, 
    oee: 79.1, 
    status: 'warning', 
    statusText: 'Thiếu 12 thợ SMT', 
    imgUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=70',
    manager: 'Nguyễn Đình Dũng',
    lines: 7,
    workers: 86,
    activeDefectRate: 0.45,
    bottleneckCode: 'R04',
    note: 'Thiếu 12 công nhân vận hành SMT ca 1 tại xưởng 2'
  },
  { 
    id: 'KTECH', 
    name: 'KTECH High-Precision CNC', 
    specialty: 'Cơ khí chính xác & Phay trục CNC đa trục',
    actual: 12000, 
    target: 20000, 
    rate: 60, 
    oee: 65.3, 
    status: 'warning', 
    statusText: 'Bảo trì Spindle 04', 
    imgUrl: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=500&auto=format&fit=crop&q=70',
    manager: 'Lê Hoàng Nam',
    lines: 10,
    workers: 110,
    activeDefectRate: 0.62,
    bottleneckCode: 'R08',
    note: 'Mòn dao phay CNC trục Spindle 04 (rung > 4.2G)'
  },
  { 
    id: 'HOJEONGB', 
    name: 'HOJEONGB Electronics', 
    specialty: 'Lắp ráp cụm module điện tử & kiểm tra RF',
    actual: 13700, 
    target: 15500, 
    rate: 88, 
    oee: 93.8, 
    status: 'optimal', 
    statusText: 'Vượt nhịp', 
    imgUrl: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=500&auto=format&fit=crop&q=70',
    manager: 'Kim Sung Jae',
    lines: 5,
    workers: 74,
    activeDefectRate: 0.09,
    note: 'Hiệu suất ca sáng vượt 104% kế hoạch điều tiết'
  },
  { 
    id: 'HOJEONG_VINA', 
    name: 'HOJEONG VINA Laser Welding', 
    specialty: 'Hàn laser micro & Xử lý bề mặt quang hóa',
    actual: 13700, 
    target: 18000, 
    rate: 76, 
    oee: 80.2, 
    status: 'warning', 
    statusText: 'Lệch hàn laser', 
    imgUrl: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=500&auto=format&fit=crop&q=70',
    manager: 'Đặng Tuấn Kiệt',
    lines: 6,
    workers: 92,
    activeDefectRate: 0.81,
    bottleneckCode: 'R09',
    note: 'Lệch tọa độ hàn laser mạch dẫn, 140 linh kiện rework'
  },
  { 
    id: 'DAAL', 
    name: 'DAAL Heavy Casting & Ingot', 
    specialty: 'Đúc phôi nhôm & Gia công cơ khí nặng',
    actual: 8600, 
    target: 18000, 
    rate: 48, 
    oee: 51.4, 
    status: 'critical', 
    statusText: 'Đứt phôi nhôm A980 (P1)', 
    imgUrl: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?w=500&auto=format&fit=crop&q=70',
    manager: 'Vũ Quốc Toàn',
    lines: 8,
    workers: 130,
    activeDefectRate: 1.45,
    bottleneckCode: 'R06',
    note: 'Thâm hụt 4,800 kg phôi nhôm A980 tại trạm Hub A01'
  },
];

export const CAUSAL_NODES: CausalNode[] = [
  {
    id: 'N01',
    code: 'N01_PLAN',
    title: 'KẾ HOẠCH CA',
    subtitle: 'Production Target & Dispatch',
    category: 'input',
    weight: 0.71,
    x: 40,
    y: 35,
    statusText: 'Đổi lệnh gá 2 nhà máy',
    details: ['Định mức: 105,000 pcs', 'Ca 1: 08:00 - 16:00', 'Đổi lệnh gá khuôn KTECH & DAAL lúc 09:30'],
    metrics: { 'Kế hoạch': '105,000 pcs', 'Tiến độ': '71.8%', 'Độ lệch': '-29,400 pcs' }
  },
  {
    id: 'N02',
    code: 'N02_BUFFER',
    title: 'PREBUILD BUFFER',
    subtitle: 'WIP Buffer & Safety Stock',
    category: 'input',
    weight: 0.63,
    x: 40,
    y: 115,
    statusText: 'Đệm DAAL hụt 4.2k pcs',
    details: ['Buffer an toàn toàn chuỗi: 8,400 pcs', 'DAAL cạn đệm lúc 10:45', 'KHV & Dream Tech đệm còn 94%'],
    metrics: { 'Tồn đệm': '4,200 pcs', 'Định mức tối thiểu': '8,000 pcs', 'Khả năng cầm cự': '45 phút' }
  },
  {
    id: 'N03',
    code: 'N03_MATERIAL',
    title: 'KHO VẬT LIỆU HUB A01',
    subtitle: 'Raw Ingot Supply Chain',
    category: 'input',
    weight: 0.82,
    isNegative: true,
    x: 40,
    y: 200,
    statusText: 'ĐỨT PHÔI NHÔM A980 (P1)',
    details: [
      'Thâm hụt 4,800 kg phôi nhôm A980',
      'Xe cấp nguyên liệu từ kho cảng bị kẹt phà Đình Vũ',
      'DAAL giảm 52% sản lượng trạm dập số 3 & 4'
    ],
    metrics: { 'Tồn kho': '320 kg', 'Nhu cầu ca': '5,120 kg', 'Thiếu hụt': '-4,800 kg' }
  },
  {
    id: 'N04',
    code: 'N04_WORKFORCE',
    title: 'NHÂN LỰC & TAY NGHỀ',
    subtitle: 'SMT Operators & Skills',
    category: 'process',
    weight: 0.48,
    isNegative: true,
    x: 40,
    y: 285,
    statusText: 'Thiếu 12 thợ SMT tại HSTEC',
    details: [
      'HSTEC xưởng 2 vắng 12 thợ bậc 3-4',
      'Takt-time trượt từ 3.8s lên 6.4s/unit',
      'Đề xuất huy động 12 nhân sự hỗ trợ từ chuyền phụ trợ'
    ],
    metrics: { 'Hiện diện': '86 / 98 NV', 'Tỷ lệ đủ quân': '87.7%', 'Takt-time': '6.4s (chuẩn 3.8s)' }
  },
  {
    id: 'N05',
    code: 'N05_EQUIPMENT',
    title: 'THIẾT BỊ & TPM (OEE)',
    subtitle: 'CNC Spindles & Stamping Lines',
    category: 'process',
    weight: 0.67,
    isNegative: true,
    x: 40,
    y: 370,
    statusText: 'Mòn dao CNC KTECH Spindle 04',
    details: [
      'Máy CNC-04 trục Spindle rung vượt ngưỡng: 4.35G (> 3.5G cảnh báo)',
      'Dừng máy 45 phút lúc 10:15 để đo kiểm',
      'Cần thay bộ dao phay hợp kim phủ TiAlN'
    ],
    metrics: { 'Độ rung Spindle': '4.35G', 'Nhiệt độ bạc đạn': '68.2°C', 'OEE KTECH': '65.3%' }
  },
  {
    id: 'N06',
    code: 'N06_OQC',
    title: 'CHẤT LƯỢNG OQC',
    subtitle: 'Defect Analysis & Laser Precision',
    category: 'process',
    weight: 0.59,
    x: 320,
    y: 40,
    statusText: 'Lệch hàn laser HOJEONG VINA',
    details: [
      'Lỗi vi mô laser DEF-01: Lệch 0.08mm',
      '140 linh kiện phải chuyển qua chuyền làm lại Rework N07',
      'Fpy (First Pass Yield) đạt 96.2%'
    ],
    metrics: { 'DPMO': '340', 'FPY': '96.2%', 'Rework phát sinh': '140 pcs' }
  },
  {
    id: 'N07',
    code: 'N07_REWORK',
    title: 'TRẠM REWORK',
    subtitle: 'Offline Rectification Line',
    category: 'process',
    weight: 0.42,
    x: 320,
    y: 130,
    statusText: 'Tồn đọng 210 bảng mạch BGA',
    details: ['Nhịp sửa chữa 15 pcs/giờ', 'Tồn đọng gây trễ bàn giao kho thành phẩm'],
    metrics: { 'Tồn trạm sửa': '210 pcs', 'Năng lực trạm': '35 pcs/h' }
  },
  {
    id: 'N08',
    code: 'N08_ACTUAL_OUTPUT',
    title: 'SẢN LƯỢNG THỰC TẾ (CORE)',
    subtitle: 'Live Aggregated Finished Goods',
    category: 'core',
    weight: 1.0,
    x: 550,
    y: 195,
    statusText: '75,600 / 105,000 pcs (71.8%)',
    details: [
      'Điểm nghẽn chính: DAAL (-9.4k pcs do thiếu phôi A980)',
      'KTECH hụt -8.0k pcs do dừng bảo trì Spindle 04',
      'HSTEC hụt -3.5k pcs do trượt takt-time thiếu thợ'
    ],
    metrics: { 'Lũy kế': '75,600 pcs', 'Thâm hụt': '-29,400 pcs', 'Tốc độ hiện tại': '9,450 pcs/h' }
  },
  {
    id: 'N09',
    code: 'N09_DELIVERY_OTD',
    title: 'GIAO HÀNG ĐÚNG HẠN (OTD)',
    subtitle: 'Container Port Dispatch & TO Trucks',
    category: 'outcome',
    weight: 0.88,
    isNegative: true,
    x: 820,
    y: 120,
    statusText: 'NGUY CƠ TRỄ XE TO-3011 (RISK 68%)',
    details: [
      'Xe TO-3011 xuất bến lúc 15:30 đi Cảng Hải Phòng thiếu 4,200 pcs',
      'Xe TO-3022 xuất bến lúc 17:00 phụ thuộc vào tiến độ KHV & Dream Tech',
      'Phạt vi phạm hợp đồng nếu trễ tàu: $18,500'
    ],
    metrics: { 'Dự báo OTD': '68.0%', 'Thiếu cho chuyến 1': '4,200 pcs', 'Hạn chót đóng container': '15:30' }
  },
  {
    id: 'N10',
    code: 'N10_EXTERNAL',
    title: 'YẾU TỐ NGOẠI LAI',
    subtitle: 'Grid Voltage & Logistics Traffic',
    category: 'outcome',
    weight: 0.35,
    x: 820,
    y: 310,
    statusText: 'Ổn định (Điện áp 220V ±1.8%)',
    details: ['Thời tiết Đình Vũ - Hải Phòng: Mưa nhỏ, giao thông cầu Bạch Đằng lưu thông bình thường'],
    metrics: { 'Điện áp': '221.4V', 'Giao thông cảng': 'Lưu thông', 'Độ ẩm nhà xưởng': '54%' }
  }
];

export const CAUSAL_LINKS: CausalLink[] = [
  {
    id: 'R06',
    from: 'N03',
    to: 'N08',
    weight: 0.82,
    pValue: 0.0012,
    isNegative: true,
    path: 'M 230 230 C 370 230, 440 220, 540 225',
    formula: 'P(Output | do(Mat = K1)) = 96.2%',
    description: 'Thiếu hụt phôi nhôm A980 từ Hub A01 dẫn trực tiếp tới sụt giảm sản lượng tại DAAL (-9.4k pcs).',
    impactPct: 48,
    recommendedAction: 'Điều chuyển ngay 3,200 kg phôi nhôm từ Hub A01 và mượn 1,600 kg từ kho dự phòng KHV.',
    actionPayload: { actionId: 1, type: 'TRANSFER_ALUMINUM_A980', qty: 3200 }
  },
  {
    id: 'R08',
    from: 'N05',
    to: 'N08',
    weight: 0.67,
    pValue: 0.0045,
    isNegative: true,
    path: 'M 230 380 C 380 380, 450 260, 540 235',
    formula: 'P(Output | do(Tool = Fresh)) = 89.4%',
    description: 'Mòn dao phay trục Spindle 04 làm tăng rung động > 4.2G, giảm tốc độ ăn dao và dừng máy 45 phút.',
    impactPct: 24,
    recommendedAction: 'Kích hoạt kíp bảo dưỡng thay dao phay CNC trong 15 phút ca nghỉ giữa ca.',
    actionPayload: { actionId: 2, type: 'REPLACE_SPINDLE_TOOL', machine: 'CNC-SPINDLE-04' }
  },
  {
    id: 'R05',
    from: 'N01',
    to: 'N08',
    weight: 0.71,
    pValue: 0.0028,
    isNegative: false,
    path: 'M 230 55 C 370 55, 430 190, 540 215',
    formula: 'P(Output | Plan_Optimal) = 91.5%',
    description: 'Điều chỉnh phân bổ lệnh sản xuất giữa các chuyền để tận dụng năng lực dư của HOJEONGB.',
    impactPct: 15,
    recommendedAction: 'Khóa lệnh gá khuôn cố định để bù đắp sai số dập và tăng nhịp HOJEONGB thêm 12%.',
    actionPayload: { actionId: 5, type: 'LOCK_FIXTURE_ORDER' }
  },
  {
    id: 'R07',
    from: 'N02',
    to: 'N08',
    weight: 0.63,
    pValue: 0.0071,
    isNegative: false,
    path: 'M 230 135 C 360 135, 440 200, 540 220',
    formula: 'P(Output | Buffer_Sufficient) = 93.0%',
    description: 'Xả đệm an toàn Prebuild Buffer M09 để bù đắp lượng phôi đang trên đường vận chuyển.',
    impactPct: 12,
    recommendedAction: 'Mở khóa kho đệm Prebuild cấp 2,400 pcs cho khâu hoàn thiện.',
    actionPayload: { actionId: 6, type: 'RELEASE_PREBUILD_BUFFER' }
  },
  {
    id: 'R04',
    from: 'N04',
    to: 'N08',
    weight: 0.48,
    pValue: 0.015,
    isNegative: true,
    path: 'M 230 305 C 370 305, 440 240, 540 230',
    formula: 'P(Output | do(Staff = 98)) = 94.6%',
    description: 'Thiếu hụt thợ lành nghề SMT tại HSTEC kéo tụt takt-time từ 3.8s lên 6.4s/unit.',
    impactPct: 18,
    recommendedAction: 'Điều động 12 công nhân gá phôi nhanh từ xưởng 1 sang xưởng 2 và tăng ca 1.5h.',
    actionPayload: { actionId: 4, type: 'AUGMENT_SMT_STAFF' }
  },
  {
    id: 'R_OUT',
    from: 'N08',
    to: 'N09',
    weight: 0.88,
    pValue: 0.0008,
    isNegative: true,
    path: 'M 720 220 C 760 220, 780 160, 820 145',
    formula: 'P(OTD | Output >= 98k) = 98.5%',
    description: 'Thâm hụt sản lượng lũy kế đe dọa trực tiếp tỷ lệ giao hàng đúng hạn cho chuyến container cảng Hải Phòng.',
    impactPct: 68,
    recommendedAction: 'Thực thi gói giải pháp tổng thể để phục hồi sản lượng trước mốc 14:30.',
    actionPayload: { actionId: 99, type: 'RECOVER_OTD' }
  }
];

export const INITIAL_EMERGENCY_ACTIONS: EmergencyAction[] = [
  { 
    id: 1, 
    code: 'ACT-01-MAT',
    title: 'Điều chuyển 3,200 kg phôi nhôm A980 từ Hub A01 sang DAAL', 
    plantId: 'DAAL',
    priority: 'Cao', 
    actionBtn: 'Lệnh ngay',
    impactDescription: 'Khôi phục ngay 52% năng lực dập khuôn tại xưởng đúc DAAL, giải phóng 7,800 pcs',
    targetMetricRecovery: '+7,800 pcs sản lượng'
  },
  { 
    id: 2, 
    code: 'ACT-02-CNC',
    title: 'Thay dao phay hợp kim phủ TiAlN trục Spindle 04 tại KTECH', 
    plantId: 'KTECH',
    priority: 'Cao', 
    actionBtn: 'Chấp thuận',
    impactDescription: 'Giảm rung động từ 4.35G xuống < 1.8G, tăng tốc độ cắt phay lên 100% định mức',
    targetMetricRecovery: '+5,200 pcs & OEE lên 88%'
  },
  { 
    id: 3, 
    code: 'ACT-03-LASER',
    title: 'Hiệu chuẩn lại quang học tọa độ tia laser tại HOJEONG VINA', 
    plantId: 'HOJEONG_VINA',
    priority: 'Trung bình', 
    actionBtn: 'Giao việc',
    impactDescription: 'Triệt tiêu sai số 0.08mm, giảm tỷ lệ hàng phải sửa Rework từ 0.81% xuống 0.05%',
    targetMetricRecovery: '+1,800 pcs FPY'
  },
  { 
    id: 4, 
    code: 'ACT-04-HR',
    title: 'Điều động tăng viện 12 thợ SMT bậc cao cho HSTEC xưởng 2', 
    plantId: 'HSTEC',
    priority: 'Trung bình', 
    actionBtn: 'Phê duyệt',
    impactDescription: 'Kéo giảm takt-time từ 6.4s trở về chuẩn 3.9s, cân bằng chuyền lắp ráp vi mạch',
    targetMetricRecovery: '+2,600 pcs & Takt-time 3.9s'
  },
  { 
    id: 5, 
    code: 'ACT-05-FIX',
    title: 'Khóa lệnh gá khuôn cố định để bù đắp sai số dập chéo nhà máy', 
    plantId: 'DREAM_TECH',
    priority: 'Trung bình', 
    actionBtn: 'Khóa lệnh',
    impactDescription: 'Đồng bộ hóa dung sai lắp ghép vỏ nhựa với khung nhôm đúc, giảm 90% lỗi cong vênh',
    targetMetricRecovery: '+1,400 pcs bảo toàn'
  },
  { 
    id: 6, 
    code: 'ACT-06-SPEED',
    title: 'Tăng 12% nhịp chuyền hoàn thiện tại HOJEONGB để bù sản lượng', 
    plantId: 'HOJEONGB',
    priority: 'Thấp', 
    actionBtn: 'Kích hoạt',
    impactDescription: 'Khai thác biên độ OEE 93.8% của HOJEONGB để gánh tải cho chuỗi cung ứng',
    targetMetricRecovery: '+1,600 pcs gánh tải'
  }
];

export const HOURLY_TRENDS: HourlyDataPoint[] = [
  { hour: '08:00', actual: 11200, target: 13125, cumulativeActual: 11200, cumulativeTarget: 13125, reason: 'Khởi động ca & căn chỉnh máy ban đầu' },
  { hour: '09:00', actual: 12400, target: 13125, cumulativeActual: 23600, cumulativeTarget: 26250, reason: 'Chuyền vận hành đạt 94.5% định mức' },
  { hour: '10:00', actual: 12800, target: 13125, cumulativeActual: 36400, cumulativeTarget: 39375, reason: 'Spindle 04 KTECH bắt đầu chớm rung 3.2G' },
  { hour: '11:00', actual: 10100, target: 13125, cumulativeActual: 46500, cumulativeTarget: 52500, isDip: true, reason: 'Đứt phôi nhôm A980 tại DAAL & dừng máy KTECH' },
  { hour: '12:00', actual: 9450, target: 13125, cumulativeActual: 55950, cumulativeTarget: 65625, isDip: true, reason: 'Trũng sâu nhất: Đứt phôi dập diện rộng' },
  { hour: '13:00', actual: 9800, target: 13125, cumulativeActual: 65750, cumulativeTarget: 78750, reason: 'Xả đệm Prebuild M09 trợ lực tạm thời' },
  { hour: '14:00', actual: 9850, target: 13125, cumulativeActual: 75600, cumulativeTarget: 91875, reason: 'Hiện tại: Chờ thực thi gói can thiệp khẩn cấp' },
  { hour: '15:00', actual: 14200, target: 13125, cumulativeActual: 89800, cumulativeTarget: 105000, future: true, reason: 'Dự báo sau can thiệp AI: Tăng tốc bù sản lượng' },
];

export const OTD_SHIPMENTS: OtdShipment[] = [
  {
    id: 'SH-01',
    code: 'TO-3011',
    destination: 'Cảng Tân Vũ, Hải Phòng (Export US East Coast)',
    carrier: 'Tung Logistics Fleet 01',
    truckNo: '15C-882.19',
    departureTime: '15:30:00',
    plannedQty: 18000,
    readyQty: 13800,
    status: 'critical',
    etaPort: '17:45:00',
    plantOrigin: 'DAAL / KTECH Hub'
  },
  {
    id: 'SH-02',
    code: 'TO-3022',
    destination: 'Cảng Lạch Huyện, Hải Phòng (Export Europe)',
    carrier: 'Tung Logistics Fleet 02',
    truckNo: '15C-942.55',
    departureTime: '17:00:00',
    plannedQty: 22000,
    readyQty: 19800,
    status: 'at_risk',
    etaPort: '19:15:00',
    plantOrigin: 'KHV / DREAM TECH'
  },
  {
    id: 'SH-03',
    code: 'TO-3035',
    destination: 'Sân bay Quốc tế Nội Bài (Air Cargo Priority)',
    carrier: 'Express Air Freight',
    truckNo: '29H-712.04',
    departureTime: '18:30:00',
    plannedQty: 8500,
    readyQty: 8500,
    status: 'on_track',
    etaPort: '20:00:00',
    plantOrigin: 'HOJEONGB'
  },
  {
    id: 'SH-04',
    code: 'TO-3040',
    destination: 'Kho Trung chuyển Bắc Ninh Hub B02',
    carrier: 'Internal Shuttle 09',
    truckNo: '99C-412.80',
    departureTime: '19:00:00',
    plannedQty: 15000,
    readyQty: 14100,
    status: 'on_track',
    etaPort: '20:30:00',
    plantOrigin: 'HSTEC'
  }
];

export const QUALITY_DEFECTS: QualityDefect[] = [
  {
    id: 'DEF-01',
    code: 'DEF-01-LASER',
    name: 'Lệch vi mô tọa độ hàn laser quang học',
    plant: 'HOJEONG VINA',
    station: 'Laser Cell #02',
    defectCount: 140,
    dpmo: 340,
    severity: 'Major',
    trend: 'up',
    rootCause: 'Nhiệt độ đầu phát quang laser tăng từ 24°C lên 38.5°C làm trôi thấu kính tiêu cự'
  },
  {
    id: 'DEF-02',
    code: 'DEF-02-BURR',
    name: 'Bavia cơ khí vượt chuẩn > 0.04mm',
    plant: 'KTECH',
    station: 'CNC Mill #04',
    defectCount: 95,
    dpmo: 230,
    severity: 'Major',
    trend: 'up',
    rootCause: 'Mòn dao phay mặt đầu trục Spindle 04'
  },
  {
    id: 'DEF-03',
    code: 'DEF-03-VOIDS',
    name: 'Rỗ khí đúc phôi nhôm bề mặt A980',
    plant: 'DAAL',
    station: 'Die Casting Press #01',
    defectCount: 78,
    dpmo: 190,
    severity: 'Critical',
    trend: 'down',
    rootCause: 'Nhiệt độ nước làm nguội khuôn đúc không đồng đều lúc mở khuôn'
  },
  {
    id: 'DEF-04',
    code: 'DEF-04-TOMBSTONE',
    name: 'Hàn dựng đứng linh kiện trở vi mô 0201',
    plant: 'HSTEC',
    station: 'SMT Reflow #03',
    defectCount: 42,
    dpmo: 85,
    severity: 'Minor',
    trend: 'stable',
    rootCause: 'Thiếu thợ căn chỉnh tốc độ gắp chip mounter'
  }
];

export const MACHINE_TELEMETRY: MachineTelemetry[] = [
  {
    id: 'M-01',
    code: 'CNC-SPINDLE-04',
    name: 'Máy Phay CNC Đa Trục Mazak 5-Axis',
    plant: 'KTECH',
    type: 'Gia công phay trục',
    status: 'warning',
    vibrationG: 4.35,
    temperatureC: 68.2,
    spindleRpm: 14800,
    oee: 65.3,
    toolWearPct: 91,
    lastMaintenance: '2025-06-21 04:00'
  },
  {
    id: 'M-02',
    code: 'DIE-CAST-01',
    name: 'Máy Đúc Áp Lực Nhôm Ube 1200T',
    plant: 'DAAL',
    type: 'Đúc áp lực phôi',
    status: 'stopped',
    vibrationG: 0.12,
    temperatureC: 185.0,
    spindleRpm: 0,
    oee: 51.4,
    toolWearPct: 44,
    lastMaintenance: '2025-06-23 18:00'
  },
  {
    id: 'M-03',
    code: 'LASER-WELD-02',
    name: 'Trạm Hàn Laser Sợi Quang Trumpf 4kW',
    plant: 'HOJEONG_VINA',
    type: 'Hàn laser micro',
    status: 'warning',
    vibrationG: 0.45,
    temperatureC: 38.5,
    spindleRpm: 0,
    oee: 80.2,
    toolWearPct: 62,
    lastMaintenance: '2025-06-22 12:00'
  },
  {
    id: 'M-04',
    code: 'SMT-LINE-01',
    name: 'Chuyền SMT Fuji NXT III Siêu Cao Tốc',
    plant: 'KHV',
    type: 'Gắp & dán linh kiện vi mạch',
    status: 'running',
    vibrationG: 0.85,
    temperatureC: 25.4,
    spindleRpm: 0,
    oee: 91.2,
    toolWearPct: 22,
    lastMaintenance: '2025-06-24 02:00'
  },
  {
    id: 'M-05',
    code: 'PRESS-MOLD-06',
    name: 'Máy Ép Khuôn Thủy Lực Nissei 800T',
    plant: 'DREAM_TECH',
    type: 'Ép khuôn vỏ chính xác',
    status: 'running',
    vibrationG: 1.15,
    temperatureC: 42.0,
    spindleRpm: 0,
    oee: 86.4,
    toolWearPct: 35,
    lastMaintenance: '2025-06-20 08:00'
  }
];

export const MATERIAL_INVENTORIES: MaterialInventory[] = [
  {
    id: 'MAT-01',
    code: 'ALUMINUM_A980',
    name: 'Phôi nhôm hợp kim A980 (Đúc vỏ tản nhiệt & khung)',
    hub: 'Central Hub A01 (Hải Phòng - Hải Dương)',
    stockKg: 320,
    safetyStockKg: 5000,
    dailyConsumptionKg: 5120,
    status: 'critical_shortage',
    allocatedPlants: ['DAAL', 'KTECH']
  },
  {
    id: 'MAT-02',
    code: 'COPPER_FOIL_C1100',
    name: 'Cuộn đồng nguyên chất C1100 tráng bạc',
    hub: 'Central Hub A01',
    stockKg: 6400,
    safetyStockKg: 3500,
    dailyConsumptionKg: 1200,
    status: 'healthy',
    allocatedPlants: ['KHV', 'HSTEC']
  },
  {
    id: 'MAT-03',
    code: 'RESIN_ABS_FR500',
    name: 'Hạt nhựa chống cháy ABS-FR500 ép vỏ',
    hub: 'Central Hub A01',
    stockKg: 8900,
    safetyStockKg: 4000,
    dailyConsumptionKg: 1850,
    status: 'healthy',
    allocatedPlants: ['DREAM_TECH']
  },
  {
    id: 'MAT-04',
    code: 'SOLDER_PASTE_SAC305',
    name: 'Kem hàn không chì Senju SAC305 SMT',
    hub: 'Kho lạnh Hub A01 (2-8°C)',
    stockKg: 420,
    safetyStockKg: 250,
    dailyConsumptionKg: 65,
    status: 'healthy',
    allocatedPlants: ['KHV', 'HSTEC', 'HOJEONGB']
  }
];

export const GEMINI_FUNCTIONS_SPEC = [
  {
    name: 'dispatch_material_emergency',
    description: 'Kích hoạt lệnh điều động nguyên vật liệu khẩn cấp từ kho tổng hoặc cụm nhà máy vệ tinh để giải cứu điểm nghẽn sản xuất.',
    parameters: {
      type: 'OBJECT',
      properties: {
        material_code: { type: 'STRING', description: "Mã vật tư cần điều chuyển, ví dụ: 'ALUMINUM_A980'." },
        quantity_kg: { type: 'NUMBER', description: 'Khối lượng cần cấp bù (tính bằng kg).' },
        from_location: { type: 'STRING', description: "Kho nguồn, ví dụ: 'HUB_A01' hoặc 'KHV'." },
        to_plant: { type: 'STRING', enum: ['DAAL', 'KTECH', 'HSTEC', 'HOJEONG_VINA', 'DREAM_TECH'], description: 'Nhà máy tiếp nhận vật tư.' },
        transport_priority: { type: 'STRING', enum: ['P1_EMERGENCY', 'P2_STANDARD'], description: 'Mức độ ưu tiên vận chuyển.' }
      },
      required: ['material_code', 'quantity_kg', 'from_location', 'to_plant', 'transport_priority']
    }
  },
  {
    name: 'schedule_cnc_maintenance',
    description: 'Lên lịch và gửi lệnh bảo trì/thay dao Spindle khẩn cấp cho máy CNC tại nhà máy cơ khí.',
    parameters: {
      type: 'OBJECT',
      properties: {
        plant_id: { type: 'STRING', enum: ['KTECH', 'DREAM_TECH'] },
        machine_id: { type: 'STRING', description: "Mã định danh máy, ví dụ: 'CNC-SPINDLE-04'." },
        action_type: { type: 'STRING', enum: ['TOOL_REPLACEMENT', 'FULL_OVERHAUL', 'CALIBRATION'] },
        estimated_downtime_minutes: { type: 'INTEGER' }
      },
      required: ['plant_id', 'machine_id', 'action_type']
    }
  },
  {
    name: 'execute_counterfactual_simulation',
    description: 'Chạy mô phỏng suy luận nhân quả đối chứng (Counterfactual What-If) theo thuật toán Pearl Do-Calculus để dự báo sản lượng và OTD sau can thiệp.',
    parameters: {
      type: 'OBJECT',
      properties: {
        scenario_type: { type: 'STRING', enum: ['BASELINE', 'PARTIAL_INTERVENTION', 'FULL_AI_OPTIMAL'] },
        interventions: { type: 'ARRAY', items: { type: 'STRING' }, description: "Danh sách các mã can thiệp, ví dụ: ['DISPATCH_DAAL_K1', 'SHIFT_12_SMT_HSTEC']" }
      },
      required: ['scenario_type', 'interventions']
    }
  }
];
