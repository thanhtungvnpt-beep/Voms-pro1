import React, { useState } from 'react';
import { 
  X, Sparkles, Code2, Play, Terminal, CheckCircle2, 
  Send, RefreshCw, Copy, Check, ChevronRight 
} from 'lucide-react';
import { GEMINI_FUNCTIONS_SPEC } from '../data/initialData';
import { soundManager } from '../utils/audio';

interface AiDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerToolCall: (toolName: string, args: any) => void;
}

export const AiDiagnosticsModal: React.FC<AiDiagnosticsModalProps> = ({
  isOpen,
  onClose,
  onTriggerToolCall
}) => {
  const [selectedTool, setSelectedTool] = useState<string>('dispatch_material_emergency');
  const [callLogs, setCallLogs] = useState<Array<{ timestamp: string; tool: string; args: any; result: any }>>([
    {
      timestamp: '14:02:18',
      tool: 'execute_counterfactual_simulation',
      args: { scenario_type: 'BASELINE', interventions: [] },
      result: { baseline_output: 82400, baseline_otd: 0.68, confidence: 0.964 }
    }
  ]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  if (!isOpen) return null;

  const currentToolSpec = GEMINI_FUNCTIONS_SPEC.find(t => t.name === selectedTool) || GEMINI_FUNCTIONS_SPEC[0];

  const handleExecuteTool = () => {
    soundManager.playSuccess();
    setIsSimulating(true);

    let sampleArgs: any = {};
    let sampleResult: any = {};

    if (selectedTool === 'dispatch_material_emergency') {
      sampleArgs = {
        material_code: 'ALUMINUM_A980',
        quantity_kg: 3200,
        from_location: 'HUB_A01',
        to_plant: 'DAAL',
        transport_priority: 'P1_EMERGENCY'
      };
      sampleResult = {
        status: 'DISPATCH_IN_PROGRESS',
        truck_assigned: 'VNPT-LOG-09',
        eta_minutes: 25,
        estimated_output_recovery_pcs: 7800
      };
    } else if (selectedTool === 'schedule_cnc_maintenance') {
      sampleArgs = {
        plant_id: 'KTECH',
        machine_id: 'CNC-SPINDLE-04',
        action_type: 'TOOL_REPLACEMENT',
        estimated_downtime_minutes: 15
      };
      sampleResult = {
        status: 'WORK_ORDER_ISSUED',
        ticket_id: 'WO-20250624-04',
        vibration_target_G: 1.2,
        oee_target: 88.0
      };
    } else {
      sampleArgs = {
        scenario_type: 'FULL_AI_OPTIMAL',
        interventions: ['DISPATCH_DAAL_K1', 'SHIFT_12_SMT_HSTEC', 'REPLACE_TOOL_KTECH']
      };
      sampleResult = {
        simulated_output: 101800,
        simulated_otd: 0.985,
        confidence_score: 0.964
      };
    }

    setTimeout(() => {
      onTriggerToolCall(selectedTool, sampleArgs);
      setCallLogs(prev => [
        {
          timestamp: new Date().toTimeString().split(' ')[0],
          tool: selectedTool,
          args: sampleArgs,
          result: sampleResult
        },
        ...prev
      ]);
      setIsSimulating(false);
    }, 400);
  };

  const systemPromptSample = `Bạn là Trợ lý AI Điều hành Sản xuất & Kiến trúc sư Phần mềm Cao cấp của Hệ sinh thái "NEURAL LINK PRO / VOMS" (Vendor Outsourcing Management System).
Tác giả & Kiến trúc sư trưởng: Ngô Thanh Tùng (Chief Architect).
Chuẩn kiểm định hệ thống: GMES Causal AI Engine v4.2 • ISO 9001 / IATF 16949 Compliant • Latency < 12ms.

Cấu trúc nghiệp vụ:
1. Chuỗi gồm 7 nhà máy vệ tinh: KHV, DREAM TECH, HSTEC, KTECH, HOJEONGB, HOJEONG VINA, DAAL.
2. Sơ đồ nhân quả: Mạng DAG 18 nút / 24 liên kết, suy luận qua giải thuật Pearl Do-Calculus, phân tích phương sai Shapley Value.
3. Khi người dùng yêu cầu phân tích sự cố, hãy truy tìm nguyên nhân gốc (Root Cause), kiểm tra các quan hệ R06, R08, R05 và tự động gọi các tool function tương ứng:
   - dispatch_material_emergency
   - schedule_cnc_maintenance
   - execute_counterfactual_simulation`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-[#0d1321] border-2 border-purple-500/80 rounded-2xl p-6 shadow-2xl relative text-slate-100 space-y-4 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                GOOGLE AI STUDIO — GEMINI FUNCTION CALLING &amp; AGENT LAB
              </h3>
              <p className="text-xs text-slate-400">
                Giao tiếp hai chiều với Causal DAG Engine qua OpenAPI 3.1 &amp; Gemini Function Declarations
              </p>
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

        {/* Modal Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1 overflow-y-auto">
          {/* Left: Tool Function Selector & Spec (6 Cols) */}
          <div className="md:col-span-6 space-y-3">
            <div className="text-xs font-bold text-slate-300">
              Chọn công cụ điều hành sản xuất (Tool Declaration):
            </div>

            <div className="space-y-1.5">
              {GEMINI_FUNCTIONS_SPEC.map((t) => (
                <button
                  key={t.name}
                  onClick={() => setSelectedTool(t.name)}
                  className={`w-full p-2.5 rounded-xl text-left text-xs transition border flex items-center justify-between ${
                    selectedTool === t.name
                      ? 'bg-purple-950/40 border-purple-500 text-purple-300 font-bold shadow'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="truncate pr-2">
                    <span className="font-mono block truncate">{t.name}</span>
                    <span className="text-[10px] text-slate-400 font-normal line-clamp-1">
                      {t.description}
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 shrink-0 text-slate-500" />
                </button>
              ))}
            </div>

            {/* Tool Schema Inspector */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex justify-between items-center text-[10px] text-slate-400">
                <span className="font-mono font-bold text-cyan-400">JSON Schema (Gemini SDK)</span>
                <span>ISO 9001 Compliant</span>
              </div>
              <pre className="text-[11px] font-mono text-purple-300 overflow-x-auto max-h-40 p-2 bg-slate-900/60 rounded">
                {JSON.stringify(currentToolSpec, null, 2)}
              </pre>
            </div>

            {/* Execute Test Call Button */}
            <button
              onClick={handleExecuteTool}
              disabled={isSimulating}
              className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-purple-600/25 transition active:scale-95"
            >
              <Play className={`w-4 h-4 ${isSimulating ? 'animate-spin' : ''}`} />
              <span>{isSimulating ? 'Đang thực thi RPC &amp; Causal DAG...' : `Chạy thử nghiệm ${selectedTool}`}</span>
            </button>
          </div>

          {/* Right: Realtime Function Calling Trace & System Prompt (6 Cols) */}
          <div className="md:col-span-6 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-slate-300 mb-2">
                <span className="flex items-center space-x-1.5">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span>Nhật ký gọi hàm tự động (Live Function Call Trace)</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400">● 12ms Socket</span>
              </div>

              {/* Logs Box */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs space-y-2 max-h-56 overflow-y-auto">
                {callLogs.map((log, i) => (
                  <div key={i} className="p-2 rounded bg-slate-900/80 border border-slate-800 text-[11px] space-y-1">
                    <div className="flex justify-between text-slate-400">
                      <span className="text-cyan-400 font-bold">[{log.timestamp}] CALL: {log.tool}</span>
                      <span className="text-emerald-400">200 OK</span>
                    </div>
                    <div className="text-slate-300">
                      <span className="text-purple-400">ARGS:</span> {JSON.stringify(log.args)}
                    </div>
                    <div className="text-slate-400">
                      <span className="text-emerald-400">RESULT:</span> {JSON.stringify(log.result)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* System Prompt Box for Google AI Studio */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-300">System Instructions cho Google AI Studio:</span>
                <button
                  onClick={() => {
                    soundManager.playSuccess();
                    navigator.clipboard.writeText(systemPromptSample);
                    setCopiedPrompt(true);
                    setTimeout(() => setCopiedPrompt(false), 2000);
                  }}
                  className="text-[10px] text-cyan-400 hover:underline flex items-center space-x-1"
                >
                  {copiedPrompt ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedPrompt ? 'Đã sao chép' : 'Sao chép prompt'}</span>
                </button>
              </div>

              <div className="text-[10px] text-slate-400 line-clamp-3 font-mono bg-slate-900/70 p-2 rounded">
                {systemPromptSample}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
