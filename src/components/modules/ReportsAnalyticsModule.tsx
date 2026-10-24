import React, { useState } from 'react';
import { FileText, Download, Printer, CheckCircle2, ShieldCheck, Share2, Copy, Check } from 'lucide-react';
import { soundManager } from '../../utils/audio';

export const ReportsAnalyticsModule: React.FC = () => {
  const [selectedShift, setSelectedShift] = useState('SHIFT-01-20250624');
  const [copied, setCopied] = useState(false);

  const reportData = {
    totalPlanned: 105000,
    totalActual: 75600,
    variance: -29400,
    oeeAvg: 80.8,
    otdPredicted: 68.0,
    afterAiOtd: 98.5,
    topBottleneck: 'N03_MATERIAL (Đứt phôi nhôm A980 tại DAAL)',
    auditorSign: 'Ngô Thanh Tùng (Chief Architect)'
  };

  const handleCopySummary = () => {
    soundManager.playSuccess();
    navigator.clipboard.writeText(`BÁO CÁO CA SẢN XUẤT GMES v4.2 PRO (ISO 9001 / IATF 16949)
Ca: 08:00 - 16:00 | Ngày: 2025-06-24
Sản lượng: 75,600 / 105,000 pcs (71.8%)
Thâm hụt: -29,400 pcs
OEE Toàn chuỗi: 80.8%
OTD Dự báo: 68.0% -> Phục hồi 98.5% sau can thiệp AI
Phê duyệt: Ngô Thanh Tùng (Chief Architect)`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadReport = () => {
    soundManager.playClick();
    const element = document.createElement("a");
    const file = new Blob([JSON.stringify(reportData, null, 2)], {type: 'application/json'});
    element.href = URL.createObjectURL(file);
    element.download = `ISO_REPORT_${Date.now()}.json`;
    document.body.appendChild(element);
    element.click();
    element.remove();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center bg-[#0d1321] p-4 rounded-2xl border border-slate-800 gap-3">
        <div className="flex items-center space-x-3 text-xs">
          <FileText className="w-5 h-5 text-cyan-400" />
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">OPERATIONS /</span>
              <h2 className="text-sm font-bold text-white">11. BÁO CÁO &amp; PHÂN TÍCH ĐỘNG LỰC SẢN XUẤT (ISO 9001 / IATF 16949)</h2>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Hệ thống tạo biên bản điều hành ca tự động, đối soát chất lượng và xuất kiểm toán nhà máy
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopySummary}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 flex items-center space-x-1.5 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Đã sao chép' : 'Sao chép tóm tắt'}</span>
          </button>

          <button
            onClick={handleDownloadReport}
            className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition shadow"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất báo cáo .JSON</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Sản lượng ca 1</span>
          <span className="text-2xl font-black font-mono text-cyan-300 mt-1 block">75,600 pcs</span>
          <span className="text-[10px] text-slate-500">Định mức: 105,000 pcs (71.8%)</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">OEE Trung bình</span>
          <span className="text-2xl font-black font-mono text-white mt-1 block">80.8%</span>
          <span className="text-[10px] text-emerald-400">Đạt chuẩn ISO &gt; 80%</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Tỷ lệ OTD Xuất Cảng</span>
          <span className="text-2xl font-black font-mono text-amber-400 mt-1 block">68.0%</span>
          <span className="text-[10px] text-emerald-400">Phục hồi 98.5% với AI</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Ký duyệt kiểm toán</span>
          <span className="text-sm font-bold text-emerald-400 mt-2 block">✓ ĐÃ KÝ DUYỆT</span>
          <span className="text-[10px] text-slate-400">Ngô Thanh Tùng (Chief Architect)</span>
        </div>
      </div>
    </div>
  );
};
