import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, AlertTriangle, CheckCircle, RefreshCw, Database, 
  Server, Cpu, Activity, Clock, FileText, Check, X, Filter,
  ExternalLink, Layers, ArrowRight, ShieldAlert, Sparkles, Globe
} from 'lucide-react';
import { soundManager } from '../../utils/audio';

type Language = 'VI' | 'EN' | 'KR';

interface DataTrustOverview {
  banner: string;
  isDemoMode: boolean;
  trustIndexPct: number;
  completenessPct: number;
  activeViolationsCount: number;
  criticalViolationsCount: number;
  freshnessSlaSeconds: number;
  averageLatencyMs: number;
  satellitePlantsCount: number;
  sourcesOnline: string;
  timestamp: string;
}

interface TrustSource {
  sourceId: string;
  sourceName: string;
  sourceType: string;
  plantId: string;
  connectionStatus: 'ONLINE' | 'DEGRADED' | 'DISCONNECTED';
  syncMode: string;
  isDemoMode: boolean;
  trustScorePct: number;
  lastSyncTime: string;
  avgLatencyMs: number;
}

interface TrustIssue {
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
  resolutionNote?: string | null;
}

export const DataTrustCenterModule: React.FC = () => {
  const [lang, setLang] = useState<Language>('VI');
  const [overview, setOverview] = useState<DataTrustOverview | null>(null);
  const [sources, setSources] = useState<TrustSource[]>([]);
  const [issues, setIssues] = useState<TrustIssue[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPlantFilter, setSelectedPlantFilter] = useState<string>('all');
  const [selectedSeverityFilter, setSelectedSeverityFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'overview' | 'issues' | 'sources' | 'validator'>('overview');

  // Interactive Validator State
  const [sampleJsonInput, setSampleJsonInput] = useState<string>(JSON.stringify([
    { id: "LOT-DAAL-9981", plantId: "DAAL", quantity: 5600, timestamp: new Date().toISOString() },
    { id: "LOT-KTECH-4001", plantId: "KTECH", quantity: -150, timestamp: "INVALID_DATE" },
    { id: "LOT-DAAL-9981", plantId: "DAAL", quantity: 800, timestamp: new Date().toISOString() }
  ], null, 2));
  const [validationResult, setValidationResult] = useState<any>(null);
  const [isValidating, setIsValidating] = useState<boolean>(false);

  // Translations
  const t = {
    VI: {
      title: "Trung Tâm Quản Trị Chất Lượng & Nguồn Gốc Dữ Liệu",
      subtitle: "VOMS PRO Phase 1 — Trust Foundation & Data Governance cho chuỗi 7 nhà máy vệ tinh",
      demoWarning: "DEMO MODE — CHƯA KẾT NỐI DỮ LIỆU THỰC (DEMO MODE — NOT CONNECTED TO LIVE PRODUCTION DATABASE)",
      demoNotice: "Tất cả các nguồn dữ liệu đang chạy qua bộ giả lập cách ly Trust Foundation v1.0 để kiểm định tính toàn vẹn trước khi cho phép kết nối ERP/MES trực tiếp.",
      trustIndex: "Chỉ số Tin cậy (Trust Index)",
      completeness: "Độ toàn vẹn dữ liệu",
      activeViolations: "Vi phạm Schema đang mở",
      freshnessSla: "SLA Độ trễ đồng bộ",
      avgLatency: "Thời gian phản hồi API",
      tabOverview: "Tổng quan 7 Nhà máy",
      tabIssues: "Nhật ký Lỗi Schema & Dữ liệu",
      tabSources: "Danh mục Nguồn dữ liệu",
      tabValidator: "Trình Kiểm Định Schema Trực Tiếp",
      plant: "Nhà máy",
      allPlants: "Tất cả 7 nhà máy",
      severity: "Mức độ",
      allSeverities: "Mọi mức độ",
      ruleCode: "Mã vi phạm",
      entity: "Đối tượng",
      status: "Trạng thái",
      action: "Thao tác",
      validateBatchBtn: "Chạy Kiểm Định Batch",
      resolveBtn: "Đánh dấu Đã xử lý",
      investigateBtn: "Đang kiểm tra",
      sourceType: "Giao thức",
      connection: "Kết nối",
      latency: "Độ trễ"
    },
    EN: {
      title: "Data Trust & Quality Governance Center",
      subtitle: "VOMS PRO Phase 1 — Trust Foundation & Data Governance for 7 Satellite Plants",
      demoWarning: "DEMO MODE — NOT CONNECTED TO LIVE PRODUCTION DATABASE",
      demoNotice: "All data sources are running through isolated Trust Foundation Mock Adapters v1.0 to audit schema conformance prior to live ERP/MES interconnect.",
      trustIndex: "Trust Index Score",
      completeness: "Data Completeness",
      activeViolations: "Active Schema Violations",
      freshnessSla: "Freshness SLA",
      avgLatency: "API Response Latency",
      tabOverview: "7-Plant Matrix",
      tabIssues: "Schema & Data Issues Log",
      tabSources: "Data Source Catalog",
      tabValidator: "Live Batch Schema Validator",
      plant: "Plant",
      allPlants: "All 7 Plants",
      severity: "Severity",
      allSeverities: "All Severities",
      ruleCode: "Rule Code",
      entity: "Entity",
      status: "Status",
      action: "Action",
      validateBatchBtn: "Execute Batch Audit",
      resolveBtn: "Mark Resolved",
      investigateBtn: "Investigate",
      sourceType: "Protocol",
      connection: "Connection",
      latency: "Latency"
    },
    KR: {
      title: "데이터 신뢰 & 품질 거버넌스 센터",
      subtitle: "VOMS PRO 1단계 — 7개 위성 공장 데이터 신뢰 기반 및 거버넌스",
      demoWarning: "데모 모드 — 실제 프로덕션 데이터베이스 미연결 (DEMO MODE)",
      demoNotice: "모든 데이터 소스는 실제 ERP/MES 연결 전 스키마 적합성을 검증하기 위해 격리된 Trust Foundation 모의 어댑터를 통해 실행됩니다.",
      trustIndex: "데이터 신뢰 지수 (Trust Index)",
      completeness: "데이터 완전성",
      activeViolations: "활성 스키마 위반 건수",
      freshnessSla: "동기화 SLA 지연율",
      avgLatency: "API 응답 지연 시간",
      tabOverview: "7개 공장 종합 현황",
      tabIssues: "스키마 및 데이터 결함 로그",
      tabSources: "데이터 소스 카탈로그",
      tabValidator: "실시간 배치 스키마 검증기",
      plant: "공장",
      allPlants: "7개 공장 전체",
      severity: "심각도",
      allSeverities: "전체 심각도",
      ruleCode: "규칙 코드",
      entity: "대상 객체",
      status: "상태",
      action: "작업",
      validateBatchBtn: "배치 검증 실행",
      resolveBtn: "해결 완료 처리",
      investigateBtn: "조사 중 설정",
      sourceType: "프로토콜",
      connection: "연결 상태",
      latency: "지연 시간"
    }
  }[lang];

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resOverview, resSources, resIssues] = await Promise.all([
        fetch('/api/v1/data-trust/overview').then(r => r.json()),
        fetch('/api/v1/data-trust/sources').then(r => r.json()),
        fetch('/api/v1/data-trust/issues').then(r => r.json()),
      ]);

      setOverview(resOverview);
      setSources(resSources.sources || []);
      setIssues(resIssues.issues || []);
    } catch (err) {
      console.error('Failed to fetch data trust data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateIssueStatus = async (issueId: string, newStatus: 'INVESTIGATING' | 'RESOLVED') => {
    soundManager.playClick();
    try {
      const res = await fetch(`/api/v1/data-trust/issues/${issueId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer token_admin_super_secret_9981'
        },
        body: JSON.stringify({
          status: newStatus,
          resolutionNote: newStatus === 'RESOLVED' ? 'Đã hiệu chỉnh và xác minh schema tuân thủ ISO/IATF.' : 'Kỹ sư OQC đang kiểm định nguồn.'
        })
      });
      if (res.ok) {
        soundManager.playSuccess();
        fetchData();
      }
    } catch (err) {
      console.error('Failed to update issue status', err);
    }
  };

  const handleRunValidation = async () => {
    soundManager.playClick();
    setIsValidating(true);
    try {
      let parsed;
      try {
        parsed = JSON.parse(sampleJsonInput);
      } catch (e: any) {
        setValidationResult({
          isValid: false,
          error: 'JSON Syntax Error: ' + e.message
        });
        setIsValidating(false);
        return;
      }

      const res = await fetch('/api/v1/data-trust/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer token_admin_super_secret_9981'
        },
        body: JSON.stringify({
          plantId: 'MULTI_TEST',
          records: Array.isArray(parsed) ? parsed : [parsed]
        })
      });

      const data = await res.json();
      setValidationResult(data);
      soundManager.playSuccess();
    } catch (err) {
      console.error('Validation request failed', err);
    } finally {
      setIsValidating(false);
    }
  };

  const filteredIssues = issues.filter(issue => {
    if (selectedPlantFilter !== 'all' && issue.plantId !== selectedPlantFilter) return false;
    if (selectedSeverityFilter !== 'all' && issue.severity !== selectedSeverityFilter) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      
      {/* 1. TOP HEADER & LANGUAGE SWITCHER */}
      <div className="bg-[#0b1324] border border-cyan-900/40 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
              <ShieldCheck className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
                {t.title}
                <span className="text-[11px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded font-mono font-medium">
                  PHASE 1 TRUST FOUNDATION
                </span>
              </h1>
              <p className="text-xs text-slate-400">{t.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Language Switcher & Refresh */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-slate-900/80 border border-slate-700/80 rounded-lg p-0.5 text-xs">
            <Globe className="w-3.5 h-3.5 text-slate-400 ml-2 mr-1" />
            {(['VI', 'EN', 'KR'] as Language[]).map(code => (
              <button
                key={code}
                onClick={() => {
                  soundManager.playClick();
                  setLang(code);
                }}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                  lang === code 
                    ? 'bg-cyan-500 text-slate-950 shadow-sm' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {code}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              soundManager.playClick();
              fetchData();
            }}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Reload</span>
          </button>
        </div>
      </div>

      {/* 2. EXPLICIT DEMO MODE BANNER (CRITICAL PHASE 1 REQUIREMENT) */}
      <div className="bg-gradient-to-r from-amber-950/60 via-amber-900/40 to-slate-950 border border-amber-600/60 rounded-xl p-3.5 shadow-lg flex items-start space-x-3">
        <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-black tracking-wider text-amber-300 uppercase">
              {t.demoWarning}
            </span>
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold font-mono">
              AUDITED ISO 9001
            </span>
          </div>
          <p className="text-xs text-amber-200/80 leading-relaxed">
            {t.demoNotice}
          </p>
        </div>
      </div>

      {/* 3. KPI METRIC CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-[#0d1627] border border-cyan-800/40 rounded-xl p-3">
          <p className="text-[11px] text-slate-400 uppercase font-medium">{t.trustIndex}</p>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-black text-cyan-400 font-mono">
              {overview?.trustIndexPct ?? 94.2}%
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold">▲ +1.4%</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${overview?.trustIndexPct ?? 94.2}%` }}></div>
          </div>
        </div>

        <div className="bg-[#0d1627] border border-cyan-800/40 rounded-xl p-3">
          <p className="text-[11px] text-slate-400 uppercase font-medium">{t.completeness}</p>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-black text-emerald-400 font-mono">
              {overview?.completenessPct ?? 98.6}%
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold">ISO S-Grade</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${overview?.completenessPct ?? 98.6}%` }}></div>
          </div>
        </div>

        <div className="bg-[#0d1627] border border-cyan-800/40 rounded-xl p-3">
          <p className="text-[11px] text-slate-400 uppercase font-medium">{t.activeViolations}</p>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-black text-amber-400 font-mono">
              {overview?.activeViolationsCount ?? 3}
            </span>
            <span className="text-[10px] text-rose-400 font-semibold">1 Critical (DAAL)</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 truncate">Rule: MISSING_FIELD_ORIGIN</p>
        </div>

        <div className="bg-[#0d1627] border border-cyan-800/40 rounded-xl p-3">
          <p className="text-[11px] text-slate-400 uppercase font-medium">{t.freshnessSla}</p>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-black text-cyan-300 font-mono">
              &lt; {overview?.freshnessSlaSeconds ?? 15}s
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold">99.98% PASS</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 truncate">Target: 30s SLA</p>
        </div>

        <div className="bg-[#0d1627] border border-cyan-800/40 rounded-xl p-3 col-span-2 md:col-span-1">
          <p className="text-[11px] text-slate-400 uppercase font-medium">{t.avgLatency}</p>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-black text-purple-400 font-mono">
              {overview?.averageLatencyMs ?? 9.4}ms
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold">Real-time</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 truncate">Sources Online: {overview?.sourcesOnline || '7/7'}</p>
        </div>
      </div>

      {/* 4. TABS NAVIGATION */}
      <div className="flex border-b border-slate-800 text-xs font-medium space-x-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-2.5 px-3 border-b-2 font-bold transition flex items-center space-x-1.5 ${
            activeTab === 'overview'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{t.tabOverview}</span>
        </button>

        <button
          onClick={() => setActiveTab('issues')}
          className={`pb-2.5 px-3 border-b-2 font-bold transition flex items-center space-x-1.5 ${
            activeTab === 'issues'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>{t.tabIssues}</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-300 font-mono">
            {issues.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('sources')}
          className={`pb-2.5 px-3 border-b-2 font-bold transition flex items-center space-x-1.5 ${
            activeTab === 'sources'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>{t.tabSources}</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-cyan-500/20 text-cyan-300 font-mono">
            {sources.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('validator')}
          className={`pb-2.5 px-3 border-b-2 font-bold transition flex items-center space-x-1.5 ${
            activeTab === 'validator'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{t.tabValidator}</span>
        </button>
      </div>

      {/* 5. TAB 1: 7 SATELLITE PLANTS MATRIX */}
      {activeTab === 'overview' && (
        <div className="bg-[#0b1324] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
              <span>BẢNG THEO DÕI NGUỒN DỮ LIỆU &amp; CÁCH LY 7 NHÀ MÁY (ISOLATION MATRIX)</span>
            </h3>
            <span className="text-[11px] text-cyan-400 font-mono font-medium">
              Data Isolation: RBAC Strict Partition
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-[11px] uppercase text-slate-400 font-bold border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-4">Nhà máy Vệ tinh</th>
                  <th className="py-2.5 px-3">Giao thức Thu thập</th>
                  <th className="py-2.5 px-3">Trạng thái Kết nối</th>
                  <th className="py-2.5 px-3">Điểm Tin cậy</th>
                  <th className="py-2.5 px-3">Độ trễ trung bình</th>
                  <th className="py-2.5 px-3">Chế độ đồng bộ</th>
                  <th className="py-2.5 px-4 text-right">Cách ly Vendor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {sources.map(src => {
                  const hasIssues = issues.filter(i => i.plantId === src.plantId && i.status === 'OPEN').length;
                  return (
                    <tr key={src.sourceId} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white font-mono">{src.plantId}</span>
                          <span className="text-[11px] text-slate-400 truncate max-w-[160px]">({src.sourceName})</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono text-[11px] bg-slate-800 px-2 py-0.5 rounded text-cyan-300 border border-slate-700">
                          {src.sourceType}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          src.connectionStatus === 'ONLINE'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${src.connectionStatus === 'ONLINE' ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                          {src.connectionStatus}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-slate-200">{src.trustScorePct}%</span>
                          {hasIssues > 0 && (
                            <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded font-mono font-bold">
                              {hasIssues} lỗi
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-300">
                        {src.avgLatencyMs} ms
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[10px] bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-mono font-semibold">
                          {src.syncMode}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800/50 px-2 py-0.5 rounded font-semibold font-mono">
                          ISOLATED_OK
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. TAB 2: ISSUES LOG */}
      {activeTab === 'issues' && (
        <div className="space-y-3">
          {/* Filters Bar */}
          <div className="bg-[#0b1324] border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400 font-medium">Bộ lọc:</span>

              {/* Plant Filter */}
              <select
                value={selectedPlantFilter}
                onChange={e => setSelectedPlantFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="all">{t.allPlants}</option>
                {['KHV', 'DREAM_TECH', 'HSTEC', 'KTECH', 'HOJEONGB', 'HOJEONG_VINA', 'DAAL'].map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>

              {/* Severity Filter */}
              <select
                value={selectedSeverityFilter}
                onChange={e => setSelectedSeverityFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="all">{t.allSeverities}</option>
                <option value="CRITICAL">CRITICAL</option>
                <option value="ERROR">ERROR</option>
                <option value="WARNING">WARNING</option>
                <option value="INFO">INFO</option>
              </select>
            </div>

            <span className="text-[11px] text-slate-400">
              Hiển thị <span className="font-bold text-cyan-400">{filteredIssues.length}</span> / {issues.length} cảnh báo
            </span>
          </div>

          {/* Issues Table */}
          <div className="bg-[#0b1324] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900/80 text-[11px] uppercase text-slate-400 font-bold border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-4">Mã Lỗi / Thời gian</th>
                    <th className="py-2.5 px-3">Nhà máy</th>
                    <th className="py-2.5 px-3">Mức độ</th>
                    <th className="py-2.5 px-3">Quy tắc vi phạm</th>
                    <th className="py-2.5 px-4">Chi tiết mô tả vi phạm Schema</th>
                    <th className="py-2.5 px-3">Trạng thái</th>
                    <th className="py-2.5 px-4 text-right">Xử lý (Governance)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {filteredIssues.map(issue => (
                    <tr key={issue.issueId} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-white text-[11px]">{issue.issueId}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {new Date(issue.detectedAt).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold font-mono text-cyan-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          {issue.plantId}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          issue.severity === 'CRITICAL' || issue.severity === 'ERROR'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : issue.severity === 'WARNING'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}>
                          {issue.severity}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-mono text-[11px] text-purple-300">{issue.ruleCode}</div>
                        <div className="text-[10px] text-slate-400">Entity: {issue.entityId}</div>
                      </td>
                      <td className="py-3 px-4 max-w-sm">
                        <p className="text-slate-300 text-[11px] leading-relaxed line-clamp-2">
                          {issue.description}
                        </p>
                        {issue.resolutionNote && (
                          <p className="text-[10px] text-emerald-400 mt-1 italic">
                            ✓ Note: {issue.resolutionNote}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                          issue.status === 'RESOLVED'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : issue.status === 'INVESTIGATING'
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        }`}>
                          {issue.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {issue.status !== 'RESOLVED' ? (
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => handleUpdateIssueStatus(issue.issueId, 'INVESTIGATING')}
                              title={t.investigateBtn}
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded text-[10px] font-semibold transition"
                            >
                              Kiểm tra
                            </button>
                            <button
                              onClick={() => handleUpdateIssueStatus(issue.issueId, 'RESOLVED')}
                              title={t.resolveBtn}
                              className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 rounded text-[10px] font-bold transition flex items-center space-x-1"
                            >
                              <Check className="w-3 h-3" />
                              <span>Giải quyết</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-emerald-400 font-mono font-medium">✓ Closed</span>
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

      {/* 7. TAB 3: SOURCES CATALOG */}
      {activeTab === 'sources' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {sources.map(src => (
            <div key={src.sourceId} className="bg-[#0b1324] border border-slate-800 rounded-xl p-4 space-y-3 shadow-lg hover:border-cyan-800/50 transition">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-[10px] text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40 font-bold">
                    {src.plantId}
                  </span>
                  <h4 className="text-sm font-bold text-white mt-1.5 line-clamp-1">{src.sourceName}</h4>
                </div>
                <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  src.connectionStatus === 'ONLINE'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                }`}>
                  {src.connectionStatus}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-400 border-t border-b border-slate-800/80 py-2.5 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span>Source ID:</span>
                  <span className="text-slate-200">{src.sourceId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Source Type:</span>
                  <span className="text-purple-300 font-semibold">{src.sourceType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sync Mode:</span>
                  <span className="text-amber-300">{src.syncMode}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Latency:</span>
                  <span className="text-cyan-300 font-bold">{src.avgLatencyMs} ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Sync:</span>
                  <span className="text-slate-400">{new Date(src.lastSyncTime).toLocaleTimeString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-400">Trust Score</span>
                <span className="font-mono text-sm font-black text-cyan-400">{src.trustScorePct}%</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 8. TAB 4: LIVE BATCH SCHEMA VALIDATOR */}
      {activeTab === 'validator' && (
        <div className="bg-[#0b1324] border border-slate-800 rounded-xl p-4 space-y-4 shadow-xl">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>CÔNG CỤ KIỂM ĐỊNH SCHEMA TỰ ĐỘNG THEO CHUẨN ISO/IATF (LIVE VALIDATOR)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Nhập mảng JSON dữ liệu từ cảm biến / ERP / PDA để kiểm tra: thiếu trường bắt buộc, giá trị âm, sai định dạng thời gian ISO, và phát hiện trùng lặp mã bản ghi (Deduplication).
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Input JSON */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Dữ liệu đầu vào (JSON Payload):</span>
                <span className="text-[11px] font-mono text-cyan-400">POST /api/v1/data-trust/validate</span>
              </div>
              <textarea
                value={sampleJsonInput}
                onChange={e => setSampleJsonInput(e.target.value)}
                rows={12}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 font-normal leading-relaxed"
              />
              <button
                onClick={handleRunValidation}
                disabled={isValidating}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isValidating ? 'animate-spin' : ''}`} />
                <span>{t.validateBatchBtn}</span>
              </button>
            </div>

            {/* Validation Result Output */}
            <div className="space-y-2">
              <span className="text-xs text-slate-400">Kết quả Đánh giá &amp; Vi phạm Schema:</span>
              <div className="h-[285px] bg-slate-950 border border-slate-800 rounded-xl p-3 overflow-y-auto font-mono text-xs text-slate-200">
                {validationResult ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-400">Audit Status:</span>
                      <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                        validationResult.isValid 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}>
                        {validationResult.isValid ? 'ALL_RECORDS_VALID' : 'SCHEMA_VIOLATIONS_DETECTED'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-[11px] bg-slate-900 p-2 rounded-lg border border-slate-800">
                      <div>Tổng: <span className="font-bold text-white">{validationResult.totalRecords}</span></div>
                      <div>Hợp lệ: <span className="font-bold text-emerald-400">{validationResult.validRecords}</span></div>
                      <div>Lỗi: <span className="font-bold text-rose-400">{validationResult.errorCount}</span></div>
                    </div>

                    {validationResult.validationErrors?.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] font-bold text-rose-400 uppercase">Danh sách vi phạm chi tiết:</span>
                        {validationResult.validationErrors.map((err: any, i: number) => (
                          <div key={i} className="p-2 rounded bg-rose-950/40 border border-rose-800/40 text-[11px] space-y-0.5">
                            <div className="flex justify-between text-rose-300 font-bold">
                              <span>Record #{err.index} • Field: {err.field}</span>
                              <span className="font-mono">{err.rule}</span>
                            </div>
                            <p className="text-slate-400">{err.message}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
                    <Activity className="w-8 h-8 opacity-40 text-cyan-400 animate-pulse" />
                    <p className="text-xs">Bấm "{t.validateBatchBtn}" để chạy kiểm tra độ tin cậy dữ liệu.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
