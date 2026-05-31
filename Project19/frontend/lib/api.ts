import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const quantumApi = {
  simulateCircuit: (data: any) => apiClient.post('/quantum/simulate', data),

  runAlgorithm: (name: string, numQubits = 3, targetState = 0) =>
    apiClient.get(`/quantum/algorithm/${name}`, {
      params: { numQubits, targetState },
    }),

  getAllGates: () => apiClient.get('/quantum/gates'),

  getGateInfo: (name: string) => apiClient.get(`/quantum/gates/${name}`),

  getAllAlgorithms: () => apiClient.get('/quantum/algorithms'),

  saveExperiment: (data: any) => apiClient.post('/quantum/experiments', data),

  getAllExperiments: () => apiClient.get('/quantum/experiments'),

  getExperiment: (id: number) => apiClient.get(`/quantum/experiments/${id}`),

  getExperimentSteps: (id: number) => apiClient.get(`/quantum/experiments/${id}/steps`),

  deleteExperiment: (id: number) => apiClient.delete(`/quantum/experiments/${id}`),
};

export const tutorialApi = {
  getAll: () => apiClient.get('/tutorials'),

  getById: (id: number) => apiClient.get(`/tutorials/${id}`),

  getByCategory: (category: string) => apiClient.get(`/tutorials/category/${category}`),

  getByDifficulty: (min: number, max: number) =>
    apiClient.get('/tutorials/difficulty', { params: { min, max } }),

  create: (data: any) => apiClient.post('/tutorials', data),

  update: (id: number, data: any) => apiClient.put(`/tutorials/${id}`, data),

  delete: (id: number) => apiClient.delete(`/tutorials/${id}`),
};
