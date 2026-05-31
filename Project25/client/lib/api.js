import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('token');
      Cookies.remove('user');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data)
};

export const trainingApi = {
  getModules: (params) => api.get('/training/modules', { params }),
  getModule: (id) => api.get(`/training/modules/${id}`),
  createModule: (data) => api.post('/training/modules', data),
  updateModule: (id, data) => api.put(`/training/modules/${id}`, data),
  deleteModule: (id) => api.delete(`/training/modules/${id}`),
  getCategories: () => api.get('/training/categories'),
  getDifficulties: () => api.get('/training/difficulties')
};

export const sessionApi = {
  startSession: (moduleId) => api.post('/session/start', { module_id: moduleId }),
  completeSession: (id, data) => api.post(`/session/${id}/complete`, data),
  logOperation: (id, data) => api.post(`/session/${id}/log`, data),
  getSessions: (params) => api.get('/session', { params }),
  getSession: (id) => api.get(`/session/${id}`),
  getStats: () => api.get('/session/stats/overview')
};

export const collaborativeApi = {
  createRoom: (data) => api.post('/collaborative/rooms', data),
  getRooms: () => api.get('/collaborative/rooms'),
  getRoom: (code) => api.get(`/collaborative/rooms/${code}`),
  joinRoom: (code) => api.post(`/collaborative/rooms/${code}/join`),
  leaveRoom: (code) => api.post(`/collaborative/rooms/${code}/leave`),
  startRoom: (code) => api.post(`/collaborative/rooms/${code}/start`),
  closeRoom: (code) => api.post(`/collaborative/rooms/${code}/close`)
};

export const achievementApi = {
  getAchievements: () => api.get('/achievement'),
  getLeaderboard: (params) => api.get('/achievement/leaderboard', { params }),
  getAchievement: (id) => api.get(`/achievement/${id}`)
};

export default api;
