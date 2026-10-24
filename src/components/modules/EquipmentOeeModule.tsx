import React, { useState } from 'react';
import { Wrench, Gauge, AlertTriangle, CheckCircle2, RefreshCw, Zap } from 'lucide-react';
import { MACHINE_TELEMETRY } from '../../data/initialData';
import { soundManager } from '../../utils/audio';

interface EquipmentOeeModuleProps {
  onRepairSpindle: () => void;
}

export const EquipmentOeeModule: React.FC<EquipmentOeeModuleProps> = ({
  onRepairSpindle
}) => {
  const [repaired, setRepaired] = useState(false);

  const machines = MACHINE_TELEMETRY.map(m => {
    if (m.code === 'CNC-SPINDLE-04' && repaired) {
      return {
        ...m,
        vibrationG: 1.15,
        temperatureC: 44.5,
        toolWearPct: 8,
        oee: 88.5,
        status: 'running' as const
      };
    }
    return m;
  });

  const handleRepair = () => {
    soundManager.playSuccess();
    setRepaired(true);
    onRepairSpindle();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center bg-[#0d1321] p-4 rounded-2xl border border-slate-800 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <Wrench className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">07. THIẾT BỊ TRỌNG YẾU &amp; OEE (TOTAL PRODUCTIVE MAINTENANCE)</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Độ trễ cảm biến rung &amp; nhiệt: &lt; 12ms • Cảnh báo độ rung trục Spindle 04 tại KTECH (&gt; 3.5G)
          </p>
        </div>

        <button
          onClick={handleRepair}
          disabled={repaired}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition ${
            repaired
              ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
              : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20 active:scale-95'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>{repaired ? '✓ Đã thay dao phay TiAlN Spindle 04' : 'Thay dao hợp kim & Cân bằng Spindle 04'}</span>
        </button>
      </div>

      {/* Equipment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {machines.map((m) => {
          const isWarning = m.status === 'warning';
          const isStopped = m.status === 'stopped';

          return (
            <div
              key={m.id}
              className={`p-4 rounded-2xl border bg-[#0d1321] space-y-3 ${
                isWarning ? 'border-amber-500/80 shadow-md shadow-amber-500/10' :
                isStopped ? 'border-red-500/80' : 'border-slate-800'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-mono text-xs font-bold text-cyan-400">{m.code}</span>
                  <h3 className="text-sm font-bold text-white mt-0.5">{m.name}</h3>
                  <div className="text-[11px] text-slate-400">
                    Nhà máy: <strong className="text-slate-200">{m.plant}</strong> • {m.type}
                  </div>
                </div>

                <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                  m.status === 'running' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  m.status === 'warning' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse' :
                  'bg-red-500/25 text-red-300 border border-red-500/40'
                }`}>
                  {m.status.toUpperCase()}
                </span>
              </div>

              {/* Sensor Metrics */}
              <div className="grid grid-cols-3 gap-2 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 text-center font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block">Độ rung:</span>
                  <span className={`text-sm font-bold ${m.vibrationG > 3.5 ? 'text-red-400' : 'text-slate-200'}`}>
                    {m.vibrationG}G
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Nhiệt độ:</span>
                  <span className="text-sm font-bold text-slate-200">{m.temperatureC}°C</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Mòn dao:</span>
                  <span className={`text-sm font-bold ${m.toolWearPct > 80 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {m.toolWearPct}%
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs pt-1">
                <span className="text-slate-400">Hiệu suất OEE trạm:</span>
                <span className={`font-mono font-bold text-sm ${m.oee < 70 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {m.oee}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
