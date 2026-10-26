import React, { useState, useMemo } from 'react';
import { 
  Zap, AlertTriangle, Cpu, CheckCircle2, ChevronRight, Activity, 
  TrendingUp, ShieldAlert, FileText, Check, Clock, Eye, AlertCircle,
  BarChart2, RefreshCw
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, LineChart, Line, XAxis, YAxis, 
  Tooltip, ReferenceLine, CartesianGrid, Legend 
} from 'recharts';
import { soundManager } from '../utils/audio';

interface AiInsightPanelProps {
  onTriggerAllInterventions: () => void;
  isAiIntervened: boolean;
  onSelectBottleneck: (nodeId: string) => void;
  selectedPlantId?: string;
  onSelectPlant?: (plantId: string) => void;
}

interface ComplianceNonConformity {
  id: string;
  standard: 'ISO 9001:2015' | 'IATF 16949:2016';
  clause: string;
  plantId: string;
  plantName: string;
  severity: 'minor_nc' | 'major_nc' | 'observation';
  title: string;
  description: string;
  dueTime: string;
  status: 'pending_documentation' | 'under_review' | 'resolved';
  requiredDocument: string;
  leadAuditor: string;
}

export const AiInsightPanel: React.FC<AiInsightPanelProps> = ({
  onTriggerAllInterventions,
  isAiIntervened,
  onSelectBottleneck,
  selectedPlantId,
  onSelectPlant
}) => {
  // Navigation tabs within AiInsightPanel
  const [activeTab, setActiveTab] = useState<'insights' | 'forecast' | 'compliance'>('insights');
  const [forecastPlantId, setForecastPlantId] = useState<string>(selectedPlantId || 'DAAL');
  const [selectedNc, setSelectedNc] = useState<ComplianceNonConformity | null>(null);

  // Synchronize plant selection if passed from parent
  React.useEffect(() => {
    if (selectedPlantId) {
      setForecastPlantId(selectedPlantId);
    }
  }, [selectedPlantId]);

  // ISO 9001 / IATF 16949 Compliance Alert Data
  const [complianceItems, setComplianceItems] = useState<ComplianceNonConformity[]>([
    {
      id: 'NC-2026-0482',
      standard: 'IATF 16949:2016',
      clause: 'Clause 8.5.1.1 (SOP & Control Plan Validation)',
      plantId: 'DAAL',
      plantName: 'DAAL Casting & Ingot',
      severity: 'major_nc',
      title: 'Báo cáo 8D khẩn cấp: Lỗ xốp phôi nhôm đúc A980',
      description: 'Phát hiện bọt khí vượt giới hạn tiêu chuẩn IATF Automotive Grade tại lô hàng A980-04. Cần bổ sung tài liệu 8D và hành động ngăn ngừa rủi ro đứt đoạn chuyền.',
      dueTime: 'Hôm nay 16:00 (còn 2h 45m)',
      status: 'pending_documentation',
      requiredDocument: '8D_Corrective_Action_Report_DAAL_Rev2.pdf',
      leadAuditor: 'TUV Rheinland / IATF Lead Auditor'
    },
    {
      id: 'NC-2026-0419',
      standard: 'ISO 9001:2015',
      clause: 'Clause 7.1.5 (Monitoring & Measuring Resources)',
      plantId: 'HOJEONG_VINA',
      plantName: 'HOJEONG VINA Laser',
      severity: 'minor_nc',
      title: 'Biên bản kiểm định quang học đầu Laser Trumpf',
      description: 'Lệch chuẩn quang học 0.12mm gây ra 140 linh kiện rework. Chứng chỉ hiệu chuẩn định kỳ trễ 48h so với lịch trình bảo trì phòng ngừa.',
      dueTime: 'Ngày mai 09:00',
      status: 'pending_documentation',
      requiredDocument: 'Calibration_Certificate_Trumpf_Optics_04.pdf',
      leadAuditor: 'Bureau Veritas ISO Auditor'
    },
    {
      id: 'OBS-2026-0391',
      standard: 'IATF 16949:2016',
      clause: 'Clause 8.5.1.5 (Total Productive Maintenance)',
      plantId: 'KTECH',
      plantName: 'KTECH High-Precision CNC',
      severity: 'observation',
      title: 'Nhật ký rung trục Spindle 04 & Lịch sử thay dao',
      description: 'Tần suất giám sát dao mòn Spindle 04 chưa được ghi nhận tự động vào hồ sơ thiết bị kỹ thuật số FMEA.',
      dueTime: '28/10/2026',
      status: 'under_review',
      requiredDocument: 'Spindle04_Vibration_Log_FMEA.xlsx',
      leadAuditor: 'Nội bộ VOMS QA Team'
    }
  ]);

  // Root Cause Insights
  const insights = [
    {
      id: 'DAAL',
      nodeId: 'N03',
      rank: '01',
      title: 'Thiếu vật liệu tại DAAL',
      weight: 'w = 0.82',
      color: 'red',
      desc: 'Lỗ hổng phôi nhôm A980 giảm 52% sản lượng trạm dập, đe dọa trực tiếp chuyến xe xuất cảng TO-3011.',
      remedy: 'Điều chuyển 3.2 tấn phôi từ Hub A01',
      ncBadge: 'IATF Major NC'
    },
    {
      id: 'KTECH',
      nodeId: 'N05',
      rank: '02',
      title: 'Dừng máy CNC tại KTECH',
      weight: 'w = 0.67',
      color: 'amber',
      desc: 'Mòn dao phay CNC trục Spindle 04 chưa thay kịp, dừng 45 phút ca sáng làm nghẽn tiến độ cơ khí.',
      remedy: 'Thay dao TiAlN & cân bằng trục',
      ncBadge: 'TPM Observation'
    },
    {
      id: 'HOJEONG_VINA',
      nodeId: 'N06',
      rank: '03',
      title: 'Tỷ lệ rework HOJEONG VINA',
      weight: 'w = 0.59',
      color: 'purple',
      desc: 'Lệch tọa độ hàn laser mạch dẫn DEF-01, 140 linh kiện cần tái gia công thủ công trạm N07.',
      remedy: 'Hiệu chuẩn quang học đầu laser Trumpf',
      ncBadge: 'ISO Minor NC'
    },
    {
      id: 'HSTEC',
      nodeId: 'N04',
      rank: '04',
      title: 'Thiếu nhân lực tại HSTEC',
      weight: 'w = 0.48',
      color: 'slate',
      desc: 'Vắng 12 thợ SMT ca 1 tại xưởng 2 khiến takt-time trượt từ 3.8s lên 6.4s.',
      remedy: 'Tăng viện 12 thợ bậc cao chuyền phụ'
    }
  ];

  // Plant Specifications for 24h Forecast Engine
  const plantSpecs: Record<string, { name: string; targetPerHour: number; baseOee: number; status: string; color: string }> = {
    KHV: { name: 'KHV SMT & Assembly', targetPerHour: 625, baseOee: 91.2, status: 'optimal', color: '#10b981' },
    DREAM_TECH: { name: 'DREAM TECH Precision', targetPerHour: 750, baseOee: 86.4, status: 'optimal', color: '#10b981' },
    HSTEC: { name: 'HSTEC Advanced SMT', targetPerHour: 665, baseOee: 79.1, status: 'warning', color: '#f59e0b' },
    KTECH: { name: 'KTECH High-Precision CNC', targetPerHour: 830, baseOee: 65.3, status: 'warning', color: '#f59e0b' },
    HOJEONGB: { name: 'HOJEONGB Electronics', targetPerHour: 645, baseOee: 93.8, status: 'optimal', color: '#10b981' },
    HOJEONG_VINA: { name: 'HOJEONG VINA Laser', targetPerHour: 750, baseOee: 80.2, status: 'warning', color: '#f59e0b' },
    DAAL: { name: 'DAAL Heavy Casting', targetPerHour: 750, baseOee: isAiIntervened ? 88.5 : 51.4, status: isAiIntervened ? 'optimal' : 'critical', color: isAiIntervened ? '#10b981' : '#ef4444' }
  };

  // Generate 24-hour predictive forecast trend based on current OEE and throughput
  const forecastData = useMemo(() => {
    const spec = plantSpecs[forecastPlantId] || plantSpecs.DAAL;
    const targetRate = spec.targetPerHour;
    const currentOee = isAiIntervened ? Math.min(94, spec.baseOee + 18) : spec.baseOee;
    const baseThroughput = Math.round(targetRate * (currentOee / 100));

    const hours = [];
    const now = new Date();
    const currentHour = now.getHours();

    for (let i = 1; i <= 24; i++) {
      const forecastHour = (currentHour + i) % 24;
      const hourLabel = `${forecastHour.toString().padStart(2, '0')}:00`;

      // Simulating shift cyclicality and degradation or recovery
      // Ca 1 (06:00 - 14:00), Ca 2 (14:00 - 22:00), Ca 3 (22:00 - 06:00)
      let shiftEfficiency = 1.0;
      if (forecastHour >= 22 || forecastHour < 6) {
        shiftEfficiency = 0.94; // Night shift fatigue factor
      } else if (forecastHour >= 12 && forecastHour <= 14) {
        shiftEfficiency = 0.92; // Shift handover & lunch window
      } else if (forecastHour >= 8 && forecastHour <= 11) {
        shiftEfficiency = 1.05; // Peak operational velocity
      }

      // If AI intervention is active, progressive recovery slope
      const recoveryMultiplier = isAiIntervened 
        ? Math.min(1.04, 1.0 + (i * 0.008))
        : (spec.status === 'critical' ? Math.max(0.72, 1.0 - (i * 0.012)) : 1.0);

      const predictedThroughput = Math.round(baseThroughput * shiftEfficiency * recoveryMultiplier);
      const upperConfidence = Math.round(predictedThroughput * 1.06);
      const lowerConfidence = Math.round(predictedThroughput * 0.94);

      hours.push({
        hour: hourLabel,
        step: `H+${i}`,
        target: targetRate,
        predicted: predictedThroughput,
        upperConfidence,
        lowerConfidence,
        oeeTrend: Math.min(99, Math.round(currentOee * shiftEfficiency * recoveryMultiplier * 10) / 10),
        deficit: Math.max(0, targetRate - predictedThroughput)
      });
    }

    return hours;
  }, [forecastPlantId, isAiIntervened]);

  // Aggregate 24-hour totals
  const totalForecastOutput = useMemo(() => {
    return forecastData.reduce((acc, curr) => acc + curr.predicted, 0);
  }, [forecastData]);

  const totalForecastTarget = useMemo(() => {
    return forecastData.reduce((acc, curr) => acc + curr.target, 0);
  }, [forecastData]);

  const forecastDeficit = totalForecastTarget - totalForecastOutput;

  // Handle documentation sign-off for ISO / IATF
  const handleSignOffDocumentation = (ncId: string) => {
    soundManager.playSuccess();
    setComplianceItems(prev => prev.map(item => {
      if (item.id === ncId) {
        return {
          ...item,
          status: 'resolved'
        };
      }
      return item;
    }));
    setSelectedNc(null);
  };

  const pendingNcCount = complianceItems.filter(i => i.status !== 'resolved').length;

  return (
    <div className="bg-[#0d1321] rounded-2xl border border-slate-800 p-4 flex flex-col justify-between h-full shadow-xl">
      <div className="space-y-3">
        {/* Header with 3 Tab Switcher */}
        <div className="flex flex-col space-y-2 pb-2.5 border-b border-slate-800">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-white flex items-center space-x-2 font-mono">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>AI INSIGHT & ĐIỀU HÀNH</span>
            </h3>
            <div className="flex items-center space-x-1.5">
              {pendingNcCount > 0 && (
                <span className="text-[10px] bg-red-500/20 text-red-300 border border-red-500/30 px-1.5 py-0.5 rounded font-mono font-bold flex items-center space-x-1 animate-pulse">
                  <AlertCircle className="w-3 h-3 text-red-400" />
                  <span>{pendingNcCount} NC</span>
                </span>
              )}
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-1.5 py-0.5 rounded font-mono font-bold">
                LIVE ML
              </span>
            </div>
          </div>

          {/* Sub-Tabs: Root Causes • 24h Forecast • ISO/IATF Compliance */}
          <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[10px] font-mono font-bold">
            <button
              onClick={() => { soundManager.playClick(); setActiveTab('insights'); }}
              className={`py-1.5 rounded-lg transition flex items-center justify-center space-x-1 ${
                activeTab === 'insights'
                  ? 'bg-slate-800 text-cyan-400 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="w-3 h-3" />
              <span>Gốc rễ</span>
            </button>

            <button
              onClick={() => { soundManager.playClick(); setActiveTab('forecast'); }}
              className={`py-1.5 rounded-lg transition flex items-center justify-center space-x-1 ${
                activeTab === 'forecast'
                  ? 'bg-slate-800 text-cyan-400 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingUp className="w-3 h-3" />
              <span>Dự báo 24h</span>
            </button>

            <button
              onClick={() => { soundManager.playClick(); setActiveTab('compliance'); }}
              className={`py-1.5 rounded-lg transition flex items-center justify-center space-x-1 relative ${
                activeTab === 'compliance'
                  ? 'bg-slate-800 text-cyan-400 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldAlert className="w-3 h-3 text-amber-400" />
              <span>ISO/IATF</span>
              {pendingNcCount > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 absolute top-1 right-1" />
              )}
            </button>
          </div>
        </div>

        {/* Real-time Compliance Alert Banner (Always Visible on Insight/Forecast tabs if pending) */}
        {activeTab !== 'compliance' && pendingNcCount > 0 && (
          <div 
            onClick={() => { soundManager.playClick(); setActiveTab('compliance'); }}
            className="p-2 rounded-xl bg-gradient-to-r from-red-950/40 to-amber-950/30 border border-red-500/40 flex items-center justify-between cursor-pointer hover:border-red-400 transition"
          >
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-3.5 h-3.5 text-red-400 animate-pulse flex-shrink-0" />
              <div className="text-[11px] font-mono leading-tight">
                <span className="font-bold text-red-300">CẢNH BÁO IATF/ISO: </span>
                <span className="text-slate-300">{complianceItems[0].title}</span>
              </div>
            </div>
            <div className="flex items-center space-x-1 text-[10px] font-mono text-amber-300 font-bold flex-shrink-0 ml-1">
              <span>Hồ sơ NC</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>
        )}

        {/* TAB 1: ROOT CAUSES INSIGHT FEED */}
        {activeTab === 'insights' && (
          <div className="space-y-2 overflow-y-auto max-h-[300px] pr-1">
            {insights.map((item) => {
              const isRed = item.color === 'red';
              const isAmber = item.color === 'amber';
              const isPurple = item.color === 'purple';

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    soundManager.playClick();
                    onSelectBottleneck(item.nodeId);
                    setForecastPlantId(item.id);
                  }}
                  className={`p-2.5 rounded-xl border transition cursor-pointer hover:scale-[1.01] ${
                    isRed
                      ? 'bg-red-950/25 border-red-500/40 hover:border-red-400'
                      : isAmber
                      ? 'bg-amber-950/20 border-amber-500/40 hover:border-amber-400'
                      : isPurple
                      ? 'bg-purple-950/20 border-purple-500/40 hover:border-purple-400'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-xs font-bold font-mono ${
                      isRed ? 'text-red-300' : isAmber ? 'text-amber-300' : isPurple ? 'text-purple-300' : 'text-slate-300'
                    }`}>
                      {item.rank}. {item.title}
                    </span>
                    <div className="flex items-center space-x-1">
                      {item.ncBadge && (
                        <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-red-950 text-red-300 border border-red-500/40">
                          {item.ncBadge}
                        </span>
                      )}
                      <span className={`text-[10px] font-mono font-black px-1.5 py-0.2 rounded ${
                        isRed ? 'bg-red-500/25 text-red-300' : isAmber ? 'bg-amber-500/25 text-amber-300' : isPurple ? 'bg-purple-500/25 text-purple-300' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {item.weight}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-snug">
                    {item.desc}
                  </p>

                  <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/60 font-mono">
                    <span className="text-cyan-400 font-medium">↳ {item.remedy}</span>
                    <ChevronRight className="w-3 h-3 text-slate-500" />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: 24-HOUR PREDICTIVE FORECAST TREND USING RECHARTS */}
        {activeTab === 'forecast' && (
          <div className="space-y-3">
            {/* Plant Selector */}
            <div className="flex items-center justify-between bg-slate-950 p-1.5 rounded-xl border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 font-bold px-1 uppercase">Nhà máy:</span>
              <select
                value={forecastPlantId}
                onChange={(e) => {
                  soundManager.playClick();
                  setForecastPlantId(e.target.value);
                  if (onSelectPlant) onSelectPlant(e.target.value);
                }}
                className="bg-slate-900 border border-slate-700 text-white text-xs font-mono rounded-lg px-2 py-1 outline-none focus:border-cyan-500"
              >
                {Object.keys(plantSpecs).map(pid => (
                  <option key={pid} value={pid}>
                    {pid} — {plantSpecs[pid].name} ({plantSpecs[pid].baseOee}%)
                  </option>
                ))}
              </select>
            </div>

            {/* Forecast Summary Metrics Card */}
            <div className="grid grid-cols-3 gap-2 bg-slate-950/80 p-2 rounded-xl border border-slate-800 text-center font-mono">
              <div>
                <div className="text-[9px] text-slate-500 uppercase">Dự báo 24h</div>
                <div className="text-xs font-bold text-cyan-400">
                  {totalForecastOutput.toLocaleString()} pcs
                </div>
              </div>
              <div>
                <div className="text-[9px] text-slate-500 uppercase">Kế hoạch 24h</div>
                <div className="text-xs font-bold text-slate-300">
                  {totalForecastTarget.toLocaleString()} pcs
                </div>
              </div>
              <div>
                <div className="text-[9px] text-slate-500 uppercase">Chênh lệch</div>
                <div className={`text-xs font-bold ${forecastDeficit > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {forecastDeficit > 0 ? `-${forecastDeficit.toLocaleString()}` : `+${Math.abs(forecastDeficit).toLocaleString()}`}
                </div>
              </div>
            </div>

            {/* Recharts 24-Hour Forecast Curve */}
            <div className="h-[185px] w-full bg-slate-950/60 rounded-xl border border-slate-800/80 p-1.5 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecastData} margin={{ top: 8, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="forecastAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={isAiIntervened ? '#10b981' : '#06b6d4'} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={isAiIntervened ? '#10b981' : '#06b6d4'} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 4" stroke="#1e293b" />
                  <XAxis 
                    dataKey="hour" 
                    stroke="#64748b" 
                    fontSize={9} 
                    tickLine={false}
                    interval={3}
                  />
                  <YAxis 
                    stroke="#64748b" 
                    fontSize={9} 
                    domain={['dataMin - 100', 'dataMax + 100']} 
                    tickLine={false}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload || !payload.length) return null;
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 border border-slate-700 rounded-lg p-2 font-mono text-[10px] shadow-xl space-y-1">
                          <div className="font-bold text-white border-b border-slate-800 pb-0.5">
                            {data.step} ({data.hour})
                          </div>
                          <div className="text-cyan-400">
                            Dự báo: <span className="font-bold">{data.predicted} pcs/h</span>
                          </div>
                          <div className="text-slate-400">
                            Mục tiêu: <span className="font-bold text-slate-200">{data.target} pcs/h</span>
                          </div>
                          <div className="text-amber-400">
                            OEE dự tính: <span className="font-bold">{data.oeeTrend}%</span>
                          </div>
                          {data.deficit > 0 && (
                            <div className="text-red-400">
                              Hụt: -{data.deficit} pcs
                            </div>
                          )}
                        </div>
                      );
                    }}
                  />
                  <ReferenceLine 
                    y={plantSpecs[forecastPlantId]?.targetPerHour || 750} 
                    stroke="#ef4444" 
                    strokeDasharray="3 3" 
                    label={{ value: 'Target', fill: '#ef4444', fontSize: 9, position: 'insideTopRight' }} 
                  />
                  <Area
                    type="monotone"
                    dataKey="predicted"
                    stroke={isAiIntervened ? '#10b981' : '#06b6d4'}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#forecastAreaGrad)"
                    name="Sản lượng dự báo"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <p className="text-[9px] text-slate-500 italic font-mono text-center">
              * Dựa trên OEE thực tế, độ mòn dao CNC và phân bổ nhịp ca 24h.
            </p>
          </div>
        )}

        {/* TAB 3: ISO 9001 / IATF 16949 COMPLIANCE & NON-CONFORMITY FEED */}
        {activeTab === 'compliance' && (
          <div className="space-y-2.5 overflow-y-auto max-h-[300px] pr-1 font-mono">
            {/* Standard Compliance Scorecards */}
            <div className="grid grid-cols-2 gap-2 text-center text-[10px]">
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-slate-400">ISO 9001:2015</div>
                <div className="text-xs font-bold text-emerald-400">98.4% ĐẠT</div>
                <div className="text-[9px] text-slate-500">1 Điểm cần cải tiến</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-950 border border-red-500/40 bg-red-950/20">
                <div className="text-red-300 font-bold">IATF 16949:2016</div>
                <div className="text-xs font-bold text-amber-400">91.8% CẢNH BÁO</div>
                <div className="text-[9px] text-red-400 font-bold">1 Major NC chờ ký số</div>
              </div>
            </div>

            {/* List of Pending Non-Conformity Documents */}
            <div className="space-y-2">
              {complianceItems.map((nc) => {
                const isResolved = nc.status === 'resolved';
                return (
                  <div
                    key={nc.id}
                    className={`p-2.5 rounded-xl border text-[11px] transition ${
                      isResolved
                        ? 'bg-slate-950/40 border-slate-800 opacity-60'
                        : nc.severity === 'major_nc'
                        ? 'bg-red-950/30 border-red-500/50'
                        : 'bg-amber-950/25 border-amber-500/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-1.5">
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                          nc.standard.includes('IATF') ? 'bg-purple-950 text-purple-300 border-purple-500/40' : 'bg-blue-950 text-blue-300 border-blue-500/40'
                        }`}>
                          {nc.standard}
                        </span>
                        <span className="font-bold text-white text-xs">{nc.id}</span>
                      </div>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                        isResolved ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' : 'bg-red-950 text-red-300 border border-red-500/40'
                      }`}>
                        {isResolved ? 'ĐÃ PHÊ DUYỆT' : 'CHỜ HỒ SƠ'}
                      </span>
                    </div>

                    <div className="text-slate-200 font-bold text-xs">{nc.title}</div>
                    <p className="text-slate-400 text-[10px] mt-1 leading-snug">{nc.description}</p>

                    <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                      <div className="flex items-center space-x-1 text-slate-400">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>Hạn: {nc.dueTime}</span>
                      </div>

                      {!isResolved ? (
                        <button
                          onClick={() => handleSignOffDocumentation(nc.id)}
                          className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center space-x-1 text-[10px] transition"
                        >
                          <Check className="w-3 h-3" />
                          <span>Ký duyệt số hồ sơ</span>
                        </button>
                      ) : (
                        <span className="text-emerald-400 flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Hồ sơ đã hợp lệ</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Action Footer (All Chain Interventions) */}
      <div className="pt-2">
        <button
          onClick={() => {
            soundManager.playSuccess();
            onTriggerAllInterventions();
          }}
          disabled={isAiIntervened}
          className={`w-full py-2.5 rounded-xl text-xs font-bold font-mono flex items-center justify-center space-x-2 shadow-lg transition active:scale-95 ${
            isAiIntervened
              ? 'bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 cursor-default'
              : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-cyan-500/20'
          }`}
        >
          {isAiIntervened ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Hệ thống đang phục hồi toàn chuỗi (+17,600 pcs)</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>Can thiệp tự động toàn chuỗi (6 Điểm nghẽn)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
