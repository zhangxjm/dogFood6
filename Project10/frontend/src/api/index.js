import axios from 'axios'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

request.interceptors.response.use(
  response => response.data,
  error => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export const memberAPI = {
  getAll: () => request.get('/members'),
  getById: (id) => request.get(`/members/${id}`),
  create: (data) => request.post('/members', data),
  update: (id, data) => request.put(`/members/${id}`, data),
  delete: (id) => request.delete(`/members/${id}`),
  search: (keyword) => request.get(`/members/search?keyword=${keyword}`)
}

export const petAPI = {
  getAll: () => request.get('/pets'),
  getById: (id) => request.get(`/pets/${id}`),
  create: (data) => request.post('/pets', data),
  update: (id, data) => request.put(`/pets/${id}`, data),
  delete: (id) => request.delete(`/pets/${id}`),
  getByMemberId: (memberId) => request.get(`/pets/member/${memberId}`)
}

export const groomingItemAPI = {
  getAll: () => request.get('/grooming-items'),
  getActive: () => request.get('/grooming-items/active'),
  getById: (id) => request.get(`/grooming-items/${id}`),
  create: (data) => request.post('/grooming-items', data),
  update: (id, data) => request.put(`/grooming-items/${id}`, data),
  delete: (id) => request.delete(`/grooming-items/${id}`)
}

export const groomingRecordAPI = {
  getAll: () => request.get('/grooming-records'),
  getById: (id) => request.get(`/grooming-records/${id}`),
  create: (data) => request.post('/grooming-records', data),
  update: (id, data) => request.put(`/grooming-records/${id}`, data),
  delete: (id) => request.delete(`/grooming-records/${id}`),
  start: (id, data) => request.post(`/grooming-records/${id}/start`, data),
  complete: (id, data) => request.post(`/grooming-records/${id}/complete`, data),
  getByMemberId: (memberId) => request.get(`/grooming-records/member/${memberId}`),
  getByPetId: (petId) => request.get(`/grooming-records/pet/${petId}`),
  getByStatus: (status) => request.get(`/grooming-records/status/${status}`),
  getByDateRange: (startDate, endDate) => 
    request.get(`/grooming-records/date-range?startDate=${startDate}&endDate=${endDate}`),
  getMemberCompletedCount: (memberId) => 
    request.get(`/grooming-records/member/${memberId}/completed-count`)
}

export default request
