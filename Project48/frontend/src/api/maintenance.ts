import request from '@/utils/request'
import type { MaintenancePlan, MaintenanceStats, MaintenanceRecord, ExecutePlanRequest, PaginatedResponse, CalendarEvent } from '@/types'

interface PlanListParams {
  page?: number
  pageSize?: number
  status?: string
  priority?: string
  deviceId?: number
}

export const maintenanceApi = {
  listPlans(params: PlanListParams = {}): Promise<PaginatedResponse<MaintenancePlan>> {
    return request.get<PaginatedResponse<MaintenancePlan>>('/maintenance/plans', { params })
  },

  getPlanStats(): Promise<MaintenanceStats> {
    return request.get<MaintenanceStats>('/maintenance/plans/stats')
  },

  getCalendarData(start?: string, end?: string): Promise<CalendarEvent[]> {
    return request.get<CalendarEvent[]>('/maintenance/plans/calendar', {
      params: { start, end }
    })
  },

  getPlanById(id: number): Promise<MaintenancePlan> {
    return request.get<MaintenancePlan>(`/maintenance/plans/${id}`)
  },

  createPlan(data: Partial<MaintenancePlan>): Promise<MaintenancePlan> {
    return request.post<MaintenancePlan>('/maintenance/plans', data)
  },

  updatePlan(id: number, data: Partial<MaintenancePlan>): Promise<MaintenancePlan> {
    return request.put<MaintenancePlan>(`/maintenance/plans/${id}`, data)
  },

  deletePlan(id: number): Promise<{ message: string }> {
    return request.delete<{ message: string }>(`/maintenance/plans/${id}`)
  },

  updatePlanStatus(id: number, status: string): Promise<MaintenancePlan> {
    return request.patch<MaintenancePlan>(`/maintenance/plans/${id}/status`, { status })
  },

  executePlan(id: number, data: ExecutePlanRequest): Promise<MaintenanceRecord> {
    return request.post<MaintenanceRecord>(`/maintenance/plans/${id}/execute`, data)
  },

  generatePlans(): Promise<{ count: number; message: string }> {
    return request.post<{ count: number; message: string }>('/maintenance/plans/generate')
  },

  getRecords(params: { page?: number; pageSize?: number; deviceId?: number } = {}): Promise<PaginatedResponse<MaintenanceRecord>> {
    return request.get<PaginatedResponse<MaintenanceRecord>>('/maintenance/records', { params })
  }
}

export default maintenanceApi
