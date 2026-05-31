import request from '@/utils/request'

export function createBooking(data) {
  return request({
    url: '/booking/create',
    method: 'post',
    data
  })
}

export function getMyBookings() {
  return request({
    url: '/booking/my',
    method: 'get'
  })
}

export function getBookingList() {
  return request({
    url: '/booking/list',
    method: 'get'
  })
}

export function getBookingDetail(id) {
  return request({
    url: `/booking/${id}`,
    method: 'get'
  })
}

export function updateBookingStatus(id, status) {
  return request({
    url: `/booking/status/${id}`,
    method: 'put',
    params: { status }
  })
}

export function cancelBooking(id) {
  return request({
    url: `/booking/cancel/${id}`,
    method: 'put'
  })
}
