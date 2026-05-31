import request from '@/utils/request'
import type { Device, DeviceStats, RealtimeDataResponse, HistoryDataResponse, PaginatedResponse, HealthTrendItem } from '@/types'

interface DeviceListParams {
  page?: number
  pageSize?: number
  keyword?: string
  status?: string
  type?: string
}

export const deviceApi = {
  list(params: DeviceListParams = {}): Promise<PaginatedResponse<Device>> {
    return request.get<PaginatedResponse<Device>>('/devices', { params })
  },

  getById(id: number): Promise<Device> {
    return request.get<Device>(`/devices/${id}`)
  },

  create(data: Partial<Device>): Promise<Device> {
    return request.post<Device>('/devices', data)
  },

  update(id: number, data: Partial<Device>): Promise<Device> {
    return request.put<Device>(`/devices/${id}`, data)
  },

  delete(id: number): Promise<{ message: string }> {
    return request.delete<{ message: string }>(`/devices/${id}`)
  },

  getStats(): Promise<DeviceStats> {
    return request.get<DeviceStats>('/devices/stats')
  },

  getRealtimeData(id: number): Promise<RealtimeDataResponse> {
    return request.get<RealtimeDataResponse>(`/devices/${id}/realtime`)
  },

  getHistoryData(id: number, hours: number = 24): Promise<HistoryDataResponse> {
    return request.get<HistoryDataResponse>(`/devices/${id}/history`, {
      params: { hours }
    })
  },

  getHealthTrend(days: number = 30): Promise<HealthTrendItem[]> {
    return request.get<HealthTrendItem[]>('/devices/health-trend', {
      params: { days }
    })
  }
}

export default deviceApi
