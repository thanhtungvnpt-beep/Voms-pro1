import React, { useState } from 'react';
import {
  Activity, AlertTriangle, ArrowRight, CheckCircle2, ChevronRight,
  Clock, Cpu, Database, Eye, FileText, Filter, Layers,
  Maximize2, Play, RefreshCw, Settings, ShieldCheck, Truck,
  Users, Wrench, X, Zap, Bell, Check, TrendingDown, TrendingUp,
  Share2, Download, Sparkles, Sliders, Info, HelpCircle, Plus,
  Calendar, CheckSquare
} from 'lucide-react';
import { soundManager } from '../../utils/audio';

// --- TYPES & INTERFACES ---
export interface GanttWorkOrder {
  id: string;
  vendorName: string;
  sku: string;
  workOrderCode: string;
  targetOutput: number;
  actualRate: number;
  status: 'on_track' | 'stable' | 'delayed' | 'critical';
  taskDescription: string;
  startHourIndex: number; // 0 to 7 (08:00 to 15:00)
  spanHours: number;
  note?: string;
  hasCausalWarning?: boolean;
  causalWarningText?: string;
  subBlock?: {
    type: 'downtime' | 'rework';
    title: string;
    startHourIndex: number;
    spanHours: number;
  };
}

export interface SmartAction {
  id: number;
  title: string;
  description: string;
  priority: 'KHẨN CẤP' | 'TRUNG BÌNH' | 'TỐI ƯU';
  priorityBadge: string;
  actionText: string;
  executed?: boolean;
}

interface NeuralLinkGanttSchedulerProps {
  onNavigateTab?: (tabId: string) => void;
}

export const NeuralLinkGanttScheduler: React.FC<NeuralLinkGanttSchedulerProps> = ({
  onNavigateTab
}) => {
  // --- STATES ---
  const [selectedTimeView, setSelectedTimeView] = useState<'shift' | 'hourly' | '7days' | 'week'>('shift');
  const [selectedPlantFilter, setSelectedPlantFilter] = useState<string>('TẤT CẢ (7)');
  const [showCriticalPath, setShowCriticalPath] = useState<boolean>(true);
  const [showCausalEdges, setShowCausalEdges] = useState<boolean>(true);
  const [showOtdMilestones, setShowOtdMilestones] = useState<boolean>(true);
  const [activeWorkOrderId, setActiveWorkOrderId] = useState<string | null>('WO-906');

  // Modals inside M02
  const [isNewWoModalOpen, setIsNewWoModalOpen] = useState<boolean>(false);
  const [isWhatIfModalOpen, setIsWhatIfModalOpen] = useState<boolean>(false);
  const [isAiBalancingActive, setIsAiBalancingActive] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New WO Form State
  const [newWoForm, setNewWoForm] = useState({
    vendorName: 'KHV • Line 02',
    sku: 'SKU-A990 (Main Chassis)',
    targetOutput: 14000,
    spanHours: 6
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Danh mục lệnh sản xuất trên Gantt Matrix (Gantt Rows)
  const [workOrders, setWorkOrders] = useState<GanttWorkOrder[]>([
    {
      id: 'WO-901',
      vendorName: 'KHV • Line 01',
      sku: 'SKU-A980 (Camera Bracket)',
      workOrderCode: 'WO-901',
      targetOutput: 15000,
      actualRate: 85,
      status: 'on_track',
      taskDescription: 'Dập & Mạ Chân Pin [Hoàn thành 12,800/15,000]',
      startHourIndex: 0,
      spanHours: 6.5,
      note: 'Dư thừa 22% công suất ca chiều'
    },
    {
      id: 'WO-902',
      vendorName: 'DREAM TECH',
      sku: 'SKU-B210 (Sensor Shell Base)',
      workOrderCode: 'WO-902',
      targetOutput: 18000,
      actualRate: 72,
      status: 'stable',
      taskDescription: 'Đúc Áp Lực Cao (Die-Casting) • 13,000 pcs',
      startHourIndex: 0,
      spanHours: 5.5,
      note: 'Làm mát & Đóng gói'
    },
    {
      id: 'WO-903',
      vendorName: 'HSTEC',
      sku: 'SKU-C450 (SMT Sub-Module)',
      workOrderCode: 'WO-903',
      targetOutput: 16000,
      actualRate: 78,
      status: 'on_track',
      taskDescription: 'SMT Gắn chip cao tốc • 12,500 pcs',
      startHourIndex: 0,
      spanHours: 6.0,
      hasCausalWarning: true,
      causalWarningText: 'Thiếu 12 NV chuyền 2',
      note: 'AOI Inspection trượt takt-time'
    },
    {
      id: 'WO-904',
      vendorName: 'KTECH CNC Line 2',
      sku: 'Kẹt dao phay R08 • Dừng 42m',
      workOrderCode: 'WO-904',
      targetOutput: 20000,
      actualRate: 60,
      status: 'delayed',
      taskDescription: 'Phay CNC thô',
      startHourIndex: 0,
      spanHours: 3.0,
      hasCausalWarning: true,
      causalWarningText: 'R08 Spindle Alert',
      subBlock: {
        type: 'downtime',
        title: 'STOP 42M',
        startHourIndex: 3.0,
        spanHours: 0.8
      },
      note: 'Trễ bù ca 2 (-2.2k pcs)'
    },
    {
      id: 'WO-905',
      vendorName: 'HOJEONG VINA',
      sku: 'SKU-F104 • Rework Laser: 12%',
      workOrderCode: 'WO-905',
      targetOutput: 18000,
      actualRate: 76,
      status: 'stable',
      taskDescription: 'Hàn Siêu Âm Laser (13,700 pcs)',
      startHourIndex: 0,
      spanHours: 5.0,
      subBlock: {
        type: 'rework',
        title: 'REWORK 12%',
        startHourIndex: 5.0,
        spanHours: 1.0
      },
      note: 'Kiểm chuẩn OQC'
    },
    {
      id: 'WO-906',
      vendorName: 'DAAL Precision',
      sku: 'Đứt gãy chuỗi phôi R06 từ 10:30',
      workOrderCode: 'WO-906 [DELAY]',
      targetOutput: 18000,
      actualRate: 48,
      status: 'critical',
      taskDescription: 'Chạy 8,600 pcs',
      startHourIndex: 0,
      spanHours: 2.5,
      hasCausalWarning: true,
      causalWarningText: 'Causal Link: Thiếu vật liệu R06 ➔ WO-906 (-32% Qty)',
      subBlock: {
        type: 'downtime',
        title: 'TRỄ TIẾN ĐỘ 2.5H (THIẾU PHÔI VẬT LIỆU R06)',
        startHourIndex: 2.5,
        spanHours: 4.5
      },
      note: 'Không thể giao OTD'
    }
  ]);

  // Danh mục khuyến nghị điều độ thông minh AI
  const [smartActions, setSmartActions] = useState<SmartAction[]>([
    {
      id: 1,
      title: 'Chuyển 800 pcs lệnh gáp từ DAAL sang KHV Line 3 dự phòng',
      description: 'KHV hiện dư thừa 22% công suất dây chuyền 3. Thời gian setup khuôn ước tính 15 phút, giải cứu 80% chỉ tiêu OTD buổi chiều.',
      priority: 'KHẨN CẤP',
      priorityBadge: 'bg-red-500/20 text-red-300 border-red-500/40',
      actionText: 'Chấp thuận điều phối',
      executed: false
    },
    {
      id: 2,
      title: 'Tăng tốc độ băng chuyền HojeongB thêm +8% trong ca chiều',
      description: 'Nhiệt độ khuôn ép đang ở mức lý tưởng (64°C). Bù đắp sản lượng thiếu hụt cho cụm linh kiện F104 mà không tăng tỷ lệ phế phẩm.',
      priority: 'TRUNG BÌNH',
      priorityBadge: 'bg-slate-800 text-slate-300 border-slate-700',
      actionText: 'Áp dụng',
      executed: false
    },
    {
      id: 3,
      title: 'Xếp lại lịch bảo trì CNC KTECH sang 16:30 (sau ca 1)',
      description: 'Tránh chồng chéo gián đoạn trong giờ cao điểm. Đội ngũ kỹ thuật bảo trì ca 2 đã sẵn sàng linh kiện thay thế tại trạm.',
      priority: 'TỐI ƯU',
      priorityBadge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      actionText: 'Xác nhận',
      executed: false
    }
  ]);

  const handleExecuteAction = (actionId: number) => {
    soundManager.playSuccess();
    setSmartActions(prev => prev.map(a => a.id === actionId ? { ...a, executed: true } : a));

    if (actionId === 1) {
      // Rebalance DAAL and KHV
      setWorkOrders(prev => prev.map(wo => {
        if (wo.id === 'WO-906') {
          return {
            ...wo,
            actualRate: 75,
            status: 'stable',
            note: 'Đã san tải 800 pcs sang KHV Line 3',
            subBlock: undefined,
            spanHours: 6.0
          };
        }
        if (wo.id === 'WO-901') {
          return {
            ...wo,
            actualRate: 92,
            note: 'Đã nhận lệnh san tải 800 pcs từ DAAL'
          };
        }
        return wo;
      }));
    } else if (actionId === 3) {
      // Reschedule KTECH
      setWorkOrders(prev => prev.map(wo => {
        if (wo.id === 'WO-904') {
          return {
            ...wo,
            actualRate: 82,
            status: 'on_track',
            note: 'Bảo trì đã dời sang 16:30',
            subBlock: undefined,
            spanHours: 6.5
          };
        }
        return wo;
      }));
    }

    showToast('Đã nạp hành động điều độ vào GMES Smart Factory Autonomous Engine!');
  };

  const handleApplyAllActions = () => {
    soundManager.playSuccess();
    setSmartActions(prev => prev.map(a => ({ ...a, executed: true })));
    setWorkOrders(prev => prev.map(wo => ({
      ...wo,
      actualRate: Math.max(wo.actualRate, 86),
      status: 'on_track',
      subBlock: undefined,
      spanHours: Math.min(7.5, wo.spanHours + 1.5)
    })));
    showToast('Đã thực thi áp dụng tất cả 3 khuyến nghị điều độ!');
  };

  const handleAiBalancing = () => {
    soundManager.playSuccess();
    setIsAiBalancingActive(true);
    setTimeout(() => {
      setIsAiBalancingActive(false);
      handleApplyAllActions();
      showToast('Thuật toán Genetic Algorithm & Causal Balancing đã tối ưu toàn bộ ma trận Gantt!');
    }, 1200);
  };

  const handleCreateWorkOrder = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playSuccess();
    const newWo: GanttWorkOrder = {
      id: `WO-90${workOrders.length + 1}`,
      vendorName: newWoForm.vendorName,
      sku: newWoForm.sku,
      workOrderCode: `WO-90${workOrders.length + 1}`,
      targetOutput: newWoForm.targetOutput,
      actualRate: 90,
      status: 'on_track',
      taskDescription: `Gia công & Điều độ mới • ${newWoForm.targetOutput.toLocaleString()} pcs`,
      startHourIndex: 0,
      spanHours: newWoForm.spanHours,
      note: 'Lệnh điều phối mới khởi tạo'
    };
    setWorkOrders(prev => [newWo, ...prev]);
    setIsNewWoModalOpen(false);
    showToast(`Đã khởi tạo lệnh sản xuất ${newWo.workOrderCode}!`);
  };

  const handleExportGantt = () => {
    soundManager.playClick();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(workOrders, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `GMES_GANTT_MATRIX_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Đã xuất file cấu hình Ma trận Gantt!');
  };

  // Filtered rows
  const filteredWorkOrders = workOrders.filter(wo => {
    if (selectedPlantFilter === 'TẤT CẢ (7)') return true;
    return wo.vendorName.toUpperCase().includes(selectedPlantFilter.toUpperCase());
  });

  const activeWorkOrder = workOrders.find(w => w.id === activeWorkOrderId);

  return (
    <div className="space-y-4">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 bg-cyan-950 border border-cyan-400 text-cyan-200 px-4 py-2.5 rounded-xl shadow-2xl flex items-center space-x-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* TOP STATUS BAR FOR M02 */}
      <header className="h-14 border border-slate-800/80 px-5 rounded-2xl flex items-center justify-between bg-[#0d1321]/90 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-xs">
            <span className="text-slate-400">OPERATIONS /</span>
            <span className="text-slate-400">02. KẾ HOẠCH SẢN XUẤT /</span>
            <span className="text-cyan-400 font-bold">GANTT MATRIX SCHEDULER</span>
          </div>
          <span className="text-slate-700 hidden sm:inline">|</span>
          <div className="hidden md:flex items-center space-x-2 text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>LIVE GMES SYNC</span>
          </div>
          <span className="text-xs text-slate-400 font-mono hidden lg:inline">
            CA 1 (08:00 - 16:00) • FLOW ID: RT-8924
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={() => {
              soundManager.playClick();
              setIsNewWoModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center space-x-1.5 shadow-lg shadow-cyan-500/20 transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ New Work Order</span>
          </button>

          <button 
            onClick={handleAiBalancing}
            disabled={isAiBalancingActive}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 flex items-center space-x-1.5 transition active:scale-95"
          >
            <Sparkles className={`w-3.5 h-3.5 text-cyan-400 ${isAiBalancingActive ? 'animate-spin' : ''}`} />
            <span>{isAiBalancingActive ? 'Đang cân bằng...' : 'AI Balancing'}</span>
          </button>

          <button 
            onClick={() => {
              soundManager.playClick();
              setIsWhatIfModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 flex items-center space-x-1.5 transition active:scale-95"
          >
            <Share2 className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">What-if Scenario</span>
          </button>

          <button 
            onClick={handleExportGantt}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 flex items-center space-x-1.5 transition active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden md:inline">Export</span>
          </button>
        </div>
      </header>

      {/* 1. TOP METRIC CARDS (4 CARDS) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Card 1: Kế hoạch tổng ngày */}
        <div className="p-3.5 rounded-xl bg-[#0d1627] border border-cyan-500/40 shadow-lg shadow-cyan-500/5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center space-x-1">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>KẾ HOẠCH TỔNG NGÀY</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">TARGET</span>
            </div>
            <div className="text-2xl font-black font-mono text-white">
              18,000 <span className="text-xs font-normal text-slate-400">PCS</span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800 flex justify-between items-center text-[11px]">
            <span className="text-slate-400">Đã chạy: <strong className="text-slate-200 font-mono">14,200 pcs (78.8%)</strong></span>
            <span className="text-red-400 font-mono font-bold">Lệch: -3,800</span>
          </div>
        </div>

        {/* Card 2: Tuân thủ lịch trình */}
        <div className="p-3.5 rounded-xl bg-[#0f1d1a] border border-emerald-500/50 shadow-lg shadow-emerald-500/5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>TUÂN THỦ LỊCH TRÌNH</span>
              </span>
              <span className="text-[10px] bg-red-500/20 text-red-400 font-bold px-1.5 py-0.2 rounded">-4.2%</span>
            </div>
            <div className="text-2xl font-black font-mono text-emerald-400">86.4%</div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800 flex justify-between items-center text-[11px]">
            <span className="text-slate-400">Mục tiêu: <strong className="text-slate-200">≥ 92.0%</strong></span>
            <span className="text-amber-400 font-mono">Trôi thời gian: 48m</span>
          </div>
        </div>

        {/* Card 3: Lệnh sản xuất điều độ */}
        <div className="p-3.5 rounded-xl bg-[#161226] border border-purple-500/40 shadow-lg shadow-purple-500/5 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider flex items-center space-x-1">
                <FileText className="w-3.5 h-3.5 text-purple-400" />
                <span>LỆNH SẢN XUẤT ĐIỀU ĐỘ</span>
              </span>
              <span className="text-[10px] text-purple-300 font-mono">WO ACTIVE</span>
            </div>
            <div className="text-2xl font-black font-mono text-white">
              {workOrders.length} <span className="text-xs font-normal text-slate-400">LỆNH (WO)</span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-800 flex justify-between items-center text-[10px]">
            <span className="bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-bold">18 Chuẩn</span>
            <span className="bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold">4 Rủi ro</span>
            <span className="bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-bold">2 Chậm</span>
          </div>
        </div>

        {/* Card 4: Điểm nghẽn đường găng Critical Path */}
        <div className="p-3.5 rounded-xl bg-[#1c0f14] border border-red-500/60 shadow-lg shadow-red-500/10 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span>ĐIỂM NGHẼN ĐƯỜNG GĂNG (CRITICAL)</span>
              </span>
              <span className="text-[10px] bg-red-500/20 text-red-400 font-bold px-1.5 py-0.2 rounded">2 ĐIỂM</span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex items-center space-x-2">
                <span className="text-[9px] bg-red-500 text-slate-950 font-black px-1 rounded">DAAL</span>
                <span className="text-slate-200 truncate">Thiếu phôi mã R06</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-[9px] bg-amber-500 text-slate-950 font-black px-1 rounded">KTECH</span>
                <span className="text-slate-200 truncate">Kẹt ép CNC R08 (42m)</span>
              </div>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-red-500/20 flex justify-end items-center">
            <button 
              onClick={() => onNavigateTab ? onNavigateTab('causal_ai') : undefined}
              className="text-[10px] text-cyan-400 hover:underline flex items-center space-x-1 font-bold"
            >
              <span>Chi tiết đường găng AI</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

      </section>

      {/* 2. GANTT MATRIX SCHEDULER PLAYGROUND */}
      <div className="bg-[#0b101d] rounded-2xl border border-slate-800/90 p-4 flex flex-col space-y-3">
        
        {/* Filter & View Mode Controls Bar */}
        <div className="flex flex-wrap justify-between items-center pb-2 border-b border-slate-800/80 gap-3">
          <div className="flex flex-wrap items-center gap-3">
            
            {/* View modes */}
            <div className="flex items-center space-x-2 text-xs">
              <span className="font-bold text-slate-400">CHẾ ĐỘ XEM:</span>
              <div className="flex rounded-lg bg-slate-900 border border-slate-800 p-0.5">
                {[
                  { id: 'shift', label: 'Theo Ca (Shift)' },
                  { id: 'hourly', label: 'Theo Giờ (Hourly)' },
                  { id: '7days', label: '7 Ngày' },
                  { id: 'week', label: 'Tuần' },
                ].map(vm => (
                  <button 
                    key={vm.id}
                    onClick={() => {
                      soundManager.playClick();
                      setSelectedTimeView(vm.id as any);
                    }}
                    className={`px-2.5 py-1 rounded-md transition font-medium ${
                      selectedTimeView === vm.id 
                        ? 'bg-cyan-500/20 text-cyan-400 font-bold' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {vm.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Satellite plants buttons */}
            <div className="flex flex-wrap items-center gap-1 text-xs">
              {['TẤT CẢ (7)', 'KHV', 'DREAM TECH', 'HSTEC', 'KTECH', 'HOJEONGB', 'HOJEONG VINA', 'DAAL'].map((plant) => (
                <button
                  key={plant}
                  onClick={() => {
                    soundManager.playClick();
                    setSelectedPlantFilter(plant);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                    selectedPlantFilter === plant 
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow' 
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {plant}
                </button>
              ))}
            </div>

          </div>

          {/* Toggles */}
          <div className="flex items-center space-x-3 text-xs">
            <label className="flex items-center space-x-1.5 cursor-pointer">
              <input 
                type="checkbox" 
                checked={showCriticalPath} 
                onChange={e => setShowCriticalPath(e.target.checked)}
                className="rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-0" 
              />
              <span className="text-amber-300 font-medium text-[11px]">ĐƯỜNG GĂNG (CRITICAL)</span>
            </label>
            <label className="flex items-center space-x-1.5 cursor-pointer">
              <input 
                type="checkbox" 
                checked={showCausalEdges} 
                onChange={e => setShowCausalEdges(e.target.checked)}
                className="rounded bg-slate-900 border-slate-700 text-purple-500 focus:ring-0" 
              />
              <span className="text-purple-300 font-medium text-[11px]">NHÂN QUẢ AI</span>
            </label>
            <label className="flex items-center space-x-1.5 cursor-pointer">
              <input 
                type="checkbox" 
                checked={showOtdMilestones} 
                onChange={e => setShowOtdMilestones(e.target.checked)}
                className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0" 
              />
              <span className="text-emerald-300 font-medium text-[11px]">CỘT MỐC OTD</span>
            </label>
          </div>
        </div>

        {/* GANTT TIMELINE TABLE */}
        <div className="border border-slate-800/80 rounded-xl overflow-x-auto bg-[#070e1b]/80 min-w-[760px]">
          
          {/* Table Header: Vendors & Time Hours */}
          <div className="grid grid-cols-12 bg-slate-900/90 text-slate-400 text-[11px] font-semibold border-b border-slate-800 py-2.5 px-3 min-w-[760px]">
            <div className="col-span-3 flex items-center space-x-2">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>DÂY CHUYỀN / VENDOR / KẾ HOẠCH SKU</span>
            </div>
            <div className="col-span-1 text-center font-mono">TIẾN ĐỘ</div>
            <div className="col-span-8 grid grid-cols-8 text-center font-mono text-[10px]">
              <div>08:00</div>
              <div>09:00</div>
              <div>10:00</div>
              <div>11:00</div>
              <div>12:00</div>
              <div>13:00</div>
              <div className="text-cyan-400 font-bold bg-cyan-500/15 rounded py-0.5 border border-cyan-500/30">
                14:00 NOW
              </div>
              <div>15:00 - 16:00</div>
            </div>
          </div>

          {/* Gantt Rows */}
          <div className="divide-y divide-slate-800/60 min-w-[760px]">
            {filteredWorkOrders.map((wo) => {
              const isSelected = activeWorkOrderId === wo.id;
              return (
                <div 
                  key={wo.id}
                  onClick={() => {
                    soundManager.playClick();
                    setActiveWorkOrderId(wo.id);
                  }}
                  className={`grid grid-cols-12 items-center px-3 py-2 text-xs transition cursor-pointer hover:bg-slate-800/40 ${
                    isSelected ? 'bg-cyan-500/10 border-l-2 border-cyan-400' : ''
                  }`}
                >
                  {/* Col 1: Vendor & SKU */}
                  <div className="col-span-3 pr-2">
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${
                        wo.status === 'critical' ? 'bg-red-500 animate-ping' :
                        wo.status === 'delayed' ? 'bg-amber-500' : 'bg-emerald-400'
                      }`} />
                      <span className="font-bold text-white truncate">{wo.vendorName}</span>
                      <span className="text-[9px] bg-slate-800 text-slate-300 px-1 py-0.2 rounded font-mono shrink-0">
                        {wo.workOrderCode}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate pl-4">{wo.sku}</div>
                  </div>

                  {/* Col 2: Progress rate */}
                  <div className="col-span-1 text-center font-mono font-bold">
                    <span className={`text-[11px] ${
                      wo.status === 'critical' ? 'text-red-400' :
                      wo.status === 'delayed' ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {wo.actualRate}%
                    </span>
                    <div className="text-[9px] text-slate-500 font-normal">
                      {(wo.targetOutput/1000).toFixed(0)}k pcs
                    </div>
                  </div>

                  {/* Col 3: Gantt Timeline Bar Span */}
                  <div className="col-span-8 relative h-8 flex items-center bg-slate-900/40 rounded-lg overflow-hidden border border-slate-800/40 px-1">
                    
                    {/* Grid guideline markers for hours */}
                    <div className="absolute inset-0 grid grid-cols-8 pointer-events-none opacity-20 divide-x divide-slate-700 h-full" />

                    {/* Main Task Bar */}
                    <div 
                      className={`h-6 rounded-md flex items-center px-2 text-[10px] font-bold text-slate-950 truncate transition shadow ${
                        wo.status === 'critical' 
                          ? 'bg-red-500/90 text-white shadow-red-500/20' 
                          : wo.status === 'delayed'
                          ? 'bg-purple-500 text-white'
                          : 'bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                      }`}
                      style={{ width: `${(wo.spanHours / 8) * 100}%` }}
                    >
                      <span className="truncate">{wo.taskDescription}</span>
                    </div>

                    {/* Sub-block (Downtime / Rework) */}
                    {wo.subBlock && (
                      <div 
                        className={`h-6 rounded-md ml-1 flex items-center px-2 text-[9px] font-black truncate shadow ${
                          wo.subBlock.type === 'downtime'
                            ? 'bg-red-950 border border-red-500 text-red-300 animate-pulse'
                            : 'bg-purple-950 border border-purple-400 text-purple-200'
                        }`}
                        style={{ width: `${(wo.subBlock.spanHours / 8) * 100}%` }}
                      >
                        <span className="truncate">{wo.subBlock.title}</span>
                      </div>
                    )}

                    {/* Extra note label on the right */}
                    {wo.note && (
                      <div className="ml-auto pl-2 text-[10px] text-slate-400 truncate shrink-0">
                        {wo.note}
                      </div>
                    )}

                  </div>

                </div>
              );
            })}
          </div>

        </div>

        {/* Gantt Legends & Auto-sync state */}
        <div className="flex flex-wrap justify-between items-center text-[11px] pt-1 text-slate-400 gap-2">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-bold text-slate-300">CHÚ GIẢI GANTT:</span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded bg-emerald-400" />
              <span>Đúng tiến độ (&gt;75%)</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded bg-cyan-400" />
              <span>Đang chạy ổn định</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded bg-purple-500" />
              <span>Rủi ro / Rework</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded bg-red-500" />
              <span>Tắc nghẽn / Dừng dây chuyền</span>
            </span>
          </div>

          <div className="flex items-center space-x-2 text-slate-500 text-[10px]">
            <RefreshCw className="w-3 h-3 text-cyan-400 animate-spin" />
            <span>Tự động cập nhật mỗi 30s từ hệ thống GMES IoT (12ms Latency)</span>
          </div>
        </div>

      </div>

      {/* 3. BOTTOM SPLIT: CRITICAL PATH ANALYSIS (LEFT) & AI SMART ACTIONS (RIGHT) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 pb-2">
        
        {/* 3.1 CRITICAL PATH ANALYSIS (5 COLS) */}
        <div className="lg:col-span-5 bg-[#0d1321] rounded-2xl border border-slate-800 p-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xs font-bold text-white flex items-center space-x-2">
                <Share2 className="w-4 h-4 text-cyan-400" />
                <span>PHÂN TÍCH ĐƯỜNG GĂNG (CRITICAL PATH)</span>
              </h3>
              <span className="text-[10px] bg-red-500/20 text-red-400 font-bold px-1.5 py-0.5 rounded">2 ĐIỂM THẮT</span>
            </div>
            <p className="text-[10px] text-slate-400 mb-3">
              Mô hình nhân quả AI phát hiện 2 điểm đứt gãy đe dọa trực tiếp đến cam kết giao hàng OTD 17:00 chiều nay.
            </p>

            {/* Point 1: DAAL */}
            <div className="p-2.5 rounded-xl bg-red-950/20 border border-red-500/40 space-y-1 mb-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-red-300">● 01. DAAL Precision — WO-906</span>
                <span className="text-[9px] bg-red-500/20 text-red-400 font-bold px-1 rounded">Tác động: 32% Sản lượng</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Đứt gãy cung ứng phôi mã <strong>R06</strong> từ kho trung tâm khiến dây chuyền dừng máy từ 10:30. Dự báo trễ <strong>2.5 giờ</strong>, không hoàn thành 9,400 pcs nếu không điều phối khẩn.
              </p>
              <div className="text-[10px] text-slate-400 pt-1 border-t border-red-500/20">
                Chuỗi nhân quả: <span className="text-cyan-300">Kho NVL ➔ DAAL ➔ TO-3011 (OTD Fail)</span>
              </div>
            </div>

            {/* Point 2: KTECH */}
            <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/40 space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-amber-300">● 02. KTECH CNC Line 2 — WO-904</span>
                <span className="text-[9px] bg-amber-500/20 text-amber-300 font-bold px-1 rounded">Tác động: -1,200 pcs</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Sự cố kẹt dao phay ép CNC trục <strong>R08</strong> làm trôi lịch 42 phút. Tỷ lệ OEE ca 1 sụt giảm còn 60%, dẫn tới nguy cơ tắc nghẽn công đoạn mạ bề mặt kế tiếp.
              </p>
              <div className="text-[10px] text-slate-400 pt-1 border-t border-amber-500/20">
                Đề xuất: <span className="text-amber-300">Chuyển thời gian bảo dưỡng dự phòng sang 16:30</span>
              </div>
            </div>

          </div>

          <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-400">
            <span>Thuật toán Monte Carlo (10,000 runs):</span>
            <span className="text-cyan-400 font-mono font-bold">Độ tin cậy: 98.4%</span>
          </div>
        </div>

        {/* 3.2 AI SMART ACTIONS (7 COLS) */}
        <div className="lg:col-span-7 bg-[#0d1321] rounded-2xl border border-slate-800 p-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-xs font-bold text-white flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>KHUYẾN NGHỊ ĐIỀU ĐỘ THÔNG MINH (AI SMART ACTIONS)</span>
              </h3>
              <button 
                onClick={handleApplyAllActions}
                className="text-[10px] text-cyan-400 hover:underline font-bold"
              >
                Áp dụng tất cả (3) ✓
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mb-2.5">
              Các phương án giải phóng đường găng được tối ưu hóa theo chi phí, nhân lực và thời hạn bàn giao đơn hàng:
            </p>

            {/* Actions List */}
            <div className="space-y-2">
              {smartActions.map((action) => (
                <div 
                  key={action.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition ${
                    action.executed 
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-400' 
                      : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1 pr-3 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-[10px] shrink-0">
                        {action.id}
                      </span>
                      <span className="font-bold text-slate-200">{action.title}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border shrink-0 ${action.priorityBadge}`}>
                        {action.priority}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 pl-7 leading-relaxed">
                      {action.description}
                    </p>
                  </div>

                  {action.executed ? (
                    <span className="text-[11px] text-emerald-400 flex items-center space-x-1 shrink-0 font-bold pr-2">
                      <Check className="w-4 h-4" />
                      <span>Đã nạp</span>
                    </span>
                  ) : (
                    <button 
                      onClick={() => handleExecuteAction(action.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 shadow transition active:scale-95 ${
                        action.priority === 'KHẨN CẤP'
                          ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20'
                          : 'bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200'
                      }`}
                    >
                      {action.actionText}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Architect & Engine Status */}
          <div className="pt-2.5 border-t border-slate-800 flex justify-between items-center text-[10px]">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full bg-cyan-600/30 border border-cyan-400/50 flex items-center justify-center font-bold text-[9px] text-cyan-300">
                NT
              </div>
              <div>
                <span className="font-bold text-slate-200">Ngô Thanh Tùng</span>
                <span className="text-cyan-400 ml-1.5 font-medium">CHIEF ARCHITECT</span>
              </div>
            </div>
            <div className="text-slate-400 flex items-center space-x-2">
              <span className="text-emerald-400">● AUTONOMOUS SCHEDULING RUNNING</span>
              <span>GMES Smart Factory 4.0</span>
            </div>
          </div>

        </div>

      </section>

      {/* =========================================================================
          MODAL 1: NEW WORK ORDER MODAL
         ========================================================================= */}
      {isNewWoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0d1321] border-2 border-cyan-500/80 rounded-2xl p-5 shadow-2xl relative text-slate-100 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Plus className="w-4 h-4 text-cyan-400" />
                <span>KHỞI TẠO LỆNH SẢN XUẤT MỚI (NEW WORK ORDER)</span>
              </h3>
              <button 
                onClick={() => setIsNewWoModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateWorkOrder} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Dây chuyền / Nhà máy vệ tinh:</label>
                <select
                  value={newWoForm.vendorName}
                  onChange={e => setNewWoForm({ ...newWoForm, vendorName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                >
                  <option value="KHV • Line 02">KHV • Line 02 (SMT Vi Mạch)</option>
                  <option value="DREAM TECH • Cell 03">DREAM TECH • Cell 03 (Ép Khuôn)</option>
                  <option value="HSTEC • Chuyền 01">HSTEC • Chuyền 01 (Lắp Ráp)</option>
                  <option value="KTECH • CNC Line 1">KTECH • CNC Line 1 (Phay Cơ Khí)</option>
                  <option value="HOJEONGB • Line 04">HOJEONGB • Line 04 (RF Module)</option>
                  <option value="HOJEONG VINA • Laser 01">HOJEONG VINA • Laser 01 (Hàn Quang Học)</option>
                  <option value="DAAL • Lò Đúc 02">DAAL • Lò Đúc 02 (Đúc Phôi Nhôm)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Mã linh kiện SKU:</label>
                <input
                  type="text"
                  value={newWoForm.sku}
                  onChange={e => setNewWoForm({ ...newWoForm, sku: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Sản lượng mục tiêu (PCS):</label>
                  <input
                    type="number"
                    value={newWoForm.targetOutput}
                    onChange={e => setNewWoForm({ ...newWoForm, targetOutput: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Thời lượng (Giờ ca):</label>
                  <input
                    type="number"
                    step="0.5"
                    max="8"
                    min="1"
                    value={newWoForm.spanHours}
                    onChange={e => setNewWoForm({ ...newWoForm, spanHours: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNewWoModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
                >
                  Xác nhận nạp lịch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: WHAT-IF SCENARIO SIMULATOR
         ========================================================================= */}
      {isWhatIfModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#0d1321] border-2 border-purple-500/80 rounded-2xl p-5 shadow-2xl relative text-slate-100 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Share2 className="w-4 h-4 text-purple-400" />
                <span>MÔ PHỎNG KỊCH BẢN ĐIỀU ĐỘ (WHAT-IF SCENARIO)</span>
              </h3>
              <button 
                onClick={() => setIsWhatIfModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed">
              <p className="text-slate-300">
                Lựa chọn phương án điều chuyển ca nhằm bảo toàn cam kết giao hàng OTD 17:00:
              </p>

              <div className="p-3 rounded-xl bg-purple-950/25 border border-purple-500/40 space-y-2">
                <div className="font-bold text-purple-300 flex justify-between">
                  <span>Kịch bản A: San tải DAAL sang KHV Line 3</span>
                  <span className="text-emerald-400">+80% OTD</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Tận dụng 22% công suất nhàn rỗi của KHV. Tăng sản lượng xuất xưởng thêm +4,800 pcs.
                </p>
                <button 
                  onClick={() => {
                    handleExecuteAction(1);
                    setIsWhatIfModalOpen(false);
                  }}
                  className="w-full py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition"
                >
                  Kích hoạt Kịch bản A
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="font-bold text-slate-200 flex justify-between">
                  <span>Kịch bản B: Tăng tốc HojeongB + Dời bảo trì KTECH</span>
                  <span className="text-emerald-400">+100% OTD</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Triệt tiêu hoàn toàn sự chậm trễ của cụm phay và laser hoàn thiện.
                </p>
                <button 
                  onClick={() => {
                    handleExecuteAction(2);
                    handleExecuteAction(3);
                    setIsWhatIfModalOpen(false);
                  }}
                  className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold rounded-lg border border-slate-700 transition"
                >
                  Kích hoạt Kịch bản B
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
