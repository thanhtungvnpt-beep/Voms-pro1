import { Request, Response, NextFunction, Router } from 'express';
import crypto from 'crypto';
import { 
  User, UserRole, AuthenticatedRequest, 
  authMiddleware, requireRoles, enforceVendorIsolation,
  calculateHash, recordAuditLog 
} from './trustServices';

// =========================================================================
// 1. PHASE 3 DOMAINS, FSM & RISK POLICY TYPES
// =========================================================================

export type DomainType = 
  | 'EQUIPMENT'
  | 'PRODUCTION_PLAN'
  | 'QUALITY'
  | 'VENDOR'
  | 'DATA_TRUST'
  | 'AI_DECISIONS'
  | 'ALERTS'
  | 'APPROVALS';

export type RiskLevel = 
  | 'LEVEL_1_INFO'
  | 'LEVEL_2_OPERATIONAL'
  | 'LEVEL_3_PRODUCTION'
  | 'LEVEL_4_HIGH_IMPACT';

export type HitlStatus = 
  | 'NEW'
  | 'ANALYZING'
  | 'PROPOSED'
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'NEEDS_MORE_INFORMATION'
  | 'EXECUTING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export type AlertSeverity = 
  | 'CRITICAL_P1'
  | 'HIGH_P2'
  | 'MEDIUM_P3'
  | 'LOW_P4';

export interface EvidenceItem {
  sourceId: string;
  metric: string;
  observedValue: string | number;
  expectedValue: string | number;
  deviationPct: number;
  timestamp: string;
  verified: boolean;
}

export interface ProposalApproval {
  approverId: string;
  approverName: string;
  approverRole: UserRole;
  approvedAt: string;
  note: string;
}

export interface AiRecommendationProposal {
  id: string;
  domain: DomainType;
  plantId: string; // Satellite plant e.g. 'DAAL', 'KTECH', 'HSTEC', etc.
  title: string;
  fact: string;          // FACT: Quan sát thực tế
  inference: string;     // INFERENCE: Suy luận mô hình & Causal attribution
  recommendation: string;// RECOMMENDATION: Khuyến nghị hành động
  evidence: EvidenceItem[];
  confidenceScore: number; // 0.0 - 1.0 (e.g. 0.94)
  calibrationScore: number;// 0.0 - 1.0 (e.g. 0.92)
  evidenceSufficiency: 'SUFFICIENT' | 'INSUFFICIENT';
  riskLevel: RiskLevel;
  status: HitlStatus;
  requestedBy: string;     // Actor ID or 'AI_AGENT_AUTONOMOUS'
  requestedByName: string;
  requestedByRole: UserRole | 'AI_AGENT';
  requiredApprovals: number; // 1 for Level 1-3, 2 for Level 4
  approvals: ProposalApproval[];
  rejectionReason?: string | null;
  moreInfoRequest?: {
    requestedBy: string;
    requestedByName: string;
    question: string;
    requestedAt: string;
    response?: string;
  } | null;
  actionType: string;
  actionPayload: any;
  executionResult?: {
    executedAt: string;
    executedBy: string;
    success: boolean;
    verificationLog: string;
    postExecutionMetrics: any;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface AlertItem {
  id: string;
  clusterId: string;
  domain: DomainType;
  plantId: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  slaMinutes: number;
  createdAt: string;
  escalatedAt?: string | null;
  isEscalated: boolean;
  escalationLevel: number;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'IN_APPROVAL' | 'RESOLVED';
  linkedProposalId?: string | null;
  acknowledgedBy?: string | null;
  resolutionNote?: string | null;
}

export interface FeedbackItem {
  id: string;
  recommendationId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  rating: number; // 1 to 5
  feedbackType: 'ACCEPTED_ACCURATE' | 'FALSE_POSITIVE' | 'MODIFIED_BY_OPERATOR' | 'REJECTED_UNSAFE';
  comment: string;
  createdAt: string;
}

// =========================================================================
// 2. FINITE STATE MACHINE (FSM) TRANSITION DEFINITIONS
// =========================================================================

export const VALID_FSM_TRANSITIONS: Record<HitlStatus, HitlStatus[]> = {
  NEW: ['ANALYZING', 'CANCELLED'],
  ANALYZING: ['PROPOSED', 'NEEDS_MORE_INFORMATION', 'CANCELLED'],
  PROPOSED: ['PENDING_REVIEW', 'CANCELLED'],
  PENDING_REVIEW: ['APPROVED', 'REJECTED', 'NEEDS_MORE_INFORMATION', 'CANCELLED'],
  APPROVED: ['EXECUTING', 'CANCELLED'],
  EXECUTING: ['COMPLETED', 'FAILED'],
  COMPLETED: [],
  FAILED: ['ANALYZING', 'CANCELLED'],
  REJECTED: ['ANALYZING', 'CANCELLED'],
  NEEDS_MORE_INFORMATION: ['ANALYZING', 'CANCELLED'],
  CANCELLED: []
};

// =========================================================================
// 3. SEED IN-MEMORY STORE FOR PHASE 3
// =========================================================================

let PROPOSALS_DB: AiRecommendationProposal[] = [
  {
    id: 'PROP-2026-P3-001',
    domain: 'PRODUCTION_PLAN',
    plantId: 'DAAL',
    title: 'Điều phối 5,600kg phôi nhôm A980 từ Hub A01 giải cứu đơn TO-3011',
    fact: 'Tồn kho phôi nhôm A980 tại DAAL hiện còn 840kg (mức tối thiểu 4,500kg). Chuyền dập dở dang 5,600 pcs. Đơn TO-3011 giao cảng Hải Phòng lúc 17:45 đang trễ 2h.',
    inference: 'Mô hình Causal DAG (N03 -> N08, weight 0.82, p=0.0012) xác định đứt phôi tại Hub A01 là nguyên nhân gây 48% rủi ro OTD toàn hệ thống. Xác suất hoàn thành đơn nếu điều xe tức thì đạt 96.2%.',
    recommendation: 'Kích hoạt điều phối xe tải TK-77 chuyển 5,600kg phôi nhôm từ Hub A01 sang DAAL Precision với luồng xanh ưu tiên.',
    evidence: [
      { sourceId: 'SRC-MES-DAAL', metric: 'Kho phôi A980', observedValue: '840 kg', expectedValue: '>= 4500 kg', deviationPct: -81.3, timestamp: new Date(Date.now() - 1200000).toISOString(), verified: true },
      { sourceId: 'SRC-SAP-ERP', metric: 'Đơn TO-3011 Target', observedValue: '18000 pcs', expectedValue: '18000 pcs', deviationPct: 0, timestamp: new Date(Date.now() - 1800000).toISOString(), verified: true },
      { sourceId: 'SRC-MES-DAAL', metric: 'Sản lượng thực tế DAAL', observedValue: '8600 pcs', expectedValue: '14200 pcs', deviationPct: -39.4, timestamp: new Date(Date.now() - 600000).toISOString(), verified: true }
    ],
    confidenceScore: 0.96,
    calibrationScore: 0.94,
    evidenceSufficiency: 'SUFFICIENT',
    riskLevel: 'LEVEL_3_PRODUCTION',
    status: 'PENDING_REVIEW',
    requestedBy: 'AI_AGENT_AUTONOMOUS',
    requestedByName: 'AI Causal Optimizer Engine v4.2',
    requestedByRole: 'AI_AGENT',
    requiredApprovals: 1,
    approvals: [],
    actionType: 'DISPATCH_MATERIAL',
    actionPayload: {
      sourceHub: 'Kho Hub A01 (Bắc Ninh)',
      targetPlant: 'DAAL',
      materialCode: 'ALU-A980-BILLET',
      quantityKg: 5600,
      truckPlate: '29H-882.14'
    },
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    updatedAt: new Date(Date.now() - 600000).toISOString()
  },
  {
    id: 'PROP-2026-P3-002',
    domain: 'EQUIPMENT',
    plantId: 'KTECH',
    title: 'Thay dao phay hợp kim và cân bằng động trục chính Spindle 04',
    fact: 'Cảm biến rung IoT MQTT ghi nhận gia tốc rung 4.8G trên ổ bi trục Spindle 04 (ngưỡng cảnh báo 2.5G). Nhiệt độ đầu dao đạt 78.4°C.',
    inference: 'Mô hình R08 (N05 -> N08, weight 0.67, p=0.0045) dự báo trục sẽ kẹt hoàn toàn sau 85 phút vận hành nếu tiếp tục chạy ở tốc độ 12,000 RPM.',
    recommendation: 'Chuyển tải 1,200 pcs dở dang sang CNC-02 dự phòng và thực hiện bảo trì thay dao Spindle 04 trong 30 phút.',
    evidence: [
      { sourceId: 'SRC-IOT-KTECH', metric: 'Gia tốc rung Spindle 04', observedValue: '4.8 G', expectedValue: '< 2.5 G', deviationPct: 92.0, timestamp: new Date(Date.now() - 900000).toISOString(), verified: true },
      { sourceId: 'SRC-IOT-KTECH', metric: 'Nhiệt độ Spindle', observedValue: '78.4 °C', expectedValue: '< 65 °C', deviationPct: 20.6, timestamp: new Date(Date.now() - 900000).toISOString(), verified: true }
    ],
    confidenceScore: 0.92,
    calibrationScore: 0.91,
    evidenceSufficiency: 'SUFFICIENT',
    riskLevel: 'LEVEL_2_OPERATIONAL',
    status: 'PENDING_REVIEW',
    requestedBy: 'AI_AGENT_AUTONOMOUS',
    requestedByName: 'AI Predictive Maintenance Agent',
    requestedByRole: 'AI_AGENT',
    requiredApprovals: 1,
    approvals: [],
    actionType: 'SCHEDULE_MAINTENANCE',
    actionPayload: {
      equipmentId: 'CNC-SPINDLE-04',
      targetPlant: 'KTECH',
      sparePartCode: 'TOOL-MILL-CARBIDE-12MM',
      durationMinutes: 30
    },
    createdAt: new Date(Date.now() - 2400000).toISOString(),
    updatedAt: new Date(Date.now() - 1200000).toISOString()
  },
  {
    id: 'PROP-2026-P3-003',
    domain: 'QUALITY',
    plantId: 'HOJEONG_VINA',
    title: 'Tạm dừng chuyền Laser CNC 02 để hiệu chuẩn tiêu cự quang học (Dual-Approval Level 4)',
    fact: 'Máy AOI quang học phát hiện 48/400 sản phẩm khung hợp kim bị lệch đường cắt laser 0.12mm (dung sai cho phép +-0.03mm). Tỷ lệ lỗi dâng lên 12%.',
    inference: 'Lệch tiêu cự quang học thấu kính hội tụ Laser F-Theta sau chu kỳ 10,000 giờ. Tiếp tục chạy sẽ gây hủy lô hàng 1,500 pcs giá trị 340 triệu VNĐ.',
    recommendation: 'Kích hoạt DỪNG KHẨN CẤP Chuyền Laser 02, cách ly lô lỗi LB-8812 và cử chuyên gia hiệu chuẩn tiêu cự quang học.',
    evidence: [
      { sourceId: 'SRC-LASER-HOJEONG-VINA', metric: 'Độ lệch quang học', observedValue: '0.12 mm', expectedValue: '<= 0.03 mm', deviationPct: 300.0, timestamp: new Date(Date.now() - 800000).toISOString(), verified: true },
      { sourceId: 'SRC-QC-HOJEONG-B', metric: 'Tỷ lệ lỗi cắt OQC', observedValue: '12.0 %', expectedValue: '< 0.5 %', deviationPct: 2300.0, timestamp: new Date(Date.now() - 800000).toISOString(), verified: true }
    ],
    confidenceScore: 0.98,
    calibrationScore: 0.96,
    evidenceSufficiency: 'SUFFICIENT',
    riskLevel: 'LEVEL_4_HIGH_IMPACT', // CRITICAL DUAL APPROVAL
    status: 'PENDING_REVIEW',
    requestedBy: 'AI_AGENT_AUTONOMOUS',
    requestedByName: 'AI Optical Quality Inspector',
    requestedByRole: 'AI_AGENT',
    requiredApprovals: 2, // DUAL APPROVAL MANDATED
    approvals: [],
    actionType: 'CALIBRATE_LASER_EMERGENCY_STOP',
    actionPayload: {
      machineId: 'LASER-CNC-02',
      targetPlant: 'HOJEONG_VINA',
      quarantineLot: 'LOT-LB-8812',
      action: 'EMERGENCY_LINE_STOP'
    },
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 1500000).toISOString()
  },
  {
    id: 'PROP-2026-P3-004',
    domain: 'VENDOR',
    plantId: 'HSTEC',
    title: 'Cảnh báo thiếu hụt bằng chứng vi mô - Yêu cầu xác minh hiện trường SMT',
    fact: 'Sản lượng SMT Chuyền 2 giảm 18% so với nhịp chuẩn. Dữ liệu PDA ghi nhận vắng 12 thợ nhưng không có báo cáo xin nghỉ phép ERP.',
    inference: 'Chưa đủ bằng chứng để khẳng định nguyên nhân do biến động nhân sự hay do kẹt máy nạp phôi Tape Feeder.',
    recommendation: 'Không can thiệp tự động. Đề nghị Quản lý Nhà máy HSTEC kiểm tra trực tiếp hiện trường và nhập biên bản xác nhận.',
    evidence: [
      { sourceId: 'SRC-SCANNER-HSTEC', metric: 'Nhịp dán linh kiện SMT', observedValue: '82.0 %', expectedValue: '100.0 %', deviationPct: -18.0, timestamp: new Date(Date.now() - 1500000).toISOString(), verified: false }
    ],
    confidenceScore: 0.52, // LOW CONFIDENCE -> INSUFFICIENT EVIDENCE
    calibrationScore: 0.55,
    evidenceSufficiency: 'INSUFFICIENT',
    riskLevel: 'LEVEL_1_INFO',
    status: 'NEEDS_MORE_INFORMATION',
    requestedBy: 'AI_AGENT_AUTONOMOUS',
    requestedByName: 'AI Anomaly Detector',
    requestedByRole: 'AI_AGENT',
    requiredApprovals: 1,
    approvals: [],
    actionType: 'MANUAL_VERIFICATION_REQUEST',
    actionPayload: {
      targetPlant: 'HSTEC',
      checkLocation: 'Chuyền SMT 02',
      verificationItem: 'Kiểm kê nhân sự ca 1 và máy Tape Feeder'
    },
    createdAt: new Date(Date.now() - 4200000).toISOString(),
    updatedAt: new Date(Date.now() - 3000000).toISOString()
  }
];

let ALERTS_DB: AlertItem[] = [
  {
    id: 'ALT-2026-001',
    clusterId: 'CLUS-MATERIAL-DAAL',
    domain: 'PRODUCTION_PLAN',
    plantId: 'DAAL',
    severity: 'CRITICAL_P1',
    title: 'Đứt phôi nhôm A980 đe dọa trễ đơn giao cảng TO-3011',
    description: 'Tồn kho phôi nhôm 840kg chạm ngưỡng cạn kiệt, dự kiến dừng toàn bộ chuyền dập trong 25 phút.',
    slaMinutes: 30,
    createdAt: new Date(Date.now() - 35 * 60000).toISOString(), // 35m ago -> exceeds 30m SLA!
    escalatedAt: new Date(Date.now() - 5 * 60000).toISOString(),
    isEscalated: true,
    escalationLevel: 2,
    status: 'ACTIVE',
    linkedProposalId: 'PROP-2026-P3-001'
  },
  {
    id: 'ALT-2026-002',
    clusterId: 'CLUS-EQUIP-KTECH',
    domain: 'EQUIPMENT',
    plantId: 'KTECH',
    severity: 'HIGH_P2',
    title: 'Rung động bất thường trục chính Spindle 04 vượt 4.8G',
    description: 'Cảm biến rung IoT cảnh báo nguy cơ mài mòn bạc đạn và gãy dao cắt hợp kim.',
    slaMinutes: 60,
    createdAt: new Date(Date.now() - 20 * 60000).toISOString(),
    isEscalated: false,
    escalationLevel: 1,
    status: 'ACTIVE',
    linkedProposalId: 'PROP-2026-P3-002'
  },
  {
    id: 'ALT-2026-003',
    clusterId: 'CLUS-QC-HOJEONG',
    domain: 'QUALITY',
    plantId: 'HOJEONG_VINA',
    severity: 'CRITICAL_P1',
    title: 'Lệch quang học Laser CNC 02 - Tỷ lệ phế phẩm 12%',
    description: 'Thấu kính laser lệch 0.12mm khiến biên dạng cắt phôi không đạt tiêu chuẩn kỹ thuật.',
    slaMinutes: 15,
    createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
    isEscalated: false,
    escalationLevel: 1,
    status: 'IN_APPROVAL',
    linkedProposalId: 'PROP-2026-P3-003'
  },
  {
    id: 'ALT-2026-004',
    clusterId: 'CLUS-STAFF-HSTEC',
    domain: 'VENDOR',
    plantId: 'HSTEC',
    severity: 'MEDIUM_P3',
    title: 'Thiếu hụt thợ lành nghề SMT ca 1 tại nhà máy HSTEC',
    description: 'Chuyền 2 vận hành dưới 82% công suất do vắng 12 kỹ thuật viên dán mạch.',
    slaMinutes: 120,
    createdAt: new Date(Date.now() - 40 * 60000).toISOString(),
    isEscalated: false,
    escalationLevel: 1,
    status: 'ACTIVE',
    linkedProposalId: 'PROP-2026-P3-004'
  }
];

let FEEDBACK_DB: FeedbackItem[] = [
  {
    id: 'FDB-001',
    recommendationId: 'PROP-2026-P3-001',
    userId: 'USR-MGMT-02',
    userName: 'Phạm Hồng Quân (Giám đốc Sản xuất)',
    userRole: 'MANAGEMENT',
    rating: 5,
    feedbackType: 'ACCEPTED_ACCURATE',
    comment: 'Đề xuất phân bổ xe TK-77 chính xác và kịp thời, cứu được đơn giao cảng đúng giờ.',
    createdAt: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'FDB-002',
    recommendationId: 'PROP-2026-P3-002',
    userId: 'USR-TECH-06',
    userName: 'Hoàng Quốc Việt (Kỹ sư Bảo trì)',
    userRole: 'EQUIPMENT_TECHNICIAN',
    rating: 5,
    feedbackType: 'ACCEPTED_ACCURATE',
    comment: 'Cảm biến rung bắt bệnh chuẩn, bạc đạn Spindle 04 mòn 80% khi tháo ra kiểm tra.',
    createdAt: new Date(Date.now() - 3600000).toISOString()
  }
];

// =========================================================================
// 4. ROUTER DEFINITION
// =========================================================================

export const controlTowerRouter = Router();

// -------------------------------------------------------------------------
// 4.1. CONTROL TOWER OVERVIEW & 8 DOMAIN METRICS
// -------------------------------------------------------------------------

controlTowerRouter.get('/overview', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const activeAlerts = ALERTS_DB.filter(a => a.status === 'ACTIVE').length;
  const criticalAlerts = ALERTS_DB.filter(a => a.severity === 'CRITICAL_P1' && a.status === 'ACTIVE').length;
  const pendingApprovals = PROPOSALS_DB.filter(p => p.status === 'PENDING_REVIEW').length;
  const level4Approvals = PROPOSALS_DB.filter(p => p.riskLevel === 'LEVEL_4_HIGH_IMPACT' && p.status === 'PENDING_REVIEW').length;
  const totalDecisions = PROPOSALS_DB.length;
  const completedActions = PROPOSALS_DB.filter(p => p.status === 'COMPLETED').length;

  // Calculate AI Metrics
  const totalFeedback = FEEDBACK_DB.length;
  const accurateFeedback = FEEDBACK_DB.filter(f => f.feedbackType === 'ACCEPTED_ACCURATE').length;
  const falsePositives = FEEDBACK_DB.filter(f => f.feedbackType === 'FALSE_POSITIVE').length;
  const acceptanceRatePct = totalFeedback > 0 ? Number(((accurateFeedback / totalFeedback) * 100).toFixed(1)) : 94.8;
  const falsePositiveRatePct = totalFeedback > 0 ? Number(((falsePositives / totalFeedback) * 100).toFixed(1)) : 5.2;

  res.json({
    system: 'VOMS PRO PHASE 3 — AI CONTROL TOWER & HITL GATEWAY',
    version: '3.0.0-PRO-ENTERPRISE',
    timestamp: new Date().toISOString(),
    activeUser: req.user,
    overview: {
      activeAlerts,
      criticalAlerts,
      pendingApprovals,
      level4Approvals,
      totalDecisions,
      completedActions,
      acceptanceRatePct,
      falsePositiveRatePct,
      avgCalibrationConfidencePct: 93.4,
      vendorPlantsMonitored: 7
    },
    domainSummary: {
      equipment: { status: 'WARNING', healthScore: 84.5, activeIssues: 1, criticalMachine: 'KTECH Spindle 04' },
      productionPlan: { status: 'CRITICAL', onTimeRate: 72.4, delayedOrders: 1, bottleneckPlant: 'DAAL Precision' },
      quality: { status: 'WARNING', oqcPassRate: 91.2, defectDriftPct: 12.0, hotZone: 'HOJEONG VINA Laser' },
      vendor: { status: 'STABLE', averageOee: 79.4, highRiskVendors: ['DAAL', 'KTECH'], topVendor: 'HOJEONGB' },
      dataTrust: { status: 'OPTIMAL', aggregateTrustScorePct: 95.8, activeSyncSources: 7, unverifiedAlerts: 0 },
      aiDecisions: { status: 'ACTIVE', totalProposals: totalDecisions, autonomousExecutionBlocked: true },
      alerts: { status: 'CRITICAL', totalActive: activeAlerts, escalatedCount: 1 },
      approvals: { status: 'ACTION_REQUIRED', pendingCount: pendingApprovals, dualApprovalNeeded: level4Approvals }
    }
  });
});

// -------------------------------------------------------------------------
// 4.2. DOMAIN SPECIFIC DRILL-DOWN
// -------------------------------------------------------------------------

controlTowerRouter.get('/domains/:domain', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const domainKey = req.params.domain.toUpperCase() as DomainType;
  const filteredProposals = PROPOSALS_DB.filter(p => p.domain === domainKey);
  const filteredAlerts = ALERTS_DB.filter(a => a.domain === domainKey);

  res.json({
    domain: domainKey,
    timestamp: new Date().toISOString(),
    proposalCount: filteredProposals.length,
    alertCount: filteredAlerts.length,
    proposals: filteredProposals,
    alerts: filteredAlerts
  });
});

// -------------------------------------------------------------------------
// 4.3. AI ANALYSIS ENGINE: RECOMMENDATIONS (FACT vs INFERENCE vs RECOMMENDATION)
// -------------------------------------------------------------------------

controlTowerRouter.get('/analysis/recommendations', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { domain, plant, status, min_confidence } = req.query;
  let items = [...PROPOSALS_DB];

  if (domain && domain !== 'ALL') {
    items = items.filter(p => p.domain.toLowerCase() === (domain as string).toLowerCase());
  }
  if (plant && plant !== 'ALL') {
    items = items.filter(p => p.plantId.toUpperCase() === (plant as string).toUpperCase());
  }
  if (status && status !== 'ALL') {
    items = items.filter(p => p.status.toLowerCase() === (status as string).toLowerCase());
  }
  if (min_confidence) {
    const minConf = Number(min_confidence);
    if (!isNaN(minConf)) {
      items = items.filter(p => p.confidenceScore >= minConf);
    }
  }

  res.json({
    total: items.length,
    timestamp: new Date().toISOString(),
    recommendations: items
  });
});

// Diagnostic Engine Trigger
controlTowerRouter.post('/analysis/diagnose', authMiddleware, requireRoles(['SYSTEM_ADMIN', 'MANAGEMENT', 'OUTSOURCING_GROUP', 'PRODUCTION_PLANNER', 'QC', 'QUALITY_CONTROL', 'EQUIPMENT_ENGINEER', 'EQUIPMENT_TECHNICIAN']), (req: AuthenticatedRequest, res: Response) => {
  const { targetPlant, domain } = req.body;

  // Generate a calibrated recommendation
  const newRecId = `PROP-2026-P3-${Math.floor(100 + Math.random() * 900)}`;
  const confidence = 0.93;
  const calibration = 0.91;

  const newProposal: AiRecommendationProposal = {
    id: newRecId,
    domain: (domain || 'PRODUCTION_PLAN') as DomainType,
    plantId: targetPlant || 'DAAL',
    title: `Phân tích chẩn đoán tự động cho nhà máy ${targetPlant || 'DAAL'}`,
    fact: `Ghi nhận đo kiểm lúc ${new Date().toLocaleTimeString('vi-VN')}: Tỷ lệ hoàn thành nhịp 78.5%, độ biến thiên rung sai +0.04mm.`,
    inference: `Suy luận nhân quả Bayes: Độ lệch do nhiệt độ dầu bôi trơn gia tăng khi vận hành liên tục 6.5h không ngắt quãng.`,
    recommendation: `Bổ sung dung dịch giải nhiệt làm mát và điều chỉnh nhịp cắt thêm 15 giây/chu kỳ.`,
    evidence: [
      {
        sourceId: 'SRC-MES-DAAL',
        metric: 'Nhiệt độ dầu thủy lực',
        observedValue: '62.4 °C',
        expectedValue: '< 55.0 °C',
        deviationPct: 13.4,
        timestamp: new Date().toISOString(),
        verified: true
      }
    ],
    confidenceScore: confidence,
    calibrationScore: calibration,
    evidenceSufficiency: 'SUFFICIENT',
    riskLevel: 'LEVEL_2_OPERATIONAL',
    status: 'PROPOSED',
    requestedBy: 'AI_AGENT_AUTONOMOUS',
    requestedByName: 'AI Causal Diagnostics Engine',
    requestedByRole: 'AI_AGENT',
    requiredApprovals: 1,
    approvals: [],
    actionType: 'ADJUST_COOLANT_CYCLE',
    actionPayload: { targetPlant: targetPlant || 'DAAL', coolantLevelLitres: 20 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  PROPOSALS_DB.unshift(newProposal);

  // Record audit log
  recordAuditLog({
    actor: req.user!,
    action: 'AI_DIAGNOSIS_TRIGGERED',
    resource: 'AI_ANALYSIS_ENGINE',
    targetId: newRecId,
    plantId: targetPlant || null,
    payload: { domain, targetPlant, confidenceScore: confidence }
  });

  res.json({
    message: 'AI Diagnostic Analysis executed successfully',
    proposal: newProposal
  });
});

// -------------------------------------------------------------------------
// 4.4. HUMAN-IN-THE-LOOP FSM WORKFLOW & ANTI-SELF-APPROVAL ENFORCEMENT
// -------------------------------------------------------------------------

controlTowerRouter.post('/proposals/:id/transition', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const proposalId = req.params.id;
  const { targetStatus, note, question, responseText } = req.body;
  const user = req.user!;

  const proposal = PROPOSALS_DB.find(p => p.id === proposalId);
  if (!proposal) {
    res.status(404).json({ error: 'PROPOSAL_NOT_FOUND', message: `Proposal '${proposalId}' not found.` });
    return;
  }

  // Check valid FSM transitions
  const allowedNext = VALID_FSM_TRANSITIONS[proposal.status];
  if (!allowedNext.includes(targetStatus as HitlStatus)) {
    res.status(400).json({
      error: 'INVALID_FSM_TRANSITION',
      message: `Cannot transition from state '${proposal.status}' to '${targetStatus}'. Allowed transitions: ${allowedNext.join(', ')}`,
      currentStatus: proposal.status,
      requestedStatus: targetStatus,
      allowedTransitions: allowedNext
    });
    return;
  }

  // ANTI-SELF-APPROVAL RULE (CRITICAL)
  if (targetStatus === 'APPROVED') {
    // 1. Check Creator != Approver
    if (proposal.requestedBy === user.id) {
      res.status(403).json({
        error: 'SELF_APPROVAL_FORBIDDEN',
        message: 'The creator or requester of a proposal cannot approve their own proposal. Independent human review is required.'
      });
      return;
    }

    // 2. Check AI cannot self-approve
    if (user.role === ('AI_AGENT' as any)) {
      res.status(403).json({
        error: 'AI_SELF_APPROVAL_FORBIDDEN',
        message: 'Autonomous AI agents are forbidden from self-approving recommendations. A certified human approver must decide.'
      });
      return;
    }

    // 3. Check Role Authority based on Risk Level
    if (proposal.riskLevel === 'LEVEL_3_PRODUCTION') {
      const allowedApprovers: UserRole[] = ['MANAGEMENT', 'OUTSOURCING_GROUP', 'SYSTEM_ADMIN', 'PRODUCTION_PLANNER', 'APPROVER'];
      if (!allowedApprovers.includes(user.role)) {
        res.status(403).json({
          error: 'INSUFFICIENT_APPROVAL_AUTHORITY',
          message: `Level 3 Production Impact proposals require approval from Department Lead (${allowedApprovers.join(', ')}). Your role: ${user.role}`
        });
        return;
      }
    }

    // 4. DUAL-APPROVAL POLICY FOR LEVEL 4
    if (proposal.riskLevel === 'LEVEL_4_HIGH_IMPACT') {
      const allowedL4Roles: UserRole[] = ['MANAGEMENT', 'SYSTEM_ADMIN', 'APPROVER'];
      if (!allowedL4Roles.includes(user.role)) {
        res.status(403).json({
          error: 'INSUFFICIENT_L4_AUTHORITY',
          message: `Level 4 High-Impact proposals mandate Management / Board / System Admin approval (${allowedL4Roles.join(', ')}). Your role: ${user.role}`
        });
        return;
      }

      // Check if user already provided first approval
      const alreadyApprovedByUser = proposal.approvals.some(a => a.approverId === user.id);
      if (alreadyApprovedByUser) {
        res.status(400).json({
          error: 'DUPLICATE_APPROVAL',
          message: 'You have already submitted an approval for this Level 4 proposal. Secondary approval must come from a distinct authorized officer.'
        });
        return;
      }

      // Add this approval
      proposal.approvals.push({
        approverId: user.id,
        approverName: user.fullName,
        approverRole: user.role,
        approvedAt: new Date().toISOString(),
        note: note || 'Phê duyệt cấp quản lý Level 4'
      });

      // If we don't have 2 approvals yet, keep in PENDING_REVIEW
      if (proposal.approvals.length < 2) {
        proposal.updatedAt = new Date().toISOString();
        recordAuditLog({
          actor: user,
          action: 'PROPOSAL_PARTIALLY_APPROVED',
          resource: 'HITL_APPROVAL_GATEWAY',
          targetId: proposal.id,
          plantId: proposal.plantId,
          statusBefore: { approvalsCount: proposal.approvals.length - 1 },
          statusAfter: { approvalsCount: proposal.approvals.length, required: 2 },
          payload: { note }
        });

        res.json({
          message: 'First approval recorded successfully. Secondary approval from another officer is required before execution.',
          proposal,
          partiallyApproved: true,
          approvalsRecorded: proposal.approvals.length,
          approvalsRequired: 2
        });
        return;
      }
      // If 2 approvals reached, proceed to state 'APPROVED'
    } else {
      // Level 1-3 single approval
      proposal.approvals.push({
        approverId: user.id,
        approverName: user.fullName,
        approverRole: user.role,
        approvedAt: new Date().toISOString(),
        note: note || 'Phê duyệt hợp lệ'
      });
    }
  }

  // Handle REJECTION
  if (targetStatus === 'REJECTED') {
    proposal.rejectionReason = note || 'Không đáp ứng điều kiện an toàn / từ chối bởi người vận hành';
  }

  // Handle NEEDS_MORE_INFORMATION
  if (targetStatus === 'NEEDS_MORE_INFORMATION') {
    proposal.moreInfoRequest = {
      requestedBy: user.id,
      requestedByName: user.fullName,
      question: question || note || 'Yêu cầu cung cấp thêm dữ liệu kiểm tra hiện trường.',
      requestedAt: new Date().toISOString()
    };
  }

  // Update Status
  const previousStatus = proposal.status;
  proposal.status = targetStatus as HitlStatus;
  proposal.updatedAt = new Date().toISOString();

  // Immutable Audit Record
  recordAuditLog({
    actor: user,
    action: `PROPOSAL_STATUS_CHANGED_${targetStatus}`,
    resource: 'HITL_FSM_WORKFLOW',
    targetId: proposal.id,
    plantId: proposal.plantId,
    statusBefore: { status: previousStatus },
    statusAfter: { status: targetStatus },
    payload: { note, question, responseText }
  });

  res.json({
    message: `Proposal '${proposalId}' transitioned from '${previousStatus}' to '${targetStatus}'.`,
    proposal
  });
});

// -------------------------------------------------------------------------
// 4.5. AI ACTION EXECUTION GATEWAY (SAFE ADAPTER PATTERN)
// -------------------------------------------------------------------------

controlTowerRouter.post('/actions/execute', authMiddleware, requireRoles(['SYSTEM_ADMIN', 'MANAGEMENT', 'OUTSOURCING_GROUP', 'PRODUCTION_PLANNER', 'VENDOR_MANAGER', 'APPROVER']), enforceVendorIsolation, (req: AuthenticatedRequest, res: Response) => {
  const { proposalId, verificationMode } = req.body;
  const user = req.user!;

  const proposal = PROPOSALS_DB.find(p => p.id === proposalId);
  if (!proposal) {
    res.status(404).json({ error: 'PROPOSAL_NOT_FOUND', message: `Proposal '${proposalId}' not found.` });
    return;
  }

  // Pre-execution validation: Must be in 'APPROVED' state!
  if (proposal.status !== 'APPROVED') {
    res.status(400).json({
      error: 'EXECUTION_PRECONDITION_FAILED',
      message: `Cannot execute action. Proposal '${proposalId}' is in status '${proposal.status}', but must be 'APPROVED'.`,
      currentStatus: proposal.status,
      requiredStatus: 'APPROVED'
    });
    return;
  }

  // Safe Execution Adapter Simulation
  proposal.status = 'EXECUTING';
  proposal.updatedAt = new Date().toISOString();

  const executionTimestamp = new Date().toISOString();
  let verificationLog = '';
  let postExecutionMetrics: any = {};

  if (proposal.actionType === 'DISPATCH_MATERIAL') {
    verificationLog = `Đã gửi lệnh điều vận xe tải đến Trung tâm Logistics. Cập nhật tồn kho DAAL +5,600kg phôi nhôm A980. Giảm thời gian trễ đơn TO-3011 xuống 0 phút.`;
    postExecutionMetrics = { targetPlant: proposal.plantId, stockAddedKg: 5600, riskOtdReductionPct: 52.0 };
  } else if (proposal.actionType === 'SCHEDULE_MAINTENANCE') {
    verificationLog = `Đã phân công kỹ thuật viên Việt HQ thay dao phay CNC Spindle 04. Chuyển tải 1,200 pcs sang máy CNC-02 hoàn tất.`;
    postExecutionMetrics = { machineId: 'SPINDLE-04', expectedDowntimeMinutes: 30, vibrationForecastG: 1.2 };
  } else if (proposal.actionType === 'CALIBRATE_LASER_EMERGENCY_STOP') {
    verificationLog = `Cụm Laser CNC-02 đã kích hoạt ngắt an toàn. Lô lỗi LOT-LB-8812 đã được gắn cờ cách ly OQC. Đội cơ điện đang cân chỉnh thấu kính.`;
    postExecutionMetrics = { machineState: 'SAFE_STOPPED', quarantinedPcs: 400, opticalOffsetMm: 0.0 };
  } else {
    verificationLog = `Hành động ${proposal.actionType} đã được thực thi thành công qua Adapter an toàn.`;
    postExecutionMetrics = { status: 'VERIFIED_OK' };
  }

  proposal.status = 'COMPLETED';
  proposal.executionResult = {
    executedAt: executionTimestamp,
    executedBy: user.fullName,
    success: true,
    verificationLog,
    postExecutionMetrics
  };
  proposal.updatedAt = new Date().toISOString();

  // If there's an associated alert, mark it RESOLVED
  const relatedAlert = ALERTS_DB.find(a => a.linkedProposalId === proposal.id);
  if (relatedAlert) {
    relatedAlert.status = 'RESOLVED';
    relatedAlert.resolutionNote = `Đã giải quyết thông qua hành động thực thi ${proposal.actionType} (Mã đề xuất ${proposal.id}).`;
  }

  // Immutable Audit Record
  recordAuditLog({
    actor: user,
    action: 'AI_ACTION_EXECUTED_SAFELY',
    resource: 'ACTION_EXECUTION_GATEWAY',
    targetId: proposal.id,
    plantId: proposal.plantId,
    statusBefore: { status: 'APPROVED' },
    statusAfter: { status: 'COMPLETED', result: proposal.executionResult },
    payload: { actionType: proposal.actionType, payload: proposal.actionPayload, verificationMode }
  });

  res.json({
    success: true,
    message: `Action '${proposal.actionType}' executed and verified successfully.`,
    proposal,
    executionResult: proposal.executionResult
  });
});

// -------------------------------------------------------------------------
// 4.6. ALERT INTELLIGENCE CENTER (GROUPING, SEVERITY, SLA & AUTO-ESCALATION)
// -------------------------------------------------------------------------

controlTowerRouter.get('/alerts', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { status, severity, plant } = req.query;
  let items = [...ALERTS_DB];

  if (status && status !== 'ALL') {
    items = items.filter(a => a.status.toLowerCase() === (status as string).toLowerCase());
  }
  if (severity && severity !== 'ALL') {
    items = items.filter(a => a.severity.toLowerCase() === (severity as string).toLowerCase());
  }
  if (plant && plant !== 'ALL') {
    items = items.filter(a => a.plantId.toUpperCase() === (plant as string).toUpperCase());
  }

  res.json({
    total: items.length,
    timestamp: new Date().toISOString(),
    alerts: items
  });
});

// Check and trigger auto-escalations for alerts past SLA
controlTowerRouter.post('/alerts/check-escalations', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const now = Date.now();
  let escalatedCount = 0;

  ALERTS_DB = ALERTS_DB.map(alert => {
    if (alert.status === 'ACTIVE') {
      const elapsedMinutes = (now - new Date(alert.createdAt).getTime()) / 60000;
      if (elapsedMinutes > alert.slaMinutes && !alert.isEscalated) {
        escalatedCount++;
        return {
          ...alert,
          isEscalated: true,
          escalatedAt: new Date().toISOString(),
          escalationLevel: alert.escalationLevel + 1,
          severity: alert.severity === 'HIGH_P2' ? 'CRITICAL_P1' : alert.severity,
          description: `${alert.description} [TỰ ĐỘNG LÊN CẤP CẢNH BÁO: Quá hạn SLA ${alert.slaMinutes}m chưa được xử lý]`
        };
      }
    }
    return alert;
  });

  res.json({
    checkedAt: new Date().toISOString(),
    escalatedCount,
    activeAlerts: ALERTS_DB.filter(a => a.status === 'ACTIVE')
  });
});

controlTowerRouter.post('/alerts/:id/acknowledge', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const alertId = req.params.id;
  const alert = ALERTS_DB.find(a => a.id === alertId);
  if (!alert) {
    res.status(404).json({ error: 'ALERT_NOT_FOUND', message: `Alert '${alertId}' not found.` });
    return;
  }

  alert.status = 'ACKNOWLEDGED';
  alert.acknowledgedBy = req.user!.fullName;

  recordAuditLog({
    actor: req.user!,
    action: 'ALERT_ACKNOWLEDGED',
    resource: 'ALERT_INTELLIGENCE_CENTER',
    targetId: alert.id,
    plantId: alert.plantId,
    payload: { alertTitle: alert.title }
  });

  res.json({ message: `Alert '${alertId}' acknowledged.`, alert });
});

// -------------------------------------------------------------------------
// 4.7. FEEDBACK & CONTINUOUS IMPROVEMENT (METRICS)
// -------------------------------------------------------------------------

controlTowerRouter.get('/feedback/metrics', authMiddleware, (_req: AuthenticatedRequest, res: Response) => {
  const total = FEEDBACK_DB.length;
  const accurate = FEEDBACK_DB.filter(f => f.feedbackType === 'ACCEPTED_ACCURATE').length;
  const falsePositives = FEEDBACK_DB.filter(f => f.feedbackType === 'FALSE_POSITIVE').length;
  const modified = FEEDBACK_DB.filter(f => f.feedbackType === 'MODIFIED_BY_OPERATOR').length;
  const rejected = FEEDBACK_DB.filter(f => f.feedbackType === 'REJECTED_UNSAFE').length;

  const avgRating = total > 0 ? (FEEDBACK_DB.reduce((sum, f) => sum + f.rating, 0) / total).toFixed(2) : '4.85';
  const acceptanceRatePct = total > 0 ? Number(((accurate / total) * 100).toFixed(1)) : 94.8;
  const falsePositiveRatePct = total > 0 ? Number(((falsePositives / total) * 100).toFixed(1)) : 5.2;

  res.json({
    totalFeedback: total,
    avgRating: Number(avgRating),
    acceptanceRatePct,
    falsePositiveRatePct,
    breakdown: {
      acceptedAccurate: accurate,
      falsePositives,
      modifiedByOperator: modified,
      rejectedUnsafe: rejected
    },
    calibration: {
      brierScore: 0.042, // Lower is better (<0.1 is world-class)
      expectedCalibrationErrorPct: 3.2,
      modelDriftStatus: 'STABLE_OPTIMAL'
    },
    recentFeedbacks: FEEDBACK_DB.slice(-10)
  });
});

controlTowerRouter.post('/feedback', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { recommendationId, rating, feedbackType, comment } = req.body;
  const user = req.user!;

  if (!recommendationId || !feedbackType) {
    res.status(400).json({ error: 'INVALID_FEEDBACK', message: 'recommendationId and feedbackType are required.' });
    return;
  }

  const feedback: FeedbackItem = {
    id: `FDB-${Date.now()}-${Math.floor(Math.random() * 100)}`,
    recommendationId,
    userId: user.id,
    userName: user.fullName,
    userRole: user.role,
    rating: Number(rating) || 5,
    feedbackType,
    comment: comment || '',
    createdAt: new Date().toISOString()
  };

  FEEDBACK_DB.push(feedback);

  recordAuditLog({
    actor: user,
    action: 'AI_FEEDBACK_SUBMITTED',
    resource: 'FEEDBACK_ENGINE',
    targetId: recommendationId,
    payload: { feedbackType, rating, comment }
  });

  res.json({
    message: 'User feedback logged successfully. Thank you for contributing to AI calibration.',
    feedback
  });
});
