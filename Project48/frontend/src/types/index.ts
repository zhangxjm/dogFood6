export interface User {
  id: number
  username: string
  role: string
  name: string
  email?: string
  createdAt?: string
}

export interface UserInfo {
  id: number
  username: string
  role: string
  name: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  user: UserInfo
}

export interface Sensor {
  id: number
  deviceId: number
  name: string
  type: string
  unit: string
  minValue: number
  maxValue: number
  currentValue?: number
  createdAt?: string
}

export interface Device {
  id: number
  name: string
  code: string
  type: string
  location: string
  status: 'online' | 'offline' | 'warning' | 'error'
  healthScore: number
  lastMaintenance?: string
  installDate: string
  description?: string
  createdAt?: string
  sensors?: Sensor[]
}

export interface DeviceStats {
  total: number
  online: number
  warning: number
  error: number
  avgHealth: number
}

export interface RealtimeDataResponse {
  timestamp: string
  data: Record<string, number>
}

export interface HistoryDataResponse {
  timestamps: string[]
  data: Record<string, number[]>
}

export interface HealthTrendItem {
  date: string
  avgHealth: number
  deviceCount: number
}

export interface Prediction {
  id: number
  deviceId: number
  deviceName: string
  faultType: string
  probability: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  predictedDate: string
  modelVersion: string
  createdAt: string
}

export interface PredictionStats {
  low: number
  medium: number
  high: number
  critical: number
}

export interface ModelInfoResponse {
  name: string
  version: string
  accuracy: number
  trainingSamples: number
  lastTraining: string
  parameters: Record<string, unknown>
}

export interface PredictionRequest {
  deviceId: number
}

export interface MaintenancePart {
  id?: number
  planId?: number
  partId: number
  partName?: string
  quantity: number
}

export interface MaintenancePlan {
  id: number
  deviceId: number
  deviceName: string
  assigneeId?: number
  assignee?: string
  title: string
  type: string
  status: 'pending' | 'approved' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  scheduledDate: string
  estimatedHours?: number
  actualHours?: number
  description?: string
  createdAt?: string
  parts?: MaintenancePart[]
}

export interface MaintenanceRecord {
  id: number
  deviceId: number
  planId?: number
  result: string
  cost?: number
  notes?: string
  completedAt: string
}

export interface MaintenanceStats {
  pending: number
  approved: number
  inProgress: number
  completed: number
  overdue: number
  today: number
  thisWeek: number
}

export interface ExecutePlanRequest {
  actualHours: number
  notes: string
  partsUsed: MaintenancePart[]
}

export interface CalendarEvent {
  id: number
  title: string
  start: string
  end: string
  backgroundColor: string
  borderColor: string
  extendedProps: {
    planId: number
    status: string
    priority: string
  }
}

export interface InventoryPart {
  id: number
  name: string
  sku: string
  category?: string
  quantity: number
  safeStock: number
  unit: string
  location?: string
  supplier?: string
  lastUpdated: string
}

export interface InventoryAlert {
  id: number
  partId: number
  partName: string
  currentQuantity: number
  safeStock: number
  shortage: number
  level: 'warning' | 'danger'
}

export interface InventoryTransaction {
  id: number
  partId: number
  type: 'in' | 'out'
  quantity: number
  notes?: string
  createdAt: string
}

export interface InventoryStats {
  totalItems: number
  lowStockItems: number
  outStockItems: number
  totalValue: number
}

export interface PurchaseSuggestion {
  partId: number
  partName: string
  sku: string
  currentQuantity: number
  safeStock: number
  suggestedQuantity: number
  priority: 'high' | 'medium' | 'low'
}

export interface UsageTrendItem {
  date: string
  quantity: number
}

export interface ApiResponse<T = unknown> {
  code?: number
  message?: string
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  total: number
  items: T[]
  page: number
  pageSize: number
}

export interface PaginationParams {
  page?: number
  pageSize?: number
  keyword?: string
}
