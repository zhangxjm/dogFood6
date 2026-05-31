import axios from 'axios'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

request.interceptors.request.use(
  config => {
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

request.interceptors.response.use(
  response => {
    const res = response.data
    if (res.code !== 200) {
      console.error('API Error:', res.msg)
      return Promise.reject(new Error(res.msg || '请求失败'))
    }
    return res
  },
  error => {
    console.error('Request Error:', error)
    return Promise.reject(error)
  }
)

export default request
