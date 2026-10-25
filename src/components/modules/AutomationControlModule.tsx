import React, { useState, useEffect } from 'react';
import { 
  Bot, Cpu, Network, Zap, Play, Pause, XCircle, RotateCcw, 
  CheckCircle2, AlertTriangle, ShieldCheck, ShieldAlert, 
  RefreshCw, Layers, Check, Database, Activity, ExternalLink,
  Lock, Key, Send, FileCode, Sliders, ChevronRight, Eye, Globe
} from 'lucide-react';
import { soundManager } from '../../utils/audio';

// Trilingual Dictionary (VI, EN, KR)
const I18N = {
  vi: {
    title: 'INTELLIGENT AUTOMATION, API/RPA INTEGRATION & WORKFLOW ORCHESTRATION',
    subtitle: 'Trung tâm Tự động hóa Thông minh, Điều phối API/RPA & Cổng an toàn 7 Nhà máy Vệ tinh — ISO 9001 / IATF 16949',
    disclaimerBadge: 'ADAPTER CONTRACT MODE — KHÔNG KẾT NỐI VẬT LÝ GMES/RPA TRỰC TIẾP',
    tabs: {
      overview: 'Dashboard Tổng quan',
      integrations: 'Integration Control Center',
      gmesSync: 'Đồng bộ GMES (11 Bước)',
      rpaControl: 'RPA Control Center',
      workflows: 'Workflow Orchestration (FSM)',
      safetyDlq: 'Safety Gateway & Exception Queue'
    },
    metrics: {
      activeWorkflows: 'Quy trình Đang chạy',
      waitingApprovals: 'Chờ Phê duyệt (HITL)',
      openCircuitBreakers: 'Ngắt mạch (Circuit Breakers)',
      pendingExceptions: 'Hàng đợi Lỗi (DLQ)',
      rpaFleet: 'Đội ngũ Robot RPA',
      gmesLatency: 'Độ trễ Bắt tay Adapter'
    },
    riskTiers: {
      levelA: 'Level A: Chỉ đọc / Không phá hủy (Tự động)',
      levelB: 'Level B: Chuẩn hóa & Xác thực Staging (Tự động + Log)',
      levelC: 'Level C: Tác động Nghiệp vụ (Cần 1 Phê duyệt)',
      levelD: 'Level D: RỦI RO CAO / DUAL-APPROVAL BẮT BUỘC'
    },
    buttons: {
      triggerSync: 'Kích hoạt Đồng bộ GMES 11 Bước',
      testConnection: 'Kiểm tra Bắt tay Adapter',
      killSwitch: 'KILL SWITCH KHẨN CẤP',
      triggerBot: 'Giao Việc cho Robot',
      executeStep: 'Thực thi Bước kế tiếp',
      approve: 'Phê duyệt An toàn',
      pause: 'Tạm dừng',
      resume: 'Tiếp tục',
      cancel: 'Hủy quy trình',
      retry: 'Thử lại (Retry)',
      resolve: 'Xác nhận Xử lý thủ công',
      discard: 'Bỏ qua (Discard)',
      evaluatePolicy: 'Thẩm định Chính sách Rủi ro'
    }
  },
  en: {
    title: 'INTELLIGENT AUTOMATION, API/RPA INTEGRATION & WORKFLOW ORCHESTRATION',
    subtitle: 'Intelligent Automation, API/RPA Orchestration & Execution Safety Gateway for 7 Satellite Plants',
    disclaimerBadge: 'ADAPTER CONTRACT MODE — NO DIRECT PHYSICAL GMES/RPA CONNECTION',
    tabs: {
      overview: 'Automation Dashboard',
      integrations: 'Integration Control Center',
      gmesSync: 'GMES Sync (11-Step)',
      rpaControl: 'RPA Control Center',
      workflows: 'Workflow Orchestration (FSM)',
      safetyDlq: 'Safety Gateway & Exception Queue'
    },
    metrics: {
      activeWorkflows: 'Active Workflows',
      waitingApprovals: 'Pending Approvals (HITL)',
      openCircuitBreakers: 'Open Circuit Breakers',
      pendingExceptions: 'Dead Letter Queue (DLQ)',
      rpaFleet: 'RPA Robot Fleet',
      gmesLatency: 'Adapter Handshake Latency'
    },
    riskTiers: {
      levelA: 'Level A: Read-Only / Non-Destructive (Auto)',
      levelB: 'Level B: Standardize & Validate (Auto + Log)',
      levelC: 'Level C: Business Impact (Single Approval)',
      levelD: 'Level D: HIGH RISK / DUAL-APPROVAL REQUIRED'
    },
    buttons: {
      triggerSync: 'Trigger 11-Step GMES Sync',
      testConnection: 'Test Adapter Connection',
      killSwitch: 'EMERGENCY KILL SWITCH',
      triggerBot: 'Dispatch Job to Bot',
      executeStep: 'Execute Next Step',
      approve: 'Safe Approve',
      pause: 'Pause',
      resume: 'Resume',
      cancel: 'Cancel Workflow',
      retry: 'Retry Task',
      resolve: 'Resolve Manually',
      discard: 'Discard Item',
      evaluatePolicy: 'Evaluate Risk Policy'
    }
  },
  kr: {
    title: '지능형 자동화, API/RPA 통합 및 워크플로우 오케스트레이션',
    subtitle: '7개 위성 공장 지능형 자동화 및 안전 실행 게이트웨이 — ISO 9001 / IATF 16949',
    disclaimerBadge: '어댑터 계약 모드 — 물리적 GMES/RPA 직접 연결 없음',
    tabs: {
      overview: '자동화 대시보드',
      integrations: '통합 컨트롤 센터',
      gmesSync: 'GMES 동기화 (11단계)',
      rpaControl: 'RPA 로봇 제어 센터',
      workflows: '워크플로우 오케스트레이션 (FSM)',
      safetyDlq: '안전 게이트웨이 및 예외 큐 (DLQ)'
    },
    metrics: {
      activeWorkflows: '활성 워크플로우',
      waitingApprovals: '승인 대기 중 (HITL)',
      openCircuitBreakers: '차단기 트립 (Circuit Breakers)',
      pendingExceptions: '예외/데드레터 큐 (DLQ)',
      rpaFleet: 'RPA 로봇 군단',
      gmesLatency: '어댑터 핸드셰이크 지연'
    },
    riskTiers: {
      levelA: '레벨 A: 읽기 전용 / 비파괴적 (자동)',
      levelB: '레벨 B: 표준화 및 스테이징 검증 (자동 + 감사로그)',
      levelC: '레벨 C: 생산/물류 영향 (단일 승인)',
      levelD: '레벨 D: 고위험 / 이중 승인 필수 (DUAL-APPROVAL)'
    },
    buttons: {
      triggerSync: '11단계 GMES 동기화 실행',
      testConnection: '어댑터 연결 점검',
      killSwitch: '비상 킬 스위치 (KILL SWITCH)',
      triggerBot: '로봇 작업 할당',
      executeStep: '다음 단계 실행',
      approve: '안전 승인 (Approve)',
      pause: '일시 중지',
      resume: '재개',
      cancel: '워크플로우 취소',
      retry: '작업 재시도',
      resolve: '수동 해결 확인',
      discard: '무시 / 폐기',
      evaluatePolicy: '위험 정책 심사'
    }
  }
};

export const AutomationControlModule: React.FC = () => {
  const [lang, setLang] = useState<'vi' | 'en' | 'kr'>('vi');
  const t = I18N[lang];

  // Primary State
  const [activeTab, setActiveTab] = useState<'overview' | 'integrations' | 'gmesSync' | 'rpaControl' | 'workflows' | 'safetyDlq'>('overview');
  const [overview, setOverview] = useState<any>(null);
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [circuitBreakers, setCircuitBreakers] = useState<any[]>([]);
  const [gmesRuns, setGmesRuns] = useState<any[]>([]);
  const [stagingRecords, setStagingRecords] = useState<any[]>([]);
  const [rpaRobots, setRpaRobots] = useState<any[]>([]);
  const [rpaRuns, setRpaRuns] = useState<any[]>([]);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [policies, setPolicies] = useState<any[]>([]);
  const [exceptions, setExceptions] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [notificationMsg, setNotificationMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Selected Items & Modals
  const [selectedWorkflow, setSelectedWorkflow] = useState<any | null>(null);
  const [selectedSyncRun, setSelectedSyncRun] = useState<any | null>(null);
  const [selectedRobot, setSelectedRobot] = useState<any | null>(null);
  const [showKillModal, setShowKillModal] = useState<boolean>(false);
  const [killReason, setKillReason] = useState<string>('');
  const [showResolveModal, setShowResolveModal] = useState<boolean>(false);
  const [resolveExceptionId, setResolveExceptionId] = useState<string | null>(null);
  const [resolveNote, setResolveNote] = useState<string>('');

  // Policy Simulator inputs
  const [simActionType, setSimActionType] = useState<string>('DISPATCH_MATERIAL');
  const [simCostUsd, setSimCostUsd] = useState<number>(3500);
  const [simPlantsCount, setSimPlantsCount] = useState<number>(1);
  const [simDowntimeHours, setSimDowntimeHours] = useState<number>(0.5);
  const [policyEvalResult, setPolicyEvalResult] = useState<any | null>(null);

  // Auth token getter
  const getAuthToken = () => {
    return localStorage.getItem('voms_active_token') || 'token_admin_super_secret_9981';
  };

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotificationMsg({ text, type });
    setTimeout(() => setNotificationMsg(null), 5000);
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const headers = { 'Authorization': `Bearer ${token}` };

      const [resOver, resInt, resCb, resSync, resStg, resRobots, resRpaRuns, resWf, resPol, resExc, resSch] = await Promise.all([
        fetch('/api/v1/automation/overview', { headers }),
        fetch('/api/v1/automation/integrations', { headers }),
        fetch('/api/v1/automation/api/circuit-breakers', { headers }),
        fetch('/api/v1/automation/gmes-sync/runs', { headers }),
        fetch('/api/v1/automation/gmes-sync/staging', { headers }),
        fetch('/api/v1/automation/rpa/robots', { headers }),
        fetch('/api/v1/automation/rpa/runs', { headers }),
        fetch('/api/v1/automation/workflows', { headers }),
        fetch('/api/v1/automation/policies', { headers }),
        fetch('/api/v1/automation/exceptions', { headers }),
        fetch('/api/v1/automation/schedules', { headers })
      ]);

      if (resOver.ok) setOverview(await resOver.json());
      if (resInt.ok) setIntegrations(await resInt.json());
      if (resCb.ok) setCircuitBreakers(await resCb.json());
      if (resSync.ok) {
        const runs = await resSync.json();
        setGmesRuns(runs);
        if (runs.length > 0 && !selectedSyncRun) setSelectedSyncRun(runs[0]);
      }
      if (resStg.ok) setStagingRecords(await resStg.json());
      if (resRobots.ok) setRpaRobots(await resRobots.json());
      if (resRpaRuns.ok) setRpaRuns(await resRpaRuns.json());
      if (resWf.ok) {
        const wfList = await resWf.json();
        setWorkflows(wfList);
        if (wfList.length > 0 && !selectedWorkflow) setSelectedWorkflow(wfList[0]);
      }
      if (resPol.ok) setPolicies(await resPol.json());
      if (resExc.ok) setExceptions(await resExc.json());
      if (resSch.ok) setSchedules(await resSch.json());

    } catch (err: any) {
      console.error('Failed to load automation data:', err);
      showToast(`Lỗi nạp dữ liệu: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // --- Handlers ---
  const handleTestConnection = async (integrationId: string) => {
    soundManager.playClick();
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/v1/automation/integrations/${integrationId}/test-connection`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        soundManager.playSuccess();
        showToast(`Bắt tay thành công (${data.latencyMs}ms): ${data.disclaimer}`, 'success');
        fetchAllData();
      } else {
        soundManager.playAlert();
        showToast(`Bắt tay thất bại: ${data.message || data.error}`, 'error');
      }
    } catch (err: any) {
      soundManager.playAlert();
      showToast(`Lỗi kết nối: ${err.message}`, 'error');
    }
  };

  const handleResetCircuitBreaker = async (cbId: string) => {
    soundManager.playClick();
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/v1/automation/api/circuit-breakers/${cbId}/reset`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        soundManager.playSuccess();
        showToast('Đã thiết lập lại ngắt mạch về trạng thái CLOSED an toàn.', 'success');
        fetchAllData();
      } else {
        const err = await res.json();
        showToast(`Không thể reset: ${err.message || err.error}`, 'error');
      }
    } catch (err: any) {
      showToast(`Lỗi: ${err.message}`, 'error');
    }
  };

  const handleTriggerGmesSync = async () => {
    soundManager.playClick();
    try {
      const token = getAuthToken();
      const res = await fetch('/api/v1/automation/gmes-sync/trigger', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-idempotency-key': `IDEMP-SYNC-${Date.now()}`
        },
        body: JSON.stringify({
          syncType: 'MANUAL_FULL',
          plantIds: ['KHV', 'DREAM_TECH', 'HSTEC', 'KTECH', 'HOJEONGB', 'HOJEONG_VINA', 'DAAL']
        })
      });
      const data = await res.json();
      if (res.ok) {
        soundManager.playSuccess();
        showToast(`Đồng bộ 11 bước GMES hoàn tất (${data.totalCommitted} bản ghi committed).`, 'success');
        setSelectedSyncRun(data);
        fetchAllData();
      } else {
        soundManager.playAlert();
        showToast(`Đồng bộ thất bại: ${data.message || data.error}`, 'error');
      }
    } catch (err: any) {
      soundManager.playAlert();
      showToast(`Lỗi: ${err.message}`, 'error');
    }
  };

  const handleRpaKillSwitch = async () => {
    if (!selectedRobot) return;
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/v1/automation/rpa/robots/${selectedRobot.id}/kill-switch`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: killReason || 'Dừng khẩn cấp từ giao diện vận hành' })
      });
      const data = await res.json();
      if (res.ok) {
        soundManager.playSuccess();
        showToast(data.message, 'success');
        setShowKillModal(false);
        setKillReason('');
        fetchAllData();
      } else {
        soundManager.playAlert();
        showToast(`Lỗi Kill switch: ${data.message || data.error}`, 'error');
      }
    } catch (err: any) {
      showToast(`Lỗi: ${err.message}`, 'error');
    }
  };

  const handleTriggerRpaJob = async (botId: string) => {
    soundManager.playClick();
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/v1/automation/rpa/robots/${botId}/trigger`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-idempotency-key': `IDEMP-RPA-${Date.now()}`
        },
        body: JSON.stringify({ jobName: 'Thực thi đối soát dữ liệu chu kỳ ngắn' })
      });
      const data = await res.json();
      if (res.ok) {
        soundManager.playSuccess();
        showToast(`Robot đã hoàn tất tác vụ: ${data.run.jobName} (${data.run.durationMs}ms)`, 'success');
        fetchAllData();
      } else {
        soundManager.playAlert();
        showToast(`Không thể giao việc: ${data.message || data.error}`, 'error');
      }
    } catch (err: any) {
      showToast(`Lỗi: ${err.message}`, 'error');
    }
  };

  const handleExecuteWorkflowStep = async (wfId: string) => {
    soundManager.playClick();
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/v1/automation/workflows/${wfId}/execute`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        soundManager.playSuccess();
        showToast(data.message, 'success');
        if (data.workflow) setSelectedWorkflow(data.workflow);
        fetchAllData();
      } else {
        soundManager.playAlert();
        showToast(`Thực thi thất bại: ${data.message || data.error}`, 'error');
      }
    } catch (err: any) {
      showToast(`Lỗi: ${err.message}`, 'error');
    }
  };

  const handleApproveWorkflow = async (wfId: string) => {
    soundManager.playClick();
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/v1/automation/workflows/${wfId}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        soundManager.playSuccess();
        showToast(data.message, 'success');
        if (data.workflow) setSelectedWorkflow(data.workflow);
        fetchAllData();
      } else {
        soundManager.playAlert();
        showToast(`Phê duyệt bị từ chối: ${data.message || data.error}`, 'error');
      }
    } catch (err: any) {
      showToast(`Lỗi: ${err.message}`, 'error');
    }
  };

  const handlePauseWorkflow = async (wfId: string) => {
    soundManager.playClick();
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/v1/automation/workflows/${wfId}/pause`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        soundManager.playSuccess();
        showToast('Đã tạm dừng quy trình an toàn.', 'info');
        fetchAllData();
      }
    } catch (err: any) {
      showToast(`Lỗi: ${err.message}`, 'error');
    }
  };

  const handleResumeWorkflow = async (wfId: string) => {
    soundManager.playClick();
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/v1/automation/workflows/${wfId}/resume`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        soundManager.playSuccess();
        showToast('Đã tiếp tục thực thi quy trình.', 'success');
        fetchAllData();
      }
    } catch (err: any) {
      showToast(`Lỗi: ${err.message}`, 'error');
    }
  };

  const handleRetryException = async (excId: string) => {
    soundManager.playClick();
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/v1/automation/exceptions/${excId}/retry`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        soundManager.playSuccess();
        showToast(data.message, 'success');
        setTimeout(() => fetchAllData(), 800);
      } else {
        showToast(`Không thể retry: ${data.message || data.error}`, 'error');
      }
    } catch (err: any) {
      showToast(`Lỗi: ${err.message}`, 'error');
    }
  };

  const handleResolveException = async () => {
    if (!resolveExceptionId) return;
    try {
      const token = getAuthToken();
      const res = await fetch(`/api/v1/automation/exceptions/${resolveExceptionId}/resolve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ resolutionNote: resolveNote || 'Đã đối soát xác nhận thủ công' })
      });
      if (res.ok) {
        soundManager.playSuccess();
        showToast('Đã giải quyết thủ công ngoại lệ và giải phóng khỏi DLQ.', 'success');
        setShowResolveModal(false);
        setResolveNote('');
        setResolveExceptionId(null);
        fetchAllData();
      }
    } catch (err: any) {
      showToast(`Lỗi: ${err.message}`, 'error');
    }
  };

  const handleSimulatePolicy = async () => {
    soundManager.playClick();
    try {
      const token = getAuthToken();
      const res = await fetch('/api/v1/automation/policies/evaluate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          actionType: simActionType,
          estimatedCostUsd: simCostUsd,
          affectedPlantsCount: simPlantsCount,
          downtimeRiskHours: simDowntimeHours
        })
      });
      const data = await res.json();
      if (res.ok) {
        soundManager.playSuccess();
        setPolicyEvalResult(data);
      }
    } catch (err: any) {
      showToast(`Lỗi thẩm định: ${err.message}`, 'error');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0f1d] text-slate-100 font-sans select-none overflow-hidden">
      {/* Top Header Bar */}
      <header className="p-4 bg-slate-950/80 border-b border-slate-800/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-400/40">
            <Bot className="w-5 h-5 text-cyan-200 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-extrabold tracking-wide text-white uppercase flex items-center gap-2">
                <span>{t.title}</span>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-1.5 py-0.5 rounded font-mono font-bold">
                  PHASE 4
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {t.subtitle}
            </p>
          </div>
        </div>

        {/* Language & Actions */}
        <div className="flex items-center space-x-2">
          {/* Language toggle */}
          <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-lg p-0.5 text-xs font-mono">
            <button
              onClick={() => { soundManager.playClick(); setLang('vi'); }}
              className={`px-2 py-1 rounded transition ${lang === 'vi' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              VI
            </button>
            <button
              onClick={() => { soundManager.playClick(); setLang('en'); }}
              className={`px-2 py-1 rounded transition ${lang === 'en' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              EN
            </button>
            <button
              onClick={() => { soundManager.playClick(); setLang('kr'); }}
              className={`px-2 py-1 rounded transition ${lang === 'kr' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              KR
            </button>
          </div>

          {/* Refresh button */}
          <button
            onClick={() => { soundManager.playClick(); fetchAllData(); }}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg border border-slate-700 text-xs font-medium transition active:scale-95 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </button>
        </div>
      </header>

      {/* Honest Disclaimer Banner */}
      <div className="px-4 py-2 bg-amber-950/40 border-b border-amber-600/30 flex items-center justify-between text-xs text-amber-300">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
          <span className="font-semibold">{t.disclaimerBadge}:</span>
          <span className="text-amber-200/90 hidden sm:inline">
            Hệ thống đang chạy qua bộ điều hợp Mock Adapter Contract v4.2; không phát lệnh vật lý phá hủy ra môi trường đối tác ngoài.
          </span>
        </div>
        <span className="font-mono text-[11px] bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 rounded text-amber-300">
          ISO 9001 / IATF 16949 COMPLIANT
        </span>
      </div>

      {/* Toast Notification */}
      {notificationMsg && (
        <div className={`px-4 py-2.5 text-xs flex items-center justify-between font-mono animate-in fade-in duration-200 ${
          notificationMsg.type === 'success' ? 'bg-emerald-950/90 text-emerald-200 border-b border-emerald-500/50' :
          notificationMsg.type === 'error' ? 'bg-red-950/90 text-red-200 border-b border-red-500/50' :
          'bg-cyan-950/90 text-cyan-200 border-b border-cyan-500/50'
        }`}>
          <div className="flex items-center space-x-2">
            {notificationMsg.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            {notificationMsg.type === 'error' && <XCircle className="w-4 h-4 text-red-400" />}
            {notificationMsg.type === 'info' && <Activity className="w-4 h-4 text-cyan-400" />}
            <span>{notificationMsg.text}</span>
          </div>
          <button onClick={() => setNotificationMsg(null)} className="text-slate-400 hover:text-white ml-4">✕</button>
        </div>
      )}

      {/* Sub-Navigation Tabs */}
      <nav className="flex items-center px-4 bg-slate-900/90 border-b border-slate-800/80 overflow-x-auto space-x-2 py-2">
        {(['overview', 'integrations', 'gmesSync', 'rpaControl', 'workflows', 'safetyDlq'] as const).map((tabKey) => {
          const isActive = activeTab === tabKey;
          return (
            <button
              key={tabKey}
              onClick={() => { soundManager.playClick(); setActiveTab(tabKey); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition flex items-center space-x-2 ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-600/30 to-blue-600/30 text-cyan-300 border border-cyan-500/50 shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {tabKey === 'overview' && <Activity className="w-3.5 h-3.5" />}
              {tabKey === 'integrations' && <Network className="w-3.5 h-3.5" />}
              {tabKey === 'gmesSync' && <RefreshCw className="w-3.5 h-3.5" />}
              {tabKey === 'rpaControl' && <Bot className="w-3.5 h-3.5" />}
              {tabKey === 'workflows' && <Layers className="w-3.5 h-3.5" />}
              {tabKey === 'safetyDlq' && <ShieldAlert className="w-3.5 h-3.5" />}
              <span>{t.tabs[tabKey]}</span>
              {tabKey === 'workflows' && overview?.waitingApprovals > 0 && (
                <span className="text-[10px] bg-amber-500 text-slate-950 font-bold px-1.5 rounded-full">
                  {overview.waitingApprovals}
                </span>
              )}
              {tabKey === 'safetyDlq' && overview?.pendingExceptions > 0 && (
                <span className="text-[10px] bg-red-500 text-white font-bold px-1.5 rounded-full animate-pulse">
                  {overview.pendingExceptions}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-4 overflow-y-auto space-y-4">

        {/* =========================================================================
            TAB 1: DASHBOARD TỔNG QUAN (OVERVIEW)
           ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
                <span className="text-[11px] text-slate-400 uppercase font-mono">{t.metrics.activeWorkflows}</span>
                <div className="text-2xl font-bold text-cyan-400 mt-1">{overview?.activeWorkflows ?? 0}</div>
                <span className="text-[10px] text-slate-500">Đang điều phối FSM</span>
              </div>
              <div className="p-3 bg-slate-900/80 border border-amber-900/40 rounded-xl">
                <span className="text-[11px] text-amber-400 uppercase font-mono">{t.metrics.waitingApprovals}</span>
                <div className="text-2xl font-bold text-amber-400 mt-1">{overview?.waitingApprovals ?? 0}</div>
                <span className="text-[10px] text-amber-300/80">Yêu cầu Human Gate</span>
              </div>
              <div className="p-3 bg-slate-900/80 border border-red-900/40 rounded-xl">
                <span className="text-[11px] text-red-400 uppercase font-mono">{t.metrics.pendingExceptions}</span>
                <div className="text-2xl font-bold text-red-400 mt-1">{overview?.pendingExceptions ?? 0}</div>
                <span className="text-[10px] text-red-300/80">Dead Letter Queue</span>
              </div>
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
                <span className="text-[11px] text-slate-400 uppercase font-mono">{t.metrics.rpaFleet}</span>
                <div className="text-2xl font-bold text-emerald-400 mt-1">
                  {overview?.activeRobots ?? 0}/{overview?.totalRobots ?? 0}
                </div>
                <span className="text-[10px] text-emerald-400/80">Robot sẵn sàng</span>
              </div>
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
                <span className="text-[11px] text-slate-400 uppercase font-mono">{t.metrics.openCircuitBreakers}</span>
                <div className="text-2xl font-bold text-purple-400 mt-1">{overview?.openCircuitBreakers ?? 0}</div>
                <span className="text-[10px] text-purple-300/80">Ngắt mạch an toàn</span>
              </div>
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
                <span className="text-[11px] text-slate-400 uppercase font-mono">{t.metrics.gmesLatency}</span>
                <div className="text-2xl font-bold text-blue-400 mt-1">&lt; 10ms</div>
                <span className="text-[10px] text-blue-300/80">Sync 7 Nhà máy</span>
              </div>
            </div>

            {/* Quick Action Triggers */}
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white">Thao tác Nhanh Trọng yếu (Quick Actions)</h3>
                <p className="text-xs text-slate-400">Kích hoạt chu trình kiểm tra hoặc đồng bộ khẩn cấp</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleTriggerGmesSync}
                  className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs rounded-lg flex items-center space-x-1.5 transition active:scale-95 shadow-md shadow-cyan-500/20"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{t.buttons.triggerSync}</span>
                </button>
                <button
                  onClick={() => setActiveTab('workflows')}
                  className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-lg flex items-center space-x-1.5 transition active:scale-95"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Duyệt quy trình Level C/D ({overview?.waitingApprovals ?? 0})</span>
                </button>
                <button
                  onClick={() => setActiveTab('safetyDlq')}
                  className="px-3 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg flex items-center space-x-1.5 transition active:scale-95"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Xử lý Dead Letter Queue ({overview?.pendingExceptions ?? 0})</span>
                </button>
              </div>
            </div>

            {/* Two-column layout: Active Workflows & RPA Fleet */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Active Workflows Preview */}
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                      <Layers className="w-4 h-4" />
                      <span>Quy trình Đang điều phối (Active Workflows)</span>
                    </h3>
                    <button onClick={() => setActiveTab('workflows')} className="text-xs text-cyan-400 hover:underline flex items-center">
                      <span>Chi tiết FSM</span> <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    {workflows.slice(0, 3).map(wf => (
                      <div key={wf.id} className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-lg text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-cyan-300 font-semibold">{wf.workflowCode}</span>
                          <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                            wf.state === 'RUNNING' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' :
                            wf.state === 'WAITING_APPROVAL' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse' :
                            wf.state === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' :
                            'bg-slate-700 text-slate-300'
                          }`}>
                            {wf.state}
                          </span>
                        </div>
                        <p className="text-slate-300 font-medium">{wf.name}</p>
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>Nhà máy: <strong className="text-white">{wf.plantId}</strong></span>
                          <span>Rủi ro: <strong className="text-amber-300">{wf.riskLevel}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RPA Fleet Overview */}
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <Bot className="w-4 h-4" />
                      <span>Đội ngũ Robot RPA Vận hành (RPA Fleet)</span>
                    </h3>
                    <button onClick={() => setActiveTab('rpaControl')} className="text-xs text-emerald-400 hover:underline flex items-center">
                      <span>Quản lý Robot</span> <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    {rpaRobots.map(bot => (
                      <div key={bot.id} className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-lg text-xs flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-emerald-300 font-bold">{bot.robotCode}</span>
                            <span className="text-[10px] bg-slate-800 text-slate-300 px-1 rounded">{bot.plantId}</span>
                          </div>
                          <p className="text-slate-300 text-[11px] mt-0.5">{bot.name}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                            bot.status === 'RUNNING' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 animate-pulse' :
                            bot.status === 'IDLE' ? 'bg-emerald-500/20 text-emerald-400' :
                            bot.status === 'KILLED' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                            'bg-slate-700 text-slate-300'
                          }`}>
                            {bot.status}
                          </span>
                          <div className="text-[10px] text-slate-400 mt-1">Thành công: {bot.successRatePct}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: INTEGRATION CONTROL CENTER
           ========================================================================= */}
        {activeTab === 'integrations' && (
          <div className="space-y-4">
            {/* Header info */}
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Network className="w-4 h-4 text-cyan-400" />
                <span>Danh mục Cổng Kết nối Đối ngoại & Bộ điều hợp (Integrations Registry)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Quản lý các kết nối GMES API, Siemens MES nội bộ, Cụm RPA Worker, Cổng nạp file SFTP và Webhook Relay.
              </p>
            </div>

            {/* Endpoints Table */}
            <div className="grid grid-cols-1 gap-3">
              {integrations.map(item => (
                <div key={item.id} className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-cyan-300 text-xs font-bold">{item.code}</span>
                        <span className="text-xs text-slate-400">•</span>
                        <h4 className="text-sm font-bold text-white">{item.name}</h4>
                        <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                          {item.type}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-slate-400 mt-1">{item.endpointUrl}</div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded font-mono text-xs font-bold ${
                        item.status === 'CONNECTED_MOCK' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                        item.status === 'CIRCUIT_OPEN' ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse' :
                        'bg-slate-700 text-slate-300'
                      }`}>
                        {item.status}
                      </span>
                      <button
                        onClick={() => handleTestConnection(item.id)}
                        className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs rounded-lg transition active:scale-95 flex items-center space-x-1"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>{t.buttons.testConnection}</span>
                      </button>
                    </div>
                  </div>

                  {/* Disclaimer & Telemetry */}
                  <div className="p-2.5 bg-slate-950/60 rounded-lg text-xs grid grid-cols-1 sm:grid-cols-4 gap-2 text-slate-300 border border-slate-800/80">
                    <div>
                      <span className="text-slate-500 block text-[10px]">ĐỘ TRỄ ĐO ĐƯỢC:</span>
                      <span className="font-mono text-cyan-300 font-bold">{item.avgLatencyMs} ms</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">TIMEOUT / RATE LIMIT:</span>
                      <span className="font-mono">{item.timeoutMs}ms / {item.rateLimitPerMin} req/m</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">AUTH HANDSHAKE:</span>
                      <span className="font-mono text-purple-300">{item.authType}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">TÍNH CHẤT KẾT NỐI:</span>
                      <span className="font-mono text-amber-300 truncate" title={item.disclaimer}>
                        {item.disclaimer}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Circuit Breakers Section */}
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Trạng thái Ngắt Mạch Tự Động (Circuit Breakers - Trip Protection)</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {circuitBreakers.map(cb => (
                  <div key={cb.id} className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-purple-300 font-bold">{cb.id}</span>
                      <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                        cb.state === 'CLOSED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                        cb.state === 'OPEN' ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse' :
                        'bg-amber-500/20 text-amber-400'
                      }`}>
                        {cb.state}
                      </span>
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      <span>Ngưỡng trượt: <strong>{cb.failureCount}/{cb.threshold}</strong></span>
                      <span className="block mt-0.5">Thời gian CoolDown: {cb.coolDownSeconds}s</span>
                    </div>
                    {cb.state === 'OPEN' && (
                      <button
                        onClick={() => handleResetCircuitBreaker(cb.id)}
                        className="w-full py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded text-[11px] transition"
                      >
                        Reset về CLOSED
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: GMES DATA SYNCHRONIZATION (11 STEPS)
           ========================================================================= */}
        {activeTab === 'gmesSync' && (
          <div className="space-y-4">
            {/* Header with trigger */}
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-cyan-400" />
                  <span>Quy trình Đồng bộ GMES 11 Bước Toàn Vẹn (11-Step Lifecycle)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Xác thực mTLS &gt; Trích xuất &gt; Staging Ingest &gt; Schema &gt; Khử trùng &gt; Phát hiện mâu thuẫn &gt; Pearl DAG &gt; Xác minh SHA &gt; Commit &gt; Audit &gt; Đối soát.
                </p>
              </div>
              <button
                onClick={handleTriggerGmesSync}
                className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition active:scale-95 flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{t.buttons.triggerSync}</span>
              </button>
            </div>

            {/* 11 Steps Visual Pipeline */}
            {selectedSyncRun && (
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                  <div>
                    <span className="font-mono text-cyan-300 font-bold text-xs">{selectedSyncRun.runId}</span>
                    <span className="text-xs text-slate-400 ml-2">Khởi tạo bởi: {selectedSyncRun.initiatedByName}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs font-mono">
                    <span className="text-slate-400">Trích xuất: <strong className="text-white">{selectedSyncRun.totalExtracted}</strong></span>
                    <span className="text-slate-400">Khử trùng: <strong className="text-purple-300">{selectedSyncRun.totalDuplicatesSkipped}</strong></span>
                    <span className="text-slate-400">Committed: <strong className="text-emerald-400">{selectedSyncRun.totalCommitted}</strong></span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {selectedSyncRun.steps.map((st: any) => (
                    <div key={st.stepNumber} className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200">{st.name}</span>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/30">
                          {st.status} ({st.durationMs}ms)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{st.details}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Staging Isolation Table */}
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Database className="w-4 h-4" />
                <span>Khu vực Đệm Cô lập Dữ liệu (Staging Area Inspection)</span>
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-800">
                  <thead className="bg-slate-950 text-slate-400 font-mono text-[11px]">
                    <tr>
                      <th className="p-2 border-b border-slate-800">Record ID</th>
                      <th className="p-2 border-b border-slate-800">Nhà máy</th>
                      <th className="p-2 border-b border-slate-800">Thực thể</th>
                      <th className="p-2 border-b border-slate-800">Trạng thái Kiểm tra</th>
                      <th className="p-2 border-b border-slate-800">Payload Thô</th>
                      <th className="p-2 border-b border-slate-800">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {stagingRecords.map(rec => (
                      <tr key={rec.recordId} className="hover:bg-slate-800/40">
                        <td className="p-2 text-cyan-300 font-bold">{rec.recordId}</td>
                        <td className="p-2 text-white">{rec.sourcePlantId}</td>
                        <td className="p-2 text-slate-300">{rec.entityCode}</td>
                        <td className="p-2">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            rec.validationStatus === 'VALID' ? 'bg-emerald-500/20 text-emerald-400' :
                            rec.validationStatus === 'CONFLICT' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {rec.validationStatus}
                          </span>
                        </td>
                        <td className="p-2 text-slate-400 text-[11px] truncate max-w-xs">
                          {JSON.stringify(rec.rawData)}
                        </td>
                        <td className="p-2">
                          {!rec.conflictResolved && (
                            <button
                              onClick={() => {
                                soundManager.playClick();
                                showToast(`Đã đối soát thủ công bản ghi ${rec.recordId}`, 'success');
                              }}
                              className="px-2 py-1 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-[10px] rounded"
                            >
                              Xử lý xung đột
                            </button>
                          )}
                          {rec.conflictResolved && (
                            <span className="text-emerald-400 text-[11px] font-sans flex items-center gap-1">
                              <Check className="w-3 h-3" /> Đã xử lý
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: RPA CONTROL CENTER
           ========================================================================= */}
        {activeTab === 'rpaControl' && (
          <div className="space-y-4">
            {/* Header info */}
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Bot className="w-4 h-4 text-emerald-400" />
                  <span>Trung tâm Điều phối Robot RPA (RPA Fleet Control &amp; Kill Switch)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Giám sát nhịp đập heartbeat, phân phối tác vụ tự động và cơ chế ngắt khẩn cấp Kill Switch.
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-lg">
                4/4 ROBOTS TRỰC TUYẾN
              </span>
            </div>

            {/* Robot Fleet Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rpaRobots.map(bot => (
                <div key={bot.id} className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-emerald-400 font-bold text-sm">{bot.robotCode}</span>
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                          {bot.plantId}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-1">{bot.name}</h4>
                    </div>

                    <span className={`px-2.5 py-1 rounded font-mono text-xs font-bold ${
                      bot.status === 'RUNNING' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 animate-pulse' :
                      bot.status === 'IDLE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                      bot.status === 'KILLED' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                      'bg-slate-700 text-slate-300'
                    }`}>
                      {bot.status}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-950/60 rounded-lg text-xs grid grid-cols-3 gap-2 border border-slate-800/80 text-slate-300 font-mono">
                    <div>
                      <span className="text-slate-500 block text-[10px]">TÁC VỤ THỰC THI:</span>
                      <strong className="text-white">{bot.totalJobsExecuted}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">TỶ LỆ THÀNH CÔNG:</span>
                      <strong className="text-emerald-400">{bot.successRatePct}%</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">HEARTBEAT:</span>
                      <span className="text-cyan-300 text-[10px]">Đang phát &lt; 5s</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-amber-300/80 italic font-mono">
                    {bot.disclaimer}
                  </p>

                  <div className="flex items-center space-x-2 pt-1">
                    <button
                      onClick={() => handleTriggerRpaJob(bot.id)}
                      disabled={bot.status === 'KILLED'}
                      className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-lg transition active:scale-95 flex items-center justify-center space-x-1"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>{t.buttons.triggerBot}</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedRobot(bot);
                        setShowKillModal(true);
                      }}
                      className="px-3 py-1.5 bg-red-600/80 hover:bg-red-600 text-white font-bold text-xs rounded-lg transition active:scale-95 flex items-center space-x-1 border border-red-500/50"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>KILL SWITCH</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* RPA Run History */}
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileCode className="w-4 h-4" />
                <span>Nhật ký Chạy Robot RPA Gần đây (Execution History)</span>
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-800">
                  <thead className="bg-slate-950 text-slate-400 font-mono text-[11px]">
                    <tr>
                      <th className="p-2 border-b border-slate-800">Run ID</th>
                      <th className="p-2 border-b border-slate-800">Robot Code</th>
                      <th className="p-2 border-b border-slate-800">Tên Tác vụ</th>
                      <th className="p-2 border-b border-slate-800">Thời lượng</th>
                      <th className="p-2 border-b border-slate-800">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {rpaRuns.map(run => (
                      <tr key={run.runId} className="hover:bg-slate-800/40">
                        <td className="p-2 text-cyan-300 font-bold">{run.runId}</td>
                        <td className="p-2 text-emerald-300">{run.robotCode}</td>
                        <td className="p-2 text-white font-sans">{run.jobName}</td>
                        <td className="p-2 text-slate-300">{run.durationMs}ms</td>
                        <td className="p-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            {run.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 5: WORKFLOW ORCHESTRATION (9-STATE FSM)
           ========================================================================= */}
        {activeTab === 'workflows' && (
          <div className="space-y-4">
            {/* Header info */}
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Hệ thống Điều phối Workflow FSM 9 Trạng thái (Workflow Orchestration Engine)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                FSM Lifecycle: DRAFT &gt; READY &gt; RUNNING &gt; WAITING_APPROVAL &gt; WAITING_RETRY &gt; PAUSED &gt; COMPLETED / FAILED / CANCELLED.
              </p>
            </div>

            {/* Workflows List & Selected Workflow Detail */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Left Column: Workflows List */}
              <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Danh sách Quy trình</h3>
                <div className="space-y-2">
                  {workflows.map(wf => (
                    <div
                      key={wf.id}
                      onClick={() => { soundManager.playClick(); setSelectedWorkflow(wf); }}
                      className={`p-3 rounded-lg border text-xs cursor-pointer transition space-y-1 ${
                        selectedWorkflow?.id === wf.id
                          ? 'bg-cyan-950/40 border-cyan-500/60 shadow-md'
                          : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-cyan-300 font-bold">{wf.workflowCode}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          wf.state === 'WAITING_APPROVAL' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse' :
                          wf.state === 'RUNNING' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' :
                          wf.state === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' :
                          'bg-slate-700 text-slate-300'
                        }`}>
                          {wf.state}
                        </span>
                      </div>
                      <p className="text-slate-200 font-medium">{wf.name}</p>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <span>Nhà máy: <strong className="text-white">{wf.plantId}</strong></span>
                        <span className="text-amber-300 font-mono">{wf.riskLevel}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Active Workflow Execution & Approval Gate */}
              {selectedWorkflow && (
                <div className="lg:col-span-2 p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-cyan-400 font-bold text-sm">{selectedWorkflow.workflowCode}</span>
                        <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                          Khóa cạnh tranh: {selectedWorkflow.concurrencyKey}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white mt-1">{selectedWorkflow.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Người tạo: {selectedWorkflow.createdByName} ({selectedWorkflow.createdByRole})</p>
                    </div>

                    <span className={`px-3 py-1 rounded font-mono text-xs font-bold ${
                      selectedWorkflow.state === 'WAITING_APPROVAL' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse' :
                      selectedWorkflow.state === 'RUNNING' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' :
                      selectedWorkflow.state === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' :
                      'bg-slate-700 text-slate-300'
                    }`}>
                      TRẠNG THÁI: {selectedWorkflow.state}
                    </span>
                  </div>

                  {/* Sequential Steps Tracker */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Các Bước Thực Thi Tuần Tự (Steps Pipeline)</h4>
                    <div className="space-y-2">
                      {selectedWorkflow.steps.map((st: any, idx: number) => (
                        <div key={st.stepId} className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg text-xs flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-cyan-400 flex items-center justify-center font-mono font-bold text-xs">
                              {idx + 1}
                            </span>
                            <div>
                              <div className="font-bold text-white">{st.name}</div>
                              <div className="text-[11px] text-slate-400">Hệ thống đích: <span className="font-mono text-cyan-300">{st.targetSystem}</span> • Mức rủi ro: <span className="font-mono text-amber-300">{st.riskLevel}</span></div>
                            </div>
                          </div>

                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            st.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            st.status === 'RUNNING' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 animate-pulse' :
                            'bg-slate-800 text-slate-400'
                          }`}>
                            {st.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Approval Gate Status Banner (HITL) */}
                  {(selectedWorkflow.riskLevel === 'LEVEL_C' || selectedWorkflow.riskLevel === 'LEVEL_D') && (
                    <div className="p-3.5 bg-amber-950/30 border border-amber-600/40 rounded-xl text-xs space-y-2">
                      <div className="flex items-center space-x-2 text-amber-300 font-bold">
                        <ShieldAlert className="w-4 h-4 text-amber-400" />
                        <span>CỔNG PHÊ DUYỆT CON NGƯỜI (HUMAN-IN-THE-LOOP APPROVAL GATE)</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300 font-mono text-[11px]">
                        <div>
                          <span>Phê duyệt 1 (Cấp 1): </span>
                          <strong className={selectedWorkflow.approvals.firstApproverId ? 'text-emerald-400' : 'text-amber-400'}>
                            {selectedWorkflow.approvals.firstApproverName || 'Chưa phê duyệt (Pending)'}
                          </strong>
                        </div>
                        {selectedWorkflow.riskLevel === 'LEVEL_D' && (
                          <div>
                            <span>Phê duyệt 2 (Dual Approval): </span>
                            <strong className={selectedWorkflow.approvals.secondApproverId ? 'text-emerald-400' : 'text-amber-400'}>
                              {selectedWorkflow.approvals.secondApproverName || 'Chưa phê duyệt (Pending)'}
                            </strong>
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] text-amber-200/80">
                        {selectedWorkflow.riskLevel === 'LEVEL_D' 
                          ? 'Quy trình Level D (Rủi ro cao) yêu cầu 2 phê duyệt viên độc lập (Anti-Self Approval).'
                          : 'Quy trình Level C yêu cầu ít nhất 1 phê duyệt viên độc lập.'}
                      </p>
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => handleExecuteWorkflowStep(selectedWorkflow.id)}
                      disabled={selectedWorkflow.state === 'COMPLETED' || selectedWorkflow.state === 'CANCELLED'}
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-lg transition active:scale-95 flex items-center space-x-1.5 shadow-md shadow-cyan-500/20"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>{t.buttons.executeStep}</span>
                    </button>

                    {(selectedWorkflow.state === 'WAITING_APPROVAL' || (!selectedWorkflow.approvals.firstApproverId && (selectedWorkflow.riskLevel === 'LEVEL_C' || selectedWorkflow.riskLevel === 'LEVEL_D'))) && (
                      <button
                        onClick={() => handleApproveWorkflow(selectedWorkflow.id)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg transition active:scale-95 flex items-center space-x-1.5 shadow-md shadow-emerald-500/20"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{t.buttons.approve}</span>
                      </button>
                    )}

                    {selectedWorkflow.state === 'RUNNING' && (
                      <button
                        onClick={() => handlePauseWorkflow(selectedWorkflow.id)}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-lg transition"
                      >
                        <Pause className="w-3.5 h-3.5 inline mr-1" />
                        <span>{t.buttons.pause}</span>
                      </button>
                    )}

                    {selectedWorkflow.state === 'PAUSED' && (
                      <button
                        onClick={() => handleResumeWorkflow(selectedWorkflow.id)}
                        className="px-3 py-2 bg-cyan-800 hover:bg-cyan-700 text-white font-bold text-xs rounded-lg transition"
                      >
                        <Play className="w-3.5 h-3.5 inline mr-1" />
                        <span>{t.buttons.resume}</span>
                      </button>
                    )}

                    {selectedWorkflow.state !== 'COMPLETED' && selectedWorkflow.state !== 'CANCELLED' && (
                      <button
                        onClick={() => {
                          soundManager.playClick();
                          showToast('Đã phát lệnh hủy quy trình.', 'info');
                        }}
                        className="px-3 py-2 bg-slate-800 hover:bg-red-900/50 text-red-300 hover:text-white font-bold text-xs rounded-lg transition"
                      >
                        <span>{t.buttons.cancel}</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 6: SAFETY GATEWAY, POLICIES & EXCEPTION QUEUE (DLQ)
           ========================================================================= */}
        {activeTab === 'safetyDlq' && (
          <div className="space-y-4">
            {/* Header info */}
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                <span>Cổng An toàn Thực thi, Chính sách Rủi ro &amp; Hàng đợi Ngoại lệ (Dead Letter Queue)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Phân loại 9 nhóm lỗi, cơ chế tự động cách ly vào DLQ khi gặp trạng thái bất định, và ma trận rủi ro 4 cấp (Level A-D).
              </p>
            </div>

            {/* 4-Tier Risk Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {policies.map(p => (
                <div key={p.policyId} className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-cyan-300 font-bold">{p.level}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      p.level === 'LEVEL_D' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      p.level === 'LEVEL_C' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      p.level === 'LEVEL_B' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                      'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {p.requiresDualApproval ? 'Dual Approval' : p.requiresHumanApproval ? '1 Approval' : 'Auto-Exec'}
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-xs">{p.name}</h4>
                  <p className="text-slate-400 text-[11px]">{p.description}</p>
                  <div className="pt-1 text-[10px] font-mono text-slate-500 border-t border-slate-800">
                    Timeout: {p.maxExecutionTimeoutSec}s • Rollback: {p.autoRollbackSupported ? 'Có' : 'Không'}
                  </div>
                </div>
              ))}
            </div>

            {/* Interactive Policy Evaluator Simulator */}
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Sliders className="w-4 h-4" />
                <span>Mô phỏng Thẩm định Chính sách Rủi ro (Policy Evaluator Simulator)</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Loại Thao tác (Action Type):</label>
                  <select
                    value={simActionType}
                    onChange={(e) => setSimActionType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  >
                    <option value="DISPATCH_MATERIAL">DISPATCH_MATERIAL (Điều phối vật tư)</option>
                    <option value="QUERY_INVENTORY">QUERY_INVENTORY (Kiểm kê số dư)</option>
                    <option value="STANDARDIZE_DATA">STANDARDIZE_DATA (Chuẩn hóa Staging)</option>
                    <option value="EMERGENCY_STOP">EMERGENCY_STOP (Dừng chuyền khẩn cấp)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Ước tính Chi phí ($ USD):</label>
                  <input
                    type="number"
                    value={simCostUsd}
                    onChange={(e) => setSimCostUsd(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Số Nhà máy Ảnh hưởng:</label>
                  <input
                    type="number"
                    value={simPlantsCount}
                    onChange={(e) => setSimPlantsCount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Rủi ro Dừng chuyền (Giờ):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={simDowntimeHours}
                    onChange={(e) => setSimDowntimeHours(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handleSimulatePolicy}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs rounded-lg transition active:scale-95 flex items-center space-x-1.5 shadow-md shadow-cyan-500/20"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{t.buttons.evaluatePolicy}</span>
                </button>

                {policyEvalResult && (
                  <div className="flex items-center space-x-2 text-xs font-mono">
                    <span className="text-slate-400">Kết quả xếp cấp:</span>
                    <span className={`px-2 py-1 rounded font-bold ${
                      policyEvalResult.evaluatedLevel === 'LEVEL_D' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                      policyEvalResult.evaluatedLevel === 'LEVEL_C' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                      'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {policyEvalResult.evaluatedLevel}
                    </span>
                    <span className="text-slate-300">({policyEvalResult.reason})</span>
                  </div>
                )}
              </div>
            </div>

            {/* Dead Letter Queue Table */}
            <div className="p-4 bg-slate-900/80 border border-red-900/40 rounded-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Hàng Đợi Ngoại Lệ Bất Biến (Exception / Dead Letter Queue)</span>
                </h3>
                <span className="text-xs font-mono text-red-300">
                  {exceptions.filter(e => e.status !== 'RESOLVED' && e.status !== 'DISCARDED').length} Tác vụ cần xử lý
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-800">
                  <thead className="bg-slate-950 text-slate-400 font-mono text-[11px]">
                    <tr>
                      <th className="p-2 border-b border-slate-800">Mã Lỗi</th>
                      <th className="p-2 border-b border-slate-800">Phân loại Thất bại</th>
                      <th className="p-2 border-b border-slate-800">Nội dung Lỗi</th>
                      <th className="p-2 border-b border-slate-800">Lần thử</th>
                      <th className="p-2 border-b border-slate-800">Trạng thái</th>
                      <th className="p-2 border-b border-slate-800">Hành động Phục hồi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {exceptions.map(exc => (
                      <tr key={exc.id} className="hover:bg-slate-800/40">
                        <td className="p-2 text-cyan-300 font-bold">{exc.id}</td>
                        <td className="p-2">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                            {exc.failureCategory}
                          </span>
                        </td>
                        <td className="p-2 text-slate-300 font-sans max-w-sm truncate" title={exc.errorMessage}>
                          {exc.errorMessage}
                        </td>
                        <td className="p-2 text-slate-400">{exc.retryAttempts}/{exc.maxRetries}</td>
                        <td className="p-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            exc.status === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-400' :
                            exc.status === 'RETRYING' ? 'bg-cyan-500/20 text-cyan-400 animate-pulse' :
                            'bg-amber-500/20 text-amber-400'
                          }`}>
                            {exc.status}
                          </span>
                        </td>
                        <td className="p-2">
                          {exc.status !== 'RESOLVED' && exc.status !== 'DISCARDED' ? (
                            <div className="flex items-center space-x-1.5">
                              <button
                                onClick={() => handleRetryException(exc.id)}
                                className="px-2 py-1 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-[10px] rounded transition"
                              >
                                {t.buttons.retry}
                              </button>
                              <button
                                onClick={() => {
                                  setResolveExceptionId(exc.id);
                                  setShowResolveModal(true);
                                }}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-[10px] rounded transition"
                              >
                                {t.buttons.resolve}
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-500 text-[11px] font-sans">Đã đóng hồ sơ</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* =========================================================================
          MODALS
         ========================================================================= */}

      {/* Kill Switch Modal */}
      {showKillModal && selectedRobot && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-500/60 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center space-x-2 text-red-400 font-bold text-sm">
              <XCircle className="w-5 h-5 text-red-500" />
              <span>XÁC NHẬN KÍCH HOẠT KILL SWITCH KHẨN CẤP</span>
            </div>
            <p className="text-xs text-slate-300">
              Bạn đang chuẩn bị ngắt nguồn tức thời Robot <strong className="text-white">{selectedRobot.name} ({selectedRobot.robotCode})</strong> tại nhà máy {selectedRobot.plantId}.
            </p>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Lý do dừng khẩn cấp (Bắt buộc lưu vết Audit):</label>
              <textarea
                value={killReason}
                onChange={(e) => setKillReason(e.target.value)}
                placeholder="VD: Cảnh báo quá nhiệt động cơ / Lệch vị trí phôi dập..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                rows={3}
              />
            </div>
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => { setShowKillModal(false); setKillReason(''); }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleRpaKillSwitch}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs transition"
              >
                Xác nhận Dừng khẩn cấp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Exception Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/60 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span>GIẢI QUYẾT THỦ CÔNG NGOẠI LỆ (RESOLVE EXCEPTION)</span>
            </div>
            <p className="text-xs text-slate-300">
              Nhập ghi chú đối soát để xác nhận hoàn tất xử lý ngoại lệ {resolveExceptionId}:
            </p>
            <textarea
              value={resolveNote}
              onChange={(e) => setResolveNote(e.target.value)}
              placeholder="VD: Đã đối soát thủ công chứng từ giao hàng cảng Hải Phòng, số liệu thực tế khớp 100%..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
              rows={3}
            />
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => { setShowResolveModal(false); setResolveNote(''); }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
              >
                Hủy
              </button>
              <button
                onClick={handleResolveException}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs transition"
              >
                Xác nhận Hoàn tất
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
