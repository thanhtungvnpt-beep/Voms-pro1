import React, { useState } from 'react';
import { 
  QrCode, Smartphone, CheckCircle2, RefreshCw, Barcode, 
  Send, AlertTriangle, ArrowRight, Layers, Volume2 
} from 'lucide-react';
import { soundManager } from '../../utils/audio';

export const MobileHandheldScanner: React.FC = () => {
  const [stationId, setStationId] = useState('STATION-SMT-01');
  const [scannedCode, setScannedCode] = useState('WO-901-PCB-CAMERA-A980');
  const [batchCount, setBatchCount] = useState(50);
  const [scanLogs, setScanLogs] = useState<Array<{ id: number; time: string; code: string; qty: number; status: string }>>([
    { id: 1, time: '14:10:22', code: 'WO-901-LOT-09', qty: 50, status: 'PASSED (12ms Sync)' },
    { id: 2, time: '14:08:45', code: 'WO-901-LOT-08', qty: 50, status: 'PASSED (12ms Sync)' },
    { id: 3, time: '14:05:12', code: 'WO-903-LOT-02', qty: 40, status: 'AOI WARN (Rework N07)' },
  ]);
  const [isScanning, setIsScanning] = useState(false);

  const handleSimulateScan = () => {
    soundManager.playSuccess();
    setIsScanning(true);
    setTimeout(() => {
      const now = new Date().toTimeString().split(' ')[0];
      setScanLogs(prev => [
        {
          id: prev.length + 1,
          time: now,
          code: scannedCode,
          qty: batchCount,
          status: 'PASSED (12ms Sync)'
        },
        ...prev
      ]);
      setIsScanning(false);
    }, 300);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center bg-[#0d1321] p-4 rounded-2xl border border-slate-800 gap-3">
        <div className="flex items-center space-x-3 text-xs">
          <Smartphone className="w-5 h-5 text-cyan-400" />
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">OPERATIONS /</span>
              <h2 className="text-sm font-bold text-white">03. SẢN LƯỢNG THỰC TẾ — MOBILE HANDHELD SCANNER (390PX)</h2>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Thiết bị cầm tay chuyên dụng quét mã QR/Barcode và ghi nhận sản lượng tại hiện trường xưởng sản xuất
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1 rounded-xl">
          <span>● Zebra TC57 Handheld Online</span>
        </div>
      </div>

      {/* Main Container: Mobile Frame Emulation (390px) + Live Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Mobile Device Mockup Frame (390px viewport) */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-[390px] bg-slate-950 rounded-[40px] border-4 border-slate-700 shadow-2xl p-4 flex flex-col space-y-3.5 relative overflow-hidden">
            {/* Speaker & Camera notch */}
            <div className="w-32 h-4 bg-slate-800 rounded-full mx-auto mb-1 shrink-0" />

            {/* Handheld App Header */}
            <div className="flex justify-between items-center pb-2 border-b border-slate-800 shrink-0">
              <div className="flex items-center space-x-1.5">
                <QrCode className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-xs text-white">GMES SCAN v4.2</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono">12ms Sync</span>
            </div>

            {/* Selected Station */}
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <span className="text-[10px] text-slate-400 block">Trạm kiểm soát hiện trường:</span>
              <select
                value={stationId}
                onChange={e => setStationId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-white text-xs mt-1"
              >
                <option value="STATION-SMT-01">KHV • Chuyền SMT 01 (Outfeed)</option>
                <option value="STATION-DIECAST-01">DAAL • Trạm Đúc Khuôn Nhôm 01</option>
                <option value="STATION-CNC-04">KTECH • Trạm Phay CNC Spindle 04</option>
                <option value="STATION-LASER-02">HOJEONG VINA • Hàn Laser Quang Học</option>
              </select>
            </div>

            {/* Barcode Scanner Viewport Simulation */}
            <div className="h-44 bg-slate-900 rounded-2xl border-2 border-dashed border-cyan-500/60 relative flex flex-col items-center justify-center overflow-hidden">
              <div className="w-full h-0.5 bg-red-500 shadow-lg shadow-red-500 animate-pulse absolute" />
              <Barcode className="w-16 h-16 text-slate-600 mb-1" />
              <span className="text-[10px] font-mono text-cyan-400 bg-slate-950/80 px-2 py-0.5 rounded border border-cyan-500/40">
                {scannedCode}
              </span>
            </div>

            {/* Batch Counter Input */}
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-400 shrink-0">Sản lượng khay:</span>
              <input
                type="number"
                value={batchCount}
                onChange={e => setBatchCount(Number(e.target.value))}
                className="w-20 bg-slate-900 border border-slate-700 rounded p-1 text-center font-mono font-bold text-white text-xs"
              />
              <span className="text-slate-500 text-[10px]">PCS / Khay</span>
            </div>

            {/* Scan Button */}
            <button
              onClick={handleSimulateScan}
              disabled={isScanning}
              className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/20 active:scale-95 transition shrink-0"
            >
              <QrCode className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Đang xác thực mã barcode...' : 'BẤM QUÉT XÁC NHẬN SẢN LƯỢNG'}</span>
            </button>

            {/* Home indicator bar */}
            <div className="w-24 h-1 bg-slate-600 rounded-full mx-auto mt-auto shrink-0" />
          </div>
        </div>

        {/* Right: Live Telemetry Feeds from Handheld Scanners (7 Cols) */}
        <div className="lg:col-span-7 bg-[#0b101d] rounded-2xl border border-slate-800 p-4 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold text-white flex items-center space-x-2">
                <RefreshCw className="w-4 h-4 text-cyan-400" />
                <span>NHẬT KÝ QUÉT BẮT MÃ THỜI GIAN THỰC (LIVE SCAN LOGS)</span>
              </h3>
              <span className="text-[10px] text-emerald-400 font-mono">Đồng bộ tức thời &lt; 12ms</span>
            </div>

            <div className="space-y-2 mt-3 overflow-y-auto max-h-[360px] pr-1">
              {scanLogs.map((log) => (
                <div key={log.id} className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex justify-between items-center text-xs">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-cyan-400 font-bold">{log.code}</span>
                      <span className="text-slate-400 text-[10px]">[{log.time}]</span>
                    </div>
                    <div className="text-[10px] text-emerald-400 mt-0.5">
                      ✓ {log.status}
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <span className="text-sm font-bold text-white">+{log.qty} pcs</span>
                    <span className="text-[10px] text-slate-500 block">Lũy kế trạm</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-400">
            <span>Thiết bị đã kết nối: 14 máy quét di động Zebra TC57</span>
            <span className="text-cyan-400 font-bold">100% Sẵn sàng</span>
          </div>
        </div>

      </div>
    </div>
  );
};
