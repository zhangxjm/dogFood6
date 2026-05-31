const BASE_URL = '/api'

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '请求失败' }))
    throw new Error(error.message || `HTTP ${response.status}`)
  }
  return response.json()
}

export const dashboardApi = {
  getDashboardStats: () => request<any>('/dashboard/stats'),
  getLineStatuses: () => request<any[]>('/dashboard/lines'),
}

export const inspectionApi = {
  getInspectionRecords: (params?: Record<string, any>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return request<any>(`/inspections${query}`)
  },
  getInspectionRecord: (id: string) => request<any>(`/inspections/${id}`),
  simulateInspection: (lineId: string) =>
    request<any>('/inspections/simulate', {
      method: 'POST',
      body: JSON.stringify({ lineId }),
    }),
  getDefectTypes: () => request<any[]>('/defect-types'),
  createDefectType: (data: any) =>
    request<any>('/defect-types', { method: 'POST', body: JSON.stringify(data) }),
  updateDefectType: (id: string, data: any) =>
    request<any>(`/defect-types/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteDefectType: (id: string) =>
    request<void>(`/defect-types/${id}`, { method: 'DELETE' }),
}

export const sortingApi = {
  getSortingRules: () => request<any[]>('/sorting/rules'),
  createSortingRule: (data: any) =>
    request<any>('/sorting/rules', { method: 'POST', body: JSON.stringify(data) }),
  updateSortingRule: (id: string, data: any) =>
    request<any>(`/sorting/rules/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSortingRule: (id: string) =>
    request<void>(`/sorting/rules/${id}`, { method: 'DELETE' }),
  getSortingExecutions: (params?: Record<string, any>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return request<any>(`/sorting/executions${query}`)
  },
  getSortingStatistics: () => request<any>('/sorting/statistics'),
}

export const reportApi = {
  getDailyReport: (date: string) => request<any>(`/reports/daily?date=${date}`),
  getWeeklyReport: (week: string) => request<any>(`/reports/weekly?week=${week}`),
  getMonthlyReport: (month: string) => request<any>(`/reports/monthly?month=${month}`),
  getTrendData: (params: Record<string, any>) => {
    const query = new URLSearchParams(params).toString()
    return request<any[]>(`/reports/trend?${query}`)
  },
}

export const deviceApi = {
  getCameras: () => request<any[]>('/devices/cameras'),
  createCamera: (data: any) =>
    request<any>('/devices/cameras', { method: 'POST', body: JSON.stringify(data) }),
  updateCamera: (id: string, data: any) =>
    request<any>(`/devices/cameras/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCamera: (id: string) =>
    request<void>(`/devices/cameras/${id}`, { method: 'DELETE' }),
  getModels: () => request<any[]>('/devices/models'),
  createModel: (data: any) =>
    request<any>('/devices/models', { method: 'POST', body: JSON.stringify(data) }),
  activateModel: (id: string) =>
    request<any>(`/devices/models/${id}/activate`, { method: 'POST' }),
  getEdgeNodes: () => request<any[]>('/devices/edge-nodes'),
}

export const lineApi = {
  getProductionLines: () => request<any[]>('/lines'),
  createProductionLine: (data: any) =>
    request<any>('/lines', { method: 'POST', body: JSON.stringify(data) }),
  updateProductionLine: (id: string, data: any) =>
    request<any>(`/lines/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProductionLine: (id: string) =>
    request<void>(`/lines/${id}`, { method: 'DELETE' }),
  startLine: (id: string) => request<any>(`/lines/${id}/start`, { method: 'POST' }),
  stopLine: (id: string) => request<any>(`/lines/${id}/stop`, { method: 'POST' }),
}

export const systemApi = {
  getUsers: () => request<any[]>('/system/users'),
  createUser: (data: any) =>
    request<any>('/system/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id: string, data: any) =>
    request<any>(`/system/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUser: (id: string) =>
    request<void>(`/system/users/${id}`, { method: 'DELETE' }),
  getSettings: () => request<any>('/system/settings'),
  updateSettings: (data: any) =>
    request<any>('/system/settings', { method: 'PUT', body: JSON.stringify(data) }),
}
