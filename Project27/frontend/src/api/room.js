import request from '@/utils/request'

export function getRoomList(status) {
  return request({
    url: '/room/list',
    method: 'get',
    params: { status }
  })
}

export function getRoomDetail(id) {
  return request({
    url: `/room/${id}`,
    method: 'get'
  })
}

export function getAvailableRooms(checkIn, checkOut) {
  return request({
    url: '/room/available',
    method: 'get',
    params: { checkIn, checkOut }
  })
}

export function saveRoom(data) {
  return request({
    url: '/room/save',
    method: 'post',
    data
  })
}

export function updateRoom(data) {
  return request({
    url: '/room/update',
    method: 'put',
    data
  })
}

export function deleteRoom(id) {
  return request({
    url: `/room/${id}`,
    method: 'delete'
  })
}
