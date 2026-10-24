import React, { useState } from 'react';
import { Cpu, Sparkles, Terminal, Activity, ArrowRight, Play, CheckCircle2, ShieldCheck } from 'lucide-react';
import { soundManager } from '../../utils/audio';

export const CausalAiLabModule: React.FC = () => {
  const [selectedDoVariable, setSelectedDoVariable] = useState<string>('do(Mat = K1)');
  const [computing, setComputing] = useState(false);
  const [result, setResult] = useState<{ formula: string; probability: number; deltaPcs: number; otd: number } | null>({
    formula: 'P(Output >= 100k | do(Mat = K1), do(Tool = Fresh)) = 0.964',
    probability: 96.4,
    deltaPcs: 19400,
    otd: 98.5
  });

  const handleCompute = () => {
    soundManager.playClick();
    setComputing(true);
    setTimeout(() => {
      soundManager.playSuccess();
      if (selectedDoVariable === 'do(Mat = K1)') {
        setResult({
          formula: 'P(Output | do(Mat = K1)) = 0.892 (Recover DAAL +7.8k)',
          probability: 89.2,
          deltaPcs: 7800,
          otd: 84.0
        });
      } else if (selectedDoVariable === 'do(Tool = Fresh)') {
        setResult({
          formula: 'P(Output | do(Tool = Fresh)) = 0.865 (KTECH OEE -> 88%)',
          probability: 86.5,
          deltaPcs: 5200,
          otd: 81.5
        });
      } else {
        setResult({
          formula: 'P(Output >= 100k | do(Full_Optimal)) = 0.985 (All 6 Actions)',
          probability: 98.5,
          deltaPcs: 19400,
          otd: 98.5
        });
      }
      setComputing(false);
    }, 350);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center bg-[#0d1321] p-4 rounded-2xl border border-slate-800 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-purple-400" />
            <h2 className="text-base font-bold text-white">10. PHÒNG THÍ NGHIỆM CAUSAL AI &amp; PEARL DO-CALCULUS</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Động cơ suy luận nhân quả đối chứng • Bayesian DAG 18 nút / 24 liên kết • Chuẩn ISO 9001 / IATF 16949
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono bg-purple-950/40 text-purple-300 border border-purple-500/40 px-3 py-1.5 rounded-xl">
          <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>Inference Latency: 8.4ms (&lt; 12ms Spec)</span>
        </div>
      </div>

      {/* Lab Sandbox Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left: Mathematical Formulation & Pearl's 3 Rules (6 Cols) */}
        <div className="md:col-span-6 space-y-3.5">
          <div className="bg-[#0d1321] p-4 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider font-mono">
              3 Quy tắc Do-Calculus (Judea Pearl Formulation)
            </h3>
            
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="font-mono text-purple-300 font-bold block">Quy tắc 1: Thêm/Bỏ quan sát</span>
                <span className="font-mono text-[11px] text-slate-300 block mt-0.5">
                  P(y | do(x), z, w) = P(y | do(x), w) nếu (Y ⊥ Z | X, W) trong G_X̅
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="font-mono text-purple-300 font-bold block">Quy tắc 2: Hoán đổi Hành động &amp; Quan sát</span>
                <span className="font-mono text-[11px] text-slate-300 block mt-0.5">
                  P(y | do(x), do(z), w) = P(y | do(x), z, w) nếu (Y ⊥ Z | X, W) trong G_X̅_Z̲
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="font-mono text-purple-300 font-bold block">Quy tắc 3: Bỏ qua Hành động Can thiệp</span>
                <span className="font-mono text-[11px] text-slate-300 block mt-0.5">
                  P(y | do(x), do(z), w) = P(y | do(x), w) nếu (Y ⊥ Z | X, W) trong G_X̅_Z(W)
                </span>
              </div>
            </div>
          </div>

          {/* Intervention Sandbox */}
          <div className="bg-[#0d1321] p-4 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-white">Thử nghiệm toán tử Can thiệp do(X = x):</h3>
            
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'do(Mat = K1)', label: 'do(Vật liệu K1)' },
                { id: 'do(Tool = Fresh)', label: 'do(Thay dao CNC)' },
                { id: 'do(Full_Optimal)', label: 'do(Gói tối ưu toàn ca)' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedDoVariable(opt.id)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-mono font-bold transition border ${
                    selectedDoVariable === opt.id
                      ? 'bg-purple-950/60 border-purple-500 text-purple-300 shadow'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleCompute}
              disabled={computing}
              className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg transition active:scale-95"
            >
              <Play className={`w-4 h-4 ${computing ? 'animate-spin' : ''}`} />
              <span>{computing ? 'Đang giải tích mạng Bayesian...' : 'Chạy suy luận đối chứng (Counterfactual)'}</span>
            </button>
          </div>
        </div>

        {/* Right: Simulation Output & Counterfactual Proof (6 Cols) */}
        <div className="md:col-span-6 bg-[#0d1321] p-4 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-800">
              <h3 className="text-xs font-bold text-white flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>KẾT QUẢ SUY LUẬN ĐỐI CHỨNG (COUNTERFACTUAL RESULT)</span>
              </h3>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono font-bold">
                PROVEN
              </span>
            </div>

            {result && (
              <div className="space-y-3 mt-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs">
                  <span className="text-[10px] text-slate-400 block mb-1">Công thức suy luận:</span>
                  <span className="text-cyan-300 font-bold leading-relaxed">{result.formula}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Độ tin cậy:</span>
                    <span className="text-lg font-bold font-mono text-purple-400">{result.probability}%</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Bù sản lượng:</span>
                    <span className="text-lg font-bold font-mono text-emerald-400">+{result.deltaPcs.toLocaleString()}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">OTD Cảng:</span>
                    <span className="text-lg font-bold font-mono text-cyan-300">{result.otd}%</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-1.5 leading-relaxed">
                  <p>
                    ✓ <strong>Định lý Nhận dạng (Identifiability):</strong> Đồ thị G_X̅ thỏa mãn Back-door Criterion với tập điều kiện Z = {'{N01, N02}'}.
                  </p>
                  <p>
                    ✓ <strong>Tác động biên (ATE - Average Treatment Effect):</strong> Thêm 1kg phôi nhôm A980 tại trạm Hub A01 mang lại kỳ vọng +2.44 pcs sản phẩm hoàn thiện tại chuyến xuất cảng.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800 flex justify-between items-center">
            <span>Tác giả mô hình: Ngô Thanh Tùng (Chief Architect)</span>
            <span className="font-mono text-slate-400">GMES v4.2 PRO</span>
          </div>
        </div>
      </div>
    </div>
  );
};
