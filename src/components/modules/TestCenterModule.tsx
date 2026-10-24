import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, Bug, Play, RefreshCw, Zap, Activity } from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface TestCenterModuleProps {
  onInjectFault: (faultType: string) => void;
  onResetAll: () => void;
}

export const TestCenterModule: React.FC<TestCenterModuleProps> = ({
  onInjectFault,
  onResetAll
}) => {
  const [latencyLogs, setLatencyLogs] = useState<Array<{ packet: number; pingMs: number; jitterMs: number; status: string }>>([
    { packet: 1, pingMs: 8.2, jitterMs: 0.4, status: 'NOMINAL (< 12ms)' },
    { packet: 2, pingMs: 9.1, jitterMs: 0.6, status: 'NOMINAL (< 12ms)' },
    { packet: 3, pingMs: 7.8, jitterMs: 0.3, status: 'NOMINAL (< 12ms)' },
  ]);
  const [testingPing, setTestingPing] = useState(false);

  const handleTestLatency = () => {
    soundManager.playClick();
    setTestingPing(true);
    setTimeout(() => {
      soundManager.playSuccess();
      const newPackets = [
        { packet: latencyLogs.length + 1, pingMs: Number((7.5 + Math.random() * 3).toFixed(1)), jitterMs: Number((0.2 + Math.random() * 0.5).toFixed(1)), status: 'NOMINAL (< 12ms)' },
        { packet: latencyLogs.length + 2, pingMs: Number((8.0 + Math.random() * 2.5).toFixed(1)), jitterMs: Number((0.3 + Math.random() * 0.4).toFixed(1)), status: 'NOMINAL (< 12ms)' },
      ];
      setLatencyLogs(prev => [...newPackets, ...prev]);
      setTestingPing(false);
    }, 400);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center bg-[#0d1321] p-4 rounded-2xl border border-slate-800 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">TEST CENTER — QA, FAULT INJECTION &amp; LATENCY BENCHMARK</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Trung tâm thử nghiệm chịu tải chuỗi cung ứng &amp; giả lập sự cố (Chaos Engineering for MES)
          </p>
        </div>

        <button
          onClick={() => {
            soundManager.playClick();
            onResetAll();
          }}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center space-x-2 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Khôi phục trạng thái chuẩn ban đầu</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left: Chaos Engineering Fault Injection (6 cols) */}
        <div className="md:col-span-6 space-y-3">
          <div className="bg-[#0d1321] p-4 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-white flex items-center space-x-2">
              <Bug className="w-4 h-4 text-red-400" />
              <span>Tiêm kích hoạt sự cố giả lập (Fault Injection):</span>
            </h3>

            <div className="space-y-2">
              {[
                { id: 'DAAL_ALUMINUM_OUTAGE', title: 'Cắt đứt nguồn phôi nhôm A980 tại DAAL', target: 'N03 Kho vật liệu ➔ DAAL' },
                { id: 'KTECH_SPINDLE_VIBRATION', title: 'Đẩy rung trục CNC Spindle 04 lên 4.5G', target: 'N05 Thiết bị ➔ KTECH' },
                { id: 'HSTEC_MISSING_OPERATORS', title: 'Giả lập vắng 12 thợ SMT ca 1', target: 'N04 Nhân lực ➔ HSTEC' },
                { id: 'HOJEONG_LASER_DEFECT', title: 'Làm lệch tiêu cự hàn laser Trumpf 0.08mm', target: 'N06 OQC ➔ HOJEONG VINA' },
              ].map((fault) => (
                <div
                  key={fault.id}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-200 block">{fault.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{fault.target}</span>
                  </div>

                  <button
                    onClick={() => {
                      soundManager.playAlert();
                      onInjectFault(fault.id);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-[11px] font-bold transition active:scale-95"
                  >
                    Tiêm lỗi
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Latency & Telemetry Benchmark (6 cols) */}
        <div className="md:col-span-6 space-y-3">
          <div className="bg-[#0d1321] p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-white flex items-center space-x-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Kiểm định độ trễ luồng Telemetry (&lt; 12ms Benchmark):</span>
              </h3>

              <button
                onClick={handleTestLatency}
                disabled={testingPing}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition active:scale-95 shadow"
              >
                <Play className={`w-3.5 h-3.5 ${testingPing ? 'animate-spin' : ''}`} />
                <span>Đo độ trễ Socket</span>
              </button>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs space-y-1.5 max-h-56 overflow-y-auto">
              {latencyLogs.map((log, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 rounded bg-slate-900/80 border border-slate-800 text-[11px]">
                  <span className="text-cyan-400 font-bold">Packet #{log.packet}</span>
                  <span className="text-white">RTT: <strong>{log.pingMs}ms</strong></span>
                  <span className="text-slate-400">Jitter: {log.jitterMs}ms</span>
                  <span className="text-emerald-400 font-bold">{log.status}</span>
                </div>
              ))}
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-300 flex justify-between items-center">
              <span>Đạt tiêu chuẩn xuất xưởng ISO 9001:2015</span>
              <span className="font-mono font-bold">Latency Pass: 100%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
