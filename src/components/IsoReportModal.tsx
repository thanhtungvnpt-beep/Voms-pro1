import React, { useState } from 'react';
import { X, FileDown, Copy, Check, Printer, FileText } from 'lucide-react';
import { PlantMetric, EmergencyAction } from '../types';
import { generateIsoShiftReport } from '../utils/exportReport';
import { soundManager } from '../utils/audio';

interface IsoReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  plants: PlantMetric[];
  actions: EmergencyAction[];
}

export const IsoReportModal: React.FC<IsoReportModalProps> = ({
  isOpen,
  onClose,
  plants,
  actions
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const reportText = generateIsoShiftReport(plants, actions);

  const handleCopy = () => {
    soundManager.playSuccess();
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    soundManager.playClick();
    const blob = new Blob([reportText], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ISO_9001_IATF16949_SHIFT_REPORT_${Date.now()}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    soundManager.playClick();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-[#0d1321] border-2 border-emerald-500/80 rounded-2xl p-6 shadow-2xl relative text-slate-100 space-y-4 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                BÁO CÁO ĐIỀU HÀNH SẢN XUẤT ISO 9001 / IATF 16949
              </h3>
              <p className="text-xs text-slate-400">
                Phê duyệt bởi Kiến trúc sư trưởng: Ngô Thanh Tùng • GMES Causal AI v4.2
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 flex items-center space-x-1.5 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Đã chép' : 'Sao chép'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold flex items-center space-x-1.5 transition shadow"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Tải file .MD</span>
            </button>

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
        </div>

        {/* Content Box */}
        <div className="flex-1 overflow-y-auto bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs leading-relaxed text-slate-300 whitespace-pre-wrap select-text">
          {reportText}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-800 shrink-0">
          <span>Chuẩn kiểm tra: IATF 16949 Mục 8.5.1 &amp; ISO 9001:2015</span>
          <span className="text-emerald-400 font-mono font-bold">100% Sẵn sàng nộp kiểm toán nhà máy</span>
        </div>

      </div>
    </div>
  );
};
