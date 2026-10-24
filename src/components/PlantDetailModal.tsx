import React from 'react';
import { X, Building2, User, Layers, Users, Wrench, ShieldAlert, CheckCircle2, Zap } from 'lucide-react';
import { PlantMetric, MachineTelemetry } from '../types';
import { MACHINE_TELEMETRY } from '../data/initialData';
import { soundManager } from '../utils/audio';

interface PlantDetailModalProps {
  plant: PlantMetric | null;
  onClose: () => void;
  onQuickRecoverPlant: (plantId: string) => void;
}

export const PlantDetailModal: React.FC<PlantDetailModalProps> = ({
  plant,
  onClose,
  onQuickRecoverPlant
}) => {
  if (!plant) return null;

  const plantMachines = MACHINE_TELEMETRY.filter(m => m.plant === plant.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#0d1321] border-2 border-cyan-500/80 rounded-2xl p-6 shadow-2xl relative text-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-start pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-900 border border-slate-700 shrink-0">
              <img src={plant.imgUrl} alt={plant.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs bg-cyan-950 text-cyan-400 border border-cyan-800 px-1.5 py-0.5 rounded font-bold">
                  {plant.id}
                </span>
                <h3 className="text-base font-bold text-white tracking-wide">
                  {plant.name}
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{plant.specialty}</p>
            </div>
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

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Sản lượng ca:</span>
            <span className="text-lg font-bold font-mono text-cyan-300">
              {plant.actual.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-500 block">/ {plant.target.toLocaleString()} pcs</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Tỷ lệ tiến độ:</span>
            <span className={`text-lg font-bold font-mono ${
              plant.rate < 60 ? 'text-red-400' : plant.rate < 80 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {plant.rate}%
            </span>
            <span className="text-[10px] text-slate-500 block">Mục tiêu: &gt; 85%</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Chỉ số OEE:</span>
            <span className={`text-lg font-bold font-mono ${
              plant.oee < 70 ? 'text-red-400' : plant.oee < 85 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {plant.oee}%
            </span>
            <span className="text-[10px] text-slate-500 block">Chuẩn GMES v4.2</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-[10px] text-slate-400 block">Tỷ lệ lỗi OQC:</span>
            <span className={`text-lg font-bold font-mono ${
              plant.activeDefectRate > 0.5 ? 'text-red-400' : 'text-slate-200'
            }`}>
              {plant.activeDefectRate}%
            </span>
            <span className="text-[10px] text-slate-500 block">DPMO quy chuẩn</span>
          </div>
        </div>

        {/* Operational Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
            <div className="font-bold text-slate-300 flex items-center space-x-1.5 pb-1 border-b border-slate-800">
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span>Nhân sự &amp; Quản lý điều hành</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Quản đốc phụ trách:</span>
              <span className="font-semibold text-slate-200">{plant.manager}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Số lượng chuyền máy:</span>
              <span className="font-mono text-slate-200">{plant.lines} Chuyền active</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Công nhân hiện diện:</span>
              <span className="font-mono text-slate-200">{plant.workers} Nhân sự</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
            <div className="font-bold text-slate-300 flex items-center space-x-1.5 pb-1 border-b border-slate-800">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Chẩn đoán hiện trạng điểm nghẽn</span>
            </div>
            <div className="text-[11px] text-slate-300">
              {plant.note || 'Hoạt động ổn định theo kế hoạch.'}
            </div>
            <div className="text-[10px] text-cyan-400 font-medium">
              ● Trạng thái: {plant.statusText}
            </div>
          </div>
        </div>

        {/* Machine Sensors Telemetry */}
        {plantMachines.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
              <Wrench className="w-3.5 h-3.5 text-cyan-400" />
              <span>Thiết bị trọng yếu giám sát thời gian thực (TPM Telemetry)</span>
            </div>

            <div className="space-y-1.5">
              {plantMachines.map((m) => (
                <div key={m.id} className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div>
                    <div className="font-bold text-white flex items-center space-x-2">
                      <span className="font-mono text-cyan-400">{m.code}</span>
                      <span className="text-slate-300">{m.name}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Bảo trì gần nhất: {m.lastMaintenance}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-[11px] font-mono">
                    <div className="text-right">
                      <span className="text-slate-400 text-[10px] block">Rung động:</span>
                      <span className={m.vibrationG > 3.5 ? 'text-red-400 font-bold' : 'text-slate-200'}>
                        {m.vibrationG}G
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 text-[10px] block">Nhiệt độ:</span>
                      <span className="text-slate-200">{m.temperatureC}°C</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 text-[10px] block">Mòn dao:</span>
                      <span className={m.toolWearPct > 80 ? 'text-red-400 font-bold' : 'text-slate-200'}>
                        {m.toolWearPct}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Footer Actions */}
        <div className="flex justify-between items-center pt-2 border-t border-slate-800">
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
          >
            Đóng
          </button>

          {plant.status !== 'optimal' && (
            <button
              onClick={() => {
                soundManager.playSuccess();
                onQuickRecoverPlant(plant.id);
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-lg shadow-cyan-500/20 flex items-center space-x-1.5 transition active:scale-95"
            >
              <Zap className="w-4 h-4" />
              <span>Phục hồi khẩn cấp cho {plant.id}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
