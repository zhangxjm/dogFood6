import request from '@/utils/request'
import type { InventoryPart, InventoryStats, InventoryAlert, InventoryTransaction, PurchaseSuggestion, PaginatedResponse, UsageTrendItem } from '@/types'

interface PartListParams {
  page?: number
  pageSize?: number
  keyword?: string
  category?: string
}

export const inventoryApi = {
  listParts(params: PartListParams = {}): Promise<PaginatedResponse<InventoryPart>> {
    return request.get<PaginatedResponse<InventoryPart>>('/inventory/parts', { params })
  },

  getPartStats(): Promise<InventoryStats> {
    return request.get<InventoryStats>('/inventory/parts/stats')
  },

  getAlerts(): Promise<InventoryAlert[]> {
    return request.get<InventoryAlert[]>('/inventory/parts/alerts')
  },

  getPurchaseSuggestions(): Promise<PurchaseSuggestion[]> {
    return request.get<PurchaseSuggestion[]>('/inventory/parts/purchase-suggestions')
  },

  getPartById(id: number): Promise<InventoryPart> {
    return request.get<InventoryPart>(`/inventory/parts/${id}`)
  },

  createPart(data: Partial<InventoryPart>): Promise<InventoryPart> {
    return request.post<InventoryPart>('/inventory/parts', data)
  },

  updatePart(id: number, data: Partial<InventoryPart>): Promise<InventoryPart> {
    return request.put<InventoryPart>(`/inventory/parts/${id}`, data)
  },

  deletePart(id: number): Promise<{ message: string }> {
    return request.delete<{ message: string }>(`/inventory/parts/${id}`)
  },

  addStock(id: number, quantity: number, notes?: string): Promise<InventoryPart> {
    return request.post<InventoryPart>(`/inventory/parts/${id}/add-stock`, { quantity, notes })
  },

  consumePart(id: number, quantity: number, notes?: string): Promise<InventoryPart> {
    return request.post<InventoryPart>(`/inventory/parts/${id}/consume`, { quantity, notes })
  },

  getUsageTrend(id: number, days: number = 30): Promise<UsageTrendItem[]> {
    return request.get<UsageTrendItem[]>(`/inventory/parts/${id}/usage-trend`, {
      params: { days }
    })
  },

  getTransactions(params: { page?: number; pageSize?: number; partId?: number; type?: string } = {}): Promise<PaginatedResponse<InventoryTransaction>> {
    return request.get<PaginatedResponse<InventoryTransaction>>('/inventory/transactions', { params })
  }
}

export default inventoryApi
