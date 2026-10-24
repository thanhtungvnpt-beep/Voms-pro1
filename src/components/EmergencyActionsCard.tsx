import React from 'react';
import { CheckCircle2, Check, Zap, AlertCircle } from 'lucide-react';
import { EmergencyAction } from '../types';
import { soundManager } from '../utils/audio';

interface EmergencyActionsCardProps {
  actions: EmergencyAction[];
  onExecuteAction: (actionId: number) => void;
  onExecuteAll: () => void;
}

export const EmergencyActionsCard: React.FC<EmergencyActionsCardProps> = ({
  actions,
  onExecuteAction,
  onExecuteAll
}) => {
  const pendingCount = actions.filter(a => !a.executed).length;

  return (
    <div className="bg-[#0d1321] rounded-2xl border border-slate-800 p-4 flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex justify-between items-center mb-1.5 pb-2 border-b border-slate-800/80">
          <h3 className="text-xs font-bold text-white flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>ĐỀ XUẤT HÀNH ĐỘNG KHẨN CẤP</span>
          </h3>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
            pendingCount > 0 ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-300'
          }`}>
            {pendingCount > 0 ? `P1 CRITICAL (${pendingCount})` : 'HOÀN TẤT'}
          </span>
        </div>

        <p className="text-[10px] text-slate-400 mb-2">
          Gói can thiệp đối chứng (Do-Calculus Intervention) phân bổ theo mức ưu tiên
        </p>

        {/* Action List */}
        <div className="space-y-1.5 overflow-y-auto max-h-[195px] pr-1">
          {actions.map((act) => {
            const isHigh = act.priority === 'Cao';
            const isMedium = act.priority === 'Trung bình';

            return (
              <div
                key={act.id}
                className={`p-2 rounded-xl border flex items-center justify-between text-xs transition ${
                  act.executed
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-400'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-2 overflow-hidden pr-2">
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 font-mono ${
                      act.executed
                        ? 'bg-slate-800 text-slate-500'
                        : isHigh
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : isMedium
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {act.priority}
                  </span>
                  <div className="overflow-hidden">
                    <span className="text-[11px] truncate block text-slate-200 font-medium" title={act.title}>
                      {act.title}
                    </span>
                    <span className="text-[9px] text-slate-400 truncate block">
                      ↳ {act.targetMetricRecovery}
                    </span>
                  </div>
                </div>

                {act.executed ? (
                  <span className="text-[10px] text-emerald-400 flex items-center space-x-0.5 shrink-0 font-bold bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/40">
                    <Check className="w-3 h-3" />
                    <span>Đã gửi</span>
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      soundManager.playSuccess();
                      onExecuteAction(act.id);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shrink-0 transition active:scale-95 shadow-sm ${
                      isHigh
                        ? 'bg-red-500 hover:bg-red-400 text-white shadow-red-500/20'
                        : isMedium
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                        : 'bg-cyan-600 hover:bg-cyan-500 text-slate-950'
                    }`}
                  >
                    {act.actionBtn}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Subfooter */}
      <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-400">
        <span>Tự động hóa: {actions.filter(a => a.executed).length}/{actions.length} đã kích hoạt</span>
        {pendingCount > 0 && (
          <button
            onClick={() => {
              soundManager.playSuccess();
              onExecuteAll();
            }}
            className="text-cyan-400 hover:text-cyan-300 font-bold hover:underline flex items-center space-x-1"
          >
            <Zap className="w-3 h-3" />
            <span>Thực thi tất cả</span>
          </button>
        )}
      </div>
    </div>
  );
};
