import React, { useState } from 'react';
import { 
  Smartphone, QrCode, AlertTriangle, Truck, Layers, Activity, 
  User, CheckCircle2, ChevronRight, Zap, RefreshCw, Barcode, 
  Sliders, Volume2, ShieldAlert, Cpu, Clock, MapPin, Check, X
} from 'lucide-react';
import { PlantMetric, EmergencyAction, OtdShipment } from '../../types';
import { soundManager } from '../../utils/audio';

interface MobileSystemSuiteProps {
  plants: PlantMetric[];
  actions: EmergencyAction[];
  shipments: OtdShipment[];
  onExecuteAction: (actionId: number) => void;
  onExitMobile: () => void;
}

export const MobileSystemSuite: React.FC<MobileSystemSuiteProps> = ({
  plants,
  actions,
  shipments,
  onExecuteAction,
  onExitMobile
}) => {
  const [mobileTab, setMobileTab] = useState<'home' | 'scanner' | 'alerts' | 'logistics' | 'station'>('home');
  const [isPhoneFrame, setIsPhoneFrame] = useState<boolean>(true);
  const [activeBarcode, setActiveBarcode] = useState<string>('WO-901-PCB-CAMERA-A980');
  const [scanQty, setScanQty] = useState<number>(50);
  const [scannedAlert, setScannedAlert] = useState<string | null>(null);
  const [scanHistory, setScanHistory] = useState<Array<{ id: number; code: string; qty: number; time: string }>>([
    { id: 1, code: 'WO-901-LOT-09', qty: 50, time: '14:12' },
    { id: 2, code: 'WO-901-LOT-08', qty: 50, time: '14:09' },
    { id: 3, code: 'WO-906-DAAL-INGOT', qty: 32, time: '13:55' },
  ]);

  const totalActual = plants.reduce((sum, p) => sum + p.actual, 0);
  const totalTarget = plants.reduce((sum, p) => sum + p.target, 0);
  const pendingActions = actions.filter(a => !a.executed);

  const handleMobileScan = () => {
    soundManager.playSuccess();
    const now = new Date().toTimeString().slice(0, 5);
    setScanHistory(prev => [
      { id: Date.now(), code: activeBarcode, qty: scanQty, time: now },
      ...prev
    ]);
    setScannedAlert(`✓ Đã nạp thành công +${scanQty} pcs vào trạm!`);
    setTimeout(() => setScannedAlert(null), 2500);
  };

  const content = (
    <div className="h-full w-full bg-[#070e1b] text-slate-100 flex flex-col justify-between overflow-hidden select-none font-sans">
      
      {/* 1. Mobile Status Header Bar */}
      <div className="bg-[#0d1321] px-4 pt-3 pb-2.5 border-b border-slate-800 shrink-0">
        <div className="flex justify-between items-center text-[11px] mb-1">
          <div className="flex items-center space-x-1.5 font-bold text-white">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>NEURAL LINK PRO MOBILE</span>
          </div>
          <div className="flex items-center space-x-1 font-mono text-[10px] text-emerald-400 bg-emerald-950/40 px-1.5 py-0.2 rounded border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>12ms GMES</span>
          </div>
        </div>

        <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
          <span>CA 1: 08:00 - 16:00</span>
          <span className="text-cyan-300 font-bold">75.6k / 105k (71.8%)</span>
        </div>
      </div>

      {/* 2. Mobile Dynamic Screen Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        
        {/* Toast Alert */}
        {scannedAlert && (
          <div className="bg-emerald-950 border border-emerald-500 text-emerald-200 text-xs px-3 py-2 rounded-xl text-center font-bold animate-in fade-in duration-150">
            {scannedAlert}
          </div>
        )}

        {/* TAB 1: TỔNG QUAN HIỆN TRƯỜNG (HOME) */}
        {mobileTab === 'home' && (
          <div className="space-y-3">
            {/* Top Critical Alert Banner */}
            <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-500/70 text-xs space-y-1">
              <div className="flex justify-between items-center font-bold text-red-300">
                <span className="flex items-center space-x-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                  <span>CẢNH BÁO P1: ĐỨT PHÔI DAAL</span>
                </span>
                <span className="bg-red-500 text-slate-950 text-[9px] px-1 rounded font-black">-w=0.82</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-tight">
                Thiếu 4,800 kg phôi nhôm A980 khiến cụm dập số 3 &amp; 4 dừng máy.
              </p>
              <button 
                onClick={() => onExecuteAction(1)}
                className="w-full mt-1 py-1.5 bg-red-500 hover:bg-red-400 text-slate-950 font-bold rounded-lg text-xs"
              >
                ⚡ Lệnh điều chuyển phôi K1 ngay
              </button>
            </div>

            {/* Quick Metrics 2x2 */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Sản lượng ca:</span>
                <span className="text-base font-bold font-mono text-cyan-300">{(totalActual/1000).toFixed(1)}k pcs</span>
                <span className="text-[9px] text-red-400 block">Hụt -{(totalTarget - totalActual).toLocaleString()}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Dự báo OTD:</span>
                <span className="text-base font-bold font-mono text-amber-400">68.0%</span>
                <span className="text-[9px] text-emerald-400 block">Sau AI: 98.5%</span>
              </div>
            </div>

            {/* 7 Plants Mobile List */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex justify-between">
                <span>7 Nhà máy vệ tinh</span>
                <span>OEE / Tỷ lệ</span>
              </div>

              {plants.map((plant) => (
                <div 
                  key={plant.id}
                  className={`p-2 rounded-xl border flex justify-between items-center text-xs transition ${
                    plant.status === 'critical' ? 'bg-red-950/20 border-red-500/60' :
                    plant.status === 'warning' ? 'bg-amber-950/20 border-amber-500/50' :
                    'bg-slate-900/80 border-slate-800'
                  }`}
                >
                  <div className="overflow-hidden pr-2">
                    <div className="flex items-center space-x-1.5">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${
                        plant.status === 'critical' ? 'bg-red-500 animate-ping' :
                        plant.status === 'warning' ? 'bg-amber-400' : 'bg-emerald-400'
                      }`} />
                      <span className="font-bold text-white truncate text-[11px]">{plant.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 truncate block pl-3.5">
                      ● {plant.statusText}
                    </span>
                  </div>

                  <div className="text-right shrink-0 font-mono">
                    <span className={`font-bold text-xs ${
                      plant.rate < 60 ? 'text-red-400' : plant.rate < 80 ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {plant.rate}%
                    </span>
                    <span className="text-[9px] text-slate-500 block">OEE: {plant.oee}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: QUÉT MÃ VẬT TƯ & SẢN LƯỢNG (SCANNER) */}
        {mobileTab === 'scanner' && (
          <div className="space-y-3 text-xs">
            {/* Viewfinder */}
            <div className="h-40 bg-slate-900 rounded-2xl border-2 border-dashed border-cyan-500/70 relative flex flex-col items-center justify-center overflow-hidden">
              <div className="w-full h-0.5 bg-red-500 shadow-md shadow-red-500 animate-pulse absolute" />
              <Barcode className="w-14 h-14 text-slate-600 mb-1" />
              <span className="text-[10px] font-mono text-cyan-300 bg-slate-950/90 px-2 py-0.5 rounded border border-cyan-500/40">
                {activeBarcode}
              </span>
            </div>

            {/* Quick Presets */}
            <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
              <button 
                onClick={() => setActiveBarcode('WO-901-PCB-CAMERA-A980')}
                className="p-1.5 bg-slate-900 border border-slate-800 rounded text-slate-300 hover:text-white truncate"
              >
                WO-901 Camera
              </button>
              <button 
                onClick={() => setActiveBarcode('WO-906-DAAL-INGOT-K1')}
                className="p-1.5 bg-slate-900 border border-slate-800 rounded text-slate-300 hover:text-white truncate"
              >
                WO-906 Phôi K1
              </button>
            </div>

            {/* Batch Counter */}
            <div className="flex justify-between items-center bg-slate-900 p-2 rounded-xl border border-slate-800">
              <span className="text-slate-400">Số lượng khay quét:</span>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setScanQty(prev => Math.max(10, prev - 10))}
                  className="w-7 h-7 rounded bg-slate-800 text-white font-bold"
                >
                  -
                </button>
                <span className="font-mono font-bold text-white text-sm w-10 text-center">{scanQty}</span>
                <button 
                  onClick={() => setScanQty(prev => prev + 10)}
                  className="w-7 h-7 rounded bg-slate-800 text-white font-bold"
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={handleMobileScan}
              className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-lg shadow-cyan-500/25 active:scale-95"
            >
              <QrCode className="w-4 h-4" />
              <span>XÁC NHẬN BẮT MÃ THÀNH PHẨM</span>
            </button>

            {/* Recent Scans */}
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Lịch sử quét vừa qua:</span>
              {scanHistory.slice(0, 3).map(item => (
                <div key={item.id} className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800 flex justify-between text-[11px] font-mono">
                  <span className="text-slate-300">{item.code}</span>
                  <span className="text-emerald-400 font-bold">+{item.qty} pcs ({item.time})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: ĐIỂM NGHẼN & CAN THIỆP P1 (ALERTS) */}
        {mobileTab === 'alerts' && (
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center text-slate-400 pb-1 border-b border-slate-800 text-[11px]">
              <span>6 Hành động khẩn cấp</span>
              <span className="text-red-400 font-bold">{pendingActions.length} Chờ xử lý</span>
            </div>

            <div className="space-y-2">
              {actions.map((act) => (
                <div 
                  key={act.id}
                  className={`p-2.5 rounded-xl border space-y-1.5 ${
                    act.executed ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className={`text-[9px] font-bold px-1 py-0.2 rounded font-mono ${
                      act.priority === 'Cao' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {act.priority}
                    </span>
                    {act.executed ? (
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center space-x-1">
                        <Check className="w-3 h-3" />
                        <span>Đã phát lệnh</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => onExecuteAction(act.id)}
                        className="px-2.5 py-1 bg-cyan-500 text-slate-950 font-bold rounded-lg text-[10px] shadow"
                      >
                        {act.actionBtn}
                      </button>
                    )}
                  </div>
                  <div className="font-bold text-white text-[11px] leading-tight">{act.title}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: GIAO HÀNG XE CONTAINER (LOGISTICS) */}
        {mobileTab === 'logistics' && (
          <div className="space-y-2.5 text-xs">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Chuyến xe Container Cảng Hải Phòng:</span>

            {shipments.map(sh => (
              <div 
                key={sh.id}
                className={`p-2.5 rounded-xl border space-y-1.5 ${
                  sh.status === 'critical' ? 'bg-red-950/25 border-red-500/60' : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="font-bold text-white font-mono text-sm">{sh.code}</div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                    sh.status === 'critical' ? 'bg-red-500 text-white animate-pulse' : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {sh.status === 'critical' ? 'NGUY CƠ TRỄ' : 'ON TRACK'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 truncate flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span className="truncate">{sh.destination}</span>
                </div>
                <div className="flex justify-between text-[11px] font-mono pt-1 border-t border-slate-800">
                  <span className="text-slate-300">{sh.readyQty.toLocaleString()} / {sh.plannedQty.toLocaleString()} pcs</span>
                  <span className="text-cyan-300">Xuất: {sh.departureTime}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 5: TRẠM MÁY & QUẢN TRỊ (STATION) */}
        {mobileTab === 'station' && (
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Quản trị đốc công hiện trường:</span>
              <div className="font-bold text-white text-sm">Ngô Thanh Tùng (Chief Architect)</div>
              <div className="text-[10px] text-cyan-400 font-mono">GMES Suite v4.2 PRO • ISO 9001:2015</div>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Cảm biến Spindle 04 KTECH:</span>
              <div className="flex justify-between text-[11px] font-mono">
                <span>Độ rung:</span>
                <span className="text-red-400 font-bold">4.35G (&gt; 3.5G)</span>
              </div>
              <div className="flex justify-between text-[11px] font-mono">
                <span>Nhiệt độ bạc đạn:</span>
                <span className="text-slate-200">68.2°C</span>
              </div>
            </div>

            <button
              onClick={onExitMobile}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition"
            >
              <X className="w-4 h-4" />
              <span>Quay lại giao diện Desktop Command Center</span>
            </button>
          </div>
        )}

      </div>

      {/* 3. Mobile Bottom Navigation Bar (5 Tabs) */}
      <nav className="h-14 bg-[#0d1321] border-t border-slate-800 px-2 flex justify-around items-center shrink-0">
        <button
          onClick={() => {
            soundManager.playClick();
            setMobileTab('home');
          }}
          className={`flex flex-col items-center space-y-0.5 text-[10px] transition ${
            mobileTab === 'home' ? 'text-cyan-400 font-bold' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Tổng quan</span>
        </button>

        <button
          onClick={() => {
            soundManager.playClick();
            setMobileTab('scanner');
          }}
          className={`flex flex-col items-center space-y-0.5 text-[10px] transition ${
            mobileTab === 'scanner' ? 'text-cyan-400 font-bold' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Quét mã</span>
        </button>

        <button
          onClick={() => {
            soundManager.playClick();
            setMobileTab('alerts');
          }}
          className={`flex flex-col items-center space-y-0.5 text-[10px] relative transition ${
            mobileTab === 'alerts' ? 'text-cyan-400 font-bold' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          {pendingActions.length > 0 && (
            <span className="absolute -top-1 right-2 w-2 h-2 rounded-full bg-red-500 animate-ping" />
          )}
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Cảnh báo</span>
        </button>

        <button
          onClick={() => {
            soundManager.playClick();
            setMobileTab('logistics');
          }}
          className={`flex flex-col items-center space-y-0.5 text-[10px] transition ${
            mobileTab === 'logistics' ? 'text-cyan-400 font-bold' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Giao hàng</span>
        </button>

        <button
          onClick={() => {
            soundManager.playClick();
            setMobileTab('station');
          }}
          className={`flex flex-col items-center space-y-0.5 text-[10px] transition ${
            mobileTab === 'station' ? 'text-cyan-400 font-bold' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Trạm máy</span>
        </button>
      </nav>

    </div>
  );

  return (
    <div className="space-y-4">
      {/* Top Mobile View Control Bar */}
      <div className="flex flex-wrap justify-between items-center bg-[#0d1321] p-3.5 rounded-2xl border border-slate-800 gap-3">
        <div className="flex items-center space-x-3 text-xs">
          <Smartphone className="w-5 h-5 text-cyan-400" />
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">HỆ THỐNG /</span>
              <h2 className="text-sm font-bold text-white">MÀN HÌNH HỆ MOBILE HANDHELD (VIEWPORT 390PX)</h2>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Giao diện di động chuyên dụng cho đốc công hiện trường, máy quét mã Zebra TC57 và điện thoại thông minh
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsPhoneFrame(!isPhoneFrame)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
          >
            {isPhoneFrame ? 'Mở rộng toàn màn hình' : 'Xem trong khung 390px (iPhone/Zebra)'}
          </button>

          <button
            onClick={onExitMobile}
            className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition shadow"
          >
            Trở lại Desktop Command Center
          </button>
        </div>
      </div>

      {/* Render Frame or Full Screen */}
      {isPhoneFrame ? (
        <div className="flex justify-center p-4">
          <div className="w-[390px] h-[720px] rounded-[48px] border-4 border-slate-700 shadow-2xl overflow-hidden relative bg-black">
            {content}
          </div>
        </div>
      ) : (
        <div className="h-[750px] w-full max-w-md mx-auto rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
          {content}
        </div>
      )}
    </div>
  );
};
