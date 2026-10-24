import React from 'react';
import { Zap, AlertTriangle, Cpu, CheckCircle2, ChevronRight, Activity } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface AiInsightPanelProps {
  onTriggerAllInterventions: () => void;
  isAiIntervened: boolean;
  onSelectBottleneck: (nodeId: string) => void;
}

export const AiInsightPanel: React.FC<AiInsightPanelProps> = ({
  onTriggerAllInterventions,
  isAiIntervened,
  onSelectBottleneck
}) => {
  const insights = [
    {
      id: 'DAAL',
      nodeId: 'N03',
      rank: '01',
      title: 'Thiếu vật liệu tại DAAL',
      weight: 'w = 0.82',
      color: 'red',
      desc: 'Lỗ hổng phôi nhôm A980 giảm 52% sản lượng trạm dập, đe dọa trực tiếp chuyến xe xuất cảng TO-3011.',
      remedy: 'Điều chuyển 3.2 tấn phôi từ Hub A01'
    },
    {
      id: 'KTECH',
      nodeId: 'N05',
      rank: '02',
      title: 'Dừng máy CNC tại KTECH',
      weight: 'w = 0.67',
      color: 'amber',
      desc: 'Mòn dao phay CNC trục Spindle 04 chưa thay kịp, dừng 45 phút ca sáng làm nghẽn tiến độ cơ khí.',
      remedy: 'Thay dao TiAlN & cân bằng trục'
    },
    {
      id: 'HOJEONG_VINA',
      nodeId: 'N06',
      rank: '03',
      title: 'Tỷ lệ rework HOJEONG VINA',
      weight: 'w = 0.59',
      color: 'purple',
      desc: 'Lệch tọa độ hàn laser mạch dẫn DEF-01, 140 linh kiện cần tái gia công thủ công trạm N07.',
      remedy: 'Hiệu chuẩn quang học đầu laser Trumpf'
    },
    {
      id: 'HSTEC',
      nodeId: 'N04',
      rank: '04',
      title: 'Thiếu nhân lực tại HSTEC',
      weight: 'w = 0.48',
      color: 'slate',
      desc: 'Vắng 12 thợ SMT ca 1 tại xưởng 2 khiến takt-time trượt từ 3.8s lên 6.4s.',
      remedy: 'Tăng viện 12 thợ bậc cao chuyền phụ'
    }
  ];

  return (
    <div className="bg-[#0d1321] rounded-2xl border border-slate-800 p-4 flex flex-col justify-between h-full">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex justify-between items-center pb-2.5 border-b border-slate-800">
          <h3 className="text-xs font-bold text-white flex items-center space-x-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>AI INSIGHT — NGUYÊN NHÂN GỐC</span>
          </h3>
          <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-1.5 py-0.5 rounded font-mono font-bold">
            LIVE ML
          </span>
        </div>

        {/* List of Insights */}
        <div className="space-y-2 overflow-y-auto max-h-[310px] pr-1">
          {insights.map((item) => {
            const isRed = item.color === 'red';
            const isAmber = item.color === 'amber';
            const isPurple = item.color === 'purple';

            return (
              <div
                key={item.id}
                onClick={() => {
                  soundManager.playClick();
                  onSelectBottleneck(item.nodeId);
                }}
                className={`p-2.5 rounded-xl border transition cursor-pointer hover:scale-[1.02] ${
                  isRed
                    ? 'bg-red-950/25 border-red-500/40 hover:border-red-400'
                    : isAmber
                    ? 'bg-amber-950/20 border-amber-500/40 hover:border-amber-400'
                    : isPurple
                    ? 'bg-purple-950/20 border-purple-500/40 hover:border-purple-400'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-xs font-bold ${
                    isRed ? 'text-red-300' : isAmber ? 'text-amber-300' : isPurple ? 'text-purple-300' : 'text-slate-300'
                  }`}>
                    {item.rank}. {item.title}
                  </span>
                  <span className={`text-[10px] font-mono font-black px-1.5 py-0.2 rounded ${
                    isRed ? 'bg-red-500/25 text-red-300' : isAmber ? 'bg-amber-500/25 text-amber-300' : isPurple ? 'bg-purple-500/25 text-purple-300' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.weight}
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 leading-snug">
                  {item.desc}
                </p>

                <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
                  <span className="text-cyan-400 font-medium">↳ {item.remedy}</span>
                  <ChevronRight className="w-3 h-3 text-slate-500" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-2">
        <button
          onClick={() => {
            soundManager.playSuccess();
            onTriggerAllInterventions();
          }}
          disabled={isAiIntervened}
          className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-lg transition active:scale-95 ${
            isAiIntervened
              ? 'bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 cursor-default'
              : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-cyan-500/20'
          }`}
        >
          {isAiIntervened ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Hệ thống đang phục hồi toàn chuỗi (+17,600 pcs)</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              <span>Can thiệp tự động toàn chuỗi (6 Điểm nghẽn)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
