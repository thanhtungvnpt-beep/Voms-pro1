import React, { useState } from 'react';
import { Eye, Code2, Layers, CheckCircle2, Copy, Check, Terminal } from 'lucide-react';
import { soundManager } from '../../utils/audio';

export const ScreenDesignDetailModule: React.FC = () => {
  const [selectedScreenId, setSelectedScreenId] = useState('M01');
  const [copied, setCopied] = useState(false);

  const screensMeta = {
    M01: {
      title: 'M01 — Tổng quan điều hành sản xuất toàn chuỗi (Command Center)',
      standard: 'ISO 9001 / IATF 16949 Compliant • Latency < 12ms',
      component: 'NeuralLinkControlCenter.tsx',
      props: 'plants: PlantMetric[], filterMode: string, actions: EmergencyAction[]',
      stateVars: 'plants (7), filterMode, activeModal, selectedLink, actions (6)'
    },
    M02: {
      title: 'M02 — Ma trận Gantt điều độ sản xuất (Gantt Matrix Scheduler)',
      standard: 'Autonomous Scheduling • Line Balancing • Critical Path',
      component: 'NeuralLinkGanttScheduler.tsx',
      props: 'workOrders: GanttWorkOrder[], timeView: shift|hourly',
      stateVars: 'selectedTimeView, selectedPlantFilter, showCriticalPath, smartActions'
    },
    M04: {
      title: 'M04 — Giao hàng & Ma trận OTD (Transfer Orders TO)',
      standard: 'Logistics Fleet Telemetry • Container Port Dispatch',
      component: 'NeuralLinkOTDManager.tsx',
      props: 'transferOrders: TransferOrder[], onRescueOrder: func',
      stateVars: 'filterStatus, transferOrders (4), activeTruck'
    },
    M10: {
      title: 'M10 — Phân tích Causal AI chuyên sâu (Pearl Do-Calculus Deep Dive)',
      standard: 'Bayesian DAG 18 Nodes / 24 Edges • KernelSHAP',
      component: 'NeuralLinkCausalDeepDive.tsx',
      props: 'dagNodes18: DagNode[], monteCarloRuns: 10000',
      stateVars: 'selectedIntervention, simulationResult, shapleyDecomp'
    }
  };

  const current = screensMeta[selectedScreenId as keyof typeof screensMeta] || screensMeta.M01;

  const handleCopySpec = () => {
    soundManager.playSuccess();
    navigator.clipboard.writeText(JSON.stringify(current, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center bg-[#0d1321] p-4 rounded-2xl border border-slate-800 gap-3">
        <div className="flex items-center space-x-3 text-xs">
          <Eye className="w-5 h-5 text-cyan-400" />
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">DEVELOP /</span>
              <h2 className="text-sm font-bold text-white">SCREEN DESIGN DETAIL — CHI TIẾT THIẾT KẾ &amp; MÃ ĐỊNH DANH MÀN HÌNH</h2>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Tra cứu thông số kỹ thuật, cấu trúc props, state hook và mã nguồn component
            </p>
          </div>
        </div>

        <button
          onClick={handleCopySpec}
          className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 flex items-center space-x-1.5 transition"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Đã chép' : 'Sao chép đặc tả'}</span>
        </button>
      </div>

      {/* Screen Selector Tabs */}
      <div className="flex space-x-2 text-xs">
        {['M01', 'M02', 'M04', 'M10'].map(code => (
          <button
            key={code}
            onClick={() => setSelectedScreenId(code)}
            className={`px-3 py-1.5 rounded-xl font-bold font-mono transition border ${
              selectedScreenId === code
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {code} Screen
          </button>
        ))}
      </div>

      {/* Detail Card */}
      <div className="p-4 rounded-2xl bg-[#0b101d] border border-slate-800 space-y-3 text-xs">
        <h3 className="text-sm font-bold text-white">{current.title}</h3>
        <div className="text-slate-400 text-[11px]">Tiêu chuẩn: <strong className="text-cyan-400">{current.standard}</strong></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono space-y-1">
            <span className="text-slate-500 text-[10px] block uppercase">Tên file Component (.tsx):</span>
            <span className="text-purple-300 font-bold">{current.component}</span>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono space-y-1">
            <span className="text-slate-500 text-[10px] block uppercase">Cấu trúc Props nhận vào:</span>
            <span className="text-emerald-300 font-bold">{current.props}</span>
          </div>
        </div>

        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono space-y-1">
          <span className="text-slate-500 text-[10px] block uppercase">Biến trạng thái chính (State Variables):</span>
          <span className="text-cyan-300">{current.stateVars}</span>
        </div>
      </div>
    </div>
  );
};
