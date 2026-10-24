import React from 'react';
import { 
  Activity, Layers, TrendingUp, Truck, ShieldCheck, 
  Users, Wrench, Database, Cpu, FileText, CheckCircle2,
  Sparkles, Radio, Smartphone, RefreshCw, Settings, 
  Eye, FileSignature, Box, Terminal
} from 'lucide-react';
import { soundManager } from '../utils/audio';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tabId: string) => void;
  onOpenHourlyModal: () => void;
  isAiIntervened: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenHourlyModal,
  isAiIntervened
}) => {
  const handleNavClick = (tabId: string) => {
    soundManager.playClick();
    onSelectTab(tabId);
  };

  const navItems = [
    { id: 'overview', label: '01. Tổng quan điều hành', icon: Activity, badge: isAiIntervened ? 'AI Active' : undefined },
    { id: 'gantt', label: '02. Kế hoạch sản xuất (M02)', icon: Layers, isM02: true },
    { id: 'mobile_scanner', label: '03. Sản lượng thực tế (M03)', icon: Smartphone, hasModalTrigger: true },
    { id: 'delivery', label: '04. Giao hàng & OTD (M04)', icon: Truck, alertCount: 1 },
    { id: 'quality', label: '05. Chất lượng OQC (M05)', icon: ShieldCheck },
    { id: 'workforce', label: '06. Quản trị nhân lực (M06)', icon: Users },
    { id: 'equipment', label: '07. Thiết bị & OEE (M07)', icon: Wrench },
    { id: 'warehouse', label: '08. Kho vật liệu phôi (M08)', icon: Database, criticalBadge: 'P1' },
    { id: 'prebuild_rework', label: '09. Prebuild & Rework (M09)', icon: RefreshCw },
    { id: 'causal_ai', label: '10. Phân tích AI Causal (M10)', icon: Cpu, isAi: true },
    { id: 'reports', label: '11. Báo cáo ISO/IATF (M11)', icon: FileText },
    { id: 'settings', label: '12. Cài đặt hệ thống (M12)', icon: Settings },
  ];

  const devItems = [
    { id: 'develop_home', label: 'Develop Home', icon: Terminal },
    { id: 'screen_library', label: 'Screen Library', icon: Layers },
    { id: 'screen_design_detail', label: 'Screen Design Detail', icon: Eye },
    { id: 'test_center', label: 'Test Center (QA)', icon: CheckCircle2 },
    { id: 'approval_release', label: 'Approval & Release', icon: FileSignature },
    { id: 'test_data_factory', label: 'Test Data Factory', icon: Database },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-[#0d1321]/95 border-r border-slate-800/80 flex flex-col justify-between z-20 select-none">
      <div className="flex flex-col h-[calc(100%-80px)]">
        {/* Brand Header */}
        <div 
          onClick={() => handleNavClick('overview')}
          className="p-4 border-b border-slate-800/60 flex items-center space-x-3 cursor-pointer hover:bg-slate-900/40 transition"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
            <Cpu className="w-6 h-6 text-slate-950 animate-pulse" />
          </div>
          <div className="overflow-hidden">
            <div className="flex items-center space-x-1.5">
              <span className="font-black text-sm tracking-wider text-white">NEURAL LINK</span>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-1 py-0.2 rounded font-bold">PRO</span>
            </div>
            <p className="text-[10px] text-slate-400 tracking-tight truncate">CONTROL CENTER &amp; VOMS</p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="p-3 space-y-1 text-xs overflow-y-auto flex-1">
          <div className="px-3 py-1.5 text-[10px] font-bold text-cyan-400/80 tracking-wider uppercase flex items-center justify-between">
            <span>VẬN HÀNH (OPERATIONS)</span>
            <span className="flex items-center text-[9px] text-emerald-400 font-normal">
              <Radio className="w-2.5 h-2.5 mr-1 animate-pulse" /> 7 Plants
            </span>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <div key={item.id} className="relative group">
                <button
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition text-left text-xs font-medium ${
                    isActive 
                      ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/40 shadow-sm shadow-cyan-500/10' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-cyan-400' :
                      item.isAi ? 'text-purple-400' :
                      item.isM02 ? 'text-cyan-300' :
                      'text-slate-400 group-hover:text-slate-200'
                    }`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  <div className="flex items-center space-x-1">
                    {item.criticalBadge && (
                      <span className="text-[9px] font-bold bg-red-500 text-white px-1 py-0.2 rounded animate-pulse">
                        {item.criticalBadge}
                      </span>
                    )}
                    {item.badge && (
                      <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1 py-0.2 rounded font-bold">
                        {item.badge}
                      </span>
                    )}
                    {item.hasModalTrigger && (
                      <span 
                        onClick={(e) => {
                          e.stopPropagation();
                          soundManager.playClick();
                          onOpenHourlyModal();
                        }}
                        className="text-[9px] bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 px-1.5 py-0.5 rounded cursor-pointer transition"
                        title="Mở Modal Drill-down"
                      >
                        Trend
                      </span>
                    )}
                  </div>
                </button>
              </div>
            );
          })}

          <div className="pt-3 px-3 py-1 text-[10px] font-bold text-slate-500 tracking-wider uppercase">
            PHÂN HỆ DEVELOP &amp; QA
          </div>
          {devItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center space-x-2.5 px-3 py-1.5 rounded-lg text-xs transition ${
                  isActive 
                    ? 'bg-slate-800 text-cyan-300 font-semibold' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Chief Architect Footer Card */}
      <div className="p-3 border-t border-slate-800/70 bg-[#070e1b]/80 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-cyan-600/30 border border-cyan-400/50 flex items-center justify-center font-bold text-xs text-cyan-300">
              NT
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#070e1b]" />
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-bold text-slate-200 truncate">Ngô Thanh Tùng</div>
            <div className="text-[10px] text-cyan-400 font-semibold tracking-wide">CHIEF ARCHITECT</div>
          </div>
        </div>
        <div className="mt-2 text-[9px] text-slate-500 flex justify-between items-center border-t border-slate-800/40 pt-1.5">
          <span>GMES v4.2 PRO</span>
          <span className="text-emerald-400 font-mono">● 12ms Sync</span>
        </div>
      </div>
    </aside>
  );
};
