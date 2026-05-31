import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getTxVolume: (days = 7) => api.get(`/dashboard/charts/tx-volume?days=${days}`),
  getAnomalyTrend: (days = 7) => api.get(`/dashboard/charts/anomaly-trend?days=${days}`),
}

export const transactionsAPI = {
  getList: (params: any) => api.get('/transactions', { params }),
  getAuditList: (params: any) => api.get('/transactions/audit', { params }),
  getDetail: (hash: string) => api.get(`/transactions/${hash}`),
  report: (id: number) => api.post(`/transactions/${id}/report`),
}

export const anomalyAPI = {
  getAlerts: (params: any) => api.get('/anomaly/alerts', { params }),
  getAlertDetail: (id: number) => api.get(`/anomaly/alerts/${id}`),
  handleAlert: (id: number, data: any) => api.put(`/anomaly/alerts/${id}/handle`, data),
  getStats: () => api.get('/anomaly/stats'),
  getRules: () => api.get('/anomaly/rules'),
}

export const complianceAPI = {
  getReports: (params: any) => api.get('/compliance/reports', { params }),
  getReportDetail: (id: number) => api.get(`/compliance/reports/${id}`),
  generateReport: (type: string) => api.post('/compliance/reports/generate', { reportType: type }),
  submitReport: (id: number) => api.post(`/compliance/reports/${id}/submit`, { submittedBy: 'admin' }),
  ackReport: (id: number) => api.post(`/compliance/reports/${id}/ack`),
  getStats: () => api.get('/compliance/stats'),
}

export const blockchainAPI = {
  getLatestBlock: () => api.get('/blockchain/blocks/latest'),
  getBlock: (number: number) => api.get(`/blockchain/blocks/${number}`),
  getRecentBlocks: (count = 10) => api.get(`/blockchain/blocks?count=${count}`),
  getTransaction: (hash: string) => api.get(`/blockchain/transactions/${hash}`),
  getAddress: (addr: string) => api.get(`/blockchain/address/${addr}`),
  getStats: () => api.get('/blockchain/stats'),
}

export const nftAPI = {
  getCollections: (params: any) => api.get('/nft/collections', { params }),
  getCollectionDetail: (id: number) => api.get(`/nft/collections/${id}`),
  getCollectionItems: (id: number, params: any) => api.get(`/nft/collections/${id}/items`, { params }),
  getItem: (tokenId: string) => api.get(`/nft/items/${tokenId}`),
}

export const blacklistAPI = {
  getList: (params: any) => api.get('/blacklist', { params }),
  add: (data: any) => api.post('/blacklist', data),
  remove: (id: number) => api.delete(`/blacklist/${id}`),
}

export const searchAPI = {
  search: (query: string) => api.get(`/search?q=${query}`),
}

export default api
