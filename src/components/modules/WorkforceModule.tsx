import React, { useState } from 'react';
import { Users, UserPlus, Award, AlertTriangle, CheckCircle2, Zap } from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface WorkforceModuleProps {
  onAugmentWorkforce: () => void;
}

export const WorkforceModule: React.FC<WorkforceModuleProps> = ({
  onAugmentWorkforce
}) => {
  const [augmented, setAugmented] = useState(false);

  const workersSummary = [
    { plant: 'KHV', specialty: 'SMT Siêu cao tốc', total: 142, present: 140, skillLevel: 'Bậc 4-5', status: 'optimal' },
    { plant: 'DREAM TECH', specialty: 'Khuôn ép chính xác', total: 98, present: 96, skillLevel: 'Bậc 3-4', status: 'optimal' },
    { plant: 'HSTEC', specialty: 'SMT Nhiều lớp', total: 98, present: 86, skillLevel: 'Thiếu 12 thợ SMT ca 1', status: 'warning', deficit: 12 },
    { plant: 'KTECH', specialty: 'Phay trục CNC 5 trục', total: 110, present: 108, skillLevel: 'Bậc 4-5', status: 'optimal' },
    { plant: 'HOJEONGB', specialty: 'Module điện tử & RF', total: 74, present: 74, skillLevel: 'Bậc 4', status: 'optimal' },
    { plant: 'HOJEONG VINA', specialty: 'Hàn laser micro', total: 92, present: 89, skillLevel: 'Bậc 3-4', status: 'stable' },
    { plant: 'DAAL', specialty: 'Đúc phôi nhôm', total: 130, present: 128, skillLevel: 'Bậc 3', status: 'stable' },
  ];

  const handleAugment = () => {
    soundManager.playSuccess();
    setAugmented(true);
    onAugmentWorkforce();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center bg-[#0d1321] p-4 rounded-2xl border border-slate-800 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">06. QUẢN TRỊ NHÂN LỰC &amp; TAY NGHỀ CHUYỀN SẢN XUẤT (HRM)</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tổng quân số ca 1: 721 / 750 công nhân (96.1%) • Điểm nghẽn nhân lực tại HSTEC xưởng 2
          </p>
        </div>

        <button
          onClick={handleAugment}
          disabled={augmented}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition ${
            augmented
              ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40'
              : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20 active:scale-95'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>{augmented ? '✓ Đã điều chuyển 12 thợ SMT sang HSTEC' : 'Điều động tăng viện 12 thợ SMT cho HSTEC'}</span>
        </button>
      </div>

      {/* Workforce Table */}
      <div className="bg-[#0d1321] rounded-2xl border border-slate-800 p-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 text-[11px] font-mono border-b border-slate-800 uppercase">
              <tr>
                <th className="py-2.5 px-3">Nhà máy</th>
                <th className="py-2.5 px-3">Chuyên môn thao tác</th>
                <th className="py-2.5 px-3 text-right">Biên chế</th>
                <th className="py-2.5 px-3 text-right">Hiện diện</th>
                <th className="py-2.5 px-3 text-center">Tỷ lệ đủ quân</th>
                <th className="py-2.5 px-3">Trình độ tay nghề</th>
                <th className="py-2.5 px-3 text-center">Tình trạng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {workersSummary.map((w, idx) => {
                const isHstec = w.plant === 'HSTEC';
                const presentCount = isHstec && augmented ? 98 : w.present;
                const fillRate = ((presentCount / w.total) * 100).toFixed(1);

                return (
                  <tr key={idx} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 font-bold text-white">{w.plant}</td>
                    <td className="py-3 px-3 text-slate-300">{w.specialty}</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-400">{w.total} NV</td>
                    <td className="py-3 px-3 text-right font-mono text-cyan-300 font-bold">{presentCount} NV</td>
                    <td className="py-3 px-3 text-center font-mono">
                      <span className={Number(fillRate) < 90 ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                        {fillRate}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {isHstec && augmented ? 'Đã bù đủ 12 thợ bậc 4' : w.skillLevel}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        isHstec && !augmented ? 'bg-red-500/25 text-red-300 border border-red-500/40 animate-pulse' :
                        'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {isHstec && !augmented ? 'Thiếu 12 NV' : 'Đạt chuẩn'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
