import React from 'react';
import { 
  Activity, Layers, TrendingUp, Truck, ShieldCheck, 
  Users, Wrench, Database, Cpu, FileText, CheckCircle2,
  Sparkles, Radio, Smartphone, RefreshCw, Settings, 
  Eye, FileSignature, Box, Terminal, ChevronLeft, ChevronRight,
  Menu
} from 'lucide-react';
import { soundManager } from '../utils/audio';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tabId: string) => void;
  onOpenHourlyModal: () => void;
  isAiIntervened: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenHourlyModal,
  isAiIntervened,
  isCollapsed,
  onToggleCollapse
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
    <aside 
      className={`flex-shrink-0 bg-[#0d1321]/95 border-r border-slate-800/80 flex flex-col justify-between z-30 select-none transition-all duration-300 ease-in-out relative ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Collapse Toggle Button tab on border */}
      <button
        onClick={() => {
          soundManager.playClick();
          onToggleCollapse();
        }}
        title={isCollapsed ? 'Mở rộng menu (Expand)' : 'Thu gọn menu (Collapse)'}
        className="absolute -right-3 top-5 w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-cyan-400 hover:text-white flex items-center justify-center shadow-lg transition z-40 hover:scale-110 active:scale-95"
      >
        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      <div className="flex flex-col h-[calc(100%-80px)] overflow-hidden">
        {/* Brand Header */}
        <div 
          onClick={() => handleNavClick('overview')}
          className={`p-3.5 border-b border-slate-800/60 flex items-center cursor-pointer hover:bg-slate-900/40 transition overflow-hidden ${
            isCollapsed ? 'justify-center' : 'space-x-3'
          }`}
          title={isCollapsed ? 'Neural Link Pro Control Center' : undefined}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
            <Cpu className="w-6 h-6 text-slate-950 animate-pulse" />
          </div>

          {!isCollapsed && (
            <div className="overflow-hidden animate-in fade-in duration-200">
              <div className="flex items-center space-x-1.5">
                <span className="font-black text-sm tracking-wider text-white">NEURAL LINK</span>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-1 py-0.2 rounded font-bold">PRO</span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-tight truncate">CONTROL CENTER &amp; VOMS</p>
            </div>
          )}
        </div>

        {/* Nav Links */}
        <nav className="p-2 space-y-1 text-xs overflow-y-auto flex-1">
          {/* Operations Header */}
          {!isCollapsed ? (
            <div className="px-3 py-1.5 text-[10px] font-bold text-cyan-400/80 tracking-wider uppercase flex items-center justify-between">
              <span>VẬN HÀNH (OPERATIONS)</span>
              <span className="flex items-center text-[9px] text-emerald-400 font-normal">
                <Radio className="w-2.5 h-2.5 mr-1 animate-pulse" /> 7 Plants
              </span>
            </div>
          ) : (
            <div className="my-1.5 border-t border-slate-800/80 mx-1" />
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <div key={item.id} className="relative group">
                <button
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center rounded-lg transition text-left text-xs font-medium ${
                    isCollapsed 
                      ? 'justify-center px-0 py-2.5' 
                      : 'justify-between px-3 py-2'
                  } ${
                    isActive 
                      ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/40 shadow-sm shadow-cyan-500/10' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <div className={`flex items-center truncate ${isCollapsed ? 'justify-center' : 'space-x-2.5'}`}>
                    <Icon className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-cyan-400' :
                      item.isAi ? 'text-purple-400' :
                      item.isM02 ? 'text-cyan-300' :
                      'text-slate-400 group-hover:text-slate-200'
                    }`} />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {!isCollapsed && (
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
                  )}

                  {/* Dot indicator if collapsed and has critical badge */}
                  {isCollapsed && item.criticalBadge && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  )}
                </button>

                {/* Floating Tooltip when collapsed */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-slate-900/98 border border-slate-700 text-white text-xs rounded-xl shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 z-50 flex items-center space-x-2">
                    <span className="font-semibold">{item.label}</span>
                    {item.criticalBadge && (
                      <span className="text-[9px] bg-red-500 text-white px-1 py-0.2 rounded font-bold">
                        {item.criticalBadge}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Develop Division Header */}
          {!isCollapsed ? (
            <div className="pt-3 px-3 py-1 text-[10px] font-bold text-slate-500 tracking-wider uppercase">
              PHÂN HỆ DEVELOP &amp; QA
            </div>
          ) : (
            <div className="my-2 border-t border-slate-800/80 mx-1" />
          )}

          {devItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <div key={item.id} className="relative group">
                <button
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center rounded-lg text-xs transition ${
                    isCollapsed 
                      ? 'justify-center px-0 py-2' 
                      : 'space-x-2.5 px-3 py-1.5'
                  } ${
                    isActive 
                      ? 'bg-slate-800 text-cyan-300 font-semibold' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                </button>

                {/* Floating Tooltip when collapsed */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-slate-900/98 border border-slate-700 text-white text-xs rounded-xl shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 z-50">
                    <span className="font-semibold">{item.label}</span>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Chief Architect Footer Card */}
      <div 
        className={`p-3 border-t border-slate-800/70 bg-[#070e1b]/80 shrink-0 relative group ${
          isCollapsed ? 'flex flex-col items-center justify-center' : ''
        }`}
      >
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-full bg-cyan-600/30 border border-cyan-400/50 flex items-center justify-center font-bold text-xs text-cyan-300">
              NT
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#070e1b]" />
          </div>

          {!isCollapsed && (
            <div className="overflow-hidden animate-in fade-in duration-200">
              <div className="text-xs font-bold text-slate-200 truncate">Ngô Thanh Tùng</div>
              <div className="text-[10px] text-cyan-400 font-semibold tracking-wide">CHIEF ARCHITECT</div>
            </div>
          )}
        </div>

        {!isCollapsed ? (
          <div className="mt-2 text-[9px] text-slate-500 flex justify-between items-center border-t border-slate-800/40 pt-1.5">
            <span>GMES v4.2 PRO</span>
            <span className="text-emerald-400 font-mono">● 12ms Sync</span>
          </div>
        ) : (
          <span className="text-[8px] text-emerald-400 font-mono mt-1">12ms</span>
        )}

        {/* Floating Tooltip when collapsed */}
        {isCollapsed && (
          <div className="absolute left-full ml-2 bottom-3 px-3 py-2 bg-slate-900/98 border border-slate-700 text-white text-xs rounded-xl shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 z-50">
            <div className="font-bold text-slate-200">Ngô Thanh Tùng</div>
            <div className="text-[10px] text-cyan-400 font-semibold">CHIEF ARCHITECT</div>
            <div className="text-[9px] text-emerald-400 font-mono mt-0.5">GMES v4.2 PRO • 12ms Sync</div>
          </div>
        )}
      </div>
    </aside>
  );
};
