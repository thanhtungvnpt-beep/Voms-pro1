import React from 'react';
import { FileText, Monitor, CheckCircle2, Layers, Cpu, Activity, Truck } from 'lucide-react';

interface ScreenLibraryModuleProps {
  onNavigateTab: (tabId: string) => void;
}

export const ScreenLibraryModule: React.FC<ScreenLibraryModuleProps> = ({
  onNavigateTab
}) => {
  const screens = [
    { id: 'overview', title: '01. Sơ đồ Nhân Quả & Tổng quan điều hành', type: 'Executive Dashboard', desc: 'Mạng DAG 18 nút / 24 liên kết, hạt photon animateMotion, Shapley variance' },
    { id: 'planning', title: '02. Kế hoạch sản xuất & Lệnh gá', type: 'VOMS Operations', desc: 'Bảng theo dõi kế hoạch 7 nhà máy, takt-time, khóa lệnh gá khuôn' },
    { id: 'delivery', title: '04. Giao hàng & Xuất container cảng Hải Phòng', type: 'Logistics', desc: 'Theo dõi 4 chuyến xe TO, ETA cảng Tân Vũ / Lạch Huyện, tránh phạt $18,500' },
    { id: 'quality', title: '05. Quản lý chất lượng OQC & Trạm Rework', type: 'Quality Assurance', desc: 'Bảng lỗi DPMO, DEF-01 laser micro-deviation, DEF-02 bavia CNC' },
    { id: 'workforce', title: '06. Quản trị nhân lực & Thợ SMT', type: 'HR Operations', desc: 'Điều phối 721 công nhân, giải cứu thiếu 12 thợ SMT tại HSTEC xưởng 2' },
    { id: 'equipment', title: '07. Thiết bị trọng yếu TPM & OEE', type: 'Predictive Maintenance', desc: 'Cảm biến rung Spindle 04 KTECH (>4.2G), nhiệt độ vòng bi, thay dao CNC' },
    { id: 'warehouse', title: '08. Kho vật liệu phôi Hub A01', type: 'Supply Chain', desc: 'Kho phôi nhôm A980, đồng cuộn C1100, hạt nhựa ABS-FR500' },
    { id: 'causal_ai', title: '10. Causal AI & Pearl Do-Calculus Sandbox', type: 'Deep AI Lab', desc: '3 quy tắc Do-Calculus, Bayesian DAG inference, ATE treatment effect' },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-[#0d1321] p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold text-white">SCREEN LIBRARY — THƯ VIỆN GIAO DIỆN HỆ THỐNG GMES v4.2 PRO</h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Tác giả: Ngô Thanh Tùng • Tuân thủ chuẩn thiết kế Dark Cybernetics &amp; ISO 9001 / IATF 16949
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {screens.map((sc) => (
          <div
            key={sc.id}
            onClick={() => onNavigateTab(sc.id)}
            className="p-4 rounded-2xl border border-slate-800 bg-[#0d1321] hover:border-cyan-500/60 hover:scale-[1.02] cursor-pointer transition space-y-2 flex flex-col justify-between group"
          >
            <div>
              <div className="flex justify-between items-center text-[10px] text-cyan-400 font-mono mb-1">
                <span>{sc.type}</span>
                <Monitor className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400" />
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition">
                {sc.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                {sc.desc}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex justify-between items-center text-[10px] text-slate-500 group-hover:text-cyan-400 font-bold">
              <span>Mở màn hình này</span>
              <span>→</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
