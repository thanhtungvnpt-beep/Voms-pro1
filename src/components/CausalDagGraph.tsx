import React, { useState } from 'react';
import { 
  AlertTriangle, Filter, X, Zap, ChevronRight, 
  Maximize2, ArrowRight, Eye, RefreshCw, Sparkles 
} from 'lucide-react';
import { CausalNode, CausalLink } from '../types';
import { soundManager } from '../utils/audio';

interface CausalDagGraphProps {
  nodes: CausalNode[];
  links: CausalLink[];
  filterMode: 'all' | 'adverse';
  onSetFilterMode: (mode: 'all' | 'adverse') => void;
  selectedLink: CausalLink | null;
  onSelectLink: (link: CausalLink | null) => void;
  onOpenHourlyModal: () => void;
  onExecuteLinkAction: (actionId: number) => void;
  totalActual: number;
  totalDeficit: number;
}

export const CausalDagGraph: React.FC<CausalDagGraphProps> = ({
  nodes,
  links,
  filterMode,
  onSetFilterMode,
  selectedLink,
  onSelectLink,
  onOpenHourlyModal,
  onExecuteLinkAction,
  totalActual,
  totalDeficit
}) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const handleLinkClick = (link: CausalLink) => {
    soundManager.playClick();
    onSelectLink(link);
  };

  const handleCoreNodeClick = () => {
    soundManager.playClick();
    onOpenHourlyModal();
  };

  return (
    <div className="bg-[#0b101d] rounded-2xl border border-slate-800/90 p-4 flex flex-col relative overflow-hidden h-full">
      {/* Graph Header */}
      <div className="flex flex-wrap justify-between items-center z-10 mb-2 gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <h2 className="text-sm font-bold text-white tracking-wide">
              SƠ ĐỒ NHÂN QUẢ ẢNH HƯỞNG ĐẾN SẢN LƯỢNG (CAUSAL NETWORK)
            </h2>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Mối quan hệ định lượng giữa Kế hoạch ➔ Kho vật liệu ➔ Thiết bị ➔ Sản lượng ➔ Giao hàng OTD
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center space-x-2">
          <div className="flex rounded-lg bg-slate-900 border border-slate-800 p-0.5 text-xs">
            <button
              onClick={() => {
                soundManager.playClick();
                onSetFilterMode('all');
              }}
              className={`px-2.5 py-1 rounded-md transition font-medium ${
                filterMode === 'all'
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Toàn Group
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                onSetFilterMode('adverse');
              }}
              className={`px-2.5 py-1 rounded-md transition font-medium ${
                filterMode === 'adverse'
                  ? 'bg-red-500/25 text-red-300 font-bold border border-red-500/50 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Luồng bất lợi (w &gt; 0.5)
            </button>
          </div>
        </div>
      </div>

      {/* Interactive SVG Canvas Area */}
      <div className="relative flex-1 w-full rounded-xl bg-[#070e1b]/80 border border-slate-800/70 overflow-hidden min-h-[350px]">
        {/* Background Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#38bdf8 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />

        {/* SVG Drawing Layer */}
        <svg className="w-full h-full absolute inset-0 z-0">
          <defs>
            {/* Glow Filter Cyan */}
            <filter id="glow-cyan" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#06b6d4" />
            </filter>
            {/* Glow Filter Red */}
            <filter id="glow-red" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#ef4444" />
            </filter>
            {/* Glow Filter Amber */}
            <filter id="glow-amber" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#f59e0b" />
            </filter>

            {/* Linear Gradients */}
            <linearGradient id="grad-r06" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#dc2626" stopOpacity="0.7" />
            </linearGradient>
            <linearGradient id="grad-r08" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#ea580c" stopOpacity="0.7" />
            </linearGradient>
            <linearGradient id="grad-cyan" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.7" />
            </linearGradient>
          </defs>

          {/* Render All Causal Links */}
          {links.map((link) => {
            const isSelected = selectedLink?.id === link.id;
            const isAdverse = link.isNegative;
            const isDimmed = filterMode === 'adverse' && !isAdverse;
            
            const strokeColor = link.id === 'R06' ? '#ef4444' :
                                link.id === 'R08' ? '#f59e0b' :
                                link.id === 'R04' ? '#a855f7' :
                                link.id === 'R_OUT' ? '#ef4444' :
                                link.id === 'R07' ? '#10b981' : '#38bdf8';
            
            const strokeWidth = isSelected ? 4.5 : (link.weight * 3.5);
            const dashArray = link.isNegative ? '6,4' : undefined;

            return (
              <g key={link.id} opacity={isDimmed ? 0.15 : 1} className="transition-opacity duration-300">
                {/* Thick clickable hit area */}
                <path
                  d={link.path}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="20"
                  className="cursor-pointer"
                  onClick={() => handleLinkClick(link)}
                />

                {/* Visible Animated Path */}
                <path
                  id={`link-path-${link.id}`}
                  d={link.path}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={dashArray}
                  filter={isSelected ? (isAdverse ? 'url(#glow-red)' : 'url(#glow-cyan)') : undefined}
                  className="cursor-pointer hover:stroke-white transition-all"
                  onClick={() => handleLinkClick(link)}
                />

                {/* Traveling Photon Particle Pulse */}
                {!isDimmed && (
                  <circle
                    r={isSelected ? 5 : 3.5}
                    fill="#ffffff"
                    filter={isAdverse ? 'url(#glow-red)' : 'url(#glow-cyan)'}
                  >
                    <animateMotion
                      dur={link.isNegative ? '1.8s' : '2.6s'}
                      repeatCount="indefinite"
                      path={link.path}
                    />
                  </circle>
                )}

                {/* Weight Tag on Link */}
                <text
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="bold"
                  fill={strokeColor}
                  opacity={isDimmed ? 0 : 0.85}
                  className="pointer-events-none select-none"
                >
                  <textPath href={`#link-path-${link.id}`} startOffset="50%">
                    {link.id} (w={link.weight})
                  </textPath>
                </text>
              </g>
            );
          })}
        </svg>

        {/* DOM HTML NODES OVERLAY */}
        {/* Node N01: Kế hoạch */}
        <div 
          onMouseEnter={() => setHoveredNode('N01')}
          onMouseLeave={() => setHoveredNode(null)}
          className="absolute left-4 top-4 w-44 p-2.5 rounded-xl bg-[#0f172a]/95 border border-cyan-500/40 shadow-lg text-xs z-10 transition hover:border-cyan-400 hover:scale-105"
        >
          <div className="flex justify-between items-center text-cyan-400 font-bold mb-0.5">
            <span className="font-mono">N01 • KẾ HOẠCH</span>
            <span className="text-[10px] text-slate-400 font-mono">w=0.71</span>
          </div>
          <div className="text-[11px] text-slate-200 font-medium">105,000 pcs (Ca 1)</div>
          <div className="text-[10px] text-amber-400">Đổi lệnh gá 2 nhà máy</div>
        </div>

        {/* Node N02: Prebuild Buffer */}
        <div 
          onMouseEnter={() => setHoveredNode('N02')}
          onMouseLeave={() => setHoveredNode(null)}
          className="absolute left-4 top-[95px] w-44 p-2.5 rounded-xl bg-[#0f172a]/95 border border-emerald-500/40 shadow-lg text-xs z-10 transition hover:border-emerald-400 hover:scale-105"
        >
          <div className="flex justify-between items-center text-emerald-400 font-bold mb-0.5">
            <span className="font-mono">N02 • PREBUILD</span>
            <span className="text-[10px] text-emerald-300 font-mono">+w=0.63</span>
          </div>
          <div className="text-[11px] text-slate-200">Đệm DAAL hụt 4.2k pcs</div>
          <div className="text-[10px] text-emerald-400">KHV & Dream Tech an toàn</div>
        </div>

        {/* Node N03: Kho vật liệu Hub A01 (CRITICAL P1) */}
        <div 
          onClick={() => {
            const link = links.find(l => l.id === 'R06');
            if (link) handleLinkClick(link);
          }}
          onMouseEnter={() => setHoveredNode('N03')}
          onMouseLeave={() => setHoveredNode(null)}
          className="absolute left-4 top-[180px] w-48 p-2.5 rounded-xl bg-[#1e111a]/95 border-2 border-red-500 shadow-xl shadow-red-500/25 text-xs z-10 cursor-pointer transition hover:scale-105"
        >
          <div className="flex justify-between items-center text-red-400 font-black mb-0.5">
            <span className="flex items-center space-x-1 font-mono">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>N03 • KHO VẬT LIỆU</span>
            </span>
            <span className="bg-red-500/25 text-red-300 px-1 py-0.2 rounded font-mono font-bold">-w=0.82</span>
          </div>
          <div className="text-[11px] text-white font-bold">Đứt phôi nhôm A980 (P1)</div>
          <div className="text-[10px] text-red-400">Thâm hụt 4,800 kg tại Hub A01</div>
        </div>

        {/* Node N04: Nhân lực SMT */}
        <div 
          onClick={() => {
            const link = links.find(l => l.id === 'R04');
            if (link) handleLinkClick(link);
          }}
          onMouseEnter={() => setHoveredNode('N04')}
          onMouseLeave={() => setHoveredNode(null)}
          className="absolute left-4 top-[265px] w-44 p-2.5 rounded-xl bg-[#1a1228]/95 border border-purple-500/60 shadow-lg text-xs z-10 cursor-pointer transition hover:border-purple-400 hover:scale-105"
        >
          <div className="flex justify-between items-center text-purple-400 font-bold mb-0.5">
            <span className="font-mono">N04 • NHÂN LỰC</span>
            <span className="text-[10px] text-purple-300 font-mono">-w=0.48</span>
          </div>
          <div className="text-[11px] text-slate-200">Thiếu 12 thợ SMT HSTEC</div>
          <div className="text-[10px] text-purple-400">Takt-time trượt lên 6.4s</div>
        </div>

        {/* Node N05: Thiết bị OEE */}
        <div 
          onClick={() => {
            const link = links.find(l => l.id === 'R08');
            if (link) handleLinkClick(link);
          }}
          onMouseEnter={() => setHoveredNode('N05')}
          onMouseLeave={() => setHoveredNode(null)}
          className="absolute left-4 top-[350px] w-44 p-2.5 rounded-xl bg-[#1c1917]/95 border border-amber-500/80 shadow-lg text-xs z-10 cursor-pointer transition hover:border-amber-400 hover:scale-105"
        >
          <div className="flex justify-between items-center text-amber-400 font-bold mb-0.5">
            <span className="font-mono">N05 • THIẾT BỊ TPM</span>
            <span className="text-[10px] text-amber-300 font-mono">-w=0.67</span>
          </div>
          <div className="text-[11px] text-slate-200">Mòn dao CNC KTECH</div>
          <div className="text-[10px] text-amber-400">Spindle 04 rung 4.35G</div>
        </div>

        {/* CORE CENTER NODE: N08 SẢN LƯỢNG THỰC TẾ */}
        <div
          onClick={handleCoreNodeClick}
          className="absolute left-[480px] top-[140px] w-56 p-3.5 rounded-2xl bg-gradient-to-br from-[#0c1b33] to-[#071326] border-2 border-cyan-400 shadow-2xl shadow-cyan-500/30 text-xs z-20 cursor-pointer hover:border-white hover:scale-105 transition"
        >
          <div className="flex justify-between items-center text-cyan-300 font-black mb-1">
            <span className="flex items-center space-x-1.5 font-mono">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <span>SẢN LƯỢNG THỰC TẾ</span>
            </span>
            <span className="text-[9px] bg-cyan-500/25 px-1.5 py-0.5 rounded text-cyan-300 font-bold">CORE N08</span>
          </div>

          <div className="text-2xl font-black font-mono text-white tracking-tight">
            {totalActual.toLocaleString()} <span className="text-xs font-normal text-slate-400">pcs</span>
          </div>

          <div className="flex justify-between text-[11px] mt-1.5 text-slate-300">
            <span>Tiến độ ca:</span>
            <span className="font-bold font-mono text-amber-400">
              {((totalActual / 105000) * 100).toFixed(1)}%
            </span>
          </div>

          <div className="flex justify-between text-[11px] text-red-400 font-bold">
            <span>Thâm hụt toàn chuỗi:</span>
            <span className="font-mono">-{totalDeficit.toLocaleString()} pcs</span>
          </div>

          <div className="mt-2 text-[10px] text-center text-cyan-400 font-semibold bg-cyan-950/70 py-1 px-2 rounded-md border border-cyan-800/60 hover:bg-cyan-900 transition flex items-center justify-center space-x-1">
            <span>🔍 Nhấp xem Hourly Trend Drill-down</span>
          </div>
        </div>

        {/* Node N09: Giao hàng OTD */}
        <div 
          onClick={() => {
            const link = links.find(l => l.id === 'R_OUT');
            if (link) handleLinkClick(link);
          }}
          onMouseEnter={() => setHoveredNode('N09')}
          onMouseLeave={() => setHoveredNode(null)}
          className="absolute right-4 top-[100px] w-48 p-2.5 rounded-xl bg-[#1f1315]/95 border-2 border-red-500 shadow-xl shadow-red-500/20 text-xs z-10 cursor-pointer transition hover:scale-105"
        >
          <div className="flex justify-between items-center text-red-400 font-black mb-0.5">
            <span className="font-mono">N09 • GIAO HÀNG (OTD)</span>
            <span className="bg-red-500 text-white text-[9px] px-1 py-0.2 rounded font-bold">RISK 68%</span>
          </div>
          <div className="text-[11px] text-slate-200 font-semibold">Trễ xe TO-3011 (-4.2k pcs)</div>
          <div className="text-[10px] text-red-400">Cảng Tân Vũ nguy cơ cao</div>
        </div>

        {/* Node N10: Yếu tố ngoại lai */}
        <div 
          onMouseEnter={() => setHoveredNode('N10')}
          onMouseLeave={() => setHoveredNode(null)}
          className="absolute right-4 top-[250px] w-44 p-2.5 rounded-xl bg-[#0f172a]/95 border border-slate-700 shadow-lg text-xs z-10 transition hover:border-slate-500"
        >
          <div className="flex justify-between items-center text-slate-300 font-bold mb-0.5">
            <span className="font-mono">N10 • NGOẠI LAI</span>
            <span className="text-[10px] text-emerald-400 font-mono">w=0.35</span>
          </div>
          <div className="text-[11px] text-slate-200">Điện áp 221.4V ổn định</div>
          <div className="text-[10px] text-slate-400">Cầu Bạch Đằng thông thoáng</div>
        </div>

        {/* POPOVER INSPECTOR FOR CLICKED LINK */}
        {selectedLink && (
          <div className="absolute left-[240px] top-[140px] w-80 p-3.5 bg-slate-900/98 border-2 border-cyan-400 rounded-2xl shadow-2xl z-30 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-cyan-400 font-mono">
                  LINK {selectedLink.id}: CAUSAL INSPECTOR
                </span>
              </div>
              <button
                onClick={() => onSelectLink(null)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 py-2.5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Liên kết:</span>
                <span className="font-bold text-white font-mono">
                  {selectedLink.from} ➔ {selectedLink.to}
                </span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span>Trọng số nhân quả (w):</span>
                <span className="font-mono font-bold text-red-400">
                  {selectedLink.weight} (p &lt; {selectedLink.pValue})
                </span>
              </div>

              <div className="p-2 rounded-lg bg-cyan-950/40 border border-cyan-800/50">
                <div className="text-[10px] text-cyan-400 font-semibold mb-0.5">Pearl Do-Calculus Formulation:</div>
                <div className="font-mono text-cyan-200 text-[11px] font-bold">
                  {selectedLink.formula}
                </div>
              </div>

              <p className="text-[11px] text-slate-300 leading-snug">
                {selectedLink.description}
              </p>

              <div className="text-[11px] text-amber-400 font-medium bg-amber-950/20 p-1.5 rounded border border-amber-800/40">
                ⚠ Chiếm {selectedLink.impactPct}% tổng phương sai tác động rủi ro chuỗi
              </div>
            </div>

            {selectedLink.actionPayload?.actionId && (
              <button
                onClick={() => {
                  soundManager.playSuccess();
                  onExecuteLinkAction(selectedLink.actionPayload.actionId);
                  onSelectLink(null);
                }}
                className="w-full mt-1 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-lg shadow-cyan-500/20 transition active:scale-95"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>⚡ KHỞI ĐỘNG CAN THIỆP NGAY</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Graph Sub-footer Info */}
      <div className="flex flex-wrap justify-between items-center text-[11px] text-slate-400 pt-2.5 px-1 gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <span>
            Độ tin cậy Causal AI: <strong className="text-cyan-400 font-mono">96.4%</strong>
          </span>
          <span>
            Độ trễ suy luận: <strong className="text-emerald-400 font-mono">&lt; 12ms</strong>
          </span>
          <span>
            Số nút lệch chuẩn: <strong className="text-red-400 font-mono">3 / 10 Nút</strong>
          </span>
        </div>
        <div className="text-slate-500 text-[10px] font-mono">
          Algorithm: Pearl Do-Calculus &amp; Bayesian DAG v4.2 • ISO 9001
        </div>
      </div>
    </div>
  );
};
