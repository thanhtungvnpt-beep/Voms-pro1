import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, Zap, Volume2, VolumeX, FileDown, 
  Sparkles, RefreshCw, Clock, Radio, Activity, Menu,
  UserCheck, ShieldAlert
} from 'lucide-react';
import { soundManager } from '../utils/audio';

interface HeaderProps {
  filterMode: 'all' | 'adverse';
  onToggleFilter: () => void;
  onTriggerAiIntervention: () => void;
  onOpenReportModal: () => void;
  onOpenAiDiagnosticsModal: () => void;
  onToggleMobileMode: () => void;
  isMobileMode: boolean;
  isAiIntervened: boolean;
  adverseCount: number;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  filterMode,
  onToggleFilter,
  onTriggerAiIntervention,
  onOpenReportModal,
  onOpenAiDiagnosticsModal,
  onToggleMobileMode,
  isMobileMode,
  isAiIntervened,
  adverseCount,
  isSidebarCollapsed,
  onToggleSidebar
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(!soundManager.enabled);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [currentRoleKey, setCurrentRoleKey] = useState<string>(() => {
    return localStorage.getItem('voms_active_role_key') || 'admin';
  });

  const ROLE_OPTIONS = [
    { key: 'admin', label: 'SYSTEM_ADMIN (Tùng NT)', role: 'SYSTEM_ADMIN', plant: 'All 7 Plants', token: 'token_admin_super_secret_9981' },
    { key: 'management', label: 'MANAGEMENT (Quân PH)', role: 'MANAGEMENT', plant: 'All 7 Plants', token: 'token_mgmt_lead_access_5521' },
    { key: 'outsourcing', label: 'OUTSOURCING_GROUP (Đức TM)', role: 'OUTSOURCING_GROUP', plant: 'All 7 Plants', token: 'token_outsourcing_token_7719' },
    { key: 'planner', label: 'PROD_PLANNER (Phúc NV)', role: 'PRODUCTION_PLANNER', plant: 'All 7 Plants', token: 'token_planner_master_3311' },
    { key: 'approver', label: 'APPROVER_BOARD (Thắng TQ)', role: 'APPROVER', plant: 'All 7 Plants', token: 'token_approver_board_7788' },
    { key: 'ai_auditor', label: 'AI_AUDITOR (Long LH)', role: 'AI_AUDITOR', plant: 'Read-only / Audit', token: 'token_ai_auditor_guard_5544' },
    { key: 'vendor_daal', label: 'VENDOR_MGR (DAAL Hải Phòng)', role: 'VENDOR_MANAGER', plant: 'DAAL', token: 'token_vendor_daal_isolated_4401' },
    { key: 'vendor_ktech', label: 'VENDOR_MGR (KTECH Thái Nguyên)', role: 'VENDOR_MANAGER', plant: 'KTECH', token: 'token_vendor_ktech_isolated_8820' },
    { key: 'qc', label: 'QC_LEAD (Trang ĐT)', role: 'QC', plant: 'All 7 Plants', token: 'token_qc_inspector_6633' },
    { key: 'technician', label: 'EQUIP_TECH (Việt HQ)', role: 'EQUIPMENT_TECHNICIAN', plant: 'All 7 Plants', token: 'token_technician_service_2290' },
    { key: 'operator', label: 'DATA_OPERATOR (Đạt NV - DAAL)', role: 'DATA_OPERATOR', plant: 'DAAL', token: 'token_operator_entry_1109' },
    { key: 'auditor', label: 'AUDITOR (Thành VĐ - ISO)', role: 'AUDITOR', plant: 'Read-only', token: 'token_auditor_readonly_9900' },
  ];

  useEffect(() => {
    const opt = ROLE_OPTIONS.find(r => r.key === currentRoleKey) || ROLE_OPTIONS[0];
    localStorage.setItem('voms_active_role_key', opt.key);
    localStorage.setItem('voms_active_token', opt.token);
    localStorage.setItem('voms_active_role', opt.role);
    localStorage.setItem('voms_active_plant', opt.plant);
    window.dispatchEvent(new CustomEvent('voms-role-changed', { detail: opt }));
  }, [currentRoleKey]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toTimeString().split(' ')[0]);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleMuteToggle = () => {
    const active = soundManager.toggleMute();
    setIsMuted(!active);
  };

  const handleSyncPulse = () => {
    soundManager.playClick();
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 500);
  };

  const currentRole = ROLE_OPTIONS.find(r => r.key === currentRoleKey) || ROLE_OPTIONS[0];

  return (
    <header className="h-14 border-b border-slate-800/80 px-4 sm:px-5 flex items-center justify-between bg-[#0d1321]/80 backdrop-blur-md z-10 shrink-0">
      {/* Left: Menu Toggle, Title & Live Indicators */}
      <div className="flex items-center space-x-3 text-xs overflow-hidden">
        {onToggleSidebar && (
          <button
            onClick={() => {
              soundManager.playClick();
              onToggleSidebar();
            }}
            title={isSidebarCollapsed ? 'Mở rộng menu (Expand Sidebar)' : 'Thu gọn menu (Collapse Sidebar)'}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-slate-700 transition shrink-0"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        <div className="flex items-center space-x-2 text-white font-bold tracking-wide">
          <Activity className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="truncate hidden sm:inline">TỔNG QUAN ĐIỀU HÀNH SẢN XUẤT TOÀN CHUỖI CUNG ỨNG</span>
          <span className="truncate sm:hidden">NEURAL LINK PRO</span>
        </div>

        {/* Explicit Demo Mode Badge in Top Header */}
        <div className="hidden xl:flex items-center space-x-1.5 bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full text-[10px] font-mono">
          <ShieldAlert className="w-3 h-3 text-amber-400 shrink-0" />
          <span>DEMO MODE — CHƯA KẾT NỐI DB THẬT</span>
        </div>

        <div className="hidden md:flex items-center space-x-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[11px] font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>LIVE TELEMETRY (12ms)</span>
        </div>

        {/* RBAC Role Profile Switcher */}
        <div className="hidden lg:flex items-center space-x-1.5 bg-slate-900/90 border border-cyan-800/60 rounded-lg px-2 py-1 text-xs">
          <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[10px] text-slate-400">Role:</span>
          <select
            value={currentRoleKey}
            onChange={(e) => {
              soundManager.playClick();
              setCurrentRoleKey(e.target.value);
            }}
            className="bg-transparent text-[11px] font-mono font-bold text-cyan-300 focus:outline-none cursor-pointer"
            title="Chuyển đổi phân quyền người dùng (8 Roles RBAC)"
          >
            {ROLE_OPTIONS.map(opt => (
              <option key={opt.key} value={opt.key} className="bg-slate-900 text-white">
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right: Controls & Action Triggers */}
      <div className="flex items-center space-x-2.5">
        {/* Audio SFX Toggle */}
        <button
          onClick={handleMuteToggle}
          title={isMuted ? 'Bật âm thanh hiệu ứng cybernetics' : 'Tắt âm thanh'}
          className={`p-1.5 rounded-lg border transition ${
            isMuted 
              ? 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300' 
              : 'bg-cyan-950/60 border-cyan-500/40 text-cyan-400 shadow-sm'
          }`}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>

        {/* Sync Pulse */}
        <button
          onClick={handleSyncPulse}
          title="Đồng bộ telemetry tức thời (<12ms)"
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-slate-700 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-cyan-400' : ''}`} />
        </button>

        {/* Adverse Stream Filter */}
        <button
          onClick={() => {
            soundManager.playClick();
            onToggleFilter();
          }}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition border ${
            filterMode === 'adverse'
              ? 'bg-red-500/20 border-red-500/60 text-red-300 shadow-lg shadow-red-500/20 animate-pulse'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
          <span className="hidden sm:inline">
            {filterMode === 'adverse' ? 'Đang lọc: Luồng bất lợi' : `Lọc luồng bất lợi (w > 0.5)`}
          </span>
          <span className="text-[10px] bg-red-500/30 text-red-300 px-1 py-0.2 rounded font-bold">
            {adverseCount}
          </span>
        </button>

        {/* Export ISO Report */}
        <button
          onClick={() => {
            soundManager.playClick();
            onOpenReportModal();
          }}
          className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white flex items-center space-x-1.5 transition"
        >
          <FileDown className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden md:inline">Báo cáo ISO/IATF</span>
        </button>

        {/* Mobile 390px System Toggle */}
        <button
          onClick={() => {
            soundManager.playClick();
            onToggleMobileMode();
          }}
          title="Chuyển đổi giao diện hệ Mobile 390px (Đốc công & Handheld Scanner)"
          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition border ${
            isMobileMode
              ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-md shadow-cyan-500/20'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-cyan-400 hover:border-slate-700'
          }`}
        >
          <span className="text-sm">📱</span>
          <span className="hidden sm:inline">{isMobileMode ? 'Hệ Mobile 390px' : 'Hệ Mobile (390px)'}</span>
        </button>

        {/* Gemini Function Calling & AI Assistant */}
        <button
          onClick={() => {
            soundManager.playClick();
            onOpenAiDiagnosticsModal();
          }}
          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-purple-950/50 border border-purple-500/40 text-purple-300 hover:bg-purple-900/60 flex items-center space-x-1.5 transition shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden lg:inline">Gemini AI Studio</span>
        </button>

        {/* AI Emergency Intervention */}
        <button
          onClick={() => {
            onTriggerAiIntervention();
          }}
          disabled={isAiIntervened}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-lg transition ${
            isAiIntervened 
              ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 cursor-default'
              : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/25 active:scale-95'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>{isAiIntervened ? '✓ Đã can thiệp AI' : '+ Kích hoạt can thiệp AI'}</span>
        </button>
      </div>
    </header>
  );
};
