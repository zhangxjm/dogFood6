import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000
})

export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats/')
}

export const petsApi = {
  list: () => api.get('/pets/'),
  create: (data) => api.post('/pets/', data),
  update: (id, data) => api.put(`/pets/${id}/`, data),
  delete: (id) => api.delete(`/pets/${id}/`)
}

export const behaviorTypesApi = {
  list: () => api.get('/behavior-types/'),
  create: (data) => api.post('/behavior-types/', data),
  update: (id, data) => api.put(`/behavior-types/${id}/`, data),
  delete: (id) => api.delete(`/behavior-types/${id}/`)
}

export const videosApi = {
  list: () => api.get('/videos/'),
  upload: (formData) => api.post('/videos/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getUrl: (id) => api.get(`/videos/${id}/video_url/`),
  analyze: (id) => api.post(`/videos/${id}/analyze/`),
  delete: (id) => api.delete(`/videos/${id}/`)
}

export const analysesApi = {
  list: () => api.get('/analyses/')
}

export const trainingApi = {
  list: () => api.get('/training-plans/'),
  recommend: (petId) => api.post('/training-plans/recommend/', { pet_id: petId }),
  get: (id) => api.get(`/training-plans/${id}/`),
  completeStep: (planId, stepId, successRate, notes) => 
    api.post(`/training-plans/${planId}/complete_step/`, {
      step_id: stepId,
      success_rate: successRate,
      notes: notes
    }),
  getProgress: (planId) => api.get(`/training-progress/?plan=${planId}`)
}

export default api
