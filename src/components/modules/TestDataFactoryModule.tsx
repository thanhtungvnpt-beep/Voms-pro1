import React, { useState } from 'react';
import { Database, Play, Sparkles, RefreshCw, Check, Download, AlertTriangle } from 'lucide-react';
import { soundManager } from '../../utils/audio';

export const TestDataFactoryModule: React.FC = () => {
  const [dataPreset, setDataPreset] = useState<'nominal' | 'heavy_deficit' | 'otd_emergency'>('heavy_deficit');
  const [generatedJson, setGeneratedJson] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    soundManager.playSuccess();
    const mockTelemetry = {
      timestamp: new Date().toISOString(),
      shift_id: "CA_1_0800_1600",
      system_latency_ms: 8.4,
      preset_applied: dataPreset,
      plants: [
        { plant_id: "KHV", actual_output: 12800, target_output: 15000, completion_rate: 85.3, oee_percentage: 91.2, status: "OPTIMAL" },
        { plant_id: "DREAM_TECH", actual_output: 13000, target_output: 18000, completion_rate: 72.2, oee_percentage: 86.4, status: "STABLE" },
        { plant_id: "HSTEC", actual_output: 12500, target_output: 16000, completion_rate: 78.1, oee_percentage: 79.1, status: "WARNING", bottleneck_cause: "Thiếu 12 thợ SMT" },
        { plant_id: "KTECH", actual_output: 12000, target_output: 20000, completion_rate: 60.0, oee_percentage: 65.3, status: "WARNING", bottleneck_cause: "Mòn dao Spindle 04" },
        { plant_id: "HOJEONGB", actual_output: 13700, target_output: 15500, completion_rate: 88.4, oee_percentage: 93.8, status: "OPTIMAL" },
        { plant_id: "HOJEONG_VINA", actual_output: 13700, target_output: 18000, completion_rate: 76.1, oee_percentage: 80.2, status: "WARNING", bottleneck_cause: "Lệch hàn laser" },
        { plant_id: "DAAL", actual_output: 8600, target_output: 18000, completion_rate: 47.8, oee_percentage: 51.4, status: "CRITICAL", bottleneck_cause: "Đứt phôi nhôm A980 (P1)" }
      ]
    };
    setGeneratedJson(JSON.stringify(mockTelemetry, null, 2));
  };

  const handleCopy = () => {
    soundManager.playSuccess();
    navigator.clipboard.writeText(generatedJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center bg-[#0d1321] p-4 rounded-2xl border border-slate-800 gap-3">
        <div className="flex items-center space-x-3 text-xs">
          <Database className="w-5 h-5 text-cyan-400" />
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">DEVELOP /</span>
              <h2 className="text-sm font-bold text-white">TEST DATA FACTORY — SINH DỮ LIỆU GIẢ LẬP CA SẢN XUẤT</h2>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Tạo gói telemetry mẫu chuẩn hóa JSON Schema phục vụ nạp kiểm thử vào Google AI Studio
            </p>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center space-x-2 transition active:scale-95 shadow-md shadow-cyan-500/20"
        >
          <Play className="w-4 h-4" />
          <span>Sinh gói dữ liệu mới</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
        {/* Preset Selector (4 cols) */}
        <div className="md:col-span-4 bg-[#0b101d] rounded-2xl border border-slate-800 p-4 space-y-3">
          <h3 className="font-bold text-white pb-2 border-b border-slate-800">Chọn kịch bản sự cố mẫu:</h3>
          
          <div className="space-y-2">
            {[
              { id: 'heavy_deficit', title: '01. Thâm hụt P1 Đứt phôi DAAL', desc: 'DAAL giảm 48%, trễ xe TO-3011, KTECH mòn dao' },
              { id: 'otd_emergency', title: '02. Báo động đỏ xuất cảng OTD', desc: '3 chuyến container trễ lịch, thâm hụt 38,000 pcs' },
              { id: 'nominal', title: '03. Vận hành ổn định (Nominal)', desc: '7 nhà máy đạt > 85%, OTD 98%, không sự cố P1' },
            ].map(preset => (
              <button
                key={preset.id}
                onClick={() => setDataPreset(preset.id as any)}
                className={`w-full p-2.5 rounded-xl border text-left transition ${
                  dataPreset === preset.id 
                    ? 'bg-cyan-950/40 border-cyan-400 text-cyan-200 font-bold' 
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div>{preset.title}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{preset.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* JSON Preview Output (8 cols) */}
        <div className="md:col-span-8 bg-[#0b101d] rounded-2xl border border-slate-800 p-4 space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="font-bold text-white">JSON Telemetry Snapshot:</span>
              {generatedJson && (
                <button
                  onClick={handleCopy}
                  className="text-cyan-400 hover:underline flex items-center space-x-1"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : null}
                  <span>{copied ? 'Đã sao chép' : 'Sao chép JSON'}</span>
                </button>
              )}
            </div>

            <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-cyan-300 max-h-72 overflow-y-auto mt-2">
              {generatedJson || 'Nhấp "Sinh gói dữ liệu mới" để tạo gói payload...'}
            </pre>
          </div>

          <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-500">
            <span>JSON Schema: Draft 2020-12 Compliant</span>
            <span className="text-emerald-400 font-bold">100% Validated</span>
          </div>
        </div>
      </div>
    </div>
  );
};
