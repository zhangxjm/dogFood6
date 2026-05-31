import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

export const shopsAPI = {
  getShops: (params) => api.get('/shops/', { params }),
  getShop: (id) => api.get(`/shops/${id}`),
  createShop: (data) => api.post('/shops/', data),
  updateShop: (id, data) => api.put(`/shops/${id}`, data),
  deleteShop: (id) => api.delete(`/shops/${id}`),
};

export const meterReadingsAPI = {
  getReadings: (params) => api.get('/meter-readings/', { params }),
  getLastReading: (shopId) => api.get(`/meter-readings/last/${shopId}`),
  getReading: (id) => api.get(`/meter-readings/${id}`),
  createReading: (data) => api.post('/meter-readings/', data),
};

export const billsAPI = {
  getBills: (params) => api.get('/bills/', { params }),
  getOverdueBills: () => api.get('/bills/overdue'),
  getBill: (id) => api.get(`/bills/${id}`),
  createBill: (data) => api.post('/bills/', data),
  generateBill: (readingId) => api.post(`/bills/generate/${readingId}`),
  updateBill: (id, data) => api.put(`/bills/${id}`, data),
};

export const paymentsAPI = {
  getPayments: (params) => api.get('/payments/', { params }),
  getPayment: (id) => api.get(`/payments/${id}`),
  createPayment: (data) => api.post('/payments/', data),
};

export default api;
