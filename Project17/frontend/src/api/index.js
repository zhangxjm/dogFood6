import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const declarationApi = {
  getDeclarations: (params) => api.get('/declarations', { params }),
  getDeclaration: (id) => api.get(`/declarations/${id}`),
  createDeclaration: (data) => api.post('/declarations', data),
  submitDeclaration: (id, data = {}) => api.post(`/declarations/${id}/submit`, data),
  calculateTaxes: (items) => api.post('/declarations/calculate-taxes', { items }),
  batchSubmit: (declarationIds) => api.post('/declarations/batch-submit', { declaration_ids: declarationIds }),
  getTaskStatus: (taskId) => api.get(`/tasks/${taskId}`),
  getStatistics: () => api.get('/statistics'),
  verifyHsCode: (hsCode, productName) => api.post('/hs-code/verify', { hs_code: hsCode, product_name: productName })
};

export const productApi = {
  getCategories: () => api.get('/categories'),
  getCategoryByHsCode: (hsCode) => api.get(`/categories/${hsCode}`),
  getProducts: (params) => api.get('/products', { params }),
  getProduct: (id) => api.get(`/products/${id}`),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`)
};

export default api;
