import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'

const service: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

service.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    return config
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data
    if (res.error) {
      ElMessage.error(res.error || '请求失败')
      return Promise.reject(new Error(res.error || '请求失败'))
    }
    return res
  },
  (error) => {
    console.error('响应错误:', error)
    if (error.response) {
      const { status } = error.response
      const data = error.response.data
      
      if (status === 401) {
        ElMessageBox.confirm('登录状态已过期，请重新登录', '系统提示', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          const userStore = useUserStore()
          userStore.logout()
          window.location.href = '/login'
        }).catch(() => {})
        return Promise.reject(error)
      }
      
      if (status === 403) {
        ElMessage.error('没有权限访问该资源')
        return Promise.reject(error)
      }
      
      if (status === 404) {
        ElMessage.error('请求的资源不存在')
        return Promise.reject(error)
      }
      
      if (status >= 500) {
        ElMessage.error(data?.error || '服务器内部错误')
        return Promise.reject(error)
      }
      
      if (data?.error) {
        ElMessage.error(data.error)
        return Promise.reject(error)
      }
    }
    
    if (error.message.includes('timeout')) {
      ElMessage.error('请求超时，请检查网络连接')
      return Promise.reject(error)
    }
    
    if (error.message.includes('Network Error')) {
      ElMessage.error('网络错误，请检查网络连接')
      return Promise.reject(error)
    }
    
    ElMessage.error(error.message || '请求失败')
    return Promise.reject(error)
  }
)

export interface RequestConfig extends AxiosRequestConfig {}

export interface Response<T = unknown> extends AxiosResponse<T> {}

const request = {
  get<T = unknown>(url: string, config?: RequestConfig): Promise<T> {
    return service.get<T, T>(url, config)
  },
  
  post<T = unknown>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return service.post<T, T>(url, data, config)
  },
  
  put<T = unknown>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return service.put<T, T>(url, data, config)
  },
  
  patch<T = unknown>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return service.patch<T, T>(url, data, config)
  },
  
  delete<T = unknown>(url: string, config?: RequestConfig): Promise<T> {
    return service.delete<T, T>(url, config)
  }
}

export default request
