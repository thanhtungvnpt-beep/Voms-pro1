import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, Zap, Volume2, VolumeX, FileDown, 
  Sparkles, RefreshCw, Clock, Radio, Activity
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
  adverseCount
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(!soundManager.enabled);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

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

  return (
    <header className="h-14 border-b border-slate-800/80 px-5 flex items-center justify-between bg-[#0d1321]/80 backdrop-blur-md z-10 shrink-0">
      {/* Left: Title & Live Indicators */}
      <div className="flex items-center space-x-3 text-xs overflow-hidden">
        <div className="flex items-center space-x-2 text-white font-bold tracking-wide">
          <Activity className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="truncate hidden sm:inline">TỔNG QUAN ĐIỀU HÀNH SẢN XUẤT TOÀN CHUỖI CUNG ỨNG</span>
          <span className="truncate sm:hidden">NEURAL LINK PRO</span>
        </div>

        <div className="hidden md:flex items-center space-x-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[11px] font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>LIVE TELEMETRY (12ms)</span>
        </div>

        <span className="text-slate-600 hidden md:inline">|</span>

        <div className="hidden lg:flex items-center space-x-1.5 text-slate-300 text-xs">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>CA 1 (08:00 - 16:00)</span>
          <span className="font-mono text-cyan-300 bg-slate-900 px-1.5 py-0.5 rounded text-[11px] border border-slate-800">
            {timeStr || '14:15:00'}
          </span>
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
