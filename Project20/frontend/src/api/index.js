import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 30000
})

api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export const imageApi = {
  getImages: (params) => api.get('/images/', { params }),
  getImage: (id) => api.get(`/images/${id}`),
  getImageFile: (id) => `/api/v1/images/file/${id}`,
  getThumbnail: (id) => `/api/v1/images/thumbnail/${id}`,
  uploadImage: (formData) => api.post('/images/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteImage: (id) => api.delete(`/images/${id}`),
  searchImages: (query, params) => api.post('/images/search', null, {
    params: { query, ...params }
  })
}

export const annotationApi = {
  getAnnotations: (params) => api.get('/annotations/', { params }),
  createAnnotation: (data) => api.post('/annotations/', data),
  updateAnnotation: (id, data) => api.put(`/annotations/${id}`, data),
  deleteAnnotation: (id) => api.delete(`/annotations/${id}`)
}

export const detectionApi = {
  detectObjects: (data) => api.post('/detection/objects', data),
  getDetectionResults: (imageId) => api.get(`/detection/results/${imageId}`),
  deleteDetectionResult: (id) => api.delete(`/detection/results/${id}`),
  detectChanges: (data) => api.post('/detection/change-detection', data),
  getChangeDetections: (params) => api.get('/detection/change-detection', { params }),
  getChangeDetection: (id) => api.get(`/detection/change-detection/${id}`),
  getChangeMask: (id) => `/api/v1/detection/change-detection/mask/${id}`,
  enhanceImage: (id) => api.post(`/detection/enhance/${id}`, null, {
    responseType: 'blob'
  })
}

export default api
