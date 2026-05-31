import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3034/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  config => config,
  error => Promise.reject(error)
);

api.interceptors.response.use(
  response => response.data,
  error => {
    const message = error.response?.data?.error || error.message || '请求失败';
    return Promise.reject(new Error(message));
  }
);

export const apiService = {
  getDashboard: () => api.get('/dashboard'),
  
  getHealth: () => api.get('/health'),
  
  getUsers: (params) => api.get('/admin/users', { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  
  getAccounts: (params) => api.get('/admin/accounts', { params }),
  getUserAccounts: (userId) => api.get(`/admin/users/${userId}/accounts`),
  
  getTransactions: (params) => api.get('/admin/transactions', { params }),
  getTransaction: (id) => api.get(`/admin/transactions/${id}`),
  
  createPayment: (data) => api.post('/payments', data),
  processPayment: (id) => api.post(`/payments/${id}/process`),
  refundPayment: (id, data) => api.post(`/payments/${id}/refund`, data),
  getPaymentStatus: (id) => api.get(`/payments/${id}/status`),
  getUserPayments: (userId, params) => api.get(`/payments/user/${userId}`, { params }),
  
  getRiskRules: () => api.get('/risk/rules'),
  createRiskRule: (data) => api.post('/risk/rules', data),
  updateRiskRule: (id, data) => api.put(`/risk/rules/${id}`, data),
  deleteRiskRule: (id) => api.delete(`/risk/rules/${id}`),
  
  getRiskAlerts: (params) => api.get('/risk/alerts', { params }),
  getRiskAlert: (id) => api.get(`/risk/alerts/${id}`),
  resolveRiskAlert: (id) => api.put(`/risk/alerts/${id}/resolve`),
  
  getRiskStatistics: () => api.get('/risk/statistics'),
  unblockTransaction: (id) => api.post(`/risk/transactions/${id}/unblock`),
  
  getSettlements: (params) => api.get('/settlements/records', { params }),
  getSettlement: (id) => api.get(`/settlements/records/${id}`),
  createSettlement: (data) => api.post('/settlements/records', data),
  processSettlement: (id) => api.post(`/settlements/records/${id}/process`),
  batchProcessSettlements: (ids) => api.post('/settlements/batch-process', { ids }),
  getPendingSettlements: () => api.get('/settlements/pending'),
  getSettlementSummary: () => api.get('/settlements/summary'),
  autoSettle: () => api.post('/settlements/auto-settle'),
  
  getExchangeRates: () => api.get('/exchange-rates'),
  createExchangeRate: (data) => api.post('/exchange-rates', data),
  convertCurrency: (params) => api.get('/exchange-rates/convert', { params }),
  getExchangeRate: (from, to) => api.get(`/exchange-rates/${from}/${to}`),
  
  getSeataTransactions: (params) => api.get('/seata/transactions', { params }),
  getSeataTransaction: (xid) => api.get(`/seata/transactions/${xid}`),
  beginSeataTransaction: (data) => api.post('/seata/begin', data),
  commitSeataTransaction: (xid) => api.post(`/seata/commit/${xid}`),
  rollbackSeataTransaction: (xid) => api.post(`/seata/rollback/${xid}`)
};

export default api;
