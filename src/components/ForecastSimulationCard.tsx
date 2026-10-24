import React, { useState } from 'react';
import { TrendingUp, Sliders, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface ForecastSimulationCardProps {
  isAiIntervened: boolean;
  onRunScenario: (scenario: 'baseline' | 'partial' | 'optimal') => void;
}

export const ForecastSimulationCard: React.FC<ForecastSimulationCardProps> = ({
  isAiIntervened,
  onRunScenario
}) => {
  const [activeScenario, setActiveScenario] = useState<'baseline' | 'partial' | 'optimal'>(
    isAiIntervened ? 'optimal' : 'baseline'
  );

  const handleSelectScenario = (sc: 'baseline' | 'partial' | 'optimal') => {
    soundManager.playClick();
    setActiveScenario(sc);
    onRunScenario(sc);
  };

  const getStats = () => {
    if (activeScenario === 'baseline') {
      return { output: '84,200 pcs', rate: '80.2%', deficit: '-20,800 pcs', otd: '68.0%', statusColor: 'text-red-400' };
    } else if (activeScenario === 'partial') {
      return { output: '93,600 pcs', rate: '89.1%', deficit: '-11,400 pcs', otd: '84.5%', statusColor: 'text-amber-400' };
    } else {
      return { output: '101,800 pcs', rate: '97.0%', deficit: '-3,200 pcs', otd: '98.5%', statusColor: 'text-emerald-400' };
    }
  };

  const stats = getStats();

  return (
    <div className="bg-[#0d1321] rounded-2xl border border-slate-800 p-4 flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex justify-between items-center mb-1.5 pb-2 border-b border-slate-800/80">
          <h3 className="text-xs font-bold text-white flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>DỰ BÁO SẢN LƯỢNG CUỐI CA (MÔ PHỎNG)</span>
          </h3>
          <span className="text-[10px] bg-slate-900 text-slate-300 border border-slate-700 px-1.5 py-0.5 rounded font-mono">
            WHAT-IF ENGINE
          </span>
        </div>

        <p className="text-[10px] text-slate-400 mb-2">
          Target chuỗi: 105,000 pcs • Thuật toán: Pearl Do-Calculus Counterfactual
        </p>

        {/* Scenario Switcher Tabs */}
        <div className="flex rounded-lg bg-slate-900/90 border border-slate-800 p-0.5 text-[11px] mb-2.5">
          <button
            onClick={() => handleSelectScenario('baseline')}
            className={`flex-1 py-1 rounded text-center transition font-medium ${
              activeScenario === 'baseline'
                ? 'bg-red-500/20 text-red-300 font-bold border border-red-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Không can thiệp
          </button>
          <button
            onClick={() => handleSelectScenario('partial')}
            className={`flex-1 py-1 rounded text-center transition font-medium ${
              activeScenario === 'partial'
                ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Cứu DAAL
          </button>
          <button
            onClick={() => handleSelectScenario('optimal')}
            className={`flex-1 py-1 rounded text-center transition font-medium ${
              activeScenario === 'optimal'
                ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Full AI (Optimal)
          </button>
        </div>

        {/* SVG Prediction Curve */}
        <div className="h-24 w-full bg-slate-900/90 rounded-xl border border-slate-800/80 p-2 relative overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 280 80">
            {/* Grid guides */}
            <line x1="10" y1="20" x2="270" y2="20" stroke="#1e293b" strokeDasharray="2,2" />
            <line x1="10" y1="50" x2="270" y2="50" stroke="#1e293b" strokeDasharray="2,2" />

            {/* Target line */}
            <line x1="10" y1="12" x2="270" y2="12" stroke="#06b6d4" strokeWidth="1" strokeDasharray="4,3" strokeOpacity="0.5" />

            {/* Baseline trajectory (Red) */}
            <path
              d="M 15 65 Q 120 58, 265 48"
              fill="none"
              stroke="#ef4444"
              strokeWidth="2"
              strokeDasharray={activeScenario === 'baseline' ? undefined : '3,3'}
              opacity={activeScenario === 'baseline' ? 1 : 0.4}
            />

            {/* Partial Trajectory (Amber) */}
            {(activeScenario === 'partial' || activeScenario === 'optimal') && (
              <path
                d="M 15 65 Q 120 48, 265 30"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2"
                strokeDasharray={activeScenario === 'partial' ? undefined : '3,3'}
                opacity={activeScenario === 'partial' ? 1 : 0.3}
              />
            )}

            {/* Optimal Trajectory (Emerald) */}
            {activeScenario === 'optimal' && (
              <path
                d="M 15 65 Q 120 38, 265 14"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                filter="drop-shadow(0 0 4px rgba(16, 185, 129, 0.4))"
              />
            )}

            {/* Marker Points */}
            <circle cx="15" cy="65" r="3.5" fill="#38bdf8" />
            <circle cx="120" cy="52" r="3.5" fill="#38bdf8" />
            <circle
              cx="265"
              cy={activeScenario === 'baseline' ? 48 : activeScenario === 'partial' ? 30 : 14}
              r="4.5"
              fill={activeScenario === 'baseline' ? '#ef4444' : activeScenario === 'partial' ? '#f59e0b' : '#10b981'}
            />
          </svg>

          <span className="absolute left-3 bottom-1 text-[9px] text-slate-500 font-mono">08:00 Bắt đầu</span>
          <span className="absolute left-1/2 -translate-x-1/2 bottom-1 text-[9px] text-cyan-400 font-mono">12:00 Hiện tại</span>
          <span className="absolute right-3 bottom-1 text-[9px] text-emerald-400 font-bold font-mono">16:00 Kết ca</span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400">Dự kiến kết ca:</div>
            <div className={`text-base font-bold font-mono ${stats.statusColor}`}>
              {stats.output}
            </div>
            <div className="text-[10px] text-slate-400">{stats.rate} định mức</div>
          </div>

          <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400">Tỷ lệ OTD Cảng:</div>
            <div className="text-base font-bold font-mono text-cyan-300">
              {stats.otd}
            </div>
            <div className="text-[10px] text-slate-400">Chuyến TO-3011</div>
          </div>
        </div>
      </div>

      <div className="text-[10px] text-emerald-400 flex items-center justify-between pt-2 border-t border-slate-800 font-medium">
        <span>✓ Bảo toàn container Cảng Tân Vũ</span>
        <span className="font-bold font-mono text-xs text-emerald-300">
          {activeScenario === 'optimal' ? '+17,600 pcs' : activeScenario === 'partial' ? '+9,400 pcs' : '0 pcs'}
        </span>
      </div>
    </div>
  );
};
