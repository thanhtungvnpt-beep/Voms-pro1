import { Request, Response, NextFunction, Router } from 'express';
import crypto from 'crypto';
import { 
  User, 
  UserRole, 
  AuthenticatedRequest, 
  authMiddleware, 
  requireRoles, 
  recordAuditLog 
} from './trustServices';

export const automationRouter = Router();

// =========================================================================
// 1. DATA MODELS & ENUMS
// =========================================================================

export type IntegrationType = 
  | 'GMES_API'
  | 'INTERNAL_MES'
  | 'RPA_PLATFORM'
  | 'FILE_INGEST'
  | 'NOTIFICATION_WEBHOOK';

export type IntegrationStatus = 
  | 'CONNECTED_MOCK'
  | 'DISCONNECTED'
  | 'DEGRADED'
  | 'CIRCUIT_OPEN';

export interface IntegrationEndpoint {
  id: string;
  name: string;
  code: string;
  type: IntegrationType;
  plantId: string | null; // null for multi-plant/central
  endpointUrl: string;
  authType: 'BEARER_TOKEN' | 'API_KEY' | 'MTLS_SIMULATED' | 'OAUTH2_MOCK';
  status: IntegrationStatus;
  isPhysicalConnected: boolean; // strictly false for demo/mock
  disclaimer: string;
  timeoutMs: number;
  rateLimitPerMin: number;
  circuitBreakerThreshold: number;
  consecutiveFailures: number;
  lastTestedAt: string | null;
  avgLatencyMs: number;
}

export type CircuitBreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerStatus {
  id: string;
  integrationId: string;
  state: CircuitBreakerState;
  failureCount: number;
  threshold: number;
  lastFailureTime: string | null;
  coolDownSeconds: number;
}

export type RiskLevelAutomation = 'LEVEL_A' | 'LEVEL_B' | 'LEVEL_C' | 'LEVEL_D';

export interface AutomationPolicy {
  policyId: string;
  name: string;
  level: RiskLevelAutomation;
  description: string;
  requiresHumanApproval: boolean;
  requiresDualApproval: boolean;
  antiSelfApproval: boolean;
  autoRollbackSupported: boolean;
  maxExecutionTimeoutSec: number;
  allowedRolesToTrigger: UserRole[];
  allowedRolesToApprove: UserRole[];
}

export type WorkflowState = 
  | 'DRAFT'
  | 'READY'
  | 'RUNNING'
  | 'WAITING_APPROVAL'
  | 'WAITING_RETRY'
  | 'PAUSED'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export interface WorkflowStep {
  stepId: string;
  stepIndex: number;
  name: string;
  actionType: string;
  targetSystem: string;
  riskLevel: RiskLevelAutomation;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED';
  startedAt: string | null;
  completedAt: string | null;
  outputPayload?: any;
  errorMessage?: string | null;
}

export interface WorkflowInstance {
  id: string;
  workflowCode: string;
  name: string;
  plantId: string;
  state: WorkflowState;
  riskLevel: RiskLevelAutomation;
  concurrencyKey: string; // e.g. "PLANT_DAAL_MATERIAL"
  steps: WorkflowStep[];
  currentStepIndex: number;
  createdBy: string;
  createdByName: string;
  createdByRole: UserRole;
  approvals: {
    firstApproverId: string | null;
    firstApproverName: string | null;
    firstApproverRole: UserRole | null;
    firstApprovedAt: string | null;
    secondApproverId: string | null;
    secondApproverName: string | null;
    secondApproverRole: UserRole | null;
    secondApprovedAt: string | null;
  };
  retryCount: number;
  maxRetries: number;
  idempotencyKey?: string;
  correlationId: string;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  notes: string;
}

export interface RpaRobot {
  id: string;
  robotCode: string;
  name: string;
  plantId: string;
  taskType: string;
  status: 'IDLE' | 'RUNNING' | 'ERROR' | 'OFFLINE' | 'KILLED';
  currentJobId: string | null;
  lastHeartbeat: string;
  heartbeatHealthy: boolean;
  totalJobsExecuted: number;
  successRatePct: number;
  isPhysicalPlatformConnected: boolean; // false, Adapter Contract Mode
  disclaimer: string;
}

export interface RpaRunHistory {
  runId: string;
  robotId: string;
  robotCode: string;
  plantId: string;
  jobName: string;
  status: 'SUCCESS' | 'FAILED' | 'KILLED' | 'TIMED_OUT';
  startTime: string;
  durationMs: number;
  processedItems: number;
  idempotencyKey?: string;
  correlationId: string;
  errorMessage?: string;
}

export interface GmesSyncStep {
  stepNumber: number;
  stepCode: string;
  name: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'PASSED' | 'FAILED' | 'SKIPPED';
  durationMs: number;
  details: string;
}

export interface GmesSyncRun {
  runId: string;
  syncType: 'HOURLY_DELTA' | 'MANUAL_FULL' | 'EVENT_TRIGGERED';
  initiatedBy: string;
  initiatedByName: string;
  plantIds: string[];
  status: 'RUNNING' | 'COMPLETED' | 'PARTIAL' | 'FAILED';
  startedAt: string;
  completedAt: string | null;
  totalExtracted: number;
  totalValid: number;
  totalDuplicatesSkipped: number;
  totalConflictsResolved: number;
  totalCommitted: number;
  isMockAdapter: boolean;
  disclaimer: string;
  steps: GmesSyncStep[];
  correlationId: string;
}

export interface GmesStagingRecord {
  recordId: string;
  sourcePlantId: string;
  entityType: 'PRODUCTION_TELEMETRY' | 'MATERIAL_BATCH' | 'TOOL_CYCLE';
  entityCode: string;
  rawData: any;
  extractedAt: string;
  validationStatus: 'VALID' | 'INVALID' | 'DUPLICATE' | 'CONFLICT';
  validationMessage?: string;
  conflictResolved: boolean;
}

export type FailureClassification = 
  | 'AUTH_FAILURE'
  | 'TIMEOUT_TRANSIENT'
  | 'RATE_LIMITED'
  | 'SCHEMA_VALIDATION_ERROR'
  | 'DATA_CONFLICT'
  | 'CIRCUIT_BREAKER_TRIGGERED'
  | 'RPA_CRASH'
  | 'DOWNSTREAM_5XX'
  | 'BUSINESS_RULE_VIOLATION';

export interface ExceptionQueueItem {
  id: string;
  correlationId: string;
  sourceModule: string;
  entityId: string;
  failureCategory: FailureClassification;
  severity: 'WARNING' | 'ERROR' | 'CRITICAL_P1';
  errorMessage: string;
  originalPayload: any;
  retryAttempts: number;
  maxRetries: number;
  status: 'PENDING_REVIEW' | 'RETRYING' | 'RESOLVED' | 'DISCARDED';
  createdAt: string;
  resolvedAt: string | null;
  resolvedBy?: string | null;
  resolutionNote?: string | null;
}

export interface ScheduledAutomationTask {
  id: string;
  name: string;
  cronExpr: string;
  targetWorkflowCode: string;
  targetPlant: string;
  isActive: boolean;
  lastRunAt: string | null;
  nextRunAt: string;
  lastRunStatus: 'SUCCESS' | 'FAILED' | 'SKIPPED' | null;
}

export interface AutomationNotification {
  id: string;
  channel: 'IN_APP' | 'EMAIL_SIMULATED' | 'SLACK_WEBHOOK_SIMULATED';
  recipient: string;
  title: string;
  body: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  status: 'SENT' | 'QUEUED' | 'SUPPRESSED_QUIET_HOURS';
  createdAt: string;
  correlationId: string;
}

// =========================================================================
// 2. IN-MEMORY STORAGE & SEED DATA
// =========================================================================

// Integrations DB
let INTEGRATIONS_DB: IntegrationEndpoint[] = [
  {
    id: 'INT-GMES-CORE',
    name: 'GMES Central Hub Enterprise REST API v4.2',
    code: 'GMES_API',
    type: 'GMES_API',
    plantId: null,
    endpointUrl: 'https://gmes-hub.internal.voms/api/v4.2/sync',
    authType: 'BEARER_TOKEN',
    status: 'CONNECTED_MOCK',
    isPhysicalConnected: false,
    disclaimer: 'Chưa kết nối GMES vật lý / Demo Mock Adapter v4.2',
    timeoutMs: 5000,
    rateLimitPerMin: 120,
    circuitBreakerThreshold: 3,
    consecutiveFailures: 0,
    lastTestedAt: new Date(Date.now() - 120000).toISOString(),
    avgLatencyMs: 9.4
  },
  {
    id: 'INT-MES-DAAL',
    name: 'DAAL Siemens MES Local Gateway',
    code: 'MES_DAAL',
    type: 'INTERNAL_MES',
    plantId: 'DAAL',
    endpointUrl: 'https://mes.daal.internal/v1/telemetry',
    authType: 'API_KEY',
    status: 'CONNECTED_MOCK',
    isPhysicalConnected: false,
    disclaimer: 'Chưa có bộ kết nối vật lý / Adapter Contract Mode',
    timeoutMs: 3000,
    rateLimitPerMin: 60,
    circuitBreakerThreshold: 5,
    consecutiveFailures: 0,
    lastTestedAt: new Date(Date.now() - 300000).toISOString(),
    avgLatencyMs: 14.2
  },
  {
    id: 'INT-RPA-CLUSTER',
    name: 'UiPath / Robocorp RPA Worker Cluster',
    code: 'RPA_CLUSTER',
    type: 'RPA_PLATFORM',
    plantId: null,
    endpointUrl: 'https://orchestrator.rpa.voms.internal/api/v2/jobs',
    authType: 'OAUTH2_MOCK',
    status: 'CONNECTED_MOCK',
    isPhysicalConnected: false,
    disclaimer: 'Chưa kết nối RPA Platform vật lý / Adapter Contract Mode',
    timeoutMs: 8000,
    rateLimitPerMin: 30,
    circuitBreakerThreshold: 3,
    consecutiveFailures: 0,
    lastTestedAt: new Date(Date.now() - 60000).toISOString(),
    avgLatencyMs: 24.5
  },
  {
    id: 'INT-FILE-INGEST',
    name: 'Secure S3/SFTP Batch CSV/Excel Ingest Gateway',
    code: 'FILE_INGEST_GW',
    type: 'FILE_INGEST',
    plantId: null,
    endpointUrl: 'sftp://ingest.voms.internal:2222/inbox',
    authType: 'MTLS_SIMULATED',
    status: 'CONNECTED_MOCK',
    isPhysicalConnected: false,
    disclaimer: 'Chưa kết nối kho SFTP vật lý / File Ingest Mock Adapter',
    timeoutMs: 15000,
    rateLimitPerMin: 20,
    circuitBreakerThreshold: 4,
    consecutiveFailures: 0,
    lastTestedAt: new Date(Date.now() - 900000).toISOString(),
    avgLatencyMs: 42.0
  },
  {
    id: 'INT-NOTIFY-RELAY',
    name: 'Enterprise Notification Relay (Teams/Email)',
    code: 'NOTIF_RELAY',
    type: 'NOTIFICATION_WEBHOOK',
    plantId: null,
    endpointUrl: 'https://notify.voms.internal/dispatch',
    authType: 'API_KEY',
    status: 'CONNECTED_MOCK',
    isPhysicalConnected: false,
    disclaimer: 'Môi trường mô phỏng Webhook Notification',
    timeoutMs: 4000,
    rateLimitPerMin: 300,
    circuitBreakerThreshold: 5,
    consecutiveFailures: 0,
    lastTestedAt: new Date(Date.now() - 45000).toISOString(),
    avgLatencyMs: 6.8
  }
];

// Circuit Breakers DB
let CIRCUIT_BREAKERS_DB: CircuitBreakerStatus[] = [
  {
    id: 'CB-GMES-01',
    integrationId: 'INT-GMES-CORE',
    state: 'CLOSED',
    failureCount: 0,
    threshold: 3,
    lastFailureTime: null,
    coolDownSeconds: 30
  },
  {
    id: 'CB-MES-DAAL-01',
    integrationId: 'INT-MES-DAAL',
    state: 'CLOSED',
    failureCount: 0,
    threshold: 5,
    lastFailureTime: null,
    coolDownSeconds: 30
  },
  {
    id: 'CB-RPA-01',
    integrationId: 'INT-RPA-CLUSTER',
    state: 'CLOSED',
    failureCount: 0,
    threshold: 3,
    lastFailureTime: null,
    coolDownSeconds: 45
  }
];

// Idempotency Store
const IDEMPOTENCY_STORE = new Map<string, {
  cachedResponse: any;
  statusCode: number;
  timestamp: number;
}>();

// Concurrency Locks (Key -> WorkflowId)
const ACTIVE_CONCURRENCY_LOCKS = new Map<string, string>();

// Automation Policies DB (Levels A-D)
let AUTOMATION_POLICIES_DB: AutomationPolicy[] = [
  {
    policyId: 'POL-LEVEL-A',
    name: 'Level A: Read-Only & Non-Destructive Query',
    level: 'LEVEL_A',
    description: 'Chỉ đọc, kiểm kê số dư kho, đọc đồng hồ đếm sản lượng, quét trạng thái sensor máy.',
    requiresHumanApproval: false,
    requiresDualApproval: false,
    antiSelfApproval: false,
    autoRollbackSupported: false,
    maxExecutionTimeoutSec: 10,
    allowedRolesToTrigger: ['DATA_OPERATOR', 'PRODUCTION_PLANNER', 'EQUIPMENT_TECHNICIAN', 'QC', 'MANAGEMENT', 'SYSTEM_ADMIN'],
    allowedRolesToApprove: []
  },
  {
    policyId: 'POL-LEVEL-B',
    name: 'Level B: Data Standardization & Batch Validation',
    level: 'LEVEL_B',
    description: 'Chuẩn hóa định dạng mã vạch, deduplicate bản ghi staging, đồng bộ danh mục SKU chuẩn hóa.',
    requiresHumanApproval: false,
    requiresDualApproval: false,
    antiSelfApproval: false,
    autoRollbackSupported: true,
    maxExecutionTimeoutSec: 30,
    allowedRolesToTrigger: ['DATA_OPERATOR', 'PRODUCTION_PLANNER', 'OUTSOURCING_GROUP', 'MANAGEMENT', 'SYSTEM_ADMIN'],
    allowedRolesToApprove: []
  },
  {
    policyId: 'POL-LEVEL-C',
    name: 'Level C: Business Impact Operations (Single Human Approval)',
    level: 'LEVEL_C',
    description: 'Điều phối vận chuyển vật liệu khẩn cấp, bù nhân sự SMT, phân bổ lại lệnh sản xuất liên nhà máy.',
    requiresHumanApproval: true,
    requiresDualApproval: false,
    antiSelfApproval: true,
    autoRollbackSupported: true,
    maxExecutionTimeoutSec: 120,
    allowedRolesToTrigger: ['PRODUCTION_PLANNER', 'OUTSOURCING_GROUP', 'EQUIPMENT_TECHNICIAN'],
    allowedRolesToApprove: ['APPROVER', 'MANAGEMENT', 'SYSTEM_ADMIN']
  },
  {
    policyId: 'POL-LEVEL-D',
    name: 'Level D: High-Impact / Critical Production Alteration (Dual Approval)',
    level: 'LEVEL_D',
    description: 'Dừng dây chuyền khẩn cấp, reset thông số rung spindle toàn nhà máy, ghi đè quota hợp đồng vệ tinh.',
    requiresHumanApproval: true,
    requiresDualApproval: true,
    antiSelfApproval: true,
    autoRollbackSupported: true,
    maxExecutionTimeoutSec: 300,
    allowedRolesToTrigger: ['MANAGEMENT', 'OUTSOURCING_GROUP', 'SYSTEM_ADMIN'],
    allowedRolesToApprove: ['APPROVER', 'MANAGEMENT', 'SYSTEM_ADMIN']
  }
];

// RPA Robots DB
let RPA_ROBOTS_DB: RpaRobot[] = [
  {
    id: 'RPA-BOT-01',
    robotCode: 'BOT_MES_INGEST_01',
    name: 'Robot MES Ingest & Delta Sync (DAAL / HSTEC)',
    plantId: 'DAAL',
    taskType: 'MES_TELEMETRY_INGEST',
    status: 'IDLE',
    currentJobId: null,
    lastHeartbeat: new Date().toISOString(),
    heartbeatHealthy: true,
    totalJobsExecuted: 412,
    successRatePct: 99.2,
    isPhysicalPlatformConnected: false,
    disclaimer: 'Chưa kết nối RPA Platform vật lý / Adapter Contract Mode'
  },
  {
    id: 'RPA-BOT-02',
    robotCode: 'BOT_PO_RECONCILE_02',
    name: 'Robot Đối soát PO & Hóa đơn Cảng Hải Phòng',
    plantId: 'KHV',
    taskType: 'PURCHASE_ORDER_RECONCILE',
    status: 'IDLE',
    currentJobId: null,
    lastHeartbeat: new Date(Date.now() - 15000).toISOString(),
    heartbeatHealthy: true,
    totalJobsExecuted: 284,
    successRatePct: 97.8,
    isPhysicalPlatformConnected: false,
    disclaimer: 'Chưa kết nối RPA Platform vật lý / Adapter Contract Mode'
  },
  {
    id: 'RPA-BOT-03',
    robotCode: 'BOT_SPINDLE_CALIB_03',
    name: 'Robot Thu thập Rung Spindle CNC KTECH',
    plantId: 'KTECH',
    taskType: 'IOT_SPINDLE_TELEMETRY',
    status: 'RUNNING',
    currentJobId: 'JOB-RPA-8841',
    lastHeartbeat: new Date(Date.now() - 3000).toISOString(),
    heartbeatHealthy: true,
    totalJobsExecuted: 915,
    successRatePct: 99.7,
    isPhysicalPlatformConnected: false,
    disclaimer: 'Chưa kết nối RPA Platform vật lý / Adapter Contract Mode'
  },
  {
    id: 'RPA-BOT-04',
    robotCode: 'BOT_SHIFT_HANDOVER_04',
    name: 'Robot Xuất Báo cáo Ca ISO/IATF Tự động',
    plantId: 'HOJEONGB',
    taskType: 'SHIFT_REPORT_GEN',
    status: 'IDLE',
    currentJobId: null,
    lastHeartbeat: new Date(Date.now() - 25000).toISOString(),
    heartbeatHealthy: true,
    totalJobsExecuted: 130,
    successRatePct: 100.0,
    isPhysicalPlatformConnected: false,
    disclaimer: 'Chưa kết nối RPA Platform vật lý / Adapter Contract Mode'
  }
];

// RPA Run History DB
let RPA_RUNS_DB: RpaRunHistory[] = [
  {
    runId: 'RUN-RPA-901',
    robotId: 'RPA-BOT-01',
    robotCode: 'BOT_MES_INGEST_01',
    plantId: 'DAAL',
    jobName: 'Đồng bộ sản lượng đúc phôi nhôm Ca 1',
    status: 'SUCCESS',
    startTime: new Date(Date.now() - 1800000).toISOString(),
    durationMs: 3420,
    processedItems: 860,
    correlationId: 'CORR-RPA-901'
  },
  {
    runId: 'RUN-RPA-900',
    robotId: 'RPA-BOT-02',
    robotCode: 'BOT_PO_RECONCILE_02',
    plantId: 'KHV',
    jobName: 'Đối soát vận đơn TO-3011 Hải Phòng',
    status: 'SUCCESS',
    startTime: new Date(Date.now() - 3600000).toISOString(),
    durationMs: 5120,
    processedItems: 142,
    correlationId: 'CORR-RPA-900'
  }
];

// 11-step GMES Sync Runs DB
let GMES_SYNC_RUNS_DB: GmesSyncRun[] = [
  {
    runId: 'SYNC-RUN-014',
    syncType: 'HOURLY_DELTA',
    initiatedBy: 'USR-SYS-01',
    initiatedByName: 'Hệ thống Lập lịch Cron Tự động',
    plantIds: ['KHV', 'DREAM_TECH', 'HSTEC', 'KTECH', 'HOJEONGB', 'HOJEONG_VINA', 'DAAL'],
    status: 'COMPLETED',
    startedAt: new Date(Date.now() - 3600000).toISOString(),
    completedAt: new Date(Date.now() - 3594000).toISOString(),
    totalExtracted: 2150,
    totalValid: 2146,
    totalDuplicatesSkipped: 4,
    totalConflictsResolved: 0,
    totalCommitted: 2146,
    isMockAdapter: true,
    disclaimer: 'Chưa kết nối GMES vật lý / Demo Mock Adapter v4.2',
    correlationId: 'CORR-SYNC-014',
    steps: [
      { stepNumber: 1, stepCode: 'AUTH_HANDSHAKE', name: '1. Trigger & Xác thực Token GMES v4.2', status: 'PASSED', durationMs: 140, details: 'Xác thực mTLS & Bearer Token hoàn tất. Adapter: Mock Contract v4.2.' },
      { stepNumber: 2, stepCode: 'EXTRACT_PAYLOAD', name: '2. Kéo dữ liệu từ 7 nhà máy (Extraction)', status: 'PASSED', durationMs: 420, details: 'Đã trích xuất 2,150 bản ghi telemetry & sản lượng từ 7 vệ tinh.' },
      { stepNumber: 3, stepCode: 'STAGING_INGEST', name: '3. Nạp vào vùng đệm Staging Isolation', status: 'PASSED', durationMs: 180, details: 'Toàn bộ dữ liệu được cô lập vào Staging Store.' },
      { stepNumber: 4, stepCode: 'SCHEMA_VALIDATION', name: '4. Kiểm tra Schema JSON Schema & Data Types', status: 'PASSED', durationMs: 220, details: 'Kiểm tra schema: 2,150 hợp lệ, 0 lỗi định dạng.' },
      { stepNumber: 5, stepCode: 'DEDUPLICATION', name: '5. Khử trùng lặp Barcode & Timestamp ID', status: 'PASSED', durationMs: 110, details: 'Phát hiện 4 bản ghi trùng trong vòng 1.2s; đã tự động loại trừ.' },
      { stepNumber: 6, stepCode: 'CONFLICT_DETECTION', name: '6. Phát hiện mâu thuẫn dữ liệu (Conflict Detection)', status: 'PASSED', durationMs: 130, details: 'Không phát hiện mâu thuẫn chéo giữa SAP ERP và GMES.' },
      { stepNumber: 7, stepCode: 'TRANSFORMATION', name: '7. Chuẩn hóa & Ánh xạ Causal Graph Models', status: 'PASSED', durationMs: 310, details: 'Ánh xạ định dạng GMES sang cấu trúc Node N01-N18.' },
      { stepNumber: 8, stepCode: 'STAGING_VERIFY', name: '8. Xác minh tính toàn vẹn Staging Verification', status: 'PASSED', durationMs: 95, details: 'Checksum SHA-256 staging khớp 100%.' },
      { stepNumber: 9, stepCode: 'TARGET_COMMIT', name: '9. Ghi dữ liệu vào Kho Production Telemetry', status: 'PASSED', durationMs: 490, details: 'Đã commit an toàn 2,146 bản ghi vào PLANTS_DB.' },
      { stepNumber: 10, stepCode: 'AUDIT_EMISSION', name: '10. Phát sự kiện Audit Log & Khóa Hash', status: 'PASSED', durationMs: 65, details: 'Đã ghi nhật ký kiểm toán bất biến EVT-SYNC-014.' },
      { stepNumber: 11, stepCode: 'RECONCILIATION', name: '11. Đối soát hậu đồng bộ (Post-Sync Recon)', status: 'PASSED', durationMs: 180, details: 'Tổng sản lượng 7 nhà máy khớp với báo cáo GMES: 86,300 pcs.' }
    ]
  }
];

// GMES Staging Storage
let GMES_STAGING_DB: GmesStagingRecord[] = [
  {
    recordId: 'STG-REC-001',
    sourcePlantId: 'DAAL',
    entityType: 'PRODUCTION_TELEMETRY',
    entityCode: 'PRESS-A980-BATCH-12',
    rawData: { actual: 8600, target: 18000, rejectRate: 0.042 },
    extractedAt: new Date(Date.now() - 3600000).toISOString(),
    validationStatus: 'VALID',
    conflictResolved: true
  },
  {
    recordId: 'STG-REC-002',
    sourcePlantId: 'KTECH',
    entityType: 'TOOL_CYCLE',
    entityCode: 'SPINDLE-04-VIB',
    rawData: { vibrationG: 4.35, toolWearPct: 82 },
    extractedAt: new Date(Date.now() - 3600000).toISOString(),
    validationStatus: 'VALID',
    conflictResolved: true
  },
  {
    recordId: 'STG-REC-003',
    sourcePlantId: 'HSTEC',
    entityType: 'MATERIAL_BATCH',
    entityCode: 'SMT-PCB-C450',
    rawData: { lotNumber: 'LOT-C450-X', qty: 12500, status: 'IN_BUFFER' },
    extractedAt: new Date(Date.now() - 3600000).toISOString(),
    validationStatus: 'VALID',
    conflictResolved: true
  }
];

// Exception Queue / Dead Letter Queue DB
let EXCEPTION_QUEUE_DB: ExceptionQueueItem[] = [
  {
    id: 'EXC-2026-001',
    correlationId: 'CORR-EXC-DAAL-88',
    sourceModule: 'GMES_SYNC',
    entityId: 'TO-3011',
    failureCategory: 'DATA_CONFLICT',
    severity: 'WARNING',
    errorMessage: 'Xung đột trạng thái lệnh chuyển kho: Cảng Hải Phòng báo trễ nhưng phiếu SAP ghi In-Transit.',
    originalPayload: { orderId: 'TO-3011', portStatus: 'DELAYED', sapStatus: 'IN_TRANSIT', gapPcs: 5600 },
    retryAttempts: 1,
    maxRetries: 3,
    status: 'PENDING_REVIEW',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    resolvedAt: null
  },
  {
    id: 'EXC-2026-002',
    correlationId: 'CORR-EXC-RPA-44',
    sourceModule: 'RPA_ORCHESTRATION',
    entityId: 'RPA-BOT-03',
    failureCategory: 'TIMEOUT_TRANSIENT',
    severity: 'ERROR',
    errorMessage: 'Robot BOT_SPINDLE_CALIB_03 quá thời gian phản hồi (timeout 8000ms). Chuyển hàng đợi Retry.',
    originalPayload: { robotId: 'RPA-BOT-03', attemptNumber: 2 },
    retryAttempts: 2,
    maxRetries: 3,
    status: 'RETRYING',
    createdAt: new Date(Date.now() - 900000).toISOString(),
    resolvedAt: null
  }
];

// Workflow Instances DB
let WORKFLOWS_DB: WorkflowInstance[] = [
  {
    id: 'WF-2026-001',
    workflowCode: 'WF_DISPATCH_EMERGENCY_MATERIAL',
    name: 'Quy trình Điều phối Cấp bù Phôi khẩn cấp K1 sang DAAL',
    plantId: 'DAAL',
    state: 'WAITING_APPROVAL',
    riskLevel: 'LEVEL_C',
    concurrencyKey: 'PLANT_DAAL_MATERIAL',
    currentStepIndex: 1,
    steps: [
      {
        stepId: 'STP-01',
        stepIndex: 0,
        name: 'Kiểm kê số dư kho Hub A01 & Pre-validation',
        actionType: 'QUERY_INVENTORY',
        targetSystem: 'SAP_ERP',
        riskLevel: 'LEVEL_A',
        status: 'COMPLETED',
        startedAt: new Date(Date.now() - 1200000).toISOString(),
        completedAt: new Date(Date.now() - 1198000).toISOString(),
        outputPayload: { availableKg: 14500, requestedKg: 5600, checkPassed: true }
      },
      {
        stepId: 'STP-02',
        stepIndex: 1,
        name: 'Phê duyệt Điều phối Khẩn cấp (Human Approval)',
        actionType: 'HUMAN_APPROVAL_GATE',
        targetSystem: 'APPROVAL_GATEWAY',
        riskLevel: 'LEVEL_C',
        status: 'RUNNING',
        startedAt: new Date(Date.now() - 1198000).toISOString(),
        completedAt: null
      },
      {
        stepId: 'STP-03',
        stepIndex: 2,
        name: 'Phát lệnh xuất kho & Đặt xe tải ưu tiên TK-77',
        actionType: 'DISPATCH_TRANSPORT',
        targetSystem: 'LOGISTICS_API',
        riskLevel: 'LEVEL_C',
        status: 'PENDING',
        startedAt: null,
        completedAt: null
      },
      {
        stepId: 'STP-04',
        stepIndex: 3,
        name: 'Cập nhật PLANTS_DB & Giải cứu rủi ro OTD',
        actionType: 'UPDATE_TELEMETRY',
        targetSystem: 'VOMS_CORE',
        riskLevel: 'LEVEL_B',
        status: 'PENDING',
        startedAt: null,
        completedAt: null
      }
    ],
    createdBy: 'USR-PLAN-09',
    createdByName: 'Nguyễn Văn Phúc (Chuyên viên Điều độ)',
    createdByRole: 'PRODUCTION_PLANNER',
    approvals: {
      firstApproverId: null,
      firstApproverName: null,
      firstApproverRole: null,
      firstApprovedAt: null,
      secondApproverId: null,
      secondApproverName: null,
      secondApproverRole: null,
      secondApprovedAt: null
    },
    retryCount: 0,
    maxRetries: 2,
    idempotencyKey: 'IDEMP-WF-001',
    correlationId: 'CORR-WF-001',
    createdAt: new Date(Date.now() - 1200000).toISOString(),
    updatedAt: new Date(Date.now() - 1200000).toISOString(),
    completedAt: null,
    notes: 'Khởi tạo theo khuyến nghị AI Causal Engine nhằm cứu vãn đơn hàng TO-3011'
  },
  {
    id: 'WF-2026-002',
    workflowCode: 'WF_DUAL_EMERGENCY_STOP_SPINDLE',
    name: 'Quy trình Dừng khẩn cấp & Reset Trục Spindle 04 KTECH',
    plantId: 'KTECH',
    state: 'WAITING_APPROVAL',
    riskLevel: 'LEVEL_D',
    concurrencyKey: 'PLANT_KTECH_SPINDLE',
    currentStepIndex: 0,
    steps: [
      {
        stepId: 'STP-01',
        stepIndex: 0,
        name: 'Phê duyệt kép Cấp 4 (Dual Approval Gate)',
        actionType: 'DUAL_APPROVAL_GATE',
        targetSystem: 'APPROVAL_GATEWAY',
        riskLevel: 'LEVEL_D',
        status: 'RUNNING',
        startedAt: new Date(Date.now() - 600000).toISOString(),
        completedAt: null
      },
      {
        stepId: 'STP-02',
        stepIndex: 1,
        name: 'Gửi tín hiệu an toàn E-Stop sang PLC KTECH qua RPA',
        actionType: 'RPA_ESTOP_TRIGGER',
        targetSystem: 'RPA_PLATFORM',
        riskLevel: 'LEVEL_D',
        status: 'PENDING',
        startedAt: null,
        completedAt: null
      },
      {
        stepId: 'STP-03',
        stepIndex: 2,
        name: 'Tạo phiếu bảo dưỡng khẩn WO-MAINT & Ghi Audit Log',
        actionType: 'CREATE_WORK_ORDER',
        targetSystem: 'MAINTENANCE_MODULE',
        riskLevel: 'LEVEL_B',
        status: 'PENDING',
        startedAt: null,
        completedAt: null
      }
    ],
    createdBy: 'USR-OUT-03',
    createdByName: 'Trần Minh Đức (Trưởng ban Thuê ngoài)',
    createdByRole: 'OUTSOURCING_GROUP',
    approvals: {
      firstApproverId: null,
      firstApproverName: null,
      firstApproverRole: null,
      firstApprovedAt: null,
      secondApproverId: null,
      secondApproverName: null,
      secondApproverRole: null,
      secondApprovedAt: null
    },
    retryCount: 0,
    maxRetries: 1,
    idempotencyKey: 'IDEMP-WF-002',
    correlationId: 'CORR-WF-002',
    createdAt: new Date(Date.now() - 600000).toISOString(),
    updatedAt: new Date(Date.now() - 600000).toISOString(),
    completedAt: null,
    notes: 'Quy trình rủi ro Level D: Yêu cầu 2 người phê duyệt độc lập (Anti-self approval).'
  }
];

// Scheduled Automation Tasks DB
let SCHEDULES_DB: ScheduledAutomationTask[] = [
  {
    id: 'SCH-01',
    name: 'Đồng bộ GMES Hourly Delta Sync 7 nhà máy',
    cronExpr: '0 * * * *',
    targetWorkflowCode: 'GMES_HOURLY_SYNC',
    targetPlant: 'ALL_7_PLANTS',
    isActive: true,
    lastRunAt: new Date(Date.now() - 3600000).toISOString(),
    nextRunAt: new Date(Date.now() + 1800000).toISOString(),
    lastRunStatus: 'SUCCESS'
  },
  {
    id: 'SCH-02',
    name: 'Kiểm tra Dead-Letter Queue & Auto-Retry',
    cronExpr: '*/15 * * * *',
    targetWorkflowCode: 'DLQ_RETRY_PROCESSOR',
    targetPlant: 'CENTRAL',
    isActive: true,
    lastRunAt: new Date(Date.now() - 900000).toISOString(),
    nextRunAt: new Date(Date.now() + 300000).toISOString(),
    lastRunStatus: 'SUCCESS'
  },
  {
    id: 'SCH-03',
    name: 'Đối soát số dư tồn kho Hub & 7 Vệ tinh cuối ca',
    cronExpr: '0 6,14,22 * * *',
    targetWorkflowCode: 'SHIFT_RECONCILIATION',
    targetPlant: 'ALL_7_PLANTS',
    isActive: true,
    lastRunAt: new Date(Date.now() - 18000000).toISOString(),
    nextRunAt: new Date(Date.now() + 10800000).toISOString(),
    lastRunStatus: 'SUCCESS'
  }
];

// Notifications DB
let NOTIFICATIONS_DB: AutomationNotification[] = [
  {
    id: 'NOTIF-001',
    channel: 'IN_APP',
    recipient: 'USR-APPR-10',
    title: 'Cần phê duyệt Quy trình Level C: Cấp bù phôi DAAL (WF-2026-001)',
    body: 'Đơn hàng TO-3011 có nguy cơ chậm 4.5h. Yêu cầu phê duyệt xuất 5.600kg phôi từ Hub A01.',
    severity: 'WARNING',
    status: 'SENT',
    createdAt: new Date(Date.now() - 1100000).toISOString(),
    correlationId: 'CORR-WF-001'
  },
  {
    id: 'NOTIF-002',
    channel: 'SLACK_WEBHOOK_SIMULATED',
    recipient: '#ops-critical-alerts',
    title: '[CẢNH BÁO LEVEL D] Khởi tạo E-Stop Spindle 04 KTECH',
    body: 'Rung 4.35G vượt ngưỡng an toàn. Quy trình WF-2026-002 đang chờ Dual Approval.',
    severity: 'CRITICAL',
    status: 'SENT',
    createdAt: new Date(Date.now() - 550000).toISOString(),
    correlationId: 'CORR-WF-002'
  }
];

// Helper: Sanitize payload to strip secrets
function sanitizePayload(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  const clone = JSON.parse(JSON.stringify(obj));
  const sensitiveKeys = ['password', 'token', 'authorization', 'secret', 'apikey', 'api_key', 'private_key'];

  function mask(item: any) {
    if (!item || typeof item !== 'object') return;
    for (const key of Object.keys(item)) {
      if (sensitiveKeys.some(k => key.toLowerCase().includes(k))) {
        item[key] = '***REDACTED***';
      } else if (typeof item[key] === 'object') {
        mask(item[key]);
      }
    }
  }

  mask(clone);
  return clone;
}

// =========================================================================
// 3. REST API ENDPOINTS
// =========================================================================

// --- 3.1 Overview KPIs ---
automationRouter.get('/overview', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const activeWorkflows = WORKFLOWS_DB.filter(w => w.state === 'RUNNING' || w.state === 'WAITING_APPROVAL').length;
  const waitingApprovals = WORKFLOWS_DB.filter(w => w.state === 'WAITING_APPROVAL').length;
  const failedWorkflows = WORKFLOWS_DB.filter(w => w.state === 'FAILED').length;
  const totalRobots = RPA_ROBOTS_DB.length;
  const activeRobots = RPA_ROBOTS_DB.filter(r => r.status === 'RUNNING' || r.status === 'IDLE').length;
  const openCircuitBreakers = CIRCUIT_BREAKERS_DB.filter(cb => cb.state === 'OPEN').length;
  const pendingExceptions = EXCEPTION_QUEUE_DB.filter(e => e.status === 'PENDING_REVIEW' || e.status === 'RETRYING').length;

  res.json({
    activeWorkflows,
    waitingApprovals,
    failedWorkflows,
    totalRobots,
    activeRobots,
    openCircuitBreakers,
    pendingExceptions,
    gmesSyncStatus: 'ONLINE_MOCK',
    honestDisclaimer: 'Lưu ý: Môi trường đang hoạt động ở chế độ Demo Mock Adapter & RPA Contract Mode. Không có kết nối mạng trực tiếp tới GMES vật lý của đối tác.',
    timestamp: new Date().toISOString()
  });
});

// --- 3.2 Integration Control Center ---
automationRouter.get('/integrations', authMiddleware, (_req: AuthenticatedRequest, res: Response) => {
  res.json(INTEGRATIONS_DB);
});

automationRouter.get('/integrations/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const integration = INTEGRATIONS_DB.find(i => i.id === req.params.id);
  if (!integration) {
    res.status(404).json({ error: 'NOT_FOUND', message: `Integration ${req.params.id} does not exist.` });
    return;
  }
  res.json(integration);
});

// Test Connection with Adapter Contract Simulation
automationRouter.post('/integrations/:id/test-connection', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const integration = INTEGRATIONS_DB.find(i => i.id === req.params.id);
  if (!integration) {
    res.status(404).json({ error: 'NOT_FOUND', message: `Integration ${req.params.id} does not exist.` });
    return;
  }

  // Check circuit breaker status
  const cb = CIRCUIT_BREAKERS_DB.find(c => c.integrationId === integration.id);
  if (cb && cb.state === 'OPEN') {
    res.status(503).json({
      error: 'CIRCUIT_BREAKER_OPEN',
      message: `Ngắt mạch tự động đang kích hoạt cho ${integration.name}. Thử lại sau ${cb.coolDownSeconds}s.`,
      disclaimer: integration.disclaimer
    });
    return;
  }

  const simulatedLatency = Math.floor(Math.random() * 8) + 6; // 6-14ms
  integration.lastTestedAt = new Date().toISOString();
  integration.avgLatencyMs = simulatedLatency;
  integration.status = 'CONNECTED_MOCK';

  recordAuditLog({
    actor: req.user!,
    action: 'TEST_INTEGRATION_CONNECTION',
    resource: 'INTEGRATIONS',
    targetId: integration.id,
    plantId: integration.plantId,
    statusBefore: { status: integration.status },
    statusAfter: { status: 'CONNECTED_MOCK', latencyMs: simulatedLatency },
    payload: { disclaimer: integration.disclaimer, endpointUrl: integration.endpointUrl },
    correlationId: req.correlationId
  });

  res.json({
    success: true,
    integrationId: integration.id,
    name: integration.name,
    status: 'CONNECTED_MOCK',
    latencyMs: simulatedLatency,
    isPhysicalConnected: false,
    disclaimer: integration.disclaimer,
    testedAt: integration.lastTestedAt,
    message: `Kiểm tra bắt tay Adapter hoàn tất (${simulatedLatency}ms). Lưu ý: ${integration.disclaimer}`
  });
});

// Update integration configurations
automationRouter.patch('/integrations/:id', authMiddleware, requireRoles(['SYSTEM_ADMIN', 'MANAGEMENT']), (req: AuthenticatedRequest, res: Response) => {
  const integration = INTEGRATIONS_DB.find(i => i.id === req.params.id);
  if (!integration) {
    res.status(404).json({ error: 'NOT_FOUND' });
    return;
  }

  const { timeoutMs, rateLimitPerMin, circuitBreakerThreshold } = req.body;
  if (timeoutMs) integration.timeoutMs = Number(timeoutMs);
  if (rateLimitPerMin) integration.rateLimitPerMin = Number(rateLimitPerMin);
  if (circuitBreakerThreshold) integration.circuitBreakerThreshold = Number(circuitBreakerThreshold);

  recordAuditLog({
    actor: req.user!,
    action: 'UPDATE_INTEGRATION_CONFIG',
    resource: 'INTEGRATIONS',
    targetId: integration.id,
    plantId: integration.plantId,
    payload: { timeoutMs, rateLimitPerMin, circuitBreakerThreshold },
    correlationId: req.correlationId
  });

  res.json(integration);
});

// --- 3.3 API Integration Engine & Circuit Breakers ---
automationRouter.get('/api/circuit-breakers', authMiddleware, (_req: AuthenticatedRequest, res: Response) => {
  res.json(CIRCUIT_BREAKERS_DB);
});

automationRouter.post('/api/circuit-breakers/:id/reset', authMiddleware, requireRoles(['SYSTEM_ADMIN', 'MANAGEMENT']), (req: AuthenticatedRequest, res: Response) => {
  const cb = CIRCUIT_BREAKERS_DB.find(c => c.id === req.params.id);
  if (!cb) {
    res.status(404).json({ error: 'NOT_FOUND' });
    return;
  }

  cb.state = 'CLOSED';
  cb.failureCount = 0;
  cb.lastFailureTime = null;

  recordAuditLog({
    actor: req.user!,
    action: 'RESET_CIRCUIT_BREAKER',
    resource: 'CIRCUIT_BREAKER',
    targetId: cb.id,
    payload: { integrationId: cb.integrationId },
    correlationId: req.correlationId
  });

  res.json({ success: true, circuitBreaker: cb });
});

// Proxy Dispatch with Idempotency Key, Correlation ID & Sanitization
automationRouter.post('/api/dispatch', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const idempotencyKey = (req.headers['x-idempotency-key'] as string) || req.body.idempotencyKey;
  const correlationId = req.correlationId || `CORR-DISP-${Date.now()}`;
  res.setHeader('x-correlation-id', correlationId);

  // Check idempotency cache
  if (idempotencyKey && IDEMPOTENCY_STORE.has(idempotencyKey)) {
    const cached = IDEMPOTENCY_STORE.get(idempotencyKey)!;
    res.setHeader('x-cache-hit', 'true');
    res.status(cached.statusCode).json({
      ...cached.cachedResponse,
      _idempotency: {
        isDuplicate: true,
        cachedAt: new Date(cached.timestamp).toISOString(),
        idempotencyKey
      }
    });
    return;
  }

  const { targetIntegrationId, action, payload } = req.body;
  if (!targetIntegrationId || !action) {
    res.status(400).json({ error: 'BAD_REQUEST', message: 'targetIntegrationId and action are required.' });
    return;
  }

  const integration = INTEGRATIONS_DB.find(i => i.id === targetIntegrationId);
  if (!integration) {
    res.status(404).json({ error: 'INTEGRATION_NOT_FOUND' });
    return;
  }

  // Circuit breaker check
  const cb = CIRCUIT_BREAKERS_DB.find(c => c.integrationId === integration.id);
  if (cb && cb.state === 'OPEN') {
    res.status(503).json({
      error: 'CIRCUIT_BREAKER_OPEN',
      failureCategory: 'CIRCUIT_BREAKER_TRIGGERED',
      message: `Ngắt mạch tự động đang mở cho ${integration.name}. Lệnh dispatch bị từ chối.`
    });
    return;
  }

  // Sanitize payload for log
  const sanitized = sanitizePayload(payload);

  const dispatchResult = {
    success: true,
    dispatchId: `DSP-${Date.now()}`,
    targetIntegration: integration.name,
    action,
    correlationId,
    disclaimer: integration.disclaimer,
    sanitizedPayload: sanitized,
    executedAt: new Date().toISOString()
  };

  // Cache response if idempotency key was supplied
  if (idempotencyKey) {
    IDEMPOTENCY_STORE.set(idempotencyKey, {
      cachedResponse: dispatchResult,
      statusCode: 200,
      timestamp: Date.now()
    });
  }

  res.json(dispatchResult);
});

// --- 3.4 GMES Data Synchronization (11-Step Lifecycle) ---
automationRouter.get('/gmes-sync/runs', authMiddleware, (_req: AuthenticatedRequest, res: Response) => {
  res.json(GMES_SYNC_RUNS_DB);
});

automationRouter.get('/gmes-sync/runs/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const run = GMES_SYNC_RUNS_DB.find(r => r.runId === req.params.id);
  if (!run) {
    res.status(404).json({ error: 'NOT_FOUND' });
    return;
  }
  res.json(run);
});

automationRouter.get('/gmes-sync/staging', authMiddleware, (_req: AuthenticatedRequest, res: Response) => {
  res.json(GMES_STAGING_DB);
});

// Trigger 11-step synchronization
automationRouter.post('/gmes-sync/trigger', authMiddleware, requireRoles(['DATA_OPERATOR', 'PRODUCTION_PLANNER', 'MANAGEMENT', 'SYSTEM_ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  const idempotencyKey = (req.headers['x-idempotency-key'] as string) || req.body.idempotencyKey;
  const correlationId = req.correlationId || `CORR-SYNC-${Date.now()}`;
  res.setHeader('x-correlation-id', correlationId);

  // Idempotency check
  if (idempotencyKey && IDEMPOTENCY_STORE.has(idempotencyKey)) {
    const cached = IDEMPOTENCY_STORE.get(idempotencyKey)!;
    res.status(cached.statusCode).json({
      ...cached.cachedResponse,
      _idempotency: { isDuplicate: true, idempotencyKey }
    });
    return;
  }

  const { plantIds, syncType } = req.body;
  const targetPlants = Array.isArray(plantIds) && plantIds.length > 0 
    ? plantIds 
    : ['KHV', 'DREAM_TECH', 'HSTEC', 'KTECH', 'HOJEONGB', 'HOJEONG_VINA', 'DAAL'];

  const runId = `SYNC-RUN-${Date.now().toString().slice(-6)}`;
  const startTime = new Date().toISOString();

  // Full 11 lifecycle steps
  const steps: GmesSyncStep[] = [
    { stepNumber: 1, stepCode: 'AUTH_HANDSHAKE', name: '1. Trigger & Xác thực Token GMES v4.2', status: 'PASSED', durationMs: 120, details: 'Adapter mTLS Mock Token Verified' },
    { stepNumber: 2, stepCode: 'EXTRACT_PAYLOAD', name: '2. Kéo dữ liệu từ các nhà máy vệ tinh', status: 'PASSED', durationMs: 380, details: `Đã trích xuất dữ liệu từ ${targetPlants.length} nhà máy` },
    { stepNumber: 3, stepCode: 'STAGING_INGEST', name: '3. Nạp vào vùng đệm Staging Isolation', status: 'PASSED', durationMs: 140, details: 'Staging Ingest cô lập hoàn tất' },
    { stepNumber: 4, stepCode: 'SCHEMA_VALIDATION', name: '4. Kiểm tra Schema JSON Schema & Data Types', status: 'PASSED', durationMs: 210, details: '100% bản ghi đạt chuẩn Schema ISO/GMES' },
    { stepNumber: 5, stepCode: 'DEDUPLICATION', name: '5. Khử trùng lặp Barcode & Timestamp ID', status: 'PASSED', durationMs: 90, details: 'Lọc 2 bản ghi trùng lặp trong chu kỳ quét' },
    { stepNumber: 6, stepCode: 'CONFLICT_DETECTION', name: '6. Phát hiện mâu thuẫn dữ liệu (Conflict Detection)', status: 'PASSED', durationMs: 110, details: 'Không phát hiện mâu thuẫn chéo với SAP ERP' },
    { stepNumber: 7, stepCode: 'TRANSFORMATION', name: '7. Chuẩn hóa & Ánh xạ Causal Graph Models', status: 'PASSED', durationMs: 280, details: 'Biến đổi cấu trúc sang chuẩn Pearl DAG' },
    { stepNumber: 8, stepCode: 'STAGING_VERIFY', name: '8. Xác minh tính toàn vẹn Staging Verification', status: 'PASSED', durationMs: 70, details: 'Xác minh chữ ký số SHA-256 hoàn tất' },
    { stepNumber: 9, stepCode: 'TARGET_COMMIT', name: '9. Ghi dữ liệu vào Kho Production Telemetry', status: 'PASSED', durationMs: 440, details: 'Cập nhật thành công vào hệ thống telemetry' },
    { stepNumber: 10, stepCode: 'AUDIT_EMISSION', name: '10. Phát sự kiện Audit Log & Khóa Hash', status: 'PASSED', durationMs: 50, details: 'Đã tạo bản ghi kiểm toán bất biến' },
    { stepNumber: 11, stepCode: 'RECONCILIATION', name: '11. Đối soát hậu đồng bộ (Post-Sync Recon)', status: 'PASSED', durationMs: 160, details: 'Đối soát 100% khớp giữa Staging và Target' }
  ];

  const totalExtracted = targetPlants.length * 280;
  const totalDuplicatesSkipped = 2;
  const totalCommitted = totalExtracted - totalDuplicatesSkipped;

  const newRun: GmesSyncRun = {
    runId,
    syncType: syncType || 'MANUAL_FULL',
    initiatedBy: req.user!.id,
    initiatedByName: req.user!.fullName,
    plantIds: targetPlants,
    status: 'COMPLETED',
    startedAt: startTime,
    completedAt: new Date().toISOString(),
    totalExtracted,
    totalValid: totalCommitted,
    totalDuplicatesSkipped,
    totalConflictsResolved: 0,
    totalCommitted,
    isMockAdapter: true,
    disclaimer: 'Chưa kết nối GMES vật lý / Demo Mock Adapter v4.2',
    steps,
    correlationId
  };

  GMES_SYNC_RUNS_DB.unshift(newRun);

  recordAuditLog({
    actor: req.user!,
    action: 'TRIGGER_GMES_11STEP_SYNC',
    resource: 'GMES_SYNC',
    targetId: runId,
    payload: { plantIds: targetPlants, syncType, totalCommitted, disclaimer: newRun.disclaimer },
    correlationId
  });

  if (idempotencyKey) {
    IDEMPOTENCY_STORE.set(idempotencyKey, {
      cachedResponse: newRun,
      statusCode: 200,
      timestamp: Date.now()
    });
  }

  res.json(newRun);
});

// Resolve Staging Conflict
automationRouter.post('/gmes-sync/staging/:recordId/resolve', authMiddleware, requireRoles(['DATA_OPERATOR', 'QC', 'MANAGEMENT', 'SYSTEM_ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  const record = GMES_STAGING_DB.find(r => r.recordId === req.params.recordId);
  if (!record) {
    res.status(404).json({ error: 'NOT_FOUND', message: 'Staging record not found.' });
    return;
  }

  record.conflictResolved = true;
  record.validationStatus = 'VALID';
  record.validationMessage = `Đã xử lý thủ công bởi ${req.user!.fullName}: ${req.body.resolutionNotes || 'Chấp thuận'}`;

  recordAuditLog({
    actor: req.user!,
    action: 'RESOLVE_STAGING_CONFLICT',
    resource: 'GMES_STAGING',
    targetId: record.recordId,
    plantId: record.sourcePlantId,
    payload: { notes: req.body.resolutionNotes },
    correlationId: req.correlationId
  });

  res.json({ success: true, record });
});

// --- 3.5 RPA Control Center ---
automationRouter.get('/rpa/robots', authMiddleware, (_req: AuthenticatedRequest, res: Response) => {
  res.json(RPA_ROBOTS_DB);
});

automationRouter.get('/rpa/runs', authMiddleware, (_req: AuthenticatedRequest, res: Response) => {
  res.json(RPA_RUNS_DB);
});

// RPA Kill Switch
automationRouter.post('/rpa/robots/:id/kill-switch', authMiddleware, requireRoles(['EQUIPMENT_TECHNICIAN', 'MANAGEMENT', 'SYSTEM_ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  const bot = RPA_ROBOTS_DB.find(b => b.id === req.params.id);
  if (!bot) {
    res.status(404).json({ error: 'NOT_FOUND', message: 'Robot not found.' });
    return;
  }

  const previousStatus = bot.status;
  bot.status = 'KILLED';
  bot.currentJobId = null;

  recordAuditLog({
    actor: req.user!,
    action: 'RPA_KILL_SWITCH_ENGAGED',
    resource: 'RPA_ROBOT',
    targetId: bot.id,
    plantId: bot.plantId,
    statusBefore: { status: previousStatus },
    statusAfter: { status: 'KILLED' },
    payload: { reason: req.body.reason || 'Dừng khẩn cấp bằng tay từ người vận hành', disclaimer: bot.disclaimer },
    correlationId: req.correlationId
  });

  res.json({
    success: true,
    message: `ĐÃ KÍCH HOẠT KILL-SWITCH: Robot ${bot.name} (${bot.robotCode}) đã bị ngừng khẩn cấp.`,
    robot: bot
  });
});

// RPA Heartbeat Trigger / Update
automationRouter.post('/rpa/robots/:id/heartbeat', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const bot = RPA_ROBOTS_DB.find(b => b.id === req.params.id);
  if (!bot) {
    res.status(404).json({ error: 'NOT_FOUND' });
    return;
  }

  bot.lastHeartbeat = new Date().toISOString();
  bot.heartbeatHealthy = true;
  if (bot.status === 'KILLED' && req.body.resume) {
    bot.status = 'IDLE';
  }

  res.json({ success: true, robot: bot });
});

// Trigger RPA Job with Idempotency
automationRouter.post('/rpa/robots/:id/trigger', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const idempotencyKey = (req.headers['x-idempotency-key'] as string) || req.body.idempotencyKey;
  const correlationId = req.correlationId || `CORR-RPA-${Date.now()}`;
  res.setHeader('x-correlation-id', correlationId);

  if (idempotencyKey && IDEMPOTENCY_STORE.has(idempotencyKey)) {
    const cached = IDEMPOTENCY_STORE.get(idempotencyKey)!;
    res.status(cached.statusCode).json({
      ...cached.cachedResponse,
      _idempotency: { isDuplicate: true, idempotencyKey }
    });
    return;
  }

  const bot = RPA_ROBOTS_DB.find(b => b.id === req.params.id);
  if (!bot) {
    res.status(404).json({ error: 'NOT_FOUND' });
    return;
  }

  if (bot.status === 'KILLED') {
    res.status(409).json({
      error: 'ROBOT_KILLED',
      message: `Robot ${bot.robotCode} đang ở trạng thái KILLED. Hãy reset robot trước khi kích hoạt.`
    });
    return;
  }

  const runId = `RUN-RPA-${Date.now().toString().slice(-5)}`;
  const newRun: RpaRunHistory = {
    runId,
    robotId: bot.id,
    robotCode: bot.robotCode,
    plantId: bot.plantId,
    jobName: req.body.jobName || `Tác vụ tự động hóa ${bot.taskType}`,
    status: 'SUCCESS',
    startTime: new Date().toISOString(),
    durationMs: Math.floor(Math.random() * 2000) + 1200,
    processedItems: Math.floor(Math.random() * 50) + 20,
    correlationId,
    idempotencyKey
  };

  bot.totalJobsExecuted += 1;
  RPA_RUNS_DB.unshift(newRun);

  recordAuditLog({
    actor: req.user!,
    action: 'TRIGGER_RPA_JOB',
    resource: 'RPA_ROBOT',
    targetId: bot.id,
    plantId: bot.plantId,
    payload: { jobName: newRun.jobName, runId, disclaimer: bot.disclaimer },
    correlationId
  });

  const responseBody = {
    success: true,
    run: newRun,
    robot: bot,
    disclaimer: bot.disclaimer
  };

  if (idempotencyKey) {
    IDEMPOTENCY_STORE.set(idempotencyKey, {
      cachedResponse: responseBody,
      statusCode: 200,
      timestamp: Date.now()
    });
  }

  res.json(responseBody);
});

// --- 3.6 Workflow Orchestration Engine (9-State FSM) ---
automationRouter.get('/workflows', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { status, plantId } = req.query;
  let results = [...WORKFLOWS_DB];

  if (status && typeof status === 'string') {
    results = results.filter(w => w.state === status.toUpperCase());
  }

  if (plantId && typeof plantId === 'string' && plantId !== 'ALL') {
    results = results.filter(w => w.plantId === plantId.toUpperCase());
  }

  res.json(results);
});

automationRouter.get('/workflows/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const wf = WORKFLOWS_DB.find(w => w.id === req.params.id);
  if (!wf) {
    res.status(404).json({ error: 'NOT_FOUND', message: 'Workflow not found.' });
    return;
  }
  res.json(wf);
});

// Create Workflow
automationRouter.post('/workflows', authMiddleware, requireRoles(['PRODUCTION_PLANNER', 'OUTSOURCING_GROUP', 'MANAGEMENT', 'SYSTEM_ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  const { workflowCode, name, plantId, riskLevel, steps, notes } = req.body;

  if (!workflowCode || !name || !plantId || !riskLevel) {
    res.status(400).json({ error: 'BAD_REQUEST', message: 'workflowCode, name, plantId, and riskLevel are required.' });
    return;
  }

  const id = `WF-${Date.now().toString().slice(-6)}`;
  const concurrencyKey = `PLANT_${plantId}_${workflowCode}`;

  const formattedSteps: WorkflowStep[] = Array.isArray(steps) && steps.length > 0 ? steps.map((s, idx) => ({
    stepId: `STP-${idx + 1}`,
    stepIndex: idx,
    name: s.name || `Bước ${idx + 1}`,
    actionType: s.actionType || 'GENERIC_STEP',
    targetSystem: s.targetSystem || 'INTERNAL',
    riskLevel: s.riskLevel || riskLevel,
    status: idx === 0 ? 'PENDING' : 'PENDING',
    startedAt: null,
    completedAt: null
  })) : [
    {
      stepId: 'STP-01',
      stepIndex: 0,
      name: 'Khởi tạo & Pre-flight Check',
      actionType: 'PRE_CHECK',
      targetSystem: 'VOMS_CORE',
      riskLevel: 'LEVEL_A',
      status: 'PENDING',
      startedAt: null,
      completedAt: null
    }
  ];

  const newWorkflow: WorkflowInstance = {
    id,
    workflowCode,
    name,
    plantId,
    state: 'READY',
    riskLevel,
    concurrencyKey,
    steps: formattedSteps,
    currentStepIndex: 0,
    createdBy: req.user!.id,
    createdByName: req.user!.fullName,
    createdByRole: req.user!.role,
    approvals: {
      firstApproverId: null,
      firstApproverName: null,
      firstApproverRole: null,
      firstApprovedAt: null,
      secondApproverId: null,
      secondApproverName: null,
      secondApproverRole: null,
      secondApprovedAt: null
    },
    retryCount: 0,
    maxRetries: 2,
    correlationId: req.correlationId || `CORR-WF-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: null,
    notes: notes || 'Tạo mới quy trình tự động'
  };

  WORKFLOWS_DB.unshift(newWorkflow);

  recordAuditLog({
    actor: req.user!,
    action: 'CREATE_WORKFLOW',
    resource: 'WORKFLOW_ENGINE',
    targetId: id,
    plantId,
    payload: { workflowCode, name, riskLevel, stepsCount: formattedSteps.length },
    correlationId: req.correlationId
  });

  res.status(201).json(newWorkflow);
});

// Execute Workflow (FSM State Transitions)
automationRouter.post('/workflows/:id/execute', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const wf = WORKFLOWS_DB.find(w => w.id === req.params.id);
  if (!wf) {
    res.status(404).json({ error: 'NOT_FOUND', message: 'Workflow not found.' });
    return;
  }

  // Concurrency lock check
  if (ACTIVE_CONCURRENCY_LOCKS.has(wf.concurrencyKey) && ACTIVE_CONCURRENCY_LOCKS.get(wf.concurrencyKey) !== wf.id) {
    res.status(409).json({
      error: 'CONCURRENCY_LOCKED',
      message: `Khóa cạnh tranh ${wf.concurrencyKey} đang bị chiếm giữ bởi quy trình ${ACTIVE_CONCURRENCY_LOCKS.get(wf.concurrencyKey)}.`
    });
    return;
  }

  // FSM Transition verification
  if (wf.state === 'COMPLETED' || wf.state === 'CANCELLED') {
    res.status(400).json({ error: 'INVALID_STATE', message: `Không thể thực thi quy trình ở trạng thái ${wf.state}.` });
    return;
  }

  // Check if needs human approval
  if ((wf.riskLevel === 'LEVEL_C' || wf.riskLevel === 'LEVEL_D') && !wf.approvals.firstApproverId) {
    wf.state = 'WAITING_APPROVAL';
    wf.updatedAt = new Date().toISOString();
    res.status(200).json({
      message: `Quy trình rủi ro ${wf.riskLevel} yêu cầu phê duyệt con người trước khi thực thi. Trạng thái đã chuyển sang WAITING_APPROVAL.`,
      workflow: wf
    });
    return;
  }

  // If Level D, verify second approval
  if (wf.riskLevel === 'LEVEL_D' && (!wf.approvals.secondApproverId || wf.approvals.secondApproverId === wf.approvals.firstApproverId)) {
    wf.state = 'WAITING_APPROVAL';
    wf.updatedAt = new Date().toISOString();
    res.status(200).json({
      message: 'Quy trình rủi ro Cấp 4 (Level D) yêu cầu Dual Approval từ 2 cá nhân độc lập. Đang chờ Người phê duyệt số 2.',
      workflow: wf
    });
    return;
  }

  // Lock concurrency
  ACTIVE_CONCURRENCY_LOCKS.set(wf.concurrencyKey, wf.id);

  wf.state = 'RUNNING';
  wf.updatedAt = new Date().toISOString();

  // Advance current step
  const currentStep = wf.steps[wf.currentStepIndex];
  if (currentStep) {
    currentStep.status = 'COMPLETED';
    currentStep.startedAt = currentStep.startedAt || new Date().toISOString();
    currentStep.completedAt = new Date().toISOString();
  }

  // Advance index
  if (wf.currentStepIndex < wf.steps.length - 1) {
    wf.currentStepIndex += 1;
    const nextStep = wf.steps[wf.currentStepIndex];
    nextStep.status = 'RUNNING';
    nextStep.startedAt = new Date().toISOString();
  } else {
    // Reached final step
    wf.state = 'COMPLETED';
    wf.completedAt = new Date().toISOString();
    ACTIVE_CONCURRENCY_LOCKS.delete(wf.concurrencyKey);
  }

  recordAuditLog({
    actor: req.user!,
    action: 'EXECUTE_WORKFLOW_STEP',
    resource: 'WORKFLOW_ENGINE',
    targetId: wf.id,
    plantId: wf.plantId,
    statusBefore: { stepIndex: wf.currentStepIndex - 1 },
    statusAfter: { stepIndex: wf.currentStepIndex, state: wf.state },
    payload: { workflowCode: wf.workflowCode, stepName: currentStep?.name },
    correlationId: req.correlationId
  });

  res.json({
    success: true,
    workflow: wf,
    message: wf.state === 'COMPLETED' ? 'Quy trình đã hoàn thành tất cả các bước an toàn.' : 'Đã thực thi thành công bước kế tiếp.'
  });
});

// Human Approval Endpoint (Anti-Self Approval & Dual Approval Enforced)
automationRouter.post('/workflows/:id/approve', authMiddleware, requireRoles(['APPROVER', 'MANAGEMENT', 'SYSTEM_ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  const wf = WORKFLOWS_DB.find(w => w.id === req.params.id);
  if (!wf) {
    res.status(404).json({ error: 'NOT_FOUND', message: 'Workflow not found.' });
    return;
  }

  const currentUser = req.user!;

  // 1. Anti-Self-Approval: Creator cannot approve their own workflow
  if (wf.createdBy === currentUser.id) {
    res.status(403).json({
      error: 'ANTI_SELF_APPROVAL_VIOLATION',
      message: `Vi phạm nguyên tắc Kiểm soát Kép (Anti-Self Approval): Người tạo quy trình (${wf.createdByName}) không được phép tự phê duyệt.`
    });
    return;
  }

  // 2. First Approval
  if (!wf.approvals.firstApproverId) {
    wf.approvals.firstApproverId = currentUser.id;
    wf.approvals.firstApproverName = currentUser.fullName;
    wf.approvals.firstApproverRole = currentUser.role;
    wf.approvals.firstApprovedAt = new Date().toISOString();

    recordAuditLog({
      actor: currentUser,
      action: 'WORKFLOW_FIRST_APPROVAL',
      resource: 'WORKFLOW_ENGINE',
      targetId: wf.id,
      plantId: wf.plantId,
      payload: { decision: 'APPROVED', riskLevel: wf.riskLevel },
      correlationId: req.correlationId
    });

    if (wf.riskLevel === 'LEVEL_D') {
      // Still needs second approval
      wf.state = 'WAITING_APPROVAL';
      wf.updatedAt = new Date().toISOString();
      res.json({
        success: true,
        message: 'Phê duyệt Cấp 1 thành công. Quy trình Level D tiếp tục chờ Người phê duyệt Cấp 2 độc lập.',
        workflow: wf
      });
      return;
    } else {
      // Level C single approval satisfied
      wf.state = 'READY';
      wf.updatedAt = new Date().toISOString();
      res.json({
        success: true,
        message: 'Phê duyệt hoàn tất. Trạng thái quy trình chuyển sang READY để bắt đầu thực thi.',
        workflow: wf
      });
      return;
    }
  }

  // 3. Second Approval for Level D
  if (wf.riskLevel === 'LEVEL_D') {
    // Check if same person as first approver
    if (wf.approvals.firstApproverId === currentUser.id) {
      res.status(403).json({
        error: 'DUAL_APPROVAL_SAME_ACTOR',
        message: 'Vi phạm Dual Approval: Người phê duyệt thứ 2 phải là cá nhân khác với Người phê duyệt thứ 1.'
      });
      return;
    }

    wf.approvals.secondApproverId = currentUser.id;
    wf.approvals.secondApproverName = currentUser.fullName;
    wf.approvals.secondApproverRole = currentUser.role;
    wf.approvals.secondApprovedAt = new Date().toISOString();
    wf.state = 'READY';
    wf.updatedAt = new Date().toISOString();

    recordAuditLog({
      actor: currentUser,
      action: 'WORKFLOW_SECOND_APPROVAL_LEVEL_D',
      resource: 'WORKFLOW_ENGINE',
      targetId: wf.id,
      plantId: wf.plantId,
      payload: { decision: 'DUAL_APPROVED_COMPLETE' },
      correlationId: req.correlationId
    });

    res.json({
      success: true,
      message: 'Dual Approval hoàn tất cho quy trình Cấp 4 (Level D). Quy trình đã sẵn sàng thực thi (READY).',
      workflow: wf
    });
    return;
  }

  res.status(400).json({ error: 'ALREADY_APPROVED', message: 'Quy trình đã có đủ phê duyệt.' });
});

// Pause Workflow
automationRouter.post('/workflows/:id/pause', authMiddleware, requireRoles(['PRODUCTION_PLANNER', 'MANAGEMENT', 'SYSTEM_ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  const wf = WORKFLOWS_DB.find(w => w.id === req.params.id);
  if (!wf) {
    res.status(404).json({ error: 'NOT_FOUND' });
    return;
  }

  if (wf.state !== 'RUNNING') {
    res.status(400).json({ error: 'INVALID_STATE', message: 'Chỉ có thể tạm dừng quy trình đang ở trạng thái RUNNING.' });
    return;
  }

  wf.state = 'PAUSED';
  wf.updatedAt = new Date().toISOString();
  ACTIVE_CONCURRENCY_LOCKS.delete(wf.concurrencyKey);

  recordAuditLog({
    actor: req.user!,
    action: 'PAUSE_WORKFLOW',
    resource: 'WORKFLOW_ENGINE',
    targetId: wf.id,
    plantId: wf.plantId,
    payload: { reason: req.body.reason },
    correlationId: req.correlationId
  });

  res.json({ success: true, workflow: wf });
});

// Resume Workflow
automationRouter.post('/workflows/:id/resume', authMiddleware, requireRoles(['PRODUCTION_PLANNER', 'MANAGEMENT', 'SYSTEM_ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  const wf = WORKFLOWS_DB.find(w => w.id === req.params.id);
  if (!wf) {
    res.status(404).json({ error: 'NOT_FOUND' });
    return;
  }

  if (wf.state !== 'PAUSED') {
    res.status(400).json({ error: 'INVALID_STATE', message: 'Chỉ có thể tiếp tục quy trình đang ở trạng thái PAUSED.' });
    return;
  }

  // Re-acquire lock
  ACTIVE_CONCURRENCY_LOCKS.set(wf.concurrencyKey, wf.id);

  wf.state = 'RUNNING';
  wf.updatedAt = new Date().toISOString();

  recordAuditLog({
    actor: req.user!,
    action: 'RESUME_WORKFLOW',
    resource: 'WORKFLOW_ENGINE',
    targetId: wf.id,
    plantId: wf.plantId,
    correlationId: req.correlationId
  });

  res.json({ success: true, workflow: wf });
});

// Cancel Workflow
automationRouter.post('/workflows/:id/cancel', authMiddleware, requireRoles(['PRODUCTION_PLANNER', 'MANAGEMENT', 'SYSTEM_ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  const wf = WORKFLOWS_DB.find(w => w.id === req.params.id);
  if (!wf) {
    res.status(404).json({ error: 'NOT_FOUND' });
    return;
  }

  wf.state = 'CANCELLED';
  wf.updatedAt = new Date().toISOString();
  ACTIVE_CONCURRENCY_LOCKS.delete(wf.concurrencyKey);

  recordAuditLog({
    actor: req.user!,
    action: 'CANCEL_WORKFLOW',
    resource: 'WORKFLOW_ENGINE',
    targetId: wf.id,
    plantId: wf.plantId,
    payload: { reason: req.body.reason },
    correlationId: req.correlationId
  });

  res.json({ success: true, workflow: wf });
});

// --- 3.7 Automation Policy Engine ---
automationRouter.get('/policies', authMiddleware, (_req: AuthenticatedRequest, res: Response) => {
  res.json(AUTOMATION_POLICIES_DB);
});

automationRouter.post('/policies/evaluate', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { actionType, estimatedCostUsd, affectedPlantsCount, downtimeRiskHours } = req.body;

  let assignedLevel: RiskLevelAutomation = 'LEVEL_A';
  let reason = 'Thao tác chỉ đọc hoặc kiểm tra trạng thái.';

  if (downtimeRiskHours > 1 || affectedPlantsCount >= 3 || estimatedCostUsd > 10000) {
    assignedLevel = 'LEVEL_D';
    reason = 'Rủi ro gián đoạn sản xuất > 1h hoặc ảnh hưởng >= 3 nhà máy hoặc chi phí > $10,000.';
  } else if (actionType === 'DISPATCH_MATERIAL' || actionType === 'TRANSFER_ORDER' || estimatedCostUsd > 2000) {
    assignedLevel = 'LEVEL_C';
    reason = 'Tác động điều phối vật tư chuỗi cung ứng hoặc chi phí > $2,000.';
  } else if (actionType === 'STANDARDIZE_DATA' || actionType === 'DEDUPLICATE_STAGING') {
    assignedLevel = 'LEVEL_B';
    reason = 'Chuẩn hóa định dạng và xử lý dữ liệu staging.';
  }

  const policy = AUTOMATION_POLICIES_DB.find(p => p.level === assignedLevel)!;

  res.json({
    evaluatedLevel: assignedLevel,
    policy,
    reason,
    requiresHumanApproval: policy.requiresHumanApproval,
    requiresDualApproval: policy.requiresDualApproval,
    evaluatedAt: new Date().toISOString()
  });
});

// --- 3.8 Exception Queue (Failure Recovery & Reconciliation) ---
automationRouter.get('/exceptions', authMiddleware, (_req: AuthenticatedRequest, res: Response) => {
  res.json(EXCEPTION_QUEUE_DB);
});

automationRouter.get('/exceptions/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const exc = EXCEPTION_QUEUE_DB.find(e => e.id === req.params.id);
  if (!exc) {
    res.status(404).json({ error: 'NOT_FOUND' });
    return;
  }
  res.json(exc);
});

// Retry Exception Task
automationRouter.post('/exceptions/:id/retry', authMiddleware, requireRoles(['DATA_OPERATOR', 'EQUIPMENT_TECHNICIAN', 'MANAGEMENT', 'SYSTEM_ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  const exc = EXCEPTION_QUEUE_DB.find(e => e.id === req.params.id);
  if (!exc) {
    res.status(404).json({ error: 'NOT_FOUND' });
    return;
  }

  if (exc.retryAttempts >= exc.maxRetries) {
    res.status(400).json({
      error: 'MAX_RETRIES_EXCEEDED',
      message: `Đã vượt quá số lần thử lại tối đa (${exc.maxRetries}). Yêu cầu xử lý thủ công (Resolve).`
    });
    return;
  }

  exc.retryAttempts += 1;
  exc.status = 'RETRYING';

  // Simulate retry outcome
  setTimeout(() => {
    exc.status = 'RESOLVED';
    exc.resolvedAt = new Date().toISOString();
    exc.resolvedBy = req.user!.fullName;
    exc.resolutionNote = `Đã tự động phục hồi sau lần thử số ${exc.retryAttempts}.`;
  }, 500);

  recordAuditLog({
    actor: req.user!,
    action: 'RETRY_EXCEPTION_TASK',
    resource: 'EXCEPTION_QUEUE',
    targetId: exc.id,
    payload: { attempt: exc.retryAttempts },
    correlationId: req.correlationId
  });

  res.json({ success: true, message: `Đang thử lại lần thứ ${exc.retryAttempts}...`, exception: exc });
});

// Resolve Exception Manually
automationRouter.post('/exceptions/:id/resolve', authMiddleware, requireRoles(['DATA_OPERATOR', 'QC', 'MANAGEMENT', 'SYSTEM_ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  const exc = EXCEPTION_QUEUE_DB.find(e => e.id === req.params.id);
  if (!exc) {
    res.status(404).json({ error: 'NOT_FOUND' });
    return;
  }

  exc.status = 'RESOLVED';
  exc.resolvedAt = new Date().toISOString();
  exc.resolvedBy = req.user!.fullName;
  exc.resolutionNote = req.body.resolutionNote || 'Đã đối soát thủ công và xác nhận dữ liệu chính xác.';

  recordAuditLog({
    actor: req.user!,
    action: 'RESOLVE_EXCEPTION_MANUAL',
    resource: 'EXCEPTION_QUEUE',
    targetId: exc.id,
    payload: { note: exc.resolutionNote },
    correlationId: req.correlationId
  });

  res.json({ success: true, exception: exc });
});

// Discard Exception
automationRouter.post('/exceptions/:id/discard', authMiddleware, requireRoles(['MANAGEMENT', 'SYSTEM_ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  const exc = EXCEPTION_QUEUE_DB.find(e => e.id === req.params.id);
  if (!exc) {
    res.status(404).json({ error: 'NOT_FOUND' });
    return;
  }

  exc.status = 'DISCARDED';
  exc.resolvedAt = new Date().toISOString();
  exc.resolvedBy = req.user!.fullName;
  exc.resolutionNote = req.body.reason || 'Bỏ qua do dữ liệu kiểm thử không hợp lệ.';

  recordAuditLog({
    actor: req.user!,
    action: 'DISCARD_EXCEPTION',
    resource: 'EXCEPTION_QUEUE',
    targetId: exc.id,
    payload: { reason: exc.resolutionNote },
    correlationId: req.correlationId
  });

  res.json({ success: true, exception: exc });
});

// --- 3.9 Scheduler & Event Triggers ---
automationRouter.get('/schedules', authMiddleware, (_req: AuthenticatedRequest, res: Response) => {
  res.json(SCHEDULES_DB);
});

automationRouter.post('/schedules/trigger-event', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { eventType, plantId, payload } = req.body;

  if (!eventType) {
    res.status(400).json({ error: 'BAD_REQUEST', message: 'eventType is required.' });
    return;
  }

  const correlationId = req.correlationId || `CORR-EVT-${Date.now()}`;
  res.setHeader('x-correlation-id', correlationId);

  // Check event deduplication window (e.g. within last 10 seconds for same event & plant)
  const isDuplicate = false; // Simulated clean trigger

  recordAuditLog({
    actor: req.user!,
    action: 'TRIGGER_AUTOMATION_EVENT',
    resource: 'EVENT_TRIGGER',
    targetId: eventType,
    plantId: plantId || null,
    payload: sanitizePayload(payload),
    correlationId
  });

  res.json({
    success: true,
    eventType,
    plantId,
    dispatchedToWorkflowsCount: 1,
    correlationId,
    timestamp: new Date().toISOString(),
    message: `Sự kiện ${eventType} đã được tiếp nhận và kích hoạt pipeline xử lý.`
  });
});

// --- 3.10 Notification & Escalation ---
automationRouter.get('/notifications', authMiddleware, (_req: AuthenticatedRequest, res: Response) => {
  res.json(NOTIFICATIONS_DB);
});

automationRouter.post('/notifications/test-dispatch', authMiddleware, requireRoles(['MANAGEMENT', 'SYSTEM_ADMIN']), (req: AuthenticatedRequest, res: Response) => {
  const { channel, recipient, title, body, severity } = req.body;

  const newNotif: AutomationNotification = {
    id: `NOTIF-${Date.now().toString().slice(-5)}`,
    channel: channel || 'IN_APP',
    recipient: recipient || 'Hội đồng Điều hành',
    title: title || 'Thông báo tự động thử nghiệm',
    body: body || 'Kiểm tra đường truyền kênh thông báo',
    severity: severity || 'INFO',
    status: 'SENT',
    createdAt: new Date().toISOString(),
    correlationId: req.correlationId || `CORR-NOTIF-${Date.now()}`
  };

  NOTIFICATIONS_DB.unshift(newNotif);

  res.json({ success: true, notification: newNotif });
});
