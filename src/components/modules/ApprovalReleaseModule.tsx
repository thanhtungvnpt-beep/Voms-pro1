import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, Lock, FileSignature, Check, AlertCircle } from 'lucide-react';
import { soundManager } from '../../utils/audio';

export const ApprovalReleaseModule: React.FC = () => {
  const [signed, setSigned] = useState(false);

  const releaseChecklist = [
    { title: 'Kiểm tra độ trễ Telemetry < 12ms', status: 'PASS (8.2ms)', pass: true },
    { title: 'Kiểm toán chuẩn IATF 16949 Section 8.5.1', status: 'PASS (Verified)', pass: true },
    { title: 'Xác thực 18 nút và 24 liên kết Causal DAG', status: 'PASS (Identifiable)', pass: true },
    { title: 'Tương thích 100% Google AI Studio Function Calling', status: 'PASS (3 Tools Validated)', pass: true },
    { title: 'Kiểm định chịu tải 10,000 runs Monte Carlo', status: 'PASS (98.4% Confidence)', pass: true },
  ];

  const handleSign = () => {
    soundManager.playSuccess();
    setSigned(true);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center bg-[#0d1321] p-4 rounded-2xl border border-slate-800 gap-3">
        <div className="flex items-center space-x-3 text-xs">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">DEVELOP /</span>
              <h2 className="text-sm font-bold text-white">APPROVAL &amp; RELEASE CENTER — PHÊ DUYỆT &amp; KÝ PHÁT HÀNH HỆ THỐNG</h2>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Quy trình kiểm định chất lượng phần mềm và ký duyệt phiên bản v4.2 PRO bởi Kiến trúc sư trưởng
            </p>
          </div>
        </div>

        <button
          onClick={handleSign}
          disabled={signed}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition ${
            signed 
              ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 cursor-default' 
              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 active:scale-95'
          }`}
        >
          {signed ? <Check className="w-4 h-4 text-emerald-400" /> : <FileSignature className="w-4 h-4" />}
          <span>{signed ? '✓ ĐÃ KÝ DUYỆT PHÁT HÀNH' : 'Ký duyệt phát hành phiên bản v4.2 PRO'}</span>
        </button>
      </div>

      {/* Checklist */}
      <div className="p-4 rounded-2xl bg-[#0b101d] border border-slate-800 space-y-3 text-xs">
        <h3 className="font-bold text-white pb-2 border-b border-slate-800">
          Danh mục kiểm thử &amp; nghiệm thu trước khi xuất xưởng (Pre-Release Checklist):
        </h3>

        <div className="space-y-2">
          {releaseChecklist.map((item, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-slate-200">{item.title}</span>
              </div>
              <span className="font-mono text-emerald-400 font-bold text-[11px] bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                {item.status}
              </span>
            </div>
          ))}
        </div>

        {/* Digital Signature Card */}
        <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Chữ ký điện tử xác nhận:</span>
            <span className="text-sm font-bold text-white font-mono mt-0.5 block">Ngô Thanh Tùng (Chief Architect)</span>
            <span className="text-[10px] text-cyan-400 font-mono">GMES-ENTERPRISE-v4.2-STABLE-20250624</span>
          </div>

          <div className="text-right">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
              signed ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300'
            }`}>
              {signed ? 'CHỨNG THỰC THÀNH CÔNG' : 'CHỜ KÝ DUYỆT'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
