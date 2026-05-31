import request from '../utils/request'

export function getOrders(params) {
  return request({
    url: '/orders',
    method: 'get',
    params
  })
}

export function getOrder(id) {
  return request({
    url: `/orders/${id}`,
    method: 'get'
  })
}

export function createOrder(data) {
  return request({
    url: '/orders',
    method: 'post',
    data
  })
}

export function updateOrder(id, data) {
  return request({
    url: `/orders/${id}`,
    method: 'put',
    data
  })
}

export function updateOrderStatus(id, status) {
  return request({
    url: `/orders/${id}/status`,
    method: 'put',
    data: { status }
  })
}

export function deleteOrder(id) {
  return request({
    url: `/orders/${id}`,
    method: 'delete'
  })
}

export function getStats() {
  return request({
    url: '/stats',
    method: 'get'
  })
}

export function addReview(orderId, data) {
  return request({
    url: `/reviews/order/${orderId}`,
    method: 'post',
    data
  })
}

export function getReviews() {
  return request({
    url: '/reviews',
    method: 'get'
  })
}
