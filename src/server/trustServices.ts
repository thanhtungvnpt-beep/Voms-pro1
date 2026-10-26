import { Request, Response, NextFunction, Router } from 'express';
import crypto from 'crypto';

// =========================================================================
// 1. ROLES & MODELS
// =========================================================================

export type UserRole = 
  | 'SYSTEM_ADMIN'
  | 'MANAGEMENT'
  | 'OUTSOURCING_GROUP'
  | 'VENDOR_MANAGER'
  | 'QC'
  | 'QUALITY_CONTROL'
  | 'EQUIPMENT_TECHNICIAN'
  | 'EQUIPMENT_ENGINEER'
  | 'DATA_OPERATOR'
  | 'AUDITOR'
  | 'AI_AUDITOR'
  | 'PRODUCTION_PLANNER'
  | 'APPROVER';

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  plantId: string | null; // null for multi-plant roles, plant code for localized vendor roles
  isActive: boolean;
}

export interface AuditLogEntry {
  eventId: string;
  correlationId: string;
  timestampUtc: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  plantId: string | null;
  action: string;
  resource: string;
  targetId: string;
  statusBefore: any;
  statusAfter: any;
  payload: any;
  ipAddress: string;
  integrityHash: string;
  isVerified: boolean;
}

export type ApprovalStatus = 
  | 'DRAFT'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXECUTING'
  | 'COMPLETED'
  | 'FAILED';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL_P1';

export interface ApprovalRequest {
  approvalId: string;
  title: string;
  module: string;
  plantId: string;
  actionType: string;
  riskLevel: RiskLevel;
  status: ApprovalStatus;
  requestedBy: string;
  requestedByName: string;
  requestedByRole: UserRole;
  approverId: string | null;
  approverName: string | null;
  approverRole: UserRole | null;
  decisionReason: string | null;
  rollbackPlan: string;
  payload: any;
  resultSummary?: any;
  createdAt: string;
  decidedAt: string | null;
  executedAt: string | null;
}

export interface DataTrustSource {
  sourceId: string;
  sourceName: string;
  sourceType: string;
  plantId: string;
  connectionStatus: 'ONLINE' | 'DEGRADED' | 'DISCONNECTED';
  syncMode: 'DEMO_MOCK' | 'PRODUCTION_LIVE';
  isDemoMode: boolean;
  trustScorePct: number;
  lastSyncTime: string;
  avgLatencyMs: number;
}

export interface DataTrustIssue {
  issueId: string;
  sourceId: string;
  plantId: string;
  ruleCode: string;
  entityType: string;
  entityId: string;
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  description: string;
  detectedAt: string;
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'IGNORED';
  resolvedAt?: string | null;
  resolvedBy?: string | null;
  resolutionNote?: string | null;
}

export interface DataTrustImportRun {
  runId: string;
  sourceId: string;
  plantId: string;
  batchName: string;
  totalRecords: number;
  validRecords: number;
  errorRecords: number;
  durationMs: number;
  status: 'COMPLETED' | 'FAILED' | 'PARTIAL';
  isDemoRun: boolean;
  executedBy: string;
  createdAt: string;
}

// Extend Express Request
export interface AuthenticatedRequest extends Request {
  user?: User;
  correlationId?: string;
}

// =========================================================================
// 2. SEED USERS & TOKENS (8 TARGET ROLES)
// =========================================================================

export const SEED_USERS: Record<string, { user: User; token: string }> = {
  admin: {
    user: {
      id: 'USR-SYS-01',
      username: 'admin_master',
      email: 'admin@voms.vnpt.internal',
      fullName: 'Ngô Thanh Tùng (Chief Architect / System Admin)',
      role: 'SYSTEM_ADMIN',
      plantId: null,
      isActive: true,
    },
    token: 'token_admin_super_secret_9981'
  },
  management: {
    user: {
      id: 'USR-MGMT-02',
      username: 'mgmt_director',
      email: 'director@voms.vnpt.internal',
      fullName: 'Phạm Hồng Quân (Giám đốc Khối Sản xuất)',
      role: 'MANAGEMENT',
      plantId: null,
      isActive: true,
    },
    token: 'token_mgmt_lead_access_5521'
  },
  outsourcing: {
    user: {
      id: 'USR-OUT-03',
      username: 'outsourcing_lead',
      email: 'outsourcing@voms.vnpt.internal',
      fullName: 'Trần Minh Đức (Trưởng ban Thuê ngoài & Vệ tinh)',
      role: 'OUTSOURCING_GROUP',
      plantId: null,
      isActive: true,
    },
    token: 'token_outsourcing_token_7719'
  },
  vendor_daal: {
    user: {
      id: 'USR-VEND-DAAL',
      username: 'vendor_daal_mgr',
      email: 'plant.mgr@daal.com.vn',
      fullName: 'Lê Hoàng Nam (Nhà máy trưởng DAAL Hải Phòng)',
      role: 'VENDOR_MANAGER',
      plantId: 'DAAL', // Restricted strictly to DAAL
      isActive: true,
    },
    token: 'token_vendor_daal_isolated_4401'
  },
  vendor_ktech: {
    user: {
      id: 'USR-VEND-KTECH',
      username: 'vendor_ktech_mgr',
      email: 'mgr@ktech.com.vn',
      fullName: 'Kim Jin-Woo (Nhà máy trưởng KTECH Thái Nguyên)',
      role: 'VENDOR_MANAGER',
      plantId: 'KTECH', // Restricted strictly to KTECH
      isActive: true,
    },
    token: 'token_vendor_ktech_isolated_8820'
  },
  qc: {
    user: {
      id: 'USR-QC-05',
      username: 'qc_lead',
      email: 'qc.lead@voms.vnpt.internal',
      fullName: 'Đỗ Thùy Trang (Trưởng phòng Quản lý Chất lượng OQC)',
      role: 'QC',
      plantId: null,
      isActive: true,
    },
    token: 'token_qc_inspector_6633'
  },
  technician: {
    user: {
      id: 'USR-TECH-06',
      username: 'tech_spindle',
      email: 'maint.tech@voms.vnpt.internal',
      fullName: 'Hoàng Quốc Việt (Kỹ sư Bảo trì Cơ khí & Spindle)',
      role: 'EQUIPMENT_TECHNICIAN',
      plantId: null,
      isActive: true,
    },
    token: 'token_technician_service_2290'
  },
  operator: {
    user: {
      id: 'USR-OP-07',
      username: 'operator_daal',
      email: 'line.op@daal.com.vn',
      fullName: 'Nguyễn Văn Đạt (Kỹ thuật viên Nhập liệu Kho DAAL)',
      role: 'DATA_OPERATOR',
      plantId: 'DAAL',
      isActive: true,
    },
    token: 'token_operator_entry_1109'
  },
  auditor: {
    user: {
      id: 'USR-AUDIT-08',
      username: 'auditor_iso',
      email: 'compliance@tuv-nord.org',
      fullName: 'Vũ Đức Thành (Đánh giá viên Trưởng ISO 9001 / IATF)',
      role: 'AUDITOR',
      plantId: null,
      isActive: true,
    },
    token: 'token_auditor_readonly_9900'
  },
  planner: {
    user: {
      id: 'USR-PLAN-09',
      username: 'prod_planner_chief',
      email: 'planner@voms.vnpt.internal',
      fullName: 'Nguyễn Văn Phúc (Chuyên viên Điều độ Kế hoạch Sản xuất)',
      role: 'PRODUCTION_PLANNER',
      plantId: null,
      isActive: true,
    },
    token: 'token_planner_master_3311'
  },
  approver: {
    user: {
      id: 'USR-APPR-10',
      username: 'approver_board',
      email: 'chief.approver@voms.vnpt.internal',
      fullName: 'Trịnh Quốc Thắng (Thành viên Hội đồng Phê duyệt Sản xuất)',
      role: 'APPROVER',
      plantId: null,
      isActive: true,
    },
    token: 'token_approver_board_7788'
  },
  ai_auditor: {
    user: {
      id: 'USR-AIAUDIT-11',
      username: 'ai_governance_auditor',
      email: 'ai.safety@voms.vnpt.internal',
      fullName: 'Dr. Lê Hoàng Long (Chuyên gia Độc lập Kiểm toán AI Governance)',
      role: 'AI_AUDITOR',
      plantId: null,
      isActive: true,
    },
    token: 'token_ai_auditor_guard_5544'
  }
};

// Map token to user
const TOKEN_USER_MAP: Map<string, User> = new Map();
Object.values(SEED_USERS).forEach(entry => {
  TOKEN_USER_MAP.set(entry.token, entry.user);
});

// =========================================================================
// 3. IN-MEMORY STATE STORE
// =========================================================================

export let AUDIT_LOGS_DB: AuditLogEntry[] = [
  {
    eventId: 'EVT-INIT-001',
    correlationId: 'CORR-SYS-BOOT',
    timestampUtc: new Date(Date.now() - 3600000 * 4).toISOString(),
    actorId: 'USR-SYS-01',
    actorName: 'Ngô Thanh Tùng (Chief Architect)',
    actorRole: 'SYSTEM_ADMIN',
    plantId: null,
    action: 'SYSTEM_BOOT',
    resource: 'TRUST_FOUNDATION',
    targetId: 'NODE-CLUSTER-01',
    statusBefore: { status: 'OFFLINE' },
    statusAfter: { status: 'ONLINE', isolationEnforced: true },
    payload: { config: 'VOMS_PHASE1_STRICT' },
    ipAddress: '127.0.0.1',
    integrityHash: '8b7f3d5e2a1c098e7d6b5a4c3f2e1d0c',
    isVerified: true
  },
  {
    eventId: 'EVT-DATA-002',
    correlationId: 'CORR-IMPORT-002',
    timestampUtc: new Date(Date.now() - 3600000 * 2).toISOString(),
    actorId: 'USR-OUT-03',
    actorName: 'Trần Minh Đức (Trưởng ban Thuê ngoài)',
    actorRole: 'OUTSOURCING_GROUP',
    plantId: 'DAAL',
    action: 'AUDIT_DISCREPANCY_FLAGGED',
    resource: 'MATERIAL_INVENTORY',
    targetId: 'SKU-A980',
    statusBefore: { balanceExpected: 18000 },
    statusAfter: { balanceActual: 8600, deficit: 9400 },
    payload: { alert: 'P1 Outage detected' },
    ipAddress: '192.168.1.45',
    integrityHash: 'f4e3d2c1b0a99887766554433221100f',
    isVerified: true
  }
];
export { AUDIT_LOGS_DB as auditLogs };

let APPROVAL_REQUESTS_DB: ApprovalRequest[] = [
  {
    approvalId: 'APR-2026-001',
    title: 'Điều động 5,600kg phôi nhôm A980 từ Hub A01 sang DAAL (Giải cứu đơn TO-3011)',
    module: 'MATERIAL_WAREHOUSE',
    plantId: 'DAAL',
    actionType: 'DISPATCH_MATERIAL_EMERGENCY',
    riskLevel: 'CRITICAL_P1',
    status: 'SUBMITTED',
    requestedBy: 'USR-VEND-DAAL',
    requestedByName: 'Lê Hoàng Nam (Nhà máy trưởng DAAL)',
    requestedByRole: 'VENDOR_MANAGER',
    approverId: null,
    approverName: null,
    approverRole: null,
    decisionReason: null,
    rollbackPlan: 'Hủy điều phối xe tải TK-77; hoàn kho A01 trong vòng 60 phút nếu phát hiện sai quy cách phôi.',
    payload: {
      sourceHub: 'Kho Hub A01 (Bắc Ninh)',
      targetPlant: 'DAAL Precision (Hải Phòng)',
      materialCode: 'ALU-A980-BILLET',
      quantityKg: 5600,
      transportPriority: 'HIGH_URGENT'
    },
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    decidedAt: null,
    executedAt: null
  },
  {
    approvalId: 'APR-2026-002',
    title: 'Thay dao phay trục Spindle 04 & Hiệu chỉnh độ rung 1.15G máy CNC-K4',
    module: 'EQUIPMENT_OEE',
    plantId: 'KTECH',
    actionType: 'MAINTENANCE_OVERRIDE',
    riskLevel: 'HIGH',
    status: 'SUBMITTED',
    requestedBy: 'USR-TECH-06',
    requestedByName: 'Hoàng Quốc Việt (Kỹ sư Bảo trì)',
    requestedByRole: 'EQUIPMENT_TECHNICIAN',
    approverId: null,
    approverName: null,
    approverRole: null,
    decisionReason: null,
    rollbackPlan: 'Đảo tải sản xuất sang máy CNC-K2 dự phòng nếu dao phay thay thế không đạt chuẩn rung sai số < 1.2G.',
    payload: {
      plantId: 'KTECH',
      machineId: 'CNC-SPINDLE-04',
      toolingCode: 'TOOL-TIALN-R4',
      targetVibrationG: 1.15
    },
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    decidedAt: null,
    executedAt: null
  }
];

let DATA_TRUST_SOURCES_DB: DataTrustSource[] = [
  {
    sourceId: 'SRC-SAP-ERP',
    sourceName: 'Hệ thống SAP ERP Trung tâm (Hub A01)',
    sourceType: 'SAP_ERP',
    plantId: 'KHV',
    connectionStatus: 'ONLINE',
    syncMode: 'DEMO_MOCK',
    isDemoMode: true,
    trustScorePct: 98.4,
    lastSyncTime: new Date(Date.now() - 15000).toISOString(),
    avgLatencyMs: 8.2
  },
  {
    sourceId: 'SRC-MES-DAAL',
    sourceName: 'Siemens MES Cổng chuyền dập DAAL',
    sourceType: 'MES_SIEMENS',
    plantId: 'DAAL',
    connectionStatus: 'DEGRADED',
    syncMode: 'DEMO_MOCK',
    isDemoMode: true,
    trustScorePct: 82.5,
    lastSyncTime: new Date(Date.now() - 45000).toISOString(),
    avgLatencyMs: 34.6
  },
  {
    sourceId: 'SRC-IOT-KTECH',
    sourceName: 'Cảm biến rung IoT MQTT Trục Spindle KTECH',
    sourceType: 'IOT_MQTT',
    plantId: 'KTECH',
    connectionStatus: 'ONLINE',
    syncMode: 'DEMO_MOCK',
    isDemoMode: true,
    trustScorePct: 94.0,
    lastSyncTime: new Date(Date.now() - 5000).toISOString(),
    avgLatencyMs: 4.8
  },
  {
    sourceId: 'SRC-SCANNER-HSTEC',
    sourceName: 'Máy quét cầm tay PDA Barcode Chuyền SMT HSTEC',
    sourceType: 'HANDHELD_SCANNER',
    plantId: 'HSTEC',
    connectionStatus: 'ONLINE',
    syncMode: 'DEMO_MOCK',
    isDemoMode: true,
    trustScorePct: 96.8,
    lastSyncTime: new Date(Date.now() - 12000).toISOString(),
    avgLatencyMs: 11.2
  },
  {
    sourceId: 'SRC-EDI-DREAMTECH',
    sourceName: 'Cổng trao đổi dữ liệu Vendor EDI DREAM TECH',
    sourceType: 'EDI_VENDOR',
    plantId: 'DREAM_TECH',
    connectionStatus: 'ONLINE',
    syncMode: 'DEMO_MOCK',
    isDemoMode: true,
    trustScorePct: 99.1,
    lastSyncTime: new Date(Date.now() - 25000).toISOString(),
    avgLatencyMs: 9.1
  },
  {
    sourceId: 'SRC-QC-HOJEONG-B',
    sourceName: 'Máy soi lỗi tự động AOI & Laser HOJEONGB',
    sourceType: 'AOI_OPTICAL',
    plantId: 'HOJEONGB',
    connectionStatus: 'ONLINE',
    syncMode: 'DEMO_MOCK',
    isDemoMode: true,
    trustScorePct: 97.5,
    lastSyncTime: new Date(Date.now() - 8000).toISOString(),
    avgLatencyMs: 6.4
  },
  {
    sourceId: 'SRC-LASER-HOJEONG-VINA',
    sourceName: 'Bộ điều khiển Laser CNC HOJEONG VINA',
    sourceType: 'LASER_CONTROLLER',
    plantId: 'HOJEONG_VINA',
    connectionStatus: 'ONLINE',
    syncMode: 'DEMO_MOCK',
    isDemoMode: true,
    trustScorePct: 91.2,
    lastSyncTime: new Date(Date.now() - 20000).toISOString(),
    avgLatencyMs: 14.5
  }
];

let DATA_TRUST_ISSUES_DB: DataTrustIssue[] = [
  {
    issueId: 'ISSUE-2026-01',
    sourceId: 'SRC-MES-DAAL',
    plantId: 'DAAL',
    ruleCode: 'SCHEMA_VIOLATION_MISSING_FIELD',
    entityType: 'LOT_RECORD',
    entityId: 'LOT-DAAL-9981-ALU',
    severity: 'ERROR',
    description: 'Bản ghi sản xuất thiếu trường bắt buộc `lot_origin_certificate` và `supplier_heat_no`. Dữ liệu bị từ chối cập nhật tự động vào OTD.',
    detectedAt: new Date(Date.now() - 1200000).toISOString(),
    status: 'OPEN'
  },
  {
    issueId: 'ISSUE-2026-02',
    sourceId: 'SRC-MES-DAAL',
    plantId: 'DAAL',
    ruleCode: 'OUT_OF_BOUNDS_VALUE',
    entityType: 'TELEMETRY_RECORD',
    entityId: 'PRESS-CYCLE-02',
    severity: 'WARNING',
    description: 'Áp suất ép dập đo được 245.8 Bar (Vượt ngưỡng kiểm soát UCL=220 Bar). Cảnh báo nguy cơ nứt phôi.',
    detectedAt: new Date(Date.now() - 3600000).toISOString(),
    status: 'INVESTIGATING'
  },
  {
    issueId: 'ISSUE-2026-03',
    sourceId: 'SRC-IOT-KTECH',
    plantId: 'KTECH',
    ruleCode: 'TIMESTAMP_DRIFT',
    entityType: 'SENSOR_RECORD',
    entityId: 'VIB-SPINDLE-04',
    severity: 'WARNING',
    description: 'Độ lệch đồng hồ NTP của gateway IoT KTECH lệch +4.8 giây so với máy chủ chuẩn VOMS.',
    detectedAt: new Date(Date.now() - 7200000).toISOString(),
    status: 'OPEN'
  },
  {
    issueId: 'ISSUE-2026-04',
    sourceId: 'SRC-SCANNER-HSTEC',
    plantId: 'HSTEC',
    ruleCode: 'DUPLICATE_BARCODE_SCAN',
    entityType: 'SCAN_EVENT',
    entityId: 'BC-SMT-44021',
    severity: 'INFO',
    description: 'Mã vạch bảng mạch SMT quét lặp 2 lần trong vòng 800ms bởi công nhân số 12. Hệ thống tự động loại trừ trùng lặp.',
    detectedAt: new Date(Date.now() - 900000).toISOString(),
    status: 'RESOLVED',
    resolvedAt: new Date(Date.now() - 600000).toISOString(),
    resolvedBy: 'USR-QC-05',
    resolutionNote: 'Đã tự động dedup bởi deduplication filter pipeline.'
  }
];

let DATA_TRUST_RUNS_DB: DataTrustImportRun[] = [
  {
    runId: 'RUN-2026-088',
    sourceId: 'SRC-SAP-ERP',
    plantId: 'KHV',
    batchName: 'ERP_TRANSFER_ORDERS_CA1',
    totalRecords: 1420,
    validRecords: 1419,
    errorRecords: 1,
    durationMs: 312,
    status: 'COMPLETED',
    isDemoRun: true,
    executedBy: 'USR-SYS-01',
    createdAt: new Date(Date.now() - 1800000).toISOString()
  },
  {
    runId: 'RUN-2026-087',
    sourceId: 'SRC-MES-DAAL',
    plantId: 'DAAL',
    batchName: 'DAAL_ALUMINUM_PRESS_TELEMETRY',
    totalRecords: 860,
    validRecords: 835,
    errorRecords: 25,
    durationMs: 840,
    status: 'PARTIAL',
    isDemoRun: true,
    executedBy: 'USR-VEND-DAAL',
    createdAt: new Date(Date.now() - 3600000).toISOString()
  }
];

// =========================================================================
// 4. AUDIT TRAIL LOGGING HELPER
// =========================================================================

export function calculateHash(entry: Partial<AuditLogEntry>): string {
  const content = `${entry.eventId}|${entry.correlationId}|${entry.timestampUtc}|${entry.actorId}|${entry.action}|${entry.resource}|${JSON.stringify(entry.payload)}`;
  return crypto.createHash('sha256').update(content).digest('hex').substring(0, 32);
}

export function recordAuditLog(params: {
  actor: User;
  action: string;
  resource: string;
  targetId: string;
  plantId?: string | null;
  statusBefore?: any;
  statusAfter?: any;
  payload?: any;
  correlationId?: string;
  ipAddress?: string;
}): AuditLogEntry {
  const eventId = `EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const correlationId = params.correlationId || `CORR-${Date.now()}`;
  const timestampUtc = new Date().toISOString();

  const entry: AuditLogEntry = {
    eventId,
    correlationId,
    timestampUtc,
    actorId: params.actor.id,
    actorName: params.actor.fullName,
    actorRole: params.actor.role,
    plantId: params.plantId ?? params.actor.plantId ?? null,
    action: params.action,
    resource: params.resource,
    targetId: params.targetId,
    statusBefore: params.statusBefore ?? null,
    statusAfter: params.statusAfter ?? null,
    payload: params.payload ?? null,
    ipAddress: params.ipAddress || '127.0.0.1',
    integrityHash: '',
    isVerified: true
  };

  entry.integrityHash = calculateHash(entry);
  AUDIT_LOGS_DB.unshift(entry); // prepend to top
  return entry;
}

// =========================================================================
// 5. AUTHENTICATION & ACCESS CONTROL MIDDLEWARE
// =========================================================================

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Missing or invalid Bearer token. Please provide Authorization: Bearer <token>'
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  const user = TOKEN_USER_MAP.get(token);

  if (!user) {
    res.status(401).json({
      error: 'INVALID_TOKEN',
      message: 'The token provided is expired or unrecognized.'
    });
    return;
  }

  if (!user.isActive) {
    res.status(403).json({
      error: 'USER_DEACTIVATED',
      message: 'User account is deactivated.'
    });
    return;
  }

  req.user = user;
  req.correlationId = (req.headers['x-correlation-id'] as string) || `CORR-${Date.now()}`;
  next();
}

export function requireRoles(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'UNAUTHORIZED' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: 'FORBIDDEN_ROLE',
        message: `Role '${req.user.role}' is not authorized to access this resource. Required: ${allowedRoles.join(', ')}`,
        currentRole: req.user.role,
        allowedRoles
      });
      return;
    }

    next();
  };
}

export function enforceVendorIsolation(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'UNAUTHORIZED' });
    return;
  }

  // Multi-plant roles can view/manage across all 7 plants
  const multiPlantRoles: UserRole[] = [
    'SYSTEM_ADMIN', 'MANAGEMENT', 'OUTSOURCING_GROUP', 
    'AUDITOR', 'AI_AUDITOR', 'QC', 'QUALITY_CONTROL', 
    'PRODUCTION_PLANNER', 'APPROVER', 'EQUIPMENT_ENGINEER', 'EQUIPMENT_TECHNICIAN'
  ];
  if (multiPlantRoles.includes(req.user.role)) {
    next();
    return;
  }

  // Plant-specific roles must match the plant_id in params, query, or body
  const targetPlant = (
    req.params.plant_id || 
    req.params.plantId || 
    req.query.plant_id || 
    req.query.plantId || 
    req.body?.plantId || 
    req.body?.plant_id || 
    req.body?.targetPlant || 
    req.body?.target_plant
  ) as string;

  if (targetPlant && req.user.plantId && targetPlant.toUpperCase() !== req.user.plantId.toUpperCase()) {
    res.status(403).json({
      error: 'CROSS_VENDOR_ACCESS_DENIED',
      message: `Data Isolation Breach: User from '${req.user.plantId}' cannot access data belonging to '${targetPlant}'.`,
      userPlant: req.user.plantId,
      attemptedPlant: targetPlant
    });
    return;
  }

  next();
}

// =========================================================================
// 6. ROUTER EXPORTS
// =========================================================================

export const trustRouter = Router();

// --- Auth Endpoints ---

// List all switchable roles with tokens for testing/demo
trustRouter.get('/auth/available-profiles', (_req: Request, res: Response) => {
  res.json({
    description: "VOMS PRO Phase 1 — Trust Foundation Auth Profiles (8 Target Roles)",
    profiles: Object.entries(SEED_USERS).map(([key, item]) => ({
      profileKey: key,
      user: item.user,
      token: item.token
    }))
  });
});

// Current User Profile
trustRouter.get('/auth/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    user: req.user,
    sessionValidUntil: new Date(Date.now() + 86400000).toISOString()
  });
});

// --- Audit Trail Endpoints ---

// Query Audit Logs
trustRouter.get('/audit/logs', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { plantId, actorRole, action, search, limit = 50 } = req.query;

  let results = [...AUDIT_LOGS_DB];

  // If vendor role, enforce plant filter
  if (req.user && !['SYSTEM_ADMIN', 'MANAGEMENT', 'OUTSOURCING_GROUP', 'AUDITOR'].includes(req.user.role)) {
    if (req.user.plantId) {
      results = results.filter(l => !l.plantId || l.plantId === req.user?.plantId);
    }
  } else if (plantId && plantId !== 'all') {
    results = results.filter(l => l.plantId === plantId);
  }

  if (actorRole && actorRole !== 'all') {
    results = results.filter(l => l.actorRole === actorRole);
  }

  if (action && action !== 'all') {
    results = results.filter(l => l.action.toLowerCase().includes(String(action).toLowerCase()));
  }

  if (search) {
    const q = String(search).toLowerCase();
    results = results.filter(l => 
      l.eventId.toLowerCase().includes(q) ||
      l.correlationId.toLowerCase().includes(q) ||
      l.actorName.toLowerCase().includes(q) ||
      l.targetId.toLowerCase().includes(q) ||
      l.action.toLowerCase().includes(q)
    );
  }

  res.json({
    totalCount: results.length,
    returnedCount: Math.min(Number(limit), results.length),
    logs: results.slice(0, Number(limit))
  });
});

// Verify Audit Log Integrity
trustRouter.get('/audit/verify/:eventId', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const log = AUDIT_LOGS_DB.find(l => l.eventId === req.params.eventId);
  if (!log) {
    res.status(404).json({ error: 'Audit log entry not found.' });
    return;
  }

  const expectedHash = calculateHash(log);
  const isValid = expectedHash === log.integrityHash;

  res.json({
    eventId: log.eventId,
    storedHash: log.integrityHash,
    calculatedHash: expectedHash,
    isValid,
    timestamp: log.timestampUtc,
    actor: log.actorName
  });
});

// --- Human-in-the-Loop Approval Endpoints ---

// List Approvals
trustRouter.get('/approvals', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { status, plantId } = req.query;
  let list = [...APPROVAL_REQUESTS_DB];

  // Plant isolation
  if (req.user && !['SYSTEM_ADMIN', 'MANAGEMENT', 'OUTSOURCING_GROUP', 'AUDITOR'].includes(req.user.role)) {
    if (req.user.plantId) {
      list = list.filter(a => a.plantId === req.user?.plantId);
    }
  } else if (plantId && plantId !== 'all') {
    list = list.filter(a => a.plantId === plantId);
  }

  if (status && status !== 'all') {
    list = list.filter(a => a.status === status);
  }

  res.json({
    total: list.length,
    approvals: list
  });
});

// Create Approval Request (DRAFT or SUBMITTED)
trustRouter.post('/approvals', authMiddleware, enforceVendorIsolation, (req: AuthenticatedRequest, res: Response) => {
  const { title, module, plantId, actionType, riskLevel = 'MEDIUM', rollbackPlan, payload } = req.body;

  if (!title || !module || !plantId || !actionType || !rollbackPlan) {
    res.status(400).json({
      error: 'VALIDATION_FAILED',
      message: 'Missing required fields: title, module, plantId, actionType, rollbackPlan.'
    });
    return;
  }

  const user = req.user!;
  const approvalId = `APR-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

  const newApproval: ApprovalRequest = {
    approvalId,
    title,
    module,
    plantId,
    actionType,
    riskLevel: riskLevel as RiskLevel,
    status: 'SUBMITTED',
    requestedBy: user.id,
    requestedByName: user.fullName,
    requestedByRole: user.role,
    approverId: null,
    approverName: null,
    approverRole: null,
    decisionReason: null,
    rollbackPlan,
    payload: payload || {},
    createdAt: new Date().toISOString(),
    decidedAt: null,
    executedAt: null
  };

  APPROVAL_REQUESTS_DB.unshift(newApproval);

  recordAuditLog({
    actor: user,
    action: 'APPROVAL_SUBMITTED',
    resource: 'APPROVAL_WORKFLOW',
    targetId: approvalId,
    plantId,
    statusBefore: null,
    statusAfter: { status: 'SUBMITTED' },
    payload: { title, riskLevel, actionType },
    correlationId: req.correlationId
  });

  res.status(201).json({
    status: 'SUCCESS',
    approval: newApproval
  });
});

// Approve or Reject an Approval Request
trustRouter.post('/approvals/:approvalId/decision', authMiddleware, requireRoles(['SYSTEM_ADMIN', 'MANAGEMENT', 'OUTSOURCING_GROUP']), (req: AuthenticatedRequest, res: Response) => {
  const { approvalId } = req.params;
  const { decision, reason } = req.body; // decision: 'APPROVE' | 'REJECT'

  const user = req.user!;
  const approval = APPROVAL_REQUESTS_DB.find(a => a.approvalId === approvalId);

  if (!approval) {
    res.status(404).json({ error: 'APPROVAL_NOT_FOUND', message: `Approval ${approvalId} does not exist.` });
    return;
  }

  if (approval.status !== 'SUBMITTED') {
    res.status(400).json({
      error: 'INVALID_STATE_TRANSITION',
      message: `Cannot decide approval currently in '${approval.status}' status. Only 'SUBMITTED' requests can be decided.`
    });
    return;
  }

  // CRITICAL CONSTRAINT: Creator cannot self-approve
  if (decision === 'APPROVE' && approval.requestedBy === user.id) {
    res.status(403).json({
      error: 'SELF_APPROVAL_FORBIDDEN',
      message: 'Human-in-the-Loop Governance Violation: The creator of an action cannot approve their own request.'
    });
    return;
  }

  const previousStatus = approval.status;
  const newStatus: ApprovalStatus = decision === 'APPROVE' ? 'APPROVED' : 'REJECTED';

  approval.status = newStatus;
  approval.approverId = user.id;
  approval.approverName = user.fullName;
  approval.approverRole = user.role;
  approval.decisionReason = reason || (decision === 'APPROVE' ? 'Approved after cross-check.' : 'Rejected per policy.');
  approval.decidedAt = new Date().toISOString();

  recordAuditLog({
    actor: user,
    action: decision === 'APPROVE' ? 'APPROVAL_GRANTED' : 'APPROVAL_REJECTED',
    resource: 'APPROVAL_WORKFLOW',
    targetId: approvalId,
    plantId: approval.plantId,
    statusBefore: { status: previousStatus },
    statusAfter: { status: newStatus, decidedBy: user.id },
    payload: { decision, reason: approval.decisionReason },
    correlationId: req.correlationId
  });

  res.json({
    status: 'SUCCESS',
    message: `Approval ${approvalId} has been ${newStatus.toLowerCase()}.`,
    approval
  });
});

// Execute an Approved Action (Transits: APPROVED -> EXECUTING -> COMPLETED)
trustRouter.post('/approvals/:approvalId/execute', authMiddleware, requireRoles(['SYSTEM_ADMIN', 'MANAGEMENT', 'OUTSOURCING_GROUP', 'EQUIPMENT_TECHNICIAN']), (req: AuthenticatedRequest, res: Response) => {
  const { approvalId } = req.params;
  const user = req.user!;
  const approval = APPROVAL_REQUESTS_DB.find(a => a.approvalId === approvalId);

  if (!approval) {
    res.status(404).json({ error: 'Approval request not found.' });
    return;
  }

  if (approval.status !== 'APPROVED') {
    res.status(400).json({
      error: 'INVALID_STATE_TRANSITION',
      message: `Only requests with 'APPROVED' status can be executed. Current status: '${approval.status}'`
    });
    return;
  }

  approval.status = 'COMPLETED';
  approval.executedAt = new Date().toISOString();
  approval.resultSummary = {
    executedBy: user.fullName,
    executionTimeMs: 14.2,
    outcome: 'Dispatched and synchronized with Plant MES'
  };

  recordAuditLog({
    actor: user,
    action: 'ACTION_EXECUTED_POST_APPROVAL',
    resource: approval.module,
    targetId: approval.approvalId,
    plantId: approval.plantId,
    statusBefore: { status: 'APPROVED' },
    statusAfter: { status: 'COMPLETED' },
    payload: approval.payload,
    correlationId: req.correlationId
  });

  res.json({
    status: 'SUCCESS',
    message: `Action for ${approval.approvalId} executed successfully.`,
    approval
  });
});

// --- Data Trust Center Endpoints ---

// Overview metrics across 7 plants
trustRouter.get('/data-trust/overview', (_req: Request, res: Response) => {
  const totalSources = DATA_TRUST_SOURCES_DB.length;
  const onlineSources = DATA_TRUST_SOURCES_DB.filter(s => s.connectionStatus === 'ONLINE').length;
  const totalIssues = DATA_TRUST_ISSUES_DB.length;
  const openIssues = DATA_TRUST_ISSUES_DB.filter(i => i.status === 'OPEN' || i.status === 'INVESTIGATING').length;
  const criticalIssues = DATA_TRUST_ISSUES_DB.filter(i => i.severity === 'CRITICAL' || i.severity === 'ERROR').length;
  
  const avgTrustScore = Number(
    (DATA_TRUST_SOURCES_DB.reduce((sum, s) => sum + s.trustScorePct, 0) / totalSources).toFixed(1)
  );

  res.json({
    banner: "DEMO MODE — CHƯA KẾT NỐI DỮ LIỆU THỰC (DEMO MODE — NOT CONNECTED TO LIVE PRODUCTION DATABASE)",
    isDemoMode: true,
    trustIndexPct: avgTrustScore,
    completenessPct: 98.6,
    activeViolationsCount: openIssues,
    criticalViolationsCount: criticalIssues,
    freshnessSlaSeconds: 15,
    averageLatencyMs: 9.4,
    satellitePlantsCount: 7,
    sourcesOnline: `${onlineSources}/${totalSources}`,
    timestamp: new Date().toISOString()
  });
});

// Data Trust Sources Catalog
trustRouter.get('/data-trust/sources', (req: Request, res: Response) => {
  const { plantId } = req.query;
  let sources = [...DATA_TRUST_SOURCES_DB];
  if (plantId && plantId !== 'all') {
    sources = sources.filter(s => s.plantId === plantId);
  }
  res.json({
    total: sources.length,
    sources
  });
});

// Data Trust Issues Catalog
trustRouter.get('/data-trust/issues', (req: Request, res: Response) => {
  const { plantId, severity, status } = req.query;
  let issues = [...DATA_TRUST_ISSUES_DB];

  if (plantId && plantId !== 'all') {
    issues = issues.filter(i => i.plantId === plantId);
  }
  if (severity && severity !== 'all') {
    issues = issues.filter(i => i.severity === severity);
  }
  if (status && status !== 'all') {
    issues = issues.filter(i => i.status === status);
  }

  res.json({
    total: issues.length,
    issues
  });
});

// Update Issue Status (e.g., INVESTIGATING, RESOLVED, IGNORED)
trustRouter.patch('/data-trust/issues/:issueId', authMiddleware, requireRoles(['SYSTEM_ADMIN', 'MANAGEMENT', 'QC', 'OUTSOURCING_GROUP']), (req: AuthenticatedRequest, res: Response) => {
  const { issueId } = req.params;
  const { status, resolutionNote } = req.body;
  const user = req.user!;

  const issue = DATA_TRUST_ISSUES_DB.find(i => i.issueId === issueId);
  if (!issue) {
    res.status(404).json({ error: 'Issue not found.' });
    return;
  }

  const prevStatus = issue.status;
  issue.status = status;
  if (status === 'RESOLVED') {
    issue.resolvedAt = new Date().toISOString();
    issue.resolvedBy = user.id;
    issue.resolutionNote = resolutionNote || 'Đã xử lý và kiểm định lại schema.';
  }

  recordAuditLog({
    actor: user,
    action: 'DATA_TRUST_ISSUE_STATUS_CHANGED',
    resource: 'DATA_TRUST_GOVERNANCE',
    targetId: issueId,
    plantId: issue.plantId,
    statusBefore: { status: prevStatus },
    statusAfter: { status, resolutionNote: issue.resolutionNote },
    correlationId: req.correlationId
  });

  res.json({
    status: 'SUCCESS',
    issue
  });
});

// Real-Time Validation Engine: Validate Batch Payload against Phase 1 Schema Rules
trustRouter.post('/data-trust/validate', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { plantId, records } = req.body;

  if (!records || !Array.isArray(records)) {
    res.status(400).json({ error: 'Invalid payload. `records` must be an array.' });
    return;
  }

  const validationErrors: Array<{ index: number; rule: string; field: string; message: string }> = [];
  const seenIds = new Set<string>();

  records.forEach((rec, idx) => {
    // 1. Check required fields
    if (!rec.id) {
      validationErrors.push({ index: idx, rule: 'MISSING_REQUIRED_FIELD', field: 'id', message: 'Record ID is required.' });
    } else {
      if (seenIds.has(rec.id)) {
        validationErrors.push({ index: idx, rule: 'DUPLICATE_ID', field: 'id', message: `Duplicate ID '${rec.id}' detected in batch.` });
      }
      seenIds.add(rec.id);
    }

    if (!rec.plantId) {
      validationErrors.push({ index: idx, rule: 'MISSING_REQUIRED_FIELD', field: 'plantId', message: 'Target plantId is required.' });
    }

    if (rec.quantity !== undefined && (typeof rec.quantity !== 'number' || rec.quantity < 0)) {
      validationErrors.push({ index: idx, rule: 'OUT_OF_BOUNDS_VALUE', field: 'quantity', message: 'Quantity must be a positive number.' });
    }

    if (rec.timestamp && isNaN(Date.parse(rec.timestamp))) {
      validationErrors.push({ index: idx, rule: 'INVALID_TIMESTAMP_FORMAT', field: 'timestamp', message: 'Timestamp must be ISO 8601 compliant.' });
    }
  });

  const isValid = validationErrors.length === 0;

  res.json({
    isDemoMode: true,
    totalRecords: records.length,
    validRecords: records.length - validationErrors.length,
    errorCount: validationErrors.length,
    isValid,
    validationErrors,
    auditedAt: new Date().toISOString()
  });
});

// Data Import Runs History
trustRouter.get('/data-trust/import-runs', (_req: Request, res: Response) => {
  res.json({
    total: DATA_TRUST_RUNS_DB.length,
    runs: DATA_TRUST_RUNS_DB
  });
});
