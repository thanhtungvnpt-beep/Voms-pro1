import http from 'http';

// Helper to make HTTP request to local server
function makeRequest(options: {
  path: string;
  method: string;
  headers?: Record<string, string>;
  body?: any;
}): Promise<{ statusCode: number; data: any }> {
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
        resolve({ statusCode: res.statusCode || 0, data: parsed });
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
}

async function runAllTests() {
  console.log('=========================================================================');
  console.log('VOMS PRO PHASE 1 — AUTOMATED TRUST FOUNDATION & REGRESSION TEST SUITE');
  console.log('Compliance: ISO 9001:2015 / IATF 16949 / ISO 27001');
  console.log('Timestamp:', new Date().toISOString());
  console.log('=========================================================================\n');

  const TOKENS = {
    admin: 'Bearer token_admin_super_secret_9981',
    mgmt: 'Bearer token_mgmt_lead_access_5521',
    outsourcing: 'Bearer token_outsourcing_token_7719',
    daalVendor: 'Bearer token_vendor_daal_isolated_4401',
    ktechVendor: 'Bearer token_vendor_ktech_isolated_8820',
    operator: 'Bearer token_operator_entry_1109',
    auditor: 'Bearer token_auditor_readonly_9900'
  };

  // -------------------------------------------------------------------------
  // SUITE 1: AUTHENTICATION & TOKEN VERIFICATION
  // -------------------------------------------------------------------------
  try {
    const resNoAuth = await makeRequest({ path: '/api/v1/auth/me', method: 'GET' });
    assert(resNoAuth.statusCode === 401, 'Reject request missing Authorization header', 'AUTH', `Expected 401, got ${resNoAuth.statusCode}`, resNoAuth.statusCode, 401);

    const resBadToken = await makeRequest({
      path: '/api/v1/auth/me',
      method: 'GET',
      headers: { 'Authorization': 'Bearer bad_fake_token_123' }
    });
    assert(resBadToken.statusCode === 401, 'Reject unrecognized Bearer token', 'AUTH', `Expected 401, got ${resBadToken.statusCode}`, resBadToken.statusCode, 401);

    const resAdminAuth = await makeRequest({
      path: '/api/v1/auth/me',
      method: 'GET',
      headers: { 'Authorization': TOKENS.admin }
    });
    assert(resAdminAuth.statusCode === 200 && resAdminAuth.data?.user?.role === 'SYSTEM_ADMIN', 'Authenticate SYSTEM_ADMIN successfully', 'AUTH', 'Admin token valid', resAdminAuth.statusCode, 200);

    const resProfiles = await makeRequest({ path: '/api/v1/auth/available-profiles', method: 'GET' });
    assert(resProfiles.statusCode === 200 && resProfiles.data?.profiles?.length >= 8, 'List 8 switchable enterprise roles', 'AUTH', 'All 8 roles available', resProfiles.statusCode, 200);
  } catch (err: any) {
    console.error('Error in SUITE 1:', err.message);
  }

  // -------------------------------------------------------------------------
  // SUITE 2: RBAC ROLE PERMISSIONS & VENDOR ISOLATION
  // -------------------------------------------------------------------------
  try {
    // DATA_OPERATOR cannot approve requests
    const resOpForbidden = await makeRequest({
      path: '/api/v1/approvals/APR-2026-001/decision',
      method: 'POST',
      headers: { 'Authorization': TOKENS.operator },
      body: { decision: 'APPROVE', reason: 'Attempt unauthorized approval' }
    });
    assert(resOpForbidden.statusCode === 403, 'Enforce RBAC: DATA_OPERATOR cannot approve actions', 'RBAC', `Expected 403, got ${resOpForbidden.statusCode}`, resOpForbidden.statusCode, 403);

    // Cross-vendor isolation: DAAL vendor manager cannot access KTECH approvals
    const resCrossVendor = await makeRequest({
      path: '/api/v1/approvals',
      method: 'POST',
      headers: { 'Authorization': TOKENS.daalVendor },
      body: {
        title: 'Tamper KTECH spindle',
        module: 'EQUIPMENT_OEE',
        plantId: 'KTECH', // Mismatched plant!
        actionType: 'MAINTENANCE_OVERRIDE',
        rollbackPlan: 'None'
      }
    });
    assert(resCrossVendor.statusCode === 403, 'Enforce Vendor Isolation: DAAL user blocked from KTECH resources', 'SECURITY', `Expected 403, got ${resCrossVendor.statusCode}`, resCrossVendor.statusCode, 403);
  } catch (err: any) {
    console.error('Error in SUITE 2:', err.message);
  }

  // -------------------------------------------------------------------------
  // SUITE 3: DATA TRUST CENTER & SCHEMA AUDIT ENGINE
  // -------------------------------------------------------------------------
  try {
    const resOverview = await makeRequest({ path: '/api/v1/data-trust/overview', method: 'GET' });
    assert(
      resOverview.statusCode === 200 && 
      resOverview.data?.isDemoMode === true && 
      resOverview.data?.banner?.includes('DEMO MODE'),
      'Data Trust Overview includes explicit DEMO MODE indicator',
      'DATA_TRUST',
      'Demo banner present and verified',
      resOverview.statusCode,
      200
    );

    const resSources = await makeRequest({ path: '/api/v1/data-trust/sources', method: 'GET' });
    assert(resSources.statusCode === 200 && resSources.data?.sources?.length === 7, 'Audit sources cover all 7 satellite plants', 'DATA_TRUST', '7 plants covered', resSources.statusCode, 200);

    // Test Schema Validation Rules
    const batchToValidate = [
      { id: 'REC-VALID-01', plantId: 'KHV', quantity: 1500, timestamp: '2026-10-25T08:00:00Z' },
      { id: 'REC-ERR-02', quantity: -50, timestamp: 'INVALID_TS' }, // Missing plantId, negative qty, bad timestamp
      { id: 'REC-VALID-01', plantId: 'KHV', quantity: 200, timestamp: '2026-10-25T08:05:00Z' } // Duplicate ID
    ];

    const resValidate = await makeRequest({
      path: '/api/v1/data-trust/validate',
      method: 'POST',
      headers: { 'Authorization': TOKENS.admin },
      body: { plantId: 'KHV', records: batchToValidate }
    });

    assert(
      resValidate.statusCode === 200 && 
      resValidate.data?.isValid === false && 
      resValidate.data?.errorCount >= 3,
      'Batch Schema Validator detects missing fields, negative values, and duplicate IDs',
      'DATA_TRUST',
      `Flagged ${resValidate.data?.errorCount} errors as expected`,
      resValidate.statusCode,
      200
    );
  } catch (err: any) {
    console.error('Error in SUITE 3:', err.message);
  }

  // -------------------------------------------------------------------------
  // SUITE 4: HUMAN-IN-THE-LOOP (HITL) WORKFLOW STATE MACHINE
  // -------------------------------------------------------------------------
  try {
    // Creator cannot self-approve
    // Let's create an approval as Outsourcing Group, then try to approve as Outsourcing Group
    const resCreate = await makeRequest({
      path: '/api/v1/approvals',
      method: 'POST',
      headers: { 'Authorization': TOKENS.outsourcing },
      body: {
        title: 'Dispatch Emergency Buffer Batch 100',
        module: 'MATERIAL_WAREHOUSE',
        plantId: 'DAAL',
        actionType: 'DISPATCH_MATERIAL',
        riskLevel: 'CRITICAL_P1',
        rollbackPlan: 'Cancel truck TK-88 and return inventory within 30m.',
        payload: { qty: 2000 }
      }
    });

    const newApprovalId = resCreate.data?.approval?.approvalId;
    assert(resCreate.statusCode === 201 && !!newApprovalId, 'Create Human-in-the-Loop approval request', 'HITL', `Created ${newApprovalId}`, resCreate.statusCode, 201);

    // Attempt self-approval by creator (Outsourcing)
    const resSelfApprove = await makeRequest({
      path: `/api/v1/approvals/${newApprovalId}/decision`,
      method: 'POST',
      headers: { 'Authorization': TOKENS.outsourcing },
      body: { decision: 'APPROVE', reason: 'Self-approval attempt' }
    });
    assert(
      resSelfApprove.statusCode === 403 && resSelfApprove.data?.error === 'SELF_APPROVAL_FORBIDDEN',
      'Enforce HITL Governance: Creator prohibited from self-approving their own action',
      'HITL',
      'Self-approval blocked with 403',
      resSelfApprove.statusCode,
      403
    );

    // Now approve with Management (different user)
    const resMgmtApprove = await makeRequest({
      path: `/api/v1/approvals/${newApprovalId}/decision`,
      method: 'POST',
      headers: { 'Authorization': TOKENS.mgmt },
      body: { decision: 'APPROVE', reason: 'Approved by Manufacturing Director per ISO SOP-04' }
    });
    assert(
      resMgmtApprove.statusCode === 200 && resMgmtApprove.data?.approval?.status === 'APPROVED',
      'Transition: SUBMITTED -> APPROVED by independent Manager',
      'HITL',
      'Status transitioned to APPROVED',
      resMgmtApprove.statusCode,
      200
    );

    // Execute approved action
    const resExecute = await makeRequest({
      path: `/api/v1/approvals/${newApprovalId}/execute`,
      method: 'POST',
      headers: { 'Authorization': TOKENS.admin }
    });
    assert(
      resExecute.statusCode === 200 && resExecute.data?.approval?.status === 'COMPLETED',
      'Transition: APPROVED -> EXECUTING -> COMPLETED with execution snapshot',
      'HITL',
      'Action completed successfully',
      resExecute.statusCode,
      200
    );
  } catch (err: any) {
    console.error('Error in SUITE 4:', err.message);
  }

  // -------------------------------------------------------------------------
  // SUITE 5: AUDIT TRAIL IMMUTABILITY & TAMPER DETECTION
  // -------------------------------------------------------------------------
  try {
    const resLogs = await makeRequest({
      path: '/api/v1/audit/logs',
      method: 'GET',
      headers: { 'Authorization': TOKENS.admin }
    });
    assert(resLogs.statusCode === 200 && resLogs.data?.logs?.length > 0, 'Query immutable audit logs', 'AUDIT', `Found ${resLogs.data?.logs?.length} logs`, resLogs.statusCode, 200);

    const firstLog = resLogs.data?.logs?.[0];
    if (firstLog) {
      const resVerify = await makeRequest({
        path: `/api/v1/audit/verify/${firstLog.eventId}`,
        method: 'GET',
        headers: { 'Authorization': TOKENS.admin }
      });
      assert(
        resVerify.statusCode === 200 && resVerify.data?.isValid === true,
        'Verify SHA-256 cryptographic integrity hash for audit log',
        'AUDIT',
        'Hash verified 100% untampered',
        resVerify.statusCode,
        200
      );
    }
  } catch (err: any) {
    console.error('Error in SUITE 5:', err.message);
  }

  // -------------------------------------------------------------------------
  // SUITE 6: REGRESSION TESTS (EXISTING OPERATIONAL ENDPOINTS)
  // -------------------------------------------------------------------------
  try {
    const resSysInfo = await makeRequest({ path: '/api/v1/system/info', method: 'GET' });
    assert(resSysInfo.statusCode === 200 && resSysInfo.data?.status === 'ONLINE', 'Regression: /api/v1/system/info is active', 'REGRESSION', 'Online', resSysInfo.statusCode, 200);

    const resTelemetry = await makeRequest({ path: '/api/v1/telemetry/live', method: 'GET' });
    assert(resTelemetry.statusCode === 200 && resTelemetry.data?.plants?.length === 7, 'Regression: /api/v1/telemetry/live returns all 7 plants', 'REGRESSION', '7 plants active', resTelemetry.statusCode, 200);

    const resCausal = await makeRequest({ path: '/api/v1/causal/graph', method: 'GET' });
    assert(resCausal.statusCode === 200 && Array.isArray(resCausal.data), 'Regression: /api/v1/causal/graph causal edges intact', 'REGRESSION', 'Causal graph ok', resCausal.statusCode, 200);

    const resLogistics = await makeRequest({ path: '/api/v1/logistics/transfer-orders', method: 'GET' });
    assert(resLogistics.statusCode === 200 && Array.isArray(resLogistics.data), 'Regression: /api/v1/logistics/transfer-orders transfer orders intact', 'REGRESSION', 'Transfer orders ok', resLogistics.statusCode, 200);

    const resSim = await makeRequest({
      path: '/api/v1/simulation/counterfactual',
      method: 'POST',
      body: { scenario_type: 'BASELINE' }
    });
    assert(resSim.statusCode === 200 && resSim.data?.otd_rate === 68.0, 'Regression: /api/v1/simulation/counterfactual baseline scenario intact', 'REGRESSION', 'Simulation ok', resSim.statusCode, 200);
  } catch (err: any) {
    console.error('Error in SUITE 6:', err.message);
  }

  // -------------------------------------------------------------------------
  // REPORT SUMMARY
  // -------------------------------------------------------------------------
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = total - passed;

  console.log('\n=========================================================================');
  console.log(`TEST EXECUTION SUMMARY: ${passed}/${total} PASSED (${failed} FAILED)`);
  console.log('=========================================================================');

  results.forEach((r, idx) => {
    const symbol = r.passed ? '✓ PASS' : '✗ FAIL';
    console.log(`[${symbol}] [${r.suite}] #${idx + 1}: ${r.testName} (${r.message || ''})`);
  });

  console.log('\n=========================================================================');
  if (failed === 0) {
    console.log('ALL PHASE 1 TRUST FOUNDATION & REGRESSION TESTS PASSED CLEANLY.');
  } else {
    console.log(`WARNING: ${failed} TEST(S) FAILED. INSPECT OUTPUT.`);
  }
  console.log('=========================================================================\n');
}

runAllTests();
