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
const PLANNER_TOKEN = 'token_planner_master_3311';
const APPROVER_TOKEN = 'token_approver_board_7788';
const MGMT_TOKEN = 'token_mgmt_lead_access_5521';
const TECH_TOKEN = 'token_technician_service_2290';

async function runPhase4AutomationTestSuite() {
  console.log('\n========================================================================');
  console.log('🚀 VOMS PRO PHASE 4 AUTOMATION & ORCHESTRATION TEST SUITE (22 SCENARIOS)');
  console.log('========================================================================\n');

  const suite = 'PHASE4_AUTOMATION_TESTS';

  try {
    // TC01: Overview KPIs & Honest Disclaimer
    console.log('\n[1/22] Testing Automation Overview & Honest Integration Disclaimer...');
    const res01 = await makeRequest({
      path: '/api/v1/automation/overview',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
    });
    assert(
      res01.statusCode === 200 &&
      typeof res01.data.activeWorkflows === 'number' &&
      typeof res01.data.waitingApprovals === 'number' &&
      typeof res01.data.honestDisclaimer === 'string' &&
      res01.data.honestDisclaimer.includes('Demo Mock Adapter'),
      'TC01_OVERVIEW_METRICS',
      suite,
      'Overview trả về đầy đủ KPIs và thông báo disclaimer trung thực về Mock Adapter.',
      res01.statusCode,
      200
    );

    // TC02: Integrations Catalog
    console.log('\n[2/22] Testing Integration Catalog...');
    const res02 = await makeRequest({
      path: '/api/v1/automation/integrations',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
    });
    assert(
      res02.statusCode === 200 &&
      Array.isArray(res02.data) &&
      res02.data.some((i: any) => i.id === 'INT-GMES-CORE') &&
      res02.data.some((i: any) => i.id === 'INT-RPA-CLUSTER'),
      'TC02_INTEGRATION_CATALOG',
      suite,
      'Danh mục kết nối có chứa GMES Core và RPA Cluster.',
      res02.statusCode,
      200
    );

    // TC03: Test Connection with Adapter Contract
    console.log('\n[3/22] Testing Adapter Connection Handshake...');
    const res03 = await makeRequest({
      path: '/api/v1/automation/integrations/INT-GMES-CORE/test-connection',
      method: 'POST',
      headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
    });
    assert(
      res03.statusCode === 200 &&
      res03.data.success === true &&
      res03.data.status === 'CONNECTED_MOCK' &&
      res03.data.isPhysicalConnected === false &&
      typeof res03.data.latencyMs === 'number',
      'TC03_TEST_CONNECTION_ADAPTER',
      suite,
      'Bắt tay Adapter thành công, độ trễ thực tế, xác nhận isPhysicalConnected=false.',
      res03.statusCode,
      200
    );

    // TC04: Circuit Breakers List
    console.log('\n[4/22] Testing Circuit Breakers List...');
    const res04 = await makeRequest({
      path: '/api/v1/automation/api/circuit-breakers',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
    });
    assert(
      res04.statusCode === 200 &&
      Array.isArray(res04.data) &&
      res04.data.some((cb: any) => cb.id === 'CB-GMES-01' && cb.state === 'CLOSED'),
      'TC04_CIRCUIT_BREAKER_LIST',
      suite,
      'Danh sách Circuit Breakers trả về đầy đủ các ngắt mạch trạng thái CLOSED.',
      res04.statusCode,
      200
    );

    // TC05: Circuit Breaker Reset
    console.log('\n[5/22] Testing Circuit Breaker Reset...');
    const res05 = await makeRequest({
      path: '/api/v1/automation/api/circuit-breakers/CB-GMES-01/reset',
      method: 'POST',
      headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
    });
    assert(
      res05.statusCode === 200 &&
      res05.data.success === true &&
      res05.data.circuitBreaker.state === 'CLOSED',
      'TC05_CIRCUIT_BREAKER_RESET',
      suite,
      'Reset Circuit Breaker thành công về trạng thái CLOSED.',
      res05.statusCode,
      200
    );

    // TC06: API Dispatch with Correlation ID
    console.log('\n[6/22] Testing Secure API Dispatch...');
    const testCorrId = `CORR-TEST-${Date.now()}`;
    const res06 = await makeRequest({
      path: '/api/v1/automation/api/dispatch',
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'x-correlation-id': testCorrId
      },
      body: {
        targetIntegrationId: 'INT-GMES-CORE',
        action: 'QUERY_BATCH_TELEMETRY',
        payload: { batchId: 'BATCH-2026-X1', queryDate: '2026-10-25' }
      }
    });
    assert(
      res06.statusCode === 200 &&
      res06.data.success === true &&
      res06.data.correlationId === testCorrId,
      'TC06_API_DISPATCH_NORMAL',
      suite,
      'API Dispatch thành công và bảo toàn Correlation ID.',
      res06.statusCode,
      200
    );

    // TC07: API Dispatch Idempotency Key Caching
    console.log('\n[7/22] Testing Dispatch Idempotency Key Handling...');
    const idempotencyKey = `IDEMP-KEY-UNIT-${Date.now()}`;
    const firstCall = await makeRequest({
      path: '/api/v1/automation/api/dispatch',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'x-idempotency-key': idempotencyKey
      },
      body: {
        targetIntegrationId: 'INT-MES-DAAL',
        action: 'CHECK_PRESSURE',
        payload: { line: 'LINE_1' }
      }
    });

    const secondCall = await makeRequest({
      path: '/api/v1/automation/api/dispatch',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'x-idempotency-key': idempotencyKey
      },
      body: {
        targetIntegrationId: 'INT-MES-DAAL',
        action: 'CHECK_PRESSURE',
        payload: { line: 'LINE_1' }
      }
    });

    assert(
      firstCall.statusCode === 200 &&
      secondCall.statusCode === 200 &&
      secondCall.data._idempotency?.isDuplicate === true &&
      secondCall.data.dispatchId === firstCall.data.dispatchId,
      'TC07_API_DISPATCH_IDEMPOTENCY',
      suite,
      'Kiểm tra Idempotency Key: Lần gọi thứ 2 nhận bản cache gốc và đánh dấu isDuplicate=true.',
      secondCall.statusCode,
      200
    );

    // TC08: Payload Sanitization (Redacting secrets)
    console.log('\n[8/22] Testing Data Sanitization for sensitive keys...');
    const res08 = await makeRequest({
      path: '/api/v1/automation/api/dispatch',
      method: 'POST',
      headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` },
      body: {
        targetIntegrationId: 'INT-GMES-CORE',
        action: 'SYNC_WITH_CREDS',
        payload: {
          username: 'admin',
          password: 'super_secret_password_123',
          apiKey: 'sec_key_44391',
          normalData: 'Safe telemetry payload'
        }
      }
    });
    assert(
      res08.statusCode === 200 &&
      res08.data.sanitizedPayload.password === '***REDACTED***' &&
      res08.data.sanitizedPayload.apiKey === '***REDACTED***' &&
      res08.data.sanitizedPayload.normalData === 'Safe telemetry payload',
      'TC08_API_DISPATCH_SANITIZATION',
      suite,
      'Payload Sanitization: Đã che dấu hoàn toàn password và apiKey thành ***REDACTED***.',
      res08.statusCode,
      200
    );

    // TC09: GMES 11-step Sync Execution
    console.log('\n[9/22] Testing 11-Step GMES Data Synchronization...');
    const res09 = await makeRequest({
      path: '/api/v1/automation/gmes-sync/trigger',
      method: 'POST',
      headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` },
      body: {
        syncType: 'MANUAL_FULL',
        plantIds: ['KHV', 'DREAM_TECH', 'HSTEC', 'KTECH', 'HOJEONGB', 'HOJEONG_VINA', 'DAAL']
      }
    });
    assert(
      res09.statusCode === 200 &&
      res09.data.status === 'COMPLETED' &&
      res09.data.steps.length === 11 &&
      res09.data.totalCommitted > 0 &&
      res09.data.isMockAdapter === true,
      'TC09_GMES_SYNC_11_STEPS',
      suite,
      'Đồng bộ GMES chạy trọn vẹn 11 bước lifecycle (từ mTLS tới Post-Sync Recon).',
      res09.statusCode,
      200
    );

    // TC10: GMES Sync Runs List
    console.log('\n[10/22] Testing GMES Sync Runs List...');
    const res10 = await makeRequest({
      path: '/api/v1/automation/gmes-sync/runs',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
    });
    assert(
      res10.statusCode === 200 &&
      Array.isArray(res10.data) &&
      res10.data.length >= 1,
      'TC10_GMES_SYNC_RUNS_LIST',
      suite,
      'Lấy danh sách lịch sử đồng bộ GMES thành công.',
      res10.statusCode,
      200
    );

    // TC11: GMES Staging Storage Inspection
    console.log('\n[11/22] Testing Staging Isolation Storage...');
    const res11 = await makeRequest({
      path: '/api/v1/automation/gmes-sync/staging',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
    });
    assert(
      res11.statusCode === 200 &&
      Array.isArray(res11.data) &&
      res11.data.some((r: any) => r.sourcePlantId === 'DAAL'),
      'TC11_GMES_STAGING_RECORDS',
      suite,
      'Vùng đệm cô lập Staging trả về các bản ghi cách ly từ DAAL.',
      res11.statusCode,
      200
    );

    // TC12: RPA Robot Fleet Catalog
    console.log('\n[12/22] Testing RPA Robot Fleet Catalog...');
    const res12 = await makeRequest({
      path: '/api/v1/automation/rpa/robots',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
    });
    assert(
      res12.statusCode === 200 &&
      Array.isArray(res12.data) &&
      res12.data.length === 4 &&
      res12.data.some((b: any) => b.id === 'RPA-BOT-01'),
      'TC12_RPA_ROBOT_CATALOG',
      suite,
      'Danh mục Robot RPA trả về đủ 4 robot vận hành cùng trạng thái heartbeat.',
      res12.statusCode,
      200
    );

    // TC13: RPA Job Trigger with Idempotency
    console.log('\n[13/22] Testing RPA Job Trigger...');
    const res13 = await makeRequest({
      path: '/api/v1/automation/rpa/robots/RPA-BOT-02/trigger',
      method: 'POST',
      headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` },
      body: { jobName: 'Đối soát hợp đồng TO-3018' }
    });
    assert(
      res13.statusCode === 200 &&
      res13.data.success === true &&
      res13.data.run.robotId === 'RPA-BOT-02',
      'TC13_RPA_TRIGGER_JOB',
      suite,
      'Giao việc cho Robot RPA thành công và cập nhật lịch sử chạy.',
      res13.statusCode,
      200
    );

    // TC14: RPA Kill Switch Emergency Stop
    console.log('\n[14/22] Testing RPA Kill Switch...');
    const res14 = await makeRequest({
      path: '/api/v1/automation/rpa/robots/RPA-BOT-04/kill-switch',
      method: 'POST',
      headers: { 'Authorization': `Bearer ${TECH_TOKEN}` },
      body: { reason: 'Kiểm thử dừng khẩn cấp Kill Switch' }
    });
    assert(
      res14.statusCode === 200 &&
      res14.data.success === true &&
      res14.data.robot.status === 'KILLED',
      'TC14_RPA_KILL_SWITCH',
      suite,
      'Kill switch ngắt robot thành công và chuyển trạng thái sang KILLED.',
      res14.statusCode,
      200
    );

    // TC15: Block RPA Job on KILLED robot
    console.log('\n[15/22] Testing Execution Block on KILLED Robot...');
    const res15 = await makeRequest({
      path: '/api/v1/automation/rpa/robots/RPA-BOT-04/trigger',
      method: 'POST',
      headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` },
      body: { jobName: 'Tác vụ sau khi bị kill' }
    });
    assert(
      res15.statusCode === 409 &&
      res15.data.error === 'ROBOT_KILLED',
      'TC15_RPA_BLOCKED_WHEN_KILLED',
      suite,
      'Từ chối kích hoạt job trên Robot đang bị KILLED (HTTP 409).',
      res15.statusCode,
      409
    );

    // TC16: Workflow Orchestration List
    console.log('\n[16/22] Testing Workflow Orchestration List...');
    const res16 = await makeRequest({
      path: '/api/v1/automation/workflows',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
    });
    assert(
      res16.statusCode === 200 &&
      Array.isArray(res16.data) &&
      res16.data.some((w: any) => w.id === 'WF-2026-001'),
      'TC16_WORKFLOW_LIST',
      suite,
      'Lấy danh sách Workflow thành công với WF-2026-001.',
      res16.statusCode,
      200
    );

    // TC17: Anti-Self-Approval Enforcement
    console.log('\n[17/22] Testing Anti-Self-Approval on Workflows...');
    // WF-2026-001 was created by USR-PLAN-09 (PLANNER_TOKEN). Planner attempts to self-approve:
    const res17 = await makeRequest({
      path: '/api/v1/automation/workflows/WF-2026-001/approve',
      method: 'POST',
      headers: { 'Authorization': `Bearer ${PLANNER_TOKEN}` } // Planner created this workflow!
    });
    // Should fail because either:
    // 1) role is PRODUCTION_PLANNER and requireRoles allows ['APPROVER', 'MANAGEMENT', 'SYSTEM_ADMIN'] (403 FORBIDDEN_ROLE)
    // 2) or if allowed role matches, anti-self-approval blocks creator (403 ANTI_SELF_APPROVAL_VIOLATION)
    assert(
      res17.statusCode === 403,
      'TC17_ANTI_SELF_APPROVAL',
      suite,
      'Anti-self-approval / Phân quyền ngăn chặn thành công người tạo tự phê duyệt (HTTP 403).',
      res17.statusCode,
      403
    );

    // TC18: Legitimate Human Approval for Level C Workflow
    console.log('\n[18/22] Testing Legitimate Human Approval for Level C...');
    const res18 = await makeRequest({
      path: '/api/v1/automation/workflows/WF-2026-001/approve',
      method: 'POST',
      headers: { 'Authorization': `Bearer ${APPROVER_TOKEN}` } // Distinct Approver
    });
    assert(
      res18.statusCode === 200 &&
      res18.data.success === true &&
      res18.data.workflow.state === 'READY',
      'TC18_WORKFLOW_LEVEL_C_APPROVAL',
      suite,
      'Phê duyệt hợp lệ từ người độc lập thành công, trạng thái chuyển sang READY.',
      res18.statusCode,
      200
    );

    // TC19: Dual Approval for Level D Workflow
    console.log('\n[19/22] Testing Dual Approval for Level D Workflow...');
    // First approver: APPROVER_TOKEN
    const res19a = await makeRequest({
      path: '/api/v1/automation/workflows/WF-2026-002/approve',
      method: 'POST',
      headers: { 'Authorization': `Bearer ${APPROVER_TOKEN}` }
    });
    assert(
      res19a.statusCode === 200 &&
      res19a.data.workflow.state === 'WAITING_APPROVAL',
      'TC19A_LEVEL_D_FIRST_APPROVAL',
      suite,
      'Phê duyệt 1 cho Level D thành công; quy trình tiếp tục chờ Phê duyệt 2.',
      res19a.statusCode,
      200
    );

    // Second approver attempting with same user: Should fail!
    const res19b = await makeRequest({
      path: '/api/v1/automation/workflows/WF-2026-002/approve',
      method: 'POST',
      headers: { 'Authorization': `Bearer ${APPROVER_TOKEN}` }
    });
    assert(
      res19b.statusCode === 403 &&
      res19b.data.error === 'DUAL_APPROVAL_SAME_ACTOR',
      'TC19B_LEVEL_D_PREVENT_SAME_APPROVER',
      suite,
      'Ngăn chặn người thứ 1 tự làm người thứ 2 trong Dual Approval (HTTP 403).',
      res19b.statusCode,
      403
    );

    // Second approver with distinct Management role:
    const res19c = await makeRequest({
      path: '/api/v1/automation/workflows/WF-2026-002/approve',
      method: 'POST',
      headers: { 'Authorization': `Bearer ${MGMT_TOKEN}` }
    });
    assert(
      res19c.statusCode === 200 &&
      res19c.data.workflow.state === 'READY',
      'TC19C_LEVEL_D_DUAL_APPROVAL_COMPLETE',
      suite,
      'Dual Approval Level D hoàn tất từ 2 cá nhân độc lập; chuyển trạng thái sang READY.',
      res19c.statusCode,
      200
    );

    // TC20: Policy Evaluator Risk Tiering
    console.log('\n[20/22] Testing Policy Evaluator Risk Tiering...');
    const res20a = await makeRequest({
      path: '/api/v1/automation/policies/evaluate',
      method: 'POST',
      headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` },
      body: {
        actionType: 'QUERY_INVENTORY',
        estimatedCostUsd: 0,
        affectedPlantsCount: 1,
        downtimeRiskHours: 0
      }
    });
    const res20d = await makeRequest({
      path: '/api/v1/automation/policies/evaluate',
      method: 'POST',
      headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` },
      body: {
        actionType: 'STOP_LINE',
        estimatedCostUsd: 15000,
        affectedPlantsCount: 4,
        downtimeRiskHours: 2.5
      }
    });
    assert(
      res20a.statusCode === 200 &&
      res20a.data.evaluatedLevel === 'LEVEL_A' &&
      res20d.statusCode === 200 &&
      res20d.data.evaluatedLevel === 'LEVEL_D',
      'TC20_POLICY_EVALUATOR',
      suite,
      'Policy Evaluator phân loại chuẩn xác Level A cho kiểm kê và Level D cho dừng chuyền lớn.',
      res20d.statusCode,
      200
    );

    // TC21: Dead Letter Queue (DLQ) & Retry Mechanism
    console.log('\n[21/22] Testing Exception Queue DLQ & Retry Mechanism...');
    const res21a = await makeRequest({
      path: '/api/v1/automation/exceptions',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
    });
    const res21b = await makeRequest({
      path: '/api/v1/automation/exceptions/EXC-2026-001/retry',
      method: 'POST',
      headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
    });
    assert(
      res21a.statusCode === 200 &&
      Array.isArray(res21a.data) &&
      res21b.statusCode === 200 &&
      res21b.data.success === true,
      'TC21_EXCEPTION_QUEUE_DLQ',
      suite,
      'Hàng đợi ngoại lệ DLQ trả về danh sách và cho phép Retry tác vụ thất bại.',
      res21b.statusCode,
      200
    );

    // TC22: Event Trigger & Scheduler
    console.log('\n[22/22] Testing Event Trigger & Scheduler with Correlation ID...');
    const eventCorrId = `CORR-EVENT-${Date.now()}`;
    const res22 = await makeRequest({
      path: '/api/v1/automation/schedules/trigger-event',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'x-correlation-id': eventCorrId
      },
      body: {
        eventType: 'STOCKOUT_WARNING_TRIGGER',
        plantId: 'DAAL',
        payload: { materialCode: 'ALU-A980', currentStockKg: 200 }
      }
    });
    assert(
      res22.statusCode === 200 &&
      res22.data.success === true &&
      res22.data.correlationId === eventCorrId,
      'TC22_EVENT_TRIGGER_SCHEDULER',
      suite,
      'Event Trigger kích hoạt pipeline tự động và lưu vết Correlation ID.',
      res22.statusCode,
      200
    );

  } catch (error: any) {
    console.error('Lỗi nghiêm trọng khi thực thi test suite:', error);
    assert(false, 'TEST_SUITE_CRASH', suite, `Lỗi không mong muốn: ${error.message}`);
  }

  // Summary Report
  console.log('\n========================================================================');
  console.log('📊 VOMS PRO PHASE 4 AUTOMATION TEST SUITE EXECUTION SUMMARY');
  console.log('========================================================================');
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  console.log(`Tổng số kịch bản kiểm thử: ${total}`);
  console.log(`Thành công (PASS):         ${passed}`);
  console.log(`Thất bại (FAIL):           ${failed}`);
  console.log(`Tỷ lệ đạt chuẩn:           ${((passed / total) * 100).toFixed(1)}%`);
  console.log('========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runPhase4AutomationTestSuite();
