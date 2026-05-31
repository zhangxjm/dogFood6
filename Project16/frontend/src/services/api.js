import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login/', credentials),
  register: (data) => api.post('/auth/register/', data),
  refreshToken: (refresh) => api.post('/auth/refresh/', { refresh }),
  getProfile: () => api.get('/auth/profile/'),
};

export const petsAPI = {
  getAll: () => api.get('/pets/'),
  getById: (id) => api.get(`/pets/${id}/`),
  create: (data) => api.post('/pets/', data),
  update: (id, data) => api.put(`/pets/${id}/`, data),
  delete: (id) => api.delete(`/pets/${id}/`),
};

export const recordsAPI = {
  getAll: () => api.get('/records/'),
  getById: (id) => api.get(`/records/${id}/`),
  create: (data) => api.post('/records/', data),
  update: (id, data) => api.put(`/records/${id}/`, data),
  delete: (id) => api.delete(`/records/${id}/`),
  uploadImage: (recordId, formData) =>
    api.post(`/records/${recordId}/images/upload/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getImages: (recordId) => api.get(`/records/${recordId}/images/`),
};

export const diagnosisAPI = {
  getAll: () => api.get('/ai/'),
  getById: (id) => api.get(`/ai/${id}/`),
  diagnose: (recordId) => api.post(`/ai/record/${recordId}/diagnose/`),
  review: (diagnosisId) => api.post(`/ai/${diagnosisId}/review/`),
  getStats: () => api.get('/ai/stats/'),
};

export default api;
