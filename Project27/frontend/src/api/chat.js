import request from '@/utils/request'

export function getChatHistory(otherUserId) {
  return request({
    url: `/chat/history/${otherUserId}`,
    method: 'get'
  })
}

export function getStaffList() {
  return request({
    url: '/chat/staff/list',
    method: 'get'
  })
}

export function markAsRead(messageId) {
  return request({
    url: `/chat/read/${messageId}`,
    method: 'put'
  })
}
