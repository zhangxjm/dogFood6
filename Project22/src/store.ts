import { create } from 'zustand';

export interface ProductionLine {
  id: number;
  name: string;
  status: string;
  speed: number;
  description?: string;
}

export interface LineStatus {
  lineId: number;
  lineName: string;
  status: string;
  speed: number;
  totalInspectedToday: number;
  passedToday: number;
  failedToday: number;
  passRate: number;
  cameraCount: number;
  activeCameraCount: number;
}

export interface DefectType {
  id: number;
  name: string;
  severity: string;
  colorCode: string;
  description?: string;
}

export interface InspectionRecord {
  id: number;
  lineId: number;
  lineName?: string;
  cameraId: number;
  defectTypeId?: number;
  defectTypeName?: string;
  defectSeverity?: string;
  defectColorCode?: string;
  modelId?: number;
  result: string;
  confidence: number;
  imagePath?: string;
  annotatedImagePath?: string;
  inspectedAt: string;
}

export interface SortingRule {
  id: number;
  name: string;
  defectSeverity: string;
  action: string;
  priority: number;
  lineId?: number;
  enabled: boolean;
}

export interface Camera {
  id: number;
  name: string;
  ipAddress: string;
  status: string;
  lineId?: number;
  edgeNodeId?: number;
  resolution: string;
  fps: number;
}

export interface EdgeNode {
  id: number;
  name: string;
  ipAddress: string;
  cpuUsage: number;
  memoryUsage: number;
  inferenceLatency: number;
  status: string;
}

export interface VisionModel {
  id: number;
  name: string;
  version: string;
  accuracy: number;
  active: boolean;
  description?: string;
  createdAt: string;
}

export interface SortingStats {
  totalProcessed: number;
  passCount: number;
  reworkCount: number;
  rejectCount: number;
  passRate: number;
}

export interface Alert {
  id: string;
  type: string;
  level: string;
  title: string;
  message: string;
  lineId?: number;
  lineName?: string;
  timestamp: string;
  read: boolean;
}

export interface ReportData {
  periodType: string;
  startDate: string;
  endDate: string;
  totalInspected: number;
  passed: number;
  failed: number;
  passRate: number;
  trendData: Array<{
    date: string;
    total: number;
    passed: number;
    failed: number;
    passRate: number;
  }>;
  defectDistribution: Array<{
    defectName: string;
    defectSeverity: string;
    colorCode: string;
    count: number;
    percentage: number;
  }>;
  lineStatistics: Array<{
    lineId: number;
    lineName: string;
    totalInspected: number;
    passed: number;
    failed: number;
    passRate: number;
  }>;
}

interface AppState {
  lineStatuses: LineStatus[];
  recentRecords: InspectionRecord[];
  defectTypes: DefectType[];
  sortingRules: SortingRule[];
  cameras: Camera[];
  edgeNodes: EdgeNode[];
  models: VisionModel[];
  sortingStats: SortingStats;
  alerts: Alert[];
  currentPage: string;
  setCurrentPage: (page: string) => void;
  setLineStatuses: (statuses: LineStatus[]) => void;
  addRecentRecord: (record: InspectionRecord) => void;
  setDefectTypes: (types: DefectType[]) => void;
  setSortingRules: (rules: SortingRule[]) => void;
  setCameras: (cameras: Camera[]) => void;
  setEdgeNodes: (nodes: EdgeNode[]) => void;
  setModels: (models: VisionModel[]) => void;
  setSortingStats: (stats: SortingStats) => void;
  addAlert: (alert: Alert) => void;
  markAlertRead: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  lineStatuses: [],
  recentRecords: [],
  defectTypes: [],
  sortingRules: [],
  sortingStats: {
    totalProcessed: 0,
    passCount: 0,
    reworkCount: 0,
    rejectCount: 0,
    passRate: 100,
  },
  cameras: [],
  edgeNodes: [],
  models: [],
  alerts: [],
  currentPage: 'dashboard',
  setCurrentPage: (page) => set({ currentPage: page }),
  setLineStatuses: (statuses) => set({ lineStatuses: statuses }),
  addRecentRecord: (record) => set((state) => ({
    recentRecords: [record, ...state.recentRecords.slice(0, 49)],
  })),
  setDefectTypes: (types) => set({ defectTypes: types }),
  setSortingRules: (rules) => set({ sortingRules: rules }),
  setCameras: (cameras) => set({ cameras }),
  setEdgeNodes: (nodes) => set({ edgeNodes: nodes }),
  setModels: (models) => set({ models }),
  setSortingStats: (stats) => set({ sortingStats: stats }),
  addAlert: (alert) => set((state) => ({
    alerts: [alert, ...state.alerts].slice(0, 20),
  })),
  markAlertRead: (id) => set((state) => ({
    alerts: state.alerts.map((a) => (a.id === id ? { ...a, read: true } : a)),
  })),
}));
