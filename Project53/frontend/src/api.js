import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    timeout: 10000
});

export const equipmentApi = {
    getAll: () => api.get('/equipment'),
    getById: (id) => api.get(`/equipment/${id}`),
    getByStatus: (status) => api.get(`/equipment/status/${status}`),
    create: (data) => api.post('/equipment', data),
    update: (id, data) => api.put(`/equipment/${id}`, data),
    delete: (id) => api.delete(`/equipment/${id}`)
};

export const energyDataApi = {
    getAll: () => api.get('/energy-data'),
    getByEquipment: (equipmentId) => api.get(`/energy-data/equipment/${equipmentId}`),
    getByTimeRange: (start, end) => api.get('/energy-data/time-range', { params: { start, end } }),
    getLatestByEquipment: (equipmentId) => api.get(`/energy-data/equipment/${equipmentId}/latest`),
    getRealTimeStats: () => api.get('/energy-data/statistics/realtime'),
    create: (data) => api.post('/energy-data', data)
};

export const savingPlansApi = {
    getAll: () => api.get('/saving-plans'),
    getByEquipment: (equipmentId) => api.get(`/saving-plans/equipment/${equipmentId}`),
    getByPriority: (priority) => api.get(`/saving-plans/priority/${priority}`),
    create: (data) => api.post('/saving-plans', data),
    update: (id, data) => api.put(`/saving-plans/${id}`, data),
    delete: (id) => api.delete(`/saving-plans/${id}`)
};

export const lossAnalysisApi = {
    getAll: () => api.get('/loss-analysis'),
    getByEquipment: (equipmentId) => api.get(`/loss-analysis/equipment/${equipmentId}`),
    getBySeverity: (severity) => api.get(`/loss-analysis/severity/${severity}`),
    getStatistics: () => api.get('/loss-analysis/statistics'),
    create: (data) => api.post('/loss-analysis', data)
};

export const algorithmApi = {
    getEfficiency: (equipmentId, start, end) => api.get(`/algorithm/efficiency/${equipmentId}`, { params: { start, end } }),
    getPrediction: (equipmentId, days) => api.get(`/algorithm/predict/${equipmentId}`, { params: { days } }),
    getLosses: (equipmentId, start, end) => api.get(`/algorithm/losses/${equipmentId}`, { params: { start, end } }),
    generatePlans: (equipmentId) => api.get(`/algorithm/saving-plans/${equipmentId}`)
};

export default api;
