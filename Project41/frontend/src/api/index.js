import axios from 'axios'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

request.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    return Promise.reject(error)
  }
)

export const dessertApi = {
  getAll: () => request.get('/desserts'),
  getAvailable: () => request.get('/desserts/available'),
  getById: (id) => request.get(`/desserts/${id}`),
  getByCategory: (category) => request.get(`/desserts/category/${category}`),
  search: (keyword) => request.get('/desserts/search', { params: { keyword } }),
  create: (data) => request.post('/desserts', data),
  update: (id, data) => request.put(`/desserts/${id}`, data),
  delete: (id) => request.delete(`/desserts/${id}`)
}

export const orderApi = {
  getAll: () => request.get('/orders'),
  getById: (id) => request.get(`/orders/${id}`),
  getByOrderNo: (orderNo) => request.get(`/orders/orderNo/${orderNo}`),
  getByStatus: (status) => request.get(`/orders/status/${status}`),
  getByProgress: (progress) => request.get(`/orders/progress/${progress}`),
  search: (keyword) => request.get('/orders/search', { params: { keyword } }),
  create: (data) => request.post('/orders', data),
  updateStatus: (id, status) => request.put(`/orders/${id}/status`, null, { params: { status } }),
  updateProgress: (id, progressStatus, remark) => request.put(`/orders/${id}/progress`, null, { params: { progressStatus, remark } }),
  delete: (id) => request.delete(`/orders/${id}`),
  generatePickupCode: () => request.get('/orders/pickup-code')
}

export const progressApi = {
  getAll: () => request.get('/progress'),
  getById: (id) => request.get(`/progress/${id}`),
  getByOrderId: (orderId) => request.get(`/progress/order/${orderId}`),
  getByOrderNo: (orderNo) => request.get(`/progress/orderNo/${orderNo}`),
  create: (data) => request.post('/progress', data),
  delete: (id) => request.delete(`/progress/${id}`)
}

export const pickupApi = {
  getAll: () => request.get('/pickup'),
  getById: (id) => request.get(`/pickup/${id}`),
  getByOrderId: (orderId) => request.get(`/pickup/order/${orderId}`),
  getByOrderNo: (orderNo) => request.get(`/pickup/orderNo/${orderNo}`),
  getByCode: (code) => request.get(`/pickup/code/${code}`),
  create: (orderId, pickupCode) => request.post('/pickup/create', null, { params: { orderId, pickupCode } }),
  verify: (pickupCode) => request.post('/pickup/verify', null, { params: { pickupCode } }),
  delete: (id) => request.delete(`/pickup/${id}`)
}
