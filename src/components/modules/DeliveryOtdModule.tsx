import React from 'react';
import { Truck, MapPin, AlertTriangle, Clock, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { OtdShipment } from '../../types';
import { soundManager } from '../../utils/audio';

interface DeliveryOtdModuleProps {
  shipments: OtdShipment[];
  onExpediteShipment: (shipmentId: string) => void;
}

export const DeliveryOtdModule: React.FC<DeliveryOtdModuleProps> = ({
  shipments,
  onExpediteShipment
}) => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center bg-[#0d1321] p-4 rounded-2xl border border-slate-800 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <Truck className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">04. QUẢN TRỊ GIAO HÀNG &amp; XUẤT CẢNG (TO / OTD DISPATCH)</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Giám sát vận tải container xuất cảng Hải Phòng (Tân Vũ, Lạch Huyện) • Nguy cơ trễ chuyến TO-3011
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-red-400 bg-red-950/40 border border-red-500/40 px-2.5 py-1 rounded-xl font-bold flex items-center space-x-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Phạt chậm container nếu trễ: $18,500</span>
          </span>
        </div>
      </div>

      {/* Shipment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {shipments.map((sh) => {
          const isCritical = sh.status === 'critical';
          const isAtRisk = sh.status === 'at_risk';
          const readyPct = ((sh.readyQty / sh.plannedQty) * 100).toFixed(1);

          return (
            <div
              key={sh.id}
              className={`p-4 rounded-2xl border bg-[#0d1321] space-y-3 transition ${
                isCritical 
                  ? 'border-red-500/80 shadow-lg shadow-red-500/10' 
                  : isAtRisk 
                  ? 'border-amber-500/60' 
                  : 'border-slate-800'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                    isCritical ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                    isAtRisk ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                    'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  }`}>
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-black font-mono text-white">{sh.code}</span>
                      <span className="text-xs text-slate-400">({sh.truckNo})</span>
                    </div>
                    <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-cyan-400" />
                      <span>{sh.destination}</span>
                    </span>
                  </div>
                </div>

                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  isCritical ? 'bg-red-500 text-white animate-pulse' :
                  isAtRisk ? 'bg-amber-500/90 text-slate-950' :
                  'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {isCritical ? 'NGUY CƠ TRỄ (68%)' : isAtRisk ? 'CẦN THEO DÕI' : 'ĐÚNG TIẾN ĐỘ'}
                </span>
              </div>

              {/* Ready progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Hàng sẵn sàng đóng thùng:</span>
                  <span className="font-mono font-bold">
                    {sh.readyQty.toLocaleString()} / {sh.plannedQty.toLocaleString()} pcs ({readyPct}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isCritical ? 'bg-red-500' : isAtRisk ? 'bg-amber-400' : 'bg-emerald-400'
                    }`}
                    style={{ width: `${readyPct}%` }}
                  />
                </div>
              </div>

              {/* Time and Logistics Meta */}
              <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-400 block">Giờ xuất bến dự kiến:</span>
                  <span className="font-mono font-bold text-white flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span>{sh.departureTime}</span>
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Dự kiến đến cảng (ETA):</span>
                  <span className="font-mono font-bold text-white flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-emerald-400" />
                    <span>{sh.etaPort}</span>
                  </span>
                </div>
              </div>

              {/* Action Button */}
              {isCritical && (
                <button
                  onClick={() => {
                    soundManager.playSuccess();
                    onExpediteShipment(sh.id);
                  }}
                  className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-cyan-500/20 transition active:scale-95"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>⚡ Ưu tiên xả kho đệm cấp bù cho xe {sh.code}</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
