import React from 'react';
import { ShieldCheck, AlertTriangle, Crosshair, Wrench, RefreshCw, CheckCircle2 } from 'lucide-react';
import { QUALITY_DEFECTS } from '../../data/initialData';
import { soundManager } from '../../utils/audio';

interface QualityOqcModuleProps {
  onCalibrateLaser: () => void;
}

export const QualityOqcModule: React.FC<QualityOqcModuleProps> = ({
  onCalibrateLaser
}) => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center bg-[#0d1321] p-4 rounded-2xl border border-slate-800 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">05. QUẢN LÝ CHẤT LƯỢNG THÀNH PHẨM (OQC &amp; TRẠM REWORK N07)</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Chỉ số DPMO toàn chuỗi: 214 • First Pass Yield (FPY): 96.2% • Giám sát sai số vi mô laser Trumpf
          </p>
        </div>

        <button
          onClick={() => {
            soundManager.playSuccess();
            onCalibrateLaser();
          }}
          className="px-3.5 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center space-x-2 shadow-lg shadow-cyan-500/20 transition active:scale-95"
        >
          <Crosshair className="w-4 h-4" />
          <span>Hiệu chuẩn quang học Laser DEF-01</span>
        </button>
      </div>

      {/* Defect Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {QUALITY_DEFECTS.map((def) => {
          const isCritical = def.severity === 'Critical';
          const isMajor = def.severity === 'Major';

          return (
            <div
              key={def.id}
              className={`p-4 rounded-2xl border bg-[#0d1321] space-y-3 ${
                isCritical ? 'border-red-500/80 shadow-md shadow-red-500/10' :
                isMajor ? 'border-amber-500/60' : 'border-slate-800'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-cyan-400">{def.code}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                      isCritical ? 'bg-red-500/25 text-red-300' :
                      isMajor ? 'bg-amber-500/25 text-amber-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {def.severity}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1">{def.name}</h3>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Nhà máy: <strong className="text-slate-200">{def.plant}</strong> • Trạm: {def.station}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-lg font-black font-mono text-red-400 block">{def.defectCount} pcs</span>
                  <span className="text-[10px] font-mono text-slate-500">DPMO: {def.dpmo}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Nguyên nhân gốc (Root Cause):</span>
                <span className="text-slate-200 mt-0.5 block leading-relaxed">{def.rootCause}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
