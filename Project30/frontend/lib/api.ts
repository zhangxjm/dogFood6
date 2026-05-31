let apiInstance: any = null
let initError: Error | null = null

function createApi() {
  if (apiInstance) return apiInstance
  if (initError) return null

  try {
    if (typeof window !== 'undefined') {
      try {
        const test = window.localStorage
        if (test) test.getItem('__test__')
      } catch (e) {
        console.warn('localStorage is not available, some features may be limited')
      }
    }

    let axios: any
    try {
      axios = require('axios')
    } catch (e) {
      initError = e as Error
      console.error('Failed to load axios:', initError)
      return null
    }
    
    let api: any
    try {
      api = axios.create({
        baseURL: '/api/v1',
        timeout: 15000,
        withCredentials: false,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    } catch (e) {
      initError = e as Error
      console.error('Failed to create axios instance:', initError)
      return null
    }

    try {
      api.interceptors.response.use(
        (response: any) => {
          if (response.data && response.data.code === 0) {
            return response.data.data
          }
          return response.data
        },
        (error: any) => {
          console.warn('API Error:', error?.message || 'Unknown error')
          return Promise.reject(error)
        }
      )
    } catch (e) {
      console.warn('Failed to setup interceptors:', e)
    }

    apiInstance = api
    return api
  } catch (e) {
    initError = e as Error
    console.error('Failed to create API instance:', initError)
    return null
  }
}

function getApi() {
  try {
    return createApi()
  } catch (e) {
    console.error('Unexpected error getting API instance:', e)
    return null
  }
}

function safeRequest(promiseFactory: () => Promise<any>) {
  try {
    const promise = promiseFactory()
    if (!promise || typeof promise.then !== 'function') {
      return Promise.resolve({ success: false, data: null, error: 'Invalid promise' })
    }
    return promise
      .then((data) => ({ success: true, data, error: null }))
      .catch((error) => ({ success: false, data: null, error: error?.message || 'Unknown error' }))
  } catch (e) {
    return Promise.resolve({ success: false, data: null, error: (e as Error)?.message || 'Request failed' })
  }
}

function makeRequest(method: string, url: string, config?: any) {
  return safeRequest(() => {
    const api = getApi()
    if (!api) {
      return Promise.reject(new Error('API not available'))
    }
    if (method === 'get') {
      return api.get(url, config)
    } else if (method === 'post') {
      return api.post(url, config?.data, config)
    } else if (method === 'put') {
      return api.put(url, config?.data, config)
    } else if (method === 'delete') {
      return api.delete(url, config)
    }
    return Promise.reject(new Error('Unsupported method'))
  })
}

export const dashboardApi = {
  getStats: () => makeRequest('get', '/dashboard/stats'),
}

export const warehouseApi = {
  getList: (params?: { page?: number; page_size?: number }) => makeRequest('get', '/warehouses', { params }),
  get: (id: number) => makeRequest('get', `/warehouses/${id}`),
  create: (data: any) => makeRequest('post', '/warehouses', { data }),
  update: (id: number, data: any) => makeRequest('put', `/warehouses/${id}`, { data }),
  delete: (id: number) => makeRequest('delete', `/warehouses/${id}`),
  getQuota: (id: number) => makeRequest('get', `/warehouses/${id}/quota`),
  getInventoryStats: (id: number) => makeRequest('get', `/warehouses/${id}/inventory-stats`),
}

export const productApi = {
  getList: (params?: { page?: number; page_size?: number; category?: string }) => makeRequest('get', '/products', { params }),
  getCategories: () => makeRequest('get', '/products/categories'),
  search: (keyword: string) => makeRequest('get', '/products/search', { params: { keyword } }),
  get: (id: number) => makeRequest('get', `/products/${id}`),
  create: (data: any) => makeRequest('post', '/products', { data }),
  update: (id: number, data: any) => makeRequest('put', `/products/${id}`, { data }),
  delete: (id: number) => makeRequest('delete', `/products/${id}`),
}

export const inventoryApi = {
  getList: (params?: { page?: number; page_size?: number; warehouse_id?: number }) => makeRequest('get', '/inventories', { params }),
  get: (id: number) => makeRequest('get', `/inventories/${id}`),
  create: (data: any) => makeRequest('post', '/inventories', { data }),
  update: (id: number, data: any) => makeRequest('put', `/inventories/${id}`, { data }),
  delete: (id: number) => makeRequest('delete', `/inventories/${id}`),
  sync: (data: any) => makeRequest('post', '/inventories/sync', { data }),
  getSyncLogs: (params?: { page?: number; page_size?: number }) => makeRequest('get', '/inventories/sync/logs', { params }),
}

export const stockTakeApi = {
  autoStockTake: (warehouseId: number) => makeRequest('post', `/stocktake/${warehouseId}/auto`),
  getList: (params?: { page?: number; page_size?: number; warehouse_id?: number }) => makeRequest('get', '/stocktake', { params }),
}

export const expiryApi = {
  checkAlerts: () => makeRequest('post', '/expiry/check'),
  getAlerts: (params?: { page?: number; page_size?: number; warehouse_id?: number; level?: string }) => makeRequest('get', '/expiry/alerts', { params }),
  resolveAlert: (id: number) => makeRequest('post', `/expiry/alerts/${id}/resolve`),
  getStats: () => makeRequest('get', '/expiry/stats'),
}

export default getApi()
