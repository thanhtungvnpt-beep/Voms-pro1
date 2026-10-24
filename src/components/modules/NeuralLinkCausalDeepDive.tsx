import React, { useState } from 'react';
import { 
  Cpu, Terminal, Activity, ArrowRight, Play, CheckCircle2, 
  ShieldCheck, Sparkles, Sliders, Layers, RefreshCw, Zap
} from 'lucide-react';
import { soundManager } from '../../utils/audio';

export const NeuralLinkCausalDeepDive: React.FC = () => {
  const [selectedIntervention, setSelectedIntervention] = useState<string>('SCENARIO_B');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState({
    output: 101800,
    otd: 98.5,
    gapReduction: 19400,
    confidence: 98.4,
    runtimeMs: 8.2
  });

  const handleRunSimulation = () => {
    soundManager.playClick();
    setIsSimulating(true);
    setTimeout(() => {
      soundManager.playSuccess();
      if (selectedIntervention === 'SCENARIO_A') {
        setSimulationResult({
          output: 93400,
          otd: 84.5,
          gapReduction: 11000,
          confidence: 96.8,
          runtimeMs: 7.9
        });
      } else if (selectedIntervention === 'SCENARIO_B') {
        setSimulationResult({
          output: 101800,
          otd: 98.5,
          gapReduction: 19400,
          confidence: 98.4,
          runtimeMs: 8.2
        });
      } else {
        setSimulationResult({
          output: 84200,
          otd: 68.0,
          gapReduction: 0,
          confidence: 99.1,
          runtimeMs: 6.4
        });
      }
      setIsSimulating(false);
    }, 450);
  };

  const dagNodes18 = [
    { code: 'N01_PLAN', name: 'Kế hoạch ca', category: 'Input', weight: 'w=0.71', status: 'optimal' },
    { code: 'N02_BUFFER', name: 'Prebuild M09', category: 'Input', weight: '+w=0.63', status: 'optimal' },
    { code: 'N03_MATERIAL', name: 'Kho NVL Hub A01', category: 'Input', weight: '-w=0.82', status: 'critical' },
    { code: 'N04_WORKFORCE', name: 'Nhân lực SMT', category: 'Process', weight: '-w=0.48', status: 'warning' },
    { code: 'N05_EQUIPMENT', name: 'Thiết bị & OEE', category: 'Process', weight: '-w=0.67', status: 'warning' },
    { code: 'N06_OQC', name: 'Chất lượng OQC', category: 'Process', weight: 'w=0.59', status: 'stable' },
    { code: 'N07_REWORK', name: 'Chuyền Rework', category: 'Process', weight: 'w=0.42', status: 'stable' },
    { code: 'N08_ACTUAL', name: 'Sản lượng Core', category: 'Core Hub', weight: 'w=1.00', status: 'core' },
    { code: 'N09_OTD', name: 'Giao hàng OTD', category: 'Outcome', weight: 'w=0.88', status: 'critical' },
    { code: 'N10_EXTERNAL', name: 'Ngoại lai Cảng', category: 'Context', weight: 'w=0.35', status: 'optimal' },
    { code: 'N11_KHV_LINE', name: 'KHV Line 01 SMT', category: 'Plant', weight: 'w=0.62', status: 'optimal' },
    { code: 'N12_DREAM_BASE', name: 'DREAM Shell Base', category: 'Plant', weight: 'w=0.58', status: 'optimal' },
    { code: 'N13_HSTEC_SMT', name: 'HSTEC Multilayer', category: 'Plant', weight: 'w=0.55', status: 'warning' },
    { code: 'N14_KTECH_CNC', name: 'KTECH 5-Axis Mill', category: 'Plant', weight: 'w=0.64', status: 'warning' },
    { code: 'N15_HOJEONGB', name: 'HOJEONGB Module', category: 'Plant', weight: 'w=0.69', status: 'optimal' },
    { code: 'N16_HOJEONGV', name: 'HOJEONG VINA Laser', category: 'Plant', weight: 'w=0.54', status: 'stable' },
    { code: 'N17_DAAL_CAST', name: 'DAAL Die Cast #1', category: 'Plant', weight: 'w=0.81', status: 'critical' },
    { code: 'N18_PACK_LINE', name: 'Băng tải đóng gói', category: 'Output', weight: 'w=0.74', status: 'optimal' },
  ];

  const shapleyDecomp = [
    { feature: 'Kho vật liệu (Đứt phôi nhôm A980 Hub A01)', impact: -38.5, color: 'bg-red-500' },
    { feature: 'Kế hoạch (Thay đổi lệnh gá đột xuất ca sáng)', impact: -28.0, color: 'bg-cyan-400' },
    { feature: 'Nhân lực (Thiếu 12 thợ SMT tại HSTEC)', impact: -15.0, color: 'bg-purple-400' },
    { feature: 'Thiết bị (Mòn dao phay CNC KTECH Spindle 04)', impact: -13.0, color: 'bg-amber-400' },
    { feature: 'Prebuild Buffer (Đệm an toàn xả bù 4.5k pcs)', impact: 12.0, color: 'bg-emerald-400' },
    { feature: 'Khác (Dung sai quang học hàn laser micro)', impact: -7.5, color: 'bg-blue-400' },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center bg-[#0d1321] p-4 rounded-2xl border border-slate-800 gap-3">
        <div className="flex items-center space-x-3 text-xs">
          <Cpu className="w-5 h-5 text-purple-400" />
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">OPERATIONS /</span>
              <h2 className="text-sm font-bold text-white">10. PHÂN TÍCH AI CAUSAL CHUYÊN SÂU (PEARL DO-CALCULUS &amp; DAG)</h2>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Động cơ toán học nhân quả v4.2 • 18 Nodes / 24 Directed Causal Edges • Monte Carlo (10,000 runs)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="bg-purple-950/40 border border-purple-500/40 text-purple-300 px-2.5 py-1 rounded-xl">
            Inference: {simulationResult.runtimeMs}ms (&lt; 12ms Target)
          </span>
        </div>
      </div>

      {/* Grid: 18 Nodes Overview + Monte Carlo Simulation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left: 18 DAG Nodes Matrix (7 Cols) */}
        <div className="lg:col-span-7 bg-[#0b101d] rounded-2xl border border-slate-800 p-4 space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold text-white flex items-center space-x-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>CẤU TRÚC ĐỒ THỊ 18 NÚT NHÂN QUẢ (BAYESIAN DAG TOPOLOGY)</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">ISO 9001 / IATF 16949</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[380px] overflow-y-auto pr-1">
            {dagNodes18.map((node) => {
              const isCrit = node.status === 'critical';
              const isWarn = node.status === 'warning';
              const isCore = node.status === 'core';

              return (
                <div 
                  key={node.code}
                  className={`p-2 rounded-xl border text-xs transition ${
                    isCrit ? 'bg-red-950/25 border-red-500/60' :
                    isWarn ? 'bg-amber-950/20 border-amber-500/50' :
                    isCore ? 'bg-cyan-950/30 border-cyan-400 font-bold' :
                    'bg-slate-900/80 border-slate-800'
                  }`}
                >
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className={isCrit ? 'text-red-400 font-bold' : isCore ? 'text-cyan-300' : 'text-slate-400'}>
                      {node.code}
                    </span>
                    <span className="text-slate-500">{node.weight}</span>
                  </div>
                  <div className="font-bold text-white text-[11px] truncate mt-0.5">{node.name}</div>
                  <div className="text-[9px] text-slate-400 mt-0.5">{node.category}</div>
                </div>
              );
            })}
          </div>

          {/* Pearl's Do-Calculus Identities Box */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono space-y-1">
            <div className="text-cyan-400 font-bold">★ Định lý Nhận dạng (Identifiability &amp; Back-door):</div>
            <div className="text-slate-300">
              P(Y | do(X = x)) = ∑_z P(Y | X=x, Z=z) · P(Z=z) | Z = {'{N01, N02, N03}'}
            </div>
            <div className="text-emerald-400 text-[10px]">
              Đồ thị không chứa chu trình khép kín (Acyclic). Mọi can thiệp đều khả quy.
            </div>
          </div>
        </div>

        {/* Right: Monte Carlo What-If Runner (5 Cols) */}
        <div className="lg:col-span-5 bg-[#0d1321] rounded-2xl border border-slate-800 p-4 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold text-white flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>MÔ PHỎNG MONTE CARLO (10,000 RUNS)</span>
              </h3>
              <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded font-mono font-bold">
                WHAT-IF
              </span>
            </div>

            <p className="text-[10px] text-slate-400 mt-2 mb-3">
              Kiểm định hiệu quả can thiệp chính sách (Intervention Policy) trước khi phát lệnh điều phối MES:
            </p>

            {/* Policy Selector */}
            <div className="space-y-2 text-xs">
              {[
                { id: 'BASELINE', label: '01. Giữ nguyên (Baseline - Không can thiệp)', tag: '84.2k pcs / OTD 68%' },
                { id: 'SCENARIO_A', label: '02. Cứu nguy DAAL (Cấp 3.2 tấn phôi nhôm K1)', tag: '93.4k pcs / OTD 84.5%' },
                { id: 'SCENARIO_B', label: '03. Gói can thiệp toàn diện AI (Full Optimal)', tag: '101.8k pcs / OTD 98.5%' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedIntervention(opt.id)}
                  className={`w-full p-2.5 rounded-xl border text-left transition ${
                    selectedIntervention === opt.id
                      ? 'bg-purple-950/40 border-purple-500 text-purple-200 font-bold shadow'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>{opt.label}</span>
                  </div>
                  <div className="text-[10px] text-cyan-400 mt-0.5 font-mono">{opt.tag}</div>
                </button>
              ))}
            </div>

            {/* Simulation Results Output */}
            <div className="mt-3 p-3 bg-slate-950 rounded-xl border border-slate-800 grid grid-cols-2 gap-2 text-center font-mono">
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Sản lượng dự báo:</span>
                <span className="text-base font-bold text-white">{simulationResult.output.toLocaleString()} pcs</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">OTD Xuất cảng:</span>
                <span className="text-base font-bold text-emerald-400">{simulationResult.otd}%</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="w-full py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-purple-600/25 transition active:scale-95"
          >
            <Play className={`w-4 h-4 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Đang chạy mô phỏng 10,000 mẫu...' : 'Chạy mô phỏng đối chứng Monte Carlo'}</span>
          </button>
        </div>

      </div>

      {/* KernelSHAP Variance Attribution */}
      <div className="bg-[#0d1321] rounded-2xl border border-slate-800 p-4 space-y-3">
        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
          <h3 className="text-xs font-bold text-white flex items-center space-x-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>PHÂN RÃ PHƯƠNG SAI THÂM HỤT SẢN LƯỢNG (KERNELSHAP ATTRIBUTION)</span>
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">Lý thuyết trò chơi hợp tác Shapley</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {shapleyDecomp.map((sh, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-300 truncate pr-2">{sh.feature}</span>
                <span className={`font-mono font-bold ${sh.impact < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {sh.impact > 0 ? `+${sh.impact}%` : `${sh.impact}%`}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full ${sh.color} rounded-full`} style={{ width: `${Math.abs(sh.impact)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
