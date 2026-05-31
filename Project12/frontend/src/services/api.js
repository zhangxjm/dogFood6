import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.message)
    return Promise.reject(error)
  }
)

export const heritageApi = {
  list: (params = {}) => api.get('/heritage/', { params }),
  get: (id) => api.get(`/heritage/${id}`),
  create: (data) => api.post('/heritage/', data),
  update: (id, data) => api.put(`/heritage/${id}`, data),
  delete: (id) => api.delete(`/heritage/${id}`),
  uploadModel: (id, file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`/heritage/${id}/upload-model`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  uploadTexture: (id, file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`/heritage/${id}/upload-texture`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  getModelUrl: (id) => api.get(`/heritage/${id}/model-url`),
  getTextureUrl: (id) => api.get(`/heritage/${id}/texture-url`)
}

export const pointcloudApi = {
  list: (params = {}) => api.get('/pointcloud/', { params }),
  get: (id) => api.get(`/pointcloud/${id}`),
  create: (data) => api.post('/pointcloud/', data),
  start: (id) => api.post(`/pointcloud/${id}/start`),
  simulateProgress: (id) => api.post(`/pointcloud/${id}/simulate-progress`),
  complete: (id) => api.post(`/pointcloud/${id}/complete`),
  delete: (id) => api.delete(`/pointcloud/${id}`),
  processSample: () => api.post('/pointcloud/process-sample')
}

export const textureApi = {
  list: (params = {}) => api.get('/texture/', { params }),
  get: (id) => api.get(`/texture/${id}`),
  create: (data) => api.post('/texture/', data),
  start: (id) => api.post(`/texture/${id}/start`),
  complete: (id, confidence = 0.9) => api.post(`/texture/${id}/complete?confidence=${confidence}`),
  simulate: (id) => api.post(`/texture/${id}/simulate`),
  delete: (id) => api.delete(`/texture/${id}`)
}

export const copyrightApi = {
  list: (params = {}) => api.get('/copyright/', { params }),
  get: (id) => api.get(`/copyright/${id}`),
  register: (data) => api.post('/copyright/', data),
  simulateRegister: () => api.post('/copyright/simulate-register'),
  verify: (id) => api.post(`/copyright/${id}/verify`),
  delete: (id) => api.delete(`/copyright/${id}`)
}

export default api
