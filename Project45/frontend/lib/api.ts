import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (data: { username: string; password: string }) =>
    apiClient.post('/api/auth/login', data),
  register: (data: any) =>
    apiClient.post('/api/auth/register', data),
  getCurrentUser: () =>
    apiClient.get('/api/auth/me'),
};

export const craftApi = {
  getCategories: () =>
    apiClient.get('/api/crafts/categories'),
  getCrafts: (params?: any) =>
    apiClient.get('/api/crafts', { params }),
  getCraft: (id: number) =>
    apiClient.get(`/api/crafts/${id}`),
  getCraftSteps: (id: number) =>
    apiClient.get(`/api/crafts/${id}/steps`),
  createCraft: (data: any) =>
    apiClient.post('/api/crafts', data),
};

export const liveApi = {
  getLiveRooms: (params?: any) =>
    apiClient.get('/api/live', { params }),
  getLiveRoom: (id: number) =>
    apiClient.get(`/api/live/${id}`),
  createLiveRoom: (data: any) =>
    apiClient.post('/api/live', data),
  joinLiveRoom: (id: number) =>
    apiClient.post(`/api/live/${id}/join`),
  endLiveRoom: (id: number) =>
    apiClient.post(`/api/live/${id}/end`),
  getLiveStats: (id: number) =>
    apiClient.get(`/api/live/${id}/stats`),
  getChatMessages: (id: number) =>
    apiClient.get(`/api/live/${id}/chat`),
  sendChatMessage: (id: number, data: any) =>
    apiClient.post(`/api/live/${id}/chat`, data),
  optimizeLatency: (id: number) =>
    apiClient.post(`/api/live/${id}/optimize-latency`),
};

export const workApi = {
  getWorks: (params?: any) =>
    apiClient.get('/api/works', { params }),
  getWork: (id: number) =>
    apiClient.get(`/api/works/${id}`),
  createWork: (data: any) =>
    apiClient.post('/api/works', data),
  getTraceability: (code: string) =>
    apiClient.get(`/api/works/trace/${code}`),
  verifyWork: (id: number) =>
    apiClient.post(`/api/works/${id}/verify`),
  addTraceRecord: (id: number, data: any) =>
    apiClient.post(`/api/works/${id}/trace`),
  getIntegrity: (id: number) =>
    apiClient.get(`/api/works/${id}/integrity`),
};

export const searchApi = {
  search: (params: any) =>
    apiClient.get('/api/search', { params }),
  getSuggestions: (prefix: string) =>
    apiClient.get('/api/search/suggest', { params: { prefix } }),
  reindex: () =>
    apiClient.post('/api/search/reindex'),
  health: () =>
    apiClient.get('/api/search/health'),
};

export const dashboardApi = {
  getStats: () =>
    apiClient.get('/api/dashboard/stats'),
  getFeatured: () =>
    apiClient.get('/api/dashboard/featured'),
};
