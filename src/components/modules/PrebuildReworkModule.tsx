import React, { useState } from 'react';
import { RefreshCw, Layers, Wrench, ShieldCheck, Zap, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { soundManager } from '../../utils/audio';

export const PrebuildReworkModule: React.FC = () => {
  const [bufferQty, setBufferQty] = useState(4200);
  const [reworkQueue, setReworkQueue] = useState(210);
  const [bufferReleased, setBufferReleased] = useState(false);

  const handleReleaseBuffer = () => {
    soundManager.playSuccess();
    setBufferReleased(true);
    setBufferQty(prev => prev + 4500);
  };

  const handleAccelerateRework = () => {
    soundManager.playSuccess();
    setReworkQueue(prev => Math.max(25, prev - 150));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center bg-[#0d1321] p-4 rounded-2xl border border-slate-800 gap-3">
        <div className="flex items-center space-x-3 text-xs">
          <RefreshCw className="w-5 h-5 text-cyan-400" />
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">OPERATIONS /</span>
              <h2 className="text-sm font-bold text-white">09. QUẢN TRỊ PREBUILD &amp; REWORK BUFFER (M09 / N07)</h2>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Bộ đệm bán thành phẩm đón đầu (WIP Buffer) và khâu tái gia công mạch in BGA
            </p>
          </div>
        </div>

        <button
          onClick={handleReleaseBuffer}
          disabled={bufferReleased}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition ${
            bufferReleased 
              ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40' 
              : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20 active:scale-95'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>{bufferReleased ? '✓ Đã xả 4,500 pcs đệm an toàn' : 'Xả 4,500 pcs đệm an toàn M09 cấp cứu'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Prebuild Buffer Card */}
        <div className="bg-[#0b101d] rounded-2xl border border-slate-800 p-4 space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold text-white flex items-center space-x-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>PREBUILD BUFFER M09 (TỒN ĐỆM AN TOÀN)</span>
            </h3>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">CHUẨN IATF 16949</span>
          </div>

          <div className="flex justify-between items-baseline font-mono">
            <span className="text-3xl font-black text-white">{bufferQty.toLocaleString()}</span>
            <span className="text-xs text-slate-400">/ 8,400 pcs (Định mức an toàn)</span>
          </div>

          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-700 ${
                bufferQty < 5000 ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
              style={{ width: `${Math.min(100, (bufferQty / 8400) * 100)}%` }}
            />
          </div>

          <div className="text-xs text-slate-300 space-y-1 pt-1">
            <div className="flex justify-between text-slate-400 text-[11px]">
              <span>Khả năng cầm cự dây chuyền:</span>
              <span className="text-cyan-400 font-bold font-mono">~ 1h 45m</span>
            </div>
            <div className="flex justify-between text-slate-400 text-[11px]">
              <span>Tỷ lệ lấp đầy đệm:</span>
              <span className="text-white font-mono">{((bufferQty / 8400) * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Rework Station N07 Card */}
        <div className="bg-[#0b101d] rounded-2xl border border-slate-800 p-4 space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold text-white flex items-center space-x-2">
              <Wrench className="w-4 h-4 text-purple-400" />
              <span>TRẠM SỬA CHỮA REWORK N07 (BGA REWORK)</span>
            </h3>
            <span className="text-[10px] text-purple-300 font-mono font-bold">OFFLINE RECTIFICATION</span>
          </div>

          <div className="flex justify-between items-baseline font-mono">
            <span className="text-3xl font-black text-purple-300">{reworkQueue}</span>
            <span className="text-xs text-slate-400">Bảng mạch chờ xử lý (Target &lt; 50)</span>
          </div>

          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-700 ${
                reworkQueue > 100 ? 'bg-purple-500' : 'bg-emerald-400'
              }`}
              style={{ width: `${Math.min(100, (reworkQueue / 300) * 100)}%` }}
            />
          </div>

          <div className="pt-2 flex justify-between items-center text-xs">
            <span className="text-slate-400 text-[11px]">Tốc độ xử lý: 35 pcs/h</span>
            <button
              onClick={handleAccelerateRework}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition active:scale-95"
            >
              Tăng tốc sửa chữa Rework
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
