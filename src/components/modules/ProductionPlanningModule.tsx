import React, { useState } from 'react';
import { Layers, Calendar, Clock, CheckCircle2, AlertCircle, RefreshCw, Zap } from 'lucide-react';
import { PlantMetric } from '../../types';
import { soundManager } from '../../utils/audio';

interface ProductionPlanningModuleProps {
  plants: PlantMetric[];
  onLockFixture: () => void;
}

export const ProductionPlanningModule: React.FC<ProductionPlanningModuleProps> = ({
  plants,
  onLockFixture
}) => {
  const [locked, setLocked] = useState(false);

  const plans = plants.map((p, idx) => ({
    id: `WO-2025-${idx + 101}`,
    plantId: p.id,
    plantName: p.name,
    productCode: `NP-M01-${p.id}`,
    plannedQty: p.target,
    actualQty: p.actual,
    fixtureStatus: p.id === 'KTECH' || p.id === 'DAAL' ? (locked ? 'Cố định (Locked)' : 'Cần đổi gá') : 'Chuẩn',
    cycleTimeSec: p.id === 'HSTEC' ? 6.4 : 3.8,
    priority: p.id === 'DAAL' ? 'P1 Emergency' : p.id === 'KTECH' ? 'P1 Maintenance' : 'P2 Standard'
  }));

  const handleLock = () => {
    soundManager.playSuccess();
    setLocked(true);
    onLockFixture();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center bg-[#0d1321] p-4 rounded-2xl border border-slate-800 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">02. KẾ HOẠCH SẢN XUẤT &amp; ĐIỀU PHỐI LỆNH GÁ (VOMS)</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Định mức tổng ca: 105,000 pcs • Tiêu chuẩn IATF 16949 • Tự động cân bằng tải chuyền (Line Balancing)
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleLock}
            disabled={locked}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition ${
              locked 
                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40' 
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20 active:scale-95'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>{locked ? '✓ Đã khóa lệnh gá khuôn' : 'Khóa lệnh gá khuôn cố định'}</span>
          </button>
        </div>
      </div>

      {/* Plan Table */}
      <div className="bg-[#0d1321] rounded-2xl border border-slate-800 p-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 text-[11px] font-mono border-b border-slate-800 uppercase">
              <tr>
                <th className="py-2.5 px-3">Mã Lệnh (WO)</th>
                <th className="py-2.5 px-3">Nhà máy vệ tinh</th>
                <th className="py-2.5 px-3">Mã sản phẩm</th>
                <th className="py-2.5 px-3 text-right">Kế hoạch</th>
                <th className="py-2.5 px-3 text-right">Thực tế</th>
                <th className="py-2.5 px-3 text-center">Takt-Time</th>
                <th className="py-2.5 px-3">Tình trạng gá khuôn</th>
                <th className="py-2.5 px-3 text-center">Ưu tiên</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {plans.map((pl) => (
                <tr key={pl.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3 font-mono text-cyan-400 font-bold">{pl.id}</td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-white">{pl.plantId}</span>
                    <span className="block text-[10px] text-slate-400">{pl.plantName}</span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-300">{pl.productCode}</td>
                  <td className="py-3 px-3 text-right font-mono text-white font-bold">
                    {pl.plannedQty.toLocaleString()} pcs
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-cyan-300 font-bold">
                    {pl.actualQty.toLocaleString()} pcs
                  </td>
                  <td className="py-3 px-3 text-center font-mono">
                    <span className={pl.cycleTimeSec > 4 ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                      {pl.cycleTimeSec}s
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      pl.fixtureStatus.includes('Locked') ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      pl.fixtureStatus.includes('Cần') ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {pl.fixtureStatus}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                      pl.priority.includes('Emergency') ? 'bg-red-500/25 text-red-300 border border-red-500/40' :
                      pl.priority.includes('Maintenance') ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {pl.priority}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
