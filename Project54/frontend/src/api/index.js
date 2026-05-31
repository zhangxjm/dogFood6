import axios from 'axios'

const request = axios.create({
  baseURL: '/',
  timeout: 10000
})

request.interceptors.response.use(
  response => response.data,
  error => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

export const categoryApi = {
  list: () => request.get('/api/categories'),
  get: (id) => request.get(`/api/categories/${id}`),
  create: (data) => request.post('/api/categories', data),
  update: (id, data) => request.put(`/api/categories/${id}`, data),
  delete: (id) => request.delete(`/api/categories/${id}`)
}

export const templateApi = {
  list: (categoryId = null) => {
    const url = categoryId ? `/api/templates?category_id=${categoryId}` : '/api/templates'
    return request.get(url)
  },
  get: (id) => request.get(`/api/templates/${id}`),
  create: (data) => request.post('/api/templates', data),
  update: (id, data) => request.put(`/api/templates/${id}`, data),
  delete: (id) => request.delete(`/api/templates/${id}`),
  download: (id) => window.open(`/api/templates/${id}/download`, '_blank'),
  preview: (id) => `/api/templates/preview/${id}`
}

export const noteApi = {
  list: (templateId = null) => {
    const url = templateId ? `/api/notes?template_id=${templateId}` : '/api/notes'
    return request.get(url)
  },
  get: (id) => request.get(`/api/notes/${id}`),
  create: (data) => request.post('/api/notes', data),
  update: (id, data) => request.put(`/api/notes/${id}`, data),
  delete: (id) => request.delete(`/api/notes/${id}`)
}

export default request
