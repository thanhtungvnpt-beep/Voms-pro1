import React from 'react';
import { 
  Terminal, Monitor, Smartphone, CheckCircle2, ShieldCheck, 
  Code2, Database, Cpu, ArrowRight, Layers, FileCode 
} from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface DevelopHomeModuleProps {
  onNavigateTab: (tabId: string) => void;
}

export const DevelopHomeModule: React.FC<DevelopHomeModuleProps> = ({
  onNavigateTab
}) => {
  const developScreens = [
    { id: 'screen_library', title: 'Screen Library', desc: 'Thư viện toàn bộ 18 màn hình hệ thống GMES v4.2 PRO (Desktop & Mobile)' },
    { id: 'screen_design_detail', title: 'Screen Design Detail', desc: 'Môi trường kiểm tra chi tiết thiết kế UI/UX, mã định danh và thông số kỹ thuật' },
    { id: 'test_center', title: 'Test Center (QA Center)', desc: 'Trung tâm kiểm thử tải tự động, tiêm giả lập sự cố (Chaos Engineering) & đo kiểm độ trễ 12ms' },
    { id: 'approval_release', title: 'Approval & Release Center', desc: 'Quy trình ký duyệt phát hành phiên bản, chữ ký điện tử ISO 9001 của Kiến trúc sư trưởng' },
    { id: 'test_data_factory', title: 'Test Data Factory', desc: 'Công cụ sinh dữ liệu giả lập sản lượng và kịch bản bất thường phục vụ huấn luyện Causal AI' },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center bg-[#0d1321] p-4 rounded-2xl border border-slate-800 gap-3">
        <div className="flex items-center space-x-3 text-xs">
          <Terminal className="w-5 h-5 text-cyan-400" />
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">DEVELOP /</span>
              <h2 className="text-sm font-bold text-white">DEVELOP HOME (PC &amp; MOBILE 390PX ARCHITECTURE)</h2>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Cổng quản trị dành riêng cho kỹ sư hệ thống, kiểm thử QA và điều phối phát hành GMES Suite
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400">
          <span>Tác giả: Ngô Thanh Tùng (Chief Architect)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {developScreens.map(sc => (
          <div
            key={sc.id}
            onClick={() => {
              soundManager.playClick();
              onNavigateTab(sc.id);
            }}
            className="p-4 rounded-2xl border border-slate-800 bg-[#0b101d] hover:border-cyan-500/60 transition cursor-pointer hover:scale-[1.02] flex flex-col justify-between group space-y-3"
          >
            <div>
              <div className="flex justify-between items-center text-xs text-cyan-400 font-mono mb-1">
                <span>DEVELOP MODULE</span>
                <Monitor className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition" />
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition">{sc.title}</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{sc.desc}</p>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex justify-between items-center text-[11px] text-slate-500 group-hover:text-cyan-400 font-bold">
              <span>Mở phân hệ này</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
