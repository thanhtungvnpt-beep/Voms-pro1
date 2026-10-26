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
  const symbol = condition ? '✓ PASS' : '✗ FAIL';
  console.log(`[${symbol}] [${suite}] ${testName} - ${message}`);
}

async function runPhase6Tests() {
  console.log('================================================================');
  console.log('  VOMS PRO PHASE 6: AI FIELD ASSISTANT & MOBILE INTELLIGENCE   ');
  console.log('  COMPREHENSIVE AUTOMATED VERIFICATION SUITE                  ');
  console.log('================================================================\n');

  try {
    // -------------------------------------------------------------
    // SUITE 1: Phase 6 Preflight Check & SHA-256 Evidence
    // -------------------------------------------------------------
    const preflightRes = await makeRequest({
      path: '/api/v1/phase6/lifecycle/preflight',
      method: 'POST',
      headers: { 'x-user-role': 'SYSTEM_ADMIN', 'x-user-id': 'QA_ENGINEER_01' }
    });

    assert(
      preflightRes.statusCode === 200 && preflightRes.data.success === true,
      'Phase 6 Preflight Execution',
      'Suite 1: Preflight & Evidence',
      `Executed preflight check returning status ${preflightRes.statusCode}`,
      preflightRes.statusCode,
      200
    );

    const checks = preflightRes.data.checks || [];
    assert(
      checks.length === 8,
      'Preflight Verifies 8 Mandatory Checks',
      'Suite 1: Preflight & Evidence',
      `Expected 8 preflight checks, received ${checks.length}`,
      checks.length,
      8
    );

    const evidenceHash = preflightRes.data.evidenceHash;
    assert(
      typeof evidenceHash === 'string' && evidenceHash.length === 64,
      'SHA-256 Audit Integrity Hash',
      'Suite 1: Preflight & Evidence',
      `Evidence SHA-256 generated with 64 hex chars: ${evidenceHash?.substring(0, 16)}...`
    );

    // -------------------------------------------------------------
    // SUITE 2: Lifecycle Status & RBAC Access Control
    // -------------------------------------------------------------
    const statusRes = await makeRequest({
      path: '/api/v1/phase6/lifecycle/status',
      method: 'GET'
    });

    assert(
      statusRes.statusCode === 200 && statusRes.data.success === true,
      'Get Phase 6 Lifecycle Status',
      'Suite 2: Lifecycle & RBAC',
      `Lifecycle status query succeeded, current state: ${statusRes.data.lifecycleState}`
    );

    // Test Unauthorized activation attempt
    const unauthActivateRes = await makeRequest({
      path: '/api/v1/phase6/lifecycle/activate',
      method: 'POST',
      headers: { 'x-user-role': 'OPERATOR_VIEW_ONLY' },
      body: { operator: 'UnauthorizedUser' }
    });

    assert(
      unauthActivateRes.statusCode === 403,
      'RBAC Gating on Master Activation (Unauthorized Role)',
      'Suite 2: Lifecycle & RBAC',
      `Forbidden 403 returned as expected for OPERATOR_VIEW_ONLY`,
      unauthActivateRes.statusCode,
      403
    );

    // Authorized activation
    const authActivateRes = await makeRequest({
      path: '/api/v1/phase6/lifecycle/activate',
      method: 'POST',
      headers: { 'x-user-role': 'SYSTEM_ADMIN', 'x-user-id': 'DIRECTOR_JEONG' },
      body: {
        operator: 'Director Jeong (System Admin)',
        approvedScope: 'ALL_PHASE6_MODULES',
        modules: {
          fieldAssistant: true,
          voiceAi: true,
          visionAi: true,
          mobileOperations: true,
          digitalWorkOrders: true,
          knowledgeHub: true,
          continuousLearning: true,
          expertEscalation: true
        }
      }
    });

    assert(
      authActivateRes.statusCode === 200 && authActivateRes.data.state === 'RUNNING',
      'Authorized Phase 6 Activation (SYSTEM_ADMIN)',
      'Suite 2: Lifecycle & RBAC',
      `Master Activation successful: Phase 6 state is RUNNING`,
      authActivateRes.statusCode,
      200
    );

    // -------------------------------------------------------------
    // SUITE 3: Lifecycle FSM Operations (Pause, Resume, Rollback)
    // -------------------------------------------------------------
    const pauseRes = await makeRequest({
      path: '/api/v1/phase6/lifecycle/pause',
      method: 'POST',
      headers: { 'x-user-role': 'SYSTEM_ADMIN' },
      body: { reason: 'Scheduled calibration' }
    });

    assert(
      pauseRes.statusCode === 200 && pauseRes.data.state === 'PAUSED',
      'Phase 6 Controlled Pause',
      'Suite 3: Lifecycle Operations',
      `System transitioned to PAUSED state safely`
    );

    const resumeRes = await makeRequest({
      path: '/api/v1/phase6/lifecycle/resume',
      method: 'POST',
      headers: { 'x-user-role': 'SYSTEM_ADMIN' },
      body: { operator: 'QA Lead' }
    });

    assert(
      resumeRes.statusCode === 200 && resumeRes.data.state === 'RUNNING',
      'Phase 6 Controlled Resume',
      'Suite 3: Lifecycle Operations',
      `System resumed back to RUNNING state safely`
    );

    // -------------------------------------------------------------
    // SUITE 4: Digital Work Orders & Incidents CRUD
    // -------------------------------------------------------------
    const listWoRes = await makeRequest({
      path: '/api/v1/phase6/work-orders',
      method: 'GET'
    });

    const workOrdersList = listWoRes.data.workOrders || [];
    assert(
      listWoRes.statusCode === 200 && Array.isArray(workOrdersList) && workOrdersList.length > 0,
      'List Field Work Orders',
      'Suite 4: Digital Work Orders',
      `Retrieved ${workOrdersList.length} work orders successfully`
    );

    // Filter by plant
    const plantWoRes = await makeRequest({
      path: '/api/v1/phase6/work-orders?plantId=KTECH',
      method: 'GET'
    });

    const ktechOrders = plantWoRes.data.workOrders || [];
    assert(
      plantWoRes.statusCode === 200 && ktechOrders.every((w: any) => w.plantId === 'KTECH'),
      'Filter Work Orders by Plant ID (KTECH)',
      'Suite 4: Digital Work Orders',
      `Filtered correctly to KTECH records (${ktechOrders.length} found)`
    );

    // Create New Incident Ticket
    const newIncidentRes = await makeRequest({
      path: '/api/v1/phase6/work-orders',
      method: 'POST',
      headers: { 'x-user-role': 'MAINTENANCE_TECH', 'x-user-id': 'TECH_NGUYEN_05' },
      body: {
        plantId: 'HOJEONG_VINA',
        equipmentCode: 'LASER-TRUMPF-03',
        equipmentName: 'Máy hàn Laser Trumpf Chuyền 3',
        title: 'Lệch chùm hội tụ quang học 0.15mm trên đầu cắt Laser Fiber #3',
        description: 'Vết cắt mép phôi bị bavia 0.2mm, nghi ngờ thấu kính bảo vệ dính khói xỉ',
        severity: 'HIGH',
        reportedBy: 'Nguyễn Văn Minh (Kỹ thuật viên Quang học)'
      }
    });

    const createdWo = newIncidentRes.data.workOrder;
    assert(
      newIncidentRes.statusCode === 200 && createdWo?.id?.startsWith('WO-'),
      'Create New Incident Work Order',
      'Suite 4: Digital Work Orders',
      `Created ticket ${createdWo?.id} with equipment ${createdWo?.equipmentCode}`
    );

    // Update status to IN_PROGRESS
    if (createdWo?.id) {
      const updateStatusRes = await makeRequest({
        path: `/api/v1/phase6/work-orders/${createdWo.id}/status`,
        method: 'PUT',
        headers: { 'x-user-role': 'MAINTENANCE_TECH' },
        body: {
          status: 'IN_PROGRESS',
          resolutionNotes: 'Bắt đầu quy trình kiểm tra theo SOP-LASER-CALIB-01',
          lotoApplied: true,
          safetyChecklistCompleted: true
        }
      });

      assert(
        updateStatusRes.statusCode === 200 && updateStatusRes.data.workOrder?.status === 'IN_PROGRESS',
        'Update Work Order Status (IN_PROGRESS with LOTO)',
        'Suite 4: Digital Work Orders',
        `Ticket ${createdWo.id} updated to IN_PROGRESS (LOTO: true)`
      );
    }

    // -------------------------------------------------------------
    // SUITE 5: Technical Knowledge Hub & SOP Search
    // -------------------------------------------------------------
    const searchKnowledgeRes = await makeRequest({
      path: '/api/v1/phase6/knowledge?query=laser',
      method: 'GET'
    });

    const articles = searchKnowledgeRes.data.articles || [];
    assert(
      searchKnowledgeRes.statusCode === 200 && articles.length > 0,
      'Search Technical Knowledge Hub',
      'Suite 5: Knowledge Hub',
      `Found ${articles.length} articles matching "laser"`
    );

    // Retrieve verified SOP by code
    const sopDetailRes = await makeRequest({
      path: '/api/v1/phase6/knowledge/SOP-CNC-SPINDLE-04',
      method: 'GET'
    });

    assert(
      sopDetailRes.statusCode === 200 && sopDetailRes.data.article?.code === 'SOP-CNC-SPINDLE-04',
      'Retrieve Verified SOP Detail (SOP-CNC-SPINDLE-04)',
      'Suite 5: Knowledge Hub',
      `Retrieved SOP ${sopDetailRes.data.article?.code} v${sopDetailRes.data.article?.version} (Rating: ${sopDetailRes.data.article?.helpfulnessRating}/5.0)`
    );

    // -------------------------------------------------------------
    // SUITE 6: Vision AI Industrial Defect Inspector
    // -------------------------------------------------------------
    const visionAnalysisRes = await makeRequest({
      path: '/api/v1/phase6/vision/analyze',
      method: 'POST',
      body: {
        equipmentCode: 'MAZAK-CNC-SPINDLE',
        imageUrl: 'data:image/jpeg;base64,mockCutterWearSample'
      }
    });

    const visionResult = visionAnalysisRes.data.result;
    assert(
      visionAnalysisRes.statusCode === 200 && Array.isArray(visionResult?.detectedDefects) && visionResult.detectedDefects.length > 0,
      'Vision AI Defect Analysis & Bounding Boxes',
      'Suite 6: Vision & Voice AI',
      `Detected ${visionResult?.detectedDefects?.length} defect(s) with confidence ${Math.round(visionResult?.detectedDefects?.[0]?.confidence * 100)}%`
    );

    assert(
      typeof visionResult?.recommendedSopId === 'string' && visionResult.recommendedSopId.length > 0,
      'Vision AI Recommends SOP Reference',
      'Suite 6: Vision & Voice AI',
      `Recommended SOP: ${visionResult?.recommendedSopId}`
    );

    // -------------------------------------------------------------
    // SUITE 7: Voice AI Speech & NLP Intent Session
    // -------------------------------------------------------------
    const voiceRes = await makeRequest({
      path: '/api/v1/phase6/voice/session',
      method: 'POST',
      body: {
        queryText: 'Máy phay Spindle rung quá mức cần làm gì?',
        user: 'Hoàng Quốc Việt'
      }
    });

    assert(
      voiceRes.statusCode === 200 && typeof voiceRes.data.spokenReply === 'string' && voiceRes.data.spokenReply.includes('SOP-CNC-SPINDLE-04'),
      'Voice AI Speech Intent Classification & Spoken Reply',
      'Suite 6: Vision & Voice AI',
      `Received spoken reply referencing SOP: ${voiceRes.data.spokenReply.substring(0, 60)}...`
    );

    // -------------------------------------------------------------
    // SUITE 8: Continuous Learning & Lesson Verification Pipeline
    // -------------------------------------------------------------
    const newLessonRes = await makeRequest({
      path: '/api/v1/phase6/learning/propose',
      method: 'POST',
      headers: { 'x-user-role': 'MAINTENANCE_TECH' },
      body: {
        plantId: 'KTECH',
        equipmentCode: 'CNC-MAKINO-01',
        symptom: 'Bavia nhôm 6061 khi gia công phay biên dạng mỏng',
        rootCauseVerified: 'Nhiệt tích tụ cục bộ làm biến dạng mép nhôm mỏng',
        resolutionAction: 'Tăng tốc độ tưới nguội áp suất cao và giảm feed-rate 8%',
        preventionGuideline: 'Sử dụng dung dịch làm mát Blaser Swisslube tỉ lệ 9.5%',
        proposedBy: 'Hoàng Quốc Việt (Kỹ thuật viên CNC KTECH)'
      }
    });

    const proposedLesson = newLessonRes.data.lesson;
    assert(
      newLessonRes.statusCode === 200 && proposedLesson?.status === 'PENDING_EXPERT_REVIEW',
      'Submit Field Improvement Lesson for Review',
      'Suite 7: Continuous Learning',
      `Submitted lesson ${proposedLesson?.id} with status ${proposedLesson?.status}`
    );

    // Verify Lesson by Senior Technical Authority
    if (proposedLesson?.id) {
      const verifyLessonRes = await makeRequest({
        path: '/api/v1/phase6/learning/verify',
        method: 'POST',
        headers: { 'x-user-role': 'SENIOR_ENGINEER' },
        body: {
          lessonId: proposedLesson.id,
          approve: true,
          reviewerName: 'Choi Jin-woo (Head of Technical Engineering)'
        }
      });

      assert(
        verifyLessonRes.statusCode === 200 && verifyLessonRes.data.lesson?.status === 'APPROVED_PUBLISHED',
        'Senior Tech Authority Verifies & Publishes Lesson',
        'Suite 7: Continuous Learning',
        `Lesson verified and published with article code ${verifyLessonRes.data.lesson?.publishedArticleCode}`
      );
    }

    // -------------------------------------------------------------
    // SUITE 9: Level 4 Expert Escalation & 30-min SLA
    // -------------------------------------------------------------
    const escalationRes = await makeRequest({
      path: '/api/v1/phase6/escalation/request',
      method: 'POST',
      body: {
        plantId: 'HOJEONG_VINA',
        equipmentCode: 'LASER-TRUMPF-03',
        requesterName: 'Nguyễn Văn Minh',
        urgency: 'CRITICAL_L4',
        assignedExpertGroup: 'OPTICAL_LASER_EXPERT',
        chatTranscriptSnippet: 'Lỗi E-602 không hiệu chuẩn được thấu kính sau 4 bước SOP',
        workOrderId: createdWo?.id || 'WO-2026-0894'
      }
    });

    const ticket = escalationRes.data.ticket;
    assert(
      escalationRes.statusCode === 200 && typeof ticket?.slaDeadline === 'string',
      'Trigger Level 4 Expert Escalation with 30-min SLA',
      'Suite 8: Expert Escalation',
      `Ticket ${ticket?.id} created with SLA deadline: ${ticket?.slaDeadline}`
    );

    // -------------------------------------------------------------
    // SUITE 10: Backward Compatibility with Phase 1–5 Endpoints
    // -------------------------------------------------------------
    const p5StatusRes = await makeRequest({
      path: '/api/v1/phase5/lifecycle/status',
      method: 'GET',
      headers: { 'Authorization': 'Bearer token_admin_super_secret_9981' }
    });

    assert(
      p5StatusRes.statusCode === 200,
      'Phase 5 Operational Intelligence Endpoint Preserved',
      'Suite 9: Backward Compatibility',
      `Phase 5 status endpoint responds 200 OK without regression`
    );

    const p1StatusRes = await makeRequest({
      path: '/api/v1/system/info',
      method: 'GET'
    });

    assert(
      p1StatusRes.statusCode === 200,
      'Core GMES Telemetry Endpoint Preserved',
      'Suite 9: Backward Compatibility',
      `Core /api/v1/system/info responds 200 OK`
    );

  } catch (err: any) {
    console.error('Fatal error during test suite execution:', err);
    assert(false, 'Unhandled Test Exception', 'Suite Error', err.message);
  }

  // -------------------------------------------------------------
  // Test Summary Report
  // -------------------------------------------------------------
  console.log('\n================================================================');
  console.log('                 PHASE 6 TEST SUITE SUMMARY                    ');
  console.log('================================================================');
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;
  const passRate = ((passed / total) * 100).toFixed(1);

  console.log(`Total Scenarios Tested : ${total}`);
  console.log(`Passed                 : ${passed}`);
  console.log(`Failed                 : ${failed}`);
  console.log(`Pass Rate              : ${passRate}%`);
  console.log('================================================================\n');

  if (failed > 0) {
    console.error(`ERROR: ${failed} tests failed!`);
    process.exit(1);
  } else {
    console.log('ALL PHASE 6 AUTOMATED VERIFICATION TESTS PASSED SUCCESSFULLY! (100%)');
    process.exit(0);
  }
}

runPhase6Tests();
