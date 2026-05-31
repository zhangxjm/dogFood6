export type LineStatus = 'RUNNING' | 'STOPPED' | 'OFFLINE' | 'FAULT';
export type DeviceStatus = 'ONLINE' | 'OFFLINE' | 'FAULT';
export type InspectionResult = 'PASS' | 'FAIL';
export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';
export type UserRole = 'ADMIN' | 'OPERATOR' | 'VIEWER';
export type ModelStatus = 'TRAINING' | 'READY' | 'ACTIVE' | 'DEPRECATED';
export type SortingAction = 'PASS' | 'REJECT' | 'REWORK' | 'MANUAL';

export interface User {
  id: string;
  username: string;
  displayName: string;
  role: UserRole;
  email?: string;
  phone?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  lastLoginAt?: string;
}

export interface ProductionLine {
  id: string;
  name: string;
  code: string;
  description?: string;
  status: LineStatus;
  cameraCount: number;
  todayInspections: number;
  todayDefects: number;
  passRate: number;
  speed: number;
  createdAt: string;
  updatedAt: string;
}

export interface Camera {
  id: string;
  name: string;
  code: string;
  ipAddress: string;
  lineId: string;
  lineName: string;
  model: string;
  resolution: string;
  fps: number;
  status: DeviceStatus;
  lastHeartbeat: string;
  position: string;
}

export interface VisionModel {
  id: string;
  name: string;
  version: string;
  type: string;
  accuracy: number;
  precision: number;
  recall: number;
  status: ModelStatus;
  defectTypes: string[];
  createdAt: string;
  updatedAt: string;
  size: string;
  framework: string;
}

export interface EdgeNode {
  id: string;
  name: string;
  code: string;
  ipAddress: string;
  location: string;
  status: DeviceStatus;
  cpuUsage: number;
  memoryUsage: number;
  gpuUsage: number;
  temperature: number;
  lastHeartbeat: string;
  models: string[];
  cameras: string[];
}

export interface DefectType {
  id: string;
  name: string;
  code: string;
  category: string;
  description?: string;
  severity: 'MINOR' | 'MAJOR' | 'CRITICAL';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  totalCount: number;
}

export interface DefectLocation {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
}

export interface InspectionRecord {
  id: string;
  lineId: string;
  lineName: string;
  cameraId: string;
  cameraName: string;
  productCode: string;
  result: InspectionResult;
  defectType?: string;
  defectTypeName?: string;
  severity?: 'MINOR' | 'MAJOR' | 'CRITICAL';
  confidence: number;
  imageUrl: string;
  defectLocations?: DefectLocation[];
  timestamp: string;
  duration: number;
  sortingAction?: SortingAction;
  operator?: string;
}

export interface SortingRule {
  id: string;
  name: string;
  description?: string;
  defectType: string;
  defectTypeName: string;
  action: SortingAction;
  minConfidence: number;
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SortingExecution {
  id: string;
  ruleId: string;
  ruleName: string;
  inspectionId: string;
  defectType: string;
  action: SortingAction;
  confidence: number;
  timestamp: string;
  status: 'SUCCESS' | 'FAILED';
  errorMessage?: string;
}

export interface SortingStatistics {
  totalToday: number;
  passCount: number;
  rejectCount: number;
  reworkCount: number;
  manualCount: number;
}

export interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  severity: AlertSeverity;
  timestamp: number;
  isRead: boolean;
  source?: string;
  lineId?: string;
}

export interface InspectionUpdate {
  id: string;
  lineName: string;
  cameraName: string;
  result: InspectionResult;
  defectType?: string;
  confidence: number;
  timestamp: string;
  imageUrl?: string;
}

export interface TrendDataPoint {
  date: string;
  inspections: number;
  defects: number;
  passRate: number;
}

export interface DefectDistribution {
  name: string;
  value: number;
  color: string;
}

export interface DashboardStats {
  totalInspections: number;
  totalDefects: number;
  passRate: number;
  avgInspectionTime: number;
  runningLines: number;
  totalLines: number;
  activeCameras: number;
  totalCameras: number;
  pendingAlerts: number;
}

export interface SystemSettings {
  autoStartInspection: boolean;
  defaultConfidenceThreshold: number;
  alertEmailEnabled: boolean;
  alertSmsEnabled: boolean;
  dataRetentionDays: number;
  autoBackupEnabled: boolean;
  backupSchedule: string;
  language: string;
  timezone: string;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginationResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  code?: number;
}

export interface WebSocketMessage<T = unknown> {
  type: string;
  data: T;
  timestamp: number;
}

export type WebSocketEventHandler = (data: unknown) => void;

export interface DataTableColumn<T> {
  key: keyof T | string;
  title: string;
  dataIndex?: keyof T;
  render?: (record: T, index: number) => React.ReactNode;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  sorter?: (a: T, b: T) => number;
}

export interface TabItem {
  key: string;
  label: string;
  icon?: React.ComponentType;
}
