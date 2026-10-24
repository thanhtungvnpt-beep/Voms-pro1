export interface PlantMetric {
  id: string;
  name: string;
  specialty: string;
  actual: number;
  target: number;
  rate: number;
  oee: number;
  status: 'optimal' | 'stable' | 'warning' | 'critical';
  statusText: string;
  imgUrl: string;
  manager: string;
  lines: number;
  workers: number;
  activeDefectRate: number;
  bottleneckCode?: string;
  note?: string;
}

export interface CausalNode {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  category: 'input' | 'process' | 'core' | 'outcome';
  weight: number;
  isNegative?: boolean;
  x: number;
  y: number;
  statusText: string;
  details: string[];
  metrics: { [key: string]: string | number };
}

export interface CausalLink {
  id: string;
  from: string;
  to: string;
  weight: number;
  pValue: number;
  isNegative: boolean;
  path: string;
  formula: string;
  description: string;
  impactPct: number;
  recommendedAction: string;
  actionPayload: any;
}

export interface EmergencyAction {
  id: number;
  code: string;
  title: string;
  plantId: string;
  priority: 'Cao' | 'Trung bình' | 'Thấp';
  actionBtn: string;
  executed?: boolean;
  executedAt?: string;
  impactDescription: string;
  targetMetricRecovery: string;
}

export interface HourlyDataPoint {
  hour: string;
  actual: number;
  target: number;
  cumulativeActual: number;
  cumulativeTarget: number;
  isDip?: boolean;
  future?: boolean;
  reason?: string;
}

export interface OtdShipment {
  id: string;
  code: string;
  destination: string;
  carrier: string;
  truckNo: string;
  departureTime: string;
  plannedQty: number;
  readyQty: number;
  status: 'at_risk' | 'on_track' | 'critical' | 'dispatched';
  etaPort: string;
  plantOrigin: string;
}

export interface QualityDefect {
  id: string;
  code: string;
  name: string;
  plant: string;
  station: string;
  defectCount: number;
  dpmo: number;
  severity: 'Critical' | 'Major' | 'Minor';
  trend: 'up' | 'down' | 'stable';
  rootCause: string;
}

export interface MachineTelemetry {
  id: string;
  code: string;
  name: string;
  plant: string;
  type: string;
  status: 'running' | 'warning' | 'maintenance' | 'stopped';
  vibrationG: number;
  temperatureC: number;
  spindleRpm: number;
  oee: number;
  toolWearPct: number;
  lastMaintenance: string;
}

export interface MaterialInventory {
  id: string;
  code: string;
  name: string;
  hub: string;
  stockKg: number;
  safetyStockKg: number;
  dailyConsumptionKg: number;
  status: 'critical_shortage' | 'healthy' | 'reorder_needed';
  allocatedPlants: string[];
}
