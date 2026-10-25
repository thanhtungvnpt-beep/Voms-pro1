import React, { useState } from 'react';
import { 
  INITIAL_PLANTS, CAUSAL_NODES, CAUSAL_LINKS, INITIAL_EMERGENCY_ACTIONS, 
  HOURLY_TRENDS, OTD_SHIPMENTS 
} from './data/initialData';
import { 
  PlantMetric, CausalNode, CausalLink, EmergencyAction, 
  HourlyDataPoint, OtdShipment 
} from './types';
import { soundManager } from './utils/audio';

// Components
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { PlantKpiBar } from './components/PlantKpiBar';
import { CausalDagGraph } from './components/CausalDagGraph';
import { AiInsightPanel } from './components/AiInsightPanel';
import { DriverAnalysisCard } from './components/DriverAnalysisCard';
import { ForecastSimulationCard } from './components/ForecastSimulationCard';
import { EmergencyActionsCard } from './components/EmergencyActionsCard';

// Modals
import { HourlyTrendModal } from './components/HourlyTrendModal';
import { PlantDetailModal } from './components/PlantDetailModal';
import { IsoReportModal } from './components/IsoReportModal';
import { AiDiagnosticsModal } from './components/AiDiagnosticsModal';

// Dedicated Modules - Operations
import { NeuralLinkGanttScheduler } from './components/modules/NeuralLinkGanttScheduler';
import { MobileHandheldScanner } from './components/modules/MobileHandheldScanner';
import { MobileSystemSuite } from './components/mobile/MobileSystemSuite';
import { NeuralLinkOTDManager } from './components/modules/NeuralLinkOTDManager';
import { QualityOqcModule } from './components/modules/QualityOqcModule';
import { WorkforceModule } from './components/modules/WorkforceModule';
import { EquipmentOeeModule } from './components/modules/EquipmentOeeModule';
import { MaterialWarehouseModule } from './components/modules/MaterialWarehouseModule';
import { PrebuildReworkModule } from './components/modules/PrebuildReworkModule';
import { NeuralLinkCausalDeepDive } from './components/modules/NeuralLinkCausalDeepDive';
import { ReportsAnalyticsModule } from './components/modules/ReportsAnalyticsModule';
import { SystemSettingsModule } from './components/modules/SystemSettingsModule';

// Phase 1 Trust Foundation Modules
import { DataTrustCenterModule } from './components/modules/DataTrustCenterModule';
import { AuditLogApprovalModule } from './components/modules/AuditLogApprovalModule';

// Phase 3 AI Control Tower & Human-in-the-Loop Gateway
import { AiControlTowerModule } from './components/modules/AiControlTowerModule';

// Phase 4 Intelligent Automation, API/RPA Integration & Workflow Orchestration
import { AutomationControlModule } from './components/modules/AutomationControlModule';

// Phase 5 Operational Intelligence & Closed-Loop Optimization
import { OperationalIntelligenceModule } from './components/modules/OperationalIntelligenceModule';

// Dedicated Modules - Develop
import { DevelopHomeModule } from './components/modules/DevelopHomeModule';
import { ScreenLibraryModule } from './components/modules/ScreenLibraryModule';
import { ScreenDesignDetailModule } from './components/modules/ScreenDesignDetailModule';
import { TestCenterModule } from './components/modules/TestCenterModule';
import { ApprovalReleaseModule } from './components/modules/ApprovalReleaseModule';
import { TestDataFactoryModule } from './components/modules/TestDataFactoryModule';

export default function App() {
  // Primary States
  const [plants, setPlants] = useState<PlantMetric[]>(INITIAL_PLANTS);
  const [nodes, setNodes] = useState<CausalNode[]>(CAUSAL_NODES);
  const [links, setLinks] = useState<CausalLink[]>(CAUSAL_LINKS);
  const [actions, setActions] = useState<EmergencyAction[]>(INITIAL_EMERGENCY_ACTIONS);
  const [hourlyData, setHourlyData] = useState<HourlyDataPoint[]>(HOURLY_TRENDS);
  const [shipments, setShipments] = useState<OtdShipment[]>(OTD_SHIPMENTS);

  // Navigation & Filtering
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [filterMode, setFilterMode] = useState<'all' | 'adverse'>('all');
  const [selectedLink, setSelectedLink] = useState<CausalLink | null>(null);
  const [selectedPlant, setSelectedPlant] = useState<PlantMetric | null>(null);

  // Modals
  const [isHourlyModalOpen, setIsHourlyModalOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isAiDiagnosticsModalOpen, setIsAiDiagnosticsModalOpen] = useState<boolean>(false);

  // Simulation Status
  const [isAiIntervened, setIsAiIntervened] = useState<boolean>(false);
  const [isMobileMode, setIsMobileMode] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Navigation listener for cross-module deep-linking
  React.useEffect(() => {
    const handleNavigateTab = (e: any) => {
      if (e.detail) {
        soundManager.playClick();
        setCurrentTab(e.detail);
      }
    };
    window.addEventListener('voms-navigate-tab', handleNavigateTab);
    return () => window.removeEventListener('voms-navigate-tab', handleNavigateTab);
  }, []);

  // Derived Totals
  const totalActual = plants.reduce((sum, p) => sum + p.actual, 0);
  const totalTarget = plants.reduce((sum, p) => sum + p.target, 0);
  const totalDeficit = Math.max(0, totalTarget - totalActual);
  const adverseCount = links.filter(l => l.isNegative).length;

  // Single Action Execution Handler
  const handleExecuteAction = (actionId: number) => {
    soundManager.playSuccess();
    setActions(prev => prev.map(a => a.id === actionId ? { ...a, executed: true, executedAt: new Date().toTimeString().split(' ')[0] } : a));

    if (actionId === 1) {
      setPlants(prev => prev.map(p => p.id === 'DAAL' ? {
        ...p,
        actual: 15400,
        rate: 85,
        oee: 84.5,
        status: 'optimal',
        statusText: 'Đã cấp bù phôi nhôm K1'
      } : p));

      setShipments(prev => prev.map(s => s.code === 'TO-3011' ? {
        ...s,
        readyQty: 17800,
        status: 'on_track'
      } : s));
    } else if (actionId === 2) {
      setPlants(prev => prev.map(p => p.id === 'KTECH' ? {
        ...p,
        actual: 17500,
        rate: 87,
        oee: 88.2,
        status: 'optimal',
        statusText: 'Đã thay dao phay TiAlN'
      } : p));
    } else if (actionId === 3) {
      setPlants(prev => prev.map(p => p.id === 'HOJEONG_VINA' ? {
        ...p,
        actual: 16200,
        rate: 90,
        oee: 89.0,
        status: 'optimal',
        statusText: 'Laser đã cân chuẩn 0.00mm'
      } : p));
    } else if (actionId === 4) {
      setPlants(prev => prev.map(p => p.id === 'HSTEC' ? {
        ...p,
        actual: 15200,
        rate: 95,
        oee: 92.4,
        status: 'optimal',
        statusText: 'Đã tăng viện 12 thợ SMT'
      } : p));
    } else if (actionId === 5) {
      setPlants(prev => prev.map(p => p.id === 'DREAM_TECH' ? {
        ...p,
        actual: 15800,
        rate: 88,
        oee: 91.0,
        status: 'optimal',
        statusText: 'Khóa lệnh gá chuẩn'
      } : p));
    } else if (actionId === 6) {
      setPlants(prev => prev.map(p => p.id === 'HOJEONGB' ? {
        ...p,
        actual: 15200,
        rate: 98,
        oee: 96.5,
        status: 'optimal',
        statusText: 'Tăng tốc 12% thành công'
      } : p));
    }
  };

  // Execute All Interventions
  const handleTriggerAllInterventions = () => {
    soundManager.playSuccess();
    setIsAiIntervened(true);

    setActions(prev => prev.map(a => ({
      ...a,
      executed: true,
      executedAt: new Date().toTimeString().split(' ')[0]
    })));

    setPlants([
      { ...plants[0], actual: 14500, rate: 96, oee: 94.0, status: 'optimal', statusText: 'Tối ưu tuyệt đối' },
      { ...plants[1], actual: 16200, rate: 90, oee: 91.5, status: 'optimal', statusText: 'Đã khóa lệnh gá khuôn' },
      { ...plants[2], actual: 15200, rate: 95, oee: 92.0, status: 'optimal', statusText: 'Đã bù đủ 12 thợ SMT' },
      { ...plants[3], actual: 18200, rate: 91, oee: 89.5, status: 'optimal', statusText: 'Đã thay dao Spindle 04' },
      { ...plants[4], actual: 15200, rate: 98, oee: 96.5, status: 'optimal', statusText: 'Vượt nhịp 104%' },
      { ...plants[5], actual: 16800, rate: 93, oee: 91.2, status: 'optimal', statusText: 'Laser đã cân chuẩn' },
      { ...plants[6], actual: 16500, rate: 92, oee: 88.0, status: 'optimal', statusText: 'Phôi A980 đã cập bến DAAL' },
    ]);

    setShipments(prev => prev.map(s => ({
      ...s,
      readyQty: s.plannedQty,
      status: 'on_track'
    })));

    setHourlyData(prev => prev.map(h => h.future ? {
      ...h,
      actual: 15200,
      reason: 'Đạt đỉnh sau can thiệp AI: +17,600 pcs'
    } : h));
  };

  const handleQuickRecoverPlant = (plantId: string) => {
    soundManager.playSuccess();
    setPlants(prev => prev.map(p => p.id === plantId ? {
      ...p,
      actual: Math.round(p.target * 0.92),
      rate: 92,
      oee: 89.5,
      status: 'optimal',
      statusText: 'Đã phục hồi khẩn cấp'
    } : p));
  };

  const handleResetAll = () => {
    soundManager.playClick();
    setPlants(INITIAL_PLANTS);
    setNodes(CAUSAL_NODES);
    setLinks(CAUSAL_LINKS);
    setActions(INITIAL_EMERGENCY_ACTIONS);
    setHourlyData(HOURLY_TRENDS);
    setShipments(OTD_SHIPMENTS);
    setIsAiIntervened(false);
  };

  const handleInjectFault = (faultType: string) => {
    soundManager.playAlert();
    if (faultType === 'DAAL_ALUMINUM_OUTAGE') {
      setPlants(prev => prev.map(p => p.id === 'DAAL' ? {
        ...p,
        actual: 6200,
        rate: 34,
        oee: 41.2,
        status: 'critical',
        statusText: 'ĐỨT PHÔI NHÔM A980 (TIÊM LỖI)'
      } : p));
    } else if (faultType === 'KTECH_SPINDLE_VIBRATION') {
      setPlants(prev => prev.map(p => p.id === 'KTECH' ? {
        ...p,
        actual: 10500,
        rate: 52,
        oee: 58.0,
        status: 'critical',
        statusText: 'SPINDLE 04 RUNG 4.8G (TIÊM LỖI)'
      } : p));
    } else if (faultType === 'HSTEC_MISSING_OPERATORS') {
      setPlants(prev => prev.map(p => p.id === 'HSTEC' ? {
        ...p,
        actual: 11000,
        rate: 68,
        oee: 69.5,
        status: 'warning',
        statusText: 'VẮNG 18 THỢ SMT (TIÊM LỖI)'
      } : p));
    } else if (faultType === 'HOJEONG_LASER_DEFECT') {
      setPlants(prev => prev.map(p => p.id === 'HOJEONG_VINA' ? {
        ...p,
        actual: 11800,
        rate: 65,
        oee: 70.0,
        status: 'warning',
        statusText: 'LỆCH QUANG HỌC 0.12MM (TIÊM LỖI)'
      } : p));
    }
  };

  const handleTriggerToolCall = (toolName: string, args: any) => {
    soundManager.playSuccess();
    if (toolName === 'dispatch_material_emergency') {
      handleExecuteAction(1);
    } else if (toolName === 'schedule_cnc_maintenance') {
      handleExecuteAction(2);
    } else if (toolName === 'execute_counterfactual_simulation') {
      handleTriggerAllInterventions();
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#070e1b] text-slate-100 font-sans overflow-hidden select-none">
      
      {/* 1. LEFT SIDEBAR */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tabId) => setCurrentTab(tabId)}
        onOpenHourlyModal={() => setIsHourlyModalOpen(true)}
        isAiIntervened={isAiIntervened}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
      />

      {/* 2. MAIN VIEWPORT */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-gradient-to-b from-[#070e1b] via-[#091122] to-[#070e1b]">
        
        {/* Top Header */}
        <Header
          filterMode={filterMode}
          onToggleFilter={() => setFilterMode(prev => prev === 'adverse' ? 'all' : 'adverse')}
          onTriggerAiIntervention={handleTriggerAllInterventions}
          onOpenReportModal={() => setIsReportModalOpen(true)}
          onOpenAiDiagnosticsModal={() => setIsAiDiagnosticsModalOpen(true)}
          onToggleMobileMode={() => setIsMobileMode(prev => !prev)}
          isMobileMode={isMobileMode}
          isAiIntervened={isAiIntervened}
          adverseCount={adverseCount}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(prev => !prev)}
        />

        {/* Dynamic Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">

          {/* Dedicated Mobile System Suite if Mobile Mode is active */}
          {isMobileMode && (
            <MobileSystemSuite
              plants={plants}
              actions={actions}
              shipments={shipments}
              onExecuteAction={handleExecuteAction}
              onExitMobile={() => setIsMobileMode(false)}
            />
          )}

          {/* M01: Tổng quan điều hành (Overview) */}
          {!isMobileMode && currentTab === 'overview' && (
            <>
              {/* Row 1: 7 Satellite Plants KPI Bar */}
              <PlantKpiBar
                plants={plants}
                selectedPlantId={selectedPlant?.id || null}
                onSelectPlant={(plant) => setSelectedPlant(plant)}
              />

              {/* Row 2: Middle Split - Interactive Causal DAG Graph (9 Cols) & AI Insight (3 Cols) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[460px]">
                <div className="lg:col-span-9 h-full">
                  <CausalDagGraph
                    nodes={nodes}
                    links={links}
                    filterMode={filterMode}
                    onSetFilterMode={(mode) => setFilterMode(mode)}
                    selectedLink={selectedLink}
                    onSelectLink={(link) => setSelectedLink(link)}
                    onOpenHourlyModal={() => setIsHourlyModalOpen(true)}
                    onExecuteLinkAction={(actId) => handleExecuteAction(actId)}
                    totalActual={totalActual}
                    totalDeficit={totalDeficit}
                  />
                </div>

                <div className="lg:col-span-3 h-full">
                  <AiInsightPanel
                    onTriggerAllInterventions={handleTriggerAllInterventions}
                    isAiIntervened={isAiIntervened}
                    onSelectBottleneck={(nodeId) => {
                      const link = links.find(l => l.from === nodeId);
                      if (link) setSelectedLink(link);
                    }}
                  />
                </div>
              </div>

              {/* Row 3: Bottom Triad - Driver Analysis (4 Cols) • Forecast (4 Cols) • Emergency Actions (4 Cols) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 pb-2">
                <div className="lg:col-span-4 min-h-[280px]">
                  <DriverAnalysisCard totalDeficit={totalDeficit} />
                </div>

                <div className="lg:col-span-4 min-h-[280px]">
                  <ForecastSimulationCard
                    isAiIntervened={isAiIntervened}
                    onRunScenario={(sc) => {
                      if (sc === 'optimal') {
                        handleTriggerAllInterventions();
                      } else if (sc === 'partial') {
                        handleExecuteAction(1);
                      }
                    }}
                  />
                </div>

                <div className="lg:col-span-4 min-h-[280px]">
                  <EmergencyActionsCard
                    actions={actions}
                    onExecuteAction={(actId) => handleExecuteAction(actId)}
                    onExecuteAll={handleTriggerAllInterventions}
                  />
                </div>
              </div>
            </>
          )}

          {/* M02: Kế hoạch sản xuất Gantt Matrix Scheduler */}
          {!isMobileMode && currentTab === 'gantt' && (
            <NeuralLinkGanttScheduler
              onNavigateTab={(tabId) => setCurrentTab(tabId)}
            />
          )}

          {/* M03: Sản lượng thực tế Mobile System Suite (390px) */}
          {!isMobileMode && currentTab === 'mobile_scanner' && (
            <MobileSystemSuite
              plants={plants}
              actions={actions}
              shipments={shipments}
              onExecuteAction={handleExecuteAction}
              onExitMobile={() => setCurrentTab('overview')}
            />
          )}

          {/* M04: Giao hàng & OTD Matrix */}
          {!isMobileMode && currentTab === 'delivery' && (
            <NeuralLinkOTDManager />
          )}

          {/* M05: Quản lý chất lượng OQC */}
          {!isMobileMode && currentTab === 'quality' && (
            <QualityOqcModule
              onCalibrateLaser={() => handleExecuteAction(3)}
            />
          )}

          {/* M06: Quản trị nhân lực */}
          {!isMobileMode && currentTab === 'workforce' && (
            <WorkforceModule
              onAugmentWorkforce={() => handleExecuteAction(4)}
            />
          )}

          {/* M07: Thiết bị TPM & OEE */}
          {!isMobileMode && currentTab === 'equipment' && (
            <EquipmentOeeModule
              onRepairSpindle={() => handleExecuteAction(2)}
            />
          )}

          {/* M08: Kho vật liệu phôi */}
          {!isMobileMode && currentTab === 'warehouse' && (
            <MaterialWarehouseModule
              onDispatchMaterial={() => handleExecuteAction(1)}
            />
          )}

          {/* M09: Prebuild & Rework Buffer */}
          {!isMobileMode && currentTab === 'prebuild_rework' && (
            <PrebuildReworkModule />
          )}

          {/* M10: Phân tích AI Causal Chuyên sâu */}
          {!isMobileMode && currentTab === 'causal_ai' && (
            <NeuralLinkCausalDeepDive />
          )}

          {/* M11: Báo cáo & Phân tích ISO/IATF */}
          {!isMobileMode && currentTab === 'reports' && (
            <ReportsAnalyticsModule />
          )}

          {/* M12: Cài đặt hệ thống & Cấu hình tham số */}
          {!isMobileMode && currentTab === 'settings' && (
            <SystemSettingsModule />
          )}

          {/* Phase 1: Data Trust & Quality Governance Center */}
          {!isMobileMode && currentTab === 'data_trust' && (
            <DataTrustCenterModule />
          )}

          {/* Phase 1: Human-in-the-Loop & Immutable Audit Trail */}
          {!isMobileMode && currentTab === 'audit_approvals' && (
            <AuditLogApprovalModule />
          )}

          {/* Phase 3: AI Control Tower & Human-in-the-Loop Gateway */}
          {!isMobileMode && currentTab === 'ai_control_tower' && (
            <AiControlTowerModule />
          )}

          {/* Phase 4: Intelligent Automation, API/RPA Integration & Workflow Orchestration */}
          {!isMobileMode && currentTab === 'automation_center' && (
            <AutomationControlModule />
          )}

          {/* Phase 5: Operational Intelligence & Closed-Loop Optimization */}
          {!isMobileMode && currentTab === 'operational_intelligence' && (
            <OperationalIntelligenceModule />
          )}

          {/* Phân hệ Develop: Develop Home */}
          {!isMobileMode && currentTab === 'develop_home' && (
            <DevelopHomeModule
              onNavigateTab={(tabId) => setCurrentTab(tabId)}
            />
          )}

          {/* Phân hệ Develop: Screen Library */}
          {!isMobileMode && currentTab === 'screen_library' && (
            <ScreenLibraryModule
              onNavigateTab={(tabId) => setCurrentTab(tabId)}
            />
          )}

          {/* Phân hệ Develop: Screen Design Detail */}
          {!isMobileMode && currentTab === 'screen_design_detail' && (
            <ScreenDesignDetailModule />
          )}

          {/* Phân hệ Develop: Test Center */}
          {!isMobileMode && currentTab === 'test_center' && (
            <TestCenterModule
              onInjectFault={handleInjectFault}
              onResetAll={handleResetAll}
            />
          )}

          {/* Phân hệ Develop: Approval & Release */}
          {!isMobileMode && currentTab === 'approval_release' && (
            <ApprovalReleaseModule />
          )}

          {/* Phân hệ Develop: Test Data Factory */}
          {!isMobileMode && currentTab === 'test_data_factory' && (
            <TestDataFactoryModule />
          )}

        </div>
      </main>

      {/* =========================================================================
          INTERACTIVE MODALS
         ========================================================================= */}
      
      {/* 1. Hourly Trend Drill-Down Modal */}
      <HourlyTrendModal
        isOpen={isHourlyModalOpen}
        onClose={() => setIsHourlyModalOpen(false)}
        hourlyData={hourlyData}
        totalActual={totalActual}
        totalTarget={totalTarget}
        onDispatchRemedy={() => handleExecuteAction(1)}
      />

      {/* 2. Plant Detail Inspection Modal */}
      <PlantDetailModal
        plant={selectedPlant}
        onClose={() => setSelectedPlant(null)}
        onQuickRecoverPlant={handleQuickRecoverPlant}
      />

      {/* 3. ISO 9001 / IATF 16949 Shift Report Modal */}
      <IsoReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        plants={plants}
        actions={actions}
      />

      {/* 4. Gemini AI Studio Function Calling & Agent Lab Modal */}
      <AiDiagnosticsModal
        isOpen={isAiDiagnosticsModalOpen}
        onClose={() => setIsAiDiagnosticsModalOpen(false)}
        onTriggerToolCall={handleTriggerToolCall}
      />

    </div>
  );
}
