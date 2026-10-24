import React from 'react';
import { Activity, PieChart } from 'lucide-react';

interface DriverAnalysisCardProps {
  totalDeficit: number;
}

export const DriverAnalysisCard: React.FC<DriverAnalysisCardProps> = ({ totalDeficit }) => {
  const drivers = [
    { title: '01. Kế hoạch (Lệnh gá đột xuất KTECH/DAAL)', pct: 28, color: 'bg-cyan-400', valText: '-8,230 pcs' },
    { title: '02. Kho vật liệu (Đứt phôi nhôm A980 Hub A01)', pct: 18, color: 'bg-red-500', valText: '-5,290 pcs' },
    { title: '03. Nhân lực (Thiếu 12 thợ SMT tại HSTEC)', pct: 15, color: 'bg-purple-400', valText: '-4,410 pcs' },
    { title: '04. Thiết bị (Mòn dao CNC KTECH Spindle 04)', pct: 13, color: 'bg-amber-400', valText: '-3,820 pcs' },
    { title: '05. Prebuild (Hụt đệm an toàn xưởng hoàn thiện)', pct: 12, color: 'bg-emerald-400', valText: '-3,530 pcs' },
    { title: '06. Chất lượng & Sai số quang học hàn laser', pct: 14, color: 'bg-blue-400', valText: '-4,120 pcs' },
  ];

  return (
    <div className="bg-[#0d1321] rounded-2xl border border-slate-800 p-4 flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-center mb-2.5 pb-2 border-b border-slate-800/80">
          <h3 className="text-xs font-bold text-white flex items-center space-x-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>PHÂN TÍCH ĐÓNG GÓP (DRIVER ANALYSIS)</span>
          </h3>
          <span className="text-[10px] text-cyan-400 font-mono font-bold bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-800/50">
            SHAPLEY 100%
          </span>
        </div>

        <p className="text-[10px] text-slate-400 mb-3">
          Phân rã phương sai thâm hụt sản lượng theo mô hình lý thuyết trò chơi hợp tác Shapley Value
        </p>

        <div className="space-y-2.5 text-xs">
          {drivers.map((d, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between items-center text-[11px] text-slate-300">
                <span className="truncate pr-2">{d.title}</span>
                <div className="flex items-center space-x-1.5 shrink-0">
                  <span className="font-mono text-slate-400 text-[10px]">{d.valText}</span>
                  <span className="font-bold font-mono text-white text-[11px] w-8 text-right">{d.pct}%</span>
                </div>
              </div>
              <div className="w-full h-1.5 bg-slate-800/80 rounded-full overflow-hidden">
                <div
                  className={`h-full ${d.color} rounded-full transition-all duration-700`}
                  style={{ width: `${d.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-800 flex justify-between items-center text-xs">
        <span className="text-slate-400">Tổng thâm hụt phương sai ca:</span>
        <span className="font-bold text-red-400 font-mono text-sm">
          -{totalDeficit.toLocaleString()} pcs
        </span>
      </div>
    </div>
  );
};
