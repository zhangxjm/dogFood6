import axios from 'axios'
import { showToast } from 'vant'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000
})

request.interceptors.response.use(
  response => {
    const res = response.data
    if (res.code === 200) {
      return res.data
    } else {
      showToast(res.message || '请求失败')
      return Promise.reject(res)
    }
  },
  error => {
    showToast('网络错误')
    return Promise.reject(error)
  }
)

export const getPackageList = () => request.get('/package/list')
export const getPackageDetail = id => request.get(`/package/${id}`)
export const addPackage = data => request.post('/package/add', data)
export const updatePackage = data => request.post('/package/update', data)
export const deletePackage = id => request.delete(`/package/${id}`)

export const getReservationList = phone => request.get('/reservation/list', { params: { phone } })
export const getReservationDetail = id => request.get(`/reservation/${id}`)
export const createReservation = data => request.post('/reservation/create', data)
export const cancelReservation = id => request.post(`/reservation/cancel/${id}`)

export const getOrderList = phone => request.get('/order/list', { params: { phone } })
export const getOrderDetail = id => request.get(`/order/${id}`)
export const createOrder = data => request.post('/order/create', data)
export const payOrder = id => request.post(`/order/pay/${id}`)

export const getDeliveryList = phone => request.get('/delivery/list', { params: { phone } })
export const getDeliveryDetail = id => request.get(`/delivery/${id}`)
export const createDelivery = data => request.post('/delivery/create', data)
export const confirmDelivery = id => request.post(`/delivery/confirm/${id}`)

export default request
