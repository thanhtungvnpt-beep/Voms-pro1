import React, { useState } from 'react';
import {
  Truck, Clock, AlertTriangle, CheckCircle2, ChevronRight,
  TrendingUp, RefreshCw, Download, Zap, MapPin, Box, ArrowRight,
  ShieldCheck, FileText, Filter, Check
} from 'lucide-react';
import { soundManager } from '../../utils/audio';

export interface TransferOrder {
  id: string;
  orderCode: string;
  destination: string;
  carrier: string;
  departureTime: string;
  eta: string;
  plannedQty: number;
  actualQty: number;
  otdRiskPct: number;
  status: 'on_time' | 'at_risk' | 'delayed';
  affectedVendor: string;
  rootCause: string;
  resolved?: boolean;
}

export const NeuralLinkOTDManager: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'at_risk'>('all');
  const [transferOrders, setTransferOrders] = useState<TransferOrder[]>([
    {
      id: 'TO-3011',
      orderCode: 'TO-3011 (Hải Phòng Port)',
      destination: 'Hải Phòng International Terminal (Container Hub 04)',
      carrier: 'K-Logistics Fleet #14',
      departureTime: '15:30',
      eta: '17:45',
      plannedQty: 18000,
      actualQty: 12400,
      otdRiskPct: 68.0,
      status: 'at_risk',
      affectedVendor: 'DAAL Precision (Thiếu phôi R06)',
      rootCause: 'Thâm hụt 5,600 pcs chi tiết vỏ đúc A980'
    },
    {
      id: 'TO-3018',
      orderCode: 'TO-3018 (Nội Bài Cargo)',
      destination: 'Nội Bài Cargo Express Terminal (Gate B8)',
      carrier: 'FastAir Vina #02',
      departureTime: '16:00',
      eta: '17:15',
      plannedQty: 12000,
      actualQty: 11800,
      otdRiskPct: 12.0,
      status: 'on_time',
      affectedVendor: 'HSTEC (SMT Sub-Module)',
      rootCause: 'Bù 12 thợ thành công, kịp nhịp'
    },
    {
      id: 'TO-3022',
      orderCode: 'TO-3022 (Kho Samsung Hub)',
      destination: 'Kho Trung tâm SEVT Thái Nguyên',
      carrier: 'V-Trans Express #09',
      departureTime: '16:30',
      eta: '18:00',
      plannedQty: 20000,
      actualQty: 14200,
      otdRiskPct: 48.0,
      status: 'at_risk',
      affectedVendor: 'KTECH CNC (Spindle Alert)',
      rootCause: 'Kẹt dao phay R08 dở dang 1,200 pcs'
    },
    {
      id: 'TO-3035',
      orderCode: 'TO-3035 (Bắc Ninh Hub B02)',
      destination: 'KCN Yên Phong Bắc Ninh',
      carrier: 'Internal Shuttle 09',
      departureTime: '17:00',
      eta: '18:15',
      plannedQty: 15000,
      actualQty: 14900,
      otdRiskPct: 5.0,
      status: 'on_time',
      affectedVendor: 'HOJEONGB (RF Module)',
      rootCause: 'Vượt nhịp 104% kế hoạch điều phối'
    }
  ]);

  const handleRescueOrder = (toId: string) => {
    soundManager.playSuccess();
    setTransferOrders(prev => prev.map(to => {
      if (to.id === toId) {
        return {
          ...to,
          actualQty: to.plannedQty,
          otdRiskPct: 1.5,
          status: 'on_time',
          resolved: true,
          rootCause: 'Đã giải cứu bằng xả đệm Prebuild M09'
        };
      }
      return to;
    }));
  };

  const filteredOrders = transferOrders.filter(to => {
    if (filterStatus === 'at_risk') return to.status === 'at_risk';
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center bg-[#0d1321] p-4 rounded-2xl border border-slate-800 gap-3">
        <div className="flex items-center space-x-3 text-xs">
          <Truck className="w-5 h-5 text-cyan-400" />
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">OPERATIONS /</span>
              <h2 className="text-sm font-bold text-white">04. GIAO HÀNG &amp; TỶ LỆ ĐÚNG HẠN (TO/OTD MATRIX)</h2>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Giám sát hành trình các chuyến xe chuyển hàng (Transfer Orders) xuất Cảng Tân Vũ &amp; Nội Bài Cargo
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-emerald-400 font-mono text-xs bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 rounded-xl">
            ● LIVE LOGISTICS 12ms
          </span>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-3.5 rounded-xl bg-[#0d1627] border border-cyan-500/40">
          <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">OTD DỰ BÁO CA 1</div>
          <div className="text-2xl font-black font-mono text-white mt-1">
            68.0% <span className="text-xs text-red-400 font-normal">(-24% Target)</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Mục tiêu cam kết: ≥ 92.0%</div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#1c0f14] border border-red-500/60">
          <div className="text-[10px] text-red-400 font-bold uppercase tracking-wider">CHUYẾN XE NGUY CƠ CAO</div>
          <div className="text-2xl font-black font-mono text-red-400 mt-1">2 CHUYẾN</div>
          <div className="text-[10px] text-red-300 mt-1">TO-3011, TO-3022 trễ hàng</div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#0b1b16] border border-emerald-500/50">
          <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">SẢN LƯỢNG ĐÃ GIAO XONG</div>
          <div className="text-2xl font-black font-mono text-emerald-400 mt-1">38,400 PCS</div>
          <div className="text-[10px] text-emerald-300 mt-1">Đã niêm phong kẹp chì hải quan</div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#161226] border border-purple-500/40">
          <div className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">KHẢ NĂNG CỨU VÃN AI</div>
          <div className="text-2xl font-black font-mono text-purple-300 mt-1">+98.5% OTD</div>
          <div className="text-[10px] text-purple-300 mt-1">Áp dụng kịch bản can thiệp B</div>
        </div>
      </div>

      {/* Transfer Orders Table */}
      <div className="bg-[#0b101d] rounded-2xl border border-slate-800 p-4 space-y-3">
        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
          <h3 className="text-xs font-bold text-white flex items-center space-x-2">
            <Box className="w-4 h-4 text-cyan-400" />
            <span>DANH SÁCH LỆNH CHUYỂN HÀNG (TRANSFER ORDERS - TO)</span>
          </h3>

          <div className="flex items-center space-x-2 text-xs">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                filterStatus === 'all' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tất cả ({transferOrders.length})
            </button>
            <button
              onClick={() => setFilterStatus('at_risk')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                filterStatus === 'at_risk' ? 'bg-red-500/25 text-red-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Nguy cơ trễ
            </button>
          </div>
        </div>

        <div className="space-y-2.5">
          {filteredOrders.map((to) => {
            const isAtRisk = to.status === 'at_risk';
            return (
              <div 
                key={to.id} 
                className={`p-3.5 rounded-xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-3 text-xs transition ${
                  isAtRisk ? 'bg-red-950/20 border-red-500/50 shadow-md shadow-red-500/10' :
                  to.resolved ? 'bg-emerald-950/20 border-emerald-500/40' : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white text-sm font-mono">{to.orderCode}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isAtRisk ? 'bg-red-500/25 text-red-300 border border-red-500/40 animate-pulse' :
                      'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      Nguy cơ trễ: {to.otdRiskPct}%
                    </span>
                  </div>

                  <div className="text-slate-400 text-[11px] flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{to.destination}</span>
                    <span>• Đội xe: {to.carrier}</span>
                  </div>

                  <div className="text-[11px] text-amber-300">
                    Nguyên nhân gốc: <strong className="text-white">{to.affectedVendor}</strong> — {to.rootCause}
                  </div>
                </div>

                <div className="text-left md:text-right space-y-1 shrink-0 w-full md:w-auto">
                  <div className="font-mono text-sm font-bold text-cyan-300">
                    {to.actualQty.toLocaleString()} / {to.plannedQty.toLocaleString()} pcs
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Khởi hành: {to.departureTime} (ETA: {to.eta})
                  </div>

                  {to.resolved ? (
                    <span className="inline-flex items-center space-x-1 text-emerald-400 text-xs font-bold bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                      <Check className="w-3.5 h-3.5" />
                      <span>Đã giải cứu bảo toàn OTD</span>
                    </span>
                  ) : isAtRisk ? (
                    <button 
                      onClick={() => handleRescueOrder(to.id)}
                      className="w-full md:w-auto px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs shadow-md shadow-cyan-500/20 transition active:scale-95"
                    >
                      ⚡ Kích hoạt giải cứu OTD
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-500">Đang lưu thông bình thường</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
