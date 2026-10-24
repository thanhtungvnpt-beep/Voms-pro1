import React from 'react';
import { TrendingUp, X, AlertTriangle, ArrowRight, CheckCircle2, Zap } from 'lucide-react';
import { HourlyDataPoint } from '../types';
import { soundManager } from '../utils/audio';

interface HourlyTrendModalProps {
  isOpen: boolean;
  onClose: () => void;
  hourlyData: HourlyDataPoint[];
  totalActual: number;
  totalTarget: number;
  onDispatchRemedy: () => void;
}

export const HourlyTrendModal: React.FC<HourlyTrendModalProps> = ({
  isOpen,
  onClose,
  hourlyData,
  totalActual,
  totalTarget,
  onDispatchRemedy
}) => {
  if (!isOpen) return null;

  const currentRatePcsPerHour = 9450;
  const standardRatePcsPerHour = 13125;
  const deficit = totalTarget - totalActual;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-[#0d1321] border-2 border-cyan-500/80 rounded-2xl p-6 shadow-2xl relative text-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white tracking-wide">
                PHÂN TÍCH CHUYÊN SÂU SẢN LƯỢNG THEO GIỜ (HOURLY TREND DRILL-DOWN)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Mã nút: N08_ACTUAL_OUTPUT • Đối chiếu 7 Nhà máy vệ tinh • Takt-Time Chuẩn 3.8s
            </p>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <div className="text-xs text-slate-400">Sản lượng lũy kế:</div>
            <div className="text-xl font-bold font-mono text-cyan-400">
              {totalActual.toLocaleString()} pcs
            </div>
            <div className="text-[10px] text-slate-400">
              {((totalActual / totalTarget) * 100).toFixed(1)}% định mức
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <div className="text-xs text-slate-400">Kế hoạch ca:</div>
            <div className="text-xl font-bold font-mono text-white">
              {totalTarget.toLocaleString()} pcs
            </div>
            <div className="text-[10px] text-slate-400">Ca 1 (08:00 - 16:00)</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <div className="text-xs text-slate-400">Tốc độ hiện tại:</div>
            <div className="text-xl font-bold font-mono text-amber-400">
              {currentRatePcsPerHour.toLocaleString()} pcs/h
            </div>
            <div className="text-[10px] text-slate-400">Định mức: 13,125 pcs/h</div>
          </div>

          <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/40 text-center">
            <div className="text-xs text-red-400">Thâm hụt lũy kế:</div>
            <div className="text-xl font-bold font-mono text-red-400">
              -{deficit.toLocaleString()} pcs
            </div>
            <div className="text-[10px] text-red-400/80">Cần can thiệp khẩn cấp</div>
          </div>
        </div>

        {/* Hourly Bar Chart */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Biểu đồ tiến độ sản lượng từng giờ</span>
            <span className="text-cyan-400 flex items-center space-x-1.5 font-mono text-[11px]">
              <span className="w-4 h-0.5 border-t border-dashed border-cyan-400 inline-block" />
              <span>Định mức chuẩn (13,125 pcs/h)</span>
            </span>
          </div>

          <div className="h-48 w-full flex items-end justify-between pt-6 px-2 gap-2">
            {hourlyData.map((item, idx) => {
              const maxScale = 15000;
              const heightPct = item.actual > 0 ? (item.actual / maxScale) * 100 : 0;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center space-y-1.5 group relative">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 border border-slate-700 px-2 py-1 rounded text-[10px] whitespace-nowrap z-20 pointer-events-none text-center shadow-lg">
                    <div className="font-bold text-white">{item.hour}: {item.actual.toLocaleString()} pcs</div>
                    <div className="text-slate-400 text-[9px]">{item.reason}</div>
                  </div>

                  <div className="text-[10px] font-mono font-bold text-slate-400">
                    {item.actual > 0 ? `${(item.actual / 1000).toFixed(1)}k` : '-'}
                  </div>

                  {/* Bar Column */}
                  <div className="w-full max-w-[44px] h-32 bg-slate-800/80 rounded-t-md relative flex items-end overflow-hidden">
                    {/* Standard benchmark line */}
                    <div 
                      className="absolute w-full border-t border-dashed border-cyan-400/60 z-10"
                      style={{ bottom: `${(13125 / maxScale) * 100}%` }}
                    />

                    {item.actual > 0 && (
                      <div
                        className={`w-full rounded-t-md transition-all duration-700 ${
                          item.future
                            ? 'bg-emerald-500/80 border-t-2 border-emerald-300'
                            : item.isDip
                            ? 'bg-red-500 shadow-lg shadow-red-500/30'
                            : 'bg-gradient-to-t from-cyan-600 to-cyan-400'
                        }`}
                        style={{ height: `${heightPct}%` }}
                      />
                    )}
                  </div>

                  <span className={`text-[11px] font-mono font-medium ${
                    item.isDip ? 'text-red-400 font-bold' : item.future ? 'text-emerald-400' : 'text-slate-400'
                  }`}>
                    {item.hour}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hourly Diagnostic Notes */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-2">
          <div className="font-bold text-amber-300 flex items-center space-x-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Phát hiện điểm tụt áp sản lượng trũng sâu lúc 11:00 & 12:00:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px] pl-1">
            <li>
              <strong>11:00 (10,100 pcs - Hụt 3,025 pcs):</strong> Đứt phôi nhôm A980 khiến cụm máy dập 3 & 4 tại DAAL dừng 50% công suất; máy CNC Spindle 04 KTECH rung 4.35G phải hãm tốc độ.
            </li>
            <li>
              <strong>12:00 (9,450 pcs - Hụt 3,675 pcs):</strong> Tồn đệm Prebuild tại DAAL cạn kiệt; chuyền SMT HSTEC thiếu 12 thợ dẫn tới nghẽn luồng linh kiện bán thành phẩm.
            </li>
            <li>
              <strong>14:00 (Hiện tại):</strong> Cần kích hoạt ngay gói cấp bù phôi nhôm K1 và điều động 12 công nhân tăng cường để phục hồi nhịp đạt 14,200 pcs/h trong khung 15:00 - 16:00.
            </li>
          </ul>
        </div>

        {/* Modal Bottom Action Controls */}
        <div className="flex flex-wrap justify-between items-center pt-2 gap-3">
          <span className="text-xs text-slate-400">
            Hành động sẽ điều phối tức thời 3.2 tấn phôi nhôm từ Hub A01 sang DAAL.
          </span>
          <div className="flex space-x-3">
            <button
              onClick={() => {
                soundManager.playClick();
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
            >
              Đóng
            </button>
            <button
              onClick={() => {
                soundManager.playSuccess();
                onDispatchRemedy();
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-500/20 flex items-center space-x-1.5 transition active:scale-95"
            >
              <Zap className="w-4 h-4" />
              <span>Xác nhận điều phối cứu nguy ngay</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
