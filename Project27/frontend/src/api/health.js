import request from '@/utils/request'

export function saveHealthData(data) {
  return request({
    url: '/health/save',
    method: 'post',
    data
  })
}

export function getMyHealthData() {
  return request({
    url: '/health/my',
    method: 'get'
  })
}

export function getLatestHealthData() {
  return request({
    url: '/health/latest',
    method: 'get'
  })
}

export function getHealthDataByUserId(userId) {
  return request({
    url: `/health/user/${userId}`,
    method: 'get'
  })
}
