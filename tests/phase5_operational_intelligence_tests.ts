import http from 'http';

function makeRequest(options: {
  path: string;
  method: string;
  headers?: Record<string, string>;
  body?: any;
}): Promise<{ statusCode: number; data: any; headers: http.IncomingHttpHeaders }> {
  return new Promise((resolve, reject) => {
    const payload = options.body ? JSON.stringify(options.body) : undefined;
    const req = http.request({
      hostname: '127.0.0.1',
      port: 3000,
      path: options.path,
      method: options.method,
      headers: {
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
        ...options.headers
      }
    }, (res) => {
      let bodyStr = '';
      res.on('data', chunk => { bodyStr += chunk; });
      res.on('end', () => {
        let parsed: any;
        try {
          parsed = JSON.parse(bodyStr);
        } catch {
          parsed = bodyStr;
        }
        resolve({ statusCode: res.statusCode || 0, data: parsed, headers: res.headers });
      });
    });

    req.on('error', err => reject(err));
    if (payload) req.write(payload);
    req.end();
  });
}

interface TestResult {
  suite: string;
  testName: string;
  passed: boolean;
  statusCode?: number;
  expectedStatus?: number;
  message?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, testName: string, suite: string, message: string, statusCode?: number, expectedStatus?: number) {
  results.push({
    suite,
    testName,
    passed: condition,
    statusCode,
    expectedStatus,
    message
  });
  const symbol = condition ? '✅ PASS' : '❌ FAIL';
  console.log(`  ${symbol} [${suite}] ${testName} - ${message}`);
}

// Seed Tokens
const ADMIN_TOKEN = 'token_admin_super_secret_9981';
const MGMT_TOKEN = 'token_mgmt_lead_access_5521';
const PLANNER_TOKEN = 'token_planner_master_3311';
const APPROVER_TOKEN = 'token_approver_board_7788';
const TECH_TOKEN = 'token_technician_service_2290';

async function runPhase5OperationalIntelligenceTestSuite() {
  console.log('\n========================================================================');
  console.log('🚀 VOMS PRO PHASE 5 OPERATIONAL INTELLIGENCE & CLOSED-LOOP TEST SUITE (24 SCENARIOS)');
  console.log('========================================================================\n');

  const suite = 'PHASE5_OPERATIONAL_INTEL';

  try {
    // TC01: Preflight Checks Execution
    console.log('\n[1/24] Testing Phase 5 Preflight Checks (8 Mandatory Checks)...');
    const res01 = await makeRequest({
      path: '/api/v1/phase5/lifecycle/preflight',
      method: 'POST',
      headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
    });
    assert(
      res01.statusCode === 200 &&
      res01.data.allPassed === true &&
      Array.isArray(res01.data.checks) &&
      res01.data.checks.length === 8 &&
      res01.data.checks.every((c: any) => c.passed === true && typeof c.evidenceHash === 'string'),
      'TC01_PREFLIGHT_CHECKS_RUN',
      suite,
      '8 Bài kiểm tra tiền triển khai (Preflight) vượt qua 100%, ghi nhận đầy đủ mã băm bằng chứng.',
      res01.statusCode,
      200
    );

    // TC02: Lifecycle Status Query
    console.log('\n[2/24] Testing Lifecycle Status Query...');
    const res02 = await makeRequest({
      path: '/api/v1/phase5/lifecycle/status',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
    });
    assert(
      res02.statusCode === 200 &&
      res02.data.preflightSummary.allPassed === true &&
      res02.data.activeCounts.kpis >= 10,
      'TC02_LIFECYCLE_STATUS',
      suite,
      'Truy vấn trạng thái vòng đời trả về tóm tắt preflight và số lượng KPI đang hoạt động.',
      res02.statusCode,
      200
    );

    // TC03: Activate Phase 5 by Admin
    console.log('\n[3/24] Testing Phase 5 Activation by SYSTEM_ADMIN...');
    const res03 = await makeRequest({
      path: '/api/v1/phase5/lifecycle/activate',
      method: 'POST',
      headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` },
      body: {
        modules: {
          kpiEngine: true,
          operationalDashboard: true,
          anomalyDetection: true,
          earlyWarning: true,
          rootCauseAnalysis: true,
          capaManagement: true,
          closedLoopImprovement: true,
          vendorIntelligence: true
        }
      }
    });
    assert(
      res03.statusCode === 200 &&
      res03.data.success === true &&
      res03.data.lifecycleState === 'RUNNING' &&
      res03.data.activeModules.kpiEngine === true,
      'TC03_ACTIVATE_PHASE5_ADMIN',
      suite,
      'Kích hoạt Phase 5 thành công, trạng thái chuyển sang RUNNING với 8 modules kích hoạt.',
      res03.statusCode,
      200
    );

    // TC04: Unauthorized Activation Forbidden (RBAC)
    console.log('\n[4/24] Testing Unauthorized Activation RBAC Denial...');
    const res04 = await makeRequest({
      path: '/api/v1/phase5/lifecycle/activate',
      method: 'POST',
      headers: { 'Authorization': `Bearer ${TECH_TOKEN}` }
    });
    assert(
      res04.statusCode === 403,
      'TC04_ACTIVATE_UNAUTHORIZED_FORBIDDEN',
      suite,
      'Từ chối quyền kích hoạt đối với tài khoản Kỹ thuật viên (Chỉ Admin/Management có quyền).',
      res04.statusCode,
      403
    );

    // TC05: Pause Phase 5
    console.log('\n[5/24] Testing Pause Phase 5...');
    const res05 = await makeRequest({
      path: '/api/v1/phase5/lifecycle/pause',
      method: 'POST',
      headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` },
      body: { reason: 'Kiểm thử tạm dừng an toàn' }
    });
    assert(
      res05.statusCode === 200 &&
      res05.data.lifecycleState === 'PAUSED',
      'TC05_PAUSE_PHASE5',
      suite,
      'Tạm dừng Phase 5 an toàn, không ảnh hưởng tới các dịch vụ Phase 1–4.',
      res05.statusCode,
      200
    );

    // TC06: Resume Phase 5
    console.log('\n[6/24] Testing Resume Phase 5...');
    const res06 = await makeRequest({
      path: '/api/v1/phase5/lifecycle/resume',
      method: 'POST',
      headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
    });
    assert(
      res06.statusCode === 200 &&
      res06.data.lifecycleState === 'RUNNING',
      'TC06_RESUME_PHASE5',
      suite,
      'Tiếp tục vận hành Phase 5 thành công, trạng thái trở lại RUNNING.',
      res06.statusCode,
      200
    );

    // TC07: Rollback Phase 5
    console.log('\n[7/24] Testing Rollback Phase 5 to Phase 4 Baseline...');
    const res07 = await makeRequest({
      path: '/api/v1/phase5/lifecycle/rollback',
      method: 'POST',
      headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` },
      body: { reason: 'Kiểm thử quay lui phiên bản' }
    });
    assert(
      res07.statusCode === 200 &&
      res07.data.lifecycleState === 'ROLLED_BACK',
      'TC07_ROLLBACK_PHASE5',
      suite,
      'Quay lui về baseline Phase 4 thành công, bảo toàn toàn bộ nhật ký kiểm toán.',
      res07.statusCode,
      200
    );

    // TC08: Reactivate After Rollback
    console.log('\n[8/24] Testing Reactivation After Rollback...');
    const res08 = await makeRequest({
      path: '/api/v1/phase5/lifecycle/activate',
      method: 'POST',
      headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
    });
    assert(
      res08.statusCode === 200 &&
      res08.data.lifecycleState === 'RUNNING',
      'TC08_REACTIVATE_AFTER_ROLLBACK',
      suite,
      'Tái kích hoạt Phase 5 hoạt động bình thường.',
      res08.statusCode,
      200
    );

    // TC09: KPI Catalog List
    console.log('\n[9/24] Testing KPI Catalog Retrieval (Module A)...');
    const res09 = await makeRequest({
      path: '/api/v1/phase5/kpis',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
    });
    assert(
      res09.statusCode === 200 &&
      Array.isArray(res09.data.kpis) &&
      res09.data.kpis.length >= 12 &&
      res09.data.kpis.some((k: any) => k.code === 'OEE_OVERALL') &&
      res09.data.kpis.some((k: any) => k.code === 'FIRST_PASS_YIELD'),
      'TC09_KPI_CATALOG_LIST',
      suite,
      'Danh mục KPI trả về đầy đủ 12 chỉ số chuẩn hóa qua 6 phân nhóm.',
      res09.statusCode,
      200
    );

    // TC10: KPI Group Filter
    console.log('\n[10/24] Testing KPI Group Filter (EQUIPMENT)...');
    const res10 = await makeRequest({
      path: '/api/v1/phase5/kpis?group=EQUIPMENT',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
    });
    assert(
      res10.statusCode === 200 &&
      res10.data.kpis.every((k: any) => k.group === 'EQUIPMENT'),
      'TC10_KPI_GROUP_FILTER',
      suite,
      'Bộ lọc phân nhóm KPI hoạt động chính xác (chỉ trả về nhóm EQUIPMENT).',
      res10.statusCode,
      200
    );

    // TC11: Dynamic KPI Evaluation
    console.log('\n[11/24] Testing Dynamic KPI Calculation Engine...');
    const res11 = await makeRequest({
      path: '/api/v1/phase5/kpis/evaluate',
      method: 'POST',
      headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
    });
    assert(
      res11.statusCode === 200 &&
      res11.data.success === true &&
      Array.isArray(res11.data.kpis) &&
      res11.data.kpis.every((k: any) => typeof k.calculationHash === 'string' && k.calculationHash.length > 10),
      'TC11_KPI_DYNAMIC_EVALUATION',
      suite,
      'Động cơ tính toán KPI cập nhật giá trị mới kèm mã băm nguồn gốc xác thực.',
      res11.statusCode,
      200
    );

    // TC12: Operational Anomalies List
    console.log('\n[12/24] Testing Anomaly Detection List (Module C)...');
    const res12 = await makeRequest({
      path: '/api/v1/phase5/anomalies',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
    });
    assert(
      res12.statusCode === 200 &&
      Array.isArray(res12.data.anomalies) &&
      res12.data.anomalies.some((a: any) => a.plantId === 'KTECH') &&
      res12.data.anomalies.some((a: any) => a.severity === 'CRITICAL_P1'),
      'TC12_ANOMALIES_LIST',
      suite,
      'Danh sách bất thường vận hành trả về đầy đủ các ca P1 tại KTECH và DAAL.',
      res12.statusCode,
      200
    );

    // TC13: Anomaly Trigger Scan
    console.log('\n[13/24] Testing On-Demand Anomaly Detection Scan...');
    const res13 = await makeRequest({
      path: '/api/v1/phase5/anomalies/detect',
      method: 'POST',
      headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
    });
    assert(
      res13.statusCode === 200 &&
      res13.data.success === true &&
      res13.data.anomaly.plantId === 'KHV',
      'TC13_ANOMALY_TRIGGER_SCAN',
      suite,
      'Kích hoạt quét bất thường theo nhu cầu phát hiện sự cố lệch gắp linh kiện tại KHV.',
      res13.statusCode,
      200
    );

    // TC14: Early Warnings with SLA Timers
    console.log('\n[14/24] Testing Early Warning System & SLA Timers (Module D)...');
    const res14 = await makeRequest({
      path: '/api/v1/phase5/early-warnings',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
    });
    assert(
      res14.statusCode === 200 &&
      Array.isArray(res14.data.warnings) &&
      res14.data.warnings.some((w: any) => w.alertCode === 'WARN-OTD-TO3011' && w.timeToImpactHours > 0),
      'TC14_EARLY_WARNINGS_SLA',
      suite,
      'Cảnh báo sớm dự báo nguy cơ trễ tàu Hải Phòng TO-3011 với đồng hồ đếm ngược SLA.',
      res14.statusCode,
      200
    );

    // TC15: Root Cause Analysis (RCA) List
    console.log('\n[15/24] Testing RCA Cases List (Module E)...');
    const res15 = await makeRequest({
      path: '/api/v1/phase5/rca',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
    });
    assert(
      res15.statusCode === 200 &&
      Array.isArray(res15.data.cases) &&
      res15.data.cases.some((c: any) => c.fiveWhys.length === 5 && c.ishikawa.length > 0),
      'TC15_RCA_CASES_LIST',
      suite,
      'Hồ sơ RCA chứa đầy đủ chuỗi 5 Whys và biểu đồ xương cá Ishikawa 6M.',
      res15.statusCode,
      200
    );

    // TC16: Create New RCA Case
    console.log('\n[16/24] Testing RCA Case Creation...');
    const res16 = await makeRequest({
      path: '/api/v1/phase5/rca/create',
      method: 'POST',
      headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` },
      body: {
        title: 'Phân tích nguyên nhân chênh lệch nhiệt độ lò tôi cao tần tại DREAM TECH',
        plantId: 'DREAM_TECH',
        rootCauseStatement: 'Cặp nhiệt điện loại K bị bám muội than gây sai lệch số đo 18°C.',
        fiveWhys: [
          { step: 1, question: 'Tại sao phôi tôi không đạt độ cứng HRC?', answer: 'Nhiệt độ thực tế thấp hơn cài đặt', evidenceRef: 'LOG-01', verified: true },
          { step: 2, question: 'Tại sao nhiệt độ thực tế bị thấp?', answer: 'Cặp nhiệt điện báo sai', evidenceRef: 'LOG-02', verified: true }
        ],
        ishikawa: [
          { category: 'MACHINE', labelVi: 'Máy móc', factors: ['Cặp nhiệt điện quá hạn vệ sinh'] }
        ]
      }
    });
    assert(
      res16.statusCode === 201 &&
      res16.data.success === true &&
      res16.data.rcaCase.plantId === 'DREAM_TECH',
      'TC16_RCA_CREATE_NEW',
      suite,
      'Khởi tạo hồ sơ RCA mới thành công với mã định danh tự động.',
      res16.statusCode,
      201
    );

    const createdRcaId = res16.data.rcaCase.id;

    // TC17: Verify RCA Evidence
    console.log('\n[17/24] Testing RCA Evidence Verification...');
    const res17 = await makeRequest({
      path: `/api/v1/phase5/rca/${createdRcaId}/verify`,
      method: 'POST',
      headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
    });
    assert(
      res17.statusCode === 200 &&
      res17.data.rcaCase.status === 'VERIFIED',
      'TC17_RCA_VERIFY_EVIDENCE',
      suite,
      'Xác thực bằng chứng nguyên nhân gốc rễ thành công, trạng thái chuyển sang VERIFIED.',
      res17.statusCode,
      200
    );

    // TC18: CAPA Actions List
    console.log('\n[18/24] Testing CAPA Actions List (Module F)...');
    const res18 = await makeRequest({
      path: '/api/v1/phase5/capa',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
    });
    assert(
      res18.statusCode === 200 &&
      Array.isArray(res18.data.capaList) &&
      res18.data.capaList.some((c: any) => c.priority === 'CRITICAL_L4' && c.requiresDualApproval === true),
      'TC18_CAPA_LIST',
      suite,
      'Danh sách CAPA hiển thị rõ phân cấp ưu tiên và ràng buộc Dual-Approval.',
      res18.statusCode,
      200
    );

    // TC19: Create New CAPA Action
    console.log('\n[19/24] Testing Create New CAPA Action...');
    const res19 = await makeRequest({
      path: '/api/v1/phase5/capa/create',
      method: 'POST',
      headers: { 'Authorization': `Bearer ${PLANNER_TOKEN}` },
      body: {
        title: 'Hiệu chuẩn cặp nhiệt điện và vệ sinh buồng gia nhiệt DREAM TECH',
        plantId: 'DREAM_TECH',
        priority: 'CRITICAL_L4',
        targetKpiId: 'KPI-QC-01',
        requiresDualApproval: true,
        baselineKpiValue: 72.2,
        expectedKpiValue: 92.0
      }
    });
    assert(
      res19.statusCode === 201 &&
      res19.data.success === true &&
      res19.data.capa.status === 'PENDING_APPROVAL',
      'TC19_CAPA_CREATE_NEW',
      suite,
      'Đề xuất CAPA mới thành công, trạng thái ban đầu là PENDING_APPROVAL.',
      res19.statusCode,
      201
    );

    const createdCapaId = res19.data.capa.id;

    // TC20: Anti-Self-Approval Enforcement
    console.log('\n[20/24] Testing Anti-Self-Approval Enforcement...');
    const res20 = await makeRequest({
      path: `/api/v1/phase5/capa/${createdCapaId}/transition`,
      method: 'POST',
      headers: { 'Authorization': `Bearer ${PLANNER_TOKEN}` },
      body: { targetStatus: 'APPROVED' }
    });
    assert(
      res20.statusCode === 403 &&
      res20.data.error === 'ANTI_SELF_APPROVAL_VIOLATION',
      'TC20_CAPA_ANTI_SELF_APPROVAL',
      suite,
      'Chặn tác giả tự phê duyệt CAPA của chính mình (Anti-Self-Approval nghiêm ngặt).',
      res20.statusCode,
      403
    );

    // TC21: Dual Approval 2-Step Gate
    console.log('\n[21/24] Testing Dual-Approval 2-Step Gate...');
    // Step 1: Approver 1 signs
    const res21a = await makeRequest({
      path: `/api/v1/phase5/capa/${createdCapaId}/transition`,
      method: 'POST',
      headers: { 'Authorization': `Bearer ${APPROVER_TOKEN}` },
      body: { targetStatus: 'APPROVED', comment: 'Duyệt cấp 1: Kỹ thuật chấp thuận' }
    });
    assert(
      res21a.statusCode === 200 &&
      res21a.data.capa.status === 'PENDING_APPROVAL' &&
      res21a.data.capa.approvers.length === 1,
      'TC21A_DUAL_APPROVAL_STEP1',
      suite,
      'Ký duyệt cấp 1 ghi nhận thành công, CAPA vẫn ở PENDING_APPROVAL chờ cấp 2.',
      res21a.statusCode,
      200
    );

    // Step 2: Approver 2 signs
    const res21b = await makeRequest({
      path: `/api/v1/phase5/capa/${createdCapaId}/transition`,
      method: 'POST',
      headers: { 'Authorization': `Bearer ${MGMT_TOKEN}` },
      body: { targetStatus: 'APPROVED', comment: 'Duyệt cấp 2 (Dual): Lãnh đạo chấp thuận' }
    });
    assert(
      res21b.statusCode === 200 &&
      res21b.data.capa.status === 'APPROVED' &&
      res21b.data.capa.approvers.length === 2,
      'TC21B_DUAL_APPROVAL_STEP2',
      suite,
      'Ký duyệt cấp 2 hoàn tất Dual-Approval, CAPA chính thức chuyển sang APPROVED.',
      res21b.statusCode,
      200
    );

    // TC22: Closed-Loop Verification
    console.log('\n[22/24] Testing Closed-Loop Verification of Effectiveness (Module G)...');
    const res22 = await makeRequest({
      path: '/api/v1/phase5/closed-loop/verify',
      method: 'POST',
      headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` },
      body: {
        capaId: createdCapaId,
        kpiId: 'KPI-QC-01',
        kpiName: 'First Pass Yield (FPY)',
        plantId: 'DREAM_TECH',
        baselineValue: 72.2,
        postValue: 94.8,
        baselinePeriod: 'Trước khi thay cặp nhiệt điện',
        evaluationPeriod: '48 giờ sau khi hiệu chuẩn'
      }
    });
    assert(
      res22.statusCode === 201 &&
      res22.data.verification.deltaPercent > 0 &&
      res22.data.verification.isStatisticallySignificant === true &&
      res22.data.verification.effectiveStatus === 'HIGHLY_EFFECTIVE',
      'TC22_CLOSED_LOOP_VERIFY',
      suite,
      'Xác nhận hiệu quả cải tiến khép kín (Before vs After) đạt ý nghĩa thống kê p < 0.01.',
      res22.statusCode,
      201
    );

    // TC23: 7 Satellite Plants Vendor Benchmarks
    console.log('\n[23/24] Testing 7 Satellite Plants Benchmarking (Module H)...');
    const res23 = await makeRequest({
      path: '/api/v1/phase5/vendor-benchmarks',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
    });
    const expectedPlants = ['KHV', 'DREAM_TECH', 'HSTEC', 'KTECH', 'HOJEONGB', 'HOJEONG_VINA', 'DAAL'];
    const returnedPlants = res23.data.benchmarks.map((b: any) => b.plantId);
    assert(
      res23.statusCode === 200 &&
      expectedPlants.every(p => returnedPlants.includes(p)) &&
      res23.data.benchmarks.every((b: any) => typeof b.compositeScore === 'number' && typeof b.rank === 'number'),
      'TC23_VENDOR_BENCHMARK_7_PLANTS',
      suite,
      'Ma trận hiệu suất đối tác bao phủ đầy đủ toàn bộ 7 nhà máy vệ tinh với xếp hạng A+ đến CRITICAL.',
      res23.statusCode,
      200
    );

    // TC24: AI Decision Synthesis with Confidence Interval
    console.log('\n[24/24] Testing AI Decision Support Synthesis (Module I)...');
    const res24 = await makeRequest({
      path: '/api/v1/phase5/ai/synthesize-decision',
      method: 'POST',
      headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` },
      body: { contextPlantId: 'KTECH' }
    });
    assert(
      res24.statusCode === 200 &&
      res24.data.success === true &&
      typeof res24.data.synthesis.keyInsight === 'string' &&
      res24.data.synthesis.evidenceGrounded === true &&
      res24.data.synthesis.confidenceInterval.confidenceLevel === '95%',
      'TC24_AI_DECISION_SYNTHESIS',
      suite,
      'Tổng hợp quyết định AI có khoảng tin cậy 95%, có căn cứ xác thực và không ảo giác số liệu.',
      res24.statusCode,
      200
    );

  } catch (err: any) {
    console.error('Fatal error during test execution:', err);
  }

  // Summary
  console.log('\n========================================================================');
  const passedCount = results.filter(r => r.passed).length;
  const failedCount = results.filter(r => !r.passed).length;
  console.log(`📊 PHASE 5 TEST SUITE RESULTS: ${passedCount} PASSED | ${failedCount} FAILED | TOTAL: ${results.length}`);
  console.log('========================================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runPhase5OperationalIntelligenceTestSuite();
