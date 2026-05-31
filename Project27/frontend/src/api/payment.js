import request from '@/utils/request'

export function createPayment(bookingId) {
  return request({
    url: '/payment/create',
    method: 'post',
    params: { bookingId }
  })
}

export function mockPayment(paymentId) {
  return request({
    url: `/payment/mock/${paymentId}`,
    method: 'post'
  })
}
