import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('Backend server is not running. Please start the backend service first.');
    }
    return Promise.reject(error);
  }
);

export const satelliteAPI = {
  getAll: (skip = 0, limit = 100) =>
    api.get(`/satellites?skip=${skip}&limit=${limit}`),

  getById: (id) =>
    api.get(`/satellites/${id}`),

  create: (data) =>
    api.post('/satellites', data),

  update: (id, data) =>
    api.put(`/satellites/${id}`, data),

  delete: (id) =>
    api.delete(`/satellites/${id}`),

  getOrbit: (id) =>
    api.get(`/satellites/${id}/orbit`),

  updateOrbit: (id, data) =>
    api.post(`/satellites/${id}/orbit`, data),
};

export const orbitAPI = {
  calculate: (data) =>
    api.post('/orbit/calculate', data),

  getElements: (semiMajorAxis, eccentricity) =>
    api.get(`/orbit/elements?semi_major_axis=${semiMajorAxis}&eccentricity=${eccentricity}`),

  keplerianToCartesian: (data) =>
    api.post('/orbit/keplerian-to-cartesian', data),
};

export const collisionAPI = {
  check: (data) =>
    api.post('/collision/check', data),

  getAlerts: (skip = 0, limit = 100, resolved = null) => {
    let url = `/collision/alerts?skip=${skip}&limit=${limit}`;
    if (resolved !== null) {
      url += `&resolved=${resolved}`;
    }
    return api.get(url);
  },

  scanAll: (timeWindow = 86400, thresholdDistance = 10) =>
    api.post(`/collision/scan?time_window=${timeWindow}&threshold_distance=${thresholdDistance}`),

  resolve: (id) =>
    api.put(`/collision/alerts/${id}/resolve`),
};

export default api;
