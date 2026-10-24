import React, { useState } from 'react';
import { Settings, Sliders, ShieldCheck, Cpu, Database, Save, Check } from 'lucide-react';
import { soundManager } from '../../utils/audio';

export const SystemSettingsModule: React.FC = () => {
  const [latencyTargetMs, setLatencyTargetMs] = useState(12);
  const [vibrationThresholdG, setVibrationThresholdG] = useState(3.5);
  const [autoIntervene, setAutoIntervene] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    soundManager.playSuccess();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center bg-[#0d1321] p-4 rounded-2xl border border-slate-800 gap-3">
        <div className="flex items-center space-x-3 text-xs">
          <Settings className="w-5 h-5 text-cyan-400" />
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">OPERATIONS /</span>
              <h2 className="text-sm font-bold text-white">12. CÀI ĐẶT HỆ THỐNG &amp; CẤU HÌNH THAM SỐ NGƯỠNG AI (SYSTEM SETTINGS)</h2>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Quản trị ngưỡng kích hoạt sự cố, thuật toán Causal Bayesian DAG và thông số kết nối IoT GMES v4.2 PRO
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition active:scale-95 shadow-md shadow-cyan-500/20"
        >
          {saved ? <Check className="w-4 h-4 text-slate-950" /> : <Save className="w-4 h-4" />}
          <span>{saved ? 'Đã lưu cấu hình' : 'Lưu cấu hình hệ thống'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Card 1: AI Engine Parameters */}
        <div className="p-4 rounded-2xl bg-[#0b101d] border border-slate-800 space-y-3">
          <h3 className="font-bold text-white flex items-center space-x-2 pb-2 border-b border-slate-800">
            <Cpu className="w-4 h-4 text-purple-400" />
            <span>Tham số thuật toán AI Causal Engine</span>
          </h3>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Ngưỡng độ trễ Telemetry tối đa:</span>
                <span className="font-mono font-bold text-cyan-300">{latencyTargetMs} ms</span>
              </div>
              <input 
                type="range" 
                min="5" 
                max="25" 
                value={latencyTargetMs} 
                onChange={e => setLatencyTargetMs(Number(e.target.value))}
                className="w-full accent-cyan-400" 
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Ngưỡng rung động Spindle cảnh báo:</span>
                <span className="font-mono font-bold text-amber-400">{vibrationThresholdG} G</span>
              </div>
              <input 
                type="range" 
                min="2.0" 
                max="6.0" 
                step="0.1" 
                value={vibrationThresholdG} 
                onChange={e => setVibrationThresholdG(Number(e.target.value))}
                className="w-full accent-amber-400" 
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-200 block">Tự động kích hoạt chính sách cứu nguy</span>
                <span className="text-[10px] text-slate-400">Tự động phát lệnh điều phối phôi Hub A01 khi thâm hụt &gt; 25%</span>
              </div>
              <input 
                type="checkbox" 
                checked={autoIntervene} 
                onChange={e => setAutoIntervene(e.target.checked)}
                className="rounded bg-slate-900 border-slate-700 text-cyan-400 focus:ring-0 w-4 h-4" 
              />
            </div>
          </div>
        </div>

        {/* Card 2: Environment & Permissions */}
        <div className="p-4 rounded-2xl bg-[#0b101d] border border-slate-800 space-y-3">
          <h3 className="font-bold text-white flex items-center space-x-2 pb-2 border-b border-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Phân quyền &amp; Kiểm toán ISO 9001:2015</span>
          </h3>

          <div className="space-y-2 text-slate-300">
            <div className="flex justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
              <span>Kiến trúc sư trưởng:</span>
              <strong className="text-cyan-300 font-mono">Ngô Thanh Tùng (Chief Architect)</strong>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
              <span>Phiên bản GMES Suite:</span>
              <strong className="text-white font-mono">v4.2 PRO (Ultimate Bundle)</strong>
            </div>
            <div className="flex justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
              <span>Chuẩn an toàn thiết bị:</span>
              <strong className="text-emerald-400 font-mono">IATF 16949 Section 8.5.1</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
