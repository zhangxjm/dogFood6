import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
})

export const getStatistics = () => api.get('/statistics')
export const getRecentActivity = () => api.get('/statistics/activity')

export const getWarehouses = () => api.get('/warehouses')
export const getWarehouse = (id) => api.get(`/warehouses/${id}`)
export const createWarehouse = (data) => api.post('/warehouses', data)
export const updateWarehouse = (id, data) => api.put(`/warehouses/${id}`, data)
export const deleteWarehouse = (id) => api.delete(`/warehouses/${id}`)

export const getParcels = (status) => api.get('/parcels', { params: { status } })
export const getParcel = (id) => api.get(`/parcels/${id}`)
export const createParcel = (data) => api.post('/parcels', data)
export const updateParcel = (id, data) => api.put(`/parcels/${id}`, data)
export const deleteParcel = (id) => api.delete(`/parcels/${id}`)
export const getParcelTracking = (id) => api.get(`/parcels/${id}/tracking`)
export const updateParcelStatus = (id, data) => api.post(`/parcels/${id}/status`, data)
export const processSorting = (id) => api.post(`/parcels/${id}/sort`)
export const processRouting = (id) => api.post(`/parcels/${id}/route`)

export default api
