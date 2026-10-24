import React, { useState } from 'react';
import { Database, AlertTriangle, Truck, ArrowRight, CheckCircle2, Zap } from 'lucide-react';
import { MATERIAL_INVENTORIES } from '../../data/initialData';
import { soundManager } from '../../utils/audio';

interface MaterialWarehouseModuleProps {
  onDispatchMaterial: () => void;
}

export const MaterialWarehouseModule: React.FC<MaterialWarehouseModuleProps> = ({
  onDispatchMaterial
}) => {
  const [dispatched, setDispatched] = useState(false);

  const materials = MATERIAL_INVENTORIES.map(m => {
    if (m.code === 'ALUMINUM_A980' && dispatched) {
      return {
        ...m,
        stockKg: 3520,
        status: 'healthy' as const
      };
    }
    return m;
  });

  const handleDispatch = () => {
    soundManager.playSuccess();
    setDispatched(true);
    onDispatchMaterial();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center bg-[#0d1321] p-4 rounded-2xl border border-slate-800 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">08. KHO VẬT LIỆU PHÔI &amp; NGUYÊN SINH (CENTRAL HUB A01)</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Trung tâm dự trữ Hải Phòng - Hải Dương • ĐIỂM NGHẼN P1: Đứt phôi nhôm A980 cấp cho DAAL
          </p>
        </div>

        <button
          onClick={handleDispatch}
          disabled={dispatched}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition ${
            dispatched
              ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
              : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20 active:scale-95'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>{dispatched ? '✓ Đã gửi xe 3,200 kg phôi nhôm sang DAAL' : 'Lệnh điều động 3,200 kg phôi A980 sang DAAL'}</span>
        </button>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {materials.map((mat) => {
          const isCritical = mat.status === 'critical_shortage';
          const fillPct = Math.min(100, ((mat.stockKg / mat.safetyStockKg) * 100)).toFixed(0);

          return (
            <div
              key={mat.id}
              className={`p-4 rounded-2xl border bg-[#0d1321] space-y-3 ${
                isCritical ? 'border-red-500/80 shadow-lg shadow-red-500/15' : 'border-slate-800'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-cyan-400">{mat.code}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                      isCritical ? 'bg-red-500 text-white animate-pulse' : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {isCritical ? 'ĐỨT PHÔI P1 CRITICAL' : 'AN TOÀN'}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1">{mat.name}</h3>
                  <div className="text-xs text-slate-400 mt-0.5">{mat.hub}</div>
                </div>

                <div className="text-right font-mono">
                  <span className={`text-xl font-bold block ${isCritical ? 'text-red-400' : 'text-cyan-300'}`}>
                    {mat.stockKg.toLocaleString()} kg
                  </span>
                  <span className="text-[10px] text-slate-500">Đệm chuẩn: {mat.safetyStockKg.toLocaleString()} kg</span>
                </div>
              </div>

              {/* Stock Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Tồn đệm an toàn:</span>
                  <span className="font-mono font-bold">{fillPct}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isCritical ? 'bg-red-500' : 'bg-emerald-400'
                    }`}
                    style={{ width: `${fillPct}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center text-xs text-slate-400 pt-1 border-t border-slate-800">
                <span>Cung ứng cho: <strong className="text-slate-200">{mat.allocatedPlants.join(', ')}</strong></span>
                <span className="font-mono">Tiêu thụ: {mat.dailyConsumptionKg.toLocaleString()} kg/ca</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
